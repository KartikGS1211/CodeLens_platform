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

    let interval: NodeJS.Timeout;

    async function fetchAIReview() {
      try {
        const res = await apiClient.get(
          `/analysis/${analysisId}/ai-review`
        );

        setData({
          review: {
            strengths: res.data.review?.strengths ?? [],
            weaknesses: res.data.review?.weaknesses ?? [],
            suggestions: res.data.review?.suggestions ?? [],
          },
          redFlags: res.data.redFlags ?? [],
          status: res.data.status ?? "processing",
        });

        // ✅ stop polling only when finished
        if (
          res.data.status === "completed" ||
          res.data.status === "failed"
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
