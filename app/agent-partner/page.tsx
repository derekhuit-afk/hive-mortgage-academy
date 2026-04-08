"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Stage = "cold"|"contacted"|"met"|"partner"|"active";
type Agent = {
  id: string; name: string; brokerage: string; email: string; phone: string;
  market: string; specialties: string[]; stage: Stage; notes: string;
  referrals: number; lastTouch: string; createdAt: string;
};

const STAGES: { key: Stage; label: string; color: string; emoji: string }[] = [
  { key:"cold",      label:"Cold",        color:"#64748B", emoji:"❄️" },
  { key:"contacted", label:"Contacted",   color:"#3B82F6", emoji:"📬" },
  { key:"met",       label:"Met",         color:"#8B5CF6", emoji:"☕" },
  { key:"partner",   label:"Partner",     color:"#F5A623", emoji:"🤝" },
  { key:"active",    label:"Sending Deals",color:"#10B981",emoji:"🔥" },
];

const SPECIALTIES = ["First-Time Buyers","Luxury","Investment","Relocation","Military/VA","New Construction","Commercial","Land","Short Sales","REO"];

const CONTENT_TYPES = [
  { key:"market_update",     label:"Monthly Market Update",    emoji:"📊" },
  { key:"referral_thank_you",label:"Referral Thank You",        emoji:"🙏" },
  { key:"coffee_follow_up",  label:"Post-Coffee Follow-Up",     emoji:"☕" },
  { key:"pre_approval_update",label:"Pre-Approval Update",      emoji:"✅" },
  { key:"anniversary_touch", label:"30-Day Check-In",           emoji:"📅" },
];

function newId() { return Math.random().toString(36).slice(2,10); }
function today() { return new Date().toISOString().split("T")[0]; }
const fmt = (s:string) => s ? new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—";

export default function AgentPartnerPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [view, setView] = useState<"pipeline"|"add"|"detail"|"content">("pipeline");
  const [selected, setSelected] = useState<Agent|null>(null);
  const [pitch, setPitch] = useState("");
  const [pitchLoading, setPitchLoading] = useState(false);
  const [contentResult, setContentResult] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentType, setContentType] = useState("market_update");
  const [copied, setCopied] = useState("");

  const [form, setForm] = useState<Partial<Agent>>({
    name:"", brokerage:"", email:"", phone:"", market:"",
    specialties:[], stage:"cold", notes:"", referrals:0,
  });

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
    const saved = localStorage.getItem("hma_agents");
    if (saved) setAgents(JSON.parse(saved));
  }, []);

  function saveAgents(updated: Agent[]) {
    setAgents(updated);
    localStorage.setItem("hma_agents", JSON.stringify(updated));
  }

  function addAgent() {
    if (!form.name) return;
    const agent: Agent = {
      id: newId(), name: form.name||"", brokerage: form.brokerage||"",
      email: form.email||"", phone: form.phone||"", market: form.market||student?.market||"",
      specialties: form.specialties||[], stage: form.stage||"cold",
      notes: form.notes||"", referrals: form.referrals||0,
      lastTouch: today(), createdAt: today(),
    };
    saveAgents([...agents, agent]);
    setForm({ name:"", brokerage:"", email:"", phone:"", market:"", specialties:[], stage:"cold", notes:"", referrals:0 });
    setView("pipeline");
  }

  function updateStage(id: string, stage: Stage) {
    const updated = agents.map(a => a.id===id ? {...a, stage, lastTouch: today()} : a);
    saveAgents(updated);
    if (selected?.id===id) setSelected({...selected, stage, lastTouch: today()});
  }

  function deleteAgent(id: string) {
    saveAgents(agents.filter(a => a.id!==id));
    setView("pipeline");
    setSelected(null);
  }

  function logTouch(id: string) {
    const updated = agents.map(a => a.id===id ? {...a, lastTouch: today()} : a);
    saveAgents(updated);
    if (selected?.id===id) setSelected({...selected, lastTouch: today()});
  }

  async function generatePitch(agent: Agent) {
    setPitchLoading(true); setPitch("");
    try {
      const res = await fetch("/api/agent-pitch", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ loName: student?.name, loNmls: student?.nmls_number, loMarket: agent.market||student?.market, agentName: agent.name, brokerage: agent.brokerage, specialties: agent.specialties, notes: agent.notes }),
      });
      const data = await res.json();
      setPitch(data.content||"");
    } catch { /* silent */ } finally { setPitchLoading(false); }
  }

  async function generateContent() {
    setContentLoading(true); setContentResult("");
    try {
      const res = await fetch("/api/agent-content", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ loName: student?.name, loMarket: student?.market||"your market", contentType, agentName: selected?.name||"" }),
      });
      const data = await res.json();
      setContentResult(data.content||"");
    } catch { /* silent */ } finally { setContentLoading(false); }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 2000);
    });
  }

  function formatPitch(text: string) {
    return text.split("\n").map((line,i) => {
      if (line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{ fontSize:12, fontWeight:800, color:"var(--honey)", textTransform:"uppercase", letterSpacing:"0.1em", margin:"20px 0 8px", padding:"4px 10px", background:"rgba(245,166,35,0.08)", borderRadius:6, display:"inline-block" }}>{line.replace(/\*\*/g,"")}</div>;
      if (line.startsWith("- ")) return <div key={i} style={{ display:"flex", gap:8, margin:"5px 0" }}><span style={{ color:"var(--honey)", flexShrink:0 }}>▸</span><span style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.6 }}>{line.slice(2)}</span></div>;
      if (line.trim()==="") return <div key={i} style={{ height:6 }} />;
      return <p key={i} style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, margin:"3px 0" }}>{line}</p>;
    });
  }

  if (!student) return null;

  const stageMap = Object.fromEntries(STAGES.map(s => [s.key, agents.filter(a => a.stage===s.key)]));
  const totalReferrals = agents.reduce((sum,a) => sum + (a.referrals||0), 0);
  const activeCount = agents.filter(a => a.stage==="active").length;
  const partnerCount = agents.filter(a => a.stage==="partner"||a.stage==="active").length;

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", fontSize:14 }}>← Dashboard</button>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤝</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>AgentPartner™</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["pipeline","content"].map(v => (
            <button key={v} onClick={() => setView(v as any)} style={{ background:view===v?"rgba(245,166,35,0.1)":"none", border:`1px solid ${view===v?"rgba(245,166,35,0.3)":"var(--border)"}`, borderRadius:7, color:view===v?"var(--honey)":"var(--text-muted)", fontSize:12, fontWeight:600, padding:"6px 12px", cursor:"pointer", textTransform:"capitalize" }}>{v==="pipeline"?"Pipeline":"Content"}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>

        {/* Stats bar */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }} className="stats-bar">
          {[["Total Agents",agents.length,"var(--text-primary)"],["Partners+",partnerCount,"#F5A623"],["Sending Deals",activeCount,"#10B981"],["Referrals In",totalReferrals,"#3B82F6"]].map(([l,v,c]) => (
            <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 20px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:c as string }}>{v}</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:600px){.stats-bar{grid-template-columns:repeat(2,1fr)!important}}`}</style>

        {/* PIPELINE VIEW */}
        {view==="pipeline" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)" }}>Agent Pipeline</h2>
              <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Add Agent</button>
            </div>

            {agents.length===0 ? (
              <div style={{ background:"var(--charcoal)", border:"2px dashed var(--border)", borderRadius:20, padding:"60px 40px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🤝</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:10 }}>Start Building Your Agent Network</div>
                <p style={{ fontSize:14, color:"var(--text-secondary)", maxWidth:440, margin:"0 auto 24px", lineHeight:1.7 }}>Add every Realtor you've met, want to meet, or are actively working with. Track where you are in the relationship and get AI-generated pitches for each one.</p>
                <button onClick={() => setView("add")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Add Your First Agent →</button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, alignItems:"start" }} className="kanban">
                {STAGES.map(stage => (
                  <div key={stage.key}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"8px 12px", background:"var(--charcoal)", borderRadius:10, border:`1px solid ${stage.color}30` }}>
                      <span style={{ fontSize:14 }}>{stage.emoji}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:stage.color }}>{stage.label}</span>
                      <span style={{ fontSize:11, color:"var(--text-muted)", marginLeft:"auto", background:"var(--slate)", borderRadius:100, padding:"1px 7px" }}>{stageMap[stage.key]?.length||0}</span>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {(stageMap[stage.key]||[]).map(agent => (
                        <div key={agent.id} onClick={() => { setSelected(agent); setPitch(""); setView("detail"); }} style={{ background:"var(--charcoal)", border:`1px solid ${stage.color}25`, borderRadius:12, padding:"14px 16px", cursor:"pointer" }}>
                          <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:3, lineHeight:1.3 }}>{agent.name}</div>
                          <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:8 }}>{agent.brokerage||"—"}</div>
                          {agent.referrals>0 && <div style={{ fontSize:11, color:"#10B981", fontWeight:600, marginBottom:4 }}>🔥 {agent.referrals} referral{agent.referrals>1?"s":""}</div>}
                          <div style={{ fontSize:11, color:"var(--text-muted)" }}>Last touch: {fmt(agent.lastTouch)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <style>{`@media(max-width:900px){.kanban{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:500px){.kanban{grid-template-columns:1fr!important}}`}</style>
          </div>
        )}

        {/* ADD AGENT VIEW */}
        {view==="add" && (
          <div style={{ maxWidth:640 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
              <button onClick={() => setView("pipeline")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>←</button>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)" }}>Add Agent</h2>
            </div>
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }} className="add-grid">
                {[["Name *","name","text","Sarah Johnson"],["Brokerage","brokerage","text","Keller Williams"],["Email","email","email","sarah@kw.com"],["Phone","phone","tel","(907) 555-0100"],["Their Market","market","text","Anchorage, AK"]].map(([l,f,t,p]) => (
                  <div key={String(f)}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>{l}</label>
                    <input type={String(t)} placeholder={String(p)} value={(form as any)[String(f)]||""} onChange={e => setForm(fr => ({...fr,[String(f)]:e.target.value}))}
                      style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Relationship Stage</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {STAGES.map(s => (
                    <button key={s.key} onClick={() => setForm(f => ({...f,stage:s.key}))} style={{ padding:"8px 14px", borderRadius:8, border:`1px solid ${form.stage===s.key?s.color+"60":"var(--border)"}`, background:form.stage===s.key?s.color+"15":"var(--slate)", color:form.stage===s.key?s.color:"var(--text-secondary)", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Specialties</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {SPECIALTIES.map(s => (
                    <button key={s} onClick={() => setForm(f => ({...f, specialties: f.specialties?.includes(s) ? f.specialties.filter(x=>x!==s) : [...(f.specialties||[]),s]}))} style={{ padding:"6px 12px", borderRadius:100, border:`1px solid ${form.specialties?.includes(s)?"rgba(245,166,35,0.5)":"var(--border)"}`, background:form.specialties?.includes(s)?"rgba(245,166,35,0.1)":"var(--slate)", color:form.specialties?.includes(s)?"var(--honey)":"var(--text-secondary)", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                      {form.specialties?.includes(s)?"✓ ":""}{s}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:24 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>Notes (how you met, what they mentioned, etc.)</label>
                <textarea rows={3} value={form.notes||""} onChange={e => setForm(f => ({...f,notes:e.target.value}))} placeholder="Met at open house on 4th Ave. Works mostly first-time buyers. Mentioned her lender is slow on pre-approvals..." style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:13, outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <button onClick={() => setView("pipeline")} style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-secondary)", borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Cancel</button>
                <button onClick={addAgent} disabled={!form.name} style={{ flex:2, background:!form.name?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:!form.name?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:700, cursor:"pointer" }}>Add Agent →</button>
              </div>
              <style>{`@media(max-width:600px){.add-grid{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>
        )}

        {/* AGENT DETAIL VIEW */}
        {view==="detail" && selected && (
          <div style={{ maxWidth:720 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
              <button onClick={() => { setView("pipeline"); setPitch(""); }} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", fontSize:14 }}>← Pipeline</button>
            </div>

            {/* Agent card */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:4 }}>{selected.name}</h2>
                  <div style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:8 }}>{selected.brokerage||"—"} · {selected.market||"—"}</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {selected.email && <a href={`mailto:${selected.email}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>✉️ {selected.email}</a>}
                    {selected.phone && <a href={`tel:${selected.phone}`} style={{ fontSize:12, color:"var(--honey)", textDecoration:"none" }}>📞 {selected.phone}</a>}
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:8 }}>Last touch: {fmt(selected.lastTouch)}</div>
                  <button onClick={() => logTouch(selected.id)} style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", color:"#10B981", borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer" }}>✓ Log Touchpoint</button>
                </div>
              </div>

              {/* Stage selector */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Relationship Stage</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {STAGES.map(s => (
                    <button key={s.key} onClick={() => updateStage(selected.id, s.key)} style={{ padding:"7px 13px", borderRadius:8, border:`1px solid ${selected.stage===s.key?s.color:"var(--border)"}`, background:selected.stage===s.key?s.color+"20":"var(--slate)", color:selected.stage===s.key?s.color:"var(--text-secondary)", fontSize:12, fontWeight:selected.stage===s.key?700:400, cursor:"pointer" }}>
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {selected.specialties?.length > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                  {selected.specialties.map(s => <span key={s} style={{ fontSize:11, padding:"3px 10px", borderRadius:100, background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", color:"var(--honey)" }}>{s}</span>)}
                </div>
              )}

              {selected.notes && <div style={{ fontSize:13, color:"var(--text-secondary)", background:"var(--slate)", borderRadius:10, padding:"12px 14px", lineHeight:1.6 }}>{selected.notes}</div>}
            </div>

            {/* AI Pitch Generator */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:2 }}>🤖 AI Pitch Generator</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)" }}>Text, email, talking points, and objection handlers — personalized for {selected.name}</div>
                </div>
                <button onClick={() => generatePitch(selected)} disabled={pitchLoading} style={{ background:pitchLoading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:pitchLoading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {pitchLoading?"Generating...":"Generate Pitch →"}
                </button>
              </div>
              {pitchLoading && (
                <div style={{ padding:"24px 0", textAlign:"center", color:"var(--text-muted)", fontSize:13 }}>Writing your personalized pitch for {selected.name}...</div>
              )}
              {pitch && (
                <div>
                  <div style={{ background:"var(--slate)", borderRadius:12, padding:"20px 22px", marginBottom:12 }}>
                    {formatPitch(pitch)}
                  </div>
                  <button onClick={() => copyText(pitch,"pitch")} style={{ background:copied==="pitch"?"#10B981":"rgba(245,166,35,0.1)", border:`1px solid ${copied==="pitch"?"#10B981":"rgba(245,166,35,0.3)"}`, color:copied==="pitch"?"white":"var(--honey)", borderRadius:8, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    {copied==="pitch"?"✓ Copied!":"📋 Copy All"}
                  </button>
                </div>
              )}
            </div>

            {/* Referral counter */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:24, marginBottom:20 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:16 }}>📊 Referral Tracker</div>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <button onClick={() => { const u = agents.map(a => a.id===selected.id?{...a,referrals:(a.referrals||0)+1}:a); saveAgents(u); setSelected({...selected,referrals:(selected.referrals||0)+1}); }} style={{ width:36,height:36, borderRadius:"50%", background:"linear-gradient(135deg,#F5A623,#D4881A)", border:"none", color:"#0A0A0B", fontSize:20, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, fontWeight:900, color:"#10B981" }}>{selected.referrals||0}</div>
                  <div style={{ fontSize:12, color:"var(--text-muted)" }}>referrals received</div>
                </div>
                {(selected.referrals||0)>0 && <button onClick={() => { const u = agents.map(a => a.id===selected.id?{...a,referrals:Math.max(0,(a.referrals||0)-1)}:a); saveAgents(u); setSelected({...selected,referrals:Math.max(0,(selected.referrals||0)-1)}); }} style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, color:"var(--text-muted)", fontSize:12, padding:"5px 10px", cursor:"pointer" }}>−1</button>}
              </div>
            </div>

            <button onClick={() => deleteAgent(selected.id)} style={{ background:"none", border:"1px solid rgba(239,68,68,0.3)", color:"rgba(239,68,68,0.7)", borderRadius:10, padding:"10px 18px", fontSize:13, cursor:"pointer", width:"100%" }}>Remove Agent</button>
          </div>
        )}

        {/* CONTENT VIEW */}
        {view==="content" && (
          <div style={{ maxWidth:680 }}>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:6 }}>Content Hub</h2>
              <p style={{ fontSize:14, color:"var(--text-secondary)" }}>AI-generated messages for every touchpoint in your agent relationships. One click, ready to send.</p>
            </div>

            {/* Content type selector */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
              {CONTENT_TYPES.map(ct => (
                <button key={ct.key} onClick={() => setContentType(ct.key)} style={{ textAlign:"left", padding:"14px 18px", borderRadius:12, border:`1px solid ${contentType===ct.key?"rgba(245,166,35,0.4)":"var(--border)"}`, background:contentType===ct.key?"rgba(245,166,35,0.08)":"var(--charcoal)", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20 }}>{ct.emoji}</span>
                  <span style={{ fontSize:14, fontWeight:600, color:contentType===ct.key?"var(--honey)":"var(--text-primary)" }}>{ct.label}</span>
                  {contentType===ct.key && <span style={{ marginLeft:"auto", fontSize:11, color:"var(--honey)", fontWeight:700 }}>Selected</span>}
                </button>
              ))}
            </div>

            {/* Agent selector (optional) */}
            {agents.length>0 && (
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Personalize for agent (optional)</label>
                <select value={selected?.id||""} onChange={e => setSelected(agents.find(a=>a.id===e.target.value)||null)} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none" }}>
                  <option value="">Generic (no specific agent)</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.name} — {a.brokerage||"—"}</option>)}
                </select>
              </div>
            )}

            <button onClick={generateContent} disabled={contentLoading} style={{ width:"100%", background:contentLoading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:contentLoading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"14px 20px", fontSize:14, fontWeight:700, cursor:"pointer", marginBottom:20 }}>
              {contentLoading?"Generating...":"Generate Content →"}
            </button>

            {contentResult && (
              <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:16, padding:24 }}>
                <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.8, whiteSpace:"pre-wrap", marginBottom:16 }}>{contentResult}</div>
                <button onClick={() => copyText(contentResult,"content")} style={{ background:copied==="content"?"#10B981":"rgba(245,166,35,0.1)", border:`1px solid ${copied==="content"?"#10B981":"rgba(245,166,35,0.3)"}`, color:copied==="content"?"white":"var(--honey)", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  {copied==="content"?"✓ Copied!":"📋 Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
