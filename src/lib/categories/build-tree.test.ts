import { describe, expect, it } from "vitest";
import { buildCategoryTree } from "./build-tree";
import type { CategoryRecord } from "../db/types";

describe("buildCategoryTree", () => {
  it("builds a nested tree", () => {
    const flat: CategoryRecord[] = [
      {
        id: "root",
        parent_id: null,
        name: "Root",
        slug: "root",
        full_path: "/root",
        description: null,
        seo_title: null,
        seo_description: null,
        sort_order: 0,
        created_at: "t",
        updated_at: "t"
      },
      {
        id: "child",
        parent_id: "root",
        name: "Child",
        slug: "child",
        full_path: "/root/child",
        description: null,
        seo_title: null,
        seo_description: null,
        sort_order: 0,
        created_at: "t",
        updated_at: "t"
      }
    ];

    const tree = buildCategoryTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("root");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("child");
  });
});
