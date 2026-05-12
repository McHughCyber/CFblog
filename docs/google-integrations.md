# Google Integrations

See also: [README](../README.md) (documentation map), [Admin guide](admin-guide.md), [Configuration reference](configuration-reference.md).

CFblog can optionally render Google Analytics and Google AdSense tags on public
blog pages. Both integrations are disabled by default and are configured from
`/admin/settings`.

## Google Analytics

Enable Analytics by adding a GA4 Measurement ID in the format `G-XXXXXXXX`.
CFblog renders the standard `gtag.js` snippet only when Analytics is enabled and
the Measurement ID is valid.

Admin pages do not render Analytics tags.

## Google AdSense

Enable AdSense by adding a Publisher ID in the format
`ca-pub-0000000000000000`.

AdSense supports two modes:

- Auto ads: CFblog renders the AdSense loader and lets Google choose placements.
- Manual placements: CFblog renders the AdSense loader plus enabled fixed ad
  slots using slot IDs created in AdSense.

Manual placement keys:

| Placement | Public location |
| --- | --- |
| Post top | After post title/date and before the article body. |
| Post after content | After the article body. |
| Homepage after first post | Between the first and second homepage post entries. |
| Category after first post | Between the first and second category post entries. |
| Site footer | Above the public footer. |

Manual placement slot IDs must be numeric strings. CFblog does not accept pasted
AdSense HTML or JavaScript snippets.

## Privacy And Consent

Google Analytics and AdSense may require privacy disclosures, consent handling,
or regional configuration depending on where the site operates and who visits
it. CFblog v1 documents this responsibility but does not include a built-in
consent banner.

For advanced consent management, consider Cloudflare Zaraz with a supported
consent management platform:

- Cloudflare Zaraz Google Consent Mode: https://developers.cloudflare.com/zaraz/advanced/google-consent-mode/
- Cloudflare Zaraz Consent Management: https://developers.cloudflare.com/zaraz/consent-management/

Site operators are responsible for confirming that their configuration complies
with their legal and policy obligations.
