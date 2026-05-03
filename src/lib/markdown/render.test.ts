import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./render";

describe("renderMarkdown", () => {
  it("renders Markdown and removes unsafe HTML", async () => {
    const html = await renderMarkdown(
      "Hello **reader**.\n\n<script>alert('xss')</script>\n\n[link](javascript:alert('xss'))"
    );

    expect(html).toContain("<strong>reader</strong>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("javascript:");
  });

  it("adds safe defaults to links and images", async () => {
    const html = await renderMarkdown(
      "[Cloudflare](https://developers.cloudflare.com)\n\n![Alt](https://example.com/image.png)"
    );

    expect(html).toContain('rel="nofollow noopener noreferrer"');
    expect(html).toContain('loading="lazy"');
  });

  it("allows same-site relative image paths for media library", async () => {
    const html = await renderMarkdown("![Hero](/media/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee)");
    expect(html).toContain('src="/media/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"');
    expect(html).toContain('loading="lazy"');
  });
});
