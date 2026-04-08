import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const { data } = await supabaseAdmin.from("hma_students").select("*").eq("email", email.toLowerCase().trim()).maybeSingle();
    if (!data) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const valid = await verifyPassword(password, data.password_hash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    // Rotate session token on every login
    const session_token = generateToken();
    await supabaseAdmin.from("hma_students").update({ session_token }).eq("id", data.id);

    return NextResponse.json({ student: { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan }, token: session_token });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
