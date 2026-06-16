'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { curriculum, TIER_LABELS } from '../../lib/curriculum'

const STORAGE_KEY = 'hma_completed_modules'
function getCompleted(): number[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function Dashboard() {
  const [activeTier, setActiveTier] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])

  useEffect(() => { setCompleted(getCompleted()) }, [])

  const filtered = activeTier ? curriculum.filter(m => m.tier === activeTier) : curriculum
  const overallPct = Math.round((completed.length / curriculum.length) * 100)

  const tierStats = [1,2,3,4].map(t => {
    const mods = curriculum.filter(m => m.tier === t)
    const done = mods.filter(m => completed.includes(m.id)).length
    return { tier: t, total: mods.length, done, pct: Math.round((done / mods.length) * 100) }
  })

  const cert =
    completed.length === curriculum.length ? 'Graduate — HAMA-MP' :
    tierStats.slice(0,3).every(s => s.done === s.total) ? 'Advanced Practitioner' :
    tierStats.slice(0,2).every(s => s.done === s.total) ? 'Foundation Certificate' : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-900 font-bold">H</div>
          <span className="text-white font-semibold">Hive Mortgage Academy</span>
        </Link>
        <span className="text-slate-400 text-sm">{completed.length}/{curriculum.length} complete</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Progress banner */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Your Progress</h1>
              {cert ? (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-500">📜</span>
                  <span className="text-amber-700 font-semibold text-sm">{cert} Earned</span>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mt-0.5">{completed.length} of {curriculum.length} modules completed</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-slate-800">{overallPct}%</div>
              <div className="text-gray-400 text-xs">Overall</div>
            </div>
          </div>

          {/* Master progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {/* Tier breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {tierStats.map(s => (
              <div key={s.tier} className={`rounded-xl p-3 text-center border ${
                s.done === s.total
                  ? 'bg-green-50 border-green-200'
                  : s.done > 0
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`text-lg font-bold ${
                  s.done === s.total ? 'text-green-700' : s.done > 0 ? 'text-blue-700' : 'text-gray-400'
                }`}>
                  {s.done === s.total ? '✓' : `${s.done}/${s.total}`}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Tier {s.tier}</div>
                <div className="text-xs text-gray-400">{['100','200','300','400'][s.tier-1]}-Level</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActiveTier(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTier === null ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            All Tiers
          </button>
          {[1,2,3,4].map(t => {
            const s = tierStats[t-1]
            return (
              <button key={t} onClick={() => setActiveTier(activeTier === t ? null : t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTier === t ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {s.done === s.total && <span className="text-green-500 text-xs">✓</span>}
                Tier {t} — {['100','200','300','400'][t-1]}-Level
              </button>
            )
          })}
        </div>

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(mod => {
            const isComplete = completed.includes(mod.id)
            return (
              <Link key={mod.id} href={`/module/${mod.id}`}
                className={`bg-white border rounded-xl p-5 hover:shadow-md transition-all group relative overflow-hidden ${
                  isComplete ? 'border-green-200 hover:border-green-300' : 'border-gray-200 hover:border-slate-300'
                }`}>
                {isComplete && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xs font-bold">✓</span>
                  </div>
                )}
                <div className="flex items-start justify-between mb-3 pr-6">
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    mod.tier === 1 ? 'bg-blue-100 text-blue-700' :
                    mod.tier === 2 ? 'bg-green-100 text-green-700' :
                    mod.tier === 3 ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{mod.level}</div>
                  <span className="text-gray-400 text-xs">{mod.duration}</span>
                </div>
                <div className={`font-semibold mb-1 group-hover:text-slate-900 ${isComplete ? 'text-slate-700' : 'text-slate-800'}`}>
                  Module {mod.id}: {mod.title}
                </div>
                <div className="text-gray-500 text-sm mb-3">{mod.subtitle}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                    {isComplete ? '✓ Completed' : `${mod.lessons.length} lessons · ${mod.quiz.length} questions`}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-slate-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
