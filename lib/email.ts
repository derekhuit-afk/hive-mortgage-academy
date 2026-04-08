export const NOTIFY_EMAIL = "derekhuit@gmail.com";
export const FROM_EMAIL   = "Hive Mortgage Academy <academy@huit.ai>";

async function getResend() {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY || "");
}

export async function notifyNewRegistration({
  name, email, nmls, plan, billing,
}: { name: string; email: string; nmls?: string; plan: string; billing?: string }) {
  const tier: Record<string,string> = { free:"Free", foundation:"Foundation — $97/mo", accelerator:"Accelerator — $297/mo", elite:"Elite — $697/mo" };
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: NOTIFY_EMAIL,
      subject: `🐝 New HMA Registration — ${name} (${tier[plan] || plan})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#111114;border-radius:12px;overflow:hidden">
          <div style="background:#0A0A0B;padding:24px 28px;border-bottom:1px solid #1E1E24">
            <div style="font-size:24px;margin-bottom:4px">🐝</div>
            <h1 style="color:#F5A623;font-size:18px;margin:0;font-family:Georgia,serif">New Student Registration</h1>
          </div>
          <div style="padding:24px 28px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px;width:120px">Name</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:white;font-weight:700">${name}</td></tr>
              <tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px">Email</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24"><a href="mailto:${email}" style="color:#F5A623">${email}</a></td></tr>
              ${nmls ? `<tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px">NMLS</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:white">#${nmls}</td></tr>` : ""}
              <tr><td style="padding:9px 0;color:#94A3B8;font-size:13px">Plan</td><td style="padding:9px 0;color:#10B981;font-weight:700">${tier[plan] || plan}</td></tr>
            </table>
            <p style="color:#64748B;font-size:12px;margin-top:16px">${billing ? `Billing: ${billing}` : ""}</p>
          </div>
        </div>`,
    });
  } catch (err) { console.error("Notify email failed:", err); }
}

export async function sendWelcomeEmail({
  name, email, plan,
}: { name: string; email: string; plan: string }) {
  const access: Record<string,string> = { free:"Modules 1–3 unlocked + unlimited AI Coach.", foundation:"Modules 1–6 fully unlocked.", accelerator:"Modules 1–10 fully unlocked.", elite:"All 12 modules + full platform access." };
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email,
      subject: `Welcome to Hive Mortgage Academy, ${name.split(" ")[0]}! 🐝`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0A0A0B;padding:40px 32px;border-radius:12px 12px 0 0;text-align:center">
            <div style="font-size:48px;margin-bottom:10px">🐝</div>
            <h1 style="color:white;font-size:26px;margin:0 0 6px;font-family:Georgia,serif">Welcome, ${name.split(" ")[0]}.</h1>
            <p style="color:#F5A623;font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0">Hive Mortgage Academy</p>
          </div>
          <div style="background:#111114;border:1px solid #1E1E24;border-top:none;padding:32px;border-radius:0 0 12px 12px">
            <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 20px">You made the right call. Most new LOs are handed a rate sheet and told to figure it out. You chose a different path.</p>
            <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:14px 18px;margin-bottom:24px">
              <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0 0 4px">Your Access</p>
              <p style="color:#94A3B8;font-size:13px;margin:0">${access[plan] || "Access active."}</p>
            </div>
            <div style="text-align:center;margin-bottom:24px">
              <a href="https://hivemortgageacademy.com/dashboard" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#D4881A);color:#0A0A0B;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">Go to My Dashboard →</a>
            </div>
            <hr style="border:none;border-top:1px solid #1E1E24;margin:20px 0">
            <p style="color:#4B5563;font-size:12px;margin:0">Hive Mortgage Academy · Built from Alaska · <a href="https://hivemortgageacademy.com" style="color:#F5A623">hivemortgageacademy.com</a></p>
          </div>
        </div>`,
    });
  } catch (err) { console.error("Welcome email failed:", err); }
}
