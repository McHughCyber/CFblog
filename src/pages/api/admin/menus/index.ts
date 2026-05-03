import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { countMenuItems, listMenus } from "../../../../lib/db/menus";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
}

export const prerender = false;

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const menus = await listMenus(runtimeEnv.CFBLOG_DB);
  const withCounts = await Promise.all(
    menus.map(async (m) => ({
      ...m,
      itemCount: await countMenuItems(runtimeEnv.CFBLOG_DB, m.id)
    }))
  );

  return new Response(JSON.stringify({ menus: withCounts }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
