import type { PageMetadata } from "@wix/astro-pages";

/// <reference types="astro/client" />
/// <reference path="../.astro/types.d.ts" />

declare const Astro: Readonly<import("astro").AstroGlobal>;

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  /// <reference types="astro/client" />

interface ImportMetaEnv {
  VITE_API_BASE_URL: any;
  readonly PUBLIC_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
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
