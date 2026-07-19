// HPI 1.5-V
import React, { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  GitBranch,
  Activity,
  AlertCircle,
  TrendingUp,
  Code,
  Terminal,
  Shield,
  Zap,
  ChevronRight,
  Database,
  Lock,
  BookOpen,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { getRepositories } from "../../services/repositoryService";
import { Repositories } from "@/entities";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import AnalyzeRepositoryModal from "./AnalyzeRepositoryModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedHeroGlow from "../ui/AnimatedHeroGlow";
import { Repository } from "../../types/repository";
import { useMember } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://codelens-platform.onrender.com";

/* ---------- TYPES ---------- */
type StatItem = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
};

/* ---------- UTILS ---------- */
const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
  </div>
);

/* ---------- MAIN ---------- */
export default function HomePage() {
  const { member } = useMember();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [startingAnalysis, setStartingAnalysis] = useState(false);

  // ── Per-repo re-analysis state ─────────────────────────────────────────
  // Set of repo.id values that are currently being re-analyzed
  const [analyzingRepos, setAnalyzingRepos] = useState<Set<string>>(new Set());
  // Live chunk progress per analysisId
  const [repoProgress, setRepoProgress] = useState<
    Record<
      string,
      { chunksProcessed: number; totalChunks: number; status: string }
    >
  >({});
  // Keep interval references so we can cancel them per-repo
  const progressIntervalsRef = useRef<
    Record<string, ReturnType<typeof setInterval>>
  >({});

  const navigate = useNavigate();

  function requireLogin(action: () => void) {
    if (!member) {
      alert("Please login first to continue");
      return;
    }
    action();
  }

  /* ---------- DATA LOAD ---------- */
  useEffect(() => {
    if (!member) return;
    loadRepositories();
    const interval = setInterval(() => loadRepositories(true), 5000);
    return () => clearInterval(interval);
  }, [member]);

  const loadRepositories = async (silent = false) => {
    try {
      if (!member) return;
      if (!silent) setLoading(true);

      const data = await getRepositories(member._id);
      setRepositories(data);

      // Auto-clear analyzing state + stop progress polling when repo completes
      setAnalyzingRepos((prev) => {
        const next = new Set(prev);
        for (const repo of data) {
          if (
            repo.analysis?.status === "completed" ||
            repo.analysis?.status === "failed"
          ) {
            next.delete(repo.id);
            if (
              repo.analysis?.id &&
              progressIntervalsRef.current[repo.analysis.id]
            ) {
              clearInterval(progressIntervalsRef.current[repo.analysis.id]);
              delete progressIntervalsRef.current[repo.analysis.id];
              setRepoProgress((p) => {
                const copy = { ...p };
                delete copy[repo.analysis!.id];
                return copy;
              });
            }
          }
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to load repositories", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /* ---------- PER-REPO PROGRESS POLLING ---------- */
  function startProgressPolling(analysisId: string) {
    if (progressIntervalsRef.current[analysisId]) return; // no double-polling

    const poll = async () => {
      try {
        const res = await apiClient.get(`/analysis/${analysisId}/progress`);
        const { chunksProcessed, totalChunks, status } = res.data;
        setRepoProgress((prev) => ({
          ...prev,
          [analysisId]: { chunksProcessed, totalChunks, status },
        }));
        if (status === "done" || status === "completed") {
          clearInterval(progressIntervalsRef.current[analysisId]);
          delete progressIntervalsRef.current[analysisId];
        }
      } catch {
        // silent — main loadRepositories handles final state
      }
    };

    poll();
    progressIntervalsRef.current[analysisId] = setInterval(poll, 3000);
  }

  // Cleanup all progress intervals on component unmount
  useEffect(() => {
    return () => {
      Object.values(progressIntervalsRef.current).forEach(clearInterval);
    };
  }, []);

  /* ---------- RE-ANALYZE ---------- */
  async function handleReAnalyze(e: React.MouseEvent, repo: Repository) {
    e.stopPropagation(); // never trigger card's navigate-onClick

    if (!repo.repositoryUrl) {
      alert("Repository URL not available for this entry");
      return;
    }

    // Safeguard: already in-flight for this repo
    if (analyzingRepos.has(repo.id)) return;

    try {
      setAnalyzingRepos((prev) => new Set(prev).add(repo.id));

      const res = await apiClient.post("/analysis/start", {
        repoUrl: repo.repositoryUrl,
        userId: member?._id,
        userEmail: member?.loginEmail,
      });

      const analysisId = res.data.analysisId;
      if (analysisId) {
        startProgressPolling(analysisId);
      }

      await loadRepositories(true);
    } catch (err: any) {
      console.error("Re-analyze failed:", err);
      alert(err?.response?.data?.error || "Failed to re-start analysis");
      setAnalyzingRepos((prev) => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  }

  /* ---------- ANALYZE (NEW REPO via modal) ---------- */
  async function handleAnalyzeRepository(repoUrl: string) {
    try {
      setStartingAnalysis(true);

      const res = await apiClient.post("/analysis/start", {
        repoUrl,
        userId: member?._id,
        userEmail: member?.loginEmail,
      });

      const analysisId = res.data.analysisId;
      if (!analysisId) throw new Error("analysisId missing");

      await loadRepositories();
      navigate(`/analysis/${analysisId}/overview`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to start analysis");
    } finally {
      setStartingAnalysis(false);
      setOpenModal(false);
    }
  }

  /* ---------- SCROLL PROGRESS BAR ---------- */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  /* ---------- HELPERS ---------- */
  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "border-green-500/50 text-green-400 bg-green-500/10";
      case "running":
      case "analyzing":
      case "processing":
        return "border-neon-teal/50 text-neon-teal bg-neon-teal/10";
      case "failed":
        return "border-red-500/50 text-red-400 bg-red-500/10";
      case "pending":
        return "border-yellow-500/50 text-yellow-400 bg-yellow-500/10";
      default:
        return "border-foreground/30 text-foreground/60 bg-foreground/5";
    }
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-neon-teal z-50 origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10 w-full">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex items-center pt-24">
          <GridBackground />
          <AnimatedHeroGlow />

          <div className="w-full px-10 md:px-16 lg:px-24">
            <div className="max-w-[1200px]">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                UNLEASH YOUR <br />
                <span className="text-neon-teal">CODE POTENTIAL</span>
              </h1>

              <p className="max-w-xl text-white/60 mb-10 text-lg">
                AI-powered code review &amp; developer skill profiling platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => requireLogin(() => setOpenModal(true))}
                  className="px-8 py-4 bg-neon-teal text-black font-bold rounded-lg hover:bg-neon-teal/90 transition"
                >
                  Initialize Analysis
                </button>

                <button
                  onClick={() => requireLogin(() => setOpenModal(true))}
                  className="px-8 py-4 border border-white/20 rounded-lg hover:bg-white/5 transition"
                >
                  Add Repository
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── MODAL ────────────────────────────────────────────────────── */}
        <AnalyzeRepositoryModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAnalyze={handleAnalyzeRepository}
        />

        {startingAnalysis && (
          <div className="fixed bottom-10 right-10 bg-neon-teal text-black px-6 py-3 rounded-lg font-semibold shadow-lg animate-pulse">
            Initializing analysis pipeline...
          </div>
        )}

        {/* ── REPOSITORIES ─────────────────────────────────────────────── */}
        {member && (
          <section className="px-10 md:px-16 lg:px-24 pb-32">
            <h2 className="text-3xl font-bold mb-10">Your Repositories</h2>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-neon-teal border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {repositories.map((repo) => {
                  const isAnalyzing = analyzingRepos.has(repo.id);
                  const analysisId = repo.analysis?.id;
                  const progress = analysisId ? repoProgress[analysisId] : null;

                  // Override status badge text/colour while in-flight
                  const displayStatus = isAnalyzing
                    ? "analyzing"
                    : repo.analysis?.status || repo.status;

                  // Live chunk count label shown inside the badge
                  const progressLabel =
                    isAnalyzing && progress
                      ? `${progress.chunksProcessed}/${progress.totalChunks}`
                      : null;

                  return (
                    <Card
                      key={repo.id}
                      className="cursor-pointer border-white/10 bg-[#111] hover:border-neon-teal/50 transition-all duration-300 overflow-hidden"
                      onClick={() => {
                        if (!member) {
                          alert("Please login to view analysis");
                          return;
                        }
                        // Block navigation while re-analyzing
                        if (isAnalyzing) return;
                        if (!repo.analysis?.id) {
                          alert("Analysis not ready yet");
                          return;
                        }
                        if (repo.analysis?.status === "failed") {
                          alert(
                            "Analysis failed. Please re-run from the dashboard and check backend logs.",
                          );
                          return;
                        }
                        if (repo.analysis?.status !== "completed") {
                          alert("Analysis still running");
                          return;
                        }
                        navigate(`/analysis/${repo.analysis.id}/overview`);
                      }}
                    >
                      {/* ── CARD HEADER ────────────────────────────────── */}
                      <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        {/* Top row: branch icon | status badge + Re-analyze btn */}
                        <div className="flex justify-between items-center mb-4">
                          <GitBranch className="text-neon-teal shrink-0" />

                          <div className="flex items-center gap-2">
                            {/* Status badge — pulses while analyzing */}
                            <span
                              className={`text-xs px-2 py-1 border rounded flex items-center gap-1.5 ${getStatusColor(
                                displayStatus,
                              )}`}
                            >
                              {isAnalyzing && (
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                              )}
                              {displayStatus}
                              {progressLabel && (
                                <span className="text-[10px] opacity-60">
                                  ({progressLabel})
                                </span>
                              )}
                            </span>

                            {/* ── RE-ANALYZE BUTTON ────────────────────── */}
                            <button
                              id={`reanalyze-${repo.id}`}
                              onClick={(e) => handleReAnalyze(e, repo)}
                              disabled={isAnalyzing}
                              title={
                                isAnalyzing
                                  ? "Analysis already in progress…"
                                  : "Re-analyze this repository"
                              }
                              className={`
                                flex items-center justify-center h-7 w-7 rounded-md border
                                transition-all duration-200 shrink-0
                                ${
                                  isAnalyzing
                                    ? "border-white/10 text-white/20 cursor-not-allowed"
                                    : "border-white/15 text-white/40 hover:border-neon-teal/60 hover:text-neon-teal hover:bg-neon-teal/5 active:scale-95"
                                }
                              `}
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 ${
                                  isAnalyzing ? "animate-spin" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold">
                          {repo.repositoryName}
                        </h3>

                        <p className="text-xs text-white/50 mt-1">
                          {repo.owner || "Unknown"}
                        </p>
                      </div>

                      {/* ── CARD FOOTER ────────────────────────────────── */}
                      <div className="p-6 text-sm text-white/60">
                        {isAnalyzing
                          ? progress
                            ? `Re-analyzing… (section ${progress.chunksProcessed} of ${progress.totalChunks} parsed)`
                            : "Re-analyzing — this may take 20–30 seconds…"
                          : repo.analysis?.status === "completed"
                          ? "Click to view analysis results"
                          : "Analysis not completed"}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <footer className="py-12 text-center text-xs text-white/30">
          © 2026 CodeLens AI — SYSTEM OPERATIONAL
        </footer>
      </main>
    </div>
  );
}
