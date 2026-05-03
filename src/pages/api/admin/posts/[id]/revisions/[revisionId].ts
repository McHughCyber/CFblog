import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../../../lib/admin/mutation-request";
import {
  createPostRevision,
  getPostById,
  getPostRevisionById,
  listPostCategoryAssignments,
  type PostInput,
  upsertPost
} from "../../../../../../lib/db/posts";
import type { PostStatus } from "../../../../../../lib/db/types";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const postId = params.id;
  const revisionId = params.revisionId;

  if (!postId || !revisionId) {
    return new Response(JSON.stringify({ error: "Missing identifiers." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  if (
    !isTrustedAdminMutation(request, runtimeEnv.SITE_URL, {
      allowLocalhostOrigin: runtimeEnv.ENVIRONMENT === "development"
    })
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const post = await getPostById(runtimeEnv.CFBLOG_DB, postId);
  if (!post) {
    return new Response(JSON.stringify({ error: "Post not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const revision = await getPostRevisionById(runtimeEnv.CFBLOG_DB, revisionId);
  if (!revision || revision.post_id !== postId) {
    return new Response(JSON.stringify({ error: "Revision not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const input: PostInput = {
    id: post.id,
    title: revision.title,
    slug: post.slug,
    fullPath: post.full_path,
    markdownBody: revision.markdown_body,
    excerpt: post.excerpt,
    status: post.status as PostStatus,
    publishedAt: post.published_at,
    scheduledAt: post.scheduled_at,
    seoTitle: post.seo_title,
    seoDescription: post.seo_description,
    canonicalUrl: post.canonical_url,
    ogImageAssetId: post.og_image_asset_id,
    robotsDirective: post.robots_directive,
    authorName: post.author_name
  };

  await upsertPost(runtimeEnv.CFBLOG_DB, input);

  await createPostRevision(runtimeEnv.CFBLOG_DB, {
    id: crypto.randomUUID(),
    postId,
    title: revision.title,
    markdownBody: revision.markdown_body,
    createdByEmail: locals.accessUser?.email ?? null,
    revisionNote: `Restored revision ${revisionId}`
  });

  const updated = await getPostById(runtimeEnv.CFBLOG_DB, postId);
  const categories = await listPostCategoryAssignments(runtimeEnv.CFBLOG_DB, postId);

  return new Response(JSON.stringify({ post: updated, categories }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
