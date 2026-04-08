import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + (process.env.PASSWORD_SALT || "hma_salt_2026")).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("hma_students")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (error || !data) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    if (data.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const student = { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan };
    return NextResponse.json({ student });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
