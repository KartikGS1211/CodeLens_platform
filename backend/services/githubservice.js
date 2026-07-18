import axios from "axios";

if (!process.env.GITHUB_TOKEN) {
  console.warn("⚠️ GITHUB_TOKEN not set – GitHub API rate limits will apply");
}

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 15000,
  headers: {
    Authorization: process.env.GITHUB_TOKEN
      ? process.env.GITHUB_TOKEN.startsWith("ghp_") ||
        process.env.GITHUB_TOKEN.startsWith("github_pat_")
        ? `token ${process.env.GITHUB_TOKEN}`
        : `Bearer ${process.env.GITHUB_TOKEN}`
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

const getHeaders = (token) => {
  const finalToken = token || process.env.GITHUB_TOKEN;
  if (!finalToken) return {};
  const authHeader =
    finalToken.startsWith("ghp_") || finalToken.startsWith("github_pat_")
      ? `token ${finalToken}`
      : `Bearer ${finalToken}`;
  return {
    Authorization: authHeader,
  };
};

/**
 * Fetch repository metadata
 */
export async function fetchRepoData(owner, repo, githubAccessToken) {
  try {
    console.log("Fetching repo:", owner, repo);
    const headers = getHeaders(githubAccessToken);

    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`, {
      headers,
    });
    const langRes = await githubClient.get(
      `/repos/${owner}/${repo}/languages`,
      { headers },
    );

    // Commit count (best-effort, safe)
    let commitCount = 0;
    try {
      const commitsRes = await githubClient.get(
        `/repos/${owner}/${repo}/commits?per_page=1`,
        { headers },
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
export async function parseFiles(owner, repo, githubAccessToken) {
  try {
    console.log("Parsing files for:", owner, repo);
    const headers = getHeaders(githubAccessToken);

    //  Get default branch dynamically
    const repoRes = await githubClient.get(`/repos/${owner}/${repo}`, {
      headers,
    });
    const branch = repoRes.data.default_branch;

    console.log("Default branch:", branch);

    //  Get latest commit SHA of that branch
    const refRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/ref/heads/${branch}`,
      { headers },
    );

    const commitSha = refRes.data.object.sha;

    console.log("Commit SHA:", commitSha);

    //  Fetch repo tree using SHA (IMPORTANT)
    const treeRes = await githubClient.get(
      `/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      { headers },
    );

    const tree = treeRes.data.tree || [];

    console.log("Tree files count:", tree.length);

    if (tree.length === 0) {
      console.warn(" Repo tree empty");
      return [];
    }

    //  Select meaningful files only, then SORT by size descending so the
    //  most substantial files are prioritized within the 10-file cap.
    //  ISSUE 4 FIX: Previously any 10 files were taken in tree order (arbitrary);
    //  now we ensure large/important files aren't silently excluded.
    const MAX_FILES_TO_FETCH = 10;

    const filteredFiles = tree.filter(
      (file) =>
        file.type === "blob" &&
        //  Frontend
        (file.path.endsWith(".js") ||
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
          file.path.endsWith(".scala")),
    );

    // Sort by size descending (largest files first) — prioritize complex/important files
    filteredFiles.sort((a, b) => (b.size || 0) - (a.size || 0));

    const importantFiles = filteredFiles.slice(0, MAX_FILES_TO_FETCH);

    console.log(
      `Important files: fetching ${importantFiles.length} of ${filteredFiles.length} eligible files ` +
        `(${filteredFiles.length > MAX_FILES_TO_FETCH ? `truncated — only top ${MAX_FILES_TO_FETCH} largest files included` : "all included"})`,
    );

    const codeSnippets = [];

    for (const file of importantFiles) {
      try {
        const fileRes = await githubClient.get(
          `/repos/${owner}/${repo}/contents/${file.path}`,
          { headers },
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
