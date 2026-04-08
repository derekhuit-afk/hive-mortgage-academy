"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ReviewStatus = "pending"|"day3-sent"|"day10-sent"|"day30-sent"|"reviewed"|"declined";
type ReviewRecord = {
  id: string; borrowerName: string; borrowerPhone: string; borrowerEmail: string;
  propertyAddress: string; closeDate: string; status: ReviewStatus;
  requestHistory: { date: string; type: string }[];
  createdAt: string;
};

const PLATFORMS = [
  { key:"google", label:"Google", emoji:"🔍", url:"https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID", color:"#4285F4", note:"Most important — replace YOUR_PLACE_ID with your Google Business Profile ID" },
  { key:"zillow",  label:"Zillow",  emoji:"🏠", url:"https://www.zillow.com/lender-profile/YOUR_PROFILE/", color:"#0074E4", note:"Replace with your Zillow profile URL" },
  { key:"facebook",label:"Facebook",emoji:"👍", url:"https://www.facebook.com/YOUR_PAGE/reviews", color:"#1877F2", note:"Replace with your Facebook page URL" },
];

const SEQ = [
  { day:3,  key:"day3-sent",  label:"Day 3 Text", emoji:"📱", subject:"Strike while the iron is hot", tip:"They just got keys. Emotions are peak. This is the highest-converting moment." },
  { day:10, key:"day10-sent", label:"Day 10 Follow-Up", emoji:"💬", subject:"Gentle reminder", tip:"Still warm. One more ask if Day 3 didn't convert." },
  { day:30, key:"day30-sent", label:"Day 30 Final Ask", emoji:"📧", subject:"Last touch", tip:"Final ask. After this, move them to your past-client nurture sequence." },
];

function newId() { return Math.random().toString(36).slice(2,10); }
function today() { return new Date().toISOString().split("T")[0]; }
function daysSince(d: string) { return d ? Math.floor((Date.now()-new Date(d).getTime())/86400000) : 0; }
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—";

function buildScript(type: string, name: string, loName: string, googleUrl: string): string {
  const first = name.split(" ")[0];
  const loFirst = loName?.split(" ")[0]||"your LO";
  const scripts: Record<string,string> = {
    "day3-sent": `Hey ${first}! Congratulations again on your new home — it was truly an honor to be part of this. If you have 2 minutes, a Google review would mean the world to me and helps other families find the right LO. Here's the link: ${googleUrl}\n\nThank you so much — enjoy every moment in your new home! 🏡\n— ${loFirst}`,
    "day10-sent": `Hi ${first}, ${loFirst} here! Hope you're settling in and loving the new place. I wanted to check in and also gently follow up on that Google review if you haven't had a chance yet — it truly makes a difference for my business. Takes 2 minutes: ${googleUrl}\n\nNo pressure at all — just grateful to have worked with you! 😊`,
    "day30-sent": `Hi ${first}! It's been about a month since you closed — how's the home treating you? I'd love to hear an update. Also, this is my last ask: if you've been meaning to leave a Google review and just haven't gotten to it, here's the link: ${googleUrl}\n\nEither way, I'm always here if you need anything. Reach out anytime. — ${loFirst}`,
  };
  return scripts[type] || "";
}

export default function ReviewLoopPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [view, setView] = useState<"dashboard"|"add"|"detail">("dashboard");
  const [selected, setSelected] = useState<ReviewRecord|null>(null);
  const [copied, setCopied] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [form, setForm] = useState<Partial<ReviewRecord>>({});

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    const saved = localStorage.getItem("hma_reviews");
    if (saved) setRecords(JSON.parse(saved));
    const gUrl = localStorage.getItem("hma_google_url")||"";
    setGoogleUrl(gUrl);

    // Auto-import closed loans from LoanTrack
    const loansRaw = localStorage.getItem("hma_loans");
    if (loansRaw) {
      const loans = JSON.parse(loansRaw).filter((l: any) => !l.active);
      const existingIds = saved ? JSON.parse(saved).map((r: ReviewRecord) => r.id) : [];
      const newRecords: ReviewRecord[] = loans
        .filter((l: any) => !existingIds.includes(l.id))
        .map((l: any) => ({
          id: l.id, borrowerName: l.borrowerName, borrowerPhone: l.borrowerPhone||"",
          borrowerEmail: l.borrowerEmail||"", propertyAddress: l.propertyAddress||"",
          closeDate: l.milestoneHistory?.slice(-1)[0]?.date||today(),
          status:"pending" as ReviewStatus, requestHistory:[], createdAt: today(),
        }));
      if (newRecords.length > 0) {
        const all = saved ? [...JSON.parse(saved), ...newRecords] : newRecords;
        setRecords(all);
        localStorage.setItem("hma_reviews", JSON.stringify(all));
      }
    }
  }, []);

  function save(updated: ReviewRecord[]) { setRecords(updated); localStorage.setItem("hma_reviews", JSON.stringify(updated)); }

  function addRecord() {
    if (!form.borrowerName) return;
    const r: ReviewRecord = {
      id: newId(), borrowerName: form.borrowerName||"", borrowerPhone: form.borrowerPhone||"",
      borrowerEmail: form.borrowerEmail||"", propertyAddress: form.propertyAddress||"",
      closeDate: form.closeDate||today(), status:"pending", requestHistory:[], createdAt: today(),
    };
    save([r,...records]);
    setForm({});
    setView("dashboard");
  }

  function markSent(id: string, type: string) {
    const updated = records.map(r => r.id===id ? {
      ...r, status: type as ReviewStatus,
      requestHistory:[...r.requestHistory,{date:today(),type}],
    } : r);
    save(updated);
    if (selected?.id===id) setSelected(updated.find(r=>r.id===id)||null);
  }

  function markReviewed(id: string) {
    const updated = records.map(r => r.id===id ? {...r,status:"reviewed" as ReviewStatus} : r);
    save(updated);
    if (selected?.id===id) setSelected(updated.find(r=>r.id===id)||null);
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(()=>{ setCopied(key); setTimeout(()=>setCopied(""),2000); });
  }

  if (!student) return null;

  const pending = records.filter(r => r.status!=="reviewed" && r.status!=="declined");
  const reviewed = records.filter(r => r.status==="reviewed");
  const convRate = records.length ? Math.round((reviewed.length/records.length)*100) : 0;

  // Determine next action for each record
  function nextAction(r: ReviewRecord): typeof SEQ[0]|null {
    const days = daysSince(r.closeDate);
    if (r.status==="pending" && days>=3) return SEQ[0];
    if (r.status==="day3-sent" && days>=10) return SEQ[1];
    if (r.status==="day10-sent" && days>=30) return SEQ[2];
    return null;
  }

  const actionNeeded = pending.filter(r => nextAction(r));

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <nav style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", fontSize:14 }}>← Dashboard</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⭐</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>ReviewLoop™</span>
        </div>
        <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Add Closing</button>
      </nav>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px" }}>

        {view==="dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="stat-row">
              {[["Total Closings",records.length,"tracked","var(--text-primary)"],["Reviews Received",reviewed.length,"confirmed","#10B981"],["Conversion Rate",`${convRate}%`,"closed → reviewed","#F5A623"],["Action Needed",actionNeeded.length,"ready to send","#EF4444"]].map(([l,v,s,c])=>(
                <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"15px 18px" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:c as string }}>{v}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{s}</div>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:580px){.stat-row{grid-template-columns:repeat(2,1fr)!important}}`}</style>

            {/* Google URL setup */}
            {!googleUrl && (
              <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--honey)", marginBottom:6 }}>⚠️ Set your Google review link first</div>
                <div style={{ fontSize:12, color:"var(--text-secondary)", marginBottom:10 }}>Find your Google Business Profile review link and paste it here — all your review requests will use it.</div>
                <div style={{ display:"flex", gap:10 }}>
                  <input placeholder="https://search.google.com/local/writereview?placeid=..." style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px", color:"var(--text-primary)", fontSize:13, outline:"none" }} id="google-url-input" />
                  <button onClick={() => { const v=(document.getElementById("google-url-input") as HTMLInputElement).value; if(v){setGoogleUrl(v);localStorage.setItem("hma_google_url",v);} }} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Save</button>
                </div>
              </div>
            )}

            {records.length===0 ? (
              <div style={{ background:"var(--charcoal)", border:"2px dashed var(--border)", borderRadius:20, padding:"48px 32px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:14 }}>⭐</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>No closings tracked yet</div>
                <p style={{ fontSize:14, color:"var(--text-secondary)", maxWidth:400, margin:"0 auto 20px", lineHeight:1.7 }}>Add your closed loans and ReviewLoop™ will tell you exactly when to ask for a review and give you the perfect script every time. Closed loans from LoanTrack™ are auto-imported.</p>
                <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"12px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Add First Closing →</button>
              </div>
            ) : (
              <div>
                {actionNeeded.length>0 && (
                  <div style={{ marginBottom:28 }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"#EF4444", marginBottom:14 }}>🔴 Action Needed — Send Now</h2>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {actionNeeded.map(r => {
                        const action = nextAction(r)!;
                        const days = daysSince(r.closeDate);
                        return (
                          <div key={r.id} style={{ background:"var(--charcoal)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:14, padding:"16px 18px", display:"grid", gridTemplateColumns:"1fr auto", gap:14, alignItems:"center" }} className="action-row">
                            <div>
                              <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:3 }}>{r.borrowerName}</div>
                              <div style={{ fontSize:12, color:"var(--text-secondary)" }}>{r.propertyAddress||"—"} · Closed {fmt(r.closeDate)} ({days} days ago)</div>
                              <div style={{ fontSize:12, color:"#EF4444", fontWeight:600, marginTop:4 }}>{action.emoji} Ready for {action.label} — {action.tip}</div>
                            </div>
                            <button onClick={() => { setSelected(r); setView("detail"); }} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Get Script →</button>
                          </div>
                        );
                      })}
                    </div>
                    <style>{`@media(max-width:580px){.action-row{grid-template-columns:1fr!important}}`}</style>
                  </div>
                )}

                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>All Closings</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {records.map(r => {
                    const statusColors: Record<ReviewStatus,string> = { pending:"#64748B", "day3-sent":"#3B82F6", "day10-sent":"#8B5CF6", "day30-sent":"#F5A623", reviewed:"#10B981", declined:"#EF4444" };
                    const statusLabels: Record<ReviewStatus,string> = { pending:"Pending","day3-sent":"Day 3 Sent","day10-sent":"Day 10 Sent","day30-sent":"Day 30 Sent",reviewed:"✓ Reviewed",declined:"Declined" };
                    return (
                      <div key={r.id} onClick={()=>{setSelected(r);setView("detail");}} style={{ background:"var(--charcoal)", border:`1px solid ${r.status==="reviewed"?"rgba(16,185,129,0.2)":"var(--border)"}`, borderRadius:12, padding:"13px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:2 }}>{r.borrowerName}</div>
                          <div style={{ fontSize:12, color:"var(--text-muted)" }}>{r.propertyAddress||"—"} · Closed {fmt(r.closeDate)}</div>
                        </div>
                        <div style={{ fontSize:11, padding:"3px 10px", borderRadius:100, background:`${statusColors[r.status]}15`, color:statusColors[r.status], border:`1px solid ${statusColors[r.status]}30`, fontWeight:600, whiteSpace:"nowrap" }}>{statusLabels[r.status]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {view==="add" && (
          <div style={{ maxWidth:520 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>Add Closing</h2>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }} className="form-add">
                {[["Borrower Name *","borrowerName","text","John Smith"],["Phone","borrowerPhone","tel","(907) 555-0100"],["Email","borrowerEmail","email","john@email.com"],["Property Address","propertyAddress","text","123 Main St"]].map(([l,f,t,p])=>(
                  <div key={String(f)} style={{ gridColumn:String(f)==="borrowerName"||String(f)==="propertyAddress"?"1/3":"auto" }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{l}</label>
                    <input type={String(t)} placeholder={String(p)} value={(form as any)[String(f)]||""} onChange={e=>setForm(f=>({...f,[String(f)]:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
                <div style={{ gridColumn:"1/3" }}>
                  <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Close Date *</label>
                  <input type="date" value={form.closeDate||""} onChange={e=>setForm(f=>({...f,closeDate:e.target.value}))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button onClick={()=>setView("dashboard")} style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:10, padding:"12px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={addRecord} disabled={!form.borrowerName||!form.closeDate} style={{ flex:2, background:(!form.borrowerName||!form.closeDate)?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:(!form.borrowerName||!form.closeDate)?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Add to ReviewLoop™ →</button>
              </div>
              <style>{`@media(max-width:500px){.form-add{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {view==="detail" && selected && (
          <div style={{ maxWidth:620 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <button onClick={()=>setView("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:24, marginBottom:18 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:4 }}>{selected.borrowerName}</div>
              <div style={{ fontSize:13, color:"var(--text-secondary)", marginBottom:4 }}>{selected.propertyAddress||"—"} · Closed {fmt(selected.closeDate)}</div>
              <div style={{ fontSize:13, color:"var(--text-secondary)" }}>Day {daysSince(selected.closeDate)} post-close</div>
            </div>

            {/* 3-stage sequence */}
            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:20 }}>
              {SEQ.map(seq => {
                const sent = selected.requestHistory?.some(h=>h.type===seq.key);
                const script = buildScript(seq.key, selected.borrowerName, student?.name, googleUrl||PLATFORMS[0].url);
                const isNext = nextAction(selected)?.key===seq.key;
                return (
                  <div key={seq.key} style={{ background:"var(--charcoal)", border:`1px solid ${isNext?"rgba(245,166,35,0.35)":sent?"rgba(16,185,129,0.2)":"var(--border)"}`, borderRadius:16, padding:22 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:18 }}>{seq.emoji}</span>
                          <span style={{ fontSize:14, fontWeight:700, color:sent?"#10B981":isNext?"var(--honey)":"var(--text-primary)" }}>{seq.label}</span>
                          {sent && <span style={{ fontSize:11, color:"#10B981", fontWeight:700, background:"rgba(16,185,129,0.1)", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(16,185,129,0.3)" }}>Sent ✓</span>}
                          {isNext && !sent && <span style={{ fontSize:11, color:"var(--honey)", fontWeight:700, background:"rgba(245,166,35,0.1)", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(245,166,35,0.3)" }}>Ready Now</span>}
                        </div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>Send on Day {seq.day} · {seq.tip}</div>
                      </div>
                    </div>
                    {script && (
                      <div style={{ background:"var(--slate)", borderRadius:10, padding:"13px 15px", fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, whiteSpace:"pre-wrap", marginBottom:12 }}>{script}</div>
                    )}
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>copy(script,seq.key)} style={{ background:copied===seq.key?"#10B981":"rgba(245,166,35,0.1)", border:`1px solid ${copied===seq.key?"#10B981":"rgba(245,166,35,0.3)"}`, color:copied===seq.key?"white":"var(--honey)", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>{copied===seq.key?"✓ Copied!":"📋 Copy Script"}</button>
                      {!sent && <button onClick={()=>markSent(selected.id,seq.key)} style={{ background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>Mark as Sent</button>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Platform links */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:20, marginBottom:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Review Platforms</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {PLATFORMS.map(p=>(
                  <div key={p.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18 }}>{p.emoji}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{p.label}</span>
                    </div>
                    <button onClick={()=>copy(googleUrl||p.url,`plat-${p.key}`)} style={{ background:copied===`plat-${p.key}`?"#10B981":"var(--slate)", color:copied===`plat-${p.key}`?"white":"var(--text-primary)", border:"1px solid var(--border)", borderRadius:7, padding:"6px 12px", fontSize:11, fontWeight:700, cursor:"pointer" }}>{copied===`plat-${p.key}`?"✓ Copied":"Copy Link"}</button>
                  </div>
                ))}
              </div>
            </div>

            {selected.status!=="reviewed" && (
              <button onClick={()=>markReviewed(selected.id)} style={{ width:"100%", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", color:"#10B981", borderRadius:10, padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer" }}>✓ Mark as Reviewed — They Left a Review!</button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
