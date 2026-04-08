"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TIER_INFO = {
  free:        { label:"Free",        monthly:0,   annual:0,   color:"#10B981", modules:"Modules 1–6", badge:"No credit card", features:["6 modules fully unlocked","Unlimited AI Coach","Progress tracking","All 11 LO tools"] },
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  color:"#3B82F6", modules:"Modules 1–9", badge:"Most Popular", features:["Everything in Free","Modules 7–9 unlocked","Module certificates","Email support"] },
  accelerator: { label:"Accelerator", monthly:297, annual:208, color:"#8B5CF6", modules:"Modules 1–11", badge:"Best Value", features:["Everything in Foundation","Modules 10–11 unlocked","AI role-play simulations","Derek's Pipeline Playbook PDF"] },
  elite:       { label:"Elite",       monthly:697, annual:488, color:"#F5A623", modules:"All 12 Modules", badge:"Full Platform", features:["Everything in Accelerator","All 12 modules","Monthly 1:1 with Derek","HivePass™ graduation badge"] },
} as const;
type Tier = keyof typeof TIER_INFO;

function EnrollContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initTier = (params.get("tier") || "free") as Tier;
  const [tier, setTier] = useState<Tier>(initTier in TIER_INFO ? initTier : "free");
  const [billing, setBilling] = useState<"monthly"|"annual">("monthly");
  const [form, setForm] = useState({ name:"", email:"", nmls:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const info = TIER_INFO[tier];
  const price = billing === "annual" ? info.annual : info.monthly;

  function validate() {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return null;
  }

  async function handleSubmit() {
    const err = validate(); if (err) { setError(err); return; }
    setError(""); setLoading(true);
    try {
      if (tier === "free") {
        const res = await fetch("/api/enroll", { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name:form.name, email:form.email, nmls:form.nmls, password:form.password, plan:"free" }) });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Enrollment failed."); setLoading(false); return; }
        localStorage.setItem("hma_student", JSON.stringify(data.student));
        localStorage.setItem("hma_session_token", data.token || "");
        router.push("/dashboard?welcome=1");
      } else {
        // Save pending registration server-side (password never goes in URL)
        const res = await fetch("/api/register-pending", { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name:form.name, email:form.email, nmls:form.nmls, password:form.password, plan:tier, billing }) });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed. Please try again."); setLoading(false); return; }
        // Only token goes in URL — no credentials
        router.push(`/checkout?reg=${data.token}&plan=${tier}&billing=${billing}&name=${encodeURIComponent(form.name)}&email=${encodeURIComponent(form.email)}`);
      }
    } catch { setError("Something went wrong."); setLoading(false); }
  }

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", padding:"56px 20px 80px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-muted)", fontSize:13, textDecoration:"none", marginBottom:32 }}>← Back</a>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px" }}>🐝</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"var(--text-primary)", marginBottom:6 }}>Start Your Training</h1>
          <p style={{ fontSize:14, color:"var(--text-secondary)" }}>Built from $1B in real production. No filler.</p>
        </div>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:14, padding:5, marginBottom:20, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
          {(Object.keys(TIER_INFO) as Tier[]).map(k => (
            <button key={k} onClick={() => setTier(k)} style={{ padding:"9px 4px", borderRadius:9, border:"none", cursor:"pointer", background:tier===k?`${TIER_INFO[k].color}20`:"transparent", outline:tier===k?`1px solid ${TIER_INFO[k].color}50`:"none" }}>
              <div style={{ fontSize:12, fontWeight:700, color:tier===k?TIER_INFO[k].color:"var(--text-muted)" }}>{TIER_INFO[k].label}</div>
              <div style={{ fontSize:10, color:tier===k?TIER_INFO[k].color:"var(--text-muted)", opacity:0.8 }}>{TIER_INFO[k].monthly===0?"Free":`$${TIER_INFO[k].monthly}`}</div>
            </button>
          ))}
        </div>
        <div style={{ background:`${info.color}0E`, border:`1px solid ${info.color}35`, borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:14, fontWeight:700, color:info.color }}>{info.label} — {info.modules}</span>
              </div>
              {tier !== "free" && (
                <div style={{ display:"flex", gap:8, marginTop:6 }}>
                  {(["monthly","annual"] as const).map(b => (
                    <button key={b} onClick={() => setBilling(b)} style={{ padding:"4px 11px", borderRadius:100, border:`1px solid ${billing===b?info.color:"var(--border)"}`, background:billing===b?`${info.color}20`:"transparent", color:billing===b?info.color:"var(--text-muted)", fontSize:11, fontWeight:600, cursor:"pointer" }}>
                      {b==="monthly"?"Monthly":`Annual — $${info.annual}/mo`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign:"right" }}>
              {tier==="free" ? <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:info.color }}>Free</div>
                : <><div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:info.color }}>${price}<span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"sans-serif" }}>/mo</span></div>
                   {billing==="annual" && <div style={{ fontSize:11, color:"#10B981", fontWeight:600 }}>Save 30%</div>}</>}
            </div>
          </div>
          {info.features.map(f => <div key={f} style={{ display:"flex", gap:6, marginBottom:4 }}><span style={{ color:"#10B981", fontSize:12, flexShrink:0 }}>✓</span><span style={{ fontSize:12, color:"var(--text-secondary)" }}>{f}</span></div>)}
        </div>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Create Your Account</div>
          {[["Full Name *","name","text","Derek Huit"],["Email Address *","email","email","derek@email.com"],["NMLS Number (optional)","nmls","text","Leave blank if not yet licensed"],["Password (min 8 characters) *","password","password","Create a strong password"],["Confirm Password *","confirm","password","Re-enter your password"]].map(([label,field,type,ph]) => (
            <div key={field as string} style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{label}</label>
              <input type={type as string} placeholder={ph as string} value={(form as any)[field as string]} onChange={e => setForm(f => ({...f,[field as string]:e.target.value}))} onKeyDown={e => e.key==="Enter"&&handleSubmit()} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginBottom:14 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", background:loading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:loading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"14px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", marginBottom:12 }}>
            {loading?"Please wait...":tier==="free"?"Start Free — Access Immediately →":`Continue to Payment — $${price}/mo →`}
          </button>
          {tier!=="free"&&<div style={{ display:"flex", justifyContent:"center", gap:16, fontSize:12, color:"var(--text-muted)" }}><span>🍎 Apple Pay</span><span>💳 All Cards</span><span>🔒 ZenoPay.ai</span></div>}
          <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:14 }}>Already have an account? <a href="/login" style={{ color:"var(--honey)", textDecoration:"none" }}>Sign in →</a></p>
          <p style={{ fontSize:11, color:"var(--text-muted)", textAlign:"center", marginTop:16, lineHeight:1.6 }}>Hive Mortgage Academy is an independent educational platform. Not affiliated with or required by any employer. Individual results vary.<br />Instructor: Derek Huit · NMLS #1739818 · Cardinal Financial (NMLS #203980) · Equal Housing Opportunity</p>
        </div>
      </div>
    </main>
  );
}
export default function EnrollPage() { return <Suspense><EnrollContent /></Suspense>; }
