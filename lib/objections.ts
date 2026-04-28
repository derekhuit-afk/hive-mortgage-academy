/**
 * Curated objection responses, Derek-voiced.
 * Categories: rate, timing, lender-loyalty, qualification, fees, trust, process,
 * realtor, refi, partner-objections.
 *
 * Each objection has a verbatim line, the reframe (what's really being asked),
 * and 2-3 response styles tuned for different temperaments.
 */

export interface Objection {
  id: string;
  category: ObjectionCategory;
  borrowerLine: string;
  whatTheyMean: string;
  responses: { style: string; script: string }[];
  pitfalls?: string;
}

export type ObjectionCategory =
  | "rate" | "timing" | "lender-loyalty" | "qualification" | "fees"
  | "trust" | "process" | "realtor" | "refi" | "partner";

export const CATEGORIES: { key: ObjectionCategory; label: string; emoji: string }[] = [
  { key: "rate",            label: "Rate & Pricing",      emoji: "💲" },
  { key: "timing",          label: "Timing & Urgency",    emoji: "⏱" },
  { key: "lender-loyalty",  label: "Already Have a Lender", emoji: "🤝" },
  { key: "qualification",   label: "Qualification Doubts", emoji: "📊" },
  { key: "fees",            label: "Fees & Closing Costs", emoji: "🧾" },
  { key: "trust",           label: "Trust & Skepticism",  emoji: "🛡️" },
  { key: "process",         label: "Process & Anxiety",   emoji: "📋" },
  { key: "realtor",         label: "Realtor Objections",  emoji: "🏠" },
  { key: "refi",            label: "Refi Resistance",     emoji: "🔁" },
  { key: "partner",         label: "Partner Recruiting",  emoji: "🎯" },
];

export const OBJECTIONS: Objection[] = [
  // ---------- RATE ----------
  {
    id: "rate-higher",
    category: "rate",
    borrowerLine: "Your rate is higher than the other lender quoted me.",
    whatTheyMean: "They're shopping on the wrong axis — rate alone is meaningless without fees, lock terms, points, and pull-through reliability. Your job is to reframe to total cost.",
    responses: [
      { style: "Direct", script: "Send me the Loan Estimate they gave you. I'll line it up next to mine — rate, points, fees, the whole thing. Almost every time, the lower rate is paid for with points or fees most borrowers don't notice. If they really are cheaper at apples-to-apples, I'll tell you." },
      { style: "Educational", script: "Rate without fees is a number, not a price. Two LOs can quote the same rate and one is $4,000 more expensive at the closing table. The number that matters is the total cost over the time you'll own the loan. Let me run that comparison." },
      { style: "Confidence", script: "I'd rather be slightly higher and close on time than 0.125% lower and lose your closing date. The other lender's rate is real until the day before closing — when it's not. Ask them about their pull-through rate and lock extension policy." },
    ],
    pitfalls: "Don't immediately offer to match. That signals your original quote was inflated and the borrower will distrust everything you say after.",
  },
  {
    id: "rate-shopped",
    category: "rate",
    borrowerLine: "I'm just shopping rates today.",
    whatTheyMean: "Often a deflection — they're not ready to apply, they want a number to compare, and they'll give it to a competitor. The win is to convert this into a real conversation.",
    responses: [
      { style: "Honest", script: "I get it — most LOs would just throw a rate at you. The problem is, rates depend on credit, downpayment, property type, loan amount, and program. Without those, anything I quote is fake. 90 seconds — your rough credit and down payment range — and I'll give you a real one." },
      { style: "Reframe", script: "Rates are publicly available — Mortgage News Daily publishes the survey numbers daily. What's not public is who's actually going to close your loan on time, communicate with you weekly, and not ghost you when there's a problem. That's worth more than 0.125% in rate over 5 years." },
    ],
  },
  {
    id: "rate-rising",
    category: "rate",
    borrowerLine: "I'll wait for rates to come down before I buy.",
    whatTheyMean: "Rate-timing is almost always a losing game and they don't realize it. The right answer addresses purchase price as the more meaningful variable, not rate.",
    responses: [
      { style: "Math-based", script: "If rates drop 0.5% but home prices go up 3% in your market, you're not winning — you're losing. The Fed has signaled where rates are likely heading; we can run a scenario based on a few outcomes. Worst case if rates drop later, you refinance — and I'll be the one calling you the day they do." },
      { style: "Direct", script: "Marry the home, date the rate. The home you want today is the one you'll live in. Rates are the cost of the loan today; you can change that later. You can't refinance the price you paid." },
    ],
  },

  // ---------- TIMING ----------
  {
    id: "timing-not-ready",
    category: "timing",
    borrowerLine: "We're not ready to buy for another 6-9 months.",
    whatTheyMean: "Perfect lead — they're far enough out to actually prepare, and the LO who builds the relationship now wins the loan when they're ready.",
    responses: [
      { style: "Long-game", script: "That's actually the best time to talk to me — most borrowers come 6 weeks out, and we end up rushing. Right now we can run your numbers, build your credit if needed, talk through what kind of payment feels comfortable, and I can keep an eye on your market. Sound useful?" },
      { style: "Practical", script: "Six months out, here's what we can do this week: pull credit (with a 90-day rapid rescore window), get your DTI clean, identify your real comfortable payment, and figure out which neighborhoods fit. By month 5 you're ready to make an offer with confidence — not panic." },
    ],
  },
  {
    id: "timing-spring",
    category: "timing",
    borrowerLine: "I'll start looking in the spring when more homes are on the market.",
    whatTheyMean: "Probably true — but they're going to compete with everyone else doing the same thing. Spring shopping is the worst time to negotiate price.",
    responses: [
      { style: "Counter-narrative", script: "Spring brings more inventory, but it brings 3× the buyers. Your offer competes with 8 others instead of 2. The math: in winter you might pay 100% of asking and get accepted; in spring you might pay 105% of asking and lose 4 offers. Look year-round — you'll have less competition and more leverage." },
    ],
  },
  {
    id: "timing-rate-watch",
    category: "timing",
    borrowerLine: "I'm waiting for rates to drop to X%.",
    whatTheyMean: "Rate-anchoring. They've decided on a number that may not happen anytime soon, and meanwhile they're missing market opportunity.",
    responses: [
      { style: "Data-based", script: "Let's look at history: rates haven't been at X% since [year]. Markets don't owe you a number. What we can do is look at what payment is comfortable for you regardless of rate, find homes that fit, and act when the math works — not wait for a number that may not come." },
    ],
  },

  // ---------- LENDER LOYALTY ----------
  {
    id: "loyalty-existing",
    category: "lender-loyalty",
    borrowerLine: "I already work with my bank for everything.",
    whatTheyMean: "They equate \"convenience\" with \"best deal.\" Your job is to acknowledge the relationship without disrespecting it, while planting a comparison seed.",
    responses: [
      { style: "Respectful", script: "That's smart — relationship banking matters. Most people I talk to who use their bank end up paying $3,000-7,000 more in fees because the bank doesn't compete the same way mortgage shops do. I'm not asking you to switch — get a Loan Estimate from them, and let me run my numbers on the same scenario. If they're better, stay with them. If they're not, you saved money. No commitment either way." },
    ],
  },
  {
    id: "loyalty-realtor-pref",
    category: "lender-loyalty",
    borrowerLine: "My Realtor recommended someone.",
    whatTheyMean: "Often a soft endorsement — the Realtor named someone, but it's not always who they actually trust most. Don't badmouth, don't argue, ask the right question.",
    responses: [
      { style: "Curious", script: "That's great — your Realtor wouldn't recommend someone they don't trust. Quick question: are they recommending one lender or do they have you talk to a couple? Most experienced agents tell their buyers to compare 2-3 to make sure they're getting a real picture. I'm happy to be the second opinion." },
    ],
  },
  {
    id: "loyalty-friend",
    category: "lender-loyalty",
    borrowerLine: "My buddy is in the mortgage business — I'd feel weird not using him.",
    whatTheyMean: "Loyalty is real, but their friend may not be the right fit (new LO, different specialty, slow company). Don't argue against the friendship — argue for due diligence.",
    responses: [
      { style: "Reframe", script: "Loyalty is good. Here's the thing — even if you go with him, you owe yourself one comparison so you know you're not leaving $5,000 on the table on the biggest purchase of your life. Get my Loan Estimate next to his. If they match, easy decision. If they don't, you have a real conversation to have with him." },
    ],
  },

  // ---------- QUALIFICATION DOUBTS ----------
  {
    id: "qual-credit",
    category: "qualification",
    borrowerLine: "My credit isn't good enough.",
    whatTheyMean: "They're often wrong — borrowers self-assess credit poorly. Even if they're right, there's almost always a path. Don't agree, don't argue, find out the real number.",
    responses: [
      { style: "Investigative", script: "Most people who say that end up qualifying. What's the lowest score you've seen on a credit pull recently? FHA goes to 580 with 3.5% down, sometimes 500 with 10%. VA has no minimum — it's lender overlay. Let me pull credit (one inquiry, 1-2 points), and we'll know exactly where you stand. If we need a 90-day path to fix, I'll tell you and we'll build it." },
    ],
    pitfalls: "Don't promise a score outcome from a credit-improvement plan. That's both inaccurate and a fair lending issue.",
  },
  {
    id: "qual-self-employed",
    category: "qualification",
    borrowerLine: "I'm self-employed and write everything off — I don't show much income.",
    whatTheyMean: "Real, common, and many LOs handle it badly. Bank statement, P&L, and asset-based programs exist. Show competence on the program before talking products.",
    responses: [
      { style: "Specialist", script: "This is actually my world. We have three paths for self-employed: traditional 2-year tax returns where we average net plus add-backs, bank statement programs where we use 12-24 months of deposits, and P&L programs where we use a CPA-prepared statement. Send me your last 2 years of returns and we'll see which gets you the best terms." },
    ],
  },
  {
    id: "qual-debt",
    category: "qualification",
    borrowerLine: "I have too much debt.",
    whatTheyMean: "Often DTI concern — sometimes valid, often fixable with paydown strategy or product choice. Get the actual numbers.",
    responses: [
      { style: "Specific", script: "DTI is the gate, but there's room to maneuver. Tell me: monthly income, and the minimum payments on every revolving card and every loan. I can tell you in 5 minutes if your DTI is the problem or your assumption about it is the problem. If it's real, we'll talk about which debts to pay down first to move the needle." },
    ],
  },
  {
    id: "qual-down-payment",
    category: "qualification",
    borrowerLine: "I don't have 20% down.",
    whatTheyMean: "Massive misconception. The average first-time buyer puts 6-7% down. They likely qualify for 3-3.5% conventional or FHA, USDA at 0%, VA at 0%.",
    responses: [
      { style: "Educational", script: "20% down is a myth most people still believe. Conventional starts at 3% down. FHA at 3.5%. VA and USDA at 0% if you qualify. PMI exists, yes — but it cancels at 78% LTV automatically on conventional, or you refi off it. Tell me your savings, credit range, and target purchase price; I'll show you the real math." },
    ],
  },

  // ---------- FEES ----------
  {
    id: "fees-too-high",
    category: "fees",
    borrowerLine: "Your closing costs are higher than the other quote.",
    whatTheyMean: "Could be a real difference, could be the other lender hiding costs in rate. Trust requires showing the math.",
    responses: [
      { style: "Transparent", script: "Send me both LEs side by side. I'll show you which line items are different and why. Here's what to watch for: their rate may include points (you're paying upfront for a lower rate), or they may not have included items I have to disclose. Apples-to-apples comparison only takes 10 minutes and we'll know exactly where the difference is." },
    ],
  },
  {
    id: "fees-no-closing",
    category: "fees",
    borrowerLine: "The other lender said no closing costs.",
    whatTheyMean: "Almost certainly rolled into rate (\"lender credit\" trade) or rolled into the loan balance. Show them where the cost actually went.",
    responses: [
      { style: "Educational", script: "There's no such thing as no closing costs — only who's paying them. They likely raised your rate to give you a credit that covers them. Over a 5-year ownership, that costs you more than just paying them upfront. Let me model both scenarios for your numbers." },
    ],
  },

  // ---------- TRUST ----------
  {
    id: "trust-new-lo",
    category: "trust",
    borrowerLine: "How long have you been doing this?",
    whatTheyMean: "Reasonable due diligence. Don't apologize for being new — flip it to your advantage, then point to the systems and team behind you.",
    responses: [
      { style: "Honest", script: "I'm newer to originating, but I'm working with a team that's done over $1B in production. I have more time per file than an LO doing 20 a month — I'll text you back on a Sunday. The systems, processing, underwriting, all of it is the same as the senior LOs at my company use. You're not getting a junior experience because of who's behind me." },
    ],
  },
  {
    id: "trust-online",
    category: "trust",
    borrowerLine: "I'd rather just do this all online with [Rocket/Better/etc].",
    whatTheyMean: "They want speed and lower friction. The pitch is human availability + actual problem-solving when something goes wrong (and it will).",
    responses: [
      { style: "Trade-off", script: "Online lenders are great when nothing goes wrong. The problem is, with 30-40% of loans, something does — appraisal comes in low, underwriter wants a letter, deposit looks weird. With those companies, you're talking to a different person every call. I'm one human, NMLS #203980, my cell phone, and I'll fix the problem before it costs you the deal." },
    ],
  },

  // ---------- PROCESS ----------
  {
    id: "process-overwhelmed",
    category: "process",
    borrowerLine: "This is overwhelming — there's so much paperwork.",
    whatTheyMean: "Anxiety. Reduce by simplification, by setting expectations, and by handling the next single step.",
    responses: [
      { style: "Calming", script: "It feels overwhelming until you see it broken down. Here's what we actually need from you upfront: 2 pay stubs, 2 months of bank statements, last 2 years of W-2s, and a copy of your driver's license. That's it for application. Other documents come later, when we know what they are. We're not doing all of this today." },
    ],
  },
  {
    id: "process-time",
    category: "process",
    borrowerLine: "How long does this take?",
    whatTheyMean: "Setting expectations matters. Underestimate and you lose trust when it's late; overestimate and they go elsewhere.",
    responses: [
      { style: "Direct", script: "Purchase: 25-30 days from contract to close, assuming nothing weird happens. Refi: 30-35 days. The variables that slow it down are usually borrower documents (we're waiting on you) or appraisal scheduling. I'll tell you in real time when we're ahead or behind, and what's on us versus on you." },
    ],
  },

  // ---------- REALTOR ----------
  {
    id: "realtor-have-lender",
    category: "realtor",
    borrowerLine: "I already have a lender I work with.",
    whatTheyMean: "They're declining to switch but may be open to backup. Do not push for the primary spot.",
    responses: [
      { style: "Backup-only", script: "That's great — every good Realtor should have 2-3 lenders. I'm not asking you to switch — I'm asking to be your backup for the deals your primary can't close. I do a lot of VA, USDA, self-employed, and tough credit scenarios that other LOs struggle with. Test me on one and see how I run." },
    ],
  },
  {
    id: "realtor-rate",
    category: "realtor",
    borrowerLine: "Your rates aren't competitive.",
    whatTheyMean: "They've heard from a buyer or another LO that rates are higher. Want to see the actual comparison.",
    responses: [
      { style: "Comparison", script: "Send me the competing Loan Estimate. Most of the time, the lower rate has higher points or fees baked in, and the total cost over the borrower's expected ownership is identical or worse. I'll line them up and we'll see for sure. If we're really off, I want to know why too." },
    ],
  },

  // ---------- REFI ----------
  {
    id: "refi-not-now",
    category: "refi",
    borrowerLine: "I'll think about refinancing later.",
    whatTheyMean: "Procrastination, not real objection. The window often closes — rates move, equity changes, life events. Pin a follow-up.",
    responses: [
      { style: "Concrete", script: "Sure — but rates won't wait for you to be ready. Let me text you my numbers (rate, payment savings, break-even) and a date 30 days out where I follow up. If rates have moved against you, the math may be different by then. Better to have a number to look at than guess." },
    ],
  },
  {
    id: "refi-just-bought",
    category: "refi",
    borrowerLine: "I just bought 2 years ago — I'm not refinancing.",
    whatTheyMean: "They feel locked in psychologically. The math may say otherwise — rate drops, equity gains, PMI removal opportunities don't care when they bought.",
    responses: [
      { style: "Specific", script: "How long you've owned doesn't matter — the math does. Here's what does: if your current rate is more than 0.5% above today's market, OR your equity has grown enough to drop PMI, OR your situation has changed, we should look. Five-minute conversation, you'll know if it makes sense." },
    ],
  },

  // ---------- PARTNER (recruiting referral partners) ----------
  {
    id: "partner-too-busy",
    category: "partner",
    borrowerLine: "I'm too busy to take a meeting.",
    whatTheyMean: "Common Realtor brush-off. Don't push for the meeting — provide value asynchronously and let them come back to you.",
    responses: [
      { style: "Async", script: "Totally fair. Skip the meeting. I'll send you my one-page market data sheet for your zip code monthly — current rates by program, average DTI tolerances by lender, and where the actual buyer activity is. If it's useful, you'll know where to find me." },
    ],
  },
  {
    id: "partner-no-need",
    category: "partner",
    borrowerLine: "I have plenty of LOs already.",
    whatTheyMean: "Standard pushback. Don't argue with their roster — earn one specific niche.",
    responses: [
      { style: "Niche", script: "I'd bet your current LOs are great on conventional vanilla deals. I want to be the LO you call when something's off — VA, self-employed, tough credit, properties that need creative thinking. Try me on one of those scenarios. If your other LOs handle them already, no harm done." },
    ],
  },
  {
    id: "partner-burned",
    category: "partner",
    borrowerLine: "I had a bad experience with a lender once.",
    whatTheyMean: "They're holding old trauma. Acknowledge it, don't dismiss, then earn it back through specifics.",
    responses: [
      { style: "Empathy + specifics", script: "I've heard that more times than I can count, and most of those stories sound similar — communication broke down, conditions kept appearing, the closing date slipped. Here's how I run a file: I update you every Tuesday and Friday on every loan. Conditions get cleared in 24 hours or you hear why. If you ever feel the file is silent, you call me directly. That's not a promise — it's a system." },
    ],
  },
];

/** Search across all objections by free text */
export function searchObjections(query: string): Objection[] {
  if (!query.trim()) return OBJECTIONS;
  const q = query.toLowerCase();
  return OBJECTIONS.filter(o =>
    o.borrowerLine.toLowerCase().includes(q) ||
    o.whatTheyMean.toLowerCase().includes(q) ||
    o.responses.some(r => r.script.toLowerCase().includes(q)) ||
    o.category.includes(q)
  );
}

export function objectionsByCategory(cat: ObjectionCategory): Objection[] {
  return OBJECTIONS.filter(o => o.category === cat);
}
