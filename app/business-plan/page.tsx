"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  PlanInputs, DEFAULTS, computePlan, projectScenarios, deriveDailyTargets,
  fmtMoney, fmtMoneyExact, fmtNumber, fmtPct,
} from "@/lib/businessPlan";
import { saveAndSync, loadTool } from "@/lib/hooks/useToolSync";

const LOCAL_KEY = "hma_business_plan";
const TOOL_NAME = "business_plan";

type Tab = "plan" | "projector";

export default function BusinessPlanPage() {
  const [tab, setTab] = useState<Tab>("plan");
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage, then attempt cloud sync
  useEffect(() => {
    try {
      const local = localStorage.getItem(LOCAL_KEY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && typeof parsed.incomeGoal === "number") setInputs(parsed);
      }
    } catch {}
    setHydrated(true);
    // Then attempt cloud overlay (only if newer)
    loadTool(TOOL_NAME, LOCAL_KEY).then(remote => {
      if (remote && typeof remote.incomeGoal === "number") setInputs(remote);
    });
  }, []);

  // Save (debounced via the underlying hook)
  useEffect(() => {
    if (!hydrated) return;
    saveAndSync(LOCAL_KEY, TOOL_NAME, inputs);
  }, [inputs, hydrated]);

  const out = useMemo(() => computePlan(inputs), [inputs]);
  const daily = useMemo(() => deriveDailyTargets(out), [out]);
  const scenarios = useMemo(() => projectScenarios(out.loansPerMonth, inputs), [out.loansPerMonth, inputs]);

  const update = <K extends keyof PlanInputs>(k: K, v: PlanInputs[K]) =>
    setInputs(prev => ({ ...prev, [k]: v }));

  const feasibilityColor =
    out.feasibility === "achievable" ? "#10B981" :
    out.feasibility === "stretch" ? "#F5A623" : "#EF4444";

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>The Centerpiece</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
            Business Plan Builder
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            Reverse-engineer your income goal into the daily activity required to reach it. Most LOs never run this math. The number that matters
            is at the bottom of this page, not the top.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 24 }}>
          <TabBtn active={tab === "plan"} onClick={() => setTab("plan")}>1. Plan</TabBtn>
          <TabBtn active={tab === "projector"} onClick={() => setTab("projector")}>2. What-If Scenarios</TabBtn>
        </div>

        {tab === "plan" ? (
          <div className="layout-grid" style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: 28, alignItems: "start" }}>
            {/* INPUTS */}
            <section style={panelStyle}>
              <h2 style={panelHeading}>Your Numbers</h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
                Edit any input — the math recomputes live. Defaults are reasonable starting points; replace with your own data when you have it.
              </p>

              <Field label="Annual income goal" hint="Take-home commission, before taxes">
                <CurrencyInput value={inputs.incomeGoal} onChange={v => update("incomeGoal", v)} />
              </Field>

              <Field label="Average loan size" hint="Your average funded loan amount">
                <CurrencyInput value={inputs.avgLoan} onChange={v => update("avgLoan", v)} />
              </Field>

              <Field label={`Compensation: ${(inputs.comp_bps / 100).toFixed(2)}% (${inputs.comp_bps} bps)`} hint="Your basis points per closed loan">
                <RangeInput min={25} max={250} step={5} value={inputs.comp_bps} onChange={v => update("comp_bps", v)} />
              </Field>

              <Field label={`Application → Close: ${fmtPct(inputs.pullThrough)}`} hint="Pull-through. Industry midpoint ~65-70%">
                <RangeInput min={0.30} max={0.95} step={0.01} value={inputs.pullThrough} onChange={v => update("pullThrough", v)} />
              </Field>

              <Field label={`Lead → Application: ${fmtPct(inputs.leadToApp)}`} hint="Referrals run 25-35%; mixed sources 10-20%; paid leads 5-12%">
                <RangeInput min={0.03} max={0.50} step={0.01} value={inputs.leadToApp} onChange={v => update("leadToApp", v)} />
              </Field>

              <Field label={`Conversations per Lead: ${inputs.conversationsPerLead.toFixed(1)}`} hint="How many touches it takes to convert a lead to applying">
                <RangeInput min={1} max={6} step={0.1} value={inputs.conversationsPerLead} onChange={v => update("conversationsPerLead", v)} />
              </Field>

              <Field label={`Working Days / Month: ${inputs.workDaysPerMonth}`}>
                <RangeInput min={15} max={26} step={1} value={inputs.workDaysPerMonth} onChange={v => update("workDaysPerMonth", v)} />
              </Field>

              <button
                onClick={() => setInputs(DEFAULTS)}
                style={{ marginTop: 12, background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 10, padding: "9px 14px", fontSize: 12, cursor: "pointer", width: "100%" }}>
                Reset to defaults
              </button>
            </section>

            {/* OUTPUTS */}
            <section>
              {/* Headline */}
              <div style={{ ...panelStyle, marginBottom: 16, borderColor: feasibilityColor + "55" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>To hit {fmtMoney(inputs.incomeGoal)} in commission</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 4 }}>
                      You need <span style={{ color: "var(--honey)" }}>{fmtNumber(out.conversationsPerDay)} quality conversations per day</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      Across {inputs.workDaysPerMonth} working days/month, every month, for 12 months.
                    </div>
                  </div>
                  <div style={{ background: feasibilityColor + "15", color: feasibilityColor, border: `1px solid ${feasibilityColor}55`, borderRadius: 8, padding: "5px 11px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {out.feasibility}
                  </div>
                </div>
                {out.feasibilityNotes.length > 0 && (
                  <div style={{ marginTop: 14, padding: 14, background: "var(--ink)", borderRadius: 10, border: `1px solid ${feasibilityColor}33` }}>
                    {out.feasibilityNotes.map((n, i) => (
                      <div key={i} style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: i === out.feasibilityNotes.length - 1 ? 0 : 8 }}>{n}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* The funnel walkdown */}
              <div style={panelStyle}>
                <h2 style={panelHeading}>The Funnel — Top to Bottom</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
                  <FunnelStep n={1} label="Funded volume needed" big={fmtMoney(out.fundedVolumeRequired)} small={`${fmtMoneyExact(out.fundedVolumeRequired)} per year`} />
                  <FunnelStep n={2} label="Loans to close"        big={fmtNumber(out.loansPerYear)} small={`per year (${fmtNumber(out.loansPerMonth)}/mo, ${fmtNumber(out.loansPerWeek)}/wk)`} />
                  <FunnelStep n={3} label="Applications taken"    big={fmtNumber(out.appsPerMonth)} small={`per month (${fmtNumber(out.appsPerWeek)} per week)`} />
                  <FunnelStep n={4} label="Quality leads"         big={fmtNumber(out.leadsPerMonth)} small={`per month (${fmtNumber(out.leadsPerWeek)} per week)`} />
                  <FunnelStep n={5} label="Conversations"         big={fmtNumber(out.conversationsPerMonth)} small={`per month (${fmtNumber(out.conversationsPerWeek)} per week)`} highlight />
                  <FunnelStep n={6} label="…per working day"      big={fmtNumber(out.conversationsPerDay)} small="this is the only number that matters today" highlight />
                </div>
              </div>

              {/* Daily activity targets */}
              <div style={{ ...panelStyle, marginTop: 16 }}>
                <h2 style={panelHeading}>Daily &amp; Weekly Activity Targets</h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.5 }}>
                  These are the activity numbers your Habit Tracker should be checking against each day.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
                  <Stat label="Conversations / day"     value={fmtNumber(daily.conversationsPerDay)} />
                  <Stat label="Dials / day"             value={fmtNumber(daily.callsPerDay)} hint="~1.6× conversations to account for voicemails" />
                  <Stat label="Follow-ups / day"        value={fmtNumber(daily.followUpsPerDay)} hint="Text/email touches" />
                  <Stat label="Partner touches / week"  value={String(daily.partnerTouchesPerWeek)} hint="Realtors, CPAs, family law" />
                  <Stat label="Content posts / week"    value={String(daily.contentPostsPerWeek)} hint="LinkedIn / IG / niche channels" />
                </div>
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <Link href="/habits" style={ctaPrimary}>Track these in the Habit Tracker →</Link>
                  <Link href="/fast-start" style={ctaSecondary}>Set up Fast Start Monday →</Link>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <ProjectorView scenarios={scenarios} inputs={inputs} baseLoansPerMonth={out.loansPerMonth} />
        )}
      </main>

      <style jsx>{`
        @media (max-width: 880px) {
          .layout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function ProjectorView({ scenarios, inputs, baseLoansPerMonth }: { scenarios: ReturnType<typeof projectScenarios>; inputs: PlanInputs; baseLoansPerMonth: number }) {
  const baseAnnual = scenarios[0].projectedAnnualCommission;
  return (
    <div style={panelStyle}>
      <h2 style={panelHeading}>What if you closed more loans per month?</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.55 }}>
        At your current pace ({fmtNumber(baseLoansPerMonth)} loans/month, ${inputs.avgLoan.toLocaleString()} avg, {inputs.comp_bps} bps),
        small changes in monthly closings create dramatic income changes — because every extra closed loan is high-margin top-line.
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 560, borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th style={thStyle}>Scenario</th>
              <th style={thStyle}>Loans / month</th>
              <th style={thStyle}>Annual funded volume</th>
              <th style={thStyle}>Annual commission</th>
              <th style={thStyle}>Vs. current</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s, idx) => {
              const newLoans = Math.max(0, baseLoansPerMonth + s.loansPerMonthDelta);
              const delta = s.projectedAnnualCommission - baseAnnual;
              const isCurrent = idx === 0;
              return (
                <tr key={s.label} style={{ background: isCurrent ? "rgba(245,166,35,0.06)" : "transparent" }}>
                  <td style={{ ...tdStyle, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? "var(--honey)" : "var(--text-primary)" }}>{s.label}</td>
                  <td style={tdStyle}>{fmtNumber(newLoans)}</td>
                  <td style={tdStyle}>{fmtMoney(s.projectedFundedVolume)}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "var(--text-primary)" }}>{fmtMoneyExact(s.projectedAnnualCommission)}</td>
                  <td style={{ ...tdStyle, color: delta > 0 ? "#10B981" : "var(--text-muted)" }}>
                    {delta > 0 ? `+${fmtMoneyExact(delta)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 22, padding: 16, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--honey)" }}>The leverage: </strong>
          one additional closed loan per month for 12 months at your numbers is{" "}
          <strong style={{ color: "var(--text-primary)" }}>{fmtMoneyExact(scenarios[1].projectedAnnualCommission - baseAnnual)}</strong>
          {" "}in additional annual commission. Three more per month is{" "}
          <strong style={{ color: "var(--text-primary)" }}>{fmtMoneyExact(scenarios[3].projectedAnnualCommission - baseAnnual)}</strong>.
          That&apos;s the math behind why a small consistent improvement in pull-through or pipeline produces compounding income.
        </div>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

const panelStyle = { background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 };
const panelHeading = { fontSize: 12, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 16 };

const thStyle = { textAlign: "left" as const, padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.1em", borderBottom: "1px solid var(--border)" };
const tdStyle = { padding: "12px 12px", fontSize: 14, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" };

const ctaPrimary = { background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" };
const ctaSecondary = { background: "transparent", color: "var(--honey)", border: "1px solid rgba(245,166,35,0.4)", padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" };

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--honey)" : "transparent",
      color: active ? "#0A0A0B" : "var(--text-secondary)",
      border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    }}>{children}</button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function CurrencyInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(value.toLocaleString());
  useEffect(() => { setText(value.toLocaleString()); }, [value]);
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>$</span>
      <input
        type="text" inputMode="numeric" value={text}
        onChange={e => {
          const cleaned = e.target.value.replace(/[^0-9]/g, "");
          setText(cleaned ? Number(cleaned).toLocaleString() : "");
          onChange(Number(cleaned) || 0);
        }}
        style={{ width: "100%", background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px 10px 26px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" }}
      />
    </div>
  );
}

function RangeInput({ min, max, step, value, onChange }: { min: number; max: number; step: number; value: number; onChange: (n: number) => void }) {
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: "#F5A623" }}
    />
  );
}

function FunnelStep({ n, label, big, small, highlight }: { n: number; label: string; big: string; small: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? "rgba(245,166,35,0.08)" : "var(--ink)",
      border: `1px solid ${highlight ? "rgba(245,166,35,0.30)" : "var(--border)"}`,
      borderRadius: 12, padding: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ width: 22, height: 22, background: highlight ? "var(--honey)" : "var(--charcoal)", color: highlight ? "#0A0A0B" : "var(--text-secondary)", fontSize: 11, fontWeight: 700, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: highlight ? "var(--honey)" : "var(--text-primary)", marginBottom: 2 }}>{big}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{small}</div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--honey)", marginBottom: hint ? 4 : 0 }}>{value}</div>
      {hint && <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>
        Hive Mortgage Academy
      </Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
