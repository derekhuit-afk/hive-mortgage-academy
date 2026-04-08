import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { FROM_EMAIL, CC_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: true }); // Don't reveal if email exists

    const { data } = await supabaseAdmin.from("hma_students").select("id, name").eq("email", email.toLowerCase()).maybeSingle();
    if (!data) return NextResponse.json({ ok: true }); // Silent — don't reveal

    const token = uuidv4().replace(/-/g, "");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    await supabaseAdmin.from("hma_students").update({ reset_token: token, reset_token_expires: expires }).eq("id", data.id);

    const resetUrl = `https://hivemortgageacademy.com/reset-password?token=${token}`;
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: "Reset your Hive Mortgage Academy password",
      html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#111114;border-radius:12px;padding:32px;border:1px solid #1E1E24">
        <div style="font-size:32px;text-align:center;margin-bottom:16px">🐝</div>
        <h2 style="color:white;font-family:Georgia,serif;text-align:center;margin:0 0 16px">Password Reset</h2>
        <p style="color:#94A3B8;font-size:14px;line-height:1.7;margin:0 0 24px">Hey ${data.name.split(" ")[0]} — click the button below to reset your password. This link expires in 1 hour.</p>
        <div style="text-align:center;margin-bottom:24px"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#D4881A);color:#0A0A0B;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Reset My Password →</a></div>
        <p style="color:#4B5563;font-size:12px;text-align:center">If you didn't request this, ignore this email. Your password won't change.</p>
      </div>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) { console.error(err); return NextResponse.json({ ok: true }); }
}
