import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";
import { setSetting } from "../../../../lib/db/settings";
import { loadIntegrationsSettings } from "../../../../lib/integrations/load";
import {
  INTEGRATIONS_SETTING_KEY,
  mergeIntegrationsSettings,
  parseIntegrationsPatch,
  validateIntegrationsSettings
} from "../../../../lib/integrations/schema";

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
  const integrations = await loadIntegrationsSettings(runtimeEnv.CFBLOG_DB);
  return jsonResponse({ integrations });
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

  const parsed = parseIntegrationsPatch(body);
  if (!parsed.ok) {
    return jsonResponse({ error: parsed.error }, 400);
  }

  const current = await loadIntegrationsSettings(runtimeEnv.CFBLOG_DB);
  const next = mergeIntegrationsSettings(current, parsed.patch);
  const validation = validateIntegrationsSettings(next);
  if (!validation.ok) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const result = await setSetting(
    runtimeEnv.CFBLOG_DB,
    INTEGRATIONS_SETTING_KEY,
    next
  );
  if (!result.success) {
    return jsonResponse({ error: "Could not save integrations settings." }, 500);
  }

  return jsonResponse({ integrations: next });
};
