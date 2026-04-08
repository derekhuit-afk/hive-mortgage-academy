import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan, billing, name, email } = await req.json();

    if (!PLANS[plan]) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });

    const planData = PLANS[plan];
    const isAnnual = billing === "annual";
    const amount = isAnnual ? planData.annual : planData.monthly;

    // Create or retrieve customer
    const existing = await stripe.customers.list({ email: email.toLowerCase(), limit: 1 });
    const customer = existing.data.length > 0
      ? existing.data[0]
      : await stripe.customers.create({ name, email: email.toLowerCase() });

    // Create subscription with inline price_data — no pre-created products needed
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Hive Mortgage Academy — ${planData.label}`,
            description: `${planData.modules} unlocked`,
          } as any,
          unit_amount: amount,
          recurring: { interval: isAnnual ? "year" : "month" },
        } as any,
      }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card", "link"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: { plan, billing: billing || "monthly", hma_name: name, hma_email: email },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice?.payment_intent as any;

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent?.client_secret,
      customerId: customer.id,
    });
  } catch (err: any) {
    console.error("Create subscription error:", err);
    return NextResponse.json({ error: err.message || "Failed to initialize payment." }, { status: 500 });
  }
}
