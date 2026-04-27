import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";
import { sendQuizPassedEmail, sendModuleCompleteEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { valid, studentId } = await validateRequest(req);
    if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { moduleNumber, score, answers, passed } = await req.json();

    await supabaseAdmin.from("hma_quiz_attempts").insert({ student_id: studentId, module_number: moduleNumber, score, answers, passed });

    if (passed) {
      await supabaseAdmin.from("hma_module_progress").upsert({ student_id: studentId, module_number: moduleNumber, completed: true, completed_at: new Date().toISOString() }, { onConflict: "student_id,module_number" });

      const { data: student } = await supabaseAdmin.from("hma_students").select("name, email, plan").eq("id", studentId).single();
      if (student) {
        sendQuizPassedEmail({ name: student.name, email: student.email, moduleNumber, score });
        sendModuleCompleteEmail({ name: student.name, email: student.email, moduleNumber, plan: student.plan });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 }); }
}
