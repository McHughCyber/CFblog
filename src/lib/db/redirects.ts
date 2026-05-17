import { all, first, run } from "./client";
import {
  normalizeRedirectFromPath,
  normalizeRedirectToPath,
  type RedirectStatusCode
} from "../routing/redirect-input";
import type { RedirectRecord } from "./types";

export interface ListRedirectsOptions {
  limit?: number;
  offset?: number;
  q?: string;
}

export async function getRedirectByFromPath(
  database: D1Database,
  fromPath: string
): Promise<RedirectRecord | null> {
  return first<RedirectRecord>(
    database,
    "SELECT * FROM redirects WHERE from_path = ?",
    [normalizeRedirectFromPath(fromPath)]
  );
}

export async function getRedirectById(
  database: D1Database,
  id: string
): Promise<RedirectRecord | null> {
  return first<RedirectRecord>(database, "SELECT * FROM redirects WHERE id = ?", [id]);
}

export async function countRedirects(
  database: D1Database,
  options: { q?: string } = {}
): Promise<number> {
  const q = options.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    const row = await first<{ total: number }>(
      database,
      `
        SELECT COUNT(*) AS total FROM redirects
        WHERE from_path LIKE ? OR to_path LIKE ? OR IFNULL(note, '') LIKE ?
      `,
      [pattern, pattern, pattern]
    );
    return row?.total ?? 0;
  }

  const row = await first<{ total: number }>(
    database,
    "SELECT COUNT(*) AS total FROM redirects"
  );
  return row?.total ?? 0;
}

export async function listRedirects(
  database: D1Database,
  options: ListRedirectsOptions = {}
): Promise<RedirectRecord[]> {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const offset = Math.max(options.offset ?? 0, 0);
  const q = options.q?.trim();

  if (q) {
    const pattern = `%${q}%`;
    return all<RedirectRecord>(
      database,
      `
        SELECT * FROM redirects
        WHERE from_path LIKE ? OR to_path LIKE ? OR IFNULL(note, '') LIKE ?
        ORDER BY from_path ASC
        LIMIT ? OFFSET ?
      `,
      [pattern, pattern, pattern, limit, offset]
    );
  }

  return all<RedirectRecord>(
    database,
    `
      SELECT * FROM redirects
      ORDER BY from_path ASC
      LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );
}

export async function createRedirect(
  database: D1Database,
  input: {
    id: string;
    fromPath: string;
    toPath: string;
    statusCode?: RedirectStatusCode;
    note?: string | null;
  },
  now = new Date().toISOString()
): Promise<D1Result> {
  const fromPath = normalizeRedirectFromPath(input.fromPath);
  const toPath = normalizeRedirectToPath(input.toPath);

  return run(
    database,
    `
      INSERT INTO redirects (id, from_path, to_path, status_code, created_at, note, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(from_path) DO UPDATE SET
        to_path = excluded.to_path,
        status_code = excluded.status_code,
        note = COALESCE(excluded.note, redirects.note),
        updated_at = excluded.updated_at
    `,
    [
      input.id,
      fromPath,
      toPath,
      input.statusCode ?? 301,
      now,
      input.note ?? null,
      now
    ]
  );
}

export async function updateRedirect(
  database: D1Database,
  id: string,
  input: {
    toPath: string;
    statusCode: RedirectStatusCode;
    note?: string | null;
  },
  now = new Date().toISOString()
): Promise<D1Result> {
  const toPath = normalizeRedirectToPath(input.toPath);

  return run(
    database,
    `
      UPDATE redirects
      SET to_path = ?, status_code = ?, note = ?, updated_at = ?
      WHERE id = ?
    `,
    [toPath, input.statusCode, input.note ?? null, now, id]
  );
}

export async function deleteRedirect(database: D1Database, id: string): Promise<D1Result> {
  return run(database, "DELETE FROM redirects WHERE id = ?", [id]);
}
