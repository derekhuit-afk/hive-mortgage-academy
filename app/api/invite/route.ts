import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { FROM_EMAIL, CC_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { valid, studentId } = await validateRequest(req);
    if (!valid || !studentId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipientEmail, recipientName, personalNote } = await req.json();
    if (!recipientEmail) return NextResponse.json({ error: "Email required." }, { status: 400 });

    const { data: sender } = await supabaseAdmin
      .from("hma_students").select("name, email, nmls_number")
      .eq("id", studentId).single();
    if (!sender) return NextResponse.json({ error: "Sender not found." }, { status: 404 });

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      cc: CC_EMAIL,
      subject: `${sender.name} thinks you'd get a lot out of this`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0A0A0B;padding:36px 32px;border-radius:12px 12px 0 0;text-align:center">
            <div style="font-size:44px;margin-bottom:10px">🐝</div>
            <h1 style="color:white;font-size:22px;margin:0 0 6px;font-family:Georgia,serif">${sender.name} sent you something</h1>
            <p style="color:#F5A623;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">Hive Mortgage Academy</p>
          </div>
          <div style="background:#111114;border:1px solid #1E1E24;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">
            ${personalNote ? `<div style="background:rgba(245,166,35,0.07);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:14px 18px;margin-bottom:20px"><p style="color:#F5A623;font-size:12px;font-weight:700;margin:0 0 6px">A note from ${sender.name}:</p><p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0">${personalNote}</p></div>` : ""}
            <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">Hey${recipientName ? ` ${recipientName}` : ""} — ${sender.name} thought you'd find value in this platform. Hive Mortgage Academy is a free training platform for loan officers, built from 18 years and $1B+ in production.</p>
            <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 20px">6 full modules, free. An AI Mortgage Coach available 24/7. 11 production tools included. No credit card.</p>
            <div style="text-align:center;margin-bottom:20px">
              <a href="https://hivemortgageacademy.com/enroll" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#D4881A);color:#0A0A0B;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Start Free →</a>
            </div>
            <hr style="border:none;border-top:1px solid #1E1E24;margin:20px 0">
            <p style="color:#4B5563;font-size:11px;line-height:1.6;margin:0">Hive Mortgage Academy · hivemortgageacademy.com · For educational purposes only. Not affiliated with or required by any employer. Individual results vary. Instructor: Derek Huit · NMLS #1739818 · Cardinal Financial (NMLS #203980)</p>
          </div>
        </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Invite error:", err);
    return NextResponse.json({ error: "Failed to send invite." }, { status: 500 });
  }
}
