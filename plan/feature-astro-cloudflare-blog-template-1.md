---
goal: Build an Astro blog template deployable to Cloudflare Workers with Markdown publishing, admin editing, nested categories, media uploads, Cloudflare Access protection, SEO, theming, and update support.
version: 1.0
date_created: 2026-05-03
last_updated: 2026-05-03
owner: TBD
status: Planned
tags: [feature, architecture, astro, cloudflare, workers, d1, r2, markdown, cms, blog-template]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This plan defines the complete MVP roadmap for an Astro blog template deployed as a Cloudflare Workers application. The MVP provides a Markdown-based publishing workflow, a Cloudflare Access-protected admin panel, nested categories, configurable menus, customizable slugs and SEO paths, R2-backed image uploads, theme customization, AI crawler management documentation, and a maintainable update strategy.

The target product is a reusable public starter template that can be launched through a Deploy to Cloudflare button and then managed by the site owner without editing source code for routine publishing tasks.

## 1. Requirements & Constraints

- **REQ-001**: The template must deploy as a Cloudflare Workers application.
- **REQ-002**: The repository must include a Deploy to Cloudflare button in `README.md`.
- **REQ-003**: The public blog must render Astro pages through the Cloudflare adapter.
- **REQ-004**: Blog articles must be authored and stored as Markdown.
- **REQ-005**: The admin panel must include a Markdown editor with preview.
- **REQ-006**: Articles must support `draft`, `published`, `scheduled`, and `archived` states.
- **REQ-007**: Articles must support custom slugs.
- **REQ-008**: Articles must support custom canonical public paths.
- **REQ-009**: Categories must support nested parent-child hierarchy.
- **REQ-010**: Categories must support custom slugs.
- **REQ-011**: Categories must support custom public paths generated from hierarchy.
- **REQ-012**: Blog menus must be configurable from the admin panel.
- **REQ-013**: Menu items must support custom URLs, posts, categories, nesting, sorting, and external-link behavior.
- **REQ-014**: Uploaded images and attachments must be stored in Cloudflare R2.
- **REQ-015**: Uploaded images must be insertable into Markdown content.
- **REQ-016**: Theme settings must be configurable without editing source code.
- **REQ-017**: SEO metadata must be configurable per post and category.
- **REQ-018**: The app must generate `sitemap.xml`.
- **REQ-019**: The app must generate `rss.xml`.
- **REQ-020**: The app must generate `robots.txt`.
- **REQ-021**: The app must support redirect records for changed slugs and changed paths.
- **REQ-022**: The app must include update and migration documentation.
- **REQ-023**: The app must document Cloudflare AI Crawl Control and Pay Per Crawl setup.
- **REQ-024**: The MVP must include seed content so a fresh deployment has a usable example site.
- **REQ-025**: The MVP must include a visible template version and schema version.
- **SEC-001**: `/admin/*` routes must be protected by Cloudflare Access.
- **SEC-002**: Server-side admin routes must validate the `Cf-Access-Jwt-Assertion` JWT.
- **SEC-003**: Admin API endpoints must validate the `Cf-Access-Jwt-Assertion` JWT.
- **SEC-004**: Admin API endpoints must reject unauthenticated requests with `403`.
- **SEC-005**: Uploaded files must be validated by MIME type.
- **SEC-006**: Uploaded file names must be normalized and collision-resistant.
- **SEC-007**: Markdown rendering must sanitize unsafe HTML or use an explicit allowlist.
- **SEC-008**: Admin mutation routes must avoid cross-site request forgery risk by requiring authenticated same-origin requests and non-GET mutation methods.
- **SEC-009**: Secrets must be configured through Worker secrets or documented environment variables.
- **SEC-010**: Public routes must never expose draft, scheduled-before-time, or archived content.
- **SEC-011**: R2 object serving must not allow arbitrary object enumeration.
- **SEC-012**: Cloudflare Access JWT validation must verify issuer and audience.
- **CON-001**: Deploy to Cloudflare buttons target Workers applications, not Cloudflare Pages-only applications.
- **CON-002**: Cloudflare bindings must be declared in `wrangler.jsonc` or `wrangler.toml`.
- **CON-003**: D1 migrations must be runnable locally and remotely.
- **CON-004**: Pay Per Crawl is configured at the Cloudflare zone and AI Crawl Control layer, not inside the Astro application.
- **CON-005**: The MVP must avoid requiring private source repositories.
- **CON-006**: The MVP must avoid arbitrary browser-authored MDX execution.
- **CON-007**: The MVP must avoid browser-editable Astro templates.
- **GUD-001**: Use Astro server output with the Cloudflare adapter.
- **GUD-002**: Use D1 as the canonical store for posts, categories, menus, redirects, settings, revisions, and media metadata.
- **GUD-003**: Use R2 as the canonical store for uploaded media objects and attachments.
- **GUD-004**: Use KV only for optional low-risk cache acceleration, not canonical content.
- **GUD-005**: Use structured path generation helpers for slugs and URLs.
- **GUD-006**: Keep the MVP single-tenant.
- **GUD-007**: Keep theme customization bounded to presets, CSS variables, logo, favicon, colors, typography, homepage layout, post listing layout, and optional custom CSS.
- **GUD-008**: Create a usable publishing loop before adding advanced customization.
- **GUD-009**: Document feature limitations clearly in `README.md` and `docs/`.
- **PAT-001**: Store canonical content in D1 and render through Astro routes.
- **PAT-002**: Store uploaded media bytes in R2 and store searchable media metadata in D1.
- **PAT-003**: Create redirects automatically when user-visible paths change.
- **PAT-004**: Treat Cloudflare Access as the authentication perimeter and Worker JWT validation as the server-side trust check.
- **PAT-005**: Treat app updates as Git-based source updates plus D1 migrations.

## 2. Implementation Steps

### Implementation Phase 0: Project Definition

- GOAL-000: Finalize scope, repository conventions, non-goals, and MVP success criteria.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0001 | Define the public repository name. Recommended value: `astro-cloudflare-blog-template`. |  |  |
| TASK-0002 | Select package manager. Recommended value: `pnpm`. |  |  |
| TASK-0003 | Document MVP non-goals in `README.md`: no multi-tenant SaaS, no visual page builder, no arbitrary MDX, no in-app code self-update. |  |  |
| TASK-0004 | Document supported Cloudflare products in `README.md`: Workers, D1, R2, Access, optional KV, AI Crawl Control documentation. |  |  |
| TASK-0005 | Define MVP content types as posts and categories only. |  |  |
| TASK-0006 | Define MVP admin authorization as any validated Cloudflare Access user. |  |  |
| TASK-0007 | Define release target as a working `*.workers.dev` deployment with custom-domain compatibility. |  |  |
| TASK-0008 | Add the MVP release checklist from this plan to `PROGRESS.md`. | ✅ | 2026-05-03 |

Completion criteria:

- Scope is documented.
- Non-goals are documented.
- Supported Cloudflare products are documented.
- MVP success criteria are documented.

### Implementation Phase 1: Base Astro And Cloudflare Worker Setup

- GOAL-001: Create the deployable application foundation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0101 | Initialize an Astro project with TypeScript in the repository root. |  |  |
| TASK-0102 | Install and configure the Astro Cloudflare adapter in `astro.config.mjs`. |  |  |
| TASK-0103 | Configure Astro server output for Worker runtime rendering. |  |  |
| TASK-0104 | Create `wrangler.jsonc` with Worker name, compatibility date, D1 binding, R2 binding, and optional KV binding. |  |  |
| TASK-0105 | Add `package.json` scripts: `dev`, `build`, `preview`, `deploy`, `db:migrations:apply`, and `test`. |  |  |
| TASK-0106 | Add a Deploy to Cloudflare button to `README.md`. |  |  |
| TASK-0107 | Add Cloudflare binding descriptions in `package.json` under `cloudflare.bindings`. |  |  |
| TASK-0108 | Add `.dev.vars.example` with `CF_ACCESS_TEAM_DOMAIN`, `CF_ACCESS_AUD`, `SITE_URL`, and optional cache settings. |  |  |
| TASK-0109 | Verify `pnpm build` succeeds locally. |  |  |
| TASK-0110 | Verify Worker deployment validation succeeds with Wrangler. |  |  |

Completion criteria:

- The Astro app builds.
- Worker configuration exists.
- Required Cloudflare bindings are declared.
- The deploy button is present.
- Local development instructions exist.

### Implementation Phase 2: Database Schema And Migrations

- GOAL-002: Build durable D1 storage for posts, categories, menus, media metadata, redirects, settings, revisions, and schema versions.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0201 | Create `migrations/0001_initial_schema.sql` with all MVP tables. |  |  |
| TASK-0202 | Create `migrations/0002_seed_defaults.sql` with default settings, menus, category, and example post. |  |  |
| TASK-0203 | Create `src/lib/db/client.ts` for typed D1 access. |  |  |
| TASK-0204 | Create `src/lib/db/posts.ts` for post queries and mutations. |  |  |
| TASK-0205 | Create `src/lib/db/categories.ts` for category queries and mutations. |  |  |
| TASK-0206 | Create `src/lib/db/menus.ts` for menu queries and mutations. |  |  |
| TASK-0207 | Create `src/lib/db/media.ts` for media metadata queries and mutations. |  |  |
| TASK-0208 | Create `src/lib/db/redirects.ts` for redirect lookup and insertion. |  |  |
| TASK-0209 | Create `src/lib/db/settings.ts` for JSON settings read and write operations. |  |  |
| TASK-0210 | Enforce unique post `full_path` values. |  |  |
| TASK-0211 | Enforce unique category `full_path` values. |  |  |
| TASK-0212 | Insert redirect records when post slugs or category paths change. |  |  |
| TASK-0213 | Store installed schema version in `settings`. |  |  |

Required tables:

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  full_path TEXT NOT NULL UNIQUE,
  markdown_body TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL,
  published_at TEXT,
  scheduled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  og_image_asset_id TEXT,
  robots_directive TEXT,
  author_name TEXT,
  rendered_html_cache TEXT,
  rendered_html_cache_updated_at TEXT
);

CREATE TABLE post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  markdown_body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by_email TEXT,
  revision_note TEXT
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  full_path TEXT NOT NULL UNIQUE,
  description TEXT,
  seo_title TEXT,
  seo_description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE post_categories (
  post_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE menus (
  id TEXT PRIMARY KEY,
  menu_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL,
  parent_id TEXT,
  label TEXT NOT NULL,
  item_type TEXT NOT NULL,
  target TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  open_in_new_tab INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  r2_key TEXT NOT NULL UNIQUE,
  public_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  created_at TEXT NOT NULL,
  created_by_email TEXT
);

CREATE TABLE redirects (
  id TEXT PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

Completion criteria:

- A fresh D1 database can be created from migrations.
- Seed data loads.
- Public app can read seed post, category, menu, and settings data.
- Slug and path uniqueness is enforced.

### Implementation Phase 3: Public Blog Rendering

- GOAL-003: Render published content from D1 through Astro routes.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0301 | Implement `src/pages/index.astro` to list latest published posts. |  |  |
| TASK-0302 | Implement dynamic post route that resolves posts by `full_path`. |  |  |
| TASK-0303 | Implement dynamic category archive route that resolves categories by `full_path`. |  |  |
| TASK-0304 | Implement nested category breadcrumbs. |  |  |
| TASK-0305 | Implement a public 404 page. |  |  |
| TASK-0306 | Implement redirect lookup before 404. |  |  |
| TASK-0307 | Create `src/lib/markdown/renderMarkdown.ts`. |  |  |
| TASK-0308 | Create `src/lib/markdown/sanitizeHtml.ts`. |  |  |
| TASK-0309 | Add syntax highlighting if included in MVP dependencies. |  |  |
| TASK-0310 | Implement post listing pagination. |  |  |
| TASK-0311 | Implement category archive pagination. |  |  |
| TASK-0312 | Ensure public queries filter out draft, archived, and future scheduled content. |  |  |

Completion criteria:

- Published posts render from D1.
- Draft posts are inaccessible publicly.
- Nested category URLs render.
- Redirects work.
- Markdown renders safely.

### Implementation Phase 4: SEO Foundation

- GOAL-004: Provide complete MVP SEO support.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0401 | Add global site metadata settings: title, description, default OG image, base URL, language, and author. |  |  |
| TASK-0402 | Add post metadata rendering for title, description, canonical URL, OG image, robots directive, and publish dates. |  |  |
| TASK-0403 | Add category metadata rendering for title, description, canonical URL, and robots directive. |  |  |
| TASK-0404 | Create `src/pages/sitemap.xml.ts` from published posts and categories. |  |  |
| TASK-0405 | Create `src/pages/rss.xml.ts` from published posts. |  |  |
| TASK-0406 | Create `src/pages/robots.txt.ts` from settings. |  |  |
| TASK-0407 | Add JSON-LD `BlogPosting` output for posts. |  |  |
| TASK-0408 | Add canonical link output on public pages. |  |  |
| TASK-0409 | Add Open Graph metadata. |  |  |
| TASK-0410 | Add Twitter card metadata. |  |  |
| TASK-0411 | Add pagination metadata for archive pages. |  |  |

Completion criteria:

- SEO metadata is present on posts, categories, homepage, and archives.
- Sitemap only includes public published URLs.
- RSS only includes published posts.
- Canonical URLs are stable.

### Implementation Phase 5: Cloudflare Access Admin Protection

- GOAL-005: Protect administrative routes and APIs with Cloudflare Access JWT validation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0501 | Create `docs/cloudflare-access.md` with required Access application setup for `/admin/*`. |  |  |
| TASK-0502 | Add environment variables `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` to `.dev.vars.example`. |  |  |
| TASK-0503 | Create `src/lib/access/validateAccessJwt.ts`. |  |  |
| TASK-0504 | Validate `Cf-Access-Jwt-Assertion` on all `/admin/*` routes. |  |  |
| TASK-0505 | Validate `Cf-Access-Jwt-Assertion` on all `/api/admin/*` routes. |  |  |
| TASK-0506 | Extract user email from validated JWT payload. |  |  |
| TASK-0507 | Add authenticated user display to admin layout. |  |  |
| TASK-0508 | Add admin unauthorized and forbidden error states. |  |  |
| TASK-0509 | Add tests for missing, malformed, wrong-audience, and valid JWT paths. |  |  |

Completion criteria:

- Admin pages reject missing JWTs.
- Admin APIs reject missing JWTs.
- Valid Access users can use admin.
- User identity is available for audit fields.

### Implementation Phase 6: Admin Layout And Navigation

- GOAL-006: Build a usable admin shell.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0601 | Create `src/pages/admin/index.astro` dashboard route. |  |  |
| TASK-0602 | Create `src/layouts/AdminLayout.astro`. |  |  |
| TASK-0603 | Add sidebar navigation entries for Posts, Categories, Media, Menus, Theme, Settings, and Updates. |  |  |
| TASK-0604 | Add dashboard statistics for published posts, drafts, scheduled posts, categories, and media assets. |  |  |
| TASK-0605 | Add admin loading, empty, and error states. |  |  |
| TASK-0606 | Create reusable form components for text fields, selects, toggles, text areas, and action buttons. |  |  |
| TASK-0607 | Add reusable save, archive, delete, and confirmation patterns. |  |  |
| TASK-0608 | Verify admin shell layout on mobile and desktop. |  |  |

Completion criteria:

- Admin shell exists.
- All MVP admin sections are reachable.
- Admin UI works on desktop and mobile.
- Admin identity is visible.

### Implementation Phase 7: Markdown Post Editor

- GOAL-007: Create the core publishing workflow.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0701 | Create admin post list page. |  |  |
| TASK-0702 | Add post filters for status, category, and search term. |  |  |
| TASK-0703 | Create new post route. |  |  |
| TASK-0704 | Create edit post route. |  |  |
| TASK-0705 | Add Markdown text editor. |  |  |
| TASK-0706 | Add live preview panel. |  |  |
| TASK-0707 | Add title, slug, full path, excerpt, status, scheduled date, and publish date fields. |  |  |
| TASK-0708 | Add SEO panel fields. |  |  |
| TASK-0709 | Add category assignment UI. |  |  |
| TASK-0710 | Add primary category selector. |  |  |
| TASK-0711 | Add save draft action. |  |  |
| TASK-0712 | Add publish action. |  |  |
| TASK-0713 | Add unpublish action. |  |  |
| TASK-0714 | Add archive action. |  |  |
| TASK-0715 | Add revision creation on save. |  |  |
| TASK-0716 | Add revision list view. |  |  |
| TASK-0717 | Add restore revision action. |  |  |
| TASK-0718 | Add validation errors for slug and path conflicts. |  |  |
| TASK-0719 | Add public preview route for authenticated drafts. |  |  |

Completion criteria:

- Admin can create, edit, preview, publish, unpublish, and archive Markdown posts.
- Revisions are created.
- Slug conflicts are blocked.
- Category assignment works.
- Public route updates after publish.

### Implementation Phase 8: Nested Category Management

- GOAL-008: Support category hierarchy and category SEO.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0801 | Create category list page. |  |  |
| TASK-0802 | Display nested category tree. |  |  |
| TASK-0803 | Create category create form. |  |  |
| TASK-0804 | Create category edit form. |  |  |
| TASK-0805 | Add parent category selector. |  |  |
| TASK-0806 | Add slug field. |  |  |
| TASK-0807 | Compute category `full_path`. |  |  |
| TASK-0808 | Recompute child category paths when a parent path changes. |  |  |
| TASK-0809 | Recompute affected post paths if the configured URL pattern depends on category path. |  |  |
| TASK-0810 | Create redirects for changed category paths. |  |  |
| TASK-0811 | Prevent circular category parent relationships. |  |  |
| TASK-0812 | Add category SEO fields. |  |  |
| TASK-0813 | Add tests for nested paths and circular parent prevention. |  |  |

Completion criteria:

- Nested categories can be created and edited.
- Circular hierarchy is impossible.
- Category paths are unique.
- Changing category slugs creates redirects.

### Implementation Phase 9: Menu Management

- GOAL-009: Allow customizable blog navigation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-0901 | Create menu list page. |  |  |
| TASK-0902 | Seed default menus with `primary` and `footer`. |  |  |
| TASK-0903 | Create menu item editor. |  |  |
| TASK-0904 | Support menu item types: custom URL, post, and category. |  |  |
| TASK-0905 | Support nested menu items. |  |  |
| TASK-0906 | Support sort ordering. |  |  |
| TASK-0907 | Support open-in-new-tab flag. |  |  |
| TASK-0908 | Render primary menu in public header. |  |  |
| TASK-0909 | Render footer menu in public footer. |  |  |
| TASK-0910 | Add validation for broken menu targets. |  |  |

Completion criteria:

- Admin can customize menus.
- Public navigation reflects menu data.
- Nested menus render correctly.

### Implementation Phase 10: R2 Media Uploads And Attachments

- GOAL-010: Support article images and media management.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1001 | Add R2 binding to Worker configuration. |  |  |
| TASK-1002 | Create media upload API endpoint under `/api/admin/media`. |  |  |
| TASK-1003 | Validate accepted image MIME types: `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. |  |  |
| TASK-1004 | Decide whether SVG upload is disabled or sanitized; recommended MVP value: disabled. |  |  |
| TASK-1005 | Generate normalized R2 object keys under `media/originals/YYYY/MM/`. |  |  |
| TASK-1006 | Store upload metadata in `media_assets`. |  |  |
| TASK-1007 | Create media library page. |  |  |
| TASK-1008 | Add image picker modal in post editor. |  |  |
| TASK-1009 | Insert selected image into Markdown. |  |  |
| TASK-1010 | Add media detail editor for alt text and caption. |  |  |
| TASK-1011 | Add public media serving route. |  |  |
| TASK-1012 | Add cache headers for public media responses. |  |  |
| TASK-1013 | Add delete media flow with confirmation. |  |  |
| TASK-1014 | Warn before deletion when media appears in existing posts. |  |  |

Completion criteria:

- Images upload to R2.
- Images can be inserted into posts.
- Public media URLs work.
- Media metadata is searchable in admin.

### Implementation Phase 11: Theme Customization

- GOAL-011: Allow non-code site customization.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1101 | Define theme settings JSON schema in `src/lib/theme/schema.ts`. |  |  |
| TASK-1102 | Store theme settings in the `settings` table. |  |  |
| TASK-1103 | Create admin theme page. |  |  |
| TASK-1104 | Add logo upload/select field. |  |  |
| TASK-1105 | Add favicon upload/select field. |  |  |
| TASK-1106 | Add color controls for accent, background, text, border, and muted text. |  |  |
| TASK-1107 | Add typography preset selector. |  |  |
| TASK-1108 | Add homepage layout selector. |  |  |
| TASK-1109 | Add post listing style selector. |  |  |
| TASK-1110 | Generate CSS variables from theme settings in `src/lib/theme/cssVariables.ts`. |  |  |
| TASK-1111 | Add optional custom CSS field. |  |  |
| TASK-1112 | Constrain custom CSS with clear documentation and admin warning if included. |  |  |
| TASK-1113 | Add reset-to-default theme action. |  |  |

Completion criteria:

- Admin can change theme settings.
- Public pages reflect theme changes.
- Theme settings survive deployments.
- Defaults can be restored safely.

### Implementation Phase 12: AI Traffic Management Support

- GOAL-012: Make the template ready for Cloudflare AI crawler controls without claiming app-level billing support.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1201 | Create `docs/ai-crawler-management.md`. |  |  |
| TASK-1202 | Document Cloudflare AI Crawl Control setup. |  |  |
| TASK-1203 | Document Pay Per Crawl availability and beta caveat. |  |  |
| TASK-1204 | Document that Pay Per Crawl is configured in Cloudflare, not in the Astro app. |  |  |
| TASK-1205 | Generate `robots.txt` from settings. |  |  |
| TASK-1206 | Add optional `llms.txt` route. |  |  |
| TASK-1207 | Add optional `llms-full.txt` route. |  |  |
| TASK-1208 | Add optional `crawlers.json` route if required by final product direction. |  |  |
| TASK-1209 | Add admin settings for AI crawler-facing site description. |  |  |
| TASK-1210 | Add warning that charging or blocking search engine crawlers may harm SEO. |  |  |

Completion criteria:

- Template includes clear AI crawler documentation.
- Public crawler metadata routes exist when enabled.
- Admin can configure basic AI crawler-facing text.
- The app does not imply it directly charges crawlers.

### Implementation Phase 13: Update And Migration Strategy

- GOAL-013: Make deployed blogs maintainable after launch.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1301 | Add `TEMPLATE_VERSION` constant. |  |  |
| TASK-1302 | Store installed template version in D1 settings. |  |  |
| TASK-1303 | Add admin update status page. |  |  |
| TASK-1304 | Show current template version in admin. |  |  |
| TASK-1305 | Show current schema version in admin. |  |  |
| TASK-1306 | Add `CHANGELOG.md`. |  |  |
| TASK-1307 | Add `UPGRADING.md`. |  |  |
| TASK-1308 | Document Git-based update flow from upstream template. |  |  |
| TASK-1309 | Document D1 migration flow after pulling updates. |  |  |
| TASK-1310 | Document migration safety steps: backup D1, backup R2, test preview deployment. |  |  |
| TASK-1311 | Add version compatibility table. |  |  |
| TASK-1312 | Add optional update-check endpoint that reads a static latest-version URL when configured. |  |  |

Completion criteria:

- Users know how to update code.
- Users know how to apply migrations.
- Admin shows installed version.
- Changelog exists.

### Implementation Phase 14: Testing And Quality Assurance

- GOAL-014: Verify the MVP behavior with automated tests and manual release checks.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1401 | Add unit tests for slug generation. |  |  |
| TASK-1402 | Add unit tests for full path generation. |  |  |
| TASK-1403 | Add unit tests for category nesting validation. |  |  |
| TASK-1404 | Add unit tests for redirect creation. |  |  |
| TASK-1405 | Add unit tests for Markdown sanitization. |  |  |
| TASK-1406 | Add integration tests for post CRUD APIs. |  |  |
| TASK-1407 | Add integration tests for category CRUD APIs. |  |  |
| TASK-1408 | Add integration tests for media upload API with mocked R2. |  |  |
| TASK-1409 | Add integration tests for Access JWT rejection. |  |  |
| TASK-1410 | Add Playwright test for admin post creation. |  |  |
| TASK-1411 | Add Playwright test for publishing and public rendering. |  |  |
| TASK-1412 | Add Playwright test for mobile admin layout. |  |  |
| TASK-1413 | Add sitemap and RSS validation tests. |  |  |
| TASK-1414 | Add build validation to CI. |  |  |

Completion criteria:

- Core logic has unit coverage.
- Admin publishing flow is tested.
- Public SEO outputs are tested.
- CI blocks broken builds.

### Implementation Phase 15: Documentation And Template Readiness

- GOAL-015: Make the template understandable and shippable.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-1501 | Write `README.md` with project overview. |  |  |
| TASK-1502 | Add Deploy to Cloudflare button. |  |  |
| TASK-1503 | Add local development instructions. |  |  |
| TASK-1504 | Add Cloudflare Access setup instructions. |  |  |
| TASK-1505 | Add D1 setup and migration instructions. |  |  |
| TASK-1506 | Add R2 setup instructions. |  |  |
| TASK-1507 | Add AI Crawl Control documentation. |  |  |
| TASK-1508 | Add theme customization documentation. |  |  |
| TASK-1509 | Add content editing documentation. |  |  |
| TASK-1510 | Add updating documentation. |  |  |
| TASK-1511 | Add troubleshooting section. |  |  |
| TASK-1512 | Add screenshots or demo GIFs. |  |  |
| TASK-1513 | Confirm license is present. |  |  |
| TASK-1514 | Add contribution guide. |  |  |
| TASK-1515 | Complete final clean-account Deploy to Cloudflare validation. |  |  |

Completion criteria:

- A new user can deploy the template.
- A new user can configure Access, D1, and R2.
- A new user can create and publish a post.
- Documentation explains update strategy.

## 3. Alternatives

- **ALT-001**: Store Markdown articles as files in Git. Rejected for MVP because a browser-based editor needs runtime writes after deployment.
- **ALT-002**: Use Cloudflare Pages instead of Workers. Rejected for MVP because the requested Deploy to Cloudflare button flow targets Workers applications and the app needs bindings-backed runtime behavior.
- **ALT-003**: Use KV as the primary content store. Rejected because posts, categories, menus, redirects, and revisions are relational enough to benefit from D1.
- **ALT-004**: Use R2 for Markdown documents and D1 only for metadata. Deferred because MVP query and editing workflows are simpler when Markdown bodies are in D1.
- **ALT-005**: Allow arbitrary MDX editing in admin. Rejected for MVP because browser-authored executable components increase security and runtime complexity.
- **ALT-006**: Implement one-click in-app code updates. Rejected for MVP because the deployed source belongs to the user's Git repository and should be updated through Git plus migrations.
- **ALT-007**: Make AI bot payment settings configurable inside the admin panel. Rejected for MVP because Cloudflare Pay Per Crawl is configured at the Cloudflare zone and AI Crawl Control layer.

## 4. Dependencies

- **DEP-001**: Astro.
- **DEP-002**: Astro Cloudflare adapter.
- **DEP-003**: Wrangler.
- **DEP-004**: Cloudflare Workers runtime.
- **DEP-005**: Cloudflare D1.
- **DEP-006**: Cloudflare R2.
- **DEP-007**: Cloudflare Access.
- **DEP-008**: `jose` or equivalent JWT/JWKS library for Access JWT verification.
- **DEP-009**: Markdown parser such as `remark`, `markdown-it`, or equivalent.
- **DEP-010**: HTML sanitizer such as `sanitize-html`, `rehype-sanitize`, or equivalent.
- **DEP-011**: Test runner such as Vitest.
- **DEP-012**: Playwright for browser workflow testing.
- **DEP-013**: Optional syntax highlighting dependency.
- **DEP-014**: Optional form validation dependency such as Zod.

## 5. Files

- **FILE-001**: `README.md` documents overview, setup, deploy button, Cloudflare resources, and MVP behavior.
- **FILE-002**: `PROGRESS.md` tracks milestones, tasks, decisions, blockers, risks, and validation checks.
- **FILE-003**: `plan/feature-astro-cloudflare-blog-template-1.md` contains this implementation roadmap.
- **FILE-004**: `CHANGELOG.md` tracks template releases.
- **FILE-005**: `UPGRADING.md` documents Git-based updates and migrations.
- **FILE-006**: `astro.config.mjs` configures Astro and the Cloudflare adapter.
- **FILE-007**: `wrangler.jsonc` declares Worker configuration and Cloudflare bindings.
- **FILE-008**: `package.json` declares scripts, dependencies, and Cloudflare binding descriptions.
- **FILE-009**: `.dev.vars.example` documents required local environment variables.
- **FILE-010**: `migrations/0001_initial_schema.sql` defines the initial D1 schema.
- **FILE-011**: `migrations/0002_seed_defaults.sql` defines seed settings and content.
- **FILE-012**: `docs/security-and-access.md` documents Access setup; `docs/cloudflare-access.md` is a compatibility redirect.
- **FILE-013**: `docs/ai-crawlers.md` documents AI crawlers; `docs/ai-crawler-management.md` is a compatibility redirect.
- **FILE-014**: `docs/content-model.md` documents D1 content design.
- **FILE-015**: `docs/updating-deployed-blogs.md` documents update strategy.
- **FILE-016**: `docs/theme-customization.md` documents theme options.
- **FILE-017**: `src/layouts/PublicLayout.astro` defines public layout.
- **FILE-018**: `src/layouts/AdminLayout.astro` defines admin layout.
- **FILE-019**: `src/pages/index.astro` renders homepage.
- **FILE-020**: `src/pages/sitemap.xml.ts` renders sitemap.
- **FILE-021**: `src/pages/rss.xml.ts` renders RSS feed.
- **FILE-022**: `src/pages/robots.txt.ts` renders robots rules.
- **FILE-023**: `src/pages/llms.txt.ts` optionally renders LLM-facing summary.
- **FILE-024**: `src/pages/admin/**` contains admin pages.
- **FILE-025**: `src/pages/api/admin/**` contains admin APIs.
- **FILE-026**: `src/components/public/**` contains public UI components.
- **FILE-027**: `src/components/admin/**` contains admin UI components.
- **FILE-028**: `src/components/editor/**` contains Markdown editor components.
- **FILE-029**: `src/lib/access/validateAccessJwt.ts` validates Cloudflare Access JWTs.
- **FILE-030**: `src/lib/db/**` contains D1 data access modules.
- **FILE-031**: `src/lib/markdown/**` contains Markdown rendering and sanitization.
- **FILE-032**: `src/lib/routing/**` contains slug, path, and redirect helpers.
- **FILE-033**: `src/lib/seo/**` contains metadata, sitemap, and RSS helpers.
- **FILE-034**: `src/lib/media/**` contains R2 upload, MIME, and key helpers.
- **FILE-035**: `src/lib/theme/**` contains theme schema and CSS variable helpers.
- **FILE-036**: `src/styles/global.css` contains public styles.
- **FILE-037**: `src/styles/admin.css` contains admin styles.

## 6. Testing

- **TEST-001**: Unit test slug generation from article and category names.
- **TEST-002**: Unit test duplicate slug conflict handling.
- **TEST-003**: Unit test full path generation for posts.
- **TEST-004**: Unit test nested category full path generation.
- **TEST-005**: Unit test circular category parent prevention.
- **TEST-006**: Unit test redirect creation when post path changes.
- **TEST-007**: Unit test redirect creation when category path changes.
- **TEST-008**: Unit test Markdown rendering for standard Markdown.
- **TEST-009**: Unit test Markdown sanitization for unsafe HTML.
- **TEST-010**: Integration test creating a draft post through admin API.
- **TEST-011**: Integration test publishing a post through admin API.
- **TEST-012**: Integration test public routes exclude drafts.
- **TEST-013**: Integration test category CRUD through admin API.
- **TEST-014**: Integration test menu CRUD through admin API.
- **TEST-015**: Integration test media upload with mocked R2 binding.
- **TEST-016**: Integration test missing Access JWT returns `403`.
- **TEST-017**: Integration test invalid Access JWT returns `403`.
- **TEST-018**: Integration test valid Access JWT allows admin API access.
- **TEST-019**: Playwright test creates and publishes a post from admin UI.
- **TEST-020**: Playwright test uploads and inserts an image.
- **TEST-021**: Playwright test edits nested categories.
- **TEST-022**: Playwright test customizes menu and verifies public nav.
- **TEST-023**: Playwright test changes theme and verifies public output.
- **TEST-024**: Output test validates `sitemap.xml`.
- **TEST-025**: Output test validates `rss.xml`.
- **TEST-026**: Build test validates `pnpm build`.
- **TEST-027**: Deployment validation test verifies Wrangler config can be parsed.

## 7. Risks & Assumptions

- **RISK-001**: Cloudflare Pay Per Crawl availability may vary by account because it is a Cloudflare-controlled feature. Mitigation: document it as Cloudflare dashboard configuration rather than app-owned billing.
- **RISK-002**: Admin-authored Markdown can create unsafe HTML. Mitigation: sanitize rendered HTML and document allowed syntax.
- **RISK-003**: Slug and category changes can break SEO. Mitigation: create redirects automatically for old paths.
- **RISK-004**: Updating deployed templates can cause schema drift. Mitigation: version migrations and document upgrade flow.
- **RISK-005**: R2 uploads may expose files if serving logic is too permissive. Mitigation: serve only known `media_assets.public_path` records.
- **RISK-006**: Cloudflare Access misconfiguration can expose admin routes. Mitigation: server-side JWT validation is required even when Access is configured.
- **RISK-007**: Browser editor scope can expand into a full CMS. Mitigation: keep MVP limited to posts, categories, menus, media, settings, and theme.
- **RISK-008**: Deploy to Cloudflare setup can fail if bindings are underspecified. Mitigation: include default resource names and binding descriptions.
- **ASSUMPTION-001**: The app is single-tenant.
- **ASSUMPTION-002**: A validated Cloudflare Access user is authorized as an admin in MVP.
- **ASSUMPTION-003**: The site owner controls the Cloudflare account and zone.
- **ASSUMPTION-004**: The source repository is public for Deploy to Cloudflare template usage.
- **ASSUMPTION-005**: D1 is acceptable as the canonical content database.
- **ASSUMPTION-006**: R2 is acceptable as the canonical media store.
- **ASSUMPTION-007**: Git-based updates are acceptable for MVP.

## 8. Related Specifications / Further Reading

- Cloudflare Deploy to Cloudflare buttons: https://developers.cloudflare.com/workers/tutorials/deploy-button/
- Cloudflare Workers Astro guide: https://developers.cloudflare.com/workers/frameworks/framework-guides/astro/
- Cloudflare Access JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- Cloudflare R2 Workers API usage: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- Cloudflare AI Crawl Control Pay Per Crawl: https://developers.cloudflare.com/ai-crawl-control/features/pay-per-crawl/
- Astro documentation: https://docs.astro.build/
- Markdown project: https://commonmark.org/
