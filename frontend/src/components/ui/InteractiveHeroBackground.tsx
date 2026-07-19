import React, { useState, useEffect, useRef } from "react";

export default function InteractiveHeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const requestRef = useRef<number | null>(null);

  // Smooth mouse coordinates
  const currentCoords = useRef({ x: 0, y: 0 });
  const targetCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      targetCoords.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop for smooth interpolation (easing)
    const animate = () => {
      const ease = 0.12; // Easing constant
      const dx = targetCoords.current.x - currentCoords.current.x;
      const dy = targetCoords.current.y - currentCoords.current.y;

      currentCoords.current.x += dx * ease;
      currentCoords.current.y += dy * ease;

      if (containerRef.current) {
        containerRef.current.style.setProperty(
          "--mouse-x",
          `${currentCoords.current.x}px`,
        );
        containerRef.current.style.setProperty(
          "--mouse-y",
          `${currentCoords.current.y}px`,
        );
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none -z-20 bg-cl-bg"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 1. Base Layer: Fine Grid of thin lines (1px spaced out at 52px) */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1F212B 1px, transparent 1px),
            linear-gradient(to bottom, #1F212B 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* 2. Interactive Glow (Large Radial blur of #5E6AD2) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none`}
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(94, 106, 210, 0.16), transparent 80%)`,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* 3. Mobile Fallback (Slowly drifting ambient glow when mouse is not active or on mobile) */}
      <div
        className="absolute inset-0 pointer-events-none animate-drift-glow md:hidden"
        style={{
          background: `radial-gradient(350px circle at 50% 40%, rgba(94, 106, 210, 0.14), transparent 80%)`,
          animation: "drift 14s infinite alternate ease-in-out",
        }}
      />

      {/* 3b. Idle drift effect for desktop when mouse is not active */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700`}
        style={{
          background: `radial-gradient(450px circle at 30% 35%, rgba(94, 106, 210, 0.08), transparent 80%)`,
          opacity: isHovered ? 0.3 : 1,
          animation: "drift-large 40s infinite linear",
        }}
      />

      {/* 4. Soft deep backdrops (Unrelated static glow orbs for depth) */}
      {/* Orb 1: Primary color - top right */}
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-cl-accent/5 blur-[120px] pointer-events-none" />
      {/* Orb 2: Muted secondary violet - bottom left */}
      <div className="absolute bottom-[13%] left-[5%] w-[600px] h-[600px] rounded-full bg-purple-900/5 blur-[140px] pointer-events-none" />

      {/* Easing Animation Styles */}
      <style>{`
        @keyframes drift {
          0% {
            transform: translate(-5%, -5%) scale(0.95);
          }
          100% {
            transform: translate(5%, 5%) scale(1.05);
          }
        }
        @keyframes drift-large {
          0% {
            transform: rotate(0deg) translate(-20px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translate(-20px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
