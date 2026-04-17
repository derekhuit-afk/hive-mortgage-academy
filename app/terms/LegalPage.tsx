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
const COMPANY = 'Huit.AI, Inc.'
const WEBSITE = 'hivemortgageacademy.com'
const SUPPORT_EMAIL = 'legal@huit.ai'
const EFFECTIVE_DATE = 'April 17, 2026'

// ─── TERMS OF SERVICE SECTIONS ───────────────────────────────────────────────
const TOS_SECTIONS = [
  { title: '1. Acceptance of Terms', body: `By creating an account, accessing, or using ${PRODUCT} (the "Platform"), you ("User," "Subscriber," or "Customer") agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws. If you do not agree, you may not access or use the Platform.

These Terms form a legally binding agreement between you and ${COMPANY} ("Company," "we," "us," or "our"). If you are accepting on behalf of a company, you represent that you have the authority to bind that entity.` },
  { title: '2. Description of Services', body: `${PRODUCT} is a subscription software platform. We reserve the right to modify, suspend, or discontinue any portion of the Platform at any time with reasonable notice. Feature availability may vary by subscription tier.` },
  { title: '3. Eligibility and Account', body: `You must be at least 18 years of age to use the Platform. You agree that all registration information is truthful and accurate, that you will keep it current, and that you are responsible for maintaining the confidentiality of your credentials. You are responsible for all activity under your account.` },
  { title: '4. Subscription, Billing, and Auto-Renewal', body: `Access to the Platform requires a paid subscription. When you subscribe, you authorize ${COMPANY} to charge your payment method on a recurring basis at the rate and cadence (monthly or annual) disclosed at signup. Subscriptions automatically renew at the end of each billing period at the then-current rate unless you cancel before the renewal date. The charge amount, billing frequency, and cancellation method are disclosed on the pricing page and in the post-purchase confirmation email. We will notify you by email of any price change at least seven (7) days in advance. You may cancel at any time in your account settings; cancellation takes effect at the end of the then-current billing period, and no partial refunds are issued for unused time unless required by law.` },
  { title: '5. Free Trials and Promotional Pricing', body: `If the Platform is offered with a free trial or promotional rate, we will clearly disclose the duration, the date charges begin, the charge amount, and the cancellation method before you enroll. If the trial is thirty-one (31) days or longer, we will send you a reminder notice between three (3) and twenty-one (21) days before the trial converts to paid.` },
  { title: '6. Cancellation', body: `You may cancel your subscription online at any time through your account settings using the same medium you used to subscribe. Cancellation is immediate and effective at the end of the current billing period. We will confirm cancellation by email. We will not require you to speak with a representative, call a phone number, or complete any additional step beyond the online cancellation flow.` },
  { title: '7. Refunds', body: `Except as expressly stated or required by law, all fees are non-refundable. We do not provide refunds or credits for partial subscription periods or unused service.` },
  { title: '8. Acceptable Use', body: `You agree not to (a) reverse engineer, decompile, or attempt to extract source code from the Platform; (b) use the Platform to violate any law or third-party right; (c) upload unlawful, infringing, or malicious content; (d) share account credentials; (e) resell, sublicense, or provide Platform access to any third party; or (f) interfere with the Platform's operation or security.` },
  { title: '9. Intellectual Property', body: `${COMPANY} retains all right, title, and interest in and to the Platform, including all related intellectual property. Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Platform solely for your internal business purposes during your paid subscription. You retain ownership of any data you submit to the Platform; you grant us a license to use, process, store, and display such data solely to operate and improve the Platform and to provide services to you.` },
  { title: '10. Third-Party Services', body: `The Platform may integrate with third-party services. Your use of such services is governed by the third party's own terms and privacy practices. We are not responsible for any third-party service.` },
  { title: '11. Disclaimers', body: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. Content produced by the Platform, including AI-generated output, is provided for your reference only and does not constitute legal, financial, tax, regulatory, or professional advice. You are solely responsible for verifying the accuracy of any output before relying on it.` },
  { title: '12. Limitation of Liability', body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${COMPANY.toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS OR DATA. OUR AGGREGATE LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE AMOUNTS PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.` },
  { title: '13. Indemnification', body: `You agree to indemnify, defend, and hold harmless ${COMPANY} and its affiliates, officers, employees, and agents from any claim, loss, or liability arising from your use of the Platform, your content, or your violation of these Terms or any law.` },
  { title: '14. Governing Law and Dispute Resolution', body: `These Terms are governed by the laws of the State of Alaska, without regard to conflict-of-law principles. Any dispute arising out of or relating to these Terms will be resolved exclusively in the state or federal courts located in Anchorage, Alaska, and you consent to personal jurisdiction there. For consumer subscribers, nothing in these Terms waives rights that cannot be waived under applicable consumer protection law.` },
  { title: '15. Changes to Terms', body: `We may update these Terms from time to time. Material changes will be posted on this page with a new effective date and, where required by law, notified to you by email at least thirty (30) days before taking effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated Terms.` },
  { title: '16. Contact', body: `Questions about these Terms may be sent to ${SUPPORT_EMAIL}.` },
]

// ─── PRIVACY POLICY SECTIONS ─────────────────────────────────────────────────
const PRIVACY_SECTIONS = [
  { title: '1. Introduction', body: `This Privacy Policy explains how ${COMPANY} ("we," "us," or "our") collects, uses, discloses, and protects information when you use ${PRODUCT} (the "Platform") or interact with our websites, including ${WEBSITE}. By using the Platform, you consent to the practices described here.` },
  { title: '2. Information We Collect', body: `We collect: (a) information you provide directly, such as name, email, phone number, company, NMLS number (where applicable), billing address, and content you enter into the Platform; (b) information collected automatically, such as IP address, browser type, device identifiers, pages viewed, and interactions with the Platform; (c) information from third parties, such as payment processors and authentication providers.` },
  { title: '3. How We Use Information', body: `We use information to (a) provide, maintain, and improve the Platform; (b) process payments and manage subscriptions; (c) communicate with you, including service announcements, security notices, and — with your consent — marketing; (d) detect, prevent, and respond to fraud, abuse, and security risks; (e) comply with legal obligations; (f) with your consent, to train or improve our AI models (you may opt out).` },
  { title: '4. Legal Basis for Processing', body: `Where applicable law (including the GDPR) requires, we process personal data on the following bases: performance of the contract with you, compliance with legal obligations, our legitimate interests in operating and improving the Platform, and your consent where required.` },
  { title: '5. Sharing of Information', body: `We do not sell your personal information. We share information only with: (a) service providers acting on our behalf under written contracts (e.g., cloud hosting, payment processing, email delivery, customer support, analytics); (b) authorities when required by law, court order, or subpoena; (c) an acquirer, successor, or assignee in connection with a merger, acquisition, reorganization, or asset sale, subject to this Privacy Policy.` },
  { title: '6. Cookies and Analytics', body: `We use cookies and similar technologies to operate the Platform, remember preferences, analyze usage, and improve the service. You may control cookies through your browser. Disabling certain cookies may limit functionality.` },
  { title: '7. Data Security', body: `We implement reasonable administrative, technical, and physical safeguards designed to protect information, including encryption in transit (TLS) and at rest, access controls, and logging. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.` },
  { title: '8. Data Retention', body: `We retain personal information for as long as needed to provide the Platform, comply with legal obligations, resolve disputes, and enforce our agreements. We retain consent records for at least three (3) years or one (1) year after the end of your subscription, whichever is longer, as required by applicable law.` },
  { title: '9. Your Rights', body: `Depending on where you live, you may have rights to: access, correct, delete, or receive a portable copy of your personal information; object to or restrict certain processing; withdraw consent; opt out of sale or sharing for cross-context behavioral advertising; and not be discriminated against for exercising these rights. To exercise any right, contact ${SUPPORT_EMAIL}. We will respond within the time frame required by law.` },
  { title: '10. California Privacy Rights (CCPA/CPRA)', body: `California residents have the right to know what personal information we collect, to request deletion, to correct inaccurate information, to opt out of sale or sharing of personal information, and to limit use of sensitive personal information. We do not sell personal information. To exercise these rights, email ${SUPPORT_EMAIL}. You may designate an authorized agent to act on your behalf.` },
  { title: '11. Children', body: `The Platform is not directed to children under 18, and we do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, contact ${SUPPORT_EMAIL} and we will delete it.` },
  { title: '12. International Users', body: `The Platform is operated from the United States. If you access it from outside the United States, you consent to the transfer of your information to, and processing in, the United States, which may have data protection laws different from your country.` },
  { title: '13. Changes to this Policy', body: `We may update this Privacy Policy from time to time. Material changes will be posted on this page with a new effective date and, where required by law, communicated by email.` },
  { title: '14. Contact', body: `For privacy questions or to exercise your rights, contact ${SUPPORT_EMAIL}.` },
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
          © 2026 {COMPANY} · Derek Huit, Founder &amp; CEO · NMLS #203980 · {SUPPORT_EMAIL}
        </div>
      </div>
    </main>
  )
}
