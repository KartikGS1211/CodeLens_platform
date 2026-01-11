import axios from "axios";

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN not set – GitHub API rate limits will apply");
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
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
  const repoRes = await githubClient.get(`/repos/${owner}/${repo}`);
  const langRes = await githubClient.get(`/repos/${owner}/${repo}/languages`);

  // Commit count (best-effort)
  const commitsRes = await githubClient.get(
    `/repos/${owner}/${repo}/commits?per_page=1`
  );

  const commitMatch =
    commitsRes.headers.link?.match(/page=(\d+)>; rel="last"/);

  const commitCount = commitMatch ? Number(commitMatch[1]) : 1;

  return {
    name: repoRes.data.name,
    languages: Object.keys(langRes.data),
    commits: commitCount,
    files: repoRes.data.open_issues_count ?? 0, // safer metric
  };
}

/**
 * Parse important code files
 */
export async function parseFiles(owner, repo) {
  let treeRes;

  try {
    treeRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/main?recursive=1`
    );
  } catch {
    treeRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/master?recursive=1`
    );
  }

  const tree = treeRes.data.tree || [];

  const importantFiles = tree
    .filter(
      (file) =>
        file.type === "blob" &&
        (
        file.path.endsWith(".js") ||
        file.path.endsWith(".jsx") ||
        file.path.endsWith(".ts") ||
        file.path.endsWith(".tsx") ||
        file.path.endsWith(".py") ||     // ✅ Python
        file.path.endsWith(".cs") ||     // ✅ C#
        file.path.endsWith(".cpp") ||    // ✅ C++
        file.path.endsWith(".c") ||
        file.path.endsWith(".h") ||
        file.path.endsWith(".java") ||   // ✅ Java
        file.path.endsWith(".go")        // ✅ Go
        )
    )
    .slice(0, 5);

  const codeSnippets = [];

  for (const file of importantFiles) {
    try {
      const fileRes = await githubClient.get(
        `/repos/${owner}/${repo}/contents/${file.path}`
      );

      const decoded = Buffer.from(
        fileRes.data.content,
        "base64"
      ).toString("utf-8");

      codeSnippets.push({
        path: file.path,              // ✅ FIXED
        content: decoded.slice(0, 3000), // ✅ FIXED
      });
    } catch {
      console.warn(`⚠️ Skipped file: ${file.path}`);
    }
  }

  return codeSnippets;
}
