export function buildTrend(currentScore) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return months.map((month, index) => ({
    month,
    score: Math.max(40, currentScore - (5 * (5 - index)))
  }));
}
