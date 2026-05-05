PRAGMA foreign_keys = ON;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'integrations',
    json_object(
      'googleAnalytics', json_object(
        'enabled', 0,
        'measurementId', NULL
      ),
      'googleAdSense', json_object(
        'enabled', 0,
        'publisherId', NULL,
        'mode', 'auto',
        'placements', json_object(
          'postTop', json_object('enabled', 0, 'slotId', NULL),
          'postAfterContent', json_object('enabled', 0, 'slotId', NULL),
          'homepageAfterFirstPost', json_object('enabled', 0, 'slotId', NULL),
          'categoryAfterFirstPost', json_object('enabled', 0, 'slotId', NULL),
          'siteFooter', json_object('enabled', 0, 'slotId', NULL)
        )
      )
    ),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO NOTHING;

INSERT INTO schema_migrations (version, applied_at)
VALUES ('0006_integrations_settings', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
ON CONFLICT(version) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'schema.version',
    json_object('value', '0006_integrations_settings'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO UPDATE SET
  value_json = excluded.value_json,
  updated_at = excluded.updated_at;
