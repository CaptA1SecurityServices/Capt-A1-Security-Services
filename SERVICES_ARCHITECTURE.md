# Services hub — first implementation

Sources:
- [UI & Content Specification](https://app.notion.com/p/3e318990d908815d855ac087da082805)
- [SEO Optimisation Plan](https://app.notion.com/p/3e318990d90881318c4ade339fde20cc)

Production route: `/services/`. Static HTML at `services/index.html`; page-specific CSS and JavaScript in the same directory. Shared header, footer, fonts, tracking setup and brand styling are retained. No backend or build step has been added.

## Page structure

1. Deployment-photo hero and proof strip.
2. Four-dimension navigator: desktop 2×2; mobile swipe with numbered controls.
3. Security: eight services, prominent deployment photograph and supervised-delivery wording.
4. Facility and manpower: four services with availability qualifier.
5. Workforce management: six capabilities with contract scope and responsibility boundaries.
6. Equipment and site readiness: six capabilities with explicit partner disclosure.
7. Enquiry builder: site, city, location, personnel, shift, equipment, date, selected services, contact details and requirement.
8. Integrated-model outcomes.
9. Six-step delivery process.
10. Existing licence evidence, deployment photography and office links.
11. Final assessment, call and WhatsApp actions.

## Interaction and data

Service links preselect relevant enquiry options. The builder generates a plain-text summary; the same summary is submitted to the existing Web3Forms destination or carried into WhatsApp. Labels include English and Hindi. Native constraints and Indian-mobile validation are applied. Submission shows pending, confirmed-success and unconfirmed-delivery states; entered data remains available on errors. Without JavaScript the form retains standard POST submission.

Analytics events carry only controlled service/category/city values, page section, device type and channel. Names, phone numbers, addresses, organisations and free-text enquiry content are excluded from our event payloads. Third-party GTM configuration remains separately managed.

The local preview server explicitly maps `/services/` to the index document. The new page's CSP and local preview CSP permit Web3Forms fetch requests. Existing page CSPs are otherwise unchanged.

## Before launch

- Confirm operational owners, immediately available facility roles, workforce responsibilities, and equipment/technical-partner responsibilities from the Notion decisions list.
- Confirm ownership/permission before adding client logos, reviews or further photographs. No new logos, sample reports, EPFO or ESIC claims were invented.
- Confirm the existing Web3Forms destination and lead owner. Test real delivery only when test emails are expected.
- Review wording and design with the user. Validate actual GTM/Ads events and performance before publication; Search Console and field Core Web Vitals require production follow-up.
- This is a local first version, not a published change. Future service/city pages remain outside this phase.
