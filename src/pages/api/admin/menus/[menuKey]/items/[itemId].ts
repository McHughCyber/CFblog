import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../../../lib/admin/mutation-request";
import {
  deleteMenuItem,
  getMenuByKey,
  getMenuItemById,
  listDescendantMenuItemIds,
  upsertMenuItem
} from "../../../../../../lib/db/menus";
import type { MenuItemType } from "../../../../../../lib/db/types";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

const types: MenuItemType[] = ["url", "post", "category"];

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const menuKey = params.menuKey;
  const itemId = params.itemId;

  if (!menuKey || !itemId) {
    return new Response(JSON.stringify({ error: "Missing route parameters." }), {
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

  const existing = await getMenuItemById(runtimeEnv.CFBLOG_DB, itemId);
  if (!existing || existing.menu_id !== menu.id) {
    return new Response(JSON.stringify({ error: "Menu item not found." }), {
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

  const label =
    typeof body.label === "string" ? body.label.trim() : existing.label;
  if (!label) {
    return new Response(JSON.stringify({ error: "Label is required." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const itemTypeRaw =
    typeof body.itemType === "string" ? body.itemType : existing.item_type;
  if (!types.includes(itemTypeRaw as MenuItemType)) {
    return new Response(JSON.stringify({ error: "Invalid item type." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }
  const itemType = itemTypeRaw as MenuItemType;

  const target =
    typeof body.target === "string" ? body.target.trim() : existing.target;
  if (!target) {
    return new Response(JSON.stringify({ error: "Target is required." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let parentId: string | null = existing.parent_id;
  if ("parentId" in body) {
    if (body.parentId === null || body.parentId === "") {
      parentId = null;
    } else if (typeof body.parentId === "string" && body.parentId.trim()) {
      parentId = body.parentId.trim();
    }
  }

  if (parentId === itemId) {
    return new Response(JSON.stringify({ error: "A menu item cannot be its own parent." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  if (parentId) {
    const parent = await getMenuItemById(runtimeEnv.CFBLOG_DB, parentId);
    if (!parent || parent.menu_id !== menu.id) {
      return new Response(JSON.stringify({ error: "Invalid parent item." }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    const descendants = await listDescendantMenuItemIds(
      runtimeEnv.CFBLOG_DB,
      menu.id,
      itemId
    );
    if (parentId === itemId || descendants.includes(parentId)) {
      return new Response(
        JSON.stringify({ error: "That parent would create a circular menu hierarchy." }),
        {
          status: 400,
          headers: { "content-type": "application/json; charset=utf-8" }
        }
      );
    }
  }

  const sortOrder =
    typeof body.sortOrder === "number" ? body.sortOrder : existing.sort_order;
  const openInNewTab =
    typeof body.openInNewTab === "boolean" ? body.openInNewTab : existing.open_in_new_tab === 1;

  try {
    await upsertMenuItem(runtimeEnv.CFBLOG_DB, {
      id: itemId,
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

  const updated = await getMenuItemById(runtimeEnv.CFBLOG_DB, itemId);

  return new Response(
    JSON.stringify({
      item: updated,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const runtimeEnv = env as RuntimeEnv;
  const menuKey = params.menuKey;
  const itemId = params.itemId;

  if (!menuKey || !itemId) {
    return new Response(JSON.stringify({ error: "Missing route parameters." }), {
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

  const existing = await getMenuItemById(runtimeEnv.CFBLOG_DB, itemId);
  if (!existing || existing.menu_id !== menu.id) {
    return new Response(JSON.stringify({ error: "Menu item not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  await deleteMenuItem(runtimeEnv.CFBLOG_DB, itemId);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
