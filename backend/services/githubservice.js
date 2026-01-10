import axios from 'axios';

const github = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
});

export async function fetchRepoData(owner, repo) {
    const repoRes = await github.get(`/repos/${owner}/${repo}`);
    const commitsRes = await github.get(`/repos/${owner}/${repo}/commits`);
    const languagesRes = await github.get(`/repos/${owner}/${repo}/languages`);
    const tressRes = await github.get(
        `/repos/${owner}/${repo}/git/trees/main?recursive=1`);
    return {
        name: repoRes.data.name,
        commits: commitsRes.data.length,
        language: Object.keys(languagesRes.data),
        files: treeRes.data.tree.filter(f => f.type === 'blob').length,
        tree: treeRes.data.tree,    
    };
}