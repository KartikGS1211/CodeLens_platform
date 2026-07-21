# ============================================================
# Stage 1 — deps: install production dependencies only
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifests first to leverage Docker layer caching.
# If these files don't change, npm ci is skipped on rebuild.
COPY package.json package-lock.json ./

# `npm ci` (not `npm install`) for a reproducible, locked install.
# --omit=dev keeps devDependencies (e.g. nodemon) out of this stage.
RUN npm ci --omit=dev

# ============================================================
# Stage 2 — build: generate Prisma client
# ============================================================
FROM node:20-alpine AS build

# Install OpenSSL — required by Prisma's query engine binary on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Bring in the installed node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source (app.js, server.js, routes, etc.)
COPY . .

# Generate the Prisma client from schema.prisma.
# This writes the generated client into node_modules/@prisma/client.
# We do this in a build stage so the generated files are available
# to copy into the final production image.
RUN npx prisma generate

# ============================================================
# Stage 3 — production: lean final image
# ============================================================
FROM node:20-alpine AS production

# Install OpenSSL — required at runtime by Prisma's query engine binary.
# Without this, `prisma migrate deploy` fails on Alpine Linux.
RUN apk add --no-cache openssl

WORKDIR /app

# Create a non-root user for security best practice.
# Running as root inside a container is a security risk.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what is needed to run the server:
# - production node_modules (with generated Prisma client baked in)
# - application source files
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/app.js ./
COPY --from=build /app/server.js ./
COPY --from=build /app/controllers ./controllers
COPY --from=build /app/db ./db
COPY --from=build /app/middleware ./middleware
COPY --from=build /app/routes ./routes
COPY --from=build /app/services ./services
COPY --from=build /app/utils ./utils
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./

# Switch to non-root user
USER appuser

# Expose the port the server listens on (from env, default 5000)
EXPOSE 5000

# --- Migration strategy ---
# We run `prisma migrate deploy` as the container entrypoint BEFORE
# starting the server. This ensures the database schema is always
# up-to-date when a new image is deployed.
#
# Why `migrate deploy` and NOT `migrate dev`?
#   - `migrate dev` is interactive, creates migration files, and is
#     designed for local development only.
#   - `migrate deploy` is non-interactive, applies only pending
#     migrations that already exist in prisma/migrations/, and is safe
#     for CI/CD and production containers.
#
# We use `sh -c` so both commands run in the same shell process.
# If the migration fails, the server will NOT start (fail-fast).
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
