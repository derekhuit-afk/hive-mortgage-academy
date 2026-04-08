"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid email or password."); setLoading(false); return; }
      localStorage.setItem("hma_student", JSON.stringify(data.student));
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>🐝</div>
            <div>
              <div className="font-display" style={{ fontWeight: 700, fontSize: 20, color: "var(--text-primary)" }}>Hive Mortgage Academy</div>
              <div style={{ fontSize: 11, color: "var(--honey)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Student Portal</div>
            </div>
          </a>
        </div>

        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28 }}>Sign in to access your training dashboard.</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com" required
                style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "var(--honey)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Your password" required
                style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }}
                onFocus={e => (e.target.style.borderColor = "var(--honey)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%",
              background: loading ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)",
              color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px",
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            }}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Don't have an account? </span>
            <a href="/enroll" style={{ fontSize: 13, color: "var(--honey)", fontWeight: 600, textDecoration: "none" }}>Enroll Now →</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by ⬡ Huit.AI</span>
        </div>
      </div>
    </main>
  );
}
