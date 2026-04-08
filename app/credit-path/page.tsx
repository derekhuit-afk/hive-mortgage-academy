"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Debt = { name: string; balance: string; limit: string; type: "revolving" | "installment" };

function formatPlan(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontSize: 12, fontWeight: 800, color: "var(--honey)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "18px 0 8px", display: "inline-block", padding: "3px 10px", background: "rgba(245,166,35,0.08)", borderRadius: 6 }}>{line.replace(/\*\*/g, "")}</div>;
    if (line.startsWith("- ")) return <div key={i} style={{ display: "flex", gap: 8, margin: "5px 0" }}><span style={{ color: "var(--honey)", flexShrink: 0 }}>▸</span><span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{line.slice(2)}</span></div>;
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: "3px 0" }}>{line}</p>;
  });
}

export default function CreditPathPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [currentScore, setCurrentScore] = useState("620");
  const [targetScore, setTargetScore] = useState("680");
  const [timeline, setTimeline] = useState("6");
  const [debts, setDebts] = useState<Debt[]>([{ name: "", balance: "", limit: "", type: "revolving" }]);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  function addDebt() { setDebts([...debts, { name: "", balance: "", limit: "", type: "revolving" }]); }
  function updateDebt(i: number, field: keyof Debt, val: string) {
    const updated = debts.map((d, idx) => idx === i ? { ...d, [field]: val } : d);
    setDebts(updated);
  }
  function removeDebt(i: number) { setDebts(debts.filter((_, idx) => idx !== i)); }

  async function generate() {
    setLoading(true); setPlan(""); setStep(3);
    try {
      const res = await fetch("/api/credit-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentScore, targetScore, timeline, debts: debts.filter(d => d.name), loName: student?.name }),
      });
      const data = await res.json();
      setPlan(data.content || "");
    } catch { } finally { setLoading(false); }
  }

  function copy() { navigator.clipboard.writeText(plan).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }

  const gap = parseInt(targetScore) - parseInt(currentScore);
  if (!student) return null;

  // Utilization calculator
  const revolving = debts.filter(d => d.type === "revolving" && d.balance && d.limit);
  const totalBal = revolving.reduce((s, d) => s + parseFloat(d.balance), 0);
  const totalLim = revolving.reduce((s, d) => s + parseFloat(d.limit), 0);
  const utilization = totalLim > 0 ? Math.round((totalBal / totalLim) * 100) : 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎯</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>CreditPath™</span>
        </div>
        <div style={{ width: 80 }} />
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
        {step < 3 && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Credit Improvement Planner</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 10 }}>CreditPath™</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto" }}>Enter a borrower's credit situation. Get a specific, number-by-number paydown plan to hit their target score.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: step >= s ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--slate)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: step >= s ? "#0A0A0B" : "var(--text-muted)" }}>{s}</div>
                  <span style={{ fontSize: 12, color: step >= s ? "var(--honey)" : "var(--text-muted)", fontWeight: step >= s ? 600 : 400 }}>{s === 1 ? "Score Goals" : "Debts"}</span>
                  {s < 2 && <div style={{ width: 28, height: 1, background: "var(--border)" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Score Goals */}
        {step === 1 && (
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }} className="score-grid">
              {([["Current Credit Score", currentScore, setCurrentScore, "e.g. 620"], ["Target Score", targetScore, setTargetScore, "e.g. 680"], ["Timeline (months)", timeline, setTimeline, "e.g. 6"]] as [string, string, (v: string) => void, string][]).map(([l, v, set, p]) => (
                <div key={l}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, display: "block" }}>{l}</label>
                  <input type="number" placeholder={p} value={v} onChange={e => set(e.target.value)} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", color: "var(--text-primary)", fontSize: 16, fontWeight: 700, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            {gap > 0 && (
              <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "var(--honey)", fontWeight: 600 }}>Goal: +{gap} points in {timeline} months — about +{Math.round(gap / parseInt(timeline))} points/month</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{gap <= 40 ? "✓ Very achievable with focused effort" : gap <= 80 ? "⚡ Achievable — will require consistent action" : "⚠️ Aggressive — may need longer timeline"}</div>
              </div>
            )}
            <style>{`@media(max-width:500px){.score-grid{grid-template-columns:1fr!important}}`}</style>
            <button onClick={() => setStep(2)} style={{ width: "100%", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Next: Add Debts →</button>
          </div>
        )}

        {/* Step 2 — Debts */}
        {step === 2 && (
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Add debts (credit cards, loans, etc.)</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>Include all revolving credit (credit cards) — these have the biggest impact on score. Installment loans (car, student) matter too but less.</div>
            {utilization > 0 && (
              <div style={{ background: utilization > 30 ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)", border: `1px solid ${utilization > 30 ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: utilization > 30 ? "#EF4444" : "#10B981" }}>Overall Utilization: {utilization}% {utilization > 30 ? "— HIGH, major score drag" : utilization > 10 ? "— Moderate" : "— Excellent"}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Target: under 30% overall, ideally under 10%</div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {debts.map((d, i) => (
                <div key={i} style={{ background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 10, alignItems: "end" }} className="debt-row">
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, display: "block" }}>Name</label>
                      <input placeholder="Chase Sapphire, Student Loan..." value={d.name} onChange={e => updateDebt(i, "name", e.target.value)} style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 11px", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, display: "block" }}>Balance</label>
                      <input type="number" placeholder="2500" value={d.balance} onChange={e => updateDebt(i, "balance", e.target.value)} style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 11px", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, display: "block" }}>{d.type === "revolving" ? "Credit Limit" : "Original Amt"}</label>
                      <input type="number" placeholder="5000" value={d.limit} onChange={e => updateDebt(i, "limit", e.target.value)} style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 7, padding: "9px 11px", color: "var(--text-primary)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <button onClick={() => removeDebt(i)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, paddingTop: 20 }}>×</button>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    {["revolving", "installment"].map(t => (
                      <button key={t} onClick={() => updateDebt(i, "type", t as any)} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${d.type === t ? "rgba(245,166,35,0.4)" : "var(--border)"}`, background: d.type === t ? "rgba(245,166,35,0.1)" : "transparent", color: d.type === t ? "var(--honey)" : "var(--text-muted)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {t === "revolving" ? "💳 Credit Card" : "📋 Installment Loan"}
                      </button>
                    ))}
                    {d.type === "revolving" && d.balance && d.limit && (
                      <span style={{ fontSize: 11, color: parseFloat(d.balance) / parseFloat(d.limit) > 0.3 ? "#EF4444" : "#10B981", fontWeight: 600, marginLeft: "auto", alignSelf: "center" }}>
                        {Math.round((parseFloat(d.balance) / parseFloat(d.limit)) * 100)}% util
                      </span>
                    )}
                  </div>
                  <style>{`@media(max-width:500px){.debt-row{grid-template-columns:1fr 1fr!important}}`}</style>
                </div>
              ))}
            </div>
            <button onClick={addDebt} style={{ background: "none", border: "1px dashed var(--border)", color: "var(--text-muted)", borderRadius: 10, padding: "11px", fontSize: 13, cursor: "pointer", width: "100%", marginBottom: 20 }}>+ Add Another Debt</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>← Back</button>
              <button onClick={generate} style={{ flex: 2, background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Generate Credit Plan →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Results */}
        {step === 3 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }} className="result-stats">
              {[[currentScore, "Current Score", "#EF4444"], [`+${gap}`, "Points Needed", "#F5A623"], [targetScore, "Target Score", "#10B981"]].map(([v, l, c]) => (
                <div key={String(l)} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: c as string }}>{v}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:500px){.result-stats{grid-template-columns:1fr!important}}`}</style>
            {loading ? (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Analyzing debts and building your paydown plan...</div>
              </div>
            ) : plan ? (
              <div>
                <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 26px", marginBottom: 16 }}>
                  {formatPlan(plan)}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={copy} style={{ flex: 1, background: copied ? "#10B981" : "rgba(245,166,35,0.1)", border: `1px solid ${copied ? "#10B981" : "rgba(245,166,35,0.3)"}`, color: copied ? "white" : "var(--honey)", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{copied ? "✓ Copied!" : "📋 Copy Plan"}</button>
                  <button onClick={() => { setStep(1); setPlan(""); }} style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>New Plan</button>
                </div>
                <div style={{ marginTop: 16, background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: 12, padding: "14px 18px" }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>💡 Share this plan with your borrower using <a href="/readyscore" style={{ color: "var(--honey)", textDecoration: "none" }}>ReadyScore™</a> or paste it into a text/email using the copy button above.</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
