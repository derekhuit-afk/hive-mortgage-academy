"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetContent() {
  const router = useRouter();
  const params = useSearchParams()!;
  const token = params.get("token") || "";
  const [form, setForm] = useState({ password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!token) router.push("/forgot-password"); }, [token]);

  async function submit() {
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    setError(""); setLoading(true);
    const res = await fetch("/api/confirm-reset", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ token, password: form.password }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Reset failed."); setLoading(false); return; }
    localStorage.setItem("hma_student", JSON.stringify(data.student));
    localStorage.setItem("hma_token", data.token);
    router.push("/dashboard");
  }

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:48, height:48, background:"linear-gradient(135deg,#F5A623,#D4881A)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, margin:"0 auto 12px" }}>🐝</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:"var(--text-primary)" }}>Hive Mortgage Academy</div>
        </div>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:32 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--text-primary)", marginBottom:8 }}>Set new password</h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", marginBottom:24 }}>Choose a strong password for your account.</p>
          {[["New Password","password","Min 8 characters"],["Confirm Password","confirm","Re-enter password"]].map(([l,f,p])=>(
            <div key={f} style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6, display:"block" }}>{l}</label>
              <input type="password" placeholder={p} value={(form as any)[f]} onChange={e=>setForm(fr=>({...fr,[f]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submit()} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#EF4444", fontSize:13, marginBottom:14 }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{ width:"100%", background:loading?"var(--muted)":"linear-gradient(135deg,#F5A623,#D4881A)", color:loading?"var(--text-muted)":"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer" }}>
            {loading ? "Updating..." : "Update Password →"}
          </button>
        </div>
      </div>
    </main>
  );
}
export default function ResetPasswordPage() { return <Suspense><ResetContent /></Suspense>; }
