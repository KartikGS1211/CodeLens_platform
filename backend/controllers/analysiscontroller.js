import prisma from "../db/prisma.js";
import { runAnalysisPipeline } from "../services/pipelineservice.js";

/**
 * START ANALYSIS
 */
export async function startAnalysis(req, res) {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || !repoUrl.startsWith("https://github.com/")) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }

    const parts = repoUrl.replace(/\/$/, "").split("/");
    if (parts.length < 5) {
      return res
        .status(400)
        .json({ error: "Invalid GitHub repository format" });
    }

    const owner = parts[3];
    const repoName = parts[4];

    // 1️⃣ UPSERT REPOSITORY FIRST
    const repository = await prisma.repository.upsert({
      where: { repositoryUrl: repoUrl },
      update: {
        repositoryName: repoName,
        owner,
        status: "analyzing",
        lastSyncDate: new Date(),
      },
      create: {
        repositoryUrl: repoUrl,
        repositoryName: repoName,
        owner,
        status: "analyzing",
        lastSyncDate: new Date(),
      },
    });

    // 2️⃣ CHECK IF ANALYSIS ALREADY EXISTS
    let analysis = await prisma.analysis.findUnique({
      where: { repositoryId: repository.id },
    });

    if (analysis) {
      // 🔁 RESET EXISTING ANALYSIS
      analysis = await prisma.analysis.update({
        where: { id: analysis.id },
        data: {
          status: "processing",
          source: "pending",
          analyzedAt: null,

          // 🔹 new code-quality fields
          qualityDimensions: null,
          qualityTrend: null,
          moduleComplexity: null,
          recentIssues: null,

          // existing
          architecture: null,
          review: null,
          bestPractices: null,
          redFlags: null,
          skillSummary: null,
          overallVerdict: null,
        },
      });
    } else {
      // 🆕 CREATE NEW ANALYSIS
      analysis = await prisma.analysis.create({
        data: {
          repoUrl,
          repoName,
          languages: [],
          status: "processing",
          source: "pending",
          repositoryId: repository.id,
        },
      });
    }

    // 3️⃣ RUN PIPELINE ASYNC
    runAnalysisPipeline(analysis.id, repoUrl).catch((err) =>
      console.error("❌ Pipeline error:", err),
    );

    return res.status(201).json({
      analysisId: analysis.id,
      status: "processing",
    });
  } catch (err) {
    console.error("❌ startAnalysis failed:", err);
    return res.status(500).json({ error: "Failed to start analysis" });
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

    // Always return same shape
    return res.json({
      id: analysis.id,
      status: analysis.status,

      repoName: analysis.repoName ?? "—",
      languages: analysis.languages ?? [],
      commits: analysis.commits ?? 0,
      files: analysis.files ?? 0,
      analyzedAt: analysis.analyzedAt,

      source: analysis.source,
    });
  } catch (err) {
    console.error("❌ getOverview failed:", err);
    return res.status(500).json({ error: "Failed to fetch overview" });
  }
}

/**
 * CODE QUALITY
 */
export async function getCodeQuality(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: {
        qualityDimensions: true,
        qualityTrend: true,
        moduleComplexity: true,
        recentIssues: true,
        status: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.status(202).json({
        status: analysis.status,
        message: "Groq analysis not ready or failed",
      });
   }
  
    return res.json({
      status: "completed",
      qualityDimensions: analysis.qualityDimensions,
      qualityTrend: analysis.qualityTrend,
      moduleComplexity: analysis.moduleComplexity,
      recentIssues: analysis.recentIssues || [],
    });
  } catch (err) {
    console.error(" getCodeQuality failed:", err);
    return res.status(500).json({ error: "Failed to fetch code quality" });
  }
}

/**
 * ARCHITECTURE
 */
export async function getArchitecture(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { architecture: true, status: true },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.json({
        status: analysis.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(analysis.architecture ?? {});
  } catch (err) {
    console.error("❌ getArchitecture failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch architecture" });
  }
}

/**
 * AI REVIEW
 */
export async function getAIReview(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: {
        review: true,
        redFlags: true,
        status: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.json({
        review: {
          strengths: [],
          weaknesses: [],
          suggestions: [],
        },
        redFlags: [],
        status: analysis.status,
      });
    }

    return res.json({
      review: analysis.review ?? {
        strengths: [],
        weaknesses: [],
        suggestions: [],
      },
      redFlags: analysis.redFlags ?? [],
      status: "completed",
    });
  } catch (err) {
    console.error("❌ getAIReview failed:", err);
    res.status(500).json({ error: "Failed to fetch AI review" });
  }
}

/**
 * SKILL SUMMARY
 */
export async function getSkillSummary(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: {
        skillSummary: true,
        overallVerdict: true,
        status: true,
        analyzedAt: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: "Analysis not found",
      });
    }

    if (analysis.status !== "completed") {
      return res.json({
        success: true,
        status: analysis.status,
        skillSummary: null,
      });
    }

    return res.json({
      success: true,
      status: "completed",
      analyzedAt: analysis.analyzedAt,
      skillSummary: analysis.skillSummary,
      overallVerdict: analysis.overallVerdict,
    });
  } catch (err) {
    console.error("❌ getSkillSummary failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch skill summary" });
  }
}

/**
 * BEST PRACTICES
 */
export async function getBestPractices(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { bestPractices: true, status: true },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.json({
        status: analysis.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(analysis.bestPractices ?? []);
  } catch (err) {
    console.error("❌ getBestPractices failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch best practices" });
  }
}

/**
 * RED FLAGS
 */
export async function getRedFlags(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { redFlags: true, status: true },
    });

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    if (analysis.status !== "completed") {
      return res.json({
        status: analysis.status,
        message: "Analysis not completed yet",
      });
    }

    return res.json(analysis.redFlags ?? []);
  } catch (err) {
    console.error("❌ getRedFlags failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch red flags" });
  }
}

/**
 * LIST REPOSITORIES
 */
export async function getRepositories(req, res) {
  try {
    const repos = await prisma.repository.findMany({
      include: {
        analysis: {
          select: {
            id: true,
            status: true,
            analyzedAt: true,
          },
        },
      },
      orderBy: { lastSyncDate: "desc" },
    });

    return res.json({ repositories: repos });
  } catch (err) {
    console.error(" getRepositories failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch repositories" });
  }
}

export async function getFullAnalysis(req, res) {
  const analysisId = req.params.id;

  if (!analysisId) {
    return res.status(400).json({
      success: false,
      error: "analysisId is missing",
    });
  }

  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis) {
    return res.status(404).json({
      success: false,
      error: "Analysis not found",
    });
  }

  return res.json({
    ...analysis,
    achievements: analysis.achievements,
    growthRecommendations: analysis.growthRecommendations,
  });
}
