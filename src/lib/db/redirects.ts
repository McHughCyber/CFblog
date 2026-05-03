import { first, run } from "./client";
import type { RedirectRecord } from "./types";

export async function getRedirectByFromPath(
  database: D1Database,
  fromPath: string
): Promise<RedirectRecord | null> {
  return first<RedirectRecord>(
    database,
    "SELECT * FROM redirects WHERE from_path = ?",
    [fromPath]
  );
}

export async function createRedirect(
  database: D1Database,
  input: {
    id: string;
    fromPath: string;
    toPath: string;
    statusCode?: 301 | 302 | 307 | 308;
  },
  now = new Date().toISOString()
): Promise<D1Result> {
  return run(
    database,
    `
      INSERT INTO redirects (id, from_path, to_path, status_code, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(from_path) DO UPDATE SET
        to_path = excluded.to_path,
        status_code = excluded.status_code
    `,
    [input.id, input.fromPath, input.toPath, input.statusCode ?? 301, now]
  );
}
