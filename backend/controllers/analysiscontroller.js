import prisma from "../db/prisma.js";
import { runAnalysisPipeline } from "../services/pipelineservice.js";

/**
 * START ANALYSIS
 */
export async function startAnalysis(req, res) {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl?.startsWith("https://github.com/")) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }

    const analysis = await prisma.analysis.create({
      data: {
        repoUrl,
        languages: [],
        status: "processing",
      },
    });

    // 🔹 Run pipeline async (DO NOT await)
    runAnalysisPipeline(analysis.id, repoUrl).catch(err =>
      console.error("Pipeline async error:", err)
    );

    return res.json({
      analysisId: analysis.id,
      status: "processing",
    });
  } catch (err) {
    console.error("❌ startAnalysis failed:", err.message);
    res.status(500).json({ error: "Failed to start analysis" });
  }
}

/**
 * OVERVIEW
 */
export async function getOverview(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status === "processing") {
      return res.json({
        status: "processing",
        message: "Analysis still in progress",
      });
    }

    if (analysis.status === "failed") {
      return res.json({
        status: "failed",
        message: "Analysis failed. Check backend logs.",
      });
    }

    return res.json({
      repoName: analysis.repoName,
      languages: analysis.languages,
      commits: analysis.commits,
      files: analysis.files,
      status: "completed",
    });
  } catch (err) {
    console.error("❌ getOverview failed:", err.message);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
}

/**
 * CODE QUALITY
 */
export async function getCodeQuality(req, res) {
  try {
    const data = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: {
        codeQuality: true,
        codeQualitySource: true,
        status: true,
      },
    });

    if (!data) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (data.status !== "completed") {
      return res.json({
        status: data.status,
        message: "Analysis not completed yet",
      });
    }

    const cq = data.codeQuality || {};

    return res.json({
      readability: Number(cq.readability ?? 7),
      maintainability: Number(cq.maintainability ?? 7),
      security: Number(cq.security ?? 7),
      performance: Number(cq.performance ?? 7),
      source: data.codeQualitySource ?? "unknown",
    });
  } catch (err) {
    console.error("❌ getCodeQuality failed:", err.message);
    res.status(500).json({ error: "Failed to fetch code quality" });
  }
}

/**
 * AI REVIEW
 */
export async function getAIReview(req, res) {
  try {
    const data = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { aiReview: true, status: true },
    });

    if (!data) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (data.status !== "completed") {
      return res.json({
        status: data.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(data.aiReview ?? {});
  } catch (err) {
    console.error("❌ getAIReview failed:", err.message);
    res.status(500).json({ error: "Failed to fetch AI review" });
  }
}

/**
 * SKILLS PROFILE
 */
export async function getSkillsProfile(req, res) {
  try {
    const data = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { skillsProfile: true, status: true },
    });

    if (!data) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (data.status !== "completed") {
      return res.json({
        status: data.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(
      data.skillsProfile ?? {
        level: "Unknown",
        summary: "Skill analysis not available",
      }
    );
  } catch (err) {
    console.error("❌ getSkillsProfile failed:", err.message);
    res.status(500).json({ error: "Failed to fetch skills profile" });
  }
}

/**
 * BEST PRACTICES
 */
export async function getBestPractices(req, res) {
  try {
    const data = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { bestPractices: true, status: true },
    });

    if (!data) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (data.status !== "completed") {
      return res.json({
        status: data.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(data.bestPractices ?? []);
  } catch (err) {
    console.error("❌ getBestPractices failed:", err.message);
    res.status(500).json({ error: "Failed to fetch best practices" });
  }
}
