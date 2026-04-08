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

    // Get or create customer
    const existing = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ name, email: email.toLowerCase() });

    // Create a PaymentIntent directly for subscription setup
    // This is more reliable than subscription expand for getting client_secret
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ["card"],
      metadata: { plan, billing: billing || "monthly", hma_name: name, hma_email: email },
    });

    // Also create the subscription in incomplete state for the webhook to confirm
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: amount,
      recurring: { interval: isAnnual ? "year" : "month" },
      product_data: { name: `Hive Mortgage Academy — ${planData.label}` },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      metadata: { plan, billing: billing || "monthly", hma_name: name, hma_email: email },
    });

    // Get the payment intent from the subscription's latest invoice
    let clientSecret: string | null = null;

    if (subscription.latest_invoice) {
      const invoiceId = typeof subscription.latest_invoice === "string"
        ? subscription.latest_invoice
        : (subscription.latest_invoice as any).id;

      const invoice = await stripe.invoices.retrieve(invoiceId, {
        expand: ["payment_intent"],
      });

      const pi = (invoice as any).payment_intent;
      if (pi && typeof pi === "object") {
        clientSecret = pi.client_secret;
      } else if (typeof pi === "string") {
        // Payment intent is just an ID — retrieve it
        const piObj = await stripe.paymentIntents.retrieve(pi);
        clientSecret = piObj.client_secret;
      }
    }

    // Fallback: use setup intent if subscription payment intent not available
    if (!clientSecret) {
      console.log("Using setupIntent as fallback for clientSecret");
      clientSecret = setupIntent.client_secret;
    }

    // Store pending registration
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
