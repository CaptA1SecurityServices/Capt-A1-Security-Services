# Captain A1 Security Services

Static website for Captain A1 Security Services, a private security and facility support provider based in Ajmer, Rajasthan.

## Pages

- `index.html` - homepage, service overview, certifications, testimonials, and consultation call to action
- `about.html` - company story, operating principles, detailed services, and client/location highlights
- `contact.html` - full contact form, contact details, and embedded map
- `guard-hiring-ajmer.html` - Hindi-first Google Ads landing page for urgent security guard hiring in Ajmer

## Run Locally

Install dependencies and start the static server:

```bash
npm ci
npm start
```

The site is also static, so it can be hosted by GitHub Pages or any static hosting provider.

## Publishing

The repository is `CaptA1SecurityServices/Capt-A1-Security-Services`. GitHub Pages publishes the root of branch `new` to https://captaina1.com. No build step is required.

Before editing, read `WEBSITE_HANDOFF.md`, check Git status, and fetch the latest remote state. Preview changes on desktop and mobile, run `npm run check` and `git diff --check`, then review the diff. When publication is requested, commit the intended files and push `new`. Check the Pages deployment and the live website afterward. A push to `new` is a live deployment.

Use Node.js LTS with npm. On Windows, `npm.cmd` works if PowerShell blocks `npm.ps1`. A newly installed Node.js may require reopening the terminal. Codex's restricted environment may require approved network access for npm installation and Git HTTPS operations.

## Security Notes

- Browser-side Content Security Policy, referrer policy, and permissions policy are included in every page.
- `serve.json` adds equivalent local preview headers when using the `serve` package.
- The Web3Forms access key is necessarily visible because this is a static website. For stronger protection, move form submission behind a small backend endpoint.

## Legal Notice

This website, its branding, content, code, images, contact details, and business identity belong to Captain A1 Security Services. Unauthorized copying, cloning, reuse, redistribution, impersonation, or misrepresentation of this website or business is strictly prohibited and may result in legal action.

See `LEGAL_NOTICE.md` for the full notice.
