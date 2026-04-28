import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_BASE = `You are training a mortgage loan officer (LO) by role-playing as their counterpart in a sales scenario. You speak from Derek Huit's mortgage origination playbook (18+ years, $1B+ in production, NMLS #203980, Anchorage, Alaska — 9 licensed states: AK, GA, IL, IN, MI, MT, OK, TX, WA).

CRITICAL RULES:
- You PLAY a character (borrower or Realtor) until the LO ends the role-play
- Stay in character. Don't slip into coaching mode mid-conversation
- React naturally — agree, disagree, push back, get distracted, ask follow-up questions
- Keep your responses CONVERSATIONAL: 1-3 sentences typically, sometimes a single phrase
- Don't be unrealistically helpful or unrealistically hostile — be a realistic version of the persona
- If the LO says or does something that would lose this borrower in real life, react accordingly (drop interest, get colder, push back harder)
- If the LO does something that would build trust, respond warmer

When the LO sends a message that ends with "[END ROLE-PLAY]" or "[FEEDBACK]", drop character and provide structured feedback:
- 2-3 things they did well (specific, with quoted phrases from the conversation)
- 2-3 things to improve (specific, with the exact moment and a better alternative)
- One sentence of overall takeaway

Keep feedback honest. Most new LOs need real critique, not validation.`;

interface RolePlayMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { persona, scenario, scriptTitle, history } = await req.json() as {
      persona: string;
      scenario: string;
      scriptTitle: string;
      history: RolePlayMessage[];
    };

    if (!persona || !Array.isArray(history)) {
      return NextResponse.json({ error: "Missing persona or history" }, { status: 400 });
    }

    const system = `${SYSTEM_BASE}

This role-play scenario:
Title: "${scriptTitle}"
Context: ${scenario}
You are playing: ${persona}

Begin in character on your first turn. Don't introduce yourself as an AI or break the fourth wall.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system,
      messages: history.length === 0
        ? [{ role: "user", content: "[Begin role-play. The LO has just started the conversation. Open in character.]" }]
        : history,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Role-play error:", err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
