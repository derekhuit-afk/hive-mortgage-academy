"use client";
import Link from "next/link";

interface Tool {
  href: string;
  title: string;
  blurb: string;
  status?: "new" | "existing";
  emoji: string;
}

interface Section {
  title: string;
  blurb: string;
  tools: Tool[];
}

const SECTIONS: Section[] = [
  {
    title: "Plan & Track",
    blurb: "Run the math. Track the activity. Hold yourself accountable.",
    tools: [
      { href: "/business-plan", title: "Business Plan Builder", blurb: "Reverse-engineer your income goal into the daily activity that produces it. Includes scenario projections.", status: "new", emoji: "📊" },
      { href: "/habits",        title: "Habit Tracker",         blurb: "Daily activity log tied to your plan numbers. 7-day rolling view.",                                  status: "new", emoji: "✅" },
      { href: "/fast-start",    title: "Fast Start Monday",     blurb: "Weekly kickoff ritual. Three questions, one checklist, the rest of your week structured.",         status: "new", emoji: "🌅" },
    ],
  },
  {
    title: "Sales & Conversation",
    blurb: "What you say when borrowers and partners push back.",
    tools: [
      { href: "/objections", title: "Objection Handler",        blurb: "Curated objections by category, with multiple response styles. Search, filter, plus an AI fallback for long-tail scenarios.", status: "new", emoji: "🛡️" },
      { href: "/pitch",      title: "Elevator Pitch Builder",   blurb: "Five-piece guided template. Live word count and three tone variants.",                            status: "new", emoji: "🎯" },
      { href: "/disc",       title: "Reading the Room",         blurb: "Communication-style trainer (D/I/S/C). Recognition cues and how to adjust your delivery.",        status: "new", emoji: "👥" },
      { href: "/roleplay",   title: "Borrower Role-Play",       blurb: "Practice on AI borrowers (skeptical, rate-shopper, self-employed, divorce). End-of-session scoring.", status: "new", emoji: "🎭" },
    ],
  },
  {
    title: "Coaching",
    blurb: "Get unstuck.",
    tools: [
      { href: "/ai-derek", title: "AI Derek", blurb: "Mindset, accountability, and business-strategy coach. Refuses regulatory and product questions by design — those go to a real Derek call.", status: "new", emoji: "🧠" },
    ],
  },
  {
    title: "Pipeline & CRM",
    blurb: "The systems that catch what your memory can't.",
    tools: [
      { href: "/sphere",         title: "SphereEngine",   blurb: "Score and track your sphere of influence. Family, friends, past clients, and warm leads.",  status: "existing", emoji: "🌐" },
      { href: "/agent-partner",  title: "AgentPartner",   blurb: "Realtor and partner CRM. Track relationships from cold to active.",                          status: "existing", emoji: "🤝" },
      { href: "/loantrack",      title: "LoanTrack",      blurb: "Active loan pipeline. Status, conditions, and next-actions for every file.",                  status: "existing", emoji: "📁" },
      { href: "/review-loop",    title: "ReviewLoop",     blurb: "Post-close cadence. 30-60-90 touchpoints, review asks, and referral capture.",               status: "existing", emoji: "🔁" },
      { href: "/equity-pulse",   title: "EquityPulse",    blurb: "Past-client equity watch. Surface refi candidates as rates and home values move.",            status: "existing", emoji: "💎" },
    ],
  },
  {
    title: "Borrower-Facing",
    blurb: "Tools you use with borrowers, not on them.",
    tools: [
      { href: "/payment-first", title: "PaymentFirst Consultation", blurb: "Walk borrowers from max qualification to comfortable payment.",         status: "existing", emoji: "💵" },
      { href: "/credit-path",   title: "CreditPath",                blurb: "90-day credit improvement roadmap by score band.",                       status: "existing", emoji: "📈" },
      { href: "/readyscore",    title: "ReadyScore",                blurb: "Borrower readiness assessment.",                                         status: "existing", emoji: "🎯" },
    ],
  },
  {
    title: "Career",
    blurb: "For LOs deciding what comes next.",
    tools: [
      { href: "/launchkit",      title: "LO LaunchKit",   blurb: "Onboarding kit for new LOs starting with Derek's team.",                    status: "existing", emoji: "🚀" },
      { href: "/command-center", title: "Command Center", blurb: "Mission-control view across your active relationships and pipeline.",        status: "existing", emoji: "🎛️" },
      { href: "/hivepass",       title: "HivePass",       blurb: "Graduate-only credential and recognition for completers of the curriculum.", status: "existing", emoji: "🏆" },
    ],
  },
];

export default function ToolsIndexPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>The Toolkit</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4.5vw,46px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 12 }}>
            Production Tools
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 780, lineHeight: 1.6 }}>
            Every tool here ties to something covered in the curriculum. The Business Plan Builder is the centerpiece —
            most other tools draw from its numbers. If you haven&apos;t built your plan yet, start there.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {SECTIONS.map(s => (
            <section key={s.title}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{s.title}</h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.blurb}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {s.tools.map(t => <ToolCard key={t.href} t={t} />)}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function ToolCard({ t }: { t: Tool }) {
  return (
    <Link href={t.href} style={{
      display: "flex", flexDirection: "column", gap: 8,
      background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 14, padding: 16,
      textDecoration: "none", color: "inherit",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{t.emoji}</div>
        {t.status === "new" && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(245,166,35,0.15)", color: "var(--honey)", padding: "3px 7px", borderRadius: 5, border: "1px solid rgba(245,166,35,0.3)" }}>NEW</span>
        )}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{t.title}</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{t.blurb}</div>
      <div style={{ fontSize: 12, color: "var(--honey)", fontWeight: 700, marginTop: 4 }}>Open →</div>
    </Link>
  );
}

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/dashboard" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Dashboard</Link>
    </header>
  );
}
