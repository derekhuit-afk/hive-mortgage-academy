import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/billing-portal
 *
 * Creates a Stripe Billing Portal session so the student can manage billing,
 * update their payment method, view invoices, or cancel directly via Stripe.
 * Returns { url } for client-side redirect.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth.valid || !auth.studentId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    const { data: student } = await supabaseAdmin
      .from("hma_students")
      .select("stripe_customer_id")
      .eq("id", auth.studentId)
      .maybeSingle();

    if (!student?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account on file. Free-plan users don't have billing to manage." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "https://hivemortgageacademy.com";

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: student.stripe_customer_id,
        return_url: `${origin}/cancel?returned=1`,
      });
      return NextResponse.json({ url: session.url });
    } catch (err: any) {
      console.error("Billing portal create failed:", err?.message || err);
      return NextResponse.json(
        { error: "The billing portal is temporarily unavailable. You can still cancel with the button on this page." },
        { status: 502 }
      );
    }
  } catch (err: any) {
    console.error("Billing portal endpoint error:", err?.message || err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
