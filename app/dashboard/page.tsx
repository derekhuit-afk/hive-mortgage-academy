"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MODULES } from "@/lib/curriculum";
import { Suspense } from "react";

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<Record<number, { completed: boolean; score?: number }>>({});
  const [showWelcome, setShowWelcome] = useState(welcome);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    fetchProgress(s.id);
  }, []);

  async function fetchProgress(studentId: string) {
    const res = await fetch(`/api/progress?studentId=${studentId}`);
    if (res.ok) {
      const data = await res.json();
      const map: Record<number, { completed: boolean; score?: number }> = {};
      data.forEach((p: any) => { map[p.module_number] = { completed: p.completed, score: p.best_score }; });
      setProgress(map);
    }
  }

  function logout() { localStorage.removeItem("hma_student"); router.push("/"); }

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const allDone = completedCount === 6;

  if (!student) return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--honey)", fontSize: 18 }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Top nav */}
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🐝</div>
          <span className="font-display" style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Hive Mortgage Academy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{student.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>NMLS #{student.nmls_number}</div>
          </div>
          <button onClick={logout} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Welcome banner */}
        {showWelcome && (
          <div style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.12), rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 16, padding: "20px 24px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--honey)", marginBottom: 4 }}>Welcome to Hive Mortgage Academy, {student.name.split(" ")[0]}! 🐝</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Your training starts with Module 1. Complete each module and quiz to earn your certificate.</div>
            </div>
            <button onClick={() => setShowWelcome(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
        )}

        {/* Progress bar */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }} className="progress-card">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Course Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--honey)" }}>{completedCount}/6 Modules</span>
            </div>
            <div style={{ height: 8, background: "var(--muted)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(completedCount / 6) * 100}%`, background: "linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius: 100, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              {allDone ? "🎉 Course complete! Download your certificate below." : `${6 - completedCount} module${6 - completedCount !== 1 ? "s" : ""} remaining`}
            </div>
          </div>
          <div>
            {allDone ? (
              <a href="/certificate" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "12px 20px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700, display: "block", textAlign: "center" }}>
                🏆 Get Certificate
              </a>
            ) : (
              <div style={{ background: "var(--slate)", borderRadius: 10, padding: "12px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "var(--honey)", fontFamily: "'Playfair Display',serif" }}>{Math.round((completedCount / 6) * 100)}%</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complete</div>
              </div>
            )}
          </div>
        </div>

        {/* Modules grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="module-dash-grid">
          {MODULES.map((mod, idx) => {
            const prog = progress[mod.id];
            const isLocked = idx > 0 && !progress[idx]?.completed;
            const isDone = prog?.completed;
            const inProgress = !isDone && !isLocked && idx === completedCount;

            return (
              <div key={mod.id} style={{
                background: "var(--charcoal)", border: `1px solid ${isDone ? "rgba(16,185,129,0.4)" : inProgress ? "rgba(245,166,35,0.4)" : "var(--border)"}`,
                borderRadius: 16, padding: 22, opacity: isLocked ? 0.5 : 1,
                transition: "all 0.2s", cursor: isLocked ? "not-allowed" : "pointer",
              }}
                onClick={() => !isLocked && router.push(`/module/${mod.id}`)}
                onMouseEnter={e => !isLocked && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div className="font-display" style={{ fontSize: 32, fontWeight: 900, color: "rgba(245,166,35,0.2)", lineHeight: 1 }}>{String(mod.id).padStart(2, "0")}</div>
                  <div style={{ fontSize: 18 }}>{isDone ? "✅" : isLocked ? "🔒" : inProgress ? "▶️" : "○"}</div>
                </div>
                <div style={{ fontSize: 12, color: isDone ? "#10B981" : isLocked ? "var(--text-muted)" : "var(--honey)", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {isDone ? "Completed" : isLocked ? "Locked" : inProgress ? "In Progress" : "Ready"}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>{mod.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{mod.duration} · {mod.lessons.length} lessons</div>
                {isDone && prog?.score !== undefined && (
                  <div style={{ marginTop: 10, fontSize: 11, color: "#10B981", fontWeight: 600 }}>Quiz score: {prog.score}%</div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Coach quick access */}
        <div style={{ marginTop: 32, background: "var(--charcoal)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>🤖 AI Mortgage Coach</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Ask anything about your modules, loan products, or career questions.</div>
          </div>
          <a href="/#ai-coach" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "12px 22px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: 700 }}>Open Coach →</a>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) { .module-dash-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 640px) { .module-dash-grid { grid-template-columns: 1fr !important; } .progress-card { grid-template-columns: 1fr !important; } }
      `}</style>
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense><Dashboard /></Suspense>;
}
