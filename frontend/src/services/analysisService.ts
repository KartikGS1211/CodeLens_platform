import apiClient from "@/lib/apiClient";

/** START ANALYSIS */
export const startAnalysis = async (repoUrl: string) => {
  const res = await apiClient.post("/analysis/start", {
    repoUrl,
  });
  return res.data;
};

/** OVERVIEW */
export const getOverview = async (analysisId: string) => {
  const res = await apiClient.get(`/analysis/${analysisId}/overview`);
  return res.data;
};

/** CODE QUALITY */
export const getCodeQuality = async (analysisId: string) => {
  const res = await apiClient.get(`/analysis/${analysisId}/code-quality`);
  return res.data;
};

/** AI REVIEW */
export const getAIReview = async (analysisId: string) => {
  const res = await apiClient.get(`/analysis/${analysisId}/ai-review`);
  return res.data;
};

/** SKILLS SUMMARY */
export const getSkillsSummary = async (analysisId: string) => {
  const res = await apiClient.get(`/analysis/${analysisId}/skills-summary`);
  return res.data;
};

/** BEST PRACTICES */
export const getBestPractices = async (analysisId: string) => {
  const res = await apiClient.get(`/analysis/${analysisId}/best-practices`);
  return res.data;
};
// Backward compatibility
export const getSkillsProfile = getSkillsSummary;
