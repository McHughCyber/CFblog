import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { listCategories } from "../lib/db/categories";
import { listPublishedPosts } from "../lib/db/posts";
import { absoluteUrl, xmlEscape } from "../lib/seo";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
}

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const [posts, categories] = await Promise.all([
    listPublishedPosts(runtimeEnv.CFBLOG_DB, { limit: 1000 }),
    listCategories(runtimeEnv.CFBLOG_DB)
  ]);

  const urls = [
    {
      loc: absoluteUrl({ siteUrl: runtimeEnv.SITE_URL, path: "/" }),
      lastmod: new Date().toISOString()
    },
    ...categories.map((category) => ({
      loc: absoluteUrl({
        siteUrl: runtimeEnv.SITE_URL,
        path: category.full_path
      }),
      lastmod: category.updated_at
    })),
    ...posts.map((post) => ({
      loc: absoluteUrl({ siteUrl: runtimeEnv.SITE_URL, path: post.full_path }),
      lastmod: post.updated_at
    }))
  ];

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (url) =>
            `  <url><loc>${xmlEscape(url.loc)}</loc><lastmod>${xmlEscape(
              url.lastmod
            )}</lastmod></url>`
        )
        .join("\n") +
      `\n</urlset>\n`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8"
      }
    }
  );
};
