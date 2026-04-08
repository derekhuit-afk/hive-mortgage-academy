import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { notifyNewRegistration, sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json();
    if (!subscriptionId) return NextResponse.json({ error: "Missing subscriptionId." }, { status: 400 });

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (!["active", "trialing"].includes(sub.status)) return NextResponse.json({ error: "Payment not yet confirmed." }, { status: 402 });

    // Retrieve pending registration (password hash stored server-side)
    const { data: pending } = await supabaseAdmin
      .from("hma_pending_registrations")
      .select("*")
      .eq("stripe_session_id", subscriptionId)
      .maybeSingle();

    if (!pending) return NextResponse.json({ error: "Registration data not found." }, { status: 404 });

    // Check if account already created
    const { data: existing } = await supabaseAdmin.from("hma_students").select("id, name, email, nmls_number, plan").eq("email", pending.email).maybeSingle();
    if (existing) return NextResponse.json({ student: existing });

    const session_token = generateToken();
    const { data, error } = await supabaseAdmin.from("hma_students").insert({
      name: pending.name, email: pending.email, nmls_number: pending.nmls || "",
      password_hash: pending.password_hash, plan: pending.plan,
      billing_cycle: pending.billing, session_token,
      stripe_customer_id: sub.customer as string, stripe_subscription_id: sub.id,
    }).select().single();

    if (error) { console.error("Account creation error:", error); return NextResponse.json({ error: "Failed to create account." }, { status: 500 }); }

    // Clean up pending record
    await supabaseAdmin.from("hma_pending_registrations").delete().eq("stripe_session_id", subscriptionId);

    notifyNewRegistration({ name: data.name, email: data.email, nmls: data.nmls_number, plan: data.plan, billing: data.billing_cycle });
    sendWelcomeEmail({ name: data.name, email: data.email, plan: data.plan });

    return NextResponse.json({ student: { id: data.id, name: data.name, email: data.email, nmls_number: data.nmls_number, plan: data.plan }, token: session_token });
  } catch (err: any) {
    console.error("Confirm payment error:", err);
    return NextResponse.json({ error: err.message || "Server error." }, { status: 500 });
  }
}
