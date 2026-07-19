import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load dotenv referencing the absolute path of .env FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Override model to use the smaller llama-3.1-8b-instant model to bypass 100k daily TPD limits on llama-3.3-70b
process.env.GROQ_MODEL = "llama-3.1-8b-instant";

const repos = [
  { owner: "tj", repo: "node-cookie-signature", name: "node-cookie-signature" },
  { owner: "remix-run", repo: "history", name: "remix-run/history" },
  { owner: "koajs", repo: "koa", name: "koajs/koa" },
];

async function run() {
  console.log("=== RUNNING EVALUATION ON TEST REPOS ===");
  console.log("GROQ_API_KEY present:", !!process.env.GROQ_API_KEY);
  console.log("GITHUB_TOKEN present:", !!process.env.GITHUB_TOKEN);
  console.log("Using model override:", process.env.GROQ_MODEL);

  // Dynamic import the services AFTER the environment is loaded
  const { parseFiles } = await import("../services/githubservice.js");
  const { aiEvaluate } = await import("../services/aiservice.js");

  for (const item of repos) {
    console.log(`\n\n>>> Analyzing ${item.owner}/${item.repo}...`);
    try {
      const codeFiles = await parseFiles(
        item.owner,
        item.repo,
        process.env.GITHUB_TOKEN,
      );
      console.log(`Found ${codeFiles.length} files.`);
      if (codeFiles.length === 0) {
        console.warn(`No files found for ${item.owner}/${item.repo}`);
        continue;
      }

      const safeCodeFiles = codeFiles.slice(0, 20);
      const result = await aiEvaluate(safeCodeFiles);
      console.log(`\nMetrics for ${item.name}:`);
      console.log(JSON.stringify(result.qualityDimensions, null, 2));
    } catch (err) {
      console.error(`Error analyzing ${item.name}:`, err);
    }
  }
}

run().catch(console.error);
