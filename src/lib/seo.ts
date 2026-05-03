export interface SiteUrlOptions {
  siteUrl: string;
  path?: string;
}

export function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, "");
}

export function absoluteUrl({ siteUrl, path = "/" }: SiteUrlOptions): string {
  const normalizedSite = normalizeSiteUrl(siteUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedSite}${normalizedPath}`;
}

export function xmlEscape(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
