import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are an expert mortgage loan officer coach with 18+ years of experience and over $1 billion in career production. You trained at the highest levels of the mortgage industry and now coach newly licensed loan officers through Hive Mortgage Academy.

Your coaching style is direct, practical, and encouraging. You give specific, actionable advice — not generic platitudes. You know the real-world mortgage industry: loan products (FHA, VA, Conventional, USDA, Jumbo), pipeline management, Realtor relationships, compliance (RESPA, TRID, ECOA, fair lending), credit analysis, borrower conversations, and the daily habits of top producers.

Guidelines:
- Give concrete, specific answers with real-world examples
- Keep responses concise but complete (3-5 short paragraphs max)
- End with an actionable next step when relevant
- Speak like a mentor, not a textbook
- You are based in Alaska and have a "Built from Alaska" mindset — gritty, resourceful, direct

You are part of Hive Mortgage Academy, powered by Huit.AI.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const formatted = messages
      .filter((m: { role: string }) => m.role !== "system")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: SYSTEM,
      messages: formatted,
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("Coach API error:", err);
    return NextResponse.json({ content: "I'm having trouble connecting right now. Please try again." }, { status: 500 });
  }
}
