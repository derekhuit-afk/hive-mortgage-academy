import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { loName, loNmls, loMarket, contactName, relationship, homeStatus, notes } = await req.json();

    const prompt = `You are Derek Huit — $1B+ mortgage producer, Built from Alaska. Write outreach scripts for a new loan officer reaching out to their sphere of influence.

LO: ${loName}${loNmls ? ` (NMLS #${loNmls})` : ""}
Market: ${loMarket || "their market"}

CONTACT: ${contactName}
Relationship: ${relationship}
Homeownership Status: ${homeStatus}
Notes: ${notes || "none"}

Write THREE outreach options. Keep each one SHORT and human — never salesy.

**TEXT MESSAGE**
Under 120 characters. Casual, like a real person texting someone they know. Reference the relationship naturally. Do NOT mention rates or loans yet. Just open a door.

**VOICEMAIL SCRIPT**
Under 25 seconds when spoken aloud (~60 words). Natural, warm, specific to the relationship. One soft mention of the new license. Clear callback ask.

**EMAIL / DM**
3 short paragraphs. First: personal connection/check-in. Second: mention the license and what you're doing. Third: soft ask — not for business, for a conversation. No pressure, no pitch. End with their name signed off warmly.

**FOLLOW-UP TEXT (for if no response after 1 week)**
Under 100 characters. Light, no pressure. Different angle from the first text.

Tone: real, warm, zero desperation. Sound like a friend who happens to now be a loan officer, not a loan officer trying to be a friend.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
