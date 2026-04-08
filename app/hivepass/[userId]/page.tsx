"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function HivePassPage() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get cert data from API
    fetch(`/api/certificate?userId=${params.userId}`)
      .then(r => r.json())
      .then(d => { setStudent(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.userId]);

  if (loading) return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "var(--honey)", fontSize: 16 }}>Loading HivePass...</div>
    </main>
  );

  if (!student?.name) return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐝</div>
        <div style={{ color: "var(--text-primary)", fontSize: 18, marginBottom: 8 }}>HivePass not found</div>
        <a href="/" style={{ color: "var(--honey)", fontSize: 14 }}>Learn about Hive Mortgage Academy</a>
      </div>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        <div style={{ background: "var(--charcoal)", border: "2px solid rgba(245,166,35,0.5)", borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 0 80px rgba(245,166,35,0.12)" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🐝</div>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>Hive Mortgage Academy</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 900, color: "var(--text-primary)", marginBottom: 20 }}>HivePass™</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: "var(--honey)", marginBottom: 6 }}>{student.name}</div>
          {student.nmls_number && <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>NMLS #{student.nmls_number}</div>}
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
            Completed the Hive Mortgage Academy curriculum — mastering loan products, borrower consultation, payment-first methodology, and compliance.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--honey)" }}>2026</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Completed</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "var(--honey)" }}>⬡</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Huit.AI</div>
            </div>
          </div>
          <a href="/" style={{ display: "inline-block", background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Learn About Hive Mortgage Academy →</a>
        </div>
      </div>
    </main>
  );
}
