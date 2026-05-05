# Astro Cloudflare Blog Template Progress

This document tracks implementation progress for the Astro blog template MVP. Update it whenever tasks start, complete, become blocked, or change scope.

## Status Summary


| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| Project          | Astro Cloudflare Blog Template                     |
| Roadmap          | `plan/feature-astro-cloudflare-blog-template-1.md` |
| Current Phase    | Phase 16: Google Integrations                    |
| Overall Status   | In Development                                     |
| Last Updated     | 2026-05-05                                         |
| MVP Target       | TBD                                                |
| Current Blockers | None                                               |


## Milestone Progress


| Milestone | Name                                   | Status      | Owner | Started    | Completed  |
| --------- | -------------------------------------- | ----------- | ----- | ---------- | ---------- |
| M0        | Project Definition                     | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M1        | Base Astro And Cloudflare Worker Setup | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M2        | Database Schema And Migrations         | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M3        | Public Blog Rendering                  | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M4        | SEO Foundation                         | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M5        | Cloudflare Access Admin Protection     | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M6        | Admin Layout And Navigation            | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M7        | Markdown Post Editor                   | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M8        | Nested Category Management             | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M9        | Menu Management                        | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M10       | R2 Media Uploads And Attachments       | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M11       | Theme Customization                    | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M12       | AI Traffic Management Support          | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M13       | Update And Migration Strategy          | Completed   | Codex | 2026-05-03 | 2026-05-03 |
| M14       | Testing And QA                         | Not Started | TBD   |            |            |
| M15       | Documentation And Template Readiness   | Not Started | TBD   |            |            |
| M16       | Google Integrations                    | Completed   | Codex | 2026-05-05 | 2026-05-05 |


## Active Tasks


| Task      | Description                                     | Status      | Owner | Notes                                                                           |
| --------- | ----------------------------------------------- | ----------- | ----- | ------------------------------------------------------------------------------- |
| TASK-0001 | Define the public repository name.              | Completed   | Codex | Selected `astro-cloudflare-blog-template`.                                      |
| TASK-0002 | Select package manager.                         | Completed   | Codex | Selected `pnpm`; recorded in `package.json`.                                    |
| TASK-0003 | Document MVP non-goals.                         | Completed   | Codex | Documented in `README.md`.                                                      |
| TASK-0004 | Document supported Cloudflare products.         | Completed   | Codex | Workers, D1, R2, Access, optional KV, AI Crawl Control documentation.           |
| TASK-0005 | Define MVP content types.                       | Completed   | Codex | Posts and nested categories for authored content.                               |
| TASK-0006 | Define MVP admin authorization.                 | Completed   | Codex | Any validated Cloudflare Access user is admin.                                  |
| TASK-0007 | Define release target.                          | Completed   | Codex | Working `*.workers.dev` deployment with custom-domain compatibility.            |
| TASK-0008 | Add MVP release checklist to `PROGRESS.md`.     | Completed   | Codex | Completed on 2026-05-03.                                                        |
| TASK-0101 | Initialize Astro project with TypeScript.       | Completed   | Codex | Base project files added and local build verified.                              |
| TASK-0102 | Install and configure Astro Cloudflare adapter. | Completed   | Codex | Config added in `astro.config.mjs`; dependency install and build verified.       |
| TASK-0103 | Configure Astro server output.                  | Completed   | Codex | `output: "server"` configured.                                                  |
| TASK-0104 | Create `wrangler.jsonc`.                        | Completed   | Codex | Includes Worker name, compatibility date, D1, R2, and optional KV placeholders. |
| TASK-0105 | Add package scripts.                            | Completed   | Codex | Added `dev`, `build`, `preview`, `deploy`, `db:migrations:apply`, and `test`.   |
| TASK-0106 | Add Deploy to Cloudflare button.                | Completed   | Codex | Added to `README.md` with repository URL placeholder owner.                     |
| TASK-0107 | Add Cloudflare binding descriptions.            | Completed   | Codex | Added under `package.json` `cloudflare.bindings`.                               |
| TASK-0108 | Add `.dev.vars.example`.                        | Completed   | Codex | Added Access and site env examples.                                             |
| TASK-0109 | Verify local build.                             | Completed   | Codex | `corepack pnpm build` succeeds.                                                 |
| TASK-0110 | Verify Worker deployment validation.            | Completed   | Codex | `corepack pnpm exec wrangler deploy --dry-run` succeeds.                        |
| TASK-0201 | Create initial D1 schema migration.             | Completed   | Codex | Added and locally applied `migrations/0001_initial_schema.sql`.                  |
| TASK-0202 | Create seed defaults migration.                 | Completed   | Codex | Added and locally applied `migrations/0002_seed_defaults.sql`.                   |
| TASK-0203 | Create D1 client helper.                        | Completed   | Codex | Added `src/lib/db/client.ts` and base record types.                              |
| TASK-0204 | Create post data module.                        | Completed   | Codex | Added published post queries, upsert, category listing, and revision creation.   |
| TASK-0205 | Create category data module.                    | Completed   | Codex | Added category list, lookup, and upsert helpers.                                 |
| TASK-0206 | Create menu data module.                        | Completed   | Codex | Added menu list, keyed menu lookup, item listing, and item upsert helper.         |
| TASK-0207 | Create media metadata module.                   | Completed   | Codex | Added media listing, public path lookup, and create helper.                      |
| TASK-0208 | Create redirect data module.                    | Completed   | Codex | Added redirect lookup and upsert helper.                                         |
| TASK-0209 | Create settings data module.                    | Completed   | Codex | Added typed setting read/write and migration listing helpers.                    |
| TASK-0210 | Enforce unique post paths.                      | Completed   | Codex | `posts.full_path` is unique in the initial schema.                              |
| TASK-0211 | Enforce unique category paths.                  | Completed   | Codex | `categories.full_path` is unique in the initial schema.                          |
| TASK-0212 | Insert redirects on path changes.               | Completed   | Codex | Post and category upserts create 301 redirects when full paths change.           |
| TASK-0213 | Store installed schema version.                 | Completed   | Codex | Stored in `schema_migrations` and seeded `settings`.                             |
| TASK-0301 | Render homepage from D1.                        | Completed   | Codex | Homepage reads site settings and published posts from D1.                        |
| TASK-0302 | Resolve post route by full path.                | Completed   | Codex | Catch-all route resolves seeded post path from D1.                               |
| TASK-0303 | Resolve category route by full path.            | Completed   | Codex | Catch-all route resolves seeded category path from D1.                           |
| TASK-0304 | Add breadcrumbs.                                | Completed   | Codex | Post and category routes render hierarchy breadcrumbs.                           |
| TASK-0305 | Add 404 page.                                   | Completed   | Codex | Added branded 404 page and catch-all rewrite.                                    |
| TASK-0306 | Add redirect lookup.                            | Completed   | Codex | Catch-all route checks redirect records before 404.                              |
| TASK-0307 | Add Markdown rendering.                         | Completed   | Codex | Runtime Markdown rendering added with `marked`.                                  |
| TASK-0308 | Add HTML sanitization.                          | Completed   | Codex | Markdown output sanitized with `sanitize-html` allowlist.                        |
| TASK-0309 | Add syntax highlighting if selected.            | Deferred    | Codex | No syntax highlighter selected for MVP yet; code blocks render safely.           |
| TASK-0310 | Add post pagination.                            | Completed   | Codex | Homepage supports bounded `?page=` pagination.                                   |
| TASK-0311 | Add category pagination.                        | Completed   | Codex | Category pages support bounded `?page=` pagination.                              |
| TASK-0312 | Exclude non-public content.                     | Completed   | Codex | Public queries include published posts and scheduled posts after `scheduled_at`; draft, archived, and future scheduled posts are hidden. |
| TASK-0401 | Add global metadata settings.                   | Completed   | Codex | Homepage and feeds read title/description/language plus default author/OG image settings. |
| TASK-0402 | Add post metadata rendering.                    | Completed   | Codex | Post pages render description, canonical, Open Graph, optional OG image, robots, Twitter, and JSON-LD. |
| TASK-0403 | Add category metadata rendering.                | Completed   | Codex | Category pages render description, canonical, robots, Open Graph, Twitter, and JSON-LD. |
| TASK-0404 | Generate sitemap.                               | Completed   | Codex | Added D1-backed `sitemap.xml`.                                                   |
| TASK-0405 | Generate RSS.                                   | Completed   | Codex | Added D1-backed `rss.xml`.                                                       |
| TASK-0406 | Generate robots.txt.                            | Completed   | Codex | Added `robots.txt` with sitemap reference.                                       |
| TASK-0407 | Add JSON-LD.                                    | Completed   | Codex | Added Blog, BlogPosting, and CollectionPage structured data.                     |
| TASK-0408 | Add canonical links.                            | Completed   | Codex | Added canonical links for homepage, posts, and categories.                       |
| TASK-0409 | Add Open Graph metadata.                        | Completed   | Codex | Added Open Graph title, description, type, and URL.                              |
| TASK-0410 | Add Twitter card metadata.                      | Completed   | Codex | Added summary-card metadata.                                                     |
| TASK-0411 | Add pagination metadata.                        | Completed   | Codex | Added prev/next links for paginated homepage and category pages.                 |
| TASK-0501 | Document Access setup.                          | Completed   | Codex | Added `docs/access-setup.md` and linked it from `README.md`.                     |
| TASK-0502 | Add Access env vars.                            | Completed   | Codex | Access team domain and audience are represented in env examples/types.           |
| TASK-0503 | Create JWT validation helper.                   | Completed   | Codex | Added `src/lib/auth/access.ts` using Cloudflare Access JWKS, issuer, and aud.    |
| TASK-0504 | Protect admin pages.                            | Completed   | Codex | Middleware protects `/admin` and `/admin/*`.                                     |
| TASK-0505 | Protect admin APIs.                             | Completed   | Codex | Middleware protects `/api/admin/*`.                                              |
| TASK-0506 | Extract user email.                             | Completed   | Codex | Access payload email/sub is exposed on `Astro.locals.accessUser`.                |
| TASK-0507 | Display admin identity.                         | Completed   | Codex | Admin page displays Access identity when available.                              |
| TASK-0508 | Add unauthorized states.                        | Completed   | Codex | Protected routes fail closed with `403`.                                         |
| TASK-0509 | Add JWT validation tests.                       | Completed   | Codex | Added fail-closed, signed-token, and wrong-audience tests.                       |
| TASK-0601 | Create admin dashboard.                         | Completed   | Codex | Added protected dashboard at `/admin`.                                           |
| TASK-0602 | Create admin layout.                            | Completed   | Codex | Added shared `AdminLayout.astro`.                                                |
| TASK-0603 | Add admin navigation.                           | Completed   | Codex | Added protected section navigation.                                              |
| TASK-0604 | Add dashboard stats.                            | Completed   | Codex | Added D1-backed admin dashboard stats.                                           |
| TASK-0605 | Add loading and empty states.                   | Completed   | Codex | Added reusable empty state component and section placeholders.                   |
| TASK-0606 | Create reusable form controls.                  | Completed   | Codex | Added reusable `FormField.astro`.                                                |
| TASK-0607 | Create confirmation patterns.                   | Completed   | Codex | Added reusable `ConfirmBar.astro`.                                               |
| TASK-0608 | Verify responsive admin layout.                 | Completed   | Codex | Responsive sidebar/topbar CSS builds cleanly; browser screenshot QA pending.     |
| TASK-0701 | Create post list page.                          | Completed   | Codex | `/admin/posts` with D1-backed table, filters, and actions.                           |
| TASK-0702 | Add post filters.                               | Completed   | Codex | Status, category, and search query on post list.                                    |
| TASK-0703 | Create new post route.                          | Completed   | Codex | `/admin/posts/new` with editor and POST `/api/admin/posts`.                        |
| TASK-0704 | Create edit post route.                         | Completed   | Codex | `/admin/posts/[id]/edit` with PATCH API.                                           |
| TASK-0705 | Add Markdown text editor.                       | Completed   | Codex | Large Markdown textarea in `PostEditor.astro`.                                     |
| TASK-0706 | Add live preview panel.                         | Completed   | Codex | Debounced POST to `/api/admin/markdown-preview` with sanitised HTML.               |
| TASK-0707 | Add post fields.                                | Completed   | Codex | Title, slug, full path, excerpt, status, publish and scheduled dates, author.        |
| TASK-0708 | Add SEO panel fields.                           | Completed   | Codex | Collapsible SEO section with title, description, canonical, robots.                 |
| TASK-0709 | Add category assignment UI.                     | Completed   | Codex | Checkboxes backed by `post_categories` via API.                                    |
| TASK-0710 | Add primary category selector.                  | Completed   | Codex | Primary radio per row; enforced in API when categories assigned.                   |
| TASK-0711 | Add save draft action.                          | Completed   | Codex | Save draft button sets draft status and clears publish scheduling fields.          |
| TASK-0712 | Add publish action.                             | Completed   | Codex | Publish button sets `published` and default publish timestamp when missing.        |
| TASK-0713 | Add unpublish action.                           | Completed   | Codex | Unpublish moves to draft and clears publish date fields.                           |
| TASK-0714 | Add archive action.                             | Completed   | Codex | Archive button sets `archived` status.                                            |
| TASK-0715 | Add revision creation on save.                  | Completed   | Codex | `createPostRevision` on each successful POST/PATCH save.                            |
| TASK-0716 | Add revision list view.                         | Completed   | Codex | Revisions listed on edit page with timestamps and notes.                           |
| TASK-0717 | Add restore revision action.                    | Completed   | Codex | POST `/api/admin/posts/[id]/revisions/[revisionId]` restores content.              |
| TASK-0718 | Add validation errors for slug and path conflicts. | Completed | Codex | 409 responses for duplicate post paths and category path collisions.            |
| TASK-0719 | Add authenticated draft preview.                | Completed   | Codex | `/admin/posts/[id]/preview` renders Markdown under Access.                          |
| TASK-0801 | Create category list page.                      | Completed   | Codex | `/admin/categories` with nested tree and edit links.                               |
| TASK-0802 | Display nested category tree.                   | Completed   | Codex | `CategoryTree.astro` with `Astro.self` recursion and `buildCategoryTree`.          |
| TASK-0803 | Create category create form.                    | Completed   | Codex | `/admin/categories/new` and POST `/api/admin/categories`.                            |
| TASK-0804 | Create category edit form.                      | Completed   | Codex | `/admin/categories/[id]/edit` and PATCH API.                                        |
| TASK-0805 | Add parent selector.                            | Completed   | Codex | Parent `<select>` excludes self and descendants on edit.                           |
| TASK-0806 | Add slug field.                                 | Completed   | Codex | Slug field with server-side `isValidSlug` validation.                              |
| TASK-0807 | Compute category full path.                     | Completed   | Codex | `buildCategoryFullPath` in `paths.ts` used by save logic.                          |
| TASK-0808 | Recompute child paths.                          | Completed   | Codex | `listCategorySubtreeOrdered` plus depth-ordered path map on update.                |
| TASK-0809 | Recompute affected post paths.                  | Completed   | Codex | `syncPostFullPathsForPrimaryCategories` after category path changes.               |
| TASK-0810 | Create redirects for changed category paths.  | Completed   | Codex | Existing `upsertCategory` redirect behaviour applied per updated row.              |
| TASK-0811 | Prevent circular parent relationships.          | Completed   | Codex | `listDescendantCategoryIds` blocks invalid parent selection.                        |
| TASK-0812 | Add category SEO fields.                        | Completed   | Codex | SEO title and description in `CategoryEditor` collapsible section.                |
| TASK-0813 | Add nested category tests.                        | Completed   | Codex | `build-tree.test.ts` and `paths` tests for category URL building.                  |
| TASK-0901 | Create menu list page.                          | Completed   | Codex | `/admin/menus` lists menus with item counts and edit links.                          |
| TASK-0902 | Seed primary and footer menus.                  | Completed   | Codex | Already present in `migrations/0002_seed_defaults.sql`.                            |
| TASK-0903 | Create menu item editor.                        | Completed   | Codex | `MenuItemForm.astro` and new/edit routes with POST/PATCH APIs.                       |
| TASK-0904 | Support URL, post, and category items.          | Completed   | Codex | `item_type` targets with post/category selects and URL field.                        |
| TASK-0905 | Support nested menu items.                      | Completed   | Codex | Parent selector and `buildMenuItemTree` for public rendering.                      |
| TASK-0906 | Support sort ordering.                          | Completed   | Codex | `sort_order` field on items and forms.                                             |
| TASK-0907 | Support external-link flag.                     | Completed   | Codex | `open_in_new_tab` persisted and applied on public links.                            |
| TASK-0908 | Render primary menu.                            | Completed   | Codex | `SiteHeader` + `NavList` on homepage and catch-all pages.                            |
| TASK-0909 | Render footer menu.                             | Completed   | Codex | `SiteFooter` when footer menu has resolvable items.                                |
| TASK-0910 | Validate broken menu targets.                   | Completed   | Codex | `resolveMenuItemHref` plus admin table OK column and public omission of bad links. |
| TASK-1201 | Create AI crawler docs.                         | Completed   | Codex | Added `docs/ai-crawlers.md`.                                                     |
| TASK-1202 | Document AI Crawl Control setup.                | Completed   | Codex | Documented dashboard setup and official docs links.                              |
| TASK-1203 | Document Pay Per Crawl beta caveat.             | Completed   | Codex | Documented closed beta and dashboard-level setup.                                |
| TASK-1204 | Document Cloudflare-level configuration.        | Completed   | Codex | Clarified app hint files vs Cloudflare enforcement.                              |
| TASK-1205 | Generate robots.txt from settings.              | Completed   | Codex | `robots.txt` now uses D1-backed AI traffic settings.                             |
| TASK-1206 | Add optional llms.txt.                          | Completed   | Codex | Added `/llms.txt` endpoint gated by setting.                                     |
| TASK-1207 | Add optional llms-full.txt.                     | Completed   | Codex | Added `/llms-full.txt` endpoint gated by setting.                                |
| TASK-1208 | Add optional crawlers.json.                     | Completed   | Codex | Added `/crawlers.json` endpoint gated by setting.                                |
| TASK-1209 | Add AI crawler-facing site description setting. | Completed   | Codex | Added `aiTraffic` setting and admin settings form/API.                           |
| TASK-1210 | Add SEO warning for crawler blocking/charging.  | Completed   | Codex | `/admin/settings` warns that blocking/charging is Cloudflare-level enforcement.  |
| TASK-1301 | Add template version constant.                  | Completed   | Codex | Added `TEMPLATE_VERSION` in `src/lib/version.ts`.                              |
| TASK-1302 | Store installed template version.               | Completed   | Codex | Existing D1 setting is preserved/backfilled by migration 0004.                  |
| TASK-1303 | Add admin update status page.                   | Completed   | Codex | Added `/admin/update`.                                                          |
| TASK-1304 | Show current template version.                  | Completed   | Codex | Admin update page shows source and installed template versions.                 |
| TASK-1305 | Show current schema version.                    | Completed   | Codex | Admin update page shows source and installed schema versions.                   |
| TASK-1306 | Add changelog.                                  | Completed   | Codex | Added `CHANGELOG.md`.                                                           |
| TASK-1307 | Add upgrading guide.                            | Completed   | Codex | Added `UPGRADING.md`.                                                           |
| TASK-1308 | Document Git update flow.                       | Completed   | Codex | `UPGRADING.md` includes upstream remote, branch, merge, install, test, build.   |
| TASK-1309 | Document D1 migration flow.                     | Completed   | Codex | `UPGRADING.md` includes local and remote Wrangler D1 migration flow.            |
| TASK-1310 | Document backup and preview strategy.           | Completed   | Codex | `UPGRADING.md` includes backup and preview checklist.                           |
| TASK-1311 | Add compatibility table.                        | Completed   | Codex | Added tables in `CHANGELOG.md` and `UPGRADING.md`.                              |
| TASK-1312 | Add optional update-check endpoint.             | Completed   | Codex | Added protected `GET /api/admin/update-check` using `CFBLOG_UPDATE_CHECK_URL`.  |


## Backlog By Phase

### M1: Base Astro And Cloudflare Worker Setup


| Task      | Status      | Notes                                                                    |
| --------- | ----------- | ------------------------------------------------------------------------ |
| TASK-0101 | Completed   | Base project files added and local build verified.                       |
| TASK-0102 | Completed   | `astro.config.mjs` added and dependency install/build verified.          |
| TASK-0103 | Completed   | Astro server output configured.                                          |
| TASK-0104 | Completed   | `wrangler.jsonc` created with Worker and binding placeholders.           |
| TASK-0105 | Completed   | Package scripts added.                                                   |
| TASK-0106 | Completed   | Deploy button added to `README.md`.                                      |
| TASK-0107 | Completed   | Binding descriptions added to `package.json`.                            |
| TASK-0108 | Completed   | `.dev.vars.example` added.                                               |
| TASK-0109 | Completed   | `corepack pnpm build` succeeds.                                          |
| TASK-0110 | Completed   | `corepack pnpm exec wrangler deploy --dry-run` succeeds.                 |


### M2: Database Schema And Migrations


| Task      | Status      | Notes                               |
| --------- | ----------- | ----------------------------------- |
| TASK-0201 | Completed   | Created `migrations/0001_initial_schema.sql`; local D1 apply succeeds. |
| TASK-0202 | Completed   | Created `migrations/0002_seed_defaults.sql`; local D1 apply succeeds.  |
| TASK-0203 | Completed   | Created `src/lib/db/client.ts` and `src/lib/db/types.ts`.              |
| TASK-0204 | Completed   | Created `src/lib/db/posts.ts`.      |
| TASK-0205 | Completed   | Created `src/lib/db/categories.ts`. |
| TASK-0206 | Completed   | Created `src/lib/db/menus.ts`.      |
| TASK-0207 | Completed   | Created `src/lib/db/media.ts`.      |
| TASK-0208 | Completed   | Created `src/lib/db/redirects.ts`.  |
| TASK-0209 | Completed   | Created `src/lib/db/settings.ts`.   |
| TASK-0210 | Completed   | `posts.full_path` unique constraint exists. |
| TASK-0211 | Completed   | `categories.full_path` unique constraint exists. |
| TASK-0212 | Completed   | Post and category upserts create 301 redirects when full paths change. |
| TASK-0213 | Completed   | `schema_migrations` table and seeded schema setting exist. |


### M3: Public Blog Rendering


| Task      | Status      | Notes                                |
| --------- | ----------- | ------------------------------------ |
| TASK-0301 | Completed   | Homepage reads D1 settings and published posts. |
| TASK-0302 | Completed   | Catch-all route resolves post `full_path` values. |
| TASK-0303 | Completed   | Catch-all route resolves category `full_path` values. |
| TASK-0304 | Completed   | Post and category routes render hierarchy breadcrumbs. |
| TASK-0305 | Completed   | Added branded `404.astro`; catch-all route rewrites unknown paths. |
| TASK-0306 | Completed   | Catch-all route checks D1 redirects before returning 404. |
| TASK-0307 | Completed   | Added `src/lib/markdown/render.ts` with `marked`. |
| TASK-0308 | Completed   | Added `sanitize-html` allowlist for Markdown output. |
| TASK-0309 | Deferred    | No syntax highlighter selected for MVP yet; code blocks render safely. |
| TASK-0310 | Completed   | Homepage supports bounded `?page=` pagination. |
| TASK-0311 | Completed   | Category pages support bounded `?page=` pagination. |
| TASK-0312 | Completed   | Public queries include published posts and due scheduled posts while hiding drafts, archived, and future scheduled posts. |


### M4: SEO Foundation


| Task      | Status      | Notes                            |
| --------- | ----------- | -------------------------------- |
| TASK-0401 | Completed | Homepage and feeds read global metadata from D1 settings, including default author and OG image asset id. |
| TASK-0402 | Completed | Post pages render description, canonical, robots, Open Graph, optional OG image, Twitter, and JSON-LD. |
| TASK-0403 | Completed | Category pages render description, canonical, robots, Open Graph, Twitter, and JSON-LD. |
| TASK-0404 | Completed | Added D1-backed `sitemap.xml`. |
| TASK-0405 | Completed | Added D1-backed `rss.xml`. |
| TASK-0406 | Completed | Added `robots.txt` with sitemap reference. |
| TASK-0407 | Completed | Added Blog, BlogPosting, and CollectionPage JSON-LD. |
| TASK-0408 | Completed | Added canonical links. |
| TASK-0409 | Completed | Added Open Graph metadata. |
| TASK-0410 | Completed | Added Twitter card metadata. |
| TASK-0411 | Completed | Added prev/next links for paginated public pages. |


### M5: Cloudflare Access Admin Protection


| Task      | Status      | Notes                         |
| --------- | ----------- | ----------------------------- |
| TASK-0501 | Completed   | Added `docs/access-setup.md` and linked it from `README.md`. |
| TASK-0502 | Completed   | Access team domain and audience are represented in env examples/types. |
| TASK-0503 | Completed   | Added `src/lib/auth/access.ts` using JWKS, issuer, and audience validation. |
| TASK-0504 | Completed   | Middleware protects `/admin` and `/admin/*`. |
| TASK-0505 | Completed   | Middleware protects `/api/admin/*`. |
| TASK-0506 | Completed   | Access payload email/sub is exposed on `Astro.locals.accessUser`. |
| TASK-0507 | Completed   | Admin page displays Access identity when available. |
| TASK-0508 | Completed   | Protected routes fail closed with `403`. |
| TASK-0509 | Completed   | Added fail-closed, signed-token, and wrong-audience tests. |


### M6: Admin Layout And Navigation


| Task      | Status      | Notes                           |
| --------- | ----------- | ------------------------------- |
| TASK-0601 | Completed   | Added protected dashboard at `/admin`. |
| TASK-0602 | Completed   | Added shared `AdminLayout.astro`. |
| TASK-0603 | Completed   | Added protected section navigation. |
| TASK-0604 | Completed   | Added D1-backed admin dashboard stats. |
| TASK-0605 | Completed   | Added reusable empty state component and section placeholders. |
| TASK-0606 | Completed   | Added reusable `FormField.astro`. |
| TASK-0607 | Completed   | Added reusable `ConfirmBar.astro`. |
| TASK-0608 | Completed   | Responsive sidebar/topbar CSS builds cleanly; browser screenshot QA pending. |


### M7: Markdown Post Editor


| Task      | Status      | Notes                                                                 |
| --------- | ----------- | --------------------------------------------------------------------- |
| TASK-0701 | Completed   | `/admin/posts` list with D1-backed rows and navigation to edit.       |
| TASK-0702 | Completed   | Filters: status, category, search (title, slug, path).               |
| TASK-0703 | Completed   | `/admin/posts/new` and POST `/api/admin/posts`.                       |
| TASK-0704 | Completed   | `/admin/posts/[id]/edit` and PATCH `/api/admin/posts/[id]`.           |
| TASK-0705 | Completed   | Markdown textarea in `PostEditor.astro`.                              |
| TASK-0706 | Completed   | Live preview via `/api/admin/markdown-preview`.                       |
| TASK-0707 | Completed   | Title, slug, full path, excerpt, status, dates, author.                |
| TASK-0708 | Completed   | Collapsible SEO fields.                                                |
| TASK-0709 | Completed   | Category checkboxes wired to `post_categories`.                       |
| TASK-0710 | Completed   | Primary category radio; validated server-side.                        |
| TASK-0711 | Completed   | Save draft action.                                                    |
| TASK-0712 | Completed   | Publish action.                                                       |
| TASK-0713 | Completed   | Unpublish action.                                                     |
| TASK-0714 | Completed   | Archive action.                                                       |
| TASK-0715 | Completed   | Revision row inserted on each save.                                   |
| TASK-0716 | Completed   | Revision list on edit page.                                           |
| TASK-0717 | Completed   | Restore via POST revisions endpoint.                                  |
| TASK-0718 | Completed   | Path conflict detection (posts and categories).                       |
| TASK-0719 | Completed   | `/admin/posts/[id]/preview` for staff preview.                        |


### M8: Nested Category Management


| Task      | Status    | Notes                                                                 |
| --------- | --------- | --------------------------------------------------------------------- |
| TASK-0801 | Completed | `/admin/categories` list with New category action.                    |
| TASK-0802 | Completed | Recursive `CategoryTree` rendering.                                   |
| TASK-0803 | Completed | New category form and POST API.                                       |
| TASK-0804 | Completed | Edit category form and PATCH API.                                     |
| TASK-0805 | Completed | Parent dropdown with excluded ids on edit.                           |
| TASK-0806 | Completed | Slug field and validation.                                              |
| TASK-0807 | Completed | `buildCategoryFullPath` helper.                                       |
| TASK-0808 | Completed | Subtree path recalculation on save.                                   |
| TASK-0809 | Completed | `syncPostFullPathsForPrimaryCategories` in `posts.ts`.                |
| TASK-0810 | Completed | Redirect rows via `upsertCategory` when `full_path` changes.          |
| TASK-0811 | Completed | Circular hierarchy prevention in `applyCategorySave`.               |
| TASK-0812 | Completed | SEO fields on category editor.                                          |
| TASK-0813 | Completed | Unit tests for tree building and category paths.                       |


### M9: Menu Management


| Task      | Status    | Notes                                                                 |
| --------- | --------- | --------------------------------------------------------------------- |
| TASK-0901 | Completed | `/admin/menus` overview.                                              |
| TASK-0902 | Completed | Seed data includes `primary` and `footer` menus.                      |
| TASK-0903 | Completed | `/admin/menus/[menuKey]/items/new` and `.../edit` with APIs.          |
| TASK-0904 | Completed | URL, post id, and category id targets.                                |
| TASK-0905 | Completed | Nested items via `parent_id` and recursive `NavList`.                 |
| TASK-0906 | Completed | Sort order on items.                                                  |
| TASK-0907 | Completed | Open in new tab flag.                                                 |
| TASK-0908 | Completed | Primary menu in `SiteHeader`.                                         |
| TASK-0909 | Completed | Footer menu in `SiteFooter`.                                          |
| TASK-0910 | Completed | Admin resolves targets; public hides unlinkable entries.            |


### M10: R2 Media Uploads And Attachments


| Task      | Status    | Notes                                                                                         |
| --------- | --------- | --------------------------------------------------------------------------------------------- |
| TASK-1001 | Completed | `CFBLOG_MEDIA` binding in `wrangler.jsonc` and `Env` typings.                                 |
| TASK-1002 | Completed | `GET`/`POST` `/api/admin/media` (multipart upload).                                           |
| TASK-1003 | Completed | `upload-policy.ts` allows JPEG, PNG, GIF, WebP, AVIF; size cap 8 MB.                          |
| TASK-1004 | Completed | SVG rejected in API and documented in `upload-policy.ts`.                                     |
| TASK-1005 | Completed | `buildMediaR2Key` in `src/lib/media/r2-keys.ts`.                                               |
| TASK-1006 | Completed | `createMediaAsset` after R2 `put`; rollback R2 on D1 insert failure.                         |
| TASK-1007 | Completed | `/admin/media` grid with upload, metadata search, copy Markdown, meta save, delete.           |
| TASK-1008 | Completed | Post editor "Media library" panel lists assets from the media API.                            |
| TASK-1009 | Completed | Insert button appends `![alt](public_path)` at the Markdown cursor.                           |
| TASK-1010 | Completed | `PATCH /api/admin/media/[id]` for `alt_text` and `caption`.                                   |
| TASK-1011 | Completed | Public `GET` `/media/[id]` resolves D1 then streams R2 only for that key.                       |
| TASK-1012 | Completed | `Cache-Control: public, max-age=31536000, immutable` on public media responses.               |
| TASK-1013 | Completed | `DELETE /api/admin/media/[id]` removes R2 object and D1 row when safe.                        |
| TASK-1014 | Completed | Delete blocked with `409` and post titles when `markdown_body` or `og_image_asset_id` match. |


### M11: Theme Customization


| Task      | Status    | Notes                                                                                         |
| --------- | --------- | --------------------------------------------------------------------------------------------- |
| TASK-1101 | Completed | `src/lib/theme/schema.ts` types, defaults, `normaliseTheme`, patch parsing, legacy seed merge. |
| TASK-1102 | Completed | `settings.theme` JSON via existing `setSetting`; seed row extended in code paths.            |
| TASK-1103 | Completed | `/admin/theme` form with save and reset.                                                     |
| TASK-1104 | Completed | `logoPublicPath` validated `/media/{uuid}`; header renders optional logo.                     |
| TASK-1105 | Completed | `faviconPublicPath`; `<link rel="icon">` in `ThemeHead.astro`.                                |
| TASK-1106 | Completed | Six colour pickers mapped to `--cf-*` variables.                                            |
| TASK-1107 | Completed | Typography preset selector (system, serif, mono, newsprint).                                |
| TASK-1108 | Completed | Homepage layout `classic` vs `magazine` on `index.astro` body data attribute.                |
| TASK-1109 | Completed | Post listing `list` vs `cards` on home and category pages.                                   |
| TASK-1110 | Completed | `src/lib/theme/cssVariables.ts` builds global `:root` rule from `ThemeSettings`.              |
| TASK-1111 | Completed | Optional `customCss` stored on theme; second global style block when safe.                  |
| TASK-1112 | Completed | `custom-css-guard.ts`, admin warning copy, rejects `</style` and `<script`.                    |
| TASK-1113 | Completed | `DELETE /api/admin/theme` restores `DEFAULT_THEME`.                                          |


### M12: AI Traffic Management Support


| Task      | Status      | Notes                                           |
| --------- | ----------- | ----------------------------------------------- |
| TASK-1201 | Completed | Added `docs/ai-crawlers.md`.                     |
| TASK-1202 | Completed | Documented Cloudflare AI Crawl Control dashboard setup and docs links. |
| TASK-1203 | Completed | Documented Pay Per Crawl closed beta caveat.     |
| TASK-1204 | Completed | Clarified that enforcement and charging are Cloudflare-level configuration. |
| TASK-1205 | Completed | `robots.txt` renders from D1-backed `aiTraffic` settings. |
| TASK-1206 | Completed | Added optional `/llms.txt`.                       |
| TASK-1207 | Completed | Added optional `/llms-full.txt`.                  |
| TASK-1208 | Completed | Added optional `/crawlers.json`.                  |
| TASK-1209 | Completed | Added AI crawler-facing description in `/admin/settings` and API persistence. |
| TASK-1210 | Completed | Added admin warning that blocking/charging is handled in Cloudflare. |


### M13: Update And Migration Strategy


| Task      | Status      | Notes                                 |
| --------- | ----------- | ------------------------------------- |
| TASK-1301 | Completed | Added `TEMPLATE_VERSION` in `src/lib/version.ts`. |
| TASK-1302 | Completed | D1 `settings.template.version` is preserved/backfilled by migration 0004. |
| TASK-1303 | Completed | Added protected `/admin/update`.       |
| TASK-1304 | Completed | Shows source and installed template versions. |
| TASK-1305 | Completed | Shows source and installed schema versions plus applied migrations through 0005. |
| TASK-1306 | Completed | Added `CHANGELOG.md`.                  |
| TASK-1307 | Completed | Added `UPGRADING.md`.                  |
| TASK-1308 | Completed | Documented upstream Git update flow.   |
| TASK-1309 | Completed | Documented local and remote D1 migration commands. |
| TASK-1310 | Completed | Documented D1/R2 backup and preview deployment strategy. |
| TASK-1311 | Completed | Added compatibility tables.            |
| TASK-1312 | Completed | Added optional protected update-check endpoint. |


### M14: Testing And QA


| Task      | Status      | Notes                                   |
| --------- | ----------- | --------------------------------------- |
| TASK-1401 | Not Started | Test slug generation.                   |
| TASK-1402 | Not Started | Test full path generation.              |
| TASK-1403 | Not Started | Test category nesting validation.       |
| TASK-1404 | Not Started | Test redirect creation.                 |
| TASK-1405 | Not Started | Test Markdown sanitization.             |
| TASK-1406 | Not Started | Test post CRUD APIs.                    |
| TASK-1407 | Not Started | Test category CRUD APIs.                |
| TASK-1408 | Not Started | Test media upload API with mocked R2.   |
| TASK-1409 | Not Started | Test Access JWT rejection.              |
| TASK-1410 | Not Started | Test admin post creation in browser.    |
| TASK-1411 | Not Started | Test publish and public rendering flow. |
| TASK-1412 | Not Started | Test mobile admin layout.               |
| TASK-1413 | Not Started | Validate sitemap and RSS.               |
| TASK-1414 | Not Started | Add build validation in CI.             |


### M15: Documentation And Template Readiness


| Task      | Status      | Notes                               |
| --------- | ----------- | ----------------------------------- |
| TASK-1501 | Not Started | Write README overview.              |
| TASK-1502 | Not Started | Add Deploy to Cloudflare button.    |
| TASK-1503 | Not Started | Add local development instructions. |
| TASK-1504 | Not Started | Add Access setup instructions.      |
| TASK-1505 | Not Started | Add D1 setup instructions.          |
| TASK-1506 | Not Started | Add R2 setup instructions.          |
| TASK-1507 | Not Started | Add AI Crawl Control documentation. |
| TASK-1508 | Not Started | Add theme customization docs.       |
| TASK-1509 | Not Started | Add content editing docs.           |
| TASK-1510 | Not Started | Add updating docs.                  |
| TASK-1511 | Not Started | Add troubleshooting.                |
| TASK-1512 | Not Started | Add screenshots or demo GIFs.       |
| TASK-1513 | Not Started | Confirm license.                    |
| TASK-1514 | Not Started | Add contribution guide.             |
| TASK-1515 | Not Started | Validate clean-account deployment.  |


### M16: Google Integrations


| Task      | Status    | Notes |
| --------- | --------- | ----- |
| TASK-1601 | Completed | Added integrations settings schema and disabled defaults. |
| TASK-1602 | Completed | Added D1 migration for integrations defaults. |
| TASK-1603 | Completed | Added protected integrations settings API. |
| TASK-1604 | Completed | Added Google integrations admin settings UI. |
| TASK-1605 | Completed | Analytics head tag renders only when enabled with a valid Measurement ID. |
| TASK-1606 | Completed | AdSense loader renders for Auto/manual modes only when enabled with a valid Publisher ID. |
| TASK-1607 | Completed | Added fixed manual AdSense placement slots. |
| TASK-1608 | Completed | Added validation and rendering tests. |
| TASK-1609 | Completed | Documented Google integrations and consent notes. |
| TASK-1610 | Completed | Tests and TypeScript check passed; full Astro build is blocked in this environment by Node 20.18.2 requiring upgrade to >=22.12.0. |


## Decisions


| ID      | Decision                                                                    | Date       | Rationale                                                                                  |
| ------- | --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| DEC-001 | Use D1 as canonical content store.                                          | 2026-05-03 | Browser editing requires runtime writes and relational queries.                            |
| DEC-002 | Use R2 for media bytes.                                                     | 2026-05-03 | Images and attachments belong in object storage.                                           |
| DEC-003 | Use Cloudflare Access for admin authentication.                             | 2026-05-03 | The app is Cloudflare-native and should use Cloudflare-native access control.              |
| DEC-004 | Validate Access JWTs server-side.                                           | 2026-05-03 | Origin code must verify issuer, audience, and signature.                                   |
| DEC-005 | Exclude arbitrary MDX from MVP.                                             | 2026-05-03 | Reduces execution and security risk.                                                       |
| DEC-006 | Use Git-based app updates.                                                  | 2026-05-03 | Safer than in-app code self-modification.                                                  |
| DEC-007 | Treat Pay Per Crawl as Cloudflare-level configuration.                      | 2026-05-03 | The app should document setup but not claim to perform crawler billing directly.           |
| DEC-008 | Use `astro-cloudflare-blog-template` as the public repository/package name. | 2026-05-03 | Matches the plan recommendation and communicates the deploy target clearly.                |
| DEC-009 | Use `pnpm` as the package manager.                                          | 2026-05-03 | Matches the plan recommendation and keeps dependency installs deterministic with Corepack. |
| DEC-010 | Use direct Google tags for v1 Google integrations.                          | 2026-05-05 | Keeps Analytics and AdSense self-contained in CFblog settings without requiring Zaraz.     |
| DEC-011 | Store Google IDs and booleans, not arbitrary script snippets.               | 2026-05-05 | Reduces script injection risk while still supporting operator-controlled integrations.     |
| DEC-012 | Document consent responsibilities without a built-in consent banner in v1.  | 2026-05-05 | Consent requirements vary by site and region; advanced flows can use Zaraz/CMP tooling.    |


## Blockers


| ID      | Blocker | Impact | Owner | Resolution |
| ------- | ------- | ------ | ----- | ---------- |
| BLK-001 | None.   | None.  | TBD   |            |


## Risks


| ID       | Risk                                                                                  | Severity | Mitigation                                                                | Status |
| -------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------- | ------ |
| RISK-001 | Cloudflare Pay Per Crawl availability may vary by account.                            | Medium   | Document it as Cloudflare dashboard configuration, not app-owned billing. | Open   |
| RISK-002 | Admin editor can create unsafe HTML.                                                  | High     | Sanitize Markdown output and define allowed HTML policy.                  | Open   |
| RISK-003 | Slug and category changes can break SEO.                                              | High     | Add redirect table and automatic redirect creation.                       | Open   |
| RISK-004 | Updating deployed templates can cause schema drift.                                   | Medium   | Version migrations and document upgrade flow.                             | Open   |
| RISK-005 | R2 uploads may expose private files if paths are predictable or serving is too broad. | Medium   | Normalize keys and serve only known media records.                        | Open   |
| RISK-006 | Access misconfiguration can expose admin pages.                                       | High     | Require server-side JWT validation on every admin route and API.          | Open   |


## Validation Checklist


| Check                                  | Status      | Notes |
| -------------------------------------- | ----------- | ----- |
| Local build succeeds                   | Completed        | `corepack pnpm build` succeeds. |
| Worker deploy succeeds                 | Dry Run Complete | `corepack pnpm exec wrangler deploy --dry-run` succeeds; real deploy awaits real binding IDs/account resources. |
| D1 migrations apply locally            | Completed        | `corepack pnpm exec wrangler d1 migrations apply CFBLOG_DB --local` applied through 0005 locally. |
| D1 migrations apply remotely           | Not Started |       |
| R2 upload works                        | Implemented | Upload API and admin library; production QA with real R2 bucket pending. |
| Admin requires Access JWT              | Completed | `curl /admin` and `curl /api/admin/probe` return `403` without a JWT. |
| Admin rejects invalid Access JWT       | Completed | Validator verifies signature, issuer, and audience with signed-token regression tests. |
| Post publish flow works                | In Progress | Admin editor and APIs implemented; end-to-end browser QA on deployed Access still pending. |
| Draft posts are hidden publicly        | Implemented | Public queries hide drafts, archived posts, and future scheduled posts; past scheduled rendering was manually verified. |
| Nested categories work                 | In Progress | Admin category CRUD, cascade paths, and post resync implemented; full QA on deployed Access pending. |
| Menu customization works               | In Progress | Admin CRUD and public menus implemented; add footer seed items in new installs if desired. |
| Image insertion works                  | Implemented | Editor media panel and Markdown sanitiser allow `/media/...` image paths. |
| Theme customization works              | Implemented | Theme settings, `ThemeHead`, public pages, and tests; deployed QA pending. |
| Redirects work after slug change       | Implemented | Post/category upserts create redirect records when full paths change; end-to-end admin flow pending. |
| Sitemap renders                        | Completed | `curl /sitemap.xml` returns D1-backed XML. |
| RSS renders                            | Completed | `curl /rss.xml` returns D1-backed RSS. |
| Robots.txt renders                     | Completed | `curl /robots.txt` returns D1-backed AI traffic policy and sitemap reference. |
| AI crawler hint files render           | Completed | `curl /llms.txt`, `/llms-full.txt`, and `/crawlers.json` return D1-backed guidance. |
| Google Analytics can be toggled        | Implemented | Admin settings persist Analytics enablement and Measurement ID validation. |
| AdSense modes can be toggled           | Implemented | Admin settings persist Auto ads/manual placement mode and fixed slot IDs. |
| Disabled Google scripts stay absent    | Implemented | Render helpers return no Google tags unless services are enabled with valid IDs. |
| Deploy button works from clean account | Not Started |       |
| Update documentation is complete       | Completed | `UPGRADING.md`, `CHANGELOG.md`, `/admin/update`, and update-check endpoint added. |


## MVP Release Criteria


| Criterion                                                                          | Status      |
| ---------------------------------------------------------------------------------- | ----------- |
| A user can deploy the template with the Deploy to Cloudflare button.               | Not Started |
| D1, R2, and required Worker bindings are configured.                               | In Progress |
| Admin routes are protected by Cloudflare Access and JWT validation.                | Completed |
| A user can create, edit, preview, publish, unpublish, and archive Markdown posts.  | In Progress |
| A user can upload images to R2 and insert them into articles.                      | In Progress |
| Nested categories work.                                                            | In Progress |
| Custom slugs and redirects work.                                                   | Implemented |
| Configurable menus render publicly.                                                | In Progress |
| Theme settings affect the public site.                                             | Implemented |
| Sitemap, RSS, robots, canonical URLs, and Open Graph metadata work.                | Completed |
| AI Crawl Control support is documented honestly as Cloudflare-level configuration. | Completed |
| Google Analytics can be enabled/disabled from admin settings.                    | Implemented |
| AdSense Auto ads and manual placements can be enabled/disabled from admin settings. | Implemented |
| No Google scripts render unless explicitly enabled with valid IDs.               | Implemented |
| Update and migration documentation exists.                                         | Completed |
| CI validates build and core tests.                                                 | Not Started |


## Activity Log


| Date       | Actor | Activity                                                                                          |
| ---------- | ----- | ------------------------------------------------------------------------------------------------- |
| 2026-05-03 | Codex | Created MVP roadmap and progress tracking documents.                                              |
| 2026-05-03 | Codex | Documented development environment variables and added `.env` exclusions for Git and AI tooling.  |
| 2026-05-03 | Codex | Completed Phase 0 scope decisions in `README.md` and began Phase 1 Astro/Cloudflare Worker setup. |
| 2026-05-03 | Codex | Completed Phase 1 base Astro/Cloudflare Worker setup; verified local build and Wrangler deploy dry run. |
| 2026-05-03 | Codex | Started Phase 2 by adding and locally applying initial D1 schema and seed migrations. |
| 2026-05-03 | Codex | Added D1 data modules for posts, categories, menus, media, redirects, and settings. |
| 2026-05-03 | Codex | Started Phase 3 public rendering with D1-backed homepage, post/category routes, sanitized Markdown rendering, redirect lookup, and branded 404 page. |
| 2026-05-03 | Codex | Completed Phase 2 data-layer redirect integration and added public breadcrumbs, post pagination, category pagination, and regression tests. |
| 2026-05-03 | Codex | Completed Phase 4 SEO foundation with metadata, canonical/prev/next links, JSON-LD, sitemap, RSS, and robots.txt. |
| 2026-05-03 | Codex | Started Phase 5 with Cloudflare Access JWT validation helper, admin middleware protection, identity extraction, and fail-closed tests. |
| 2026-05-03 | Codex | Completed Phase 5 with Access setup docs and signed JWT validation tests. |
| 2026-05-03 | Codex | Completed Phase 6 admin dashboard, layout, navigation, stats, empty states, form field, and confirmation components. |
| 2026-05-03 | Codex | Completed Phase 7 Markdown post editor: admin list and filters, new/edit routes, `PostEditor` with live preview, SEO panel, category assignment, publish lifecycle actions, D1 revisions with restore, conflict handling, preview page, and `/api/admin/posts` APIs plus `markdown-preview` and `probe`. |
| 2026-05-03 | Codex | Completed Phase 8 nested categories: `buildCategoryTree`, subtree path cascade and post primary-path sync, circular parent guard, `/api/admin/categories` GET/POST/PATCH, `CategoryTree` and `CategoryEditor`, and conflict checks against posts and other categories. |
| 2026-05-03 | Codex | Completed Phase 9 menu management: `resolveMenuTree`, `SiteHeader`/`SiteFooter`/`NavList` on public pages, `/admin/menus` and item editor, CRUD APIs under `/api/admin/menus`, nested parents, sort order, new tab flag, and admin target validation. |
| 2026-05-03 | Codex | Completed Phase 10 R2 media: upload policy and keys, `/api/admin/media` and `/api/admin/media/[id]`, public `/media/[id]` with immutable cache headers, D1-only serve path, admin media library, post editor insert-from-library, delete guard when posts reference an asset, and tests for keys and upload policy. |
| 2026-05-03 | Codex | Completed Phase 11 theme: `schema.ts`, `cssVariables.ts`, guarded `customCss`, `loadTheme`, `ThemeHead` on homepage, catch-all, and 404; `SiteHeader` logo and CSS-variable-based public chrome; `/admin/theme` and `GET`/`PATCH`/`DELETE` `/api/admin/theme`; homepage magazine and card listing variants; Vitest coverage for schema, CSS output, and CSS guard. |
| 2026-05-03 | Codex | Completed Phase 12 AI traffic management: D1-backed `aiTraffic` settings, admin settings form/API, dynamic `robots.txt`, optional `llms.txt`, `llms-full.txt`, `crawlers.json`, official Cloudflare-facing docs, migration 0003, and render-helper tests. |
| 2026-05-03 | Codex | Completed Phase 13 update strategy: `TEMPLATE_VERSION`/`SCHEMA_VERSION`, migration 0004, protected `/admin/update`, optional `/api/admin/update-check`, changelog, upgrading guide, compatibility tables, and local migration/version verification. |
| 2026-05-03 | Codex | Reviewed completed Milestones 1-13 and remediated gaps: scheduled posts now publish after `scheduled_at`, category robots directives are stored/rendered, post/default OG image metadata is wired, media metadata search was added, plan-compatible docs aliases were added, schema advanced to 0005, and validations were rerun. |
| 2026-05-05 | Codex | Completed Phase 16 Google integrations: D1-backed settings, admin API/UI, public Analytics and AdSense rendering, fixed manual ad placements, migration 0006, documentation, and tests. |
