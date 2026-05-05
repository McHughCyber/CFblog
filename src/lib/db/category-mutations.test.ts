import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyCategorySave } from "./category-mutations";
import { first } from "./client";
import {
  getCategoryById,
  listCategorySubtreeOrdered,
  listDescendantCategoryIds,
  upsertCategory
} from "./categories";
import {
  isPostFullPathTaken,
  syncPostFullPathsForPrimaryCategories
} from "./posts";
import type { CategoryRecord } from "./types";

vi.mock("./client", () => ({
  first: vi.fn()
}));

vi.mock("./categories", () => ({
  getCategoryById: vi.fn(),
  listCategorySubtreeOrdered: vi.fn(),
  listDescendantCategoryIds: vi.fn(),
  upsertCategory: vi.fn()
}));

vi.mock("./posts", () => ({
  getPostById: vi.fn(),
  getPrimaryCategoryForPost: vi.fn(),
  isPostFullPathTaken: vi.fn(),
  syncPostFullPathsForPrimaryCategories: vi.fn()
}));

const database = {} as D1Database;

function category(overrides: Partial<CategoryRecord>): CategoryRecord {
  return {
    id: "cat",
    parent_id: null,
    name: "Category",
    slug: "category",
    full_path: "/category",
    description: null,
    seo_title: null,
    seo_description: null,
    robots_directive: null,
    sort_order: 0,
    created_at: "2026-05-05T00:00:00.000Z",
    updated_at: "2026-05-05T00:00:00.000Z",
    ...overrides
  };
}

describe("applyCategorySave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(first).mockResolvedValue(null);
    vi.mocked(getCategoryById).mockResolvedValue(null);
    vi.mocked(listCategorySubtreeOrdered).mockResolvedValue([]);
    vi.mocked(listDescendantCategoryIds).mockResolvedValue([]);
    vi.mocked(upsertCategory).mockResolvedValue({ success: true } as D1Result);
    vi.mocked(isPostFullPathTaken).mockResolvedValue(false);
    vi.mocked(syncPostFullPathsForPrimaryCategories).mockResolvedValue(undefined);
  });

  it("rejects a category as its own parent", async () => {
    const result = await applyCategorySave(database, {
      id: "guides",
      parentId: "guides",
      name: "Guides",
      slug: "guides"
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "A category cannot be its own parent."
    });
    expect(upsertCategory).not.toHaveBeenCalled();
  });

  it("rejects a parent id that does not exist", async () => {
    const result = await applyCategorySave(database, {
      id: "guides",
      parentId: "missing-parent",
      name: "Guides",
      slug: "guides"
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "Parent category was not found."
    });
    expect(upsertCategory).not.toHaveBeenCalled();
  });

  it("rejects moving a category under one of its descendants", async () => {
    vi.mocked(getCategoryById).mockImplementation(async (_database, id) => {
      if (id === "root") {
        return category({ id: "root", name: "Root", slug: "root", full_path: "/root" });
      }
      if (id === "child") {
        return category({
          id: "child",
          parent_id: "root",
          name: "Child",
          slug: "child",
          full_path: "/root/child"
        });
      }
      return null;
    });
    vi.mocked(listDescendantCategoryIds).mockResolvedValue(["child"]);

    const result = await applyCategorySave(database, {
      id: "root",
      parentId: "child",
      name: "Root",
      slug: "root"
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "That parent would create a circular category hierarchy."
    });
    expect(upsertCategory).not.toHaveBeenCalled();
  });

  it("recomputes child paths when a nested category moves", async () => {
    const parent = category({
      id: "docs",
      name: "Docs",
      slug: "docs",
      full_path: "/docs"
    });
    const root = category({
      id: "guides",
      name: "Guides",
      slug: "guides",
      full_path: "/guides"
    });
    const child = category({
      id: "astro",
      parent_id: "guides",
      name: "Astro",
      slug: "astro",
      full_path: "/guides/astro"
    });

    vi.mocked(getCategoryById).mockImplementation(async (_database, id) => {
      if (id === "docs") return parent;
      if (id === "guides") return root;
      if (id === "astro") return child;
      return null;
    });
    vi.mocked(listCategorySubtreeOrdered).mockResolvedValue([root, child]);

    const result = await applyCategorySave(
      database,
      {
        id: "guides",
        parentId: "docs",
        name: "Guides",
        slug: "guides"
      },
      "2026-05-05T00:00:00.000Z"
    );

    expect(result).toEqual({ ok: true });
    expect(upsertCategory).toHaveBeenNthCalledWith(
      1,
      database,
      expect.objectContaining({
        id: "guides",
        parentId: "docs",
        fullPath: "/docs/guides"
      }),
      "2026-05-05T00:00:00.000Z"
    );
    expect(upsertCategory).toHaveBeenNthCalledWith(
      2,
      database,
      expect.objectContaining({
        id: "astro",
        parentId: "guides",
        fullPath: "/docs/guides/astro"
      }),
      "2026-05-05T00:00:00.000Z"
    );
    expect(syncPostFullPathsForPrimaryCategories).toHaveBeenCalledWith(
      database,
      ["guides", "astro"],
      "2026-05-05T00:00:00.000Z"
    );
  });
});
