"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim()) return;
    setLoading(true);
    await fetch("/api/request-reset", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email }) });
    setSent(true); setLoading(false);
  }

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <a href="/login" style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:8, textDecoration:"none" }}>
            <div style={{ width:48, height:48, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🐝</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:"var(--text-primary)" }}>Hive Mortgage Academy</div>
          </a>
        </div>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:32 }}>
          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📬</div>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)", marginBottom:10 }}>Check your email</h2>
              <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:20 }}>If that email has an account, a reset link is on its way. Check your spam folder if you don't see it.</p>
              <a href="/login" style={{ color:"var(--honey)", fontSize:14, fontWeight:600, textDecoration:"none" }}>← Back to Sign In</a>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Reset your password</h2>
              <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:24, lineHeight:1.6 }}>Enter your email address and we'll send you a reset link.</p>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>Email Address</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="your@email.com" style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
              </div>
              <button onClick={submit} disabled={loading} style={{ width:"100%", background:loading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:loading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", marginBottom:16 }}>
                {loading ? "Sending..." : "Send Reset Link →"}
              </button>
              <div style={{ textAlign:"center" }}><a href="/login" style={{ color:"var(--text-muted)", fontSize:13, textDecoration:"none" }}>← Back to Sign In</a></div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
