import { first } from "./client";
import {
  getCategoryById,
  listCategorySubtreeOrdered,
  listDescendantCategoryIds,
  upsertCategory,
  type CategoryInput
} from "./categories";
import {
  getPostById,
  getPrimaryCategoryForPost,
  isPostFullPathTaken,
  syncPostFullPathsForPrimaryCategories
} from "./posts";
import { buildCategoryFullPath, buildPostFullPath, isValidSlug } from "../posts/paths";

export interface CategorySavePayload {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder?: number;
}

export type CategorySaveResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

function uniquePaths(paths: Map<string, string>): string | null {
  const seen = new Set<string>();
  for (const p of paths.values()) {
    if (seen.has(p)) {
      return p;
    }
    seen.add(p);
  }
  return null;
}

async function categoryPathTakenOutsideSubtree(
  database: D1Database,
  fullPath: string,
  subtreeIds: Set<string>
): Promise<boolean> {
  const ids = [...subtreeIds];
  if (ids.length === 0) {
    const row = await first<{ id: string }>(
      database,
      "SELECT id FROM categories WHERE full_path = ?",
      [fullPath]
    );
    return row != null;
  }

  const placeholders = ids.map(() => "?").join(",");
  const row = await first<{ id: string }>(
    database,
    `
      SELECT id FROM categories
      WHERE full_path = ?
        AND id NOT IN (${placeholders})
    `,
    [fullPath, ...ids]
  );

  return row != null;
}

async function expectedPostPathAfterCategoryMoves(
  database: D1Database,
  postId: string,
  pathById: Map<string, string>
): Promise<string> {
  const post = await getPostById(database, postId);
  if (!post) {
    return "";
  }

  const primary = await getPrimaryCategoryForPost(database, postId);
  if (!primary) {
    return post.full_path;
  }

  const catBase = pathById.get(primary.id) ?? primary.full_path;
  return buildPostFullPath(catBase, post.slug);
}

export async function applyCategorySave(
  database: D1Database,
  payload: CategorySavePayload,
  now = new Date().toISOString()
): Promise<CategorySaveResult> {
  const name = payload.name.trim();
  if (!name) {
    return { ok: false, status: 400, message: "Name is required." };
  }

  const slug = payload.slug.trim().toLowerCase();
  if (!slug || !isValidSlug(slug)) {
    return {
      ok: false,
      status: 400,
      message: "Slug must use lowercase letters, numbers, and single hyphens."
    };
  }

  const parentId = payload.parentId ?? null;
  if (parentId === payload.id) {
    return { ok: false, status: 400, message: "A category cannot be its own parent." };
  }

  if (parentId) {
    const parent = await getCategoryById(database, parentId);
    if (!parent) {
      return { ok: false, status: 400, message: "Parent category was not found." };
    }
  }

  const existing = await getCategoryById(database, payload.id);
  const descendantIds = existing
    ? await listDescendantCategoryIds(database, payload.id)
    : [];

  if (parentId && existing && (parentId === payload.id || descendantIds.includes(parentId))) {
    return {
      ok: false,
      status: 400,
      message: "That parent would create a circular category hierarchy."
    };
  }

  const sortOrder = payload.sortOrder ?? 0;
  const description = payload.description?.trim() || null;
  const seoTitle = payload.seoTitle?.trim() || null;
  const seoDescription = payload.seoDescription?.trim() || null;

  if (!existing) {
    const parentPath = parentId
      ? (await getCategoryById(database, parentId))?.full_path ?? null
      : null;
    const fullPath = buildCategoryFullPath(parentPath, slug);

    if (await categoryPathTakenOutsideSubtree(database, fullPath, new Set())) {
      return {
        ok: false,
        status: 409,
        message: "Another category already uses this full path."
      };
    }

    if (await isPostFullPathTaken(database, fullPath, null)) {
      return {
        ok: false,
        status: 409,
        message: "A post already uses this full path."
      };
    }

    const input: CategoryInput = {
      id: payload.id,
      parentId,
      name,
      slug,
      fullPath,
      description,
      seoTitle,
      seoDescription,
      sortOrder
    };

    try {
      await upsertCategory(database, input, now);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed.";
      if (msg.includes("UNIQUE constraint failed") && msg.includes("full_path")) {
        return { ok: false, status: 409, message: "Full path conflicts with another record." };
      }
      return { ok: false, status: 500, message: msg };
    }

    return { ok: true };
  }

  const subtree = await listCategorySubtreeOrdered(database, payload.id);
  const subtreeIds = new Set(subtree.map((row) => row.id));

  const pathById = new Map<string, string>();

  for (const row of subtree) {
    if (row.id === payload.id) {
      const parentRecord = parentId ? await getCategoryById(database, parentId) : null;
      if (parentId && !parentRecord) {
        return { ok: false, status: 400, message: "Parent category was not found." };
      }
      const parentPath = parentRecord?.full_path ?? null;
      pathById.set(row.id, buildCategoryFullPath(parentPath, slug));
    } else {
      const pid = row.parent_id;
      if (!pid) {
        return { ok: false, status: 500, message: "Invalid category tree state." };
      }
      const parentPath = pathById.get(pid);
      if (!parentPath) {
        return { ok: false, status: 500, message: "Could not resolve parent path for a child category." };
      }
      pathById.set(row.id, buildCategoryFullPath(parentPath, row.slug));
    }
  }

  const dup = uniquePaths(pathById);
  if (dup) {
    return {
      ok: false,
      status: 400,
      message: `Resolved paths would collide at ${dup}.`
    };
  }

  for (const path of pathById.values()) {
    if (await categoryPathTakenOutsideSubtree(database, path, subtreeIds)) {
      return {
        ok: false,
        status: 409,
        message: `Another category already uses the path ${path}.`
      };
    }
  }

  for (const path of new Set(pathById.values())) {
    if (!(await isPostFullPathTaken(database, path, null))) {
      continue;
    }

    const row = await first<{ id: string }>(
      database,
      "SELECT id FROM posts WHERE full_path = ?",
      [path]
    );
    if (!row) {
      continue;
    }

    const nextPath = await expectedPostPathAfterCategoryMoves(database, row.id, pathById);
    if (nextPath === path) {
      return {
        ok: false,
        status: 409,
        message: `A post occupies ${path}, which a category still needs after this change.`
      };
    }
  }

  const changedCategoryIds: string[] = [];
  for (const row of subtree) {
    const next = pathById.get(row.id);
    if (next && next !== row.full_path) {
      changedCategoryIds.push(row.id);
    }
  }

  try {
    for (const row of subtree) {
      const nextPath = pathById.get(row.id);
      if (!nextPath) {
        continue;
      }

      const input: CategoryInput = {
        id: row.id,
        parentId: row.id === payload.id ? parentId : row.parent_id,
        name: row.id === payload.id ? name : row.name,
        slug: row.slug,
        fullPath: nextPath,
        description: row.id === payload.id ? description : row.description,
        seoTitle: row.id === payload.id ? seoTitle : row.seo_title,
        seoDescription: row.id === payload.id ? seoDescription : row.seo_description,
        sortOrder: row.id === payload.id ? sortOrder : row.sort_order
      };

      await upsertCategory(database, input, now);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed.";
    if (msg.includes("UNIQUE constraint failed") && msg.includes("full_path")) {
      return { ok: false, status: 409, message: "Full path conflicts with another record." };
    }
    return { ok: false, status: 500, message: msg };
  }

  if (changedCategoryIds.length > 0) {
    await syncPostFullPathsForPrimaryCategories(database, changedCategoryIds, now);
  }

  return { ok: true };
}
