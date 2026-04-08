import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { createHash } from "crypto";
import { notifyNewRegistration, sendWelcomeEmail } from "@/lib/email";

function hashPassword(p: string) {
  return createHash("sha256").update(p + (process.env.PASSWORD_SALT || "hma_salt_2026")).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId, name, email, nmls, password, plan, billing } = await req.json();

    // Verify subscription is active
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (!["active", "trialing"].includes(sub.status)) {
      return NextResponse.json({ error: "Payment not yet confirmed." }, { status: 402 });
    }

    // Check for existing account
    const { data: existing } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, nmls_number, plan")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      // Already exists (webhook may have created it) — return it
      return NextResponse.json({ student: existing });
    }

    // Create account
    const { data, error } = await supabaseAdmin
      .from("hma_students")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        nmls_number: nmls?.trim() || "",
        password_hash: hashPassword(password),
        plan: plan || "foundation",
        billing_cycle: billing || "monthly",
        stripe_customer_id: sub.customer as string,
        stripe_subscription_id: sub.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Account creation error:", error);
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
    }

    // Fire emails
    notifyNewRegistration({ name: data.name, email: data.email, nmls: data.nmls_number, plan: data.plan, billing: data.billing_cycle });
    sendWelcomeEmail({ name: data.name, email: data.email, plan: data.plan });

    const student = { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan };
    return NextResponse.json({ student });
  } catch (err: any) {
    console.error("Confirm payment error:", err);
    return NextResponse.json({ error: err.message || "Server error." }, { status: 500 });
  }
}
