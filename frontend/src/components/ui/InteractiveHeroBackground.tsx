import React, { useEffect, useRef } from "react";

/**
 * InteractiveHeroBackground  v2
 *
 * Layers (back → front):
 *  1. 1px scan-line grid
 *  2. Floating code-token particles   ← NEW (canvas, rAF-driven)
 *  3. Mouse-tracking radial glow      (desktop only, rAF lerp)
 *  4. Mobile auto-drift glow          (pure CSS figure-8)
 *  5. Three fixed depth orbs
 *
 * All layers are pointer-events-none so hero buttons stay clickable.
 * Mouse tracking listens on `window` to avoid the pointer-events-none trap.
 */

/* ── Particle config ───────────────────────────────────────────── */
const CODE_TOKENS = [
  "const",
  "=>",
  "async",
  "await",
  "return",
  "if",
  "class",
  "type",
  "import",
  "export",
  "null",
  "true",
  "&&",
  "||",
  "===",
  "?.",
  "//",
  ".map()",
  ".then()",
  "useState",
  "interface",
  "fn()",
  ":string",
  "[]",
  "{}",
  "<T>",
  "void",
];

interface Particle {
  x: number;
  y: number;
  text: string;
  speed: number;
  opacity: number;
  drift: number;
  fontSize: number;
}

function createParticle(
  canvasW: number,
  canvasH: number,
  randomY = true,
): Particle {
  return {
    x: Math.random() * canvasW,
    y: randomY ? Math.random() * canvasH : canvasH + 20,
    text: CODE_TOKENS[Math.floor(Math.random() * CODE_TOKENS.length)],
    speed: 0.22 + Math.random() * 0.38,
    opacity: 0.028 + Math.random() * 0.055,
    drift: (Math.random() - 0.5) * 0.25,
    fontSize: 11 + Math.floor(Math.random() * 3),
  };
}

/* ── Component ─────────────────────────────────────────────────── */
export default function InteractiveHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Mouse-tracking glow (desktop) ──────────────────────────── */
  const target = useRef({ x: 0.5, y: 0.4 });
  const current = useRef({ x: 0.5, y: 0.4 });
  const glowRafId = useRef<number | null>(null);
  const isInsideHero = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const glowEl = glowRef.current;
    if (!container || !glowEl) return;

    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasPointer) return; // mobile → pure-CSS drift

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        target.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        };
        if (!isInsideHero.current) {
          isInsideHero.current = true;
          glowEl.style.opacity = "1";
        }
      } else {
        if (isInsideHero.current) {
          isInsideHero.current = false;
          glowEl.style.opacity = "0";
        }
      }
    };

    const EASE = 0.1;
    const tick = () => {
      if (isInsideHero.current) {
        const dx = target.current.x - current.current.x;
        const dy = target.current.y - current.current.y;
        if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
          current.current.x += dx * EASE;
          current.current.y += dy * EASE;
          container.style.setProperty(
            "--mouse-x",
            `${(current.current.x * 100).toFixed(2)}%`,
          );
          container.style.setProperty(
            "--mouse-y",
            `${(current.current.y * 100).toFixed(2)}%`,
          );
        }
      }
      glowRafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    glowRafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (glowRafId.current !== null) cancelAnimationFrame(glowRafId.current);
    };
  }, []);

  /* ── Canvas floating-particle system ────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let particleRafId: number;
    let W = 0;
    let H = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      W = parent.offsetWidth;
      H = parent.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      // Re-create particles scaled to new size
      particles = Array.from({ length: 28 }, () => createParticle(W, H, true));
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Accent purple for keywords, muted for operators
    const COLORS = ["#5E6AD2", "#6E5ABA", "#8B8D98", "#A78BFA"];

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.font = `${p.fontSize}px 'JetBrains Mono', 'Fira Code', monospace`;
        ctx.fillText(p.text, p.x, p.y);

        // Drift upward
        p.y -= p.speed;
        p.x += p.drift;

        // Respawn at bottom when out of view
        if (p.y < -24) {
          particles[i] = createParticle(W, H, false);
        }
        // Soft horizontal wrap
        if (p.x < -80) p.x = W + 20;
        if (p.x > W + 80) p.x = -20;
      }

      ctx.globalAlpha = 1;
      particleRafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(particleRafId);
      ro.disconnect();
    };
  }, []);

  /* ── JSX ─────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={
        {
          zIndex: 0,
          "--mouse-x": "50%",
          "--mouse-y": "40%",
        } as React.CSSProperties
      }
    >
      {/* ── 1. SCAN GRID ─────────────────────────────────────────── */}
      <div
        className="hero-grid absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(31,33,43,0.16) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(31,33,43,0.16) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── 2. CANVAS — floating code-token particles ─────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ opacity: 0.75, mixBlendMode: "screen" }}
      />

      {/* ── 3. MOUSE-TRACKING GLOW (desktop only) ─────────────────── */}
      <div
        ref={glowRef}
        className="absolute inset-0 hidden md:block"
        style={{
          opacity: 0,
          transition: "opacity 500ms ease",
          background:
            "radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), rgba(94,106,210,0.16), transparent 75%)",
          willChange: "opacity",
        }}
      />

      {/* ── 4. MOBILE AUTO-DRIFT GLOW ─────────────────────────────── */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "radial-gradient(340px circle at 50% 42%, rgba(94,106,210,0.15), transparent 72%)",
          animation: "heroGlowDrift 18s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── 5. DEPTH ORBS ─────────────────────────────────────────── */}

      {/* Orb A — top-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "5%",
          right: "8%",
          width: "580px",
          height: "580px",
          borderRadius: "50%",
          background: "rgba(94,106,210,0.058)",
          filter: "blur(130px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Orb B — bottom-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "8%",
          left: "3%",
          width: "640px",
          height: "640px",
          borderRadius: "50%",
          background: "rgba(109,40,217,0.045)",
          filter: "blur(160px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Orb C — centre-bottom horizon */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-10%",
          left: "50%",
          transform: "translateX(-50%) translateZ(0)",
          width: "800px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(94,106,210,0.035)",
          filter: "blur(140px)",
        }}
      />

      {/* ── KEYFRAMES ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes heroGlowDrift {
          0%   { transform: translate(0px,   0px)  scale(1);    }
          12%  { transform: translate(30px, -25px) scale(1.04); }
          25%  { transform: translate(0px,  -45px) scale(1);    }
          37%  { transform: translate(-30px,-25px) scale(0.97); }
          50%  { transform: translate(0px,   0px)  scale(1);    }
          62%  { transform: translate(25px,  25px) scale(1.03); }
          75%  { transform: translate(0px,   45px) scale(1);    }
          87%  { transform: translate(-25px, 25px) scale(0.97); }
          100% { transform: translate(0px,   0px)  scale(1);    }
        }

        @media (max-width: 768px) {
          .hero-grid { background-size: 72px 72px !important; }
        }
      `}</style>
    </div>
  );
}
