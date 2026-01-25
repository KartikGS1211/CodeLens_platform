import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import { useAIReview } from "@/hooks/useAIReview";

/* ---------------- TYPES ---------------- */
type ReviewItem = {
  type: "strength" | "issue" | "suggestion";
  severity: "low" | "medium" | "high";
  title: string;
};

export default function CodeReviewPage() {
  const { analysisId } = useParams();
  const { data: reviewData, loading } = useAIReview(analysisId);
  const [selectedTab, setSelectedTab] = useState("all");

  

  /* ---------------- BACKEND DATA ---------------- */
const strengths: string[] = reviewData?.review?.strengths ?? [];
const weaknesses: string[] = reviewData?.review?.weaknesses ?? [];
const suggestions: string[] = reviewData?.review?.suggestions ?? [];
const redFlags: string[] = reviewData?.redFlags ?? [];



  /* ---------------- NORMALIZE DATA ---------------- */
  const reviewItems: ReviewItem[] = [
    ...redFlags.map((text) => ({
      type: "issue" as const,
      severity: "high" as const,
      title: text,
    })),

    ...weaknesses.map((text) => ({
      type: "issue" as const,
      severity: "high" as const,
      title: text,
    })),

    ...suggestions.map((text) => ({
      type: "suggestion" as const,
      severity: "medium" as const,
      title: text,
    })),

    ...strengths.map((text) => ({
      type: "strength" as const,
      severity: "low" as const,
      title: text,
    })),
  ];

  const filteredReviews =
    selectedTab === "all"
      ? reviewItems
      : reviewItems.filter((r) => r.type === selectedTab);

  /* ---------------- HELPERS ---------------- */
  const getIcon = (type: string) => {
    switch (type) {
      case "issue":
        return AlertCircle;
      case "suggestion":
        return Info;
      default:
        return CheckCircle;
    }
  };

  const getColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-400";
      default:
        return "text-neon-teal";
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="p-8 text-neon-teal text-sm">
        Loading AI review…
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full max-w-[120rem] mx-auto px-8 py-12">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-neon-teal" />
          <h1 className="text-4xl font-bold text-white">
            AI Code Review
          </h1>
        </div>
        <p className="text-foreground/60 mt-2">
          AI-generated insights based on your repository analysis
        </p>
      </motion.div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Findings", value: reviewItems.length },
          {
            label: "Critical Issues",
            value: reviewItems.filter((r) => r.severity === "high").length,
          },
          {
            label: "Suggestions",
            value: reviewItems.filter((r) => r.type === "suggestion").length,
          },
          {
            label: "Strengths",
            value: reviewItems.filter((r) => r.type === "strength").length,
          },
          {
            label: "Weaknesses",
            value: reviewItems.filter((r) => r.type === "issue").length,
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="p-6 bg-white/5 border-white/10"
          >
            <p className="text-sm text-foreground/60">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* RED FLAGS */}
      {redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14"
        >
          <Card className="border-red-500/30 bg-red-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-white">
                Critical Red Flags
              </h2>
            </div>

            <div className="space-y-3">
              {redFlags.map((flag, index) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-lg border border-red-500/30 bg-black/30 p-4"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  <p className="text-sm text-foreground/80">
                    {flag}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* TABS */}
      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="issue">Issues</TabsTrigger>
          <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
          <TabsTrigger value="strength">Strengths</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-8 space-y-6">
          {filteredReviews.length === 0 && (
            <p className="text-foreground/60">
              No findings available 🎉
            </p>
          )}

          {filteredReviews.map((item, index) => {
            const Icon = getIcon(item.type);
            return (
              <Card
                key={index}
                className="p-6 bg-white/5 border-white/10"
              >
                <div className="flex gap-4">
                  <Icon
                    className={`h-6 w-6 ${getColor(item.severity)}`}
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-1">
                      Severity: {item.severity}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
