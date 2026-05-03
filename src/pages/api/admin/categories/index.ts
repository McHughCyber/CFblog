import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";
import { applyCategorySave } from "../../../../lib/db/category-mutations";
import { listCategories } from "../../../../lib/db/categories";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const categories = await listCategories(runtimeEnv.CFBLOG_DB);

  return new Response(JSON.stringify({ categories }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;

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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const name = typeof body.name === "string" ? body.name : "";
  const slug = typeof body.slug === "string" ? body.slug : "";
  let parentId: string | null = null;
  if (typeof body.parentId === "string" && body.parentId.trim()) {
    parentId = body.parentId.trim();
  } else if (body.parentId === null) {
    parentId = null;
  }

  const id = typeof body.id === "string" && body.id.trim() ? body.id : crypto.randomUUID();

  const result = await applyCategorySave(
    runtimeEnv.CFBLOG_DB,
    {
      id,
      parentId,
      name,
      slug,
      description: typeof body.description === "string" ? body.description : null,
      seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : null,
      seoDescription: typeof body.seoDescription === "string" ? body.seoDescription : null,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0
    },
    new Date().toISOString()
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(
    JSON.stringify({
      id,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
