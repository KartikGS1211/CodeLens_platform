import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface ChunkCoverage {
  chunksProcessed: number;
  totalChunks: number;
  coveragePct: number;
  note: string;
}

interface ScoringMethodology {
  dataSources: string[];
  notUsed: string[];
  chunkCoverage: ChunkCoverage;
}

interface Props {
  methodology?: ScoringMethodology | null;
  className?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export function ScoringMethodologyPanel({
  methodology,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  // Don't render if there's nothing to show
  if (!methodology) return null;

  const { dataSources, notUsed, chunkCoverage } = methodology;

  return (
    <div className={`mt-4 ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors duration-200 select-none"
        aria-expanded={open}
      >
        {/* Info icon */}
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current opacity-70 group-hover:opacity-100 transition-opacity text-[10px] font-bold shrink-0">
          i
        </span>
        <span className="underline underline-offset-2 decoration-dotted">
          How is this score calculated?
        </span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable Panel */}
      {open && (
        <div
          className="mt-3 rounded-xl border border-white/8 bg-white/3 p-5 text-xs space-y-5 animate-fadeIn"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Coverage banner */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-teal/5 border border-neon-teal/15">
            <div className="text-lg">📊</div>
            <div>
              <p className="text-foreground/60 leading-relaxed">
                <span className="font-semibold text-neon-teal">
                  {chunkCoverage.coveragePct}% of code analyzed
                </span>{" "}
                ({chunkCoverage.chunksProcessed} of {chunkCoverage.totalChunks}{" "}
                chunk
                {chunkCoverage.totalChunks !== 1 ? "s" : ""} processed)
              </p>
              <p className="text-foreground/40 mt-0.5">{chunkCoverage.note}</p>
            </div>
          </div>

          {/* Data sources */}
          <div>
            <p className="text-foreground/50 font-semibold uppercase tracking-wider text-[10px] mb-2">
              ✅ What was used
            </p>
            <ul className="space-y-1.5">
              {dataSources.map((src, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-foreground/55"
                >
                  <span className="mt-0.5 text-emerald-400/70 shrink-0">•</span>
                  {src}
                </li>
              ))}
            </ul>
          </div>

          {/* Not used */}
          <div>
            <p className="text-foreground/50 font-semibold uppercase tracking-wider text-[10px] mb-2">
              ❌ Not factored in
            </p>
            <ul className="space-y-1.5">
              {notUsed.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-foreground/40"
                >
                  <span className="mt-0.5 text-red-400/50 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer — mirrors the persistent banner on the page */}
          <div className="border-t border-white/5 pt-3 space-y-1">
            <p className="text-[10px] text-foreground/30 leading-relaxed font-medium">
              ⚠️ Public GitHub data only
            </p>
            <p className="text-[10px] text-foreground/25 leading-relaxed">
              This score reflects public GitHub activity only. It does not
              account for private repositories, closed-source work, or
              contributions outside GitHub. Scores are AI-generated estimates
              based on static code analysis and are not a definitive measure of
              developer skill.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
