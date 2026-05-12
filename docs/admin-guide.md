# Admin guide

How site operators manage content and configuration through the **`/admin`** UI. Technical env and route lists: [Configuration reference](configuration-reference.md). Google Analytics and AdSense: [Google integrations](google-integrations.md). AI-facing files and Cloudflare crawler products: [AI crawlers](ai-crawlers.md).

## Dashboard (`/admin`)

Summary counts for published posts, drafts, scheduled and archived posts, categories, media assets, and redirects, with shortcuts into posts and categories.

## Posts (`/admin/posts`)

- **List** — filterable view of posts with status.
- **New** (`/admin/posts/new`) — create a post with title, slug, full path, Markdown body, excerpt, SEO fields, Open Graph image, categories, and status.
- **Edit** (`/admin/posts/{id}/edit`) — update content; saves create **revisions** when configured.
- **Preview** (`/admin/posts/{id}/preview`) — rendered preview of the post.

Statuses include **draft**, **published**, **scheduled**, and **archived**. **Scheduled** posts use a future **`scheduledAt`** (and server logic treats them according to the current implementation). Use drafts for work in progress.

## Categories (`/admin/categories`)

Nested categories drive URL structure under the catch-all public router. Each category has a path segment; combined segments form **`fullPath`** values used for posts (for example `/docs/guides`). Create and edit categories carefully to avoid breaking existing post URLs.

## Menus (`/admin/menus`)

Menus are keyed collections of links used by the theme. Edit menu items for labels, URLs, order, and visibility from the menu key screens.

## Media (`/admin/media`)

Upload images and attachments. Public URLs follow **`/media/{id}`** where `id` is the media asset identifier stored in D1; the Worker serves bytes from R2 when `public_path` matches `/media/{id}`.

## Theme (`/admin/theme`)

Adjust theme-level options (colours, typography, layout toggles as exposed by the template). Persisted via the admin theme API.

## Settings (`/admin/settings`)

- **Site** — site title, description, baseline SEO, and related defaults.
- **AI traffic / crawlers** — controls content for `/robots.txt`, `/llms.txt`, `/llms-full.txt`, and `/crawlers.json` (cooperative crawlers only; zone-level enforcement remains in the Cloudflare dashboard — see [AI crawlers](ai-crawlers.md)).
- **Google integrations** — GA4 and AdSense IDs and modes (see [Google integrations](google-integrations.md)). Admin pages do not load Analytics tags.

## Update (`/admin/update`)

Shows installed template and schema markers, optional upstream version check results, and migration visibility. Full operator checklist: [UPGRADING.md](../UPGRADING.md) and [Operations](operations.md).
