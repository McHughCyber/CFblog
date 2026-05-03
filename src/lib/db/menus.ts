import { all, first, run } from "./client";
import type { MenuItemRecord, MenuItemType, MenuRecord } from "./types";

export async function getMenuItemById(
  database: D1Database,
  id: string
): Promise<MenuItemRecord | null> {
  return first<MenuItemRecord>(database, "SELECT * FROM menu_items WHERE id = ?", [id]);
}

export async function listDescendantMenuItemIds(
  database: D1Database,
  menuId: string,
  rootItemId: string
): Promise<string[]> {
  const rows = await all<{ id: string }>(
    database,
    `
      WITH RECURSIVE descendants AS (
        SELECT id FROM menu_items WHERE parent_id = ? AND menu_id = ?

        UNION ALL

        SELECT menu_items.id
        FROM menu_items
        INNER JOIN descendants ON menu_items.parent_id = descendants.id
        WHERE menu_items.menu_id = ?
      )
      SELECT id FROM descendants
    `,
    [rootItemId, menuId, menuId]
  );

  return rows.map((r) => r.id);
}

export async function countMenuItems(database: D1Database, menuId: string): Promise<number> {
  const row = await first<{ total: number }>(
    database,
    "SELECT COUNT(*) AS total FROM menu_items WHERE menu_id = ?",
    [menuId]
  );

  return row?.total ?? 0;
}

export async function deleteMenuItem(database: D1Database, id: string): Promise<D1Result> {
  return run(database, "DELETE FROM menu_items WHERE id = ?", [id]);
}

export interface MenuWithItems extends MenuRecord {
  items: MenuItemRecord[];
}

export interface MenuItemInput {
  id: string;
  menuId: string;
  parentId?: string | null;
  label: string;
  itemType: MenuItemType;
  target: string;
  sortOrder?: number;
  openInNewTab?: boolean;
}

export async function listMenus(database: D1Database): Promise<MenuRecord[]> {
  return all<MenuRecord>(database, "SELECT * FROM menus ORDER BY name");
}

export async function getMenuByKey(
  database: D1Database,
  menuKey: string
): Promise<MenuWithItems | null> {
  const menu = await first<MenuRecord>(
    database,
    "SELECT * FROM menus WHERE menu_key = ?",
    [menuKey]
  );

  if (!menu) {
    return null;
  }

  const items = await all<MenuItemRecord>(
    database,
    `
      SELECT *
      FROM menu_items
      WHERE menu_id = ?
      ORDER BY parent_id IS NOT NULL, parent_id, sort_order, label
    `,
    [menu.id]
  );

  return { ...menu, items };
}

export async function upsertMenuItem(
  database: D1Database,
  input: MenuItemInput
): Promise<D1Result> {
  return run(
    database,
    `
      INSERT INTO menu_items (
        id,
        menu_id,
        parent_id,
        label,
        item_type,
        target,
        sort_order,
        open_in_new_tab
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        menu_id = excluded.menu_id,
        parent_id = excluded.parent_id,
        label = excluded.label,
        item_type = excluded.item_type,
        target = excluded.target,
        sort_order = excluded.sort_order,
        open_in_new_tab = excluded.open_in_new_tab
    `,
    [
      input.id,
      input.menuId,
      input.parentId ?? null,
      input.label,
      input.itemType,
      input.target,
      input.sortOrder ?? 0,
      input.openInNewTab ? 1 : 0
    ]
  );
}
