PRAGMA foreign_keys = ON;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'aiTraffic',
    json_object(
      'siteDescription', 'A Cloudflare-native Astro blog.',
      'robotsPolicy', 'allow',
      'aiUserAgents', json_array(
        'GPTBot',
        'ChatGPT-User',
        'ClaudeBot',
        'anthropic-ai',
        'Google-Extended',
        'PerplexityBot',
        'CCBot',
        'Bytespider',
        'Meta-ExternalAgent',
        'Amazonbot'
      ),
      'llmsTxtEnabled', 1,
      'llmsFullTxtEnabled', 1,
      'crawlersJsonEnabled', 1,
      'contactUrl', NULL,
      'contentLicenseUrl', NULL
    ),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO NOTHING;

INSERT INTO settings (key, value_json, updated_at)
VALUES
  (
    'schema.version',
    json_object('value', '0003_ai_traffic_settings'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
ON CONFLICT(key) DO UPDATE SET
  value_json = excluded.value_json,
  updated_at = excluded.updated_at;
