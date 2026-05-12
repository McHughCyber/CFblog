/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Runtime = import("@astrojs/cloudflare").Runtime;
type AccessUser = import("./lib/auth/access").AccessUser;

declare namespace App {
  interface Locals extends Runtime {
    accessUser?: AccessUser;
    runtime: {
      env: never;
      cf: never;
      caches: never;
      ctx: never;
    };
  }
}

declare global {
  interface Env {
    CFBLOG_DB: D1Database;
    CFBLOG_MEDIA: R2Bucket;
    CFBLOG_CACHE?: KVNamespace;
    ENVIRONMENT: string;
    SITE_URL: string;
    CF_ACCESS_TEAM_DOMAIN?: string;
    CF_ACCESS_AUD?: string;
    CFBLOG_CACHE_ENABLED?: string;
    CFBLOG_UPDATE_CHECK_URL?: string;
    CFBLOG_UPDATE_WORKFLOW_URL?: string;
  }
}
