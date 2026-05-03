import { describe, expect, it } from "vitest";
import { themeToGlobalCss } from "./cssVariables";
import { DEFAULT_THEME } from "./schema";

describe("themeToGlobalCss", () => {
  it("includes core variables", () => {
    const css = themeToGlobalCss(DEFAULT_THEME);
    expect(css).toContain("--cf-accent:");
    expect(css).toContain("--cf-bg:");
    expect(css).toContain("--cf-font-body:");
  });

  it("reflects typography preset", () => {
    const css = themeToGlobalCss({ ...DEFAULT_THEME, typographyPreset: "mono" });
    expect(css).toContain("monospace");
  });
});
