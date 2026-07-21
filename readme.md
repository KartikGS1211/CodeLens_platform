# CodeLens AI

**AI-powered code analysis and developer skill profiling for any GitHub repository.**

CodeLens AI analyzes a repository's actual source code — not commit counts, not self-reported skills — and turns it into a quality score, security flags, and an evidence-based developer skill breakdown.

[![CI/CD](https://github.com/KartikGS1211/CodeLens_platform/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/KartikGS1211/CodeLens_platform/actions/workflows/ci-cd.yml)
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

## Docker

This project ships production-ready Docker images for both services and a `docker-compose.yml` for local containerised development.

### Architecture note — frontend adapter

The frontend is Astro with `output: "server"` (SSR mode). For Docker builds it uses the **`@astrojs/node` standalone adapter** (`astro.config.docker.mjs`) instead of the Vercel adapter. The build produces a self-contained Node.js HTTP server at `dist/server/entry.mjs`. This means **nginx cannot be used** — nginx only serves static files and has no way to execute server-side rendering logic.

### Local development with docker-compose

**Prerequisites:** Docker Desktop installed and running.

**1. Populate your env files first**

`backend/.env` and `frontend/.env` must exist and be filled in (see [Environment variables](#environment-variables) below). Docker never reads from the host shell — it only reads from those files.

**2. Build and start both services**

```bash
# From the project root
docker compose up --build
```

- Backend API: [http://localhost:5000](http://localhost:5000)
- Frontend: [http://localhost:4321](http://localhost:4321)

**3. On first run (or after schema changes)**

`prisma migrate deploy` runs automatically as part of the backend container's startup command before `node server.js`. No manual step required. If the migration fails, the server will not start (fail-fast by design).

**4. Subsequent runs (no code changes)**

```bash
docker compose up        # skips rebuild, uses cached images
docker compose down      # stop and remove containers
```

### Environment variables

> **Never hardcode secrets in `docker-compose.yml`.** All secrets are injected via `env_file` at runtime and are excluded from Docker images by `.dockerignore`.

#### `backend/.env`

| Variable               | Description                                                                |
| ---------------------- | -------------------------------------------------------------------------- |
| `PORT`                 | Port the backend listens on (default `5000`)                               |
| `DATABASE_URL`         | Neon PostgreSQL connection string (`postgresql://...?sslmode=require`)     |
| `GROQ_API_KEY`         | Groq API key for LLM analysis                                              |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App client ID                                                 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret                                             |
| `GITHUB_CALLBACK_URL`  | OAuth callback URL (e.g. `http://localhost:5000/api/auth/github/callback`) |
| `SESSION_SECRET`       | Secret string for express-session cookie signing                           |
| `FRONTEND_URL`         | URL of the frontend (used for CORS and OAuth redirects)                    |

#### `frontend/.env`

| Variable             | Description                                                                                                                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_BACKEND_URL` | **Browser-facing** backend URL. Must be host-reachable (`http://localhost:5000` locally). Do **not** use the internal Docker hostname (`http://backend:5000`) — the browser cannot resolve it. |

## Deployment

Deployment is managed by GitHub Actions (`.github/workflows/ci-cd.yml`). The pipeline runs full CI on every push and PR. The deploy step only triggers after **both** CI jobs pass on a push to `main`, and it safely skips (exit 0, green ✓) if the Render secrets haven't been configured yet.

### Step 1 — Create two Render Web Services

Go to [render.com](https://render.com) → **New → Web Service** → connect the `KartikGS1211/CodeLens_platform` GitHub repo.

Create **two separate services** — one for the backend and one for the frontend:

| Setting              | Backend service      | Frontend service      |
| -------------------- | -------------------- | --------------------- |
| Environment          | Docker               | Docker                |
| Dockerfile path      | `backend/Dockerfile` | `frontend/Dockerfile` |
| Build context / root | `backend/`           | `frontend/`           |

Set these **Environment Variables** in Render's dashboard for each service. **Never bake secrets into Docker images.**

**Backend service — required env vars:**

| Variable               | Value / Description                                                               |
| ---------------------- | --------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Neon PostgreSQL connection string (`postgresql://...?sslmode=require`)            |
| `GROQ_API_KEY`         | Groq API key for LLM analysis (starts with `gsk_`)                                |
| `GITHUB_CLIENT_ID`     | GitHub OAuth App client ID                                                        |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret                                                    |
| `GITHUB_CALLBACK_URL`  | `https://<your-backend-render-url>/api/auth/github/callback`                      |
| `SESSION_SECRET`       | A long random string for express-session cookie signing                           |
| `FRONTEND_URL`         | `https://<your-frontend-render-url>` (used for CORS + OAuth redirect after login) |
| `NODE_ENV`             | `production`                                                                      |
| `PORT`                 | `5000` (or leave unset — Render injects its own port via `$PORT`)                 |

**Frontend service — required env vars:**

| Variable             | Value / Description                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `PUBLIC_BACKEND_URL` | `https://<your-backend-render-url>` — must be the **public** URL, not the internal Docker host |

### Step 2 — Add Deploy Hooks as GitHub Secrets

Once each Render service is live:

1. In Render: go to the service → **Settings → Deploy Hook** → copy the URL
2. In GitHub: go to the repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets:

| GitHub Secret Name                | Value                                        |
| --------------------------------- | -------------------------------------------- |
| `RENDER_DEPLOY_HOOK_URL`          | Deploy hook URL for the **backend** service  |
| `RENDER_FRONTEND_DEPLOY_HOOK_URL` | Deploy hook URL for the **frontend** service |

### Step 3 — Turn Off Render Auto-Deploy

On **each** Render service, go to **Settings → Build & Deploy** and set **Auto-Deploy** to **No**.
This ensures GitHub Actions is the single source of truth for deployments — Render will only deploy when the pipeline explicitly triggers it via the deploy hook, never on its own.

### Step 4 — Update GitHub OAuth App

In your [GitHub OAuth App settings](https://github.com/settings/developers), add the production callback URL:

```
https://<your-backend-render-url>/api/auth/github/callback
```

> **Until these secrets are added:** every push still runs the full CI pipeline (install → Prisma generate → lint check → test check → Astro build → Docker image builds for both services). Only the final deploy trigger step is skipped — cleanly, with exit code 0. The workflow run shows green. Nothing breaks.

---

## Roadmap

- [ ] Benchmark accuracy report against real repositories
- [ ] GitHub webhook support for auto re-analysis on push
- [ ] Inline PR review comments
- [ ] Multi-repo / organization-level dashboards

## License

ISC License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions welcome — fork, branch, and open a PR. For significant changes to the analysis pipeline, open an issue first to discuss the approach.
