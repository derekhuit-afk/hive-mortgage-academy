"use client";
import { useState, useEffect } from "react";
import { saveAndSync, loadTool } from "@/lib/hooks/useToolSync";
import { useRouter } from "next/navigation";

type Client = {
  id: string; name: string; phone: string; email: string;
  originalPrice: string; originalLoan: string; closeDate: string;
  loanType: string; interestRate: string; currentValue: string;
  notes: string; lastTouch: string; createdAt: string;
};

function newId() { return Math.random().toString(36).slice(2, 10); }
function today() { return new Date().toISOString().split("T")[0]; }
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

function calcEquity(c: Client) {
  const origLoan = parseFloat(c.originalLoan) || 0;
  const origPrice = parseFloat(c.originalPrice) || 0;
  const currentVal = parseFloat(c.currentValue) || origPrice * 1.15;
  const yearsOwned = c.closeDate ? (Date.now() - new Date(c.closeDate).getTime()) / (365.25 * 86400000) : 1;
  const rate = (parseFloat(c.interestRate) || 6.5) / 100 / 12;
  const n = 360;
  const payment = origLoan * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  const monthsPaid = Math.min(Math.floor(yearsOwned * 12), 360);
  let balance = origLoan;
  for (let i = 0; i < monthsPaid; i++) { const interest = balance * rate; balance = balance - (payment - interest); }
  balance = Math.max(0, balance);
  const equity = currentVal - balance;
  const ltv = Math.round((balance / currentVal) * 100);
  const equityGained = equity - (origPrice - origLoan);
  return { equity: Math.round(equity), balance: Math.round(balance), currentVal: Math.round(currentVal), ltv, equityGained: Math.round(equityGained), yearsOwned: Math.round(yearsOwned * 10) / 10 };
}

function fmtMsg(text: string) {
  return <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{text}</p>;
}

export default function EquityPulsePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [view, setView] = useState<"list" | "add" | "detail">("list");
  const [selected, setSelected] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState<Partial<Client>>({ loanType: "Conventional", interestRate: "7.0" });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
    const saved = localStorage.getItem("hma_equity_clients");
    if (saved) setClients(JSON.parse(saved));
    // Auto-import from LoanTrack closed loans
    const loansRaw = localStorage.getItem("hma_loans");
    if (loansRaw) {
      const loans = JSON.parse(loansRaw).filter((l: any) => !l.active);
      const savedClients = saved ? JSON.parse(saved) : [];
      const existingIds = savedClients.map((c: Client) => c.id);
      const newClients: Client[] = loans.filter((l: any) => !existingIds.includes(l.id)).map((l: any) => ({
        id: l.id, name: l.borrowerName, phone: l.borrowerPhone || "", email: l.borrowerEmail || "",
        originalPrice: l.loanAmount || "", originalLoan: l.loanAmount || "",
        closeDate: l.milestoneHistory?.slice(-1)[0]?.date || today(),
        loanType: l.loanType || "Conventional", interestRate: "7.0", currentValue: "",
        notes: l.propertyAddress || "", lastTouch: today(), createdAt: today(),
      }));
      if (newClients.length > 0) {
        const all = [...savedClients, ...newClients];
        setClients(all);
        localStorage.setItem("hma_equity_clients", JSON.stringify(all));
      }
    }
  }, []);

  function save(u: Client[]) { setClients(u); saveAndSync("hma_equity_clients", "equity", u); }

  function addClient() {
    if (!form.name || !form.originalPrice) return;
    const c: Client = { id: newId(), name: form.name || "", phone: form.phone || "", email: form.email || "", originalPrice: form.originalPrice || "", originalLoan: form.originalLoan || form.originalPrice || "", closeDate: form.closeDate || today(), loanType: form.loanType || "Conventional", interestRate: form.interestRate || "7.0", currentValue: form.currentValue || "", notes: form.notes || "", lastTouch: today(), createdAt: today() };
    save([c, ...clients]);
    setForm({ loanType: "Conventional", interestRate: "7.0" });
    setView("list");
  }

  async function generateMessage(c: Client) {
    setMsgLoading(true); setMessage("");
    const eq = calcEquity(c);
    const refiBenefit = eq.ltv <= 80 && c.loanType !== "VA" ? "May be able to remove PMI or tap equity via HELOC/cash-out refi" : "";
    try {
      const res = await fetch("/api/equity-message", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loName: student?.name, clientName: c.name.split(" ")[0], equity: eq.equity, equityGained: eq.equityGained, currentValue: eq.currentVal, originalPrice: c.originalPrice, yearsOwned: eq.yearsOwned, ltv: eq.ltv, refiBenefit }),
      });
      const data = await res.json();
      setMessage(data.content || "");
    } catch { } finally { setMsgLoading(false); }
  }

  function copy(text: string, key: string) { navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(""), 2000); }); }

  if (!student) return null;
  const totalEquity = clients.reduce((s, c) => s + calcEquity(c).equity, 0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📈</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>EquityPulse™</span>
        </div>
        <button onClick={() => { setForm({ loanType: "Conventional", interestRate: "7.0" }); setView("add"); }} style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Add Client</button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {view === "list" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }} className="eq-stats">
              {[["Past Clients", clients.length, "tracked"], ["Total Portfolio Equity", `$${Math.round(totalEquity / 1000)}K`, "estimated"], ["Refi Candidates", clients.filter(c => calcEquity(c).ltv <= 80).length, "LTV ≤ 80%"]].map(([l, v, s]) => (
                <div key={String(l)} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: "15px 18px" }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "var(--honey)" }}>{v}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{l}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s}</div>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:500px){.eq-stats{grid-template-columns:1fr!important}}`}</style>
            {clients.length === 0 ? (
              <div style={{ background: "var(--charcoal)", border: "2px dashed var(--border)", borderRadius: 20, padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📈</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Your equity portfolio is empty</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.7 }}>Add your past clients. EquityPulse™ tracks their equity position and writes personalized annual review messages to send them.</p>
                <button onClick={() => setView("add")} style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Add First Client →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clients.map(c => {
                  const eq = calcEquity(c);
                  const refi = eq.ltv <= 80;
                  return (
                    <div key={c.id} onClick={() => { setSelected(c); setMessage(""); setView("detail"); }} style={{ background: "var(--charcoal)", border: `1px solid ${refi ? "rgba(16,185,129,0.25)" : "var(--border)"}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }} className="client-row">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Closed {fmt(c.closeDate)} · {c.loanType} · {eq.yearsOwned}yr{eq.yearsOwned !== 1 ? "s" : ""} owned</div>
                        {refi && <div style={{ fontSize: 11, color: "#10B981", fontWeight: 600, marginTop: 3 }}>🔥 Refi/HELOC candidate — LTV {eq.ltv}%</div>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--honey)" }}>${Math.round(eq.equity / 1000)}K</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>equity</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <style>{`@media(max-width:500px){.client-row{grid-template-columns:1fr!important}}`}</style>
          </div>
        )}

        {view === "add" && (
          <div style={{ maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>←</button>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>Add Past Client</h2>
            </div>
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="add-form">
                {[["Name *", "name", "text", "John Smith"], ["Phone", "phone", "tel", "(907) 555-0100"], ["Email", "email", "email", "john@email.com"], ["Original Purchase Price *", "originalPrice", "number", "400000"], ["Original Loan Amount", "originalLoan", "number", "360000"], ["Close Date", "closeDate", "date", ""], ["Original Interest Rate", "interestRate", "number", "7.0"], ["Current Est. Value", "currentValue", "number", "460000"]].map(([l, f, t, p]) => (
                  <div key={String(f)}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>{l}</label>
                    <input type={String(t)} placeholder={String(p)} value={(form as any)[String(f)] || ""} onChange={e => setForm(fr => ({ ...fr, [String(f)]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setView("list")} style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={addClient} disabled={!form.name || !form.originalPrice} style={{ flex: 2, background: (!form.name || !form.originalPrice) ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: (!form.name || !form.originalPrice) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Add to EquityPulse™ →</button>
              </div>
              <style>{`@media(max-width:500px){.add-form{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {view === "detail" && selected && (() => {
          const eq = calcEquity(selected);
          const refi = eq.ltv <= 80;
          return (
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button onClick={() => { setView("list"); setMessage(""); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>←</button>
              </div>
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 26, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, color: "var(--text-primary)", marginBottom: 4 }}>{selected.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Closed {fmt(selected.closeDate)} · {selected.loanType} · {eq.yearsOwned} year{eq.yearsOwned !== 1 ? "s" : ""} owned</div>
                    {selected.phone && <a href={`tel:${selected.phone}`} style={{ fontSize: 12, color: "var(--honey)", textDecoration: "none", marginTop: 4, display: "block" }}>📞 {selected.phone}</a>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: "var(--honey)" }}>${Math.round(eq.equity / 1000)}K</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>estimated equity</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="eq-grid">
                  {[["Original Price", `$${Math.round(parseInt(selected.originalPrice) / 1000)}K`, "var(--text-primary)"], ["Est. Value Now", `$${Math.round(eq.currentVal / 1000)}K`, "#F5A623"], ["Equity Gained", `+$${Math.round(eq.equityGained / 1000)}K`, "#10B981"], ["Current LTV", `${eq.ltv}%`, refi ? "#10B981" : "var(--text-primary)"]].map(([l, v, c]) => (
                    <div key={String(l)} style={{ background: "var(--slate)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: c as string }}>{v}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <style>{`@media(max-width:500px){.eq-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
                {refi && (
                  <div style={{ marginTop: 16, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>🔥 Refi / HELOC Opportunity</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>LTV is {eq.ltv}% — they may be able to remove PMI, access equity via HELOC, or explore a cash-out refi.</div>
                  </div>
                )}
              </div>
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>🤖 Annual Review Message</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>AI-written personal note to send {selected.name.split(" ")[0]}</div>
                  </div>
                  <button onClick={() => generateMessage(selected)} disabled={msgLoading} style={{ background: msgLoading ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: msgLoading ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    {msgLoading ? "Writing..." : "Generate →"}
                  </button>
                </div>
                {message && (
                  <div>
                    <div style={{ background: "var(--slate)", borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
                      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>{message}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => copy(message, "msg")} style={{ background: copied === "msg" ? "#10B981" : "rgba(245,166,35,0.1)", border: `1px solid ${copied === "msg" ? "#10B981" : "rgba(245,166,35,0.3)"}`, color: copied === "msg" ? "white" : "var(--honey)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{copied === "msg" ? "✓ Copied!" : "📋 Copy Message"}</button>
                      {selected.email && <a href={`mailto:${selected.email}?subject=Your Home Equity Update&body=${encodeURIComponent(message)}`} style={{ background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>Open in Email</a>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
