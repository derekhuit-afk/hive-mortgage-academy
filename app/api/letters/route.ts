import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const letterId = req.nextUrl.searchParams.get("id");
  // Public lookup (no auth needed — for share pages)
  if (letterId) {
    const { data } = await supabaseAdmin.from("hma_letters").select("data").eq("id", letterId).maybeSingle();
    if (!data) return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    return NextResponse.json(data.data);
  }
  // Authenticated list
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("hma_letters").select("id, data, created_at").eq("student_id", studentId).order("created_at", { ascending: false });
  return NextResponse.json(data?.map(r => ({ ...r.data, id: r.id })) || []);
}

export async function POST(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const letter = await req.json();
  const { error } = await supabaseAdmin.from("hma_letters").upsert({ id: letter.id, student_id: studentId, data: letter });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
