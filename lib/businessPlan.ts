/**
 * Business Plan math engine.
 * Reverses an income goal into the daily activity required to hit it.
 * Pure functions — no React, no IO. Used by both the Plan Builder and the Income Projector.
 */

export interface PlanInputs {
  /** Target take-home commission in USD over the planning period */
  incomeGoal: number;
  /** Average loan amount in USD */
  avgLoan: number;
  /** Compensation in basis points (100 bps = 1.00%) */
  comp_bps: number;
  /** Pull-through: applications that close (0.40-0.85 typical) */
  pullThrough: number;
  /** Lead-to-application conversion (0.05-0.40 typical) */
  leadToApp: number;
  /** Quality conversations needed per lead (1.5-4 typical) */
  conversationsPerLead: number;
  /** Working days per month */
  workDaysPerMonth: number;
}

export interface PlanOutputs {
  fundedVolumeRequired: number;
  loansPerYear: number;
  loansPerMonth: number;
  loansPerWeek: number;
  appsPerMonth: number;
  appsPerWeek: number;
  leadsPerMonth: number;
  leadsPerWeek: number;
  conversationsPerMonth: number;
  conversationsPerWeek: number;
  conversationsPerDay: number;
  /** Whether the plan numbers look realistic vs. industry benchmarks */
  feasibility: "achievable" | "stretch" | "unrealistic";
  feasibilityNotes: string[];
}

export const DEFAULTS: PlanInputs = {
  incomeGoal: 250_000,
  avgLoan: 400_000,
  comp_bps: 100,
  pullThrough: 0.65,
  leadToApp: 0.20,
  conversationsPerLead: 2.5,
  workDaysPerMonth: 22,
};

export const MIN_GOAL = 25_000;
export const MAX_GOAL = 5_000_000;

/**
 * Run the full reverse-engineering: income goal → daily conversations.
 * All inputs are annual unless otherwise stated.
 */
export function computePlan(inputs: PlanInputs): PlanOutputs {
  const safe = clampInputs(inputs);

  // commissionable volume needed (annual)
  const fundedVolumeRequired = safe.incomeGoal / (safe.comp_bps / 10_000);
  const loansPerYear = fundedVolumeRequired / safe.avgLoan;
  const loansPerMonth = loansPerYear / 12;
  const loansPerWeek = loansPerYear / 52;

  // Walk back through the funnel
  const appsPerMonth = loansPerMonth / safe.pullThrough;
  const appsPerWeek = appsPerMonth * 12 / 52;

  const leadsPerMonth = appsPerMonth / safe.leadToApp;
  const leadsPerWeek = leadsPerMonth * 12 / 52;

  const conversationsPerMonth = leadsPerMonth * safe.conversationsPerLead;
  const conversationsPerWeek = conversationsPerMonth * 12 / 52;
  const conversationsPerDay = conversationsPerMonth / safe.workDaysPerMonth;

  // Feasibility assessment — flag plans whose daily work is past human limits
  const notes: string[] = [];
  let feasibility: PlanOutputs["feasibility"] = "achievable";

  if (conversationsPerDay > 60) {
    feasibility = "unrealistic";
    notes.push(
      `${Math.round(conversationsPerDay)} quality conversations per working day exceeds what a single LO can sustain. ` +
      `Top producers run 25-40/day; over 60/day implies the leads aren't actually quality — it's spray-and-pray.`
    );
  } else if (conversationsPerDay > 40) {
    feasibility = "stretch";
    notes.push(
      `${Math.round(conversationsPerDay)} conversations per working day is at the top end of what's sustainable. ` +
      `Doable for a high-performer with strong systems, painful without.`
    );
  } else if (conversationsPerDay < 5) {
    notes.push(
      `${conversationsPerDay.toFixed(1)} conversations per working day is very light — likely you're either ` +
      `overestimating your conversion rates, undershooting your goal, or both.`
    );
  }

  if (safe.pullThrough > 0.85) {
    notes.push(
      `Pull-through of ${Math.round(safe.pullThrough * 100)}% is above industry top-quartile (75-80%). ` +
      `Verify against your real data before committing to a plan that depends on it.`
    );
  }
  if (safe.leadToApp > 0.40) {
    notes.push(
      `${Math.round(safe.leadToApp * 100)}% lead-to-application conversion is exceptional — only realistic for ` +
      `a referral-heavy book where leads are essentially pre-sold. Mixed-source LOs run 10-25%.`
    );
  }
  if (loansPerYear > 300) {
    feasibility = feasibility === "achievable" ? "stretch" : "unrealistic";
    notes.push(
      `${Math.round(loansPerYear)} loans/year is rare-air territory. Top 1% of LOs nationally. ` +
      `Achievable but requires a mature team and 8-12+ active referral partners.`
    );
  }

  return {
    fundedVolumeRequired,
    loansPerYear,
    loansPerMonth,
    loansPerWeek,
    appsPerMonth,
    appsPerWeek,
    leadsPerMonth,
    leadsPerWeek,
    conversationsPerMonth,
    conversationsPerWeek,
    conversationsPerDay,
    feasibility,
    feasibilityNotes: notes,
  };
}

/**
 * Income projection — what does my income look like if I close N more loans/month
 * over the next 12 months?
 */
export interface ProjectionScenario {
  label: string;
  loansPerMonthDelta: number;
  /** projected annual commission */
  projectedAnnualCommission: number;
  projectedFundedVolume: number;
}

export function projectScenarios(
  baseLoansPerMonth: number,
  inputs: PlanInputs
): ProjectionScenario[] {
  const safe = clampInputs(inputs);
  const compRate = safe.comp_bps / 10_000;
  const make = (label: string, delta: number): ProjectionScenario => {
    const monthly = Math.max(0, baseLoansPerMonth + delta);
    const fundedVolume = monthly * 12 * safe.avgLoan;
    return {
      label,
      loansPerMonthDelta: delta,
      projectedAnnualCommission: fundedVolume * compRate,
      projectedFundedVolume: fundedVolume,
    };
  };

  return [
    make("Current pace", 0),
    make("+1 loan/month", 1),
    make("+2 loans/month", 2),
    make("+3 loans/month", 3),
    make("+5 loans/month", 5),
  ];
}

/** Day-by-day activity targets derived from a plan output. */
export interface DailyTargets {
  conversationsPerDay: number;
  callsPerDay: number;        // ~1.6× conversations (counting voicemails)
  followUpsPerDay: number;    // text/email touches
  partnerTouchesPerWeek: number;
  contentPostsPerWeek: number;
}

export function deriveDailyTargets(out: PlanOutputs): DailyTargets {
  const c = out.conversationsPerDay;
  return {
    conversationsPerDay: round1(c),
    callsPerDay: round1(c * 1.6),
    followUpsPerDay: round1(c * 0.8),
    partnerTouchesPerWeek: Math.max(5, Math.round(out.leadsPerWeek * 0.3)),
    contentPostsPerWeek: 3,
  };
}

function clampInputs(i: PlanInputs): PlanInputs {
  return {
    incomeGoal: clamp(i.incomeGoal, MIN_GOAL, MAX_GOAL),
    avgLoan: clamp(i.avgLoan, 50_000, 5_000_000),
    comp_bps: clamp(i.comp_bps, 25, 300),
    pullThrough: clamp(i.pullThrough, 0.20, 0.95),
    leadToApp: clamp(i.leadToApp, 0.02, 0.80),
    conversationsPerLead: clamp(i.conversationsPerLead, 1, 8),
    workDaysPerMonth: clamp(i.workDaysPerMonth, 15, 26),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function fmtMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function fmtMoneyExact(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

export function fmtNumber(n: number): string {
  if (n >= 1_000) return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (n >= 10) return n.toFixed(0);
  return n.toFixed(1);
}

export function fmtPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
