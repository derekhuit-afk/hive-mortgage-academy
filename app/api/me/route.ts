import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, plan").eq("session_token", token).maybeSingle();
  if (!data) return NextResponse.json({ error: "Session expired." }, { status: 401 });
  return NextResponse.json({ student: data });
}
