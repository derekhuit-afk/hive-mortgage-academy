"use client";

export default function Hero() {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center",
      background: "var(--obsidian)",
      position: "relative", overflow: "hidden",
      paddingTop: 68,
    }}>
      {/* Background hex pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.4,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23F5A62310'/%3E%3C/svg%3E")`,
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 800, height: 600,
        background: "radial-gradient(ellipse, rgba(245,166,35,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
          className="hero-grid">

          {/* Left */}
          <div>
            <div className="fade-up fade-up-1" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.3)",
              borderRadius: 100, padding: "6px 16px", marginBottom: 32,
            }}>
              <span style={{ fontSize: 12 }}>🐝</span>
              <span style={{ fontSize: 12, color: "var(--honey)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Built from Alaska · 18+ Years in Mortgage</span>
            </div>

            <h1 className="fade-up fade-up-2 font-display" style={{
              fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 900, lineHeight: 1.05,
              color: "var(--text-primary)", marginBottom: 24,
            }}>
              You Passed<br />
              The Test.<br />
              <span style={{
                background: "linear-gradient(135deg, #F5A623 0%, #FFC85C 50%, #D4881A 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Now What?</span>
            </h1>

            <p className="fade-up fade-up-3" style={{
              fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.7,
              marginBottom: 40, maxWidth: 480,
            }}>
              Most new LOs quit within their first year — not because they failed the exam, but because nobody taught them how to actually close loans. Hive Mortgage Academy fixes that.
            </p>

            <div className="fade-up fade-up-4" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="/enroll" style={{
                background: "linear-gradient(135deg, #F5A623, #D4881A)",
                color: "#0A0A0B", padding: "16px 32px", borderRadius: 10,
                fontSize: 16, fontWeight: 700, textDecoration: "none",
                display: "inline-block", transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(245,166,35,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >Start Your Training →</a>

              <a href="#curriculum" style={{
                border: "1px solid var(--border)", color: "var(--text-primary)",
                padding: "16px 32px", borderRadius: 10,
                fontSize: 16, fontWeight: 600, textDecoration: "none",
                display: "inline-block", transition: "border-color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--honey)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >View Curriculum</a>
            </div>
          </div>

          {/* Right — card */}
          <div className="fade-up fade-up-3" style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              background: "var(--charcoal)", border: "1px solid var(--border)",
              borderRadius: 20, padding: 32, maxWidth: 400, width: "100%",
              boxShadow: "0 0 60px rgba(245,166,35,0.08)",
            }}>
              <div style={{
                background: "rgba(245,166,35,0.08)", borderRadius: 12,
                padding: "16px 20px", marginBottom: 24,
                border: "1px solid rgba(245,166,35,0.15)",
              }}>
                <div style={{ fontSize: 12, color: "var(--honey)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Coach Active</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>"How do I find my first Realtor referral partner?"</div>
              </div>

              {[
                { icon: "🎓", label: "6 Core Modules", sub: "Video + quizzes" },
                { icon: "🤖", label: "AI Mortgage Coach", sub: "24/7 Q&A + role-play" },
                { icon: "📈", label: "Pipeline Playbook", sub: "Derek's $1B framework" },
                { icon: "🏔️", label: "Built from Alaska", sub: "Real-world curriculum" },
              ].map(({ icon, label, sub }) => (
                <div key={label} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 36, height: 36, background: "var(--slate)", borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                    flexShrink: 0,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 24, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>Powered by</div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--muted)", borderRadius: 8, padding: "6px 12px",
                  border: "1px solid var(--border)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>⬡ Huit.AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}
