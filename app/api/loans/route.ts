import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("hma_loans").select("id, data, updated_at").eq("student_id", studentId).order("updated_at", { ascending: false });
  return NextResponse.json(data?.map(r => ({ ...r.data, id: r.id })) || []);
}

export async function POST(req: NextRequest) {
  const { valid, studentId } = await validateRequest(req);
  if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const loan = await req.json();
  const { error } = await supabaseAdmin.from("hma_loans").upsert({ id: loan.id, student_id: studentId, data: loan, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Public loan lookup (for /lt/[loanId] borrower portal)
export async function PUT(req: NextRequest) {
  const { loanId } = await req.json();
  const { data } = await supabaseAdmin.from("hma_loans").select("data").eq("id", loanId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  return NextResponse.json(data.data);
}
