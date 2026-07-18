// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";
import path from "path";
import "dotenv/config";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  adapter: vercel(),
  output: "server",

  integrations: [tailwind(), react()],

  vite: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [customErrorOverlayPlugin()],
  },

  devToolbar: {
    enabled: false,
  },

  server: {
    allowedHosts: true,
    host: true,
  },
});
