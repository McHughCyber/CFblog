# AI Crawler Management

CFblog includes public hint files for AI crawlers:

- `/robots.txt` always includes the sitemap and can optionally disallow configured AI crawler user agents.
- `/llms.txt` summarizes the site, categories, recent posts, and policy links in Markdown.
- `/llms-full.txt` adds recent post summaries for crawler and assistant context.
- `/crawlers.json` publishes machine-readable discovery and policy metadata.

These files help cooperative crawlers understand the site. They do not enforce access, billing, or crawler identity.

## Cloudflare AI Crawl Control

Use Cloudflare AI Crawl Control in the Cloudflare dashboard to monitor AI crawler traffic and manage crawler access at the zone layer.

According to Cloudflare docs, AI Crawl Control can show which AI crawlers are accessing a zone, report robots.txt violations, and block individual crawlers. On Free plans, detection is based on user agent strings; paid Bot Management support can provide stronger detection.

Official docs:

- https://developers.cloudflare.com/ai-crawl-control/get-started/
- https://developers.cloudflare.com/ai-crawl-control/features/manage-ai-crawlers/

## Pay Per Crawl

Pay Per Crawl is configured in Cloudflare AI Crawl Control, not in the Astro application. Cloudflare’s docs describe it as a closed beta that can charge verified AI crawlers for successful content access. Cloudflare also notes that WAF or Bot Management blocks override charging, so a blocked crawler will not reach the paid content flow.

Cloudflare documents some paths as always free to crawl for Pay Per Crawl discovery, including `/robots.txt`, `/sitemap.xml`, and `/crawlers.json`. CFblog serves those files at stable root paths.

Official docs:

- https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/what-is-pay-per-crawl/
- https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/use-pay-per-crawl-as-site-owner/set-a-pay-per-crawl-price/
- https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/use-pay-per-crawl-as-site-owner/advanced-configuration/

## Template Workflow

1. Deploy CFblog behind a proxied Cloudflare zone.
2. Open `/admin/settings` and review the AI crawler settings.
3. Choose whether `robots.txt` should allow all crawlers or disallow the listed AI crawler user agents.
4. Keep `/llms.txt`, `/llms-full.txt`, and `/crawlers.json` enabled unless you have a reason to hide crawler guidance.
5. Configure enforcement, blocking, charging, and Pay Per Crawl pricing in the Cloudflare dashboard.
