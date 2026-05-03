import type { CategoryRecord } from "../db/types";

export interface CategoryTreeNode extends CategoryRecord {
  children: CategoryTreeNode[];
}

export function buildCategoryTree(flat: CategoryRecord[]): CategoryTreeNode[] {
  const byParent = new Map<string | null, CategoryRecord[]>();

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
      return a.name.localeCompare(b.name);
    });
  }

  const walk = (parentId: string | null): CategoryTreeNode[] =>
    (byParent.get(parentId) ?? []).map((row) => ({
      ...row,
      children: walk(row.id)
    }));

  return walk(null);
}
