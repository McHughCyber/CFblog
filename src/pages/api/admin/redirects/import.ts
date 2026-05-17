import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { isTrustedAdminMutation } from "../../../../lib/admin/mutation-request";
import { createRedirect } from "../../../../lib/db/redirects";
import {
  parseImportCsvRow,
  parseSaveRedirectBody,
  type ParsedRedirectInput
} from "../../../../lib/routing/redirect-input";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
  ENVIRONMENT: string;
}

const MAX_IMPORT_ROWS = 2000;

export const prerender = false;

interface ImportRowResult {
  fromPath: string;
  ok: boolean;
  error?: string;
}

async function upsertRow(
  database: D1Database,
  parsed: ParsedRedirectInput,
  now: string
): Promise<void> {
  await createRedirect(database, {
    id: crypto.randomUUID(),
    fromPath: parsed.fromPath,
    toPath: parsed.toPath,
    statusCode: parsed.statusCode,
    note: parsed.note
  }, now);
}

export const POST: APIRoute = async ({ request }) => {
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

  const contentType = request.headers.get("content-type") ?? "";
  const now = new Date().toISOString();
  const results: ImportRowResult[] = [];
  let imported = 0;

  if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    const text = await request.text();
    const lines = text.split(/\r?\n/);
    let dataRows = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const parsed = parseImportCsvRow(lines[i] ?? "", lineNumber);

      if ("skip" in parsed) {
        continue;
      }

      dataRows++;
      if (dataRows > MAX_IMPORT_ROWS) {
        return new Response(
          JSON.stringify({
            error: `Import exceeds the maximum of ${MAX_IMPORT_ROWS} rows per request.`
          }),
          {
            status: 400,
            headers: { "content-type": "application/json; charset=utf-8" }
          }
        );
      }

      if ("error" in parsed) {
        results.push({ fromPath: lines[i]?.trim() ?? "", ok: false, error: parsed.error });
        continue;
      }

      try {
        await upsertRow(runtimeEnv.CFBLOG_DB, parsed, now);
        imported++;
        results.push({ fromPath: parsed.fromPath, ok: true });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Import failed.";
        results.push({ fromPath: parsed.fromPath, ok: false, error: message });
      }
    }
  } else {
    let body: { rows?: unknown };
    try {
      body = (await request.json()) as { rows?: unknown };
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    if (!Array.isArray(body.rows)) {
      return new Response(JSON.stringify({ error: "Expected a rows array." }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    }

    if (body.rows.length > MAX_IMPORT_ROWS) {
      return new Response(
        JSON.stringify({
          error: `Import exceeds the maximum of ${MAX_IMPORT_ROWS} rows per request.`
        }),
        {
          status: 400,
          headers: { "content-type": "application/json; charset=utf-8" }
        }
      );
    }

    for (const row of body.rows) {
      const parsed = parseSaveRedirectBody(row as Record<string, unknown>);
      if ("error" in parsed) {
        const fromPath =
          row && typeof row === "object" && typeof (row as Record<string, unknown>).fromPath === "string"
            ? String((row as Record<string, unknown>).fromPath)
            : "";
        results.push({ fromPath, ok: false, error: parsed.error });
        continue;
      }

      try {
        await upsertRow(runtimeEnv.CFBLOG_DB, parsed, now);
        imported++;
        results.push({ fromPath: parsed.fromPath, ok: true });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Import failed.";
        results.push({ fromPath: parsed.fromPath, ok: false, error: message });
      }
    }
  }

  return new Response(
    JSON.stringify({
      imported,
      failed: results.filter((r) => !r.ok).length,
      results
    }),
    {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
