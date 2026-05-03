import { all, first, run, type D1Value } from "./client";
import { createRedirect } from "./redirects";
import { buildPostFullPath } from "../posts/paths";
import type { CategoryRecord, PostRecord, PostRevisionRecord, PostStatus } from "./types";

const publicPostPredicate =
  `(
    (status = 'published' AND (published_at IS NULL OR published_at <= ?))
    OR
    (status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?)
  )`;

export interface PostInput {
  id: string;
  title: string;
  slug: string;
  fullPath: string;
  markdownBody: string;
  excerpt?: string | null;
  status: PostStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageAssetId?: string | null;
  robotsDirective?: string | null;
  authorName?: string | null;
}

export async function listPublishedPosts(
  database: D1Database,
  options: { limit?: number; offset?: number; now?: string } = {}
): Promise<PostRecord[]> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const now = options.now ?? new Date().toISOString();

  return all<PostRecord>(
    database,
    `
      SELECT *
      FROM posts
      WHERE ${publicPostPredicate}
      ORDER BY COALESCE(published_at, scheduled_at, created_at) DESC, created_at DESC
      LIMIT ? OFFSET ?
    `,
    [now, now, limit, offset]
  );
}

export async function countPublishedPosts(
  database: D1Database,
  now = new Date().toISOString()
): Promise<number> {
  const row = await first<{ total: number }>(
    database,
    `
      SELECT COUNT(*) AS total
      FROM posts
      WHERE ${publicPostPredicate}
    `,
    [now, now]
  );

  return row?.total ?? 0;
}

export async function getPublishedPostByFullPath(
  database: D1Database,
  fullPath: string,
  now = new Date().toISOString()
): Promise<PostRecord | null> {
  return first<PostRecord>(
    database,
    `
      SELECT *
      FROM posts
      WHERE full_path = ? AND ${publicPostPredicate}
    `,
    [fullPath, now, now]
  );
}

export async function getPostById(
  database: D1Database,
  id: string
): Promise<PostRecord | null> {
  return first<PostRecord>(database, "SELECT * FROM posts WHERE id = ?", [id]);
}

export interface AdminPostListFilters {
  status?: PostStatus | null;
  categoryId?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
}

export async function listAdminPosts(
  database: D1Database,
  filters: AdminPostListFilters = {}
): Promise<PostRecord[]> {
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  const clauses: string[] = [];
  const bindings: D1Value[] = [];

  if (filters.status) {
    clauses.push("posts.status = ?");
    bindings.push(filters.status);
  }

  if (filters.categoryId) {
    clauses.push(
      "EXISTS (SELECT 1 FROM post_categories pc WHERE pc.post_id = posts.id AND pc.category_id = ?)"
    );
    bindings.push(filters.categoryId);
  }

  if (filters.q && filters.q.trim()) {
    const term = `%${filters.q.trim()}%`;
    clauses.push("(posts.title LIKE ? OR posts.slug LIKE ? OR posts.full_path LIKE ?)");
    bindings.push(term, term, term);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

  bindings.push(limit, offset);

  return all<PostRecord>(
    database,
    `
      SELECT posts.*
      FROM posts
      ${where}
      ORDER BY posts.updated_at DESC
      LIMIT ? OFFSET ?
    `,
    bindings
  );
}

export async function countAdminPosts(
  database: D1Database,
  filters: Omit<AdminPostListFilters, "limit" | "offset"> = {}
): Promise<number> {
  const clauses: string[] = [];
  const bindings: D1Value[] = [];

  if (filters.status) {
    clauses.push("posts.status = ?");
    bindings.push(filters.status);
  }

  if (filters.categoryId) {
    clauses.push(
      "EXISTS (SELECT 1 FROM post_categories pc WHERE pc.post_id = posts.id AND pc.category_id = ?)"
    );
    bindings.push(filters.categoryId);
  }

  if (filters.q && filters.q.trim()) {
    const term = `%${filters.q.trim()}%`;
    clauses.push("(posts.title LIKE ? OR posts.slug LIKE ? OR posts.full_path LIKE ?)");
    bindings.push(term, term, term);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const row = await first<{ total: number }>(
    database,
    `SELECT COUNT(*) AS total FROM posts ${where}`,
    bindings
  );

  return row?.total ?? 0;
}

export async function isPostFullPathTaken(
  database: D1Database,
  fullPath: string,
  excludePostId?: string | null
): Promise<boolean> {
  const row = excludePostId
    ? await first<{ id: string }>(
        database,
        "SELECT id FROM posts WHERE full_path = ? AND id != ?",
        [fullPath, excludePostId]
      )
    : await first<{ id: string }>(
        database,
        "SELECT id FROM posts WHERE full_path = ?",
        [fullPath]
      );

  return row != null;
}

export interface PostCategoryAssignment {
  categoryId: string;
  isPrimary: boolean;
}

export async function listPostCategoryAssignments(
  database: D1Database,
  postId: string
): Promise<PostCategoryAssignment[]> {
  const rows = await all<{ category_id: string; is_primary: number }>(
    database,
    `
      SELECT category_id, is_primary
      FROM post_categories
      WHERE post_id = ?
      ORDER BY is_primary DESC, category_id
    `,
    [postId]
  );

  return rows.map((row) => ({
    categoryId: row.category_id,
    isPrimary: row.is_primary === 1
  }));
}

export async function replacePostCategoryAssignments(
  database: D1Database,
  postId: string,
  assignments: PostCategoryAssignment[]
): Promise<void> {
  if (assignments.length === 0) {
    await run(database, "DELETE FROM post_categories WHERE post_id = ?", [postId]);
    return;
  }

  const primaryCount = assignments.filter((a) => a.isPrimary).length;
  if (primaryCount !== 1) {
    throw new Error("Exactly one primary category is required when categories are assigned.");
  }

  const seen = new Set<string>();
  for (const a of assignments) {
    if (seen.has(a.categoryId)) {
      throw new Error("Duplicate category assignment.");
    }
    seen.add(a.categoryId);
  }

  const statements = [
    database.prepare("DELETE FROM post_categories WHERE post_id = ?").bind(postId),
    ...assignments.map((a) =>
      database
        .prepare(
          `
            INSERT INTO post_categories (post_id, category_id, is_primary)
            VALUES (?, ?, ?)
          `
        )
        .bind(postId, a.categoryId, a.isPrimary ? 1 : 0)
    )
  ];

  await database.batch(statements);
}

export async function listPostRevisions(
  database: D1Database,
  postId: string,
  limit = 40
): Promise<PostRevisionRecord[]> {
  return all<PostRevisionRecord>(
    database,
    `
      SELECT *
      FROM post_revisions
      WHERE post_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `,
    [postId, limit]
  );
}

export async function getPostRevisionById(
  database: D1Database,
  revisionId: string
): Promise<PostRevisionRecord | null> {
  return first<PostRevisionRecord>(
    database,
    "SELECT * FROM post_revisions WHERE id = ?",
    [revisionId]
  );
}

export async function getPrimaryCategoryForPost(
  database: D1Database,
  postId: string
): Promise<CategoryRecord | null> {
  return first<CategoryRecord>(
    database,
    `
      SELECT categories.*
      FROM categories
      INNER JOIN post_categories ON post_categories.category_id = categories.id
      WHERE post_categories.post_id = ?
      ORDER BY post_categories.is_primary DESC, categories.sort_order, categories.name
      LIMIT 1
    `,
    [postId]
  );
}

export async function listPublishedPostsByCategoryId(
  database: D1Database,
  categoryId: string,
  options: { limit?: number; offset?: number; now?: string } = {}
): Promise<PostRecord[]> {
  const limit = options.limit ?? 10;
  const offset = options.offset ?? 0;
  const now = options.now ?? new Date().toISOString();

  return all<PostRecord>(
    database,
    `
      SELECT posts.*
      FROM posts
      INNER JOIN post_categories ON post_categories.post_id = posts.id
      WHERE post_categories.category_id = ?
        AND ${publicPostPredicate}
      ORDER BY COALESCE(posts.published_at, posts.scheduled_at, posts.created_at) DESC, posts.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [categoryId, now, now, limit, offset]
  );
}

export async function countPublishedPostsByCategoryId(
  database: D1Database,
  categoryId: string,
  now = new Date().toISOString()
): Promise<number> {
  const row = await first<{ total: number }>(
    database,
    `
      SELECT COUNT(*) AS total
      FROM posts
      INNER JOIN post_categories ON post_categories.post_id = posts.id
      WHERE post_categories.category_id = ?
        AND ${publicPostPredicate}
    `,
    [categoryId, now, now]
  );

  return row?.total ?? 0;
}

function postRecordToInput(post: PostRecord, fullPath: string): PostInput {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    fullPath,
    markdownBody: post.markdown_body,
    excerpt: post.excerpt,
    status: post.status,
    publishedAt: post.published_at,
    scheduledAt: post.scheduled_at,
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    canonicalUrl: post.canonical_url,
    ogImageAssetId: post.og_image_asset_id,
    robotsDirective: post.robots_directive,
    authorName: post.author_name
  };
}

/**
 * After category `full_path` values change, realign post URLs that use their primary category path plus slug.
 */
export async function syncPostFullPathsForPrimaryCategories(
  database: D1Database,
  categoryIds: string[],
  now = new Date().toISOString()
): Promise<void> {
  if (categoryIds.length === 0) {
    return;
  }

  const placeholders = categoryIds.map(() => "?").join(",");
  const posts = await all<PostRecord>(
    database,
    `
      SELECT DISTINCT posts.*
      FROM posts
      INNER JOIN post_categories pc
        ON pc.post_id = posts.id AND pc.is_primary = 1
      WHERE pc.category_id IN (${placeholders})
    `,
    categoryIds
  );

  for (const post of posts) {
    const primary = await getPrimaryCategoryForPost(database, post.id);
    if (!primary) {
      continue;
    }

    const nextPath = buildPostFullPath(primary.full_path, post.slug);
    if (nextPath === post.full_path) {
      continue;
    }

    await upsertPost(database, postRecordToInput(post, nextPath), now);
  }
}

export async function upsertPost(
  database: D1Database,
  input: PostInput,
  now = new Date().toISOString()
): Promise<D1Result> {
  const existing = await getPostById(database, input.id);

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

  const bindings: D1Value[] = [
    input.id,
    input.title,
    input.slug,
    input.fullPath,
    input.markdownBody,
    input.excerpt ?? null,
    input.status,
    input.publishedAt ?? null,
    input.scheduledAt ?? null,
    now,
    now,
    input.seoTitle ?? null,
    input.seoDescription ?? null,
    input.canonicalUrl ?? null,
    input.ogImageAssetId ?? null,
    input.robotsDirective ?? "index,follow",
    input.authorName ?? null
  ];

  return run(
    database,
    `
      INSERT INTO posts (
        id,
        title,
        slug,
        full_path,
        markdown_body,
        excerpt,
        status,
        published_at,
        scheduled_at,
        created_at,
        updated_at,
        seo_title,
        seo_description,
        canonical_url,
        og_image_asset_id,
        robots_directive,
        author_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        slug = excluded.slug,
        full_path = excluded.full_path,
        markdown_body = excluded.markdown_body,
        excerpt = excluded.excerpt,
        status = excluded.status,
        published_at = excluded.published_at,
        scheduled_at = excluded.scheduled_at,
        updated_at = excluded.updated_at,
        seo_title = excluded.seo_title,
        seo_description = excluded.seo_description,
        canonical_url = excluded.canonical_url,
        og_image_asset_id = excluded.og_image_asset_id,
        robots_directive = excluded.robots_directive,
        author_name = excluded.author_name
    `,
    bindings
  );
}

export async function createPostRevision(
  database: D1Database,
  input: {
    id: string;
    postId: string;
    title: string;
    markdownBody: string;
    createdByEmail?: string | null;
    revisionNote?: string | null;
  },
  now = new Date().toISOString()
): Promise<D1Result> {
  return run(
    database,
    `
      INSERT INTO post_revisions (
        id,
        post_id,
        title,
        markdown_body,
        created_at,
        created_by_email,
        revision_note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id,
      input.postId,
      input.title,
      input.markdownBody,
      now,
      input.createdByEmail ?? null,
      input.revisionNote ?? null
    ]
  );
}

export interface PostMediaReference {
  id: string;
  title: string;
}

export async function listPostsReferencingMedia(
  database: D1Database,
  publicPath: string,
  assetId: string
): Promise<PostMediaReference[]> {
  return all<PostMediaReference>(
    database,
    `
      SELECT id, title
      FROM posts
      WHERE markdown_body LIKE '%' || ? || '%' OR og_image_asset_id = ?
      ORDER BY updated_at DESC
      LIMIT 50
    `,
    [publicPath, assetId]
  );
}
