import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { listPublishedPosts } from "../lib/db/posts";
import { getSetting } from "../lib/db/settings";
import { absoluteUrl, xmlEscape } from "../lib/seo";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
}

interface SiteSettings {
  title: string;
  description: string;
  language: string;
}

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const site =
    (await getSetting<SiteSettings>(runtimeEnv.CFBLOG_DB, "site")) ?? {
      title: "CFblog",
      description: "A Cloudflare-native Astro blog.",
      language: "en"
    };
  const posts = await listPublishedPosts(runtimeEnv.CFBLOG_DB, { limit: 50 });
  const siteUrl = absoluteUrl({ siteUrl: runtimeEnv.SITE_URL, path: "/" });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<rss version="2.0">\n` +
      `  <channel>\n` +
      `    <title>${xmlEscape(site.title)}</title>\n` +
      `    <description>${xmlEscape(site.description)}</description>\n` +
      `    <link>${xmlEscape(siteUrl)}</link>\n` +
      `    <language>${xmlEscape(site.language)}</language>\n` +
      posts
        .map((post) => {
          const postUrl = absoluteUrl({
            siteUrl: runtimeEnv.SITE_URL,
            path: post.full_path
          });

          return (
            `    <item>\n` +
            `      <title>${xmlEscape(post.title)}</title>\n` +
            `      <description>${xmlEscape(
              post.excerpt ?? post.seo_description ?? ""
            )}</description>\n` +
            `      <link>${xmlEscape(postUrl)}</link>\n` +
            `      <guid>${xmlEscape(postUrl)}</guid>\n` +
            `      <pubDate>${new Date(
              post.published_at ?? post.created_at
            ).toUTCString()}</pubDate>\n` +
            `    </item>`
          );
        })
        .join("\n") +
      `\n  </channel>\n` +
      `</rss>\n`,
    {
      headers: {
        "content-type": "application/rss+xml; charset=utf-8"
      }
    }
  );
};
