import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { data: reset } = await supabaseAdmin.from("hma_reset_tokens").select("*").eq("token", token).eq("used", false).gt("expires_at", new Date().toISOString()).maybeSingle();
    if (!reset) return NextResponse.json({ error: "Reset link expired or already used." }, { status: 400 });
    await supabaseAdmin.from("hma_students").update({ password_hash: hashPassword(password) }).eq("id", reset.student_id);
    await supabaseAdmin.from("hma_reset_tokens").update({ used: true }).eq("id", reset.id);
    const { data: student } = await supabaseAdmin.from("hma_students").select("id,name,email,nmls_number,plan").eq("id", reset.student_id).single();
    const sessionToken = await createSession(reset.student_id);
    return NextResponse.json({ student, token: sessionToken });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
