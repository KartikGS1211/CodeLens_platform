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
      <div className="p-8 text-neon-teal text-sm">
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

  return (
    <div className="w-full max-w-[120rem] mx-auto px-8 py-12">
      {/* HEADER */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-white">
          Developer Skills Profile
        </h1>
        <p className="mt-2 text-foreground/60">
          AI-assessed proficiency based on repository analysis
        </p>
      </motion.div>

      {/* ── PERSISTENT SCORE DISCLAIMER BANNER ────────────────────────────
           Small, always-visible, non-intrusive amber strip beneath the header.
           Intentionally minimal: one line of plain text + icon. */}
      <div
        className="mb-8 flex items-start gap-2.5 rounded-lg px-4 py-3 text-xs"
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
      <Card className="mb-12 border-white/10 bg-white/5 p-8">
        <p className="text-sm text-foreground/60">AI Skill Summary</p>
        <p className="mt-4 text-foreground/80 leading-relaxed">
          {data.skillSummary}
        </p>
        <p className="mt-4 text-neon-teal font-semibold">
          Verdict: {data.overallVerdict}
        </p>
      </Card>

      {/* TOP STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Overall Score"
          value={`${data?.developerProfile?.overallScore}/100`}
        />
        <StatCard
          title="Applicable Domains"
          value={`${applicableCount} / ${FIXED_CATEGORIES.length}`}
        />
        <StatCard title="Achievements" value={achievements.length} />
        <StatCard
          title="Growth Rate"
          value={`+${data?.developerProfile?.growthRate}%`}
        />
      </div>

      {/* ================= ROW 1 ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* RADAR */}
        <div>
          <Card className="border-white/10 bg-white/5 p-6">
            <h3 className="mb-1 text-xl font-semibold text-white">
              Skills Overview
            </h3>
            <p className="mb-6 text-xs text-foreground/40">
              Domain:{" "}
              <span className="text-neon-teal">
                {data?.skillRadar?.domain ?? "—"}
              </span>
              &nbsp;·&nbsp; Greyed-out axes = not applicable to this codebase
            </p>

            {isLegacyRadar ? (
              /* ── Legacy format fallback ─────────────────────────────────────
                 Old analyses store skillRadar as { labels[], values[] }.
                 The new fixed-category chart expects categories[].
                 Show a friendly prompt instead of rendering stale data. */
              <div className="h-[350px] flex flex-col items-center justify-center gap-5 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                  🔄
                </div>
                <div className="max-w-[280px]">
                  <p className="text-white font-semibold text-base mb-1">
                    Updated skill breakdown available
                  </p>
                  <p className="text-foreground/50 text-sm leading-relaxed">
                    This analysis used the old skill format. Re-analyze to see
                    the new fixed-category breakdown (Backend, Frontend,
                    Database, DevOps/Infra, Testing, Security).
                  </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-neon-teal/10 border border-neon-teal/25 text-xs text-neon-teal">
                  Re-run analysis from the Overview page to update
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart outerRadius={120} data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={({ x, y, payload }) => {
                      const item = radarCategories.find(
                        (c) => c.name === payload.value,
                      );
                      const isNA = item?.score === null;
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={
                            isNA
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.7)"
                          }
                          fontSize={12}
                        >
                          {payload.value}
                          {isNA ? " (N/A)" : ""}
                        </text>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: "#aaa" }}
                    tickCount={5}
                  />
                  <Radar
                    dataKey="level"
                    stroke="#64FFDA"
                    fill="#64FFDA"
                    fillOpacity={0.35}
                    isAnimationActive
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Scoring methodology transparency panel — below radar */}
          <ScoringMethodologyPanel methodology={scoringMethodology} />
        </div>

        {/* LANGUAGE */}
        <Card className="border-white/10 bg-white/5 p-5">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Language Proficiency
          </h3>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={languageData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                tick={{ fill: "#aaa" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="language"
                tick={{ fill: "#aaa" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111",
                  border: "1px solid #333",
                }}
              />
              <Bar dataKey="lines" fill="#BB86FC" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* DETAILED SKILLS */}
      <Card className="border-white/10 bg-white/5 p-8 mb-16">
        <h3 className="mb-2 text-xl font-semibold text-white">
          Detailed Skills Assessment
        </h3>
        <p className="mb-8 text-xs text-foreground/40">
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
                      className={`font-medium ${
                        isNA ? "text-foreground/30" : "text-white"
                      }`}
                    >
                      {cat.name}
                    </h4>
                    {isNA && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-foreground/30 border border-white/10">
                        N/A
                      </span>
                    )}
                  </div>
                  {isNA ? (
                    <span className="text-xs text-foreground/25 italic">
                      Not applicable
                    </span>
                  ) : (
                    <span className="text-neon-teal font-bold">
                      {cat.score}%
                    </span>
                  )}
                </div>

                {isNA ? (
                  <div className="mt-2 h-2 rounded-full bg-white/5 border border-white/5" />
                ) : (
                  <Progress
                    value={cat.score ?? 0}
                    className="mt-2 h-2 bg-white/10"
                  />
                )}

                {cat.reason && (
                  <p
                    className={`mt-1 text-xs leading-relaxed ${
                      isNA ? "text-foreground/25 italic" : "text-foreground/50"
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
        <Card className="mb-16 border-white/10 bg-white/5 p-8">
          <h3 className="mb-8 text-xl font-semibold text-white">
            Achievements
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {achievements.map((a: any, i: number) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="h-10 w-10 mb-4 flex items-center justify-center rounded-lg bg-neon-teal/10 text-neon-teal">
                  🏆
                </div>
                <h4 className="text-white font-semibold">{a.title}</h4>
                <p className="mt-2 text-sm text-foreground/60">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* GROWTH RECOMMENDATIONS */}
      {growth.length > 0 && (
        <Card className="border border-neon-teal/30 bg-white/5 p-8">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Growth Recommendations
          </h3>

          <div className="space-y-4">
            {growth.map((g: any, i: number) => (
              <div
                key={i}
                className="p-5 rounded-lg bg-white/5 border border-white/10"
              >
                <p className="text-white font-medium">{g.title}</p>
                <p className="mt-1 text-sm text-foreground/60">{g.action}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <Card className="p-6 bg-white/5 border-white/10">
      <p className="text-sm text-foreground/60">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </Card>
  );
}
