"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" }) : "—";

export default function PublicLetterPage() {
  const params = useParams();
  const [letter, setLetter] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // Try Supabase first
      try {
        const res = await fetch(`/api/letters?id=${params?.letterId}`);
        if (res.ok) { const data = await res.json(); setLetter(data); return; }
      } catch {}
      // Fallback to localStorage (same device)
      try {
        const saved = localStorage.getItem("hma_letters");
        if (saved) {
          const found = JSON.parse(saved).find((l: any) => l.id === params?.letterId);
          if (found) { setLetter(found); return; }
        }
      } catch {}
      setNotFound(true);
    }
    load();
  }, [params.letterId]);

  if (notFound) return (
    <main style={{ minHeight:"100vh", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:900, color:"#1a1a2e", marginBottom:8 }}>Letter not found</div>
        <p style={{ fontSize:14, color:"#666", maxWidth:340, margin:"0 auto" }}>This letter link may have expired. Contact your loan officer for an updated letter.</p>
      </div>
    </main>
  );
  if (!letter) return <main style={{ minHeight:"100vh", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#D4881A" }}>Loading...</div></main>;

  const expired = letter.expiresDate && new Date(letter.expiresDate) < new Date();

  return (
    <main style={{ minHeight:"100vh", background:"#f0f0f0", padding:"40px 20px" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        {expired && <div style={{ background:"#FEF2F2", border:"1px solid #FCA5A5", borderRadius:10, padding:"12px 16px", marginBottom:16, textAlign:"center", fontSize:13, color:"#DC2626", fontWeight:600 }}>⚠️ This pre-approval has expired. Contact your loan officer for an updated letter.</div>}
        <div style={{ background:"white", borderRadius:12, padding:"48px 56px", fontFamily:"Georgia,serif", color:"#1a1a2e", boxShadow:"0 2px 20px rgba(0,0,0,0.1)" }}>
          <div style={{ borderBottom:"3px solid #D4881A", paddingBottom:20, marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div><div style={{ fontSize:26, fontWeight:900, color:"#D4881A", marginBottom:4 }}>Pre-Approval Letter</div><div style={{ fontSize:13, color:"#666" }}>Conditional Mortgage Pre-Approval</div></div>
            <div style={{ textAlign:"right" }}><div style={{ fontSize:12, color:"#666" }}>{fmt(letter.createdAt)}</div><div style={{ fontSize:12, color:"#888", marginTop:3 }}>Ref: {(letter.id || "").toUpperCase()}</div></div>
          </div>
          <p style={{ fontSize:14, marginBottom:16, color:"#333", lineHeight:1.7 }}>This letter confirms that <strong>{letter.borrowerName}{letter.coborName ? ` and ${letter.coborName}` : ""}</strong> {letter.coborName?"have":"has"} been pre-approved for a <strong>{letter.loanType}</strong> mortgage loan, subject to conditions herein.</p>
          <div style={{ background:"#FFF8EE", border:"2px solid #F5A623", borderRadius:12, padding:"20px 24px", margin:"24px 0", display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[["Maximum Purchase Price",`$${parseInt(letter.maxPrice||0).toLocaleString()}`],["Loan Program",letter.loanType],["Property Address",letter.propertyAddress||"To Be Determined"],["Approval Expires",fmt(letter.expiresDate)]].map(([l,v])=>(
              <div key={l}><div style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4, fontFamily:"Arial,sans-serif" }}>{l}</div><div style={{ fontSize:15, fontWeight:700 }}>{v}</div></div>
            ))}
          </div>
          <p style={{ fontSize:13, color:"#555", lineHeight:1.7 }}>This pre-approval is based on information provided by the applicant(s) and is subject to verification of income, assets, employment, and credit, as well as a satisfactory property appraisal. This letter does not constitute a commitment to lend.</p>
          {letter.loNote && <p style={{ fontSize:14, color:"#333", marginTop:12 }}>{letter.loNote}</p>}
          <div style={{ borderTop:"1px solid #ddd", paddingTop:24, marginTop:24, display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div><div style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontFamily:"Arial,sans-serif" }}>Loan Officer</div><div style={{ fontSize:16, fontWeight:700 }}>{letter.loName || "Your Loan Officer"}</div>{letter.loNmls && <div style={{ fontSize:13, color:"#666" }}>NMLS #{letter.loNmls}</div>}{letter.loEmail && <div style={{ fontSize:13, color:"#D4881A" }}>{letter.loEmail}</div>}</div>
            {letter.agentName && <div><div style={{ fontSize:12, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontFamily:"Arial,sans-serif" }}>Buyer's Agent</div><div style={{ fontSize:16, fontWeight:700 }}>{letter.agentName}</div>{letter.agentBrokerage && <div style={{ fontSize:13, color:"#666" }}>{letter.agentBrokerage}</div>}</div>}
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:20 }}>
          <button onClick={() => window.print()} style={{ background:"#D4881A", color:"white", border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>🖨️ Print / Save PDF</button>
        </div>
        <style>{`@media print{button{display:none!important}}`}</style>
      </div>
    </main>
  );
}
