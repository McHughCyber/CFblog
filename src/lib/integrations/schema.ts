export const INTEGRATIONS_SETTING_KEY = "integrations";

export type AdSenseMode = "auto" | "manual";

export const ADSENSE_PLACEMENT_KEYS = [
  "postTop",
  "postAfterContent",
  "homepageAfterFirstPost",
  "categoryAfterFirstPost",
  "siteFooter"
] as const;

export type AdSensePlacementKey = (typeof ADSENSE_PLACEMENT_KEYS)[number];

export interface GoogleAnalyticsSettings {
  enabled: boolean;
  measurementId: string | null;
}

export interface AdSensePlacementConfig {
  enabled: boolean;
  slotId: string | null;
}

export type AdSensePlacements = Record<
  AdSensePlacementKey,
  AdSensePlacementConfig
>;

export interface GoogleAdSenseSettings {
  enabled: boolean;
  publisherId: string | null;
  mode: AdSenseMode;
  placements: AdSensePlacements;
}

export interface IntegrationsSettings {
  googleAnalytics: GoogleAnalyticsSettings;
  googleAdSense: GoogleAdSenseSettings;
}

export type IntegrationsPatch = Partial<{
  googleAnalytics: Partial<GoogleAnalyticsSettings>;
  googleAdSense: Partial<
    Omit<GoogleAdSenseSettings, "placements"> & {
      placements: Partial<Record<AdSensePlacementKey, Partial<AdSensePlacementConfig>>>;
    }
  >;
}>;

export const DEFAULT_ADSENSE_PLACEMENTS: AdSensePlacements = {
  postTop: { enabled: false, slotId: null },
  postAfterContent: { enabled: false, slotId: null },
  homepageAfterFirstPost: { enabled: false, slotId: null },
  categoryAfterFirstPost: { enabled: false, slotId: null },
  siteFooter: { enabled: false, slotId: null }
};

export const DEFAULT_INTEGRATIONS: IntegrationsSettings = {
  googleAnalytics: {
    enabled: false,
    measurementId: null
  },
  googleAdSense: {
    enabled: false,
    publisherId: null,
    mode: "auto",
    placements: DEFAULT_ADSENSE_PLACEMENTS
  }
};

const GA_MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/;
const ADSENSE_PUBLISHER_ID = /^ca-pub-\d{16}$/;
const ADSENSE_SLOT_ID = /^\d+$/;

function asOptionalString(value: unknown): string | null | undefined {
  if (value === null || value === "") {
    return null;
  }
  return typeof value === "string" ? value.trim() : undefined;
}

export function isGoogleAnalyticsMeasurementId(value: string): boolean {
  return GA_MEASUREMENT_ID.test(value.trim());
}

export function isAdSensePublisherId(value: string): boolean {
  return ADSENSE_PUBLISHER_ID.test(value.trim());
}

export function isAdSenseSlotId(value: string): boolean {
  return ADSENSE_SLOT_ID.test(value.trim());
}

function normaliseMeasurementId(value: unknown): string | null {
  const maybeString = asOptionalString(value);
  if (!maybeString) {
    return null;
  }
  const normalised = maybeString.toUpperCase();
  return isGoogleAnalyticsMeasurementId(normalised) ? normalised : null;
}

function normalisePublisherId(value: unknown): string | null {
  const maybeString = asOptionalString(value);
  if (!maybeString) {
    return null;
  }
  const normalised = maybeString.toLowerCase();
  return isAdSensePublisherId(normalised) ? normalised : null;
}

function normaliseSlotId(value: unknown): string | null {
  const maybeString = asOptionalString(value);
  if (!maybeString) {
    return null;
  }
  return isAdSenseSlotId(maybeString) ? maybeString : null;
}

function normalisePlacements(raw: unknown): AdSensePlacements {
  const placements: AdSensePlacements = {
    postTop: { ...DEFAULT_ADSENSE_PLACEMENTS.postTop },
    postAfterContent: { ...DEFAULT_ADSENSE_PLACEMENTS.postAfterContent },
    homepageAfterFirstPost: { ...DEFAULT_ADSENSE_PLACEMENTS.homepageAfterFirstPost },
    categoryAfterFirstPost: { ...DEFAULT_ADSENSE_PLACEMENTS.categoryAfterFirstPost },
    siteFooter: { ...DEFAULT_ADSENSE_PLACEMENTS.siteFooter }
  };

  if (!raw || typeof raw !== "object") {
    return placements;
  }

  const input = raw as Record<string, unknown>;
  for (const key of ADSENSE_PLACEMENT_KEYS) {
    const rawPlacement = input[key];
    if (!rawPlacement || typeof rawPlacement !== "object") {
      continue;
    }
    const placement = rawPlacement as Partial<AdSensePlacementConfig>;
    placements[key] = {
      enabled:
        typeof placement.enabled === "boolean"
          ? placement.enabled
          : placements[key].enabled,
      slotId: normaliseSlotId(placement.slotId)
    };
  }

  return placements;
}

export function normaliseIntegrationsSettings(raw: unknown): IntegrationsSettings {
  if (!raw || typeof raw !== "object") {
    return {
      googleAnalytics: { ...DEFAULT_INTEGRATIONS.googleAnalytics },
      googleAdSense: {
        ...DEFAULT_INTEGRATIONS.googleAdSense,
        placements: normalisePlacements(null)
      }
    };
  }

  const input = raw as Partial<IntegrationsSettings>;
  const analytics: Partial<GoogleAnalyticsSettings> = input.googleAnalytics ?? {};
  const adSense: Partial<GoogleAdSenseSettings> = input.googleAdSense ?? {};

  return {
    googleAnalytics: {
      enabled:
        typeof analytics.enabled === "boolean"
          ? analytics.enabled
          : DEFAULT_INTEGRATIONS.googleAnalytics.enabled,
      measurementId: normaliseMeasurementId(analytics.measurementId)
    },
    googleAdSense: {
      enabled:
        typeof adSense.enabled === "boolean"
          ? adSense.enabled
          : DEFAULT_INTEGRATIONS.googleAdSense.enabled,
      publisherId: normalisePublisherId(adSense.publisherId),
      mode: adSense.mode === "manual" ? "manual" : "auto",
      placements: normalisePlacements(adSense.placements)
    }
  };
}

export function mergeIntegrationsSettings(
  current: IntegrationsSettings,
  patch: IntegrationsPatch
): IntegrationsSettings {
  const placements: Partial<Record<AdSensePlacementKey, Partial<AdSensePlacementConfig>>> = {};
  for (const key of ADSENSE_PLACEMENT_KEYS) {
    placements[key] = {
      ...current.googleAdSense.placements[key],
      ...patch.googleAdSense?.placements?.[key]
    };
  }

  return normaliseIntegrationsSettings({
    googleAnalytics: {
      ...current.googleAnalytics,
      ...patch.googleAnalytics
    },
    googleAdSense: {
      ...current.googleAdSense,
      ...patch.googleAdSense,
      placements
    }
  });
}

export function parseIntegrationsPatch(
  raw: unknown
): { ok: true; patch: IntegrationsPatch } | { ok: false; error: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Expected a JSON object." };
  }

  const input = raw as Record<string, unknown>;
  const patch: IntegrationsPatch = {};

  if ("googleAnalytics" in input) {
    if (!input.googleAnalytics || typeof input.googleAnalytics !== "object") {
      return { ok: false, error: "googleAnalytics must be an object." };
    }
    const analyticsInput = input.googleAnalytics as Record<string, unknown>;
    const analytics: Partial<GoogleAnalyticsSettings> = {};

    if ("enabled" in analyticsInput) {
      if (typeof analyticsInput.enabled !== "boolean") {
        return { ok: false, error: "googleAnalytics.enabled must be a boolean." };
      }
      analytics.enabled = analyticsInput.enabled;
    }

    if ("measurementId" in analyticsInput) {
      const value = asOptionalString(analyticsInput.measurementId);
      if (value === undefined) {
        return { ok: false, error: "googleAnalytics.measurementId must be a string or null." };
      }
      if (value !== null && !isGoogleAnalyticsMeasurementId(value.toUpperCase())) {
        return { ok: false, error: "Google Analytics Measurement ID must look like G-XXXXXXXX." };
      }
      analytics.measurementId = value === null ? null : value.toUpperCase();
    }

    patch.googleAnalytics = analytics;
  }

  if ("googleAdSense" in input) {
    if (!input.googleAdSense || typeof input.googleAdSense !== "object") {
      return { ok: false, error: "googleAdSense must be an object." };
    }
    const adSenseInput = input.googleAdSense as Record<string, unknown>;
    const adSense: IntegrationsPatch["googleAdSense"] = {};

    if ("enabled" in adSenseInput) {
      if (typeof adSenseInput.enabled !== "boolean") {
        return { ok: false, error: "googleAdSense.enabled must be a boolean." };
      }
      adSense.enabled = adSenseInput.enabled;
    }

    if ("publisherId" in adSenseInput) {
      const value = asOptionalString(adSenseInput.publisherId);
      if (value === undefined) {
        return { ok: false, error: "googleAdSense.publisherId must be a string or null." };
      }
      if (value !== null && !isAdSensePublisherId(value.toLowerCase())) {
        return { ok: false, error: "AdSense Publisher ID must look like ca-pub-0000000000000000." };
      }
      adSense.publisherId = value === null ? null : value.toLowerCase();
    }

    if ("mode" in adSenseInput) {
      if (adSenseInput.mode !== "auto" && adSenseInput.mode !== "manual") {
        return { ok: false, error: "googleAdSense.mode must be auto or manual." };
      }
      adSense.mode = adSenseInput.mode;
    }

    if ("placements" in adSenseInput) {
      if (!adSenseInput.placements || typeof adSenseInput.placements !== "object") {
        return { ok: false, error: "googleAdSense.placements must be an object." };
      }

      const placementsInput = adSenseInput.placements as Record<string, unknown>;
      const placements: NonNullable<IntegrationsPatch["googleAdSense"]>["placements"] = {};
      for (const key of ADSENSE_PLACEMENT_KEYS) {
        if (!(key in placementsInput)) {
          continue;
        }
        const value = placementsInput[key];
        if (!value || typeof value !== "object") {
          return { ok: false, error: `${key} placement must be an object.` };
        }
        const placementInput = value as Record<string, unknown>;
        const placement: Partial<AdSensePlacementConfig> = {};

        if ("enabled" in placementInput) {
          if (typeof placementInput.enabled !== "boolean") {
            return { ok: false, error: `${key}.enabled must be a boolean.` };
          }
          placement.enabled = placementInput.enabled;
        }

        if ("slotId" in placementInput) {
          const slotId = asOptionalString(placementInput.slotId);
          if (slotId === undefined) {
            return { ok: false, error: `${key}.slotId must be a numeric string or null.` };
          }
          if (slotId !== null && !isAdSenseSlotId(slotId)) {
            return { ok: false, error: `${key}.slotId must be numeric.` };
          }
          placement.slotId = slotId;
        }

        placements[key] = placement;
      }
      adSense.placements = placements;
    }

    patch.googleAdSense = adSense;
  }

  return { ok: true, patch };
}

export function validateIntegrationsSettings(
  settings: IntegrationsSettings
): { ok: true } | { ok: false; error: string } {
  if (settings.googleAnalytics.enabled && !settings.googleAnalytics.measurementId) {
    return {
      ok: false,
      error: "Google Analytics requires a Measurement ID before enabling."
    };
  }

  if (settings.googleAdSense.enabled && !settings.googleAdSense.publisherId) {
    return {
      ok: false,
      error: "AdSense requires a Publisher ID before enabling."
    };
  }

  for (const key of ADSENSE_PLACEMENT_KEYS) {
    const placement = settings.googleAdSense.placements[key];
    if (placement.enabled && !placement.slotId) {
      return {
        ok: false,
        error: `${key} requires a slot ID before enabling.`
      };
    }
  }

  return { ok: true };
}
