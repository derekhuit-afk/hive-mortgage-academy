"use client";
import { useState } from "react";

export default function ApplyPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", nmls: "", market: "", production: "", experience: "", why: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.email || !form.why) return;
    setLoading(true);
    try {
      await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch { /* silent */ } finally { setLoading(false); }
  }

  if (submitted) return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🐝</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,5vw,40px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 16 }}>Application Received.</h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 24 }}>Derek reviews every application personally. You'll hear back within 2 business days. In the meantime, keep working the curriculum — that's what separates the serious ones.</p>
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "var(--honey)", fontWeight: 600 }}>What happens next:</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.7 }}>1. Derek reviews your application<br />2. You receive a calendar link for a 30-min call<br />3. If it's a fit, you get a detailed onboarding plan</div>
        </div>
        <a href="/dashboard" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>← Back to Dashboard</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 13, textDecoration: "none", marginBottom: 32 }}>← Hive Mortgage Academy</a>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🐝</div>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" }}>Join the Team</div>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,5vw,44px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 16 }}>Apply to Join<br /><span style={{ background: "linear-gradient(135deg,#F5A623,#FFC85C)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Derek Huit's Team</span></h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7 }}>
            LOs on this team get the full Huit.AI platform from Day 1 — 50 products, AI automation, and the systems that make the difference between surviving Year 1 and building a career. Derek reviews every application personally.
          </p>
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 40 }}>
          {[["📍","Nationwide","All licensed states welcome"],["⬡","Full Platform","All 50 Huit.AI products"],["🏔️","Direct Access","Built from Alaska mentorship"]].map(([icon,title,sub]) => (
            <div key={title} style={{ flex: 1, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 20, padding: "32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[["Full Name","name","text","John Smith"],["Email Address","email","email","john@email.com"],["Phone Number","phone","tel","(907) 555-0100"],["NMLS Number","nmls","text","#1234567"]].map(([label,field,type,ph]) => (
              <div key={field}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                <input type={type} placeholder={ph} value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          {[["Your Primary Market / State","market","text","e.g. Alaska, Texas, Florida"],["Current or Target Monthly Production","production","text","e.g. $0 (new LO) or $2M/month"]].map(([label,field,type,ph]) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
              <input type={type} placeholder={ph} value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none" }} />
            </div>
          ))}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>Years of Mortgage Experience</label>
            <select value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: form.experience ? "var(--text-primary)" : "var(--text-muted)", fontSize: 14, outline: "none" }}>
              <option value="">Select experience level</option>
              <option>New LO — licensed but not yet originated</option>
              <option>Less than 1 year</option>
              <option>1–3 years</option>
              <option>3–5 years</option>
              <option>5–10 years</option>
              <option>10+ years</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: "0.08em" }}>Why do you want to join this team? *</label>
            <textarea placeholder="Tell Derek what drives you and what you're building toward. Be specific — generic answers don't stand out." value={form.why} onChange={e => setForm(p => ({ ...p, why: e.target.value }))} rows={5} style={{ width: "100%", background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.why} style={{ width: "100%", background: (!form.name || !form.email || !form.why) ? "var(--muted)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: (!form.name || !form.email || !form.why) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "15px 24px", fontSize: 16, fontWeight: 700, cursor: (!form.name || !form.email || !form.why) ? "not-allowed" : "pointer" }}>
            {loading ? "Submitting..." : "Submit Application →"}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>Derek reviews every application personally. Expect a response within 2 business days.</p>
        </div>
      </div>
    </main>
  );
}
