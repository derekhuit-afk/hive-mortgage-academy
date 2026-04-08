"use client";
import { useState } from "react";
import { MODULES, TIER_PRICES } from "@/lib/curriculum";

const TIER_BADGES = ["FREE","FREE","FREE","Foundation","Foundation","Foundation","Accelerator","Accelerator","Accelerator","Accelerator","Elite","Elite"];
const TIER_COLORS = ["#10B981","#10B981","#10B981","#3B82F6","#3B82F6","#3B82F6","#8B5CF6","#8B5CF6","#8B5CF6","#8B5CF6","#F5A623","#F5A623"];

export default function Home() {
  const [billing, setBilling] = useState<"monthly"|"annual">("monthly");

  const price = (base: number) => billing === "annual" ? Math.round(base * 0.7) : base;

  return (
    <main style={{ background: "var(--obsidian)" }}>
      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(10,10,11,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐝</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.1 }}>Hive Mortgage</div>
              <div style={{ fontSize: 9, color: "var(--honey)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Academy</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="nav-links">
            <a href="#modules" style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Curriculum</a>
            <a href="#ai-coach" style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>AI Coach</a>
            <a href="#pricing" style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</a>
            <a href="/login" style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign In</a>
            <a href="/enroll" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "10px 22px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Start Free →</a>
          </div>
        </div>
        <style>{`@media(max-width:768px){.nav-links{display:none!important}}`}</style>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", background: "var(--obsidian)", position: "relative", overflow: "hidden", paddingTop: 68 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23F5A62310'/%3E%3C/svg%3E")` }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: "#10B981", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>🐝 Start Free — No Credit Card</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 100, padding: "5px 14px", marginBottom: 32, marginLeft: 8 }}>
                <span style={{ fontSize: 11, color: "var(--honey)", fontWeight: 600, letterSpacing: "0.08em" }}>Built from Alaska · 18+ Years · $1B+ Production</span>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(40px,5vw,68px)", fontWeight: 900, lineHeight: 1.05, color: "var(--text-primary)", marginBottom: 24 }}>
                You Passed<br />The Test.<br />
                <span style={{ background: "linear-gradient(135deg,#F5A623 0%,#FFC85C 50%,#D4881A 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Now What?</span>
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 16, maxWidth: 480 }}>
                Most new LOs quit within their first year — not because they failed the exam, but because nobody taught them how to actually close loans.
              </p>
              <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
                Hive Mortgage Academy fixes that. <strong style={{ color: "var(--honey)" }}>12 modules. AI coaching. Real curriculum. Start free today.</strong>
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <a href="/enroll" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "16px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: "none" }}>Start Free — Modules 1–6 Unlocked →</a>
                <a href="#modules" style={{ border: "1px solid var(--border)", color: "var(--text-primary)", padding: "16px 32px", borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: "none" }}>View Curriculum</a>
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[["✓","6 free modules unlocked instantly"],["✓","Unlimited AI Coach — no limit"],["✓","No credit card required"]].map(([icon,text],i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#10B981", fontWeight: 700, fontSize: 13 }}>{icon}</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, maxWidth: 400, width: "100%", boxShadow: "0 0 60px rgba(245,166,35,0.08)" }}>
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Free Tier — Start Today</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Modules 1–6 fully unlocked + unlimited AI Coach</div>
                </div>
                {[["🎓","12 Total Modules","Full LO journey, Day 1 to $1M/yr"],["🤖","AI Mortgage Coach","24/7, trained on $1B+ production"],["🏔️","HivePass™ Certificate","Graduate + get your credential badge"],["⬡","Huit.AI Platform Preview","See the tools top LOs use"]].map(([icon,title,sub],i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: 36, height: 36, background: "var(--slate)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>
                    </div>
                  </div>
                ))}
                <a href="/enroll" style={{ display: "block", textAlign: "center", marginTop: 20, background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "13px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Start Free Now →</a>
              </div>
            </div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.hero-grid{grid-template-columns:1fr!important;gap:40px!important}}`}</style>
      </section>

      {/* STATS */}
      <section style={{ background: "var(--charcoal)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="stats-grid">
          {[["$1B+","Career Production"],["18+","Years in Mortgage"],["12","Modules"],["24/7","AI Coach Access"]].map(([num,label],i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, background: "linear-gradient(135deg,#F5A623,#FFC85C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{num}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:640px){.stats-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </section>

      {/* MODULES */}
      <section id="modules" style={{ padding: "100px 24px", background: "var(--obsidian)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>The Full Curriculum</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,4vw,52px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 16 }}>12 Modules.<br />Zero Fluff.</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 520, margin: "0 auto 28px" }}>The complete loan officer journey — from your first 48 hours to your first million-dollar year.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {[["#10B981","FREE","Modules 1–3"],["#3B82F6","Foundation","Modules 4–6"],["#8B5CF6","Accelerator","Modules 7–10"],["#F5A623","Elite","Modules 11–12"]].map(([color,tier,range]) => (
                <div key={tier} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 100, background: `${color}15`, border: `1px solid ${color}30` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 12, color, fontWeight: 600 }}>{tier}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{range}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="module-grid">
            {MODULES.map((mod, i) => (
              <div key={mod.id} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 24, position: "relative" }}>
                {i < 3 && <div style={{ position: "absolute", top: -10, right: 16, background: "#10B981", color: "white", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 100, letterSpacing: "0.05em" }}>FREE</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: "rgba(245,166,35,0.12)", lineHeight: 1 }}>{String(mod.id).padStart(2,"0")}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: `${TIER_COLORS[i]}20`, color: TIER_COLORS[i], border: `1px solid ${TIER_COLORS[i]}40` }}>{TIER_BADGES[i]}</div>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.3 }}>{mod.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>{mod.subtitle}</p>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{mod.duration} · {mod.lessons.length} lessons + quiz</div>
              </div>
            ))}
          </div>
          <style>{`@media(max-width:1024px){.module-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:640px){.module-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* AI COACH */}
      <section id="ai-coach" style={{ padding: "100px 24px", background: "var(--charcoal)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Included on Every Tier — Including Free</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 14 }}>Your AI Mortgage Coach</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>Ask anything. Get real answers — like talking to a $1B producer. Available 24/7, unlimited on all tiers.</p>
          </div>
          <div style={{ background: "var(--obsidian)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ background: "var(--slate)", padding: "14px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🐝</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Hive AI Coach</div>
                <div style={{ fontSize: 12, color: "#10B981" }}>● Trained on $1B+ in production · Unlimited Q&A</div>
              </div>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
              {[["user","How do I get my first Realtor referral partner when I have zero relationships?"],["assistant","Start with who already knows you. Text every agent you've ever met — your Realtor when you bought your home, your friend's Realtor, the agent who hosted the open house you toured 3 years ago. 'Hey [name], I just got my mortgage license. I'd love 20 minutes to show you how I work — coffee on me.' That text has opened more doors than any cold call I've ever seen. Once you're in the room, don't pitch. Bring them a market stat, ask about their business, and show them your communication style. Realtors don't want a rate sheet — they want an LO who makes them look good. Your first 30 days: 10 coffees, 3 office presentations, 2 open house visits every weekend. One of those 10 will send you a loan."]].map((msg,i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg[0] === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", background: msg[0] === "user" ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--slate)", color: msg[0] === "user" ? "#0A0A0B" : "var(--text-primary)", padding: "12px 16px", borderRadius: msg[0] === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 14, lineHeight: 1.6, border: msg[0] === "assistant" ? "1px solid var(--border)" : "none" }}>{msg[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["How do I explain FHA vs Conventional?","What do I say to a borrower who got denied?","How do I build my first 90 days?","What is payment-first?"].map(q => (
                <div key={q} style={{ fontSize: 12, padding: "5px 11px", borderRadius: 100, background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.18)", color: "var(--honey)", cursor: "default" }}>{q}</div>
              ))}
            </div>
            <div style={{ padding: "12px 16px 20px", display: "flex", gap: 10 }}>
              <div style={{ flex: 1, background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "var(--text-muted)" }}>Enroll free to ask your AI coach anything...</div>
              <a href="/enroll" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>Start Free →</a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: "100px 24px", background: "var(--obsidian)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,52px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16 }}>Start Free.<br />Upgrade When Ready.</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>Three free modules unlocked the moment you sign up. No credit card.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 100, padding: "5px 7px" }}>
              <button onClick={() => setBilling("monthly")} style={{ padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", background: billing === "monthly" ? "linear-gradient(135deg,#F5A623,#D4881A)" : "transparent", color: billing === "monthly" ? "#0A0A0B" : "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}>Monthly</button>
              <button onClick={() => setBilling("annual")} style={{ padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer", background: billing === "annual" ? "linear-gradient(135deg,#F5A623,#D4881A)" : "transparent", color: billing === "annual" ? "#0A0A0B" : "var(--text-secondary)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                Annual <span style={{ fontSize: 10, background: billing === "annual" ? "rgba(0,0,0,0.2)" : "#10B981", color: "white", padding: "2px 6px", borderRadius: 100, fontWeight: 700 }}>Save 30%</span>
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="price-grid">
            {[
              { tier: "FREE", label: "Free", price: 0, suffix: "forever", color: "#10B981", features: ["Modules 1–6 fully unlocked","Unlimited AI Coach","Progress tracking","Mobile access"], cta: "Start Free", href: "/enroll?tier=free", popular: false },
              { tier: "FOUNDATION", label: "Foundation", price: price(97), suffix: "/mo", color: "#3B82F6", features: ["Everything in Free","Modules 4–6 unlocked","Lesson completion certificates","Email support"], cta: "Start Foundation", href: "/enroll?tier=foundation", popular: false },
              { tier: "ACCELERATOR", label: "Accelerator", price: price(297), suffix: "/mo", color: "#8B5CF6", features: ["Everything in Foundation","Modules 7–10 unlocked","AI role-play simulations","Live group coaching","Derek's Pipeline Playbook PDF"], cta: "Start Accelerator", href: "/enroll?tier=accelerator", popular: true },
              { tier: "ELITE", label: "Elite", price: price(697), suffix: "/mo", color: "#F5A623", features: ["Everything in Accelerator","All 12 modules unlocked","Monthly 1:1 with Derek","Huit.AI platform preview access","HivePass™ graduation badge","Priority AI Coach"], cta: "Start Elite", href: "/enroll?tier=elite", popular: false },
            ].map(p => (
              <div key={p.tier} style={{ background: "var(--charcoal)", border: `1px solid ${p.popular ? p.color + "60" : "var(--border)"}`, borderRadius: 20, padding: 28, position: "relative", boxShadow: p.popular ? `0 0 40px ${p.color}15` : "none" }}>
                {p.popular && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#8B5CF6,#7C3AED)", color: "white", fontSize: 10, fontWeight: 800, padding: "3px 14px", borderRadius: 100, whiteSpace: "nowrap" }}>Most Popular</div>}
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{p.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                  {p.price === 0 ? <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: "var(--text-primary)" }}>Free</span> : <>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, color: "var(--text-primary)" }}>${p.price}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.suffix}</span>
                  </>}
                </div>
                {p.price > 0 && billing === "annual" && <div style={{ fontSize: 11, color: "#10B981", marginBottom: 14, fontWeight: 600 }}>30% off — billed annually</div>}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginBottom: 20, marginTop: p.price > 0 && billing === "annual" ? 0 : 14 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                      <span style={{ color: "#10B981", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={p.href} style={{ display: "block", textAlign: "center", background: p.popular ? `linear-gradient(135deg,${p.color},${p.color}cc)` : "var(--slate)", color: p.popular ? "#fff" : "var(--text-primary)", border: `1px solid ${p.popular ? "transparent" : "var(--border)"}`, padding: "13px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>{p.cta} →</a>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Billed securely via ZenoPay.ai · Cancel anytime · Questions? <a href="mailto:derekhuit@gmail.com" style={{ color: "var(--honey)", textDecoration: "none" }}>Contact us</a></p>
          </div>
          <style>{`@media(max-width:1100px){.price-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:640px){.price-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      </section>

      {/* RECRUITING CTA */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(135deg,rgba(245,166,35,0.06),rgba(245,166,35,0.02))", borderTop: "1px solid rgba(245,166,35,0.15)", borderBottom: "1px solid rgba(245,166,35,0.15)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏔️</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16, lineHeight: 1.15 }}>Ready to Build a Career,<br />Not Just Close Loans?</h2>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: "0 auto 32px" }}>
            Graduate from Hive Mortgage Academy and you'll have three paths forward. Our highest performers choose to join Derek Huit's team directly — with the full Huit.AI platform behind them from Day 1.
          </p>
          <a href="/apply" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "16px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>Apply to Join Derek's Team →</a>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16 }}>Or <a href="/enroll" style={{ color: "var(--honey)", textDecoration: "none" }}>enroll free</a> to start the curriculum first</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--charcoal)", borderTop: "1px solid var(--border)", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48 }} className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐝</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Hive Mortgage Academy</div>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 320, marginBottom: 16 }}>The training platform for newly licensed loan officers who want to close deals from Day 1. Built from 18+ years and $1B+ in career mortgage production.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--muted)", borderRadius: 8, padding: "6px 12px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by</span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>⬡ Huit.AI</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Platform</div>
              {["Curriculum","AI Coach","Pricing","Enroll Free","Apply to Team"].map(link => (
                <a key={link} href={link === "Apply to Team" ? "/apply" : link === "Enroll Free" ? "/enroll" : `#${link.toLowerCase().replace(" ","-")}`} style={{ display: "block", fontSize: 13, color: "var(--text-muted)", textDecoration: "none", marginBottom: 10 }}>{link}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Contact</div>
              <a href="mailto:derekhuit@gmail.com" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "block", marginBottom: 10 }}>derekhuit@gmail.com</a>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Anchorage, Alaska</div>
              <a href="https://huit.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--honey)", textDecoration: "none" }}>huit.ai →</a>
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>© 2026 Hive Mortgage Academy · Huit.AI, Inc. All rights reserved.</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Built from Alaska 🏔️</div>
          </div>
        </div>
        <style>{`@media(max-width:768px){.footer-grid{grid-template-columns:1fr!important;gap:32px!important}}`}</style>
      </footer>
    </main>
  );
}
