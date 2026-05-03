import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getCategoryById, listCategories } from "../../../../lib/db/categories";
import {
  countAdminPosts,
  listAdminPosts,
  listPostCategoryAssignments,
  getPostById
} from "../../../../lib/db/posts";
import type { PostStatus } from "../../../../lib/db/types";
import { persistPost, parseSavePostBody, type SavePostBody } from "../../../../lib/api/admin/save-post";
import { buildPostFullPath, slugFromTitle } from "../../../../lib/posts/paths";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

const statuses: PostStatus[] = ["draft", "published", "scheduled", "archived"];

function asString(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status");
  const status =
    statusParam && statuses.includes(statusParam as PostStatus)
      ? (statusParam as PostStatus)
      : null;
  const categoryId = url.searchParams.get("categoryId");
  const q = url.searchParams.get("q");

  const posts = await listAdminPosts(runtimeEnv.CFBLOG_DB, {
    status,
    categoryId: categoryId || null,
    q: q || null,
    limit: 80,
    offset: 0
  });

  const total = await countAdminPosts(runtimeEnv.CFBLOG_DB, {
    status,
    categoryId: categoryId || null,
    q: q || null
  });

  const categories = await listCategories(runtimeEnv.CFBLOG_DB);

  return new Response(
    JSON.stringify({
      posts,
      total,
      categories,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  let body: SavePostBody;

  try {
    body = (await request.json()) as SavePostBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const postId = crypto.randomUUID();
  const slug = typeof body.slug === "string" && body.slug.trim()
    ? body.slug
    : slugFromTitle(typeof body.title === "string" ? body.title : "post");

  const merged: SavePostBody = {
    ...body,
    slug,
    status: body.status ?? "draft",
    markdownBody: body.markdownBody ?? ""
  };

  const fullPathEmpty = !asString(merged.fullPath)?.trim();
  if (fullPathEmpty && Array.isArray(merged.categories)) {
    const primary = merged.categories.find(
      (row): row is { categoryId: string; isPrimary: boolean } =>
        Boolean(row) &&
        typeof row === "object" &&
        Boolean((row as { isPrimary?: boolean }).isPrimary) &&
        typeof (row as { categoryId?: string }).categoryId === "string"
    );
    if (primary) {
      const category = await getCategoryById(
        runtimeEnv.CFBLOG_DB,
        primary.categoryId
      );
      if (category) {
        merged.fullPath = buildPostFullPath(category.full_path, slug);
      }
    }
  }

  const parsed = parseSavePostBody(merged);
  if ("error" in parsed) {
    return new Response(JSON.stringify({ error: parsed.error }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const result = await persistPost(
    {
      database: runtimeEnv.CFBLOG_DB,
      siteUrl: runtimeEnv.SITE_URL,
      request,
      postId,
      accessEmail: locals.accessUser?.email ?? null,
      createRevision: true,
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    },
    parsed
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const post = await getPostById(runtimeEnv.CFBLOG_DB, postId);
  const categories = await listPostCategoryAssignments(runtimeEnv.CFBLOG_DB, postId);

  return new Response(JSON.stringify({ id: postId, post, categories }), {
    status: 201,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
