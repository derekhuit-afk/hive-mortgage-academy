"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Letter = {
  id: string; borrowerName: string; coborName: string;
  maxPrice: string; loanType: string; loanAmount: string;
  agentName: string; agentBrokerage: string; propertyAddress: string;
  expiresDate: string; loNote: string; createdAt: string;
};

function newId() { return Math.random().toString(36).slice(2, 14); }
function today() { return new Date().toISOString().split("T")[0]; }
function expDefault() {
  const d = new Date(); d.setDate(d.getDate() + 90);
  return d.toISOString().split("T")[0];
}
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
const fmtShort = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

export default function ApprovalLetterPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [letters, setLetters] = useState<Letter[]>([]);
  const [view, setView] = useState<"list" | "new" | "preview">("list");
  const [selected, setSelected] = useState<Letter | null>(null);
  const [copied, setCopied] = useState("");
  const [form, setForm] = useState<Partial<Letter>>({
    loanType: "Conventional", expiresDate: expDefault(), propertyAddress: "To Be Determined",
  });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
    const saved = localStorage.getItem("hma_letters");
    if (saved) setLetters(JSON.parse(saved));
  }, []);

  function save(u: Letter[]) { setLetters(u); localStorage.setItem("hma_letters", JSON.stringify(u)); }

  function create() {
    if (!form.borrowerName || !form.maxPrice) return;
    const l: Letter = {
      id: newId(), borrowerName: form.borrowerName || "", coborName: form.coborName || "",
      maxPrice: form.maxPrice || "", loanType: form.loanType || "Conventional",
      loanAmount: form.loanAmount || "", agentName: form.agentName || "",
      agentBrokerage: form.agentBrokerage || "", propertyAddress: form.propertyAddress || "To Be Determined",
      expiresDate: form.expiresDate || expDefault(), loNote: form.loNote || "",
      createdAt: today(),
    };
    const updated = [l, ...letters];
    save(updated);
    setSelected(l);
    setView("preview");
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(""), 2000); });
  }

  if (!student) return null;
  const shareBase = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📄</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>ApprovalLetter+</span>
        </div>
        <button onClick={() => { setForm({ loanType: "Conventional", expiresDate: expDefault(), propertyAddress: "To Be Determined" }); setView("new"); }} style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ New Letter</button>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>

        {/* LIST */}
        {view === "list" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 900, color: "var(--text-primary)", marginBottom: 6 }}>Pre-Approval Letters</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Co-branded letters for every borrower. Share a link or print to PDF.</p>
            </div>
            {letters.length === 0 ? (
              <div style={{ background: "var(--charcoal)", border: "2px dashed var(--border)", borderRadius: 20, padding: "48px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📄</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>No letters yet</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.7 }}>Create a professional co-branded pre-approval letter in 60 seconds. Share with your borrower and their agent instantly.</p>
                <button onClick={() => setView("new")} style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Create First Letter →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {letters.map(l => {
                  const expired = l.expiresDate && new Date(l.expiresDate) < new Date();
                  return (
                    <div key={l.id} onClick={() => { setSelected(l); setView("preview"); }} style={{ background: "var(--charcoal)", border: `1px solid ${expired ? "rgba(239,68,68,0.2)" : "var(--border)"}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }} className="letter-row">
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{l.borrowerName}{l.coborName ? ` & ${l.coborName}` : ""}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{l.loanType} · Up to ${parseInt(l.maxPrice).toLocaleString()} · Expires {fmtShort(l.expiresDate)}</div>
                        {l.agentName && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Agent: {l.agentName}{l.agentBrokerage ? ` · ${l.agentBrokerage}` : ""}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {expired && <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>Expired</span>}
                        <button onClick={e => { e.stopPropagation(); copy(`${shareBase}/al/${l.id}`, l.id); }} style={{ background: copied === l.id ? "#10B981" : "var(--slate)", color: copied === l.id ? "white" : "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{copied === l.id ? "✓" : "🔗"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <style>{`@media(max-width:500px){.letter-row{grid-template-columns:1fr!important}}`}</style>
          </div>
        )}

        {/* NEW */}
        {view === "new" && (
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>←</button>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "var(--text-primary)" }}>New Pre-Approval Letter</h2>
            </div>
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Borrower</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="form-grid">
                {[["Borrower Name *", "borrowerName", "John Smith"], ["Co-Borrower (optional)", "coborName", "Sarah Smith"]].map(([l, f, p]) => (
                  <div key={String(f)}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>{l}</label>
                    <input placeholder={String(p)} value={(form as any)[String(f)] || ""} onChange={e => setForm(f => ({ ...f, [String(f)]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Loan Details</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }} className="form-grid3">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>Max Purchase Price *</label>
                  <input type="number" placeholder="450000" value={form.maxPrice || ""} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>Loan Type</label>
                  <select value={form.loanType || "Conventional"} onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}>
                    {["Conventional", "FHA", "VA", "USDA", "Jumbo"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>Expires</label>
                  <input type="date" value={form.expiresDate || ""} onChange={e => setForm(f => ({ ...f, expiresDate: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Agent (optional)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }} className="form-grid">
                {[["Agent Name", "agentName", "Jane Doe"], ["Agent Brokerage", "agentBrokerage", "Keller Williams"]].map(([l, f, p]) => (
                  <div key={String(f)}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>{l}</label>
                    <input placeholder={String(p)} value={(form as any)[String(f)] || ""} onChange={e => setForm(f => ({ ...f, [String(f)]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>Property Address (or "To Be Determined")</label>
                <input placeholder="123 Main St, Anchorage AK or TBD" value={form.propertyAddress || ""} onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, display: "block" }}>Additional Note (optional)</label>
                <textarea rows={2} placeholder="e.g. Subject to satisfactory appraisal and clear title." value={form.loNote || ""} onChange={e => setForm(f => ({ ...f, loNote: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", color: "var(--text-primary)", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setView("list")} style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                <button onClick={create} disabled={!form.borrowerName || !form.maxPrice} style={{ flex: 2, background: (!form.borrowerName || !form.maxPrice) ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: (!form.borrowerName || !form.maxPrice) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Generate Letter →</button>
              </div>
              <style>{`@media(max-width:500px){.form-grid,.form-grid3{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {/* PREVIEW */}
        {view === "preview" && selected && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>← All Letters</button>
            </div>
            <div style={{ background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Share this link with your borrower and agent:</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => copy(`${shareBase}/al/${selected.id}`, "url")} style={{ background: copied === "url" ? "#10B981" : "linear-gradient(135deg,#F5A623,#D4881A)", color: copied === "url" ? "white" : "#0A0A0B", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{copied === "url" ? "✓ Copied!" : "🔗 Copy Link"}</button>
                <button onClick={() => window.print()} style={{ background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🖨️ Print PDF</button>
              </div>
            </div>
            {/* Letter preview */}
            <div id="letter-print" style={{ background: "white", borderRadius: 16, padding: "48px 56px", color: "#1a1a2e", fontFamily: "Georgia, serif", boxShadow: "0 4px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ borderBottom: "3px solid #D4881A", paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#D4881A", fontFamily: "'Playfair Display',serif", marginBottom: 4 }}>Pre-Approval Letter</div>
                    <div style={{ fontSize: 13, color: "#666" }}>Conditional Mortgage Pre-Approval</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#666" }}>{fmt(selected.createdAt)}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>Ref: {selected.id.toUpperCase()}</div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 24, lineHeight: 1.8 }}>
                <p style={{ fontSize: 14, marginBottom: 16, color: "#333" }}>To Whom It May Concern:</p>
                <p style={{ fontSize: 14, marginBottom: 16, color: "#333" }}>
                  This letter is to confirm that <strong>{selected.borrowerName}{selected.coborName ? ` and ${selected.coborName}` : ""}</strong> {selected.coborName ? "have" : "has"} been pre-approved for a <strong>{selected.loanType}</strong> mortgage loan, subject to the conditions outlined herein.
                </p>
                <div style={{ background: "#FFF8EE", border: "2px solid #F5A623", borderRadius: 12, padding: "20px 24px", margin: "24px 0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {[["Maximum Purchase Price", `$${parseInt(selected.maxPrice).toLocaleString()}`], ["Loan Program", selected.loanType], ["Property Address", selected.propertyAddress || "To Be Determined"], ["Approval Expires", fmt(selected.expiresDate)]].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: "Arial, sans-serif" }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 14, marginBottom: 16, color: "#333" }}>
                  This pre-approval is based upon information provided by the applicant(s) and is subject to verification of income, assets, employment, credit, and a satisfactory appraisal of the subject property. This letter does not constitute a commitment to lend.
                </p>
                {selected.loNote && <p style={{ fontSize: 14, marginBottom: 16, color: "#333" }}>{selected.loNote}</p>}
              </div>
              <div style={{ borderTop: "1px solid #ddd", paddingTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "Arial, sans-serif" }}>Loan Officer</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{student?.name}</div>
                  {student?.nmls_number && <div style={{ fontSize: 13, color: "#666" }}>NMLS #{student.nmls_number}</div>}
                  <div style={{ fontSize: 13, color: "#666" }}>Hive Mortgage Academy</div>
                  {student?.email && <div style={{ fontSize: 13, color: "#D4881A" }}>{student.email}</div>}
                </div>
                {selected.agentName && (
                  <div>
                    <div style={{ fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "Arial, sans-serif" }}>Buyer's Agent</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{selected.agentName}</div>
                    {selected.agentBrokerage && <div style={{ fontSize: 13, color: "#666" }}>{selected.agentBrokerage}</div>}
                  </div>
                )}
              </div>
            </div>
            <style>{`@media print{nav,div[style*="border: 1px solid rgba(245"]{display:none!important}#letter-print{box-shadow:none!important;border-radius:0!important}}`}</style>
          </div>
        )}
      </div>
    </main>
  );
}
