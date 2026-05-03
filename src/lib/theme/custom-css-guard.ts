/**
 * Theme custom CSS is injected into a style tag. Block patterns that could
 * close the tag or start executable markup. Admins are trusted but mistakes happen.
 */
const BLOCKED = /<\/\s*style/i;

export function validateCustomCssForStorage(css: string): { ok: true } | { ok: false; error: string } {
  if (css.length > 24_000) {
    return { ok: false, error: "Custom CSS exceeds 24 KB." };
  }
  if (BLOCKED.test(css)) {
    return {
      ok: false,
      error: "Custom CSS must not contain a closing </style> sequence (case-insensitive)."
    };
  }
  if (/<\s*script/i.test(css)) {
    return { ok: false, error: "Custom CSS must not contain script tags." };
  }
  return { ok: true };
}

export function customCssSafeForInlineStyle(css: string): string {
  const t = css.trim();
  if (!t) {
    return "";
  }
  if (!validateCustomCssForStorage(t).ok) {
    return "";
  }
  return t;
}
