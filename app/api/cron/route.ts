import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInactiveNudgeEmail, sendUpgradeEmail, sendRenewalReminderEmail } from "@/lib/email";
import { PLANS } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIER_LIMITS: Record<string,number> = { free:6, foundation:9, accelerator:11, elite:12 };

// Pre-renewal reminder windows (days before renewal).
// Monthly: day-12 (per standing ecosystem rule).
// Annual:  day-30 (inside CA ARL §17602(b) 15-45 day safe harbor).
const REMINDER_DAYS_MONTHLY = 12;
const REMINDER_DAYS_ANNUAL = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || process.env.SETUP_SECRET || "";
  
  // Accept: Bearer {secret} OR Vercel's own cron invocation header
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isValidSecret = auth === `Bearer ${cronSecret}`;
  
  if (!isVercelCron && !isValidSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const nudgeCooldown = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = nudgeCooldown;
  const results = { nudges: 0, upgrades: 0, reminders: 0, reminderSkipped: 0, reminderErrors: 0, skipped: 0, errors: 0, total: 0 };

  try {
    const { data: students } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, plan, created_at, last_nudged_at")
      .order("created_at", { ascending: true })
      .limit(50);

    results.total = students?.length || 0;

    for (const student of students || []) {
      try {
        if (student.last_nudged_at && student.last_nudged_at > nudgeCooldown) { results.skipped++; continue; }

        const { data: recentActivity } = await supabaseAdmin
          .from("hma_quiz_attempts").select("created_at")
          .eq("student_id", student.id).order("created_at", { ascending: false }).limit(1);

        const lastActive = recentActivity?.[0]?.created_at || student.created_at;
        const isInactive = lastActive < sevenDaysAgo;

        const { data: progress } = await supabaseAdmin
          .from("hma_module_progress").select("module_number")
          .eq("student_id", student.id).eq("completed", true)
          .order("module_number", { ascending: false }).limit(1);

        const lastModule = progress?.[0]?.module_number || 0;
        const tierLimit = TIER_LIMITS[student.plan] || 6;
        const hitCeiling = lastModule >= tierLimit;

        if (hitCeiling && student.plan !== "elite") {
          const { data: completion } = await supabaseAdmin
            .from("hma_module_progress").select("completed_at")
            .eq("student_id", student.id).eq("module_number", tierLimit).eq("completed", true).single();
          const recentlyCompleted = completion?.completed_at && completion.completed_at > new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
          if (recentlyCompleted) {
            await sendUpgradeEmail({ name: student.name, email: student.email, currentPlan: student.plan });
            await supabaseAdmin.from("hma_students").update({ last_nudged_at: new Date().toISOString() }).eq("id", student.id);
            results.upgrades++;
          }
        } else if (isInactive && !hitCeiling && lastModule < 12) {
          await sendInactiveNudgeEmail({ name: student.name, email: student.email, moduleNumber: lastModule });
          await supabaseAdmin.from("hma_students").update({ last_nudged_at: new Date().toISOString() }).eq("id", student.id);
          results.nudges++;
        }
      } catch { results.errors++; }
    }
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }

  // ── RENEWAL REMINDER JOB ──────────────────────────────────────────────────
  // Fires for every student on a paid plan whose renewal is exactly
  // REMINDER_DAYS_* away (±1 day tolerance — we use a range so a skipped run
  // doesn't miss anyone). Idempotent via UNIQUE(student_id, renewal_date) on
  // hma_renewal_reminders.
  try {
    const now = Date.now();

    // Build the two date-range windows (start/end inclusive)
    const monthlyStart = new Date(now + (REMINDER_DAYS_MONTHLY - 1) * DAY_MS).toISOString();
    const monthlyEnd   = new Date(now + (REMINDER_DAYS_MONTHLY + 1) * DAY_MS).toISOString();
    const annualStart  = new Date(now + (REMINDER_DAYS_ANNUAL  - 1) * DAY_MS).toISOString();
    const annualEnd    = new Date(now + (REMINDER_DAYS_ANNUAL  + 1) * DAY_MS).toISOString();

    // Pull candidates: paid plan + stripe_subscription_id + current_period_end
    // falling inside either reminder window.
    const { data: candidates } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, plan, billing_cycle, stripe_subscription_id, current_period_end")
      .neq("plan", "free")
      .not("stripe_subscription_id", "is", null)
      .not("current_period_end", "is", null)
      .or(
        `and(billing_cycle.eq.monthly,current_period_end.gte.${monthlyStart},current_period_end.lte.${monthlyEnd}),` +
        `and(billing_cycle.eq.annual,current_period_end.gte.${annualStart},current_period_end.lte.${annualEnd})`
      )
      .limit(500);

    for (const c of candidates || []) {
      try {
        const planCfg = PLANS[c.plan];
        if (!planCfg) { results.reminderSkipped++; continue; }

        const billingCycle = (c.billing_cycle === "annual" ? "annual" : "monthly") as "monthly" | "annual";
        const amountCents = billingCycle === "annual" ? planCfg.annual : planCfg.monthly;
        const renewalDate = new Date(c.current_period_end);

        // Idempotency: skip if we already logged a reminder for this exact
        // renewal_date for this student. The UNIQUE constraint on
        // (student_id, renewal_date) is the authoritative guard — this check
        // just avoids a pointless email send before the DB rejects the insert.
        const { data: existing } = await supabaseAdmin
          .from("hma_renewal_reminders")
          .select("id")
          .eq("student_id", c.id)
          .eq("renewal_date", renewalDate.toISOString())
          .maybeSingle();

        if (existing) { results.reminderSkipped++; continue; }

        await sendRenewalReminderEmail({
          name: c.name, email: c.email, plan: c.plan,
          billingCycle, renewalDate, amountCents,
        });

        // Log after send. If the insert races with another run, the UNIQUE
        // constraint throws — we swallow that here since the email already
        // went out.
        const { error: logErr } = await supabaseAdmin
          .from("hma_renewal_reminders")
          .insert({
            student_id: c.id, email: c.email, billing_cycle: billingCycle,
            plan: c.plan, renewal_date: renewalDate.toISOString(),
            amount_cents: amountCents,
          });

        if (logErr && !(logErr.code === "23505")) {
          console.error("Renewal reminder log insert failed:", logErr);
        }
        results.reminders++;
      } catch (err) {
        console.error("Renewal reminder row error:", err);
        results.reminderErrors++;
      }
    }
  } catch (err) {
    console.error("Renewal reminder job error:", err);
    results.reminderErrors++;
  }

  return NextResponse.json({ ok: true, ...results, ran: new Date().toISOString() });
}
