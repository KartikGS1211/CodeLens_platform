// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";
import cloudProviderFetchAdapter from "@wix/cloud-provider-fetch-adapter";
import wix from "@wix/astro";
import monitoring from "@wix/monitoring-astro";
import react from "@astrojs/react";
import sourceAttrsPlugin from "@wix/babel-plugin-jsx-source-attrs";
import dynamicDataPlugin from "@wix/babel-plugin-jsx-dynamic-data";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";
import path from "path";
import "dotenv/config";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isBuild = process.env.NODE_ENV === "production";

export default defineConfig({
  // Use Node adapter for SSR features required by wix auth; Render supports Node runtime.
  adapter: node({ mode: "standalone" }),
  output: "server",

  integrations: [
    {
      name: "framewire",
      hooks: {
        "astro:config:setup": ({ injectScript, command }) => {
          if (command === "dev") {
            injectScript(
              "page",
              "const version = new URLSearchParams(location.search).get('framewire');\n" +
                "if (version){\n" +
                "  const localUrl = 'http://localhost:3202/framewire/index.mjs';\n" +
                "  const cdnUrl = 'https://static.parastorage.com/services/framewire/' + version + '/index.mjs';\n" +
                "  const url = version === 'local' ? localUrl : cdnUrl;\n" +
                "  const framewireModule = await import(/* @vite-ignore */ url);\n" +
                "  globalThis.framewire = framewireModule;\n" +
                "  framewireModule.init({}, import.meta.hot);\n" +
                "  console.log('Framewire initialized');\n" +
                "}"
            );
          }
        },
      },
    },

    tailwind(),

    wix({
      htmlEmbeds: isBuild,
      auth: true,
    }),

    isBuild ? monitoring() : undefined,

    react({
      babel: {
        plugins: [sourceAttrsPlugin, dynamicDataPlugin],
      },
    }),
  ],

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

  image: {
    domains: ["static.wixstatic.com"],
  },

  server: {
    allowedHosts: true,
    host: true,
  },
});
