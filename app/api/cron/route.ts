import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendInactiveNudgeEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Daily 10:00 UTC cron (configured in vercel.json).
 *
 * HMA is a free training program — no billing, no tier ceilings. The cron's
 * single job is to nudge students who haven't engaged in 7 days with a soft
 * "come back and finish module N" email, capped to one nudge per 7 days.
 */
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
  const results = { nudges: 0, skipped: 0, errors: 0, total: 0 };

  try {
    const { data: students } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, created_at, last_nudged_at")
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

        if (isInactive && lastModule < 12) {
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

  return NextResponse.json({ ok: true, ...results, ran: new Date().toISOString() });
}
