import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, nmls, password, plan, billing } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Missing required fields." }, { status: 400 });

    const token = generateToken();
    const { error } = await supabaseAdmin.from("hma_pending_registrations").insert({
      token, name: name.trim(), email: email.toLowerCase().trim(),
      nmls: nmls?.trim() || "", password_hash: hashPassword(password),
      plan: plan || "foundation", billing: billing || "monthly",
    });
    if (error) { console.error("Pending reg error:", error); return NextResponse.json({ error: "Failed to save registration." }, { status: 500 }); }
    return NextResponse.json({ token });
  } catch (err) { console.error(err); return NextResponse.json({ error: "Server error." }, { status: 500 }); }
}
