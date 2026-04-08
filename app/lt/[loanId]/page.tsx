"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MILESTONES } from "@/app/loantrack/page";

type Loan = {
  id: string; borrowerName: string; borrowerPhone: string; borrowerEmail: string;
  propertyAddress: string; loanAmount: string; targetClose: string; loanType: string;
  currentMilestone: number; loNote: string;
  milestoneHistory: { milestone: number; date: string; note: string }[];
  createdAt: string; active: boolean;
};

type Student = { name: string; nmls_number: string; email: string; };

const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "—";
const daysTo = (s: string) => s ? Math.ceil((new Date(s).getTime()-Date.now())/86400000) : null;

export default function BorrowerLoanTrack() {
  const params = useParams();
  const loanId = params.loanId as string;
  const [loan, setLoan] = useState<Loan|null>(null);
  const [lo, setLo] = useState<Student|null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Pull loan from localStorage (same device) or session
    // In production this would be a DB lookup; for HMA it uses the LO's device storage
    const raw = localStorage.getItem("hma_loans");
    if (raw) {
      const loans: Loan[] = JSON.parse(raw);
      const found = loans.find(l => l.id===loanId);
      if (found) { setLoan(found); }
      else setNotFound(true);
    } else setNotFound(true);

    const studentRaw = localStorage.getItem("hma_student");
    if (studentRaw) setLo(JSON.parse(studentRaw));
  }, [loanId]);

  if (notFound) return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>📍</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"white", marginBottom:8 }}>Loan tracker not found</div>
        <p style={{ fontSize:14, color:"#94A3B8", maxWidth:340, margin:"0 auto" }}>This link may have expired or the loan ID is incorrect. Contact your loan officer for an updated link.</p>
      </div>
    </main>
  );

  if (!loan) return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#F5A623", fontSize:16 }}>Loading your loan status...</div>
    </main>
  );

  const ms = MILESTONES[loan.currentMilestone-1];
  const nextMs = loan.currentMilestone < 8 ? MILESTONES[loan.currentMilestone] : null;
  const pct = Math.round(((loan.currentMilestone-1)/7)*100);
  const closed = loan.currentMilestone===8;
  const days = daysTo(loan.targetClose);

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"0 0 48px" }}>
      {/* LO Header */}
      <div style={{ background:"#111114", borderBottom:"1px solid #1E1E24", padding:"16px 24px" }}>
        <div style={{ maxWidth:560, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📍</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, color:"white" }}>LoanTrack™</div>
              {lo && <div style={{ fontSize:11, color:"#94A3B8" }}>{lo.name}{lo.nmls_number?` · NMLS #${lo.nmls_number}`:""}</div>}
            </div>
          </div>
          {lo && <a href={`mailto:${lo.email||"derekhuit@gmail.com"}`} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"8px 16px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>Contact {lo.name?.split(" ")[0]||"LO"}</a>}
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"32px 20px" }}>

        {/* Borrower greeting */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:11, color:"#F5A623", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:10 }}>Your Loan Status</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,5vw,36px)", fontWeight:900, color:"white", lineHeight:1.15, marginBottom:8 }}>
            Hi {loan.borrowerName.split(" ")[0]}&nbsp;👋
          </h1>
          {loan.propertyAddress && <div style={{ fontSize:14, color:"#94A3B8" }}>{loan.propertyAddress}</div>}
          {loan.targetClose && days!==null && (
            <div style={{ fontSize:13, color:days<=7?"#EF4444":days<=14?"#F5A623":"#94A3B8", marginTop:6, fontWeight:600 }}>
              {closed?"Closed!":days<=0?"Closing today!":days===1?"Closing tomorrow!":days<=7?`Closing in ${days} days`:`Target closing: ${fmt(loan.targetClose)}`}
            </div>
          )}
        </div>

        {/* Current status card */}
        <div style={{ background:closed?"rgba(16,185,129,0.08)":"rgba(245,166,35,0.06)", border:`1px solid ${closed?"rgba(16,185,129,0.35)":"rgba(245,166,35,0.25)"}`, borderRadius:20, padding:"28px 24px", marginBottom:24, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>{ms.emoji}</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:closed?"#10B981":"#F5A623", marginBottom:8 }}>{ms.label}</div>
          <p style={{ fontSize:14, color:"#CBD5E1", lineHeight:1.7, marginBottom:closed?0:16, maxWidth:400, margin:"0 auto" }}>{ms.borrowerMessage}</p>
          {!closed && loan.loNote && (
            <div style={{ marginTop:16, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#94A3B8", lineHeight:1.6, textAlign:"left", borderLeft:"3px solid #F5A623" }}>
              <strong style={{ color:"#F5A623" }}>{lo?.name?.split(" ")[0]||"Your LO"} says:</strong> {loan.loNote}
            </div>
          )}
        </div>

        {/* Progress */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"20px 22px", marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#CBD5E1" }}>Loan Progress</span>
            <span style={{ fontSize:13, fontWeight:700, color:closed?"#10B981":"#F5A623" }}>Step {loan.currentMilestone} of 8 — {pct}%</span>
          </div>
          <div style={{ height:10, background:"#1E1E24", borderRadius:100, overflow:"hidden", marginBottom:16 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:closed?"linear-gradient(90deg,#10B981,#10B981cc)":"linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius:100, transition:"width 0.6s" }} />
          </div>
          {/* Dot timeline */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            {MILESTONES.map(m => {
              const done = m.id < loan.currentMilestone;
              const curr = m.id === loan.currentMilestone;
              return (
                <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1 }}>
                  <div style={{ width:curr?20:14, height:curr?20:14, borderRadius:"50%", background:done?"#10B981":curr?"#F5A623":"#1E1E24", border:`2px solid ${done?"#10B981":curr?"#F5A623":"#2D2D36"}`, transition:"all 0.3s", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {done && <span style={{ fontSize:8, color:"white", fontWeight:900 }}>✓</span>}
                  </div>
                  <div style={{ fontSize:9, color:curr?"#F5A623":done?"#10B981":"#374151", textAlign:"center", lineHeight:1.2, maxWidth:52 }}>{m.label.split("!")[0].split("—")[0].trim()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What happens next */}
        {!closed && nextMs && (
          <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>What Happens Next</div>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:32, height:32, background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{nextMs.emoji}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:"white", marginBottom:4 }}>{nextMs.label}</div>
                <div style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6 }}>{ms.nextStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Milestone history */}
        {loan.milestoneHistory?.length > 1 && (
          <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Milestone History</div>
            {[...loan.milestoneHistory].reverse().map((h, i) => {
              const mData = MILESTONES[h.milestone-1];
              return (
                <div key={i} style={{ display:"flex", gap:12, padding:"8px 0", borderBottom:i<loan.milestoneHistory.length-1?"1px solid #1E1E24":"none" }}>
                  <span style={{ fontSize:16, flexShrink:0 }}>{mData?.emoji}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#CBD5E1" }}>{mData?.label}</div>
                    <div style={{ fontSize:11, color:"#4B5563" }}>{new Date(h.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contact CTA */}
        <div style={{ background:"rgba(245,166,35,0.05)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:16, padding:"20px 22px", textAlign:"center" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"white", marginBottom:6 }}>Questions? Always reach out.</div>
          <div style={{ fontSize:13, color:"#94A3B8", marginBottom:16 }}>{lo?.name||"Your loan officer"} is here every step of the way.</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            {lo?.email && <a href={`mailto:${lo.email}`} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"11px 22px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>✉️ Send Email</a>}
          </div>
          {lo?.nmls_number && <div style={{ fontSize:11, color:"#4B5563", marginTop:12 }}>NMLS #{lo.nmls_number} · Powered by Hive Mortgage Academy</div>}
        </div>
      </div>
    </main>
  );
}
