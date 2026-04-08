"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function CertificatePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [certNumber, setCertNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    issueCertificate(s);
  }, []);

  async function issueCertificate(s: any) {
    try {
      const res = await fetch("/api/certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: s.id }),
      });
      const data = await res.json();
      setCertNumber(data.certificateNumber || `HMA-${Date.now()}`);
      setIssueDate(new Date(data.issuedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    } catch {
      setCertNumber(`HMA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
      setIssueDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    }
    setLoading(false);
  }

  function handlePrint() { window.print(); }

  if (loading || !student) return (
    <div style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--honey)", fontSize: 18 }}>Generating your certificate...</div>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Back to Dashboard</button>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handlePrint} style={{ background: "var(--charcoal)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        {/* Certificate */}
        <div ref={printRef} style={{
          background: "linear-gradient(145deg, #0F0F10 0%, #1A1A1C 50%, #0F0F10 100%)",
          border: "1px solid var(--border)",
          borderRadius: 24, padding: "64px 72px", textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: "0 0 100px rgba(245,166,35,0.08)",
        }} className="cert-card">
          {/* Corner decorations */}
          {[["top:20px", "left:20px"], ["top:20px", "right:20px"], ["bottom:20px", "left:20px"], ["bottom:20px", "right:20px"]].map((pos, i) => (
            <div key={i} style={{
              position: "absolute", width: 48, height: 48,
              ...Object.fromEntries(pos.map(p => p.split(":"))),
              border: "2px solid rgba(245,166,35,0.3)",
              borderRadius: 4,
            }} />
          ))}

          {/* Hex pattern background */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-2l26-15V18L28 2 2 18v31l26 15z' fill='%23F5A623'/%3E%3C/svg%3E")`,
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🐝</div>
              <div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>Hive Mortgage Academy</div>
                <div style={{ fontSize: 10, color: "var(--honey)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Powered by Huit.AI</div>
              </div>
            </div>

            {/* Title */}
            <div style={{ fontSize: 12, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>Certificate of Completion</div>

            <div style={{ width: 80, height: 2, background: "linear-gradient(90deg,transparent,#F5A623,transparent)", margin: "0 auto 28px" }} />

            <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 12 }}>This certifies that</p>

            <h1 className="font-display" style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 8px" }}>{student.name}</h1>

            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>NMLS License #{student.nmls_number}</div>

            <div style={{ width: 80, height: 2, background: "linear-gradient(90deg,transparent,#F5A623,transparent)", margin: "0 auto 28px" }} />

            <p style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 6 }}>has successfully completed</p>

            <div className="font-display" style={{ fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, color: "var(--honey)", margin: "8px 0 20px" }}>
              Hive Mortgage Academy — Foundation Program
            </div>

            <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>
              A comprehensive 6-module training program covering loan products, pipeline building, compliance, borrower conversations, and AI-powered mortgage tools.
            </p>

            {/* Modules completed */}
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
              {["Day 1 Foundations", "Loan Products", "Referral Pipeline", "CRM & Tech", "Borrower Conversations", "Compliance 101"].map(m => (
                <div key={m} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 100, background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.2)", color: "var(--text-secondary)" }}>✓ {m}</div>
              ))}
            </div>

            <div style={{ width: 120, height: 1, background: "var(--border)", margin: "0 auto 32px" }} />

            {/* Footer row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 500, margin: "0 auto" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Derek Huit</div>
                <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 6 }} />
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Founder & Instructor</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>NMLS #— · $1B+ Production</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{issueDate}</div>
                <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 6 }} />
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Date of Issue</div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--honey)", marginBottom: 4, fontFamily: "monospace" }}>{certNumber}</div>
                <div style={{ width: "100%", height: 1, background: "var(--border)", marginBottom: 6 }} />
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Certificate ID</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Share your achievement on LinkedIn with hashtag <span style={{ color: "var(--honey)" }}>#HiveMortgageAcademy</span> · Built from Alaska 🏔️</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          nav, button { display: none !important; }
          .cert-card { box-shadow: none !important; border: 2px solid #F5A623 !important; }
        }
        @media (max-width: 640px) {
          .cert-card { padding: 32px 24px !important; }
        }
      `}</style>
    </main>
  );
}
