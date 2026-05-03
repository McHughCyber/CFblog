import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { loadAiTrafficSettings } from "../lib/ai-traffic/load";
import { renderRobotsTxt } from "../lib/ai-traffic/render";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
}

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const settings = await loadAiTrafficSettings(runtimeEnv.CFBLOG_DB);

  return new Response(renderRobotsTxt({ siteUrl: runtimeEnv.SITE_URL, settings }), {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
};
