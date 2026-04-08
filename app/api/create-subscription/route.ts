import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { plan, billing, name, email, nmls, password } = await req.json();

    if (!PLANS[plan]) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    if (!password || password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const planData = PLANS[plan];
    const isAnnual = billing === "annual";
    const amount = isAnnual ? planData.annual : planData.monthly;

    // Create or retrieve customer
    const existing = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ name, email: email.toLowerCase() });

    // Create price with product_data inline (correct approach for this API version)
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: amount,
      recurring: { interval: isAnnual ? "year" : "month" },
      product_data: {
        name: `Hive Mortgage Academy — ${planData.label}`,
        statement_descriptor: "HIVE MORTGAGE ACAD",
      },
    });

    // Create subscription using the price ID
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card", "link"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: { plan, billing: billing || "monthly", hma_name: name, hma_email: email },
    });

    // Extract client_secret from expanded invoice.payment_intent
    const latestInvoice = subscription.latest_invoice as any;
    const clientSecret =
      latestInvoice?.payment_intent?.client_secret ||
      latestInvoice?.payment_intent ||
      null;

    if (!clientSecret) {
      console.error("No client_secret found. Invoice:", JSON.stringify(latestInvoice)?.slice(0,300));
    }

    // Store pending registration with hashed password — never expose plaintext
    const password_hash = await hashPassword(password);
    await supabaseAdmin.from("hma_pending_registrations").upsert({
      stripe_session_id: subscription.id,
      email: email.toLowerCase(), name, nmls: nmls || "",
      password_hash, plan, billing: billing || "monthly",
    }, { onConflict: "stripe_session_id" });

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error("Create subscription error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to initialize payment." }, { status: 500 });
  }
}
