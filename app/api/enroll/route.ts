import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + process.env.PASSWORD_SALT || "hma_salt_2026").digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, nmls, password, plan, billing } = await req.json();

    if (!name || !email || !nmls || !password || !plan) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from("hma_students")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    }

    const { data, error } = await supabaseAdmin
      .from("hma_students")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        nmls_number: nmls.trim(),
        password_hash: hashPassword(password),
        plan,
        billing_cycle: billing,
      })
      .select()
      .single();

    if (error) {
      console.error("Enroll error:", error);
      return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    const student = { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan };
    return NextResponse.json({ student });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
