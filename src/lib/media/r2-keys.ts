const YEAR = () => new Date().getUTCFullYear();

/**
 * Collision-resistant R2 key: year prefix, UUID, then sanitised original name.
 */
export function buildMediaR2Key(assetId: string, originalFileName: string): string {
  const safe = sanitiseFileName(originalFileName);
  return `media/${YEAR()}/${assetId}-${safe}`;
}

export function publicPathForMediaAsset(assetId: string): string {
  return `/media/${assetId}`;
}

export function sanitiseFileName(name: string): string {
  const base = name.replace(/^.*[/\\]/, "").trim() || "upload";
  const withoutExt = base.replace(/\.[^.]+$/, "");
  const slug = withoutExt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80);
  return slug || "file";
}
