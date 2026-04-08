"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PublicHivePassPage() {
  const params = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.userId) { setLoading(false); return; }
    fetch(`/api/certificate?userId=${params.userId}`)
      .then(r => r.json()).then(data => { setCert(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.userId]);

  const year = new Date().getFullYear();
  if (loading) return <main style={{ minHeight:"100vh", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#D4881A" }}>Loading...</div></main>;
  if (!cert?.name) return (
    <main style={{ minHeight:"100vh", background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:48, marginBottom:16 }}>🐝</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:900, color:"#1a1a2e", marginBottom:8 }}>HivePass not found</div>
        <p style={{ fontSize:14, color:"#666" }}>This credential may not be issued yet.</p></div>
    </main>
  );

  return (
    <main style={{ minHeight:"100vh", background:"#f0f0f0", padding:"40px 20px" }}>
      <div style={{ maxWidth:600, margin:"0 auto" }}>
        <div style={{ background:"white", borderRadius:16, padding:"48px 52px", boxShadow:"0 4px 30px rgba(0,0,0,0.1)", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:14 }}>🐝</div>
          <div style={{ fontSize:11, color:"#D4881A", fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:8 }}>Hive Mortgage Academy</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:36, fontWeight:900, color:"#1a1a2e", marginBottom:8 }}>HivePass™</div>
          <div style={{ fontSize:14, color:"#666", marginBottom:20 }}>This certifies that</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:30, fontWeight:900, color:"#D4881A", marginBottom:8 }}>{cert.name}</div>
          {cert.nmls_number && <div style={{ fontSize:13, color:"#888", marginBottom:16 }}>NMLS #{cert.nmls_number}</div>}
          <div style={{ fontSize:14, color:"#444", lineHeight:1.7, marginBottom:28, maxWidth:440, margin:"0 auto 28px" }}>has completed the Hive Mortgage Academy curriculum and demonstrated mastery of loan origination, borrower consultation, compliance, and the payment-first methodology.</div>
          <div style={{ display:"flex", justifyContent:"center", gap:28, padding:"18px 0", borderTop:"2px solid #D4881A", borderBottom:"2px solid #D4881A", marginBottom:24 }}>
            {[["🗓️",String(year),"Completed"],["⬡","Huit.AI","Powered By"],["🏔️","Alaska","Built From"]].map(([icon,val,label]) => (
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:18, fontWeight:900, color:"#D4881A", fontFamily:"Georgia,serif" }}>{icon} {val}</div>
                <div style={{ fontSize:10, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
          {cert.certificate_number && <div style={{ fontSize:12, color:"#aaa", marginBottom:20 }}>Certificate #{cert.certificate_number}</div>}
          <button onClick={() => window.print()} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"white", border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>🖨️ Print / Save PDF</button>
        </div>
        <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#999" }}>Powered by <a href="https://hivemortgageacademy.com" style={{ color:"#D4881A" }}>hivemortgageacademy.com</a></div>
        <style>{`@media print{button{display:none!important}body{background:white!important}}`}</style>
      </div>
    </main>
  );
}
