'use client'
/**
 * Universal legal page — Terms of Service + Privacy Policy combined.
 * Tabs between the two documents. No auth required. Drop into any Next.js site.
 *
 * Customize the four constants below per site before using.
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// ─── PER-SITE VARIABLES ──────────────────────────────────────────────────────
const PRODUCT = 'Hive Mortgage Academy'
const COMPANY = 'Huitai LLC'
const WEBSITE = 'hivemortgageacademy.com'
const SUPPORT_EMAIL = 'legal@huit.ai'
const EFFECTIVE_DATE = 'April 26, 2026'

// ─── TERMS OF SERVICE SECTIONS ───────────────────────────────────────────────
const TOS_SECTIONS = [
  { title: '1. Acceptance of Terms', body: `By creating an account, accessing, or using ${PRODUCT} (the "Platform"), you ("User," "Student," or "you") agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws. If you do not agree, you may not access or use the Platform.

These Terms form a legally binding agreement between you and ${COMPANY} ("Company," "we," "us," or "our").` },
  { title: '2. Description of the Service', body: `${PRODUCT} is a free educational platform for current and aspiring mortgage loan officers. We provide on-demand training modules, interactive quizzes, AI-assisted coaching tools, and supplemental productivity utilities (the "Service"). The Platform is operated as a marketing and recruiting top-of-funnel for Derek Huit's mortgage origination team. The Platform is not a mortgage lender, mortgage broker, or licensed financial-services provider, and nothing on the Platform constitutes a credit decision, loan offer, or commitment to lend.` },
  { title: '3. No Charge', body: `The Platform is provided to you free of charge. ${COMPANY} does not collect payment, and there is no subscription, paid tier, free trial that converts, or recurring charge of any kind. We may, in the future, introduce paid features at our discretion; if we do, we will clearly disclose pricing and obtain your separate, affirmative consent before charging anything. You will never be billed without that explicit step.` },
  { title: '4. Eligibility and Account', body: `You must be at least 18 years of age to use the Platform. You agree that all registration information is truthful and accurate, that you will keep it current, and that you are responsible for maintaining the confidentiality of your credentials. You are responsible for all activity under your account. The NMLS number field is optional; if you provide one, you represent that it is yours.` },
  { title: '5. Educational Purpose Only — Not Legal, Financial, or Lending Advice', body: `Content on the Platform — including modules, lessons, quizzes, AI Coach output, scripts, templates, and tools — is provided for educational purposes only. It is not legal, tax, financial, regulatory, or lending advice. Nothing on the Platform represents an underwriting decision, a credit approval, a pre-approval, a prequalification, or a commitment to lend by ${COMPANY} or by any other party. Any documents, scripts, or templates you generate using the Platform are for your training and reference only. You are solely responsible for verifying compliance with applicable federal, state, and local mortgage regulations (including NMLS rules, RESPA, TILA/Regulation Z, ECOA, the Fair Housing Act, and your state's mortgage licensing act) before relying on any output in connection with a real consumer transaction.` },
  { title: '6. Recruiting Communications and Optional Career Outreach', body: `${COMPANY} is operated by Derek Huit (NMLS #203980), a producing mortgage loan originator licensed in nine U.S. states. ${PRODUCT} exists in part to identify candidates who may be a good fit for Derek Huit's mortgage origination team.

By creating an account, you agree that ${COMPANY} may send you periodic emails about course content, new modules, platform updates, and general team-related announcements (such as openings, hiring fairs, and similar communications addressed to the broader student audience). Every email includes an unsubscribe link, and you may opt out at any time without losing your access to the curriculum.

Personalized recruiting outreach (including direct phone calls, individualized text messages, or one-to-one recruiting emails from Derek Huit or members of his team) is sent only to students who have affirmatively opted in by checking the optional "I'm open to learning about loan officer career opportunities" box at signup or who later request such contact. You may revoke this opt-in at any time by emailing ${SUPPORT_EMAIL} or replying to any recruiting message with "stop."` },
  { title: '7. Account Termination and Data Deletion', body: `You may delete your account at any time by emailing ${SUPPORT_EMAIL} from the email address on file. We will delete your account and personal information within thirty (30) days of receiving the request, except that we may retain limited records (including consent logs and aggregate analytics) where required by law or for legitimate operational purposes. ${COMPANY} may suspend or terminate your account if you violate these Terms, attempt to abuse the Platform, or engage in unlawful activity.` },
  { title: '8. Acceptable Use', body: `You agree not to (a) reverse engineer, decompile, or attempt to extract source code from the Platform; (b) use the Platform to violate any law, regulation, or third-party right; (c) upload unlawful, infringing, harassing, or malicious content; (d) share your account credentials with others or allow others to use your account; (e) use the Platform to issue, transmit, or imply any pre-approval, prequalification, commitment to lend, or other credit decision to any consumer; (f) misrepresent your licensure status, NMLS number, or affiliation; (g) interfere with the Platform's operation, security, or other users' access; or (h) scrape, mass-download, or systematically extract content from the Platform.` },
  { title: '9. Intellectual Property', body: `${COMPANY} and Derek Huit retain all right, title, and interest in and to the Platform, including the curriculum, the LO tools, all proprietary algorithms, and all related intellectual property. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Platform solely for your personal and professional educational purposes while your account is active. You may not resell, redistribute, sublicense, or create derivative works from Platform content without prior written permission. You retain ownership of any data you submit; you grant ${COMPANY} a license to use, process, store, and display such data solely to operate and improve the Platform.` },
  { title: '10. AI-Generated Content', body: `The Platform includes AI-generated lessons, coach responses, scripts, templates, and other automated outputs. AI output may be inaccurate, outdated, or inappropriate for your specific situation. You are solely responsible for verifying any AI-generated content before relying on it, especially in any context that affects a real consumer, a real loan file, or a regulated communication. ${COMPANY} disclaims all liability for AI output errors, omissions, or hallucinations.` },
  { title: '11. Third-Party Services', body: `The Platform may integrate with or link to third-party services (including, without limitation, email delivery, analytics, and authentication providers). Your use of any third-party service is governed by that party's own terms and privacy practices. ${COMPANY} is not responsible for the content, availability, accuracy, or practices of any third-party service.` },
  { title: '12. Disclaimers', body: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. CONTENT PRODUCED BY THE PLATFORM, INCLUDING AI-GENERATED OUTPUT, IS PROVIDED FOR REFERENCE AND EDUCATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE LEGAL, FINANCIAL, TAX, REGULATORY, LENDING, OR PROFESSIONAL ADVICE. YOU ARE SOLELY RESPONSIBLE FOR VERIFYING THE ACCURACY OF ANY OUTPUT BEFORE RELYING ON IT IN ANY CONSUMER-FACING OR REGULATED CONTEXT.` },
  { title: '13. Limitation of Liability', body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY.toUpperCase()}, ITS MEMBERS, OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST DATA, OR LOST OPPORTUNITY, ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. BECAUSE THE PLATFORM IS PROVIDED FREE OF CHARGE, OUR AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US$100).` },
  { title: '14. Indemnification', body: `You agree to indemnify, defend, and hold harmless ${COMPANY}, its members, officers, employees, agents, and affiliates from any claim, demand, loss, or liability (including reasonable fees) arising out of or relating to (a) your use of the Platform; (b) your content or your communications with any third party in connection with the Platform; (c) your violation of these Terms; or (d) your violation of any law or third-party right.` },
  { title: '15. Governing Law and Dispute Resolution', body: `These Terms are governed by the laws of the State of Alaska, without regard to conflict-of-law principles. Any dispute arising out of or relating to these Terms or the Platform will be resolved exclusively in the state or federal courts located in Anchorage, Alaska, and you consent to personal jurisdiction there. Nothing in these Terms waives any right that cannot be waived under applicable consumer protection law.` },
  { title: '16. Changes to These Terms', body: `We may update these Terms from time to time. Material changes will be posted on this page with a new effective date and, where required by law, communicated by email at least thirty (30) days before taking effect. Your continued use of the Platform after the new effective date constitutes acceptance of the updated Terms.` },
  { title: '17. Contact', body: `Questions about these Terms may be sent to ${SUPPORT_EMAIL}.` },
]

// ─── PRIVACY POLICY SECTIONS ─────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  { title: '1. Introduction', body: `This Privacy Policy explains how ${COMPANY} ("we," "us," or "our") collects, uses, discloses, and protects information when you use ${PRODUCT} (the "Platform") or interact with our websites, including ${WEBSITE}. By using the Platform, you consent to the practices described here.` },
  { title: '2. Information We Collect', body: `We collect: (a) information you provide directly, including your name, email address, account password (stored in cryptographic hash form only), NMLS number (optional), state-license selections (optional), explicit opt-in flag for recruiting communications (optional), and any content you enter into Platform tools; (b) information collected automatically when you use the Platform, including IP address, browser type, device identifiers, pages viewed, and timestamps; (c) information from authentication and email-delivery service providers acting on our behalf.

We do not collect Social Security numbers, payment-card numbers, or government-issued identifiers. The Platform is free; there is no payment surface that would require collecting such data.` },
  { title: '3. How We Use Information', body: `We use the information we collect to: (a) create and operate your account; (b) deliver the curriculum, AI Coach, and supplemental tools; (c) communicate with you about course content, new modules, and platform updates; (d) where you have explicitly opted in, contact you regarding loan officer career opportunities at Derek Huit's mortgage team; (e) detect, prevent, and respond to fraud, abuse, and security risks; (f) comply with legal obligations and enforce our Terms; (g) improve the Platform in aggregate, anonymized form.` },
  { title: '4. How We May Contact You', body: `We may communicate with you in the following ways:

(a) Service and Account Emails — Always Sent. Account creation confirmations, password resets, security notices, and similar transactional messages are sent regardless of marketing preferences. These cannot be unsubscribed because they are necessary for the operation of your account.

(b) Course Communications — Sent to All Students. Periodic emails about new modules, course updates, weekly nudges to continue your curriculum, and general team-wide announcements (such as open hiring rounds or hiring fairs addressed to the entire student audience). Every such email contains a one-click unsubscribe link. Unsubscribing does not affect your access to the curriculum.

(c) Personalized Recruiting Communications — Sent Only With Opt-In. Direct phone calls, individualized text messages, or one-to-one recruiting emails from Derek Huit or members of his team are sent only to students who have affirmatively checked the optional "I'm open to learning about loan officer career opportunities" box at signup, or who have submitted the contact form on the /careers page, or who have otherwise expressly invited such contact. You may revoke this opt-in at any time by emailing ${SUPPORT_EMAIL}, by replying to any recruiting message with "stop," or by adjusting your account settings.

We do not buy, sell, or rent contact lists. Our outreach is limited to people who have voluntarily registered an account on this Platform.` },
  { title: '5. Categories of Recipients', body: `We do not sell your personal information. We share information only with:

(a) Service Providers Acting on Our Behalf. We use third-party vendors under written contracts to host the Platform, deliver email, run analytics, and provide authentication. These vendors process your information solely for our benefit and are not permitted to use it for their own marketing purposes.

(b) Derek Huit Personally, in His Recruiting Capacity. ${COMPANY} is owned and operated by Derek Huit, a producing mortgage loan originator (NMLS #203980). Information collected through ${PRODUCT}, including but not limited to your name, email, NMLS number, state licensure, and the recruiting opt-in flag, may be made available to Derek Huit personally for the purpose of evaluating fit for his mortgage origination team. If you have opted in to recruiting outreach, this information may also be shared with members of his immediate hiring team for the same purpose. Information is not shared with any unrelated third-party recruiter, staffing agency, or external mortgage company.

(c) Legal Disclosures. We may disclose information if required by law, court order, subpoena, or other lawful process; to protect our rights, property, or safety, or those of our users; or to investigate fraud or violations of our Terms.

(d) Successors. If ${COMPANY} is involved in a merger, acquisition, financing, reorganization, or sale of assets, your information may be transferred to the successor entity, subject to a privacy policy at least as protective as this one.` },
  { title: '6. Cookies and Analytics', body: `We use cookies, local storage, and similar technologies to keep you logged in, remember preferences, analyze aggregate usage, and improve the Platform. You may control cookies and local storage through your browser settings; disabling them may limit Platform functionality.` },
  { title: '7. Data Security', body: `We implement reasonable administrative, technical, and physical safeguards designed to protect your information, including encryption in transit (TLS), password hashing using industry-standard algorithms, role-restricted database access, and audit logging. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.` },
  { title: '8. Data Retention', body: `We retain personal information for as long as your account is active and for up to thirty (30) days after deletion, except that we may retain consent records, audit logs, and aggregate analytics for longer periods where required by law or for legitimate operational purposes. Backups are retained for up to ninety (90) days.` },
  { title: '9. Your Rights', body: `Depending on where you live, you may have rights to: access, correct, delete, or receive a portable copy of your personal information; object to or restrict certain processing; withdraw consent (including recruiting opt-in); and not be discriminated against for exercising these rights. To exercise any right, email ${SUPPORT_EMAIL} from the email address associated with your account. We will respond within the time frame required by applicable law.` },
  { title: '10. California Privacy Rights (CCPA/CPRA)', body: `California residents have the right to know what personal information we collect, to request deletion, to correct inaccurate information, to opt out of "sale" or "sharing" of personal information for cross-context behavioral advertising, and to limit use of sensitive personal information. We do not sell personal information, and we do not share it for cross-context behavioral advertising. To exercise these rights, email ${SUPPORT_EMAIL}. You may designate an authorized agent to act on your behalf.` },
  { title: '11. CAN-SPAM and Telephone Communications', body: `Every commercial email we send includes the sender's identity, a physical mailing address for ${COMPANY}, and a one-click unsubscribe link. Unsubscribe requests are honored within ten (10) business days. Telephone calls and text messages from Derek Huit or members of his recruiting team are placed only to students who have opted in. You may revoke that opt-in any time by responding "stop" or emailing ${SUPPORT_EMAIL}.` },
  { title: '12. Children', body: `The Platform is not directed to children under 18, and we do not knowingly collect personal information from anyone under 18. If you believe we have collected information from a person under 18, contact ${SUPPORT_EMAIL} and we will delete it.` },
  { title: '13. International Users', body: `The Platform is operated from the United States. If you access it from outside the United States, you consent to the transfer of your information to, and processing in, the United States, which may have data protection laws different from those of your country.` },
  { title: '14. Changes to This Policy', body: `We may update this Privacy Policy from time to time. Material changes will be posted on this page with a new effective date and, where required by law, communicated by email.` },
  { title: '15. Contact', body: `For privacy questions or to exercise your rights, contact ${SUPPORT_EMAIL}. ${COMPANY} is operated by Derek Huit, NMLS #203980, in Anchorage, Alaska.` },
]

// ─── UI ──────────────────────────────────────────────────────────────────────
const S = {
  page: { background: '#0A0A0B', color: '#F1F5F9', minHeight: '100vh', padding: '48px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
  wrap: { maxWidth: 820, margin: '0 auto' },
  back: { color: '#94A3B8', fontSize: 13, textDecoration: 'none', marginBottom: 16, display: 'inline-block' },
  h1: { fontSize: 32, fontWeight: 900, margin: '8px 0 4px', lineHeight: 1.2 },
  effective: { color: '#94A3B8', fontSize: 13, marginBottom: 28 },
  tabs: { display: 'flex', gap: 4, background: '#111114', border: '1px solid #1E1E24', borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: (active: boolean) => ({
    flex: 1, padding: '10px 16px', background: active ? '#F5A623' : 'transparent',
    color: active ? '#0A0A0B' : '#CBD5E1', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44,
  }),
  section: { background: '#111114', border: '1px solid #1E1E24', borderRadius: 12, padding: '22px 24px', marginBottom: 14 },
  secTitle: { fontSize: 16, fontWeight: 700, color: '#F5A623', marginBottom: 10 },
  secBody: { fontSize: 14.5, lineHeight: 1.75, color: '#CBD5E1', whiteSpace: 'pre-wrap' as const },
  footer: { marginTop: 32, paddingTop: 24, borderTop: '1px solid #1E1E24', color: '#64748B', fontSize: 12, textAlign: 'center' as const },
}

export default function LegalPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'tos' | 'privacy'>(
    searchParams?.get('tab') === 'privacy' ? 'privacy' : 'tos'
  )
  useEffect(() => {
    const t = searchParams?.get('tab')
    if (t === 'privacy' || t === 'tos') setTab(t)
  }, [searchParams])

  const sections = tab === 'tos' ? TOS_SECTIONS : PRIVACY_SECTIONS

  return (
    <main style={S.page}>
      <div style={S.wrap}>
        <a href="/" style={S.back}>← Back</a>
        <h1 style={S.h1}>Terms of Service & Privacy Policy</h1>
        <p style={S.effective}>Effective {EFFECTIVE_DATE} · {PRODUCT}</p>
        <div style={S.tabs}>
          <button style={S.tab(tab === 'tos')} onClick={() => setTab('tos')}>Terms of Service</button>
          <button style={S.tab(tab === 'privacy')} onClick={() => setTab('privacy')}>Privacy Policy</button>
        </div>
        {sections.map((s) => (
          <div key={s.title} style={S.section}>
            <div style={S.secTitle}>{s.title}</div>
            <div style={S.secBody}>{s.body}</div>
          </div>
        ))}
        <div style={S.footer}>
          © 2026 {COMPANY} · Derek Huit · NMLS #203980 · Anchorage, AK · {SUPPORT_EMAIL}
        </div>
      </div>
    </main>
  )
}
