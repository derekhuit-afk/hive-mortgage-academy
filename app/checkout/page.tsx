"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

declare global { interface Window { Stripe?: any; } }

const PLANS: Record<string,{ label:string; monthly:number; annual:number; color:string }> = {
  foundation:  { label:"Foundation",  monthly:97,  annual:68,  color:"#3B82F6" },
  accelerator: { label:"Accelerator", monthly:297, annual:208, color:"#8B5CF6" },
  elite:       { label:"Elite",       monthly:697, annual:488, color:"#F5A623" },
};

function CheckoutContent() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan") || "foundation";
  const billing = (params.get("billing") || "monthly") as "monthly"|"annual";
  const regToken = params.get("reg") || "";
  const nameP = params.get("name") || "";
  const emailP = params.get("email") || "";
  const planData = PLANS[plan] || PLANS.foundation;
  const price = billing==="annual" ? planData.annual : planData.monthly;
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [stripeJs, setStripeJs] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const paymentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pubKey || pubKey==="pk_placeholder") { setError("Payment system initializing. Please try again."); setLoading(false); return; }
    if (!regToken) { setError("Registration session missing. Please go back and try again."); setLoading(false); return; }
    const script = document.createElement("script"); script.src="https://js.stripe.com/v3/";
    script.onload = () => initStripe(pubKey); document.head.appendChild(script);
  }, []);

  async function initStripe(pubKey: string) {
    const s = window.Stripe(pubKey); setStripeJs(s);
    try {
      const res = await fetch("/api/create-subscription", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ plan, billing, name:nameP, email:emailP }) });
      const data = await res.json();
      if (!res.ok||data.error) { setError(data.error||"Failed to initialize payment."); setLoading(false); return; }
      setSubscriptionId(data.subscriptionId);
      const els = s.elements({ clientSecret:data.clientSecret, appearance:{ theme:"night", variables:{ colorPrimary:"#F5A623", colorBackground:"#1a1a2e", colorText:"#F1F5F9", fontFamily:"system-ui, sans-serif", borderRadius:"10px" }, rules:{".Input":{border:"1px solid #2D2D3E",backgroundColor:"#111827"}} }});
      const pe = els.create("payment", { layout:"tabs", wallets:{applePay:"auto",googlePay:"auto"} });
      setElements(els); setLoading(false);
      setTimeout(() => { if (paymentRef.current&&!mountedRef.current) { pe.mount(paymentRef.current); mountedRef.current=true; } }, 100);
    } catch { setError("Failed to load payment form."); setLoading(false); }
  }

  async function handlePay() {
    if (!stripeJs||!elements) return;
    setPaying(true); setError("");
    const origin = window.location.origin;
    // Pass registration token (not password) in return URL
    const { error: stripeErr } = await stripeJs.confirmPayment({ elements, confirmParams: {
      return_url: `${origin}/payment-success?reg=${regToken}&sub=${subscriptionId}`,
    }});
    if (stripeErr) { setError(stripeErr.message||"Payment failed."); setPaying(false); }
  }

  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", padding:"40px 20px 80px" }}>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
          <a href="/enroll" style={{ color:"#94A3B8", fontSize:13, textDecoration:"none" }}>← Back</a>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⬡</div>
            <div><div style={{ fontSize:13, fontWeight:700, color:"white" }}>ZenoPay.ai</div><div style={{ fontSize:9, color:"#4B5563", letterSpacing:"0.1em" }}>SECURE CHECKOUT</div></div>
          </div>
          <div style={{ fontSize:11, color:"#4B5563" }}>🔒 SSL</div>
        </div>
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"20px 22px", marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#64748B", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Order Summary</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:"white" }}>Hive Mortgage Academy</div>
              <div style={{ fontSize:13, color:planData.color, fontWeight:600 }}>{planData.label}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:24, fontWeight:900, color:"white" }}>${price}</div>
              <div style={{ fontSize:11, color:"#64748B" }}>/{billing==="annual"?"year":"month"}</div>
            </div>
          </div>
          {nameP&&<div style={{ paddingTop:10, borderTop:"1px solid #1E1E24", fontSize:13, color:"#94A3B8" }}>For: <strong style={{ color:"white" }}>{nameP}</strong> · {emailP}</div>}
        </div>
        <div style={{ background:"#111114", border:"1px solid #1E1E24", borderRadius:16, padding:"22px", marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"white", marginBottom:16 }}>Payment Method</div>
          {loading&&<div style={{ textAlign:"center", padding:"32px 0", fontSize:13, color:"#64748B" }}>Loading secure payment form...</div>}
          <div ref={paymentRef} style={{ display:loading?"none":"block", minHeight:loading?0:200 }} />
          {error&&<div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginTop:16 }}>{error}</div>}
        </div>
        {!loading&&!error&&<button onClick={handlePay} disabled={paying} style={{ width:"100%", background:paying?"#1E293B":"linear-gradient(135deg,#F5A623,#D4881A)", color:paying?"#64748B":"#0A0A0B", border:`1px solid ${paying?"#2D2D3E":"transparent"}`, borderRadius:12, padding:"16px", fontSize:16, fontWeight:700, cursor:paying?"not-allowed":"pointer", marginBottom:14 }}>
          {paying?"Processing...": `Pay $${price} ${billing==="annual"?"/ year":"/ month"} →`}
        </button>}
        <div style={{ display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {[["🍎","Apple Pay"],["💳","All Cards"],["🔒","256-bit SSL"],["↩️","Cancel Anytime"]].map(([e,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#4B5563" }}><span>{e}</span><span>{l}</span></div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:16, fontSize:11, color:"#374151" }}>Powered by <span style={{ color:"#F5A623", fontWeight:600 }}>ZenoPay.ai</span> · Secured by Stripe</div>
      </div>
    </main>
  );
}
export default function CheckoutPage() { return <Suspense><CheckoutContent /></Suspense>; }
