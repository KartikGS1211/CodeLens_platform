import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { set } from "date-fns";

/**A
 * Hook to fetch Skill Summary for an analysis
 * Backend: GET /analysis/:analysisId/skill-summary
 */
export function useSkillSummary(analysisId?: string) {
  const [skillSummary, setSkillSummary] = useState<string>("");
  const [overallVerdict, setOverallVerdict] = useState<string>("");
  const [status, setStatus] = useState<string>("processing");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!analysisId) return;

    setLoading(true);
    setSkillSummary("");
    setOverallVerdict("");


    let interval: ReturnType<typeof setInterval>;

    async function fetchSkillSummary() {
      try {
        const res = await apiClient.get(
          `/analysis/${analysisId}/skill-summary`
        );

        const { status, overallVerdict , skillSummary } = res.data;

        // If analysis still running → keep polling
        if (res.data.status && res.data.status !== "completed") {
          setStatus(res.data.status);
          setOverallVerdict(overallVerdict ?? "");
          return;
        }

        // Analysis completed
        setSkillSummary(res.data.skillSummary ?? "");
        setOverallVerdict(overallVerdict ?? "");
        setStatus("completed");
        setLoading(false);
        clearInterval(interval);
      } catch (err) {
        console.error("❌ Failed to load skill summary", err);
        setLoading(false);
        clearInterval(interval);
      }
    }

    // Initial fetch
    fetchSkillSummary();

    // Poll every 4 seconds while processing
    interval = setInterval(fetchSkillSummary, 4000);

    return () => clearInterval(interval);
  }, [analysisId]);

  return {
    skillSummary,
    overallVerdict,
    status,
    loading,
  };
}
