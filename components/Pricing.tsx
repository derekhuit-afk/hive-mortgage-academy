"use client";
import { useState } from "react";

const plans = [
  {
    name: "FOUNDATION",
    monthly: 97,
    annual: 797,
    desc: "Everything a new LO needs to get started and stay moving.",
    features: [
      "All 6 core modules",
      "Video lessons + quizzes",
      "AI Coach (unlimited Q&A)",
      "Module completion certificates",
      "Progress tracking dashboard",
      "Mobile access",
    ],
    cta: "Start Foundation",
    highlight: false,
  },
  {
    name: "ACCELERATOR",
    monthly: 297,
    annual: 2397,
    desc: "For LOs who want to close their first deal in 30 days or less.",
    features: [
      "Everything in Foundation",
      "AI borrower call role-play",
      "AI Realtor pitch simulator",
      "Live group coaching sessions",
      "Derek's pipeline playbook (PDF)",
      "Priority AI Coach responses",
    ],
    cta: "Start Accelerator",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "ELITE",
    monthly: 697,
    annual: 5597,
    desc: "For serious LOs who want direct access to Derek's playbook.",
    features: [
      "Everything in Accelerator",
      "Monthly 1:1 strategy session",
      "Personal pipeline review",
      "Direct Slack access to Derek",
      "APEX recruiting tools access",
      "Lifetime curriculum updates",
    ],
    cta: "Start Elite",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{ padding: "100px 24px", background: "var(--obsidian)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Enrollment</div>
          <h2 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16 }}>
            Choose Your Path
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>
            No free trials. No fluff. Just the training that builds careers.
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 100, padding: "6px 8px" }}>
            <button onClick={() => setAnnual(false)} style={{
              padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer",
              background: !annual ? "linear-gradient(135deg, #F5A623, #D4881A)" : "transparent",
              color: !annual ? "#0A0A0B" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, transition: "all 0.2s",
            }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{
              padding: "8px 20px", borderRadius: 100, border: "none", cursor: "pointer",
              background: annual ? "linear-gradient(135deg, #F5A623, #D4881A)" : "transparent",
              color: annual ? "#0A0A0B" : "var(--text-secondary)",
              fontSize: 13, fontWeight: 600, transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Annual
              <span style={{
                fontSize: 10, background: "#10B981", color: "white",
                padding: "2px 6px", borderRadius: 100, fontWeight: 700,
              }}>Save 30%</span>
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="price-grid">
          {plans.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight ? "var(--charcoal)" : "var(--charcoal)",
              border: plan.highlight ? "1px solid rgba(245,166,35,0.5)" : "1px solid var(--border)",
              borderRadius: 20, padding: 32,
              position: "relative",
              boxShadow: plan.highlight ? "0 0 60px rgba(245,166,35,0.1)" : "none",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "translateY(0)")}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #F5A623, #D4881A)",
                  color: "#0A0A0B", fontSize: 11, fontWeight: 800,
                  padding: "4px 16px", borderRadius: 100, letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                }}>{plan.badge}</div>
              )}

              <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.2em" }}>{plan.name}</div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span className="font-display" style={{ fontSize: 48, fontWeight: 900, color: "var(--text-primary)" }}>
                  ${annual ? plan.annual.toLocaleString() : plan.monthly}
                </span>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/{annual ? "yr" : "mo"}</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, marginBottom: 28 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                    <span style={{ color: "#10B981", fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="/enroll" style={{
                display: "block", textAlign: "center",
                background: plan.highlight ? "linear-gradient(135deg, #F5A623, #D4881A)" : "var(--slate)",
                color: plan.highlight ? "#0A0A0B" : "var(--text-primary)",
                border: plan.highlight ? "none" : "1px solid var(--border)",
                padding: "14px 24px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                transition: "opacity 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >{plan.cta} →</a>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Billed securely via ZenoPay.ai · Cancel anytime · Questions? <a href="mailto:derekhuit@gmail.com" style={{ color: "var(--honey)", textDecoration: "none" }}>Contact us</a>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .price-grid { grid-template-columns: 1fr !important; max-width: 460px; margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}
