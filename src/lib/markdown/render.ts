import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "ul"
];

export async function renderMarkdown(markdown: string): Promise<string> {
  const html = await marked.parse(markdown, {
    async: true,
    gfm: true
  });

  return sanitizeHtml(html, {
    allowedTags,
    // Explicitly include xmp in nonTextTags so its raw contents are fully
    // dropped rather than passed through unescaped (GHSA-rpr9-rxv7-x643).
    nonTextTags: ["style", "script", "textarea", "option", "noscript", "xmp"],
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"]
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "nofollow noopener noreferrer"
      }),
      img: sanitizeHtml.simpleTransform("img", {
        loading: "lazy"
      })
    }
  });
}
