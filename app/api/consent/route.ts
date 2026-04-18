import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Consent audit log.
 * Records user's acceptance of Terms of Service + Privacy Policy at the moment
 * of subscription signup. California ARL §17602(a)(6) requires retention of
 * consent records for 3 years or 1 year post-termination, whichever is longer.
 *
 * We log: who, when, what version of the agreement, what IP, what user agent.
 * Table: hma_consent_log
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, product, tier, billing, terms_version, privacy_version, agreed_at, user_agent } = body;

    if (!email || !agreed_at) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Capture IP from Vercel forwarding header
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
            || req.headers.get("x-real-ip")
            || null;

    const { error } = await supabaseAdmin.from("hma_consent_log").insert({
      email: String(email).toLowerCase(),
      name: name || null,
      product: product || "hive-mortgage-academy",
      tier: tier || null,
      billing: billing || null,
      terms_version: terms_version || null,
      privacy_version: privacy_version || null,
      agreed_at,
      ip_address: ip,
      user_agent: user_agent || null,
    });

    if (error) {
      console.error("consent log error:", error);
      // Do not block the payment flow if logging fails — alert us separately
      return NextResponse.json({ ok: false, logged: false }, { status: 200 });
    }

    return NextResponse.json({ ok: true, logged: true });
  } catch (err: any) {
    console.error("consent handler error:", err);
    return NextResponse.json({ ok: false, logged: false }, { status: 200 });
  }
}
