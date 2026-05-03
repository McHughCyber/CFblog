import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
  deleteMediaAssetRow,
  getMediaAssetById,
  updateMediaAssetMeta
} from "../../../../lib/db/media";
import { listPostsReferencingMedia } from "../../../../lib/db/posts";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  CFBLOG_MEDIA: R2Bucket;
}

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const existing = await getMediaAssetById(runtimeEnv.CFBLOG_DB, id);
  if (!existing) {
    return new Response(JSON.stringify({ error: "Not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const altText =
    record.altText === null || record.altText === undefined
      ? null
      : typeof record.altText === "string"
        ? record.altText
        : undefined;
  const caption =
    record.caption === null || record.caption === undefined
      ? null
      : typeof record.caption === "string"
        ? record.caption
        : undefined;

  if (altText === undefined || caption === undefined) {
    return new Response(JSON.stringify({ error: "altText and caption must be strings or null." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const result = await updateMediaAssetMeta(runtimeEnv.CFBLOG_DB, id, { altText, caption });
  if (!result.success) {
    return new Response(JSON.stringify({ error: "Update failed." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const updated = await getMediaAssetById(runtimeEnv.CFBLOG_DB, id);
  return new Response(JSON.stringify({ asset: updated }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const existing = await getMediaAssetById(runtimeEnv.CFBLOG_DB, id);
  if (!existing) {
    return new Response(JSON.stringify({ error: "Not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const references = await listPostsReferencingMedia(
    runtimeEnv.CFBLOG_DB,
    existing.public_path,
    id
  );

  if (references.length > 0) {
    return new Response(
      JSON.stringify({
        error: "This asset is referenced by one or more posts. Remove references before deleting.",
        references
      }),
      {
        status: 409,
        headers: { "content-type": "application/json; charset=utf-8" }
      }
    );
  }

  await runtimeEnv.CFBLOG_MEDIA.delete(existing.r2_key);
  const del = await deleteMediaAssetRow(runtimeEnv.CFBLOG_DB, id);
  if (!del.success) {
    return new Response(JSON.stringify({ error: "Could not remove metadata." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};
