import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { moduleTitle, score, wrongQuestions, passed } = await req.json();

    const prompt = passed
      ? `A new loan officer just scored ${score}% on their "${moduleTitle}" quiz and passed. Write 2-3 sentences of encouraging, specific feedback from a mentor who has $1B in mortgage production. Reference the topic and give one practical takeaway they can use this week. Be direct and motivating, not generic.`
      : `A new loan officer scored ${score}% on their "${moduleTitle}" quiz and did not pass (need 80%). They got these questions wrong: ${wrongQuestions.join("; ")}. Write 2-3 sentences of coaching feedback as a mentor LO. Be honest but encouraging. Point them to what to review and why it matters in real practice.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const feedback = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ feedback });
  } catch {
    return NextResponse.json({ feedback: "" });
  }
}
