import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getMenuByKey } from "../../../../../lib/db/menus";
import { resolveMenuItemHref } from "../../../../../lib/menus/resolve";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const runtimeEnv = env as RuntimeEnv;
  const menuKey = params.menuKey;

  if (!menuKey) {
    return new Response(JSON.stringify({ error: "Missing menu key." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const menu = await getMenuByKey(runtimeEnv.CFBLOG_DB, menuKey);
  if (!menu) {
    return new Response(JSON.stringify({ error: "Menu not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const labelById = new Map(menu.items.map((i) => [i.id, i.label]));

  const items = await Promise.all(
    menu.items.map(async (item) => {
      const resolved = await resolveMenuItemHref(runtimeEnv.CFBLOG_DB, item, "admin");
      return {
        ...item,
        resolvedHref: resolved.href,
        targetOk: resolved.ok,
        parentLabel: item.parent_id ? labelById.get(item.parent_id) ?? null : null
      };
    })
  );

  items.sort((a, b) => {
    const pa = a.parent_id ?? "";
    const pb = b.parent_id ?? "";
    if (pa !== pb) {
      return pa.localeCompare(pb);
    }
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.label.localeCompare(b.label);
  });

  return new Response(JSON.stringify({ menu, items }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
