
import apiClient from "@/lib/apiClient";

/** START ANALYSIS */
export const startAnalysis = async (repoUrl: string) => {
  const res = await apiClient.post("/analyze/start", {
    repoUrl,
  });
  return res.data;
};

/** OVERVIEW */
export const getOverview = async (analysisId: string) => {
  const res = await apiClient.get(`/analyze/${analysisId}/overview`);
  return res.data;
};

/** CODE QUALITY */
export const getCodeQuality = async (analysisId: string) => {
  const res = await apiClient.get(`/analyze/${analysisId}/code-quality`);
  return res.data;
};

/** AI REVIEW */
export const getAIReview = async (analysisId: string) => {
  const res = await apiClient.get(`/analyze/${analysisId}/ai-review`);
  return res.data;
};

/** SKILLS PROFILE */
export const getSkillsProfile = async (analysisId: string) => {
  const res = await apiClient.get(`/analyze/${analysisId}/skills-profile`);
  return res.data;
};

/** BEST PRACTICES */
export const getBestPractices = async (analysisId: string) => {
  const res = await apiClient.get(`/analyze/${analysisId}/best-practices`);
  return res.data;
};
