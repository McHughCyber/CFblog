# Changelog

**Documentation map:** [README](README.md) lists tutorials, how-tos, and reference docs.

All notable CFblog template changes are tracked here.

## 0.1.0 - 2026-05-03

Initial MVP development line.

- Added Astro server rendering for Cloudflare Workers.
- Added D1 schema for posts, revisions, categories, menus, redirects, settings, media metadata, and schema tracking.
- Added R2-backed media upload and D1-guarded public media serving.
- Added Cloudflare Access JWT validation for admin routes and APIs.
- Added Markdown post editing, preview, revisions, publish states, nested categories, menu management, and theme customization.
- Added SEO endpoints and metadata: sitemap, RSS, robots, canonical URLs, Open Graph, Twitter cards, and JSON-LD.
- Added AI crawler guidance endpoints and settings: `robots.txt`, `llms.txt`, `llms-full.txt`, and `crawlers.json`.
- Added update strategy foundations: template/schema version constants, admin update status page, optional update-check endpoint, and upgrade docs.
- Remediated milestone review gaps for global SEO defaults, post Open Graph image rendering, category robots directives, and compatibility documentation aliases.
- Added optional Google Analytics and Google AdSense integrations with D1-backed settings, direct public tag rendering, Auto ads, fixed manual AdSense placements, and consent documentation.

## Compatibility

| Template version | Schema version          | Minimum migration         | Notes |
| ---------------- | ----------------------- | ------------------------- | ----- |
| 0.1.0            | 0006_integrations_settings | 0006_integrations_settings | MVP development baseline with SEO remediation, update status support, and optional Google integrations. |
