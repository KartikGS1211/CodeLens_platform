import axios from "axios";

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN not set – GitHub API rate limits will apply");
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? `token ${process.env.GITHUB_TOKEN}`
      : undefined,
    Accept: "application/vnd.github+json",
  },
});

/**
 * Parse GitHub repo URL
 */
export function parseRepoUrl(repoUrl) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

  if (!match) {
    throw new Error("Invalid GitHub repo URL");
  }

  return {
    owner: match[1],
    repo: match[2].replace(".git", ""),
  };
}

/**
 * Fetch repository metadata
 */
export async function fetchRepoData(owner, repo) {
  try {
    console.log("Fetching repo:", owner, repo);

    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`);
    const langRes = await githubClient.get(`/repos/${owner}/${repo}/languages`);

    // Commit count (best-effort, safe)
    let commitCount = 0;
    try {
      const commitsRes = await githubClient.get(
        `/repos/${owner}/${repo}/commits?per_page=1`,
      );
      const link = commitsRes.headers.link;

      if (link) {
        const match = link.match(/page=(\d+)>; rel="last"/);
        commitCount = match ? Number(match[1]) : commitsRes.data.length;
      } else {
        commitCount = commitsRes.data.length;
      }
    } catch {
      console.warn("Commit count fetch failed");
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
    console.log("Parsing files for:", owner, repo);

    //  Get default branch dynamically
    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`);
    const branch = repoRes.data.default_branch;

    console.log("Default branch:", branch);

    //  Get latest commit SHA of that branch
    const refRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    );

    const commitSha = refRes.data.object.sha;

    console.log("Commit SHA:", commitSha);

    //  Fetch repo tree using SHA (IMPORTANT)
    const treeRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
    );

    const tree = treeRes.data.tree || [];

    console.log("Tree files count:", tree.length);


    if (tree.length === 0) {
      console.warn(" Repo tree empty");
      return [];
    }

    //  Select meaningful files only
    const importantFiles = tree
      .filter(
        (file) =>
          file.type === "blob" &&
          (
            //  Frontend 
            file.path.endsWith(".js") ||
            file.path.endsWith(".jsx") ||
            file.path.endsWith(".ts") ||
            file.path.endsWith(".tsx") ||
            file.path.endsWith(".html") ||
            file.path.endsWith(".htm") ||
            file.path.endsWith(".css") ||
            file.path.endsWith(".scss") ||
            file.path.endsWith(".sass") ||
            file.path.endsWith(".less") ||
            file.path.endsWith(".vue") ||
            file.path.endsWith(".svelte") ||

            //  Backend 
            file.path.endsWith(".py") ||
            file.path.endsWith(".java") ||
            file.path.endsWith(".go") ||
            file.path.endsWith(".cs") ||
            file.path.endsWith(".cpp") ||
            file.path.endsWith(".c") ||
            file.path.endsWith(".php") ||
            file.path.endsWith(".rb") ||
            file.path.endsWith(".rs") ||
            file.path.endsWith(".kt") ||
            file.path.endsWith(".swift") ||
            file.path.endsWith(".scala")
          )
      )
      .slice(0, 10); // ⬅ limit AI cost
    console.log("Important files found:", importantFiles.length);

    const codeSnippets = [];

    for (const file of importantFiles) {
      try {
        const fileRes = await githubClient.get(
          `/repos/${owner}/${repo}/contents/${file.path}`,
        );

        if (!fileRes.data?.content) continue;

        const decoded = Buffer.from(fileRes.data.content, "base64").toString(
          "utf-8",
        );

        codeSnippets.push({
          path: file.path,
          content: decoded.slice(0, 4000),
        });
      } catch {
        console.warn(`Skipped file: ${file.path}`);
      }
    }

    return codeSnippets;
  } catch (err) {
    console.error(" parseFiles failed:", err.message);
    return []; // NEVER throw
  }
}
