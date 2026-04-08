import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, plan").eq("id", studentId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ student: data });
}
