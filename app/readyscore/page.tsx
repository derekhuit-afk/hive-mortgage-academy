"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReadyScoreLOPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  const shareUrl = typeof window !== "undefined" && student
    ? `${window.location.origin}/rs/${student.id}` : "";

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  if (!student) return null;

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      <nav style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background:"none", border:"none", color:"var(--text-secondary)", cursor:"pointer", fontSize:14 }}>← Dashboard</button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎯</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"var(--text-primary)" }}>ReadyScore™</span>
        </div>
        <div style={{ width:80 }} />
      </nav>

      <div style={{ maxWidth:640, margin:"0 auto", padding:"48px 24px", textAlign:"center" }}>
        <div style={{ fontSize:11, color:"var(--honey)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:12 }}>Lead Gen Tool</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,5vw,40px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.15, marginBottom:16 }}>ReadyScore™ Borrower Assessment</h1>
        <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:32, maxWidth:480, margin:"0 auto 32px" }}>
          Share this link with anyone thinking about buying a home. They answer 8 questions, get a personalized readiness score and action plan — branded with your name and NMLS. Every completion notifies you.
        </p>

        <div style={{ background:"var(--charcoal)", border:"1px solid rgba(245,166,35,0.3)", borderRadius:20, padding:"28px 32px", marginBottom:28 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--honey)", marginBottom:8 }}>Your Branded Borrower Link</div>
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontFamily:"monospace", marginBottom:16, wordBreak:"break-all", padding:"10px 14px", background:"var(--slate)", borderRadius:8 }}>{shareUrl}</div>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={copy} style={{ background:copied?"#10B981":"linear-gradient(135deg,#F5A623,#D4881A)", color:copied?"white":"#0A0A0B", border:"none", borderRadius:10, padding:"12px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              {copied?"✓ Copied!":"🔗 Copy My Link"}
            </button>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" style={{ background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-primary)", borderRadius:10, padding:"12px 24px", fontSize:13, fontWeight:700, textDecoration:"none" }}>Preview →</a>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, textAlign:"center" }} className="feat-grid">
          {[["📱","Share anywhere","Social, text, email, website"],["🎯","8 smart questions","Credit, income, savings, timeline"],["🤖","AI action plan","Personalized next steps + your CTA"]].map(([e,t,s])=>(
            <div key={t} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:14, padding:"18px 14px" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{e}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:4 }}>{t}</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.5 }}>{s}</div>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:500px){.feat-grid{grid-template-columns:1fr!important}}`}</style>

        <div style={{ marginTop:28, padding:"16px 20px", background:"rgba(245,166,35,0.05)", border:"1px solid rgba(245,166,35,0.15)", borderRadius:14 }}>
          <div style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7 }}>
            <strong style={{ color:"var(--honey)" }}>Where to share it:</strong> LinkedIn bio, Instagram bio, email signature, Facebook posts, text to sphere contacts, business card QR code — anywhere a potential borrower might see it.
          </div>
        </div>
      </div>
    </main>
  );
}
