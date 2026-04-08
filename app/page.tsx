"use client";
import { useState } from "react";
import { MODULES, TIER_PRICES } from "@/lib/curriculum";

const TIER_BADGES  = ["FREE","FREE","FREE","FREE","FREE","FREE","Foundation","Foundation","Foundation","Accelerator","Accelerator","Elite"];
const TIER_COLORS  = ["#10B981","#10B981","#10B981","#10B981","#10B981","#10B981","#3B82F6","#3B82F6","#3B82F6","#8B5CF6","#8B5CF6","#F5A623"];

const TOOLS = [
  { emoji:"💰", name:"PaymentFirst™",   desc:"Present monthly payment before max qualification — closes more deals, reduces fallout" },
  { emoji:"🌐", name:"SphereEngine™",   desc:"Score + prioritize your first 100 contacts. AI-written outreach scripts for each one" },
  { emoji:"🤝", name:"AgentPartner™",   desc:"Agent pipeline tracker + AI pitch generator. Build referral partnerships systematically" },
  { emoji:"📍", name:"LoanTrack™",      desc:"Milestone tracker with live borrower portal. Realtors and borrowers see progress in real time" },
  { emoji:"⭐", name:"ReviewLoop™",     desc:"Automated post-close review sequence. 3x more Google reviews with zero manual effort" },
  { emoji:"🎯", name:"ReadyScore™",     desc:"Branded borrower assessment link. 0–100 readiness score + AI action plan" },
  { emoji:"📄", name:"ApprovalLetter+", desc:"Co-branded pre-approval letters in 60 seconds. Shareable link for Realtor and borrower" },
  { emoji:"📈", name:"EquityPulse™",    desc:"Track past client equity. Auto-flag refi and HELOC candidates. AI annual review message" },
  { emoji:"🎯", name:"CreditPath™",     desc:"Specific paydown plan for credit-challenged borrowers. They come back ready to close" },
  { emoji:"🚀", name:"LO LaunchKit™",   desc:"AI-generated 90-day business plan. Specific targets, specific actions, specific timeline" },
  { emoji:"⚡", name:"Command Center",  desc:"Intelligence hub — cross-tool priorities, live stats, and today's action items in one view" },
];

export default function Home() {
  const [billing, setBilling] = useState<"monthly"|"annual">("monthly");
  const [audience, setAudience] = useState<"new"|"experienced">("new");
  const price = (base: number) => billing === "annual" ? Math.round(base * 0.7) : base;

  return (
    <main style={{ background:"var(--obsidian)" }}>

      {/* NAV */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background:"rgba(10,10,11,0.94)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", height:68, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐝</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16, color:"var(--text-primary)", lineHeight:1.1 }}>Hive Mortgage</div>
              <div style={{ fontSize:9, color:"var(--honey)", letterSpacing:"0.2em", textTransform:"uppercase", fontWeight:600 }}>Academy</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:28, alignItems:"center" }} className="nav-links">
            <a href="#for-you"    style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500, textDecoration:"none" }}>Who It's For</a>
            <a href="#tools"      style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500, textDecoration:"none" }}>Tools</a>
            <a href="#modules"    style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500, textDecoration:"none" }}>Curriculum</a>
            <a href="#pricing"    style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500, textDecoration:"none" }}>Pricing</a>
            <a href="/login"      style={{ color:"var(--text-secondary)", fontSize:14, fontWeight:500, textDecoration:"none" }}>Sign In</a>
            <a href="/enroll"     style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"10px 22px", borderRadius:8, fontSize:14, fontWeight:600, textDecoration:"none" }}>Start Free →</a>
          </div>
        </div>
        <style>{`@media(max-width:768px){.nav-links{display:none!important}}`}</style>
      </nav>

      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", alignItems:"center", background:"var(--obsidian)", position:"relative", overflow:"hidden", paddingTop:68 }}>
        <div style={{ position:"absolute", inset:0, opacity:0.3, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23F5A62310'/%3E%3C/svg%3E")` }} />
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"80px 24px", position:"relative", zIndex:1, width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }} className="hero-grid">
            <div>
              {/* Audience toggle */}
              <div style={{ display:"inline-flex", background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:100, padding:4, marginBottom:28, gap:4 }}>
                {(["new","experienced"] as const).map(a => (
                  <button key={a} onClick={()=>setAudience(a)} style={{ padding:"8px 18px", borderRadius:100, border:"none", cursor:"pointer", background:audience===a?"linear-gradient(135deg,#F5A623,#D4881A)":"transparent", color:audience===a?"#0A0A0B":"var(--text-muted)", fontSize:13, fontWeight:audience===a?700:500, transition:"all 0.2s", whiteSpace:"nowrap" }}>
                    {a==="new" ? "New to Mortgage" : "Experienced LO"}
                  </button>
                ))}
              </div>

              {audience === "new" ? (
                <div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px,5vw,64px)", fontWeight:900, lineHeight:1.05, color:"var(--text-primary)", marginBottom:20 }}>
                    You Passed<br />The Test.<br />
                    <span style={{ background:"linear-gradient(135deg,#F5A623 0%,#FFC85C 50%,#D4881A 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Now What?</span>
                  </h1>
                  <p style={{ fontSize:18, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:14, maxWidth:480 }}>
                    Most new LOs quit within 12 months — not because they failed the exam, but because nobody taught them how to build a pipeline, talk to borrowers, or earn Realtor trust.
                  </p>
                  <p style={{ fontSize:16, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:32, maxWidth:480 }}>
                    Hive Mortgage Academy gives you the <strong style={{ color:"var(--honey)" }}>curriculum, tools, and AI coaching</strong> that top producers wish they'd had in Year 1.
                  </p>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px,5vw,64px)", fontWeight:900, lineHeight:1.05, color:"var(--text-primary)", marginBottom:20 }}>
                    Good LOs<br />Get Stuck.<br />
                    <span style={{ background:"linear-gradient(135deg,#F5A623 0%,#FFC85C 50%,#D4881A 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Great Ones Don't.</span>
                  </h1>
                  <p style={{ fontSize:18, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:14, maxWidth:480 }}>
                    If you've been in the business a few years but your production has plateaued — the problem isn't your rates. It's your systems. Your pipeline is leaking referrals, past clients, and agent relationships you've already earned.
                  </p>
                  <p style={{ fontSize:16, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:32, maxWidth:480 }}>
                    Hive Mortgage Academy gives you <strong style={{ color:"var(--honey)" }}>11 production tools + a proven curriculum</strong> to seal those leaks and push past your current ceiling.
                  </p>
                </div>
              )}

              <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:24 }}>
                <a href="/enroll" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"16px 32px", borderRadius:10, fontSize:16, fontWeight:700, textDecoration:"none" }}>
                  {audience==="new" ? "Start Free — Modules 1–6 →" : "Get the Tools + Training →"}
                </a>
                <a href="#for-you" style={{ border:"1px solid var(--border)", color:"var(--text-primary)", padding:"16px 28px", borderRadius:10, fontSize:16, fontWeight:600, textDecoration:"none" }}>See What's Inside</a>
              </div>

              <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                {(audience==="new"
                  ? [["✓","6 free modules, no credit card"],["✓","Unlimited AI Coach"],["✓","11 LO production tools included"]]
                  : [["✓","11 tools for your active pipeline"],["✓","Referral, agent & refi systems"],["✓","Built on $1B+ in real production"]]
                ).map(([icon,text],i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ color:"#10B981", fontWeight:700, fontSize:13 }}>{icon}</span>
                    <span style={{ fontSize:13, color:"var(--text-secondary)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero card */}
            <div style={{ display:"flex", justifyContent:"center" }}>
              <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28, maxWidth:400, width:"100%", boxShadow:"0 0 60px rgba(245,166,35,0.08)" }}>
                <div style={{ fontSize:12, color:"var(--honey)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>What's inside</div>
                {[
                  ["🎓","12 Modules","From Day 1 to $1M+/year production"],
                  ["🤖","AI Mortgage Coach","24/7 — trained on $1B+ in real deals"],
                  ["⚡","11 Production Tools","The stack serious LOs run their business on"],
                  ["🏔️","HivePass™ Certificate","Verifiable credential when you graduate"],
                ].map(([icon,title,sub],i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width:36, height:36, background:"var(--slate)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)" }}>{title}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <a href="/enroll" style={{ display:"block", textAlign:"center", marginTop:20, background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px 24px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>Start Free — No Credit Card →</a>
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
      </section>

      {/* STATS */}
      <section style={{ background:"var(--charcoal)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"36px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:24 }} className="stats-grid">
          {[["$1B+","Career Production"],["18+","Years in Mortgage"],["12","Modules"],["11","LO Tools"],["24/7","AI Coach Access"]].map(([num,label],i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3.5vw,40px)", fontWeight:900, background:"linear-gradient(135deg,#F5A623,#FFC85C)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{num}</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:768px){.stats-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:480px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* WHO THIS IS FOR */}
      <section id="for-you" style={{ padding:"100px 24px", background:"var(--obsidian)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Who This Is For</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.1, marginBottom:14 }}>Two Paths.<br />One Platform.</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:480, margin:"0 auto" }}>Whether you're building from zero or breaking through a ceiling you've hit — this is built for both.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }} className="paths-grid">
            {/* New LO */}
            <div style={{ background:"var(--charcoal)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:36 }}>
              <div style={{ width:48, height:48, background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:20 }}>🆕</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:12 }}>New & Returning LOs</h3>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:24 }}>
                You just got licensed — or you're coming back after time away. You have a license and zero pipeline. The exam taught you the rules. Nobody taught you the business.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {[
                  "Your first borrower conversation — word for word",
                  "Building a referral pipeline from scratch in 90 days",
                  "How to earn your first Realtor partner",
                  "Payment-first methodology that closes more deals",
                  "Credit, compliance, and the loan process end to end",
                ].map(item => (
                  <div key={item} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ color:"#10B981", fontSize:13, marginTop:2, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/enroll" style={{ display:"block", textAlign:"center", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.35)", color:"#10B981", padding:"13px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>Start Free — 6 Modules Unlocked →</a>
            </div>

            {/* Experienced LO */}
            <div style={{ background:"var(--charcoal)", border:"1px solid rgba(245,166,35,0.35)", borderRadius:20, padding:36 }}>
              <div style={{ width:48, height:48, background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.3)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:20 }}>📈</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)", marginBottom:12 }}>Experienced LOs Ready to Level Up</h3>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:24 }}>
                You've been closing loans for years but your production has plateaued. You know the business — you need better systems. More referrals, a stronger agent network, and a past-client refi pipeline that actually runs itself.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
                {[
                  "SphereEngine™ — score and prioritize your contact database",
                  "AgentPartner™ — systematic pipeline for Realtor relationships",
                  "EquityPulse™ — auto-flag past clients ready to refi or pull equity",
                  "ReviewLoop™ — 3x your Google reviews post-close automatically",
                  "Advanced modules on building a $1M+/year business",
                ].map(item => (
                  <div key={item} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ color:"var(--honey)", fontSize:13, marginTop:2, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <a href="/enroll" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>Get the Tools + Full Curriculum →</a>
            </div>
          </div>
          <style>{`@media(max-width:768px){.paths-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* 11 TOOLS */}
      <section id="tools" style={{ padding:"100px 24px", background:"var(--charcoal)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Included With Every Account</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.1, marginBottom:14 }}>11 Production Tools.<br />Built Into the Platform.</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:560, margin:"0 auto" }}>
              This isn't just training. Every student gets access to the actual tools serious loan officers run their business on — from your first borrower call to post-close review automation.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="tools-grid">
            {TOOLS.map((tool,i) => (
              <div key={i} style={{ background:"var(--obsidian)", border:"1px solid var(--border)", borderRadius:14, padding:"20px 22px", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:40, height:40, background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{tool.emoji}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:5 }}>{tool.name}</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.55 }}>{tool.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:1024px){.tools-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:600px){.tools-grid{grid-template-columns:1fr!important}}`}</style>
          <div style={{ textAlign:"center", marginTop:36 }}>
            <a href="/enroll" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"15px 32px", borderRadius:10, fontSize:15, fontWeight:700, textDecoration:"none", display:"inline-block" }}>Access All 11 Tools Free →</a>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" style={{ padding:"100px 24px", background:"var(--obsidian)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>The Full Curriculum</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.1, marginBottom:14 }}>12 Modules.<br />Zero Fluff.</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:520, margin:"0 auto 28px" }}>From your first 48 hours to your first million-dollar year. The complete loan officer journey in one curriculum.</p>
            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              {[["#10B981","FREE","Modules 1–6"],["#3B82F6","Foundation","Modules 7–9"],["#8B5CF6","Accelerator","Modules 10–11"],["#F5A623","Elite","Module 12"]].map(([color,tier,range]) => (
                <div key={tier} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:100, background:`${color}15`, border:`1px solid ${color}30` }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
                  <span style={{ fontSize:12, color, fontWeight:700 }}>{tier}</span>
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>{range}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }} className="module-grid">
            {MODULES.map((mod, i) => (
              <div key={mod.id} style={{ background:"var(--charcoal)", border:`1px solid ${i < 6 ? "rgba(16,185,129,0.2)" : "var(--border)"}`, borderRadius:16, padding:22, position:"relative" }}>
                {i < 6 && <div style={{ position:"absolute", top:-10, right:14, background:"#10B981", color:"white", fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:100 }}>FREE</div>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, color:"rgba(245,166,35,0.1)", lineHeight:1 }}>{String(mod.id).padStart(2,"0")}</div>
                  <div style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:100, background:`${TIER_COLORS[i]}18`, color:TIER_COLORS[i], border:`1px solid ${TIER_COLORS[i]}35` }}>{TIER_BADGES[i]}</div>
                </div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:5, lineHeight:1.3 }}>{mod.title}</h3>
                <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5, marginBottom:10 }}>{mod.subtitle}</p>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>{mod.duration} · {mod.lessons.length} lessons + quiz</div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:1024px){.module-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:640px){.module-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* AI COACH */}
      <section id="ai-coach" style={{ padding:"100px 24px", background:"var(--charcoal)" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Included on Every Tier — Including Free</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>Your AI Mortgage Coach</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, maxWidth:480, margin:"0 auto" }}>Ask anything. Get real answers — like talking to a $1B producer who's seen your exact situation a thousand times. Available 24/7, unlimited on all tiers.</p>
          </div>
          <div style={{ background:"var(--obsidian)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden" }}>
            <div style={{ background:"var(--slate)", padding:"14px 22px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🐝</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)" }}>Hive AI Coach</div>
                <div style={{ fontSize:12, color:"#10B981" }}>● Trained on $1B+ in production · Unlimited Q&A</div>
              </div>
            </div>
            <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:12 }}>
              {[
                ["user","How do I get my first Realtor referral partner when I have zero relationships?"],
                ["assistant","Start with who already knows you. Text every agent you've ever met — your Realtor when you bought your home, your friend's agent, whoever hosted the last open house you toured. 'Hey [name], I just got my mortgage license. I'd love 20 minutes to show you how I work — coffee on me.' That text has opened more doors than any cold call I've ever made.\n\nOnce you're in the room: don't pitch. Bring them a market stat, ask about their business, show them your communication style. Realtors don't want a rate sheet — they want an LO who makes them look good in front of their buyer.\n\nFirst 30 days: 10 coffees, 2 office presentations, 2 open house visits per weekend. One of those 10 will send you a loan."],
              ].map((msg,i) => (
                <div key={i} style={{ display:"flex", justifyContent:msg[0]==="user"?"flex-end":"flex-start" }}>
                  <div style={{ maxWidth:"82%", background:msg[0]==="user"?"linear-gradient(135deg,#F5A623,#D4881A)":"var(--slate)", color:msg[0]==="user"?"#0A0A0B":"var(--text-primary)", padding:"12px 16px", borderRadius:msg[0]==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", fontSize:13, lineHeight:1.65, border:msg[0]==="assistant"?"1px solid var(--border)":"none", whiteSpace:"pre-line" }}>{msg[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"0 16px 10px", display:"flex", gap:8, flexWrap:"wrap" }}>
              {["How do I explain FHA vs Conventional?","What do I say when a borrower gets denied?","How do I build my referral pipeline in 90 days?","What is the payment-first approach?"].map(q => (
                <div key={q} style={{ fontSize:11, padding:"5px 11px", borderRadius:100, background:"rgba(245,166,35,0.07)", border:"1px solid rgba(245,166,35,0.18)", color:"var(--honey)", cursor:"default" }}>{q}</div>
              ))}
            </div>
            <div style={{ padding:"10px 16px 20px", display:"flex", gap:10 }}>
              <div style={{ flex:1, background:"var(--slate)", border:"1px solid var(--border)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"var(--text-muted)" }}>Enroll free to ask your AI coach anything...</div>
              <a href="/enroll" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:700, textDecoration:"none", whiteSpace:"nowrap" }}>Start Free →</a>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTION OUTCOMES */}
      <section style={{ padding:"80px 24px", background:"var(--obsidian)", borderTop:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Where This Takes You</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,4vw,44px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.15 }}>Real Production. Real Numbers.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="outcomes-grid">
            {[
              { label:"Year 1 LO", target:"$3M – $8M", color:"#10B981", items:["Build your first referral network","Close 15–35 loans from scratch","Earn your first Realtor partners","Establish a sphere follow-up system"] },
              { label:"Year 2–3 LO", target:"$10M – $25M", color:"#3B82F6", items:["Systematize your agent relationships","Past-client refi pipeline running","Team support + delegation skills","Consistent $1M+ quarters"] },
              { label:"Top Producer", target:"$30M+", color:"#F5A623", items:["Full AI-powered pipeline stack","Annual equity + refi watch system","Automated review generation","Build a team and multiply output"] },
            ].map(tier => (
              <div key={tier.label} style={{ background:"var(--charcoal)", border:`1px solid ${tier.color}25`, borderRadius:18, padding:28 }}>
                <div style={{ fontSize:11, color:tier.color, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>{tier.label}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"var(--text-primary)", marginBottom:20 }}>{tier.target}</div>
                {tier.items.map(item => (
                  <div key={item} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
                    <span style={{ color:tier.color, fontSize:12, marginTop:2, flexShrink:0 }}>✓</span>
                    <span style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <style>{`@media(max-width:768px){.outcomes-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:"100px 24px", background:"var(--charcoal)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:14 }}>Pricing</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"var(--text-primary)", marginBottom:14 }}>Start Free.<br />Upgrade When Ready.</h2>
            <p style={{ color:"var(--text-secondary)", fontSize:16, marginBottom:32 }}>Six modules unlocked the moment you sign up. No credit card, no trial period, no catch.</p>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--obsidian)", border:"1px solid var(--border)", borderRadius:100, padding:"5px 7px" }}>
              <button onClick={()=>setBilling("monthly")} style={{ padding:"8px 20px", borderRadius:100, border:"none", cursor:"pointer", background:billing==="monthly"?"linear-gradient(135deg,#F5A623,#D4881A)":"transparent", color:billing==="monthly"?"#0A0A0B":"var(--text-secondary)", fontSize:13, fontWeight:600 }}>Monthly</button>
              <button onClick={()=>setBilling("annual")} style={{ padding:"8px 20px", borderRadius:100, border:"none", cursor:"pointer", background:billing==="annual"?"linear-gradient(135deg,#F5A623,#D4881A)":"transparent", color:billing==="annual"?"#0A0A0B":"var(--text-secondary)", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                Annual <span style={{ fontSize:10, background:billing==="annual"?"rgba(0,0,0,0.2)":"#10B981", color:"white", padding:"2px 6px", borderRadius:100, fontWeight:700 }}>Save 30%</span>
              </button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }} className="price-grid">
            {[
              { tier:"FREE", label:"Free", price:0, suffix:"forever", color:"#10B981", modules:"Modules 1–6", features:["6 modules fully unlocked","Unlimited AI Coach","All 11 LO tools included","Progress tracking","No credit card"], cta:"Start Free", href:"/enroll?tier=free", popular:false },
              { tier:"FOUNDATION", label:"Foundation", price:price(97), suffix:"/mo", color:"#3B82F6", modules:"Modules 7–9", features:["Everything in Free","Modules 7–9 unlocked","Module completion certificates","Email support"], cta:"Start Foundation", href:"/enroll?tier=foundation", popular:false },
              { tier:"ACCELERATOR", label:"Accelerator", price:price(297), suffix:"/mo", color:"#8B5CF6", modules:"Modules 10–11", features:["Everything in Foundation","Modules 10–11 unlocked","AI role-play simulations","Live group coaching","Derek's Pipeline Playbook PDF"], cta:"Start Accelerator", href:"/enroll?tier=accelerator", popular:true },
              { tier:"ELITE", label:"Elite", price:price(697), suffix:"/mo", color:"#F5A623", modules:"All 12 Modules", features:["Everything in Accelerator","Module 12 unlocked","Monthly 1:1 with Derek","Huit.AI platform preview","HivePass™ graduation badge","Priority AI Coach"], cta:"Start Elite", href:"/enroll?tier=elite", popular:false },
            ].map(p => (
              <div key={p.tier} style={{ background:"var(--obsidian)", border:`1px solid ${p.popular?p.color+"55":"var(--border)"}`, borderRadius:20, padding:26, position:"relative", boxShadow:p.popular?`0 0 40px ${p.color}12`:"none" }}>
                {p.popular && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#8B5CF6,#7C3AED)", color:"white", fontSize:10, fontWeight:800, padding:"3px 14px", borderRadius:100, whiteSpace:"nowrap" }}>Most Popular</div>}
                <div style={{ fontSize:10, fontWeight:700, color:p.color, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:6 }}>{p.label}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:10 }}>{p.modules}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:6 }}>
                  {p.price===0 ? <span style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, color:"var(--text-primary)" }}>Free</span> : <>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:36, fontWeight:900, color:"var(--text-primary)" }}>${p.price}</span>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>{p.suffix}</span>
                  </>}
                </div>
                {p.price>0 && billing==="annual" && <div style={{ fontSize:11, color:"#10B981", marginBottom:8, fontWeight:600 }}>30% off — billed annually</div>}
                <div style={{ borderTop:"1px solid var(--border)", paddingTop:18, marginBottom:18, marginTop:12 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:9 }}>
                      <span style={{ color:"#10B981", fontSize:12, flexShrink:0, marginTop:1 }}>✓</span>
                      <span style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={p.href} style={{ display:"block", textAlign:"center", background:p.popular?`linear-gradient(135deg,${p.color},${p.color}cc)`:p.price===0?"linear-gradient(135deg,#10B981,#059669)":"var(--slate)", color:p.popular||p.price===0?"#fff":"var(--text-primary)", border:`1px solid ${p.popular||p.price===0?"transparent":"var(--border)"}`, padding:"12px 18px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>{p.cta} →</a>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:28 }}>
            <p style={{ fontSize:12, color:"var(--text-muted)" }}>Billed securely via ZenoPay.ai · Cancel anytime · Questions? <a href="mailto:derekhuit@gmail.com" style={{ color:"var(--honey)", textDecoration:"none" }}>Contact us</a></p>
          </div>
          <style>{`@media(max-width:1100px){.price-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:600px){.price-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* RECRUITING CTA */}
      <section style={{ padding:"80px 24px", background:"linear-gradient(135deg,rgba(245,166,35,0.07),rgba(245,166,35,0.02))", borderTop:"1px solid rgba(245,166,35,0.15)", borderBottom:"1px solid rgba(245,166,35,0.15)" }}>
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🏔️</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,4vw,42px)", fontWeight:900, color:"var(--text-primary)", marginBottom:16, lineHeight:1.15 }}>Ready to Build a Career,<br />Not Just Close Loans?</h2>
          <p style={{ fontSize:17, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:32, maxWidth:520, margin:"0 auto 32px" }}>
            The top performers who go through this curriculum choose to join Derek Huit's team directly at Cardinal Financial — with the full Huit.AI platform from Day 1 and a team structure built around production.
          </p>
          <a href="/enroll" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"16px 36px", borderRadius:12, fontSize:16, fontWeight:700, textDecoration:"none", display:"inline-block" }}>Start With the Free Curriculum →</a>
          <p style={{ fontSize:12, color:"var(--text-muted)", marginTop:16 }}>Complete Module 6 to unlock the team application path</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"var(--charcoal)", borderTop:"1px solid var(--border)", padding:"48px 24px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:48 }} className="footer-grid">
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🐝</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>Hive Mortgage Academy</div>
              </div>
              <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.7, maxWidth:340, marginBottom:16 }}>Training, tools, and AI coaching for loan officers at every stage — from Day 1 to $1M+/year. Built from 18+ years and $1B+ in career mortgage production.</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--muted)", borderRadius:8, padding:"6px 12px", border:"1px solid var(--border)" }}>
                <span style={{ fontSize:11, color:"var(--text-muted)" }}>Powered by</span>
                <span style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:600 }}>⬡ Huit.AI</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--honey)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>Platform</div>
              {["Curriculum","Tools","Pricing","Enroll Free","Sign In"].map(link => (
                <a key={link} href={link==="Enroll Free"?"/enroll":link==="Sign In"?"/login":link==="Tools"?"#tools":link==="Curriculum"?"#modules":"#pricing"} style={{ display:"block", fontSize:13, color:"var(--text-muted)", textDecoration:"none", marginBottom:10 }}>{link}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"var(--honey)", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>Contact</div>
              <a href="mailto:derekhuit@gmail.com" style={{ fontSize:13, color:"var(--text-muted)", textDecoration:"none", display:"block", marginBottom:10 }}>derekhuit@gmail.com</a>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:10 }}>Anchorage, Alaska</div>
              <a href="https://huit.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize:13, color:"var(--honey)", textDecoration:"none" }}>huit.ai →</a>
            </div>
          </div>
          <div style={{ marginTop:40, paddingTop:24, borderTop:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div style={{ fontSize:12, color:"var(--text-muted)" }}>© 2026 Hive Mortgage Academy · Huit.AI, Inc. All rights reserved.</div>
            <div style={{ fontSize:12, color:"var(--text-muted)" }}>Built from Alaska 🏔️</div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.footer-grid{grid-template-columns:1fr!important;gap:32px!important}}`}</style>
      </footer>
    </main>
  );
}
