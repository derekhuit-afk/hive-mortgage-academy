export const NOTIFY_EMAIL = "derekhuit@gmail.com";
export const FROM_EMAIL   = "Hive Mortgage Academy <academy@huit.ai>";
export const CC_EMAIL     = "derekhuit@gmail.com";

const BASE_URL = "https://hivemortgageacademy.com";

async function getResend() {
  const { Resend } = await import("resend");
  return new Resend(process.env.RESEND_API_KEY || "");
}

const TIER_LABEL: Record<string,string> = {
  free: "Free", foundation: "Foundation — $97/mo",
  accelerator: "Accelerator — $297/mo", elite: "Elite — $697/mo",
};
const TIER_ACCESS: Record<string,string> = {
  free: "Modules 1–6 unlocked + unlimited AI Coach.",
  foundation: "Modules 1–9 fully unlocked.",
  accelerator: "Modules 1–11 fully unlocked.",
  elite: "All 12 modules + full platform access.",
};
const NEXT_TIER: Record<string,{ label:string; price:string; href:string }> = {
  free:        { label:"Foundation", price:"$97/mo", href:`${BASE_URL}/enroll?tier=foundation` },
  foundation:  { label:"Accelerator",price:"$297/mo",href:`${BASE_URL}/enroll?tier=accelerator` },
  accelerator: { label:"Elite",      price:"$697/mo",href:`${BASE_URL}/enroll?tier=elite` },
};
const MODULE_NAMES: Record<number,string> = {
  1:"Day 1 — You Passed. Now What?", 2:"Understanding Loan Products",
  3:"Building Your Referral Pipeline", 4:"Your First Borrower Conversation",
  5:"Payment-First — Not Max Qualification", 6:"Credit Reports & Qualification Deep Dive",
  7:"CRM + Tech Stack for New LOs", 8:"Moving the Loan: App to Clear to Close",
  9:"Agent Relationships — Give & Receive Referrals", 10:"Compliance, RESPA & Fair Lending",
  11:"Post-Closing: Reviews, Referrals & Refi Watch", 12:"Building a $1M/Year Mortgage Business",
};
const NEXT_MODULE: Record<number,string> = {
  1:"Module 2: Understanding Loan Products", 2:"Module 3: Building Your Referral Pipeline",
  3:"Module 4: Your First Borrower Conversation", 4:"Module 5: Payment-First Philosophy",
  5:"Module 6: Credit Reports Deep Dive", 6:"Module 7: CRM + Tech Stack",
  7:"Module 8: Moving the Loan to Close", 8:"Module 9: Agent Relationships",
  9:"Module 10: Compliance & Fair Lending", 10:"Module 11: Post-Closing System",
  11:"Module 12: Building a $1M/Year Business", 12:"Your HivePass™ graduation",
};

// ─── Shared HTML helpers ──────────────────────────────────────────────────
const header = (emoji: string, title: string, subtitle: string) => `
  <div style="background:#0A0A0B;padding:36px 32px;border-radius:12px 12px 0 0;text-align:center">
    <div style="font-size:44px;margin-bottom:10px">${emoji}</div>
    <h1 style="color:white;font-size:24px;margin:0 0 6px;font-family:Georgia,serif">${title}</h1>
    <p style="color:#F5A623;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0">${subtitle}</p>
  </div>`;

const footer = () => `
  <hr style="border:none;border-top:1px solid #1E1E24;margin:24px 0">
  <p style="color:#4B5563;font-size:12px;margin:0 0 8px">Hive Mortgage Academy · Built from Alaska · <a href="${BASE_URL}" style="color:#F5A623">${BASE_URL}</a></p>
  <p style="color:#374151;font-size:10px;line-height:1.6;margin:0 0 4px">For educational purposes only. Not affiliated with or required by any employer. Individual results vary. Content does not constitute legal, financial, or compliance advice.</p>
  <p style="color:#374151;font-size:10px;line-height:1.6;margin:0">Instructor: Derek Huit · NMLS #1739818 · Licensed in AK, WA, MT · Cardinal Financial (NMLS #203980) · Equal Housing Opportunity</p>`;

const btn = (text: string, href: string) =>
  `<div style="text-align:center;margin:24px 0"><a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#F5A623,#D4881A);color:#0A0A0B;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">${text}</a></div>`;

const wrap = (inner: string) =>
  `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto"><div style="background:#111114;border:1px solid #1E1E24;border-top:none;padding:28px 32px;border-radius:0 0 12px 12px">${inner}${footer()}</div></div>`;

// ═══════════════════════════════════════════════════════════════════════════
// 1. NEW REGISTRATION — notify Derek only
// ═══════════════════════════════════════════════════════════════════════════
export async function notifyNewRegistration({ name, email, nmls, plan, billing }:
  { name: string; email: string; nmls?: string; plan: string; billing?: string }) {
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: NOTIFY_EMAIL,
      subject: `🐝 New HMA Registration — ${name} (${TIER_LABEL[plan] || plan})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#111114;border-radius:12px;overflow:hidden">
        <div style="background:#0A0A0B;padding:22px 28px;border-bottom:1px solid #1E1E24">
          <div style="font-size:22px;margin-bottom:4px">🐝</div>
          <h1 style="color:#F5A623;font-size:17px;margin:0;font-family:Georgia,serif">New Student Registration</h1>
        </div>
        <div style="padding:22px 28px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px;width:120px">Name</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:white;font-weight:700">${name}</td></tr>
            <tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px">Email</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24"><a href="mailto:${email}" style="color:#F5A623">${email}</a></td></tr>
            ${nmls ? `<tr><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:#94A3B8;font-size:13px">NMLS</td><td style="padding:9px 0;border-bottom:1px solid #1E1E24;color:white">#${nmls}</td></tr>` : ""}
            <tr><td style="padding:9px 0;color:#94A3B8;font-size:13px">Plan</td><td style="padding:9px 0;color:#10B981;font-weight:700">${TIER_LABEL[plan] || plan}${billing ? ` · ${billing}` : ""}</td></tr>
          </table>
        </div></div>`,
    });
  } catch (err) { console.error("Notify email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. WELCOME EMAIL — sent to student on signup, CC Derek
// ═══════════════════════════════════════════════════════════════════════════
export async function sendWelcomeEmail({ name, email, plan }:
  { name: string; email: string; plan: string }) {
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `Welcome to Hive Mortgage Academy, ${name.split(" ")[0]}! 🐝`,
      html: `${header("🐝", `Welcome, ${name.split(" ")[0]}.`, "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 18px">You made the right call. Most new LOs are handed a rate sheet and told to figure it out. You chose a different path.</p>
          <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:14px 18px;margin-bottom:20px">
            <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0 0 4px">Your Access Is Live</p>
            <p style="color:#94A3B8;font-size:13px;margin:0">${TIER_ACCESS[plan] || "Access active."}</p>
          </div>
          <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 4px">Your AI Coach is ready the moment you log in — ask it anything about loan products, Realtor relationships, compliance, or what to do on Day 1.</p>
          ${btn("Go to My Dashboard →", `${BASE_URL}/dashboard`)}
        `)}`,
    });
  } catch (err) { console.error("Welcome email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. MODULE COMPLETE — fired when a student finishes all lessons in a module
// ═══════════════════════════════════════════════════════════════════════════
export async function sendModuleCompleteEmail({ name, email, moduleNumber, plan }:
  { name: string; email: string; moduleNumber: number; plan: string }) {
  const moduleName = MODULE_NAMES[moduleNumber] || `Module ${moduleNumber}`;
  const nextUp = NEXT_MODULE[moduleNumber];
  const isLastInTier = (plan === "free" && moduleNumber === 6) ||
    (plan === "foundation" && moduleNumber === 9) ||
    (plan === "accelerator" && moduleNumber === 11) ||
    (plan === "elite" && moduleNumber === 12);

  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `✅ Module ${moduleNumber} Complete — Keep going, ${name.split(" ")[0]}`,
      html: `${header("✅", `Module ${moduleNumber} Complete`, "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            <strong style="color:white">${name.split(" ")[0]}</strong> — you just finished <strong style="color:#F5A623">Module ${moduleNumber}: ${moduleName}</strong>. That's real progress.
          </p>
          ${isLastInTier
            ? `<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px 18px;margin-bottom:20px">
                <p style="color:#10B981;font-size:13px;font-weight:700;margin:0 0 4px">🎉 You've completed your ${TIER_LABEL[plan]?.split(" —")[0] || plan} tier!</p>
                <p style="color:#94A3B8;font-size:13px;margin:0">Head to your dashboard to claim your HivePass™ and see your next steps.</p>
               </div>
               ${btn("Get My HivePass™ →", `${BASE_URL}/graduation`)}`
            : `<div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.18);border-radius:10px;padding:14px 18px;margin-bottom:20px">
                <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0 0 4px">Up Next</p>
                <p style="color:#94A3B8;font-size:13px;margin:0">${nextUp}</p>
               </div>
               ${btn("Continue Training →", `${BASE_URL}/dashboard`)}`
          }
        `)}`,
    });
  } catch (err) { console.error("Module complete email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. QUIZ PASSED — fired on a passing quiz score
// ═══════════════════════════════════════════════════════════════════════════
export async function sendQuizPassedEmail({ name, email, moduleNumber, score }:
  { name: string; email: string; moduleNumber: number; score: number }) {
  const moduleName = MODULE_NAMES[moduleNumber] || `Module ${moduleNumber}`;
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `🏆 Quiz Passed — Module ${moduleNumber} (${score}%)`,
      html: `${header("🏆", "Quiz Passed!", "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            Nice work, <strong style="color:white">${name.split(" ")[0]}</strong>. You passed the <strong style="color:#F5A623">Module ${moduleNumber}: ${moduleName}</strong> quiz with a score of <strong style="color:#10B981">${score}%</strong>.
          </p>
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px 18px;margin-bottom:20px">
            <p style="color:#10B981;font-size:13px;font-weight:700;margin:0 0 2px">Module ${moduleNumber} — Certified ✓</p>
            <p style="color:#94A3B8;font-size:13px;margin:0">This module is marked complete in your training record.</p>
          </div>
          ${btn("Continue to Next Module →", `${BASE_URL}/dashboard`)}
        `)}`,
    });
  } catch (err) { console.error("Quiz passed email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. HIVEPASS EARNED — fired when graduation certificate is issued
// ═══════════════════════════════════════════════════════════════════════════
export async function sendHivePassEmail({ name, email, nmls, certNumber, studentId }:
  { name: string; email: string; nmls?: string; certNumber: string; studentId: string }) {
  const badgeUrl = `${BASE_URL}/hivepass/${studentId}`;
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `🐝 Your HivePass™ is ready, ${name.split(" ")[0]}`,
      html: `${header("🐝", "HivePass™ Earned", "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            <strong style="color:white">${name.split(" ")[0]}</strong> — you earned it. Your HivePass™ credential is issued and ready to share.
          </p>
          <div style="background:rgba(245,166,35,0.08);border:2px solid rgba(245,166,35,0.3);border-radius:12px;padding:20px 22px;margin-bottom:20px;text-align:center">
            <div style="font-size:36px;margin-bottom:8px">🐝</div>
            <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#F5A623;margin-bottom:4px">HivePass™</div>
            <div style="font-size:15px;color:white;font-weight:700;margin-bottom:4px">${name}</div>
            ${nmls ? `<div style="font-size:13px;color:#94A3B8">NMLS #${nmls}</div>` : ""}
            <div style="font-size:11px;color:#4B5563;margin-top:8px">Certificate ${certNumber} · Hive Mortgage Academy · Built from Alaska</div>
          </div>
          <p style="color:#94A3B8;font-size:13px;line-height:1.7;margin:0 0 16px">Share your public badge link on LinkedIn, in your email signature, and with every Realtor you meet. It signals you were trained the right way.</p>
          ${btn("Share My HivePass™ →", badgeUrl)}
          <p style="color:#94A3B8;font-size:13px;line-height:1.7;margin:16px 0 0">Ready to take the next step? <a href="${BASE_URL}/apply" style="color:#F5A623;font-weight:700">Apply to join Derek's team</a> and get the full Huit.AI platform from Day 1.</p>
        `)}`,
    });
  } catch (err) { console.error("HivePass email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. 7-DAY INACTIVE NUDGE — fired by cron when student hasn't logged in
// ═══════════════════════════════════════════════════════════════════════════
export async function sendInactiveNudgeEmail({ name, email, moduleNumber }:
  { name: string; email: string; moduleNumber: number }) {
  const nextModule = moduleNumber + 1;
  const nextName = MODULE_NAMES[nextModule] || `Module ${nextModule}`;
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `${name.split(" ")[0]}, your training is waiting 🐝`,
      html: `${header("🏔️", "Your training is waiting.", "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            Hey <strong style="color:white">${name.split(" ")[0]}</strong> — it's been a week. The LOs who make it through Year 1 are the ones who show up consistently, not perfectly.
          </p>
          <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 16px">
            You left off heading into <strong style="color:#F5A623">Module ${nextModule}: ${nextName}</strong>. It takes about 45 minutes. That's one Netflix episode.
          </p>
          <div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.18);border-radius:10px;padding:14px 18px;margin-bottom:20px">
            <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0 0 4px">The difference between LOs who close in Year 1 and those who quit?</p>
            <p style="color:#94A3B8;font-size:13px;margin:0">They did the work. Module by module. Even when it wasn't convenient.</p>
          </div>
          ${btn("Pick Up Where I Left Off →", `${BASE_URL}/dashboard`)}
        `)}`,
    });
  } catch (err) { console.error("Inactive nudge email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. UPGRADE OPPORTUNITY — fired when free/foundation student finishes their tier
// ═══════════════════════════════════════════════════════════════════════════
export async function sendUpgradeEmail({ name, email, currentPlan }:
  { name: string; email: string; currentPlan: string }) {
  const next = NEXT_TIER[currentPlan];
  if (!next) return;
  const currentLabel = TIER_LABEL[currentPlan]?.split(" —")[0] || currentPlan;
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `You've maxed out ${currentLabel} — here's what's next, ${name.split(" ")[0]}`,
      html: `${header("🚀", `You've maxed out ${currentLabel}.`, "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            <strong style="color:white">${name.split(" ")[0]}</strong> — you've completed every module available on your current plan. That's not nothing. Most people never get this far.
          </p>
          <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 16px">
            The next level is <strong style="color:#F5A623">${next.label}</strong> at ${next.price}. Here's what unlocks:
          </p>
          <div style="background:rgba(245,166,35,0.06);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:16px 18px;margin-bottom:20px">
            ${currentPlan === "free"
              ? `<p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Modules 4–6 unlocked immediately</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Your First Borrower Conversation</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Payment-First methodology</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0">✓ Credit Reports deep dive</p>`
              : currentPlan === "foundation"
              ? `<p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Modules 7–10 unlocked immediately</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ CRM + full Huit.AI platform walkthrough</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Moving the loan: app to close</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0">✓ Compliance, RESPA & fair lending</p>`
              : `<p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ All 12 modules unlocked</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0 0 8px">✓ Monthly 1:1 strategy session with Derek</p>
                 <p style="color:#94A3B8;font-size:13px;margin:0">✓ HivePass™ graduation + Huit.AI platform preview</p>`
            }
          </div>
          ${btn(`Upgrade to ${next.label} — ${next.price} →`, next.href)}
          <p style="color:#4B5563;font-size:12px;text-align:center;margin:0">Cancel anytime · Secured by ZenoPay.ai</p>
        `)}`,
    });
  } catch (err) { console.error("Upgrade email failed:", err); }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. APPLICATION SUBMITTED — fired when LO submits /apply form
// ═══════════════════════════════════════════════════════════════════════════
export async function sendApplicationConfirmEmail({ name, email, market, experience }:
  { name: string; email: string; market?: string; experience?: string }) {
  try {
    const resend = await getResend();
    await resend.emails.send({
      from: FROM_EMAIL, to: email, cc: CC_EMAIL,
      subject: `Application received, ${name.split(" ")[0]} — Derek will be in touch`,
      html: `${header("🏔️", "Application Received.", "Hive Mortgage Academy")}
        ${wrap(`
          <p style="color:#CBD5E1;font-size:15px;line-height:1.7;margin:0 0 16px">
            <strong style="color:white">${name.split(" ")[0]}</strong> — Derek reviews every application personally. You'll hear back within 2 business days.
          </p>
          <div style="background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.2);border-radius:10px;padding:16px 18px;margin-bottom:20px">
            <p style="color:#F5A623;font-size:13px;font-weight:700;margin:0 0 10px">What happens next:</p>
            <p style="color:#94A3B8;font-size:13px;margin:0 0 7px">1. Derek reviews your application</p>
            <p style="color:#94A3B8;font-size:13px;margin:0 0 7px">2. You receive a calendar link for a 30-minute call</p>
            <p style="color:#94A3B8;font-size:13px;margin:0">3. If it's a fit, you get a detailed onboarding plan with full Huit.AI platform access from Day 1</p>
          </div>
          ${market || experience ? `<p style="color:#94A3B8;font-size:13px;line-height:1.7;margin:0 0 16px">We have your details on file${market ? ` — ${market}` : ""}${experience ? `, ${experience}` : ""}.</p>` : ""}
          <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 4px">In the meantime, keep working your Academy curriculum. The LOs Derek chooses are always the ones who show up.</p>
          ${btn("Back to My Dashboard →", `${BASE_URL}/dashboard`)}
        `)}`,
    });
  } catch (err) { console.error("Application confirm email failed:", err); }
}
