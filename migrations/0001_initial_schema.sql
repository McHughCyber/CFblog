PRAGMA foreign_keys = ON;

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  full_path TEXT NOT NULL UNIQUE,
  markdown_body TEXT NOT NULL,
  excerpt TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
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

CREATE INDEX idx_posts_status_published_at ON posts (status, published_at);
CREATE INDEX idx_posts_slug ON posts (slug);

CREATE TABLE post_revisions (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  markdown_body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by_email TEXT,
  revision_note TEXT,
  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

CREATE INDEX idx_post_revisions_post_id_created_at ON post_revisions (post_id, created_at);

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
  updated_at TEXT NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_parent_sort ON categories (parent_id, sort_order);
CREATE INDEX idx_categories_slug ON categories (slug);

CREATE TABLE post_categories (
  post_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  PRIMARY KEY (post_id, category_id),
  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_post_categories_primary
  ON post_categories (post_id)
  WHERE is_primary = 1;

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
  item_type TEXT NOT NULL CHECK (item_type IN ('url', 'post', 'category')),
  target TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  open_in_new_tab INTEGER NOT NULL DEFAULT 0 CHECK (open_in_new_tab IN (0, 1)),
  FOREIGN KEY (menu_id) REFERENCES menus (id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES menu_items (id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_items_menu_parent_sort ON menu_items (menu_id, parent_id, sort_order);

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

CREATE INDEX idx_media_assets_created_at ON media_assets (created_at);

CREATE TABLE redirects (
  id TEXT PRIMARY KEY,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302, 307, 308)),
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

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0001_initial_schema', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
