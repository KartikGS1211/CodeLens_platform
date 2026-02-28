import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useCodeQuality } from "@/hooks/useCodeQuality";

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

type CodeQualityResponse = {
  qualityTrend: QualityTrendItem[];
  moduleComplexity: ModuleComplexityItem[];
  qualityDimensions: QualityDimensions;
  recentIssues: Issue[];
  debtForecast?: DebtForecast | null;
};

// ---------------- HELPERS ----------------

function severityDot(level: string) {
  if (level === "high") return "bg-red-500";
  if (level === "medium") return "bg-purple-500";
  return "bg-emerald-400";
}

function severityBadge(level: string) {
  if (level === "high") return "bg-red-500/10 text-red-400";
  if (level === "medium") return "bg-purple-500/10 text-purple-400";
  return "bg-emerald-500/10 text-emerald-400";
}

function getRiskBadge(level: string) {
  if (level === "High") return "bg-red-500/20 text-red-400";
  if (level === "Moderate") return "bg-yellow-500/20 text-yellow-400";
  return "bg-emerald-500/20 text-emerald-400";
}

function RecentIssues({ issues }: { issues: Issue[] }) {
  if (!issues?.length) return null;

  return (
    <div className="space-y-4">
      {issues.map((issue, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-5"
        >
          <div className="flex gap-4">
            <span
              className={`h-3 w-3 rounded-full mt-2 ${severityDot(
                issue.severity,
              )}`}
            />
            <div>
              <p className="text-white font-medium">{issue.title}</p>
              <p className="text-xs text-foreground/50">{issue.file}</p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${severityBadge(
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
    return <div className="p-8 text-neon-teal">Loading code quality…</div>;
  }

  if (!data) {
    return <div className="p-8 text-red-500">Failed to load data</div>;
  }

  // ---------------- DATA ----------------

  const {
    qualityTrend,
    moduleComplexity,
    qualityDimensions,
    recentIssues,
    debtForecast,
  } = data;

  if (!qualityTrend || !moduleComplexity || !qualityDimensions) {
    return <div className="p-8 text-red-500">Invalid data format</div>;
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

  // ---------------- CHART DATA ----------------

  const radarData = {
    labels: metrics.map((m) => m.label),
    datasets: [
      {
        label: "Quality Dimensions",
        data: metrics.map((m) => m.value),
        backgroundColor: "rgba(100,255,218,0.25)",
        borderColor: "#64FFDA",
        borderWidth: 2,
      },
    ],
  };

  const trendData = {
    labels: qualityTrend.map((t) => t.month),
    datasets: [
      {
        label: "Quality Trend",
        data: qualityTrend.map((t) => Number(t.score)),
        borderColor: "#64FFDA",
        backgroundColor: "rgba(100,255,218,0.15)",
        tension: 0.4,
      },
    ],
  };

  const moduleComplexityData = {
    labels: moduleComplexity.map((m) => m.module),
    datasets: [
      {
        label: "Complexity",
        data: moduleComplexity.map((m) => m.complexity),
        backgroundColor: "#BB86FC",
        borderRadius: 6,
      },
    ],
  };

  // ---------------- UI ----------------

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">
        Code Quality Overview
      </h1>

      <p className="text-foreground/60 mb-12">
        AI-evaluated health of your repository
      </p>

      {/* OVERALL SCORE */}
      <Card className="p-8 bg-white/5 border-white/10 mb-12">
        <p className="text-sm text-foreground/60">Overall Quality Score</p>
        <p className="text-5xl font-bold text-white mt-2">{overallScore}/100</p>
      </Card>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
        {metrics.map((m) => (
          <Card key={m.label} className="p-6 bg-white/5 border-white/10">
            <p className="text-sm text-foreground/60">{m.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{m.value}/100</p>
          </Card>
        ))}
      </div>

      {/*  TECHNICAL DEBT FORECAST  */}
      {debtForecast && (
        <Card className="p-8 bg-gradient-to-br from-purple-500/5 to-red-500/5 border-purple-500/20 mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              🔮 Technical Debt Forecast
            </h2>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold ${
                debtForecast.riskLevel === "High"
                  ? "bg-red-500/20 text-red-400"
                  : debtForecast.riskLevel === "Moderate"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-emerald-500/20 text-emerald-400"
              }`}
            >
              {debtForecast.riskLevel} Risk
            </span>
          </div>

          {/* Debt Score */}
          <div className="mb-8">
            <p className="text-sm text-foreground/60 mb-2">
              Current Debt Score
            </p>
            <p className="text-5xl font-bold text-white">
              {debtForecast.currentDebtScore}{" "}
              <span className="text-xl">/100</span>
            </p>

            <div className="w-full bg-white/10 h-3 rounded-full mt-4">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  debtForecast.currentDebtScore > 70
                    ? "bg-red-500"
                    : debtForecast.currentDebtScore > 40
                    ? "bg-yellow-400"
                    : "bg-emerald-400"
                }`}
                style={{ width: `${debtForecast.currentDebtScore}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60">
                Risk Growth (Next 3 Months)
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                +{debtForecast.projectedRiskIncrease}%
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60">
                Estimated Refactor Effort
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                ~{debtForecast.estimatedRefactorHours} hrs
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-sm text-foreground/60">
                Maintainability Decline Probability
              </p>
              <p className="text-2xl font-bold text-white mt-2">
                {debtForecast.maintainabilityDeclineProbability}
              </p>
            </div>
          </div>

          {/* AI Insight */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
            <p className="text-sm text-foreground/60 mb-3">
              Why is this happening?
            </p>
            <p className="text-white leading-relaxed">
              {debtForecast.aiInsight}
            </p>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {/* LEFT COLUMN */}
        <div className="grid grid-rows-2 gap-8">
          {/* Quality Breakdown */}
          <Card className="p-6 bg-white/5 border-white/10 h-[380px]">
            <h3 className="text-xl text-white mb-4">Quality Breakdown</h3>
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
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Module Complexity */}
          <Card className="p-6 bg-white/5 border-white/10 h-[380px]">
            <h3 className="text-xl text-white mb-4">Module Complexity</h3>
            <div className="h-[300px]">
              <Bar
                data={moduleComplexityData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="grid grid-rows-2 gap-8">
          {/* Quality Trend */}
          <Card className="p-6 bg-white/5 border-white/10 h-[380px]">
            <h3 className="text-xl text-white mb-4">Quality Trend</h3>
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
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Recent Issues */}
          <Card className="p-6 bg-white/5 border-white/10 h-[380px] overflow-y-auto">
            <h3 className="text-xl text-white mb-4">Recent Issues</h3>
            <RecentIssues issues={recentIssues || []} />
          </Card>
        </div>
      </div>
    </div>
  );
}
