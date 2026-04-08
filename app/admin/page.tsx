"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin?secret=${secret}`);
    if (!res.ok) { alert("Invalid secret."); setLoading(false); return; }
    const data = await res.json();
    setStudents(data.students || []);
    setAuthed(true); setLoading(false);
  }

  const filtered = filter === "all" ? students : students.filter(s => s.plan === filter);
  const revenue = students.filter(s=>s.plan!=="free").reduce((sum,s)=>{ const prices:Record<string,number>={foundation:97,accelerator:297,elite:697}; return sum+(prices[s.plan]||0); },0);

  if (!authed) return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:380, background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:20, padding:32 }}>
        <div style={{ fontSize:32, textAlign:"center", marginBottom:16 }}>🐝</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:900, color:"var(--text-primary)", marginBottom:20, textAlign:"center" }}>HMA Admin</h2>
        <input type="password" placeholder="Admin secret" value={secret} onChange={e=>setSecret(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} style={{ width:"100%", background:"var(--slate)", border:"1px solid var(--border)", borderRadius:8, padding:"12px 14px", color:"var(--text-primary)", fontSize:14, outline:"none", marginBottom:14, boxSizing:"border-box" }} />
        <button onClick={load} disabled={loading} style={{ width:"100%", background:"linear-gradient(135deg,#F5A623,#D4881A)", color:"#0A0A0B", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer" }}>{loading?"Loading...":"Enter →"}</button>
      </div>
    </main>
  );

  const fmt = (s: string) => s ? new Date(s).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—";
  const planColor: Record<string,string> = { free:"#10B981", foundation:"#3B82F6", accelerator:"#8B5CF6", elite:"#F5A623" };

  return (
    <main style={{ minHeight:"100vh", background:"var(--obsidian)", padding:"32px 24px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"var(--text-primary)" }}>🐝 HMA Admin</h1>
          <a href="/dashboard" style={{ fontSize:13, color:"var(--honey)", textDecoration:"none" }}>← Dashboard</a>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }} className="admin-stats">
          {[["Total Students",students.length,""],["Paid Students",students.filter(s=>s.plan!=="free").length,""],["MRR",`$${revenue.toLocaleString()}/mo`,""],["Free Tier",students.filter(s=>s.plan==="free").length,""]].map(([l,v])=>(
            <div key={String(l)} style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"var(--honey)" }}>{v}</div>
              <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["all","free","foundation","accelerator","elite"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 14px", borderRadius:100, border:`1px solid ${filter===f?planColor[f]||"var(--honey)":"var(--border)"}`, background:filter===f?`${planColor[f]||"#F5A623"}15`:"transparent", color:filter===f?planColor[f]||"var(--honey)":"var(--text-muted)", fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{f}</button>
          ))}
        </div>
        <div style={{ background:"var(--charcoal)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ borderBottom:"1px solid var(--border)" }}>
              {["Name","Email","NMLS","Plan","Joined","Modules"].map(h=>(
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((s,i)=>(
                <tr key={s.id} style={{ borderBottom:"1px solid var(--border)", background: i%2===0?"transparent":"rgba(255,255,255,0.01)" }}>
                  <td style={{ padding:"12px 16px", fontSize:14, fontWeight:600, color:"var(--text-primary)" }}>{s.name}</td>
                  <td style={{ padding:"12px 16px" }}><a href={`mailto:${s.email}`} style={{ fontSize:13, color:"var(--honey)", textDecoration:"none" }}>{s.email}</a></td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-secondary)" }}>{s.nmls_number ? `#${s.nmls_number}` : "—"}</td>
                  <td style={{ padding:"12px 16px" }}><span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, background:`${planColor[s.plan]||"#64748B"}15`, color:planColor[s.plan]||"#64748B", border:`1px solid ${planColor[s.plan]||"#64748B"}30`, textTransform:"capitalize" }}>{s.plan}</span></td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-secondary)" }}>{fmt(s.created_at)}</td>
                  <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-secondary)" }}>{s.completed_count || 0}/{s.tier_limit || 3}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding:"32px", textAlign:"center", color:"var(--text-muted)", fontSize:14 }}>No students in this tier.</div>}
        </div>
        <style>{`@media(max-width:700px){.admin-stats{grid-template-columns:repeat(2,1fr)!important}}`}</style>
      </div>
    </main>
  );
}
