import { describe, expect, it } from "vitest";
import { buildMenuItemTree } from "./build-menu-tree";
import type { MenuItemRecord } from "../db/types";

describe("buildMenuItemTree", () => {
  it("orders children under parents", () => {
    const flat: MenuItemRecord[] = [
      {
        id: "a",
        menu_id: "m",
        parent_id: null,
        label: "A",
        item_type: "url",
        target: "/a",
        sort_order: 1,
        open_in_new_tab: 0
      },
      {
        id: "b",
        menu_id: "m",
        parent_id: "a",
        label: "B",
        item_type: "url",
        target: "/b",
        sort_order: 0,
        open_in_new_tab: 0
      }
    ];

    const tree = buildMenuItemTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("b");
  });
});
