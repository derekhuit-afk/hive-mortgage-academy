'use client'
import Link from 'next/link'
import { useState } from 'react'

// ─── Email Capture Component ──────────────────────────────────────────────────
function EmailCapture({ source = 'homepage', dark = false }: { source?: string; dark?: boolean }) {
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
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${dark ? 'text-green-300' : 'text-green-700'}`}>
        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div>
          <div className="font-semibold">You're in — check your email!</div>
          <div className="text-sm opacity-80">The AI Prompt Pack is on its way.</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={`flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all ${
          dark
            ? 'bg-white/10 border border-white/20 text-white placeholder-white/50 focus:border-amber-400'
            : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-amber-400'
        }`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 bg-amber-400 text-slate-900 font-bold rounded-xl hover:bg-amber-300 disabled:opacity-60 transition-colors text-sm whitespace-nowrap"
      >
        {status === 'loading' ? 'Sending…' : 'Get Free Prompts →'}
      </button>
    </form>
  )
}

// ─── Use Case Pills ────────────────────────────────────────────────────────────
const AI_USES = [
  'Social Media Content', 'Borrower Milestones', 'Realtor Outreach',
  'Email & SMS Nurture', 'CRM Automation', 'Call Scripts',
  'Database Reactivation', 'Brand Visibility', 'Team SOPs',
]

// ─── Home Page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-900 font-black text-sm">H</div>
            <span className="text-white font-bold hidden sm:block">Hive Mortgage Academy</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">Programs</Link>
            <Link href="/ai" className="hover:text-white transition-colors flex items-center gap-1">
              AI Level 500
              <span className="text-[10px] bg-amber-400 text-slate-900 rounded px-1.5 py-0.5 font-bold ml-0.5">NEW</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:block text-sm text-slate-300 hover:text-white transition-colors">Browse Modules</Link>
            <Link href="/dashboard" className="bg-amber-400 text-slate-900 font-bold text-sm px-4 py-2 rounded-lg hover:bg-amber-300 transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            25 Modules · Four Tiers · AI Level 500
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
            The Mortgage Training Platform<br className="hidden md:block" />
            <span className="text-amber-400"> for LOs Who Are Done Playing Small.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            College-level origination curriculum from Mortgage 101 to 400-Level, plus the most practical AI Resource Center built specifically for producing loan officers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"
              className="bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors text-base">
              Start Free Today
            </Link>
            <Link href="/ai"
              className="border border-slate-600 text-slate-200 font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors text-base flex items-center gap-2 justify-center">
              Explore AI Level 500
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ─────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 px-6 py-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '25', label: 'College-Level Modules' },
            { value: '125+', label: 'Scenario-Based Quiz Questions' },
            { value: '4', label: 'Certificate Levels' },
            { value: 'AI 500', label: 'Resource Center Included' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PROBLEM ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-4">The Gap No One Talks About</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">
            Most mortgage training prepares you for the test, not the business.
          </h2>
          <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
            <p>You can pass your NMLS exam and still not know how to find your first borrower, what to say when a deal blows up at underwriting, or how to build a Realtor relationship that sends you 10 loans a year.</p>
            <p>Most training stops at product knowledge. Hive goes further — through applied origination, complex income analysis, branch management, and a full AI implementation system built for mortgage professionals.</p>
          </div>
        </div>
      </section>

      {/* ── TIERS ────────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3">Your Complete Training Path</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Four tiers. One system. Real results.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { tier: '100-Level', title: 'Mortgage Fundamentals', modules: 'Modules 1–6', desc: 'Licensing through your first purchase transaction.', color: 'blue', modules_count: 6 },
              { tier: '200-Level', title: 'Applied Origination', modules: 'Modules 7–12', desc: 'Assets, appraisal, workflow, market dynamics.', color: 'green', modules_count: 6 },
              { tier: '300-Level', title: 'Advanced Practice', modules: 'Modules 13–19', desc: 'Complex income, DSCR, fair lending, AI tools.', color: 'purple', modules_count: 7 },
              { tier: '400-Level', title: 'Expert & Leadership', modules: 'Modules 20–25', desc: 'MBS markets, branch management, ethics.', color: 'amber', modules_count: 6 },
            ].map(t => (
              <Link key={t.tier} href="/dashboard"
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-slate-300 transition-all group">
                <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block mb-3 ${
                  t.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                  t.color === 'green' ? 'bg-green-100 text-green-700' :
                  t.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{t.tier}</div>
                <div className="font-bold text-slate-800 mb-1 group-hover:text-slate-900">{t.title}</div>
                <div className="text-gray-400 text-xs mb-2">{t.modules}</div>
                <div className="text-gray-500 text-sm">{t.desc}</div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
              View All 25 Modules
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI TEASER ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 text-amber-300 text-sm font-bold mb-6">
            ★ AI Level 500 — New
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            AI isn't replacing loan officers.<br />
            <span className="text-amber-400">It's separating the ones who use it from the ones who don't.</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-10">
            The Hive AI Level 500 Resource Center gives you prompt libraries, workflow templates, communication scripts, and real use cases — built for mortgage professionals, not general marketers.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {AI_USES.map(u => (
              <span key={u} className="bg-white/5 border border-white/10 text-slate-300 text-sm px-3 py-1.5 rounded-full">
                {u}
              </span>
            ))}
          </div>
          <Link href="/ai"
            className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors">
            Explore the AI Resource Center
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-amber-500 text-sm font-bold uppercase tracking-wider mb-3">Find Your Path</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">Built for every stage of your mortgage career.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🎓', label: 'New Loan Officer',
                pain: 'You passed your exam but don\'t know how to build a pipeline.',
                outcome: 'Start closing with a structured system from day one.',
                path: 'Start with Module 1 →',
              },
              {
                icon: '📈', label: 'Active Producer',
                pain: 'You\'re busy, but your marketing is ad hoc and your pipeline is inconsistent.',
                outcome: 'Build referral systems and use AI to scale without working more hours.',
                path: 'Jump to Tier 3 →',
              },
              {
                icon: '🏢', label: 'Branch Manager',
                pain: 'Onboarding new LOs takes 12+ months and you have no scalable training system.',
                outcome: 'Build your team with a proven curriculum and AI-powered workflows.',
                path: 'Explore Tier 4 →',
              },
            ].map(c => (
              <div key={c.label} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="font-black text-slate-900 text-lg mb-3">{c.label}</div>
                <div className="text-gray-500 text-sm mb-4 leading-relaxed">{c.pain}</div>
                <div className="text-slate-700 text-sm font-medium mb-4 leading-relaxed">{c.outcome}</div>
                <Link href="/dashboard" className="text-amber-600 hover:text-amber-500 text-sm font-bold transition-colors">
                  {c.path}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEAD MAGNET ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-slate-900/60 text-sm font-bold uppercase tracking-wider mb-3">Free Download</div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
            Get the AI Prompt Pack for Loan Officers
          </h2>
          <p className="text-slate-800 text-lg mb-2">
            50+ ready-to-use prompts for marketing, borrower communication, Realtor outreach, and more.
          </p>
          <p className="text-slate-700 text-sm mb-8">No credit card. No sales call. Just the prompts.</p>
          <div className="flex justify-center">
            <EmailCapture source="homepage-leadmagnet" />
          </div>
          <p className="text-slate-700 text-xs mt-4">Join mortgage professionals who are already using AI to close more loans.</p>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Ready to build the mortgage business you actually want?
          </h2>
          <p className="text-slate-400 mb-8">No credit card required for base access. Start with Module 1 in the next 60 seconds.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard"
              className="bg-amber-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-amber-300 transition-colors">
              Start the Curriculum Free
            </Link>
            <Link href="/ai"
              className="border border-slate-600 text-slate-200 font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition-colors">
              Explore AI Level 500
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 py-8 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-amber-400 rounded flex items-center justify-center text-slate-900 font-black text-xs">H</div>
            <span className="text-slate-400 text-sm">Hive Mortgage Academy</span>
          </div>
          <div className="text-slate-500 text-xs text-center">
            Hive Mortgage Academy is an educational product of Huitai LLC. Educational content only — not a loan solicitation, offer to lend, or credit advice. Not affiliated with or endorsed by any lender, employer, or regulatory body. Verify all guidelines against current agency and investor requirements before applying them to a live file.
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Modules</Link>
            <Link href="/ai" className="hover:text-slate-300 transition-colors">AI Center</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
