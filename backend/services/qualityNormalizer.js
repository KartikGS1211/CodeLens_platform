import { buildTrend } from "../utils/trendBuilder.js";

export function normalizeQuality(aiData) {
  if (!aiData.moduleComplexity) {
    throw new Error("Missing moduleComplexity from Groq");
  }

  // --------------------------------------------------------------------------
  // ISSUE 2 FIX: Read each dimension from its own LLM field.
  // The AI prompt now requires distinct fields for all 6 dimensions under
  // aiData.qualityDimensions. Each defaults to 50 (neutral) if missing/invalid
  // rather than silently copying a single uiScore into all slots.
  // --------------------------------------------------------------------------
  const NEUTRAL = 50;

  function safeScore(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : NEUTRAL;
  }

  const qd = aiData.qualityDimensions || {};

  const qualityDimensions = {
    readability: safeScore(qd.readability),
    maintainability: safeScore(qd.maintainability),
    security: safeScore(qd.security),
    performance: safeScore(qd.performance),
    reliability: safeScore(qd.reliability),
    documentation: safeScore(qd.documentation),
  };

  const overallScore = Math.round(
    Object.values(qualityDimensions).reduce((a, b) => a + b, 0) /
      Object.values(qualityDimensions).length,
  );

  // ISSUE 1 FIX: buildTrend now returns {trend, hasHistory, isEstimated}
  const trendResult = buildTrend(overallScore);

  //  Debt Forecast Normalization
  const debtForecast = aiData.debtForecast
    ? {
        currentDebtScore: Number(aiData.debtForecast.currentDebtScore || 0),
        riskLevel: aiData.debtForecast.riskLevel || "Unknown",
        projectedRiskIncrease: Number(
          aiData.debtForecast.projectedRiskIncrease || 0,
        ),
        estimatedRefactorHours: Number(
          aiData.debtForecast.estimatedRefactorHours || 0,
        ),
        maintainabilityDeclineProbability:
          aiData.debtForecast.maintainabilityDeclineProbability || "Unknown",
        aiInsight: aiData.debtForecast.aiInsight || "AI insight unavailable.",
      }
    : null;

  return {
    // Expose the full trend metadata so callers/frontend can check hasHistory
    qualityTrend: trendResult.trend,
    qualityTrendMeta: {
      hasHistory: trendResult.hasHistory,
      isEstimated: trendResult.isEstimated,
    },

    moduleComplexity: Object.entries(aiData.moduleComplexity).map(
      ([module, data]) => ({
        module,
        complexity: Number(data.score),
      }),
    ),

    qualityDimensions,
    recentIssues: aiData.recentIssues || [],

    debtForecast,
  };
}
