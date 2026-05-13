import { TEMPLATE_VERSION } from "../version";

export interface LatestVersionInfo {
  latestVersion: string | null;
  tag: string | null;
  updateAvailable: boolean;
  sourceUrl: string | null;
  releaseUrl: string | null;
  notes: string | null;
  schemaVersion: string | null;
  migrations: string[];
  error: string | null;
}

export async function checkLatestVersion(
  sourceUrl?: string | null,
  fetcher: typeof fetch = fetch
): Promise<LatestVersionInfo> {
  if (!sourceUrl) {
    return {
      latestVersion: null,
      tag: null,
      updateAvailable: false,
      sourceUrl: null,
      releaseUrl: null,
      notes: null,
      schemaVersion: null,
      migrations: [],
      error: "CFBLOG_UPDATE_CHECK_URL is not configured."
    };
  }

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return {
      latestVersion: null,
      tag: null,
      updateAvailable: false,
      sourceUrl,
      releaseUrl: null,
      notes: null,
      schemaVersion: null,
      migrations: [],
      error: "CFBLOG_UPDATE_CHECK_URL must be an absolute URL."
    };
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    return {
      latestVersion: null,
      tag: null,
      updateAvailable: false,
      sourceUrl,
      releaseUrl: null,
      notes: null,
      schemaVersion: null,
      migrations: [],
      error: "Update checks require HTTPS, except localhost during development."
    };
  }

  try {
    const response = await fetcher(url.toString(), {
      headers: { accept: "application/json, text/plain;q=0.8" }
    });
    if (!response.ok) {
      return {
        latestVersion: null,
        tag: null,
        updateAvailable: false,
        sourceUrl: url.toString(),
        releaseUrl: null,
        notes: null,
        schemaVersion: null,
        migrations: [],
        error: `Update check failed with HTTP ${response.status}.`
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        version?: unknown;
        latestVersion?: unknown;
        tag?: unknown;
        releaseUrl?: unknown;
        notes?: unknown;
        schemaVersion?: unknown;
        migrations?: unknown;
      };
      const latestVersion = stringOrNull(body.latestVersion) ?? stringOrNull(body.version);
      return buildInfo({
        sourceUrl: url.toString(),
        latestVersion,
        tag: stringOrNull(body.tag),
        releaseUrl: stringOrNull(body.releaseUrl),
        notes: stringOrNull(body.notes),
        schemaVersion: stringOrNull(body.schemaVersion),
        migrations: stringArray(body.migrations)
      });
    }

    const latestVersion = (await response.text()).trim().split(/\s+/)[0] ?? null;
    return buildInfo({
      sourceUrl: url.toString(),
      latestVersion: latestVersion || null,
      tag: null,
      releaseUrl: null,
      notes: null,
      schemaVersion: null,
      migrations: []
    });
  } catch (error) {
    return {
      latestVersion: null,
      tag: null,
      updateAvailable: false,
      sourceUrl: url.toString(),
      releaseUrl: null,
      notes: null,
      schemaVersion: null,
      migrations: [],
      error: error instanceof Error ? error.message : "Update check failed."
    };
  }
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim())
    : [];
}

function buildInfo(input: {
  sourceUrl: string;
  latestVersion: string | null;
  tag: string | null;
  releaseUrl: string | null;
  notes: string | null;
  schemaVersion: string | null;
  migrations: string[];
}): LatestVersionInfo {
  const expectsReleaseTag = input.schemaVersion != null || input.migrations.length > 0 || input.tag != null;
  const tagError =
    expectsReleaseTag && !isValidReleaseTag(input.tag)
      ? "Update manifest must include a release tag like v2026.05.1."
      : null;

  return {
    latestVersion: input.latestVersion,
    tag: input.tag,
    updateAvailable: tagError == null && input.latestVersion != null && input.latestVersion !== TEMPLATE_VERSION,
    sourceUrl: input.sourceUrl,
    releaseUrl: input.releaseUrl,
    notes: input.notes,
    schemaVersion: input.schemaVersion,
    migrations: input.migrations,
    error: tagError ?? (input.latestVersion ? null : "No version was found in the update response.")
  };
}

function isValidReleaseTag(value: string | null): boolean {
  return value != null && /^v\d{4}\.\d{2}\.\d+$/.test(value);
}
