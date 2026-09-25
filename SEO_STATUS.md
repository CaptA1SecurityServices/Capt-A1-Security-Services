# SEO implementation — 24 September 2026

## Content and performance update — 25 September 2026

- Added responsive WebP assets, deferred inactive carousel photographs and locally hosted shared fonts. Original photographs are preserved.
- Updated active-page titles, descriptions, headings, internal homepage URLs, business-linked page markup and practical security/housekeeping FAQs.
- Search Console accepted the sitemap submission. Its indexed-page report is delayed; canonical duplicates are expected exclusions and are not evidence that the canonical service pages failed.
- Shared contact-intent events cover phone, WhatsApp and email links; destination analytics reporting and successful enquiry delivery remain unverified.
- HTTP-to-HTTPS enforcement remains blocked on access to the account managing the domain. The accessible Cloudflare account had no managed zones. No DNS or proxy changes were made.
- Upcoming services remain noindex and outside the sitemap. Search ranking improvements are not guaranteed by these changes.

## Launch update — 25 September 2026 (supersedes earlier phase notes)

- Security and Facility & Manpower are the active verticals. Workforce Management (03) and Equipment & Site Readiness (04) are Coming soon, with short status pages, no booking controls, no Service schema, and `noindex, follow`. They are excluded from the sitemap; crawling is allowed so search engines can see the noindex directive.
- The Services overview advertises only the active services as available. Its enquiry form and service schema exclude the two upcoming categories. Existing category links now lead to explicit status pages.
- Active service pages have unique titles, descriptions, canonical URLs, breadcrumbs and service markup. Real photo assets, keyboard-accessible gallery and responsive layouts were checked. No external rich-result validation or field Core Web Vitals certification is claimed.
- GitHub's Pages API reports certificate state `bad_authz`, with a listed expiration of 1 October 2026. Enabling `https_enforced` was attempted and rejected by GitHub with “The certificate has not finished being issued.” Public apex DNS resolves to Cloudflare-proxied addresses. The live HTTPS site works, but HTTP-to-HTTPS enforcement and origin certificate renewal need review in the domain/Cloudflare and GitHub Pages dashboards. Do not disable the proxy or change DNS blindly.
- Search Console submission, indexing confirmation, GA4/GTM production reporting and real enquiry delivery remain account-dependent follow-ups, not completed SEO items.

Google guidance: https://developers.google.com/search/docs/crawling-indexing/block-indexing and https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap.

Source: [Notion Services SEO Optimisation Plan](https://app.notion.com/p/3e318990d90881318c4ade339fde20cc).

## Implemented

- Removed the homepage's hidden keyword-heading block and keyword meta tag; preserved the intentionally hidden deployment-evidence section.
- Replaced homepage business markup with LocalBusiness and a stable business identifier. Added that business and four qualified Service entities to the Services hub, retaining BreadcrumbList and adding CollectionPage.
- Kept existing addresses and contact details; did not invent business hours, coordinates, ratings, social profiles or partner identities.
- Made the four service dimensions explicit H2 headings; retained the explanatory headlines as visible supporting copy.
- Added visible breadcrumbs and five useful FAQs with scope and partner boundaries. No FAQ rich-result eligibility claim is made.
- Added descriptive service-plan links and contextual Services links from About and Contact.
- Added social-preview metadata and accurate image dimensions.
- Added 675px and 1350px WebP variants for the Services guard photograph. The mobile variant is 99,300 bytes versus the original 415,178 bytes (about 76% smaller); desktop variant is 361,504 bytes. This is an asset-size reduction, not a measured Core Web Vitals improvement.
- Updated sitemap modification dates for pages changed on 24 September.

## Verification

- Services page, desktop/tablet/mobile layout, navigation, selection, mocked form success/error handling and WhatsApp summary pass; no real enquiry was sent.
- Modified commercial pages have one H1, canonical URLs and parseable JSON-LD. The separate recruitment page has Hindi and English H1s in alternate language panels; it was not changed in this phase.
- Live Services HTTPS URL returns 200 and has no X-Robots-Tag restriction. www HTTPS redirects to the preferred non-www HTTPS hostname. robots.txt is accessible.
- HTTP currently also returns 200 without upgrading to HTTPS; enforce HTTPS in Pages when publishing this SEO phase.

## Follow-up requiring external account access or evidence

- Search Console: submit sitemap, inspect Services URL, request indexing and record a query/city baseline.
- GA4/GTM: validate real conversion reporting and lead routing, without collecting personal information in event payloads.
- Confirm operational owners, location eligibility, partner responsibilities and review ownership.
- Run external rich-result/schema validators and production performance testing. JSON parsing alone is not full schema validation; field Core Web Vitals remain unmeasured.
- Create an Ajmer evidence-led page next; expand to Jaipur and individual service pages only with distinct evidence, as required by the Notion plan.

References used: [Schema.org LocalBusiness](https://schema.org/LocalBusiness), [Service](https://schema.org/Service), [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies).
