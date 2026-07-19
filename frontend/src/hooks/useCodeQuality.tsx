import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export function useCodeQuality(analysisId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    let interval: ReturnType<typeof setInterval>;

    async function fetchCodeQuality() {
      try {
        const res = await apiClient.get(`/analysis/${analysisId}/code-quality`);

        const {
          status,
          qualityDimensions,
          qualityTrend,
          qualityTrendMeta,
          moduleComplexity,
          recentIssues,
          debtForecast,
          scoringMethodology,
        } = res.data;

        // still processing → keep polling
        if (status !== "completed") return;

        // ✅ save full object including trend metadata
        setData({
          qualityDimensions,
          qualityTrend,
          qualityTrendMeta: qualityTrendMeta ?? null,
          moduleComplexity,
          recentIssues,
          debtForecast,
          scoringMethodology: scoringMethodology ?? null,
        });

        setLoading(false);
        clearInterval(interval);
      } catch (err) {
        console.error("❌ Failed to load code quality", err);
        setLoading(false);
      }
    }

    fetchCodeQuality();
    interval = setInterval(fetchCodeQuality, 3000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return { data, loading };
}
