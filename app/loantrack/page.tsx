"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Milestone = {
  id: number;
  label: string;
  description: string;
  borrowerMessage: string;
  nextStep: string;
  emoji: string;
};

export const MILESTONES: Milestone[] = [
  { id:1, label:"Application Received",   emoji:"📋", description:"Your loan application has been received and is being reviewed.", borrowerMessage:"We've got everything we need to get started. You'll hear from us soon with next steps.", nextStep:"We'll review your application and reach out within 1 business day." },
  { id:2, label:"Pre-Approval Issued",    emoji:"✅", description:"You've been pre-approved! Your loan officer has reviewed your financials.", borrowerMessage:"Great news — you're pre-approved! This means you're ready to make offers with confidence.", nextStep:"Work with your Realtor to find the right home and submit an offer." },
  { id:3, label:"Under Contract",         emoji:"🏠", description:"Congratulations — your offer was accepted! Your loan is now in motion.", borrowerMessage:"You're under contract! The official loan process begins now. We'll be moving fast.", nextStep:"We're ordering the appraisal and beginning to process your loan file." },
  { id:4, label:"Appraisal Ordered",      emoji:"🔍", description:"An independent appraiser has been ordered to value the property.", borrowerMessage:"The appraisal has been ordered. An independent appraiser will visit the property within the next 5–7 business days.", nextStep:"Once the appraisal is complete, we move into full processing." },
  { id:5, label:"Processing Complete",    emoji:"⚙️", description:"Your loan file has been fully processed and is ready for underwriting.", borrowerMessage:"Your file is complete and clean. We're sending it to underwriting now — this is where the final credit decision is made.", nextStep:"Underwriting typically takes 3–5 business days. We'll update you the moment we hear." },
  { id:6, label:"In Underwriting",        emoji:"🔬", description:"An underwriter is reviewing your complete loan file for final approval.", borrowerMessage:"Your loan is in the hands of the underwriter. This is the most important review in the process. No news is good news.", nextStep:"If the underwriter needs anything, we'll contact you immediately. Otherwise, we're heading to Clear to Close." },
  { id:7, label:"Clear to Close! 🎉",     emoji:"🎯", description:"Your loan has been fully approved. You are cleared to close!", borrowerMessage:"YOU ARE CLEAR TO CLOSE! This is the best news in mortgage. Your loan is fully approved and we are scheduling your closing.", nextStep:"You'll receive your Closing Disclosure within 24 hours. Review it carefully — closing is just days away!" },
  { id:8, label:"Closed — Congratulations!", emoji:"🔑", description:"Your loan has closed. The keys are yours!", borrowerMessage:"You did it. You're a homeowner. This has been an honor — thank you for trusting me with one of the biggest moments of your life.", nextStep:"Enjoy your new home! I'll check in at 30, 60, and 90 days. You have my number — always." },
];

type Loan = {
  id: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerEmail: string;
  propertyAddress: string;
  loanAmount: string;
  targetClose: string;
  loanType: string;
  currentMilestone: number;
  loNote: string;
  milestoneHistory: { milestone: number; date: string; note: string }[];
  createdAt: string;
  active: boolean;
};

function newId() { return Math.random().toString(36).slice(2,14); }
function today() { return new Date().toISOString().split("T")[0]; }
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
const daysTo = (s: string) => s ? Math.ceil((new Date(s).getTime()-Date.now())/86400000) : null;

export default function LoanTrackPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [view, setView] = useState<"dashboard"|"add"|"detail">("dashboard");
  const [selected, setSelected] = useState<Loan|null>(null);
  const [copied, setCopied] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [form, setForm] = useState<Partial<Loan>>({ loanType:"Conventional", currentMilestone:1 });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
    const saved = localStorage.getItem("hma_loans");
    if (saved) setLoans(JSON.parse(saved));
  }, []);

  function save(updated: Loan[]) { setLoans(updated); localStorage.setItem("hma_loans", JSON.stringify(updated)); }

  function addLoan() {
    if (!form.borrowerName) return;
    const loan: Loan = {
      id: newId(),
      borrowerName: form.borrowerName||"",
      borrowerPhone: form.borrowerPhone||"",
      borrowerEmail: form.borrowerEmail||"",
      propertyAddress: form.propertyAddress||"",
      loanAmount: form.loanAmount||"",
      targetClose: form.targetClose||"",
      loanType: form.loanType||"Conventional",
      currentMilestone: 1,
      loNote: "",
      milestoneHistory: [{ milestone:1, date:today(), note:"Loan created" }],
      createdAt: today(),
      active: true,
    };
    save([loan, ...loans]);
    setForm({ loanType:"Conventional", currentMilestone:1 });
    setView("dashboard");
  }

  function advanceMilestone(loan: Loan) {
    if (loan.currentMilestone >= 8) return;
    const next = loan.currentMilestone + 1;
    const updated = loans.map(l => l.id===loan.id ? {
      ...l, currentMilestone: next, loNote: advanceNote,
      milestoneHistory: [...l.milestoneHistory, { milestone:next, date:today(), note:advanceNote||MILESTONES[next-1].label }],
      active: next < 8,
    } : l);
    save(updated);
    setSelected(updated.find(l => l.id===loan.id)||null);
    setAdvanceNote("");
  }

  function updateNote(id: string, note: string) {
    const updated = loans.map(l => l.id===id ? {...l, loNote:note} : l);
    save(updated);
    if (selected?.id===id) setSelected({...selected, loNote:note});
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(()=>setCopied(""),2000); });
  }

  if (!student) return null;

  const active = loans.filter(l => l.active);
  const closed = loans.filter(l => !l.active);

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <nav style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", fontSize:14 }}>← Dashboard</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📍</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>LoanTrack™</span>
        </div>
        <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ New Loan</button>
      </nav>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"28px 20px" }}>

        {/* ── DASHBOARD ── */}
        {view==="dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="stat-row">
              {[["Active Loans",active.length,"in pipeline","#F5A623"],["Closing Soon",active.filter(l=>{ const d=daysTo(l.targetClose); return d!==null&&d<=14; }).length,"within 14 days","#EF4444"],["CTC This Week",active.filter(l=>l.currentMilestone===7).length,"clear to close","#10B981"],["Closed",closed.length,"all time","#3B82F6"]].map(([l,v,s,c])=>(
                <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"15px 18px" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900, color:c as string }}>{v}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{s}</div>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:600px){.stat-row{grid-template-columns:repeat(2,1fr)!important}}`}</style>

            {loans.length===0 ? (
              <div style={{ background:"var(--charcoal)", border:"2px dashed var(--border)", borderRadius:20, padding:"56px 32px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:14 }}>📍</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>No loans tracked yet</div>
                <p style={{ fontSize:14, color:"var(--text-secondary)", maxWidth:400, margin:"0 auto 22px", lineHeight:1.7 }}>Add your first loan and send your borrower a tracking link. They'll always know exactly where their loan stands — without calling you.</p>
                <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>+ Add First Loan →</button>
              </div>
            ) : (
              <div>
                {active.length>0 && (
                  <div style={{ marginBottom:32 }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>Active Pipeline</h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {active.map(loan => {
                        const ms = MILESTONES[loan.currentMilestone-1];
                        const pct = Math.round(((loan.currentMilestone-1)/7)*100);
                        const days = daysTo(loan.targetClose);
                        return (
                          <div key={loan.id} onClick={() => { setSelected(loan); setView("detail"); }} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:"18px 20px", cursor:"pointer" }}>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:16, alignItems:"start", marginBottom:14 }} className="loan-row">
                              <div>
                                <div style={{ fontSize:16, fontWeight:700, color:"var(--text-primary)", marginBottom:3 }}>{loan.borrowerName}</div>
                                <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:6 }}>{loan.propertyAddress||"Address pending"} · {loan.loanType}{loan.loanAmount?` · $${parseInt(loan.loanAmount).toLocaleString()}`:""}</div>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <span style={{ fontSize:16 }}>{ms.emoji}</span>
                                  <span style={{ fontSize:13, fontWeight:600, color:"var(--honey)" }}>Step {loan.currentMilestone}/8 — {ms.label}</span>
                                  {days!==null && <span style={{ fontSize:11, color:days<=7?"#EF4444":days<=14?"#F5A623":"var(--text-muted)", fontWeight:600, padding:"2px 8px", borderRadius:100, background:days<=7?"rgba(239,68,68,0.1)":days<=14?"rgba(245,166,35,0.1)":"var(--slate)", border:`1px solid ${days<=7?"rgba(239,68,68,0.3)":days<=14?"rgba(245,166,35,0.3)":"var(--border)"}` }}>Close: {fmt(loan.targetClose)} ({days}d)</span>}
                                </div>
                              </div>
                              <div style={{ textAlign:"center", minWidth:56 }}>
                                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:pct>=87?"#10B981":pct>=50?"#F5A623":"#3B82F6" }}>{pct}%</div>
                                <div style={{ fontSize:10, color:"var(--text-muted)" }}>complete</div>
                              </div>
                            </div>
                            <div style={{ height:6, background:"var(--muted)", borderRadius:100, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${pct>=87?"#10B981":pct>=50?"#F5A623":"#3B82F6"},${pct>=87?"#10B981cc":pct>=50?"#FFC85C":"#60A5FA"})`, borderRadius:100, transition:"width 0.4s" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <style>{`@media(max-width:500px){.loan-row{grid-template-columns:1fr!important}}`}</style>
                  </div>
                )}
                {closed.length>0 && (
                  <div>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>Closed Loans 🔑</h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {closed.map(loan => (
                        <div key={loan.id} onClick={() => { setSelected(loan); setView("detail"); }} style={{ background:"var(--charcoal)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:12, padding:"14px 18px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <div>
                            <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)" }}>{loan.borrowerName}</div>
                            <div style={{ fontSize:12, color:"var(--text-muted)" }}>{loan.propertyAddress||"—"} · Closed {fmt(loan.milestoneHistory?.slice(-1)[0]?.date||"")}</div>
                          </div>
                          <span style={{ fontSize:13, color:"#10B981", fontWeight:700 }}>🔑 Closed</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── ADD LOAN ── */}
        {view==="add" && (
          <div style={{ maxWidth:580 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>Add New Loan</h2>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--honey)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Borrower Info</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }} className="form-2col">
                {[["Borrower Name *","borrowerName","text","John & Sarah Smith"],["Phone","borrowerPhone","tel","(907) 555-0100"],["Email","borrowerEmail","email","john@email.com"],["Property Address","propertyAddress","text","123 Main St, Anchorage AK"]].map(([l,f,t,p])=>(
                  <div key={String(f)} style={{ gridColumn:String(f)==="borrowerName"||String(f)==="propertyAddress"?"1/3":"auto" }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{l}</label>
                    <input type={String(t)} placeholder={String(p)} value={(form as any)[String(f)]||""} onChange={e=>setForm(f=>({...f,[String(f)]:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--honey)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Loan Details</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:24 }} className="form-3col">
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Loan Type</label>
                  <select value={form.loanType||"Conventional"} onChange={e=>setForm(f=>({...f,loanType:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none" }}>
                    {["Conventional","FHA","VA","USDA","Jumbo","Non-QM"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Loan Amount</label>
                  <input type="number" placeholder="450000" value={form.loanAmount||""} onChange={e=>setForm(f=>({...f,loanAmount:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Target Close Date</label>
                  <input type="date" value={form.targetClose||""} onChange={e=>setForm(f=>({...f,targetClose:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setView("dashboard")} style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:10, padding:"13px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={addLoan} disabled={!form.borrowerName} style={{ flex:2, background:!form.borrowerName?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:!form.borrowerName?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Create Loan + Get Borrower Link →</button>
              </div>
              <style>{`@media(max-width:580px){.form-2col,.form-3col{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {/* ── LOAN DETAIL ── */}
        {view==="detail" && selected && (() => {
          const ms = MILESTONES[selected.currentMilestone-1];
          const pct = Math.round(((selected.currentMilestone-1)/7)*100);
          const borrowerUrl = typeof window!=="undefined" ? `${window.location.origin}/lt/${selected.id}` : "";
          const nextMs = selected.currentMilestone < 8 ? MILESTONES[selected.currentMilestone] : null;
          return (
            <div style={{ maxWidth:680 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <button onClick={() => { setView("dashboard"); setSelected(null); }} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>← Pipeline</button>
              </div>

              {/* Borrower header */}
              <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:26, marginBottom:18 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:4 }}>{selected.borrowerName}</div>
                    <div style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:8 }}>{selected.propertyAddress||"Address TBD"} · {selected.loanType}{selected.loanAmount?` · $${parseInt(selected.loanAmount).toLocaleString()}`:""}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {selected.borrowerPhone && <a href={`tel:${selected.borrowerPhone}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>📞 {selected.borrowerPhone}</a>}
                      {selected.borrowerEmail && <a href={`mailto:${selected.borrowerEmail}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>✉️ {selected.borrowerEmail}</a>}
                      {selected.targetClose && <span style={{ fontSize:12, color:"var(--text-muted)" }}>Target close: {fmt(selected.targetClose)}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, color:pct>=87?"#10B981":pct>=50?"#F5A623":"#3B82F6" }}>{pct}%</div>
                    <div style={{ fontSize:11, color:"var(--text-muted)" }}>complete</div>
                  </div>
                </div>
                {/* Progress */}
                <div style={{ height:8, background:"var(--muted)", borderRadius:100, overflow:"hidden", marginBottom:10 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${pct>=87?"#10B981":"#F5A623"},${pct>=87?"#10B981cc":"#FFC85C"})`, borderRadius:100, transition:"width 0.4s" }} />
                </div>
                <div style={{ fontSize:12, color:"var(--honey)", fontWeight:600 }}>{ms.emoji} Step {selected.currentMilestone} of 8 — {ms.label}</div>
              </div>

              {/* Borrower link */}
              <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--honey)", marginBottom:6 }}>📱 Borrower Tracking Link — Share This</div>
                <div style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace", marginBottom:10, wordBreak:"break-all" }}>{borrowerUrl}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={() => copy(borrowerUrl,"url")} style={{ background:copied==="url"?"#10B981":"linear-gradient(135deg,#F5A623,#D4881A)", color:copied==="url"?"white":"#0A0A0B", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{copied==="url"?"✓ Copied!":"Copy Link"}</button>
                  {selected.borrowerPhone && <button onClick={() => copy(`Hi ${selected.borrowerName.split(" ")[0]}! You can track your loan status anytime here: ${borrowerUrl} — I'll update it at every milestone. Call me with any questions!`,"sms")} style={{ background:copied==="sms"?"#10B981":"var(--slate)", color:copied==="sms"?"white":"var(--text-primary)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{copied==="sms"?"✓ Copied!":"Copy SMS Text"}</button>}
                </div>
              </div>

              {/* Milestone timeline */}
              <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:22, marginBottom:18 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>Milestone Timeline</div>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {MILESTONES.map((m, i) => {
                    const done = m.id < selected.currentMilestone;
                    const current = m.id === selected.currentMilestone;
                    const future = m.id > selected.currentMilestone;
                    const histEntry = selected.milestoneHistory?.find(h => h.milestone===m.id);
                    return (
                      <div key={m.id} style={{ display:"flex", gap:14, paddingBottom: i<7?16:0 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:done?"#10B981":current?"linear-gradient(135deg,#F5A623,#D4881A)":"var(--slate)", border:`2px solid ${done?"#10B981":current?"#F5A623":"var(--border)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:done?14:12, fontWeight:700, color:done?"white":current?"#0A0A0B":"var(--text-muted)", flexShrink:0 }}>
                            {done?"✓":m.id}
                          </div>
                          {i<7 && <div style={{ width:2, flex:1, minHeight:16, background:done?"#10B981":"var(--border)", marginTop:2 }} />}
                        </div>
                        <div style={{ paddingBottom:4 }}>
                          <div style={{ fontSize:13, fontWeight:current?700:600, color:done?"#10B981":current?"var(--honey)":"var(--text-muted)", marginBottom:2 }}>{m.emoji} {m.label}</div>
                          {done && histEntry && <div style={{ fontSize:11, color:"var(--text-muted)" }}>{new Date(histEntry.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})} {histEntry.note&&histEntry.note!==m.label?`— ${histEntry.note}`:""}</div>}
                          {current && <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5, marginTop:2 }}>{m.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Advance milestone */}
              {selected.currentMilestone < 8 && (
                <div style={{ background:"var(--charcoal)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:16, padding:22, marginBottom:18 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>Advance to Next Milestone</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:14 }}>
                    Next: <strong style={{ color:"var(--honey)" }}>{nextMs?.emoji} {nextMs?.label}</strong>
                  </div>
                  <input value={advanceNote} onChange={e=>setAdvanceNote(e.target.value)} placeholder={`Optional note for ${selected.borrowerName.split(" ")[0]} (visible on their tracker)`} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:13, outline:"none", marginBottom:12, boxSizing:"border-box" }} />
                  <button onClick={() => advanceMilestone(selected)} style={{ width:"100%", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                    ✓ Mark as {nextMs?.label} →
                  </button>
                </div>
              )}
              {selected.currentMilestone===8 && (
                <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:16, padding:22, textAlign:"center", marginBottom:18 }}>
                  <div style={{ fontSize:32, marginBottom:8 }}>🔑</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"#10B981" }}>This loan is closed!</div>
                  <div style={{ fontSize:13, color:"var(--text-secondary)", marginTop:6 }}>Time to ask for a review and set up your 30-60-90 day follow-up.</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </main>
  );
}
