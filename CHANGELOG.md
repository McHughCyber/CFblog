# Changelog

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

## Compatibility

| Template version | Schema version          | Minimum migration         | Notes |
| ---------------- | ----------------------- | ------------------------- | ----- |
| 0.1.0            | 0004_update_strategy    | 0004_update_strategy      | MVP development baseline with update status support. |
