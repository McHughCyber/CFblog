import { TEMPLATE_VERSION } from "../version";

export interface LatestVersionInfo {
  latestVersion: string | null;
  updateAvailable: boolean;
  sourceUrl: string | null;
  releaseUrl: string | null;
  notes: string | null;
  error: string | null;
}

export async function checkLatestVersion(
  sourceUrl?: string | null,
  fetcher: typeof fetch = fetch
): Promise<LatestVersionInfo> {
  if (!sourceUrl) {
    return {
      latestVersion: null,
      updateAvailable: false,
      sourceUrl: null,
      releaseUrl: null,
      notes: null,
      error: "CFBLOG_UPDATE_CHECK_URL is not configured."
    };
  }

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return {
      latestVersion: null,
      updateAvailable: false,
      sourceUrl,
      releaseUrl: null,
      notes: null,
      error: "CFBLOG_UPDATE_CHECK_URL must be an absolute URL."
    };
  }

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    return {
      latestVersion: null,
      updateAvailable: false,
      sourceUrl,
      releaseUrl: null,
      notes: null,
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
        updateAvailable: false,
        sourceUrl: url.toString(),
        releaseUrl: null,
        notes: null,
        error: `Update check failed with HTTP ${response.status}.`
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await response.json()) as {
        version?: unknown;
        latestVersion?: unknown;
        releaseUrl?: unknown;
        notes?: unknown;
      };
      const latestVersion = stringOrNull(body.latestVersion) ?? stringOrNull(body.version);
      return buildInfo(url.toString(), latestVersion, stringOrNull(body.releaseUrl), stringOrNull(body.notes));
    }

    const latestVersion = (await response.text()).trim().split(/\s+/)[0] ?? null;
    return buildInfo(url.toString(), latestVersion || null, null, null);
  } catch (error) {
    return {
      latestVersion: null,
      updateAvailable: false,
      sourceUrl: url.toString(),
      releaseUrl: null,
      notes: null,
      error: error instanceof Error ? error.message : "Update check failed."
    };
  }
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildInfo(
  sourceUrl: string,
  latestVersion: string | null,
  releaseUrl: string | null,
  notes: string | null
): LatestVersionInfo {
  return {
    latestVersion,
    updateAvailable: latestVersion != null && latestVersion !== TEMPLATE_VERSION,
    sourceUrl,
    releaseUrl,
    notes,
    error: latestVersion ? null : "No version was found in the update response."
  };
}
