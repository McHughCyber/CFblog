import { describe, expect, it } from "vitest";
import { normaliseIntegrationsSettings } from "./schema";
import {
  renderAdSenseLoaderHtml,
  renderAdSenseSlotHtml,
  renderGoogleAnalyticsHtml
} from "./render";

describe("integration rendering", () => {
  it("renders no Google scripts when disabled", () => {
    const settings = normaliseIntegrationsSettings(null);

    expect(renderGoogleAnalyticsHtml(settings)).toBe("");
    expect(renderAdSenseLoaderHtml(settings)).toBe("");
    expect(renderAdSenseSlotHtml(settings, "postTop")).toBe("");
  });

  it("renders Analytics only when enabled with a valid Measurement ID", () => {
    const settings = normaliseIntegrationsSettings({
      googleAnalytics: {
        enabled: true,
        measurementId: "G-ABCD1234"
      }
    });

    const html = renderGoogleAnalyticsHtml(settings);
    expect(html).toContain("https://www.googletagmanager.com/gtag/js?id=G-ABCD1234");
    expect(html).toContain("gtag('config', 'G-ABCD1234')");
  });

  it("renders the AdSense loader when enabled with a valid Publisher ID", () => {
    const settings = normaliseIntegrationsSettings({
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456"
      }
    });

    expect(renderAdSenseLoaderHtml(settings)).toContain(
      "pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
    );
  });

  it("does not render manual slots in Auto ads mode", () => {
    const settings = normaliseIntegrationsSettings({
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456",
        mode: "auto",
        placements: {
          postTop: {
            enabled: true,
            slotId: "1234567890"
          }
        }
      }
    });

    expect(renderAdSenseSlotHtml(settings, "postTop")).toBe("");
  });

  it("renders enabled manual slots with valid slot IDs", () => {
    const settings = normaliseIntegrationsSettings({
      googleAdSense: {
        enabled: true,
        publisherId: "ca-pub-1234567890123456",
        mode: "manual",
        placements: {
          postTop: {
            enabled: true,
            slotId: "1234567890"
          }
        }
      }
    });

    const html = renderAdSenseSlotHtml(settings, "postTop");
    expect(html).toContain('data-ad-client="ca-pub-1234567890123456"');
    expect(html).toContain('data-ad-slot="1234567890"');
    expect(html).toContain("(adsbygoogle = window.adsbygoogle || []).push({});");
  });
});
