import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../../../lib/admin/mutation-request";
import { getMenuByKey, getMenuItemById, upsertMenuItem } from "../../../../../../lib/db/menus";
import type { MenuItemType } from "../../../../../../lib/db/types";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

const types: MenuItemType[] = ["url", "post", "category"];

export const POST: APIRoute = async ({ params, request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const menuKey = params.menuKey;

  if (!menuKey) {
    return new Response(JSON.stringify({ error: "Missing menu key." }), {
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

  const menu = await getMenuByKey(runtimeEnv.CFBLOG_DB, menuKey);
  if (!menu) {
    return new Response(JSON.stringify({ error: "Menu not found." }), {
      status: 404,
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

  const label = typeof body.label === "string" ? body.label.trim() : "";
  if (!label) {
    return new Response(JSON.stringify({ error: "Label is required." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const itemTypeRaw = typeof body.itemType === "string" ? body.itemType : "url";
  if (!types.includes(itemTypeRaw as MenuItemType)) {
    return new Response(JSON.stringify({ error: "Invalid item type." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
  const itemType = itemTypeRaw as MenuItemType;

  const target = typeof body.target === "string" ? body.target.trim() : "";
  if (!target) {
    return new Response(JSON.stringify({ error: "Target is required." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let parentId: string | null = null;
  if (typeof body.parentId === "string" && body.parentId.trim()) {
    parentId = body.parentId.trim();
    const parent = await getMenuItemById(runtimeEnv.CFBLOG_DB, parentId);
    if (!parent || parent.menu_id !== menu.id) {
      return new Response(JSON.stringify({ error: "Invalid parent item." }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }
  } else if (body.parentId === null) {
    parentId = null;
  }

  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  const openInNewTab = Boolean(body.openInNewTab);

  const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : crypto.randomUUID();

  try {
    await upsertMenuItem(runtimeEnv.CFBLOG_DB, {
      id,
      menuId: menu.id,
      parentId,
      label,
      itemType,
      target,
      sortOrder,
      openInNewTab
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(
    JSON.stringify({
      id,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
