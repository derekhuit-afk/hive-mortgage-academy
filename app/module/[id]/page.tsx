"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MODULES } from "@/lib/curriculum";

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = parseInt(params.id as string);
  const mod = MODULES.find(m => m.id === moduleId);
  const [student, setStudent] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [read, setRead] = useState<Set<number>>(new Set());
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    setStudent(JSON.parse(raw));
  }, []);

  if (!mod) return <div style={{ color: "white", padding: 40 }}>Module not found.</div>;

  const lesson = mod!.lessons[activeLesson];
  const allRead = mod!.lessons.every((_, i) => read.has(i));

  function markRead() {
    setRead(prev => new Set([...prev, activeLesson]));
    if (mod && activeLesson < mod.lessons.length - 1) {
      setActiveLesson(prev => prev + 1);
    }
  }

  function formatContent(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <div key={i} style={{ fontSize: 15, fontWeight: 700, color: "var(--honey)", margin: "20px 0 8px" }}>{line.replace(/\*\*/g, "")}</div>;
      }
      if (line.startsWith("- ")) {
        return <div key={i} style={{ display: "flex", gap: 10, margin: "6px 0" }}>
          <span style={{ color: "var(--honey)", flexShrink: 0 }}>▸</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>{line.slice(2)}</span>
        </div>;
      }
      if (/^\d+\./.test(line)) {
        return <div key={i} style={{ display: "flex", gap: 10, margin: "6px 0" }}>
          <span style={{ color: "var(--honey)", flexShrink: 0, minWidth: 20 }}>{line.split(".")[0]}.</span>
          <span style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.7 }}>{line.split(". ").slice(1).join(". ")}</span>
        </div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 12 }} />;
      return <p key={i} style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, margin: "4px 0" }}>{line}</p>;
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--obsidian)" }}>
      {/* Nav */}
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          ← Dashboard
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🐝</div>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Module {moduleId} of 6</span>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 60px)" }} className="module-layout">
        {/* Sidebar */}
        <div style={{ background: "var(--charcoal)", borderRight: "1px solid var(--border)", padding: "28px 20px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Module {String(moduleId).padStart(2, "0")}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 20 }}>{mod.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 24 }}>{mod.duration} · {mod.lessons.length} lessons</div>

          {mod.lessons.map((l, i) => (
            <div key={i} onClick={() => setActiveLesson(i)} style={{
              padding: "12px 14px", borderRadius: 10, marginBottom: 6, cursor: "pointer",
              background: activeLesson === i ? "rgba(245,166,35,0.08)" : "transparent",
              border: `1px solid ${activeLesson === i ? "rgba(245,166,35,0.3)" : "transparent"}`,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                  background: read.has(i) ? "#10B981" : activeLesson === i ? "var(--honey)" : "var(--muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: read.has(i) || activeLesson === i ? "#0A0A0B" : "var(--text-muted)",
                  fontWeight: 700,
                }}>{read.has(i) ? "✓" : i + 1}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: activeLesson === i ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{l.duration}</div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>
              {read.size}/{mod.lessons.length} lessons completed
            </div>
            <div style={{ height: 4, background: "var(--muted)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(read.size / mod.lessons.length) * 100}%`, background: "linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius: 100 }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "40px 48px", maxWidth: 780, overflowY: "auto" }} className="module-content">
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                background: `${mod.badgeColor}20`, color: mod.badgeColor, border: `1px solid ${mod.badgeColor}40`,
              }}>{mod.badge}</div>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{lesson.duration}</span>
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 8 }}>{lesson.title}</h1>
            <div style={{ height: 3, width: 48, background: "linear-gradient(90deg,#F5A623,#FFC85C)", borderRadius: 2 }} />
          </div>

          {/* Lesson body */}
          <div style={{ background: "var(--charcoal)", border: "1px solid var(--border)", borderRadius: 16, padding: 32, marginBottom: 28 }}>
            {formatContent(lesson.content)}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {!read.has(activeLesson) ? (
              <button onClick={markRead} style={{
                background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B",
                border: "none", borderRadius: 10, padding: "14px 28px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                {activeLesson < mod.lessons.length - 1 ? "Mark Complete & Next Lesson →" : "Mark Complete →"}
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10B981", fontSize: 14, fontWeight: 600 }}>
                ✅ Lesson completed
                {activeLesson < mod.lessons.length - 1 && (
                  <button onClick={() => setActiveLesson(p => p + 1)} style={{ background: "var(--slate)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", padding: "8px 16px", fontSize: 13, cursor: "pointer", marginLeft: 8 }}>
                    Next Lesson →
                  </button>
                )}
              </div>
            )}

            {allRead && (
              <button onClick={() => router.push(`/module/${moduleId}/quiz`)} style={{
                background: "var(--slate)", border: "1px solid rgba(245,166,35,0.4)", color: "var(--honey)",
                borderRadius: 10, padding: "14px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}>
                🎯 Take Module Quiz
              </button>
            )}
          </div>

          {allRead && (
            <div style={{ marginTop: 16, background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "var(--text-secondary)" }}>
              All lessons complete! Take the quiz to unlock the next module and record your progress.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .module-layout { grid-template-columns: 1fr !important; }
          .module-content { padding: 24px 20px !important; }
        }
      `}</style>
    </main>
  );
}
