import { describe, expect, it } from "vitest";
import { buildFooterRenderModel } from "./footer-render";
import type { ResolvedMenuNode } from "./resolve";

function menuNode(label: string): ResolvedMenuNode {
  return {
    id: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    href: `/${label.toLowerCase().replace(/\s+/g, "-")}`,
    ok: true,
    openInNewTab: false,
    children: []
  };
}

describe("buildFooterRenderModel", () => {
  it("shows footer navigation when menu items exist", () => {
    const model = buildFooterRenderModel([menuNode("About")], "CFblog", 2026);

    expect(model.showNav).toBe(true);
    expect(model.fallbackText).toBe("CFblog © 2026");
  });

  it("shows fallback text when footer navigation is empty", () => {
    const model = buildFooterRenderModel([], "My Blog", 2030);

    expect(model.showNav).toBe(false);
    expect(model.fallbackText).toBe("My Blog © 2030");
  });

  it("uses default site title when provided title is blank", () => {
    const model = buildFooterRenderModel([], "   ", 2031);

    expect(model.showNav).toBe(false);
    expect(model.fallbackText).toBe("CFblog © 2031");
  });
});
