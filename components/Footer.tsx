export default function Footer() {
  return (
    <footer style={{
      background: "var(--charcoal)", borderTop: "1px solid var(--border)",
      padding: "48px 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48 }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32,
                background: "linear-gradient(135deg, #F5A623, #D4881A)",
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🐝</div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Hive Mortgage Academy</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 320, marginBottom: 16 }}>
              The training platform for newly licensed loan officers who want to close deals from Day 1. Built from 18+ years and $1B+ in career mortgage production.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "var(--muted)", borderRadius: 8, padding: "6px 12px",
              border: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by</span>
              <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>⬡ Huit.AI</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Platform</div>
            {["Curriculum", "AI Coach", "Pricing", "Enroll"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                display: "block", fontSize: 13, color: "var(--text-muted)",
                textDecoration: "none", marginBottom: 10, transition: "color 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >{l}</a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Contact</div>
            <a href="mailto:derekhuit@gmail.com" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none", display: "block", marginBottom: 10 }}>derekhuit@gmail.com</a>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>Anchorage, Alaska</div>
            <a href="https://huit.ai" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "var(--honey)", textDecoration: "none" }}>huit.ai →</a>
          </div>
        </div>

        <div style={{
          marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Hive Mortgage Academy · Huit.AI, Inc. All rights reserved.
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Built from Alaska 🏔️</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </footer>
  );
}
