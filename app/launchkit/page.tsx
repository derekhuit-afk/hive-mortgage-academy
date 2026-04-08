"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CHANNELS = ["Realtor Referrals","Sphere of Influence","Social Media","Online Leads","Open Houses","Corporate Relocation","Divorce Attorneys","Financial Advisors","Builder Relationships"];
const LOAN_TYPES = ["Conventional","FHA","VA","USDA","Jumbo","Non-QM","Renovation","Down Payment Assistance"];
const EXPERIENCE = ["Brand new — license in hand, zero originations","Less than 6 months","6–12 months","1–3 years","3+ years (relaunching or new market)"];
const STATES = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI","IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT","NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VA","VT","WA","WI","WV","WY"];

function formatPlan(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <div key={i} style={{ marginTop: 32, marginBottom: 12 }}>
          <div style={{ display: "inline-block", background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 8, padding: "5px 14px", fontSize: 11, fontWeight: 800, color: "var(--honey)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            {line.replace(/\*\*/g, "")}
          </div>
        </div>
      );
    }
    if (line.startsWith("- ")) return (
      <div key={i} style={{ display: "flex", gap: 10, margin: "6px 0", paddingLeft: 8 }}>
        <span style={{ color: "var(--honey)", flexShrink: 0, marginTop: 2 }}>▸</span>
        <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{line.slice(2)}</span>
      </div>
    );
    if (/^\d+\./.test(line)) return (
      <div key={i} style={{ display: "flex", gap: 10, margin: "7px 0", paddingLeft: 8 }}>
        <span style={{ color: "var(--honey)", flexShrink: 0, minWidth: 22, fontWeight: 700, fontSize: 14 }}>{line.split(".")[0]}.</span>
        <span style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{line.split(". ").slice(1).join(". ")}</span>
      </div>
    );
    if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, margin: "4px 0" }}>{line}</p>;
  });
}

export default function LaunchKitPage() {
  const router = useRouter();
  const planRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState("");
  const [printed, setPrinted] = useState(false);

  const [form, setForm] = useState({
    name: "", nmls: "", market: "", state: "AK",
    sphereSize: "50", goalUnits: "3", goalVolume: "1",
    experience: "", channels: [] as string[], loanTypes: [] as string[],
  });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    setForm(f => ({ ...f, name: s.name || "", nmls: s.nmls_number || "" }));
  }, []);

  function toggleArr(key: "channels"|"loanTypes", val: string) {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
    }));
  }

  async function generate() {
    if (!form.name || !form.market || !form.experience || form.channels.length === 0 || form.loanTypes.length === 0) return;
    setGenerating(true);
    setPlan("");
    setStep(3);
    try {
      const res = await fetch("/api/launchkit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setPlan(data.content || "");
    } catch { /* silent */ } finally { setGenerating(false); }
  }

  function handlePrint() {
    window.print();
    setPrinted(true);
  }

  if (!student) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🚀</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>LO LaunchKit™</span>
        </div>
        {plan && (
          <button onClick={handlePrint} style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 8, color: "var(--honey)", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>
            🖨️ Print / Save PDF
          </button>
        )}
        {!plan && <div style={{ width: 100 }} />}
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        {step < 3 && (
          <div style={{ marginBottom: 36, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>Hive Mortgage Academy</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 10 }}>LO LaunchKit™</h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>Your personalized 90-day business plan — built by AI from Derek's $1B playbook, customized to your market and goals.</p>
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {[1,2].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--slate)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: step >= s ? "#0A0A0B" : "var(--text-muted)" }}>{s}</div>
                  <span style={{ fontSize: 12, color: step >= s ? "var(--honey)" : "var(--text-muted)", fontWeight: step >= s ? 600 : 400 }}>{s === 1 ? "Your Info" : "Your Focus"}</span>
                  {s < 2 && <div style={{ width: 32, height: 1, background: "var(--border)" }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 24 }}>Tell us about yourself</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-grid">
              {[["Full Name","name","text","Derek Huit"],["NMLS Number","nmls","text","#1234567"]].map(([label,field,type,ph]) => (
                <div key={String(field)}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>{label}</label>
                  <input type={String(type)} placeholder={String(ph)} value={(form as any)[String(field)]} onChange={e => setForm(f => ({ ...f, [String(field)]: e.target.value }))}
                    style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Primary Market / City</label>
                <input type="text" placeholder="e.g. Anchorage, Dallas, Tampa" value={form.market} onChange={e => setForm(f => ({ ...f, market: e.target.value }))}
                  style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>State</label>
                <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Experience Level</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXPERIENCE.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, experience: e }))} style={{ textAlign: "left", padding: "11px 14px", borderRadius: 10, border: `1px solid ${form.experience === e ? "rgba(245,166,35,0.5)" : "var(--border)"}`, background: form.experience === e ? "rgba(245,166,35,0.08)" : "var(--slate)", color: form.experience === e ? "var(--honey)" : "var(--text-secondary)", fontSize: 13, cursor: "pointer", fontWeight: form.experience === e ? 600 : 400 }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }} className="goals-grid">
              {[["Sphere of Influence Size","sphereSize","people you know"],["Goal: Units in 90 Days","goalUnits","loans to close"],["Goal: Volume ($M)","goalVolume","million dollars"]].map(([label,field,sub]) => (
                <div key={String(field)}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>{label}</label>
                  <input type="number" value={(form as any)[String(field)]} onChange={e => setForm(f => ({ ...f, [String(field)]: e.target.value }))}
                    style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{sub}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!form.name || !form.market || !form.experience} style={{ width: "100%", marginTop: 28, background: (!form.name || !form.market || !form.experience) ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: (!form.name || !form.market || !form.experience) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Next: Choose Your Focus →
            </button>
            <style>{`@media(max-width:600px){.form-grid{grid-template-columns:1fr!important}.goals-grid{grid-template-columns:1fr!important}}`}</style>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>What are your primary business channels?</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>Select all that apply. Your plan will focus on these areas.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 28 }} className="chan-grid">
              {CHANNELS.map(c => (
                <button key={c} onClick={() => toggleArr("channels", c)} style={{ padding: "11px 12px", borderRadius: 10, border: `1px solid ${form.channels.includes(c) ? "rgba(245,166,35,0.5)" : "var(--border)"}`, background: form.channels.includes(c) ? "rgba(245,166,35,0.1)" : "var(--slate)", color: form.channels.includes(c) ? "var(--honey)" : "var(--text-secondary)", fontSize: 12, fontWeight: form.channels.includes(c) ? 700 : 400, cursor: "pointer", textAlign: "left", lineHeight: 1.3 }}>
                  {form.channels.includes(c) ? "✓ " : ""}{c}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Loan types you'll specialize in</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>Your plan will include product-specific scripts and strategies.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 28 }} className="loan-grid">
              {LOAN_TYPES.map(t => (
                <button key={t} onClick={() => toggleArr("loanTypes", t)} style={{ padding: "10px 10px", borderRadius: 10, border: `1px solid ${form.loanTypes.includes(t) ? "rgba(245,166,35,0.5)" : "var(--border)"}`, background: form.loanTypes.includes(t) ? "rgba(245,166,35,0.1)" : "var(--slate)", color: form.loanTypes.includes(t) ? "var(--honey)" : "var(--text-secondary)", fontSize: 12, fontWeight: form.loanTypes.includes(t) ? 700 : 400, cursor: "pointer" }}>
                  {form.loanTypes.includes(t) ? "✓ " : ""}{t}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>← Back</button>
              <button onClick={generate} disabled={form.channels.length === 0 || form.loanTypes.length === 0} style={{ flex: 2, background: (form.channels.length === 0 || form.loanTypes.length === 0) ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: (form.channels.length === 0 || form.loanTypes.length === 0) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                🚀 Generate My 90-Day Plan →
              </button>
            </div>
            <style>{`@media(max-width:600px){.chan-grid{grid-template-columns:repeat(2,1fr)!important}.loan-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
          </div>
        )}

        {/* STEP 3 — Generating / Plan */}
        {step === 3 && (
          <div>
            {generating ? (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "var(--text-primary)", marginBottom: 12 }}>Building Your Plan...</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 28px" }}>
                  Derek's AI is generating your personalized 90-day launch plan — week-by-week actions, scripts, daily routines, and your scorecard. Takes about 15 seconds.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {["Week 1", "Scripts", "Daily Rhythm", "Scorecard"].map((item, i) => (
                    <div key={item} style={{ padding: "6px 12px", borderRadius: 100, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", fontSize: 11, color: "var(--honey)", fontWeight: 600, opacity: 0.5 + i * 0.15 }}>{item}</div>
                  ))}
                </div>
              </div>
            ) : plan ? (
              <div>
                {/* Plan header */}
                <div style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.03))", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 20, padding: "28px 32px", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Your Personalized Plan</div>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{form.name}'s 90-Day LaunchKit™</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{form.market}, {form.state} · NMLS #{form.nmls || "—"} · Goal: {form.goalUnits} units in 90 days</div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handlePrint} style={{ background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🖨️ Print PDF</button>
                      <button onClick={() => { setStep(1); setPlan(""); }} style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", color: "var(--honey)", padding: "10px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>↺ Regenerate</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
                    {[["📅","90 Days"],["🎯",form.goalUnits+" Units"],["📍",form.market],["🔥",form.channels.slice(0,2).join(" · ")]].map(([icon,val]) => (
                      <div key={String(val)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 100, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)" }}>
                        <span style={{ fontSize: 13 }}>{icon}</span>
                        <span style={{ fontSize: 12, color: "var(--honey)", fontWeight: 600 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan content */}
                <div ref={planRef} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: "32px 36px" }} id="plan-content">
                  {formatPlan(plan)}
                </div>

                {/* Bottom actions */}
                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button onClick={handlePrint} style={{ flex: 1, background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🖨️ Save as PDF</button>
                  <a href="/payment-first" style={{ flex: 1, textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>💰 Open PaymentFirst™ →</a>
                  <a href="/dashboard" style={{ flex: 1, textAlign: "center", background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>← Dashboard</a>
                </div>

                {/* Apply CTA */}
                <div style={{ marginTop: 20, background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 14, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--honey)", marginBottom: 3 }}>Ready to execute this plan on Derek's team?</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Join and get the full Huit.AI platform behind your 90-day launch.</div>
                  </div>
                  <a href="/apply" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "10px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>Apply to the Team →</a>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Something went wrong. <button onClick={() => setStep(2)} style={{ background: "none", border: "none", color: "var(--honey)", cursor: "pointer", textDecoration: "underline" }}>Try again</button></div>
            )}
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav { display: none !important; }
          main { background: white !important; }
          #plan-content { border: none !important; padding: 0 !important; }
          button, a[href="/dashboard"], a[href="/payment-first"] { display: none !important; }
          * { color: #000 !important; background: white !important; }
        }
      `}</style>
    </main>
  );
}
