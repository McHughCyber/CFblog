export type TypographyPreset = "system" | "serif" | "mono" | "newsprint";

export type HomepageLayout = "classic" | "magazine";

export type PostListingStyle = "list" | "cards";

export interface ThemeSettings {
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  mutedTextColor: string;
  typographyPreset: TypographyPreset;
  homepageLayout: HomepageLayout;
  postListingStyle: PostListingStyle;
  logoPublicPath: string | null;
  faviconPublicPath: string | null;
  customCss: string;
}

export const DEFAULT_THEME: ThemeSettings = {
  accentColor: "#2f6f4e",
  backgroundColor: "#f7f4ee",
  surfaceColor: "#ffffff",
  textColor: "#1d2520",
  borderColor: "#d7d0c4",
  mutedTextColor: "#68746a",
  typographyPreset: "serif",
  homepageLayout: "classic",
  postListingStyle: "list",
  logoPublicPath: null,
  faviconPublicPath: null,
  customCss: ""
};

const HEX = /^#[0-9a-fA-F]{6}$/;
const MEDIA_PATH = /^\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TYPO: TypographyPreset[] = ["system", "serif", "mono", "newsprint"];
const LAYOUT: HomepageLayout[] = ["classic", "magazine"];
const LISTING: PostListingStyle[] = ["list", "cards"];

function isHex(value: string): boolean {
  return HEX.test(value);
}

function isMediaPath(value: string | null): value is string {
  return typeof value === "string" && MEDIA_PATH.test(value);
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asNullableString(v: unknown): string | null | undefined {
  if (v === null) {
    return null;
  }
  return typeof v === "string" ? v : undefined;
}

function legacyTypography(o: Record<string, unknown>): TypographyPreset | undefined {
  const ff = asString(o.fontFamily);
  if (ff === "system") {
    return "system";
  }
  if (ff === "serif") {
    return "serif";
  }
  return undefined;
}

export function normaliseTheme(raw: unknown): ThemeSettings {
  const base: ThemeSettings = { ...DEFAULT_THEME };
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const o = raw as Record<string, unknown>;

  const typoLegacy = legacyTypography(o);
  if (typoLegacy) {
    base.typographyPreset = typoLegacy;
  }

  const accent = asString(o.accentColor);
  if (accent && isHex(accent)) {
    base.accentColor = accent;
  }

  const bg = asString(o.backgroundColor);
  if (bg && isHex(bg)) {
    base.backgroundColor = bg;
  }
  const surface = asString(o.surfaceColor);
  if (surface && isHex(surface)) {
    base.surfaceColor = surface;
  }
  const text = asString(o.textColor);
  if (text && isHex(text)) {
    base.textColor = text;
  }
  const border = asString(o.borderColor);
  if (border && isHex(border)) {
    base.borderColor = border;
  }
  const muted = asString(o.mutedTextColor);
  if (muted && isHex(muted)) {
    base.mutedTextColor = muted;
  }

  const typo = asString(o.typographyPreset);
  if (typo && (TYPO as string[]).includes(typo)) {
    base.typographyPreset = typo as TypographyPreset;
  }

  const home = asString(o.homepageLayout);
  if (home && (LAYOUT as string[]).includes(home)) {
    base.homepageLayout = home as HomepageLayout;
  }

  const listing = asString(o.postListingStyle);
  if (listing && (LISTING as string[]).includes(listing)) {
    base.postListingStyle = listing as PostListingStyle;
  }

  const logo = asNullableString(o.logoPublicPath);
  if (logo === null) {
    base.logoPublicPath = null;
  } else if (logo !== undefined) {
    base.logoPublicPath = isMediaPath(logo.trim()) ? logo.trim() : null;
  }

  const fav = asNullableString(o.faviconPublicPath);
  if (fav === null) {
    base.faviconPublicPath = null;
  } else if (fav !== undefined) {
    const t = fav.trim();
    base.faviconPublicPath = isMediaPath(t) ? t : null;
  }

  const css = asString(o.customCss);
  if (css !== undefined) {
    base.customCss = css.length > 24_000 ? css.slice(0, 24_000) : css;
  }

  return base;
}

export type ThemePatch = Partial<Omit<ThemeSettings, "customCss">> & {
  customCss?: string;
};

export function parseThemePatch(body: unknown): { ok: true; patch: ThemePatch } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Expected JSON object." };
  }
  const o = body as Record<string, unknown>;
  const patch: ThemePatch = {};

  const colourKeys = [
    "accentColor",
    "backgroundColor",
    "surfaceColor",
    "textColor",
    "borderColor",
    "mutedTextColor"
  ] as const;

  for (const key of colourKeys) {
    if (!(key in o)) {
      continue;
    }
    const v = o[key];
    if (v === null || v === undefined) {
      continue;
    }
    if (typeof v !== "string" || !isHex(v)) {
      return { ok: false, error: `Invalid colour for ${key} (use #RRGGBB).` };
    }
    patch[key] = v;
  }

  if ("typographyPreset" in o) {
    const v = o.typographyPreset;
    if (typeof v !== "string" || !(TYPO as string[]).includes(v)) {
      return { ok: false, error: "Invalid typographyPreset." };
    }
    patch.typographyPreset = v as TypographyPreset;
  }

  if ("homepageLayout" in o) {
    const v = o.homepageLayout;
    if (typeof v !== "string" || !(LAYOUT as string[]).includes(v)) {
      return { ok: false, error: "Invalid homepageLayout." };
    }
    patch.homepageLayout = v as HomepageLayout;
  }

  if ("postListingStyle" in o) {
    const v = o.postListingStyle;
    if (typeof v !== "string" || !(LISTING as string[]).includes(v)) {
      return { ok: false, error: "Invalid postListingStyle." };
    }
    patch.postListingStyle = v as PostListingStyle;
  }

  if ("logoPublicPath" in o) {
    const v = o.logoPublicPath;
    if (v !== null && (typeof v !== "string" || !isMediaPath(v.trim()))) {
      return { ok: false, error: "logoPublicPath must be null or /media/{uuid}." };
    }
    patch.logoPublicPath = v === null ? null : (v as string).trim();
  }

  if ("faviconPublicPath" in o) {
    const v = o.faviconPublicPath;
    if (v !== null && (typeof v !== "string" || !isMediaPath(v.trim()))) {
      return { ok: false, error: "faviconPublicPath must be null or /media/{uuid}." };
    }
    patch.faviconPublicPath = v === null ? null : (v as string).trim();
  }

  if ("customCss" in o) {
    const v = o.customCss;
    if (typeof v !== "string") {
      return { ok: false, error: "customCss must be a string." };
    }
    patch.customCss = v.length > 24_000 ? v.slice(0, 24_000) : v;
  }

  return { ok: true, patch };
}

export function mergeTheme(current: ThemeSettings, patch: ThemePatch): ThemeSettings {
  return normaliseTheme({ ...current, ...patch });
}
