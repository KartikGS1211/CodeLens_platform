import express from 'express';

import { 
    startAnalysis,
    getOverview,
    getCodeQuality,
    getAIReview,
    getSkillsProfile,
    getBestPractices,
} from "../controllers/analysisController.js";

const router = express.Router();

router.post("/start", startAnalysis);
router.get("/:id/overview", getOverview);
router.get("/:id/code-quality", getCodeQuality);
router.get("/:id/ai-review", getAIReview);
router.get("/:id/skills-profile", getSkillsProfile);
router.get("/:id/best-practices", getBestPractices);

export default router;