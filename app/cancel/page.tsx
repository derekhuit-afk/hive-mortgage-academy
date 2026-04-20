"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  id: string;
  name: string;
  email: string;
  plan: string;
};

const TIER_LABEL: Record<string, string> = {
  free: "Free",
  foundation: "Foundation — $97/mo",
  accelerator: "Accelerator — $297/mo",
  elite: "Elite — $697/mo",
};

export default function CancelPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string; periodEnd: string | null } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("hma_student") : null;
      if (!raw) { router.push("/login?next=/cancel"); return; }
      setStudent(JSON.parse(raw));
    } catch { router.push("/login?next=/cancel"); return; }
    setCheckingAuth(false);
  }, [router]);

  async function handleCancel() {
    if (!student) return;
    setError("");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("hma_token") || "";
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error || "Something went wrong. Please try again."); setSubmitting(false); return; }
      setResult({ ok: true, message: data.message, periodEnd: data.periodEnd });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally { setSubmitting(false); }
  }

  async function handlePortal() {
    if (!student) return;
    setPortalLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("hma_token") || "";
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data?.url) { setError(data?.error || "Couldn't open billing portal."); setPortalLoading(false); return; }
      window.location.href = data.url;
    } catch { setError("Network error. Please try again."); setPortalLoading(false); }
  }

  if (checkingAuth) {
    return (
      <main style={{ minHeight: "100vh", background: "#0A0A0B", color: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#F5A623", fontSize: 14 }}>Loading…</div>
      </main>
    );
  }

  const planLabel = student ? (TIER_LABEL[student.plan] || student.plan) : "";
  const isFreePlan = student?.plan === "free";
  const periodEndStr = result?.periodEnd
    ? new Date(result.periodEnd).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0B", color: "#F1F5F9", padding: "48px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <a href="/dashboard" style={{ color: "#94A3B8", fontSize: 13, textDecoration: "none", marginBottom: 16, display: "inline-block" }}>← Back to dashboard</a>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0 6px", lineHeight: 1.2 }}>Cancel your subscription</h1>
        <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 28 }}>One click. No phone call. No forms. You'll keep access through the end of your current billing period.</p>

        {/* Account summary */}
        <div style={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#F5A623", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Your Account</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <tbody>
              <tr><td style={{ padding: "6px 0", color: "#94A3B8", width: 120 }}>Name</td><td style={{ padding: "6px 0", color: "white", fontWeight: 600 }}>{student?.name}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#94A3B8" }}>Email</td><td style={{ padding: "6px 0", color: "white" }}>{student?.email}</td></tr>
              <tr><td style={{ padding: "6px 0", color: "#94A3B8" }}>Current plan</td><td style={{ padding: "6px 0", color: "#F5A623", fontWeight: 700 }}>{planLabel}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Free plan — nothing to cancel */}
        {isFreePlan && !result && (
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
            <p style={{ color: "#10B981", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>You're on the free plan</p>
            <p style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 1.6, margin: 0 }}>There's no billing to cancel. You can keep using the free modules as long as you'd like.</p>
          </div>
        )}

        {/* Success state */}
        {result?.ok && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "22px 24px", marginBottom: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <p style={{ color: "#10B981", fontSize: 16, fontWeight: 700, margin: "0 0 10px" }}>Your subscription is cancelled</p>
            <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>{result.message}</p>
            {periodEndStr && (
              <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>Your access continues through <strong style={{ color: "white" }}>{periodEndStr}</strong>. We won't charge you again.</p>
            )}
            <p style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6, margin: "12px 0 0" }}>We've also emailed you a confirmation.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <a href="/dashboard" style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", padding: "11px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", minHeight: 44, display: "inline-flex", alignItems: "center" }}>Back to dashboard →</a>
            </div>
          </div>
        )}

        {/* Primary cancel UI — only when not free and not already cancelled */}
        {!isFreePlan && !result && (
          <>
            {!confirming && (
              <div style={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 12, padding: "22px 24px", marginBottom: 14 }}>
                <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>Click below to cancel. Your access continues until your next billing date, and you won't be charged again.</p>
                <button
                  onClick={() => setConfirming(true)}
                  style={{ background: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "white", border: "none", padding: "13px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", minHeight: 44, width: "100%" }}
                >
                  Cancel my subscription
                </button>
              </div>
            )}

            {confirming && (
              <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "22px 24px", marginBottom: 14 }}>
                <p style={{ color: "white", fontSize: 15, fontWeight: 700, margin: "0 0 10px" }}>Are you sure?</p>
                <p style={{ color: "#CBD5E1", fontSize: 13, lineHeight: 1.7, margin: "0 0 14px" }}>You'll keep access to your current modules until the end of your billing period, then move to the free tier. Your progress, certificates, and HivePass stay with you forever.</p>

                <label style={{ display: "block", color: "#94A3B8", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Optional — what didn't work? (Helps us improve)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Too expensive, not enough time, found something else, etc."
                  style={{ width: "100%", background: "#0A0A0B", border: "1px solid #1E1E24", borderRadius: 8, color: "white", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", marginBottom: 14 }}
                />

                {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    style={{ background: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "white", border: "none", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: submitting ? "wait" : "pointer", minHeight: 44, flex: "1 1 200px", opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? "Cancelling…" : "Yes, cancel my subscription"}
                  </button>
                  <button
                    onClick={() => { setConfirming(false); setError(""); }}
                    disabled={submitting}
                    style={{ background: "transparent", color: "#CBD5E1", border: "1px solid #1E1E24", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 44, flex: "1 1 140px" }}
                  >
                    Keep my access
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Secondary — Stripe Billing Portal for invoices, card updates, etc. */}
        {!isFreePlan && (
          <div style={{ background: "#111114", border: "1px solid #1E1E24", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
            <p style={{ color: "white", fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>Or manage billing & invoices</p>
            <p style={{ color: "#94A3B8", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px" }}>View invoices, update your card, or cancel via Stripe's secure billing portal.</p>
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              style={{ background: "transparent", color: "#F5A623", border: "1px solid rgba(245,166,35,0.4)", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: portalLoading ? "wait" : "pointer", minHeight: 44, opacity: portalLoading ? 0.7 : 1 }}
            >
              {portalLoading ? "Opening…" : "Open Stripe Billing Portal →"}
            </button>
          </div>
        )}

        {/* Legal footer */}
        <div style={{ borderTop: "1px solid #1E1E24", marginTop: 28, paddingTop: 18, color: "#64748B", fontSize: 11, lineHeight: 1.6 }}>
          Cancellation is effective at the end of your current billing period. No partial refunds are issued for unused time, except where required by law. See our <a href="/terms" style={{ color: "#94A3B8", textDecoration: "underline" }}>Terms of Service</a> §6–§7 for full details.
        </div>
      </div>
    </main>
  );
}
