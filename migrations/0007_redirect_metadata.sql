PRAGMA foreign_keys = ON;

ALTER TABLE redirects ADD COLUMN note TEXT;
ALTER TABLE redirects ADD COLUMN updated_at TEXT;

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0007_redirect_metadata', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'schema.version',
    json_object('value', '0007_redirect_metadata'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO UPDATE SET
  value_json = excluded.value_json,
  updated_at = excluded.updated_at;
