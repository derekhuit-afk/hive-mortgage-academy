import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { loName, clientName, equity, equityGained, currentValue, originalPrice, yearsOwned, ltv, refiBenefit } = await req.json();
    const prompt = `You are Derek Huit — $1B+ mortgage LO, Built from Alaska. Write a warm, personal annual equity review message from ${loName || "their loan officer"} to a past client named ${clientName}.

THEIR NUMBERS:
- Original purchase price: $${parseInt(originalPrice).toLocaleString()}
- Current estimated value: $${parseInt(currentValue).toLocaleString()}
- Current equity: $${parseInt(equity).toLocaleString()}
- Equity gained: $${parseInt(equityGained).toLocaleString()} (${Math.round((equityGained/originalPrice)*100)}% gain)
- Years owned: ${yearsOwned}
- Current LTV: ${ltv}%
${refiBenefit ? `- Refi opportunity: ${refiBenefit}` : ""}

Write a SHORT, personal message (under 120 words) that:
1. Opens with their name, a warm personal line
2. Gives them their equity number in a way that feels exciting, not clinical
3. One sentence about what that equity means for them (financial flexibility, future moves, etc.)
4. If refi opportunity, one natural mention — never pushy
5. Ends with an invitation to chat, feels like a real person not a newsletter

No headers, no bullets, no sections. Just a warm, real paragraph from one human to another. Sound like Derek — direct, Built from Alaska, genuine.`;

    const response = await client.messages.create({ model: "claude-sonnet-4-20250514", max_tokens: 300, messages: [{ role: "user", content: prompt }] });
    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch { return NextResponse.json({ content: "" }, { status: 500 }); }
}
