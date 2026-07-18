import { motion } from "framer-motion";
import {
  GitBranch,
  Clock,
  FileText,
  Layers,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useParams, useNavigate } from "react-router-dom";
import { useAnalysisOverview } from "@/hooks/useAnalysisOverview";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AnalysisOverviewPage() {
  const { analysisId } = useParams();
  const navigate = useNavigate();

  const { data, loading, progress } = useAnalysisOverview(analysisId);

  if (loading) {
    let msg = "Loading analysis overview...";
    if (progress && progress.status === "analyzing") {
      msg = `Analyzing repository... (Section ${progress.chunksProcessed} of ${progress.totalChunks} parsed`;
      if (progress.estimatedSecondsRemaining > 0) {
        msg += `, ~${progress.estimatedSecondsRemaining}s remaining`;
      }
      msg += ")";
    } else {
      msg =
        "Analyzing repository... (This may take 20-30 seconds for larger repos)";
    }

    return (
      <div className="flex h-screen items-center justify-center p-8 bg-[#0b1020]">
        <LoadingSpinner
          message={msg}
          className="flex items-center space-x-4 text-neon-teal"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-destructive">
        Failed to load analysis overview
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold text-white">{data.repoName}</h1>
        <p className="text-foreground/60 mt-2">Repository Analysis Overview</p>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 bg-white/5 border-white/10">
          <GitBranch className="h-5 w-5 text-neon-teal mb-2" />
          <p className="text-sm text-foreground/60">Status</p>
          <p className="text-xl font-bold text-white">{data.status}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <Activity className="h-5 w-5 text-secondary mb-2" />
          <p className="text-sm text-foreground/60">Commits</p>
          <p className="text-xl font-bold text-white">{data.commits}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <FileText className="h-5 w-5 text-neon-teal mb-2" />
          <p className="text-sm text-foreground/60">Files</p>
          <p className="text-xl font-bold text-white">{data.files}</p>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <Clock className="h-5 w-5 text-secondary mb-2" />
          <p className="text-sm text-foreground/60">Analyzed At</p>
          <p className="text-sm font-bold text-white">
            {new Date(data.analyzedAt).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* LANGUAGES */}
      <Card className="p-6 bg-white/5 border-white/10 mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="text-neon-teal" />
          <h3 className="text-xl font-bold text-white">Languages Used</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.languages?.map((lang: string) => (
            <span
              key={lang}
              className="px-3 py-1 rounded-full bg-neon-teal/10 text-neon-teal text-xs border border-neon-teal/30"
            >
              {lang}
            </span>
          ))}
        </div>
      </Card>

      {/* NAVIGATION */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Code Quality", path: "code-quality" },
          { label: "AI Review", path: "ai-review" },
          { label: "Skills Profile", path: "skill-summary" },
          { label: "Best Practices", path: "best-practices" },
        ].map((item) => (
          <Card
            key={item.path}
            className="p-6 bg-white/5 border-white/10 cursor-pointer hover:border-neon-teal/50 transition"
            onClick={() => navigate(`/analysis/${analysisId}/${item.path}`)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-white">{item.label}</h4>
              <ArrowRight className="text-neon-teal" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
