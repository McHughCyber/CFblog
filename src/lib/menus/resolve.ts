import { getCategoryById } from "../db/categories";
import { getPostById } from "../db/posts";
import type { MenuItemRecord } from "../db/types";
import { buildMenuItemTree, type MenuItemTreeNode } from "./build-menu-tree";

export type MenuResolveMode = "public" | "admin";

export interface ResolvedMenuNode {
  id: string;
  label: string;
  href: string;
  ok: boolean;
  openInNewTab: boolean;
  children: ResolvedMenuNode[];
}

function isPostPubliclyLinkable(post: { status: string; published_at: string | null }, now: string): boolean {
  if (post.status !== "published") {
    return false;
  }
  if (post.published_at == null) {
    return true;
  }
  return new Date(post.published_at).getTime() <= new Date(now).getTime();
}

function normalizePathTarget(target: string): string {
  const t = target.trim();
  if (!t || t === "/") {
    return "/";
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  return t.startsWith("/") ? t.replace(/\/+/g, "/") : `/${t.replace(/^\/+/, "")}`;
}

export async function resolveMenuItemHref(
  database: D1Database,
  item: MenuItemRecord,
  mode: MenuResolveMode,
  now = new Date().toISOString()
): Promise<{ href: string; ok: boolean }> {
  if (item.item_type === "url") {
    const href = normalizePathTarget(item.target);
    const ok = href.length > 0 && !/^javascript:/i.test(href);
    return { href: ok ? href : "#", ok };
  }

  if (item.item_type === "category") {
    const category = await getCategoryById(database, item.target);
    if (!category) {
      return { href: "#", ok: false };
    }
    return { href: category.full_path, ok: true };
  }

  if (item.item_type === "post") {
    const post = await getPostById(database, item.target);
    if (!post) {
      return { href: "#", ok: false };
    }
    if (mode === "public" && !isPostPubliclyLinkable(post, now)) {
      return { href: "#", ok: false };
    }
    return { href: post.full_path, ok: true };
  }

  return { href: "#", ok: false };
}

export async function resolveMenuTree(
  database: D1Database,
  flat: MenuItemRecord[],
  mode: MenuResolveMode,
  now = new Date().toISOString()
): Promise<ResolvedMenuNode[]> {
  const tree = buildMenuItemTree(flat);

  async function walk(nodes: MenuItemTreeNode[]): Promise<ResolvedMenuNode[]> {
    const out: ResolvedMenuNode[] = [];

    for (const node of nodes) {
      const { href, ok } = await resolveMenuItemHref(database, node, mode, now);
      if (mode === "public" && !ok) {
        continue;
      }

      const children = await walk(node.children);
      out.push({
        id: node.id,
        label: node.label,
        href,
        ok,
        openInNewTab: node.open_in_new_tab === 1,
        children
      });
    }

    return out;
  }

  return walk(tree);
}
