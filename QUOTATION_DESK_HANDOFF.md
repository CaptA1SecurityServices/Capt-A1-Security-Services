# Quotation desk deployment handoff

27 September 2026. Google sign-in is in Production; the private backend is deployed. This change connects the static website entry to the live register.

The public static entry is `quotation-desk/index.html`; the homepage footer links to it. `quotation-desk/config.js` contains only the public Google client ID and production Apps Script URL. Do not replace server-side identity checks with browser-only password checking or client-side access lists.

The private pricing, templates, register configuration and Apps Script backend are kept outside this public repository in the quotation-desk project attached to the development task. A deployment package and setup checklist are saved locally and, with the owner's explicit approval, in the Backups folder of the new private Captain A1 Quotation Desk Drive workspace. The private register is also created. Never copy private backend files into this repository.

Any verified Google account may request access, including outside-company accounts. Only approved accounts may access the backend; administrators manage access. Guest access is disabled. Google credentials stay in memory; every backend request verifies identity and permissions again.

Real verification: the owner opened the TEST ONLY form in Chrome and saved a quotation. Connector readback verified its numbered row, actor, total, saved file status, private Drive PDF and isolated parent folder. All three PDF pages were rendered and inspected. The live register was separately checked for exact headers and its pinned administrator, with no business quotation numbers consumed. Test and production use separate versioned deployments; never point production at the verification deployment.

The in-app browser's embedded Google frame remained blank; Chrome worked for the owner. The connection timeout explains this fallback. Outside-account approval/revocation, multi-user concurrency, contract/evidence flows and restore rehearsals have local automated coverage where applicable, but have not all been exercised against Google. Complete the remaining private SETUP.md checks before expanding team use; do not describe them as fully live-tested.

Checks: `npm run check`, `node --check quotation-desk/desk.js`, `node --check quotation-desk/config.js`, and `git diff --check`. Check desktop and mobile entry screens after changes. The private project has 15 passing automated tests, including the live-discovered gate JSON-encoding fix and preservation of deployment settings.

The `serve.json` security headers are local-preview configuration; GitHub Pages does not apply that file as production HTTP headers. The entry page also includes its applicable CSP and referrer policy as HTML metadata. Do not claim server-only headers such as frame-ancestors are enforced by GitHub Pages.

Branch `new` publishes the site. Do not push until the user explicitly requests publication. Preserve unrelated recruitment work in this checkout.
