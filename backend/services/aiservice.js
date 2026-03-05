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
export async function aiEvaluate(codeSnippets) {
  console.log(" Starting Groq AI repository analysis...");

  try {
    // Safe Input
    let safeInput = safeTrimInput(codeSnippets);

    // Use MAX_CHUNK_CHARS properly
    function chunkInput(input, chunkSize) {
      const chunks = [];
      for (let i = 0; i < input.length; i += chunkSize) {
        chunks.push(input.slice(i, i + chunkSize));
      }
      return chunks;
    }

    const chunks = chunkInput(safeInput, MAX_CHUNK_CHARS);

    // For now, use first chunk only (future: multi-pass)
    safeInput = chunks[0];

    const basePrompt = `
You are a senior software engineer and technical interviewer with 10+ years of experience.

Analyze the following GitHub repository codebase holistically.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- Confidence scores must be between 0-100

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
      "category": "security" | "performance" | "maintainability" | "error-handling" | "architecture" | 
                  "code-quality" | "best-practice" | "scalability" | "testing",
      "currentCode": string,
      "suggestedCode": string,

      "fixType": "replace" | "insert" | "delete",
  
      "confidence": number,  
      "impactScore": number, 
    }
  ],

  "moduleComplexity": {
    "Auth": { "score": number, "issues": string[], "suggestions": string[] },
    "API": { "score": number, "issues": string[], "suggestions": string[] },
    "UI": { "score": number, "issues": string[], "suggestions": string[] },
    "Database": { "score": number, "issues": string[], "suggestions": string[] }
  },

  "skillSummary": string,
  "overallVerdict": string,
  "achievements": [
  {
    "title": string,
    "description": string,
    "reason": string,
   }
    ],

"growthRecommendations": [
  {
    "title": string,
    "action": string,
  }
],

"debtForecast": {
    "currentDebtScore": number,
    "riskLevel": "Low" | "Moderate" | "High",
    "projectedRiskIncrease": number,
    "estimatedRefactorHours": number,
    "maintainabilityDeclineProbability": "Low" | "Medium" | "High",
    "aiInsight": string,
  },


IMPORTANT:
- achievements MUST contain at least 3 items
- growthRecommendations MUST contain at least 3 items
- recentIssues MUST contain at least 3 items if problems exist.

Rules for recentIssues:
- Detect multiple distinct issues across different files
- Do NOT return only one issue unless repository is nearly perfect
- Use different categories when applicable
- At least one issue must be categorized as "security" or "performance" if such problems exist
- Do not repeat identical issue types
- Each issue must target a specific file and line


- bestPractices MUST contain at least 3 items
- redFlags MUST contain at least 2 item
- moduleComplexity must analyze Auth, API, UI, Database
- Assign realistic complexity scores (0-100)
- debtForecast must be logically derived from maintainability, complexity, testing and security quality
- aiInsight must be 2-3 professional sentences explaining future maintainability risk
- 

Focus on:
- Project structure and modularity
- Analyze each major module (Auth, API, UI, Database)
- Assign complexity score 0-100
- Provide issues and improvement suggestions per module
- Async patterns and error handling
- API and database interaction safety
- Performance bottlenecks
- Security vulnerabilities
- Scalability and maintainability
- Future technical debt growth probability



Code snippets:
`;

    let finalPrompt = basePrompt + safeInput;

    //  Step 3: Final Token Safety Check
    if (estimateTokens(finalPrompt) > MAX_PROMPT_TOKENS) {
      console.log(" Token overflow risk. Shrinking input...");
      safeInput = safeInput.slice(0, 12000);
      finalPrompt = basePrompt + safeInput;
    }

    // Call Groq
    const completion = await safeGroqCall([
      {
        role: "system",
        content: `
You are a strict senior software architect and static code analysis engine similar to SonarQube and Snyk.

Be highly critical.
Assume production-grade standards.
Do not be lenient.
Detect architectural, performance, security, scalability and maintainability risks.
If multiple issues exist in the same file, list them separately.
Only respond with strict valid JSON.
`,
      },
      {
        role: "user",
        content: finalPrompt,
      },
    ]);

    let content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    content = cleanAIResponse(content);

    // Step 1: Extract JSON block
    const extracted = extractJSONObject(content);

    if (!extracted) {
      console.error("No JSON object found in AI response");
      throw new Error("AI did not return JSON");
    }

    // Step 2: Try normal parse
    let parsed = tryParseJSON(extracted);

    if (!parsed) {
      console.log("Attempting minor JSON repair...");

      // Remove trailing commas
      const repaired = extracted.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

      parsed = tryParseJSON(repaired);
    }

    if (!parsed) {
      console.error("Still invalid JSON:\n", content);
      throw new Error("AI returned malformed JSON");
    }

    console.log(" AI RESULT RECEIVED");

    return parsed;
  } catch (err) {
    console.error(" Groq AI failed:", err.message);
    throw err;
  }
}
