import { all, first, run } from "./client";
import type { MediaAssetRecord } from "./types";

export interface MediaAssetInput {
  id: string;
  r2Key: string;
  publicPath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  createdByEmail?: string | null;
}

export async function listMediaAssets(
  database: D1Database,
  options: { limit?: number; offset?: number } = {}
): Promise<MediaAssetRecord[]> {
  return all<MediaAssetRecord>(
    database,
    `
      SELECT *
      FROM media_assets
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [options.limit ?? 50, options.offset ?? 0]
  );
}

export async function getMediaAssetByPublicPath(
  database: D1Database,
  publicPath: string
): Promise<MediaAssetRecord | null> {
  return first<MediaAssetRecord>(
    database,
    "SELECT * FROM media_assets WHERE public_path = ?",
    [publicPath]
  );
}

export async function createMediaAsset(
  database: D1Database,
  input: MediaAssetInput,
  now = new Date().toISOString()
): Promise<D1Result> {
  return run(
    database,
    `
      INSERT INTO media_assets (
        id,
        r2_key,
        public_path,
        file_name,
        content_type,
        size_bytes,
        width,
        height,
        alt_text,
        caption,
        created_at,
        created_by_email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      input.id,
      input.r2Key,
      input.publicPath,
      input.fileName,
      input.contentType,
      input.sizeBytes,
      input.width ?? null,
      input.height ?? null,
      input.altText ?? null,
      input.caption ?? null,
      now,
      input.createdByEmail ?? null
    ]
  );
}

export async function getMediaAssetById(
  database: D1Database,
  id: string
): Promise<MediaAssetRecord | null> {
  return first<MediaAssetRecord>(
    database,
    "SELECT * FROM media_assets WHERE id = ?",
    [id]
  );
}

export async function countMediaAssets(database: D1Database): Promise<number> {
  const row = await first<{ total: number }>(
    database,
    "SELECT COUNT(*) AS total FROM media_assets"
  );
  return row?.total ?? 0;
}

export async function updateMediaAssetMeta(
  database: D1Database,
  id: string,
  fields: { altText: string | null; caption: string | null }
): Promise<D1Result> {
  return run(
    database,
    "UPDATE media_assets SET alt_text = ?, caption = ? WHERE id = ?",
    [fields.altText, fields.caption, id]
  );
}

export async function deleteMediaAssetRow(database: D1Database, id: string): Promise<D1Result> {
  return run(database, "DELETE FROM media_assets WHERE id = ?", [id]);
}
