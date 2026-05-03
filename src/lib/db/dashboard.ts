import { all, first } from "./client";

export interface AdminDashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  archivedPosts: number;
  categories: number;
  mediaAssets: number;
  redirects: number;
}

export async function getAdminDashboardStats(
  database: D1Database
): Promise<AdminDashboardStats> {
  const [postRows, categories, mediaAssets, redirects] = await Promise.all([
    all<{ status: string; total: number }>(
      database,
      "SELECT status, COUNT(*) AS total FROM posts GROUP BY status"
    ),
    first<{ total: number }>(
      database,
      "SELECT COUNT(*) AS total FROM categories"
    ),
    first<{ total: number }>(
      database,
      "SELECT COUNT(*) AS total FROM media_assets"
    ),
    first<{ total: number }>(
      database,
      "SELECT COUNT(*) AS total FROM redirects"
    )
  ]);
  const postCounts = Object.fromEntries(
    postRows.map((row) => [row.status, row.total])
  );

  return {
    totalPosts: postRows.reduce((total, row) => total + row.total, 0),
    publishedPosts: postCounts.published ?? 0,
    draftPosts: postCounts.draft ?? 0,
    scheduledPosts: postCounts.scheduled ?? 0,
    archivedPosts: postCounts.archived ?? 0,
    categories: categories?.total ?? 0,
    mediaAssets: mediaAssets?.total ?? 0,
    redirects: redirects?.total ?? 0
  };
}
