import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { getMediaAssetById } from "../../lib/db/media";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  CFBLOG_MEDIA: R2Bucket;
}

export const prerender = false;

const CACHE_CONTROL = "public, max-age=31536000, immutable";

export const GET: APIRoute = async ({ params }) => {
  const runtimeEnv = env as RuntimeEnv;
  const id = params.id;
  if (!id) {
    return new Response("Not found", { status: 404 });
  }

  const row = await getMediaAssetById(runtimeEnv.CFBLOG_DB, id);
  if (!row || row.public_path !== `/media/${id}`) {
    return new Response("Not found", { status: 404 });
  }

  const object = await runtimeEnv.CFBLOG_MEDIA.get(row.r2_key);
  if (!object || !object.body) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set("content-type", row.content_type);
  headers.set("cache-control", CACHE_CONTROL);
  if (object.httpEtag) {
    headers.set("etag", object.httpEtag);
  }

  return new Response(object.body, { status: 200, headers });
};
