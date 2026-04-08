"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const TIER_INFO = {
  free:        { label:"Free",        monthly:0,   annual:0,   color:"#10B981", modules:"Modules 1–3", badge:"No credit card", features:["3 modules fully unlocked","Unlimited AI Coach","Progress tracking","Access to all 11 LO tools"] },
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  color:"#3B82F6", modules:"Modules 1–6", badge:"Most Popular Start", features:["Everything in Free","Modules 4–6 unlocked","Module certificates","Email support"] },
  accelerator: { label:"Accelerator", monthly:297, annual:208, color:"#8B5CF6", modules:"Modules 1–10", badge:"Best Value", features:["Everything in Foundation","Modules 7–10 unlocked","AI role-play simulations","Derek's Pipeline Playbook PDF"] },
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
    if (!form.name.trim())           return "Please enter your full name.";
    if (!form.email.trim())          return "Please enter your email address.";
    if (!form.email.includes("@"))   return "Please enter a valid email address.";
    if (!form.password)              return "Please create a password.";
    if (form.password.length < 8)    return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords don't match.";
    return null;
  }

  async function handleSubmit() {
    const err = validate();
    if (err) { setError(err); return; }
    setError(""); setLoading(true);

    if (tier === "free") {
      try {
        const res = await fetch("/api/enroll", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name:form.name, email:form.email, nmls:form.nmls, password:form.password, plan:"free", billing:"monthly" }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Enrollment failed. Please try again."); setLoading(false); return; }
        localStorage.setItem("hma_student", JSON.stringify(data.student));
        router.push("/dashboard?welcome=1");
      } catch { setError("Something went wrong. Please try again."); setLoading(false); }
    } else {
      // Paid — go to embedded ZenoPay checkout
      const qs = new URLSearchParams({
        plan: tier, billing,
        name: form.name, email: form.email,
        nmls: form.nmls, password: form.password,
      });
      router.push(`/checkout?${qs.toString()}`);
    }
  }

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", padding:"56px 20px 80px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--text-muted)", fontSize:13, textDecoration:"none", marginBottom:32 }}>← Back to home</a>

        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 14px" }}>🐝</div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:28, fontWeight:900, color:"var(--text-primary)", marginBottom:6 }}>Start Your Training</h1>
          <p style={{ fontSize:14, color:"var(--text-secondary)" }}>Join Hive Mortgage Academy — built from $1B in real production.</p>
        </div>

        {/* Tier selector */}
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:14, padding:5, marginBottom:20, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
          {(Object.keys(TIER_INFO) as Tier[]).map(k => {
            const t = TIER_INFO[k];
            return (
              <button key={k} onClick={() => setTier(k)} style={{ padding:"9px 4px", borderRadius:9, border:"none", cursor:"pointer", background:tier===k?`${t.color}20`:"transparent", outline:tier===k?`1px solid ${t.color}50`:"none" }}>
                <div style={{ fontSize:12, fontWeight:700, color:tier===k?t.color:"var(--text-muted)" }}>{t.label}</div>
                <div style={{ fontSize:10, color:tier===k?t.color:"var(--text-muted)", opacity:0.8 }}>{t.monthly===0?"Free":`$${t.monthly}`}</div>
              </button>
            );
          })}
        </div>

        {/* Plan summary */}
        <div style={{ background:`${info.color}0E`, border:`1px solid ${info.color}35`, borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:14, fontWeight:700, color:info.color }}>{info.label} — {info.modules}</span>
                <span style={{ fontSize:10, background:`${info.color}20`, color:info.color, border:`1px solid ${info.color}40`, padding:"2px 8px", borderRadius:100, fontWeight:700 }}>{info.badge}</span>
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
            <div style={{ textAlign:"right", flexShrink:0 }}>
              {tier==="free" ? (
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:info.color }}>Free</div>
              ) : (
                <>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:info.color }}>${price}<span style={{ fontSize:12, color:"var(--text-muted)", fontFamily:"sans-serif" }}>/mo</span></div>
                  {billing==="annual" && <div style={{ fontSize:11, color:"#10B981", fontWeight:600 }}>Save 30%</div>}
                </>
              )}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
            {info.features.map(f => (
              <div key={f} style={{ display:"flex", gap:6 }}>
                <span style={{ color:"#10B981", fontSize:12, flexShrink:0, marginTop:1 }}>✓</span>
                <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account form */}
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:28 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", marginBottom:20 }}>Create Your Account</div>
          {[
            { label:"Full Name *",                    field:"name",     type:"text",     ph:"Derek Huit" },
            { label:"Email Address *",                field:"email",    type:"email",    ph:"derek@email.com" },
            { label:"NMLS Number (optional)",         field:"nmls",     type:"text",     ph:"Leave blank if not yet licensed" },
            { label:"Password (min 8 characters) *",  field:"password", type:"password", ph:"Create a strong password" },
            { label:"Confirm Password *",             field:"confirm",  type:"password", ph:"Re-enter your password" },
          ].map(({ label, field, type, ph }) => (
            <div key={field} style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5, display:"block" }}>{label}</label>
              <input
                type={type} placeholder={ph}
                value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                onKeyDown={e => e.key==="Enter" && handleSubmit()}
                style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"11px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }}
              />
            </div>
          ))}

          {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginBottom:14 }}>{error}</div>}

          <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", background:loading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:loading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"14px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.7:1, marginBottom:12 }}>
            {loading ? "Please wait..." :
             tier==="free" ? "Start Free — Access Immediately →" :
             `Continue to Secure Payment — $${price}/mo →`}
          </button>

          {tier !== "free" && (
            <div style={{ display:"flex", justifyContent:"center", gap:16, fontSize:12, color:"var(--text-muted)" }}>
              <span>🍎 Apple Pay</span><span>💳 All Cards</span><span>🔒 ZenoPay.ai</span>
            </div>
          )}
          <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:14 }}>
            Already have an account? <a href="/login" style={{ color:"var(--honey)", textDecoration:"none" }}>Sign in →</a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function EnrollPage() {
  return <Suspense><EnrollContent /></Suspense>;
}
