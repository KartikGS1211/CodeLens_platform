import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 🔹 Fallback object (WITH EXPLICIT MARKER)
const FALLBACK = {
  __source: "fallback", // ⭐ IMPORTANT
  codeQuality: {
    readability: 7,
    maintainability: 7,
    security: 7,
    performance: 7,
  },
  review: {
    strengths: ["Clean project structure"],
    weaknesses: ["Limited automated test coverage"],
    suggestions: ["Add unit tests", "Improve error handling"],
  },
  bestPractices: [
    "Modular architecture",
    "Reusable components",
    "Environment-based configuration",
  ],
  skillSummary: "Intermediate developer",
};

export async function aiEvaluate(codeSnippets) {
  const limitedSnippets = codeSnippets
    .slice(0, 5)
    .map(file => ({
      path: file.path,
      content: file.content.slice(0, 3000),
    }));

  const prompt = `
You are a senior software engineer.

Analyze the following GitHub repository code snippets.
Return ONLY valid JSON in this exact structure:

{
  "codeQuality": {
    "readability": number,
    "maintainability": number,
    "security": number,
    "performance": number
  },
  "review": {
    "strengths": string[],
    "weaknesses": string[],
    "suggestions": string[]
  },
  "bestPractices": string[],
  "skillSummary": string
}

Code snippets:
${JSON.stringify(limitedSnippets)}
`;

  try {
    console.log("⚡ Trying Groq evaluation...");

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are a strict JSON-only responder.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices?.[0]?.message?.content;
    if (!text) throw new Error("No AI output");

    const aiResult = JSON.parse(text);

    // ⭐ Mark as AI explicitly
    return {
      __source: "ai",
      ...aiResult,
    };
  } catch (err) {
    console.warn("⚠️ Groq failed, using fallback:", err.message);
    return FALLBACK;
  }
}
