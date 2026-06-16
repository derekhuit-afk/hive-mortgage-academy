import Link from 'next/link'
import { curriculum, TIER_LABELS } from '../lib/curriculum'

const TIER_COLORS: Record<number, string> = {
  1: 'bg-blue-50 border-blue-200 text-blue-800',
  2: 'bg-green-50 border-green-200 text-green-800',
  3: 'bg-purple-50 border-purple-200 text-purple-800',
  4: 'bg-amber-50 border-amber-200 text-amber-800',
}
const TIER_ACCENT: Record<number, string> = {
  1: 'bg-blue-600', 2: 'bg-green-600', 3: 'bg-purple-600', 4: 'bg-amber-600',
}

export default function Home() {
  const tiers = [1, 2, 3, 4]
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center text-slate-900 font-bold text-lg">H</div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">Hive Mortgage Academy</div>
            <div className="text-slate-400 text-xs">Professional Mortgage Training</div>
          </div>
        </div>
        <div className="text-slate-300 text-sm">25 Modules · 4 Tiers · 100–400 Level</div>
      </header>

      {/* Hero */}
      <div className="px-6 py-12 text-center max-w-3xl mx-auto">
        <div className="inline-block bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1 text-amber-300 text-sm font-medium mb-4">
          College-Level Mortgage Training
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          From Mortgage 101<br />to Mortgage 400-Level
        </h1>
        <p className="text-slate-300 text-lg mb-8">
          25 comprehensive modules covering every dimension of professional mortgage origination — from licensing fundamentals to expert market analysis and branch leadership.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/dashboard" className="bg-amber-400 text-slate-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-300 transition-colors">
            Start Learning
          </Link>
          <Link href="/dashboard" className="border border-slate-600 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-700 transition-colors">
            View All Modules
          </Link>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {tiers.map(tier => {
            const mods = curriculum.filter(m => m.tier === tier)
            const label = TIER_LABELS[tier]
            return (
              <div key={tier} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 ${TIER_ACCENT[tier]} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                    {tier}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{label.split('—')[0].trim()}</div>
                    <div className="text-slate-400 text-xs">{label.split('—')[1]?.trim()}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {mods.map(m => (
                    <Link key={m.id} href={`/module/${m.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors group">
                      <div className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center text-xs text-slate-400 flex-shrink-0 font-mono">
                        {m.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-200 text-sm font-medium truncate">{m.title}</div>
                        <div className="text-slate-500 text-xs">{m.level} · {m.duration}</div>
                      </div>
                      <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Link href={`/dashboard?tier=${tier}`} className="text-amber-400 text-sm hover:text-amber-300 font-medium">
                    View Tier {tier} →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Modules', value: '25' },
            { label: 'Tiers', value: '4' },
            { label: 'Quiz Questions', value: '125+' },
            { label: 'Total Duration', value: '~27 hrs' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
