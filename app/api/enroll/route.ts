import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, generateToken } from "@/lib/auth";
import { notifyNewRegistration, sendWelcomeEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * POST /api/enroll
 *
 * Free-tier enrollment for Hive Mortgage Academy.
 *
 * Required:  name, email, password
 * Optional:  nmls, state_licenses[], recruiting_opt_in
 * Consent:   terms_version, privacy_version, user_agent (for audit log)
 *
 * Writes:
 *   - hma_students  (account record)
 *   - hma_consent_log  (audit trail of T&C + recruiting opt-in)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, nmls, password,
      state_licenses, recruiting_opt_in,
      terms_version, privacy_version, user_agent,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // Duplicate check
    const { data: existing } = await supabaseAdmin
      .from("hma_students")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }

    const [password_hash, session_token] = await Promise.all([
      hashPassword(password),
      Promise.resolve(generateToken()),
    ]);

    // Sanitize state_licenses to known 2-letter codes
    const cleanedStates = Array.isArray(state_licenses)
      ? state_licenses
          .filter((s: unknown) => typeof s === "string")
          .map((s: string) => s.toUpperCase().trim())
          .filter((s: string) => /^[A-Z]{2}$/.test(s))
          .slice(0, 60)
      : [];

    const insertPayload: Record<string, unknown> = {
      name: String(name).trim(),
      email: cleanEmail,
      nmls_number: typeof nmls === "string" ? nmls.trim() : "",
      password_hash,
      plan: "free",
      session_token,
      recruiting_opt_in: !!recruiting_opt_in,
      state_licenses: cleanedStates,
    };

    let { data: created, error: insertErr } = await supabaseAdmin
      .from("hma_students")
      .insert(insertPayload)
      .select()
      .single();

    // If new columns don't exist yet (migration hasn't run), fall back to a
    // minimal insert so the user can still create an account today.
    if (insertErr) {
      const code = (insertErr as { code?: string }).code;
      const msg = String((insertErr as { message?: string }).message || "");
      const isMissingColumn =
        code === "42703" || /column .* does not exist/i.test(msg) || /could not find/i.test(msg);

      if (isMissingColumn) {
        const fallback = {
          name: insertPayload.name,
          email: insertPayload.email,
          nmls_number: insertPayload.nmls_number,
          password_hash,
          plan: "free",
          session_token,
        };
        const retry = await supabaseAdmin.from("hma_students").insert(fallback).select().single();
        created = retry.data || null;
        insertErr = retry.error || null;
      }
    }

    if (insertErr || !created) {
      console.error("Enroll insert error:", insertErr);
      return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 500 });
    }

    // Consent log — never block enrollment on logging failure
    try {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        null;

      await supabaseAdmin.from("hma_consent_log").insert({
        email: cleanEmail,
        name: created.name,
        product: "hive-mortgage-academy",
        tier: "free",
        billing: null,
        terms_version: terms_version || null,
        privacy_version: privacy_version || null,
        agreed_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: user_agent || req.headers.get("user-agent") || null,
        recruiting_opt_in: !!recruiting_opt_in,
      });
    } catch (err) {
      console.error("Consent log write failed (non-blocking):", err);
    }

    notifyNewRegistration({
      name: created.name, email: created.email, nmls: created.nmls_number, plan: "free",
    });
    sendWelcomeEmail({ name: created.name, email: created.email, plan: "free" });

    return NextResponse.json({
      student: {
        id: created.id,
        name: created.name,
        email: created.email,
        nmls_number: created.nmls_number,
        plan: "free",
      },
      token: session_token,
    });
  } catch (err) {
    console.error("Enroll endpoint error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
