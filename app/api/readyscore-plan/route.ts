import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { score, tier, answers, loName, loMarket } = await req.json();

    const prompt = `You are Derek Huit — $1B+ mortgage LO, Built from Alaska. Write a personalized homebuyer readiness action plan.

BORROWER SCORE: ${score}/100 — Tier: ${tier}
THEIR ANSWERS: ${JSON.stringify(answers, null, 2)}
LO: ${loName || "Your Loan Officer"} in ${loMarket || "your market"}

Write a SHORT, direct, encouraging action plan. Use **Bold Headers** for sections.

**YOUR READINESS SUMMARY**
2 sentences. Honest but encouraging. Reference their specific score and tier.

**YOUR TOP 3 PRIORITIES RIGHT NOW**
3 specific bullet points based on their answers. Each one actionable — not vague. If credit is low, say exactly what to pay down. If down payment is low, give a specific savings target. If timeline is unclear, give a 90-day plan.

**YOUR REALISTIC TIMELINE**
Based on their answers, give an honest estimate: "You could be under contract in X months if you..." Keep it specific.

**WHAT YOUR LOAN OFFICER WILL DO FIRST**
3 bullet points describing what ${loName?.split(" ")[0]||"your LO"} will review on the first call. Make it feel like a warm handoff.

Keep it under 300 words total. Sound like a mentor, not a robot.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role:"user", content: prompt }],
    });
    const content = response.content[0].type==="text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch { return NextResponse.json({ content:"" }, { status:500 }); }
}
