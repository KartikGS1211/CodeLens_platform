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
The input may include multiple files, folders, and mixed frontend/backend code.

Evaluate the project as if it were submitted for a real-world production system.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations outside JSON
- All numeric scores must be integers from 1 to 10

Return the response in EXACTLY this structure:

{
  "codeQuality": {
    "readability": number,
    "maintainability": number,
    "security": number,
    "performance": number
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
  "skillSummary": string,
  "overallVerdict": string
}

Focus on:
- Project structure and modularity
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
        { role: "system",
          content: "You are a strict JSON-only responder. Never add extra text." },
        { 
          role: "user", 
          content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }
    const aiResult = JSON.parse(content);

    return {
      ...aiResult,
      __source: "ai", // 🔴 IMPORTANT
      analyzedAt: new Date().toISOString(),
    };

  } catch (err) {
    console.warn("⚠️ Groq AI failed. Falling back to deterministic evaluation.");
    console.warn(err.message);

    return {
      codeQuality: {
        readability: 7,
        maintainability: 7,
        security: 6,
        performance: 7,
      },
      architecture: {
        pattern: "Layered / MVC-style structure",
        scalability: "Moderate, requires refactoring for large scale",
        separationOfConcerns: "Partially implemented"
      },
      review: {
        strengths: [
          "Clear folder structure",
          "Readable and consistent code style"
        ],
        weaknesses: [
          "Limited automated tests",
          "Basic error handling"
        ],
        suggestions: [
          "Add unit and integration tests",
          "Improve validation and centralized error handling",
          "Introduce logging and monitoring"
        ],
      },
      bestPractices: [
        "Environment-based configuration",
        "Modular code organization"
      ],
      redFlags: [
        "No test coverage",
        "Potential missing input validation"
      ],
      skillSummary: "Intermediate full-stack developer",
      overallVerdict:
        "Solid project foundation with good structure, but needs production hardening before scaling.",
      __source: "fallback",
      analyzedAt: new Date().toISOString(),
    };
  }
}
