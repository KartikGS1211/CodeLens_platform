import prisma from "../db/prisma.js";
import { fetchRepoData, parseFiles } from "./githubservice.js";
import { aiEvaluate } from "./aiservice.js";
import { calculateSkillsLevel } from "../utils/skillutils.js";
import { normalizeQuality } from "./qualityNormalizer.js";

export async function runAnalysisPipeline(analysisId, repoUrl) {
  try {
    console.log("🚀 Starting analysis pipeline for:", repoUrl);

    const parts = repoUrl.replace(/\/$/, "").split("/");
    const owner = parts[3];
    const repo = parts[4];

    /**
     * 1️⃣ Fetch GitHub metadata
     */
    let repoData;
    try {
      repoData = await fetchRepoData(owner, repo);
    } catch (err) {
      console.error("❌ GitHub fetch failed:", err.message);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: "failed",
          source: "fallback",
          skillSummary: "GitHub repository could not be fetched",
        },
      });

      return;
    }

    /**
     *  Parse repository source files
     * This function must NEVER throw
     */
    const codeFiles = await parseFiles(owner, repo);

    /**
     *  No analyzable files → deterministic fallback
     */
    if (!codeFiles || codeFiles.length === 0) {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: "failed",
          source: "ai",
          skillSummary: "Groq AI could not analyze repository (no valid files)",
        },
      });

      return;
    }

    /**
     *  AI Evaluation (AI → fallback guaranteed)
     */
    const aiResult = await aiEvaluate(codeFiles);

    if (
      !Array.isArray(aiResult.achievements) ||
      aiResult.achievements.length === 0 ||
      !Array.isArray(aiResult.growthRecommendations) ||
      aiResult.growthRecommendations.length === 0
    ) {
      throw new Error(
        "Groq did not return achievements or growthRecommendations",
      );
    }

    if (!aiResult || !aiResult.moduleComplexity) {
      throw new Error("AI evaluation failed to return valid fields");
    }

    // 🔹 Build Code Quality Page data
    const normalizedQuality = normalizeQuality(aiResult);

    //  Safe stack skills for developer profile
    const safeStackSkills = {
      react: Number(aiResult.stackSkills?.react ?? 70),
      typescript: Number(aiResult.stackSkills?.typescript ?? 70),
      node: Number(aiResult.stackSkills?.node ?? 70),
      testing: Number(aiResult.stackSkills?.testing ?? 65),
      devops: Number(aiResult.stackSkills?.devops ?? 60),
      security: Number(aiResult.stackSkills?.security ?? 65),
    };

    const isFallback = aiResult.__source === "fallback";

    /**
     *  Normalize + secure AI output
     */
    const uiScore = Number(aiResult.moduleComplexity?.UI?.score ?? 70);

    const safeCodeQuality = {
      readability: uiScore,
      maintainability: uiScore,
      security: Number(aiResult.stackSkills?.security ?? 60),
      performance: uiScore,
    };

    // -------------------------------
    // 🔹 Code Quality Page Normalization
    // -------------------------------

    const qualityDimensions = {
      readability: safeCodeQuality.readability,
      maintainability: safeCodeQuality.maintainability,
      security: safeCodeQuality.security,
      performance: safeCodeQuality.performance,
      reliability: Number(aiResult.codeQuality?.reliability ?? 70),
      documentation: Number(aiResult.codeQuality?.documentation ?? 65),
    };

    const overallScore = Math.round(
      Object.values(qualityDimensions).reduce((a, b) => a + b, 0) /
        Object.values(qualityDimensions).length,
    );

    const qualityTrend = [
      { month: "Jan", score: overallScore - 15 },
      { month: "Feb", score: overallScore - 10 },
      { month: "Mar", score: overallScore - 6 },
      { month: "Apr", score: overallScore - 3 },
      { month: "May", score: overallScore - 1 },
      { month: "Jun", score: overallScore },
    ];

    const moduleComplexity = Object.entries(
      aiResult.moduleComplexity || {},
    ).map(([module, data]) => ({
      module,
      complexity: data.score,
    }));

    const safeArchitecture = {
      pattern: aiResult.architecture?.pattern ?? "Not specified",
      scalability: aiResult.architecture?.scalability ?? "Not specified",
      separationOfConcerns:
        aiResult.architecture?.separationOfConcerns ?? "Not specified",
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

    const safeRecentIssues = Array.isArray(aiResult.recentIssues)
      ? aiResult.recentIssues
      : [];

    const safeAchievements = aiResult.achievements;
     

    const safeGrowthRecommendations =aiResult.growthRecommendations;
    
     
    /**
     * Improve Skill Summary
     */
    let finalSkillSummary = aiResult.skillSummary;
    //  Safe developer profile stats
    // ----------------------------------
    // 🔹 Developer Profile (2-step build)
    // ----------------------------------

    const computedOverallScore = Math.round(
      (safeCodeQuality.readability +
        safeCodeQuality.maintainability +
        safeCodeQuality.security +
        safeCodeQuality.performance) /
        4,
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
      JSON.stringify(aiResult.modelComplexity, null, 2),
    );

    console.log("SAVING QUALITY DIMENSIONS:", qualityDimensions);
    console.log("SAVING TREND:", qualityTrend);
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
        stackSkills: safeStackSkills,
        developerProfile: safeDeveloperProfile,
        achievements: safeAchievements,
        growthRecommendations: safeGrowthRecommendations,

        review: safeReview,
        bestPractices: safeBestPractices,
        redFlags: safeRedFlags,

        recentIssues: safeRecentIssues,

        qualityDimensions: normalizedQuality.qualityDimensions,
        qualityTrend: normalizedQuality.qualityTrend,
        moduleComplexity: normalizedQuality.moduleComplexity,
        recentIssues: normalizedQuality.recentIssues,

        skillSummary: finalSkillSummary,
        overallVerdict:
          aiResult.overallVerdict ?? "Analysis completed successfully",

        source: isFallback ? "fallback" : "ai",
        analyzedAt: new Date(),
        status: "completed",
      },
    });

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

    console.log("🎉 Analysis pipeline completed successfully");
  } catch (err) {
    /**
     * Absolute last-resort failure handler
     * This should almost never execute
     */
    console.error("❌ PIPELINE CRITICAL FAILURE:", err);

    await prisma.analysis
      .update({
        where: { id: analysisId },
        data: {
          status: "failed",
          source: "fallback",
          skillSummary: "Unexpected error during analysis pipeline",
        },
      })
      .catch(() => {});
  }
}
