import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { NOTIFY_EMAIL, FROM_EMAIL } from "@/lib/email";

export const runtime = "nodejs";

/**
 * POST /api/careers-inquiry
 *
 * Public-facing careers form. Anyone (no auth) can submit.
 * Routes the message to Derek (NOTIFY_EMAIL) via Resend and logs to
 * hma_careers_inquiries for audit / followup.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, nmls, states_licensed, years_experience, message, source } = body;

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ua = req.headers.get("user-agent") || null;

    // Persist (best-effort — never block the email on logging failure)
    try {
      await supabaseAdmin.from("hma_careers_inquiries").insert({
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        nmls: typeof nmls === "string" ? nmls.trim() : null,
        states_licensed: typeof states_licensed === "string" ? states_licensed.trim() : null,
        years_experience: typeof years_experience === "string" ? years_experience.trim() : null,
        message: typeof message === "string" ? message.slice(0, 2000) : null,
        source: typeof source === "string" ? source : "/careers",
        ip_address: ip,
        user_agent: ua,
      });
    } catch (err) {
      console.error("Careers inquiry DB write failed (non-blocking):", err);
    }

    // Email Derek
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY || "");
      const safe = (s: unknown) => String(s ?? "").replace(/[<>]/g, "").slice(0, 2000);

      await resend.emails.send({
        from: FROM_EMAIL,
        to: NOTIFY_EMAIL,
        replyTo: String(email),
        subject: `🏔️ Careers inquiry — ${safe(name)}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#111114;border-radius:12px;overflow:hidden">
          <div style="background:#0A0A0B;padding:22px 28px;border-bottom:1px solid #1E1E24">
            <h1 style="color:#F5A623;font-size:17px;margin:0;font-family:Georgia,serif">New Careers Inquiry</h1>
          </div>
          <div style="padding:22px 28px;color:#CBD5E1;font-size:14px;line-height:1.7">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:6px 0;color:#94A3B8;width:130px">Name</td><td style="padding:6px 0;color:white;font-weight:700">${safe(name)}</td></tr>
              <tr><td style="padding:6px 0;color:#94A3B8">Email</td><td style="padding:6px 0"><a href="mailto:${safe(email)}" style="color:#F5A623">${safe(email)}</a></td></tr>
              ${nmls ? `<tr><td style="padding:6px 0;color:#94A3B8">NMLS</td><td style="padding:6px 0;color:white">${safe(nmls)}</td></tr>` : ""}
              ${states_licensed ? `<tr><td style="padding:6px 0;color:#94A3B8">States</td><td style="padding:6px 0;color:white">${safe(states_licensed)}</td></tr>` : ""}
              ${years_experience ? `<tr><td style="padding:6px 0;color:#94A3B8">Years</td><td style="padding:6px 0;color:white">${safe(years_experience)}</td></tr>` : ""}
            </table>
            ${message ? `<div style="margin-top:14px;padding:14px 16px;background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.2);border-radius:8px;color:#CBD5E1;white-space:pre-wrap">${safe(message)}</div>` : ""}
            <p style="color:#64748B;font-size:11px;margin-top:18px">From ${safe(source || "/careers")} · IP ${ip || "unknown"}</p>
          </div>
        </div>`,
      });
    } catch (err) {
      console.error("Careers inquiry email failed:", err);
      return NextResponse.json({ error: "We received your info but couldn't send the email. Please email derekhuit@gmail.com directly." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Careers inquiry endpoint error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
