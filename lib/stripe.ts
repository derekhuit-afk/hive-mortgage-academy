import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder", {
  apiVersion: "2026-03-25.dahlia" as const,
});

export const PLANS: Record<string, { label: string; monthly: number; annual: number; modules: string }> = {
  foundation:  { label: "Foundation",  monthly: 9700,  annual: 81480,  modules: "Modules 1–6" },
  accelerator: { label: "Accelerator", monthly: 29700, annual: 249480, modules: "Modules 1–10" },
  elite:       { label: "Elite",       monthly: 69700, annual: 585480, modules: "All 12 Modules" },
};
// Amounts in cents. Annual = monthly * 0.7 * 12
