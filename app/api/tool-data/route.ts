import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

// GET /api/tool-data?tool=agents  →  returns stored JSON for that tool
export async function GET(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const tool = req.nextUrl.searchParams.get("tool");
  if (!tool) return NextResponse.json({ error: "Missing tool param" }, { status: 400 });

  const { data } = await supabaseAdmin.from("hma_tool_data").select("data, updated_at").eq("student_id", studentId).eq("tool_name", tool).maybeSingle();
  return NextResponse.json({ data: data?.data || null, updated_at: data?.updated_at || null });
}

// POST /api/tool-data  body: { tool, data }  →  upserts
export async function POST(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { tool, data } = await req.json();
  if (!tool) return NextResponse.json({ error: "Missing tool" }, { status: 400 });

  const { error } = await supabaseAdmin.from("hma_tool_data").upsert({ student_id: studentId, tool_name: tool, data, updated_at: new Date().toISOString() }, { onConflict: "student_id,tool_name" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
