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

  // Subscription became active or renewed — ensure account exists, stamp the
  // next renewal date, and notify Derek on new accounts.
  if (event.type === "customer.subscription.updated" || event.type === "invoice.payment_succeeded") {
    const obj = event.data.object as any;
    const customerId = obj.customer || obj.subscription?.customer;
    if (!customerId) return NextResponse.json({ received: true });

    // Extract the subscription's current_period_end (unix seconds → ISO).
    // Both event types carry it, but in different places:
    //   customer.subscription.updated  → obj.current_period_end
    //   invoice.payment_succeeded       → obj.lines.data[0].period.end (most reliable)
    //                                     or a fetch-by-subscription-id fallback
    let periodEndIso: string | null = null;
    try {
      if (event.type === "customer.subscription.updated" && obj.current_period_end) {
        periodEndIso = new Date(obj.current_period_end * 1000).toISOString();
      } else if (event.type === "invoice.payment_succeeded") {
        const linePeriodEnd = obj?.lines?.data?.[0]?.period?.end;
        if (linePeriodEnd) {
          periodEndIso = new Date(linePeriodEnd * 1000).toISOString();
        } else if (obj.subscription) {
          const sub = await stripe.subscriptions.retrieve(obj.subscription);
          if ((sub as any).current_period_end) {
            periodEndIso = new Date((sub as any).current_period_end * 1000).toISOString();
          }
        }
      }
    } catch (err) {
      console.error("Webhook period_end extract failed:", err);
    }

    try {
      const { data } = await supabaseAdmin
        .from("hma_students")
        .select("name, email, plan")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      // Stamp current_period_end regardless of notify state so the renewal
      // reminder cron has fresh data.
      if (periodEndIso) {
        await supabaseAdmin
          .from("hma_students")
          .update({ current_period_end: periodEndIso })
          .eq("stripe_customer_id", customerId);
      }

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
