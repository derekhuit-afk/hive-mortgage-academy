"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GraduationPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  if (!student) return null;

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      {/* Confetti-style top */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: ["#F5A623","#10B981","#3B82F6","#8B5CF6"][i % 4], left: `${(i * 5.2) % 100}%`, top: `${(i * 7.3) % 80}%`, opacity: 0.3 }} />
        ))}
      </div>

      <div style={{ maxWidth: 700, width: "100%", position: "relative", zIndex: 1 }}>
        {/* HivePass Badge */}
        <div style={{ background: "var(--charcoal)", border: "2px solid rgba(245,166,35,0.5)", borderRadius: 24, padding: "40px 48px", textAlign: "center", marginBottom: 40, boxShadow: "0 0 80px rgba(245,166,35,0.12)" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🐝</div>
          <div style={{ fontSize: 12, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>Hive Mortgage Academy</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>HivePass™</div>
          <div style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>This certifies that</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, color: "var(--honey)", marginBottom: 8 }}>{student.name}</div>
          {student.nmls_number && <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>NMLS #{student.nmls_number}</div>}
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
            has completed the Hive Mortgage Academy curriculum and demonstrated mastery of loan origination, borrower consultation, compliance, and the payment-first methodology.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, padding: "20px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--honey)", fontFamily: "'Playfair Display',serif" }}>2026</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Year Completed</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--honey)", fontFamily: "'Playfair Display',serif" }}>⬡ Huit.AI</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Powered By</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--honey)", fontFamily: "'Playfair Display',serif" }}>🏔️</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Built from Alaska</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => window.print()} style={{ background: "var(--slate)", border: "1px solid var(--border)", color: "var(--text-primary)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>🖨️ Print Certificate</button>
            <a href={`/hivepass/${student.id}`} target="_blank" style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)", color: "var(--honey)", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>🔗 Share HivePass</a>
          </div>
        </div>

        {/* 3-Path CTA */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 12 }}>You've Earned It. Now Choose Your Path.</h2>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            You have three doors in front of you. All three are the right answer. Pick the one that fits where you are right now.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="cta-grid">
          {[
            {
              icon: "🏔️",
              title: "Join Derek's Team",
              subtitle: "Cardinal Financial — Nationwide",
              desc: "Apply to join Derek Huit's team directly. The full Huit.AI platform stack from Day 1. LOs on this platform close faster, earn more, and have the tools no other team offers.",
              cta: "Apply Now →",
              href: "/apply",
              color: "#F5A623",
              primary: true,
            },
            {
              icon: "📅",
              title: "Book a Strategy Call",
              subtitle: "30 min · No cost · No pressure",
              desc: "Talk through your market, your goals, and whether the Huit.AI platform is a fit for where you want to take your career. No pitch, no pressure.",
              cta: "Book a Call →",
              href: "mailto:derekhuit@gmail.com?subject=Strategy Call Request — HivePass Graduate",
              color: "#3B82F6",
              primary: false,
            },
            {
              icon: "⬡",
              title: "Unlock Huit.AI Platform",
              subtitle: "The tools that power Huit LOs",
              desc: "Access CRMEX, APEX, VoiceAgent, PaymentFirst™, and 46 other products. The platform that makes failure nearly impossible when you're doing the work.",
              cta: "See the Platform →",
              href: "https://huit.ai",
              color: "#8B5CF6",
              primary: false,
            },
          ].map(path => (
            <div key={path.title} style={{ background: path.primary ? "linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.04))" : "var(--charcoal)", border: `1px solid ${path.primary ? "rgba(245,166,35,0.4)" : "var(--border)"}`, borderRadius: 16, padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{path.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{path.title}</div>
              <div style={{ fontSize: 11, color: path.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{path.subtitle}</div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>{path.desc}</p>
              <a href={path.href} target={path.href.startsWith("http") ? "_blank" : "_self"} rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: path.primary ? "linear-gradient(135deg,#F5A623,#D4881A)" : `${path.color}20`, color: path.primary ? "#0A0A0B" : path.color, border: `1px solid ${path.primary ? "transparent" : path.color + "40"}`, padding: "11px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>{path.cta}</a>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:768px){.cta-grid{grid-template-columns:1fr!important}}`}</style>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>← Back to Dashboard</button>
        </div>
      </div>
    </main>
  );
}
