"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global {
  interface Window { Stripe?: any; }
}

const PLANS: Record<string,{ label:string; monthly:number; annual:number; color:string; modules:string }> = {
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  color:"#3B82F6", modules:"Modules 1–6" },
  accelerator: { label:"Accelerator", monthly:297, annual:208, color:"#8B5CF6", modules:"Modules 1–10" },
  elite:       { label:"Elite",       monthly:697, annual:488, color:"#F5A623", modules:"All 12 Modules" },
};

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = (params.get("plan") || "foundation") as keyof typeof PLANS;
  const billing = (params.get("billing") || "monthly") as "monthly"|"annual";
  const nameP = params.get("name") || "";
  const emailP = params.get("email") || "";
  const nmlsP = params.get("nmls") || "";

  const planData = PLANS[plan] || PLANS.foundation;
  const price = billing === "annual" ? planData.annual : planData.monthly;

  const [stripeJs, setStripeJs] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState(params.get("password") || "");
  const paymentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  // Load Stripe.js
  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pubKey || pubKey === "pk_placeholder") {
      setError("Payment system is being configured. Please try again shortly or contact support.");
      setLoading(false);
      return;
    }
    if (!window.Stripe) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.onload = () => initStripe(pubKey);
      document.head.appendChild(script);
    } else {
      initStripe(pubKey);
    }
  }, []);

  async function initStripe(pubKey: string) {
    const stripeInstance = window.Stripe(pubKey);
    setStripeJs(stripeInstance);

    // Create subscription on server
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing, name: nameP, email: emailP }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error || "Failed to initialize payment."); setLoading(false); return; }

      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);

      // Mount Payment Element
      const appearance = {
        theme: "night",
        variables: {
          colorPrimary: "#F5A623", colorBackground: "#1a1a2e",
          colorText: "#F1F5F9", colorDanger: "#EF4444",
          fontFamily: "system-ui, sans-serif", borderRadius: "10px",
          spacingUnit: "4px",
        },
        rules: { ".Input": { border: "1px solid #2D2D3E", backgroundColor: "#111827" } },
      };

      const els = stripeInstance.elements({
        clientSecret: data.clientSecret,
        appearance,
      });

      const paymentElement = els.create("payment", {
        layout: "tabs",
        wallets: { applePay: "auto", googlePay: "auto" },
      });

      setElements(els);
      setLoading(false);

      // Mount after render
      setTimeout(() => {
        if (paymentRef.current && !mountedRef.current) {
          paymentElement.mount(paymentRef.current);
          mountedRef.current = true;
        }
      }, 100);
    } catch (err) {
      setError("Failed to load payment form. Please try again.");
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!stripeJs || !elements || !clientSecret) return;
    if (!password || password.length < 8) { setError("Please enter a password of at least 8 characters."); return; }
    setPaying(true); setError("");

    try {
      const origin = window.location.origin;
      const { error: stripeErr } = await stripeJs.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${origin}/payment-success?plan=${plan}&name=${encodeURIComponent(nameP)}&email=${encodeURIComponent(emailP)}&nmls=${encodeURIComponent(nmlsP)}&billing=${billing}&sub=${subscriptionId}&pw=${encodeURIComponent(password)}`,
        },
      });

      if (stripeErr) {
        setError(stripeErr.message || "Payment failed. Please try again.");
        setPaying(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setPaying(false);
    }
  }

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"40px 20px 80px" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>

        {/* ZenoPay Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <a href="/enroll" style={{ display:"flex", alignItems:"center", gap:6, color:"#94A3B8", fontSize:13, textDecoration:"none" }}>← Back</a>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⬡</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"white" }}>ZenoPay.ai</div>
              <div style={{ fontSize:9, color:"#4B5563", letterSpacing:"0.1em" }}>SECURE CHECKOUT</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4B5563" }}>
            <span>🔒</span> SSL
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"20px 22px", marginBottom:20 }}>
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
          {billing==="annual" && (
            <div style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#10B981", fontWeight:600 }}>
              ✓ Annual plan — you save 30% vs monthly
            </div>
          )}
          {nameP && <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid #1E1E24", fontSize:13, color:"#94A3B8" }}>For: <strong style={{ color:"white" }}>{nameP}</strong> · {emailP}</div>}
        </div>

        {/* Payment Form */}
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"22px 22px", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:16 }}>Payment Method</div>

          {loading && (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ fontSize:13, color:"#64748B" }}>Loading secure payment form...</div>
            </div>
          )}

          {/* Stripe Payment Element mounts here — Apple Pay, Google Pay, card all appear automatically */}
          <div ref={paymentRef} style={{ display:loading?"none":"block", minHeight:200 }} />

          {!loading && !error && (
            <div style={{ marginTop:20 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>Create Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                style={{ width:"100%", background:"#1E293B", border:"1px solid #2D2D3E", borderRadius:10, padding:"12px 14px", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
              />
              <div style={{ fontSize:11, color:"#4B5563", marginTop:5 }}>Used to sign in to your Academy account.</div>
            </div>
          )}

          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginTop:16 }}>
              {error}
            </div>
          )}
        </div>

        {!loading && !error && (
          <button
            onClick={handlePay}
            disabled={paying}
            style={{ width:"100%", background:paying?"#1E293B":"linear-gradient(135deg,#F5A623,#D4881A)", color:paying?"#64748B":"#0A0A0B", border:`1px solid ${paying?"#2D2D3E":"transparent"}`, borderRadius:12, padding:"16px", fontSize:16, fontWeight:700, cursor:paying?"not-allowed":"pointer", marginBottom:14, transition:"all 0.2s" }}
          >
            {paying ? "Processing payment..." : `Pay $${price} ${billing==="annual"?"/ year":"/ month"} →`}
          </button>
        )}

        {/* Trust badges */}
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {[["🍎","Apple Pay"],["💳","All Cards"],["🔒","256-bit SSL"],["↩️","Cancel Anytime"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#4B5563" }}>
              <span>{e}</span><span>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:"#374151" }}>
          Powered by <span style={{ color:"#F5A623", fontWeight:600 }}>ZenoPay.ai</span> · Secured by Stripe
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return <Suspense><CheckoutContent /></Suspense>;
}
