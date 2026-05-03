import { getCategoryByFullPath } from "../../db/categories";
import {
  createPostRevision,
  isPostFullPathTaken,
  replacePostCategoryAssignments,
  upsertPost,
  type PostCategoryAssignment,
  type PostInput
} from "../../db/posts";
import type { PostStatus } from "../../db/types";
import { isTrustedAdminMutation } from "../../admin/mutation-request";
import { isValidSlug, normalizeFullPath } from "../../posts/paths";

export interface SavePostBody {
  title?: unknown;
  slug?: unknown;
  fullPath?: unknown;
  markdownBody?: unknown;
  excerpt?: unknown;
  status?: unknown;
  publishedAt?: unknown;
  scheduledAt?: unknown;
  seoTitle?: unknown;
  seoDescription?: unknown;
  canonicalUrl?: unknown;
  ogImageAssetId?: unknown;
  robotsDirective?: unknown;
  authorName?: unknown;
  categories?: unknown;
  revisionNote?: unknown;
}

export interface ParsedSavePost {
  title: string;
  slug: string;
  fullPath: string;
  markdownBody: string;
  excerpt: string | null;
  status: PostStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImageAssetId: string | null;
  robotsDirective: string | null;
  authorName: string | null;
  categories: PostCategoryAssignment[];
  revisionNote: string | null;
}

const statuses: PostStatus[] = ["draft", "published", "scheduled", "archived"];

function asString(v: unknown): string | null {
  if (typeof v === "string") {
    return v;
  }
  return null;
}

export function parseSavePostBody(body: SavePostBody): ParsedSavePost | { error: string } {
  const title = asString(body.title)?.trim() ?? "";
  if (!title) {
    return { error: "Title is required." };
  }

  const slug = (asString(body.slug)?.trim().toLowerCase() ?? "").replace(/^\/+|\/+$/g, "");
  if (!slug || !isValidSlug(slug)) {
    return { error: "Slug must use lowercase letters, numbers, and single hyphens." };
  }

  const fullPath = normalizeFullPath(asString(body.fullPath) ?? "");
  if (fullPath === "/" || !fullPath.startsWith("/")) {
    return { error: "Full path must start with / and include a path segment." };
  }

  const markdownBody = asString(body.markdownBody) ?? "";
  const excerpt = asString(body.excerpt)?.trim() ?? null;
  const statusRaw = asString(body.status)?.trim().toLowerCase() ?? "draft";
  if (!statuses.includes(statusRaw as PostStatus)) {
    return { error: "Invalid status." };
  }
  const status = statusRaw as PostStatus;

  let publishedAt = asString(body.publishedAt)?.trim() || null;
  const scheduledAt = asString(body.scheduledAt)?.trim() || null;

  if (status === "scheduled" && !scheduledAt) {
    return { error: "Scheduled posts require a scheduled date." };
  }

  if (status === "published" && !publishedAt) {
    publishedAt = new Date().toISOString();
  }

  const categories: PostCategoryAssignment[] = [];
  if (Array.isArray(body.categories)) {
    for (const row of body.categories) {
      if (!row || typeof row !== "object") {
        continue;
      }
      const obj = row as Record<string, unknown>;
      const categoryId = asString(obj.categoryId)?.trim() ?? "";
      if (!categoryId) {
        continue;
      }
      categories.push({
        categoryId,
        isPrimary: Boolean(obj.isPrimary)
      });
    }
  }

  return {
    title,
    slug,
    fullPath,
    markdownBody,
    excerpt,
    status,
    publishedAt,
    scheduledAt,
    seoTitle: asString(body.seoTitle)?.trim() || null,
    seoDescription: asString(body.seoDescription)?.trim() || null,
    canonicalUrl: asString(body.canonicalUrl)?.trim() || null,
    ogImageAssetId: asString(body.ogImageAssetId)?.trim() || null,
    robotsDirective: asString(body.robotsDirective)?.trim() || null,
    authorName: asString(body.authorName)?.trim() || null,
    categories,
    revisionNote: asString(body.revisionNote)?.trim() || null
  };
}

export interface SavePostContext {
  database: D1Database;
  siteUrl: string;
  request: Request;
  postId: string;
  accessEmail: string | null;
  createRevision: boolean;
  allowLocalhostOrigin?: boolean;
}

export type SavePostResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

export async function persistPost(
  ctx: SavePostContext,
  parsed: ParsedSavePost
): Promise<SavePostResult> {
  if (
    !isTrustedAdminMutation(ctx.request, ctx.siteUrl, {
      allowLocalhostOrigin: ctx.allowLocalhostOrigin
    })
  ) {
    return { ok: false, status: 403, message: "Cross-origin requests are not allowed for this action." };
  }

  if (parsed.categories.length > 0) {
    const primary = parsed.categories.filter((c) => c.isPrimary);
    if (primary.length !== 1) {
      return {
        ok: false,
        status: 400,
        message: "Select exactly one primary category when assigning categories."
      };
    }
  }

  const categoryAtPath = await getCategoryByFullPath(ctx.database, parsed.fullPath);
  if (categoryAtPath) {
    return {
      ok: false,
      status: 409,
      message: "That path is already used by a category. Choose a different full path."
    };
  }

  const pathTaken = await isPostFullPathTaken(
    ctx.database,
    parsed.fullPath,
    ctx.postId
  );
  if (pathTaken) {
    return {
      ok: false,
      status: 409,
      message: "Another post already uses this full path."
    };
  }

  const input: PostInput = {
    id: ctx.postId,
    title: parsed.title,
    slug: parsed.slug,
    fullPath: parsed.fullPath,
    markdownBody: parsed.markdownBody,
    excerpt: parsed.excerpt,
    status: parsed.status,
    publishedAt: parsed.publishedAt,
    scheduledAt: parsed.scheduledAt,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription,
    canonicalUrl: parsed.canonicalUrl,
    ogImageAssetId: parsed.ogImageAssetId,
    robotsDirective: parsed.robotsDirective,
    authorName: parsed.authorName
  };

  try {
    await upsertPost(ctx.database, input);
    await replacePostCategoryAssignments(ctx.database, ctx.postId, parsed.categories);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed.";
    if (message.includes("UNIQUE constraint failed") && message.includes("full_path")) {
      return { ok: false, status: 409, message: "Full path conflicts with another record." };
    }
    return { ok: false, status: 500, message };
  }

  if (ctx.createRevision) {
    await createPostRevision(ctx.database, {
      id: crypto.randomUUID(),
      postId: ctx.postId,
      title: parsed.title,
      markdownBody: parsed.markdownBody,
      createdByEmail: ctx.accessEmail,
      revisionNote: parsed.revisionNote
    });
  }

  return { ok: true };
}
