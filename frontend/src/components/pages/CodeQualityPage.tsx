import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useCodeQuality } from "@/hooks/useCodeQuality";
import { ScoringMethodologyPanel } from "@/components/ui/ScoringMethodologyPanel";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

import { Radar, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  BarElement,
);

// ---------------- TYPES ----------------

type Issue = {
  title: string;
  file: string;
  severity: "high" | "medium" | "low";
};

type QualityTrendItem = {
  month: string;
  score: number;
};

type ModuleComplexityItem = {
  module: string;
  complexity: number;
};

type QualityDimensions = {
  readability: number;
  maintainability: number;
  security: number;
  performance: number;
  reliability: number;
  documentation: number;
};

type DebtForecast = {
  currentDebtScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  projectedRiskIncrease: number;
  estimatedRefactorHours: number;
  maintainabilityDeclineProbability: "Low" | "Medium" | "High";
  aiInsight: string;
};

type QualityTrendMeta = {
  hasHistory: boolean;
  isEstimated: boolean;
};

type CodeQualityResponse = {
  qualityTrend: QualityTrendItem[];
  qualityTrendMeta?: QualityTrendMeta | null;
  moduleComplexity: ModuleComplexityItem[];
  qualityDimensions: QualityDimensions;
  recentIssues: Issue[];
  debtForecast?: DebtForecast | null;
  scoringMethodology?: {
    dataSources: string[];
    notUsed: string[];
    chunkCoverage: {
      chunksProcessed: number;
      totalChunks: number;
      coveragePct: number;
      note: string;
    };
  } | null;
};

// ---------------- HELPERS ----------------

function severityDot(level: string) {
  if (level === "high") return "bg-cl-error";
  if (level === "medium") return "bg-amber-500";
  return "bg-cl-success";
}

function severityBadge(level: string) {
  if (level === "high") return "bg-cl-error/10 text-cl-error";
  if (level === "medium") return "bg-amber-500/10 text-amber-400";
  return "bg-cl-success/10 text-cl-success";
}

function getRiskBadge(level: string) {
  if (level === "High") return "bg-cl-error/20 text-cl-error";
  if (level === "Moderate") return "bg-yellow-500/20 text-yellow-400";
  return "bg-cl-success/20 text-cl-success";
}

function RecentIssues({ issues }: { issues: Issue[] }) {
  if (!issues?.length) return null;

  return (
    <div className="space-y-3">
      {issues.map((issue, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-cl-surface border border-cl-border rounded-card p-4"
        >
          <div className="flex gap-3">
            <span
              className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${severityDot(
                issue.severity,
              )}`}
            />
            <div>
              <p className="text-cl-text font-medium text-sm">{issue.title}</p>
              <p className="text-xs text-cl-muted mt-0.5">{issue.file}</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${severityBadge(
              issue.severity,
            )}`}
          >
            {issue.severity}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------- PAGE ----------------

export default function CodeQualityPage() {
  const { analysisId } = useParams();
  const { data, loading } = useCodeQuality(analysisId) as {
    data: CodeQualityResponse | null;
    loading: boolean;
  };

  if (loading) {
    return (
      <div className="p-8 text-cl-accent text-sm">Loading code quality…</div>
    );
  }

  if (!data) {
    return <div className="p-8 text-cl-error">Failed to load data</div>;
  }

  // ---------------- DATA ----------------

  const {
    qualityTrend,
    qualityTrendMeta,
    moduleComplexity,
    qualityDimensions,
    recentIssues,
    debtForecast,
    scoringMethodology,
  } = data;

  if (!qualityTrend || !moduleComplexity || !qualityDimensions) {
    return <div className="p-8 text-cl-error">Invalid data format</div>;
  }

  const metrics = [
    { label: "Readability", value: qualityDimensions.readability },
    { label: "Maintainability", value: qualityDimensions.maintainability },
    { label: "Security", value: qualityDimensions.security },
    { label: "Performance", value: qualityDimensions.performance },
    { label: "Reliability", value: qualityDimensions.reliability },
    { label: "Documentation", value: qualityDimensions.documentation },
  ];

  const overallScore = Math.round(
    metrics.reduce((a, b) => a + b.value, 0) / metrics.length,
  );

  // Score color helper — green for high, amber for mid, red for low
  function getScoreColor(score: number) {
    if (score >= 75) return "text-cl-success";
    if (score >= 50) return "text-amber-400";
    return "text-cl-error";
  }

  // ---------------- CHART DATA ----------------

  const radarData = {
    labels: metrics.map((m) => m.label),
    datasets: [
      {
        label: "Quality Dimensions",
        data: metrics.map((m) => m.value),
        backgroundColor: "rgba(94, 106, 210, 0.2)",
        borderColor: "#5E6AD2",
        borderWidth: 2,
        pointBackgroundColor: "#5E6AD2",
        pointBorderColor: "#5E6AD2",
        pointRadius: 3,
      },
    ],
  };

  const trendData = {
    labels: qualityTrend.map((t) => t.month),
    datasets: [
      {
        label: "Quality Trend",
        data: qualityTrend.map((t) => Number(t.score)),
        borderColor: "#5E6AD2",
        backgroundColor: "rgba(94, 106, 210, 0.1)",
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#5E6AD2",
      },
    ],
  };

  const moduleComplexityData = {
    labels: moduleComplexity.map((m) => m.module),
    datasets: [
      {
        label: "Complexity",
        data: moduleComplexity.map((m) => m.complexity),
        backgroundColor: "#5E6AD2",
        borderRadius: 4,
      },
    ],
  };

  // ----------- Common chart theme options -----------
  const chartTextColor = "#8B8D98";
  const chartGridColor = "rgba(31, 33, 43, 0.8)";

  // ---------------- UI ----------------

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">
      <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text mb-2">
        Code Quality Overview
      </h1>

      <p className="text-cl-muted mb-6">
        AI-evaluated health of your repository
      </p>

      {/* ── PERSISTENT SCORE DISCLAIMER BANNER ───────────────────────────── */}
      <div
        className="mb-10 flex items-start gap-2.5 rounded-card px-4 py-3 text-xs"
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

      {/* OVERALL SCORE — Primary metric, visually prominent */}
      <Card className="p-8 bg-cl-surface border-cl-accent/30 mb-12 shadow-glow-accent">
        <p className="text-sm text-cl-muted">Overall Quality Score</p>
        <p
          className={`text-5xl sm:text-6xl font-bold mt-2 font-mono-data ${getScoreColor(
            overallScore,
          )}`}
        >
          {overallScore}
          <span className="text-2xl text-cl-muted">/100</span>
        </p>
      </Card>

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5 bg-cl-surface border-cl-border">
            <p className="text-xs text-cl-muted">{m.label}</p>
            <p
              className={`text-2xl font-bold mt-2 font-mono-data ${getScoreColor(
                m.value,
              )}`}
            >
              {m.value}
              <span className="text-sm text-cl-muted">/100</span>
            </p>
          </Card>
        ))}
      </div>

      {/* Scoring methodology transparency panel — below quality metrics */}
      <ScoringMethodologyPanel
        methodology={scoringMethodology}
        className="mb-10"
      />

      {/*  TECHNICAL DEBT FORECAST  */}
      {debtForecast && (
        <Card className="p-8 bg-gradient-to-br from-cl-accent/5 to-cl-error/5 border-cl-accent/20 mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-cl-text flex items-center gap-3">
              🔮 Technical Debt Forecast
            </h2>

            <span
              className={`px-3 py-1 rounded-md text-sm font-semibold ${
                debtForecast.riskLevel === "High"
                  ? "bg-cl-error/20 text-cl-error"
                  : debtForecast.riskLevel === "Moderate"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-cl-success/20 text-cl-success"
              }`}
            >
              {debtForecast.riskLevel} Risk
            </span>
          </div>

          {/* Debt Score */}
          <div className="mb-8">
            <p className="text-sm text-cl-muted mb-2">Current Debt Score</p>
            <p className="text-4xl sm:text-5xl font-bold text-cl-text font-mono-data">
              {debtForecast.currentDebtScore}{" "}
              <span className="text-xl text-cl-muted">/100</span>
            </p>

            <div className="w-full bg-cl-border h-2 rounded-full mt-4">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  debtForecast.currentDebtScore > 70
                    ? "bg-cl-error"
                    : debtForecast.currentDebtScore > 40
                    ? "bg-yellow-400"
                    : "bg-cl-success"
                }`}
                style={{ width: `${debtForecast.currentDebtScore}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="bg-cl-surface p-5 rounded-card border border-cl-border">
              <p className="text-xs text-cl-muted">
                Risk Growth (Next 3 Months)
              </p>
              <p className="text-xl font-bold text-cl-text mt-2 font-mono-data">
                +{debtForecast.projectedRiskIncrease}%
              </p>
            </div>

            <div className="bg-cl-surface p-5 rounded-card border border-cl-border">
              <p className="text-xs text-cl-muted">Estimated Refactor Effort</p>
              <p className="text-xl font-bold text-cl-text mt-2 font-mono-data">
                ~{debtForecast.estimatedRefactorHours} hrs
              </p>
            </div>

            <div className="bg-cl-surface p-5 rounded-card border border-cl-border">
              <p className="text-xs text-cl-muted">
                Maintainability Decline Probability
              </p>
              <p className="text-xl font-bold text-cl-text mt-2">
                {debtForecast.maintainabilityDeclineProbability}
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-cl-surface border border-cl-border p-5 rounded-card">
            <p className="text-xs text-cl-muted mb-3">Why is this happening?</p>
            <p className="text-cl-text leading-relaxed text-sm">
              {debtForecast.aiInsight}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        {/* LEFT COLUMN */}
        <div className="grid grid-rows-2 gap-6">
          {/* Quality Breakdown — Radar chart with FIX for label overlap */}
          <Card className="p-5 bg-cl-surface border-cl-border h-[380px]">
            <h3 className="font-heading text-lg font-semibold text-cl-text mb-4">
              Quality Breakdown
            </h3>
            <div className="h-[300px]">
              <Radar
                data={radarData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: {
                        stepSize: 20,
                        backdropColor: "transparent",
                        color: "#8B8D98",
                        font: {
                          size: 9,
                          family: "JetBrains Mono, monospace",
                        },
                        z: 1,
                      },
                      grid: {
                        color: chartGridColor,
                      },
                      angleLines: {
                        color: chartGridColor,
                      },
                      pointLabels: {
                        color: "#E4E4E7",
                        font: {
                          size: 11,
                          family: "Inter Tight, Inter, sans-serif",
                          weight: 500,
                        },
                        padding: 16,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Module Complexity */}
          <Card className="p-5 bg-cl-surface border-cl-border h-[380px]">
            <h3 className="font-heading text-lg font-semibold text-cl-text mb-4">
              Module Complexity
            </h3>
            <div className="h-[300px]">
              <Bar
                data={moduleComplexityData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: { color: chartTextColor, font: { size: 10 } },
                      grid: { color: chartGridColor },
                    },
                    y: {
                      ticks: { color: chartTextColor, font: { size: 10 } },
                      grid: { color: chartGridColor },
                    },
                  },
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="grid grid-rows-2 gap-6">
          {/* Quality Trend */}
          <Card className="p-5 bg-cl-surface border-cl-border h-[380px]">
            <h3 className="font-heading text-lg font-semibold text-cl-text mb-4">
              Quality Trend
            </h3>

            {qualityTrendMeta?.hasHistory === false ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-cl-surface border border-cl-border flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-cl-text font-semibold text-base font-heading">
                    Not enough history yet
                  </p>
                  <p className="text-cl-muted text-sm mt-1">
                    Trend will appear after future analyses
                  </p>
                </div>
                {/* Show current score as a badge instead of a chart */}
                {qualityTrend?.[0] && (
                  <div className="mt-2 px-5 py-3 rounded-card bg-cl-accent/10 border border-cl-accent/30">
                    <p className="text-xs text-cl-muted mb-1">Current Score</p>
                    <p className="text-3xl font-bold text-cl-accent font-mono-data">
                      {qualityTrend[0].score}
                      <span className="text-base text-cl-muted">/100</span>
                    </p>
                    <p className="text-xs text-cl-muted mt-1">
                      {qualityTrend[0].month}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[300px]">
                <Line
                  data={trendData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        min: 0,
                        max: 100,
                        ticks: {
                          stepSize: 10,
                          color: chartTextColor,
                          font: {
                            size: 10,
                            family: "JetBrains Mono, monospace",
                          },
                        },
                        grid: { color: chartGridColor },
                      },
                      x: {
                        ticks: {
                          color: chartTextColor,
                          font: { size: 10 },
                        },
                        grid: { color: chartGridColor },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            )}
          </Card>

          {/* Recent Issues */}
          <Card className="p-5 bg-cl-surface border-cl-border h-[380px] overflow-y-auto">
            <h3 className="font-heading text-lg font-semibold text-cl-text mb-4">
              Recent Issues
            </h3>
            <RecentIssues issues={recentIssues || []} />
          </Card>
        </div>
      </div>
    </div>
  );
}
