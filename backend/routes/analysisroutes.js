import express from 'express';

import { 
    startAnalysis,
    getOverview,
    getCodeQuality,
    getAIReview,
    getBestPractices,
    getRepositories,
    getArchitecture, getRedFlags,
    getSkillSummary,
    getFullAnalysis,
    getAnalysisIssues
} from "../controllers/analysiscontroller.js";

const router = express.Router();
//start analysis
router.post("/start", startAnalysis);

// analysis overview    
router.get("/:id/overview", getOverview);

// ai evaluation details
router.get("/:id/code-quality", getCodeQuality);
router.get("/:id/architecture", getArchitecture);
router.get("/:id/ai-review", getAIReview);
router.get("/:id/skills-summary", getSkillSummary);
router.get("/:id/best-practices", getBestPractices);
router.get("/:id/red-flags", getRedFlags);
router.get("/:id/full", getFullAnalysis);
router.get("/:id/issues", getAnalysisIssues );

// repositories
router.get("/repositories", getRepositories);

export default router;