import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";
import { loadAiTrafficSettings } from "../../../../lib/ai-traffic/load";
import {
  AI_TRAFFIC_SETTING_KEY,
  mergeAiTrafficSettings,
  parseAiTrafficPatch
} from "../../../../lib/ai-traffic/schema";
import { setSetting } from "../../../../lib/db/settings";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
}

export const prerender = false;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const settings = await loadAiTrafficSettings(runtimeEnv.CFBLOG_DB);
  return jsonResponse({ aiTraffic: settings });
};

export const PATCH: APIRoute = async ({ request }) => {
  const runtimeEnv = env as RuntimeEnv;
  if (
    !isTrustedAdminMutation(request, runtimeEnv.SITE_URL, {
      allowLocalhostOrigin: true
    })
  ) {
    return jsonResponse({ error: "Untrusted mutation origin." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const parsed = parseAiTrafficPatch(body);
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error }, 400);
  }

  const current = await loadAiTrafficSettings(runtimeEnv.CFBLOG_DB);
  const next = mergeAiTrafficSettings(current, parsed.patch);
  const result = await setSetting(runtimeEnv.CFBLOG_DB, AI_TRAFFIC_SETTING_KEY, next);
  if (!result.success) {
    return jsonResponse({ error: "Could not save AI traffic settings." }, 500);
  }

  return jsonResponse({ aiTraffic: next });
};
