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
    VITE_API_BASE_URL: any;
    readonly PUBLIC_API_BASE_URL: string;
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
