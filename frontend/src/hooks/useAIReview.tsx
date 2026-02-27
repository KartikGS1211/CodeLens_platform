import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

type AIReviewData = {
  review: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  redFlags: string[];
  status: "processing" | "completed" | "failed";
};

export function useAIReview(analysisId?: string) {
  const [data, setData] = useState<AIReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    let interval: ReturnType<typeof setInterval>;

    async function fetchAIReview() {
      try {
        const res = await apiClient.get(
          `/analysis/${analysisId}/ai-review`
        );

        const { status, review, redFlags } = res.data;

        setData({
          review: {
            strengths: review?.strengths ?? [],
            weaknesses: review?.weaknesses ?? [],
            suggestions: review?.suggestions ?? [],
          },
          redFlags: redFlags ?? [],
          status: status ?? "processing",
        });

        // ✅ stop polling only when finished
        if (
          status === "completed" ||
          status === "failed"
        ) {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Failed to fetch AI review", err);
        setLoading(false);
      }
    }

    // first fetch
    fetchAIReview();

    // poll while processing
    interval = setInterval(fetchAIReview, 4000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return { data, loading };
}
