# CodeLens AI

**AI-powered code analysis and developer skill profiling for any GitHub repository.**

CodeLens AI analyzes a repository's actual source code — not commit counts, not self-reported skills — and turns it into a quality score, security flags, and an evidence-based developer skill breakdown.

[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg?style=flat-square)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Neon-orange.svg?style=flat-square)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/orm-Prisma-purple.svg?style=flat-square)](https://www.prisma.io/)
[![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.3-violet.svg?style=flat-square)](https://groq.com/)

---

## The Problem

**Code review tools miss the "why."** Traditional linters and static analyzers (ESLint, SonarQube) catch syntax issues and known patterns, but they can't reason about _why_ a design choice was made or whether an architecture actually holds together — they check rules, not intent.

**Developer skill evaluation is broken.** Resumes are self-reported. Live coding interviews measure performance under artificial pressure, not how someone actually writes and structures code day-to-day. There's no easy way to look at a real codebase and get an honest read on someone's actual skills.

**Existing "AI code review" tools are a black box.** Most give you a confident-sounding score with no way to check what it's based on — you can't tell if it analyzed your whole repo or a fraction of it, or whether a low score reflects a real problem or a hallucination.

## The Solution

CodeLens AI combines LLM-based reasoning (which understands intent and architecture, not just syntax) with a skill-profiling layer that scores actual repository code instead of self-reported claims — and makes every score traceable back to what was analyzed and why.

|                                       | Rule-based linters | Traditional static analysis | CodeLens AI |
| ------------------------------------- | ------------------ | --------------------------- | ----------- |
| Understands intent/architecture       | ❌                 | Partial                     | ✅          |
| Developer skill profiling             | ❌                 | ❌                          | ✅          |
| Shows what was actually analyzed      | ❌                 | ❌                          | ✅          |
| Evidence per score, not just a number | ❌                 | ❌                          | ✅          |

---

## What it does

1. **Paste a GitHub repo URL** → CodeLens fetches the source and runs it through an LLM-based analysis pipeline
2. **Get a quality score** across 6 dimensions (readability, maintainability, security, performance, reliability, documentation) — each with a cited reason, not just a number
3. **Get a skill breakdown** — Backend, Frontend, Database, DevOps/Infra, Testing, Security — scored only where evidence exists in the code. Categories with no evidence show **N/A**, not a misleading zero
4. **See what was actually analyzed** — every result shows exactly how much of the repo's code was covered, and what data was and wasn't used

## Why it's different

Most AI code review tools give you a single confident-sounding score with no way to check its work. CodeLens is built around the opposite idea:

- **Transparent scoring.** Every score comes with a plain-language "how was this calculated?" breakdown — what was analyzed, what wasn't, and how much of the repo was covered.
- **Honest about gaps.** If a repo has no tests, "Testing" shows N/A, not a fabricated low score. If analysis only covered part of a large repo, that's shown explicitly.
- **Evidence over vibes.** Every quality dimension is scored independently against specific code evidence — not a single number copy-pasted six times.

## Tech Stack

| Layer    | Tech                             |
| -------- | -------------------------------- |
| Frontend | Astro + React, Tailwind CSS      |
| Backend  | Node.js, Express                 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| AI       | Groq (Llama 3.3 70B)             |
| Auth     | GitHub OAuth                     |

## How it works

```
GitHub Repo → Fetch source files → Chunk & analyze via LLM →
Validate & normalize output → Store in Postgres → Render dashboard
```

Large repositories are split into chunks and analyzed sequentially so results aren't based on a truncated slice of the code — the dashboard shows exactly what % of the repo was covered.

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (or a Neon DB connection string)
- A [Groq API key](https://console.groq.com)
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))

### Setup

**1. Clone and install**

```bash
git clone https://github.com/KartikGS1211/CodeLens_platform.git
cd CodeLens_platform
```

**2. Backend `.env`** (in `backend/`)

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"
GROQ_API_KEY="gsk_your_key_here"
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
GITHUB_CALLBACK_URL="http://localhost:5000/api/auth/github/callback"
SESSION_SECRET="a-random-secret-string"
FRONTEND_URL="http://localhost:4321"
```

**3. Frontend `.env`** (in `frontend/`)

```env
PUBLIC_BACKEND_URL="http://localhost:5000"
```

**4. Run migrations and start**

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev        # runs on :5000

# in a separate terminal
cd frontend
npm install
npm run dev         # runs on :4321
```

## Roadmap

- [ ] Benchmark accuracy report against real repositories
- [ ] GitHub webhook support for auto re-analysis on push
- [ ] Inline PR review comments
- [ ] Multi-repo / organization-level dashboards

## License

ISC License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome — fork, branch, and open a PR. For significant changes to the analysis pipeline, open an issue first to discuss the approach.
