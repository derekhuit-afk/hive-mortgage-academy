export const AUTH_KEY = "hma_student";

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(student: object) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(student));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export type Tier = "free" | "foundation" | "accelerator" | "elite";

export const TIER_LIMITS: Record<Tier, number> = {
  free: 6,
  foundation: 9,
  accelerator: 11,
  elite: 12,
};

export const TIER_PRICES: Record<Tier, number> = {
  free: 0,
  foundation: 97,
  accelerator: 297,
  elite: 697,
};

export function canAccessModule(moduleId: number, tier: Tier): boolean {
  return moduleId <= TIER_LIMITS[tier];
}

export interface Lesson {
  title: string;
  duration: string;
  content?: string; // If absent, will be AI-generated
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  badge: string;
  badgeColor: string;
  tier: Tier;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export const MODULES: Module[] = [
  {
    id: 1,
    title: "Day 1 — You Passed. Now What?",
    subtitle: "The first 48 hours that define your career",
    duration: "42 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "Your First 48 Hours as a Licensed LO", duration: "12 min", content: `Congratulations — you passed the NMLS exam. Here's the truth nobody tells you: the license is just a ticket. The real game starts now.\n\n**Hour 1–4: Mindset Reset**\nYou are no longer a student. You are a business owner who happens to work at a mortgage company. Every decision you make from this point forward either builds your pipeline or drains it.\n\n**Hour 5–12: Choose Your Platform**\nThe first decision that matters is where you hang your license. You have three choices: retail bank, mortgage banker, or broker. Each has tradeoffs. Banks offer stability but restrict products. Mortgage bankers give you more flexibility and control. Brokers give maximum product range but require more self-management.\n\n**Hours 13–48: Your Non-Negotiable Setup List**\n1. Professional headshot (even phone-quality is fine to start)\n2. LinkedIn profile updated with your NMLS number\n3. Google Business Profile created\n4. Personal CRM started (even a spreadsheet counts)\n5. First five people called: family, close friends, former coworkers\n\nThe LOs who survive Year 1 aren't the smartest ones. They're the ones who treat Day 1 like a business launch — not a job start.` },
      { title: "Choosing the Right Company to Hang Your License", duration: "10 min", content: `This decision will make or break your first year. Most new LOs make it wrong.\n\n**What to Look For**\n- Training and mentorship (not a training "program" — an actual human mentor)\n- Product diversity (can you do FHA, VA, USDA, Jumbo, Non-QM?)\n- Technology stack (does their LOS work or does it create friction?)\n- Compensation structure (understand basis points vs. flat fee)\n- Culture fit (do producers share leads? Or hoard them?)\n\n**Questions to Ask in Every Interview**\n1. "What does your average LO close in their first 12 months?"\n2. "Who would be my mentor or manager, and how often would we meet?"\n3. "What's your pull-through rate from application to close?"\n4. "What marketing support do you provide?"\n\n**Red Flags**\n- Any company that won't show you their average first-year production\n- Managers who only talk about comp and not about support\n- Companies with no in-house processing\n- Anyone who says "just work your sphere" as a strategy` },
      { title: "Setting Up Your Digital Presence", duration: "11 min", content: `Your digital presence is your 24/7 referral engine. Set it up once, right.\n\n**LinkedIn (Priority #1)**\n- Include NMLS number in headline: "Mortgage Loan Officer | NMLS #XXXXXX"\n- Professional headshot is mandatory\n- Write a summary that speaks to borrowers, not recruiters\n- Connect with every Realtor you've ever met within 30 days\n\n**Google Business Profile**\nCreate a GBP under your name + mortgage. Example: "Derek Huit - Mortgage Loan Officer." This is how borrowers searching "mortgage officer near me" find you before they find Zillow.\n\n**Facebook Business Page**\nEven if you hate social media. Borrowers research on Facebook. Set it up with your NMLS, photo, and contact info. Post once a week minimum.\n\n**What NOT to Do**\n- Don't post interest rates (compliance)\n- Don't guarantee approvals in marketing\n- Don't connect your personal Facebook to your business without a compliance review` },
      { title: "What Nobody Tells You About Your First Deal", duration: "9 min", content: `Your first deal will be messy. That's normal. Here's how to survive it.\n\n**The Reality**\nYour first loan will take longer than it should. The borrower will go dark at the worst moment. The appraisal will come in weird. The processor will ask for documents you didn't know existed.\n\n**How to Protect It**\n1. Over-communicate with your borrower (text updates every 2–3 days minimum)\n2. Set conservative expectations on timeline (add 10 days to whatever your processor tells you)\n3. Build a relationship with your processor — they determine your speed\n4. Never stop the file from moving (if you're waiting on a doc, call, don't email)\n\n**Your First Close**\nWhen it closes, send a handwritten thank-you note. Take a photo of the key handoff. Post it (with permission). Tag the Realtor. This is how one deal becomes three.` },
    ],
    quiz: [
      { q: "What is the most important first decision a newly licensed LO makes?", options: ["Choosing a business card design", "Choosing where to hang their license", "Setting up a website", "Getting business cards printed"], answer: 1 },
      { q: "Which of the following is a red flag when evaluating a mortgage company to join?", options: ["They have in-house processing", "They won't show you their average first-year production", "They offer mentorship programs", "They have a diverse product menu"], answer: 1 },
      { q: "Your NMLS number should appear in which digital profile?", options: ["Only your company website", "LinkedIn headline only", "Every professional digital profile", "Only on official loan documents"], answer: 2 },
      { q: "When should you send a borrower an update during their loan process?", options: ["Only when they ask", "Every 2–3 days minimum", "At application and at close only", "Once a week on Fridays"], answer: 1 },
      { q: "Missing a closing date due to LO error can result in:", options: ["A warning from your manager", "Having to owe the borrower their earnest money deposit", "Automatic loan cancellation", "A fine from NMLS"], answer: 1 },
    ],
  },
  {
    id: 2,
    title: "Understanding Loan Products",
    subtitle: "Know your tools before you pick them up",
    duration: "55 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "FHA vs. Conventional — The Real Difference", duration: "14 min", content: `Most new LOs lead with FHA for everyone. That's a mistake that costs borrowers money.\n\n**FHA Basics**\n- Minimum 3.5% down with 580+ FICO\n- MIP (Mortgage Insurance Premium) for the life of the loan on most cases\n- More lenient on debt-to-income ratios\n- Best for: lower credit scores (580–679), higher DTI, first-time buyers with minimal savings\n\n**Conventional Basics**\n- As low as 3% down (97 LTV programs)\n- PMI cancels at 80% LTV\n- Stricter credit and DTI requirements\n- Best for: 680+ FICO, stable income, buyers who want PMI to eventually go away\n\n**The Conversation You Need to Have**\nBefore recommending a product, ask: "What's your credit score range, and how much do you have saved for down payment plus closing costs?"\n\nIf the answer is 720+ FICO and 10%+ down: run Conventional every time.\nIf the answer is 600 FICO and 5% saved: FHA is likely the right call.\nNever recommend a product before pulling credit.` },
      { title: "VA Loans — The Most Powerful Product in Mortgage", duration: "14 min", content: `If you have one veteran borrower, you need to understand VA loans better than any other product.\n\n**The Basics**\n- Zero down payment for eligible veterans and active duty\n- No PMI (the VA Funding Fee replaces it — and is financed into the loan)\n- Competitive rates — often better than conventional\n- More flexible on credit and DTI\n\n**Eligibility**\n- Active duty after 90 days of continuous service\n- Veterans who served 181 days in peacetime or 90 in wartime\n- National Guard/Reserve after 6 years\n- Surviving spouses (unremarried) of veterans who died in service\n\n**Your Most Important Question**\n"Have you ever served in the military or are you currently serving?" Ask this every time. You will miss VA eligibility if you don't.\n\n**VA Funding Fee**\nFirst-time use, no down: 2.15% of loan amount (financed in). Disability-exempt veterans: 0% — always check.` },
      { title: "USDA and Niche Programs", duration: "13 min", content: `USDA loans are the most underutilized product in mortgage. Learn them and you'll close deals your competition misses.\n\n**USDA Rural Development (RD) Loan**\n- Zero down payment\n- Below-market interest rates\n- Geographic restriction (rural/suburban — check eligibility at usda.gov)\n- Income limits apply (usually 115% of area median income)\n- Annual guarantee fee: 0.35% (much cheaper than FHA MIP)\n\n**When to Recommend USDA**\nBorrower has stable income, decent credit (640+), is buying in a qualifying area, and has little to no down payment. This beats FHA in most cases where the property qualifies.\n\n**DPA (Down Payment Assistance) Programs**\nEvery state has them. Alaska Housing Finance Corporation (AHFC) offers programs in Alaska. HUD-approved housing counselors can direct borrowers to their state programs.` },
      { title: "How to Explain Options to Any Borrower", duration: "14 min", content: `The best LOs aren't product experts. They're translators. Your job is to make the complex feel simple.\n\n**The Three-Option Framework**\nPresent every borrower with exactly three options. Two are real. One is extreme (to anchor expectations).\n\nOption A: "Here's the most aggressive — least money down, highest payment."\nOption B: "Here's the balanced approach — moderate down, manageable payment."\nOption C: "Here's the safest — more money down, lowest payment and risk."\n\nMost people choose B. But giving them all three feels like choice, not a sales pitch.\n\n**Language That Works**\n- Never say "you qualify for X" — say "based on what you've shared, here's what I'd recommend"\n- Never say "the rate is X" — say "today's rate is X, and here's what that means for your payment"\n- Never say "I can't do that loan" — say "let me show you what we can do"\n\nYou are their advisor, not their salesperson. The difference shows in referrals.` },
    ],
    quiz: [
      { q: "FHA MIP on most loans lasts:", options: ["Until you hit 20% equity", "5 years", "For the life of the loan", "Until credit score reaches 740"], answer: 2 },
      { q: "The VA Funding Fee is waived for:", options: ["All first-time VA users", "Veterans with service-connected disabilities", "Active duty only", "Surviving spouses only"], answer: 1 },
      { q: "USDA loans require what minimum down payment?", options: ["3.5%", "3%", "5%", "Zero down"], answer: 3 },
      { q: "What is the first question you should ask every potential borrower?", options: ["What is your income?", "How much do you have saved?", "Have you ever served in the military?", "What is your target home price?"], answer: 2 },
      { q: "In the Three-Option Framework, most borrowers choose:", options: ["Option A (most aggressive)", "Option B (balanced)", "Option C (safest)", "They ask for a fourth option"], answer: 1 },
    ],
  },
  {
    id: 3,
    title: "Building Your Referral Pipeline",
    subtitle: "Your first 10 partners in 30 days",
    duration: "48 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "The Realtor Relationship Playbook", duration: "14 min", content: `Realtors are your best and most sustainable referral source. But most LOs approach them wrong.\n\n**The Wrong Approach**\n"Hi, I'm new and looking for referral partners." This tells them you need them. It creates no value for them.\n\n**The Right Approach**\nBring them something. Show up with data, a market report, a referral, a solution to a problem they have. Lead with value every single time.\n\n**Your First Realtor Conversation**\n"I work specifically in [area] and I run a system that keeps your buyers informed with weekly updates so they never miss a status. My average close time is [X] days. I'd love to show you how I operate."\n\nThen stop talking. Let them ask questions.\n\n**The 10-5-1 Rule**\nFor every 10 Realtors you have a coffee with, 5 will take a call from you. Of those 5, 1 will send you a loan in the first 90 days. You need 10 consistent Realtor referral partners to have a sustainable business.` },
      { title: "Your First 10 Referral Partners in 30 Days", duration: "12 min", content: `This is the 30-day sprint that determines your entire first year.\n\n**Week 1: Start with Who You Know**\nList every Realtor you've ever interacted with. Send a personal text (not email): "Hey [name], I recently got my mortgage license. I'd love 20 minutes to show you how I work. Coffee on me."\n\nTarget: 5 meetings booked.\n\n**Week 2: Open Houses**\nEvery Saturday and Sunday, visit open houses. Come as a resource, not a competitor. Bring a flyer with current rate ranges and your contact info.\n\nTarget: 10 new Realtor introductions.\n\n**Week 3: Broker Tour**\nContact the managing broker at 3 local offices and ask if you can bring breakfast and present a market update. 15 minutes, max.\n\nTarget: 3 office presentations, 15+ cards distributed.\n\n**Week 4: Follow Up Everything**\nCall or text everyone from weeks 1–3. Target: 2 pre-approvals in hand by Day 30.` },
      { title: "Scripts, Objections, and Follow-Up Cadence", duration: "11 min", content: `Scripts aren't about sounding scripted. They're about never getting caught off guard.\n\n**The Pre-Approval Offer**\n"If you ever have a buyer who needs a pre-approval — even on a weekend — I turn those around in 24 hours or less."\n\n**The Objection: "I already have a lender I work with"**\n"That's great — every good Realtor should have 2 or 3. I'm not asking you to switch, just to have me as a backup for deals your current lender can't close. I do a lot of VA and USDA that most lenders struggle with."\n\n**The Objection: "You're new"**\n"I am new to originating, but I have more time to focus on your clients than a LO doing 20 loans a month. I'll answer your texts on Sunday."\n\n**Follow-Up Cadence**\nDay 1: Thank you text. Day 7: Market stat. Day 14: Check-in. Day 30: Coffee invite. Monthly: Newsletter.\n\nConsistency over intensity. One good touchpoint per month beats five in one week.` },
      { title: "Building Beyond Realtors", duration: "11 min", content: `Realtors are essential but your pipeline is fragile if they're your only source.\n\n**Financial Advisors and CPAs**\nOne CPA with 200 clients can send you 5–10 loans per year. Approach: "I specialize in mortgages for your clients who are buying, refinancing, or investing."\n\n**Divorce Attorneys**\nDivorce frequently triggers a home sale and two new purchases. These are not easy loans, but there's very little competition.\n\n**HR Departments at Large Employers**\nCompanies relocating employees often need mortgage referrals. One HR contact at a large employer can send you 5–15 loans per year with zero marketing cost.\n\n**Your Personal Network**\n"By the way, I just got my mortgage license. If you ever have friends or family buying or refinancing, I'd love to help. I make it really easy."\n\nThat sentence has closed $100M+ in loans across the industry.` },
    ],
    quiz: [
      { q: "The 10-5-1 Realtor Rule means:", options: ["10 calls, 5 emails, 1 meeting per week", "For every 10 Realtors met, 1 will refer a loan in 90 days", "Contact Realtors 10 times before giving up", "10 closings, 5 referrals, 1 new partner per month"], answer: 1 },
      { q: "When a Realtor says 'I already have a lender,' the best response is:", options: ["Thank them and leave", "Ask them to switch immediately", "Position yourself as a backup for loans their current lender can't close", "Offer to cut your rate"], answer: 2 },
      { q: "How often should you send a touchpoint to a Realtor partner?", options: ["Daily", "Weekly", "Monthly", "Quarterly only"], answer: 2 },
      { q: "Which non-Realtor referral source can send 5–15 loans per year?", options: ["Local gym owners", "HR departments at large employers", "Coffee shop owners", "Social media influencers"], answer: 1 },
      { q: "The best script to introduce yourself at an open house is:", options: ["'I'm looking for new partners'", "'I specialize in buyers in this price range and wanted to introduce myself'", "'Are you getting enough leads?'", "'I can beat any rate you've seen'"], answer: 1 },
    ],
  },
  {
    id: 4,
    title: "Your First Borrower Conversation",
    subtitle: "From hello to pre-approval in one call",
    duration: "50 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "Pre-Qual vs. Pre-Approval — The Difference That Matters", duration: "12 min" },
      { title: "Reading a Credit Report Live", duration: "13 min" },
      { title: "Setting Expectations on Timeline and Process", duration: "12 min" },
      { title: "Handling Common Objections and Difficult Questions", duration: "13 min" },
    ],
    quiz: [
      { q: "For mortgage qualification, which credit score is used when all three bureau scores are different?", options: ["The highest score", "The lowest score", "The middle score", "An average of all three"], answer: 2 },
      { q: "A TBD (To Be Determined) Approval is:", options: ["A pre-qualification based on stated information", "An underwriter-approved loan before a property is identified", "A conditional approval pending appraisal only", "The same as a pre-approval"], answer: 1 },
      { q: "Which action can kill a loan at closing if not disclosed to the LO?", options: ["Renting the same apartment", "Getting a job promotion", "Opening a new credit card after going under contract", "Saving additional money"], answer: 2 },
      { q: "Rapid Rescore allows a credit update in:", options: ["Same day", "5–7 business days", "30 days", "60–90 days"], answer: 1 },
      { q: "When a borrower says 'your rate is higher,' the best response is:", options: ["Immediately match the competitor", "Offer a rebate", "Show a total cost comparison including fees", "Explain your company is more reputable"], answer: 2 },
    ],
  },
  {
    id: 5,
    title: "Payment-First — Not Max Qualification",
    subtitle: "The philosophy that builds client trust for life",
    duration: "46 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "Why Payment-First Changes Everything", duration: "12 min" },
      { title: "The 3-Scenario Consultation Framework", duration: "12 min" },
      { title: "Total Cost of Homeownership — The Honest Conversation", duration: "11 min" },
      { title: "Running a Payment-First Consultation Live", duration: "11 min" },
    ],
    quiz: [
      { q: "The Payment-First approach starts by asking:", options: ["What is your maximum budget?", "What monthly payment feels comfortable to you?", "How much do you make per year?", "What is your credit score?"], answer: 1 },
      { q: "Total cost of homeownership includes:", options: ["Principal and interest only", "PITI + HOA + insurance + maintenance reserve", "Just the mortgage payment", "Down payment + closing costs only"], answer: 1 },
      { q: "When presenting 3 scenarios, you should:", options: ["Always lead with the maximum qualification", "Present conservative, moderate, and stretch options", "Only show what they can max qualify for", "Show one option to keep it simple"], answer: 1 },
      { q: "The biggest risk of max-qualification lending is:", options: ["Lower commission", "Borrowers becoming house-poor with no financial flexibility", "Compliance violations", "Longer closing times"], answer: 1 },
      { q: "Payment-first builds long-term referrals because:", options: ["Borrowers feel pushed to buy more home", "Borrowers feel respected and financially seen, not sold", "It closes faster", "It requires less documentation"], answer: 1 },
    ],
  },
  {
    id: 6,
    title: "Credit Reports & Qualification Deep Dive",
    subtitle: "Read numbers like a pro, advise like a mentor",
    duration: "52 min",
    badge: "FREE",
    badgeColor: "#10B981",
    tier: "free",
    lessons: [
      { title: "Reading a Tri-Merge Credit Report", duration: "14 min" },
      { title: "DTI, LTV, and the Numbers That Gate Every Loan", duration: "13 min" },
      { title: "Credit Repair Conversations Without Giving Legal Advice", duration: "13 min" },
      { title: "Building a 90-Day Credit Path for Your Borrower", duration: "12 min" },
    ],
    quiz: [
      { q: "A Tri-Merge credit report combines scores from:", options: ["Equifax only", "Experian and TransUnion only", "All three major bureaus", "Your LOS and the bureau"], answer: 2 },
      { q: "What revolving utilization percentage is considered ideal for credit scoring?", options: ["Under 10%", "Under 30%", "Under 50%", "Under 70%"], answer: 1 },
      { q: "DTI stands for:", options: ["Debt To Income", "Down payment To Interest", "Document Transfer Index", "Default Threshold Index"], answer: 0 },
      { q: "LTV above 80% on a conventional loan typically requires:", options: ["A co-borrower", "PMI (Private Mortgage Insurance)", "VA eligibility", "An FHA switch"], answer: 1 },
      { q: "When helping a borrower improve their credit, you should:", options: ["Guarantee a specific score improvement", "Advise them to dispute everything on their report", "Show them specific paydown targets and let them act", "Tell them to stop using all credit cards"], answer: 2 },
    ],
  },
  {
    id: 7,
    title: "CRM + Tech Stack for New LOs",
    subtitle: "Build the system that closes loans while you sleep",
    duration: "44 min",
    badge: "Foundation",
    badgeColor: "#3B82F6",
    tier: "foundation",
    lessons: [
      { title: "Why Your Tech Stack Is Your Pipeline", duration: "11 min" },
      { title: "The Huit.AI Platform — What LOs on the Platform Get", duration: "11 min" },
      { title: "Automating Follow-Up Without Losing the Human Touch", duration: "11 min" },
      { title: "Your Daily Operating Rhythm", duration: "11 min" },
    ],
    quiz: [
      { q: "The primary function of a mortgage CRM is to:", options: ["Replace phone calls entirely", "Ensure no lead or past client falls through the cracks", "Automate all borrower decisions", "Replace your processor"], answer: 1 },
      { q: "The best time to invest in advanced tools is:", options: ["Before you originate your first loan", "After you are consistently closing $2M+/month", "Only when your manager requires it", "Never — work the phone instead"], answer: 1 },
      { q: "Behavioral prediction tools in a mortgage CRM help you:", options: ["Set interest rates", "Know which past clients are most likely to refinance or refer soon", "Automate underwriting decisions", "Pull credit without borrower consent"], answer: 1 },
      { q: "A 'Daily Operating Rhythm' for LOs should include:", options: ["8 hours of calls with no breaks", "A structured morning review of pipeline, follow-ups, and new leads", "Only answering inbound calls", "Avoiding CRM updates to save time"], answer: 1 },
      { q: "Which Huit.AI product is specifically designed for mortgage pipeline management?", options: ["APEX", "CRMEX", "HyperLoan AI", "AgentPartner"], answer: 1 },
    ],
  },
  {
    id: 8,
    title: "Moving the Loan: App to Clear to Close",
    subtitle: "Own the process so nothing kills your deal",
    duration: "56 min",
    badge: "Foundation",
    badgeColor: "#3B82F6",
    tier: "foundation",
    lessons: [
      { title: "The Loan Process From 30,000 Feet", duration: "14 min" },
      { title: "What Underwriters Actually Look For", duration: "14 min" },
      { title: "Clearing Conditions Fast — The LO's Role", duration: "14 min" },
      { title: "Keeping Borrowers Calm Through the Process", duration: "14 min" },
    ],
    quiz: [
      { q: "The order of a standard purchase loan process is:", options: ["Pre-Approval → Application → Processing → Underwriting → Close", "Application → Pre-Approval → Close → Underwriting", "Underwriting → Processing → Application → Close", "Pre-Approval → Close → Application → Underwriting"], answer: 0 },
      { q: "Underwriters are primarily evaluating:", options: ["The Realtor's reputation", "The 3 C's: Credit, Capacity, and Collateral", "The LO's production volume", "The title company's history"], answer: 1 },
      { q: "The fastest way to clear a condition is:", options: ["Email the processor and wait", "Call the borrower, explain exactly what is needed, and follow up daily", "Ignore it until the processor escalates", "Ask the Realtor to handle it"], answer: 1 },
      { q: "Clear to Close (CTC) means:", options: ["The appraisal has been ordered", "All underwriting conditions have been satisfied and the loan is ready to close", "The borrower has been pre-approved", "The title search is complete"], answer: 1 },
      { q: "When should you tell a borrower to expect delays?", options: ["Never — it creates panic", "At application and whenever conditions are outstanding", "Only if the delay is more than 2 weeks", "Only in writing, never verbally"], answer: 1 },
    ],
  },
  {
    id: 9,
    title: "Agent Relationships — Give & Receive Referrals",
    subtitle: "Turn one agent into a referral machine",
    duration: "50 min",
    badge: "Foundation",
    badgeColor: "#3B82F6",
    tier: "foundation",
    lessons: [
      { title: "The Agent Partnership Value Proposition", duration: "12 min" },
      { title: "Co-Marketing That Works (and Stays Compliant)", duration: "13 min" },
      { title: "Receiving Referrals with a System", duration: "12 min" },
      { title: "Agent Appreciation and Long-Term Retention", duration: "13 min" },
    ],
    quiz: [
      { q: "The strongest value proposition to a Realtor is:", options: ["The lowest rate in the market", "Fast, reliable closings and proactive communication that protects their deals", "The most expensive marketing package", "The most loans closed nationally"], answer: 1 },
      { q: "RESPA-compliant co-marketing requires:", options: ["Equal value exchange between parties", "No documentation", "The LO to pay for all materials", "Approval only for print materials, not digital"], answer: 0 },
      { q: "When receiving a referral from an agent, your first response should be:", options: ["Wait for the borrower to call you", "Contact the borrower within 2 hours, reference the agent by name", "Ask the agent to set up the introduction meeting", "Send the agent a gift card"], answer: 1 },
      { q: "The best way to retain an agent relationship long-term is:", options: ["Always offering the lowest rate for their clients", "Consistent, predictable performance and monthly touchpoints", "Sending holiday gifts only", "Attending every open house they host"], answer: 1 },
      { q: "HMDA data can help you identify:", options: ["Which borrowers have the best credit", "Which agents in your market close the most purchase volume with no preferred lender", "Your own closing timeline", "Competitor interest rates"], answer: 1 },
    ],
  },
  {
    id: 10,
    title: "Compliance, RESPA & Fair Lending",
    subtitle: "Know the rules before you break them",
    duration: "38 min",
    badge: "Accelerator",
    badgeColor: "#3B82F6",
    tier: "accelerator",
    lessons: [
      { title: "RESPA, TRID, and the Disclosure Timeline", duration: "10 min" },
      { title: "Fair Lending Laws Every LO Must Know", duration: "10 min" },
      { title: "Social Media Compliance for LOs", duration: "9 min" },
      { title: "Protecting Borrower Information (GLB Act)", duration: "9 min" },
    ],
    quiz: [
      { q: "Under RESPA, which of the following is prohibited?", options: ["Recommending a title company to a borrower", "Accepting a referral fee from a Realtor for sending borrowers", "Co-marketing with a Realtor using a formal written agreement", "Providing a Loan Estimate within 3 days"], answer: 1 },
      { q: "TRID requires the Loan Estimate to be delivered within how many days of application?", options: ["1 business day", "3 business days", "5 business days", "7 calendar days"], answer: 1 },
      { q: "Which action could result in NMLS license revocation?", options: ["Closing a loan for a family member with proper disclosure", "Misrepresenting income on a loan application at a borrower's request", "Providing a borrower with educational content on social media", "Ordering a credit report with borrower consent"], answer: 1 },
      { q: "Social media posts about mortgage require:", options: ["Your NMLS number on all marketing material", "Daily compliance review", "Approval only for posts with photos", "A disclaimer only on paid ads"], answer: 0 },
      { q: "When you leave a mortgage company, borrower files:", options: ["Belong to you if you originated them", "Can be shared with your new employer with borrower consent", "Belong to the company and cannot be taken with you", "Must be deleted within 30 days"], answer: 2 },
    ],
  },
  {
    id: 11,
    title: "Post-Closing: Reviews, Referrals & Refi Watch",
    subtitle: "Your closed loans are your best marketing asset",
    duration: "48 min",
    badge: "Accelerator",
    badgeColor: "#8B5CF6",
    tier: "accelerator",
    lessons: [
      { title: "The 30-60-90 Day Post-Close System", duration: "12 min" },
      { title: "Getting Reviews That Actually Build Your Pipeline", duration: "12 min" },
      { title: "The Referral Ask — Without Feeling Awkward", duration: "12 min" },
      { title: "Predictive Refi — Watching Your Past Clients", duration: "12 min" },
    ],
    quiz: [
      { q: "The best time to ask a borrower for a review is:", options: ["6 months after close", "3–7 days after closing, while the experience is fresh", "At the closing table", "Only if they bring it up first"], answer: 1 },
      { q: "The 30-60-90 post-close system is designed to:", options: ["Collect final loan documents", "Convert closed clients into a referral engine", "Remind borrowers of their payment due date", "Satisfy compliance requirements"], answer: 1 },
      { q: "A borrower is a refi candidate when:", options: ["They call asking about rates", "Market rates drop 0.5%+ below their current rate or their equity position changes significantly", "They have been in their home for 5+ years", "Their credit score improves by any amount"], answer: 1 },
      { q: "The most effective referral ask is:", options: ["'Please tell your friends about me'", "'If you know anyone buying or refinancing, I would genuinely appreciate an introduction'", "A form letter sent 1 year after close", "A paid referral arrangement"], answer: 1 },
      { q: "PredictiveRefiEngine in the Huit.AI platform:", options: ["Originates refinance loans automatically", "Monitors past client data and flags when a refi opportunity emerges", "Replaces the LO's role in refi conversations", "Pulls credit without borrower consent"], answer: 1 },
    ],
  },
  {
    id: 12,
    title: "Building a $1M/Year Mortgage Business",
    subtitle: "The math, the mindset, and the Huit.AI advantage",
    duration: "60 min",
    badge: "Elite",
    badgeColor: "#F5A623",
    tier: "elite",
    lessons: [
      { title: "The Math of a Million-Dollar Mortgage Career", duration: "15 min" },
      { title: "The Huit.AI Platform Advantage — What Top LOs Use", duration: "15 min" },
      { title: "Building Your Personal Brand at Scale", duration: "15 min" },
      { title: "The Long Game — Why the Best LOs Never Stop Learning", duration: "15 min" },
    ],
    quiz: [
      { q: "To close $1M/year in mortgage production, at an average loan of $350K you need approximately:", options: ["3 loans", "3 loans per year", "12–15 loans per year", "50+ loans per year"], answer: 2 },
      { q: "The most scalable referral source for a top producer is:", options: ["Paid internet leads", "A database of past clients systematically nurtured", "Billboard advertising", "Cold calling expired listings"], answer: 1 },
      { q: "The Huit.AI platform is designed to:", options: ["Replace the loan officer entirely", "Handle business development, follow-up, and post-close automatically so LOs focus on relationships", "Only serve enterprise mortgage companies", "Compete with Fannie Mae"], answer: 1 },
      { q: "Personal brand at scale means:", options: ["Spending $10K/month on ads", "Being so consistently known for one thing that your market thinks of you first", "Having the most followers on social media", "Only speaking at industry conferences"], answer: 1 },
      { q: "The best LOs keep learning because:", options: ["Their licenses require it", "Markets change, products evolve, and continuous improvement is the only sustainable edge", "Their managers require it", "CE credits pay well"], answer: 1 },
    ],
  },
];
