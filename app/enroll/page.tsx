"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLANS = [
  { id: "foundation", name: "Foundation", monthly: 97, annual: 797, color: "#F5A623" },
  { id: "accelerator", name: "Accelerator", monthly: 297, annual: 2397, color: "#3B82F6" },
  { id: "elite", name: "Elite", monthly: 697, annual: 5597, color: "#8B5CF6" },
];

function EnrollForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultPlan = params.get("plan") || "foundation";
  const [plan, setPlan] = useState(defaultPlan);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [form, setForm] = useState({ name: "", email: "", nmls: "", password: "", confirm: "" });
  const [step, setStep] = useState<"account" | "payment">("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPlan = PLANS.find(p => p.id === plan) || PLANS[0];
  const price = billing === "annual" ? selectedPlan.annual : selectedPlan.monthly;

  async function handleAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.nmls || !form.password) { setError("All fields are required."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.nmls.length < 5) { setError("Please enter a valid NMLS number."); return; }
    setStep("payment");
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan, billing }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Enrollment failed. Please try again."); setLoading(false); return; }
      localStorage.setItem("hma_student", JSON.stringify(data.student));
      router.push("/dashboard?welcome=1");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", paddingTop: 80 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🐝</div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: "var(--text-primary)", fontSize: 15 }}>Hive Mortgage Academy</span>
          </a>
          <h1 className="font-display" style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Enroll Now</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Your training starts the moment you sign up.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }} className="enroll-grid">
          {/* Form */}
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
            {/* Step indicators */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
              {["Account", "Payment"].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: (step === "account" && i === 0) || (step === "payment" && i === 1) ? "linear-gradient(135deg,#F5A623,#D4881A)" : step === "payment" && i === 0 ? "#10B981" : "var(--muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#0A0A0B",
                  }}>{step === "payment" && i === 0 ? "✓" : i + 1}</div>
                  <span style={{ fontSize: 13, color: (step === "account" && i === 0) || (step === "payment" && i === 1) ? "var(--text-primary)" : "var(--text-muted)", fontWeight: 500 }}>{s}</span>
                  {i === 0 && <span style={{ color: "var(--border)", margin: "0 4px" }}>→</span>}
                </div>
              ))}
            </div>

            {step === "account" ? (
              <form onSubmit={handleAccount}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="form-grid">
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Full Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith"
                      style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Email Address *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com"
                      style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>NMLS License Number *</label>
                  <input value={form.nmls} onChange={e => setForm(f => ({ ...f, nmls: e.target.value }))} placeholder="e.g. 1234567"
                    style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Your NMLS number is required to verify your license. Find it at nmlsconsumeraccess.org.</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="form-grid">
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Password *</label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters"
                      style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Confirm Password *</label>
                    <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat password"
                      style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
                  </div>
                </div>
                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <button type="submit" style={{ width: "100%", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Continue to Payment →
                </button>
              </form>
            ) : (
              <form onSubmit={handlePayment}>
                <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <div style={{ fontSize: 13, color: "var(--honey)", fontWeight: 600, marginBottom: 4 }}>Demo Mode</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Payment processing via ZenoPay is coming soon. Click below to complete your enrollment and access your dashboard immediately.</div>
                </div>
                <div style={{ background: "var(--slate)", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{selectedPlan.name} Plan ({billing})</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>${price}/{billing === "annual" ? "yr" : "mo"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Student: {form.name}</span>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>NMLS #{form.nmls}</span>
                  </div>
                </div>
                {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
                <button type="submit" disabled={loading} style={{ width: "100%", background: loading ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                  {loading ? "Creating your account..." : "Complete Enrollment →"}
                </button>
                <button type="button" onClick={() => setStep("account")} style={{ width: "100%", background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", marginTop: 12, padding: 8 }}>← Back to account details</button>
              </form>
            )}
          </div>

          {/* Plan selector sidebar */}
          <div>
            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Your Plan</div>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id)} style={{
                  padding: "14px 16px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                  border: `1px solid ${plan === p.id ? "rgba(245,166,35,0.5)" : "var(--border)"}`,
                  background: plan === p.id ? "rgba(245,166,35,0.06)" : "var(--slate)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: plan === p.id ? "var(--honey)" : "var(--text-secondary)" }}>
                      ${billing === "annual" ? p.annual.toLocaleString() : p.monthly}/{billing === "annual" ? "yr" : "mo"}
                    </span>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: 4, marginTop: 12 }}>
                {(["monthly", "annual"] as const).map(b => (
                  <button key={b} onClick={() => setBilling(b)} style={{
                    flex: 1, padding: "8px", border: "none", borderRadius: 6, cursor: "pointer",
                    background: billing === b ? "linear-gradient(135deg,#F5A623,#D4881A)" : "transparent",
                    color: billing === b ? "#0A0A0B" : "var(--text-muted)",
                    fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                  }}>{b.charAt(0).toUpperCase() + b.slice(1)}{b === "annual" ? " (save 30%)" : ""}</button>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
              {["✅ Immediate dashboard access", "✅ All 6 modules unlocked", "✅ AI Coach 24/7", "✅ Cancel anytime"].map(f => (
                <div key={f} style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>{f}</div>
              ))}
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                Powered by ⬡ Huit.AI · Secured by ZenoPay
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .enroll-grid { grid-template-columns: 1fr !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

export default function EnrollPage() {
  return <Suspense><EnrollForm /></Suspense>;
}
