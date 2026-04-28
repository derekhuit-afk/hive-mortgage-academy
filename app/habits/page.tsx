"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { computePlan, deriveDailyTargets, DEFAULTS, fmtNumber } from "@/lib/businessPlan";
import { saveAndSync, loadTool } from "@/lib/hooks/useToolSync";

const PLAN_KEY = "hma_business_plan";
const PLAN_TOOL = "business_plan";
const LOG_KEY = "hma_habit_log";
const LOG_TOOL = "habit_log";

interface DayLog {
  date: string;       // YYYY-MM-DD
  conversations: number;
  dials: number;
  followUps: number;
  partnerTouches: number;
  contentPosts: number;
  note: string;
}

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);

export default function HabitsPage() {
  const [plan, setPlan] = useState(DEFAULTS);
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(TODAY_ISO());

  useEffect(() => {
    try {
      const p = localStorage.getItem(PLAN_KEY);
      if (p) setPlan(JSON.parse(p));
      const l = localStorage.getItem(LOG_KEY);
      if (l) setLogs(JSON.parse(l));
    } catch {}
    setHydrated(true);
    loadTool(PLAN_TOOL, PLAN_KEY).then(r => { if (r) setPlan(r); });
    loadTool(LOG_TOOL, LOG_KEY).then(r => { if (r) setLogs(r); });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAndSync(LOG_KEY, LOG_TOOL, logs);
  }, [logs, hydrated]);

  const out = useMemo(() => computePlan(plan), [plan]);
  const targets = useMemo(() => deriveDailyTargets(out), [out]);

  const todayLog: DayLog = logs[today] || { date: today, conversations: 0, dials: 0, followUps: 0, partnerTouches: 0, contentPosts: 0, note: "" };
  const updateToday = (patch: Partial<DayLog>) => {
    setLogs(prev => ({ ...prev, [today]: { ...todayLog, ...patch } }));
  };

  // 7-day rolling window stats
  const last7 = useMemo(() => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates.map(d => ({ date: d, log: logs[d] || null }));
  }, [logs]);

  const weekTotals = useMemo(() => last7.reduce((acc, x) => {
    if (!x.log) return acc;
    return {
      conversations: acc.conversations + x.log.conversations,
      dials: acc.dials + x.log.dials,
      followUps: acc.followUps + x.log.followUps,
      partnerTouches: acc.partnerTouches + x.log.partnerTouches,
      contentPosts: acc.contentPosts + x.log.contentPosts,
    };
  }, { conversations: 0, dials: 0, followUps: 0, partnerTouches: 0, contentPosts: 0 }), [last7]);

  // Progress vs. weekly targets
  const weekTargets = {
    conversations: targets.conversationsPerDay * 5,
    dials: targets.callsPerDay * 5,
    followUps: targets.followUpsPerDay * 5,
    partnerTouches: targets.partnerTouchesPerWeek,
    contentPosts: targets.contentPostsPerWeek,
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Daily Discipline</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Habit Tracker</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            Log it daily. The activity you don&apos;t track doesn&apos;t happen.
            Targets below are pulled from your <Link href="/business-plan" style={{ color: "var(--honey)" }}>Business Plan</Link>.
          </p>
        </div>

        {/* Today */}
        <section style={{ ...panelStyle, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <h2 style={panelHeading}>Today — {formatDate(today)}</h2>
            <input type="date" value={today} onChange={e => setToday(e.target.value)}
              style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", color: "var(--text-secondary)", fontSize: 12, fontFamily: "inherit" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            <Counter label="Conversations" target={targets.conversationsPerDay} value={todayLog.conversations} onChange={v => updateToday({ conversations: v })} />
            <Counter label="Dials" target={targets.callsPerDay} value={todayLog.dials} onChange={v => updateToday({ dials: v })} />
            <Counter label="Follow-ups" target={targets.followUpsPerDay} value={todayLog.followUps} onChange={v => updateToday({ followUps: v })} />
            <Counter label="Partner touches" target={targets.partnerTouchesPerWeek / 5} value={todayLog.partnerTouches} onChange={v => updateToday({ partnerTouches: v })} subtitle="weekly target / 5 days" />
            <Counter label="Content posts" target={targets.contentPostsPerWeek / 5} value={todayLog.contentPosts} onChange={v => updateToday({ contentPosts: v })} subtitle="weekly target / 5 days" />
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>End-of-day note (optional)</div>
            <textarea
              value={todayLog.note} onChange={e => updateToday({ note: e.target.value })}
              placeholder="One sentence — what worked, what didn't, what you'll do tomorrow."
              style={{ width: "100%", minHeight: 60, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 12, color: "var(--text-primary)", fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
            />
          </div>
        </section>

        {/* This week */}
        <section style={{ ...panelStyle, marginBottom: 20 }}>
          <h2 style={panelHeading}>Last 7 days</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
            <WeekStat label="Conversations" total={weekTotals.conversations} target={weekTargets.conversations} />
            <WeekStat label="Dials" total={weekTotals.dials} target={weekTargets.dials} />
            <WeekStat label="Follow-ups" total={weekTotals.followUps} target={weekTargets.followUps} />
            <WeekStat label="Partner touches" total={weekTotals.partnerTouches} target={weekTargets.partnerTouches} />
            <WeekStat label="Content posts" total={weekTotals.contentPosts} target={weekTargets.contentPosts} />
          </div>

          {/* 7-day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 8 }}>
            {last7.map(d => {
              const total = (d.log?.conversations || 0) + (d.log?.dials || 0) + (d.log?.followUps || 0);
              const pct = targets.conversationsPerDay > 0 ? Math.min(1, (d.log?.conversations || 0) / targets.conversationsPerDay) : 0;
              const isToday = d.date === today;
              const dayName = new Date(d.date).toLocaleDateString(undefined, { weekday: "short" });
              return (
                <button key={d.date} onClick={() => setToday(d.date)} style={{
                  background: pct >= 1 ? "rgba(16,185,129,0.18)" : pct >= 0.5 ? "rgba(245,166,35,0.15)" : "var(--ink)",
                  border: `1px solid ${isToday ? "var(--honey)" : "var(--border)"}`,
                  borderRadius: 10, padding: 8, textAlign: "left" as const, cursor: "pointer", color: "inherit", fontFamily: "inherit",
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{dayName}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: pct >= 1 ? "#10B981" : "var(--text-primary)" }}>{d.log?.conversations || 0}</div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>conv.</div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.20)", borderRadius: 12, padding: 18 }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--honey)" }}>Reality check: </strong>
            self-reported activity is unreliable. Be brutally honest. A &quot;conversation&quot; means an actual two-way exchange about mortgage,
            not a voicemail. A &quot;follow-up&quot; means a personalized message, not a mass email. Inflate the numbers and you&apos;ll
            inflate your expectations of what your pipeline should produce — and then be confused when it doesn&apos;t.
          </div>
        </section>
      </main>
    </div>
  );
}

function Counter({ label, target, value, onChange, subtitle }: { label: string; target: number; value: number; onChange: (n: number) => void; subtitle?: string }) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const color = pct >= 1 ? "#10B981" : pct >= 0.5 ? "var(--honey)" : "var(--text-secondary)";
  return (
    <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>Target: {fmtNumber(target)}{subtitle ? ` (${subtitle})` : ""}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={btnStyle}>−</button>
        <input type="number" value={value} onChange={e => onChange(Math.max(0, parseInt(e.target.value) || 0))}
          style={{ flex: 1, minWidth: 0, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", color: color, fontSize: 22, fontWeight: 800, textAlign: "center", fontFamily: "inherit" }} />
        <button onClick={() => onChange(value + 1)} style={btnStyle}>+</button>
      </div>
      <div style={{ height: 4, background: "var(--charcoal)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct * 100}%`, background: color, transition: "width 0.2s" }} />
      </div>
    </div>
  );
}

function WeekStat({ label, total, target }: { label: string; total: number; target: number }) {
  const pct = target > 0 ? total / target : 0;
  const color = pct >= 1 ? "#10B981" : pct >= 0.7 ? "var(--honey)" : "var(--text-secondary)";
  return (
    <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{total}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>of {fmtNumber(target)} target ({Math.round(pct * 100)}%)</div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

const panelStyle = { background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 };
const panelHeading = { fontSize: 12, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: 0 };
const btnStyle = { width: 36, height: 36, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 18, fontWeight: 700, cursor: "pointer", flexShrink: 0 };

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
