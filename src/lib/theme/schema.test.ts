import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, mergeTheme, normaliseTheme, parseThemePatch } from "./schema";

describe("normaliseTheme", () => {
  it("fills defaults for empty input", () => {
    expect(normaliseTheme(null)).toEqual(DEFAULT_THEME);
  });

  it("maps legacy fontFamily to typographyPreset", () => {
    const t = normaliseTheme({ accentColor: "#2f6f4e", fontFamily: "system" });
    expect(t.typographyPreset).toBe("system");
    expect(t.accentColor).toBe("#2f6f4e");
  });

  it("rejects invalid media paths", () => {
    const t = normaliseTheme({ logoPublicPath: "/evil" });
    expect(t.logoPublicPath).toBeNull();
  });

  it("accepts valid media path", () => {
    const id = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee";
    const t = normaliseTheme({ logoPublicPath: `/media/${id}` });
    expect(t.logoPublicPath).toBe(`/media/${id}`);
  });
});

describe("parseThemePatch", () => {
  it("rejects bad hex", () => {
    const r = parseThemePatch({ accentColor: "red" });
    expect(r.ok).toBe(false);
  });

  it("accepts partial patch", () => {
    const r = parseThemePatch({ accentColor: "#abacad" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.patch.accentColor).toBe("#abacad");
    }
  });
});

describe("mergeTheme", () => {
  it("overrides selected fields", () => {
    const next = mergeTheme(DEFAULT_THEME, { postListingStyle: "cards" });
    expect(next.postListingStyle).toBe("cards");
    expect(next.accentColor).toBe(DEFAULT_THEME.accentColor);
  });
});
