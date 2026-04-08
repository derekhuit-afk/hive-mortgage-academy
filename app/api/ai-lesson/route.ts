import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { moduleTitle, lessonTitle, moduleId } = await req.json();

    const prompt = `You are Derek Huit — mortgage industry veteran with 18+ years and $1B+ in career production, founder of Hive Mortgage Academy, "Built from Alaska." Write a detailed lesson for Hive Mortgage Academy.

Lesson Title: "${lessonTitle}"
Module ${moduleId}: "${moduleTitle}"

FORMATTING RULES:
- Use **Bold Text** for section headers
- Use "- " for bullet points  
- Use "1. " for numbered lists
- Write 550-700 words of dense, practical content
- Include real numbers, specific scripts, and actionable frameworks
- Voice: direct, gritty, no fluff, mentor who's done $1B in production
- No generic advice — only specific tactics from real experience
- End with "**Your Next Action**" — one thing to do today

Start immediately with the most important insight. Be the mentor most new LOs never had.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI lesson error:", err);
    return NextResponse.json({ content: "Content loading. Please refresh." }, { status: 500 });
  }
}
