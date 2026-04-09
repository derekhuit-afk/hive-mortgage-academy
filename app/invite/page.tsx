"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [form, setForm] = useState({ recipientEmail: "", recipientName: "", personalNote: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  async function send() {
    if (!form.recipientEmail.trim()) { setError("Enter the recipient's email."); return; }
    setError(""); setLoading(true);
    const token = localStorage.getItem("hma_token") || "";
    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to send."); setLoading(false); return; }
    setSent(true); setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText("https://hivemortgageacademy.com").then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (!student) return null;

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", padding:"60px 24px" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <a href="/dashboard" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-muted)", fontSize:13, textDecoration:"none", marginBottom:32 }}>← Dashboard</a>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🐝</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Invite a Colleague</h1>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7 }}>Know a loan officer who'd benefit from this? Send them a personal invitation. Modules 1–6 are free — no credit card required on their end.</p>
        </div>

        {/* Quick share link */}
        <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:14, padding:"16px 20px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--honey)", marginBottom:4 }}>Quick Share Link</div>
            <div style={{ fontSize:13, color:"var(--text-secondary)" }}>hivemortgageacademy.com</div>
          </div>
          <button onClick={copyLink} style={{ background:copied?"#10B981":"linear-gradient(135deg,#F5A623,#D4881A)", color:copied?"white":"#0A0A0B", border:"none", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>

        {/* Email invite form */}
        {sent ? (
          <div style={{ background:"var(--charcoal)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:32, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✉️</div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:10 }}>Invitation sent!</h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:24 }}>Your invitation to <strong>{form.recipientEmail}</strong> is on its way. It includes your personal note and a direct link to start free.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => { setSent(false); setForm({ recipientEmail:"", recipientName:"", personalNote:"" }); }} style={{ background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-primary)", borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:600, cursor:"pointer" }}>Send Another</button>
              <a href="/dashboard" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", borderRadius:10, padding:"11px 20px", fontSize:14, fontWeight:700, textDecoration:"none" }}>Back to Dashboard</a>
            </div>
          </div>
        ) : (
          <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Send a Personal Invitation</div>
            {[
              { label:"Their Email Address *", field:"recipientEmail", type:"email", ph:"colleague@email.com" },
              { label:"Their Name (optional)", field:"recipientName", type:"text", ph:"First name" },
            ].map(({ label, field, type, ph }) => (
              <div key={field} style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{label}</label>
                <input type={type} placeholder={ph} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>Personal Note (optional)</label>
              <textarea rows={3} placeholder={`e.g. "I've been using this for a week — the PaymentFirst module alone changed how I talk to borrowers."`} value={form.personalNote} onChange={e => setForm(f => ({ ...f, personalNote: e.target.value }))} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:13, outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }} />
            </div>
            {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginBottom:14 }}>{error}</div>}
            <button onClick={send} disabled={loading} style={{ width:"100%", background:loading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:loading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
              {loading ? "Sending..." : "Send Invitation →"}
            </button>
            <p style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginTop:12 }}>The invitation will include your name and personal note. CC'd to Derek.</p>
          </div>
        )}
      </div>
    </main>
  );
}
