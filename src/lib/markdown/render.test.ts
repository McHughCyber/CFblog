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

  it("removes event handlers and disallowed embeds", async () => {
    const html = await renderMarkdown(
      [
        '<img src="/media/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee" alt="Hero" onerror="alert(1)">',
        '<iframe src="https://example.com/embed"></iframe>',
        '<p onclick="alert(1)">Clickable</p>'
      ].join("\n")
    );

    expect(html).toContain('src="/media/aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"');
    expect(html).toContain('alt="Hero"');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("onclick");
  });

  it("strips xmp smuggled script and event-handler payloads (GHSA-rpr9-rxv7-x643)", async () => {
    const cases = [
      "<xmp><script>alert(1)</script></xmp>",
      "<xmp><img src=x onerror=alert(1)></xmp>",
      "<xmp><svg><script>alert(1)</script></svg></xmp>"
    ];

    for (const markdown of cases) {
      const html = await renderMarkdown(markdown);
      expect(html).not.toMatch(/<script/i);
      expect(html).not.toMatch(/onerror/i);
      expect(html).not.toMatch(/<svg/i);
    }
  });

  it("allows http, https, and mailto links while stripping unsafe schemes", async () => {
    const html = await renderMarkdown(
      [
        "[Web](https://example.com)",
        "[Email](mailto:editor@example.com)",
        "[Bad](data:text/html,<script>alert(1)</script>)"
      ].join("\n\n")
    );

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('href="mailto:editor@example.com"');
    expect(html).not.toContain("data:text/html");
    expect(html).not.toContain("<script>");
  });
});
