import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export function useAnalysisOverview(analysisId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (!analysisId) return;

    let interval: NodeJS.Timeout;

    async function fetchOverview() {
      try {
        const res = await apiClient.get(`/analysis/${analysisId}/overview`);

        setData({
          status: res.data.status,
          repoName: res.data.repoName ?? "",
          languages: res.data.languages ?? [],
          commits: res.data.commits ?? 0,
          files: res.data.files ?? 0,
          analyzedAt: res.data.analyzedAt ?? null,
        });

        if (res.data.status === "processing") {
          try {
            const progRes = await apiClient.get(
              `/analysis/${analysisId}/progress`,
            );
            setProgress(progRes.data);
          } catch (err) {
            console.warn("Failed to fetch progress", err);
          }
        } else {
          setProgress(null);
        }

        if (res.data.status === "completed" || res.data.status === "failed") {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Failed to load analysis overview", err);
        setLoading(false);
      }
    }

    fetchOverview();
    interval = setInterval(fetchOverview, 4000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return { data, loading, progress };
}
