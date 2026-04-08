import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateSession } from "@/lib/auth";
import { sendQuizPassedEmail, sendModuleCompleteEmail, sendUpgradeEmail } from "@/lib/email";

const TIER_LIMITS: Record<string,number> = { free:6, foundation:9, accelerator:11, elite:12 };

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-session-token");
    const body = await req.json();
    const { studentId, moduleNumber, score, answers, passed } = body;

    // Server-side auth: validate session owns this studentId
    const sessionStudent = await validateSession(token);
    if (!sessionStudent || sessionStudent.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await supabaseAdmin.from("hma_quiz_attempts").insert({ student_id: studentId, module_number: moduleNumber, score, answers, passed });

    if (passed) {
      await supabaseAdmin.from("hma_module_progress").upsert({ student_id: studentId, module_number: moduleNumber, completed: true, completed_at: new Date().toISOString() }, { onConflict: "student_id,module_number" });
      sendQuizPassedEmail({ name: sessionStudent.name, email: sessionStudent.email, moduleNumber, score });
      sendModuleCompleteEmail({ name: sessionStudent.name, email: sessionStudent.email, moduleNumber, plan: sessionStudent.plan });
      const tierLimit = TIER_LIMITS[sessionStudent.plan] || 3;
      if (moduleNumber === tierLimit) setTimeout(() => sendUpgradeEmail({ name: sessionStudent.name, email: sessionStudent.email, currentPlan: sessionStudent.plan }), 3000);
    }
    return NextResponse.json({ ok: true });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Failed to save quiz." }, { status: 500 }); }
}
