import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { loadAiTrafficSettings } from "../lib/ai-traffic/load";
import { renderLlmsFullTxt, type SiteSummary } from "../lib/ai-traffic/render";
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
    listPublishedPosts(runtimeEnv.CFBLOG_DB, { limit: 100 }),
    listCategories(runtimeEnv.CFBLOG_DB)
  ]);

  if (!settings.llmsFullTxtEnabled) {
    return new Response("llms-full.txt is disabled.\n", { status: 404 });
  }

  return new Response(
    renderLlmsFullTxt({
      site: site ?? fallbackSite,
      siteUrl: runtimeEnv.SITE_URL,
      settings,
      posts,
      categories
    }),
    {
      headers: { "content-type": "text/plain; charset=utf-8" }
    }
  );
};
