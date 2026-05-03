PRAGMA foreign_keys = ON;

INSERT INTO schema_migrations (version, applied_at)
VALUES
  ('0003_ai_traffic_settings', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  ('0004_update_strategy', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'template.version',
    json_object('value', '0.1.0'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'schema.version',
    json_object('value', '0004_update_strategy'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO UPDATE SET
  value_json = excluded.value_json,
  updated_at = excluded.updated_at;
