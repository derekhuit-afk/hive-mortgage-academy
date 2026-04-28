"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Msg { role: "user" | "assistant"; content: string; ts: number; }

const LOCAL_KEY = "hma_aiderek_history";
const MAX_HISTORY = 50; // hard cap on stored messages

const STARTERS = [
  "I had two deals fall apart this week and I'm losing my drive — how do I reset?",
  "I keep saying I'll call past clients and never do. What's the system to actually do it?",
  "My pipeline is empty next month. Where do I focus my time this week?",
  "How do I stop being intimidated by experienced Realtors when I introduce myself?",
  "I'm in a slump — three weeks of no closings. What should I check first?",
  "How do I structure my morning to actually get the calls done?",
];

export default function AiDerekPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMessages(parsed.slice(-MAX_HISTORY));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(messages.slice(-MAX_HISTORY))); } catch {}
  }, [messages, hydrated]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: text, ts: Date.now() }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/ai-derek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.content || "I'm having trouble responding right now. Try again.";
      setMessages(m => [...m, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection failed. Try again.", ts: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    if (confirm("Clear the entire conversation history?")) {
      setMessages([]);
      try { localStorage.removeItem(LOCAL_KEY); } catch {}
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 880, width: "100%", margin: "0 auto", padding: "24px 20px 0", minHeight: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>Coaching Agent</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,3.5vw,36px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 8 }}>
            AI Derek
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 700, lineHeight: 1.55 }}>
            Mindset, accountability, business strategy, and sales psychology — Derek-voiced.
            <span style={{ color: "var(--text-muted)" }}> Not a substitute for compliance, product, or rate questions; those go to your manager or to Derek directly.</span>
          </p>
        </div>

        {/* Scope notice */}
        <div style={{ background: "rgba(245,166,35,0.05)", border: "1px solid rgba(245,166,35,0.18)", borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          <strong style={{ color: "var(--honey)" }}>What this is for: </strong>
          getting unstuck, building habits, planning your week, frame-setting on hard partner conversations, recovering from slumps.
          <strong style={{ color: "var(--honey)", marginLeft: 8 }}>What it&apos;s not for: </strong>
          rate quoting, RESPA/TRID/ECOA interpretation, DTI math, fair-lending judgment calls, or anything specific to a real borrower&apos;s file.
        </div>

        {/* Conversation */}
        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 12, minHeight: 320 }}>
          {messages.length === 0 ? (
            <div style={{ padding: "20px 4px" }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Try one of these to start</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {STARTERS.map((s, i) => (
                  <button key={i} onClick={() => send(s)}
                    style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5, textAlign: "left" as const, cursor: "pointer", fontFamily: "inherit" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {messages.map((m, i) => <Bubble key={i} m={m} />)}
              {loading && <Bubble m={{ role: "assistant", content: "…", ts: 0 }} thinking />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 12, marginBottom: 16 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); } }}
            placeholder="Ask AI Derek — Cmd/Ctrl+Enter to send"
            rows={2}
            style={{ width: "100%", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "none", outline: "none", padding: "6px 8px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6, gap: 8, flexWrap: "wrap" }}>
            <button onClick={clearChat} disabled={messages.length === 0}
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: messages.length === 0 ? "not-allowed" : "pointer" }}>
              Clear chat
            </button>
            <button onClick={() => send()} disabled={!input.trim() || loading}
              style={{ background: input.trim() && !loading ? "linear-gradient(135deg,#F5A623,#D4881A)" : "var(--ink)", color: input.trim() && !loading ? "#0A0A0B" : "var(--text-muted)", border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "not-allowed" }}>
              {loading ? "Thinking…" : "Send →"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function Bubble({ m, thinking }: { m: Msg; thinking?: boolean }) {
  const isUser = m.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
      <div style={{
        maxWidth: "85%",
        background: isUser ? "rgba(245,166,35,0.14)" : "var(--ink)",
        border: `1px solid ${isUser ? "rgba(245,166,35,0.30)" : "var(--border)"}`,
        borderRadius: 14, padding: "12px 14px",
        fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}>
        {!isUser && (
          <div style={{ fontSize: 10, color: "var(--honey)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>AI Derek</div>
        )}
        {thinking ? <span style={{ color: "var(--text-muted)" }}>thinking…</span> : m.content}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>Hive Mortgage Academy</Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
