import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendQuizPassedEmail, sendModuleCompleteEmail, sendUpgradeEmail } from "@/lib/email";

const TIER_LIMITS: Record<string,number> = { free:3, foundation:6, accelerator:10, elite:12 };

export async function POST(req: NextRequest) {
  try {
    const { studentId, moduleNumber, score, answers, passed } = await req.json();

    await supabaseAdmin.from("hma_quiz_attempts").insert({
      student_id: studentId, module_number: moduleNumber,
      score, answers, passed,
    });

    if (passed) {
      await supabaseAdmin.from("hma_module_progress").upsert({
        student_id: studentId, module_number: moduleNumber,
        completed: true, completed_at: new Date().toISOString(),
      }, { onConflict: "student_id,module_number" });

      // Get student info for emails
      const { data: student } = await supabaseAdmin
        .from("hma_students")
        .select("name, email, plan")
        .eq("id", studentId)
        .single();

      if (student) {
        // Fire: quiz passed email
        sendQuizPassedEmail({ name: student.name, email: student.email, moduleNumber, score });

        // Fire: module complete email (quiz passing = module complete)
        sendModuleCompleteEmail({ name: student.name, email: student.email, moduleNumber, plan: student.plan });

        // Check if they've hit the ceiling of their tier
        const tierLimit = TIER_LIMITS[student.plan] || 3;
        if (moduleNumber === tierLimit) {
          // Small delay so module complete fires first
          setTimeout(() => sendUpgradeEmail({ name: student.name, email: student.email, currentPlan: student.plan }), 3000);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 });
  }
}
