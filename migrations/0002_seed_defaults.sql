PRAGMA foreign_keys = ON;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'template.version',
    json_object('value', '0.1.0'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'schema.version',
    json_object('value', '0002_seed_defaults'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'site',
    json_object(
      'title', 'CFblog',
      'description', 'A Cloudflare-native Astro blog.',
      'language', 'en',
      'postsPerPage', 10
    ),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'theme',
    json_object(
      'preset', 'minimal',
      'accentColor', '#2f6f4e',
      'fontFamily', 'system'
    ),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );

INSERT INTO categories (
  id,
  parent_id,
  name,
  slug,
  full_path,
  description,
  seo_title,
  seo_description,
  sort_order,
  created_at,
  updated_at
)
VALUES (
  'cat-getting-started',
  NULL,
  'Getting Started',
  'getting-started',
  '/getting-started',
  'First steps for the starter blog.',
  'Getting Started',
  'First steps for the starter blog.',
  0,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

INSERT INTO posts (
  id,
  title,
  slug,
  full_path,
  markdown_body,
  excerpt,
  status,
  published_at,
  scheduled_at,
  created_at,
  updated_at,
  seo_title,
  seo_description,
  canonical_url,
  og_image_asset_id,
  robots_directive,
  author_name,
  rendered_html_cache,
  rendered_html_cache_updated_at
)
VALUES (
  'post-welcome',
  'Welcome to CFblog',
  'welcome-to-cfblog',
  '/getting-started/welcome-to-cfblog',
  '# Welcome to CFblog' || char(10) || char(10) || 'This seed post confirms that D1 content is ready for the public blog renderer.',
  'A seed post for a fresh CFblog deployment.',
  'published',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  NULL,
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  'Welcome to CFblog',
  'A seed post for a fresh CFblog deployment.',
  NULL,
  NULL,
  'index,follow',
  'CFblog',
  NULL,
  NULL
);

INSERT INTO post_categories (post_id, category_id, is_primary)
VALUES ('post-welcome', 'cat-getting-started', 1);

INSERT INTO menus (id, menu_key, name, created_at, updated_at)
VALUES
  (
    'menu-primary',
    'primary',
    'Primary',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  ),
  (
    'menu-footer',
    'footer',
    'Footer',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  );

INSERT INTO menu_items (
  id,
  menu_id,
  parent_id,
  label,
  item_type,
  target,
  sort_order,
  open_in_new_tab
)
VALUES
  ('menu-item-home', 'menu-primary', NULL, 'Home', 'url', '/', 0, 0),
  (
    'menu-item-start',
    'menu-primary',
    NULL,
    'Getting Started',
    'category',
    'cat-getting-started',
    10,
    0
  );

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0002_seed_defaults', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
