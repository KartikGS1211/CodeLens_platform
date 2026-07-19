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
      <div className="flex h-screen items-center justify-center p-8 bg-cl-bg">
        <LoadingSpinner
          message={msg}
          className="flex items-center space-x-4 text-cl-accent"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-cl-error">Failed to load analysis overview</div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 sm:px-8 py-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text">
          {data.repoName}
        </h1>
        <p className="text-cl-muted mt-2">Repository Analysis Overview</p>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-12">
        <Card className="p-5 bg-cl-surface border-cl-border">
          <GitBranch className="h-4 w-4 text-cl-accent mb-2" />
          <p className="text-xs text-cl-muted">Status</p>
          <p className="text-lg font-semibold text-cl-text mt-1 font-heading">
            {data.status}
          </p>
        </Card>

        <Card className="p-5 bg-cl-surface border-cl-border">
          <Activity className="h-4 w-4 text-cl-accent mb-2" />
          <p className="text-xs text-cl-muted">Commits</p>
          <p className="text-lg font-semibold text-cl-text mt-1 font-mono-data">
            {data.commits}
          </p>
        </Card>

        <Card className="p-5 bg-cl-surface border-cl-border">
          <FileText className="h-4 w-4 text-cl-accent mb-2" />
          <p className="text-xs text-cl-muted">Files</p>
          <p className="text-lg font-semibold text-cl-text mt-1 font-mono-data">
            {data.files}
          </p>
        </Card>

        <Card className="p-5 bg-cl-surface border-cl-border">
          <Clock className="h-4 w-4 text-cl-muted mb-2" />
          <p className="text-xs text-cl-muted">Analyzed At</p>
          <p className="text-sm font-semibold text-cl-text mt-1">
            {new Date(data.analyzedAt).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* LANGUAGES */}
      <Card className="p-5 bg-cl-surface border-cl-border mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="text-cl-accent h-4 w-4" />
          <h3 className="font-heading text-lg font-semibold text-cl-text">
            Languages Used
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.languages?.map((lang: string) => (
            <span
              key={lang}
              className="px-3 py-1 rounded-md bg-cl-accent/10 text-cl-accent text-xs font-medium border border-cl-accent/20"
            >
              {lang}
            </span>
          ))}
        </div>
      </Card>

      {/* NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "Code Quality", path: "code-quality" },
          { label: "AI Review", path: "ai-review" },
          { label: "Skills Profile", path: "skill-summary" },
          { label: "Best Practices", path: "best-practices" },
        ].map((item) => (
          <Card
            key={item.path}
            className="p-5 bg-cl-surface border-cl-border cursor-pointer hover:border-cl-accent/50 hover:shadow-glow-accent transition-all duration-200 group"
            onClick={() => navigate(`/analysis/${analysisId}/${item.path}`)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-heading font-semibold text-cl-text group-hover:text-white transition-colors">
                {item.label}
              </h4>
              <ArrowRight className="text-cl-accent h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
