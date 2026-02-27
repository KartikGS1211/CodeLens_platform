import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export function useDeveloperProfile(analysisId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!analysisId) return;

    let interval: ReturnType<typeof setInterval>;

    async function fetchProfile() {
      try {
        const res = await apiClient.get(`/analysis/${analysisId}/full`);
        console.log("Developer profile response:", res.data);

        setData(res.data);
        
      } catch (err) {
        console.error("Failed to fetch developer profile", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
    interval = setInterval(fetchProfile, 4000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return { data, loading };
}
