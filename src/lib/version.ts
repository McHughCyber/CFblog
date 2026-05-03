export const TEMPLATE_VERSION = "0.1.0";
export const SCHEMA_VERSION = "0005_milestone_review_fixes";

export interface VersionSetting {
  value: string;
}

export function versionValue(setting: VersionSetting | null, fallback: string): string {
  return setting?.value ?? fallback;
}
