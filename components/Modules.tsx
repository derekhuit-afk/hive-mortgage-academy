const modules = [
  {
    number: "01",
    title: "Day 1 — You Passed. Now What?",
    desc: "Your first 48 hours as a licensed LO. How to choose the right company, set up your digital presence, and close your first deal before anyone expects you to.",
    lessons: ["Your first 48 hours as a licensed LO", "Choosing the right lender to hang your license", "Setting up your digital presence", "What nobody tells you about your first deal"],
    badge: "Start Here",
    badgeColor: "#F5A623",
  },
  {
    number: "02",
    title: "Understanding Loan Products",
    desc: "FHA, VA, Conventional, USDA — explained in plain English. Know exactly when to use each product and how to walk a borrower through their options with confidence.",
    lessons: ["FHA vs. Conventional breakdown", "VA loan advantages and eligibility", "USDA and niche programs", "How to explain options to any borrower"],
    badge: "Core Skills",
    badgeColor: "#3B82F6",
  },
  {
    number: "03",
    title: "Building Your Referral Pipeline",
    desc: "The Realtor relationship playbook. How to get your first 10 referral partners in 30 days using Derek's proven scripts and follow-up cadence.",
    lessons: ["The Realtor relationship playbook", "Your first 10 referral partners in 30 days", "Scripts, objections, follow-up cadence", "AI role-play: practice your Realtor pitch"],
    badge: "Revenue Driver",
    badgeColor: "#10B981",
  },
  {
    number: "04",
    title: "CRM + Tech Stack Setup",
    desc: "Pipeline management from Day 1. What tools matter, how to build a personal brand, and how to use AI to outwork every LO in your market.",
    lessons: ["Pipeline management basics", "Tools that matter on Day 1", "Digital business card + personal brand", "AI coach: build your tech stack plan"],
    badge: "Modern LO",
    badgeColor: "#8B5CF6",
  },
  {
    number: "05",
    title: "Your First Borrower Conversation",
    desc: "Pre-qual vs. pre-approval, reading a credit report, and setting expectations. Practice every scenario with the AI coach before you ever pick up the phone.",
    lessons: ["Pre-qual vs. pre-approval explained", "Reading a credit report live", "Setting expectations on timeline", "AI role-play: full borrower call simulation"],
    badge: "Client Ready",
    badgeColor: "#F59E0B",
  },
  {
    number: "06",
    title: "Compliance 101 for New LOs",
    desc: "RESPA, TRID, fair lending — what can get you fired or fined. Social media compliance. Know the rules before you break them.",
    lessons: ["RESPA, TRID, fair lending basics", "What can get you fired or fined", "Social media compliance for LOs", "Quiz + AI Q&A review"],
    badge: "Stay Protected",
    badgeColor: "#EF4444",
  },
];

export default function Modules() {
  return (
    <section id="curriculum" style={{ padding: "100px 24px", background: "var(--obsidian)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-block",
            fontSize: 11, color: "var(--honey)", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16,
          }}>The Curriculum</div>
          <h2 className="font-display" style={{
            fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900,
            color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 16,
          }}>Six Modules.<br />Zero Fluff.</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
            Everything a new LO actually needs to close loans — built from 18 years and $1B+ in production.
          </p>
        </div>

        {/* Module grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="module-grid">
          {modules.map((mod) => (
            <div key={mod.number} style={{
              background: "var(--charcoal)", border: "1px solid var(--border)",
              borderRadius: 16, padding: 28, transition: "border-color 0.3s, transform 0.3s",
              cursor: "pointer",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,166,35,0.4)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div className="font-display" style={{
                  fontSize: 48, fontWeight: 900, color: "rgba(245,166,35,0.15)", lineHeight: 1,
                }}>{mod.number}</div>
                <div style={{
                  fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 100,
                  background: `${mod.badgeColor}20`, color: mod.badgeColor,
                  border: `1px solid ${mod.badgeColor}40`,
                  letterSpacing: "0.05em",
                }}>{mod.badge}</div>
              </div>

              <h3 style={{
                fontSize: 16, fontWeight: 700, color: "var(--text-primary)",
                marginBottom: 10, lineHeight: 1.3,
              }}>{mod.title}</h3>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>{mod.desc}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mod.lessons.map(lesson => (
                  <div key={lesson} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: "var(--honey)", fontSize: 12, marginTop: 2, flexShrink: 0 }}>▸</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{lesson}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .module-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .module-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
