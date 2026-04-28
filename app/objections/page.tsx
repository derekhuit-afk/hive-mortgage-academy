"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OBJECTIONS, CATEGORIES, searchObjections, type Objection, type ObjectionCategory } from "@/lib/objections";

export default function ObjectionsPage() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<ObjectionCategory | "all">("all");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = query.trim() ? searchObjections(query) : OBJECTIONS;
    if (activeCat !== "all") list = list.filter(o => o.category === activeCat);
    return list;
  }, [query, activeCat]);

  async function askAi() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer("");
    try {
      const r = await fetch("/api/objection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: aiQuery }),
      });
      const d = await r.json();
      setAiAnswer(d.content || "Couldn't generate a response. Try rephrasing.");
    } catch {
      setAiAnswer("Something went wrong. Try again.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Field Manual</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
            Objection Handler
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            {OBJECTIONS.length} curated objections from the field, with multiple response styles. Search by what the borrower said,
            filter by category, or ask the AI fallback for long-tail scenarios.
          </p>
        </div>

        {/* Search + filter */}
        <section style={{ ...panel, marginBottom: 18 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder='Search — try "rate," "self-employed," "Realtor"…'
            style={{ width: "100%", background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>All ({OBJECTIONS.length})</CatChip>
            {CATEGORIES.map(c => (
              <CatChip key={c.key} active={activeCat === c.key} onClick={() => setActiveCat(c.key)}>
                {c.emoji} {c.label} ({OBJECTIONS.filter(o => o.category === c.key).length})
              </CatChip>
            ))}
          </div>
        </section>

        {/* Results */}
        {filtered.length === 0 ? (
          <div style={{ ...panel, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 6 }}>No matches in the curated library.</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Try the AI fallback below for unusual scenarios.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map(o => <ObjectionCard key={o.id} obj={o} />)}
          </div>
        )}

        {/* AI fallback */}
        <section style={{ ...panel, marginTop: 24, borderColor: "rgba(245,166,35,0.30)" }}>
          <h2 style={panelH}>AI Fallback — Long-tail scenarios</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, marginBottom: 14, lineHeight: 1.55 }}>
            For objections not in the curated library. <strong style={{ color: "var(--text-secondary)" }}>The AI response is a starting point, not a script — verify with your manager before using it on a real borrower or partner.</strong>
          </p>
          <textarea
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            placeholder="Describe the scenario, including what the borrower or partner said and the context..."
            style={{ width: "100%", minHeight: 80, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
          />
          <button
            onClick={askAi} disabled={aiLoading || !aiQuery.trim()}
            style={{ marginTop: 12, background: aiQuery.trim() ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--charcoal)", color: aiQuery.trim() ? "#0A0A0B" : "var(--text-muted)", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: aiQuery.trim() && !aiLoading ? "pointer" : "not-allowed" }}
          >
            {aiLoading ? "Thinking…" : "Get AI response"}
          </button>
          {aiAnswer && (
            <div style={{ marginTop: 16, padding: 16, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>AI suggestion (verify before use)</div>
              <div style={{ fontSize: 14, color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>{aiAnswer}</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ObjectionCard({ obj }: { obj: Objection }) {
  const [open, setOpen] = useState(false);
  const cat = CATEGORIES.find(c => c.key === obj.category);
  return (
    <div style={panel}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", textAlign: "left" as const, background: "transparent", border: "none", padding: 0, color: "inherit", cursor: "pointer", fontFamily: "inherit" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              {cat?.emoji} {cat?.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
              &quot;{obj.borrowerLine}&quot;
            </div>
          </div>
          <span style={{ color: "var(--text-muted)", fontSize: 18, marginTop: 10 }}>{open ? "−" : "+"}</span>
        </div>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          <div style={{ padding: 12, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.18)", borderRadius: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>What they really mean</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{obj.whatTheyMean}</div>
          </div>

          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Response options</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {obj.responses.map((r, i) => (
              <div key={i} style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{r.style}</div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>&quot;{r.script}&quot;</div>
              </div>
            ))}
          </div>

          {obj.pitfalls && (
            <div style={{ marginTop: 14, padding: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)", borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Pitfall</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{obj.pitfalls}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CatChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--honey)" : "var(--ink)",
      color: active ? "#0A0A0B" : "var(--text-secondary)",
      border: "1px solid " + (active ? "var(--honey)" : "var(--border)"),
      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    }}>{children}</button>
  );
}

const panel = { background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 };
const panelH = { fontSize: 12, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: 0 };

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
