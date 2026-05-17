import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
  applyRedirectCreate,
  parseSaveRedirectBody
} from "../../../../lib/api/admin/save-redirect";
import { countRedirects, listRedirects } from "../../../../lib/db/redirects";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

function parseLimit(value: string | null): number {
  const n = value ? Number.parseInt(value, 10) : 50;
  if (!Number.isFinite(n) || n < 1) {
    return 50;
  }
  return Math.min(n, 200);
}

function parseOffset(value: string | null): number {
  const n = value ? Number.parseInt(value, 10) : 0;
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

export const GET: APIRoute = async ({ url }) => {
  const runtimeEnv = env as RuntimeEnv;
  const q = url.searchParams.get("q")?.trim() || undefined;
  const limit = parseLimit(url.searchParams.get("limit"));
  const offset = parseOffset(url.searchParams.get("offset"));

  const [redirects, total] = await Promise.all([
    listRedirects(runtimeEnv.CFBLOG_DB, { limit, offset, q }),
    countRedirects(runtimeEnv.CFBLOG_DB, { q })
  ]);

  return new Response(JSON.stringify({ redirects, total, limit, offset }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const POST: APIRoute = async ({ request }) => {
  const runtimeEnv = env as RuntimeEnv;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const parsed = parseSaveRedirectBody(body);
  if ("error" in parsed) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const result = await applyRedirectCreate(
    {
      database: runtimeEnv.CFBLOG_DB,
      siteUrl: runtimeEnv.SITE_URL,
      request,
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    },
    parsed
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(
    JSON.stringify({
      redirect: result.redirect,
      warning: result.warning ?? null
    }),
    {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
