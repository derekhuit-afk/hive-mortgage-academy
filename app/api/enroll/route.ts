import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, generateToken } from "@/lib/auth";
import { notifyNewRegistration, sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, nmls, password, plan, billing } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const { data: existing } = await supabaseAdmin.from("hma_students").select("id").eq("email", email.toLowerCase()).maybeSingle();
    if (existing) return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });

    const [password_hash, session_token] = await Promise.all([hashPassword(password), Promise.resolve(generateToken())]);

    const { data, error } = await supabaseAdmin.from("hma_students").insert({
      name: name.trim(), email: email.toLowerCase().trim(),
      nmls_number: nmls?.trim() || "", password_hash,
      plan: plan || "free", billing_cycle: billing || "monthly",
      session_token,
    }).select().single();

    if (error) { console.error("Enroll error:", error); return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 }); }

    notifyNewRegistration({ name: data.name, email: data.email, nmls: data.nmls_number, plan: data.plan, billing: data.billing_cycle });
    sendWelcomeEmail({ name: data.name, email: data.email, plan: data.plan });

    return NextResponse.json({ student: { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan }, token: session_token });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
