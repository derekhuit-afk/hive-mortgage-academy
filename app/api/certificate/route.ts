import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendHivePassEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();

    const { data: existing } = await supabaseAdmin
      .from("hma_certificates").select("*").eq("student_id", studentId).maybeSingle();
    if (existing) return NextResponse.json(existing);

    const { data: student } = await supabaseAdmin
      .from("hma_students").select("name, email, nmls_number")
      .eq("id", studentId).single();

    const certNumber = `HMA-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;

    const { data, error } = await supabaseAdmin
      .from("hma_certificates")
      .insert({ student_id: studentId, student_name: student?.name, student_email: student?.email, nmls_number: student?.nmls_number, certificate_number: certNumber })
      .select().single();

    // Fire HivePass email
    if (student) {
      sendHivePassEmail({ name: student.name, email: student.email, nmls: student.nmls_number, certNumber, studentId });
    }

    return NextResponse.json(data || { certificateNumber: certNumber, issuedAt: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ certificateNumber: `HMA-${Date.now()}`, issuedAt: new Date().toISOString() });
  }
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({}, { status: 400 });
  const { data } = await supabaseAdmin
    .from("hma_students").select("name, email, nmls_number").eq("id", userId).maybeSingle();
  return NextResponse.json(data || {});
}
