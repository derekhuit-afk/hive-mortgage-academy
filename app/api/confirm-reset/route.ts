import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

    const { data } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, plan, reset_token_expires").eq("reset_token", token).maybeSingle();
    if (!data) return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    if (!data.reset_token_expires || new Date(data.reset_token_expires) < new Date()) return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });

    const [password_hash, session_token] = await Promise.all([hashPassword(password), Promise.resolve(generateToken())]);
    await supabaseAdmin.from("hma_students").update({ password_hash, session_token, reset_token: null, reset_token_expires: null }).eq("id", data.id);

    return NextResponse.json({ student: { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan }, token: session_token });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
