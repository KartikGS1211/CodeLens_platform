import Groq from "groq-sdk";

// ✅ Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Evaluate code using Groq LLM
 * 1. Try Groq
 * 2. If Groq fails → fallback
 */
export async function aiEvaluate(codeSnippets) {
  const prompt = `
You are a senior software engineer and technical interviewer with 10+ years of experience.

Analyze the following GitHub repository codebase holistically.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON

Return EXACTLY this structure:

{
  "stackSkills": {
    "react": number,
    "typescript": number,
    "node": number,
    "testing": number,
    "devops": number,
    "security": number
  },
  "architecture": {
    "pattern": string,
    "scalability": string,
    "separationOfConcerns": string
  },
  "review": {
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[]
  },
  "bestPractices": string[],
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

IMPORTANT:
- achievements MUST contain at least 3 items
- growthRecommendations MUST contain at least 3 items
- Never return empty arrays
}

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



Code snippets:
${JSON.stringify(codeSnippets)}
`;

  try {
    console.log("🤖 Starting Groq AI repository analysis...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ WORKING
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON-only responder. Never add extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }
    const aiResult = JSON.parse(content);

    //     // 1️⃣ Quality Dimensions
    //     const qualityDimensions = {
    //       readability: aiResult.codeQuality?.readability ?? 0,
    //       maintainability: aiResult.codeQuality?.maintainability ?? 0,
    //       security: aiResult.codeQuality?.security ?? 0,
    //       performance: aiResult.codeQuality?.performance ?? 0,
    //       reliability: aiResult.codeQuality?.reliability ?? 70,
    //       documentation: aiResult.codeQuality?.documentation ?? 65,
    //     };

    //     // 2️⃣ Overall score
    //     const overallScore = Math.round(
    //       Object.values(qualityDimensions).reduce((a, b) => a + b, 0) /
    //         Object.values(qualityDimensions).length,
    //     );

    //     // 3️⃣ Quality Trend (fake historical)
    //     const qualityTrend = [
    //       { month: "Jan", score: overallScore - 15 },
    //       { month: "Feb", score: overallScore - 10 },
    //       { month: "Mar", score: overallScore - 6 },
    //       { month: "Apr", score: overallScore - 3 },
    //       { month: "May", score: overallScore - 1 },
    //       { month: "Jun", score: overallScore },
    //     ];

    //     // 4️⃣ Module Complexity (convert object → array)
    //     const moduleComplexity = Object.entries(
    //       aiResult.moduleComplexity || {},
    //     ).map(([module, data]) => ({
    //       module,
    //       complexity: data.score,
    //     }));

    //     console.log("AI RESULT:", aiResult);

    //     //  Convert to Radar format automatically
    //     const skillsRadar = [
    //       { skill: "Readability", level: aiResult.codeQuality.readability },
    //       { skill: "Maintainability", level: aiResult.codeQuality.maintainability },
    //       { skill: "Security", level: aiResult.codeQuality.security },
    //       { skill: "Performance", level: aiResult.codeQuality.performance },
    //     ];

    //     const detailedSkills = [
    //       {
    //         name: "Code Readability",
    //         level: aiResult.codeQuality.readability,
    //         category: "Quality",
    //       },
    //       {
    //         name: "Maintainability",
    //         level: aiResult.codeQuality.maintainability,
    //         category: "Architecture",
    //       },
    //       {
    //         name: "Security Practices",
    //         level: aiResult.codeQuality.security,
    //         category: "Security",
    //       },
    //       {
    //         name: "Performance Awareness",
    //         level: aiResult.codeQuality.performance,
    //         category: "Performance",
    //       },
    //     ];

    //     return {
    //       ...aiResult,
    //       qualityDimensions,
    //       qualityTrend,
    //       moduleComplexity,
    //       recentIssues: aiResult.recentIssues || [],

    //       skillsRadar,
    //       detailedSkills,
    //       __source: "ai",
    //       analyzedAt: new Date().toISOString(),
    //     };
    //   } catch (err) {
    //     console.warn(
    //       "⚠️ Groq AI failed. Falling back to deterministic evaluation.",
    //     );
    //     console.warn(err.message);

    //     return {
    //       codeQuality: {
    //         readability: 7,
    //         maintainability: 7,
    //         security: 6,
    //         performance: 7,
    //       },
    //       architecture: {
    //         pattern: "Layered architecture",
    //         scalability: "Moderate",
    //         separationOfConcerns: "Partially implemented",
    //       },
    //       review: {
    //         strengths: ["Clear folder structure"],
    //         weaknesses: ["Limited tests"],
    //         suggestions: ["Add unit tests"],
    //       },
    //       bestPractices: ["Modular structure"],
    //       redFlags: ["Missing validation"],
    //       skillSummary: "Intermediate full-stack developer",
    //       overallVerdict: "Good foundation, needs production hardening.",
    //       skillsRadar: [
    //         { skill: "Readability", level: 70 },
    //         { skill: "Maintainability", level: 70 },
    //         { skill: "Security", level: 60 },
    //         { skill: "Performance", level: 70 },
    //       ],
    //       detailedSkills: [],
    //       __source: "fallback",
    //       analyzedAt: new Date(),
    console.log("AI RESULT:", aiResult);

    return aiResult; // ✅ ONLY RAW GROQ JSON
  } catch (err) {
    console.error("❌ Groq AI failed:", err.message);
    throw err; // ❌ NO FALLBACK
  }
}
