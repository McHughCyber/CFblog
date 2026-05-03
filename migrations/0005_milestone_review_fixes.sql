PRAGMA foreign_keys = ON;

ALTER TABLE categories ADD COLUMN robots_directive TEXT;

UPDATE settings
SET
  value_json = json_set(
    value_json,
    '$.defaultOgImageAssetId',
    json('null'),
    '$.authorName',
    'CFblog'
  ),
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE key = 'site';

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0005_milestone_review_fixes', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'schema.version',
    json_object('value', '0005_milestone_review_fixes'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO UPDATE SET
  value_json = excluded.value_json,
  updated_at = excluded.updated_at;
