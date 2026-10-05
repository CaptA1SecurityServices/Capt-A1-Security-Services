# Website improvements — 5 October 2026

Prepared from the user-provided 2 October SEO/performance report. **Local implementation; publication and production validation are pending.**

## Implemented

| Report item | Result |
| --- | --- |
| Contact maps | All three maps start as address cards; clicking View map loads that office only. Directions links remain available. |
| Images | Responsive compressed WebP assets, explicit dimensions and appropriate sizes. The first hero remains eager/high priority; inactive slides remain deferred. Home has a dedicated mobile crop. Original gallery photos are preserved. |
| CSS and rendering | Page-specific purged/minified CSS; content fingerprints for CSS/JS. Removed the redundant large background behind home/about carousels, shortened the transition and stopped autoplay outside the viewport. |
| Tracking security | Exact hash permission for the currently published Meta inline script; explicit Cloudflare beacon and Meta resource permissions. No unsafe-inline or unsafe-eval exemption. Removed the duplicate direct Google Ads loader; GTM remains the configuration owner. |
| Caching | Fingerprinted asset paths and local immutable cache headers. A disabled Cloudflare browser-cache rule is prepared; it excludes HTML and manifests. |
| Review presentation | Removed the unverified overall 4.2 rating. Individual excerpts are labelled as selected reviews, with links to original listings. |
| Service content | Added `/services/security-services-jaipur/` and `/services/commercial-housekeeping/`, with duties, planning, quotation details, FAQs, related links and enquiry routes. No invented Jaipur deployments, fixed prices or availability promises. |
| Contrast | Darker delivery, subtitle and badge text on the service templates. |
| Sitemap | Includes the two new guides and privacy policy, 11 URLs total. Coming-soon services and the staff quotation desk remain excluded. |
| Privacy disclosure | Updated descriptions of the configured Google/Meta/Cloudflare tools and click-to-load maps to match the implementation. |

## Measured local changes

- Homepage initial CSS: 45,216 bytes versus 94,013 bytes of combined source CSS, a 52% reduction before compression. Other public templates reduce source CSS by approximately 64–78%.
- Logo derivative: 8,736 bytes versus the 53,115-byte source.
- Mobile home hero at 768 pixels: approximately 82 KB versus the original approximately 415 KB. Actual chosen image varies with viewport and pixel density; this is not a guaranteed per-visit saving.
- Three Google Maps embeds and their JavaScript are absent before map interaction.
- These are asset measurements, not a new PageSpeed score or a guaranteed LCP/ranking improvement. Repeat the same live PageSpeed tests after publication.

## Verification

Desktop at 1280 pixels and mobile content at 375 pixels were checked across 13 public pages: one visible H1, consistent Inter body font and no horizontal overflow. The in-app browser's viewport override did not apply; mobile testing used a same-origin 375 × 812 iframe, with its inner width verified from the rendered document. This does not cover real iPhone/Safari testing.

The mobile menu, Hindi contact labels, per-office map loading, facility gallery next/close controls, English recruitment/interview views and Jaipur enquiry preset were checked. The Jaipur link selects Security Guards and Jaipur and opens the builder. No enquiry or interview form was submitted.

Required checks: `npm run check`, `npm run test:site`, `npm run test:interview`, `git diff --check`; final diff reviewed before commit. Screenshots and machine-readable QA are saved under ignored `screenshots/` and `outputs/`.

## Search Console — observed 5 October

The verified property is `https://captaina1.com/`. The 28-day report covers 5 September–2 October: 50 clicks, 1,602 impressions, 3.1% CTR and 3.6 overall average position. Branded queries account for much of the visible performance; this does not establish a top-three position for general security keywords.

| URL | Inspection result |
| --- | --- |
| `/` | Indexed; HTTPS |
| `/about.html` | Indexed; HTTPS |
| `/contact.html` | Indexed; HTTPS |
| `/guard-hiring-ajmer.html` | Indexed; HTTPS |
| `/schedule-interview.html` | Discovered, currently not indexed; no recorded crawl |
| `/services/` | URL unknown to Google; no referring sitemap detected in this URL report |
| `/services/security-services/` | Discovered, currently not indexed; sitemap detected, no recorded crawl |
| `/services/facility-manpower-services/` | Discovered, currently not indexed; sitemap detected, no recorded crawl |

The sitemap report itself showed **Success**, last read 3 October, 8 discovered URLs. These newer URL inspections are more relevant than the page-indexing chart last updated 21 September. The seven old exclusions are `/index.html` and six contact-page service parameters with proper canonicals; they are expected aliases, not seven broken pages.

After publication, resubmit the updated sitemap, inspect the active service URLs and request indexing as appropriate. Google decides whether and when to index them. Save the new baseline and compare non-brand queries and qualified enquiries over subsequent weeks.

## Still pending

1. **Publication:** push the reviewed update to `new`, verify the GitHub Pages deployment and public URLs.
2. **HTTPS/cache activation:** enable Cloudflare Always Use HTTPS and the prepared asset-cache rule. Verify permanent redirects preserve paths/queries, HTTPS www still reaches apex, and asset cache headers reflect the intended TTL without caching HTML for a year.
3. **Tracking validation:** GTM diagnostics show “Tag stopped sending data” and a separate recommendation for a second administrator. The published container has an Ads configuration and Meta PageView, but no enquiry/call/WhatsApp conversion tags. Existing dataLayer intent signals alone are insufficient. Verify CSP execution after publication and configure destination conversion events using actual account IDs/labels; do not invent labels or count a click as a completed conversation. A genuine form-delivery test needs the user to expect test emails.
4. **Business profiles/directories:** confirm legitimate branch profiles, public opening hours and directory address/postcode discrepancies before changing them. No profile details or review scores were fabricated or edited.
5. **Performance comparison:** repeat the original mobile/desktop page tests on the live update. No new live score or real-user Core Web Vitals result is claimed yet.

## Technical references

- [Google's CSP guidance](https://developers.google.com/tag-platform/security/guides/csp)
- [Cloudflare analytics collection and CSP](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)
- [Cloudflare's cookie-free analytics description](https://www.cloudflare.com/web-analytics/)
- [Cloudflare browser and edge cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)
- [Google LCP optimization guidance](https://web.dev/articles/optimize-lcp)
