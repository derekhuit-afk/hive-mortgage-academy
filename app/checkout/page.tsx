"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global { interface Window { Stripe?: any; } }

const PLANS: Record<string,{ label:string; monthly:number; annual:number; annualTotal:number; color:string; modules:string }> = {
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  annualTotal:816,  color:"#3B82F6", modules:"Modules 1–9" },
  accelerator: { label:"Accelerator", monthly:297, annual:208, annualTotal:2496, color:"#8B5CF6", modules:"Modules 1–11" },
  elite:       { label:"Elite",       monthly:697, annual:488, annualTotal:5856, color:"#F5A623", modules:"All 12 Modules" },
};

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams()!;
  const plan     = (params.get("plan") || "foundation") as keyof typeof PLANS;
  const billing  = (params.get("billing") || "monthly") as "monthly"|"annual";
  const nameP    = params.get("name") || "";
  const emailP   = params.get("email") || "";
  const nmlsP    = params.get("nmls") || "";
  const regToken = params.get("reg") || "";

  const planData = PLANS[plan] || PLANS.foundation;
  const price    = billing === "annual" ? planData.annual : planData.monthly;
  const savings  = billing === "annual" ? Math.round((planData.monthly * 12 - planData.annualTotal)) : 0;

  const [password, setPassword] = useState("");
  const [stripeJs, setStripeJs] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [initError, setInitError] = useState("");
  const [step, setStep] = useState<"password"|"payment">("password");
  const paymentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const subIdRef   = useRef("");

  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    if (!pubKey || pubKey === "pk_placeholder") {
      setInitError("Payment system is being configured. Contact support@hivemortgageacademy.com to enroll.");
      setLoadingPayment(false);
      return;
    }
    const load = () => initStripe(pubKey);
    if (!window.Stripe) {
      const s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/";
      s.onload = load;
      document.head.appendChild(s);
    } else { load(); }
  }, []);

  async function initStripe(pubKey: string) {
    const stripeInstance = window.Stripe(pubKey);
    setStripeJs(stripeInstance);
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing, name: nameP, email: emailP, nmls: nmlsP, password: "placeholder", regToken }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setInitError(data.error || "Failed to initialize payment."); setLoadingPayment(false); return; }
      subIdRef.current = data.subscriptionId;
      const els = stripeInstance.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: "night",
          variables: { colorPrimary:"#F5A623", colorBackground:"#0D0D0F", colorText:"#F1F5F9", colorDanger:"#EF4444", fontFamily:"system-ui,sans-serif", borderRadius:"8px" },
          rules: { ".Input": { border:"1px solid #222228", backgroundColor:"#111115", padding:"12px 14px" }, ".Input:focus": { border:"1px solid rgba(245,166,35,0.5)" } },
        },
      });
      setElements(els);
      setLoadingPayment(false);
      setTimeout(() => {
        if (paymentRef.current && !mountedRef.current) {
          els.create("payment", { layout:"tabs", wallets:{ applePay:"auto", googlePay:"auto" } }).mount(paymentRef.current);
          mountedRef.current = true;
        }
      }, 100);
    } catch { setInitError("Failed to load payment form. Please refresh and try again."); setLoadingPayment(false); }
  }

  function handleNext() {
    if (!password || password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setStep("payment");
  }

  async function handlePay() {
    if (!stripeJs || !elements) return;
    setPaying(true); setError("");
    try {
      await fetch("/api/create-subscription", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing, name: nameP, email: emailP, nmls: nmlsP, password, regToken }),
      });
    } catch {}
    const origin = window.location.origin;
    const { error: stripeErr } = await stripeJs.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origin}/payment-success?plan=${plan}&name=${encodeURIComponent(nameP)}&email=${encodeURIComponent(emailP)}&nmls=${encodeURIComponent(nmlsP)}&billing=${billing}&sub=${subIdRef.current}&reg=${regToken}`,
      },
    });
    if (stripeErr) { setError(stripeErr.message || "Payment failed. Please try again."); setPaying(false); }
  }

  const planColor = { foundation:"#3B82F6", accelerator:"#8B5CF6", elite:"#F5A623" }[plan] || "#F5A623";

  return (
    <main style={{ minHeight:"100vh", background:"#08080A", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 20px 80px", fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* Header */}
      <div style={{ width:"100%", maxWidth:480, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"24px 0 32px" }}>
        <a href="/enroll" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8L10 13" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize:13, color:"#64748B" }}>Back</span>
        </a>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M10 1L18.66 6V14L10 19L1.34 14V6L10 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"white", lineHeight:1.1 }}>ZenoPay</div>
            <div style={{ fontSize:9, color:"#374151", letterSpacing:"0.14em", textTransform:"uppercase" }}>Secure Checkout</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#2D2D35" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="4.5" width="10" height="7" rx="1" stroke="#374151" strokeWidth="1.2"/><path d="M4 4.5V3a2 2 0 0 1 4 0v1.5" stroke="#374151" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span style={{ color:"#374151" }}>SSL</span>
        </div>
      </div>

      <div style={{ width:"100%", maxWidth:480 }}>

        {/* Product summary */}
        <div style={{ background:"#0D0D0F", border:"1px solid #1A1A1E", borderRadius:14, padding:"20px 22px", marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:"#374151", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>Subscribing to</div>
              <div style={{ fontSize:16, fontWeight:700, color:"white", marginBottom:3 }}>Hive Mortgage Academy</div>
              <div style={{ fontSize:13, color:planColor, fontWeight:600 }}>{planData.label} · {planData.modules}</div>
              {nameP && <div style={{ fontSize:12, color:"#374151", marginTop:8 }}>{nameP} · {emailP}</div>}
            </div>
            <div style={{ textAlign:"right", flexShrink:0, marginLeft:16 }}>
              <div style={{ fontSize:30, fontWeight:800, color:"white", lineHeight:1 }}>${price}</div>
              <div style={{ fontSize:11, color:"#374151", marginTop:2 }}>{billing === "annual" ? "/ mo, billed annually" : "/ month"}</div>
            </div>
          </div>
          {savings > 0 && (
            <div style={{ marginTop:14, padding:"8px 12px", background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.15)", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#10B981", flexShrink:0 }} />
              <span style={{ fontSize:12, color:"#10B981", fontWeight:600 }}>Annual plan · you save ${savings}/yr vs monthly</span>
            </div>
          )}
        </div>

        {/* Step pills */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, paddingLeft:2 }}>
          {[{s:"password",n:1,l:"Account"},{s:"payment",n:2,l:"Payment"}].map((item,i) => (
            <div key={item.s} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", background:step===item.s?"linear-gradient(135deg,#F5A623,#D4881A)":step==="payment"&&i===0?"#10B981":"#1A1A1E", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:step===item.s?"#0A0A0B":step==="payment"&&i===0?"white":"#374151" }}>
                  {step==="payment"&&i===0?"✓":item.n}
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:step===item.s?"white":"#374151" }}>{item.l}</span>
              </div>
              {i<1&&<div style={{ width:24, height:1, background:"#1A1A1E" }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Password */}
        {step === "password" && (
          <div>
            <div style={{ background:"#0D0D0F", border:"1px solid #1A1A1E", borderRadius:14, padding:"20px 22px", marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Create Account Password</div>
              <input
                type="password" value={password} autoFocus
                onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleNext()}
                placeholder="Minimum 8 characters"
                style={{ width:"100%", background:"#111115", border:`1px solid ${error?"#EF4444":"#222228"}`, borderRadius:8, padding:"13px 16px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
              />
              <div style={{ fontSize:12, color:"#2D2D35", marginTop:8 }}>Used to sign in after payment completes.</div>
              {error && <div style={{ marginTop:10, padding:"10px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:"#EF4444" }}>{error}</div>}
            </div>
            <button onClick={handleNext} disabled={!password} style={{ width:"100%", background:!password?"#111115":"linear-gradient(135deg,#F5A623,#D4881A)", color:!password?"#2D2D35":"#0A0A0B", border:"none", borderRadius:10, padding:"15px", fontSize:15, fontWeight:700, cursor:!password?"not-allowed":"pointer", marginBottom:14 }}>
              Continue to Payment →
            </button>
            {initError && <div style={{ padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:10, fontSize:13, color:"#EF4444" }}>{initError}</div>}
          </div>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && (
          <div>
            <div style={{ background:"#0D0D0F", border:"1px solid #1A1A1E", borderRadius:14, padding:"20px 22px", marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Payment Method</div>
              {loadingPayment && (
                <div style={{ padding:"32px 0", textAlign:"center" }}>
                  <div style={{ width:24, height:24, border:"2px solid #1A1A1E", borderTop:"2px solid #F5A623", borderRadius:"50%", margin:"0 auto 12px", animation:"spin 0.8s linear infinite" }} />
                  <div style={{ fontSize:13, color:"#374151" }}>Loading secure form...</div>
                </div>
              )}
              {initError && <div style={{ padding:"12px 16px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:"#EF4444" }}>{initError}</div>}
              <div ref={paymentRef} style={{ display:loadingPayment?"none":"block", minHeight:160 }} />
            </div>
            {error && <div style={{ padding:"10px 14px", background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, fontSize:13, color:"#EF4444", marginBottom:12 }}>{error}</div>}
            {!loadingPayment && !initError && (
              <button onClick={handlePay} disabled={paying} style={{ width:"100%", background:paying?"#111115":"linear-gradient(135deg,#F5A623,#D4881A)", color:paying?"#2D2D35":"#0A0A0B", border:"none", borderRadius:10, padding:"16px", fontSize:15, fontWeight:700, cursor:paying?"not-allowed":"pointer", marginBottom:12 }}>
                {paying ? (
                  <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <div style={{ width:16, height:16, border:"2px solid #2D2D35", borderTop:"2px solid #64748B", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                    Processing...
                  </span>
                ) : `Pay $${price}/${billing==="annual"?"mo":"month"} →`}
              </button>
            )}
            <button onClick={() => setStep("password")} style={{ background:"none", border:"none", color:"#374151", fontSize:12, cursor:"pointer", width:"100%", paddingBottom:8 }}>← Back to account setup</button>
          </div>
        )}

        {/* Trust row */}
        <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap", marginTop:8 }}>
          {[["🍎","Apple Pay"],["💳","All Cards"],["↩️","Cancel Anytime"],["🔒","256-bit SSL"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#2D2D35" }}><span>{e}</span><span>{l}</span></div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:22, paddingTop:20, borderTop:"1px solid #111115" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:16, height:16, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:3, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="9" height="9" viewBox="0 0 20 20" fill="none"><path d="M10 1L18.66 6V14L10 19L1.34 14V6L10 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize:12, color:"#374151", fontWeight:600 }}>ZenoPay</span>
            </div>
            <span style={{ fontSize:12, color:"#1A1A1E" }}>·</span>
            <span style={{ fontSize:12, color:"#1A1A1E" }}>Secured by Stripe</span>
            <span style={{ fontSize:12, color:"#1A1A1E" }}>·</span>
            <span style={{ fontSize:12, color:"#1A1A1E" }}>Built from Alaska</span>
          </div>
          <div style={{ fontSize:11, color:"#1A1A1E" }}>By completing payment you agree to Hive Mortgage Academy's terms.</div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media(max-width:500px){ main { padding: 0 16px 80px; } }`}</style>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
