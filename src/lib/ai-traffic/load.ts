import { getSetting } from "../db/settings";
import {
  AI_TRAFFIC_SETTING_KEY,
  normaliseAiTrafficSettings,
  type AiTrafficSettings
} from "./schema";

export async function loadAiTrafficSettings(
  database: D1Database
): Promise<AiTrafficSettings> {
  const raw = await getSetting(database, AI_TRAFFIC_SETTING_KEY);
  return normaliseAiTrafficSettings(raw);
}
