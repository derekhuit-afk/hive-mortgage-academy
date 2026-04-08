import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateToken } from "@/lib/auth";
import { FROM_EMAIL, CC_EMAIL } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const { data: student } = await supabaseAdmin.from("hma_students").select("id,name,email").eq("email", email.toLowerCase()).maybeSingle();
    // Always return success (don't leak whether email exists)
    if (student) {
      const token = generateToken();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabaseAdmin.from("hma_reset_tokens").insert({ student_id: student.id, token, expires_at: expires });
      const resetUrl = `https://hivemortgageacademy.com/reset-password?token=${token}`;
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: FROM_EMAIL, to: student.email, cc: CC_EMAIL,
        subject: "Reset your Hive Mortgage Academy password",
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto"><div style="background:#0A0A0B;padding:32px;border-radius:12px 12px 0 0;text-align:center"><div style="font-size:36px;margin-bottom:8px">🐝</div><h1 style="color:white;font-size:20px;margin:0;font-family:Georgia,serif">Password Reset</h1></div><div style="background:#111114;border:1px solid #1E1E24;border-top:none;padding:28px;border-radius:0 0 12px 12px"><p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">Hey ${student.name.split(" ")[0]} — click the button below to reset your password. This link expires in 1 hour.</p><div style="text-align:center;margin:24px 0"><a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#D4881A);color:#0A0A0B;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Reset My Password →</a></div><p style="color:#64748B;font-size:12px;margin:0">If you didn't request this, ignore this email. Your password won't change.</p></div></div>`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) { console.error(err); return NextResponse.json({ ok: true }); }
}
