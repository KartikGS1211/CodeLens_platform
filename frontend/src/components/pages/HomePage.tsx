// HPI 1.5-V — Modern Developer Tool Redesign
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
import InteractiveHeroBackground from "../ui/InteractiveHeroBackground";
import HeroMockup from "../ui/HeroMockup";
import { Repository } from "../../types/repository";
import { useMember } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/* ---------- TYPES ---------- */
type StatItem = {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: string;
};

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
        return "border-cl-success/50 text-cl-success bg-cl-success/10";
      case "running":
      case "analyzing":
      case "processing":
        return "border-cl-accent/50 text-cl-accent bg-cl-accent/10";
      case "failed":
        return "border-cl-error/50 text-cl-error bg-cl-error/10";
      case "pending":
        return "border-yellow-500/50 text-yellow-400 bg-yellow-500/10";
      default:
        return "border-cl-border text-cl-muted bg-cl-surface";
    }
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="relative min-h-screen bg-cl-bg text-cl-text overflow-hidden">
      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-cl-accent z-50 origin-left"
        style={{ scaleX }}
      />

      <main className="relative z-10 w-full">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative flex items-center pt-20 pb-16 sm:pb-20 lg:min-h-screen lg:pt-16">
          <InteractiveHeroBackground />

          <div className="w-full px-5 sm:px-8 md:px-14 lg:px-24 py-8 lg:py-0">
            <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-12 xl:gap-20 w-full">
              {/* ── Left: headline + CTAs ──────────────────────────────────── */}
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cl-accent/30 bg-cl-accent/8 mb-5 sm:mb-7"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cl-accent animate-pulse" />
                  <span className="text-xs font-semibold text-cl-accent tracking-wide">
                    AI-Powered Code Intelligence
                  </span>
                </motion.div>

                <motion.h1
                  className="font-heading text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mb-5 sm:mb-6 leading-[1.1] tracking-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.05 }}
                >
                  See what your code <br className="hidden sm:block" />
                  <span className="text-cl-accent">actually says</span> about
                  you.
                </motion.h1>

                <motion.p
                  className="max-w-lg mx-auto sm:mx-0 text-cl-muted mb-8 sm:mb-10 text-sm sm:text-base lg:text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 }}
                >
                  Analyze any repo. Get real quality scores, security flags, and
                  a skill breakdown backed by evidence — not guesses.
                </motion.p>

                <motion.div
                  className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <button
                    id="cta-analyze-repo"
                    onClick={() => requireLogin(() => setOpenModal(true))}
                    className="px-6 sm:px-7 py-3 sm:py-3.5 bg-cl-accent text-white font-semibold rounded-lg hover:bg-cl-accent-hover transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cl-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cl-bg shadow-lg shadow-cl-accent/20 text-sm sm:text-base"
                  >
                    Analyze a Repo
                  </button>

                  <button
                    id="cta-add-repository"
                    onClick={() => requireLogin(() => setOpenModal(true))}
                    className="px-6 sm:px-7 py-3 sm:py-3.5 border border-cl-border rounded-lg text-cl-text hover:bg-cl-surface hover:border-cl-accent/40 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cl-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cl-bg text-sm sm:text-base"
                  >
                    Add Repository
                  </button>
                </motion.div>

                {/* Trust pills */}
                <motion.div
                  className="flex flex-wrap justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-2 mt-8 sm:mt-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.38 }}
                >
                  {[
                    "Quality Scores",
                    "Security Flags",
                    "Skill Breakdown",
                    "Evidence-backed",
                  ].map((item) => (
                    <span
                      key={item}
                      className="text-xs text-cl-muted/70 flex items-center gap-1.5"
                    >
                      <span className="w-1 h-1 rounded-full bg-cl-accent/60" />
                      {item}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* ── Right: Animated mockup card ─────────────────────────────── */}
              {/* Visible on ALL screens — stacks below on mobile, side-by-side on lg+ */}
              <motion.div
                className="w-full flex justify-center lg:flex-1 lg:justify-end relative z-10 mt-4 sm:mt-6 lg:mt-0"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {/* Scale down the mockup on small screens */}
                <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[500px]">
                  <HeroMockup />
                </div>
              </motion.div>
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
          <div className="fixed bottom-10 right-10 bg-cl-accent text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-cl-accent/20 animate-pulse">
            Starting analysis pipeline…
          </div>
        )}

        {/* ── REPOSITORIES ─────────────────────────────────────────────── */}
        {member && (
          <section className="px-6 sm:px-10 md:px-16 lg:px-24 pb-32">
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold mb-10 text-cl-text">
              Your Repositories
            </h2>

            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-cl-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                      className="cursor-pointer border-cl-border bg-cl-surface hover:border-cl-accent/50 transition-all duration-200 overflow-hidden group"
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
                      <div className="p-5 border-b border-cl-border/50 bg-cl-surface">
                        {/* Top row: branch icon | status badge + Re-analyze btn */}
                        <div className="flex justify-between items-center mb-3">
                          <GitBranch className="text-cl-accent h-4 w-4 shrink-0" />

                          <div className="flex items-center gap-2">
                            {/* Status badge — pulses while analyzing */}
                            <span
                              className={`text-xs font-mono px-2 py-1 border rounded-md flex items-center gap-1.5 ${getStatusColor(
                                displayStatus,
                              )}`}
                            >
                              {isAnalyzing && (
                                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                              )}
                              {displayStatus}
                              {progressLabel && (
                                <span className="text-[10px] opacity-60 font-mono-data">
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
                                    ? "border-cl-border text-cl-muted/40 cursor-not-allowed"
                                    : "border-cl-border text-cl-muted hover:border-cl-accent/60 hover:text-cl-accent hover:bg-cl-accent/5 active:scale-95"
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

                        <h3 className="font-heading text-lg font-semibold text-cl-text group-hover:text-white transition-colors">
                          {repo.repositoryName}
                        </h3>

                        <p className="text-xs text-cl-muted mt-1">
                          {repo.owner || "Unknown"}
                        </p>
                      </div>

                      {/* ── CARD FOOTER ────────────────────────────────── */}
                      <div className="p-5 text-sm text-cl-muted">
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

        <footer className="py-12 text-center text-xs text-cl-muted/50">
          © 2026 CodeLens AI
        </footer>
      </main>
    </div>
  );
}
