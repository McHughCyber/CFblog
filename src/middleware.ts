import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import {
  forbidden,
  getAccessConfig,
  validateAccessRequest
} from "./lib/auth/access";

interface AccessEnv {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
}

function requiresAdminAccess(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/");
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!requiresAdminAccess(context.url.pathname)) {
    return next();
  }

  try {
    const accessUser = await validateAccessRequest(
      context.request,
      getAccessConfig(env as AccessEnv)
    );
    context.locals.accessUser = accessUser;
  } catch {
    return forbidden("Cloudflare Access authentication required.");
  }

  return next();
});
