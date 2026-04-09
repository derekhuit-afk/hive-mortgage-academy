import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json([], { status: 400 });
  const { valid } = await validateRequest(req, studentId);
  if (!valid) return NextResponse.json([], { status: 401 });

  const { data: progress } = await supabaseAdmin.from("hma_module_progress").select("module_number, completed, completed_at, score").eq("student_id", studentId);
  const { data: quizzes } = await supabaseAdmin.from("hma_quiz_attempts").select("module_number, score").eq("student_id", studentId).eq("passed", true).order("score", { ascending: false });

  const scoreMap: Record<number, number> = {};
  quizzes?.forEach(q => { if (!scoreMap[q.module_number] || q.score > scoreMap[q.module_number]) scoreMap[q.module_number] = q.score; });
  return NextResponse.json((progress || []).map(p => ({ ...p, best_score: scoreMap[p.module_number] })));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, moduleNumber, completed, lessonsRead, totalLessons } = body;
    if (!studentId || !moduleNumber) return NextResponse.json({ error: "Missing fields." }, { status: 400 });
    const { valid } = await validateRequest(req, studentId);
    if (!valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const upsertData: Record<string, any> = { student_id: studentId, module_number: moduleNumber };

    if (completed === true) {
      upsertData.completed = true;
      upsertData.completed_at = new Date().toISOString();
    } else if (lessonsRead !== undefined && totalLessons) {
      // Lesson read tracking — store progress without marking complete
      upsertData.score = Math.round((lessonsRead / totalLessons) * 100);
      upsertData.completed = false;
    }

    await supabaseAdmin.from("hma_module_progress").upsert(upsertData, { onConflict: "student_id,module_number" });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
