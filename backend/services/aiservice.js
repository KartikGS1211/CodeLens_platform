import Groq from "groq-sdk";

// ✅ Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

// ---------- CONFIG ----------
const MAX_INPUT_CHARS = 15000; // Safe buffer
const MAX_OUTPUT_TOKENS = 3000; // Prevent overflow
const MAX_CHUNK_CHARS = 5500; // Per chunk
const MAX_PROMPT_TOKENS = 12000;
// -----------------------------

// ---------- UTIL: Estimate tokens ----------
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ✂ Safe input trim
function safeTrimInput(input) {
  let stringified = JSON.stringify(input);

  if (stringified.length > MAX_INPUT_CHARS) {
    console.log(" Input too large. Trimming...");
    stringified = stringified.slice(0, MAX_INPUT_CHARS);
  }

  return stringified;
}

// 🧹 Clean AI response
function cleanAIResponse(content) {
  if (!content) return null;

  return content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// Extract JSON safely
function extractJSONObject(text) {
  if (!text) return null;

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    return null;
  }

  return text.slice(firstBrace, lastBrace + 1);
}

//  Safe JSON parse
function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

//
// Safe Groq Call with Retry
//
async function safeGroqCall(messages, retries = 2) {
  try {
    return await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages,
    });
  } catch (err) {
    // 413 = request too large
    if (err.status === 413 && retries > 0) {
      console.log(" 413 detected. Shrinking prompt and retrying...");

      if (messages[1]?.content) {
        messages[1].content = messages[1].content.slice(0, 12000);
      }

      await new Promise((r) => setTimeout(r, 10000));
      return safeGroqCall(messages, retries - 1);
    }

    // 429 = rate limit
    if (err.status === 429 && retries > 0) {
      console.log(" Rate limit hit. Retrying in 15s...");
      await new Promise((r) => setTimeout(r, 15000));
      return safeGroqCall(messages, retries - 1);
    }

    throw err;
  }
}

/**
 * Evaluate code using Groq LLM
 * 1. Try Groq
 * 2. If Groq fails → fallback
 */
// --------------------------------------------------------------------------
// ISSUE 4 FIX — Helper: merge multiple chunk results into one aggregated object
// --------------------------------------------------------------------------
function mergeChunkResults(results) {
  if (!results || results.length === 0) return null;
  if (results.length === 1) return results[0];

  // Use first valid result as the base
  const base = results[0];

  // Merge recentIssues from all chunks (deduplicate by title)
  const allIssues = results.flatMap((r) => r.recentIssues || []);
  const seenTitles = new Set();
  base.recentIssues = allIssues.filter((issue) => {
    if (seenTitles.has(issue.title)) return false;
    seenTitles.add(issue.title);
    return true;
  });

  // Average qualityDimensions across chunks
  const dimKeys = [
    "readability",
    "maintainability",
    "security",
    "performance",
    "reliability",
    "documentation",
  ];
  const merged = {};
  dimKeys.forEach((key) => {
    const vals = results
      .map((r) => Number(r.qualityDimensions?.[key]))
      .filter((v) => Number.isFinite(v));
    merged[key] =
      vals.length > 0
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : 50;
  });
  base.qualityDimensions = merged;

  // Average debtForecast scores
  if (base.debtForecast) {
    const debtScores = results
      .map((r) => Number(r.debtForecast?.currentDebtScore))
      .filter((v) => Number.isFinite(v));
    if (debtScores.length > 0) {
      base.debtForecast.currentDebtScore = Math.round(
        debtScores.reduce((a, b) => a + b, 0) / debtScores.length,
      );
    }
  }

  // Merge redFlags
  const allFlags = [...new Set(results.flatMap((r) => r.redFlags || []))];
  base.redFlags = allFlags;

  // Merge review arrays
  ["strengths", "weaknesses", "suggestions"].forEach((key) => {
    const all = [...new Set(results.flatMap((r) => r.review?.[key] || []))];
    if (base.review) base.review[key] = all;
  });

  return base;
}

export async function aiEvaluate(codeSnippets, onChunkDone = null) {
  console.log(" Starting Groq AI repository analysis...");

  try {
    // Safe Input
    const safeInput = safeTrimInput(codeSnippets);

    // ISSUE 4 FIX: chunk and process ALL chunks, then merge
    function chunkInput(input, chunkSize) {
      const chunks = [];
      for (let i = 0; i < input.length; i += chunkSize) {
        chunks.push(input.slice(i, i + chunkSize));
      }
      return chunks;
    }

    const chunks = chunkInput(safeInput, MAX_CHUNK_CHARS);
    console.log(
      `Chunked input into ${chunks.length} chunk(s) for LLM processing.`,
    );

    // ISSUE 2 FIX: Updated JSON schema — LLM required to return DISTINCT scores
    // for all 6 quality dimensions with individual justifications.
    const basePrompt = `
You are a senior software engineer and technical interviewer with 10+ years of experience.

Analyze the following GitHub repository codebase holistically.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- All numeric scores must be between 0 and 100

Return EXACTLY this structure:

{
  "skillRadar": {
    "domain": "AI/ML" | "Web Application" | "Backend API" | "DevOps" | "Full Stack",
    "labels": string[],
    "values": number[]
  },
  "architecture": {
    "pattern": string,
    "patternReason": string,
    "scalability": string,
    "scalabilityReason": string,
    "separationOfConcerns": string,
    "socReason": string,
    "architectureScore": number,
    "riskLevel": "Low" | "Moderate" | "High",
    "confidence": number
  },
  "review": {
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[]
  },
  "bestPractices": [
    {
      "title": string,
      "description": string,
      "impact": "High" | "Medium" | "Low",
      "whyItMatters": string
    }
  ],
  "redFlags": string[],
  "recentIssues": [
    {
      "id": string,
      "title": string,
      "description": string,
      "explanation": string,
      "filePath": string,
      "line": number,
      "severity": "high" | "medium" | "low",
      "category": "security" | "performance" | "maintainability" | "error-handling" | "architecture" | "code-quality" | "best-practice" | "scalability" | "testing",
      "currentCode": string,
      "suggestedCode": string,
      "fixType": "replace" | "insert" | "delete",
      "confidence": number,
      "impactScore": number
    }
  ],
  "moduleComplexity": {
    "Auth":     { "score": number, "issues": string[], "suggestions": string[] },
    "API":      { "score": number, "issues": string[], "suggestions": string[] },
    "UI":       { "score": number, "issues": string[], "suggestions": string[] },
    "Database": { "score": number, "issues": string[], "suggestions": string[] }
  },

  "qualityDimensions": {
    "readability":     { "score": number, "reason": string },
    "maintainability": { "score": number, "reason": string },
    "security":        { "score": number, "reason": string },
    "performance":     { "score": number, "reason": string },
    "reliability":     { "score": number, "reason": string },
    "documentation":   { "score": number, "reason": string }
  },

  "skillSummary": string,
  "overallVerdict": string,
  "achievements": [
    { "title": string, "description": string, "reason": string }
  ],
  "growthRecommendations": [
    { "title": string, "action": string }
  ],
  "debtForecast": {
    "currentDebtScore": number,
    "riskLevel": "Low" | "Moderate" | "High",
    "projectedRiskIncrease": number,
    "estimatedRefactorHours": number,
    "maintainabilityDeclineProbability": "Low" | "Medium" | "High",
    "aiInsight": string
  },
  "developerProfile": {
    "overallScore": number,
    "growthRate": number,
    "level": "Junior" | "Mid" | "Senior"
  }
}

IMPORTANT CONSTRAINTS:
- achievements MUST contain at least 3 items
- growthRecommendations MUST contain at least 3 items
- recentIssues MUST contain at least 3 items if problems exist
- bestPractices MUST contain at least 3 items
- redFlags MUST contain at least 2 items
- moduleComplexity must analyze Auth, API, UI, Database with realistic scores (0-100)
- debtForecast must be logically derived from maintainability, complexity, testing, and security quality
- aiInsight must be 2-3 professional sentences explaining future maintainability risk

CRITICAL — qualityDimensions rules:
- Each of the 6 dimensions (readability, maintainability, security, performance, reliability, documentation)
  MUST have a DISTINCT numeric score between 0 and 100 based on evidence in the code.
- Do NOT assign the same score to all dimensions.
- The 6 scores MUST NOT all fall within 10 points of each other unless the code genuinely performs
  identically across all these aspects (extremely rare). Spread them realistically.
- Each dimension MUST include a one-sentence "reason" justifying the assigned score.
- Score meanings: 0-40 = poor, 41-69 = average, 70-84 = good, 85-100 = excellent.

Rules for recentIssues:
- Detect multiple distinct issues across different files
- Do NOT return only one issue unless repository is nearly perfect
- Use different categories when applicable
- At least one issue must be categorized as "security" or "performance" if such problems exist
- Do not repeat identical issue types
- Each issue must target a specific file and line

Focus on:
- Project structure and modularity
- Async patterns and error handling
- API and database interaction safety
- Performance bottlenecks
- Security vulnerabilities
- Scalability and maintainability
- Future technical debt growth probability

Code snippets:
`;

    // ISSUE 4 FIX: Process ALL chunks sequentially, then merge results.
    // Tradeoff chosen: full multi-chunk sequential processing.
    // Each chunk is sent to the LLM as a separate call with the same prompt,
    // and results are merged via mergeChunkResults(). This ensures large repos
    // are analyzed on ALL provided files, not just the first 5500 chars.
    // Cost: N * (1 LLM call per chunk). For repos with <= 1 chunk (most cases
    // with githubservice.js capping at 10 files × 4000 chars = ~40KB input,
    // chunked at 5500 → ~7 chunks), this replaces the old chunk[0]-only approach.

    const systemMessage = {
      role: "system",
      content: `You are a strict senior software architect and static code analysis engine similar to SonarQube and Snyk.
Be highly critical. Assume production-grade standards. Do not be lenient.
Detect architectural, performance, security, scalability and maintainability risks.
If multiple issues exist in the same file, list them separately.
Only respond with strict valid JSON.`,
    };

    const chunkResults = [];

    for (let i = 0; i < chunks.length; i++) {
      let chunkData = chunks[i];
      let chunkPrompt = basePrompt + chunkData;

      // Token safety per chunk
      if (estimateTokens(chunkPrompt) > MAX_PROMPT_TOKENS) {
        console.log(`Chunk ${i + 1}: token overflow risk. Shrinking...`);
        chunkData = chunkData.slice(0, 12000);
        chunkPrompt = basePrompt + chunkData;
      }

      console.log(`Processing chunk ${i + 1} of ${chunks.length}...`);

      let completion;
      try {
        completion = await safeGroqCall([
          systemMessage,
          { role: "user", content: chunkPrompt },
        ]);
      } catch (err) {
        console.warn(
          `Chunk ${i + 1} LLM call failed: ${err.message}. Skipping.`,
        );
        continue;
      }

      let content = completion.choices[0]?.message?.content;
      if (!content) {
        console.warn(`Chunk ${i + 1} returned empty response. Skipping.`);
        continue;
      }

      content = cleanAIResponse(content);
      const extracted = extractJSONObject(content);
      if (!extracted) {
        console.warn(`Chunk ${i + 1} had no JSON. Skipping.`);
        continue;
      }

      let parsed = tryParseJSON(extracted);
      if (!parsed) {
        const repaired = extracted
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");
        parsed = tryParseJSON(repaired);
      }
      if (!parsed) {
        console.warn(`Chunk ${i + 1} JSON malformed. Skipping.`);
        continue;
      }

      // ISSUE 2 FIX: Flatten nested qualityDimensions {score, reason} → flat {key: score}
      // so callers (qualityNormalizer.js) get a plain numeric map
      if (
        parsed.qualityDimensions &&
        typeof parsed.qualityDimensions === "object"
      ) {
        const flat = {};
        for (const [key, val] of Object.entries(parsed.qualityDimensions)) {
          flat[key] =
            typeof val === "object" && val !== null
              ? Number(val.score ?? 50)
              : Number(val ?? 50);
        }
        parsed.qualityDimensions = flat;
      }

      chunkResults.push(parsed);

      // Task 3: Call the progress callback after each successful chunk
      if (typeof onChunkDone === "function") onChunkDone(i + 1, chunks.length);
    }

    if (chunkResults.length === 0) {
      throw new Error("All chunks failed to produce a valid AI response");
    }

    const totalChars = safeInput.length;
    const processedChars = chunkResults.length * MAX_CHUNK_CHARS;
    const coveragePct = Math.min(
      100,
      Math.round((processedChars / totalChars) * 100),
    );
    console.log(
      `AI RESULT: analyzed ${chunkResults.length} of ${chunks.length} chunk(s) (~${coveragePct}% of input)`,
    );

    const merged = mergeChunkResults(chunkResults);
    merged.__chunkCoverage = {
      chunksProcessed: chunkResults.length,
      totalChunks: chunks.length,
      coveragePct,
    };

    console.log(" AI RESULT RECEIVED");
    return merged;
  } catch (err) {
    console.error(" Groq AI failed:", err.message);
    throw err;
  }
}
