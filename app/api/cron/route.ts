import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInactiveNudgeEmail, sendUpgradeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIER_LIMITS: Record<string,number> = { free:6, foundation:9, accelerator:11, elite:12 };

export async function GET(req: NextRequest) {
  // Vercel Cron sends Authorization: Bearer {CRON_SECRET}
  // Also accept x-vercel-signature for Vercel's own system
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET || process.env.SETUP_SECRET || "";
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const nudgeCooldown = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Only nudge once per 7 days
  const results = { nudges: 0, upgrades: 0, skipped: 0, errors: 0 };

  try {
    // Process in batches of 50 to avoid timeout
    const { data: students } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, plan, created_at, last_nudged_at")
      .order("created_at", { ascending: true })
      .limit(50);

    for (const student of students || []) {
      try {
        // Skip if nudged within last 7 days
        if (student.last_nudged_at && student.last_nudged_at > nudgeCooldown) { results.skipped++; continue; }

        const { data: recentActivity } = await supabaseAdmin
          .from("hma_quiz_attempts").select("created_at").eq("student_id", student.id)
          .order("created_at", { ascending: false }).limit(1);

        const lastActive = recentActivity?.[0]?.created_at || student.created_at;
        const { data: progress } = await supabaseAdmin
          .from("hma_module_progress").select("module_number")
          .eq("student_id", student.id).eq("completed", true)
          .order("module_number", { ascending: false }).limit(1);

        const lastModule = progress?.[0]?.module_number || 0;
        const tierLimit = TIER_LIMITS[student.plan] || 3;
        const hitCeiling = lastModule >= tierLimit;
        const isInactive = lastActive < sevenDaysAgo;

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
  } catch (err) { console.error("Cron error:", err); return NextResponse.json({ error: "Cron failed" }, { status: 500 }); }

  return NextResponse.json({ ok: true, ...results, ran: new Date().toISOString() });
}
