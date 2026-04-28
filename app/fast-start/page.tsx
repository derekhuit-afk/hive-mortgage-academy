"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { saveAndSync, loadTool } from "@/lib/hooks/useToolSync";
import { computePlan, deriveDailyTargets, DEFAULTS, fmtNumber } from "@/lib/businessPlan";

const LOCAL_KEY = "hma_fast_start";
const TOOL = "fast_start";

interface ChecklistItem { id: string; label: string; detail?: string; done: boolean; }
interface WeekState {
  weekStart: string;        // YYYY-MM-DD of Monday
  oneThing: string;         // Top priority for the week
  topPartners: string;      // 3 partners to touch this week
  blockers: string;         // What's in the way
  items: ChecklistItem[];
}

const DEFAULT_ITEMS = (): ChecklistItem[] => [
  { id: "review", label: "Review last week's numbers vs. plan", detail: "Look at conversations, pull-through, and which leads went silent. Be honest.", done: false },
  { id: "pipeline", label: "Audit the pipeline — every active loan", detail: "Status, blocker, next action, ETA. Anything stuck more than 5 days gets escalated.", done: false },
  { id: "past-clients", label: "Pick 5 past clients to call this week", detail: "Year-1 anniversaries, refi candidates from rate moves, and anyone with a life event.", done: false },
  { id: "partners", label: "Pick 3 referral partners for personal touches", detail: "Realtor, CPA, family law professional, HR contact — value-first, not transactional.", done: false },
  { id: "leads", label: "Re-engage 5 cold leads from the last 90 days", detail: "Specific, personalized message — never a mass blast.", done: false },
  { id: "content", label: "Schedule this week's 3 content posts", detail: "One educational, one personal, one market data. Compliance-checked, NMLS in bio.", done: false },
  { id: "calendar", label: "Block your phone time", detail: "2-3 hour calling block, same time every day. Phone OUT of reach during the block.", done: false },
  { id: "learning", label: "Schedule 30 min of learning", detail: "One CFPB enforcement action, one product update, or one chapter from the curriculum.", done: false },
];

const TODAY = () => new Date();
function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Sunday → previous Monday
  const m = new Date(d);
  m.setDate(diff);
  m.setHours(0, 0, 0, 0);
  return m;
}
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export default function FastStartPage() {
  const [plan, setPlan] = useState(DEFAULTS);
  const [state, setState] = useState<WeekState>({
    weekStart: isoDate(getMonday(TODAY())),
    oneThing: "",
    topPartners: "",
    blockers: "",
    items: DEFAULT_ITEMS(),
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.weekStart) {
          // If it's a new week, reset the items but preserve the structure
          const todayMonday = isoDate(getMonday(TODAY()));
          if (parsed.weekStart !== todayMonday) {
            setState({ ...parsed, weekStart: todayMonday, items: DEFAULT_ITEMS(), oneThing: "", topPartners: "", blockers: "" });
          } else {
            setState(parsed);
          }
        }
      }
      const planRaw = localStorage.getItem("hma_business_plan");
      if (planRaw) setPlan(JSON.parse(planRaw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAndSync(LOCAL_KEY, TOOL, state);
  }, [state, hydrated]);

  const out = computePlan(plan);
  const targets = deriveDailyTargets(out);
  const completed = state.items.filter(i => i.done).length;
  const totalItems = state.items.length;

  const toggle = (id: string) => setState(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, done: !i.done } : i) }));
  const reset = () => setState(prev => ({ ...prev, items: DEFAULT_ITEMS(), oneThing: "", topPartners: "", blockers: "" }));

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Weekly Ritual</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Fast Start Monday</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 700, lineHeight: 1.55 }}>
            45 minutes every Monday morning. Set the week before the week sets you. The LOs who skip Monday are reactive
            for the next 4 days — and lose deals to the LOs who didn&apos;t.
          </p>
        </div>

        {/* Week-at-a-glance */}
        <section style={{ ...panel, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
            <h2 style={panelH}>Week of {formatDate(state.weekStart)}</h2>
            <div style={{ fontSize: 12, color: completed === totalItems ? "#10B981" : "var(--text-secondary)", fontWeight: 700 }}>
              {completed}/{totalItems} complete
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 18 }}>
            <Stat label="Conversations target" value={`${fmtNumber(targets.conversationsPerDay * 5)}/wk`} />
            <Stat label="Dials target" value={`${fmtNumber(targets.callsPerDay * 5)}/wk`} />
            <Stat label="Partner touches" value={`${targets.partnerTouchesPerWeek}/wk`} />
            <Stat label="Content posts" value={`${targets.contentPostsPerWeek}/wk`} />
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 12, background: "var(--ink)", borderRadius: 10, border: "1px solid var(--border)", lineHeight: 1.55 }}>
            Targets pulled from your <Link href="/business-plan" style={{ color: "var(--honey)" }}>Business Plan</Link>.
            Update the plan if these numbers don&apos;t match your real goals.
          </div>
        </section>

        {/* Three big questions */}
        <section style={{ ...panel, marginBottom: 18 }}>
          <h2 style={panelH}>Three Questions Before You Start the Week</h2>
          <div style={{ marginTop: 16 }}>
            <Q label="What's the ONE thing this week, that if it gets done, makes the week a success?"
               value={state.oneThing}
               onChange={v => setState(p => ({ ...p, oneThing: v }))}
               placeholder="The single most leveraged thing. If it has to compete with anything else, it's not the one thing." />
            <Q label="Who are your 3 highest-leverage partner touches this week?"
               value={state.topPartners}
               onChange={v => setState(p => ({ ...p, topPartners: v }))}
               placeholder="Names. With phone numbers if you can pull them right now."
               rows={3} />
            <Q label="What's the most likely thing to derail this week, and how will you handle it?"
               value={state.blockers}
               onChange={v => setState(p => ({ ...p, blockers: v }))}
               placeholder="Be specific. 'I always get pulled into urgent stuff' is not specific."
               rows={3} />
          </div>
        </section>

        {/* Checklist */}
        <section style={{ ...panel, marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <h2 style={panelH}>Monday Setup Checklist</h2>
            <button onClick={reset} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>Reset week</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {state.items.map(item => (
              <label key={item.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 14, background: item.done ? "rgba(16,185,129,0.08)" : "var(--ink)", border: `1px solid ${item.done ? "rgba(16,185,129,0.25)" : "var(--border)"}`, borderRadius: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} style={{ marginTop: 2, accentColor: "#10B981", width: 16, height: 16, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: item.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.done ? "line-through" : "none", lineHeight: 1.4 }}>{item.label}</div>
                  {item.detail && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>{item.detail}</div>}
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* The whole-week framework */}
        <section style={panel}>
          <h2 style={panelH}>The Rest of the Week</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 14 }}>
            <DayCard day="Tues" theme="Active loans" detail="2-hour pipeline review block. Every loan in motion gets a status touch. Identify and clear conditions before the underwriter circles back." />
            <DayCard day="Wed"  theme="New business"  detail="Block 3 hours of phone calls + outreach. Past clients, cold leads, new referral introductions. This is the engine day." />
            <DayCard day="Thu"  theme="Partner touches" detail="In-person Realtor coffees, broker office visits, and partner content drops. Get out of the office." />
            <DayCard day="Fri"  theme="Close + clean" detail="Everything closing this week: confirm CTC, push final conditions, schedule signings. Leave Monday with the desk clean." />
          </div>
          <div style={{ marginTop: 16, padding: 14, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.20)", borderRadius: 10, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Don&apos;t treat this rigidly. The week-shape is a default — adjust around your real loans. The point is to enter Monday
            with a structure to deviate from, not without one to react against.
          </div>
        </section>
      </main>
    </div>
  );
}

function Q({ label, value, onChange, placeholder, rows }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{label}</div>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        rows={rows || 2}
        style={{ width: "100%", background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "vertical" }} />
    </div>
  );
}

function DayCard({ day, theme, detail }: { day: string; theme: string; detail: string }) {
  return (
    <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{theme}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{detail}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--honey)" }}>{value}</div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
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
