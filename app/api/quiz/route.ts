import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { studentId, moduleNumber, score, answers, passed } = await req.json();

    // Save quiz attempt
    await supabaseAdmin.from("hma_quiz_attempts").insert({
      student_id: studentId,
      module_number: moduleNumber,
      score,
      answers,
      passed,
    });

    // If passed, mark module as complete
    if (passed) {
      await supabaseAdmin.from("hma_module_progress").upsert({
        student_id: studentId,
        module_number: moduleNumber,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: "student_id,module_number" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 });
  }
}
