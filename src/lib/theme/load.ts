import { getSetting } from "../db/settings";
import { normaliseTheme, type ThemeSettings } from "./schema";

export async function loadTheme(database: D1Database): Promise<ThemeSettings> {
  const raw = await getSetting(database, "theme");
  return normaliseTheme(raw);
}
