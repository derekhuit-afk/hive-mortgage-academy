'use client'
import Link from 'next/link'
import { useState } from 'react'

function EmailCapture({ source = 'ai-page' }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch { setStatus('error') }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 text-green-300">
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <div className="font-semibold text-white">You're in — check your email!</div>
          <div className="text-sm text-slate-300">The AI Prompt Pack is on its way.</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com" required
        className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-amber-400 outline-none transition-all"
      />
      <button type="submit" disabled={status === 'loading'}
        className="px-6 py-3 bg-amber-400 text-slate-900 font-bold rounded-xl hover:bg-amber-300 disabled:opacity-60 transition-colors text-sm whitespace-nowrap">
        {status === 'loading' ? 'Sending…' : 'Get Free Prompts →'}
      </button>
    </form>
  )
}

const MODULES = [
  { id: 'AI-501', title: 'AI for Mortgage Marketing Strategy', icon: '📣', color: 'blue',
    desc: 'Build a systematic content and lead strategy using AI as your marketing engine.' },
  { id: 'AI-502', title: 'AI for Social Media Content Creation', icon: '📱', color: 'blue',
    desc: 'Create 30 days of compliant, engaging mortgage content in under 2 hours.' },
  { id: 'AI-503', title: 'AI for Email and SMS Nurture Sequences', icon: '✉️', color: 'green',
    desc: 'Build automated nurture campaigns that keep your pipeline warm without constant effort.' },
  { id: 'AI-504', title: 'AI for Borrower Milestone Communication', icon: '🏠', color: 'green',
    desc: 'Draft professional, personalized messages for every stage of the loan lifecycle.' },
  { id: 'AI-505', title: 'AI for Realtor and Referral Partner Outreach', icon: '🤝', color: 'green',
    desc: 'Build the Realtor relationships that generate consistent inbound referrals.' },
  { id: 'AI-506', title: 'AI for Scripting Calls and Consultations', icon: '📞', color: 'purple',
    desc: 'Enter every conversation prepared — pre-qualification, hard news, Realtor intro.' },
  { id: 'AI-507', title: 'AI for FAQ Response Drafting', icon: '💬', color: 'purple',
    desc: 'Create borrower-education content that answers the questions before they\'re asked.' },
  { id: 'AI-508', title: 'AI for CRM Automation Support', icon: '⚙️', color: 'purple',
    desc: 'Design workflows that keep your pipeline organized without manual effort.' },
  { id: 'AI-509', title: 'AI for Meeting Summaries and Recaps', icon: '📝', color: 'amber',
    desc: 'Turn every call and meeting into a clear, actionable next-step document.' },
  { id: 'AI-510', title: 'AI for Database Reactivation Campaigns', icon: '🔄', color: 'amber',
    desc: 'Mine your past-client list for immediate revenue with done-for-you campaigns.' },
  { id: 'AI-511', title: 'AI for Personal Brand and Search Visibility', icon: '🌐', color: 'amber',
    desc: 'Build a discoverable online presence that brings borrowers and partners to you.' },
  { id: 'AI-512', title: 'AI for Team SOPs and Internal Knowledge', icon: '📋', color: 'amber',
    desc: 'Create the systems that let your team run consistently without you doing everything.' },
]

const SAMPLE_PROMPTS = [
  {
    label: 'Rate Commentary Post',
    prompt: '"Write a 3-paragraph social media post explaining why mortgage rates moved [UP/DOWN] this week. Explain it in plain English for first-time buyers. Do not make predictions about future rates. Include a call-to-action asking readers to reach out if they want to know what this means for their specific situation. Tone: confident, clear, educational."',
  },
  {
    label: 'Pre-Approval Congratulations Email',
    prompt: '"Write a short congratulations email to a borrower who was just pre-approved for a mortgage. Include: what happens next, a note about keeping their finances stable, and an invitation to ask questions. Tone: warm, professional, reassuring. Max 150 words."',
  },
  {
    label: 'Realtor Introduction Text',
    prompt: '"Write a text message I can send to a real estate agent I met at a networking event. I want to offer to be a resource for their clients — not ask for referrals directly. Keep it under 60 words. Tone: professional, low-pressure, memorable."',
  },
  {
    label: 'Clear to Close Message',
    prompt: '"Write a brief, exciting message to send to a borrower who just received their Clear to Close. Include: the CTC milestone, a reminder about wire fraud verification, what to bring to closing, and a genuine note about how excited you are for them. Warm and clear."',
  },
  {
    label: 'Database Reactivation Email',
    prompt: '"Write a short email to a past client I closed 2 years ago. I want to check in, mention that home values have likely changed since we worked together, and offer a free equity review call. No pressure, genuine tone. Subject line included. Max 120 words."',
  },
]

const TIER_COMPARE = [
  { feature: 'Prompt Library (50+ prompts)', free: true, premium: true },
  { feature: 'AI Marketing Module (AI-501)', free: true, premium: true },
  { feature: 'AI Communication Module (AI-504)', free: true, premium: true },
  { feature: 'Full AI 501–512 Module Library', free: false, premium: true },
  { feature: 'Done-for-You Templates (40+)', free: false, premium: true },
  { feature: 'Database Reactivation Campaign Kit', free: false, premium: true },
  { feature: 'Realtor Outreach Sequence (6 touches)', free: false, premium: true },
  { feature: 'Content Calendar Template (Notion)', free: false, premium: true },
  { feature: 'Group Coaching Calls', free: false, premium: true },
  { feature: 'Private Community Access', free: false, premium: true },
]

export default function AIPage() {
  const [activePrompt, setActivePrompt] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-900 font-black text-sm">H</div>
            <span className="text-white font-bold hidden sm:block">Hive Mortgage Academy</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Programs</Link>
            <span className="text-amber-400 font-semibold">AI Level 500</span>
          </div>
          <Link href="/dashboard" className="bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-20 md:py-28 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-sm font-bold mb-6">
            ★ AI Level 500 Resource Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
            AI for Mortgage Professionals.<br />
            <span className="text-amber-400">Practical. Specific. Compliant.</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            12 implementation modules, 50+ ready-to-use prompts, and done-for-you templates for marketing, client communication, Realtor outreach, and CRM automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#get-prompts"
              className="bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors">
              Get the Free Prompt Pack
            </a>
            <a href="#modules"
              className="border border-slate-600 text-slate-200 font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
              Browse All 12 Modules
            </a>
          </div>
        </div>
      </section>

      {/* ── WHAT THIS IS NOT ────────────────────────────────────────────────── */}
      <section className="bg-slate-800 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { not: '❌ Not theory or hype', is: '✓ Real prompts you use today' },
              { not: '❌ Not generic ChatGPT tips', is: '✓ Mortgage-specific, compliance-aware' },
              { not: '❌ Not a replacement for your judgment', is: '✓ AI drafts. You review. You send.' },
            ].map(item => (
              <div key={item.not} className="text-center">
                <div className="text-slate-400 text-sm mb-1">{item.not}</div>
                <div className="text-amber-300 font-semibold text-sm">{item.is}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES GRID ────────────────────────────────────────────────────── */}
      <section id="modules" className="px-6 py-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3">12 Implementation Modules</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Every way AI makes you a better loan officer.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MODULES.map(m => (
              <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                      m.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      m.color === 'green' ? 'bg-green-100 text-green-700' :
                      m.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{m.id}</div>
                    <div className="font-bold text-slate-800 text-sm leading-snug">{m.title}</div>
                  </div>
                </div>
                <div className="text-gray-500 text-sm leading-relaxed">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMPT LIBRARY PREVIEW ──────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-3">Prompt Library Preview</div>
            <h2 className="text-3xl font-black text-white mb-3">Real prompts. Ready to copy and use.</h2>
            <p className="text-slate-400">Here's a sample from the 50+ prompts in the free pack.</p>
          </div>

          {/* Tab selector */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {SAMPLE_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => setActivePrompt(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activePrompt === i
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Active prompt */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-amber-400 font-bold text-sm">{SAMPLE_PROMPTS[activePrompt].label}</div>
              <button
                onClick={() => navigator.clipboard?.writeText(SAMPLE_PROMPTS[activePrompt].prompt.replace(/"/g, ''))}
                className="text-slate-400 hover:text-white text-xs border border-white/10 rounded px-2 py-1 transition-colors">
                Copy
              </button>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed font-mono">
              {SAMPLE_PROMPTS[activePrompt].prompt}
            </p>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            The free pack includes 50+ prompts across all 12 use case categories.
          </p>
        </div>
      </section>

      {/* ── FREE VS PREMIUM ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-3">Start free. Go deeper when you're ready.</h2>
          </div>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-slate-900 px-6 py-3">
              <div className="text-slate-400 text-xs font-bold uppercase">Feature</div>
              <div className="text-center text-slate-300 text-xs font-bold uppercase">Free</div>
              <div className="text-center text-amber-400 text-xs font-bold uppercase">Premium</div>
            </div>
            {TIER_COMPARE.map((row, i) => (
              <div key={row.feature} className={`grid grid-cols-3 px-6 py-3 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="text-slate-700 text-sm">{row.feature}</div>
                <div className="text-center text-lg">{row.free ? '✓' : '—'}</div>
                <div className="text-center text-lg">{row.premium ? '✓' : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE COMPLIANCE NOTE ─────────────────────────────────────────────── */}
      <section className="px-6 py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-blue-800 text-sm font-semibold mb-1">How Hive Thinks About AI</div>
            <div className="text-blue-600 text-sm">
              AI drafts. You review. You send. Every prompt in the Hive library is designed to assist your expertise — not replace it. All content should be reviewed for accuracy and compliance with Reg Z, RESPA, ECOA, and Fair Housing before use or publication.
            </div>
          </div>
        </div>
      </section>

      {/* ── LEAD MAGNET ─────────────────────────────────────────────────────── */}
      <section id="get-prompts" className="bg-slate-900 px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-amber-400 text-sm font-bold uppercase tracking-wider mb-3">Free Download</div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Get the AI Prompt Pack — Free
          </h2>
          <p className="text-slate-300 text-lg mb-2">
            50+ ready-to-use prompts for mortgage marketing, borrower communication, Realtor outreach, and more.
          </p>
          <p className="text-slate-400 text-sm mb-8">No credit card. No sales call. Just the prompts.</p>
          <EmailCapture source="ai-page-leadmagnet" />
          <p className="text-slate-600 text-xs mt-4">Join mortgage professionals already using AI to close more loans.</p>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-3">
            Start with the AI Prompt Pack.<br />Go deeper when you're ready.
          </h2>
          <p className="text-slate-800 mb-8">The full AI 500 library, templates, and community are waiting.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#get-prompts" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
              Get the Free Prompt Pack
            </a>
            <Link href="/dashboard" className="border-2 border-slate-900 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-900/10 transition-colors">
              Browse the Curriculum
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 py-8 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center text-slate-900 font-black text-xs">H</div>
            <span className="text-slate-400 text-sm">Hive Mortgage Academy</span>
          </Link>
          <div className="text-slate-500 text-xs text-center">
            Hive Mortgage Academy is an educational product of Huitai LLC. Educational content only — not a loan solicitation, offer to lend, or credit advice. Not affiliated with or endorsed by any lender, employer, or regulatory body. Verify all guidelines against current agency and investor requirements before applying them to a live file.
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Modules</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
