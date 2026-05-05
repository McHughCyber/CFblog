import { getSetting } from "../db/settings";
import {
  INTEGRATIONS_SETTING_KEY,
  normaliseIntegrationsSettings,
  type IntegrationsSettings
} from "./schema";

export async function loadIntegrationsSettings(
  database: D1Database
): Promise<IntegrationsSettings> {
  const raw = await getSetting(database, INTEGRATIONS_SETTING_KEY);
  return normaliseIntegrationsSettings(raw);
}
