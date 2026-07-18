/**
 * analysisProgress.js
 *
 * Task 3: Lightweight in-memory progress store.
 * The pipeline writes progress after each chunk is processed.
 * The GET /progress endpoint reads from this store.
 *
 * This is intentionally simple (no Redis/DB) — appropriate for a
 * single-process Node.js backend. If the backend ever scales to
 * multiple processes/workers, replace with a Redis-backed store.
 *
 * Entries auto-expire after 30 minutes to prevent memory leaks.
 */

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Map<analysisId, { chunksProcessed, totalChunks, status, startedAt }>
const progressStore = new Map();

/**
 * Initialize or reset progress for an analysis run.
 * Called at the start of the pipeline before chunks are processed.
 */
export function initProgress(analysisId, totalChunks) {
  progressStore.set(analysisId, {
    chunksProcessed: 0,
    totalChunks,
    status: "analyzing",
    startedAt: Date.now(),
  });
}

/**
 * Increment the chunksProcessed counter for an analysis.
 * Called after each chunk LLM call completes.
 */
export function incrementProgress(analysisId, totalChunks) {
  const entry = progressStore.get(analysisId);
  if (!entry) return;
  if (typeof totalChunks === "number") {
    entry.totalChunks = totalChunks;
  }
  entry.chunksProcessed = Math.min(
    entry.chunksProcessed + 1,
    entry.totalChunks,
  );
}

/**
 * Mark an analysis as done (pipeline finished).
 */
export function completeProgress(analysisId) {
  const entry = progressStore.get(analysisId);
  if (!entry) return;
  entry.status = "done";
  entry.chunksProcessed = entry.totalChunks;
  // Auto-remove after expiry
  setTimeout(() => progressStore.delete(analysisId), EXPIRY_MS);
}

/**
 * Get the current progress snapshot for a given analysis.
 * Returns null if no entry exists (analysis not started or already expired).
 */
export function getProgress(analysisId) {
  const entry = progressStore.get(analysisId);
  if (!entry) return null;

  const elapsed = Date.now() - entry.startedAt;
  const secPerChunk =
    entry.chunksProcessed > 0 ? elapsed / entry.chunksProcessed / 1000 : 15; // default estimate: 15s per chunk

  const remaining = entry.totalChunks - entry.chunksProcessed;
  const estimatedSecondsRemaining = Math.round(remaining * secPerChunk);

  return {
    chunksProcessed: entry.chunksProcessed,
    totalChunks: entry.totalChunks,
    status: entry.status,
    estimatedSecondsRemaining,
  };
}
