import { getCategoryByFullPath } from "../db/categories";
import { getPublishedPostByFullPath } from "../db/posts";
import { normalizeFullPath } from "../posts/paths";

export type RedirectStatusCode = 301 | 302 | 307 | 308;

const ALLOWED_STATUS_CODES: RedirectStatusCode[] = [301, 302, 307, 308];

export interface ParsedRedirectInput {
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatusCode;
  note: string | null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function hasUnsafeScheme(path: string): boolean {
  return /^javascript:/i.test(path.trim());
}

export function normalizeRedirectFromPath(input: string): string {
  return normalizeFullPath(input).toLowerCase();
}

export function normalizeRedirectToPath(input: string): string {
  return normalizeFullPath(input);
}

export type RedirectStatusParseResult =
  | { ok: true; statusCode: RedirectStatusCode }
  | { ok: false; error: string };

export function parseRedirectStatusCode(value: unknown): RedirectStatusParseResult {
  if (value === undefined || value === null || value === "") {
    return { ok: true, statusCode: 301 };
  }

  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number.parseInt(value.trim(), 10)
        : NaN;

  if (!ALLOWED_STATUS_CODES.includes(numeric as RedirectStatusCode)) {
    return { ok: false, error: "Status code must be 301, 302, 307, or 308." };
  }

  return { ok: true, statusCode: numeric as RedirectStatusCode };
}

export function validateRedirectPaths(
  fromPathRaw: string,
  toPathRaw: string
): { fromPath: string; toPath: string } | { error: string } {
  const fromTrimmed = fromPathRaw.trim();
  const toTrimmed = toPathRaw.trim();

  if (!fromTrimmed) {
    return { error: "From path is required." };
  }
  if (!toTrimmed) {
    return { error: "To path is required." };
  }
  if (hasUnsafeScheme(fromTrimmed) || hasUnsafeScheme(toTrimmed)) {
    return { error: "Paths cannot use unsafe URL schemes." };
  }

  const fromPath = normalizeRedirectFromPath(fromTrimmed);
  const toPath = normalizeRedirectToPath(toTrimmed);

  if (fromPath === "/" || !fromPath.startsWith("/")) {
    return { error: "From path must start with / and include a path segment." };
  }
  if (toPath === "/" || !toPath.startsWith("/")) {
    return { error: "To path must start with / and include a path segment." };
  }
  if (/^https?:\/\//i.test(toTrimmed)) {
    return { error: "To path must be an internal path starting with /." };
  }
  if (fromPath === toPath) {
    return { error: "From path and to path cannot be the same." };
  }

  return { fromPath, toPath };
}

export function validateRedirectToPath(toPathRaw: string): { toPath: string } | { error: string } {
  const toTrimmed = toPathRaw.trim();
  if (!toTrimmed) {
    return { error: "To path is required." };
  }
  if (hasUnsafeScheme(toTrimmed)) {
    return { error: "Paths cannot use unsafe URL schemes." };
  }

  const toPath = normalizeRedirectToPath(toTrimmed);
  if (toPath === "/" || !toPath.startsWith("/")) {
    return { error: "To path must start with / and include a path segment." };
  }
  if (/^https?:\/\//i.test(toTrimmed)) {
    return { error: "To path must be an internal path starting with /." };
  }

  return { toPath };
}

export interface SaveRedirectBody {
  fromPath?: unknown;
  toPath?: unknown;
  statusCode?: unknown;
  note?: unknown;
}

export function parseSaveRedirectBody(body: SaveRedirectBody): ParsedRedirectInput | { error: string } {
  const paths = validateRedirectPaths(
    asString(body.fromPath) ?? "",
    asString(body.toPath) ?? ""
  );
  if ("error" in paths) {
    return paths;
  }

  const status = parseRedirectStatusCode(body.statusCode);
  if (!status.ok) {
    return { error: status.error };
  }

  return {
    fromPath: paths.fromPath,
    toPath: paths.toPath,
    statusCode: status.statusCode,
    note: asString(body.note)?.trim() || null
  };
}

export function parseUpdateRedirectBody(body: SaveRedirectBody): {
  toPath: string;
  statusCode: RedirectStatusCode;
  note: string | null;
} | { error: string } {
  const toPathResult = validateRedirectToPath(asString(body.toPath) ?? "");
  if ("error" in toPathResult) {
    return toPathResult;
  }

  const status = parseRedirectStatusCode(body.statusCode);
  if (!status.ok) {
    return { error: status.error };
  }

  return {
    toPath: toPathResult.toPath,
    statusCode: status.statusCode,
    note: asString(body.note)?.trim() || null
  };
}

export interface RedirectTargetWarning {
  warning: string;
}

export async function checkRedirectTargetExists(
  database: D1Database,
  toPath: string
): Promise<RedirectTargetWarning | null> {
  const post = await getPublishedPostByFullPath(database, toPath);
  if (post) {
    return null;
  }

  const category = await getCategoryByFullPath(database, toPath);
  if (category) {
    return null;
  }

  return {
    warning: "To path does not match a published post or category. The redirect will still be saved."
  };
}

export function parseImportCsvRow(
  line: string,
  lineNumber: number
): ParsedRedirectInput | { error: string } | { skip: true } {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return { skip: true };
  }

  if (lineNumber === 1 && /^from_path\s*,/i.test(trimmed)) {
    return { skip: true };
  }

  const parts = trimmed.split(",").map((p) => p.trim());
  if (parts.length < 2) {
    return { error: `Line ${lineNumber}: expected from_path,to_path[,status_code][,note].` };
  }

  const [fromPath, toPath, statusRaw, ...noteParts] = parts;
  const parsed = parseSaveRedirectBody({
    fromPath,
    toPath,
    statusCode: statusRaw || undefined,
    note: noteParts.length > 0 ? noteParts.join(",") : undefined
  });

  if ("error" in parsed) {
    return { error: `Line ${lineNumber}: ${parsed.error}` };
  }

  return parsed;
}
