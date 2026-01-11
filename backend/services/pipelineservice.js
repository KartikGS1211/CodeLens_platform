import prisma from "../db/prisma.js";
import { fetchRepoData, parseFiles } from "./githubservice.js";
import { aiEvaluate } from "./aiservice.js";
import { calculateSkillsLevel } from "../utils/skillutils.js";

export async function runAnalysisPipeline(id, repoUrl) {
  try {
    console.log("🚀 Starting analysis for:", repoUrl);

    const [owner, repo] = repoUrl.split("/").slice(-2);

    // 🔹 1. Fetch GitHub metadata
    let repoData;
    try {
      repoData = await fetchRepoData(owner, repo);
    } catch (err) {
      console.error("❌ GitHub repo fetch failed:", err.message);

      await prisma.analysis.update({
        where: { id },
        data: {
          status: "completed",
          codeQualitySource: "fallback",
          skillsProfile: {
            level: "Unknown",
            summary: "GitHub repository could not be analyzed",
          },
        },
      });

      return;
    }

    // 🔹 2. Parse source files (SAFE – never throws)
    const codeFiles = await parseFiles(owner, repo);

    // 🔹 3. NO FILES → GRACEFUL FALLBACK (IMPORTANT FIX)
    if (!codeFiles || codeFiles.length === 0) {
      console.warn("⚠️ No supported source files found. Using fallback.");

      await prisma.analysis.update({
        where: { id },
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
          codeQualitySource: "fallback",

          aiReview: {
            strengths: [],
            weaknesses: ["No supported source files found"],
            suggestions: ["Add supported source code files"],
          },

          bestPractices: [],

          skillsProfile: {
            level: "Unknown",
            summary: "Repository does not contain analyzable source files",
          },

          status: "completed",
        },
      });

      console.log("✅ Analysis completed with fallback (no code files)");
      return;
    }

    // 🔹 4. AI Evaluation (SAFE – fallback guaranteed)
    const aiResult = await aiEvaluate(codeFiles);
    const isFallback = aiResult?.__source === "fallback";

    // 🔹 5. Normalize AI output
    const safeCodeQuality = {
      readability: Number(aiResult?.codeQuality?.readability ?? 7),
      maintainability: Number(aiResult?.codeQuality?.maintainability ?? 7),
      security: Number(aiResult?.codeQuality?.security ?? 7),
      performance: Number(aiResult?.codeQuality?.performance ?? 7),
    };

    // 🔹 6. Save FINAL result
    await prisma.analysis.update({
      where: { id },
      data: {
        repoName: repoData.name || repo,
        languages: repoData.languages || [],
        commits: repoData.commits || 0,
        files: repoData.files || 0,

        codeQuality: safeCodeQuality,
        codeQualitySource: isFallback ? "fallback" : "ai",

        aiReview: aiResult.review ?? {},
        bestPractices: aiResult.bestPractices ?? [],

        skillsProfile: {
          level: calculateSkillsLevel(safeCodeQuality),
          summary: aiResult.skillSummary || "Skill analysis completed",
        },

        status: "completed",
      },
    });

    console.log("🎉 Analysis completed successfully");
  } catch (err) {
    // 🔴 LAST RESORT (should NEVER happen now)
    console.error("❌ PIPELINE CRITICAL FAILURE:", err);

    await prisma.analysis
      .update({
        where: { id },
        data: {
          status: "completed",
          codeQualitySource: "fallback",
          skillsProfile: {
            level: "Unknown",
            summary: "Unexpected error during analysis",
          },
        },
      })
      .catch(() => {});
  }
}
