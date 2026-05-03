import type { MenuItemRecord } from "../db/types";

export interface MenuItemTreeNode extends MenuItemRecord {
  children: MenuItemTreeNode[];
}

export function buildMenuItemTree(flat: MenuItemRecord[]): MenuItemTreeNode[] {
  const byParent = new Map<string | null, MenuItemRecord[]>();

  for (const row of flat) {
    const key = row.parent_id;
    if (!byParent.has(key)) {
      byParent.set(key, []);
    }
    byParent.get(key)!.push(row);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.label.localeCompare(b.label);
    });
  }

  const walk = (parentId: string | null): MenuItemTreeNode[] =>
    (byParent.get(parentId) ?? []).map((row) => ({
      ...row,
      children: walk(row.id)
    }));

  return walk(null);
}
