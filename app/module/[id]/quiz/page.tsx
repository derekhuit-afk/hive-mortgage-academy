"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MODULES } from "@/lib/curriculum";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams()!;
  const moduleId = parseInt(params.id as string);
  const mod = MODULES.find(m => m.id === moduleId);

  const [student, setStudent] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  if (!mod) return null;

  const questions = mod?.quiz || [];
  const allAnswered = Object.keys(answers).length === questions.length;
  const passed = score >= 80;

  async function handleSubmit() {
    if (!allAnswered) return;
    setLoading(true);

    // Calculate score
    const correct = questions.filter((q, i) => answers[i] === q.answer).length;
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);

    // Get AI feedback
    try {
      const wrongOnes = questions.filter((q, i) => answers[i] !== q.answer).map(q => q.q);
      const res = await fetch("/api/quiz-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleTitle: mod?.title, score: pct, wrongQuestions: wrongOnes, passed: pct >= 80 }),
      });
      const data = await res.json();
      setFeedback(data.feedback || "");
    } catch { setFeedback(""); }

    // Save to DB
    if (student) {
      setSaving(true);
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, moduleNumber: moduleId, score: pct, answers, passed: pct >= 80 }),
      });
      setSaving(false);
    }

    setSubmitted(true);
    setLoading(false);
  }

  async function handleContinue() {
    if (passed) {
      const nextId = moduleId + 1;
      if (nextId <= 12) router.push(`/module/${nextId}`);
      else router.push("/graduation");
    } else {
      setSubmitted(false);
      setAnswers({});
      setFeedback("");
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push(`/module/${moduleId}`)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Back to Module</button>
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Module {moduleId} Quiz</span>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        {!submitted ? (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Module {moduleId} Quiz</div>
              <h1 className="font-display" style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>{mod.title}</h1>
              <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{questions.length} questions · 80% to pass · AI-graded feedback</p>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} style={{ background: "var(--charcoal)", border: `1px solid ${answers[qi] !== undefined ? "rgba(245,166,35,0.3)" : "var(--border)"}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16, lineHeight: 1.5 }}>
                  <span style={{ color: "var(--honey)", marginRight: 8 }}>Q{qi + 1}.</span>{q.q}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} onClick={() => setAnswers(p => ({ ...p, [qi]: oi }))}
                      style={{
                        padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                        border: `1px solid ${answers[qi] === oi ? "rgba(245,166,35,0.6)" : "var(--border)"}`,
                        background: answers[qi] === oi ? "rgba(245,166,35,0.1)" : "var(--slate)",
                        transition: "all 0.15s", display: "flex", alignItems: "center", gap: 12,
                      }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${answers[qi] === oi ? "var(--honey)" : "var(--border)"}`,
                        background: answers[qi] === oi ? "var(--honey)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {answers[qi] === oi && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0A0A0B" }} />}
                      </div>
                      <span style={{ fontSize: 14, color: answers[qi] === oi ? "var(--text-primary)" : "var(--text-secondary)" }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{Object.keys(answers).length}/{questions.length} answered</span>
              <button onClick={handleSubmit} disabled={!allAnswered || loading} style={{
                background: allAnswered ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--muted)",
                color: allAnswered ? "#0A0A0B" : "var(--text-muted)",
                border: "none", borderRadius: 10, padding: "14px 32px",
                fontSize: 15, fontWeight: 700, cursor: allAnswered ? "pointer" : "not-allowed",
              }}>
                {loading ? "Grading..." : "Submit Quiz →"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? "🏆" : "📚"}</div>
            <h1 className="font-display" style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: passed ? "var(--honey)" : "var(--text-primary)", marginBottom: 8 }}>
              {passed ? "Module Complete!" : "Keep Studying"}
            </h1>
            <div style={{ fontSize: 72, fontWeight: 900, fontFamily: "'Playfair Display',serif", color: passed ? "#10B981" : "#EF4444", margin: "16px 0" }}>{score}%</div>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32 }}>
              {passed ? `You passed with ${score}%. ${moduleId < 12 ? "Ready for the next module." : "You've completed the full Academy!"}` : `You need 80% to pass. You scored ${score}%. Review the material and try again.`}
            </p>

            {/* Question review */}
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              {questions.map((q, qi) => {
                const correct = answers[qi] === q.answer;
                return (
                  <div key={qi} style={{ background: "var(--charcoal)", border: `1px solid ${correct ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 14 }}>{correct ? "✅" : "❌"}</span>
                      <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{q.q}</span>
                    </div>
                    {!correct && (
                      <div style={{ fontSize: 12, color: "#10B981", marginLeft: 22 }}>Correct answer: {q.options[q.answer]}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* AI Feedback */}
            {feedback && (
              <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16, padding: 24, marginBottom: 28, textAlign: "left" }}>
                <div style={{ fontSize: 12, color: "var(--honey)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>🤖 AI Coach Feedback</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{feedback}</p>
              </div>
            )}

            {/* MODULE 6 UNLOCK — first team mention */}
            {passed && moduleId === 6 && (
              <div style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.4)", borderRadius: 18, padding: 28, marginBottom: 28, textAlign: "left" }}>
                <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>🔓 You've unlocked something</div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 10 }}>You just finished Module 6.</h2>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 18 }}>
                  Most new LOs never get here. You've covered the full foundation — product knowledge, borrower conversations, PaymentFirst, and credit. That puts you ahead of 90% of the people who started where you did.
                </p>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
                  For the first time, there's now a path available to you — the option to join Derek Huit's team directly at Cardinal Financial. LOs on this team get the full Huit.AI platform from Day 1. No ramp-up guessing. No figuring it out alone.
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                  There's no pressure and no deadline. Keep going through the curriculum. But if you're ready to have the conversation, the door is open.
                </p>
                <a href="/apply" style={{ display: "inline-block", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Learn About Joining the Team →</a>
              </div>
            )}

            <button onClick={handleContinue} style={{
              background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B",
              border: "none", borderRadius: 12, padding: "16px 40px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
            }}>
              {passed ? (moduleId < 12 ? "Next Module →" : "Get My HivePass™ 🏆") : "Retry Quiz →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
