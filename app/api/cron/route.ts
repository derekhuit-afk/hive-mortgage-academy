import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInactiveNudgeEmail, sendUpgradeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

const TIER_LIMITS: Record<string,number> = { free:3, foundation:6, accelerator:10, elite:12 };

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (or with secret)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.SETUP_SECRET;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const results = { nudges: 0, upgrades: 0, errors: 0 };

  try {
    // ── Find students inactive for 7+ days ──────────────────────────────
    const { data: allStudents } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, plan, created_at");

    for (const student of allStudents || []) {
      try {
        // Check last activity (quiz attempt or progress update)
        const { data: recentActivity } = await supabaseAdmin
          .from("hma_quiz_attempts")
          .select("created_at")
          .eq("student_id", student.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastActive = recentActivity?.[0]?.created_at || student.created_at;
        const isInactive = lastActive < sevenDaysAgo;

        // Get highest completed module
        const { data: progress } = await supabaseAdmin
          .from("hma_module_progress")
          .select("module_number")
          .eq("student_id", student.id)
          .eq("completed", true)
          .order("module_number", { ascending: false })
          .limit(1);

        const lastModule = progress?.[0]?.module_number || 0;
        const tierLimit = TIER_LIMITS[student.plan] || 3;
        const hitCeiling = lastModule >= tierLimit;

        if (isInactive && !hitCeiling && lastModule < 12) {
          // Don't nudge if they've hit their tier ceiling (send upgrade instead)
          await sendInactiveNudgeEmail({ name: student.name, email: student.email, moduleNumber: lastModule });
          results.nudges++;
        }

        if (hitCeiling && student.plan !== "elite") {
          // Only send upgrade email once — check if already sent via flag
          // Simple check: only send if they completed the ceiling module in last 24hrs
          const { data: recentCompletion } = await supabaseAdmin
            .from("hma_module_progress")
            .select("completed_at")
            .eq("student_id", student.id)
            .eq("module_number", tierLimit)
            .eq("completed", true)
            .single();

          const completedAt = recentCompletion?.completed_at;
          const completedRecently = completedAt && completedAt > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          if (completedRecently) {
            await sendUpgradeEmail({ name: student.name, email: student.email, currentPlan: student.plan });
            results.upgrades++;
          }
        }
      } catch { results.errors++; }
    }
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...results, ran: new Date().toISOString() });
}
