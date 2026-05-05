import { describe, expect, it } from "vitest";
import {
  buildCategoryFullPath,
  buildPostFullPath,
  isValidSlug,
  normalizeFullPath,
  slugFromTitle
} from "./paths";

describe("paths", () => {
  it("normalises full paths", () => {
    expect(normalizeFullPath("getting-started/hello")).toBe("/getting-started/hello");
    expect(normalizeFullPath("/a//b/")).toBe("/a/b");
    expect(normalizeFullPath("  /a / b///  ")).toBe("/a/b");
    expect(normalizeFullPath("/")).toBe("/");
  });

  it("builds category paths from parent and slug", () => {
    expect(buildCategoryFullPath(null, "guides")).toBe("/guides");
    expect(buildCategoryFullPath("/guides", "intro")).toBe("/guides/intro");
    expect(buildCategoryFullPath("/", "/News/")).toBe("/news");
    expect(buildCategoryFullPath("/guides/", "/Astro/")).toBe("/guides/astro");
  });

  it("builds post paths from category and slug", () => {
    expect(buildPostFullPath("/getting-started", "welcome")).toBe(
      "/getting-started/welcome"
    );
    expect(buildPostFullPath("/", "/Hello-World/")).toBe("/hello-world");
    expect(buildPostFullPath("/guides/", "/Setup/")).toBe("/guides/setup");
  });

  it("validates slugs", () => {
    expect(isValidSlug("welcome-to-cfblog")).toBe(true);
    expect(isValidSlug("Bad_Slug")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
    expect(isValidSlug("double--dash")).toBe(false);
    expect(isValidSlug("contains space")).toBe(false);
  });

  it("derives slug from title", () => {
    expect(slugFromTitle("Hello World!")).toBe("hello-world");
    expect(slugFromTitle("Editor's Guide: Astro + Cloudflare")).toBe(
      "editors-guide-astro-cloudflare"
    );
    expect(slugFromTitle("   ")).toBe("post");
  });
});
