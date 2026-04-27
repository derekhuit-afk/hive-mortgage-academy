"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC","PR","VI","GU"
];

// Versions stamped into the consent log so we always know what the user
// agreed to. Bump when the policy materially changes.
const TERMS_VERSION = "2026-04-26-free";
const PRIVACY_VERSION = "2026-04-26-free";

export default function EnrollPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nmls, setNmls] = useState("");
  const [statesOpen, setStatesOpen] = useState(false);
  const [stateLicenses, setStateLicenses] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedComms, setAgreedComms] = useState(false);
  const [recruitingOptIn, setRecruitingOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = pwConfirm.length === 0 || password === pwConfirm;
  const canSubmit =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    password.length >= 8 &&
    password === pwConfirm &&
    agreedTerms &&
    agreedComms &&
    !submitting;

  function toggleState(s: string) {
    setStateLicenses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          nmls: nmls.trim(),
          state_licenses: stateLicenses,
          recruiting_opt_in: recruitingOptIn,
          password,
          terms_version: TERMS_VERSION,
          privacy_version: PRIVACY_VERSION,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't create your account. Please try again.");
        setSubmitting(false);
        return;
      }
      localStorage.setItem("hma_student", JSON.stringify(data.student));
      if (data.token) {
        localStorage.setItem("hma_token", data.token);
        localStorage.setItem("hma_session_token", data.token);
      }
      router.push("/dashboard?welcome=1");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", color: "var(--text-primary)", padding: "48px 20px", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <a href="/" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back to home</a>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🐝</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800 }}>Hive Mortgage Academy</div>
        </div>

        <h1 style={{ fontSize: "clamp(26px,5vw,32px)", fontWeight: 900, margin: "12px 0 6px", lineHeight: 1.15, fontFamily: "'Playfair Display',serif" }}>Create your free account</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          All 12 modules. All 11 LO tools. Unlimited AI Coach. No credit card. Free forever.
        </p>

        <form onSubmit={submit} noValidate>
          {/* Name */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Full name *</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
            style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, minHeight: 44 }}
          />

          {/* Email */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Email *</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            required
            style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, minHeight: 44 }}
          />

          {/* NMLS optional */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            NMLS number <span style={{ color: "#64748B", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional, if you have one</span>
          </label>
          <input
            value={nmls}
            onChange={e => setNmls(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="e.g. 1234567"
            inputMode="numeric"
            style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, minHeight: 44 }}
          />

          {/* States dropdown */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            State licenses <span style={{ color: "#64748B", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
          </label>
          <button
            type="button"
            onClick={() => setStatesOpen(o => !o)}
            style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: stateLicenses.length ? "white" : "#64748B", fontSize: 14, textAlign: "left", cursor: "pointer", boxSizing: "border-box", marginBottom: statesOpen ? 6 : 14, minHeight: 44 }}
          >
            {stateLicenses.length ? `${stateLicenses.length} selected — ${stateLicenses.join(", ")}` : "None / pre-licensure"} ▾
          </button>
          {statesOpen && (
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: 10, marginBottom: 14, display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 6 }} className="states-grid">
              {ALL_STATES.map(s => {
                const on = stateLicenses.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleState(s)}
                    style={{ background: on ? "#F5A623" : "transparent", color: on ? "#0A0A0B" : "var(--text-secondary)", border: `1px solid ${on ? "#F5A623" : "var(--border)"}`, borderRadius: 6, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", minHeight: 36 }}>
                    {s}
                  </button>
                );
              })}
              <style>{`@media(max-width:480px){.states-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}}`}</style>
            </div>
          )}

          {/* Password */}
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Password * <span style={{ color: "#64748B", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— at least 8 characters</span>
          </label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            required
            style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, minHeight: 44 }}
          />
          <input
            value={pwConfirm}
            onChange={e => setPwConfirm(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Confirm password"
            required
            style={{ width: "100%", background: "var(--charcoal)", border: `1px solid ${passwordsMatch ? "var(--border)" : "rgba(239,68,68,0.5)"}`, borderRadius: 10, padding: "12px 14px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: passwordsMatch ? 18 : 4, minHeight: 44 }}
          />
          {!passwordsMatch && (
            <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 14 }}>Passwords don't match.</div>
          )}

          {/* Required consents — both must be checked */}
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 12 }}>
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} style={{ marginTop: 3, minWidth: 18, minHeight: 18, cursor: "pointer", accentColor: "#F5A623" }} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                I agree to the <a href="/terms" target="_blank" rel="noopener" style={{ color: "var(--honey)", textDecoration: "underline" }}>Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener" style={{ color: "var(--honey)", textDecoration: "underline" }}>Privacy Policy</a>. *
              </span>
            </label>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={agreedComms} onChange={e => setAgreedComms(e.target.checked)} style={{ marginTop: 3, minWidth: 18, minHeight: 18, cursor: "pointer", accentColor: "#F5A623" }} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                I understand Hive Mortgage Academy is a free training program operated by Huitai LLC, and I may receive periodic emails about course content, new modules, and updates. I can unsubscribe at any time. *
              </span>
            </label>
          </div>

          {/* Optional recruiting opt-in */}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", background: recruitingOptIn ? "rgba(245,166,35,0.06)" : "transparent", border: `1px solid ${recruitingOptIn ? "rgba(245,166,35,0.3)" : "var(--border)"}`, borderRadius: 12, padding: "14px 18px", marginBottom: 22, transition: "all 0.2s" }}>
            <input type="checkbox" checked={recruitingOptIn} onChange={e => setRecruitingOptIn(e.target.checked)} style={{ marginTop: 3, minWidth: 18, minHeight: 18, cursor: "pointer", accentColor: "#F5A623" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: "white" }}>Optional:</strong> I'm open to learning about loan officer career opportunities at Derek Huit's mortgage team. You can change this any time.
            </span>
          </label>

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
            {submitting ? "Creating your account…" : "Start Free →"}
          </button>

          <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 14, textAlign: "center" }}>
            Already have an account? <a href="/login" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Sign in</a>
          </p>
        </form>
      </div>
    </main>
  );
}
