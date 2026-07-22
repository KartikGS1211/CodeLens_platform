// PageMetadata type — stubbed to remove dependency on @wix/astro-pages (not available on Vercel)
type PageMetadata = Record<string, unknown>;

/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

import "react-router-dom";

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  interface ImportMetaEnv {
    // Custom env vars
    readonly PUBLIC_API_BASE_URL: string;
    // Vite built-in env vars
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SSR: boolean;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module "react-router-dom" {
  export interface IndexRouteObject {
    routeMetadata?: PageMetadata;
  }
  export interface NonIndexRouteObject {
    routeMetadata?: PageMetadata;
  }
}
