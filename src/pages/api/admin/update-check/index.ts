import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { checkLatestVersion } from "../../../../lib/update/check";
import { getUpdateStatus } from "../../../../lib/update/status";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  CFBLOG_UPDATE_CHECK_URL?: string;
}

export const prerender = false;

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const [status, latest] = await Promise.all([
    getUpdateStatus(runtimeEnv.CFBLOG_DB),
    checkLatestVersion(runtimeEnv.CFBLOG_UPDATE_CHECK_URL)
  ]);

  return new Response(JSON.stringify({ status, latest }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
