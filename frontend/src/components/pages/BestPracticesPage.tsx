import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useBestPracticesAndArchitecture } from "@/hooks/useBestPracticesAndArchitecture";

/* -------------------------------- TYPES -------------------------------- */

type PracticeItem = {
  id: string;
  title: string;
  description: string;
  category: "AI" | "Architecture";
};

/* -------------------------------- PAGE -------------------------------- */

export default function BestPracticesPage() {
  const { analysisId } = useParams();
  console.log("analysisId:", analysisId);

  const { bestPractices, architecture, loading } =
    useBestPracticesAndArchitecture(analysisId);

  const [selectedCategory, setSelectedCategory] = useState<"all" | "AI" | "Architecture">("all");

  /* ---------------- NORMALIZE DATA ---------------- */

  const aiPractices: PracticeItem[] = bestPractices.map((text, index) => ({
    id: `ai-${index}`,
    title: "AI Best Practice",
    description: text,
    category: "AI",
  }));

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

      {/* ================= ARCHITECTURE OVERVIEW ================= */}
      {architecture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
         <Card className="w-full p-8 bg-gradient-to-br from-neon-teal/10 to-transparent border-neon-teal/30">
            <h2 className="text-2xl font-bold text-white mb-6">
              Architecture Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Pattern</p>
                <p className="mt-2 text-xl font-bold text-neon-teal">
                  {architecture.pattern}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Scalability</p>
                <p className="mt-2 text-xl font-bold text-white">
                  {architecture.scalability}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">
                  Separation of Concerns
                </p>
                <p className="mt-2 text-xl font-bold text-white">
                  {architecture.separationOfConcerns}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ================= TABS ================= */}
      <Tabs className="w-full"
        defaultValue="all"
        onValueChange={(v) =>
          setSelectedCategory(v as "all" | "AI" | "Architecture")
        }
      >
        <TabsList className="mb-10 bg-white/5 border border-white/10">
          <TabsTrigger value="all">
            All ({allPractices.length})
          </TabsTrigger>
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
                <Card className="p-8 bg-white/5 border-white/10 hover:border-neon-teal/30 transition">
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
                      <h3 className="text-xl font-bold text-white">
                        {practice.title}
                      </h3>

                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                          practice.category === "AI"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-neon-teal/10 text-neon-teal"
                        }`}
                      >
                        {practice.category}
                      </span>

                      <p className="mt-4 text-sm text-foreground/70">
                        {practice.description}
                      </p>
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
