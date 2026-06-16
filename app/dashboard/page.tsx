'use client'
import Link from 'next/link'
import { useState } from 'react'
import { curriculum, TIER_LABELS } from '../../lib/curriculum'

const TIER_COLORS: Record<number, string> = {
  1: 'blue', 2: 'green', 3: 'purple', 4: 'amber',
}

export default function Dashboard() {
  const [activeTier, setActiveTier] = useState<number | null>(null)
  const filtered = activeTier ? curriculum.filter(m => m.tier === activeTier) : curriculum

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center text-slate-900 font-bold">H</div>
          <span className="text-white font-semibold">Hive Mortgage Academy</span>
        </Link>
        <span className="text-slate-400 text-sm">All Modules</span>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Module Library</h1>
          <p className="text-gray-500">25 modules across four college-level tiers</p>
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button onClick={() => setActiveTier(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTier === null ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            All Tiers
          </button>
          {[1,2,3,4].map(t => (
            <button key={t} onClick={() => setActiveTier(activeTier === t ? null : t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTier === t ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              Tier {t} — {['100','200','300','400'][t-1]}-Level
            </button>
          ))}
        </div>

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(mod => (
            <Link key={mod.id} href={`/module/${mod.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  mod.tier === 1 ? 'bg-blue-100 text-blue-700' :
                  mod.tier === 2 ? 'bg-green-100 text-green-700' :
                  mod.tier === 3 ? 'bg-purple-100 text-purple-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {mod.level}
                </div>
                <span className="text-gray-400 text-xs">{mod.duration}</span>
              </div>
              <div className="text-slate-800 font-semibold mb-1 group-hover:text-slate-900">
                Module {mod.id}: {mod.title}
              </div>
              <div className="text-gray-500 text-sm mb-3">{mod.subtitle}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{mod.lessons.length} lessons · {mod.quiz.length} quiz questions</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
