import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
  applyRedirectUpdate,
  parseUpdateRedirectBody
} from "../../../../lib/api/admin/save-redirect";
import { deleteRedirect, getRedirectById } from "../../../../lib/db/redirects";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing redirect id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const redirect = await getRedirectById(runtimeEnv.CFBLOG_DB, id);
  if (!redirect) {
    return new Response(JSON.stringify({ error: "Redirect not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(JSON.stringify({ redirect }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing redirect id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const parsed = parseUpdateRedirectBody(body);
  if ("error" in parsed) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const result = await applyRedirectUpdate(
    {
      database: runtimeEnv.CFBLOG_DB,
      siteUrl: runtimeEnv.SITE_URL,
      request,
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    },
    id,
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
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing redirect id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  if (
    !isTrustedAdminMutation(request, runtimeEnv.SITE_URL, {
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    })
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const existing = await getRedirectById(runtimeEnv.CFBLOG_DB, id);
  if (!existing) {
    return new Response(JSON.stringify({ error: "Redirect not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  await deleteRedirect(runtimeEnv.CFBLOG_DB, id);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
