import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { validateCustomCssForStorage } from "../../../../lib/theme/custom-css-guard";
import { loadTheme } from "../../../../lib/theme/load";
import { DEFAULT_THEME, mergeTheme, parseThemePatch } from "../../../../lib/theme/schema";
import { setSetting } from "../../../../lib/db/settings";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
}

export const prerender = false;

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const theme = await loadTheme(runtimeEnv.CFBLOG_DB);
  return new Response(JSON.stringify({ theme }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const PATCH: APIRoute = async ({ request }) => {
  const runtimeEnv = env as RuntimeEnv;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const parsed = parseThemePatch(body);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  if (parsed.patch.customCss !== undefined) {
    const cssCheck = validateCustomCssForStorage(parsed.patch.customCss);
    if (!cssCheck.ok) {
      return new Response(JSON.stringify({ error: cssCheck.error }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }
  }

  const current = await loadTheme(runtimeEnv.CFBLOG_DB);
  const next = mergeTheme(current, parsed.patch);
  const result = await setSetting(runtimeEnv.CFBLOG_DB, "theme", next);
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Could not save theme." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(JSON.stringify({ theme: next }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const DELETE: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const result = await setSetting(runtimeEnv.CFBLOG_DB, "theme", DEFAULT_THEME);
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Could not reset theme." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(JSON.stringify({ theme: DEFAULT_THEME }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
