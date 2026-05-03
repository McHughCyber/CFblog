import { describe, expect, it } from "vitest";
import { customCssSafeForInlineStyle, validateCustomCssForStorage } from "./custom-css-guard";

describe("validateCustomCssForStorage", () => {
  it("allows benign rules", () => {
    expect(validateCustomCssForStorage(".shell { margin: 0; }").ok).toBe(true);
  });

  it("blocks closing style", () => {
    const r = validateCustomCssForStorage("a { color: red; }</style>");
    expect(r.ok).toBe(false);
  });

  it("blocks script", () => {
    expect(validateCustomCssForStorage("/* x */<script>").ok).toBe(false);
  });
});

describe("customCssSafeForInlineStyle", () => {
  it("returns empty for unsafe css", () => {
    expect(customCssSafeForInlineStyle("</style>")).toBe("");
  });
});
