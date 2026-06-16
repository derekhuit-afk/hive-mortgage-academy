'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { curriculum } from '../../../lib/curriculum'

// ─── localStorage helpers ────────────────────────────────────────────────────
const STORAGE_KEY = 'hma_completed_modules'

function getCompleted(): number[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function markCompleted(id: number): number[] {
  const prev = getCompleted()
  if (prev.includes(id)) return prev
  const next = [...prev, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

// ─── Render markdown-ish content ─────────────────────────────────────────────
function renderContent(text: string) {
  return text.split('\\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="mb-1" />
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
    if (line.startsWith('**') && line.endsWith('**') && (line.match(/\*\*/g) || []).length === 2) {
      return <h4 key={i} className="font-bold text-slate-800 text-base mt-5 mb-2" dangerouslySetInnerHTML={{ __html: bold }} />
    }
    return <p key={i} className="text-gray-700 leading-relaxed mb-2 text-[15px]" dangerouslySetInnerHTML={{ __html: bold }} />
  })
}

// ─── Tier badge colours ───────────────────────────────────────────────────────
const TIER_PILL: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-purple-100 text-purple-700',
  4: 'bg-amber-100 text-amber-700',
}
const TIER_RING: Record<number, string> = {
  1: 'ring-blue-400',
  2: 'ring-green-400',
  3: 'ring-purple-400',
  4: 'ring-amber-400',
}

// ─── Congratulations overlay ──────────────────────────────────────────────────
function CongratsScreen({
  mod, score, total, completedList, onClose, nextMod,
}: {
  mod: (typeof curriculum)[0]
  score: number
  total: number
  completedList: number[]
  onClose: () => void
  nextMod: (typeof curriculum)[0] | undefined
}) {
  const pct = Math.round((score / total) * 100)
  const overallPct = Math.round((completedList.length / curriculum.length) * 100)

  // Which tiers are fully done?
  const tierDone = [1,2,3,4].filter(t =>
    curriculum.filter(m => m.tier === t).every(m => completedList.includes(m.id))
  )
  const justFinishedTier = tierDone.includes(mod.tier) &&
    curriculum.filter(m => m.tier === mod.tier).at(-1)?.id === mod.id

  // Certificate label
  const cert =
    completedList.length === curriculum.length ? 'Graduate — HAMA-MP' :
    tierDone.includes(3) && tierDone.includes(2) && tierDone.includes(1) ? 'Advanced Practitioner' :
    tierDone.includes(2) && tierDone.includes(1) ? 'Foundation Certificate' : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* Top banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 px-8 pt-8 pb-6 text-center relative">
          {/* Trophy */}
          <div className="text-6xl mb-3">🏆</div>
          <div className="text-white text-2xl font-bold mb-1">Module {mod.id} Complete!</div>
          <div className="text-slate-300 text-sm">{mod.title}</div>

          {/* Badge */}
          <div className={`inline-flex items-center gap-2 mt-4 bg-white/10 border border-white/20 rounded-full px-4 py-1.5`}>
            <span className="text-amber-300 text-base">★</span>
            <span className="text-white text-xs font-semibold tracking-wide">{mod.badge}</span>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">

          {/* Score row */}
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-slate-800">{pct}%</div>
              <div className="text-gray-400 text-xs mt-0.5">Quiz Score</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-slate-800">{score}/{total}</div>
              <div className="text-gray-400 text-xs mt-0.5">Correct</div>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-slate-800">{completedList.length}/{curriculum.length}</div>
              <div className="text-gray-400 text-xs mt-0.5">Modules Done</div>
            </div>
          </div>

          {/* Overall progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Curriculum Progress</span>
              <span className="text-sm font-bold text-slate-800">{overallPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {[1,2,3,4].map(t => {
                const tMods = curriculum.filter(m => m.tier === t)
                const tDone = tMods.filter(m => completedList.includes(m.id)).length
                const tComplete = tDone === tMods.length
                return (
                  <div key={t} className="text-center">
                    <div className={`text-[10px] font-medium ${tComplete ? 'text-amber-600' : tDone > 0 ? 'text-blue-500' : 'text-gray-300'}`}>
                      {tComplete ? '✓' : `${tDone}/${tMods.length}`}
                    </div>
                    <div className="text-[9px] text-gray-400">T{t}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tier completion announcement */}
          {justFinishedTier && (
            <div className={`rounded-xl p-3 border text-center ${
              mod.tier === 1 ? 'bg-blue-50 border-blue-200' :
              mod.tier === 2 ? 'bg-green-50 border-green-200' :
              mod.tier === 3 ? 'bg-purple-50 border-purple-200' :
              'bg-amber-50 border-amber-200'
            }`}>
              <div className="text-lg mb-0.5">🎖️</div>
              <div className={`font-bold text-sm ${
                mod.tier === 1 ? 'text-blue-700' :
                mod.tier === 2 ? 'text-green-700' :
                mod.tier === 3 ? 'text-purple-700' : 'text-amber-700'
              }`}>
                Tier {mod.tier} Complete — {['100','200','300','400'][mod.tier-1]}-Level Mastery Unlocked
              </div>
            </div>
          )}

          {/* Certificate */}
          {cert && (
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-3 flex items-center gap-3">
              <div className="text-2xl">📜</div>
              <div>
                <div className="text-amber-800 font-bold text-sm">{cert}</div>
                <div className="text-amber-600 text-xs">Certificate earned</div>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Stay Here
            </button>
            {nextMod ? (
              <Link href={`/module/${nextMod.id}`}
                className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors text-center text-sm">
                Module {nextMod.id} →
              </Link>
            ) : (
              <Link href="/dashboard"
                className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-400 transition-colors text-center text-sm">
                View Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ModulePage({ params }: { params: { id: string } }) {
  const mod = curriculum.find(m => m.id === parseInt(params.id))
  const [activeLesson, setActiveLesson] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [completedList, setCompletedList] = useState<number[]>([])

  useEffect(() => { setCompletedList(getCompleted()) }, [])

  if (!mod) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">404</div>
        <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to modules</Link>
      </div>
    </div>
  )

  const prevMod = curriculum.find(m => m.id === mod.id - 1)
  const nextMod = curriculum.find(m => m.id === mod.id + 1)
  const lesson = mod.lessons[activeLesson]
  const score = submitted ? mod.quiz.filter((q, i) => answers[i] === q.correct).length : 0
  const pct = submitted ? Math.round((score / mod.quiz.length) * 100) : 0
  const passed = submitted && pct >= 80

  function handleSubmit() {
    setSubmitted(true)
    const s = mod!.quiz.filter((q, i) => answers[i] === q.correct).length
    const p = Math.round((s / mod!.quiz.length) * 100)
    if (p >= 80) {
      const updated = markCompleted(mod!.id)
      setCompletedList(updated)
      setTimeout(() => setShowCongrats(true), 400)
    }
  }

  const isCompleted = completedList.includes(mod.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Congrats overlay */}
      {showCongrats && (
        <CongratsScreen
          mod={mod}
          score={score}
          total={mod.quiz.length}
          completedList={completedList}
          onClose={() => setShowCongrats(false)}
          nextMod={nextMod}
        />
      )}

      {/* Nav */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          All Modules
        </Link>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2 py-0.5 font-medium">
              ✓ Completed
            </span>
          )}
          <span className="text-slate-400 text-sm">
            {completedList.length}/{curriculum.length} modules done
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TIER_PILL[mod.tier]}`}>{mod.level}</span>
            <span className="text-gray-400 text-sm">{mod.duration}</span>
            {isCompleted && <span className="text-xs text-green-600 font-medium">✓ Passed</span>}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Module {mod.id}: {mod.title}</h1>
          <p className="text-gray-500 text-lg mb-4">{mod.subtitle}</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-gray-700 mb-2">Learning Objectives</div>
            <ul className="space-y-1">
              {mod.objectives.map((o, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lessons</div>
              <div className="space-y-1">
                {mod.lessons.map((l, i) => (
                  <button key={l.id} onClick={() => { setActiveLesson(i); setShowQuiz(false) }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeLesson === i && !showQuiz
                        ? 'bg-slate-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    <div className="font-medium truncate">{l.title}</div>
                    <div className={`text-xs ${activeLesson === i && !showQuiz ? 'text-slate-300' : 'text-gray-400'}`}>{l.duration}</div>
                  </button>
                ))}
                <button onClick={() => setShowQuiz(true)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mt-2 ${
                    showQuiz
                      ? 'bg-amber-500 text-white'
                      : isCompleted
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                  }`}>
                  <div className="font-medium">{isCompleted ? '✓ Quiz Passed' : 'Module Quiz'}</div>
                  <div className={`text-xs ${showQuiz ? 'text-amber-100' : isCompleted ? 'text-green-500' : 'text-amber-500'}`}>
                    {mod.quiz.length} questions
                  </div>
                </button>
              </div>

              {/* Mini progress */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-400 mb-1.5">Your Progress</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((completedList.length / curriculum.length) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">{completedList.length} / {curriculum.length} complete</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!showQuiz ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
                  <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{lesson.duration}</span>
                </div>
                <div>{renderContent(lesson.content)}</div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <button onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
                    disabled={activeLesson === 0}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    ← Previous
                  </button>
                  {activeLesson < mod.lessons.length - 1 ? (
                    <button onClick={() => setActiveLesson(activeLesson + 1)}
                      className="px-5 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
                      Next Lesson →
                    </button>
                  ) : (
                    <button onClick={() => setShowQuiz(true)}
                      className="px-5 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors font-medium">
                      Take Quiz →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Module {mod.id} Quiz</h2>
                  {isCompleted && !submitted && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1 font-medium">
                      ✓ Previously passed
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-6">{mod.quiz.length} questions · 80% to pass · Select the best answer</p>

                {/* Score banner after submit */}
                {submitted && (
                  <div className={`mb-8 p-5 rounded-2xl border-2 text-center ${
                    passed
                      ? 'bg-green-50 border-green-300'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className={`text-4xl font-bold mb-1 ${passed ? 'text-green-700' : 'text-amber-700'}`}>
                      {pct}%
                    </div>
                    <div className={`font-semibold ${passed ? 'text-green-700' : 'text-amber-700'}`}>
                      {passed ? '🎉 Quiz Passed!' : 'Not quite — review the lessons and try again'}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">{score} of {mod.quiz.length} correct</div>
                    {passed && (
                      <button onClick={() => setShowCongrats(true)}
                        className="mt-3 text-sm text-green-700 underline hover:no-underline">
                        View completion details
                      </button>
                    )}
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-8">
                  {mod.quiz.map((q, qi) => (
                    <div key={qi}>
                      <div className="font-semibold text-gray-800 mb-3 leading-snug">
                        <span className="text-gray-400 mr-2 font-normal">{qi + 1}.</span>{q.question}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isSelected = answers[qi] === oi
                          const isCorrect = submitted && oi === q.correct
                          const isWrong = submitted && isSelected && oi !== q.correct
                          return (
                            <button key={oi}
                              onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 transition-all ${
                                isCorrect
                                  ? 'bg-green-50 border-green-400 text-green-800 font-medium'
                                  : isWrong
                                  ? 'bg-red-50 border-red-300 text-red-700 line-through opacity-70'
                                  : isSelected
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-slate-300 hover:bg-gray-100'
                              } ${!submitted ? 'cursor-pointer' : 'cursor-default'}`}>
                              <span className={`font-mono text-xs mr-2 ${isSelected && !submitted ? 'text-slate-300' : 'text-gray-400'}`}>
                                {String.fromCharCode(65 + oi)}.
                              </span>
                              {opt}
                              {isCorrect && <span className="ml-2">✓</span>}
                              {isWrong && <span className="ml-2 text-red-400 no-underline" style={{textDecoration:'none'}}>✗</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit / Retry */}
                {!submitted ? (
                  <button onClick={handleSubmit}
                    disabled={Object.keys(answers).length < mod.quiz.length}
                    className="mt-10 w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Submit Answers
                    <span className="ml-2 text-slate-400 font-normal text-sm">
                      ({Object.keys(answers).length}/{mod.quiz.length} answered)
                    </span>
                  </button>
                ) : (
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { setSubmitted(false); setAnswers({}) }}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                      Retake Quiz
                    </button>
                    {passed && nextMod && (
                      <Link href={`/module/${nextMod.id}`}
                        className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-400 transition-colors text-center">
                        Module {nextMod.id} →
                      </Link>
                    )}
                    {!nextMod && passed && (
                      <Link href="/dashboard"
                        className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-400 transition-colors text-center">
                        Dashboard
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Prev / Next module nav */}
            <div className="flex items-center justify-between mt-4">
              {prevMod ? (
                <Link href={`/module/${prevMod.id}`} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                  Module {prevMod.id}
                </Link>
              ) : <div />}
              {nextMod ? (
                <Link href={`/module/${nextMod.id}`} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-sm transition-colors">
                  Module {nextMod.id}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
