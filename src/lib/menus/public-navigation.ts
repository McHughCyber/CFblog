import { getMenuByKey } from "../db/menus";
import type { ResolvedMenuNode } from "./resolve";
import { resolveMenuTree } from "./resolve";

export async function loadPublicNavigation(
  database: D1Database,
  now = new Date().toISOString()
): Promise<{ primary: ResolvedMenuNode[]; footer: ResolvedMenuNode[] }> {
  const primaryMenu = await getMenuByKey(database, "primary");
  const footerMenu = await getMenuByKey(database, "footer");

  const [primary, footer] = await Promise.all([
    primaryMenu ? resolveMenuTree(database, primaryMenu.items, "public", now) : [],
    footerMenu ? resolveMenuTree(database, footerMenu.items, "public", now) : []
  ]);

  return { primary, footer };
}
