import prisma from "../db/prisma.js";
import { fetchRepoData, parseFiles } from "./githubservice.js";
import { aiEvaluate } from "./aiservice.js";
import { calculateSkillsLevel } from "../utils/skillutils.js";

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
     * 2️⃣ Parse repository source files
     * This function must NEVER throw
     */
    const codeFiles = await parseFiles(owner, repo);

    /**
     * 3️⃣ No analyzable files → deterministic fallback
     */
    if (!codeFiles || codeFiles.length === 0) {
      console.warn("⚠️ No supported source files found. Using fallback.");

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          repoName: repoData.name || repo,
          languages: repoData.languages || [],
          commits: repoData.commits || 0,
          files: repoData.files || 0,

          codeQuality: {
            readability: 7,
            maintainability: 7,
            security: 7,
            performance: 7,
          },
          architecture: {
            pattern: "Unknown",
            scalability: "Not assessable",
            separationOfConcerns: "Not assessable",
          },
          review: {
            strengths: [],
            weaknesses: ["No supported source files found"],
            suggestions: ["Add backend or frontend source code"],
          },
          bestPractices: [],
          redFlags: ["Repository contains no analyzable code"],

          skillSummary: "Repository does not contain analyzable source files",
          overallVerdict: "Analysis skipped due to missing source code",

          source: "fallback",
          analyzedAt: new Date(),
          status: "completed",
        },
      });

      await prisma.repository.update({
        where: { repositoryUrl: repoUrl },
        data: {
          status: "connected",
          lastSyncDate: new Date(),
        },
      });

      console.log("✅ Fallback analysis completed (no files)");
      return;
    }

    /**
     * 4️⃣ AI Evaluation (AI → fallback guaranteed)
     */
    const aiResult = await aiEvaluate(codeFiles);
    const isFallback = aiResult.__source === "fallback";

    /**
     * 5️⃣ Normalize + secure AI output
     */
    const safeCodeQuality = {
      readability: Number(aiResult.codeQuality?.readability ?? 7),
      maintainability: Number(aiResult.codeQuality?.maintainability ?? 7),
      security: Number(aiResult.codeQuality?.security ?? 7),
      performance: Number(aiResult.codeQuality?.performance ?? 7),
    };

    /**
     * 6️⃣ Persist final analysis
     */
    await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        repoName: repoData.name || repo,
        languages: repoData.languages || [],
        commits: repoData.commits || 0,
        files: repoData.files || 0,

        codeQuality: safeCodeQuality,
        architecture: aiResult.architecture ?? {},
        review: aiResult.review ?? {},
        bestPractices: aiResult.bestPractices ?? [],
        redFlags: aiResult.redFlags ?? [],

        skillSummary:
          aiResult.skillSummary ||
          calculateSkillsLevel(safeCodeQuality),

        overallVerdict:
          aiResult.overallVerdict ||
          "Analysis completed successfully",

        source: isFallback ? "fallback" : "ai",
        analyzedAt: new Date(),
        status: "completed",
      },
    });

    /**
     * 7️⃣ Mark repository as completed
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
