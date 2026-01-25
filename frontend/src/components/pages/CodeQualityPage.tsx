import { Card } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useAnalysisOverview } from "@/hooks/useAnalysisOverview";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";
import { useCodeQuality } from "@/hooks/useCodeQuality";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Tooltip,
  Legend,
);

export default function CodeQualityPage() {
  const { analysisId } = useParams();
  const { data, loading } = useCodeQuality(analysisId);

  const readability = Number(data?.readability ?? 0);
  const maintainability = Number(data?.maintainability ?? 0);
  const security = Number(data?.security ?? 0);
  const performance = Number(data?.performance ?? 0);

  const metrics = [
    { label: "Readability", value: readability },
    { label: "Maintainability", value: maintainability },
    { label: "Security", value: security },
    { label: "Performance", value: performance },
  ];

  /* 🔹 LINE CHART */
  const lineData = {
    labels: ["Readability", "Maintainability", "Security", "Performance"],
    datasets: [
      {
        label: "Quality Score",
        data: [readability, maintainability, security, performance],
        borderColor: "#64FFDA",
        backgroundColor: "rgba(100,255,218,0.2)",
        tension: 0.4,
      },
    ],
  };

  /* 🔹 BAR CHART (MODULE COMPLEXITY – DERIVED VIEW) */
  const barData = {
    labels: ["Auth", "API", "UI", "Database"],
    datasets: [
      {
        label: "Complexity",
        data: [security, maintainability, readability, performance],
        backgroundColor: "#BB86FC",
      },
    ],
  };

  /* 🔹 RADAR CHART */
  const radarData = {
    labels: ["Readability", "Maintainability", "Security", "Performance"],
    datasets: [
      {
        label: "Quality Dimensions",
        data: [readability, maintainability, security, performance],
        backgroundColor: "rgba(100,255,218,0.25)",
        borderColor: "#64FFDA",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return <div className="p-8 text-neon-teal">Loading code quality…</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold text-white mb-2">
        Code Quality Overview
      </h1>
      <p className="text-foreground/60 mb-10">
        AI-evaluated health of your repository
      </p>

      {/* 🔹 METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {metrics.map((m) => (
          <Card key={m.label} className="p-6 bg-white/5 border-white/10">
            <p className="text-sm text-foreground/60">{m.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{m.value}/10</p>
          </Card>
        ))}
      </div>

      {/* 🔹 CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-xl text-white mb-4">Overall Quality</h3>
          <Line data={lineData} />
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <h3 className="text-xl text-white mb-4">Module Complexity</h3>
          <Bar data={barData} />
        </Card>
      </div>

      {/* 🔹 RADAR */}
      <Card className="mt-10 p-6 bg-white/5 border-white/10">
        <h3 className="text-xl text-white mb-6">Quality Dimensions</h3>
        <div className="max-w-[420px] mx-auto">
          <Radar data={radarData} />
        </div>
      </Card>
    </div>
  );
}
