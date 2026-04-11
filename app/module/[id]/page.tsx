"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { MODULES, canAccessModule, TIER_LIMITS } from "@/lib/curriculum";
import type { Tier } from "@/lib/curriculum";

export default function ModulePage() {
  const router = useRouter();
  const params = useParams()!;
  const moduleId = parseInt(params.id as string);
  const mod = MODULES.find(m => m.id === moduleId);
  const [student, setStudent] = useState<any>(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [read, setRead] = useState<Set<number>>(new Set());
  const [aiContent, setAiContent] = useState<Record<number, string>>({});
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("hma_student");
    if (!raw) { router.push("/login"); return; }
    const s = JSON.parse(raw);
    setStudent(s);
    const tier = (s.plan || "free") as Tier;
    if (!canAccessModule(moduleId, tier)) {
      router.push("/dashboard?upgrade=1");
    }
  }, [moduleId]);

  const loadAiLesson = useCallback(async (lessonIndex: number) => {
    if (!mod) return;
    const lesson = mod.lessons[lessonIndex];
    if (lesson.content || aiContent[lessonIndex]) return; // Already have content
    setLoadingLesson(true);
    try {
      const res = await fetch("/api/ai-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleTitle: mod.title, lessonTitle: lesson.title, moduleId: mod.id, lessonIndex }),
      });
      const data = await res.json();
      setAiContent(prev => ({ ...prev, [lessonIndex]: data.content }));
    } catch { /* silent */ } finally { setLoadingLesson(false); }
  }, [mod, aiContent]);

  useEffect(() => {
    if (mod && student) loadAiLesson(activeLesson);
  }, [activeLesson, mod, student]);

  if (!mod) return <div style={{ color: "white", padding: 40 }}>Module not found.</div>;

  const lesson = mod.lessons[activeLesson];
  const lessonContent = lesson.content || aiContent[activeLesson];
  const allRead = mod.lessons.every((_, i) => read.has(i));

  async function markRead() {
    const newRead = new Set([...read, activeLesson]);
    setRead(newRead);
    
    // Track lesson-level progress in DB (non-blocking)
    if (student) {
      const token = localStorage.getItem("hma_token") || "";
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          studentId: student.id,
          moduleNumber: moduleId,
          completed: false,
          lessonIndex: activeLesson,
          lessonsRead: newRead.size,
          totalLessons: mod!.lessons.length,
        }),
      }).catch(() => {});
    }

    if (activeLesson < mod!.lessons.length - 1) {
      setActiveLesson(prev => prev + 1);
    }
  }

  async function markComplete() {
    if (!student || !allRead) return;
    setMarking(true);
    try {
      const token = localStorage.getItem("hma_token") || "";
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ studentId: student.id, moduleNumber: moduleId, completed: true }),
      });
      router.push(`/module/${moduleId}/quiz`);
    } catch { /* silent */ } finally { setMarking(false); }
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
      <nav style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, background: "linear-gradient(135deg,#F5A623,#D4881A)", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🐝</div>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Module {moduleId} of 12</span>
        </div>
      </nav>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "calc(100vh - 60px)" }} className="module-layout">
        {/* Sidebar */}
        <div style={{ background: "var(--charcoal)", borderRight: "1px solid var(--border)", padding: "28px 20px", overflowY: "auto" }}>
          <div style={{ fontSize: 10, color: mod.badgeColor, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{mod.badge}</div>
          <div style={{ fontSize: 10, color: "var(--honey)", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Module {String(moduleId).padStart(2, "0")}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 20 }}>{mod.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 24 }}>{mod.duration} · {mod.lessons.length} lessons</div>

          {mod.lessons.map((l, i) => (
            <div key={i} onClick={() => setActiveLesson(i)} style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 6, cursor: "pointer", background: activeLesson === i ? "rgba(245,166,35,0.08)" : "transparent", border: `1px solid ${activeLesson === i ? "rgba(245,166,35,0.3)" : "transparent"}` }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: read.has(i) ? "#10B981" : "var(--slate)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", flexShrink: 0 }}>{read.has(i) ? "✓" : i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: activeLesson === i ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.3 }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{l.duration}</div>
                </div>
              </div>
            </div>
          ))}

          {allRead && (
            <button onClick={markComplete} disabled={marking} style={{ width: "100%", marginTop: 16, background: "linear-gradient(135deg,#F5A623,#D4881A)", color: "#0A0A0B", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {marking ? "Saving..." : "Take Quiz →"}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: "40px 48px", overflowY: "auto", maxHeight: "calc(100vh - 60px)" }} className="lesson-content">
          <div style={{ maxWidth: 680 }}>
            <div style={{ fontSize: 11, color: "var(--honey)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>Lesson {activeLesson + 1} of {mod.lessons.length}</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,3vw,32px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: 8 }}>{lesson.title}</h1>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>{lesson.duration}</div>

            {loadingLesson && !lessonContent ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.15)", borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontSize: 24 }}>🐝</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--honey)", marginBottom: 4 }}>Derek is writing your lesson...</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>AI-generating curriculum from $1B+ in production experience. Takes about 10 seconds.</div>
                  </div>
                </div>
                {[90, 70, 85, 60].map((w, i) => <div key={i} style={{ height: 16, background: "var(--slate)", borderRadius: 8, width: `${w}%`, opacity: 0.5 }} />)}
              </div>
            ) : lessonContent ? (
              <div>{formatContent(lessonContent)}</div>
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading lesson content...</div>
            )}

            {lessonContent && (
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: read.has(activeLesson) ? "#10B981" : "var(--text-muted)" }}>
                  {read.has(activeLesson) ? "✓ Lesson complete" : "Mark as complete when ready"}
                </div>
                <button onClick={markRead} disabled={read.has(activeLesson)} style={{ background: read.has(activeLesson) ? "var(--slate)" : "linear-gradient(135deg,#F5A623,#D4881A)", color: read.has(activeLesson) ? "var(--text-muted)" : "#0A0A0B", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: read.has(activeLesson) ? "default" : "pointer" }}>
                  {read.has(activeLesson) ? "✓ Complete" : activeLesson < mod.lessons.length - 1 ? "Mark Read & Continue →" : "Mark Read →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.module-layout{grid-template-columns:1fr!important}.lesson-content{padding:24px 20px!important}}`}</style>
    </main>
  );
}
