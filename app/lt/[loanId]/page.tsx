"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const MILESTONES = ["Application","Processing","Appraisal","Underwriting","Conditional Approval","Clear to Close","Closing","Funded"];

export default function BorrowerPortalPage() {
  const params = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/loans", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ loanId: params.loanId }) });
        if (res.ok) { const data = await res.json(); setLoan(data); return; }
      } catch {}
      // Fallback localStorage
      try {
        const saved = localStorage.getItem("hma_loans");
        if (saved) { const found = JSON.parse(saved).find((l:any)=>l.id===params.loanId); if (found) { setLoan(found); return; } }
      } catch {}
      setNotFound(true);
    }
    load();
  }, [params.loanId]);

  if (notFound) return <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}><div style={{ textAlign:"center", color:"white" }}><div style={{ fontSize:48, marginBottom:16 }}>🏠</div><div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:900, marginBottom:8 }}>Loan not found</div><p style={{ fontSize:14, color:"#94A3B8" }}>Ask your loan officer for a new tracking link.</p></div></main>;
  if (!loan) return <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#F5A623" }}>Loading your loan status...</div></main>;

  const current = loan.currentMilestone || 1;

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"40px 20px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px" }}>🏠</div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:900, color:"white", marginBottom:6 }}>Your Loan Status</h1>
          <p style={{ fontSize:14, color:"#94A3B8" }}>{loan.borrowerName} · {loan.propertyAddress || loan.loanType}</p>
        </div>
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:24, marginBottom:20 }}>
          {MILESTONES.map((m, i) => {
            const step = i + 1;
            const done = step < current;
            const active = step === current;
            return (
              <div key={m} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 0", borderBottom: i < MILESTONES.length-1 ? "1px solid #1E1E24" : "none" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background: done?"#10B981":active?"#F5A623":"#1E293B", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>
                  {done ? "✓" : step}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:active?700:500, color: done?"#10B981":active?"#F5A623":"#64748B" }}>{m}</div>
                  {active && <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>Current stage — your LO is working on this now</div>}
                </div>
                {active && <div style={{ fontSize:11, background:"rgba(245,166,35,0.15)", color:"#F5A623", border:"1px solid rgba(245,166,35,0.3)", padding:"3px 10px", borderRadius:100, fontWeight:700, whiteSpace:"nowrap" }}>Active</div>}
              </div>
            );
          })}
        </div>
        {loan.targetClose && <div style={{ background:"rgba(245,166,35,0.06)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:12, padding:"14px 18px", textAlign:"center" }}><div style={{ fontSize:13, color:"#F5A623", fontWeight:700 }}>Target Closing Date</div><div style={{ fontSize:18, color:"white", fontWeight:700, marginTop:4 }}>{new Date(loan.targetClose).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div></div>}
        <p style={{ color:"#4B5563", fontSize:12, textAlign:"center", marginTop:20 }}>Powered by <span style={{ color:"#F5A623" }}>Hive Mortgage Academy</span> · Built from Alaska</p>
      </div>
    </main>
  );
}
