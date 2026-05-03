export type PostStatus = "draft" | "published" | "scheduled" | "archived";

export interface PostRevisionRecord {
  id: string;
  post_id: string;
  title: string;
  markdown_body: string;
  created_at: string;
  created_by_email: string | null;
  revision_note: string | null;
}

export interface PostRecord {
  id: string;
  title: string;
  slug: string;
  full_path: string;
  markdown_body: string;
  excerpt: string | null;
  status: PostStatus;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_image_asset_id: string | null;
  robots_directive: string | null;
  author_name: string | null;
  rendered_html_cache: string | null;
  rendered_html_cache_updated_at: string | null;
}

export interface CategoryRecord {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  full_path: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  robots_directive: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SettingRecord {
  key: string;
  value_json: string;
  updated_at: string;
}

export interface MenuRecord {
  id: string;
  menu_key: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type MenuItemType = "url" | "post" | "category";

export interface MenuItemRecord {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  item_type: MenuItemType;
  target: string;
  sort_order: number;
  open_in_new_tab: number;
}

export interface MediaAssetRecord {
  id: string;
  r2_key: string;
  public_path: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
  created_by_email: string | null;
}

export interface RedirectRecord {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  created_at: string;
}

export interface SchemaMigrationRecord {
  version: string;
  applied_at: string;
}
