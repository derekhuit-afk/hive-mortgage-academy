/**
 * Scripts library — categorized mortgage origination scripts.
 * Used by the /scripts page (library browse + role-play practice).
 * Voice from Derek's playbook: direct, no-BS, real numbers, scenario-based.
 */

export type ScriptCategory =
  | "first_call"
  | "pre_approval"
  | "objection"
  | "realtor"
  | "refi"
  | "follow_up"
  | "post_close";

export interface Script {
  id: string;
  category: ScriptCategory;
  title: string;
  scenario: string;        // When/why to use
  script: string;          // The actual lines (multi-line)
  notes?: string;          // Coaching context
  /** Suggested role for the AI to play during role-play */
  rolePlayPersona?: string;
}

export const CATEGORY_LABELS: Record<ScriptCategory, { label: string; color: string; description: string }> = {
  first_call: {
    label: "First Call",
    color: "#10B981",
    description: "First conversation with a new borrower lead — set the relationship and gather what you need.",
  },
  pre_approval: {
    label: "Pre-Approval",
    color: "#3B82F6",
    description: "Moving from interest into application, qualifying the borrower, setting expectations.",
  },
  objection: {
    label: "Objections",
    color: "#EF4444",
    description: "Borrower or partner pushback. The library covers most; for novel ones see the Objection Handler.",
  },
  realtor: {
    label: "Realtor & Partners",
    color: "#8B5CF6",
    description: "Building, maintaining, and recovering Realtor and partner relationships.",
  },
  refi: {
    label: "Refinance Outreach",
    color: "#F5A623",
    description: "Past-client refinance reach-outs when rates move or equity changes.",
  },
  follow_up: {
    label: "Follow-Up",
    color: "#06B6D4",
    description: "Cold leads, in-process status updates, and check-ins that move loans forward.",
  },
  post_close: {
    label: "Post-Close",
    color: "#EC4899",
    description: "30-60-90 cadence, review asks, and referral asks after closing.",
  },
};

export const SCRIPTS: Script[] = [
  // ── First Call ────────────────────────────────────────────────────
  {
    id: "fc-warm-referral",
    category: "first_call",
    title: "Warm referral first call",
    scenario: "A Realtor or past client referred this borrower. They expect to hear from you within minutes.",
    rolePlayPersona: "First-time homebuyer, recently referred by their Realtor. Slightly nervous, has questions about the process but doesn't know what to ask.",
    script: `Hi [Name], this is [Your Name] with [Company]. [Referrer] gave me your contact info — said you're starting to look at homes and want to get pre-approved.

I appreciate them connecting us. Got a few minutes? I'll walk you through how I work, ask you a few questions to figure out what makes sense for your situation, and we can decide from there if it's a fit.

Quick question to start — are you actively looking right now, or earlier in the planning phase?`,
    notes: "Match their energy. If they're casual, stay casual. If they're nervous, slow down. Always reference the referrer by name in the first sentence — it's the trust transfer.",
  },
  {
    id: "fc-cold-inbound",
    category: "first_call",
    title: "Cold inbound from a website or ad",
    scenario: "Borrower filled out a form online, hasn't talked to anyone yet. Trust is at zero.",
    rolePlayPersona: "Skeptical inquirer. Filled out a form to see rates, expects to be sold to. Will hang up if you sound like every other LO.",
    script: `Hi [Name], this is [Your Name] — I saw you submitted an inquiry through [source]. I'm not going to give you a sales pitch.

Here's how I work: I ask a few questions to understand your situation, I tell you honestly whether I think we can help, and if so, I run real numbers — not a teaser rate that doesn't apply to you.

What's prompting you to look right now? Buying, refinancing, or just running the math?`,
    notes: "Lead by killing the sales pitch concern they're already braced for. The 'real numbers, not a teaser' line builds trust because it acknowledges what they expect from a generic LO call.",
  },
  {
    id: "fc-self-employed",
    category: "first_call",
    title: "Self-employed borrower first call",
    scenario: "Borrower mentions they're 1099, business owner, or self-employed. Their last LO turned them down or made it painful.",
    rolePlayPersona: "Self-employed for 3 years, runs a small services business, was previously declined elsewhere. Frustrated, expects to be turned down again.",
    script: `Hey [Name], thanks for reaching out. Before we go further — quick question: are you self-employed, 1099, or running your own business?

[After confirmation]

Good — that's actually one of my specialties. Most LOs make self-employed borrowers feel like the loan is harder than it has to be. It's not impossible, it just requires someone who knows how to read your tax returns properly.

I'll need to look at your last two years of business and personal returns and your YTD P&L. From there I can tell you within 24 hours if we have a real path forward. No fishing expedition.`,
    notes: "Self-employed borrowers have usually been burned. Lead with confidence and specifics. Reference exactly the docs you'll need so they know you've done this before.",
  },

  // ── Pre-Approval ──────────────────────────────────────────────────
  {
    id: "pa-application-bridge",
    category: "pre_approval",
    title: "Bridging from interest to application",
    scenario: "Initial conversation went well. Now you need them to actually start the application.",
    rolePlayPersona: "Engaged borrower who liked the first call. Now hesitating — 'do I really need to fill out a long application now?'",
    script: `Based on what you've shared, here's what I think makes sense as a next step.

The application takes about 15 minutes online. It's not a commitment to lend — it's just so I can pull your credit, run real numbers, and give you a pre-approval letter that's actually based on documented qualifications.

Without the application, anything I tell you is a guess. With it, it's real and you can use it.

Want me to text you the secure link, or would you rather schedule a 30-minute call where we do it together?`,
    notes: "Two paths reduce friction. Some borrowers want to do it alone; some want their hand held. Both close — the question is just which channel.",
  },
  {
    id: "pa-credit-explanation",
    category: "pre_approval",
    title: "Explaining a borrower's credit report",
    scenario: "Credit pulled. Score is lower than they expected. They're embarrassed or confused.",
    rolePlayPersona: "Borrower with a 650 FICO who thought they had 720. Defensive, embarrassed, waiting for the LO to make them feel small.",
    script: `Let me walk you through what I'm looking at. Your middle score is [score], which is what we use for qualifying.

A few things stand out — and these are normal, by the way. Most people don't actually know exactly what's on their report.

[Walk through 2-3 specific items]

The good news: [program] starts at 580. So we have options now, and we have a clear path to a better rate later if we want to get this number higher first. Would you rather move forward with what we have today, or take 60-90 days to bump the score before we lock?`,
    notes: "Their internal monologue is shame. Yours has to be matter-of-fact. Skip 'don't worry' (it sounds like there's something to worry about). Just walk through the numbers.",
  },
  {
    id: "pa-payment-first",
    category: "pre_approval",
    title: "Setting payment-first expectations",
    scenario: "Borrower asks 'how much can I qualify for?' — the wrong starting question.",
    rolePlayPersona: "First-time buyer who heard from a friend they could qualify for $500K. Wants to know their max, not their comfortable.",
    script: `Most LOs answer that with a maximum number, and most buyers go house-shop based on it. I'd push back on that.

The right starting question isn't 'how much can I qualify for' — it's 'what monthly payment feels comfortable to you?'

Because at the max, you're house-poor. Every variable rate move hurts. Every car repair feels like a crisis. And you stop having any margin.

Tell me what monthly payment feels easy — not stretchy, not tight. From there I'll back into the right purchase price for you. Sound fair?`,
    notes: "This is the conversation that builds clients for life. They've never heard an LO talk this way. It distinguishes you in 30 seconds.",
  },

  // ── Objections ────────────────────────────────────────────────────
  {
    id: "obj-rate-shopping",
    category: "objection",
    title: "'Your rate is higher than [Competitor]'",
    scenario: "Borrower or Realtor brings a competitor's quote that beats yours.",
    rolePlayPersona: "Borrower comparing two lenders. Has a written quote 0.25% lower from a national lender. Considering switching.",
    script: `Fair point — and I'd want to make sure you're comparing apples to apples. Could you send me that Loan Estimate so I can look at it?

Two reasons: rate alone doesn't tell you much. The full cost is rate + points + lender fees + escrow setup. I've seen quotes where the rate looks 0.25% lower but the borrower is paying $5,000 more in points to buy that rate. Or where the LE is missing line items that magically show up at closing.

Send me the LE. If they actually have a better total deal, I'll tell you straight. If not, you'll know exactly why.`,
    notes: "Never trash the competitor. Just ask for their LE. If their quote is real, you're losing the deal anyway — no sense in pretending. If it's not real (which is more common), the LE will show it.",
  },
  {
    id: "obj-rates-will-drop",
    category: "objection",
    title: "'I'm waiting for rates to drop'",
    scenario: "Borrower delaying because they think rates will drop in 6-12 months.",
    rolePlayPersona: "Borrower who's been quoted higher rates than they expected. Wants to wait. Reading market predictions online.",
    script: `That's a real consideration. Two things to think about:

One: if rates drop, home prices typically rise because more buyers come back to the market. The math has to consider both sides — the rate AND the price.

Two: 'date the rate, marry the home.' If you find the right house at a fair price now, you can refinance when rates drop. You can't refinance into a different house at a lower price six months later if you waited and prices went up.

I'm not telling you to rush. I'm telling you the wait-for-rates strategy isn't free — it has costs. Want me to show you the math both ways?`,
    notes: "Don't argue. Just present the trade-off they haven't thought about. Then offer to model both scenarios. Most borrowers haven't seen the comparison and it changes the conversation.",
  },
  {
    id: "obj-realtor-existing-lender",
    category: "objection",
    title: "Realtor: 'I already have a lender I work with'",
    scenario: "Cold approach to a Realtor who has an existing primary LO relationship.",
    rolePlayPersona: "Producing Realtor with 2 LOs already. Polite but disinterested. Defaults to 'I'm good, thanks.'",
    script: `That's exactly what I'd hope every Realtor would say — every good one has a primary lender. I'm not asking you to switch.

What I'm asking: would you be willing to use me as a backup for the deals your current lender can't do? Self-employed, lower credit, VA, USDA — the ones that take more work and your primary doesn't want.

If you say yes, here's what happens: next time one of those comes up, you call me. I close it cleanly. Your buyer is happy. You owe me nothing. If I earn it, I become your second go-to for everything. If I don't, no harm done.`,
    notes: "Two-step play: lower the bar (just be backup) and define what 'earning it' looks like. Realtors keep meeting LOs who immediately ask for primary slot. You're the one who didn't.",
  },
  {
    id: "obj-want-to-think-about-it",
    category: "objection",
    title: "'I want to think about it'",
    scenario: "Late-stage delay. Borrower seemed engaged but is stalling.",
    rolePlayPersona: "Borrower who took your call, asked good questions, but won't commit. Hiding the real concern.",
    script: `That's fair — and I'd rather you think about it than commit before you're ready.

Quick question so I can be helpful as you think: is it the numbers, the timing, or something else I haven't addressed?

Because if it's the numbers, I might have options I haven't shown you. If it's timing, that might just be the answer. If it's something else, I'd rather know now than guess.`,
    notes: "Most 'thinking about it' is hiding a specific concern. Force the gentle question. The answer reveals what to address — or that you should respect the no.",
  },

  // ── Realtor & Partners ────────────────────────────────────────────
  {
    id: "rl-coffee-ask",
    category: "realtor",
    title: "First coffee ask with a Realtor",
    scenario: "Cold email/text/DM to a Realtor you've identified as a target.",
    rolePlayPersona: "Mid-tier Realtor (8-15 deals/year). Gets pitched by 3-5 LOs a month. Politely deletes most messages.",
    script: `Hi [Name], I'm a mortgage LO working in [area]. I've been watching your listings — particularly [specific listing or neighborhood] — and I think we'd work well together.

I'm not going to pitch you over text. What I'd like is 20 minutes of your time, my treat for coffee. I'll bring a market data report on your specific neighborhood that you can use with your buyers and sellers, and you can tell me what would actually be useful for me to know about how you operate.

Worst case: free coffee and a useful report. Best case: a real partnership. When works for you?`,
    notes: "Specific listing reference proves you've done homework. The 'free report regardless' eliminates the 'what's in it for them' calculation. Small ask, asymmetric value.",
  },
  {
    id: "rl-status-update",
    category: "realtor",
    title: "Mid-loan status update to Realtor",
    scenario: "Active deal in progress. Realtor wants to know where things stand.",
    rolePlayPersona: "The buyer's Realtor on a deal you're working. Has been getting silence for 4 days. Starting to worry about timeline.",
    script: `[Realtor name], quick update on the [Borrower] file:

Where we are: [specific status — appraisal received, or in underwriting, or conditions out]
What's outstanding: [specific items remaining]
Expected CTC: [date]
Expected close: [date]

No action needed from you. I'll text again Friday with the next status.`,
    notes: "Format matters as much as content. Realtors live in their phones. Bullet structure reads in 8 seconds. Daily/weekly status habit is what builds the relationship over time.",
  },
  {
    id: "rl-deal-recovery",
    category: "realtor",
    title: "Recovering after a deal goes bad",
    scenario: "A loan you were on died — appraisal kill, financing issue, or you missed something.",
    rolePlayPersona: "The Realtor whose buyer's deal just died. Disappointed, has the seller's agent angry at them, partly blames you.",
    script: `[Name], I owe you a call — not a text, a call. When can I get you for 5 minutes?

[On call]

Here's what happened from my side, honestly: [specific facts, no spin].

What I should have done differently: [specific accountability].

What we can do now: [either restart with a different program, refer to a different lender if the buyer can't qualify, or honest 'this one isn't going to work and here's why'].

I know this hurts your relationship with the seller's agent. I'll write you a note you can forward that takes the heat off you and puts it on me.`,
    notes: "Show up with accountability AND a solution. Most LOs disappear after a kill. The one who calls and writes the recovery note is the one the Realtor remembers — and refers next time.",
  },

  // ── Refinance Outreach ────────────────────────────────────────────
  {
    id: "rf-rate-drop",
    category: "refi",
    title: "Past client when rates drop",
    scenario: "Rates dropped 0.5%+ below their current note rate. You want to be first to call.",
    rolePlayPersona: "Past client who closed 18 months ago at 7.0%. Hasn't thought about refinancing. Will get 3 cold calls today if you don't beat them.",
    script: `Hey [Name], it's [Your Name] from [Company] — closed your loan in [month/year]. Quick reason for the call.

Rates have come down. Based on your loan, I think you could save around $[X]/month with a break-even of about [Y] months. I wanted to be the one to flag it before you got cold-called by someone you don't know.

If you're going to be in the home for more than [Y] months, the math probably makes sense. Do you have 10 minutes this week to look at the actual numbers?`,
    notes: "Speed matters more than perfection. Specific numbers (theirs, not generic) prove you ran their file. The 'before someone cold-calls you' line is honest and lands.",
  },
  {
    id: "rf-pmi-removal",
    category: "refi",
    title: "PMI removal opportunity",
    scenario: "Past client's LTV has dropped below 80% based on appreciation. They're paying PMI they don't need to.",
    rolePlayPersona: "Past client with conventional loan, 2 years post-close. Home appreciated 15%. Doesn't realize they could drop PMI.",
    script: `[Name], it's [Your Name] — closed your loan in [month/year]. Doing a quick equity check across past clients and wanted to call you specifically.

Based on what's happened in your neighborhood, I think your loan-to-value has dropped below 80%. That means you may be paying PMI you don't need to be paying. Depending on your situation, there are 2-3 paths — a formal PMI removal request, an appraisal-based removal, or a refinance if rates also help you.

Want me to run the numbers? Most of my past clients in your situation are saving $150-300/month they didn't know was sitting there.`,
    notes: "PMI removal is the highest-trust call. You're literally calling to tell them they're paying for something they don't need. Even if the refi doesn't pan out, you cement the relationship.",
  },

  // ── Follow-Up ─────────────────────────────────────────────────────
  {
    id: "fu-cold-lead-30",
    category: "follow_up",
    title: "30-day check-in on cold lead",
    scenario: "Lead from 30 days ago who didn't move forward. Worth a check-in, not a sales push.",
    rolePlayPersona: "Borrower who talked to you a month ago, didn't apply. Either bought from another LO or stalled.",
    script: `Hey [Name], it's [Your Name]. We talked about a month ago. I'm not chasing — just checking in.

Did you end up moving forward, or are you still in the same spot?

If you're still on the fence, no pressure. I just like to know what happened so I can be useful or get out of your way.`,
    notes: "Direct, brief, no pitch. About a third of these reveal a real opportunity (still considering, didn't qualify elsewhere, deal fell apart). The rest are gracefully closed with no hard feelings.",
  },
  {
    id: "fu-document-nudge",
    category: "follow_up",
    title: "Borrower hasn't returned conditions",
    scenario: "Conditions list went out 5 days ago. Borrower has been silent. Closing date is approaching.",
    rolePlayPersona: "Active borrower who's been busy with work, embarrassed about the document delay, avoiding you.",
    script: `Hi [Name], quick check — I sent the conditions list on [date] and want to make sure you got it.

I know docs are a pain. If anything on the list isn't clear or if you're stuck somewhere, just tell me which item and I'll walk you through it on the phone in 5 minutes. Way easier than figuring it out alone.

If we can get [most-time-sensitive item] back by [day], we stay on track for closing on [date]. Want to jump on a quick call?`,
    notes: "Don't shame the delay. Offer to walk them through it. Most stalls are 'I don't understand what they want' embarrassment, not unwillingness.",
  },

  // ── Post-Close ────────────────────────────────────────────────────
  {
    id: "pc-30-day-call",
    category: "post_close",
    title: "30-day post-close check-in",
    scenario: "Borrower has been in the home a month, made one payment. Time for the structured check-in.",
    rolePlayPersona: "Recent borrower who closed 30 days ago. Mostly happy, has one minor concern (escrow setup question) but hasn't called you about it.",
    script: `Hey [Name], it's [Your Name]. You're a month in now — wanted to check in.

How's it going? Anything come up with the home, the payment, anything?

[Listen]

[If positive]: That's great to hear. Quick favor — would you be willing to leave me a quick review? Most of my future clients come from people checking my reviews before they call. I'll text you the link right after we hang up so you don't have to remember.

Also — who do you know who's thinking about buying or refinancing in the next year? Even if they're a year out, I'd love to start the conversation early.`,
    notes: "The two asks (review + referral) come AFTER they've expressed positive emotion. Use their language as the bridge. Both asks back-to-back is fine — they expect it and the timing is right.",
  },
  {
    id: "pc-review-ask-text",
    category: "post_close",
    title: "Review ask follow-up text",
    scenario: "After a positive 30-day call where they said yes to leaving a review.",
    rolePlayPersona: "(No persona — this is a one-way text)",
    script: `[Name], thanks for the time today. As promised, here's the review link — takes about 90 seconds:

[Link]

Anything you'd write means a lot. No pressure on length.

Talk soon —
[Your Name], NMLS #[Your NMLS]`,
    notes: "Send within 60 minutes of the call ending. Conversion drops fast after that window.",
  },
  {
    id: "pc-referral-thanks",
    category: "post_close",
    title: "Thanking a past client for a referral",
    scenario: "Past client just sent you a referral. Whether or not it closes, you thank them.",
    rolePlayPersona: "(No persona — this is the thank-you message)",
    script: `[Name], just wanted to say thank you for sending [Referral Name] my way. I really appreciate it.

I'll take great care of them. I'll let you know how it goes.`,
    notes: "Short. Genuine. Don't over-engineer it. The thank-you reinforces the behavior — they sent one, so they'll send another. If you skip this, the second referral often doesn't come.",
  },
];

export function searchScripts(query: string, category?: ScriptCategory): Script[] {
  const q = query.trim().toLowerCase();
  return SCRIPTS.filter(s => {
    if (category && s.category !== category) return false;
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.scenario.toLowerCase().includes(q) ||
      s.script.toLowerCase().includes(q) ||
      (s.notes || "").toLowerCase().includes(q)
    );
  });
}

export function getScript(id: string): Script | undefined {
  return SCRIPTS.find(s => s.id === id);
}
