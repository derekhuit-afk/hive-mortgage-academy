import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { currentScore, targetScore, debts, timeline, loName } = await req.json();

    const prompt = `You are Derek Huit — $1B+ mortgage LO. Write a specific, actionable credit improvement plan.

BORROWER SITUATION:
- Current score: ${currentScore}
- Target score: ${targetScore}
- Timeline: ${timeline} months
- Debts: ${JSON.stringify(debts)}
- LO: ${loName || "their LO"}

Write a credit improvement plan using **Bold Headers** for each section:

**YOUR SCORE GAP**
1-2 sentences. Current score → target score. Gap = ${targetScore - currentScore} points. Is this realistic in ${timeline} months? Be honest.

**HIGHEST-IMPACT ACTIONS (DO THESE FIRST)**
3-4 specific bullets. Each one has a concrete number — which card to pay down to what balance, exactly. Calculate utilization targets. Highest-impact first. If a card has a $1,000 limit and $800 balance, say "Pay [Card] from $800 down to $300 — this alone could move your score 15-25 points."

**WHAT TO STOP DOING**
3 bullets. No new credit. No closing old accounts. No balance shuffling between cards.

**REALISTIC TIMELINE**
Month-by-month estimate. "Month 1: Pay down X. Expected gain: Y points. Month 2: ..."

**YOUR BOTTOM LINE**
1-2 sentences. Can they hit their target? What's realistic? Be straight with them.

Be specific to their actual debt numbers. No generic advice.`;

    const response = await client.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 900, messages: [{ role: "user", content: prompt }] });
    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch { return NextResponse.json({ content: "" }, { status: 500 }); }
}
