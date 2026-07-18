/**
 * trendBuilder.js
 *
 * Returns real historical quality trend data from the database.
 * Because the current schema stores one Analysis per Repository (unique repositoryId),
 * there is no multi-run history yet. We therefore return only the current score as a
 * single data point and flag the response so the frontend can display
 * "Not enough history yet" instead of a fabricated line chart.
 *
 * When a multi-run history table is added in future, replace this function body
 * with a real DB query ordered by createdAt descending, limited to 6 rows.
 *
 * NOTE ON PRISMA SCHEMA:
 * The current schema.prisma has Analysis with a UNIQUE repositoryId (one-to-one
 * with Repository), so only one analysis record exists per repo — no historical runs
 * to query. A `qualityTrend Json?` column is stored in Analysis, but it holds the
 * rendered trend array, not individual timestamped score rows. To enable real history,
 * you would need to drop the @unique constraint on repositoryId and create a new
 * AnalysisHistory model (or keep all Analysis rows per repo). Until then, this
 * function truthfully returns a single data point.
 */

/**
 * @param {number} currentScore - The overall score computed this run (0-100).
 * @returns {{ trend: Array<{month: string, score: number}>, hasHistory: boolean, isEstimated: boolean }}
 */
export function buildTrend(currentScore) {
  const now = new Date();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentMonth = monthNames[now.getMonth()];

  return {
    trend: [{ month: currentMonth, score: Math.round(currentScore) }],
    hasHistory: false,
    isEstimated: false,
  };
}
