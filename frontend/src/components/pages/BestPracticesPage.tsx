import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useBestPracticesAndArchitecture } from "@/hooks/useBestPracticesAndArchitecture";

/* -------------------------------- TYPES -------------------------------- */

type PracticeItem = {
  id: string;
  title: string;
  description: string;
  impact?: "High" | "Medium" | "Low";
  whyItMatters?: string;
  category: "AI" | "Architecture";
};

/* -------------------------------- PAGE -------------------------------- */

export default function BestPracticesPage() {
  const { analysisId } = useParams();

  const { bestPractices, architecture, loading } =
    useBestPracticesAndArchitecture(analysisId);

  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "AI" | "Architecture"
  >("all");

  /* ---------------- NORMALIZE DATA ---------------- */

  const aiPractices: PracticeItem[] = (bestPractices || []).map(
    (item: any, index: number) => ({
      id: `ai-${index}`,
      title: item.title || "Best Practice",
      description: item.description || "",
      impact: item.impact || "Medium",
      whyItMatters: item.whyItMatters || "",
      category: "AI",
    }),
  );

  const architecturePractices: PracticeItem[] = architecture
    ? [
        {
          id: "arch-pattern",
          title: "Architecture Pattern",
          description: architecture.pattern,
          category: "Architecture",
        },
        {
          id: "arch-scalability",
          title: "Scalability",
          description: architecture.scalability,
          category: "Architecture",
        },
        {
          id: "arch-soc",
          title: "Separation of Concerns",
          description: architecture.separationOfConcerns,
          category: "Architecture",
        },
      ]
    : [];

  const allPractices = [...architecturePractices, ...aiPractices];

  const filteredPractices =
    selectedCategory === "all"
      ? allPractices
      : allPractices.filter((p) => p.category === selectedCategory);

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="px-8 py-16 text-cl-accent text-sm">
        Loading architecture & best practices…
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="w-full px-6 sm:px-10 py-12">
      {/* HEADER */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-cl-accent" />
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text">
            Architecture &amp; Best Practices
          </h1>
        </div>
        <p className="mt-2 text-cl-muted text-sm">
          AI-driven architecture insights and best engineering practices
        </p>
      </motion.div>

      {/* ARCHITECTURE INTELLIGENCE  */}
      {architecture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <Card className="w-full p-6 sm:p-8 bg-gradient-to-br from-cl-accent/10 to-transparent border-cl-accent/30 shadow-glow-accent">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-semibold text-cl-text">
                  Architecture Intelligence Report
                </h2>
                <p className="text-xs text-cl-muted mt-1">
                  AI-evaluated architectural maturity &amp; production readiness
                </p>
              </div>

              {/* SCORE + RISK */}
              <div className="sm:text-right">
                <p className="text-xs text-cl-muted">Maturity Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-cl-text font-mono-data mt-1">
                  {architecture.architectureScore ?? 0}
                  <span className="text-lg text-cl-muted">/100</span>
                </p>

                <span
                  className={`mt-2 inline-block px-3 py-1 rounded-md text-xs font-semibold
                    ${
                      architecture.riskLevel === "Low"
                        ? "bg-cl-success/20 text-cl-success"
                        : architecture.riskLevel === "Moderate"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-cl-error/20 text-cl-error"
                    }
                  `}
                >
                  {architecture.riskLevel ?? "Unknown"} Risk
                </span>
              </div>
            </div>

            {/* CONFIDENCE */}
            <p className="text-xs text-cl-muted/60 mb-8 font-mono-data">
              AI Confidence: {architecture.confidence ?? 75}%
            </p>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PATTERN */}
              <div className="bg-cl-bg p-5 rounded-card border border-cl-border">
                <p className="text-xs text-cl-muted">Architecture Pattern</p>
                <p className="mt-2 text-base font-semibold text-cl-accent font-heading">
                  {architecture.pattern}
                </p>
                {architecture.patternReason && (
                  <p className="mt-3 text-xs text-cl-muted leading-relaxed">
                    {architecture.patternReason}
                  </p>
                )}
              </div>

              {/* SCALABILITY */}
              <div className="bg-cl-bg p-5 rounded-card border border-cl-border">
                <p className="text-xs text-cl-muted">Scalability</p>
                <p className="mt-2 text-base font-semibold text-cl-text font-heading">
                  {architecture.scalability}
                </p>
                {architecture.scalabilityReason && (
                  <p className="mt-3 text-xs text-cl-muted leading-relaxed">
                    {architecture.scalabilityReason}
                  </p>
                )}
              </div>

              {/* SOC */}
              <div className="bg-cl-bg p-5 rounded-card border border-cl-border">
                <p className="text-xs text-cl-muted">Separation of Concerns</p>
                <p className="mt-2 text-base font-semibold text-cl-text font-heading">
                  {architecture.separationOfConcerns}
                </p>
                {architecture.socReason && (
                  <p className="mt-3 text-xs text-cl-muted leading-relaxed">
                    {architecture.socReason}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ================= TABS ================= */}
      <Tabs
        className="w-full"
        defaultValue="all"
        onValueChange={(v) =>
          setSelectedCategory(v as "all" | "AI" | "Architecture")
        }
      >
        <TabsList className="mb-8 bg-cl-surface border border-cl-border">
          <TabsTrigger value="all" className="font-mono-data">
            All ({allPractices.length})
          </TabsTrigger>
          <TabsTrigger value="Architecture" className="font-mono-data">
            Architecture ({architecturePractices.length})
          </TabsTrigger>
          <TabsTrigger value="AI" className="font-mono-data">
            AI Best Practices ({aiPractices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="space-y-6">
            {filteredPractices.map((practice, index) => (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 bg-cl-surface border border-cl-border hover:border-cl-accent/40 transition-all duration-200 rounded-card relative overflow-hidden">
                  {/* LEFT GRADIENT ACCENT LINE */}
                  <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-cl-accent to-transparent" />
                  <div className="flex gap-4 sm:gap-6">
                    <div
                      className={`p-2.5 rounded-md h-10 w-10 flex items-center justify-center shrink-0 ${
                        practice.category === "AI"
                          ? "bg-cl-accent/10"
                          : "bg-cl-accent/20"
                      }`}
                    >
                      {practice.category === "AI" ? (
                        <CheckCircle className="h-5 w-5 text-cl-success" />
                      ) : (
                        <FileText className="h-5 w-5 text-cl-accent" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-heading text-lg font-semibold text-cl-text">
                            {practice.title}
                          </h3>

                          {practice.impact && (
                            <span
                              className={`inline-block mt-2 px-2.5 py-0.5 text-[10px] rounded-md font-semibold
                                ${
                                  practice.impact === "High"
                                    ? "bg-cl-error/20 text-cl-error"
                                    : practice.impact === "Medium"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-cl-success/20 text-cl-success"
                                }
                              `}
                            >
                              {practice.impact} Impact
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-cl-muted leading-relaxed">
                        {practice.description}
                      </p>

                      {practice.whyItMatters && (
                        <div className="mt-4 p-4 rounded-card bg-cl-bg border border-cl-border">
                          <p className="text-[10px] text-cl-muted uppercase tracking-wider mb-1 font-semibold">
                            Why It Matters
                          </p>
                          <p className="text-sm text-cl-text/80 leading-relaxed font-sans">
                            {practice.whyItMatters}
                          </p>
                        </div>
                      )}

                      <span className="inline-block mt-4 px-2 py-0.5 text-[10px] rounded-md font-semibold bg-cl-bg text-cl-muted border border-cl-border">
                        {practice.category}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredPractices.length === 0 && (
              <div className="text-center text-cl-muted py-16">
                No data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
