import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Code, BookOpen, CheckCircle } from "lucide-react";

/* ── Static Data ─────────────────────────────────────────────────── */
const SCORE_META = [
  { label: "Code Quality", color: "#5E6AD2", icon: Code },
  { label: "Security", color: "#3ECF8E", icon: Shield },
  { label: "Readability", color: "#A78BFA", icon: BookOpen },
  { label: "Performance", color: "#F59E0B", icon: Zap },
];
const SCORE_TARGETS = [87, 94, 79, 91];

const CODE_LINES = [
  [
    { t: "async", c: "#5E6AD2" },
    { t: " analyzeRepo", c: "#E4E4E7" },
    { t: "(url) {", c: "#8B8D98" },
  ],
  [
    { t: "  const", c: "#5E6AD2" },
    { t: " insights", c: "#E4E4E7" },
    { t: " = ", c: "#8B8D98" },
    { t: "await", c: "#5E6AD2" },
    { t: " scan(url)", c: "#3ECF8E" },
  ],
  [
    { t: "  if", c: "#5E6AD2" },
    { t: " (insights.score", c: "#E4E4E7" },
    { t: " > 80) {", c: "#8B8D98" },
  ],
  [
    { t: "    return", c: "#5E6AD2" },
    { t: " insights.report", c: "#A78BFA" },
  ],
  [{ t: "  }", c: "#8B8D98" }],
  [{ t: "}", c: "#8B8D98" }],
];

/* ── Component ───────────────────────────────────────────────────── */
export default function HeroMockup() {
  const [cycleKey, setCycleKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState([0, 0, 0, 0]);
  const [phase, setPhase] = useState<"loading" | "scoring" | "done">("loading");

  /* Reset on loop restart */
  useEffect(() => {
    setProgress(0);
    setScores([0, 0, 0, 0]);
    setPhase("loading");
  }, [cycleKey]);

  /* ── Phase 1: Animate progress bar 0 → 92 ─────────────────────── */
  useEffect(() => {
    if (phase !== "loading") return;
    let p = 0;
    const t = setInterval(() => {
      p++;
      setProgress(p);
      if (p >= 92) {
        clearInterval(t);
        setPhase("scoring");
      }
    }, 28);
    return () => clearInterval(t);
  }, [phase, cycleKey]);

  /* ── Phase 2: Count-up scores ──────────────────────────────────── */
  useEffect(() => {
    if (phase !== "scoring") return;
    const timers: ReturnType<typeof setInterval>[] = [];

    SCORE_TARGETS.forEach((target, i) => {
      let cur = 0;
      const step = target / 35;
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        const rounded = Math.round(cur);
        setScores((prev) => {
          const n = [...prev];
          n[i] = rounded;
          return n;
        });
        if (rounded >= target) clearInterval(t);
      }, 18);
      timers.push(t);
    });

    const done = setTimeout(() => setPhase("done"), 35 * 18 + 300);
    return () => {
      timers.forEach(clearInterval);
      clearTimeout(done);
    };
  }, [phase]);

  /* ── Phase 3: Show "done" badge, then restart cycle ───────────── */
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setCycleKey((k) => k + 1), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        width: "100%",
        perspective: "1200px",
        /* Extra padding so absolute-positioned badges don't clip on small screens */
        paddingTop: "20px",
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Ambient glow behind the card */}
      <div
        style={{
          position: "absolute",
          inset: "-40px -24px",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(94,106,210,0.22) 0%, transparent 65%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main Card ────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          background: "rgba(12, 14, 20, 0.93)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(94,106,210,0.22)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            "0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(94,106,210,0.06) inset",
        }}
      >
        {/* Window Chrome */}
        <div
          style={{
            padding: "11px 15px",
            borderBottom: "1px solid rgba(31,33,43,0.9)",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(14,16,22,0.95)",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            {["#F45B69", "#F59E0B", "#3ECF8E"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div
            style={{
              flexGrow: 1,
              marginLeft: 6,
              background: "rgba(31,33,43,0.7)",
              borderRadius: "5px",
              padding: "3px 10px",
              fontSize: "10.5px",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              color: "#8B8D98",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            github.com / user / awesome-project
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "10px",
              color: phase === "done" ? "#3ECF8E" : "#5E6AD2",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: phase === "done" ? "#3ECF8E" : "#5E6AD2",
                animation:
                  phase !== "done"
                    ? "hm-pulse 1.1s ease-in-out infinite"
                    : "none",
              }}
            />
            {phase === "done" ? "Complete" : "Analyzing…"}
          </div>
        </div>

        {/* Code Snippet */}
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid rgba(31,33,43,0.45)",
            background: "rgba(10,11,15,0.6)",
          }}
        >
          {CODE_LINES.map((line, li) => (
            <motion.div
              key={`${cycleKey}-line-${li}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + li * 0.07, duration: 0.28 }}
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: "10.5px",
                lineHeight: "1.75",
              }}
            >
              {line.map((tok, ti) => (
                <span key={ti} style={{ color: tok.c }}>
                  {tok.t}
                </span>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid rgba(31,33,43,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "7px",
            }}
          >
            <span
              style={{
                fontSize: "9.5px",
                color: "#8B8D98",
                fontFamily: "'Inter', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Analysis Progress
            </span>
            <span
              style={{
                fontSize: "10.5px",
                color: "#5E6AD2",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
              }}
            >
              {progress}%
            </span>
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(31,33,43,0.9)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "linear-gradient(90deg, #5E6AD2, #A78BFA)",
                borderRadius: "2px",
                boxShadow: "0 0 12px rgba(94,106,210,0.75)",
                transition: "width 28ms linear",
              }}
            />
          </div>
        </div>

        {/* Score Grid */}
        <div style={{ padding: "12px 16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {SCORE_META.map((meta, i) => {
              const Icon = meta.icon;
              const val = scores[i];
              const active = phase !== "loading";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: active ? 1 : 0.22 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  style={{
                    background: "rgba(31,33,43,0.3)",
                    border: `1px solid ${
                      active ? meta.color + "25" : "rgba(31,33,43,0.6)"
                    }`,
                    borderRadius: "10px",
                    padding: "10px 11px",
                    transition: "border-color 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "7px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Icon size={10} color={meta.color} />
                      <span
                        style={{
                          fontSize: "9px",
                          color: "#8B8D98",
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: meta.color,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {val}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "2.5px",
                      background: "rgba(31,33,43,0.9)",
                      borderRadius: "2px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${val}%`,
                        background: meta.color,
                        borderRadius: "2px",
                        boxShadow: `0 0 7px ${meta.color}80`,
                        transition: "width 18ms linear",
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Floating "Analysis Complete" Badge ───────────────────── */}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            key="done-badge"
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 8 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            style={{
              position: "absolute",
              bottom: -14,
              right: -14,
              background: "rgba(62,207,142,0.10)",
              border: "1px solid rgba(62,207,142,0.38)",
              borderRadius: "10px",
              padding: "7px 13px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              backdropFilter: "blur(14px)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
            }}
          >
            <CheckCircle size={11} color="#3ECF8E" />
            <span
              style={{
                fontSize: "11px",
                color: "#3ECF8E",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
              }}
            >
              Analysis Complete
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating "AI Powered" Badge (top-left) ───────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 260, damping: 20 }}
        style={{
          position: "absolute",
          top: -14,
          left: -14,
          background: "rgba(94,106,210,0.10)",
          border: "1px solid rgba(94,106,210,0.32)",
          borderRadius: "10px",
          padding: "7px 13px",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#5E6AD2",
            animation: "hm-pulse 2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontSize: "11px",
            color: "#5E6AD2",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
          }}
        >
          AI Powered
        </span>
      </motion.div>

      {/* Keyframes */}
      <style>{`
        @keyframes hm-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.35; transform: scale(0.85); }
        }
      `}</style>
    </motion.div>
  );
}
