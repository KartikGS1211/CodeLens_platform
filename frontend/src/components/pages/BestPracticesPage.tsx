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
  console.log("analysisId:", analysisId);

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
      <div className="px-8 py-16 text-neon-teal text-sm">
        Loading architecture & best practices…
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */

  return (
    <div className="w-full px-10 py-12">
      {/* HEADER */}
      <motion.div
        className="mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-neon-teal" />
          <h1 className="text-4xl font-bold text-white">
            Architecture & Best Practices
          </h1>
        </div>
        <p className="mt-4 text-foreground/60">
          AI-driven architecture insights and best engineering practices
        </p>
      </motion.div>

      {/* ARCHITECTURE INTELLIGENCE  */}
      {architecture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <Card className="w-full p-8 bg-gradient-to-br from-neon-teal/10 to-transparent border-neon-teal/30">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Architecture Intelligence Report
                </h2>
                <p className="text-sm text-foreground/60 mt-1">
                  AI-evaluated architectural maturity & production readiness
                </p>
              </div>

              {/* SCORE + RISK */}
              <div className="text-right">
                <p className="text-sm text-foreground/60">Maturity Score</p>
                <p className="text-3xl font-bold text-white">
                  {architecture.architectureScore ?? 0}/100
                </p>

                <span
                  className={`mt-2 inline-block px-4 py-1 rounded-full text-xs font-semibold
              ${
                architecture.riskLevel === "Low" &&
                "bg-emerald-500/10 text-emerald-400"
              }
              ${
                architecture.riskLevel === "Moderate" &&
                "bg-yellow-500/10 text-yellow-400"
              }
              ${
                architecture.riskLevel === "High" &&
                "bg-red-500/10 text-red-400"
              }
            `}
                >
                  {architecture.riskLevel ?? "Unknown"} Risk
                </span>
              </div>
            </div>

            {/* CONFIDENCE */}
            <p className="text-xs text-foreground/50 mb-10">
              AI Confidence: {architecture.confidence ?? 75}%
            </p>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* PATTERN */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="text-sm text-foreground/60">
                  Architecture Pattern
                </p>
                <p className="mt-2 text-lg font-bold text-neon-teal">
                  {architecture.pattern}
                </p>
                {architecture.patternReason && (
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                    {architecture.patternReason}
                  </p>
                )}
              </div>

              {/* SCALABILITY */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="text-sm text-foreground/60">Scalability</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {architecture.scalability}
                </p>
                {architecture.scalabilityReason && (
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
                    {architecture.scalabilityReason}
                  </p>
                )}
              </div>

              {/* SOC */}
              <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                <p className="text-sm text-foreground/60">
                  Separation of Concerns
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {architecture.separationOfConcerns}
                </p>
                {architecture.socReason && (
                  <p className="mt-3 text-sm text-foreground/70 leading-relaxed">
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
        <TabsList className="mb-10 bg-white/5 border border-white/10">
          <TabsTrigger value="all">All ({allPractices.length})</TabsTrigger>
          <TabsTrigger value="Architecture">
            Architecture ({architecturePractices.length})
          </TabsTrigger>
          <TabsTrigger value="AI">
            AI Best Practices ({aiPractices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="space-y-8">
            {filteredPractices.map((practice, index) => (
              <motion.div
                key={practice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-8  bg-white/5 border border-white/10 hover:border-neon-teal/40 hover:shadow-lg 
                   hover:shadow-neon-teal/10 hover:-translate-y-1transition-all duration-300 rounded-xl
                    "
                >
                {/* LEFT GRADIENT ACCENT LINE */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neon-teal to-transparent rounded-l-xl" />
                  <div className="flex gap-6">
                    <div
                      className={`p-3 rounded-lg ${
                        practice.category === "AI"
                          ? "bg-secondary/10"
                          : "bg-neon-teal/10"
                      }`}
                    >
                      {practice.category === "AI" ? (
                        <CheckCircle className="h-6 w-6 text-secondary" />
                      ) : (
                        <FileText className="h-6 w-6 text-neon-teal" />
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {practice.title}
                          </h3>

                          <span
                            className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-semibold
                            ${
                              practice.impact === "High" &&
                              "bg-red-500/10 text-red-400"
                            }
                            ${
                              practice.impact === "Medium" &&
                              "bg-yellow-500/10 text-yellow-400"
                            }
                            ${
                              practice.impact === "Low" &&
                              "bg-emerald-500/10 text-emerald-400"
                            }
                            `}
                          >
                            {practice.impact} Impact
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-foreground/70 leading-relaxed">
                        {practice.description}
                      </p>

                      {practice.whyItMatters && (
                        <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-xs text-foreground/50 uppercase mb-1">
                            Why It Matters
                          </p>
                          <p className="text-sm text-foreground/70">
                            {practice.whyItMatters}
                          </p>
                        </div>
                      )}

                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                          practice.category === "AI"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-neon-teal/10 text-neon-teal"
                        }`}
                      >
                        {practice.category}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredPractices.length === 0 && (
              <div className="text-center text-foreground/60 py-16">
                No data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
