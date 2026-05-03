import type { CategoryRecord, PostRecord } from "../db/types";
import { absoluteUrl } from "../seo";
import type { AiTrafficSettings } from "./schema";

export interface SiteSummary {
  title: string;
  description: string;
  language?: string;
}

export interface AiTrafficContentInput {
  site: SiteSummary;
  siteUrl: string;
  settings: AiTrafficSettings;
  posts: PostRecord[];
  categories: CategoryRecord[];
}

function escapeText(value: string): string {
  return value.replaceAll("\r", " ").trim();
}

function markdownLink(label: string, href: string): string {
  return `- [${label.replaceAll("[", "").replaceAll("]", "")}](${href})`;
}

export function renderRobotsTxt(input: {
  siteUrl: string;
  settings: AiTrafficSettings;
}): string {
  const lines = ["User-agent: *", "Allow: /", ""];

  if (input.settings.robotsPolicy === "disallow-ai") {
    for (const agent of input.settings.aiUserAgents) {
      lines.push(`User-agent: ${agent}`, "Disallow: /", "");
    }
  }

  lines.push(
    `Sitemap: ${absoluteUrl({ siteUrl: input.siteUrl, path: "/sitemap.xml" })}`,
    ""
  );

  return lines.join("\n");
}

export function renderLlmsTxt(input: AiTrafficContentInput): string {
  const { site, siteUrl, settings, posts, categories } = input;
  const lines = [
    `# ${escapeText(site.title)}`,
    "",
    `> ${escapeText(settings.siteDescription || site.description)}`,
    "",
    "## Core",
    markdownLink("Homepage", absoluteUrl({ siteUrl, path: "/" })),
    markdownLink("RSS feed", absoluteUrl({ siteUrl, path: "/rss.xml" })),
    markdownLink("Sitemap", absoluteUrl({ siteUrl, path: "/sitemap.xml" })),
    "",
    "## Categories",
    ...categories
      .slice(0, 50)
      .map((category) =>
        markdownLink(category.name, absoluteUrl({ siteUrl, path: category.full_path }))
      ),
    "",
    "## Recent Posts",
    ...posts
      .slice(0, 50)
      .map((post) =>
        markdownLink(post.title, absoluteUrl({ siteUrl, path: post.full_path }))
      )
  ];

  if (settings.contactUrl || settings.contentLicenseUrl) {
    lines.push("", "## Policies");
    if (settings.contactUrl) {
      lines.push(markdownLink("Contact", settings.contactUrl));
    }
    if (settings.contentLicenseUrl) {
      lines.push(markdownLink("Content license", settings.contentLicenseUrl));
    }
  }

  lines.push("");
  return lines.join("\n");
}

export function renderLlmsFullTxt(input: AiTrafficContentInput): string {
  const lines = [
    renderLlmsTxt(input).trim(),
    "",
    "## Full Post Summaries",
    ...input.posts.slice(0, 100).flatMap((post) => [
      "",
      `### ${escapeText(post.title)}`,
      "",
      `URL: ${absoluteUrl({ siteUrl: input.siteUrl, path: post.full_path })}`,
      post.excerpt ? `Summary: ${escapeText(post.excerpt)}` : "",
      post.published_at ? `Published: ${post.published_at}` : ""
    ])
  ];

  lines.push("");
  return lines.join("\n");
}

export function renderCrawlersJson(input: AiTrafficContentInput): string {
  const { site, siteUrl, settings } = input;
  const payload = {
    version: "1.0",
    site: {
      name: site.title,
      url: absoluteUrl({ siteUrl, path: "/" }),
      description: settings.siteDescription || site.description,
      language: site.language ?? "en"
    },
    discovery: {
      sitemap: absoluteUrl({ siteUrl, path: "/sitemap.xml" }),
      robots: absoluteUrl({ siteUrl, path: "/robots.txt" }),
      llms: settings.llmsTxtEnabled
        ? absoluteUrl({ siteUrl, path: "/llms.txt" })
        : null,
      llmsFull: settings.llmsFullTxtEnabled
        ? absoluteUrl({ siteUrl, path: "/llms-full.txt" })
        : null
    },
    policy: {
      robotsPolicy: settings.robotsPolicy,
      aiUserAgents: settings.aiUserAgents,
      contact: settings.contactUrl,
      license: settings.contentLicenseUrl
    }
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
}
