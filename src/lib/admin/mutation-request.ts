function normalizeSiteOrigin(siteUrl: string): string {
  try {
    const url = new URL(siteUrl);
    return url.origin;
  } catch {
    return "";
  }
}

function requestOrigin(request: Request): string | null {
  const origin = request.headers.get("Origin");
  if (origin) {
    return origin;
  }

  const referer = request.headers.get("Referer");
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export interface TrustedMutationOptions {
  /** When true, allow any localhost origin so local `astro dev` can call APIs while SITE_URL targets wrangler. */
  allowLocalhostOrigin?: boolean;
}

/**
 * Rejects cross-site mutation requests when SITE_URL is a valid absolute URL.
 * Admin calls from the same deployment pass Origin or Referer checks.
 */
export function isTrustedAdminMutation(
  request: Request,
  siteUrl: string,
  options: TrustedMutationOptions = {}
): boolean {
  if (request.method === "GET" || request.method === "HEAD") {
    return true;
  }

  const expected = normalizeSiteOrigin(siteUrl);
  if (!expected) {
    return true;
  }

  const actual = requestOrigin(request);
  if (!actual) {
    return false;
  }

  if (actual === expected) {
    return true;
  }

  if (options.allowLocalhostOrigin) {
    try {
      const originUrl = new URL(actual);
      if (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") {
        return true;
      }
    } catch {
      /* ignore */
    }
  }

  return false;
}
