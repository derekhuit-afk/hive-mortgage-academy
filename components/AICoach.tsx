"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const STARTER_MESSAGES: Message[] = [
  { role: "assistant", content: "Welcome to Hive Mortgage Academy! I'm your AI mortgage coach — powered by 18+ years of real LO experience. Ask me anything about loan products, pipeline building, Realtor relationships, compliance, or what to do on Day 1. What's on your mind?" }
];

const SYSTEM_PROMPT = `You are an expert mortgage loan officer coach with 18+ years of experience and over $1 billion in career production. You trained at the highest levels of the mortgage industry and now run Hive Mortgage Academy — a training platform for newly licensed loan officers.

Your coaching style is direct, practical, and encouraging. You give specific, actionable advice — not generic platitudes. You know the real-world mortgage industry inside and out: loan products (FHA, VA, Conventional, USDA, Jumbo), pipeline management, Realtor relationships, compliance (RESPA, TRID, ECOA), credit analysis, and the daily habits of top producers.

When someone asks you a question:
- Give a concrete, specific answer
- Use real examples when possible
- Keep responses concise but complete (3-5 short paragraphs max)
- End with an actionable next step or follow-up question
- Speak like a mentor, not a textbook

You are part of Hive Mortgage Academy, powered by Huit.AI.`;

export default function AICoach() {
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "How do I get my first Realtor referral?",
    "What's the difference between FHA and Conventional?",
    "How do I structure my first week as an LO?",
    "What should I say to a borrower who got declined?",
  ];

  return (
    <section id="ai-coach" style={{ padding: "100px 24px", background: "var(--charcoal)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Live Demo</div>
          <h2 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 14 }}>
            Your AI Mortgage Coach
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
            Ask anything. Get real answers — like talking to a $1B producer.
          </p>
        </div>

        {/* Chat window */}
        <div style={{
          background: "var(--obsidian)", border: "1px solid var(--border)",
          borderRadius: 20, overflow: "hidden",
          boxShadow: "0 0 60px rgba(245,166,35,0.06)",
        }}>
          {/* Header */}
          <div style={{
            background: "var(--slate)", padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #F5A623, #D4881A)",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🐝</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Hive AI Coach</div>
              <div style={{ fontSize: 12, color: "#10B981" }}>● Online — Ready to coach</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ height: 360, overflowY: "auto", padding: "24px 24px 16px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 16,
              }}>
                <div style={{
                  maxWidth: "80%",
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #F5A623, #D4881A)"
                    : "var(--slate)",
                  color: msg.role === "user" ? "#0A0A0B" : "var(--text-primary)",
                  padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 14, lineHeight: 1.6,
                  border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
                <div style={{
                  background: "var(--slate)", border: "1px solid var(--border)",
                  padding: "12px 20px", borderRadius: "16px 16px 16px 4px",
                }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "var(--honey)",
                        animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  fontSize: 12, padding: "6px 12px", borderRadius: 100,
                  background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)",
                  color: "var(--honey)", cursor: "pointer", transition: "background 0.2s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(245,166,35,0.15)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(245,166,35,0.08)")}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "16px 24px", borderTop: "1px solid var(--border)",
            display: "flex", gap: 12,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask your AI coach anything..."
              style={{
                flex: 1, background: "var(--slate)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "12px 16px",
                color: "var(--text-primary)", fontSize: 14, outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => (e.target.style.borderColor = "var(--honey)")}
              onBlur={e => (e.target.style.borderColor = "var(--border)")}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              background: input.trim() ? "linear-gradient(135deg, #F5A623, #D4881A)" : "var(--muted)",
              color: input.trim() ? "#0A0A0B" : "var(--text-muted)",
              border: "none", borderRadius: 10, padding: "12px 20px",
              fontSize: 14, fontWeight: 700, cursor: input.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}>Send →</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
