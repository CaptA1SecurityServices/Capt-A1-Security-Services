# Website improvements — 5 October 2026

Prepared from the user-provided 2 October SEO/performance report. **Published on 5 October with explicit user authorization.** The live rerun and comparison are saved locally at `outputs/SEO_RERUN_REPORT_2026-10-05.md`.

## Implemented

| Report item | Result |
| --- | --- |
| Contact maps | All three maps start as address cards; clicking View map loads that office only. Directions links remain available. |
| Images | Responsive compressed WebP assets, explicit dimensions and appropriate sizes. The first hero remains eager/high priority; inactive slides remain deferred. Home has a dedicated mobile crop. Original gallery photos are preserved. |
| CSS and rendering | Page-specific purged/minified CSS; content fingerprints for CSS/JS. Removed the redundant large background behind home/about carousels, shortened the transition and stopped autoplay outside the viewport. |
| Tracking security | Exact hash permission for the currently published Meta inline script; explicit Cloudflare beacon and Meta resource permissions. No unsafe-inline or unsafe-eval exemption. Removed the duplicate direct Google Ads loader; GTM remains the configuration owner. |
| Caching | Fingerprinted asset paths and an active Cloudflare browser-cache rule. Live sample assets return max-age=31536000 and HIT; HTML remains max-age=600 outside the rule. |
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

The updated sitemap was resubmitted and Google read it on 5 October: Success, 11 discovered URLs. Indexing requests were accepted for Services, Security Services, Facility & Manpower, Jaipur Security, Commercial Housekeeping and Interview Scheduling. Google decides whether and when to index them. Compare non-brand queries and qualified enquiries over subsequent weeks; request acceptance does not prove indexing.

## Production verification and remaining work

1. **Publication verified:** approved source updates `3f863ea`, `4c5bffa`, `c312d56` and `e33231d` have successful Pages deployments. All 14 audited HTML routes return 200, including three deliberately noindex routes. No failed site-owned asset/internal-link destinations in the live crawl.
2. **HTTPS/cache verified:** Always Use HTTPS and the asset rule are active. Permanent redirects preserve paths/queries; HTTPS www reaches apex; sampled fingerprints cache for a year while HTML does not.
3. **Tracking validation:** initial GTM diagnostics showed “Tag stopped sending data” and a separate recommendation for a second administrator. The deployed site now loads GTM, Ads, Meta and Cloudflare scripts without captured console errors. Destination receipt and diagnosis resolution remain unverified. The published container has no enquiry/call/WhatsApp conversion tags; existing dataLayer intent signals alone are insufficient. Configure events using actual account IDs/labels, without counting a click as a completed conversation. A genuine form-delivery test needs the user to expect test emails.
4. **Business profiles/directories:** confirm legitimate branch profiles, public opening hours and directory address/postcode discrepancies before changing them. No profile details or review scores were fabricated or edited.
5. **Performance comparison completed:** final Google mobile/desktop tests cover all 11 active URLs. Basic SEO, accessibility and Best Practices all score 100 on both device reports. The first runs exposed additional rendering competition and contrast issues; those were corrected and rerun. GTM now starts after page load/rendering/idle, preserving queued intents; very short visits may not reach initialization. Contact/Services preload existing fonts to address movement. See the report for exact scores and remaining performance findings. No real-user Core Web Vitals pass is claimed.

For the same eight baseline pages, average mobile performance increased from 71.5 to 83.1; average desktop performance fell from 93.9 to 88.1 in these lab snapshots. Homepage mobile is 98 (LCP 1.81 s), Security 89, Facility 85 and Interview 98. Services mobile remains 62 and Privacy 67; investigate remaining render delay and third-party work. Contact and Services measured CLS is now 0 after font preloading. Passing SEO basics does not demonstrate improved Google ranking.

## Technical references

- [Google's CSP guidance](https://developers.google.com/tag-platform/security/guides/csp)
- [Cloudflare analytics collection and CSP](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)
- [Cloudflare's cookie-free analytics description](https://www.cloudflare.com/web-analytics/)
- [Cloudflare browser and edge cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)
- [Google LCP optimization guidance](https://web.dev/articles/optimize-lcp)
