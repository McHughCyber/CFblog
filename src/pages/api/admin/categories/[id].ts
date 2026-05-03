import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";
import { applyCategorySave } from "../../../../lib/db/category-mutations";
import { getCategoryById } from "../../../../lib/db/categories";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing category id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const category = await getCategoryById(runtimeEnv.CFBLOG_DB, id);
  if (!category) {
    return new Response(JSON.stringify({ error: "Category not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(JSON.stringify({ category }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing category id." }), {
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

  const existing = await getCategoryById(runtimeEnv.CFBLOG_DB, id);
  if (!existing) {
    return new Response(JSON.stringify({ error: "Category not found." }), {
      status: 404,
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

  const name = typeof body.name === "string" ? body.name : existing.name;
  const slug = typeof body.slug === "string" ? body.slug : existing.slug;
  let parentId: string | null | undefined = undefined;
  if ("parentId" in body) {
    parentId =
      body.parentId === null
        ? null
        : typeof body.parentId === "string"
          ? body.parentId
          : null;
  }

  const result = await applyCategorySave(
    runtimeEnv.CFBLOG_DB,
    {
      id,
      parentId: parentId === undefined ? existing.parent_id : parentId,
      name,
      slug,
      description:
        typeof body.description === "string" ? body.description : existing.description,
      seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : existing.seo_title,
      seoDescription:
        typeof body.seoDescription === "string"
          ? body.seoDescription
          : existing.seo_description,
      robotsDirective:
        typeof body.robotsDirective === "string"
          ? body.robotsDirective
          : existing.robots_directive,
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : existing.sort_order
    },
    new Date().toISOString()
  );

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const category = await getCategoryById(runtimeEnv.CFBLOG_DB, id);

  return new Response(
    JSON.stringify({
      category,
      user: locals.accessUser?.email ?? null
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
