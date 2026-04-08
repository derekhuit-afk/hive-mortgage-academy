import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { loName, loNmls, loMarket, agentName, brokerage, specialties, notes } = await req.json();

    const prompt = `You are Derek Huit — $1B+ mortgage producer, Built from Alaska. Write a personalized, conversational outreach pitch for a loan officer to use with a real estate agent.

LO INFO:
- LO Name: ${loName}
- NMLS: ${loNmls || "on file"}
- Market: ${loMarket}

AGENT INFO:
- Agent Name: ${agentName}
- Brokerage: ${brokerage || "their brokerage"}
- Specialties: ${specialties?.join(", ") || "residential"}
- Notes: ${notes || "none"}

Write THREE versions of the outreach:

**TEXT MESSAGE (under 160 chars)**
A casual, personal text intro. No pitch. Just human.

**EMAIL SUBJECT LINE**
Compelling, specific, under 8 words.

**EMAIL BODY**
3-4 short paragraphs. Lead with their world (what they care about), not yours. One specific value prop. Soft CTA for coffee or a quick call. Sign with NMLS number. Sound like a real person, not a template.

**COFFEE MEETING TALKING POINTS**
5 bullet points — what to say when you're face to face. Include one question to ask them that gets them talking. Include one stat or insight about the ${loMarket} market.

**OBJECTION HANDLERS**
Handle these two objections with exact word-for-word responses:
1. "I already have a lender I work with"
2. "You're new / I need someone experienced"

Keep the tone real, direct, Built from Alaska. No corporate speak. This should feel like advice from a mentor, not a script generator.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
