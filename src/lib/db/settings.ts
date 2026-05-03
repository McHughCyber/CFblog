import { all, first, run } from "./client";
import type { SchemaMigrationRecord, SettingRecord } from "./types";

export async function listSettings(
  database: D1Database
): Promise<SettingRecord[]> {
  return all<SettingRecord>(database, "SELECT * FROM settings ORDER BY key");
}

export async function getSetting<T>(
  database: D1Database,
  key: string
): Promise<T | null> {
  const setting = await first<SettingRecord>(
    database,
    "SELECT * FROM settings WHERE key = ?",
    [key]
  );

  if (!setting) {
    return null;
  }

  return JSON.parse(setting.value_json) as T;
}

export async function setSetting(
  database: D1Database,
  key: string,
  value: unknown,
  now = new Date().toISOString()
): Promise<D1Result> {
  return run(
    database,
    `
      INSERT INTO settings (key, value_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at
    `,
    [key, JSON.stringify(value), now]
  );
}

export async function listAppliedMigrations(
  database: D1Database
): Promise<SchemaMigrationRecord[]> {
  return all<SchemaMigrationRecord>(
    database,
    "SELECT * FROM schema_migrations ORDER BY applied_at"
  );
}
