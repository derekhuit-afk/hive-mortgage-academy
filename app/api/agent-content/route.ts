import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { loName, loMarket, contentType, agentName } = await req.json();

    const prompts: Record<string, string> = {
      market_update: `Write a short, punchy monthly market update email from ${loName} (mortgage LO in ${loMarket}) to send to Realtor partners. 150 words max. Include 2-3 made-up but realistic market stats for ${loMarket}. End with a soft value-add offer. Subject line included. No fluff.`,
      referral_thank_you: `Write a genuine thank-you message from ${loName} to ${agentName || "a Realtor"} for sending a referral. Short (under 100 words). Warm but not sycophantic. Mention you'll keep them updated every step of the way. Text message format.`,
      coffee_follow_up: `Write a follow-up text from ${loName} to ${agentName || "a Realtor"} after a first coffee meeting. Under 80 words. Reference "our conversation" without being specific. One clear next step. Casual tone.`,
      pre_approval_update: `Write a quick update text from ${loName} to ${agentName || "a Realtor"} letting them know their buyer just got pre-approved. Under 60 words. Enthusiastic but professional. Include that you're available if they have questions.`,
      anniversary_touch: `Write a "just checking in" message from ${loName} to ${agentName || "a Realtor partner"} they haven't spoken to in 30+ days. Under 80 words. Mention something vague about market conditions. Ask if they have buyers looking. No desperation.`,
    };

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompts[contentType] || prompts.market_update }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
