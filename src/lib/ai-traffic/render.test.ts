import { describe, expect, it } from "vitest";
import { DEFAULT_AI_TRAFFIC, mergeAiTrafficSettings } from "./schema";
import { renderCrawlersJson, renderLlmsTxt, renderRobotsTxt } from "./render";
import type { CategoryRecord, PostRecord } from "../db/types";

const post: PostRecord = {
  id: "post-1",
  title: "Launch Notes",
  slug: "launch-notes",
  full_path: "/notes/launch-notes",
  markdown_body: "Body",
  excerpt: "A short launch summary.",
  status: "published",
  published_at: "2026-05-03T00:00:00.000Z",
  scheduled_at: null,
  created_at: "2026-05-03T00:00:00.000Z",
  updated_at: "2026-05-03T00:00:00.000Z",
  seo_title: null,
  seo_description: null,
  canonical_url: null,
  og_image_asset_id: null,
  robots_directive: null,
  author_name: null,
  rendered_html_cache: null,
  rendered_html_cache_updated_at: null
};

const category: CategoryRecord = {
  id: "cat-1",
  parent_id: null,
  name: "Notes",
  slug: "notes",
  full_path: "/notes",
  description: null,
  seo_title: null,
  seo_description: null,
  sort_order: 0,
  created_at: "2026-05-03T00:00:00.000Z",
  updated_at: "2026-05-03T00:00:00.000Z"
};

describe("AI traffic render helpers", () => {
  it("keeps robots permissive by default", () => {
    expect(
      renderRobotsTxt({
        siteUrl: "https://example.com",
        settings: DEFAULT_AI_TRAFFIC
      })
    ).toContain("User-agent: *\nAllow: /\n");
  });

  it("can add disallow groups for configured AI crawlers", () => {
    const settings = mergeAiTrafficSettings(DEFAULT_AI_TRAFFIC, {
      robotsPolicy: "disallow-ai",
      aiUserAgents: ["GPTBot"]
    });

    expect(renderRobotsTxt({ siteUrl: "https://example.com", settings })).toContain(
      "User-agent: GPTBot\nDisallow: /"
    );
  });

  it("renders llms.txt with public discovery links", () => {
    const output = renderLlmsTxt({
      site: {
        title: "Example",
        description: "Example site",
        language: "en"
      },
      siteUrl: "https://example.com",
      settings: DEFAULT_AI_TRAFFIC,
      posts: [post],
      categories: [category]
    });

    expect(output).toContain("# Example");
    expect(output).toContain("[Launch Notes](https://example.com/notes/launch-notes)");
  });

  it("renders crawlers.json as parseable policy JSON", () => {
    const output = renderCrawlersJson({
      site: {
        title: "Example",
        description: "Example site",
        language: "en"
      },
      siteUrl: "https://example.com",
      settings: DEFAULT_AI_TRAFFIC,
      posts: [post],
      categories: [category]
    });

    expect(JSON.parse(output).discovery.sitemap).toBe("https://example.com/sitemap.xml");
  });
});
