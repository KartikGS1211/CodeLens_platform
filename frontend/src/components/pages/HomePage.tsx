// HPI 1.5-V
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { BaseCrudService } from "@/integrations";
import { Repositories } from "@/entities";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import AnalyzeRepositoryModal from "./AnalyzeRepositoryModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [repositories, setRepositories] = useState<Repositories[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [startingAnalysis, setStartingAnalysis] = useState(false);

  const navigate = useNavigate();

  /* ---------- DATA LOAD ---------- */
  useEffect(() => {
    loadRepositories();
    const interval = setInterval(() => loadRepositories(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRepositories = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { items } = await BaseCrudService.getAll<Repositories>("repositories");
      setRepositories(items);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  /* ---------- ANALYZE ---------- */
  async function handleAnalyzeRepository(repoUrl: string) {
    try {
      setStartingAnalysis(true);

      const res = await axios.post(
        "http://localhost:5000/api/analysis/start",
        { repoUrl }
      );

      const analysisId = res.data.analysisId;
      if (!analysisId) throw new Error("analysisId missing");

      await loadRepositories();

      navigate(`/analysis/${analysisId}/code-quality`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to start analysis");
    } finally {
      setStartingAnalysis(false);
      setOpenModal(false);
    }
  }

  /* ---------- STATS ---------- */
  const stats: StatItem[] = [
    {
      label: "Total Repositories",
      value: repositories.length,
      icon: GitBranch,
      color: "neon-teal",
    },
    {
      label: "Analyzing",
      value: repositories.filter(r => r.status === "analyzing").length,
      icon: Activity,
      color: "secondary",
    },
    {
      label: "Issues Found",
      value: Math.floor(Math.random() * 40) + 10,
      icon: AlertCircle,
      color: "destructive",
    },
    {
      label: "Code Quality",
      value: "87%",
      icon: TrendingUp,
      color: "neon-teal",
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "text-neon-teal bg-neon-teal/10 border-neon-teal/30";
      case "analyzing":
        return "text-secondary bg-secondary/10 border-secondary/30";
      case "failed":
        return "text-destructive bg-destructive/10 border-destructive/30";
      default:
        return "text-foreground/50 border-white/10";
    }
  };

  /* ---------- SCROLL ---------- */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-neon-teal z-50"
        style={{ scaleX }}
      />

      <main className="ml-0 md:ml-64">
        {/* HERO */}
        <section className="relative min-h-screen flex items-center justify-center pt-20">
          <GridBackground />

          <div className="max-w-7xl px-8">
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              UNLEASH YOUR <br />
              <span className="text-neon-teal">CODE POTENTIAL</span>
            </h1>

            <p className="max-w-xl text-foreground/60 mb-10">
              AI-powered code review & developer skill profiling platform.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setOpenModal(true)}
                className="px-8 py-4 bg-neon-teal text-black font-bold"
              >
                Initialize Analysis
              </button>

              <button
                onClick={() => setOpenModal(true)}
                className="px-8 py-4 border border-white/20"
              >
                Add Repository
              </button>
            </div>
          </div>
        </section>

        {/* MODAL */}
        <AnalyzeRepositoryModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onAnalyze={handleAnalyzeRepository}
        />

        {startingAnalysis && (
          <div className="text-center text-neon-teal mt-4 animate-pulse">
            Initializing analysis pipeline...
          </div>
        )}

        {/* REPOSITORIES */}
        <section className="py-32 px-8">
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-neon-teal border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {repositories.map(repo => (
                <Card
                  key={repo._id}
                  className="cursor-pointer border-white/10 bg-white/5 hover:border-neon-teal/50"
                  onClick={() => {
                    if (!repo.analysisId) {
                      alert("Analysis not ready yet");
                      return;
                    }
                    if (repo.status !== "completed") {
                      alert("Analysis still running");
                      return;
                    }
                    navigate(`/analysis/${repo.analysisId}/code-quality`);
                  }}
                >
                  <div className="p-6 border-b border-white/10">
                    <div className="flex justify-between mb-4">
                      <GitBranch className="text-neon-teal" />
                      <span
                        className={`text-xs px-2 py-1 border rounded ${getStatusColor(
                          repo.status
                        )}`}
                      >
                        {repo.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{repo.repositoryName}</h3>
                    <p className="text-xs text-foreground/50">
                      {repo.owner || "Unknown"}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <footer className="py-12 text-center text-xs text-foreground/30">
          © 2026 CodeLens AI — SYSTEM OPERATIONAL
        </footer>
      </main>
    </div>
  );
}
