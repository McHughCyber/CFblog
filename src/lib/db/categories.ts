import { all, first, run } from "./client";
import { createRedirect } from "./redirects";
import type { CategoryRecord } from "./types";

export interface CategoryInput {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  fullPath: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  robotsDirective?: string | null;
  sortOrder?: number;
}

export async function listCategories(
  database: D1Database
): Promise<CategoryRecord[]> {
  return all<CategoryRecord>(
    database,
    `
      SELECT *
      FROM categories
      ORDER BY parent_id IS NOT NULL, parent_id, sort_order, name
    `
  );
}

export async function getCategoryById(
  database: D1Database,
  id: string
): Promise<CategoryRecord | null> {
  return first<CategoryRecord>(database, "SELECT * FROM categories WHERE id = ?", [
    id
  ]);
}

export async function getCategoryByFullPath(
  database: D1Database,
  fullPath: string
): Promise<CategoryRecord | null> {
  return first<CategoryRecord>(
    database,
    "SELECT * FROM categories WHERE full_path = ?",
    [fullPath]
  );
}

export async function getCategoryAncestors(
  database: D1Database,
  categoryId: string
): Promise<CategoryRecord[]> {
  return all<CategoryRecord>(
    database,
    `
      WITH RECURSIVE ancestors AS (
        SELECT *, 0 AS depth
        FROM categories
        WHERE id = ?

        UNION ALL

        SELECT categories.*, ancestors.depth + 1 AS depth
        FROM categories
        INNER JOIN ancestors ON ancestors.parent_id = categories.id
      )
      SELECT
        id,
        parent_id,
        name,
        slug,
        full_path,
        description,
        seo_title,
        seo_description,
        robots_directive,
        sort_order,
        created_at,
        updated_at
      FROM ancestors
      ORDER BY depth DESC
    `,
    [categoryId]
  );
}

export async function listDescendantCategoryIds(
  database: D1Database,
  rootId: string
): Promise<string[]> {
  const rows = await all<{ id: string }>(
    database,
    `
      WITH RECURSIVE descendants AS (
        SELECT id FROM categories WHERE parent_id = ?

        UNION ALL

        SELECT categories.id
        FROM categories
        INNER JOIN descendants ON categories.parent_id = descendants.id
      )
      SELECT id FROM descendants
    `,
    [rootId]
  );

  return rows.map((row) => row.id);
}

export async function listCategorySubtreeOrdered(
  database: D1Database,
  rootId: string
): Promise<CategoryRecord[]> {
  return all<CategoryRecord>(
    database,
    `
      WITH RECURSIVE sub AS (
        SELECT *, 0 AS depth FROM categories WHERE id = ?

        UNION ALL

        SELECT categories.*, sub.depth + 1 AS depth
        FROM categories
        INNER JOIN sub ON categories.parent_id = sub.id
      )
      SELECT
        id,
        parent_id,
        name,
        slug,
        full_path,
        description,
        seo_title,
        seo_description,
        robots_directive,
        sort_order,
        created_at,
        updated_at
      FROM sub
      ORDER BY depth ASC, sort_order ASC, name ASC
    `,
    [rootId]
  );
}

export async function isCategoryFullPathTaken(
  database: D1Database,
  fullPath: string,
  excludeCategoryId?: string | null
): Promise<boolean> {
  const row = excludeCategoryId
    ? await first<{ id: string }>(
        database,
        "SELECT id FROM categories WHERE full_path = ? AND id != ?",
        [fullPath, excludeCategoryId]
      )
    : await first<{ id: string }>(
        database,
        "SELECT id FROM categories WHERE full_path = ?",
        [fullPath]
      );

  return row != null;
}

export async function upsertCategory(
  database: D1Database,
  input: CategoryInput,
  now = new Date().toISOString()
): Promise<D1Result> {
  const existing = await getCategoryById(database, input.id);

  if (existing && existing.full_path !== input.fullPath) {
    await createRedirect(
      database,
      {
        id: `redirect-${input.id}-${Date.now()}`,
        fromPath: existing.full_path,
        toPath: input.fullPath,
        statusCode: 301
      },
      now
    );
  }

  return run(
    database,
    `
      INSERT INTO categories (
        id,
        parent_id,
        name,
        slug,
        full_path,
        description,
        seo_title,
        seo_description,
        robots_directive,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        parent_id = excluded.parent_id,
        name = excluded.name,
        slug = excluded.slug,
        full_path = excluded.full_path,
        description = excluded.description,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        robots_directive = excluded.robots_directive,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `,
    [
      input.id,
      input.parentId ?? null,
      input.name,
      input.slug,
      input.fullPath,
      input.description ?? null,
      input.seoTitle ?? null,
      input.seoDescription ?? null,
      input.robotsDirective ?? null,
      input.sortOrder ?? 0,
      now,
      now
    ]
  );
}
