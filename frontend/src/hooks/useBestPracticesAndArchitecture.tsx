import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export function useBestPracticesAndArchitecture(analysisId?: string) {
  const [bestPractices, setBestPractices] = useState<string[]>([]);
  const [architecture, setArchitecture] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    async function fetchData() {
      try {
        setLoading(true);

        const [bpRes, archRes] = await Promise.all([
          apiClient.get(`/analysis/${analysisId}/best-practices`),
          apiClient.get(`/analysis/${analysisId}/architecture`),
        ]);

        setBestPractices(bpRes.data ?? []);
        setArchitecture(archRes.data ?? null);
      } catch (err) {
        console.error("❌ Failed to load best practices / architecture", err);
        setBestPractices([]);
        setArchitecture(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [analysisId]);

  return { bestPractices, architecture, loading };
}
