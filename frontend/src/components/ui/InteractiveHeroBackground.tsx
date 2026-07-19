import React, { useEffect, useRef } from "react";

/**
 * InteractiveHeroBackground
 *
 * ─── ROOT CAUSE OF PREVIOUS BUG ────────────────────────────────────────────
 * The container div had `pointer-events-none`, so mousemove / mouseleave
 * listeners attached to that element NEVER fired — the browser ignores pointer
 * events on it entirely.
 *
 * FIX: attach mousemove to `window` instead (always fires regardless of what
 * is under the cursor), then compute coords relative to the container's
 * getBoundingClientRect(). Out-of-bounds detection is done by checking whether
 * clientX/Y falls outside the rect — no mouseleave needed on the element.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Desktop:  smooth mouse-tracking radial glow via rAF lerp loop +
 *           CSS custom properties (--mouse-x / --mouse-y).
 *
 * Mobile:   glow auto-drifts along a figure-8 path via pure CSS keyframes
 *           (18 s loop). Zero JS runs on touch devices.
 *
 * Both:     fine 1px scan grid, 3 fixed depth orbs — all behind hero text.
 *
 * Perf:     only `transform` + CSS custom-property writes in the rAF loop —
 *           no layout-triggering properties, no React state updates.
 */
export default function InteractiveHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Lerp targets — refs so zero React re-renders happen inside the rAF loop
  const target  = useRef({ x: 0.5, y: 0.4 }); // normalised 0–1
  const current = useRef({ x: 0.5, y: 0.4 });
  const rafId   = useRef<number | null>(null);
  const isInsideHero = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const glowEl    = glowRef.current;
    if (!container || !glowEl) return;

    // Only run the mouse-tracking path on true pointer (non-touch) devices
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasPointer) return; // mobile → pure-CSS drift handles it, nothing to do

    // ── Window-level mousemove ──────────────────────────────────────────────
    // KEY FIX: listen on `window`, NOT on `container`.
    // The container has pointer-events-none (needed so it never blocks clicks
    // on hero buttons), which means events on that element never fire.
    // window.mousemove always fires; we just clamp coords to the container rect.
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();

      // Check if cursor is within the hero section bounds
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top  &&
        e.clientY <= rect.bottom;

      if (inside) {
        // Normalise to 0–1 within the container
        target.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top)  / rect.height,
        };

        if (!isInsideHero.current) {
          isInsideHero.current = true;
          glowEl.style.opacity = "1"; // fade in tracking glow
        }
      } else {
        // Cursor left the hero section
        if (isInsideHero.current) {
          isInsideHero.current = false;
          glowEl.style.opacity = "0"; // fade out tracking glow
        }
      }
    };

    // ── rAF lerp loop ──────────────────────────────────────────────────────
    // Runs at display refresh rate; only writes to DOM when cursor is inside
    // and when the delta is large enough to matter visually.
    const EASE = 0.1;

    const tick = () => {
      if (isInsideHero.current) {
        const dx = target.current.x - current.current.x;
        const dy = target.current.y - current.current.y;

        if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
          current.current.x += dx * EASE;
          current.current.y += dy * EASE;

          // Write CSS custom properties on the container — the glow gradient
          // reads them via `var(--mouse-x)` / `var(--mouse-y)`.
          // This is the correct pattern for Tailwind projects: static Tailwind
          // classes handle layout/blur/size; the dynamic position is applied
          // through a plain inline style / CSS var, NOT a dynamic class string
          // (which Tailwind JIT cannot resolve at build time).
          container.style.setProperty(
            "--mouse-x",
            `${(current.current.x * 100).toFixed(2)}%`
          );
          container.style.setProperty(
            "--mouse-y",
            `${(current.current.y * 100).toFixed(2)}%`
          );
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    // pointer-events-none is REQUIRED here so this layer never blocks
    // clicks on the hero buttons sitting above it.
    // That's why the mouse listener must be on `window` instead.
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
      {/* ── 1. SCAN GRID ──────────────────────────────────────────────────── */}
      {/* Desktop: 48px cells | Mobile: 72px cells (via @media override below) */}
      <div
        className="hero-grid absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right,  rgba(31,33,43,0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(31,33,43,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── 2. MOUSE-TRACKING GLOW (desktop only) ─────────────────────────── */}
      {/* Reads --mouse-x / --mouse-y set by the rAF loop above.              */}
      {/* Static Tailwind classes (hidden md:block) handle show/hide by       */}
      {/* breakpoint; dynamic position comes from the CSS vars — NOT from     */}
      {/* a dynamic Tailwind arbitrary-value class (Tailwind JIT can't handle */}
      {/* runtime-interpolated class strings).                                */}
      <div
        ref={glowRef}
        className="absolute inset-0 hidden md:block"
        style={{
          opacity: 0,
          transition: "opacity 500ms ease",
          background:
            "radial-gradient(380px circle at var(--mouse-x) var(--mouse-y), rgba(94,106,210,0.18), transparent 75%)",
          willChange: "opacity",
        }}
      />

      {/* ── 3. MOBILE AUTO-DRIFT GLOW ─────────────────────────────────────── */}
      {/* Pure CSS figure-8 keyframe — zero JS on touch devices.              */}
      {/* Completely separate code path from the desktop tracking above;      */}
      {/* this is unchanged and unaffected by the pointer-events-none fix.    */}
      <div
        className="absolute inset-0 md:hidden"
        style={{
          background:
            "radial-gradient(340px circle at 50% 42%, rgba(94,106,210,0.16), transparent 72%)",
          animation: "heroGlowDrift 18s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* ── 4. DEPTH ORBS — both devices ──────────────────────────────────── */}
      {/* Three fixed, heavily-blurred orbs add spatial depth.                */}
      {/* Opacity 4-7% — never competes with text readability.                */}

      {/* Orb A — top-right, primary accent #5E6AD2 */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "5%", right: "8%",
          width: "560px", height: "560px",
          borderRadius: "50%",
          background: "rgba(94,106,210,0.065)",
          filter: "blur(120px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Orb B — bottom-left, muted violet */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "8%", left: "3%",
          width: "640px", height: "640px",
          borderRadius: "50%",
          background: "rgba(109,40,217,0.05)",
          filter: "blur(150px)",
          transform: "translateZ(0)",
        }}
      />

      {/* Orb C — centre-bottom horizon depth */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-10%",
          left: "50%",
          transform: "translateX(-50%) translateZ(0)",
          width: "800px", height: "400px",
          borderRadius: "50%",
          background: "rgba(94,106,210,0.04)",
          filter: "blur(140px)",
        }}
      />

      {/* ── KEYFRAMES ─────────────────────────────────────────────────────── */}
      <style>{`
        /* Mobile drift — figure-8 path, pure transform, no layout reflow */
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

        /* Coarser grid on mobile screens */
        @media (max-width: 768px) {
          .hero-grid { background-size: 72px 72px !important; }
        }
      `}</style>
    </div>
  );
}
