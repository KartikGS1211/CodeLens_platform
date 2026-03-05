import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useAIReview } from "@/hooks/useAIReview";

type ReviewItem = {
  id: string;
  severity: "low" | "medium" | "high";
  title: string;
  description?: string;
  filePath?: string;
  line?: number;
  currentCode?: string;
  suggestedCode?: string;
  category?: string;
  fixType?: string;
  confidence?: number;
  impactScore?: number;
  isFixed?: boolean;
};

const severityOrder = {
  high: 1,
  medium: 2,
  low: 3,
};

export default function CodeReviewPage() {
  const { analysisId } = useParams();
  const { data: reviewData, loading } = useAIReview(analysisId);

  const [selectedTab, setSelectedTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const issues: ReviewItem[] = reviewData?.issues ?? [];

  const normalizedIssues: ReviewItem[] = [
    ...issues,

    ...(reviewData?.review?.suggestions ?? []).map(
      (text: string, index: number) => ({
        id: `suggestion-${index}`,
        title: text,
        severity: "medium" as const,
        category: "suggestion",
      }),
    ),
  ];

  /* ---------------- SORT ---------------- */
  const sortedIssues = useMemo(() => {
    return [...normalizedIssues].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
    );
  }, [normalizedIssues]);

  /* ---------------- FILTER ---------------- */
  const securityIssues = useMemo(
    () =>
      sortedIssues.filter((i) =>
        i.category?.toLowerCase().includes("security"),
      ),
    [sortedIssues],
  );

  const suggestionIssues = useMemo(
    () =>
      sortedIssues.filter((i) =>
        i.category?.toLowerCase().includes("suggestion"),
      ),
    [sortedIssues],
  );

  const filtered =
    selectedTab === "security"
      ? securityIssues
      : selectedTab === "suggestions"
      ? suggestionIssues
      : sortedIssues;

  /* ---------------- GROUP BY FILE ---------------- */
  const groupedByFile = useMemo(() => {
    const groups: Record<string, ReviewItem[]> = {};
    filtered.forEach((issue) => {
      const key = issue.filePath || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(issue);
    });
    return groups;
  }, [filtered]);

  const criticalCount = normalizedIssues.filter((i) => i.severity === "high").length;

  if (loading) {
    return (
      <div className="p-10 text-neon-teal text-sm">Loading AI Review...</div>
    );
  }

  return (
    <div className="w-full max-w-[120rem] mx-auto px-8 py-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-neon-teal" />
          <h1 className="text-4xl font-bold text-white">AI Code Review</h1>
        </div>
        <p className="text-foreground/60 mt-3">
          AI-generated insights based on your repository analysis
        </p>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
        <SummaryCard label="Total Findings" value={issues.length} />
        <SummaryCard
          label="Critical Issues"
          value={criticalCount}
          highlight="text-red-400"
        />
        <SummaryCard
          label="Suggestions"
          value={reviewData?.review?.suggestions?.length ?? 0}
          highlight="text-yellow-400"
        />
        <SummaryCard
          label="Strengths"
          value={reviewData?.review?.strengths?.length ?? 0}
          highlight="text-green-400"
        />
      </div>

      {/* RED FLAGS */}
      {reviewData?.redFlags?.length > 0 && (
        <Card className="mb-14 border-red-500/30 bg-red-500/5 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-red-400 mb-4">
            Critical Red Flags
          </h2>
          {reviewData.redFlags.map((flag: string, i: number) => (
            <p key={i} className="text-sm text-foreground/70 mb-2">
              • {flag}
            </p>
          ))}
        </Card>
      )}

      {/* TABS */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-white/5 p-1 rounded-xl border border-white/10">
          <TabsTrigger value="all">All ({normalizedIssues.length})</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions(
            {normalizedIssues.filter((i) => i.category === "suggestion").length}
            )
          </TabsTrigger>
          <TabsTrigger value="security">
            Security  (
            {normalizedIssues.filter((i) => i.category === "security").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-10 space-y-12">
          {Object.entries(groupedByFile).map(([file, fileIssues]) => (
            <div key={file} className="space-y-6">
              {/* FILE HEADER */}
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-neon-teal" />
                <span className="text-xs tracking-wider uppercase text-neon-teal">
                  {file}
                </span>
              </div>

              {fileIssues.map((item) => {
                const isOpen = expanded === item.id;

                const severityColor =
                  item.severity === "high"
                    ? "border-l-red-500"
                    : item.severity === "medium"
                    ? "border-l-yellow-400"
                    : "border-l-emerald-400";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={`relative p-7 bg-gradient-to-br from-[#111] to-[#0f172a] border border-white/10 rounded-2xl shadow-xl border-l-4 ${severityColor}`}
                    >
                      <span className="absolute top-5 right-5 text-xs px-3 py-1 rounded-full bg-black/40 border border-white/10">
                        {item.severity.toUpperCase()}
                      </span>

                      <h3 className="text-xl font-semibold text-white">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-sm text-foreground/60 mt-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-foreground/40 mt-4">
                        {item.line && <span>Line {item.line}</span>}
                        {item.confidence && (
                          <span>Confidence: {item.confidence}%</span>
                        )}
                      </div>

                      {item.impactScore && (
                        <div className="mt-4">
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-red-500 rounded-full"
                              style={{
                                width: `${item.impactScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* CODE */}
                      {item.currentCode && (
                        <div className="mt-6">
                          <button
                            onClick={() => setExpanded(isOpen ? null : item.id)}
                            className="text-xs text-neon-teal hover:underline"
                          >
                            {isOpen ? "Hide Code" : "View Code Example"}
                          </button>

                          {isOpen && (
                            <div className="mt-4 rounded-xl bg-black/50 border border-white/10 p-5 text-xs font-mono whitespace-pre-wrap">
                              <div className="text-red-400 mb-2">
                                // Current
                              </div>
                              {item.currentCode}

                              {item.suggestedCode && (
                                <>
                                  <div className="text-emerald-400 mt-5 mb-2">
                                    // Suggested
                                  </div>
                                  {item.suggestedCode}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="flex gap-3 mt-6">
                        {item.fixType && !item.isFixed && (
                          <button className="px-5 py-2 text-sm rounded-xl bg-neon-teal text-black font-semibold hover:scale-105 transition">
                            Apply Fix
                          </button>
                        )}
                        <button className="px-5 py-2 text-sm rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition">
                          Ignore
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* AI INSIGHTS */}
      <Card className="mt-20 p-8 bg-gradient-to-r from-[#0f172a] to-[#111] border border-neon-teal/20 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">
          AI-Powered Insights
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-sm text-foreground/70">
          <InsightBlock
            title="Strengths"
            color="text-green-400"
            items={reviewData?.review?.strengths ?? []}
          />
          <InsightBlock
            title="Weaknesses"
            color="text-red-400"
            items={reviewData?.review?.weaknesses ?? []}
          />
          <InsightBlock
            title="Suggestions"
            color="text-yellow-400"
            items={reviewData?.review?.suggestions ?? []}
          />
        </div>
      </Card>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: string;
}) {
  return (
    <Card className="p-6 bg-white/5 border-white/10 rounded-2xl">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className={`text-3xl font-bold mt-3 ${highlight || "text-white"}`}>
        {value}
      </p>
    </Card>
  );
}

function InsightBlock({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <h3 className={`font-semibold mb-3 ${color}`}>{title}</h3>
      {items.map((item, i) => (
        <p key={i}>• {item}</p>
      ))}
    </div>
  );
}
