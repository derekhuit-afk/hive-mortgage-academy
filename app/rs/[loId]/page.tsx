"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const QUESTIONS = [
  { id:"credit", label:"What's your estimated credit score?", emoji:"📊",
    options:[{v:"below580",l:"Below 580",s:0},{v:"580620",l:"580–620",s:20},{v:"620660",l:"620–660",s:35},{v:"660700",l:"660–700",s:55},{v:"700740",l:"700–740",s:70},{v:"740plus",l:"740+",s:90}] },
  { id:"income", label:"How stable is your employment/income?", emoji:"💼",
    options:[{v:"unstable",l:"Unstable / recently changed",s:10},{v:"selfemployed",l:"Self-employed (2+ years)",s:50},{v:"parttime",l:"Part-time",s:25},{v:"fulltime1",l:"Full-time, less than 1 year",s:40},{v:"fulltime2plus",l:"Full-time, 2+ years",s:90}] },
  { id:"downpayment", label:"How much do you have saved for a down payment?", emoji:"💰",
    options:[{v:"nothing",l:"Nothing yet",s:0},{v:"under5k",l:"Under $5,000",s:10},{v:"5k15k",l:"$5,000–$15,000",s:30},{v:"15k30k",l:"$15,000–$30,000",s:55},{v:"30k60k",l:"$30,000–$60,000",s:75},{v:"over60k",l:"Over $60,000",s:95}] },
  { id:"debt", label:"How would you describe your monthly debts?", emoji:"📋",
    options:[{v:"high",l:"High — student loans, car, credit cards",s:20},{v:"medium",l:"Moderate — a few payments",s:55},{v:"low",l:"Low — minimal debt",s:80},{v:"none",l:"None",s:100}] },
  { id:"renting", label:"What's your current housing situation?", emoji:"🏢",
    options:[{v:"parents",l:"Living with family / no payment",s:70},{v:"renting",l:"Renting",s:80},{v:"owning",l:"Own a home (looking to buy another or upgrade)",s:60}] },
  { id:"timeline", label:"How soon are you looking to buy?", emoji:"📅",
    options:[{v:"now",l:"As soon as possible",s:90},{v:"3to6",l:"3–6 months",s:80},{v:"6to12",l:"6–12 months",s:60},{v:"1to2",l:"1–2 years",s:35},{v:"exploring",l:"Just exploring",s:20}] },
  { id:"preapproved", label:"Have you spoken to a lender before?", emoji:"🗣️",
    options:[{v:"no",l:"No, first time",s:70},{v:"prequalified",l:"Got pre-qualified before",s:80},{v:"preapproved",l:"Have a pre-approval",s:90},{v:"denied",l:"Was denied before",s:30}] },
  { id:"homeprice", label:"What price range are you targeting?", emoji:"🏠",
    options:[{v:"under200",l:"Under $200K",s:85},{v:"200to350",l:"$200K–$350K",s:85},{v:"350to500",l:"$350K–$500K",s:80},{v:"500to750",l:"$500K–$750K",s:70},{v:"over750",l:"Over $750K",s:60}] },
];

type Tier = { label:string; color:string; bg:string; border:string; emoji:string; message:string };
function getTier(score:number): Tier {
  if (score>=80) return { label:"Ready Now",     color:"#10B981", bg:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.3)",  emoji:"🚀", message:"You're in strong shape. Let's get you pre-approved and start looking at homes." };
  if (score>=60) return { label:"Almost Ready",  color:"#F5A623", bg:"rgba(245,166,35,0.08)",  border:"rgba(245,166,35,0.3)",  emoji:"⚡", message:"You're close — a few targeted moves could get you into a home sooner than you think." };
  if (score>=35) return { label:"Getting There", color:"#3B82F6", bg:"rgba(59,130,246,0.08)",  border:"rgba(59,130,246,0.3)",  emoji:"📈", message:"You're building toward it. A solid plan now means you could be buying within 6–12 months." };
  return        { label:"Early Stage",   color:"#8B5CF6", bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.3)", emoji:"🌱", message:"You're in the planning phase — the best time to build a strong foundation is now." };
}

function fmtPlan(text:string) {
  return text.split("\n").map((line,i) => {
    if (line.startsWith("**")&&line.endsWith("**")) return <div key={i} style={{ fontSize:12,fontWeight:800,color:"#F5A623",textTransform:"uppercase",letterSpacing:"0.1em",margin:"18px 0 8px",display:"inline-block",padding:"3px 10px",background:"rgba(245,166,35,0.08)",borderRadius:6 }}>{line.replace(/\*\*/g,"")}</div>;
    if (line.startsWith("- ")) return <div key={i} style={{ display:"flex",gap:8,margin:"5px 0" }}><span style={{ color:"#F5A623",flexShrink:0 }}>▸</span><span style={{ fontSize:13,color:"#CBD5E1",lineHeight:1.6 }}>{line.slice(2)}</span></div>;
    if (line.trim()==="") return <div key={i} style={{ height:6 }} />;
    return <p key={i} style={{ fontSize:13,color:"#CBD5E1",lineHeight:1.7,margin:"3px 0" }}>{line}</p>;
  });
}

export default function ReadyScorePage() {
  const params = useParams()!;
  const loId = params.loId as string;
  const [lo, setLo] = useState<any>(null);
  const [step, setStep] = useState(0); // 0=intro, 1-8=questions, 9=results
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [score, setScore] = useState(0);
  const [plan, setPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch(`/api/lo-profile?id=${loId}`)
      .then(r=>r.json()).then(d=>setLo(d)).catch(()=>{});
  }, [loId]);

  function answer(qId:string, val:string, pts:number) {
    const newAnswers = { ...answers, [qId]:val };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length) setStep(step+1);
    if (step === QUESTIONS.length-1) {
      // Calculate score
      let total = 0;
      const allQ = [...QUESTIONS];
      allQ.forEach(q => {
        const picked = q.id===qId ? val : newAnswers[q.id];
        const opt = q.options.find(o=>o.v===picked);
        if (opt) total += opt.s;
      });
      const finalScore = Math.round(total / QUESTIONS.length);
      setScore(finalScore);
      generatePlan(finalScore, newAnswers);
    }
  }

  async function generatePlan(sc:number, ans:Record<string,string>) {
    setStep(9);
    setPlanLoading(true);
    try {
      const tier = getTier(sc);
      const humanAnswers: Record<string,string> = {};
      QUESTIONS.forEach(q => {
        const v = ans[q.id];
        const opt = q.options.find(o=>o.v===v);
        if (opt) humanAnswers[q.label] = opt.l;
      });
      const res = await fetch("/api/readyscore-plan", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ score:sc, tier:tier.label, answers:humanAnswers, loName:lo?.name, loMarket:"their market" }),
      });
      const data = await res.json();
      setPlan(data.content||"");
    } catch { /* silent */ } finally { setPlanLoading(false); }
  }

  const tier = getTier(score);
  const progress = step===0?0:step>=QUESTIONS.length?100:Math.round((step/QUESTIONS.length)*100);

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"0 0 60px" }}>
      {/* LO header */}
      <div style={{ background:"#111114", borderBottom:"1px solid #1E1E24", padding:"14px 24px" }}>
        <div style={{ maxWidth:600, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🎯</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700, color:"white" }}>ReadyScore™</div>
              {lo?.name && <div style={{ fontSize:11, color:"#94A3B8" }}>{lo.name}{lo.nmls_number?` · NMLS #${lo.nmls_number}`:""}</div>}
            </div>
          </div>
          {step>0&&step<9 && (
            <div style={{ fontSize:12, color:"#94A3B8" }}>Question {step} of {QUESTIONS.length}</div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"36px 20px" }}>

        {/* Intro */}
        {step===0 && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:20 }}>🎯</div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,5vw,38px)", fontWeight:900, color:"white", lineHeight:1.15, marginBottom:14 }}>Are You Ready to Buy a Home?</h1>
            <p style={{ fontSize:15, color:"#94A3B8", lineHeight:1.7, marginBottom:28, maxWidth:440, margin:"0 auto 28px" }}>
              Answer 8 quick questions and get your personalized ReadyScore™ — plus a free action plan from {lo?.name||"your loan officer"} on exactly what to do next.
            </p>
            {lo?.name && (
              <div style={{ background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:12, padding:"12px 18px", marginBottom:24, display:"inline-flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:14 }}>🐝</span>
                <span style={{ fontSize:13, color:"#F5A623", fontWeight:600 }}>Powered by {lo.name}{lo.nmls_number?` · NMLS #${lo.nmls_number}`:""}</span>
              </div>
            )}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, color:"#94A3B8", display:"block", marginBottom:8 }}>Your first name (optional)</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah" style={{ background:"#111114", border:"1px solid #2D2D36", borderRadius:8, padding:"11px 16px", color:"white", fontSize:14, outline:"none", textAlign:"center", width:200 }} />
            </div>
            <button onClick={()=>setStep(1)} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:12, padding:"15px 40px", fontSize:16, fontWeight:700, cursor:"pointer" }}>
              Get My ReadyScore™ →
            </button>
            <div style={{ marginTop:16, fontSize:12, color:"#4B5563" }}>Free · Takes 2 minutes · No credit check</div>
          </div>
        )}

        {/* Questions */}
        {step>=1 && step<=QUESTIONS.length && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom:28 }}>
              <div style={{ height:6, background:"#1E1E24", borderRadius:100, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius:100, transition:"width 0.4s" }} />
              </div>
            </div>
            {(() => {
              const q = QUESTIONS[step-1];
              return (
                <div>
                  <div style={{ textAlign:"center", marginBottom:28 }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>{q.emoji}</div>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,4vw,28px)", fontWeight:900, color:"white", lineHeight:1.2 }}>{name?`${name}, ${q.label.toLowerCase()}`:q.label}</h2>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {q.options.map(opt=>(
                      <button key={opt.v} onClick={()=>answer(q.id,opt.v,opt.s)} style={{ background:"#111114", border:"1px solid #2D2D36", borderRadius:12, padding:"16px 20px", color:"white", fontSize:14, fontWeight:500, cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}
                        onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor="#F5A623";(e.target as HTMLElement).style.background="rgba(245,166,35,0.06)";}}
                        onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor="#2D2D36";(e.target as HTMLElement).style.background="#111114";}}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                  {step>1&&<button onClick={()=>setStep(step-1)} style={{ background:"none", border:"none", color:"#4B5563", cursor:"pointer", fontSize:13, marginTop:20, display:"block" }}>← Back</button>}
                </div>
              );
            })()}
          </div>
        )}

        {/* Results */}
        {step===9 && (
          <div>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{tier.emoji}</div>
              <div style={{ fontSize:13, color:"#94A3B8", marginBottom:8 }}>Your ReadyScore™</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:80, fontWeight:900, color:tier.color, lineHeight:1 }}>{score}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:tier.color, marginBottom:12 }}>{tier.label}</div>
              <p style={{ fontSize:15, color:"#CBD5E1", lineHeight:1.7, maxWidth:440, margin:"0 auto" }}>{tier.message}</p>
            </div>

            {/* Score bar */}
            <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                {[{l:"Early Stage",c:"#8B5CF6"},{l:"Getting There",c:"#3B82F6"},{l:"Almost Ready",c:"#F5A623"},{l:"Ready Now",c:"#10B981"}].map((t,i)=>(
                  <div key={t.l} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ fontSize:9, color:t.c, fontWeight:700, marginBottom:4 }}>{t.l}</div>
                    <div style={{ height:4, background:score>=(i===0?0:i===1?35:i===2?60:80)?t.c:"#2D2D36", borderRadius:100 }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:11, color:"#4B5563", textAlign:"center", marginTop:8 }}>Your score: {score}/100</div>
            </div>

            {/* AI Plan */}
            {planLoading ? (
              <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"32px", textAlign:"center" }}>
                <div style={{ fontSize:24, marginBottom:10 }}>🤖</div>
                <div style={{ fontSize:14, color:"#94A3B8" }}>Building your personalized action plan...</div>
              </div>
            ) : plan ? (
              <div style={{ background:"#111114", border:`1px solid ${tier.border}`, borderRadius:16, padding:"22px 24px", marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:700, color:tier.color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Your Personal Action Plan</div>
                {fmtPlan(plan)}
              </div>
            ) : null}

            {/* Contact CTA */}
            {lo?.name && (
              <div style={{ background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:16, padding:"22px 24px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"white", marginBottom:8 }}>Talk to {lo.name.split(" ")[0]}</div>
                <p style={{ fontSize:14, color:"#94A3B8", marginBottom:16, maxWidth:380, margin:"0 auto 16px" }}>
                  A 15-minute call can answer every question you have and show you exactly what's possible right now.
                </p>
                <a href={`mailto:${lo.email||"derekhuit@gmail.com"}?subject=My ReadyScore is ${score} — I want to learn more`} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none", display:"inline-block" }}>
                  Contact {lo.name.split(" ")[0]} →
                </a>
                {lo.nmls_number && <div style={{ fontSize:11, color:"#4B5563", marginTop:12 }}>NMLS #{lo.nmls_number}</div>}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
