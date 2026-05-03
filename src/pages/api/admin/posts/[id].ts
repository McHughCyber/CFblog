import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
  getPostById,
  listPostCategoryAssignments,
  listPostRevisions
} from "../../../../lib/db/posts";
import { persistPost, parseSavePostBody, type SavePostBody } from "../../../../lib/api/admin/save-post";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing post id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const post = await getPostById(runtimeEnv.CFBLOG_DB, id);
  if (!post) {
    return new Response(JSON.stringify({ error: "Post not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const categories = await listPostCategoryAssignments(runtimeEnv.CFBLOG_DB, id);
  const revisions = await listPostRevisions(runtimeEnv.CFBLOG_DB, id);

  return new Response(
    JSON.stringify({
      post,
      categories,
      revisions,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing post id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const existing = await getPostById(runtimeEnv.CFBLOG_DB, id);
  if (!existing) {
    return new Response(JSON.stringify({ error: "Post not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let body: SavePostBody;
  try {
    body = (await request.json()) as SavePostBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const parsed = parseSavePostBody(body);
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
      postId: id,
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

  const post = await getPostById(runtimeEnv.CFBLOG_DB, id);
  const categories = await listPostCategoryAssignments(runtimeEnv.CFBLOG_DB, id);

  return new Response(JSON.stringify({ post, categories }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
