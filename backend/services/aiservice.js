import Groq from "groq-sdk";

// ✅ Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

//  HARD SAFETY LIMIT (prevents 413)
const MAX_INPUT_CHARS = 12000; // safe for 6k TPM
const MAX_OUTPUT_TOKENS = 1200;

// 
// Trim Input If Too Large
// 
function safeTrimInput(input) {
  const stringified = JSON.stringify(input);

  if (stringified.length > MAX_INPUT_CHARS) {
    console.log("⚠️ Input too large. Trimming...");
    return stringified.slice(0, MAX_INPUT_CHARS);
  }

  return stringified;
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
    if ((err.status === 413 || err.status === 429) && retries > 0) {
      console.log(" Rate limit hit. Retrying in 20s...");
      await new Promise((r) => setTimeout(r, 20000));
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

  //  SAFE INPUT
  const safeInput = safeTrimInput(codeSnippets);

  const prompt = `
You are a senior software engineer and technical interviewer with 10+ years of experience.

Analyze the following GitHub repository codebase holistically.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON

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
}
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
]
  "redFlags": string[],

  "recentIssues": [
    { "title": string, "file": string, "severity": "high" | "medium" | "low" }
  ],

  "moduleComplexity": {
    "Auth": { "score": number, "issues": string[], "suggestions": string[] },
    "API": { "score": number, "issues": string[], "suggestions": string[] },
    "UI": { "score": number, "issues": string[], "suggestions": string[] },
    "Database": { "score": number, "issues": string[], "suggestions": string[] }
  },

  "skillSummary": string,
  "overallVerdict": string
  "achievements": [
  {
    "title": string,
    "description": string,
    "reason": string
   }
    ],

"growthRecommendations": [
  {
    "title": string,
    "action": string
  }
],

"debtForecast": {
    "currentDebtScore": number,
    "riskLevel": "Low" | "Moderate" | "High",
    "projectedRiskIncrease": number,
    "estimatedRefactorHours": number,
    "maintainabilityDeclineProbability": "Low" | "Medium" | "High",
    "aiInsight": string
  }


IMPORTANT:
- achievements MUST contain at least 3 items
- growthRecommendations MUST contain at least 3 items
- recentIssues MUST contain at least 1 item
- bestPractices MUST contain at least 3 items
- redFlags MUST contain at least 1 item
- moduleComplexity must analyze Auth, API, UI, Database
- Assign realistic complexity scores (0-100)
- debtForecast must be logically derived from maintainability, complexity, testing and security quality
- aiInsight must be 2-3 professional sentences explaining future maintainability risk


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
${JSON.stringify(codeSnippets)}
`;

  try {
    const completion = await safeGroqCall([
      {
        role: "system",
        content: "You only respond with strict valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    //  SAFE PARSE
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error(" Invalid JSON from AI");
      throw new Error("AI returned malformed JSON");
    }

    console.log(" AI RESULT RECEIVED");

    return parsed;
  } catch (err) {
    console.error(" Groq AI failed:", err.message);
    throw err;
  }
}