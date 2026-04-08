"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const regToken = params.get("reg") || "";
    const subId = params.get("sub") || "";
    const piStatus = params.get("redirect_status");
    if (piStatus && piStatus !== "succeeded") { setStatus("error"); return; }
    if (!regToken || !subId) { setStatus("error"); return; }

    const confirm = async (attempts = 0) => {
      try {
        const res = await fetch("/api/confirm-payment", { method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ subscriptionId:subId, registrationToken:regToken }) });
        const data = await res.json();
        if (data.student) {
          localStorage.setItem("hma_student", JSON.stringify(data.student));
          localStorage.setItem("hma_session_token", data.token || "");
          setStudent(data.student); setStatus("success");
        } else if (attempts < 6) { setTimeout(() => confirm(attempts+1), 2000); }
        else { setStatus("error"); }
      } catch { if (attempts < 6) setTimeout(() => confirm(attempts+1), 2000); else setStatus("error"); }
    };
    confirm();
  }, []);

  if (status === "loading") return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center" }}><div style={{ fontSize:48, marginBottom:16 }}>🐝</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:900, color:"white", marginBottom:8 }}>Setting up your account...</div>
        <div style={{ fontSize:14, color:"#94A3B8" }}>Payment confirmed. Creating your Academy access now.</div>
      </div>
    </main>
  );
  if (status === "error") return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:480 }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
        <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:900, color:"white", marginBottom:10 }}>Payment received!</div>
        <p style={{ fontSize:14, color:"#94A3B8", lineHeight:1.7, marginBottom:24 }}>Your account is being created. You'll receive a welcome email shortly. If you don't hear from us, email <a href="mailto:derekhuit@gmail.com" style={{ color:"#F5A623" }}>derekhuit@gmail.com</a>.</p>
        <a href="/login" style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:700, textDecoration:"none", display:"inline-block" }}>Try Signing In →</a>
      </div>
    </main>
  );
  const modules: Record<string,string> = { foundation:"Modules 1–6", accelerator:"Modules 1–10", elite:"All 12 Modules" };
  return (
    <main style={{ minHeight:"100vh", background:"#0A0A0B", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:520 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:"clamp(26px,5vw,36px)", fontWeight:900, color:"white", marginBottom:12 }}>Welcome{student?.name?`, ${student.name.split(" ")[0]}`:""}!</h1>
        <p style={{ fontSize:15, color:"#CBD5E1", lineHeight:1.7, marginBottom:20 }}>Your Hive Mortgage Academy account is live. Check <strong style={{ color:"#F5A623" }}>{student?.email}</strong> for your welcome email.</p>
        <div style={{ background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.2)", borderRadius:12, padding:"14px 20px", marginBottom:28, display:"inline-block" }}>
          <div style={{ fontSize:13, color:"#F5A623", fontWeight:700 }}>{student?.plan?`${student.plan.charAt(0).toUpperCase()+student.plan.slice(1)} — ${modules[student.plan]||"unlocked"}`:"Access active"}</div>
        </div>
        <div><button onClick={() => router.push("/dashboard?welcome=1")} style={{ background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:12, padding:"16px 40px", fontSize:16, fontWeight:700, cursor:"pointer" }}>Go to My Dashboard →</button></div>
      </div>
    </main>
  );
}
export default function PaymentSuccessPage() { return <Suspense><PaymentSuccessContent /></Suspense>; }
