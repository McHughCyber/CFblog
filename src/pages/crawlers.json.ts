import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { loadAiTrafficSettings } from "../lib/ai-traffic/load";
import { renderCrawlersJson, type SiteSummary } from "../lib/ai-traffic/render";
import { listCategories } from "../lib/db/categories";
import { listPublishedPosts } from "../lib/db/posts";
import { getSetting } from "../lib/db/settings";

interface RuntimeEnv {
  CFBLOG_DB: D1Database;
  SITE_URL: string;
}

const fallbackSite: SiteSummary = {
  title: "CFblog",
  description: "A Cloudflare-native Astro blog.",
  language: "en"
};

export const GET: APIRoute = async () => {
  const runtimeEnv = env as RuntimeEnv;
  const [settings, site, posts, categories] = await Promise.all([
    loadAiTrafficSettings(runtimeEnv.CFBLOG_DB),
    getSetting<SiteSummary>(runtimeEnv.CFBLOG_DB, "site"),
    listPublishedPosts(runtimeEnv.CFBLOG_DB, { limit: 50 }),
    listCategories(runtimeEnv.CFBLOG_DB)
  ]);

  if (!settings.crawlersJsonEnabled) {
    return new Response(JSON.stringify({ error: "crawlers.json is disabled" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" }
    });
  }

  return new Response(
    renderCrawlersJson({
      site: site ?? fallbackSite,
      siteUrl: runtimeEnv.SITE_URL,
      settings,
      posts,
      categories
    }),
    {
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
};
