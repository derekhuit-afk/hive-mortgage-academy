"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── State property tax rates (annual %) ───────────────────────────────────
const STATE_TAX: Record<string, number> = {
  "AL":0.42,"AK":1.04,"AZ":0.63,"AR":0.62,"CA":0.76,"CO":0.51,"CT":2.14,
  "DE":0.57,"FL":0.98,"GA":0.92,"HI":0.29,"ID":0.69,"IL":2.27,"IN":0.85,
  "IA":1.53,"KS":1.41,"KY":0.86,"LA":0.55,"ME":1.36,"MD":1.09,"MA":1.23,
  "MI":1.54,"MN":1.12,"MS":0.65,"MO":1.01,"MT":0.84,"NE":1.73,"NV":0.60,
  "NH":2.18,"NJ":2.49,"NM":0.80,"NY":1.72,"NC":0.84,"ND":0.98,"OH":1.56,
  "OK":0.90,"OR":1.04,"PA":1.58,"RI":1.63,"SC":0.57,"SD":1.31,"TN":0.71,
  "TX":1.80,"UT":0.63,"VT":1.90,"VA":0.82,"WA":1.03,"WV":0.59,"WI":1.76,
  "WY":0.61,"DC":0.56,
};

const STATES = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI",
  "IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT",
  "NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VA","VT","WA","WI","WV","WY"];

// ─── Mortgage payment calculator ──────────────────────────────────────────
function calcPI(loanAmount: number, annualRate: number, termYears = 30) {
  if (annualRate === 0) return loanAmount / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Reverse: given target P&I, find loan amount
function loanFromPI(targetPI: number, annualRate: number, termYears = 30) {
  if (annualRate === 0) return targetPI * termYears * 12;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return targetPI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

function calcScenario(
  comfortPayment: number, downPct: number, rate: number,
  state: string, hoa: number, loanType: string
) {
  const taxRate = (STATE_TAX[state] || 1.0) / 100 / 12;
  const insRate = 0.006 / 12; // ~0.6% annual insurance
  // PMI applies if down < 20% and conventional, or FHA MIP always
  const pmiRate = loanType === "FHA" ? 0.0085 / 12
    : downPct < 20 ? 0.0085 / 12 : 0;

  // We need to solve for purchase price iteratively
  // payment = PI + tax + insurance + PMI + HOA
  // PI is based on loanAmount = price * (1 - down%)
  // tax = price * taxRate
  // insurance = price * insRate
  // PMI = loanAmount * pmiRate
  // Solve: payment = PI(price*(1-d%), rate) + price*taxRate + price*insRate + price*(1-d%)*pmiRate + HOA

  // Rearrange: payment - HOA = price * [taxRate + insRate + (1-d%)*pmiRate] + PI(price*(1-d%), rate)
  // Use binary search
  let lo = 50000, hi = 3000000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const loan = mid * (1 - downPct / 100);
    const pi = calcPI(loan, rate);
    const tax = mid * taxRate;
    const ins = mid * insRate;
    const pmi = loan * pmiRate;
    const total = pi + tax + ins + pmi + hoa;
    if (total > comfortPayment) hi = mid;
    else lo = mid;
  }
  const price = (lo + hi) / 2;
  const loan = price * (1 - downPct / 100);
  const down = price * (downPct / 100);
  const pi = calcPI(loan, rate);
  const tax = price * taxRate;
  const ins = price * insRate;
  const pmi = loan * pmiRate;
  const totalMonthly = pi + tax + ins + pmi + hoa;
  const closingCosts = loan * 0.025 + 1200; // ~2.5% + prepaids
  const cashToClose = down + closingCosts;

  return {
    price: Math.round(price),
    loan: Math.round(loan),
    down: Math.round(down),
    pi: Math.round(pi),
    tax: Math.round(tax),
    ins: Math.round(ins),
    pmi: Math.round(pmi),
    hoa,
    total: Math.round(totalMonthly),
    closingCosts: Math.round(closingCosts),
    cashToClose: Math.round(cashToClose),
  };
}

const fmt = (n: number) => "$" + n.toLocaleString();

export default function PaymentFirstPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Inputs
  const [payment, setPayment] = useState("2000");
  const [downPct, setDownPct] = useState("10");
  const [rate, setRate] = useState("7.0");
  const [state, setState] = useState("AK");
  const [hoa, setHoa] = useState("0");
  const [loanType, setLoanType] = useState("Conventional");
  const [results, setResults] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  function calculate() {
    const p = parseFloat(payment) || 0;
    const d = parseFloat(downPct) || 10;
    const r = parseFloat(rate) || 7.0;
    const h = parseFloat(hoa) || 0;
    if (p < 500) return;

    const conservative = calcScenario(p, d, r, state, h, loanType);
    const moderate = calcScenario(p * 1.12, d, r, state, h, loanType);
    const stretch = calcScenario(p * 1.25, d, r, state, h, loanType);
    setResults({ conservative, moderate, stretch });
    setShowShare(false);
  }

  function copyShareLink() {
    if (!student) return;
    const url = `${window.location.origin}/pf/${student.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (!student) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pf/${student.id}` : "";

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💰</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>PaymentFirst™</span>
        </div>
        <button onClick={copyShareLink} style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 8, color: "var(--honey)", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>
          {copied ? "✓ Copied!" : "🔗 Share My Link"}
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Borrower Consultation Tool</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 8 }}>PaymentFirst™ Consultation</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 580 }}>Start with what the borrower can comfortably afford each month. Let the purchase price follow — not the other way around.</p>
        </div>

        {/* Share link banner */}
        <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", marginBottom: 2 }}>Your Branded Borrower Link — {student?.name} | NMLS #{student?.nmls_number || "—"}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>{shareUrl}</div>
          </div>
          <button onClick={copyShareLink} style={{ background: copied ? "#10B981" : "linear-gradient(135deg,#F5A623,#D4881A)", color: copied ? "white" : "#0A0A0B", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }} className="tool-grid">

          {/* Input Panel */}
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, position: "sticky", top: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Borrower Inputs</div>

            {[
              { label: "Comfortable Monthly Payment", field: payment, set: setPayment, type: "number", prefix: "$", placeholder: "2000" },
              { label: "Down Payment %", field: downPct, set: setDownPct, type: "number", suffix: "%", placeholder: "10" },
              { label: "Current Interest Rate", field: rate, set: setRate, type: "number", suffix: "%", placeholder: "7.0" },
              { label: "Monthly HOA (if any)", field: hoa, set: setHoa, type: "number", prefix: "$", placeholder: "0" },
            ].map(({ label, field, set, type, prefix, suffix, placeholder }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>{label}</label>
                <div style={{ display: "flex", alignItems: "center", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
                  {prefix && <span style={{ padding: "0 10px", color: "var(--honey)", fontWeight: 700, fontSize: 14 }}>{prefix}</span>}
                  <input type={type} value={field} onChange={e => set(e.target.value)} placeholder={placeholder}
                    style={{ flex: 1, background: "none", border: "none", outline: "none", padding: "11px 10px", color: "var(--text-primary)", fontSize: 14 }} />
                  {suffix && <span style={{ padding: "0 10px", color: "var(--honey)", fontWeight: 700, fontSize: 14 }}>{suffix}</span>}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>State</label>
              <select value={state} onChange={e => setState(e.target.value)} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}>
                {STATES.map(s => <option key={s} value={s}>{s} — {(STATE_TAX[s] || 1.0).toFixed(2)}% tax rate</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, display: "block" }}>Loan Type</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Conventional","FHA","VA","USDA"].map(t => (
                  <button key={t} onClick={() => setLoanType(t)} style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${loanType === t ? "rgba(245,166,35,0.5)" : "var(--border)"}`, background: loanType === t ? "rgba(245,166,35,0.1)" : "var(--slate)", color: loanType === t ? "var(--honey)" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={calculate} style={{ width: "100%", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Calculate 3 Scenarios →
            </button>

            <div style={{ marginTop: 16, padding: "12px 14px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginBottom: 4 }}>PaymentFirst™ Philosophy</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>Start with what feels comfortable. Build the purchase price around the payment — never the other way around.</div>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            {!results ? (
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: "60px 40px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 12 }}>Enter a comfortable payment</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>Fill in the inputs on the left and click Calculate. Three scenarios will appear here — conservative, moderate, and stretch — each built around what your borrower said they can afford.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { key: "conservative", label: "Conservative", emoji: "🟢", desc: "Lowest payment. Maximum comfort. Most financial breathing room.", color: "#10B981", modifier: "" },
                  { key: "moderate", label: "Moderate", emoji: "🟡", desc: "Balanced approach. A step up without overextending.", color: "#F5A623", modifier: "+12% payment" },
                  { key: "stretch", label: "Stretch", emoji: "🔴", desc: "Maximum purchase power at the edge of comfort.", color: "#EF4444", modifier: "+25% payment" },
                ].map(({ key, label, emoji, desc, color, modifier }) => {
                  const s = results[key];
                  return (
                    <div key={key} style={{ background: "var(--charcoal)", border: `1px solid ${color}30`, borderRadius: 20, padding: 28, boxShadow: `0 0 30px ${color}08` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 20 }}>{emoji}</span>
                            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "var(--text-primary)" }}>{label}</span>
                            {modifier && <span style={{ fontSize: 11, background: `${color}20`, color, border: `1px solid ${color}40`, padding: "2px 8px", borderRadius: 100, fontWeight: 700 }}>{modifier}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{desc}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color }}>
                            {fmt(s.price)}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Purchase Price</div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }} className="scenario-stats">
                        {[
                          ["Total Payment", fmt(s.total) + "/mo", color],
                          ["Down Payment", fmt(s.down), "var(--text-primary)"],
                          ["Cash to Close", fmt(s.cashToClose), "var(--text-primary)"],
                        ].map(([label, val, c]) => (
                          <div key={String(label)} style={{ background: "var(--slate)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: c as string, fontFamily: "'Playfair Display',serif" }}>{val}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Payment breakdown */}
                      <div style={{ background: "var(--slate)", borderRadius: 12, padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Monthly Payment Breakdown</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            ["Principal & Interest", s.pi],
                            ["Property Taxes (est.)", s.tax],
                            ["Homeowner's Insurance", s.ins],
                            ...(s.pmi > 0 ? [[(loanType === "FHA" ? "FHA MIP" : "PMI"), s.pmi]] : []),
                            ...(s.hoa > 0 ? [["HOA", s.hoa]] : []),
                          ].map(([label, val]) => (
                            <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{fmt(Number(val))}/mo</span>
                            </div>
                          ))}
                          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Total Monthly</span>
                            <span style={{ fontSize: 14, fontWeight: 900, color }}>{fmt(s.total)}/mo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Share CTA */}
                <div style={{ background: "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 16, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--honey)", marginBottom: 4 }}>Share with your borrower</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Send them your branded link so they can explore scenarios on their own time.</div>
                  </div>
                  <button onClick={copyShareLink} style={{ background: copied ? "#10B981" : "linear-gradient(135deg,#F5A623,#D4881A)", color: copied ? "white" : "#0A0A0B", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {copied ? "✓ Link Copied!" : "🔗 Copy Borrower Link"}
                  </button>
                </div>

                {/* Disclaimer */}
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, padding: "0 4px" }}>
                  * Estimates only. Property taxes based on state averages. Insurance estimated at 0.6% annually. PMI/MIP at 0.85% annually where applicable. Closing costs estimated at 2.5% of loan amount + $1,200 in prepaids. Actual figures may vary. Not a commitment to lend.
                </div>
              </div>
            )}
          </div>
        </div>
        <style>{`@media(max-width:900px){.tool-grid{grid-template-columns:1fr!important}}.scenario-stats{grid-template-columns:repeat(3,1fr)!important}@media(max-width:480px){.scenario-stats{grid-template-columns:1fr!important}}`}</style>
      </div>
    </main>
  );
}
