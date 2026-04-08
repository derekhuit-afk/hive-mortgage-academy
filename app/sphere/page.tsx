"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type HomeStatus = "renting"|"owns-refi"|"buying-soon"|"owns-settled"|"unknown";
type Relationship = "family"|"close-friend"|"work-friend"|"neighbor"|"acquaintance"|"former-client"|"other";
type ContactStage = "not-contacted"|"attempted"|"connected"|"nurturing"|"warm-lead"|"referred";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: Relationship;
  homeStatus: HomeStatus;
  stage: ContactStage;
  notes: string;
  touchpoints: { date: string; note: string }[];
  score: number;
  createdAt: string;
};

const RELATIONSHIPS: { key: Relationship; label: string; emoji: string; score: number }[] = [
  { key:"family",        label:"Family",         emoji:"👨‍👩‍👧", score:10 },
  { key:"close-friend",  label:"Close Friend",   emoji:"🤝",    score:9  },
  { key:"former-client", label:"Former Client",  emoji:"⭐",    score:10 },
  { key:"work-friend",   label:"Work Friend",    emoji:"💼",    score:7  },
  { key:"neighbor",      label:"Neighbor",       emoji:"🏠",    score:6  },
  { key:"acquaintance",  label:"Acquaintance",   emoji:"👋",    score:4  },
  { key:"other",         label:"Other",          emoji:"💬",    score:3  },
];

const HOME_STATUSES: { key: HomeStatus; label: string; emoji: string; score: number }[] = [
  { key:"buying-soon",   label:"Likely Buying Soon",  emoji:"🔑", score:10 },
  { key:"renting",       label:"Currently Renting",   emoji:"🏢", score:9  },
  { key:"owns-refi",     label:"Owns — May Refi",     emoji:"📈", score:7  },
  { key:"unknown",       label:"Not Sure",            emoji:"❓", score:5  },
  { key:"owns-settled",  label:"Owns — Settled",      emoji:"🏡", score:2  },
];

const STAGES: { key: ContactStage; label: string; color: string }[] = [
  { key:"not-contacted", label:"Not Contacted", color:"#64748B" },
  { key:"attempted",     label:"Attempted",     color:"#3B82F6" },
  { key:"connected",     label:"Connected",     color:"#8B5CF6" },
  { key:"nurturing",     label:"Nurturing",     color:"#F5A623" },
  { key:"warm-lead",     label:"Warm Lead",     color:"#EF4444" },
  { key:"referred",      label:"Referred! 🔥",  color:"#10B981" },
];

function calcScore(c: Partial<Contact>, lastTouchDays: number): number {
  const relScore = RELATIONSHIPS.find(r => r.key===c.relationship)?.score || 3;
  const homeScore = HOME_STATUSES.find(h => h.key===c.homeStatus)?.score || 5;
  const touchScore = lastTouchDays > 90 ? 10 : lastTouchDays > 30 ? 8 : lastTouchDays > 7 ? 5 : 2;
  return Math.round((relScore * 0.35 + homeScore * 0.45 + touchScore * 0.2) * 10);
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function today() { return new Date().toISOString().split("T")[0]; }
function newId() { return Math.random().toString(36).slice(2,10); }
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month:"short", day:"numeric" }) : "—";

function formatScript(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) return (
      <div key={i} style={{ fontSize:11, fontWeight:800, color:"var(--honey)", textTransform:"uppercase", letterSpacing:"0.1em", margin:"18px 0 8px", padding:"4px 10px", background:"rgba(245,166,35,0.08)", borderRadius:6, display:"inline-block" }}>
        {line.replace(/\*\*/g,"")}
      </div>
    );
    if (line.trim()==="") return <div key={i} style={{ height:6 }} />;
    return <p key={i} style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, margin:"3px 0" }}>{line}</p>;
  });
}

// ─── Bulk import parser ────────────────────────────────────────────────────
function parseBulkText(text: string): Partial<Contact>[] {
  return text.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split(/[,\t]+/).map(p => p.trim());
    return { name: parts[0]||"", phone: parts[1]||"", email: parts[2]||"", relationship:"other", homeStatus:"unknown", stage:"not-contacted", notes:"", touchpoints:[] };
  }).filter(c => c.name);
}

export default function SpherePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [view, setView] = useState<"dashboard"|"list"|"add"|"detail"|"bulk">("dashboard");
  const [selected, setSelected] = useState<Contact|null>(null);
  const [script, setScript] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);
  const [touchNote, setTouchNote] = useState("");
  const [copied, setCopied] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [filterStage, setFilterStage] = useState<ContactStage|"all">("all");
  const [filterRel, setFilterRel] = useState<Relationship|"all">("all");
  const [searchQ, setSearchQ] = useState("");

  const [form, setForm] = useState<Partial<Contact>>({
    name:"", phone:"", email:"", relationship:"close-friend",
    homeStatus:"unknown", stage:"not-contacted", notes:"", touchpoints:[],
  });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
    const saved = localStorage.getItem("hma_sphere");
    if (saved) setContacts(JSON.parse(saved));
  }, []);

  function save(updated: Contact[]) {
    setContacts(updated);
    localStorage.setItem("hma_sphere", JSON.stringify(updated));
  }

  function addContact(c?: Partial<Contact>) {
    const data = c || form;
    if (!data.name) return;
    const lastTouch = data.touchpoints?.slice(-1)[0]?.date || "";
    const score = calcScore(data, daysSince(lastTouch));
    const contact: Contact = {
      id: newId(), name: data.name||"", phone: data.phone||"", email: data.email||"",
      relationship: data.relationship||"other", homeStatus: data.homeStatus||"unknown",
      stage: data.stage||"not-contacted", notes: data.notes||"",
      touchpoints: data.touchpoints||[], score, createdAt: today(),
    };
    const updated = [...contacts, contact].sort((a,b) => b.score-a.score);
    save(updated);
    setForm({ name:"", phone:"", email:"", relationship:"close-friend", homeStatus:"unknown", stage:"not-contacted", notes:"", touchpoints:[] });
  }

  function importBulk() {
    const parsed = parseBulkText(bulkText);
    const newContacts: Contact[] = parsed.map(p => ({
      ...p, id: newId(), score: calcScore(p, 999),
      stage:"not-contacted" as ContactStage, touchpoints:[], createdAt: today(),
    } as Contact));
    const updated = [...contacts, ...newContacts].sort((a,b) => b.score-a.score);
    save(updated);
    setBulkText("");
    setView("list");
  }

  function logTouch(id: string, note: string) {
    const updated = contacts.map(c => {
      if (c.id!==id) return c;
      const tp = { date: today(), note: note||"Touchpoint logged" };
      const tps = [...(c.touchpoints||[]), tp];
      const score = calcScore(c, 0);
      return { ...c, touchpoints: tps, score };
    }).sort((a,b) => b.score-a.score);
    save(updated);
    if (selected?.id===id) {
      const upd = updated.find(c => c.id===id);
      if (upd) setSelected(upd);
    }
    setTouchNote("");
  }

  function updateContact(id: string, changes: Partial<Contact>) {
    const updated = contacts.map(c => {
      if (c.id!==id) return c;
      const merged = {...c,...changes};
      const lastTouch = merged.touchpoints?.slice(-1)[0]?.date || "";
      return {...merged, score: calcScore(merged, daysSince(lastTouch))};
    }).sort((a,b) => b.score-a.score);
    save(updated);
    const upd = updated.find(c => c.id===id);
    if (upd && selected?.id===id) setSelected(upd);
  }

  async function generateScript(contact: Contact) {
    setScriptLoading(true); setScript("");
    try {
      const res = await fetch("/api/sphere-script", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          loName: student?.name, loNmls: student?.nmls_number,
          loMarket: student?.market,
          contactName: contact.name,
          relationship: RELATIONSHIPS.find(r=>r.key===contact.relationship)?.label,
          homeStatus: HOME_STATUSES.find(h=>h.key===contact.homeStatus)?.label,
          notes: contact.notes,
        }),
      });
      const data = await res.json();
      setScript(data.content||"");
    } catch { /* silent */ } finally { setScriptLoading(false); }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key); setTimeout(() => setCopied(""),2000);
    });
  }

  if (!student) return null;

  // Computed stats
  const contacted = contacts.filter(c => c.stage!=="not-contacted").length;
  const warmLeads = contacts.filter(c => c.stage==="warm-lead"||c.stage==="referred").length;
  const referred = contacts.filter(c => c.stage==="referred").length;
  const todayList = contacts.filter(c => c.stage!=="referred").sort((a,b) => b.score-a.score).slice(0,5);
  const pct = contacts.length ? Math.round((contacted/contacts.length)*100) : 0;

  // Filtered list
  const filtered = contacts.filter(c => {
    if (filterStage!=="all" && c.stage!==filterStage) return false;
    if (filterRel!=="all" && c.relationship!==filterRel) return false;
    if (searchQ && !c.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", fontSize:14 }}>← Dashboard</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🌐</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>SphereEngine™</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["dashboard","Home"],["list","All"],["add","+ Add"],["bulk","Import"]].map(([v,l]) => (
            <button key={v} onClick={() => setView(v as any)} style={{ background:view===v?"rgba(245,166,35,0.1)":"none", border:`1px solid ${view===v?"rgba(245,166,35,0.3)":"transparent"}`, borderRadius:7, color:view===v?"var(--honey)":"var(--text-muted)", fontSize:12, fontWeight:600, padding:"5px 10px", cursor:"pointer" }}>{l}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"28px 20px" }}>

        {/* ── DASHBOARD ── */}
        {view==="dashboard" && (
          <div>
            {/* Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="stat-grid">
              {[
                ["Total Contacts", contacts.length, contacts.length<100?`${100-contacts.length} to go`:"100 achieved 🎉","var(--text-primary)"],
                ["Contacted", contacted, `${pct}% of sphere`,"#3B82F6"],
                ["Warm Leads", warmLeads, "need follow-up","#F5A623"],
                ["Referrals", referred, "closed loop 🔥","#10B981"],
              ].map(([l,v,s,c]) => (
                <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:c as string }}>{v}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)", marginTop:2 }}>{l}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{s}</div>
                </div>
              ))}
            </div>
            <style>{`@media(max-width:600px){.stat-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>

            {/* Progress bar */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:"18px 22px", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>Sphere Coverage — First 100 Contacts</span>
                <span style={{ fontSize:13, fontWeight:700, color:"var(--honey)" }}>{contacts.length}/100</span>
              </div>
              <div style={{ height:10, background:"var(--muted)", borderRadius:100, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(contacts.length,100)}%`, background:"linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius:100, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6 }}>
                {contacts.length<100 ? `Add ${100-contacts.length} more contacts to complete your First 100` : "🎉 First 100 complete — your sphere is activated"}
              </div>
            </div>

            {/* Today's List */}
            <div style={{ marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)", marginBottom:2 }}>📋 Contact These 5 Today</h2>
                  <p style={{ fontSize:13, color:"var(--text-secondary)" }}>Ranked by relationship warmth + homeownership likelihood. Scripts ready on click.</p>
                </div>
                <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Add Contact</button>
              </div>
              {contacts.length===0 ? (
                <div style={{ background:"var(--charcoal)", border:"2px dashed var(--border)", borderRadius:16, padding:"48px 32px", textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🌐</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Your sphere is empty</div>
                  <p style={{ fontSize:14, color:"var(--text-secondary)", maxWidth:400, margin:"0 auto 20px", lineHeight:1.7 }}>Add your first contacts — family, close friends, coworkers, neighbors. SphereEngine ranks them by priority and writes your outreach scripts automatically.</p>
                  <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                    <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"12px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Add One by One</button>
                    <button onClick={() => setView("bulk")} style={{ background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-primary)", borderRadius:10, padding:"12px 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>📋 Bulk Import List</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {todayList.map((c, i) => {
                    const rel = RELATIONSHIPS.find(r=>r.key===c.relationship);
                    const home = HOME_STATUSES.find(h=>h.key===c.homeStatus);
                    const stage = STAGES.find(s=>s.key===c.stage);
                    const lastTouch = c.touchpoints?.slice(-1)[0]?.date;
                    const days = daysSince(lastTouch||c.createdAt);
                    return (
                      <div key={c.id} style={{ background:"var(--charcoal)", border:`1px solid ${i===0?"rgba(245,166,35,0.35)":"var(--border)"}`, borderRadius:14, padding:"16px 20px", display:"grid", gridTemplateColumns:"32px 1fr auto", gap:16, alignItems:"center" }} className="today-card">
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:i===0?"var(--honey)":"var(--text-muted)", textAlign:"center" }}>{i+1}</div>
                        <div>
                          <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>{c.name}</div>
                          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", color:"var(--honey)" }}>{rel?.emoji} {rel?.label}</span>
                            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:100, background:`${home?.score||5 > 7 ? "rgba(16,185,129,0.1)" : "var(--slate)"}`, border:`1px solid ${home?.score||5 > 7 ? "rgba(16,185,129,0.2)" : "var(--border)"}`, color:home?.score||5 > 7 ? "#10B981" : "var(--text-muted)" }}>{home?.emoji} {home?.label}</span>
                            <span style={{ fontSize:11, color:"var(--text-muted)" }}>Last touch: {days>365?"Never":days===0?"Today":`${days}d ago`}</span>
                          </div>
                        </div>
                        <button onClick={() => { setSelected(c); setScript(""); setView("detail"); }} style={{ background:i===0?"linear-gradient(135deg,#F5A623,#D4881A)":"var(--slate)", color:i===0?"#0A0A0B":"var(--text-primary)", border:`1px solid ${i===0?"transparent":"var(--border)"}`, borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                          Get Script →
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <style>{`@media(max-width:600px){.today-card{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {/* ── ALL CONTACTS LIST ── */}
        {view==="list" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>All Contacts ({filtered.length})</h2>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search name..." style={{ background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", color:"var(--text-primary)", fontSize:13, outline:"none", width:160 }} />
                <select value={filterStage} onChange={e=>setFilterStage(e.target.value as any)} style={{ background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"8px 12px", color:"var(--text-primary)", fontSize:13, outline:"none" }}>
                  <option value="all">All Stages</option>
                  {STAGES.map(s=><option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Add</button>
              </div>
            </div>
            {filtered.length===0 ? (
              <div style={{ textAlign:"center", padding:40, color:"var(--text-muted)" }}>No contacts match your filters.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {filtered.map(c => {
                  const rel = RELATIONSHIPS.find(r=>r.key===c.relationship);
                  const stage = STAGES.find(s=>s.key===c.stage);
                  return (
                    <div key={c.id} onClick={() => { setSelected(c); setScript(""); setView("detail"); }} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 18px", cursor:"pointer", display:"grid", gridTemplateColumns:"1fr auto auto", gap:14, alignItems:"center" }} className="list-row">
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:3 }}>{c.name}</div>
                        <div style={{ display:"flex", gap:8 }}>
                          <span style={{ fontSize:11, color:"var(--honey)" }}>{rel?.emoji} {rel?.label}</span>
                          {c.phone && <span style={{ fontSize:11, color:"var(--text-muted)" }}>{c.phone}</span>}
                        </div>
                      </div>
                      <div style={{ fontSize:11, padding:"3px 10px", borderRadius:100, background:`${stage?.color}15`, color:stage?.color, border:`1px solid ${stage?.color}30`, whiteSpace:"nowrap", fontWeight:600 }}>{stage?.label}</div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:c.score>70?"#10B981":c.score>50?"#F5A623":"var(--text-muted)" }}>{c.score}</div>
                    </div>
                  );
                })}
              </div>
            )}
            <style>{`@media(max-width:600px){.list-row{grid-template-columns:1fr!important}}`}</style>
          </div>
        )}

        {/* ── ADD CONTACT ── */}
        {view==="add" && (
          <div style={{ maxWidth:580 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>Add Contact</h2>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }} className="add-form">
                {[["Name *","name","text","Mom, John Smith, etc."],["Phone","phone","tel","(907) 555-0100"],["Email","email","email","john@email.com"]].map(([l,f,t,p]) => (
                  <div key={String(f)} style={{ gridColumn: String(f)==="name"?"1/3":"auto" }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{l}</label>
                    <input type={String(t)} placeholder={String(p)} value={(form as any)[String(f)]||""} onChange={e=>setForm(f=>({...f,[String(f)]:e.target.value}))}
                      style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Relationship</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }} className="rel-grid">
                  {RELATIONSHIPS.map(r => (
                    <button key={r.key} onClick={() => setForm(f=>({...f,relationship:r.key}))} style={{ padding:"9px 8px", borderRadius:9, border:`1px solid ${form.relationship===r.key?"rgba(245,166,35,0.5)":"var(--border)"}`, background:form.relationship===r.key?"rgba(245,166,35,0.1)":"var(--slate)", color:form.relationship===r.key?"var(--honey)":"var(--text-secondary)", fontSize:11, fontWeight:600, cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontSize:16, marginBottom:2 }}>{r.emoji}</div>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Home Status — affects priority score</label>
                <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                  {HOME_STATUSES.map(h => (
                    <button key={h.key} onClick={() => setForm(f=>({...f,homeStatus:h.key}))} style={{ textAlign:"left", padding:"10px 14px", borderRadius:9, border:`1px solid ${form.homeStatus===h.key?"rgba(245,166,35,0.5)":"var(--border)"}`, background:form.homeStatus===h.key?"rgba(245,166,35,0.1)":"var(--slate)", color:form.homeStatus===h.key?"var(--honey)":"var(--text-secondary)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16 }}>{h.emoji}</span>
                      <span style={{ fontWeight:form.homeStatus===h.key?700:400 }}>{h.label}</span>
                      {h.score>=9 && <span style={{ marginLeft:"auto", fontSize:10, color:"#10B981", fontWeight:700 }}>HIGH PRIORITY</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Notes</label>
                <textarea rows={2} value={form.notes||""} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="How you know them, anything relevant to a mortgage conversation..." style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:13, outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setView("dashboard")} style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:10, padding:"13px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={() => { addContact(); setView("dashboard"); }} disabled={!form.name} style={{ flex:2, background:!form.name?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:!form.name?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Add to Sphere →</button>
              </div>
              <style>{`@media(max-width:500px){.add-form,.rel-grid{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {/* ── BULK IMPORT ── */}
        {view==="bulk" && (
          <div style={{ maxWidth:580 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <button onClick={() => setView("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>Bulk Import</h2>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
              <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:10, padding:"14px 16px", marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--honey)", marginBottom:6 }}>Format: One contact per line</div>
                <div style={{ fontFamily:"monospace", fontSize:12, color:"var(--text-secondary)", lineHeight:1.8 }}>
                  Name, Phone, Email<br/>
                  John Smith, 907-555-0100, john@email.com<br/>
                  Sarah Johnson, 907-555-0200<br/>
                  Mom<br/>
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:8 }}>Phone and email are optional. You can update relationship type and home status after importing.</div>
              </div>
              <textarea rows={12} value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder={"Paste your contacts here, one per line...\n\nJohn Smith, 907-555-0100, john@email.com\nSarah from work\nMom, 907-555-0200"} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px", color:"var(--text-primary)", fontSize:13, outline:"none", resize:"vertical", fontFamily:"monospace", lineHeight:1.7, boxSizing:"border-box" }} />
              <div style={{ marginTop:12, fontSize:12, color:"var(--text-muted)", marginBottom:20 }}>
                {bulkText.trim() ? `${parseBulkText(bulkText).length} contacts ready to import` : "Paste your list above"}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setView("dashboard")} style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:10, padding:"13px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={importBulk} disabled={!bulkText.trim()} style={{ flex:2, background:!bulkText.trim()?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:!bulkText.trim()?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                  Import {bulkText.trim()?parseBulkText(bulkText).length:0} Contacts →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT DETAIL ── */}
        {view==="detail" && selected && (
          <div style={{ maxWidth:680 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
              <button onClick={() => { setView("dashboard"); setScript(""); }} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
            </div>

            {/* Contact header */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:26, marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:18 }}>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:4 }}>{selected.name}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {selected.phone && <a href={`tel:${selected.phone}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>📞 {selected.phone}</a>}
                    {selected.email && <a href={`mailto:${selected.email}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>✉️ {selected.email}</a>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:selected.score>70?"#10B981":selected.score>50?"#F5A623":"var(--text-muted)" }}>{selected.score}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>Priority Score</div>
                </div>
              </div>

              {/* Stage */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Stage</div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {STAGES.map(s => (
                    <button key={s.key} onClick={() => updateContact(selected.id,{stage:s.key})} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${selected.stage===s.key?s.color:"var(--border)"}`, background:selected.stage===s.key?s.color+"20":"var(--slate)", color:selected.stage===s.key?s.color:"var(--text-secondary)", fontSize:11, fontWeight:selected.stage===s.key?700:400, cursor:"pointer" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Home status */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Home Status</div>
                <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                  {HOME_STATUSES.map(h => (
                    <button key={h.key} onClick={() => updateContact(selected.id,{homeStatus:h.key})} style={{ padding:"6px 12px", borderRadius:7, border:`1px solid ${selected.homeStatus===h.key?"rgba(245,166,35,0.5)":"var(--border)"}`, background:selected.homeStatus===h.key?"rgba(245,166,35,0.1)":"var(--slate)", color:selected.homeStatus===h.key?"var(--honey)":"var(--text-secondary)", fontSize:11, fontWeight:selected.homeStatus===h.key?700:400, cursor:"pointer" }}>
                      {h.emoji} {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.notes && <div style={{ fontSize:13, color:"var(--text-secondary)", background:"var(--slate)", borderRadius:9, padding:"11px 14px", lineHeight:1.6 }}>{selected.notes}</div>}
            </div>

            {/* Log touchpoint */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:22, marginBottom:18 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:12 }}>📝 Log Touchpoint</div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={touchNote} onChange={e=>setTouchNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&touchNote.trim()&&logTouch(selected.id,touchNote)} placeholder='e.g. "Texted, no reply" or "Had coffee, very interested"' style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 13px", color:"var(--text-primary)", fontSize:13, outline:"none" }} />
                <button onClick={() => touchNote.trim()&&logTouch(selected.id,touchNote)} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"10px 16px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Log →</button>
              </div>
              {selected.touchpoints?.length>0 && (
                <div style={{ marginTop:14 }}>
                  {selected.touchpoints.slice(-5).reverse().map((tp,i) => (
                    <div key={i} style={{ display:"flex", gap:10, padding:"7px 0", borderBottom:"1px solid var(--border)" }}>
                      <span style={{ fontSize:11, color:"var(--text-muted)", whiteSpace:"nowrap", marginTop:1 }}>{fmt(tp.date)}</span>
                      <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{tp.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Script */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:22, marginBottom:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:scriptLoading||script?16:0 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:2 }}>🤖 AI Outreach Scripts</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)" }}>Text, voicemail, email + follow-up — written for {selected.name}</div>
                </div>
                <button onClick={() => generateScript(selected)} disabled={scriptLoading} style={{ background:scriptLoading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:scriptLoading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:8, padding:"9px 16px", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {scriptLoading?"Writing...":"Generate →"}
                </button>
              </div>
              {scriptLoading && <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:13, padding:"16px 0" }}>Writing scripts for {selected.name}...</div>}
              {script && (
                <div>
                  <div style={{ background:"var(--slate)", borderRadius:10, padding:"18px 20px", marginBottom:10 }}>{formatScript(script)}</div>
                  <button onClick={() => copy(script,"script")} style={{ background:copied==="script"?"#10B981":"rgba(245,166,35,0.1)", border:`1px solid ${copied==="script"?"#10B981":"rgba(245,166,35,0.3)"}`, color:copied==="script"?"white":"var(--honey)", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    {copied==="script"?"✓ Copied!":"📋 Copy All Scripts"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
