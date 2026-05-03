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
  });

  it("builds category paths from parent and slug", () => {
    expect(buildCategoryFullPath(null, "guides")).toBe("/guides");
    expect(buildCategoryFullPath("/guides", "intro")).toBe("/guides/intro");
  });

  it("builds post paths from category and slug", () => {
    expect(buildPostFullPath("/getting-started", "welcome")).toBe(
      "/getting-started/welcome"
    );
  });

  it("validates slugs", () => {
    expect(isValidSlug("welcome-to-cfblog")).toBe(true);
    expect(isValidSlug("Bad_Slug")).toBe(false);
  });

  it("derives slug from title", () => {
    expect(slugFromTitle("Hello World!")).toBe("hello-world");
  });
});
