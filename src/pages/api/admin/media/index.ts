import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import {
  countMediaAssets,
  createMediaAsset,
  listMediaAssets
} from "../../../../lib/db/media";
import { buildMediaR2Key, publicPathForMediaAsset } from "../../../../lib/media/r2-keys";
import {
  isAllowedImageMimeType,
  validateUploadSize
} from "../../../../lib/media/upload-policy";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  CFBLOG_MEDIA: R2Bucket;
}

export const prerender = false;

const MAX_LIST = 100;

function parseLimitOffset(url: URL): { limit: number; offset: number } {
  const limitRaw = Number(url.searchParams.get("limit") ?? "40");
  const offsetRaw = Number(url.searchParams.get("offset") ?? "0");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(1, Math.floor(limitRaw)), MAX_LIST)
    : 40;
  const offset = Number.isFinite(offsetRaw) ? Math.max(0, Math.floor(offsetRaw)) : 0;
  return { limit, offset };
}

export const GET: APIRoute = async ({ request }) => {
  const runtimeEnv = env as RuntimeEnv;
  const { limit, offset } = parseLimitOffset(new URL(request.url));
  const [items, total] = await Promise.all([
    listMediaAssets(runtimeEnv.CFBLOG_DB, { limit, offset }),
    countMediaAssets(runtimeEnv.CFBLOG_DB)
  ]);

  return new Response(JSON.stringify({ items, total, limit, offset }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const runtimeEnv = env as RuntimeEnv;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Expected multipart form data." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const entry = form.get("file");
  if (!entry || typeof entry === "string") {
    return new Response(JSON.stringify({ error: "Missing file field." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const file = entry as File;
  const contentType = (file.type || "").trim().toLowerCase();
  if (!contentType) {
    return new Response(JSON.stringify({ error: "Could not determine file type." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  if (contentType === "image/svg+xml") {
    return new Response(
      JSON.stringify({
        error: "SVG uploads are disabled (script risk in rendered Markdown)."
      }),
      {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      }
    );
  }

  if (!isAllowedImageMimeType(contentType)) {
    return new Response(JSON.stringify({ error: "Unsupported image type." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const buffer = await file.arrayBuffer();
  const sizeErr = validateUploadSize(buffer.byteLength);
  if (sizeErr) {
    return new Response(JSON.stringify({ error: sizeErr }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  const id = crypto.randomUUID();
  const fileName = file.name?.trim() || "upload";
  const r2Key = buildMediaR2Key(id, fileName);
  const publicPath = publicPathForMediaAsset(id);

  await runtimeEnv.CFBLOG_MEDIA.put(r2Key, buffer, {
    httpMetadata: { contentType }
  });

  const insert = await createMediaAsset(runtimeEnv.CFBLOG_DB, {
    id,
    r2Key,
    publicPath,
    fileName,
    contentType,
    sizeBytes: buffer.byteLength,
    width: null,
    height: null,
    altText: null,
    caption: null,
    createdByEmail: locals.accessUser?.email ?? null
  });

  if (!insert.success) {
    await runtimeEnv.CFBLOG_MEDIA.delete(r2Key);
    return new Response(JSON.stringify({ error: "Could not save media metadata." }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(
    JSON.stringify({
      id,
      publicPath,
      r2Key,
      fileName,
      contentType,
      sizeBytes: buffer.byteLength
    }),
    {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
