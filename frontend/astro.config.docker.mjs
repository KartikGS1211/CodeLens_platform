// @ts-check
// This config is used ONLY for Docker builds (see frontend/Dockerfile).
// It replaces the Vercel adapter with the Node.js adapter so the SSR
// server can run as a standalone Node process inside the container.
//
// The original astro.config.mjs (Vercel adapter) is kept intact for
// Vercel deployments and local dev — do NOT delete it.
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import react from "@astrojs/react";
import path from "path";
import "dotenv/config";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  // Use the standalone Node.js adapter instead of the Vercel adapter.
  // `standalone: true` produces a self-contained server in dist/server/entry.mjs
  // that can be started with: node ./dist/server/entry.mjs
  adapter: node({ mode: "standalone" }),
  output: "server",

  integrations: [tailwind(), react()],

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },

  devToolbar: {
    enabled: false,
  },

  server: {
    allowedHosts: true,
    host: true,
  },
});
