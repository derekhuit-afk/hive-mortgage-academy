import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { validateRequest } from "@/lib/auth";
import { sendCancellationConfirmEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/cancel
 *
 * One-click cancellation. Authenticated via session token. Sets
 * cancel_at_period_end=true on the student's Stripe subscription so access
 * continues through the already-paid-for period, then logs the request for
 * audit (FTC ROSCA / CA ARL §17602) and emails a confirmation.
 *
 * No phone call, no rep, no extra steps beyond this single click — in line
 * with TOS §6 and the FTC Click-to-Cancel rule.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth — must have a valid session token
    const auth = await validateRequest(req);
    if (!auth.valid || !auth.studentId) {
      return NextResponse.json({ error: "Not authorized." }, { status: 401 });
    }

    // 2. Load student + sub info
    const { data: student, error: studentErr } = await supabaseAdmin
      .from("hma_students")
      .select("id, name, email, plan, billing_cycle, stripe_subscription_id, stripe_customer_id")
      .eq("id", auth.studentId)
      .maybeSingle();

    if (studentErr || !student) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (student.plan === "free") {
      return NextResponse.json(
        { error: "You're on the free plan — there's nothing to cancel." },
        { status: 400 }
      );
    }

    if (!student.stripe_subscription_id) {
      // No Stripe sub on file but plan is paid — mark account free and log
      await supabaseAdmin.from("hma_students").update({ plan: "free" }).eq("id", student.id);
      return NextResponse.json({
        ok: true,
        message: "Your subscription has been cancelled.",
        periodEnd: null,
      });
    }

    // 3. Optional reason from body (UX — never required to cancel)
    let reason = "";
    try {
      const body = await req.json().catch(() => ({}));
      reason = typeof body?.reason === "string" ? body.reason.slice(0, 500) : "";
    } catch { /* body optional */ }

    // 4. Tell Stripe to cancel at period end
    let periodEnd: Date | null = null;
    try {
      const sub = await stripe.subscriptions.update(student.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: { cancelled_via: "hma_self_service", cancelled_reason: reason },
      });
      if ((sub as any).current_period_end) {
        periodEnd = new Date((sub as any).current_period_end * 1000);
      }
    } catch (err: any) {
      console.error("Stripe cancel failed:", err?.message || err);
      return NextResponse.json(
        { error: "We couldn't process the cancellation right now. Please try again in a minute, or reply to your welcome email and we'll cancel manually within one business day." },
        { status: 502 }
      );
    }

    // 5. Audit log — never block the cancellation on logging failure
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;
      const ua = req.headers.get("user-agent") || null;

      await supabaseAdmin.from("hma_cancellation_log").insert({
        student_id: student.id,
        email: student.email,
        name: student.name,
        plan: student.plan,
        billing_cycle: student.billing_cycle,
        stripe_subscription_id: student.stripe_subscription_id,
        stripe_customer_id: student.stripe_customer_id,
        cancel_at_period_end: periodEnd?.toISOString() || null,
        reason: reason || null,
        ip_address: ip,
        user_agent: ua,
      });
    } catch (err) {
      console.error("Cancellation log write failed:", err);
    }

    // 6. Confirmation email — fire-and-forget
    sendCancellationConfirmEmail({
      name: student.name,
      email: student.email,
      plan: student.plan,
      periodEnd,
    });

    return NextResponse.json({
      ok: true,
      message: "Your subscription has been cancelled. Access continues until the end of your current billing period.",
      periodEnd: periodEnd?.toISOString() || null,
    });
  } catch (err: any) {
    console.error("Cancel endpoint error:", err?.message || err);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
