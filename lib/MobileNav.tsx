"use client";
import { useState } from "react";

type NavLink = { label: string; href: string; emoji: string };

const TOOLS: NavLink[] = [
  { label:"Command Center", href:"/command-center", emoji:"⚡" },
  { label:"Dashboard", href:"/dashboard", emoji:"🎓" },
  { label:"PaymentFirst™", href:"/payment-first", emoji:"💰" },
  { label:"SphereEngine™", href:"/sphere", emoji:"🌐" },
  { label:"AgentPartner™", href:"/agent-partner", emoji:"🤝" },
  { label:"LoanTrack™", href:"/loantrack", emoji:"📍" },
  { label:"ReviewLoop™", href:"/review-loop", emoji:"⭐" },
  { label:"ReadyScore™", href:"/readyscore", emoji:"🎯" },
  { label:"ApprovalLetter+", href:"/approval-letter", emoji:"📄" },
  { label:"EquityPulse™", href:"/equity-pulse", emoji:"📈" },
  { label:"CreditPath™", href:"/credit-path", emoji:"🎯" },
  { label:"LO LaunchKit™", href:"/launchkit", emoji:"🚀" },
];

export default function MobileNav({ studentName, onLogout }: { studentName?: string; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — only shows on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="mobile-menu-btn"
        style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, color:"var(--text-primary)", padding:"6px 10px", cursor:"pointer", fontSize:18, lineHeight:1 }}
        aria-label="Open menu"
      >☰</button>

      {/* Overlay */}
      {open && (
        <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:200 }} />
      )}

      {/* Drawer */}
      <div style={{ position:"fixed", top:0, right:0, height:"100vh", width:280, background:"var(--charcoal)", borderLeft:"1px solid var(--border)", zIndex:201, transform: open?"translateX(0)":"translateX(100%)", transition:"transform 0.25s ease", overflowY:"auto", display:"flex", flexDirection:"column" }}>
        <div style={{ padding:"20px 20px 12px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🐝</div>
            <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:14, color:"var(--text-primary)" }}>Hive Academy</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"var(--text-muted)", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        </div>
        {studentName && <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--border)", fontSize:13, color:"var(--text-secondary)" }}>👤 {studentName}</div>}
        <div style={{ flex:1, padding:"8px 0" }}>
          {TOOLS.map(link => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 20px", color:"var(--text-primary)", textDecoration:"none", fontSize:14, fontWeight:500, borderBottom:"1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--slate)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span style={{ fontSize:16 }}>{link.emoji}</span>{link.label}
            </a>
          ))}
        </div>
        <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
          <a href="/apply" style={{ display:"block", textAlign:"center", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"11px", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>🏔️ Apply to Team</a>
          {onLogout && <button onClick={onLogout} style={{ background:"none", border:"1px solid var(--border)", color:"var(--text-muted)", padding:"10px", borderRadius:8, fontSize:13, cursor:"pointer" }}>Sign Out</button>}
        </div>
      </div>
      <style>{`@media(min-width:769px){.mobile-menu-btn{display:none!important}}`}</style>
    </>
  );
}
