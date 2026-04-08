import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json([], { status: 400 });
  const { valid } = await validateRequest(req, studentId);
  if (!valid) return NextResponse.json([], { status: 401 });

  const { data: progress } = await supabaseAdmin.from("hma_module_progress").select("module_number, completed, completed_at").eq("student_id", studentId);
  const { data: quizzes } = await supabaseAdmin.from("hma_quiz_attempts").select("module_number, score").eq("student_id", studentId).eq("passed", true).order("score", { ascending: false });

  const scoreMap: Record<number, number> = {};
  quizzes?.forEach(q => { if (!scoreMap[q.module_number] || q.score > scoreMap[q.module_number]) scoreMap[q.module_number] = q.score; });
  return NextResponse.json((progress || []).map(p => ({ ...p, best_score: scoreMap[p.module_number] })));
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, moduleNumber, completed } = await req.json();
    if (!studentId || !moduleNumber) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    const { valid } = await validateRequest(req, studentId);
    if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabaseAdmin.from("hma_module_progress").upsert({ student_id: studentId, module_number: moduleNumber, completed, completed_at: completed ? new Date().toISOString() : null }, { onConflict: "student_id,module_number" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
