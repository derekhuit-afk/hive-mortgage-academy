"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MODULES, canAccessModule, TIER_LIMITS } from "@/lib/curriculum";
import type { Tier } from "@/lib/curriculum";
import { Suspense } from "react";

const TIER_LABEL: Record<string, string> = { free: "Free", foundation: "Foundation", accelerator: "Accelerator", elite: "Elite" };
const TIER_COLOR: Record<string, string> = { free: "#10B981", foundation: "#3B82F6", accelerator: "#8B5CF6", elite: "#F5A623" };
const NEXT_TIER: Record<string, { name: string; href: string }> = {
  free: { name: "Foundation ($97/mo)", href: "/enroll?tier=foundation" },
  foundation: { name: "Accelerator ($297/mo)", href: "/enroll?tier=accelerator" },
  accelerator: { name: "Elite ($697/mo)", href: "/enroll?tier=elite" },
  elite: { name: "", href: "" },
};

function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const showUpgrade = params.get("upgrade") === "1";
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<Record<number, { completed: boolean; score?: number }>>({});
  const [showWelcome, setShowWelcome] = useState(params.get("welcome") === "1");
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(showUpgrade);
  const [showCoach, setShowCoach] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ role: string; content: string }[]>([{ role: "assistant", content: "Welcome back! Ask me anything about loan origination, pipeline building, compliance, or your career. I'm here 24/7." }]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

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

  async function sendCoach() {
    if (!coachInput.trim() || coachLoading) return;
    const userMsg = { role: "user", content: coachInput };
    const updated = [...coachMessages, userMsg];
    setCoachMessages(updated);
    setCoachInput("");
    setCoachLoading(true);
    try {
      const res = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: updated }) });
      const data = await res.json();
      setCoachMessages([...updated, { role: "assistant", content: data.content }]);
    } catch { /* silent */ } finally { setCoachLoading(false); }
  }

  function logout() { localStorage.removeItem("hma_student"); router.push("/"); }

  if (!student) return <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--honey)", fontSize: 18 }}>Loading...</div>;

  const tier = (student.plan || "free") as Tier;
  const tierLimit = TIER_LIMITS[tier];
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const tierCompleted = Object.entries(progress).filter(([k, p]) => p.completed && parseInt(k) <= tierLimit).length;
  const graduated = tierCompleted >= tierLimit;
  const nextModule = MODULES.find(m => !progress[m.id]?.completed && canAccessModule(m.id, tier));

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🐝</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Hive Mortgage Academy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => setShowCoach(!showCoach)} style={{ background: showCoach ? "rgba(245,166,35,0.15)" : "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--honey)", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>🤖 AI Coach</button>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{student.name}</div>
            <div style={{ fontSize: 11, color: TIER_COLOR[tier], fontWeight: 600 }}>{TIER_LABEL[tier]} Tier</div>
          </div>
          <button onClick={logout} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-muted)", fontSize: 12, padding: "6px 14px", cursor: "pointer" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Banners */}
        {showWelcome && (
          <div style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 14, padding: "18px 22px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--honey)", marginBottom: 4 }}>Welcome to Hive Mortgage Academy, {student.name.split(" ")[0]}! 🐝</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Your first 3 modules are unlocked. The AI Coach is ready. Start with Module 1.</div>
            </div>
            <button onClick={() => setShowWelcome(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
        )}
        {showUpgradeBanner && (
          <div style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, padding: "16px 22px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#8B5CF6", marginBottom: 4 }}>Upgrade to unlock this module</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Your current {TIER_LABEL[tier]} tier unlocks modules 1–{tierLimit}. Upgrade to continue.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {NEXT_TIER[tier]?.name && <a href={NEXT_TIER[tier].href} style={{ background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "white", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Upgrade to {NEXT_TIER[tier].name} →</a>}
              <button onClick={() => setShowUpgradeBanner(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
          </div>
        )}
        {graduated && (
          <div style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.12),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.4)", borderRadius: 14, padding: "20px 24px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--honey)", marginBottom: 4 }}>🎉 Congratulations! You've completed your {TIER_LABEL[tier]} curriculum.</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Claim your HivePass™ and choose your next path.</div>
            </div>
            <a href="/graduation" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "12px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Get Your HivePass™ →</a>
          </div>
        )}

        {/* Progress */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, marginBottom: 32, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }} className="progress-card">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Your Progress ({TIER_LABEL[tier]} Tier)</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TIER_COLOR[tier] }}>{tierCompleted}/{tierLimit} Modules</span>
            </div>
            <div style={{ height: 8, background: "var(--muted)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(tierCompleted / tierLimit) * 100}%`, background: `linear-gradient(90deg,${TIER_COLOR[tier]},${TIER_COLOR[tier]}cc)`, borderRadius: 100, transition: "width 0.6s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              {graduated ? "🎉 Tier complete! Get your HivePass™" : `${tierLimit - tierCompleted} module${tierLimit - tierCompleted !== 1 ? "s" : ""} remaining in ${TIER_LABEL[tier]}`}
            </div>
          </div>
          <div style={{ background: "var(--slate)", borderRadius: 10, padding: "12px 20px", textAlign: "center", minWidth: 80 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: TIER_COLOR[tier], fontFamily: "'Playfair Display',serif" }}>{Math.round((tierCompleted / tierLimit) * 100)}%</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complete</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 32 }} className="actions-grid">
          {nextModule ? (
            <a href={`/module/${nextModule.id}`} style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 14, padding: "18px 20px", textDecoration: "none", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Continue Learning</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>Module {nextModule.id}: {nextModule.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{nextModule.duration} · {nextModule.lessons.length} lessons →</div>
            </a>
          ) : (
            <a href="/graduation" style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 14, padding: "18px 20px", textDecoration: "none" }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Tier Complete</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Get Your HivePass™ →</div>
            </a>
          )}
          <div onClick={() => setShowCoach(true)} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", cursor: "pointer" }}>
            <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Always Available</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>🤖 Ask Your AI Coach</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Unlimited · Built from $1B production</div>
          </div>
          <a href="/apply" style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px", textDecoration: "none" }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Career Path</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>🏔️ Apply to Derek's Team</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Full Huit.AI platform from Day 1</div>
          </a>
        </div>
        <style>{`@media(max-width:768px){.actions-grid{grid-template-columns:1fr!important}.progress-card{grid-template-columns:1fr!important}}`}</style>

        {/* AI Coach Panel */}
        {showCoach && (
          <div style={{ background: "var(--charcoal)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 20, marginBottom: 32, overflow: "hidden" }}>
            <div style={{ background: "var(--slate)", padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🐝</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Hive AI Coach</div>
                  <div style={{ fontSize: 11, color: "#10B981" }}>● Online · Unlimited Q&A</div>
                </div>
              </div>
              <button onClick={() => setShowCoach(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            <div style={{ height: 300, overflowY: "auto", padding: "20px" }}>
              {coachMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                  <div style={{ maxWidth: "82%", background: m.role === "user" ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--slate)", color: m.role === "user" ? "#0A0A0B" : "var(--text-primary)", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 14, lineHeight: 1.6, border: m.role === "assistant" ? "1px solid var(--border)" : "none" }}>{m.content}</div>
                </div>
              ))}
              {coachLoading && <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>{[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--honey)", opacity: 0.6 }} />)}</div>}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10 }}>
              <input value={coachInput} onChange={e => setCoachInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendCoach()} placeholder="Ask anything about mortgage origination..." style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              <button onClick={sendCoach} disabled={coachLoading || !coachInput.trim()} style={{ background: coachInput.trim() ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--muted)", color: coachInput.trim() ? "#0A0A0B" : "var(--text-muted)", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: coachInput.trim() ? "pointer" : "not-allowed" }}>Send →</button>
            </div>
          </div>
        )}

        {/* Module Grid */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6 }}>Your Curriculum</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>12 modules · {TIER_LABEL[tier]} tier unlocks modules 1–{tierLimit}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="module-grid">
          {MODULES.map(m => {
            const accessible = canAccessModule(m.id, tier);
            const done = progress[m.id]?.completed;
            const score = progress[m.id]?.score;
            return (
              <div key={m.id} onClick={() => accessible ? router.push(`/module/${m.id}`) : setShowUpgradeBanner(true)} style={{ background: "var(--charcoal)", border: `1px solid ${done ? "rgba(16,185,129,0.3)" : accessible ? "var(--border)" : "var(--border)"}`, borderRadius: 14, padding: 20, cursor: accessible ? "pointer" : "pointer", opacity: accessible ? 1 : 0.55, position: "relative" }}>
                {done && <div style={{ position: "absolute", top: 12, right: 12, width: 22, height: 22, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "white" }}>✓</div>}
                {!accessible && <div style={{ position: "absolute", top: 12, right: 12, fontSize: 14 }}>🔒</div>}
                <div style={{ fontSize: 10, color: m.badgeColor, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>{m.badge}</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "rgba(245,166,35,0.15)", lineHeight: 1, marginBottom: 6 }}>{String(m.id).padStart(2,"0")}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 4 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.duration} · {m.lessons.length} lessons</div>
                {done && score !== undefined && <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginTop: 6 }}>Quiz: {score}% ✓</div>}
              </div>
            );
          })}
        </div>
        <style>{`@media(max-width:900px){.module-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:580px){.module-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense><Dashboard /></Suspense>;
}
