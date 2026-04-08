"use client";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,10,11,0.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #F5A623, #D4881A)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🐝</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.1 }}>Hive Mortgage</div>
            <div style={{ fontSize: 9, color: "var(--honey)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Academy</div>
          </div>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="nav-links">
          {["Curriculum", "AI Coach", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
              style={{ color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--honey)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
            >{l}</a>
          ))}
          <a href="#pricing" style={{
            background: "linear-gradient(135deg, #F5A623, #D4881A)",
            color: "#0A0A0B", padding: "10px 22px", borderRadius: 8,
            fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >Enroll Now</a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          style={{ display: "none", background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontSize: 24 }}
          className="hamburger">☰</button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: "var(--charcoal)", borderTop: "1px solid var(--border)",
          padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16,
        }}>
          {["Curriculum", "AI Coach", "Pricing"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}
              style={{ color: "var(--text-primary)", fontSize: 16, textDecoration: "none", fontWeight: 500 }}
            >{l}</a>
          ))}
          <a href="#pricing" onClick={() => setOpen(false)} style={{
            background: "linear-gradient(135deg, #F5A623, #D4881A)",
            color: "#0A0A0B", padding: "12px 22px", borderRadius: 8,
            fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center",
          }}>Enroll Now</a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
