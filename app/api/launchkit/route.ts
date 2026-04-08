import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { name, nmls, market, state, sphereSize, goalUnits, goalVolume, experience, channels, loanTypes } = await req.json();

    const prompt = `You are Derek Huit — $1B+ mortgage producer, Built from Alaska, founder of Hive Mortgage Academy. You are writing a personalized 90-Day Business Launch Plan for a newly licensed loan officer.

LO PROFILE:
- Name: ${name}
- NMLS: ${nmls || "pending"}
- Market: ${market}, ${state}
- Sphere of Influence Size: ${sphereSize} people
- Goal: ${goalUnits} units / $${goalVolume}M in first 90 days
- Experience Level: ${experience}
- Primary Channels: ${channels.join(", ")}
- Loan Types to Focus On: ${loanTypes.join(", ")}

Write a complete, personalized 90-Day LO Launch Plan. Use this EXACT structure with these EXACT section headers (use **Header** format):

**YOUR 90-DAY MISSION**
2-3 sentences. Direct, motivating, specific to their numbers and market. Built from Alaska grit.

**WEEK 1 — LAUNCH**
Day-by-day breakdown of Week 1. Specific daily actions. Include: digital setup, first 5 calls script, LinkedIn update, Google Business Profile. Be specific about timing and what to say.

**WEEK 2 — SPHERE ACTIVATION**
How to work through their ${sphereSize}-person sphere. Who to contact first, what to say, tracking system. Specific outreach script included.

**WEEK 3 — REALTOR OUTREACH**
First Realtor meetings strategy for ${market}. Open house script. Office presentation request template. Target: X meetings by end of week.

**WEEK 4 — PIPELINE BUILD**
Consolidate. Follow up on everyone contacted weeks 1-3. First pre-approval target. CRM setup. Daily routine established.

**MONTH 2 — BUILD MOMENTUM**
Weekly priorities for weeks 5-8. Agent relationship nurturing. Borrower follow-up cadence. First close target. Social media rhythm.

**MONTH 3 — CLOSE AND SCALE**
Weeks 9-12. Close first loan. Ask for reviews. Referral ask scripts. Set up post-close system. Refi watch. Prepare for Month 4+.

**YOUR DAILY OPERATING RHYTHM**
Morning routine (specific times). Pipeline review checklist. Non-negotiable daily actions. End-of-day wrap.

**YOUR SCRIPT LIBRARY**
Include 4 scripts with exact word-for-word language:
1. First call to sphere contact
2. Realtor cold introduction  
3. Borrower pre-approval intake opener
4. Post-close referral ask

**COMPLIANCE REMINDERS**
5 specific rules for ${channels.join("/")} marketing. NMLS disclosure requirements. What NOT to say. Social media rules.

**YOUR 90-DAY SCORECARD**
Weekly metrics table: Calls Made | Meetings | Pre-Apps | Apps | Closings. Targets based on their goals of ${goalUnits} units.

Write 1,200-1,500 words total. Be specific to their market and numbers. Sound like a mentor who's done $1B in production and wants them to win. No generic advice — only specific, actionable tactics.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("LaunchKit error:", err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}
