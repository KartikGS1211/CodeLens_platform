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

    const parts = repoUrl.replace(/\/$/, "").split("/");
    const owner = parts[3];
    const repoName = parts[4];

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        repoUrl,
        repoName,
        languages: [],
        status: "processing",
        source:"pending", 
      },
    });

    // Upsert repository & link analysis (1–1)
    await prisma.repository.upsert({
      where: { repositoryUrl: repoUrl },
      update: {
        repositoryName: repoName,
        owner,
        status: "analyzing",
        analysis: {
          connect: { id: analysis.id },
        },
        lastSyncDate: new Date(),
      },
      create: {
        repositoryUrl: repoUrl,
        repositoryName: repoName,
        owner,
        status: "analyzing",
        analysis: {
          connect: { id: analysis.id },
        },
        lastSyncDate: new Date(),
      },
    });

    // Run pipeline asynchronously
    runAnalysisPipeline(analysis.id, repoUrl).catch(err =>
      console.error("❌ Pipeline async error:", err)
    );

    return res.json({
      analysisId: analysis.id,
      status: "processing",
    });
  } catch (err) {
    console.error("❌ startAnalysis failed:", err.message);
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
      status: "completed",
      repoName: analysis.repoName,
      languages: analysis.languages,
      commits: analysis.commits,
      files: analysis.files,
      analyzedAt: analysis.analyzedAt,
    });
  } catch (err) {
    console.error("❌ getOverview failed:", err.message);
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
        codeQuality: true,
        source: true,
        status: true,
      },
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

    const cq = analysis.codeQuality ?? {};

    return res.json({
      readability: Number(cq.readability ?? 7),
      maintainability: Number(cq.maintainability ?? 7),
      security: Number(cq.security ?? 7),
      performance: Number(cq.performance ?? 7),
      source: analysis.source,
    });
  } catch (err) {
    console.error("❌ getCodeQuality failed:", err.message);
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
      select: { review: true, status: true },
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

    return res.json(analysis.review ?? {});
  } catch (err) {
    console.error("❌ getAIReview failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch AI review" });
  }
}

/**
 * SKILL SUMMARY
 */
export async function getSkillSummary(req, res) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: req.params.id },
      select: { skillSummary: true, status: true },
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

    return res.json({
      skillSummary: analysis.skillSummary ?? "Not available",
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
    console.error("❌ getRepositories failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch repositories" });
  }
}