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

## Redirects (`/admin/redirects`)

Manage path-based URL redirects stored in D1. Use this when migrating from another platform (for example WordPress) or when you need a manual mapping that is not covered by automatic slug changes.

- **List** (`/admin/redirects`) — search, edit, delete, and import redirects.
- **New** (`/admin/redirects/new`) — create a redirect from a legacy path to a CFblog `full_path`.
- **Edit** (`/admin/redirects/{id}/edit`) — update the destination path, status code, or note. The from path is fixed after creation.

When you change a post or category **full path** inside CFblog, a **301** redirect from the old path is created automatically. Manual and imported redirects use the same table.

### CSV import

Import from the list page. Format (header row optional):

```text
from_path,to_path,status_code,note
/2024/05/old-article,/guides/new-article,301,WP post 42
/feed/,/rss.xml,301,RSS
```

- **from_path** — legacy URL path (normalised to lowercase, no trailing slash).
- **to_path** — internal CFblog path (must start with `/`).
- **status_code** — `301`, `302`, `307`, or `308` (default `301` for SEO migrations).
- **note** — optional operator reference.

Maximum **2000** rows per import request. Re-importing the same `from_path` updates the destination (upsert).

### WordPress migration tips

1. Export or list old permalink paths from WordPress (path only, not `?p=` query URLs).
2. For each migrated article, set the CFblog post **full path**, then add a redirect from the old WordPress path to that `full_path`.
3. Add site-level redirects as needed (for example `/feed/` → `/rss.xml`).

Query-style WordPress URLs (`/?p=123`) are not handled by the redirect table in v1; use path-based permalinks or zone-level rules if those URLs still receive traffic.

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
