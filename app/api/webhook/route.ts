import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyNewRegistration } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  // Subscription became active — ensure account exists and notify Derek
  if (event.type === "customer.subscription.updated" || event.type === "invoice.payment_succeeded") {
    const obj = event.data.object as any;
    const customerId = obj.customer || obj.subscription?.customer;
    if (!customerId) return NextResponse.json({ received: true });

    try {
      const { data } = await supabaseAdmin
        .from("hma_students")
        .select("name, email, plan")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      // If we don't have the account yet (edge case), log it
      if (!data) console.log("Webhook: no account found for customer", customerId);
      else notifyNewRegistration({ name: data.name, email: data.email, plan: data.plan });
    } catch (err) { console.error("Webhook processing error:", err); }
  }

  // Subscription cancelled — downgrade to free
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as any;
    await supabaseAdmin
      .from("hma_students")
      .update({ plan: "free" })
      .eq("stripe_subscription_id", sub.id);
  }

  return NextResponse.json({ received: true });
}
