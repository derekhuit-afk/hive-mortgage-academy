export default function Stats() {
  const stats = [
    { value: "$1B+", label: "Career Production" },
    { value: "18+", label: "Years in Mortgage" },
    { value: "6", label: "Core Modules" },
    { value: "24/7", label: "AI Coach Access" },
  ];

  return (
    <section style={{
      background: "var(--charcoal)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      padding: "40px 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24,
      }} className="stats-grid">
        {stats.map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div className="font-display" style={{
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900,
              background: "linear-gradient(135deg, #F5A623, #FFC85C)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
