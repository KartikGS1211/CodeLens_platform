import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export function useCodeQuality(analysisId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    let interval: NodeJS.Timeout;

    async function fetchCodeQuality() {
      try {
        const res = await apiClient.get(
          `/analysis/${analysisId}/code-quality`
        );

        // ⛔ wait until analysis is done
        if (res.data.status !== "completed") {
          return;
        }

        // ✅ IMPORTANT: store ONLY codeQuality
        setData(res.data.codeQuality);
        setLoading(false);
        clearInterval(interval);
      } catch (err) {
        console.error("❌ Failed to load code quality", err);
        setLoading(false);
      }
    }

    fetchCodeQuality();
    interval = setInterval(fetchCodeQuality, 4000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return { data, loading };
}
