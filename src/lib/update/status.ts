import { listAppliedMigrations } from "../db/settings";
import { SCHEMA_VERSION, TEMPLATE_VERSION, versionValue, type VersionSetting } from "../version";
import { getSetting } from "../db/settings";

export interface UpdateStatus {
  templateVersion: string;
  installedTemplateVersion: string;
  schemaVersion: string;
  installedSchemaVersion: string;
  appliedMigrations: string[];
  pendingLocalMigrations: string[];
}

export const LOCAL_MIGRATIONS = [
  "0001_initial_schema",
  "0002_seed_defaults",
  "0003_ai_traffic_settings",
  "0004_update_strategy",
  "0005_milestone_review_fixes"
];

export async function getUpdateStatus(database: D1Database): Promise<UpdateStatus> {
  const [templateSetting, schemaSetting, applied] = await Promise.all([
    getSetting<VersionSetting>(database, "template.version"),
    getSetting<VersionSetting>(database, "schema.version"),
    listAppliedMigrations(database)
  ]);

  const appliedMigrations = applied.map((migration) => migration.version);
  const appliedSet = new Set(appliedMigrations);

  return {
    templateVersion: TEMPLATE_VERSION,
    installedTemplateVersion: versionValue(templateSetting, "unknown"),
    schemaVersion: SCHEMA_VERSION,
    installedSchemaVersion: versionValue(schemaSetting, "unknown"),
    appliedMigrations,
    pendingLocalMigrations: LOCAL_MIGRATIONS.filter((migration) => !appliedSet.has(migration))
  };
}
