"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const STATE_TAX: Record<string,number> = {
  "AL":0.42,"AK":1.04,"AZ":0.63,"AR":0.62,"CA":0.76,"CO":0.51,"CT":2.14,
  "DE":0.57,"FL":0.98,"GA":0.92,"HI":0.29,"ID":0.69,"IL":2.27,"IN":0.85,
  "IA":1.53,"KS":1.41,"KY":0.86,"LA":0.55,"ME":1.36,"MD":1.09,"MA":1.23,
  "MI":1.54,"MN":1.12,"MS":0.65,"MO":1.01,"MT":0.84,"NE":1.73,"NV":0.60,
  "NH":2.18,"NJ":2.49,"NM":0.80,"NY":1.72,"NC":0.84,"ND":0.98,"OH":1.56,
  "OK":0.90,"OR":1.04,"PA":1.58,"RI":1.63,"SC":0.57,"SD":1.31,"TN":0.71,
  "TX":1.80,"UT":0.63,"VT":1.90,"VA":0.82,"WA":1.03,"WV":0.59,"WI":1.76,
  "WY":0.61,"DC":0.56,
};
const STATES = ["AK","AL","AR","AZ","CA","CO","CT","DC","DE","FL","GA","HI",
  "IA","ID","IL","IN","KS","KY","LA","MA","MD","ME","MI","MN","MO","MS","MT",
  "NC","ND","NE","NH","NJ","NM","NV","NY","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VA","VT","WA","WI","WV","WY"];

function calcPI(loan: number, rate: number) {
  if (rate === 0) return loan / 360;
  const r = rate / 100 / 12;
  const n = 360;
  return loan * (r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1);
}

function calcScenario(payment: number, downPct: number, rate: number, state: string, hoa: number, loanType: string) {
  const taxRate = (STATE_TAX[state]||1.0)/100/12;
  const insRate = 0.006/12;
  const pmiRate = loanType==="FHA" ? 0.0085/12 : downPct<20 ? 0.0085/12 : 0;
  let lo=50000, hi=3000000;
  for(let i=0;i<60;i++){
    const mid=(lo+hi)/2;
    const loan=mid*(1-downPct/100);
    const total=calcPI(loan,rate)+mid*taxRate+mid*insRate+loan*pmiRate+hoa;
    if(total>payment) hi=mid; else lo=mid;
  }
  const price=(lo+hi)/2;
  const loan=price*(1-downPct/100);
  const down=price*(downPct/100);
  return {
    price:Math.round(price), loan:Math.round(loan), down:Math.round(down),
    pi:Math.round(calcPI(loan,rate)), tax:Math.round(price*taxRate),
    ins:Math.round(price*insRate), pmi:Math.round(loan*pmiRate), hoa,
    total:Math.round(calcPI(loan,rate)+price*taxRate+price*insRate+loan*pmiRate+hoa),
    cashToClose:Math.round(down+loan*0.025+1200),
  };
}

const fmt = (n:number) => "$"+n.toLocaleString();

export default function BorrowerPaymentFirst() {
  const params = useParams()!;
  const [lo, setLo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState("2000");
  const [downPct, setDownPct] = useState("10");
  const [rate, setRate] = useState("7.0");
  const [state, setState] = useState("AK");
  const [hoa, setHoa] = useState("0");
  const [loanType, setLoanType] = useState("Conventional");
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/lo-profile?id=${params.loId}`)
      .then(r => r.json())
      .then(d => { setLo(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.loId]);

  function calculate() {
    const p=parseFloat(payment)||0;
    const d=parseFloat(downPct)||10;
    const r=parseFloat(rate)||7.0;
    const h=parseFloat(hoa)||0;
    if(p<500) return;
    setResults({
      conservative: calcScenario(p,d,r,state,h,loanType),
      moderate: calcScenario(p*1.12,d,r,state,h,loanType),
      stretch: calcScenario(p*1.25,d,r,state,h,loanType),
    });
  }

  if (loading) return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"var(--honey)", fontSize:16 }}>Loading...</div>
    </main>
  );

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)" }}>
      {/* LO Brand Header */}
      <div style={{ background:"var(--charcoal)", borderBottom:"1px solid var(--border)", padding:"20px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:48, height:48, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>💰</div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:900, color:"var(--text-primary)" }}>PaymentFirst™</div>
              <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                {lo?.name ? <>Powered by <strong style={{ color:"var(--honey)" }}>{lo.name}</strong>{lo.nmls_number ? <> · NMLS #{lo.nmls_number}</> : ""}</> : "Mortgage Consultation Tool"}
              </div>
            </div>
          </div>
          {lo?.name && (
            <a href={`mailto:${lo.email || ""}`} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              Contact {lo.name.split(" ")[0]} →
            </a>
          )}
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px" }}>
        <div style={{ marginBottom:28, textAlign:"center" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,4vw,36px)", fontWeight:900, color:"var(--text-primary)", lineHeight:1.15, marginBottom:10 }}>What Payment Feels Right?</h1>
          <p style={{ fontSize:15, color:"var(--text-secondary)", maxWidth:520, margin:"0 auto" }}>Enter a monthly payment that feels comfortable — not a max, a <em style={{ color:"var(--honey)" }}>comfortable</em> number. We'll show you three purchase price options built around that payment.</p>
        </div>

        {/* Inputs */}
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28, marginBottom:28 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }} className="input-grid">
            {[
              { label:"Comfortable Monthly Payment", val:payment, set:setPayment, prefix:"$", placeholder:"2000" },
              { label:"Down Payment %", val:downPct, set:setDownPct, suffix:"%", placeholder:"10" },
              { label:"Current Interest Rate", val:rate, set:setRate, suffix:"%", placeholder:"7.0" },
              { label:"Monthly HOA (enter 0 if none)", val:hoa, set:setHoa, prefix:"$", placeholder:"0" },
            ].map(({label,val,set,prefix,suffix,placeholder}) => (
              <div key={label}>
                <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>{label}</label>
                <div style={{ display:"flex", alignItems:"center", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, overflow:"hidden" }}>
                  {prefix && <span style={{ padding:"0 10px", color:"var(--honey)", fontWeight:700 }}>{prefix}</span>}
                  <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
                    style={{ flex:1, background:"none", border:"none", outline:"none", padding:"11px 10px", color:"var(--text-primary)", fontSize:14 }} />
                  {suffix && <span style={{ padding:"0 10px", color:"var(--honey)", fontWeight:700 }}>{suffix}</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>State</label>
              <select value={state} onChange={e=>setState(e.target.value)} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none" }}>
                {STATES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>Loan Type</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {["Conventional","FHA","VA","USDA"].map(t=>(
                  <button key={t} onClick={()=>setLoanType(t)} style={{ padding:"9px 4px", borderRadius:8, border:`1px solid ${loanType===t?"rgba(245,166,35,0.5)":"var(--border)"}`, background:loanType===t?"rgba(245,166,35,0.1)":"var(--slate)", color:loanType===t?"var(--honey)":"var(--text-secondary)", fontSize:12, fontWeight:600, cursor:"pointer" }}>{t}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={calculate} style={{ width:"100%", marginTop:20, background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer" }}>
            Show My 3 Scenarios →
          </button>
        </div>
        <style>{`@media(max-width:600px){.input-grid{grid-template-columns:1fr!important}}`}</style>

        {/* Results */}
        {results && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[
              { key:"conservative", label:"Conservative", color:"#10B981", emoji:"🟢", desc:"Built exactly around your comfortable payment." },
              { key:"moderate", label:"Moderate", color:"#F5A623", emoji:"🟡", desc:"A step up — still very manageable." },
              { key:"stretch", label:"Stretch", color:"#EF4444", emoji:"🔴", desc:"Maximum purchase power. Stretch, not strain." },
            ].map(({key,label,color,emoji,desc}) => {
              const s = results[key];
              return (
                <div key={key} style={{ background:"var(--charcoal)", border:`1px solid ${color}30`, borderRadius:16, padding:24 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:8 }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span>{emoji}</span>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)" }}>{label}</span>
                      </div>
                      <div style={{ fontSize:13, color:"var(--text-secondary)" }}>{desc}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color }}>{fmt(s.price)}</div>
                      <div style={{ fontSize:11, color:"var(--text-muted)" }}>Purchase Price</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }} className="scenario-stats">
                    {[["Monthly Payment",fmt(s.total)+"/mo",color],["Down Payment",fmt(s.down),"var(--text-primary)"],["Cash to Close",fmt(s.cashToClose),"var(--text-primary)"]].map(([l,v,c])=>(
                      <div key={String(l)} style={{ background:"var(--slate)", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                        <div style={{ fontSize:15, fontWeight:900, color:c as string }}>{v}</div>
                        <div style={{ fontSize:10, color:"var(--text-muted)", marginTop:2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:"var(--slate)", borderRadius:10, padding:"12px 14px" }}>
                    {[["P&I",s.pi],["Taxes",s.tax],["Insurance",s.ins],...(s.pmi>0?[["PMI/MIP",s.pmi]]:[]),...(s.hoa>0?[["HOA",s.hoa]]:[])].map(([l,v])=>(
                      <div key={String(l)} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{l}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)" }}>{fmt(Number(v))}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Contact LO CTA */}
            {lo?.name && (
              <div style={{ background:"linear-gradient(135deg,rgba(245,166,35,0.1),rgba(245,166,35,0.03))", border:"1px solid rgba(245,166,35,0.3)", borderRadius:16, padding:"24px 28px", textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Ready to take the next step?</div>
                <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:20, maxWidth:420, margin:"0 auto 20px" }}>{lo.name} can review your full financial picture and get you pre-approved — usually same day.</p>
                <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                  <a href={`mailto:${lo.email||"derekhuit@gmail.com"}?subject=I used PaymentFirst — Ready to get pre-approved`} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none" }}>
                    Contact {lo.name.split(" ")[0]} →
                  </a>
                </div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:12 }}>
                  {lo.name} · {lo.nmls_number ? `NMLS #${lo.nmls_number}` : "Licensed Mortgage Professional"}
                </div>
              </div>
            )}
            <div style={{ fontSize:11, color:"var(--text-muted)", lineHeight:1.6 }}>
              * Estimates only. Not a commitment to lend. Property taxes based on state averages. Actual figures may vary.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
