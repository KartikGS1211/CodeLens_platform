# ============================================================
# Stage 1 — build: compile the Astro SSR application
# ============================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy manifests + .npmrc first to leverage Docker layer caching.
# .npmrc contains legacy-peer-deps=true and force=true which are needed
# to resolve the vite peer dependency conflict between @tailwindcss/vite
# (needs vite ^5) and the project's pinned vite@^4.
COPY package.json package-lock.json .npmrc ./

# Install ALL dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy source code
COPY . .

# Use the Docker-specific Astro config which uses the Node adapter
# instead of the Vercel adapter.
# This produces a standalone Node.js server in dist/server/entry.mjs
ENV ASTRO_CONFIG_FILE=astro.config.docker.mjs
RUN npx astro build --config astro.config.docker.mjs

# ============================================================
# Stage 2 — production: run the Astro SSR Node server
# ============================================================
# --- Why Node, not nginx? ---
# This Astro project is configured with `output: "server"` (SSR mode),
# meaning pages are rendered on-demand at request time — not pre-built
# as static HTML. You CANNOT serve SSR output with nginx because nginx
# only serves static files; it has no way to execute the Astro server-
# side rendering logic.
#
# Since the `@astrojs/node` adapter in standalone mode produces a
# self-contained Express-like Node.js HTTP server at
# dist/server/entry.mjs, we run it with `node` directly.
#
# If the project were switched to `output: "static"`, we would use
# nginx:alpine to serve the dist/ folder — but it is not.
FROM node:20-alpine AS production

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the built output and the production node_modules.
# The Astro Node standalone server bundles its dependencies,
# but we still need node_modules for any runtime peer deps.
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Switch to non-root user
USER appuser

# The Astro node standalone server reads HOST and PORT from the environment.
# Default to port 4321 (Astro's default dev port, kept for consistency).
EXPOSE 4321

# PUBLIC_BACKEND_URL NOTE (see docker-compose.yml):
# The frontend makes backend API calls via PUBLIC_BACKEND_URL.
# This env var is used by the BROWSER, not the server container.
# In Docker, the browser still runs on the user's machine, so
# PUBLIC_BACKEND_URL must be the HOST-reachable URL (e.g. http://localhost:5000),
# NOT the internal Docker network hostname (e.g. http://backend:5000).
# The internal hostname is only useful for server-to-server calls within Docker.

CMD ["node", "./dist/server/entry.mjs"]
