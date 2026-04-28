"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  SCRIPTS, CATEGORY_LABELS, searchScripts,
  type Script, type ScriptCategory,
} from "@/lib/scripts";

type Tab = "library" | "rolePlay";
type Mode = "text" | "voice";
interface Msg { role: "user" | "assistant"; content: string; }

const ALL_CATS = Object.keys(CATEGORY_LABELS) as ScriptCategory[];

export default function ScriptsPage() {
  const [tab, setTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<ScriptCategory | "all">("all");
  const [openScriptId, setOpenScriptId] = useState<string | null>(null);

  // Role-play state
  const [scenarioScript, setScenarioScript] = useState<Script | null>(null);
  const [history, setHistory] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>("");
  const [mode, setMode] = useState<Mode>("text");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Detect Web Speech API support
  useEffect(() => {
    const SR = (typeof window !== "undefined") && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setVoiceSupported(!!SR);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, feedback]);

  const filtered = useMemo(() => {
    return searchScripts(query, activeCat === "all" ? undefined : activeCat);
  }, [query, activeCat]);

  const openScript = filtered.find(s => s.id === openScriptId) || SCRIPTS.find(s => s.id === openScriptId);

  function startRolePlay(s: Script) {
    if (!s.rolePlayPersona) {
      alert("Role-play not available for this script (no persona defined).");
      return;
    }
    setScenarioScript(s);
    setHistory([]);
    setInput("");
    setFeedback("");
    setTab("rolePlay");
    // Have the AI open the conversation in character
    void aiTurn(s, []);
  }

  async function aiTurn(s: Script, hist: Msg[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/role-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: s.rolePlayPersona,
          scenario: s.scenario,
          scriptTitle: s.title,
          history: hist,
        }),
      });
      const data = await res.json();
      if (data.content) {
        const next: Msg = { role: "assistant", content: data.content };
        setHistory(prev => [...prev, next]);
        // Speak it if voice mode
        if (mode === "voice" && typeof window !== "undefined" && "speechSynthesis" in window) {
          const utter = new SpeechSynthesisUtterance(data.content);
          utter.rate = 1.0;
          utter.pitch = 1.0;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utter);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  async function sendMessage(text: string) {
    if (!scenarioScript || !text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const newHist = [...history, userMsg];
    setHistory(newHist);
    setInput("");
    if (text.includes("[END ROLE-PLAY]") || text.includes("[FEEDBACK]")) {
      // AI provides feedback instead of in-character response
      await getFeedback(newHist);
    } else {
      await aiTurn(scenarioScript, newHist);
    }
  }

  async function getFeedback(hist: Msg[]) {
    if (!scenarioScript) return;
    setLoading(true);
    try {
      const res = await fetch("/api/role-play", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: scenarioScript.rolePlayPersona,
          scenario: scenarioScript.scenario,
          scriptTitle: scenarioScript.title,
          history: hist,
        }),
      });
      const data = await res.json();
      setFeedback(data.content || "Couldn't generate feedback. Try again?");
    } catch {} finally {
      setLoading(false);
    }
  }

  function endRolePlay() {
    void sendMessage("[END ROLE-PLAY] Please give me your feedback now.");
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.continuous = false;
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      void sendMessage(transcript);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    r.start();
  }

  function stopListening() {
    recogRef.current?.stop();
    setListening(false);
  }

  function resetRolePlay() {
    setScenarioScript(null);
    setHistory([]);
    setFeedback("");
    setInput("");
    setTab("library");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)", color: "var(--text-primary)" }}>
      <Header />

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Practice Mode</div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
            Scripts &amp; Role-Play
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 720, lineHeight: 1.55 }}>
            21 mortgage scripts by scenario — each with a built-in role-play mode. Practice the conversation with an AI playing the borrower or Realtor.
            The first time you say it shouldn&apos;t be on a real call.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 24 }}>
          <TabBtn active={tab === "library"} onClick={() => setTab("library")}>1. Library</TabBtn>
          <TabBtn active={tab === "rolePlay"} onClick={() => setTab("rolePlay")} disabled={!scenarioScript}>2. Role-Play{scenarioScript && " (active)"}</TabBtn>
        </div>

        {tab === "library" ? (
          <>
            {/* Search + filters */}
            <div style={{ marginBottom: 20 }}>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search scripts by title, scenario, or content..."
                style={{ width: "100%", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 14px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <CatBtn active={activeCat === "all"} color="#9B9AA8" onClick={() => setActiveCat("all")}>All ({SCRIPTS.length})</CatBtn>
                {ALL_CATS.map(cat => {
                  const meta = CATEGORY_LABELS[cat];
                  const count = SCRIPTS.filter(s => s.category === cat).length;
                  return (
                    <CatBtn key={cat} active={activeCat === cat} color={meta.color} onClick={() => setActiveCat(cat)}>
                      {meta.label} ({count})
                    </CatBtn>
                  );
                })}
              </div>
              {activeCat !== "all" && (
                <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {CATEGORY_LABELS[activeCat].description}
                </p>
              )}
            </div>

            {/* Results */}
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", background: "var(--charcoal)", borderRadius: 12, color: "var(--text-muted)", fontSize: 14 }}>
                  No scripts found. Try a different search or category.
                </div>
              )}
              {filtered.map(s => {
                const meta = CATEGORY_LABELS[s.category];
                const isOpen = openScriptId === s.id;
                return (
                  <article key={s.id} style={{ background: "var(--charcoal)", border: `1px solid ${isOpen ? meta.color + "55" : "var(--border)"}`, borderRadius: 14, overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenScriptId(isOpen ? null : s.id)}
                      style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "transparent", border: "none", color: "inherit", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "inline-block", background: meta.color + "22", color: meta.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{meta.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>{s.scenario}</div>
                      </div>
                      <div style={{ fontSize: 18, color: "var(--text-muted)", flexShrink: 0 }}>{isOpen ? "▾" : "▸"}</div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 18px 18px 18px" }}>
                        <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>The Script</div>
                          <pre style={{ fontFamily: "inherit", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", margin: 0 }}>{s.script}</pre>
                        </div>
                        {s.notes && (
                          <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Coaching Note</div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{s.notes}</div>
                          </div>
                        )}
                        {s.rolePlayPersona && (
                          <button
                            onClick={() => startRolePlay(s)}
                            style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            🎭 Practice this — Start role-play
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <RolePlayPanel
            scenario={scenarioScript}
            history={history}
            input={input}
            setInput={setInput}
            loading={loading}
            feedback={feedback}
            mode={mode}
            setMode={setMode}
            voiceSupported={voiceSupported}
            listening={listening}
            startListening={startListening}
            stopListening={stopListening}
            sendMessage={sendMessage}
            endRolePlay={endRolePlay}
            resetRolePlay={resetRolePlay}
            messagesEndRef={messagesEndRef}
          />
        )}
      </main>
    </div>
  );
}

/* ─── Role-play panel ─────────────────────────────────────────────── */

function RolePlayPanel({
  scenario, history, input, setInput, loading, feedback,
  mode, setMode, voiceSupported, listening, startListening, stopListening,
  sendMessage, endRolePlay, resetRolePlay, messagesEndRef,
}: any) {
  if (!scenario) {
    return (
      <div style={{ padding: 32, textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 14, color: "var(--text-muted)" }}>
        Pick a script from the library and click &quot;Practice this&quot; to start a role-play.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 20 }}>
      <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Role-play in progress</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)" }}>{scenario.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.45 }}>
              <strong>AI is playing:</strong> {scenario.rolePlayPersona}
            </div>
          </div>
          <button onClick={resetRolePlay} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "7px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            ← Back to library
          </button>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button
            onClick={() => setMode("text")}
            style={{ background: mode === "text" ? "var(--slate)" : "transparent", color: mode === "text" ? "var(--honey)" : "var(--text-muted)", border: `1px solid ${mode === "text" ? "rgba(245,166,35,0.3)" : "var(--border)"}`, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            📝 Text mode
          </button>
          <button
            onClick={() => voiceSupported && setMode("voice")}
            disabled={!voiceSupported}
            title={voiceSupported ? "" : "Voice mode requires Chrome, Edge, or Safari"}
            style={{ background: mode === "voice" ? "var(--slate)" : "transparent", color: mode === "voice" ? "var(--honey)" : "var(--text-muted)", border: `1px solid ${mode === "voice" ? "rgba(245,166,35,0.3)" : "var(--border)"}`, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: voiceSupported ? "pointer" : "not-allowed", opacity: voiceSupported ? 1 : 0.5 }}>
            🎤 Voice mode {!voiceSupported && "(unsupported)"}
          </button>
        </div>

        {/* Conversation transcript */}
        <div style={{ background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 14, minHeight: 280, maxHeight: 480, overflowY: "auto" }}>
          {history.length === 0 && !loading && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 32 }}>
              The AI will open the conversation as the {scenario.rolePlayPersona.split(",")[0]}. You respond as the LO.
            </div>
          )}
          {history.map((m: Msg, i: number) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%",
                padding: "11px 14px",
                borderRadius: 12,
                background: m.role === "user" ? "rgba(245,166,35,0.12)" : "var(--charcoal)",
                border: `1px solid ${m.role === "user" ? "rgba(245,166,35,0.25)" : "var(--border)"}`,
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--text-primary)",
                whiteSpace: "pre-wrap",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                  {m.role === "user" ? "You (LO)" : "Borrower / Realtor"}
                </div>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ color: "var(--text-muted)", fontSize: 13, fontStyle: "italic", marginTop: 8 }}>
              {feedback ? "Generating feedback..." : "Thinking..."}
            </div>
          )}
          {feedback && (
            <div style={{ marginTop: 18, padding: 16, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Coach Feedback</div>
              <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {feedback}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {!feedback && (
          <>
            {mode === "text" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !loading) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="Type your response as the LO... (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  style={{ flex: 1, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "var(--text-primary)", fontSize: 14, fontFamily: "inherit", resize: "vertical" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", padding: "0 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading || !input.trim() ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1 }}>
                  Send
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 20, background: "var(--ink)", border: "1px solid var(--border)", borderRadius: 12 }}>
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={loading}
                  style={{
                    background: listening ? "#EF4444" : "linear-gradient(135deg,#F5A623,#D4881A)",
                    color: listening ? "white" : "#0A0A0B",
                    border: "none", padding: "14px 28px", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer",
                  }}>
                  {listening ? "● Stop & Send" : "🎤 Hold to Speak"}
                </button>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.5 }}>
                  Click, speak your response, click again to send. The AI will respond aloud.
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {history.length > 0 && `${history.length} message${history.length === 1 ? "" : "s"} so far`}
              </div>
              {history.length >= 2 && (
                <button
                  onClick={endRolePlay}
                  disabled={loading}
                  style={{ background: "transparent", border: "1px solid var(--honey)", color: "var(--honey)", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  End &amp; Get Feedback →
                </button>
              )}
            </div>
          </>
        )}

        {feedback && (
          <button
            onClick={resetRolePlay}
            style={{ background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 14 }}>
            Practice another scenario →
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────────────── */

function TabBtn({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: active ? "var(--honey)" : "transparent",
      color: active ? "#0A0A0B" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
      border: "none", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

function CatBtn({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: React.ReactNode; color: string }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color + "22" : "transparent",
      border: `1px solid ${active ? color + "55" : "var(--border)"}`,
      color: active ? color : "var(--text-secondary)",
      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
    }}>{children}</button>
  );
}

function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--border)", background: "var(--charcoal)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Link href="/dashboard" style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textDecoration: "none" }}>
        Hive Mortgage Academy
      </Link>
      <Link href="/tools" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>← All Tools</Link>
    </header>
  );
}
