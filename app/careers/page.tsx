"use client";
import { useState } from "react";

const STATES = ["AK","GA","IL","IN","MI","MT","OK","TX","WA"];

export default function CareersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nmls, setNmls] = useState("");
  const [statesLicensed, setStatesLicensed] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/careers-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          nmls: nmls.trim(),
          states_licensed: statesLicensed.trim(),
          years_experience: yearsExperience.trim(),
          message: message.trim(),
          source: "/careers",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Couldn't send right now. Please email derekhuit@gmail.com directly.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please email derekhuit@gmail.com directly.");
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--text-primary)", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--charcoal)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐝</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>Hive Mortgage Academy</span>
        </a>
        <a href="/enroll" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free →</a>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏔️</div>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Careers</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,5vw,46px)", fontWeight: 900, marginBottom: 16, lineHeight: 1.1 }}>
            Build a real career,<br />not just close loans.
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
            Derek Huit's mortgage team is built around production, technology, and senior support — not call quotas. If you've got the license and the appetite, there's a seat for you.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section style={{ padding: "32px 24px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Who You're Joining</div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75, margin: 0 }}>
              Derek Huit is a producing mortgage professional (NMLS #203980) with 18+ years in the industry and over $1 billion in career production. He runs an LO team that pairs senior-level mentorship with a structured ramp — meaning you walk in on Day 1 with the playbook, the support, and the mentorship most LOs spend a decade trying to assemble.
            </p>
          </div>
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Where We Hire</div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 14 }}>
              Derek is licensed in 9 states, and the team recruits nationwide — geography is not a disqualifier. If you're licensed in any U.S. state, we'd like to talk.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STATES.map(s => (
                <span key={s} style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", color: "var(--honey)", padding: "6px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{s}</span>
              ))}
              <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, alignSelf: "center" }}>+ nationwide for the right candidate</span>
            </div>
          </div>
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>What's Different</div>
            {[
              ["Senior mentorship from Day 1", "Direct access to Derek and the team. The playbook, the scripts, the systems — handed to you, not figured out alone."],
              ["Senior mentorship, not a call center", "Derek is in the trenches with the team. No KPI-by-Slack management style."],
              ["Production-first compensation", "Comp is built around closed loans. No quotas, no bait-and-switch overrides."],
              ["A real ramp, not sink-or-swim", "Past clients monitored for refi triggers, agents tracked, reviews automated — your book grows on a system, not on memory."],
              ["A path for new and experienced LOs", "If you're brand new with a license, we have a structured ramp. If you're producing, we have leverage to add."],
            ].map(([h, body]) => (
              <div key={h} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
                <span style={{ color: "#10B981", fontSize: 16, flexShrink: 0, marginTop: 2 }}>✓</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>{h}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{body}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>Who Fits</div>
            {[
              "Licensed (or actively pursuing licensure) NMLS Mortgage Loan Originators",
              "Self-driven — no one is going to micromanage your day",
              "Coachable — willing to use the systems and tools we provide",
              "Ethical, borrower-first orientation — payment-first methodology, not max-qualification",
              "Comfortable with technology — phone, video, AI tools as core workflow",
            ].map(line => (
              <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ color: "var(--honey)", fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry form */}
      <section style={{ padding: "16px 24px 80px", background: "var(--charcoal)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", paddingTop: 56 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, marginBottom: 8, textAlign: "center" }}>Tell us about you</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, textAlign: "center", marginBottom: 28 }}>
            Quick form. Goes straight to Derek. Not a portal — a real conversation.
          </p>

          {submitted ? (
            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 16, padding: "28px 32px", textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>Got it.</div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>Derek will reply personally within 1–2 business days. Watch your inbox (and spam folder, just in case).</p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <Field label="Full name *" value={name} onChange={setName} placeholder="Jane Smith" autoComplete="name" required />
              <Field label="Email *" value={email} onChange={setEmail} placeholder="you@example.com" type="email" autoComplete="email" required />
              <Field label="NMLS number" value={nmls} onChange={v => setNmls(v.replace(/\D/g, "").slice(0, 10))} placeholder="If licensed" inputMode="numeric" />
              <Field label="States you're licensed in" value={statesLicensed} onChange={setStatesLicensed} placeholder="AK, WA, OR" />
              <Field label="Years originating" value={yearsExperience} onChange={setYearsExperience} placeholder="0 (just licensed) / 1 / 5+" />

              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Anything we should know?</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Current situation, what you're looking for, questions..."
                maxLength={2000}
                style={{ width: "100%", background: "var(--obsidian)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 18, resize: "vertical", fontFamily: "inherit" }}
              />

              {error && (
                <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 14, color: "#EF4444", fontSize: 13 }}>{error}</div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: "100%",
                  background: canSubmit ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--muted)",
                  color: canSubmit ? "#0A0A0B" : "#64748B",
                  border: "none",
                  padding: "14px 22px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  minHeight: 48,
                }}
              >
                {submitting ? "Sending…" : "Send to Derek →"}
              </button>

              <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 14, lineHeight: 1.5 }}>
                Your information is shared only with Derek Huit and Huitai LLC for the purpose of evaluating fit. We will not sell or share your info with third parties. See our <a href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </section>

      <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
        © 2026 Huitai LLC · Derek Huit, NMLS #203980 ·{" "}
        <a href="/terms" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Terms</a>{" · "}
        <a href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Privacy</a>
      </footer>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type, autoComplete, required, inputMode }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; autoComplete?: string; required?: boolean;
  inputMode?: "numeric" | "text" | "email" | "tel";
}) {
  return (
    <>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type || "text"}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        style={{ width: "100%", background: "var(--obsidian)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, minHeight: 44 }}
      />
    </>
  );
}
