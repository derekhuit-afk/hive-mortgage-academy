"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { saveAndSync, loadTool } from "@/lib/hooks/useToolSync";

const LOCAL_KEY = "hma_pitch";
const TOOL = "pitch";

interface PitchData {
  who: string;
  whatNiche: string;
  proofPoint: string;
  uniqueValue: string;
  callToAction: string;
}

const DEFAULTS: PitchData = { who: "", whatNiche: "", proofPoint: "", uniqueValue: "", callToAction: "" };

export default function PitchPage() {
  const [data, setData] = useState<PitchData>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [variant, setVariant] = useState<"warm" | "professional" | "direct">("warm");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setHydrated(true);
    loadTool(TOOL, LOCAL_KEY).then(r => { if (r) setData(r); });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveAndSync(LOCAL_KEY, TOOL, data);
  }, [data, hydrated]);

  const update = (k: keyof PitchData, v: string) => setData(p => ({ ...p, [k]: v }));

  const pitch = useMemo(() => buildPitch(data, variant), [data, variant]);
  const wordCount = pitch.split(/\s+/).filter(Boolean).length;
  const seconds = Math.round(wordCount / 2.5); // ~150 wpm spoken

  const copyToClipboard = () => navigator.clipboard?.writeText(pitch);

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>The 30-Second Move</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>Elevator Pitch Builder</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            When someone asks &quot;what do you do,&quot; you have 15-30 seconds before they tune out. The LOs who freeze on this question lose dozens of opportunities a year.
          </p>
        </div>

        <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          {/* INPUTS */}
          <section style={panel}>
            <h2 style={panelH}>Build Yours — Five Pieces</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, marginBottom: 18, lineHeight: 1.55 }}>
              Fill these in your own words. The pitch on the right rebuilds in real time.
            </p>

            <Field label="1. Who you help"
                   hint='Be specific. "Anyone buying a home" is too broad. "First-time buyers in Anchorage" or "veterans across the 9 states I&apos;m licensed in" is better.'>
              <input value={data.who} onChange={e => update("who", e.target.value)}
                placeholder="first-time buyers in Anchorage"
                style={inputStyle} />
            </Field>

            <Field label="2. The niche or specialization (optional but recommended)"
                   hint='What do you do better than the average LO?'>
              <input value={data.whatNiche} onChange={e => update("whatNiche", e.target.value)}
                placeholder="people with self-employed income who don't show much on tax returns"
                style={inputStyle} />
            </Field>

            <Field label="3. A specific proof point"
                   hint="Numbers, programs, or experience. Concrete &gt; vague.">
              <input value={data.proofPoint} onChange={e => update("proofPoint", e.target.value)}
                placeholder="I close in under 25 days on average and I&apos;m licensed in 9 states"
                style={inputStyle} />
            </Field>

            <Field label="4. Your unique value (1 sentence)"
                   hint="The thing that makes you different. Don't say 'low rates' or 'great service' — those are noise.">
              <input value={data.uniqueValue} onChange={e => update("uniqueValue", e.target.value)}
                placeholder="I answer my phone evenings and weekends and explain everything in plain English"
                style={inputStyle} />
            </Field>

            <Field label="5. The next-step ask"
                   hint="What do they do if they're interested?">
              <input value={data.callToAction} onChange={e => update("callToAction", e.target.value)}
                placeholder="just save my number — Derek, NMLS #203980 — for whenever it comes up"
                style={inputStyle} />
            </Field>
          </section>

          {/* OUTPUT */}
          <section style={{ position: "sticky", top: 20 }}>
            <div style={panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 6 }}>
                <h2 style={panelH}>Your Pitch</h2>
                <div style={{ fontSize: 11, color: seconds <= 30 ? "#10B981" : seconds <= 45 ? "var(--honey)" : "#EF4444", fontWeight: 700 }}>
                  {wordCount} words / ~{seconds}s spoken
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                <Tone active={variant === "warm"} onClick={() => setVariant("warm")}>Warm</Tone>
                <Tone active={variant === "professional"} onClick={() => setVariant("professional")}>Professional</Tone>
                <Tone active={variant === "direct"} onClick={() => setVariant("direct")}>Direct</Tone>
              </div>

              <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12, padding: 18, fontSize: 15, lineHeight: 1.7, color: "var(--text-primary)", minHeight: 140, whiteSpace: "pre-wrap" }}>
                {pitch || <span style={{ color: "var(--text-muted)" }}>Fill in the fields on the left to see your pitch.</span>}
              </div>

              <button onClick={copyToClipboard} disabled={!pitch.trim()}
                style={{ marginTop: 12, background: pitch.trim() ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--charcoal)", color: pitch.trim() ? "#0A0A0B" : "var(--text-muted)", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: pitch.trim() ? "pointer" : "not-allowed" }}>
                Copy to clipboard
              </button>
            </div>

            <div style={{ ...panel, marginTop: 14, background: "rgba(245,166,35,0.05)" }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Practice tips</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                <li>Say it out loud 30 times until it sounds natural, not memorized.</li>
                <li>Record yourself once. Listen. Cut anything that sounds like a script.</li>
                <li>Test it on family before you test it on a partner.</li>
                <li>Once it&apos;s natural, the version you say in person is shorter than the written one. That&apos;s fine.</li>
              </ul>
            </div>
          </section>
        </div>

        <style jsx>{`
          @media (max-width: 880px) { .grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </main>
    </div>
  );
}

function buildPitch(d: PitchData, variant: "warm" | "professional" | "direct"): string {
  const parts: string[] = [];

  // Variant intros
  if (d.who.trim()) {
    if (variant === "warm") parts.push(`I help ${d.who.trim()} get into homes the right way.`);
    else if (variant === "professional") parts.push(`I'm a mortgage loan officer working with ${d.who.trim()}.`);
    else parts.push(`I work with ${d.who.trim()}.`);
  }

  if (d.whatNiche.trim()) {
    if (variant === "warm") parts.push(`Specifically, I focus on ${d.whatNiche.trim()} — usually scenarios most lenders shy away from.`);
    else if (variant === "professional") parts.push(`My focus is ${d.whatNiche.trim()}.`);
    else parts.push(`Specifically: ${d.whatNiche.trim()}.`);
  }

  if (d.proofPoint.trim()) {
    if (variant === "warm") parts.push(`A few specifics — ${d.proofPoint.trim()}.`);
    else if (variant === "professional") parts.push(`In practice, ${d.proofPoint.trim()}.`);
    else parts.push(`The proof: ${d.proofPoint.trim()}.`);
  }

  if (d.uniqueValue.trim()) {
    if (variant === "warm") parts.push(`What I do differently is — ${d.uniqueValue.trim()}.`);
    else if (variant === "professional") parts.push(`What sets me apart: ${d.uniqueValue.trim()}.`);
    else parts.push(`The difference: ${d.uniqueValue.trim()}.`);
  }

  if (d.callToAction.trim()) {
    if (variant === "warm") parts.push(`So ${d.callToAction.trim()}.`);
    else if (variant === "professional") parts.push(`Best next step: ${d.callToAction.trim()}.`);
    else parts.push(`If you ever need it — ${d.callToAction.trim()}.`);
  }

  return parts.join(" ");
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{label}</div>
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, lineHeight: 1.5 }}>{hint}</div>}
      {children}
    </div>
  );
}

function Tone({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--honey)" : "var(--ink)",
      color: active ? "#0A0A0B" : "var(--text-secondary)",
      border: "1px solid " + (active ? "var(--honey)" : "var(--border)"),
      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
    }}>{children}</button>
  );
}

const inputStyle = { width: "100%", background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" };
const panel = { background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 };
const panelH = { fontSize: 12, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" as const, margin: 0 };

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
