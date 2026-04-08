"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GraduationPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [certNumber, setCertNumber] = useState("");
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);

  const TIER_LIMITS: Record<string,number> = { free:6, foundation:9, accelerator:11, elite:12 };

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);

    const token = localStorage.getItem("hma_token") || "";
    // Check completion
    fetch(`/api/progress?studentId=${s.id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json()).then(async progress => {
        const limit = TIER_LIMITS[s.plan] || 3;
        const done = progress.filter((p:any) => p.completed && p.module_number <= limit).length;
        setCompletedCount(done);
        const isEligible = done >= limit;
        setEligible(isEligible);

        if (isEligible) {
          const res = await fetch("/api/certificate", { method:"POST", headers:{"Content-Type":"application/json", Authorization:`Bearer ${token}`}, body: JSON.stringify({ studentId: s.id }) });
          const data = await res.json();
          setCertNumber(data.certificate_number || data.certificateNumber || "");
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  if (loading) return <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"var(--honey)", fontSize:16 }}>Verifying your completion...</div></main>;
  if (!student) return null;

  const tierLimit = TIER_LIMITS[student.plan] || 3;

  if (!eligible) return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ maxWidth:480, textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎓</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"var(--text-primary)", marginBottom:12 }}>Not quite yet.</h1>
        <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:20 }}>You've completed {completedCount} of {tierLimit} modules required for your {student.plan} tier HivePass™. Keep going — you're close.</p>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 20px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
            {Array.from({length:tierLimit}).map((_,i)=>(
              <div key={i} style={{ width:24, height:8, borderRadius:4, background: i < completedCount ? "#10B981" : "var(--slate)" }} />
            ))}
          </div>
          <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:8 }}>{completedCount}/{tierLimit} modules complete</div>
        </div>
        <a href="/dashboard" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none", display:"inline-block" }}>← Continue Training</a>
      </div>
    </main>
  );

  const tierLabel: Record<string,string> = { free:"Free", foundation:"Foundation", accelerator:"Accelerator", elite:"Elite" };

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", padding:"80px 24px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ background:"var(--charcoal)", border:"2px solid rgba(245,166,35,0.5)", borderRadius:24, padding:"40px 48px", textAlign:"center", marginBottom:40, boxShadow:"0 0 80px rgba(245,166,35,0.12)" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🐝</div>
          <div style={{ fontSize:12, color:"var(--honey)", fontWeight:700, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:8 }}>Hive Mortgage Academy</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,5vw,42px)", fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>HivePass™</div>
          <div style={{ fontSize:15, color:"var(--text-secondary)", marginBottom:24 }}>This certifies that</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,4vw,36px)", fontWeight:900, color:"var(--honey)", marginBottom:8 }}>{student.name}</div>
          {student.nmls_number && <div style={{ fontSize:14, color:"var(--text-muted)", marginBottom:8 }}>NMLS #{student.nmls_number}</div>}
          <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:20 }}>{tierLabel[student.plan]} Tier · {tierLimit} Modules Completed</div>
          <div style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, marginBottom:28, maxWidth:480, margin:"0 auto 28px" }}>has completed the Hive Mortgage Academy curriculum and demonstrated mastery of loan origination, borrower consultation, compliance, and the payment-first methodology.</div>
          {certNumber && <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:20 }}>Certificate {certNumber} · {new Date().getFullYear()}</div>}
          <div style={{ display:"flex", justifyContent:"center", gap:32, padding:"20px 0", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", marginBottom:24 }}>
            {[["⬡ Huit.AI","Platform"],["🏔️","Built from Alaska"],["✓ Verified",`${tierLimit} Modules`]].map(([v,l])=>(<div key={l} style={{ textAlign:"center" }}><div style={{ fontSize:16, fontWeight:900, color:"var(--honey)", fontFamily:"'Playfair Display',serif" }}>{v}</div><div style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{l}</div></div>))}
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => window.print()} style={{ background:"var(--slate)", border:"1px solid var(--border)", color:"var(--text-primary)", padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>🖨️ Print Certificate</button>
            <a href={`/hivepass/${student.id}`} target="_blank" style={{ background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.3)", color:"var(--honey)", padding:"10px 20px", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none" }}>🔗 Share HivePass</a>
          </div>
        </div>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(22px,4vw,32px)", fontWeight:900, color:"var(--text-primary)", marginBottom:12 }}>You've Earned It. Now Choose Your Path.</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }} className="cta-grid">
          {[{ icon:"🏔️", title:"Join Derek's Team", desc:"Apply to join Derek Huit's team at Cardinal Financial. Full Huit.AI platform from Day 1.", cta:"Apply Now →", href:"/apply", color:"#F5A623" },
            { icon:"📅", title:"Book a Strategy Call", desc:"Not ready to commit? Book a free 30-minute call with Derek first.", cta:"Book a Call →", href:"https://calendly.com/derekhuit", color:"#3B82F6" },
            { icon:"🔓", title:"Unlock More", desc:"Upgrade your plan and continue with advanced modules.", cta:"Upgrade →", href:"/enroll", color:"#8B5CF6" }].map(c=>(
            <div key={c.title} style={{ background:"var(--charcoal)", border:`1px solid ${c.color}30`, borderRadius:16, padding:"20px 18px", textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>{c.title}</div>
              <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6, marginBottom:14 }}>{c.desc}</p>
              <a href={c.href} style={{ display:"block", background:`${c.color}15`, border:`1px solid ${c.color}40`, color:c.color, padding:"9px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>{c.cta}</a>
            </div>
          ))}
        </div>
        <style>{`@media(max-width:600px){.cta-grid{grid-template-columns:1fr!important}}`}</style>
      </div>
    </main>
  );
}
