import prisma from "../db/prisma.js";
import { fetchRepoData, parseFiles } from "./githubservice.js";
import { aiEvaluate } from "./aiservice.js";
import { calculateSkillsLevel } from "../utils/skillutils.js";
import { normalizeQuality } from "./qualityNormalizer.js";
import {
  initProgress,
  incrementProgress,
  completeProgress,
} from "../utils/analysisProgress.js";

async function writeFallback(analysisId, repoUrl, repoData, reason) {
  console.log("Fallback triggered:", reason);

  await prisma.analysis.update({
    where: { id: analysisId },
    data: {
      repoName: repoData?.name || repoUrl.split("/").pop(),
      languages: repoData?.languages || [],
      commits: repoData?.commits || 0,
      files: repoData?.files || 0,

      architecture: {},
      review: { strengths: [], weaknesses: [], suggestions: [] },
      bestPractices: [],
      redFlags: [],

      qualityDimensions: {
        readability: 60,
        maintainability: 60,
        security: 55,
        performance: 55,
        reliability: 55,
        documentation: 55,
      },

      skillSummary: reason,
      overallVerdict: reason,

      source: "fallback",
      analyzedAt: new Date(),
      status: "completed",
    },
  });

  await prisma.repository.update({
    where: { repositoryUrl: repoUrl },
    data: { status: "connected", lastSyncDate: new Date() },
  });
}

function parseRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }
  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
  };
}

export async function runAnalysisPipeline(
  analysisId,
  repoUrl,
  githubAccessToken,
) {
  try {
    console.log(" Starting analysis pipeline for:", repoUrl);

    // Task 3: Initialize progress tracking for this analysis run.
    // We don't know chunk count yet, so start with 1 as a placeholder;
    // aiEvaluate will refine via the onChunkDone callback.
    initProgress(analysisId, 1);

    const { owner, repo } = parseRepoUrl(repoUrl);

    /**
     *  Fetch GitHub metadata
     */
    let repoData;
    try {
      repoData = await fetchRepoData(owner, repo, githubAccessToken);
    } catch (err) {
      console.error(" GitHub fetch failed:", err.message);
      await writeFallback(
        analysisId,
        repoUrl,
        null,
        `GitHub fetch failed: ${err.message}`,
      );
      return;
    }

    /**
     *  Parse repository source files
     * This function must NEVER throw
     */
    const codeFiles = await parseFiles(owner, repo, githubAccessToken);

    console.log("Parsed files:", codeFiles.length);

    //  No analyzable files → deterministic fallback
    if (!codeFiles || codeFiles.length === 0) {
      await writeFallback(
        analysisId,
        repoUrl,
        repoData,
        "No valid code files found; fallback summary",
      );
      return;
    }

    //  SAFETY LIMITER ENABLED
    const MAX_FILES = 20;
    // const MAX_FILE_CHARS = 12000;

    // const safeCodeFiles = codeFiles
    //   .slice(0, MAX_FILES)
    //   .map((file) => ({
    //     ...file,
    //     content:
    //       file.content.length > MAX_FILE_CHARS
    //         ? file.content.slice(0, MAX_FILE_CHARS)
    //         : file.content,
    //   }));

    const safeCodeFiles = codeFiles.slice(0, MAX_FILES);

    let aiResult;
    try {
      // Task 3: Pass progressCallback so each chunk increments the store
      const onChunkDone = (chunkIndex, totalChunks) =>
        incrementProgress(analysisId, totalChunks);
      aiResult = await aiEvaluate(safeCodeFiles, onChunkDone);
    } catch (err) {
      console.error("Groq AI failed:", err.message);
      await writeFallback(
        analysisId,
        repoUrl,
        repoData,
        "AI evaluation failed; fallback results",
      );
      return;
    }

    if (!aiResult || !aiResult.moduleComplexity) {
      await writeFallback(
        analysisId,
        repoUrl,
        repoData,
        "AI returned empty payload; fallback results",
      );
      return;
    }

    // ISSUE 2 FIX: qualityDimensions now come from the LLM's distinct per-dimension fields
    // via normalizedQuality (which reads aiResult.qualityDimensions.* with neutral fallbacks).
    // ISSUE 4 FIX: Log chunk coverage so the response tracks how much was analyzed.
    if (aiResult.__chunkCoverage) {
      console.log(
        `Coverage: ${aiResult.__chunkCoverage.chunksProcessed}/${aiResult.__chunkCoverage.totalChunks} chunks (~${aiResult.__chunkCoverage.coveragePct}% of input analyzed)`,
      );
    }

    // ISSUE 1 FIX: qualityTrend is now built from a single real data point with hasHistory:false
    // (normalizedQuality.qualityTrend holds the array; qualityTrendMeta holds the flags)

    const safeDebtForecast = aiResult.debtForecast
      ? {
          currentDebtScore: Number(aiResult.debtForecast.currentDebtScore ?? 0),
          riskLevel: aiResult.debtForecast.riskLevel ?? "Unknown",
          projectedRiskIncrease: Number(
            aiResult.debtForecast.projectedRiskIncrease ?? 0,
          ),

          estimatedRefactorHours: Math.min(
            Number(aiResult.debtForecast.estimatedRefactorHours ?? 0),
            60, // cap at 60 hours
          ),
          maintainabilityDeclineProbability:
            aiResult.debtForecast.maintainabilityDeclineProbability ??
            "Unknown",
          aiInsight:
            aiResult.debtForecast.aiInsight ?? "AI insight unavailable.",
        }
      : null;

    console.log(" Debt Forecast:", safeDebtForecast);

    //  Dynamic Skill Radar Safe Handling (NEW)
    const safeSkillRadar = aiResult.skillRadar
      ? {
          domain: aiResult.skillRadar.domain ?? "General",
          labels: Array.isArray(aiResult.skillRadar.labels)
            ? aiResult.skillRadar.labels
            : [],
          values: Array.isArray(aiResult.skillRadar.values)
            ? aiResult.skillRadar.values.map((v) => Number(v))
            : [],
        }
      : null;

    const isFallback = aiResult.__source === "fallback";

    /**
     *  Normalize + secure AI output
     */
    // Run normalizer - reads per-dimension LLM fields with 50 fallbacks (Issue 2 fix)
    const normalizedQuality = normalizeQuality(aiResult);

    // safeCodeQuality reads from the already-normalized dimensions (no more uiScore copies)
    const safeCodeQuality = {
      readability: normalizedQuality.qualityDimensions.readability,
      maintainability: normalizedQuality.qualityDimensions.maintainability,
      security: normalizedQuality.qualityDimensions.security,
      performance: normalizedQuality.qualityDimensions.performance,
    };

    const moduleComplexity = normalizedQuality.moduleComplexity;

    const safeArchitecture = {
      pattern: aiResult.architecture?.pattern ?? "Unknown",
      patternReason: aiResult.architecture?.patternReason ?? "",
      scalability: aiResult.architecture?.scalability ?? "Unknown",
      scalabilityReason: aiResult.architecture?.scalabilityReason ?? "",
      separationOfConcerns:
        aiResult.architecture?.separationOfConcerns ?? "Unknown",
      socReason: aiResult.architecture?.socReason ?? "",
      architectureScore: Number(aiResult.architecture?.architectureScore ?? 70),
      riskLevel: aiResult.architecture?.riskLevel ?? "Moderate",
      confidence: Number(aiResult.architecture?.confidence ?? 75),
    };

    const safeReview = {
      strengths: Array.isArray(aiResult.review?.strengths)
        ? aiResult.review.strengths
        : [],
      weaknesses: Array.isArray(aiResult.review?.weaknesses)
        ? aiResult.review.weaknesses
        : [],
      suggestions: Array.isArray(aiResult.review?.suggestions)
        ? aiResult.review.suggestions
        : [],
    };

    const safeBestPractices = Array.isArray(aiResult.bestPractices)
      ? aiResult.bestPractices
      : [];

    const safeRedFlags = Array.isArray(aiResult.redFlags)
      ? aiResult.redFlags
      : [];

    // const safeRecentIssues = Array.isArray(aiResult.recentIssues)
    //   ? aiResult.recentIssues
    //   : [];

    const safeAchievements = aiResult.achievements;

    const safeGrowthRecommendations = aiResult.growthRecommendations;

    /**
     * Improve Skill Summary
     */
    let finalSkillSummary = aiResult.skillSummary;
    //  Safe developer profile stats
    // ----------------------------------
    // 🔹 Developer Profile (2-step build)
    // ----------------------------------

    // computedOverallScore uses all 6 dimensions now (Issue 2 fix)
    const computedOverallScore = Math.round(
      (normalizedQuality.qualityDimensions.readability +
        normalizedQuality.qualityDimensions.maintainability +
        normalizedQuality.qualityDimensions.security +
        normalizedQuality.qualityDimensions.performance +
        normalizedQuality.qualityDimensions.reliability +
        normalizedQuality.qualityDimensions.documentation) /
        6,
    );

    const safeDeveloperProfile = {
      overallScore: Number(
        aiResult.developerProfile?.overallScore ?? computedOverallScore,
      ),
      skillsTracked: 6,
      growthRate: Number(aiResult.developerProfile?.growthRate ?? 10),
      level:
        aiResult.developerProfile?.level ??
        (computedOverallScore > 80
          ? "Senior"
          : computedOverallScore > 60
            ? "Mid"
            : "Junior"),
    };

    if (!finalSkillSummary || finalSkillSummary.length < 20) {
      finalSkillSummary = calculateSkillsLevel(safeCodeQuality);
    }

    console.log(
      "PIPELINE MODULE COMPLEXITY:",
      JSON.stringify(aiResult.moduleComplexity, null, 2),
    );

    console.log(
      "SAVING QUALITY DIMENSIONS:",
      normalizedQuality.qualityDimensions,
    );
    console.log(
      "SAVING TREND:",
      normalizedQuality.qualityTrend,
      normalizedQuality.qualityTrendMeta,
    );
    console.log("SAVING MODULE COMPLEXITY:", moduleComplexity);

    /**
     *  Persist final analysis
     */
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        repoName: repoData.name || repo,
        languages: repoData.languages || [],
        commits: repoData.commits || 0,
        files: repoData.files || 0,

        architecture: safeArchitecture,
        skillRadar: safeSkillRadar,
        developerProfile: safeDeveloperProfile,
        achievements: safeAchievements,
        growthRecommendations: safeGrowthRecommendations,

        review: safeReview,
        bestPractices: safeBestPractices,
        redFlags: safeRedFlags,

        qualityDimensions: normalizedQuality.qualityDimensions,
        qualityTrend: normalizedQuality.qualityTrend, // Issue 1 fix: single real data point
        moduleComplexity: normalizedQuality.moduleComplexity,
        // recentIssues: normalizedQuality.recentIssues,
        debtForecast: safeDebtForecast,

        skillSummary: finalSkillSummary,
        overallVerdict:
          aiResult.overallVerdict ?? "Analysis completed successfully",

        source: isFallback ? "fallback" : "ai",
        analyzedAt: new Date(),
        status: "completed",
      },
    });

    //  Delete old issues (if re-run)
    await prisma.issue.deleteMany({
      where: { analysisId: analysisId },
    });

    //  Insert new issues safely
    if (
      Array.isArray(aiResult.recentIssues) &&
      aiResult.recentIssues.length > 0
    ) {
      await prisma.issue.createMany({
        data: aiResult.recentIssues.map((issue) => ({
          title: issue.title ?? "Untitled Issue",
          description: issue.description ?? "",
          explanation: issue.explanation ?? "",

          filePath: issue.filePath ?? "",
          line: Number(issue.line ?? 0),

          severity: issue.severity ?? "medium",
          category: issue.category ?? "maintainability",

          currentCode: issue.currentCode ?? "",
          suggestedCode: issue.suggestedCode ?? "",

          fixType: issue.fixType ?? "replace",

          confidence: Number(issue.confidence ?? 70),
          impactScore: Number(issue.impactScore ?? 5),

          analysisId: analysisId,
        })),
      });
    }

    /**
     *  Mark repository as completed
     */
    await prisma.repository.update({
      where: { repositoryUrl: repoUrl },
      data: {
        status: "connected",
        lastSyncDate: new Date(),
      },
    });

    console.log(" Analysis pipeline completed successfully");
  } catch (err) {
    // Absolute last-resort failure handler
    console.error("? PIPELINE CRITICAL FAILURE:", err);
    await writeFallback(
      analysisId,
      repoUrl,
      null,
      `Pipeline crashed: ${err?.message || "unexpected error"}`,
    ).catch(() => {});
  } finally {
    completeProgress(analysisId);
  }
}
