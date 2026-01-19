import axios from "axios";

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN not set – GitHub API rate limits will apply");
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? `Bearer ${process.env.GITHUB_TOKEN}`
      : undefined,
    Accept: "application/vnd.github+json",
  },
});

/**
 * Fetch repository metadata
 */
export async function fetchRepoData(owner, repo) {
  try {
    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`);
    const langRes = await githubClient.get(`/repos/${owner}/${repo}/languages`);

    // Commit count (best-effort, safe)
    let commitCount = 0;
    try {
      const commitsRes = await githubClient.get(
        `/repos/${owner}/${repo}/commits?per_page=1`
      );
      const match =
        commitsRes.headers.link?.match(/page=(\d+)>; rel="last"/);
      commitCount = match ? Number(match[1]) : commitsRes.data.length;
    } catch {
      commitCount = 0;
    }

    return {
      name: repoRes.data.name,
      defaultBranch: repoRes.data.default_branch,
      languages: Object.keys(langRes.data || {}),
      commits: commitCount,
      files: repoRes.data.size ?? 0, // repo size (KB) as safe metric
    };
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error("GitHub API rate limit exceeded");
    }
    throw err;
  }
}

/**
 * Parse important source & config files
 */
export async function parseFiles(owner, repo) {
  try {
    // 1️⃣ Get default branch dynamically
    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`);
    const branch = repoRes.data.default_branch;

    // 2️⃣ Fetch repo tree
    const treeRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    );

    const tree = treeRes.data.tree || [];

    // 3️⃣ Select meaningful files only
    const importantFiles = tree
      .filter(
        (file) =>
          file.type === "blob" &&
          (
            file.path.endsWith(".js") ||
            file.path.endsWith(".jsx") ||
            file.path.endsWith(".ts") ||
            file.path.endsWith(".tsx") ||
            file.path.endsWith(".py") ||
            file.path.endsWith(".java") ||
            file.path.endsWith(".go") ||
            file.path.endsWith(".cs") ||
            file.path.endsWith(".cpp") ||
            file.path.endsWith(".c") ||
            file.path.endsWith(".json") ||
            file.path.endsWith(".yml") ||
            file.path.endsWith(".yaml") ||
            file.path.endsWith("Dockerfile")
          )
      )
      .slice(0, 8); // ⬅ limit AI cost

    const codeSnippets = [];

    for (const file of importantFiles) {
      try {
        const fileRes = await githubClient.get(
          `/repos/${owner}/${repo}/contents/${file.path}`
        );

        if (!fileRes.data?.content) continue;

        const decoded = Buffer.from(
          fileRes.data.content,
          "base64"
        ).toString("utf-8");

        codeSnippets.push({
          path: file.path,
          content: decoded.slice(0, 3500),
        });
      } catch {
        console.warn(`⚠️ Skipped file: ${file.path}`);
      }
    }

    return codeSnippets;
  } catch (err) {
    console.error("❌ parseFiles failed:", err.message);
    return []; // NEVER throw
  }
}
