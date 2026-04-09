"use client";
import { useState, useEffect } from "react";
import MobileNav from "@/lib/MobileNav";
import { useRouter } from "next/navigation";

// ─── Intelligence Engine ───────────────────────────────────────────────────
type Priority = {
  id: string; urgency: "critical"|"high"|"medium"|"low";
  emoji: string; title: string; subtitle: string;
  action: string; href: string; color: string;
};

function daysSince(d: string) { return d ? Math.floor((Date.now()-new Date(d).getTime())/86400000) : 999; }
function daysTo(d: string) { return d ? Math.ceil((new Date(d).getTime()-Date.now())/86400000) : null; }
const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—";

function buildIntelligence(): Priority[] {
  const priorities: Priority[] = [];

  // ── LoanTrack ──
  try {
    const loans = JSON.parse(localStorage.getItem("hma_loans")||"[]");
    loans.filter((l:any)=>l.active).forEach((l:any)=>{
      const days = daysTo(l.targetClose);
      if (days!==null && days<=7 && days>=0) {
        priorities.push({ id:`loan-close-${l.id}`, urgency:"critical", emoji:"🔴", title:`${l.borrowerName} closes ${days===0?"TODAY":days===1?"tomorrow":`in ${days} days`}`, subtitle:`${l.propertyAddress||l.loanType} · Step ${l.currentMilestone}/8`, action:"View Loan", href:"/loantrack", color:"#EF4444" });
      }
      if (l.currentMilestone===7) {
        priorities.push({ id:`loan-ctc-${l.id}`, urgency:"high", emoji:"🎉", title:`${l.borrowerName} is Clear to Close!`, subtitle:"Ready to schedule closing — call them now", action:"View Loan", href:"/loantrack", color:"#10B981" });
      }
    });
  } catch {}

  // ── ReviewLoop ──
  try {
    const reviews = JSON.parse(localStorage.getItem("hma_reviews")||"[]");
    const actionNeeded = reviews.filter((r:any)=>{
      const days = daysSince(r.closeDate);
      if (r.status==="pending"&&days>=3) return true;
      if (r.status==="day3-sent"&&days>=10) return true;
      if (r.status==="day10-sent"&&days>=30) return true;
      return false;
    });
    if (actionNeeded.length>0) {
      priorities.push({ id:"reviews", urgency:"high", emoji:"⭐", title:`${actionNeeded.length} review request${actionNeeded.length>1?"s":""} ready to send`, subtitle:`${actionNeeded[0].borrowerName}${actionNeeded.length>1?` +${actionNeeded.length-1} more`:""}`, action:"Send Now", href:"/review-loop", color:"#F5A623" });
    }
  } catch {}

  // ── SphereEngine ──
  try {
    const contacts = JSON.parse(localStorage.getItem("hma_sphere")||"[]");
    const topContact = contacts.filter((c:any)=>c.stage!=="referred").sort((a:any,b:any)=>b.score-a.score)[0];
    if (topContact) {
      priorities.push({ id:`sphere-${topContact.id}`, urgency:"medium", emoji:"📞", title:`Call ${topContact.name} — highest sphere priority`, subtitle:`Score: ${topContact.score} · Last touch: ${daysSince(topContact.touchpoints?.slice(-1)[0]?.date||topContact.createdAt)}d ago`, action:"Get Script", href:"/sphere", color:"#3B82F6" });
    }
    if (contacts.length<100) {
      priorities.push({ id:"sphere-fill", urgency:"low", emoji:"🌐", title:`Add ${100-contacts.length} more contacts to complete your First 100`, subtitle:`Currently: ${contacts.length}/100 contacts in SphereEngine™`, action:"Add Contacts", href:"/sphere", color:"#8B5CF6" });
    }
  } catch {}

  // ── AgentPartner ──
  try {
    const agents = JSON.parse(localStorage.getItem("hma_agents")||"[]");
    const overdue = agents.filter((a:any)=>daysSince(a.lastTouch)>=30&&a.stage!=="cold");
    if (overdue.length>0) {
      priorities.push({ id:"agent-touch", urgency:"medium", emoji:"🤝", title:`Touch base with ${overdue[0].name}${overdue.length>1?` (+${overdue.length-1} more)`:""}`, subtitle:`${daysSince(overdue[0].lastTouch)} days since last contact`, action:"Open AgentPartner", href:"/agent-partner", color:"#F5A623" });
    }
    const coldAgents = agents.filter((a:any)=>a.stage==="cold").length;
    if (coldAgents>0) {
      priorities.push({ id:"agent-cold", urgency:"low", emoji:"❄️", title:`${coldAgents} cold agent${coldAgents>1?"s":""} need first outreach`, subtitle:"Generate AI pitch and make contact", action:"Get Pitch", href:"/agent-partner", color:"#3B82F6" });
    }
  } catch {}

  // ── EquityPulse ──
  try {
    const equityClients = JSON.parse(localStorage.getItem("hma_equity_clients")||"[]");
    const refiCandidates = equityClients.filter((c:any)=>{
      const val = parseFloat(c.currentValue)||parseFloat(c.originalPrice)*1.15;
      const loan = parseFloat(c.originalLoan)||parseFloat(c.originalPrice)*0.9;
      return (loan/val)*100<=80;
    });
    if (refiCandidates.length>0) {
      priorities.push({ id:"equity-refi", urgency:"medium", emoji:"📈", title:`${refiCandidates.length} past client${refiCandidates.length>1?"s":""} may qualify for refi or HELOC`, subtitle:`${refiCandidates[0].name} — LTV below 80%`, action:"Review", href:"/equity-pulse", color:"#10B981" });
    }
  } catch {}

  // ── Academy ──
  try {
    const progress = JSON.parse(localStorage.getItem("hma_progress")||"{}");
    const completed = Object.values(progress).filter((p:any)=>p.completed).length;
    if (completed<12) {
      priorities.push({ id:"academy", urgency:"low", emoji:"🎓", title:`Continue Module ${completed+1} — ${12-completed} module${12-completed>1?"s":""} remaining`, subtitle:"Complete your Academy curriculum", action:"Continue Learning", href:"/dashboard", color:"#8B5CF6" });
    }
  } catch {}

  return priorities.sort((a,b)=>{ const ord={critical:0,high:1,medium:2,low:3}; return ord[a.urgency]-ord[b.urgency]; }).slice(0,6);
}

// ─── Tool definitions ─────────────────────────────────────────────────────
const TOOLS = [
  { name:"PaymentFirst™",    emoji:"💰", href:"/payment-first",  desc:"Borrower consultation",    color:"#F5A623", stat:()=>"Payment calculator + shareable link" },
  { name:"LO LaunchKit™",    emoji:"🚀", href:"/launchkit",      desc:"90-day business plan",     color:"#10B981", stat:()=>"AI-generated, personalized to your market" },
  { name:"SphereEngine™",    emoji:"🌐", href:"/sphere",         desc:"First 100 contacts",       color:"#3B82F6", stat:()=>{ try{ const c=JSON.parse(localStorage.getItem("hma_sphere")||"[]"); return `${c.length}/100 contacts · ${c.filter((x:any)=>x.stage==="referred").length} referrals`; }catch{return "Track sphere contacts"} } },
  { name:"AgentPartner™",    emoji:"🤝", href:"/agent-partner",  desc:"Agent pipeline + pitches", color:"#8B5CF6", stat:()=>{ try{ const a=JSON.parse(localStorage.getItem("hma_agents")||"[]"); return `${a.length} agents · ${a.filter((x:any)=>x.stage==="active").length} sending deals`; }catch{return "Build agent network"} } },
  { name:"LoanTrack™",       emoji:"📍", href:"/loantrack",      desc:"Borrower milestone tracker",color:"#EF4444", stat:()=>{ try{ const l=JSON.parse(localStorage.getItem("hma_loans")||"[]"); return `${l.filter((x:any)=>x.active).length} active · ${l.filter((x:any)=>!x.active).length} closed`; }catch{return "Track loan milestones"} } },
  { name:"ReviewLoop™",      emoji:"⭐", href:"/review-loop",    desc:"Post-close reviews",       color:"#F5A623", stat:()=>{ try{ const r=JSON.parse(localStorage.getItem("hma_reviews")||"[]"); return `${r.filter((x:any)=>x.status==="reviewed").length}/${r.length} reviewed`; }catch{return "Automate review requests"} } },
  { name:"ReadyScore™",      emoji:"🎯", href:"/readyscore",     desc:"Borrower assessment",      color:"#10B981", stat:()=>"Share branded link — leads auto-qualify" },
  { name:"ApprovalLetter+",  emoji:"📄", href:"/approval-letter",desc:"Co-branded letters",       color:"#3B82F6", stat:()=>{ try{ const l=JSON.parse(localStorage.getItem("hma_letters")||"[]"); return `${l.length} letter${l.length!==1?"s":""} created`; }catch{return "Generate in 60 seconds"} } },
  { name:"EquityPulse™",     emoji:"📈", href:"/equity-pulse",   desc:"Past client equity",       color:"#F5A623", stat:()=>{ try{ const e=JSON.parse(localStorage.getItem("hma_equity_clients")||"[]"); return `${e.length} clients tracked`; }catch{return "Annual equity reviews"} } },
  { name:"CreditPath™",      emoji:"🎯", href:"/credit-path",    desc:"Credit improvement plan",  color:"#8B5CF6", stat:()=>"AI-generated paydown plan" },
  { name:"AgentContent Hub", emoji:"✍️",  href:"/agent-partner",  desc:"Co-marketing content",     color:"#10B981", stat:()=>"5 templates · one-tap copy" },
];

export default function CommandCenterPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [stats, setStats] = useState({ loans:0, sphere:0, agents:0, reviews:0, equity:0, letters:0 });
  const [moduleProgress, setModuleProgress] = useState(0);
  const [tier, setTier] = useState("free");
  const [time, setTime] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    setTier(s.plan || "free");

    // Build intelligence
    setPriorities(buildIntelligence());

    // Stats
    try {
      const loans = JSON.parse(localStorage.getItem("hma_loans")||"[]");
      const sphere = JSON.parse(localStorage.getItem("hma_sphere")||"[]");
      const agents = JSON.parse(localStorage.getItem("hma_agents")||"[]");
      const reviews = JSON.parse(localStorage.getItem("hma_reviews")||"[]");
      const equity = JSON.parse(localStorage.getItem("hma_equity_clients")||"[]");
      const letters = JSON.parse(localStorage.getItem("hma_letters")||"[]");
      setStats({ loans:loans.filter((l:any)=>l.active).length, sphere:sphere.length, agents:agents.length, reviews:reviews.filter((r:any)=>r.status==="reviewed").length, equity:equity.length, letters:letters.length });
      const prog = JSON.parse(localStorage.getItem("hma_progress")||"{}");
      setModuleProgress(Object.values(prog).filter((p:any)=>p.completed).length);
    } catch {}

    // Clock
    const tick = () => setTime(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}));
    tick(); const i = setInterval(tick,1000); return () => clearInterval(i);
  }, []);

  function dismiss(id: string) { setDismissed(prev => new Set([...prev,id])); }

  const visiblePriorities = priorities.filter(p => !dismissed.has(p.id));
  const tierColors: Record<string,string> = { free:"#64748B", foundation:"#3B82F6", accelerator:"#8B5CF6", elite:"#F5A623" };
  const tierLabels: Record<string,string> = { free:"Free", foundation:"Foundation", accelerator:"Accelerator", elite:"Elite" };

  if (!student) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h<12) return "Good morning";
    if (h<17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background:"rgba(10,10,11,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐝</div>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)", lineHeight:1 }}>Command Center</div>
            <div style={{ fontSize:10, color:"var(--honey)", letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:600 }}>Hive Mortgage Academy</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div style={{ fontSize:13, color:"var(--text-muted)", fontFamily:"monospace" }}>{time}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{student.name}</div>
            <div style={{ fontSize:11, padding:"2px 10px", borderRadius:100, background:`${tierColors[tier]}15`, color:tierColors[tier], border:`1px solid ${tierColors[tier]}40`, fontWeight:700 }}>{tierLabels[tier]}</div>
          </div>
          <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, color:"var(--text-muted)", fontSize:12, padding:"6px 12px", cursor:"pointer" }}>Academy →</button>
          <button onClick={() => { localStorage.removeItem("hma_student"); router.push("/"); }} style={{ background:"none", border:"none", color:"var(--text-muted)", fontSize:12, cursor:"pointer" }} className="hide-mobile-cc">Sign Out</button>
          <MobileNav studentName={student?.name} onLogout={() => { localStorage.removeItem("hma_student"); router.push("/"); }} />
        </div>
      </nav>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px" }}>

        {/* GREETING */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:6 }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.1, marginBottom:6 }}>
            {greeting()}, {student.name.split(" ")[0]}.
          </h1>
          <p style={{ fontSize:15, color:"var(--text-secondary)" }}>
            {visiblePriorities.length>0 ? `You have ${visiblePriorities.length} priorit${visiblePriorities.length>1?"ies":"y"} waiting.` : "All clear — great work. Keep the pipeline moving."} 🏔️
          </p>
        </div>

        {/* STATS BAR */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12, marginBottom:32 }} className="stats-bar">
          {[
            ["Active Loans", stats.loans, "📍", "#EF4444"],
            ["Sphere", `${stats.sphere}/100`, "🌐", "#3B82F6"],
            ["Agents", stats.agents, "🤝", "#8B5CF6"],
            ["Reviews", stats.reviews, "⭐", "#F5A623"],
            ["Equity Clients", stats.equity, "📈", "#10B981"],
            ["Academy", `${moduleProgress}/12`, "🎓", tierColors[tier]],
          ].map(([l,v,e,c])=>(
            <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{e}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:c as string }}>{v}</div>
              <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2, fontWeight:600 }}>{l}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:900px){.stats-bar{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:500px){.stats-bar{grid-template-columns:repeat(2,1fr)!important}}`}</style>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:24, alignItems:"start" }} className="main-grid">

          {/* LEFT COLUMN */}
          <div>

            {/* TODAY'S INTELLIGENCE */}
            {visiblePriorities.length>0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)", marginBottom:2 }}>Today's Intelligence</h2>
                    <p style={{ fontSize:12, color:"var(--text-muted)" }}>AI-surfaced priorities across all your tools</p>
                  </div>
                  <button onClick={()=>setPriorities(buildIntelligence())} style={{ background:"none", border:"1px solid var(--border)", borderRadius:7, color:"var(--text-muted)", fontSize:11, padding:"5px 10px", cursor:"pointer" }}>↻ Refresh</button>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {visiblePriorities.map(p=>(
                    <div key={p.id} style={{ background:"var(--charcoal)", border:`1px solid ${p.color}25`, borderRadius:14, padding:"14px 18px", display:"grid", gridTemplateColumns:"auto 1fr auto", gap:14, alignItems:"center" }} className="priority-row">
                      <div style={{ width:36, height:36, borderRadius:10, background:`${p.color}15`, border:`1px solid ${p.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{p.emoji}</div>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:2 }}>{p.title}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>{p.subtitle}</div>
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <a href={p.href} style={{ background:`${p.color}15`, border:`1px solid ${p.color}35`, color:p.color, borderRadius:8, padding:"7px 14px", fontSize:12, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap" }}>{p.action} →</a>
                        <button onClick={()=>dismiss(p.id)} style={{ background:"none", border:"1px solid var(--border)", borderRadius:7, color:"var(--text-muted)", fontSize:11, padding:"7px 10px", cursor:"pointer" }}>✓</button>
                      </div>
                    </div>
                  ))}
                </div>
                <style>{`@media(max-width:600px){.priority-row{grid-template-columns:1fr!important}}`}</style>
              </div>
            )}

            {/* TOOL GRID */}
            <div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>Your Platform — 11 Tools</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }} className="tool-grid">
                {TOOLS.map(tool=>(
                  <a key={tool.name} href={tool.href} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 16px", textDecoration:"none", display:"block", transition:"border-color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=`${tool.color}50`)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`${tool.color}15`, border:`1px solid ${tool.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{tool.emoji}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", lineHeight:1.3 }}>{tool.name}</div>
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.5 }}>{tool.stat()}</div>
                  </a>
                ))}
              </div>
              <style>{`@media(max-width:900px){.tool-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:500px){.tool-grid{grid-template-columns:1fr!important}}`}</style>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Academy Progress */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:18, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:14 }}>🎓 Academy Progress</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"var(--text-secondary)" }}>Modules Completed</span>
                <span style={{ fontSize:12, fontWeight:700, color:tierColors[tier] }}>{moduleProgress}/12</span>
              </div>
              <div style={{ height:8, background:"var(--muted)", borderRadius:100, overflow:"hidden", marginBottom:12 }}>
                <div style={{ height:"100%", width:`${(moduleProgress/12)*100}%`, background:`linear-gradient(90deg,${tierColors[tier]},${tierColors[tier]}cc)`, borderRadius:100, transition:"width 0.5s" }} />
              </div>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                {[{t:"free",l:"Free",mod:6},{t:"foundation",l:"Foundation",mod:9},{t:"accelerator",l:"Accel.",mod:11},{t:"elite",l:"Elite",mod:12}].map(tt=>(
                  <div key={tt.t} style={{ flex:1, textAlign:"center", padding:"6px 4px", borderRadius:8, background:tier===tt.t?`${tierColors[tt.t]}15`:"transparent", border:`1px solid ${tier===tt.t?tierColors[tt.t]:"var(--border)"}` }}>
                    <div style={{ fontSize:10, fontWeight:700, color:tier===tt.t?tierColors[tt.t]:"var(--text-muted)" }}>{tt.l}</div>
                    <div style={{ fontSize:9, color:"var(--text-muted)" }}>{tt.mod} mod</div>
                  </div>
                ))}
              </div>
              {moduleProgress>=12 ? (
                <a href="/graduation" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"11px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>Get Your HivePass™ →</a>
              ) : (
                <a href="/dashboard" style={{ display:"block", textAlign:"center", background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-primary)", padding:"11px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>Continue Module {moduleProgress+1} →</a>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:18, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:14 }}>⚡ Quick Actions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { label:"Run PaymentFirst™ Consultation", href:"/payment-first", emoji:"💰", color:"#F5A623" },
                  { label:"Add Agent to Pipeline",           href:"/agent-partner", emoji:"🤝", color:"#8B5CF6" },
                  { label:"Add Sphere Contact",              href:"/sphere",        emoji:"🌐", color:"#3B82F6" },
                  { label:"New Pre-Approval Letter",         href:"/approval-letter",emoji:"📄",color:"#3B82F6" },
                  { label:"Generate Credit Plan",            href:"/credit-path",   emoji:"🎯", color:"#8B5CF6" },
                  { label:"Invite a Colleague",               href:"/invite",        emoji:"✉️", color:"#3B82F6" },
                  { label:"Check Equity Portfolio",          href:"/equity-pulse",  emoji:"📈", color:"#10B981" },
                ].concat(moduleProgress >= 6 ? [{ label:"Apply to Derek's Team", href:"/apply", emoji:"🏔️", color:"#F5A623" }] : []).map(q=>(
                  <a key={q.label} href={q.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"var(--slate)", border:"1px solid var(--border)", textDecoration:"none", transition:"border-color 0.2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.borderColor=`${q.color}50`)}
                    onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
                    <span style={{ fontSize:16 }}>{q.emoji}</span>
                    <span style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:500 }}>{q.label}</span>
                    <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-muted)" }}>→</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Recruiting Funnel — only shows after Module 6 */}
            {moduleProgress >= 6 ? (
            <div style={{ background:"linear-gradient(135deg,rgba(245,166,35,0.08),rgba(245,166,35,0.03))", border:"1px solid rgba(245,166,35,0.25)", borderRadius:18, padding:22 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--honey)", marginBottom:8 }}>🏔️ Built from Alaska</div>
              <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14 }}>
                Every tool you've used is part of Derek Huit's platform. The full stack is available to LOs who join the team directly — Day 1 access, full support.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                <a href="/apply" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"11px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>Apply to Join Derek's Team →</a>
                <a href="/graduation" style={{ display:"block", textAlign:"center", background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.3)", color:"var(--honey)", padding:"10px", borderRadius:10, fontSize:12, fontWeight:600, textDecoration:"none" }}>View Your HivePass™</a>
              </div>
            </div>
            ) : (
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:18, padding:22, opacity:0.6 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-muted)", marginBottom:8 }}>🔒 Complete Module 6 to Unlock</div>
              <p style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>You're building the foundation. Finish Module 6 and a new path opens up.</p>
            </div>
            )}

            {/* LO Identity Card */}
            <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:18, padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🐝</div>
                <div>
                  <div style={{ fontSize:15, fontWeight:700, color:"var(--text-primary)" }}>{student.name}</div>
                  {student.nmls_number && <div style={{ fontSize:12, color:"var(--text-muted)" }}>NMLS #{student.nmls_number}</div>}
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  [`${stats.loans} Loans`, "Active Pipeline"],
                  [`${moduleProgress}/12`, "Modules Done"],
                  [`${stats.sphere}`, "Sphere Contacts"],
                  [`${stats.agents}`, "Agent Partners"],
                ].map(([v,l])=>(
                  <div key={l} style={{ background:"var(--slate)", borderRadius:8, padding:"10px", textAlign:"center" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:900, color:"var(--honey)" }}>{v}</div>
                    <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:1 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:1024px){.main-grid{grid-template-columns:1fr!important}}@media(max-width:768px){.hide-mobile-cc{display:none!important}}`}</style>
      </div>
    </main>
  );
}
