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

  const criticalCount = normalizedIssues.filter(
    (i) => i.severity === "high",
  ).length;

  if (loading) {
    return (
      <div className="p-10 text-cl-accent text-sm">Loading AI Review...</div>
    );
  }

  return (
    <div className="w-full max-w-[120rem] mx-auto px-6 sm:px-8 py-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-cl-accent" />
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-cl-text">
            AI Code Review
          </h1>
        </div>
        <p className="text-cl-muted mt-3">
          AI-generated insights based on your repository analysis
        </p>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-14">
        <SummaryCard label="Total Findings" value={issues.length} />
        <SummaryCard
          label="Critical Issues"
          value={criticalCount}
          highlight="text-cl-error"
        />
        <SummaryCard
          label="Suggestions"
          value={reviewData?.review?.suggestions?.length ?? 0}
          highlight="text-amber-400"
        />
        <SummaryCard
          label="Strengths"
          value={reviewData?.review?.strengths?.length ?? 0}
          highlight="text-cl-success"
        />
      </div>

      {/* RED FLAGS */}
      {reviewData?.redFlags?.length > 0 && (
        <Card className="mb-14 border-cl-error/30 bg-cl-error/5 p-5 rounded-card">
          <h2 className="font-heading text-lg font-semibold text-cl-error mb-4">
            Critical Red Flags
          </h2>
          {reviewData.redFlags.map((flag: string, i: number) => (
            <p key={i} className="text-sm text-cl-text/70 mb-2">
              • {flag}
            </p>
          ))}
        </Card>
      )}

      {/* TABS */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-cl-surface p-1 rounded-card border border-cl-border">
          <TabsTrigger value="all">All ({normalizedIssues.length})</TabsTrigger>
          <TabsTrigger value="suggestions">
            Suggestions(
            {normalizedIssues.filter((i) => i.category === "suggestion").length}
            )
          </TabsTrigger>
          <TabsTrigger value="security">
            Security (
            {normalizedIssues.filter((i) => i.category === "security").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-10 space-y-12">
          {Object.entries(groupedByFile).map(([file, fileIssues]) => (
            <div key={file} className="space-y-4">
              {/* FILE HEADER */}
              <div className="flex items-center gap-3">
                <FileText size={14} className="text-cl-accent" />
                <span className="text-xs tracking-wider uppercase text-cl-accent font-mono">
                  {file}
                </span>
              </div>

              {fileIssues.map((item) => {
                const isOpen = expanded === item.id;

                const severityColor =
                  item.severity === "high"
                    ? "border-l-cl-error"
                    : item.severity === "medium"
                    ? "border-l-amber-400"
                    : "border-l-cl-success";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className={`relative p-6 bg-cl-surface border border-cl-border rounded-card border-l-4 ${severityColor}`}
                    >
                      <span className="absolute top-4 right-4 text-xs px-2.5 py-1 rounded-md bg-cl-bg border border-cl-border font-mono-data">
                        {item.severity.toUpperCase()}
                      </span>

                      <h3 className="font-heading text-base font-semibold text-cl-text pr-20">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-sm text-cl-muted mt-3 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-cl-muted/60 mt-3">
                        {item.line && (
                          <span className="font-mono-data">
                            Line {item.line}
                          </span>
                        )}
                        {item.confidence && (
                          <span className="font-mono-data">
                            Confidence: {item.confidence}%
                          </span>
                        )}
                      </div>

                      {item.impactScore && (
                        <div className="mt-4">
                          <div className="w-full h-1.5 bg-cl-border rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-cl-error rounded-full"
                              style={{
                                width: `${item.impactScore}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* CODE */}
                      {item.currentCode && (
                        <div className="mt-5">
                          <button
                            onClick={() => setExpanded(isOpen ? null : item.id)}
                            className="text-xs text-cl-accent hover:underline focus-visible:ring-2 focus-visible:ring-cl-accent rounded"
                          >
                            {isOpen ? "Hide Code" : "View Code Example"}
                          </button>

                          {isOpen && (
                            <div className="mt-4 rounded-card bg-cl-bg border border-cl-border p-4 text-xs font-mono whitespace-pre-wrap">
                              <div className="text-cl-error mb-2">
                                // Current
                              </div>
                              {item.currentCode}

                              {item.suggestedCode && (
                                <>
                                  <div className="text-cl-success mt-5 mb-2">
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
                      <div className="flex gap-3 mt-5">
                        {item.fixType && !item.isFixed && (
                          <button className="px-4 py-2 text-sm rounded-card bg-cl-accent text-white font-semibold hover:bg-cl-accent-hover transition focus-visible:ring-2 focus-visible:ring-cl-accent">
                            Apply Fix
                          </button>
                        )}
                        <button className="px-4 py-2 text-sm rounded-card border border-cl-border text-cl-muted hover:bg-cl-surface hover:text-cl-text transition focus-visible:ring-2 focus-visible:ring-cl-accent">
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
      <Card className="mt-20 p-6 sm:p-8 bg-cl-surface border border-cl-accent/20 rounded-card">
        <h2 className="font-heading text-lg font-semibold text-cl-text mb-6">
          AI-Powered Insights
        </h2>

        <div className="grid sm:grid-cols-3 gap-8 text-sm text-cl-muted">
          <InsightBlock
            title="Strengths"
            color="text-cl-success"
            items={reviewData?.review?.strengths ?? []}
          />
          <InsightBlock
            title="Weaknesses"
            color="text-cl-error"
            items={reviewData?.review?.weaknesses ?? []}
          />
          <InsightBlock
            title="Suggestions"
            color="text-amber-400"
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
    <Card className="p-5 bg-cl-surface border-cl-border rounded-card">
      <p className="text-xs text-cl-muted">{label}</p>
      <p
        className={`text-2xl font-bold mt-3 font-mono-data ${
          highlight || "text-cl-text"
        }`}
      >
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
      <h3 className={`font-heading font-semibold mb-3 ${color}`}>{title}</h3>
      {items.map((item, i) => (
        <p key={i} className="mb-1">
          • {item}
        </p>
      ))}
    </div>
  );
}
