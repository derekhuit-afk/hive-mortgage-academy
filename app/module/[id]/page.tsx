'use client'
import { useState } from 'react'
import Link from 'next/link'
import { curriculum } from '../../../lib/curriculum'

function renderContent(text: string) {
  const lines = text.split('\\n')
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <h4 key={i} className="font-semibold text-slate-800 mt-4 mb-2">{line.slice(2,-2)}</h4>
    }
    if (line.startsWith('**')) {
      const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className="text-gray-700 leading-relaxed mb-2" dangerouslySetInnerHTML={{__html: processed}} />
    }
    if (line.trim() === '') return <div key={i} className="mb-2" />
    return <p key={i} className="text-gray-700 leading-relaxed mb-2">{line}</p>
  })
}

export default function ModulePage({ params }: { params: { id: string } }) {
  const mod = curriculum.find(m => m.id === parseInt(params.id))
  const [activeLesson, setActiveLesson] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

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

  const tierBadgeClass = mod.tier === 1 ? 'bg-blue-100 text-blue-700' :
    mod.tier === 2 ? 'bg-green-100 text-green-700' :
    mod.tier === 3 ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
          All Modules
        </Link>
        <div className="text-slate-400 text-sm">Module {mod.id} of {curriculum.length}</div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tierBadgeClass}`}>{mod.level}</span>
            <span className="text-gray-400 text-sm">{mod.duration}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Module {mod.id}: {mod.title}</h1>
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
                  <button key={l.id} onClick={() => { setActiveLesson(i); setShowQuiz(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeLesson === i && !showQuiz ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <div className="font-medium truncate">{l.title}</div>
                    <div className={`text-xs ${activeLesson === i && !showQuiz ? 'text-slate-300' : 'text-gray-400'}`}>{l.duration}</div>
                  </button>
                ))}
                <button onClick={() => setShowQuiz(true)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mt-2 ${showQuiz ? 'bg-amber-500 text-white' : 'border border-amber-200 text-amber-700 hover:bg-amber-50'}`}>
                  <div className="font-medium">Module Quiz</div>
                  <div className={`text-xs ${showQuiz ? 'text-amber-100' : 'text-amber-500'}`}>{mod.quiz.length} questions</div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!showQuiz ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
                  <span className="text-sm text-gray-400">{lesson.duration}</span>
                </div>
                <div className="prose max-w-none">
                  {renderContent(lesson.content)}
                </div>
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <button onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
                    disabled={activeLesson === 0}
                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    ← Previous
                  </button>
                  {activeLesson < mod.lessons.length - 1 ? (
                    <button onClick={() => setActiveLesson(activeLesson + 1)}
                      className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors">
                      Next Lesson →
                    </button>
                  ) : (
                    <button onClick={() => setShowQuiz(true)}
                      className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-400 transition-colors">
                      Take Module Quiz →
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Module {mod.id} Quiz</h2>
                <p className="text-gray-500 text-sm mb-6">{mod.quiz.length} questions · Select the best answer for each</p>

                {submitted && (
                  <div className={`mb-6 p-4 rounded-xl ${pct >= 80 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <div className={`text-2xl font-bold ${pct >= 80 ? 'text-green-700' : 'text-amber-700'}`}>{pct}% — {score}/{mod.quiz.length} correct</div>
                    <div className={`text-sm mt-1 ${pct >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                      {pct >= 80 ? '✓ Module complete! Proceed to the next module.' : 'Review the lessons and try again.'}
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  {mod.quiz.map((q, qi) => (
                    <div key={qi}>
                      <div className="font-semibold text-gray-800 mb-3">{qi + 1}. {q.question}</div>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => {
                          const isSelected = answers[qi] === oi
                          const isCorrect = submitted && oi === q.correct
                          const isWrong = submitted && isSelected && oi !== q.correct
                          return (
                            <button key={oi} onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                              className={`w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ${
                                isCorrect ? 'bg-green-50 border-green-400 text-green-800 font-medium' :
                                isWrong ? 'bg-red-50 border-red-300 text-red-700' :
                                isSelected ? 'bg-slate-900 border-slate-900 text-white' :
                                'bg-gray-50 border-gray-200 text-gray-700 hover:border-slate-400'
                              }`}>
                              <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + oi)}</span>
                              {opt}
                              {isCorrect && <span className="ml-2 text-green-600">✓</span>}
                              {isWrong && <span className="ml-2 text-red-500">✗</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!submitted ? (
                  <button onClick={() => setSubmitted(true)}
                    disabled={Object.keys(answers).length < mod.quiz.length}
                    className="mt-8 w-full py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Submit Answers ({Object.keys(answers).length}/{mod.quiz.length} answered)
                  </button>
                ) : (
                  <div className="mt-8 flex gap-3">
                    <button onClick={() => { setSubmitted(false); setAnswers({}); }}
                      className="flex-1 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                      Retake Quiz
                    </button>
                    {nextMod && (
                      <Link href={`/module/${nextMod.id}`}
                        className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-400 transition-colors text-center">
                        Module {nextMod.id} →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Module Nav */}
            <div className="flex items-center justify-between mt-4">
              {prevMod ? (
                <Link href={`/module/${prevMod.id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                  Module {prevMod.id}: {prevMod.title}
                </Link>
              ) : <div />}
              {nextMod ? (
                <Link href={`/module/${nextMod.id}`} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                  Module {nextMod.id}: {nextMod.title}
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
