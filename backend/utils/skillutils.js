// Calculate developer skill level from code quality scores
export function calculateSkillsLevel(codeQuality) {
  if (!codeQuality) return "Beginner";

  const readability = Number(codeQuality.readability ?? 0);
  const maintainability = Number(codeQuality.maintainability ?? 0);
  const security = Number(codeQuality.security ?? 0);
  const performance = Number(codeQuality.performance ?? 0);

  const avg =
    (readability + maintainability + security + performance) / 4;

  if (avg >= 8) return "Advanced";
  if (avg >= 6) return "Intermediate";
  return "Beginner";
}
