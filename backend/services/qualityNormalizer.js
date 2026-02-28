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

   //  Debt Forecast Normalization
  const debtForecast = aiData.debtForecast
    ? {
        currentDebtScore: Number(aiData.debtForecast.currentDebtScore || 0),
        riskLevel: aiData.debtForecast.riskLevel || "Unknown",
        projectedRiskIncrease: Number(
          aiData.debtForecast.projectedRiskIncrease || 0
        ),
        estimatedRefactorHours: Number(
          aiData.debtForecast.estimatedRefactorHours || 0
        ),
        maintainabilityDeclineProbability:
          aiData.debtForecast.maintainabilityDeclineProbability || "Unknown",
        aiInsight:
          aiData.debtForecast.aiInsight ||
          "AI insight unavailable."
      }
    : null;

  return {
    qualityTrend: buildTrend(overallScore),

    moduleComplexity: Object.entries(aiData.moduleComplexity).map(
      ([module, data]) => ({
        module,
        complexity: Number(data.score),
      })
    ),

    qualityDimensions,
    recentIssues: aiData.recentIssues || [],

    debtForecast
  };
}