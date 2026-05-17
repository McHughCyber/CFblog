export const TEMPLATE_VERSION = "2026.05.2";
export const SCHEMA_VERSION = "0006_integrations_settings";

export interface VersionSetting {
  value: string;
}

export function versionValue(setting: VersionSetting | null, fallback: string): string {
  return setting?.value ?? fallback;
}
