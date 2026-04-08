"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TIER_INFO: Record<string, { label: string; price: string; color: string; modules: string }> = {
  free: { label: "Free", price: "Free forever", color: "#10B981", modules: "Modules 1–3" },
  foundation: { label: "Foundation", price: "$97/mo", color: "#3B82F6", modules: "Modules 1–6" },
  accelerator: { label: "Accelerator", price: "$297/mo", color: "#8B5CF6", modules: "Modules 1–10" },
  elite: { label: "Elite", price: "$697/mo", color: "#F5A623", modules: "All 12 Modules" },
};

function EnrollForm() {
  const router = useRouter();
  const params = useSearchParams();
  const tierParam = params.get("tier") || "free";
  const [tier, setTier] = useState(tierParam);
  const [form, setForm] = useState({ name: "", email: "", nmls_number: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const info = TIER_INFO[tier] || TIER_INFO.free;

  async function handleSubmit() {
    if (!form.name || !form.email || !form.password) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: tier }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Enrollment failed."); return; }
      localStorage.setItem("hma_student", JSON.stringify(data.student));
      router.push("/dashboard?welcome=1");
    } catch { setError("Something went wrong. Please try again."); } finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 32 }}>← Back to home</a>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>🐝</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "var(--text-primary)", marginBottom: 8 }}>Start Your Training</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Create your account and begin immediately.</p>
        </div>

        {/* Tier selector */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4 }}>
          {Object.entries(TIER_INFO).map(([key, val]) => (
            <button key={key} onClick={() => setTier(key)} style={{ padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", background: tier === key ? `${val.color}20` : "transparent", outline: tier === key ? `1px solid ${val.color}50` : "none", transition: "all 0.2s" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: tier === key ? val.color : "var(--text-muted)" }}>{val.label}</div>
              <div style={{ fontSize: 10, color: tier === key ? val.color : "var(--text-muted)", opacity: 0.8 }}>{val.price}</div>
            </button>
          ))}
        </div>

        <div style={{ background: `${info.color}10`, border: `1px solid ${info.color}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: info.color }}>{info.label} Plan — {info.price}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{info.modules} unlocked immediately</div>
          </div>
          {tier === "free" && <div style={{ fontSize: 11, background: info.color, color: "white", padding: "3px 9px", borderRadius: 100, fontWeight: 700 }}>No card needed</div>}
        </div>

        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
          {[["Full Name","name","text","Derek Huit",true],["Email Address","email","email","derek@email.com",true],["NMLS Number (optional)","nmls_number","text","#1234567",false],["Password","password","password","Min 8 characters",true]].map(([label,field,type,ph,req]) => (
            <div key={String(field)} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>{String(label)} {req ? "*" : ""}</label>
              <input type={String(type)} placeholder={String(ph)} value={(form as any)[String(field)]} onChange={e => setForm(p => ({ ...p, [String(field)]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          ))}
          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Creating account..." : tier === "free" ? "Start Free →" : `Enroll in ${info.label} →`}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 14 }}>Already have an account? <a href="/login" style={{ color: "var(--honey)", textDecoration: "none" }}>Sign in →</a></p>
        </div>
      </div>
    </main>
  );
}

export default function EnrollPage() {
  return <Suspense><EnrollForm /></Suspense>;
}
