import { describe, expect, it } from "vitest";
import {
  DEFAULT_INTEGRATIONS,
  mergeIntegrationsSettings,
  normaliseIntegrationsSettings,
  parseIntegrationsPatch,
  validateIntegrationsSettings
} from "./schema";

describe("normaliseIntegrationsSettings", () => {
  it("uses disabled defaults when missing", () => {
    expect(normaliseIntegrationsSettings(null)).toEqual(DEFAULT_INTEGRATIONS);
  });

  it("keeps valid Google IDs and drops invalid IDs", () => {
    const settings = normaliseIntegrationsSettings({
      googleAnalytics: {
        enabled: true,
        measurementId: "g-abcd1234"
      },
      googleAdSense: {
        enabled: true,
        publisherId: "CA-PUB-1234567890123456",
        mode: "manual",
        placements: {
          postTop: {
            enabled: true,
            slotId: "1234567890"
          },
          siteFooter: {
            enabled: true,
            slotId: "not-numeric"
          }
        }
      }
    });

    expect(settings.googleAnalytics.measurementId).toBe("G-ABCD1234");
    expect(settings.googleAdSense.publisherId).toBe("ca-pub-1234567890123456");
    expect(settings.googleAdSense.placements.postTop.slotId).toBe("1234567890");
    expect(settings.googleAdSense.placements.siteFooter.slotId).toBeNull();
  });
});

describe("parseIntegrationsPatch", () => {
  it("rejects invalid Analytics IDs", () => {
    const parsed = parseIntegrationsPatch({
      googleAnalytics: {
        enabled: true,
        measurementId: "UA-123"
      }
    });

    expect(parsed.ok).toBe(false);
  });

  it("rejects invalid AdSense publisher IDs", () => {
    const parsed = parseIntegrationsPatch({
      googleAdSense: {
        enabled: true,
        publisherId: "pub-123",
        mode: "auto"
      }
    });

    expect(parsed.ok).toBe(false);
  });

  it("rejects enabled manual placements without numeric slot IDs", () => {
    const parsed = parseIntegrationsPatch({
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456",
        mode: "manual",
        placements: {
          postTop: {
            enabled: true,
            slotId: "abc"
          }
        }
      }
    });

    expect(parsed.ok).toBe(false);
  });

  it("parses valid settings", () => {
    const parsed = parseIntegrationsPatch({
      googleAnalytics: {
        enabled: true,
        measurementId: "G-ABCD1234"
      },
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456",
        mode: "manual",
        placements: {
          postAfterContent: {
            enabled: true,
            slotId: "9876543210"
          }
        }
      }
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.patch.googleAdSense?.placements?.postAfterContent?.slotId).toBe(
        "9876543210"
      );
    }
  });
});

describe("mergeIntegrationsSettings", () => {
  it("preserves existing placement fields during partial updates", () => {
    const current = normaliseIntegrationsSettings({
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456",
        mode: "manual",
        placements: {
          postTop: {
            enabled: false,
            slotId: "1234567890"
          }
        }
      }
    });

    const merged = mergeIntegrationsSettings(current, {
      googleAdSense: {
        placements: {
          postTop: {
            enabled: true
          }
        }
      }
    });

    expect(merged.googleAdSense.placements.postTop).toEqual({
      enabled: true,
      slotId: "1234567890"
    });
  });
});

describe("validateIntegrationsSettings", () => {
  it("requires IDs before enabled services are valid", () => {
    const settings = normaliseIntegrationsSettings({
      googleAnalytics: {
        enabled: true,
        measurementId: null
      }
    });

    expect(validateIntegrationsSettings(settings).ok).toBe(false);
  });
});
