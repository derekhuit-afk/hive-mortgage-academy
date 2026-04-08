import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { moduleTitle, lessonTitle, lessonIndex, moduleNumber, context } = await req.json();

  // Check cache first
  const { data: cached } = await supabaseAdmin
    .from("hma_lesson_cache")
    .select("content")
    .eq("module_number", moduleNumber)
    .eq("lesson_index", lessonIndex)
    .maybeSingle();

  if (cached?.content) return NextResponse.json({ content: cached.content });

  // Generate
  const prompt = `You are Derek Huit — $1B+ mortgage loan originator, 18+ years, built from Alaska. Write a comprehensive, practical lesson for a NEW mortgage loan officer.

Module: "${moduleTitle}"
Lesson: "${lessonTitle}"
Context: ${context || "This is part of the Hive Mortgage Academy curriculum."}

Write in Derek's direct, no-BS voice. Include:
- Real scenarios, not hypotheticals
- Specific dollar amounts, timelines, and numbers where relevant
- Bold headers (use **Header** format) for key sections
- Practical action items an LO can use this week
- 450-600 words total

Never be generic. Write like you've seen this exact situation 1,000 times.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0].type === "text" ? response.content[0].text : "";

    // Cache it
    await supabaseAdmin.from("hma_lesson_cache").upsert({ module_number: moduleNumber, lesson_index: lessonIndex, content }, { onConflict: "module_number,lesson_index" });

    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI lesson error:", err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
