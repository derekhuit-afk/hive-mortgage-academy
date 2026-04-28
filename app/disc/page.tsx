"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Style {
  key: "D" | "I" | "S" | "C";
  label: string;
  fullName: string;
  color: string;
  cues: string[];
  whatTheyValue: string;
  whatTheyDislike: string;
  loAdjustments: string[];
  pitfalls: string;
  examplePhrase: string;
}

const STYLES: Style[] = [
  {
    key: "D", label: "Driver", fullName: "Direct / Dominance", color: "#EF4444",
    cues: [
      "Speaks fast, jumps to the point, often interrupts",
      "Asks 'what's the bottom line' or 'how soon can we close'",
      "Frustrated by long explanations — wants results, not theory",
      "Decisive and confident — comfortable with risk",
      "Time-conscious — checks the clock, watches the door",
    ],
    whatTheyValue: "Speed, decisiveness, and being treated like a peer who can handle the answer.",
    whatTheyDislike: "Being slowed down. Excessive hand-holding. Anything that feels like a sales pitch.",
    loAdjustments: [
      "Lead with the answer, not the explanation. Numbers first, then context only if asked.",
      "Use bullet points and short sentences. No fluff.",
      "Confirm next steps and timelines explicitly. They want to see momentum.",
      "Don't oversell — they'll tune out. Be confident and let them decide.",
    ],
    pitfalls: "Don't take their bluntness personally. Don't try to slow them down for your own comfort.",
    examplePhrase: "\"Bottom line: 30-day close, here's the rate, here's the payment, ready when you are.\"",
  },
  {
    key: "I", label: "Influencer", fullName: "Inspiring / Influencing", color: "#F5A623",
    cues: [
      "Warm, talkative, story-driven",
      "Asks about you — your kids, your dog, your weekend",
      "Decisions feel emotional and relational, not analytical",
      "Optimistic, big-picture, sometimes glosses over details",
      "Loves shared excitement about the home",
    ],
    whatTheyValue: "Connection, enthusiasm, and feeling seen as a person.",
    whatTheyDislike: "Cold transactional energy. Being rushed past their stories. Numbers without context.",
    loAdjustments: [
      "Spend the first few minutes on rapport before transitioning to the loan.",
      "Use stories — 'I worked with another family in your situation' lands better than statistics.",
      "Match their energy. Show authentic excitement about their plans.",
      "Confirm details in writing because they may agree verbally and forget specifics later.",
    ],
    pitfalls: "Don't assume agreement means commitment. Get the next step pinned down concretely.",
    examplePhrase: "\"This is exactly the kind of move that pays off in 5 years — let me show you how the numbers work for you specifically.\"",
  },
  {
    key: "S", label: "Steady", fullName: "Steady / Supportive", color: "#10B981",
    cues: [
      "Quiet, asks careful questions, takes notes",
      "Wants to think it over, talk to spouse, sleep on it",
      "Loyal — once they trust you, they don't shop around",
      "Risk-averse — concerned about what could go wrong",
      "Patient, thoughtful, doesn't push back even when uncomfortable",
    ],
    whatTheyValue: "Stability, predictability, and feeling they are in good hands.",
    whatTheyDislike: "Pressure. Fast-talking. Feeling rushed or pushed. Surprises during the process.",
    loAdjustments: [
      "Slow down. Repeat key information. Encourage their questions even if they seem hesitant.",
      "Outline the entire process upfront so they know what's coming.",
      "Give them space to talk it over with their spouse or trusted person — don't push for an answer in the call.",
      "Schedule the next touchpoint explicitly so they're not waiting to hear from you.",
    ],
    pitfalls: "Their silence is not always agreement. Their hesitation is not always doubt. Ask open-ended questions to surface concerns.",
    examplePhrase: "\"Take all the time you need to talk this through. I'll send you the numbers to look at, and let's plan to talk Friday.\"",
  },
  {
    key: "C", label: "Conscientious", fullName: "Conscientious / Cautious", color: "#3B82F6",
    cues: [
      "Methodical, asks specific clarifying questions",
      "Wants documentation, comparison spreadsheets, sources",
      "Skeptical of anything that sounds 'too good'",
      "Cares about accuracy, fairness, and getting all the facts",
      "May go silent for days while researching independently",
    ],
    whatTheyValue: "Accuracy, transparency, and the ability to verify your claims independently.",
    whatTheyDislike: "Hype. Pressure. Vague answers. Anything that feels like marketing instead of information.",
    loAdjustments: [
      "Lead with data and documentation. 'Here are three programs with their actual rates and fees side-by-side.'",
      "Be precise. If you don't know something, say so and find out — never guess.",
      "Acknowledge their independent research. 'You'll likely see X online — here's how that compares to what we can actually deliver.'",
      "Send written follow-ups with detail. They'll re-read and analyze.",
    ],
    pitfalls: "Don't oversimplify or skip detail to 'save them time' — they want the detail. Don't pressure for a decision; they need their own pace to verify.",
    examplePhrase: "\"Here's the spreadsheet with three program comparisons, all the fees broken out, and the source on rate data. Take your time, and let me know what questions come up.\"",
  },
];

export default function DiscPage() {
  const [active, setActive] = useState<Style["key"]>("D");
  const [quizMode, setQuizMode] = useState(false);
  const cur = STYLES.find(s => s.key === active)!;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Communication Style Trainer</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
            Reading the Room
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            Borrowers don&apos;t all communicate the same way. The four styles below are observable patterns —
            not a personality test, not a category to put people in. The skill is recognizing which signals you&apos;re seeing in the moment and adjusting how YOU
            communicate, not what loan you offer.
          </p>
        </div>

        {/* Important framing */}
        <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.20)", borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--honey)" }}>Read this first: </strong>
          The right loan, the right terms, and the right qualification standards are the same for every borrower regardless of communication style.
          What changes is the pace, format, and emphasis of your delivery. If you find yourself recommending different products or terms based on
          how someone communicates — stop. That&apos;s a fair lending issue, not a sales technique.
        </div>

        {/* Style picker */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {STYLES.map(s => (
            <button key={s.key} onClick={() => { setActive(s.key); setQuizMode(false); }}
              style={{
                background: active === s.key ? s.color : "var(--charcoal)",
                color: active === s.key ? "#0A0A0B" : "var(--text-secondary)",
                border: `1px solid ${active === s.key ? s.color : "var(--border)"}`,
                borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>
              <span style={{ fontWeight: 900 }}>{s.key}</span> — {s.label}
            </button>
          ))}
          <button onClick={() => setQuizMode(true)}
            style={{
              background: quizMode ? "var(--honey)" : "var(--charcoal)",
              color: quizMode ? "#0A0A0B" : "var(--text-secondary)",
              border: `1px solid ${quizMode ? "var(--honey)" : "var(--border)"}`,
              borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginLeft: "auto",
            }}>
            Recognition Quiz →
          </button>
        </div>

        {!quizMode ? <StyleDetail style={cur} /> : <RecognitionQuiz />}
      </main>
    </div>
  );
}

function StyleDetail({ style: s }: { style: Style }) {
  return (
    <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
      <div>
        <div style={{ ...panel, borderColor: s.color + "55", marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: s.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{s.fullName}</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: "'Playfair Display',serif", color: "var(--text-primary)", marginBottom: 12 }}>{s.key} — {s.label}</h2>

          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>How you spot them</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {s.cues.map((c, i) => <li key={i} style={{ marginBottom: 4 }}>{c}</li>)}
          </ul>
        </div>

        <div style={panel}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>What they value</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.whatTheyValue}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>What they dislike</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.whatTheyDislike}</div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ ...panel, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>How YOU adjust</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7 }}>
            {s.loAdjustments.map((a, i) => <li key={i} style={{ marginBottom: 6 }}>{a}</li>)}
          </ul>
        </div>

        <div style={{ ...panel, marginBottom: 14, background: "rgba(245,166,35,0.05)" }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Example phrasing</div>
          <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, fontStyle: "italic" }}>{s.examplePhrase}</div>
        </div>

        <div style={{ ...panel, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Pitfalls</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.pitfalls}</div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 880px) { .grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

interface QuizQ { scenario: string; correctKey: Style["key"]; explanation: string; }
const QUIZ: QuizQ[] = [
  { scenario: "On the first call, the borrower interrupts your introduction with: 'I just need to know what rate you can do, when we can close, and how much I'll need to bring to the table.'", correctKey: "D", explanation: "Direct, time-conscious, results-only language. Lead with answers, skip the buildup." },
  { scenario: "The borrower spends 5 minutes telling you about their wedding, their dog, and how excited they are about the kitchen. Then asks 'so do you think we can make this work?'", correctKey: "I", explanation: "Story-driven, emotional, relational. Match the energy briefly, then anchor the next step concretely." },
  { scenario: "The borrower replies to your initial email with three follow-up emails over a week, each containing detailed questions about specific line items and citing online sources.", correctKey: "C", explanation: "Methodical, source-checking, detail-oriented. Reply with documentation, sources, and accept their pace." },
  { scenario: "After the call, the borrower says 'I'd like to talk this over with my husband and let you know in a couple of days.' They've asked few questions and seemed quietly attentive.", correctKey: "S", explanation: "Steady — careful, deliberate, doesn't want pressure. Schedule the follow-up explicitly, send written summary, give them space." },
  { scenario: "The Realtor introduces the borrower with 'they want to close fast and they're not interested in doing a bunch of education.' On the call the borrower confirms: 'I've done this twice. Just send me what I need.'", correctKey: "D", explanation: "Confident, decisive, time-pressed. Give them the doc list, confirm timeline, move." },
  { scenario: "The borrower asks for a written rate sheet, then for the same numbers in spreadsheet form, then sends you a screenshot of a competitor's quote with annotations.", correctKey: "C", explanation: "Conscientious — they want side-by-side analysis. Build that comparison transparently." },
];

function RecognitionQuiz() {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState<Style["key"] | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ[idx];
  const submit = (k: Style["key"]) => {
    setPick(k);
    if (k === q.correctKey) setScore(s => s + 1);
  };
  const next = () => {
    if (idx === QUIZ.length - 1) setDone(true);
    else { setIdx(i => i + 1); setPick(null); }
  };
  const reset = () => { setIdx(0); setPick(null); setScore(0); setDone(false); };

  if (done) {
    return (
      <div style={panel}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>You scored {score}/{QUIZ.length}</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.6 }}>
          The point of the quiz isn&apos;t to be right every time. Real borrowers blend styles. The point is recognizing the dominant signal in the moment so you adjust your delivery.
        </p>
        <button onClick={reset} style={ctaPrimary}>Try again</button>
      </div>
    );
  }

  return (
    <div style={panel}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Question {idx + 1} of {QUIZ.length}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Score: {score}/{idx + (pick ? 1 : 0)}</div>
      </div>

      <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, marginBottom: 18, fontSize: 15, color: "var(--text-primary)", lineHeight: 1.7 }}>
        {q.scenario}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 16 }}>
        {STYLES.map(s => {
          const isPicked = pick === s.key;
          const isCorrect = pick && s.key === q.correctKey;
          let bg = "var(--ink)", border = "var(--border)", color = "var(--text-secondary)";
          if (pick) {
            if (isCorrect) { bg = "rgba(16,185,129,0.20)"; border = "#10B981"; color = "#10B981"; }
            else if (isPicked && !isCorrect) { bg = "rgba(239,68,68,0.20)"; border = "#EF4444"; color = "#EF4444"; }
          }
          return (
            <button key={s.key} onClick={() => !pick && submit(s.key)} disabled={!!pick}
              style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 700, cursor: pick ? "default" : "pointer", fontFamily: "inherit" }}>
              {s.key} — {s.label}
            </button>
          );
        })}
      </div>

      {pick && (
        <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.20)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            {pick === q.correctKey ? "Right" : `Closer answer was ${q.correctKey}`}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{q.explanation}</div>
        </div>
      )}

      {pick && (
        <button onClick={next} style={ctaPrimary}>
          {idx === QUIZ.length - 1 ? "See your score →" : "Next →"}
        </button>
      )}
    </div>
  );
}

const panel = { background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 };
const ctaPrimary = { background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" };

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
