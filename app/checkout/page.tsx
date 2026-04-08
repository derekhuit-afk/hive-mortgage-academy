"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global { interface Window { Stripe?: any; } }

const PLANS: Record<string,{ label:string; monthly:number; annual:number; color:string; modules:string }> = {
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  color:"#3B82F6", modules:"Modules 7–9" },
  accelerator: { label:"Accelerator", monthly:297, annual:208, color:"#8B5CF6", modules:"Modules 10–11" },
  elite:       { label:"Elite",       monthly:697, annual:488, color:"#F5A623", modules:"All 12 Modules" },
};

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan     = (params.get("plan") || "foundation") as keyof typeof PLANS;
  const billing  = (params.get("billing") || "monthly") as "monthly"|"annual";
  const nameP    = params.get("name") || "";
  const emailP   = params.get("email") || "";
  const nmlsP    = params.get("nmls") || "";

  const planData = PLANS[plan] || PLANS.foundation;
  const price    = billing === "annual" ? planData.annual : planData.monthly;

  const [password, setPassword] = useState("");
  const [stripeJs, setStripeJs] = useState<any>(null);
  const [elements, setElements]  = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [paying, setPaying]  = useState(false);
  const [error, setError]    = useState("");
  const [initError, setInitError] = useState("");
  const paymentRef  = useRef<HTMLDivElement>(null);
  const mountedRef  = useRef(false);
  const subIdRef    = useRef("");

  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
    if (!pubKey || pubKey === "pk_placeholder") {
      setInitError("Payment system is being configured. Please contact support.");
      setLoadingPayment(false);
      return;
    }
    const load = () => initStripe(pubKey);
    if (!window.Stripe) {
      const s = document.createElement("script");
      s.src = "https://js.stripe.com/v3/";
      s.onload = load;
      document.head.appendChild(s);
    } else {
      load();
    }
  }, []);

  async function initStripe(pubKey: string) {
    const stripeInstance = window.Stripe(pubKey);
    setStripeJs(stripeInstance);

    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing, name: nameP, email: emailP, nmls: nmlsP, password: password || "placeholder_will_be_replaced" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setInitError(data.error || "Failed to initialize payment.");
        setLoadingPayment(false);
        return;
      }
      subIdRef.current = data.subscriptionId;

      const els = stripeInstance.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: "night",
          variables: { colorPrimary:"#F5A623", colorBackground:"#1a1a2e", colorText:"#F1F5F9", colorDanger:"#EF4444", fontFamily:"system-ui,sans-serif", borderRadius:"10px" },
          rules: { ".Input": { border:"1px solid #2D2D3E", backgroundColor:"#111827" } },
        },
      });
      setElements(els);
      setLoadingPayment(false);

      setTimeout(() => {
        if (paymentRef.current && !mountedRef.current) {
          els.create("payment", { layout:"tabs", wallets:{ applePay:"auto", googlePay:"auto" } })
             .mount(paymentRef.current);
          mountedRef.current = true;
        }
      }, 100);
    } catch (err) {
      setInitError("Failed to load payment form. Please refresh and try again.");
      setLoadingPayment(false);
    }
  }

  async function handlePay() {
    if (!stripeJs || !elements) return;
    if (!password || password.length < 8) {
      setError("Please enter a password of at least 8 characters.");
      return;
    }
    setPaying(true); setError("");

    // Update the pending registration with the actual password before confirming
    try {
      await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing, name: nameP, email: emailP, nmls: nmlsP, password }),
      });
    } catch {}

    const origin = window.location.origin;
    const { error: stripeErr } = await stripeJs.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${origin}/payment-success?plan=${plan}&name=${encodeURIComponent(nameP)}&email=${encodeURIComponent(emailP)}&nmls=${encodeURIComponent(nmlsP)}&billing=${billing}&sub=${subIdRef.current}`,
      },
    });

    if (stripeErr) { setError(stripeErr.message || "Payment failed. Please try again."); setPaying(false); }
  }

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"40px 20px 80px" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <a href="/enroll" style={{ display:"flex", alignItems:"center", gap:6, color:"#94A3B8", fontSize:13, textDecoration:"none" }}>← Back</a>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⬡</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"white" }}>ZenoPay.ai</div>
              <div style={{ fontSize:9, color:"#4B5563", letterSpacing:"0.1em" }}>SECURE CHECKOUT</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4B5563" }}>🔒 SSL</div>
        </div>

        {/* Order summary */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"18px 22px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#64748B", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Order Summary</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"white" }}>Hive Mortgage Academy</div>
              <div style={{ fontSize:13, color:planData.color, fontWeight:600 }}>{planData.label} — {planData.modules}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:900, color:"white" }}>${price}</div>
              <div style={{ fontSize:11, color:"#64748B" }}>/{billing==="annual"?"year":"month"}</div>
            </div>
          </div>
          {billing==="annual" && <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#10B981", fontWeight:600 }}>✓ Annual plan — 30% savings vs monthly</div>}
          {nameP && <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid #1E1E24", fontSize:13, color:"#94A3B8" }}>For: <strong style={{ color:"white" }}>{nameP}</strong> · {emailP}</div>}
        </div>

        {/* Password — ABOVE payment element so it's visible */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:14, padding:"18px 20px", marginBottom:14 }}>
          <label style={{ fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, display:"block" }}>Create Your Password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); if (error && e.target.value.length >= 8) setError(""); }}
            placeholder="Minimum 8 characters"
            style={{ width:"100%", background:"#1E293B", border:`1px solid ${error ? "#EF4444" : "#2D2D3E"}`, borderRadius:10, padding:"12px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
          <div style={{ fontSize:11, color:"#4B5563", marginTop:6 }}>Used to sign in to your Hive Mortgage Academy account after payment.</div>
          {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginTop:10 }}>{error}</div>}
        </div>

        {/* Stripe Payment Element */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:14, padding:"18px 20px", marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Payment Method</div>
          {loadingPayment && (
            <div style={{ textAlign:"center", padding:"28px 0", color:"#64748B", fontSize:13 }}>Loading secure payment form...</div>
          )}
          {initError && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"12px 16px", color:"#EF4444", fontSize:13 }}>{initError}</div>
          )}
          <div ref={paymentRef} style={{ display:loadingPayment?"none":"block", minHeight:160 }} />
        </div>

        {!loadingPayment && !initError && (
          <button
            onClick={handlePay}
            disabled={paying}
            style={{ width:"100%", background:paying?"#1E293B":"linear-gradient(135deg,#F5A623,#D4881A)", color:paying?"#64748B":"#0A0A0B", border:`1px solid ${paying?"#2D2D3E":"transparent"}`, borderRadius:12, padding:"16px", fontSize:16, fontWeight:700, cursor:paying?"not-allowed":"pointer", marginBottom:16 }}
          >
            {paying ? "Processing..." : `Pay $${price}/${billing==="annual"?"year":"month"} →`}
          </button>
        )}

        {/* Trust badges */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {[["🍎","Apple Pay"],["💳","All Cards"],["🔒","256-bit SSL"],["↩️","Cancel Anytime"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#4B5563" }}><span>{e}</span><span>{l}</span></div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#374151" }}>
          Powered by <span style={{ color:"#F5A623", fontWeight:600 }}>ZenoPay.ai</span> · Secured by Stripe
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
