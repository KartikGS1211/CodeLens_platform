// Calculate developer skill level from code quality scores (0-100 scale)
// qualityNormalizer.js confirms scores are in 0-100 range (direct LLM output, no rescaling).
export function calculateSkillsLevel(codeQuality) {
  if (!codeQuality) return "Beginner";

  const readability = Number(codeQuality.readability ?? 0);
  const maintainability = Number(codeQuality.maintainability ?? 0);
  const security = Number(codeQuality.security ?? 0);
  const performance = Number(codeQuality.performance ?? 0);

  const avg = (readability + maintainability + security + performance) / 4;

  // Thresholds corrected from 0-10 scale (8/6) to 0-100 scale (80/60)
  if (avg >= 80) return "Advanced";
  if (avg >= 60) return "Intermediate";
  return "Beginner";
}
