const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeFullPath(input: string): string {
  let path = input.trim().replace(/\s+/g, "");
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  path = path.replace(/\/+/g, "/");
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return path;
}

export function buildCategoryFullPath(
  parentFullPath: string | null | undefined,
  slug: string
): string {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!cleanSlug) {
    return "/";
  }
  if (parentFullPath == null || parentFullPath === "") {
    return normalizeFullPath(`/${cleanSlug}`);
  }
  const base = normalizeFullPath(parentFullPath);
  if (base === "/") {
    return `/${cleanSlug}`;
  }
  return `${base}/${cleanSlug}`;
}

export function buildPostFullPath(categoryFullPath: string, slug: string): string {
  const base = normalizeFullPath(categoryFullPath);
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!cleanSlug) {
    return base;
  }
  if (base === "/") {
    return `/${cleanSlug}`;
  }
  return `${base}/${cleanSlug}`;
}

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

export function slugFromTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "post";
}
