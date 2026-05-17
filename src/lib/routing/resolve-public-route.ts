import { getCategoryByFullPath } from "../db/categories";
import { getPublishedPostByFullPath } from "../db/posts";
import { getRedirectByFromPath } from "../db/redirects";
import type { CategoryRecord, PostRecord, RedirectRecord } from "../db/types";

export type PublicRouteResult =
  | { kind: "post"; post: PostRecord }
  | { kind: "category"; category: CategoryRecord }
  | { kind: "redirect"; redirect: RedirectRecord }
  | { kind: "not_found" };

/**
 * Resolves a normalised public path to post, category, redirect, or not found.
 * Content (post, category) takes precedence over redirect records.
 */
export async function resolvePublicRoute(
  database: D1Database,
  requestedPath: string
): Promise<PublicRouteResult> {
  const post = await getPublishedPostByFullPath(database, requestedPath);
  if (post) {
    return { kind: "post", post };
  }

  const category = await getCategoryByFullPath(database, requestedPath);
  if (category) {
    return { kind: "category", category };
  }

  const redirect = await getRedirectByFromPath(database, requestedPath);
  if (redirect) {
    return { kind: "redirect", redirect };
  }

  return { kind: "not_found" };
}
