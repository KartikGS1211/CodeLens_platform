import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useParams } from "react-router-dom";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { ScoringMethodologyPanel } from "@/components/ui/ScoringMethodologyPanel";

// ── Types ──────────────────────────────────────────────────────────────────
interface RadarCategory {
  name: string;
  score: number | null;
  reason: string;
}

// ── Fixed category ordering (matches backend contract) ─────────────────────
const FIXED_CATEGORIES: string[] = [
  "Backend",
  "Frontend",
  "Database",
  "DevOps/Infra",
  "Testing",
  "Security",
];

/* ---------------- PAGE ---------------- */
export default function DeveloperSkillsPage() {
  const { analysisId } = useParams();
  const { data, loading } = useDeveloperProfile(analysisId);

  const achievements = data?.achievements || [];
  const growth = data?.growthRecommendations || [];
  const scoringMethodology = data?.scoringMethodology ?? null;

  if (loading || !data) {
    return (
      <div className="p-8 text-cl-accent text-sm">
        Loading developer skills profile…
      </div>
    );
  }

  /* ── Build radar categories ─────────────────────────────────────────── */
  const hasNewRadar =
    Array.isArray(data?.skillRadar?.categories) &&
    data.skillRadar.categories.length > 0;

  // Detect OLD format: has labels[] but no categories[]
  // These are analyses run before Task 1 was deployed.
  const isLegacyRadar =
    !hasNewRadar &&
    Array.isArray(data?.skillRadar?.labels) &&
    data.skillRadar.labels.length > 0;

  let radarCategories: RadarCategory[] = [];

  if (hasNewRadar) {
    radarCategories = FIXED_CATEGORIES.map((name) => {
      const found = (data.skillRadar.categories as RadarCategory[]).find(
        (c) => c.name === name,
      );
      return (
        found ?? { name, score: null, reason: "Not present in this codebase." }
      );
    });
  } else if (data?.skillRadar?.labels?.length) {
    radarCategories = (data.skillRadar.labels as string[]).map(
      (label: string, index: number) => ({
        name: label,
        score: Number(data.skillRadar.values?.[index]) ?? null,
        reason: "",
      }),
    );
  } else {
    radarCategories = Object.entries(data?.stackSkills || {}).map(
      ([key, value]) => ({
        name: key.toUpperCase(),
        score: Number(value) || 0,
        reason: "",
      }),
    );
  }

  const radarData = radarCategories.map((cat) => ({
    skill: cat.name,
    // Pass null explicitly for N/A categories.
    // Recharts Radar treats null as a missing point → draws toward center,
    // which is visually distinct from score=0 (which extends to the inner ring).
    level: cat.score,
    isNA: cat.score === null,
  }));

  const applicableCount = radarCategories.filter(
    (c) => c.score !== null,
  ).length;

  /* ── Language bar chart ─────────────────────────────────────────────── */
  const languageData = data?.languageUsage?.length
    ? data.languageUsage
    : data?.languages?.map((lang: string, i: number) => ({
        language: lang,
        lines: (data.languages.length - i) * 8000,
      })) || [];

  // Overall skill score for visual hierarchy
  const overallSkillScore = data?.developerProfile?.overallScore;

  // Score color helper
  function getScoreColor(score: number) {
    if (score >= 75) return "text-cl-success";
    if (score >= 50) return "text-amber-400";
    return "text-cl-error";
  }

  return (
    <div className="w-full max-w-[120rem] mx-auto px-6 sm:px-8 py-12">
      {/* HEADER */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text">
          Developer Skills Profile
        </h1>
        <p className="mt-2 text-cl-muted">
          AI-assessed proficiency based on repository analysis
        </p>
      </motion.div>

      {/* ── PERSISTENT SCORE DISCLAIMER BANNER ──────────────────────────── */}
      <div
        className="mb-8 flex items-start gap-2.5 rounded-card px-4 py-3 text-xs"
        style={{
          background: "rgba(251, 191, 36, 0.06)",
          border: "1px solid rgba(251, 191, 36, 0.18)",
        }}
        role="note"
        aria-label="Score disclaimer"
      >
        <span className="mt-0.5 shrink-0 text-amber-400/70">⚠</span>
        <p className="text-amber-200/55 leading-relaxed">
          <span className="font-semibold text-amber-200/70">
            Public GitHub data only.{" "}
          </span>
          This score reflects public GitHub activity only. It does not account
          for private repositories, closed-source work, or contributions outside
          GitHub.
        </p>
      </div>

      {/* SUMMARY */}
      <Card className="mb-12 border-cl-border bg-cl-surface p-6 sm:p-8">
        <p className="text-sm text-cl-muted">AI Skill Summary</p>
        <p className="mt-4 text-cl-text/80 leading-relaxed">
          {data.skillSummary}
        </p>
        <p className="mt-4 text-cl-accent font-semibold">
          Verdict: {data.overallVerdict}
        </p>
      </Card>

      {/* TOP STATS — Overall Score is primary/prominent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {/* Primary metric — visually larger */}
        <Card className="p-6 bg-cl-surface border-cl-accent/30 shadow-glow-accent col-span-2 lg:col-span-1">
          <p className="text-xs text-cl-muted">Overall Score</p>
          <p
            className={`mt-2 text-4xl font-bold font-mono-data ${getScoreColor(
              overallSkillScore || 0,
            )}`}
          >
            {overallSkillScore}
            <span className="text-lg text-cl-muted">/100</span>
          </p>
        </Card>
        <StatCard
          title="Applicable Domains"
          value={`${applicableCount} / ${FIXED_CATEGORIES.length}`}
        />
        <StatCard title="Achievements" value={achievements.length} />
        <StatCard
          title="Growth Rate"
          value={`+${data?.developerProfile?.growthRate}%`}
          isNumeric
        />
      </div>

      {/* ================= ROW 1 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        {/* RADAR */}
        <div>
          <Card className="border-cl-border bg-cl-surface p-5">
            <h3 className="mb-1 font-heading text-lg font-semibold text-cl-text">
              Skills Overview
            </h3>
            <p className="mb-6 text-xs text-cl-muted">
              Domain:{" "}
              <span className="text-cl-accent">
                {data?.skillRadar?.domain ?? "—"}
              </span>
              &nbsp;·&nbsp; Greyed-out axes = not applicable to this codebase
            </p>

            {isLegacyRadar ? (
              /* ── Legacy format fallback ───────────────────────────────────── */
              <div className="h-[350px] flex flex-col items-center justify-center gap-5 text-center">
                <div className="w-14 h-14 rounded-full bg-cl-surface border border-cl-border flex items-center justify-center text-2xl">
                  🔄
                </div>
                <div className="max-w-[280px]">
                  <p className="text-cl-text font-semibold text-base mb-1 font-heading">
                    Updated skill breakdown available
                  </p>
                  <p className="text-cl-muted text-sm leading-relaxed">
                    This analysis used the old skill format. Re-analyze to see
                    the new fixed-category breakdown (Backend, Frontend,
                    Database, DevOps/Infra, Testing, Security).
                  </p>
                </div>
                <div className="px-4 py-2 rounded-card bg-cl-accent/10 border border-cl-accent/25 text-xs text-cl-accent">
                  Re-run analysis from the Overview page to update
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart outerRadius={100} data={radarData}>
                  <PolarGrid stroke="rgba(31, 33, 43, 0.8)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={({ x, y, payload }) => {
                      const item = radarCategories.find(
                        (c) => c.name === payload.value,
                      );
                      const isNA = item?.score === null;

                      const xNum = Number(x);
                      const yNum = Number(y);

                      // Offset labels outward to avoid overlap
                      const cx = 0;
                      const cy = 0;
                      const dx = xNum - cx;
                      const dy = yNum - cy;
                      const dist = Math.sqrt(dx * dx + dy * dy);
                      const offset = 14;
                      const nx = dist > 0 ? xNum + (dx / dist) * offset : xNum;
                      const ny = dist > 0 ? yNum + (dy / dist) * offset : yNum;

                      return (
                        <text
                          x={nx}
                          y={ny}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isNA ? "rgba(139, 141, 152, 0.4)" : "#E4E4E7"}
                          fontSize={11}
                          fontFamily="Inter Tight, Inter, sans-serif"
                          fontWeight={500}
                        >
                          {payload.value}
                          {isNA ? " (N/A)" : ""}
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{
                      fill: "#8B8D98",
                      fontSize: 9,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                    tickCount={5}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="level"
                    stroke="#5E6AD2"
                    fill="#5E6AD2"
                    fillOpacity={0.25}
                    isAnimationActive
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Scoring methodology transparency panel — below radar */}
          <ScoringMethodologyPanel methodology={scoringMethodology} />
        </div>

        {/* LANGUAGE — with axis label fix */}
        <Card className="border-cl-border bg-cl-surface p-5">
          <h3 className="mb-6 font-heading text-lg font-semibold text-cl-text">
            Language Proficiency
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={languageData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 30 }}
            >
              <CartesianGrid stroke="rgba(31, 33, 43, 0.8)" />
              <XAxis
                type="number"
                tick={{
                  fill: "#8B8D98",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono, monospace",
                }}
                axisLine={false}
                tickLine={false}
              >
                <Label
                  value="Bytes of code"
                  position="insideBottom"
                  offset={-15}
                  style={{
                    fill: "#8B8D98",
                    fontSize: 11,
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </XAxis>
              <YAxis
                type="category"
                dataKey="language"
                tick={{
                  fill: "#E4E4E7",
                  fontSize: 11,
                  fontFamily: "Inter Tight, Inter, sans-serif",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111318",
                  border: "1px solid #1F212B",
                  borderRadius: "8px",
                  color: "#E4E4E7",
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="lines" fill="#5E6AD2" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* DETAILED SKILLS */}
      <Card className="border-cl-border bg-cl-surface p-6 sm:p-8 mb-16">
        <h3 className="mb-2 font-heading text-lg font-semibold text-cl-text">
          Detailed Skills Assessment
        </h3>
        <p className="mb-8 text-xs text-cl-muted">
          Scores are 0–100 · "N/A" means the category is not present in this
          codebase (not a low score)
        </p>

        <div className="space-y-6">
          {radarCategories.map((cat, i) => {
            const isNA = cat.score === null;
            return (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-medium text-sm ${
                        isNA ? "text-cl-muted/40" : "text-cl-text"
                      }`}
                    >
                      {cat.name}
                    </h4>
                    {isNA && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cl-surface text-cl-muted/40 border border-cl-border">
                        N/A
                      </span>
                    )}
                  </div>
                  {isNA ? (
                    <span className="text-xs text-cl-muted/30 italic">
                      Not applicable
                    </span>
                  ) : (
                    <span
                      className={`font-bold font-mono-data ${getScoreColor(
                        cat.score!,
                      )}`}
                    >
                      {cat.score}%
                    </span>
                  )}
                </div>

                {isNA ? (
                  <div className="mt-2 h-1.5 rounded-full bg-cl-border/50" />
                ) : (
                  <Progress
                    value={cat.score ?? 0}
                    className="mt-2 h-1.5 bg-cl-border"
                  />
                )}

                {cat.reason && (
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      isNA ? "text-cl-muted/30 italic" : "text-cl-muted"
                    }`}
                  >
                    {cat.reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <Card className="mb-16 border-cl-border bg-cl-surface p-6 sm:p-8">
          <h3 className="mb-8 font-heading text-lg font-semibold text-cl-text">
            Achievements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {achievements.map((a: any, i: number) => (
              <div
                key={i}
                className="p-5 rounded-card bg-cl-bg border border-cl-border hover:border-cl-success/30 transition-colors"
              >
                <div className="h-9 w-9 mb-3 flex items-center justify-center rounded-md bg-cl-success/10 text-cl-success">
                  🏆
                </div>
                <h4 className="text-cl-text font-semibold text-sm">
                  {a.title}
                </h4>
                <p className="mt-2 text-xs text-cl-muted leading-relaxed">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* GROWTH RECOMMENDATIONS */}
      {growth.length > 0 && (
        <Card className="border border-cl-accent/30 bg-cl-surface p-6 sm:p-8">
          <h3 className="mb-6 font-heading text-lg font-semibold text-cl-text">
            Growth Recommendations
          </h3>

          <div className="space-y-3">
            {growth.map((g: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-card bg-cl-bg border border-cl-border"
              >
                <p className="text-cl-text font-medium text-sm">{g.title}</p>
                <p className="mt-1 text-xs text-cl-muted">{g.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function StatCard({
  title,
  value,
  isNumeric,
}: {
  title: string;
  value: any;
  isNumeric?: boolean;
}) {
  return (
    <Card className="p-5 bg-cl-surface border-cl-border">
      <p className="text-xs text-cl-muted">{title}</p>
      <p
        className={`mt-2 text-xl font-bold text-cl-text ${
          isNumeric ? "font-mono-data" : ""
        }`}
      >
        {value}
      </p>
    </Card>
  );
}
