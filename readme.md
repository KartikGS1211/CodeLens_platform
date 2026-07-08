# CodeLens AI

### Enterprise-Grade Developer Intelligence & Engineering Risk Analysis Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](https://github.com/KartikGS1211/CodeLens_platform)
[![License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat-square)](https://github.com/KartikGS1211/CodeLens_platform)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg?style=flat-square)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%7C%20Neon-orange.svg?style=flat-square)](https://neon.tech/)
[![ORM](https://img.shields.io/badge/orm-Prisma-purple.svg?style=flat-square)](https://www.prisma.io/)
[![Groq LLM](https://img.shields.io/badge/AI-Groq%20Llama%203.3-violet.svg?style=flat-square)](https://groq.com/)
[![Frontend](https://img.shields.io/badge/frontend-Astro%20%2B%20React-cyan.svg?style=flat-square)](https://astro.build/)

CodeLens AI is a full-stack, enterprise-grade engineering intelligence platform that ingests raw source code from GitHub repositories, performs contextual structural analysis using advanced Large Language Models, and transforms unstructured codebases into highly structured, actionable developer analytics.

By bridging the gap between rule-based static analysis and intelligent LLM-driven reasoning, CodeLens AI provides team leaders, engineering recruiters, and architects with dynamic feedback regarding code quality, design patterns, developer skills, security risks, and technical debt trajectories.

---

## The Problem Statement

Modern engineering organizations and recruitment teams face structural inefficiencies caused by the limitations of current evaluation frameworks:

1. **Rule-Based Static Analysis Limitations**: Traditional static analysis tools operate strictly on deterministic AST (Abstract Syntax Tree) patterns and rule sets. While they excel at detecting low-level syntax issues, they cannot understand intent, determine if architectural patterns are applied consistently, evaluate the modularity of clean code execution, or identify logical vulnerabilities.
2. **Resume and Interview Disconnection**: Recruitment processes rely heavily on candidate self-reporting or high-stress, artificial live-coding evaluations. These methodologies fail to measure a developer's real-world contribution style, their architectural decision-making, and their overall code organization quality.
3. **The Unstructured Codebase Gap**: Technical leadership frequently lacks automated, objective methods to scan repositories for macro-level architectural health, technical debt accumulation over time, and module-specific risk distributions.

According to industry assessments, up to **23% of developer resource hours** are spent addressing technical debt, while architectural regressions are caught late in the software development lifecycle (SDLC), increasing refactoring efforts exponentially.

---

## The Solution

CodeLens AI introduces a hybrid context-aware engine that supplements traditional metadata extraction with Deep Semantic Reasoning.

```
[GitHub Repository] ──► [Hybrid Parser Engine] ──► [LLM Contextual Evaluator] ──► [Normalized Analytics Schema]
```

- **Semantic Profiling**: Rather than verifying regex rules, the platform evaluates repository files holistically to map software design compliance (e.g., MVC, Layered Architecture).
- **Structured Knowledge Transmutation**: It converts unstructured code patterns into structured JSON formats, enabling consistent persistence and real-time visualization via analytical dashboards.
- **Bi-Dimensional Skill Intelligence**: It profiles candidates based on actual codebase patterns, mapping language proficiency, structural complexity handlers, and strength/weakness vectors to clear visual metrics.

---

## Key Features

### Repository Diagnostic & Executive Summary

- **Purpose**: Establish immediate high-level visibility into repository architecture and statistics.
- **What it does**: Parses commit history, codebase size, language distribution, and connects metadata with an LLM-generated operational overview.
- **Why it matters**: Enables stakeholders to contextually evaluate project complexity in less than 30 seconds.

### Multi-Dimensional Quality Analysis

- **Purpose**: Evaluate source files across six core engineering dimensions.
- **What it does**: Rates codebase readability, maintainability, security, performance, reliability, and documentation on a normalized scale.
- **Why it matters**: Provides a balanced view of software quality that static rule checkers cannot quantify.

### Deep Code Review & Vulnerability Finder

- **Purpose**: Identify critical security flaws, execution bottlenecks, and anti-patterns.
- **What it does**: pinpoints specific file ranges and line numbers, assigning a severity level, priority weight, suggested fix pattern, and confidence score.
- **Why it matters**: Accelerates code reviews by presenting actionable changes along with impact analyses before merging PRs.

### Developer Capability Profiling

- **Purpose**: Quantify engineering expertise objectively through historical contributions.
- **What it does**: Generates skill radar maps, tracking backend, frontend, database, DevOps, and architectural proficiencies.
- **Why it matters**: Replaces generic technical resumes with evidence-based capabilities based on actual codebases.

### Architecture Pattern Verification

- **Purpose**: Ensure organizational alignment with targeted architectural architectures.
- **What it does**: Evaluates separation of concerns (SoC), modular cohesion, and scalability readiness across different repository modules.
- **Why it matters**: Prevents codebase degradation and keeps developers aligned on architectural guidelines.

### Predictive Technical Debt Forecasting

- **Purpose**: Anticipate future maintenance effort requirements using codebase metrics.
- **What it does**: Estimates refactoring hours (capped at 60 hours), predicts risk escalation, and forecasts decline probabilities.
- **Why it matters**: Helps managers plan sprint cycles by identifying legacy modules that represent critical risks.

---

## AI Intelligence Pipeline

The platform uses a deterministic preprocessing phase coupled with asynchronous model inference to parse code and guarantee structured outputs.

```
       +----------------------------+
       |     GitHub Repository      |
       +--------------+-------------+
                      | Fetch Metadata & File Content
                      v
       +----------------------------+
       |   Repository Processing    | (Cleans, filters, and slices top 20 files)
       +--------------+-------------+
                      | Safe Buffer Context Window
                      v
       +----------------------------+
       |      LLM Chat Engine       | (Groq Llama 3.3 70B Versatile Orchestrer)
                      +--------------+-------------+
                      | Evaluates JSON Output Constraints
                      v
       +----------------------------+
       | Structured JSON Normalizer | (Validates schema types and limits output values)
       +--------------+-------------+
                      | ORM Mapping
                      v
       +----------------------------+
       |  PostgreSQL DB (Neon/Prisma)| (Stores relational analyses and issue lists)
       +--------------+-------------+
                      | Hydrates
                      v
       +----------------------------+
       |    Analytics Dashboard     | (Renders responsive Recharts views)
       +----------------------------+
```

### Stage Description

1. **GitHub Ingestion**: Fetches API metadata (commits, languages, file hierarchies) and parses individual file payloads based on file extensions.
2. **Safe Code Slicing**: Trims files to prioritize core logic, filtering out dependencies, lockfiles, and media formats. CodeLens applies a safety buffer of `MAX_FILES = 20` to prevent LLM token window overflows.
3. **Groq LLM Reasoning**: Submits the sanitized code snippets to the `llama-3.3-70b-versatile` model accompanied by a restrictive system prompt instructing the model to act as a strict code analysis engine.
4. **JSON Normalization**: Cleans the LLM response of any markdown backticks or text output, parses standard JSON structures, and falls back to deterministic analysis metrics if the response is corrupted.
5. **Prisma Persistence**: Maps entities to the PostgreSQL schema, creating relational instances for repositories, parent analyses, and nested code issues.
6. **Dashboard Hydration**: The Astro frontend queries backend endpoints and updates interactive graphs, radar charts, and review logs without manual page refreshes.

---

## System Architecture

The following diagram defines the relationship between the Astro frontend running React components, the Node.js Express backend, Groq API services, the Postgres instance, and Wix user verification layers.

```mermaid
graph TD
    classDef default fill:#0f172a,stroke:#334155,stroke-width:1px,color:#f8fafc;
    classDef accent fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
    classDef database fill:#7c2d12,stroke:#ea580c,stroke-width:1px,color:#ffedd5;
    classDef service fill:#111827,stroke:#9ca3af,stroke-width:1px,color:#f3f4f6;

    subgraph Client ["Client Interface (Astro + React)"]
        UI[Interactive UI Engine]:::accent --> Dashboard[Recharts Analytics Dashboards & Skill Radars]:::accent
        WixAuth[Wix Authentication SDK]:::accent --> UI
    end

    subgraph Backend ["Backend Orchestration Server (Node.js + Express)"]
        API[Express API Routes]:::service --> Pipe[Analysis Orchestrator Pipeline]:::service
        Pipe --> GH[GitHub Service Wrapper]:::service
        Pipe --> Normalizer[Data Normalization Layer]:::service
    end

    subgraph AI ["AI Engine (Groq Stack)"]
        Prompt[Structured System Prompt Engine] --> LLM[Llama-3.3-70b-versatile Model]:::accent
        LLM --> Extraction[JSON Extraction & Sanitization Filter]
    end

    subgraph Storage ["Database Layer"]
        Prisma[Prisma Client ORM]:::database --> Neon[(Neon PostgreSQL Instance)]:::database
    end

    UI <-->|JSON over HTTPS / API Calls| API
    GH <-->|Fetch Content & Meta| GitHub[GitHub API Services]:::service
    Pipe <-->|Contextual Snippets| Prompt
    Extraction --> Normalizer
    Normalizer --> Prisma
```

---

## Tech Stack

### Frontend Architecture

| Technology              | Role                                     | Description                                                                      |
| :---------------------- | :--------------------------------------- | :------------------------------------------------------------------------------- |
| **Astro v5**            | Static Site Generator & Server Framework | Serves as the high-performance core framework rendering pages and server assets. |
| **React**               | Component Rendering Engine               | Powers the reactive UI, modals, interactive panels, and routing.                 |
| **Tailwind CSS**        | Style Utility Engine                     | Implements a sleek, modern visual styling scheme with a responsive layout.       |
| **Framer Motion**       | Micro-Animations & Transitions           | Orchestrates transitions and fluid UI interactions for elements.                 |
| **Recharts / Chart.js** | Graphic Data Visualizations              | Renders multi-dimensional radar charts, line trends, and complexity grids.       |
| **Zustand**             | State Management                         | Manages client-side global authentication states and active analysis sessions.   |

### Backend Service Stack

| Technology            | Role                          | Description                                                             |
| :-------------------- | :---------------------------- | :---------------------------------------------------------------------- |
| **Node.js**           | Runtime Environment           | High-speed server execution core.                                       |
| **Express.js**        | API Framework                 | Implements clean REST routes, validation, and JSON ingestion.           |
| **Prisma ORM**        | Schema Design & Query Builder | Provides database migrations and typed queries.                         |
| **PostgreSQL (Neon)** | Database                      | Multi-tenant host database storing analysis logs, issues, and metadata. |
| **Groq SDK**          | AI Client Connection          | Manages API communication with Groq's high-speed inference engine.      |

### Auxiliary Technologies

| Technology          | Role                              | Description                                                                 |
| :------------------ | :-------------------------------- | :-------------------------------------------------------------------------- |
| **Wix SDK**         | Session & Authentication Provider | Restricts database records based on authenticated Wix member profiles.      |
| **GitHub REST API** | Version Control Integrator        | Pulls target directories, commit count, and code files from external repos. |

---

## Core Capabilities

### 1. Repository Intelligence

Automatically builds an execution inventory. Analyzes file densities, language distributions, and commit frequency. Provides a concise, high-level breakdown of what a codebase contains and how active it is.

### 2. AI Code Review

Traces logical structures to isolate memory leaks, missing error validations, raw database queries, and SQL injection channels. Reviews include:

- **Relative Path Indicators**: Highlights target files and lines.
- **Suggested Diffs**: Provides side-by-side view comparisons of current code and proposed solutions.
- **Detailed Impact Metrics**: Ranks issue severity categories.

### 3. Developer Skill Profiling

Maps codebase patterns directly to concrete disciplines. Identifies if the developer writes robust authentication procedures, styles templates with clean separation of concerns, or queries database tables with clean transactions. Renders profiles on an interactive visual radar.

### 4. Engineering Risk Analysis

Determines security profiles and technical compliance. Flags hardcoded credentials, API key exposures, outdated packages, unchecked exceptions, and deep conditional loops.

### 5. Architectural Quality Matrix

Analyzes system-wide coupling and patterns. Detects if files enforce separation of concerns, if the logic is modular, if functions are clean, and checks overall alignment with production-ready standards.

### 6. Technical Debt Forecasting

Assigns a dynamic technical debt score, calculates the refactoring hours necessary to correct structural degradation, and provides a multi-month risk growth forecast.

### 7. Executive Dashboard

Synthesizes deep technical metrics into readable operational insights for tech leaders and hiring managers.

---

## Engineering Highlights

To offer production-ready performance, the CodeLens AI architecture implements several design compromises and micro-optimizations:

- **Token Window Defense**: Raw repository parsing can quickly exhaust context size limits. The backend applies a deterministic file-selection strategy that ranks files by volume, targeting the top 20 structural files (ignoring `.css`, lockfiles, assets, and third-party modules).
- **Defensive JSON Extraction**: The output parsed from Groq LLMs can occasionally include markdown markers or preamble explanations. A custom parser pipeline cleans the text string and isolates the bounds of the returned JSON object before parsing.
- **Deterministic Fallback Pipeline**: If api limits are reached, the transaction is protected by a fallback engine that fills regional data keys with structured baseline values. This prevents dashboard crashes when rate limiting occurs.
- **Relational Schema Performance**: The database relational design is structured using foreign relations in Prisma that connect issues directly to their parent analysis. This design allows cascade deletes when reanalyzing a updated codebase, keeping query costs low.

---

## Why CodeLens AI is Different

Unlike traditional assessment platforms, CodeLens AI uses contextual reasoners to evaluate repository structures:

| Evaluation Metric              | Rule-Based Linters (ESLint, RuboCop) | Traditional Static Analysis (SonarQube) | GitHub Code Scanning (CodeQL) | CodeLens AI Platform                          |
| :----------------------------- | :----------------------------------- | :-------------------------------------- | :---------------------------- | :-------------------------------------------- |
| **Logic Reasoning**            | Direct syntax checks.                | Pattern signatures.                     | Queries database code graphs. | Contextual semantic reasoning.                |
| **Architectural Insight**      | Unaware.                             | Minor cohesion checks.                  | Unaware of style patterns.    | Verifies design architecture (MVC/Clean).     |
| **Developer Analytics**        | Unaware.                             | Unaware.                                | Unaware.                      | Profiles skill levels and roles page-by-page. |
| **Actionable Suggestions**     | Fixed syntax suggestions.            | General guidelines.                     | Security advisories.          | Compares side-by-side corrected diffs.        |
| **Technical Debt Forecasting** | Unaware.                             | Simple code-smell scores.               | Sec checks.                   | Forecasts refactor hours and risk index.      |
| **Context Integration**        | Single file.                         | Multi-file dependency loops.            | Code query execution.         | Multi-tier file evaluation.                   |

---

## Example Analysis Flow

The following sequence illustrates what occurs from the time a user triggers an evaluation of a repository:

```
[User Interface]                     [Backend Host]                      [Groq Services]                 [Postgre Database]
       |                                   |                                    |                               |
       | 1. Submits GitHub URL & Auth      |                                    |                               |
       |---------------------------------->|                                    |                               |
       |                                   | 2. Fetches codebase files          |                               |
       |                                   |-----------------------------\      |                               |
       |                                   |                             |      |                               |
       |                                   | 3. Sanitizes file snippets  |      |                               |
       |                                   |<----------------------------/      |                               |
       |                                   |                                    |                               |
       |                                   | 4. Submits prompt payload          |                               |
       |                                   |----------------------------------->|                               |
       |                                   |                                    | 5. Executes context check     |
       |                                   |                                    |------------------------\      |
       |                                   |                                    |                        |      |
       |                                   |                                    | 6. Returns raw JSON    |      |
       |                                   |                                    |<-----------------------/      |
       |                                   |<-----------------------------------|                               |
       |                                   |                                    |                               |
       |                                   | 7. Filters & normalizes JSON       |                               |
       |                                   |-----------------------------\      |                               |
       |                                   |                             |      |                               |
       |                                   | 8. Parses schemas & structures |      |                               |
       |                                   |<----------------------------/      |                               |
       |                                   |                                    |                               |
       |                                   | 9. Commits records via Prisma      |                               |
       |                                   |------------------------------------------------------------------->|
       |                                   |                                    |                               | 10. Persists Analysis & Issues
       | 11. Hydrates Recharts graphics    |<-------------------------------------------------------------------|
       |<----------------------------------|                                                                    |
```

---

## Future Roadmap

### Phase 1: Automation & Webhook Integration

- Add GitHub webhook registrations to trigger reanalysis on commits.
- Implement an automated AI review bot that comments direct suggestions directly onto pull request lines.

### Phase 2: Multi-Repository Context & Telemetry

- Implement semantic vector search capability across all connected projects.
- Build organizational dashboards to track structural patterns across multiple microservices.

### Phase 3: Deployment Pipelines & Compliance

- Validate code updates against CI/CD runners before builds complete.
- Provide compliance monitoring mapping source code checks to SOC2 and ISO-27001 requirements.

### Enterprise Roadmap

- Offer self-hosted offline database systems and private network adapters.
- Integrate fine-tuned, localized models trained on company-internal coding architecture documents.

---

## Project Vision

CodeLens AI aims to move beyond simple code scanning to become a complete **Engineering Intelligence Platform**. Our vision is to build a unified platform that connects code quality analysis, developer skill growth, and architectural integrity. As codebases grow, CodeLens AI acts as a central system of intelligence that guides teams toward maintainable code structures, supports developer training, and helps executives manage technical debt.

---

## Repository Structure

The codebase is organized as a clean multi-module project split into backend services and frontend Astro layouts:

```
CodeLens_AI/
├── backend/                       # Node.js API server & business logic
│   ├── controllers/               # Express request and response handlers
│   ├── db/                        # Database client connection instances
│   │   └── prisma.js              # Shared Prisma client wrapper
│   ├── prisma/                    # Relational store configuration specifications
│   │   ├── schema.prisma          # PostgreSQL model design models
│   │   └── migrations/            # SQL migration history log
│   ├── routes/                    # API route definitions
│   ├── services/                  # Business logic engines
│   │   ├── aiservice.js           # Groq API client with context trimming
│   │   ├── githubservice.js       # GitHub API integration & repo parsing
│   │   ├── pipelineservice.js     # Analysis pipeline flow controller
│   │   └── qualityNormalizer.js   # AI analytics output normalizer
│   ├── utils/                     # Backend helper methods & calculations
│   ├── app.js                     # Express app configuration
│   └── server.js                  # API server startup entry point
│
├── frontend/                      # Astro + React client dashboard
│   ├── src/
│   │   ├── components/            # UI components and client views
│   │   │   ├── layout/            # Layout containers (Navbars, Sidebar structures)
│   │   │   ├── pages/             # Dashboard and detail pages
│   │   │   └── ui/                # Shared base components
│   │   ├── context/               # React Context providers (Auth, Global states)
│   │   ├── entities/              # Shared data entities and models
│   │   ├── hooks/                 # Reusable React hooks for fetching analysis
│   │   ├── lib/                   # Utility libraries & API client helpers
│   │   ├── styles/                # CSS styling rules & Tailwind setups
│   │   └── types/                 # TypeScript type definitions
│   └── tailwind.config.mjs        # Tailwind CSS framework token declarations
│
└── readme.md                      # Platform documentation
```

---

## Local Development

### Prerequisites

- **Node.js**: Version 18.0.0 or later installed on your system.
- **PostgreSQL**: An active local instance or a Neon DB cloud database URL.
- **Groq API Key**: Obtain a key from the Groq console for Llama inference.
- **GitHub Access Token**: For parsing private repositories (optional for public repositories).

### Environment Configuration

1. Create a `.env` file in the `backend/` directory:

   ```env
   PORT=5000
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   GROQ_API_KEY="gsk_your_groq_api_key_goes_here"
   ```

2. Create a `.env` file in the `frontend/` directory if you need to configure your Wix Client details or local host address:
   ```env
   PUBLIC_BACKEND_URL="http://localhost:5000"
   ```

### Database Deployment

Initialize the database schemas and run Prisma migrations:

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

### Starting the Servers

To start the API backend:

```bash
cd backend
npm run dev
```

The server will start on port `5000`.

To start the Astro frontend:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on port `3000` (or the configured Astro development port).

---

## Screenshots

Below are visual layouts representing the CodeLens AI platform capability screens:

### Executive Core Dashboard View

```
+--------------------------------------------------------------------------------+
|  [CodeLens AI]   Repositories   Review Engine   Developer Skills   Debt        |
+--------------------------------------------------------------------------------+
| Active Repository: facebook/react                   Status: CONNECTED          |
|                                                                                |
|  +-----------------------+  +------------------------+  +-------------------+  |
|  |   Core Quality Score   |  |   Analyzed Files       |  |  Total Commits    |  |
|  |        84 / 100        |  |         18 Files       |  |     2,450 Commits |  |
|  +-----------------------+  +------------------------+  +-------------------+  |
|                                                                                |
|  Executive AI Verdict Summary:                                                 |
|  The project is a high-performance web structure written in TypeScript, using  |
|  clean component separation. Security risks are low, but testing coverage     |
|  features dynamic weaknesses in async fetch loops.                           |
+--------------------------------------------------------------------------------+
```

_Placeholder path: `[Executive Summary Mockups](docs/assets/dashboard.png)`_

---

### Detailed Code Quality Visuals

```
+--------------------------------------------------------------------------------+
|  CODE QUALITY DIMENSIONS (Radar Metrics)                                       |
+--------------------------------------------------------------------------------+
|                                  Readability                                   |
|                                    (80/100)                                    |
|                                       /\                                       |
|                                      /  \                                      |
|                  Documentation      /    \      Maintainability                |
|                    (75/100)        /      \        (82/100)                    |
|                        /          /        \          \                        |
|                       /----------*          *----------\                       |
|                       \          |          |          /                       |
|                        \          \        /          /                        |
|                    Performance     \      /      Security                      |
|                     (90/100)        \    /       (88/100)                      |
|                                      \  /                                      |
|                                       \/                                       |
|                                   Reliability                                  |
|                                    (85/100)                                    |
+--------------------------------------------------------------------------------+
```

_Placeholder path: `[Code Quality Radar Graph](docs/assets/radar-chart.png)`_

---

### Developer Skill Radar Layout

```
+--------------------------------------------------------------------------------+
|  DEVELOPER PROFILE: Lead Architect Insights                                    |
+--------------------------------------------------------------------------------+
|  Primary Domain Focus: Backend API & Service Modularity                        |
|                                                                                |
|  Detected Language Proficiencies:                                              |
|  [====================================] TypeScript 85%                          |
|  [==============================      ] Rust 70%                                |
|  [======================              ] Go 50%                                 |
|                                                                                |
|  Core Strengths Detected:                                                      |
|  - Excellent API endpoint separation of concerns.                              |
|  - Strong validation habits using TypeScript interfaces.                       |
|                                                                                |
|  Identified Skill Gaps:                                                        |
|  - Minimal verification patterns around database indexes.                      |
+--------------------------------------------------------------------------------+
```

_Placeholder path: `[Developer Skill Matrix View](docs/assets/developer-skills.png)`_

---

### Architectural Verification Grid

```
+--------------------------------------------------------------------------------+
|  ARCHITECTURAL COMPLIANCE REPORT                                               |
+--------------------------------------------------------------------------------+
|  Architectural Pattern: Layered MVC Pattern       Overall Score: 85%            |
|                                                                                |
|  Checking Separation of Concerns...                [ SUCCESS ]                  |
|  Checking Router/Controller boundaries...          [ SUCCESS ]                  |
|  Checking Database query encapsulation...          [ WARNING ]                  |
|                                                                                |
|  Red Flags Identified:                                                         |
|  - Controller 'authController.js' contains direct database query operations.   |
|  - Lack of interface abstractions between services and controllers.            |
+--------------------------------------------------------------------------------+
```

_Placeholder path: `[System Architecture Verification Grid](docs/assets/architecture.png)`_

---

### Predictive Risk & Debt Analysis Dashboard

```
+--------------------------------------------------------------------------------+
|  PREDICTIVE TECHNICAL DEBT FORECASTER                                          |
+--------------------------------------------------------------------------------+
|  Current Technical Debt Score: 24 (Low Complexity)                             |
|  Projected Risk Increase (Next 6 Months): +15%                                 |
|  Estimated Refactoring Effort Required: 12 Hours                               |
|                                                                                |
|  AI Refactoring Roadmap Recommendation:                                        |
|  Due to the absence of unit tests in the auth routes, maintainability risks   |
|  will escalate if controller dependencies are not isolated before next major   |
|  version launch. Refactoring estimated at 12 development hours.                 |
+--------------------------------------------------------------------------------+
```

_Placeholder path: `[Refactor & Debt Forecaster Graph](docs/assets/debt-forecast.png)`_

---

## License

This software is released under the **ISC License**. For more details, see [LICENSE](LICENSE) (or the repository details).

---

## Contributing

Contributions from the open-source community are welcome! Please follow these guidelines:

1. Fork this repository.
2. Create a new branch for your feature (`git checkout -b feature/NewCapability`).
3. Commit your changes with clear descriptions (`git commit -m 'Add: New evaluation capability details'`).
4. Push to your branch (`git push origin feature/NewCapability`).
5. Open a Pull Request detailing the changes and technical decisions.

For significant code additions or major changes to the analysis pipeline, please open an issue first to discuss your proposed updates.

---

## Acknowledgements

- **Groq SDK Developers**: For providing high-performance inference APIs.
- **Prisma & Neon**: For building tools that streamline PostgreSQL database integrations.
- **Astro & Tailwind CSS Teams**: For creating templates that enable fast, modern UI development.
