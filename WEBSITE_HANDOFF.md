# Captain A1 Website Handoff and Operating Guide

This document is the continuity file for Captain A1 Security Services. Give this to any future developer or agentic AI before it changes the website. It explains the business intent, current site structure, design rules, tracking setup, security decisions, past changes, and the way we work.

Last updated: 2026-09-25

## Homepage motion and Zepto release — 6 October 2026

- Preserve the original homepage Core Services headings, descriptions, photographs and enquiry links. The Services hub supplies tile styling only. `npm run test:core` checks the original content against a fixture.
- Homepage-only `home-core.css` and `home-core.js` provide a sticky, scroll-driven card track, crossfading photographic backgrounds, a rotating SVG graphic and numbered navigation. The build fingerprints these assets; other page styles are unchanged.
- Motion follows ordinary document scrolling. Reduced-motion preferences retain a static layout. Short desktops use compact pinned cards; short phones and layouts where text cannot fit use cards that move into place during normal vertical scrolling. No animation library or new photograph downloads were added. Existing photo variants are reused.
- Shared review animation now pauses offscreen and caches its measured width. Mobile sticky labels yield to the Core Services stage; the fixed contact bar has reserved space.
- Desktop and phone previews checked, including 320/375/768 widths, a 600px-high fallback, keyboard-accessible service controls, all four cards and the More Services directory. Reduced-motion and no-JavaScript variants were also checked locally.
- Local Lighthouse: desktop 100 before/after. Normal tracking-enabled mobile: baseline 81; initial revision 76; final revision 78. Final LCP improved from 2.9s to 1.7s, but TBT increased from 530ms to 1010ms. Controlled mobile with GTM blocked only in the audit: 90 before, 91 after. These are local lab runs, not live PageSpeed or field results; the mobile no-regression target remains unproven. Production tracking was not disabled or changed.
- Preview/report artifacts are ignored under `outputs/core-*`. The user explicitly authorized publication with "PUBLISH IT" on 6 October. Release scope is the saved homepage motion changes and the Zepto logo in the existing Home/About client rows. The already-published staff portal commit is preserved. Verify GitHub Pages and live asset hashes after the release push.
- Desktop follow-up: removed the blanket 660px minimum height and fixed desktop resize events being ignored when height changes by less than 100px. Actual wheel-driven card movement verified at 1366×580, 1024×500 and 1920×900; mobile pinned movement and short-panel in-flow movement also verified. `test:core` now protects short-desktop scroll activation, small resize handling and reduced-motion behavior. The lab scores above precede this follow-up; no new score is claimed.

## SEO and performance update — 25 September 2026

- Shared Inter and Cormorant Garamond fonts are served locally from `fonts/`, with their open font licences. All nine pages use the same font stylesheet.
- Responsive WebP derivatives live in `images/optimized/`; original photographs remain untouched. Home has two hero slides and About has three. Inactive carousel photographs load when selected, with the current photograph retained until the next one decodes.
- Active pages use clearer search titles, descriptions and service/location headings. Security and facility pages explain duties, quotation factors and availability in visible FAQs. Avoid adding unsupported services or invented prices to target keywords.
- Homepage internal links use `/`. The homepage has WebSite markup; About and Contact have page-type markup linked to the existing business entity.
- Shared JavaScript records phone, WhatsApp and email link intent without form values or contact details. These are intent events, not proof of a completed enquiry or delivery into GA4. Account-side tag validation remains separate.
- Sitemap submission was accepted in the verified Search Console URL-prefix property. Submission does not guarantee indexing or ranking.
- The Cloudflare Google-sign-in account examined contained no managed domains. HTTP redirect enforcement and the GitHub origin certificate still require the domain-owning account; do not make speculative DNS changes.
- Services 03 and 04 remain coming soon and excluded from the sitemap.

## 1. Project identity

- Business name: Captain A1 Security Services
- Domain: `captaina1.com`
- Repository: `CaptA1SecurityServices/Capt-A1-Security-Services`
- Current working branch used in this workspace: `new`
- Website type: static HTML/CSS/JavaScript
- Hosting target: GitHub Pages with `CNAME` set to `captaina1.com`
- Main service areas: Ajmer, Jaipur, Pushkar, and surrounding Rajasthan regions
- Business positioning: disciplined, veteran-led private security agency with guard deployment, event security, executive protection, housekeeping, and facility support
- Primary contact phone: `+91 8003091425`
- Primary public email: `contact@captaina1.com`

## 2. Non-negotiable working rules

1. Use `npm`, not `pnpm`. The client has npm installed and specifically asked not to use pnpm.
2. Keep the site static unless the client explicitly approves a backend.
3. Do not expose private keys, admin credentials, email login credentials, or tokens in documentation or commit messages.
4. The Web3Forms access key is present in page markup because the site is static. Do not paste it into docs, chat summaries, or screenshots.
5. Pull/sync before changes when the client says someone else edited GitHub.
6. Do not revert unrelated changes or untracked folders. In this workspace, `WebsiteImagesNew/`, `database/`, `outputs/`, and `.codex-remote-attachments/` may contain user data or generated assets.
7. Keep changes scoped and push to GitHub when the client asks for website changes to reflect online.
8. Preserve the legal notice and ownership language. The public repository still needs clear anti-copying and anti-impersonation language.
9. Keep the user-facing language professional, direct, and locally credible. Avoid exaggerated claims that cannot be supported.
10. For visual changes, test both desktop and mobile. The client checks Android and iOS/Safari, so avoid layout assumptions that only work in Chrome.

## 3. Tech stack and commands

The project is a static site:

- `index.html`
- `about.html`
- `contact.html`
- `guard-hiring-ajmer.html`
- `styles.css`
- `script.js`
- `gtm-bootstrap.js`
- `serve.json`
- `package.json`

Commands:

```bash
npm install
npm start
```

`npm start` runs `serve .`. If the default port is busy, `serve` may select another port. Always report the actual local URL after starting a server.

## 4. Deployment and domain

- `CNAME` contains the custom domain for GitHub Pages.
- The domain purchased by the client is `captaina1.com`.
- GitHub Pages is the intended hosting path because the site is static.
- After pushing, GitHub Pages may take a short time to update.
- Verified publishing source: branch `new`, repository root `/` (GitHub Pages branch deployment). Pushing to `new` updates the public website; other branches do not publish automatically.
- On this Windows Codex setup, Git HTTPS commands require execution outside the restricted sandbox. The bundled Git works there; a sandbox `remote-https` error does not mean Git needs reinstalling.
- Google search favicon/logo results can lag behind deployed changes because Google recrawls on its own schedule.

## 5. Brand and visual direction

The chosen direction is clean, professional, security-focused, and navy-led without making the whole site overly dark.

Core CSS variables in `styles.css`:

- `--navy: #0b2235`
- `--navy-deep: #071824`
- `--navy-mid: #173c57`
- `--blue: #245f86`
- `--blue-dark: #194766`
- `--copper: #b7834d`
- `--coral: #e56d62`
- `--ink: #172028`
- `--muted: #61707b`
- `--soft: #f2f5f6`
- `--paper: #fbfcfc`

Typography:

- Body: `Inter`
- Display headings: `Cormorant Garamond`
- Headings should be large enough to feel premium, but not collide or create awkward wrapping on mobile.
- Avoid negative letter spacing.

Logo:

- The preferred brand lockup is the Captain A1 shield plus `Captain A1 Security Services` typography.
- Favicon assets live in `images/LOGO/` and root `favicon.ico`.
- Keep favicon and manifest references aligned across pages.

Visual asset rules:

- Use real company/security/facility images where possible.
- Crop images so guards and workers are visible on mobile, not cut off at the edge.
- Avoid heavy black overlays that make the image disappear.
- Hero images should feel operational and credible, not like random stock photos.
- Keep carousel controls minimal and away from headline text.

## 6. Current page map

### `index.html`

Purpose: main commercial landing page for security service enquiries and Google Ads traffic.

Important sections:

- Hero carousel with service positioning and CTA buttons
- Trust strip
- About the company introduction
- Google and Justdial review carousel
- Complete service range directory
- What we do section with four service cards
- Selected client logo scroller, including Kalyan Jewellers
- Hidden client evidence section kept in code but not displayed
- SEO headline block for Google Ads keyword relevance
- Why clients choose us
- Certifications/registrations, including PSARA details
- Quick enquiry form
- FAQ
- Contact CTA

Recent homepage decisions:

- The old large "Security arranged around the assignment" style introduction was removed/hidden from the visible flow.
- The duplicate centered "Complete service range" block was removed.
- The remaining service directory is left-aligned and uses `id="services"` so existing nav links still work.
- The "What we do" section uses four service cards. On mobile, these cards are a horizontal carousel and have been compacted to fit within a typical 375 x 705 phone viewport.
- The "On duty in Ajmer" / client evidence section is intentionally hidden using `is-hidden`, `hidden`, and `aria-hidden="true"`. Do not delete it unless the client asks; they specifically asked to hide, not remove.

### `about.html`

Purpose: company credibility, story, operating standards, service details, and deployment context.

Important sections:

- About hero carousel
- Our story
- How we operate
- Services intro and detailed service rows
- Service coverage
- Selected deployments
- CTA

Content direction:

- Emphasize veteran-led discipline, clear responsibility, and practical deployment.
- Do not overpromise. Keep claims operational and believable.

### `contact.html`

Purpose: direct lead capture and office presence.

Current decisions:

- No large hero section. The first major section should be the enquiry form and presence information.
- On mobile, the form should be visible first without forcing users to scroll through address details.
- The contact form should remain consistent with the homepage quick enquiry form.
- Form includes English/Hindi language switching.
- Service dropdown includes `Other`.
- Presence section includes:
  - Jaipur Head Office: `81/70 Patel Marg, Mansarover, Jaipur, Rajasthan`
  - Ajmer Office: `Love Kush Colony, Near Radha Rani Garden, Gulab Bari, Ajmer, Rajasthan 305001`
  - Pushkar Office: `The Lake City, Tilora Road, Kadel, Nagaur-Jaipur Bypass, Pushkar, Rajasthan`
- Each office has a Google Maps link and embedded map.

### `guard-hiring-ajmer.html`

Purpose: Hindi-first Google Ads landing page for urgent security guard hiring.

Current decisions:

- Hindi is default.
- English switch is available.
- The page tells guards to call urgently.
- It explains paid work and the option for full-time or contract basis.
- The guard application form includes qualification/study level:
  - 10th
  - 12th
  - Graduation
- Keep this page direct, readable, and mobile-first.

## 7. Forms and validation

Forms submit to Web3Forms:

- Action: `https://api.web3forms.com/submit`
- Public receiving email should be `contact@captaina1.com`
- Do not document the access key value.

Current form behavior in `script.js`:

- Custom validation for name, phone, email, select fields, and message.
- Indian mobile validation expects a valid 10-digit mobile number starting with 6, 7, 8, or 9. It handles common `+91` style input.
- English/Hindi form copy switches using `data-form-copy`, `data-en`, and `data-hi`.
- Submit buttons are disabled while sending.
- Validation errors are presented inline.

When adding new form fields:

- Add both English and Hindi labels if the form has language switching.
- Add `name` attributes that are meaningful in Web3Forms emails.
- Update validation only if browser-native validation is not enough.
- Keep the same field set between homepage quick enquiry and contact page unless the client asks otherwise.

## 8. Google Tag Manager, Ads, and CSP

GTM container:

- `GTM-W59N8ZMC`
- `gtm-bootstrap.js` loads GTM from every page.
- A noscript GTM iframe exists immediately after the opening body tag on every page.

Google Ads global site tag:

- Ads ID: `AW-18297382444`
- Every public page loads `https://www.googletagmanager.com/gtag/js?id=AW-18297382444`.
- `google-ads-tag.js` initializes `window.dataLayer`, defines `gtag()`, and calls `gtag("config", "AW-18297382444")`.
- Keep the initializer in the local JS file instead of inline script so the CSP can remain strict without adding `unsafe-inline`.

Pages that currently include GTM/CSP:

- `index.html`
- `about.html`
- `contact.html`
- `guard-hiring-ajmer.html`

Important CSP decision made on 2026-07-17:

Google Ads conversion tracking was firing in GTM but browser requests were blocked by Content Security Policy. The CSP was updated in all public pages and `serve.json` to allow the Google Ads and DoubleClick endpoints needed for conversion tracking, enhanced conversions, remarketing, and user-provided data collection.

Allowed tracking domains were added across the relevant directives:

- `https://www.googletagmanager.com`
- `https://www.google-analytics.com`
- `https://region1.google-analytics.com`
- `https://www.google.com`
- `https://www.googleadservices.com`
- `https://googleads.g.doubleclick.net`
- `https://ad.doubleclick.net`
- `https://www.gstatic.com` for scripts loaded by Google

Directives touched:

- `script-src`
- `connect-src`
- `img-src`
- `frame-src`

Verification checklist for tracking:

1. Open the deployed site, not just local preview.
2. Use Google Tag Assistant.
3. Trigger the conversion action.
4. Confirm there are no CSP console errors for `googleads.g.doubleclick.net`, `ad.doubleclick.net`, `google.com/pagead`, `google.com/ccm`, or `google.com/rmkt`.
5. Confirm network requests are not blocked.
6. Google Ads may remain inactive/misconfigured until it receives a valid conversion after deployment. This can take time.

Security note:

- Do not remove CSP. Adjust it deliberately.
- Keep `object-src 'none'`.
- Keep `base-uri 'self'`.
- Keep `upgrade-insecure-requests`.
- GitHub Pages does not let this repo set arbitrary response headers directly, so the HTML meta CSP is the main production enforcement mechanism. `serve.json` supports local preview.

## 9. SEO and structured data

Current SEO work includes:

- Page-specific titles and descriptions.
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- Favicon/logo assets.
- JSON-LD schema in the site pages.
- Location and service content for Ajmer, Jaipur, and Pushkar.
- Google review and Justdial excerpts shown on the homepage.

AI/tool crawler policy:

- `robots.txt` intentionally allows general crawlers and explicitly allows OpenAI/ChatGPT and Google/Gemini-related crawlers so teammates can use ChatGPT, Gemini, and similar tools to read the public website for brochure, content, and website-analysis work.
- Explicitly allowed agents include `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `OAI-AdsBot`, `Google-Extended`, `Googlebot`, `GoogleOther`, and `Google-CloudVertexBot`.
- Do not add `noindex`, `nofollow`, `noai`, `noimageai`, or crawler blocks unless the client specifically wants to restrict AI/search access.

Google Ads headline terms added in homepage source include:

- Commercial Security Agency
- Get Free Security Quote
- Call Security Experts
- Factory Security Guards
- PASARA Licensed security
- 24x7 Security Services
- Gated community security
- Army Veteran-Led Security
- Verified Security Guards
- Security Agency Jaipur

Future SEO caution:

- Avoid stuffing hidden keywords. If the SEO block is expanded, prefer visible, useful content where possible.
- Make sure claims like ratings, number of guards, certifications, and client names are supportable.
- The site currently uses a 4.2 rating in the review area by client instruction because unrelated venue reviews affected the raw mixed rating.

## 10. Reviews and testimonials

Current decisions:

- Homepage has a compact review carousel.
- It includes filtered Google reviews and Justdial review excerpts.
- Venue-related reviews must be excluded if they appear to be for nearby places such as gardens/venues rather than Captain A1's security service.
- Users should be able to manually interrupt review rolling, scroll backward/forward, then autoplay resumes after a cooldown.
- There is a "Leave a Google review" CTA.

Do not add questionable reviews without reading them first.

## 11. Clients and logos

Client logo scroller uses assets in `images/clients/`.

Current visible logos include:

- Sarodha
- Toshniwal Industries
- LPM Engineering
- Keshav Kripa Polyplast
- Surge Alloys
- Kalyan Jewellers

The client wanted logos sourced from a master client list in `outputs/`. If adding more logos later:

1. Verify the client name from the workbook/data.
2. Search for a reliable logo source.
3. Prefer SVG or clean transparent PNG when available.
4. Do not imply endorsement beyond a "selected clients" style presentation.
5. Keep logo scroller moving smoothly and accessible.

## 12. Certifications and credentials

Current credential direction:

- Show important registrations clearly, not buried.
- Include PSARA / PASARA license details and image in the certification section.
- PSARA license image path: `images/Certification/psara-licence-rajasthan.jpg`
- License details from the provided image include Rajasthan private security agency license, issued 05.08.2024, valid up to 04.08.2029.

Future rule:

- Do not invent registration numbers. Use only documents provided by the client.

## 13. Legal and repository-public risk

The repository is public, but the site is proprietary. The site contains explicit legal notice language.

Files:

- `LEGAL_NOTICE.md`
- README legal section
- Footer/legal content where applicable

Required legal message:

- Unauthorized copying, cloning, reuse, redistribution, impersonation, or misleading use of the website, branding, contact details, or business identity is strictly prohibited and may result in legal action.

If the client later wants stronger protection:

- Make the repo private if GitHub Pages plan/hosting path supports the desired deployment.
- Move private business logic, forms, and keys behind a backend.
- Use takedown requests for unauthorized clones.

## 14. Mobile UX decisions

The mobile site has several special behaviors:

- Sticky section-title behavior uses `data-section-label` sections and `.eyebrow` titles.
- The client wants the existing section heading to feel like it gets pinned, not like a new unrelated title appears.
- Main company header should slide down smoothly when scrolling upward and hide when scrolling down.
- Boundary jitter between sections should be smoothed with cooldown/settle timing.
- Avoid right-side empty space and horizontal overflow on iOS Safari.
- Forms and CTAs must fit comfortably on mobile.
- Contact page mobile first view should prioritize the form.
- Hero and service images need mobile object-position tuning so people are visible.

When adding a new section:

1. Add a meaningful `data-section-label`.
2. Put an `.eyebrow` or heading inside the section.
3. Check sticky title behavior on mobile.
4. Check iOS/Safari if possible.

## 15. Accessibility and performance rules

- Use semantic sections and headings.
- Preserve alt text for images.
- Use real buttons for carousel controls.
- Keep controls keyboard accessible.
- Avoid text over images unless contrast is strong.
- Use `loading="lazy"` for non-critical images.
- Keep mobile tap targets large enough.
- Do not allow visible text to overlap with nav, carousel controls, or sticky titles.
- Avoid layout shifts in cards, carousels, and forms by setting stable heights/aspect ratios.

## 16. File and asset map

Important root files:

- `index.html`: homepage
- `about.html`: about and services page
- `contact.html`: contact form and office presence page
- `guard-hiring-ajmer.html`: Hindi-first guard hiring landing page
- `styles.css`: all shared styling
- `script.js`: carousels, mobile sticky behavior, form language and validation
- `gtm-bootstrap.js`: Google Tag Manager loader
- `serve.json`: local preview headers, including CSP
- `site.webmanifest`: app/site icon manifest
- `sitemap.xml`: search sitemap
- `robots.txt`: crawler directives
- `LEGAL_NOTICE.md`: ownership and anti-copying notice
- `README.md`: basic project overview

Important asset folders:

- `images/LOGO/`: logo and favicon assets
- `images/FieldWork/`: field and hero images
- `images/Our Services/`: service imagery
- `images/Certification/`: certification images
- `images/clients/`: client logos
- `WebsiteImagesNew/`: user-provided new images, currently untracked
- `outputs/`: spreadsheets/screenshots/exports, currently untracked
- `database/`: local client/site database work, currently untracked

## 17. Past major changes and decisions

This is a summary of important work already done:

- Pulled and upgraded the original website.
- Reworked overall UX, colors, spacing, and typography toward a cleaner security-company aesthetic.
- Updated public contact email to `contact@captaina1.com`.
- Added Web3Forms integration and later changed intended recipient to `contact@captaina1.com`.
- Synced changes made by another contributor for HTTPS/search indexing and favicon.
- Added legal notice language against copying and impersonation.
- Created Hindi-first guard hiring landing page for Ajmer with English option.
- Simplified the homepage and then later upgraded it again using security-industry references.
- Added better logo/brand lockup and favicon assets.
- Added Jaipur Head Office map and later folded it into contact page rather than a separate Jaipur page.
- Added Pushkar office presence and map.
- Added GTM to every page.
- Added client logo scroller and Kalyan Jewellers.
- Added Google/Justdial reviews carousel and filtered out irrelevant venue-style reviews.
- Added mobile sticky section title behavior and later smoothed it.
- Added contact form validation and Hindi/English form switching.
- Added PSARA certificate image and credentials.
- Hid the "On duty in Ajmer" / client evidence section without deleting its code.
- Reworked homepage service flow: complete service range first, then compact four-card "What we do" carousel on mobile.
- Removed duplicate centered complete-service-range section.
- Updated CSP for Google Ads conversion tracking.

Recent commit references around the latest work:

- `114aa1a` - Polish homepage service sections
- `845c8ef` - Hide Ajmer evidence section
- `bc9bae0` - Hide Ajmer proof section
- `651e3e1` - Rework homepage service layout and SEO headlines
- `b51e7ab` - Add Pushkar presence and Google Tag Manager

## 18. QA checklist before pushing

Before finalizing changes:

1. Run `git status --short --branch`.
2. Inspect diffs with `git diff --check` and `git diff --stat`.
3. If HTML/CSS/JS changed, run a local preview with `npm start`.
4. Check desktop width around 1366 x 768 or laptop ratio.
5. Check mobile width around 375 x 667 or 375 x 705.
6. Verify no horizontal overflow on mobile.
7. Verify header, hamburger, sticky titles, and carousel controls do not overlap text.
8. Submit forms only if using safe test data and the client expects test emails.
9. For GTM/Ads, use deployed site and Tag Assistant after push.
10. Commit only intended tracked files.
11. Push the active branch.

## 19. Instructions for a future AI agent

Start every new work session like this:

1. Read this file.
2. Run `git status --short --branch`.
3. If asked to sync, run `git pull --ff-only` or inspect merge state before editing.
4. Search with `rg`, not slow recursive tools.
5. Read the relevant HTML/CSS/JS before editing.
6. Keep changes small and compatible with the existing static architecture.
7. Use `apply_patch` for manual edits.
8. Do not write over untracked user data.
9. Do not expose secrets.
10. Test the actual behavior, not just syntax.
11. Commit and push when the client expects the live website to update.

When unsure about content:

- Use conservative wording.
- Ask the client for proof before adding licenses, ratings, exact employee counts, or client claims.
- Do not invent addresses, certifications, or testimonials.

When working on design:

- Keep the site clean, professional, navy-led, and credible.
- Avoid large decorative sections that do not help conversion.
- Prioritize call, WhatsApp, and enquiry workflows.
- Make mobile the first-class experience because much of the traffic comes from ads and local search.

## 20. SEO and performance work published on 5 October 2026

Status: **published with explicit user authorization** ("Do the changes, and give me a re run report of seo."). Source releases `3f863ea`, `4c5bffa`, `c312d56` and `e33231d` passed GitHub Pages deployment verification. HTTPS and asset caching are active. See `SEO_IMPROVEMENTS.md` and the local `outputs/SEO_RERUN_REPORT_2026-10-05.md` for results and remaining work. Future publication still requires a user request.

- Run `npm run build` after source HTML/CSS/JS edits. Commit the generated `static/` files and updated HTML references. `npm run check` now detects a stale build.
- Source CSS remains in `styles.css`, `services/services.css`, `services/editorial.css` and `privacy-policy/privacy.css`; do not hand-edit bundled CSS.
- Responsive image derivatives and fingerprints are recorded in `images/responsive/manifest.json`. Original photos remain for gallery viewing. Do not remove previously published fingerprinted assets while cached HTML might still reference them.
- Contact maps are deliberately absent until a View map button is selected. No enquiry forms were submitted during this work.
- Cloudflare Always Use HTTPS is **on**. Permanent redirects preserve paths and queries, and www redirects to the apex. Automatic HTTPS Rewrites and Universal SSL remain active.
- The **active** cache rule `Fingerprint assets - long browser cache` covers `/static/css/*.css`, `/static/js/*.js` and `/images/responsive/*.webp`, restricted to apex and www. Browser TTL is 1 year; edge TTL respects the origin; HTML is outside the rule. Live sample assets returned max-age=31536000 and HIT; HTML remained max-age=600.
- The GTM bootstrap now waits for page load, a rendering frame and an idle opportunity (1.5-second timeout). It preserves early dataLayer events and guards against duplicate initialization; tests cover scheduling, queues and fallback behavior. Very short visits may leave before Google/Meta initialize. Do not introduce a long arbitrary tracking delay to inflate performance scores.
- Google/Meta/Cloudflare script loading was verified in the live DOM without captured console errors. Destination conversion receipt is still unverified.
- Search Console read the updated sitemap on 5 October: Success, 11 discovered pages. Indexing requests were accepted for six service/interview URLs; they are crawl requests, not proof of indexing. Homepage live Rich Results Test found two valid items with optional warnings; no priceRange was invented.
- Final Google PageSpeed snapshots for all 11 active pages and the comparison report are saved locally under ignored outputs/. Font preloads on Contact and Services address movement revealed by the rerun; check the report for measured outcomes instead of assuming a Core Web Vitals pass.
- The comparable eight-page mobile mean improved 71.5 to 83.1; desktop mean fell 93.9 to 88.1. Home mobile is 98, Security 89, Facility 85 and Interview 98. Services 62 and Privacy 67 still need performance work. All 11 active pages score 100 for basic SEO, accessibility and Best Practices on both devices. No immediate ranking or real-user Core Web Vitals improvement is claimed.
- Published GTM container version 3 contains the Google Ads configuration for `AW-18297382444` and Meta Pixel PageView for `1404004975151192`. It has **no conversion-event tags**. Website intent events are not proof of destination conversions. Preserve that distinction until live Tag Assistant and destination-account checks succeed.
- Search Console access worked with the verified owner account. The 28-day baseline, URL inspections and responsive QA are saved under ignored `outputs/`. They are evidence, not public website assets.
- Unrelated changes to `GUARD_RECRUITMENT_META_CAMPAIGN.md`, `assets/` and `tmp/` predated this work and were preserved.
