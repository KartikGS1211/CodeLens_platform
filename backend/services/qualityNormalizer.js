import { buildTrend } from "../utils/trendBuilder.js";

export function normalizeQuality(aiData) {

  if (!aiData.moduleComplexity) {
    throw new Error("Missing moduleComplexity from Groq");
  }

  const uiScore = Number(aiData.moduleComplexity.UI?.score);

  const qualityDimensions = {
    readability: uiScore,
    maintainability: uiScore,
    security: Number(aiData.stackSkills?.security),
    performance: uiScore,
    reliability: uiScore,
    documentation: uiScore,
  };

  const overallScore = Math.round(
    Object.values(qualityDimensions).reduce((a, b) => a + b, 0) /
      Object.values(qualityDimensions).length
  );

  return {
    qualityTrend: buildTrend(overallScore),

    moduleComplexity: Object.entries(aiData.moduleComplexity).map(
      ([module, data]) => ({
        module,
        complexity: Number(data.score),
      })
    ),

    qualityDimensions,
    recentIssues: aiData.recentIssues || []
  };
}