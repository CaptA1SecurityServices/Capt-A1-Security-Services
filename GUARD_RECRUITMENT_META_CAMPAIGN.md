# Ajmer Guard Recruitment — Meta Campaign Playbook

**Business:** Captain A1 Security Services
**Document status:** Living working document
**Created:** 26 September 2026
**Last updated:** 27 September 2026
**Campaign status:** Meta Higher Intent form being built — campaign not launched

## Purpose

Build a reliable supply of security guards across Ajmer and nearby duty areas using Facebook and Instagram lead advertisements, with Zoho used for lead assignment, screening, follow-up and joining measurement.

Security guards are the primary recruitment requirement. Housekeeping recruitment is secondary.

The campaign must use short, respectful, Hindi-first communication that is easy to understand. Candidates must never be described publicly as “less educated.”

## Current decisions

- Use Meta Ads Manager with the **Leads** objective.
- Use a Meta **Instant Form** rather than sending all candidates to a website.
- Use the **Higher Intent** form type to reduce accidental submissions.
- Treat and declare the campaign as an employment advertisement wherever Meta requires it.
- Begin with one broad Ajmer-area recruitment pool instead of dividing a modest budget across many small ad sets.
- Use two security-guard creatives and one secondary housekeeping creative.
- Start with a working media budget of **₹700 per day for 14 days**, or **₹9,800 excluding applicable taxes**.
- Send leads into a separate Zoho recruitment workflow, not the customer-sales pipeline.
- Measure cost per qualified candidate and cost per joining, not only cost per lead.
- Do not collect Aadhaar, PAN, bank details, medical records or identity-document photographs in the Meta form.
- Do not launch or publish anything until the employment details, form, Zoho workflow and test lead are verified.

## Details required before launch

These inputs are still pending and must be confirmed before advertisements are finalized:

- [ ] Verified monthly salary or salary range
- [ ] Duty duration: 8 hours, 12 hours, or both
- [ ] Weekly-off policy
- [ ] Current duty locations and number of openings by area
- [ ] Whether accommodation is available
- [ ] Whether food is provided
- [ ] Uniform, training or onboarding charges, if any
- [ ] Confirmation that no recruitment fee is charged, if true
- [ ] Minimum age and lawful job requirements
- [ ] Whether freshers are accepted
- [ ] Interview or office-visit location
- [ ] Recruitment calling hours
- [ ] Recruiter name and Zoho record owner
- [ ] Expected response time promised to candidates

The final advertisement should display verified salary and duty hours. Avoid using “salary discussed on call” if these figures can be disclosed accurately.

## Campaign structure

| Level | Recommended setup |
|---|---|
| Campaign | `AJMER_RECRUITMENT_GUARD_2026_01` |
| Objective | Leads |
| Conversion location | Meta Instant Form |
| Category | Employment/job advertisement, wherever required by Meta |
| Initial ad set | Broad Ajmer recruitment area |
| Placements | Advantage+ placements initially |
| Form | Hindi-first Higher Intent form |
| Ads | Guard static poster, guard vertical video, housekeeping variant |
| Initial budget | ₹700/day for 14 days |

Do not create separate ad sets for every locality at launch. First gather enough data to determine which areas produce reachable, qualified and joining candidates.

## Area plan

Use a practical Ajmer commuting area in Meta and ask every candidate to select a preferred duty area in the form:

- Ajmer City
- Pushkar
- Kishangarh
- Nasirabad
- Beawar
- Nearby village or another area

After approximately 30–50 genuine leads, compare qualification and joining performance by area. Separate high-volume locations only when the results justify dedicated budget.

## Draft advertisement copy

### Primary Hindi version

> 🛡️ **अजमेर में सिक्योरिटी गार्ड की भर्ती**
>
> Captain A1 Security Services में सिक्योरिटी गार्ड के लिए आवेदन आमंत्रित हैं।
>
> ✅ ड्यूटी स्थान: अजमेर एवं आसपास
> ✅ वेतन: ₹[सत्यापित राशि] प्रति माह
> ✅ ड्यूटी: [8/12] घंटे
> ✅ अनुभवी और फ्रेशर दोनों आवेदन कर सकते हैं
> ✅ जिम्मेदार उम्मीदवारों को प्राथमिकता
> ✅ हाउसकीपिंग स्टाफ की भी आवश्यकता
>
> अपना नाम, मोबाइल नंबर और पसंदीदा ड्यूटी क्षेत्र भेजें। हमारी भर्ती टीम आपसे फोन पर संपर्क करेगी।
>
> **अभी आवेदन करें।**

**Headline:** अजमेर में सिक्योरिटी गार्ड की भर्ती
**Description:** नाम और मोबाइल नंबर देकर आवेदन करें।

Do not use “urgent,” “limited vacancies,” a salary figure or a benefit unless it is currently true and verified.

## Creative package

### Creative 1 — Static Hindi poster

- Real Captain A1 guard or approved company photograph
- Captain A1 logo
- Large headline: `अजमेर में गार्ड भर्ती`
- Verified salary
- Duty hours
- Short CTA: `अभी आवेदन करें`
- Limited text so it remains readable on a mobile screen

### Creative 2 — 15–20 second vertical video

Suggested spoken script:

> अजमेर में सिक्योरिटी गार्ड की नौकरी चाहिए? Captain A1 Security Services में भर्ती चल रही है। नीचे आवेदन करें। हमारी टीम आपको फोन करेगी।

The video should use a real supervisor or guard where possible, Hindi speech, subtitles, clean audio and a clear final application screen.

### Creative 3 — Housekeeping variant

Use role-specific wording and a relevant photograph. Do not make candidates guess whether the vacancy is for security or housekeeping.

### Creative rules

- Use actual staff photographs only with permission.
- Preserve recognizable faces, uniforms and identity when enhancing photographs.
- Do not use police-style insignia, weapons or imagery that misrepresents the job.
- Avoid generic foreign stock photographs.
- Show salary, duty hours and area only after verification.

## Meta Instant Form

### Production form record

**Internal form name:** `AJMER_GUARD_RECRUITMENT_HI_HIGH_INTENT_V1`
**Page:** Captain A1 Security Services
**Build started:** 27 September 2026
**Current build status:** Draft in Meta; not submitted or published
**Form type:** Higher Intent
**Phone verification:** Required by one-time passcode
**Flexible form delivery:** Off, so Meta cannot remove or alter the selected form elements

### Form type

Use **Higher Intent** with a review step.

### Intro

**Headline:**

> अजमेर में सिक्योरिटी गार्ड की नौकरी

**Description:**

> Captain A1 Security Services में सिक्योरिटी गार्ड और हाउसकीपिंग स्टाफ की भर्ती के लिए आवेदन करें। सही जानकारी भरें। हमारी भर्ती टीम उपलब्ध ड्यूटी, स्थान, समय और वेतन की जानकारी के लिए आपसे संपर्क करेगी।

### Form questions

Use only the two necessary contact fields:

1. पूरा नाम — Full name
2. मोबाइल नंबर — Phone number, verified by OTP

Do not request email, Aadhaar, PAN, bank details or documents at this stage.

Required qualifying questions:

1. **आप किस काम के लिए आवेदन करना चाहते हैं?**
   - सिक्योरिटी गार्ड
   - हाउसकीपिंग स्टाफ
   - दोनों में से कोई भी
2. **आप किस क्षेत्र में ड्यूटी करना चाहते हैं?**
   - Palra / Ajaymeru / Parbatpura / Makhupura
   - Ghooghra / Kayad / Gagwana
   - Kotra / Gyan Vihar / Foy Sagar Road
   - Vaishali Nagar / Panchsheel / Makarwali Road
   - Chandravardai Nagar / Subhash Nagar / Daurai / Tabiji
   - Central Ajmer - Kutchery Road / Lohakhan / Pal Bichala / Naka Madar
3. **क्या आपकी उम्र 18 वर्ष या उससे अधिक है?**
   - हाँ
   - नहीं
4. **सिक्योरिटी या हाउसकीपिंग कार्य का अनुभव कितना है?**
   - फ्रेशर / कोई अनुभव नहीं
   - 1 वर्ष से कम
   - 1 से 3 वर्ष
   - 3 वर्ष से अधिक
All four qualifying questions use multiple-choice answers. Shift and joining availability will be checked during the recruitment call. Meta warned that additional questions could reduce the submission rate, so the saved draft was intentionally kept to four high-value qualifiers.

### Consent language

> मैं सहमत हूँ कि Captain A1 Security Services इस नौकरी के आवेदन के संबंध में मुझे फोन या WhatsApp पर संपर्क कर सकती है। मेरी जानकारी भर्ती प्रक्रिया और फॉलो-अप के लिए गोपनीयता नीति के अनुसार उपयोग की जाएगी।

**Privacy-policy URL:** `https://captaina1.com/privacy-policy/`

### Thank-you screen

**Headline:**

> आपका आवेदन मिल गया है

**Description:**

> Captain A1 Security Services की भर्ती टीम आपके आवेदन की जाँच करके आपको +91 80030 91425 से कॉल या WhatsApp करेगी। कृपया अपना फोन चालू रखें।

**Call to action:** Go to website — `इंटरव्यू विज़िट चुनें`
**Destination:** `https://captaina1.com/schedule-interview.html`

The destination page collects the candidate's preferred interview date and time, opens a prefilled WhatsApp request, and clearly states that the visit is not confirmed until recruitment replies.

## Zoho recruitment workflow

Use Zoho LeadChain or the currently supported Meta Lead Ads integration. Confirm Meta Business Settings gives the integration Leads Access for the correct Facebook Page.

### Recommended fields

- Candidate name
- Mobile number
- Role applied for
- Current location
- Preferred duty area
- Experience
- Shift preference
- Joining availability
- Meta campaign ID/name
- Meta ad-set ID/name
- Meta ad ID/name
- Meta form ID/name
- Recruiter owner
- Date and time received
- First-contact time
- Qualification result
- Interview date
- Documents pending
- Final duty location
- Joined date
- Rejection or non-joining reason

### Pipeline stages

```text
New Meta Lead
→ Contact Attempted
→ Contacted
→ Qualified
→ Interview/Office Visit Scheduled
→ Documents Pending
→ Duty Offered
→ Joined
```

Terminal outcomes:

```text
Not Reachable
Not Interested
Not Eligible
Duplicate
No-show
```

### Automation

- Assign every new candidate to the designated recruiter.
- Create an immediate recruitment call task.
- Record the first-contact time.
- Send an acknowledgement only where the candidate consented to that channel.
- Flag records that remain untouched after the agreed response time.
- Keep recruitment candidates separate from clients, sales prospects and marketing broadcasts.
- Preserve application and opt-out history.

## Candidate follow-up

### Service level

- First call target: within 10 minutes during recruitment hours
- Second attempt: approximately two hours later
- Third attempt: the following morning
- Stop promotional or unrelated contact when a candidate asks to stop

### Screening call

Confirm:

- Candidate name and present location
- Travel feasibility
- Preferred job
- Shift availability
- Relevant experience
- Expected joining date
- Acceptance of verified salary and duty terms
- Interview or office-visit time

## Reporting dashboard

| Metric | Initial operating target |
|---|---:|
| First contact time | Under 10 minutes |
| Contact rate | 65% or higher |
| Qualified lead rate | 40% or higher |
| Interview/visit scheduled | 25% or higher of leads |
| Interview attendance | 60% or higher of scheduled candidates |
| Joining rate | Measure by area and advertisement |
| Cost per qualified candidate | Primary Meta efficiency metric |
| Cost per joining | Final business metric |

These are operating targets, not guaranteed market benchmarks.

Calculate:

```text
Cost per qualified candidate = total ad spend ÷ qualified candidates
Cost per joining = total ad spend ÷ candidates who actually joined
Lead-to-join rate = candidates who joined ÷ total leads
```

Do not retain an advertisement merely because it produces a low cost per form. Pause or revise ads that generate candidates who are unreachable, unsuitable or unwilling to accept the actual duty.

## Launch checklist

- [ ] Confirm salary, duty hours, weekly off, locations and benefits
- [ ] Confirm lawful, role-related eligibility requirements
- [ ] Confirm recruitment calling hours and record owner
- [ ] Approve two guard creatives and one housekeeping creative
- [ ] Create the recruitment layout and stages in Zoho
- [ ] Connect Meta and Zoho LeadChain
- [ ] Give the CRM access to the correct Meta Page leads
- [ ] Map every required and custom form field
- [ ] Add the verified privacy-policy URL
- [ ] Create the Higher Intent form
- [ ] Submit a Meta test lead
- [ ] Confirm the test lead arrives in Zoho with campaign attribution
- [ ] Confirm assignment, call task and acknowledgement behavior
- [ ] Check the complete advertisement preview on Facebook and Instagram placements
- [ ] Obtain final launch approval
- [ ] Launch at the agreed budget

## Review schedule

### First 72 hours

- Confirm delivery and lead synchronization.
- Check that candidates understand the role, location, salary and duty hours.
- Fix broken routing or misleading wording immediately.
- Avoid repeated budget and targeting changes while the campaign begins learning.

### After 30–50 leads

- Compare ads by qualified-lead rate, not only cost per lead.
- Compare areas by contact, interview and joining rates.
- Identify rejection and non-joining reasons.
- Pause misleading or low-quality creatives.
- Consider separating high-performing areas or the housekeeping role.

### Scaling

Increase a successful budget gradually, approximately 15–20% at a time. Do not scale until recruitment staff can respond quickly to the increased lead volume.

## Data and compliance guardrails

- Use accurate employment information.
- Do not use discriminatory targeting, exclusions or job wording.
- Collect only information needed for initial recruitment screening.
- Do not collect identity documents in the Meta Instant Form.
- Obtain and record appropriate consent for recruitment calls or WhatsApp follow-up.
- Do not treat job applicants as general marketing subscribers.
- Use authorized staff access in Zoho.
- Honour correction, deletion and stop-contact requests.
- Verify that the public privacy policy accurately describes the live workflow before launch.

## Change log

### 27 September 2026 — Version 0.2

- Finalized the production Higher Intent form structure and Hindi copy.
- Started `AJMER_GUARD_RECRUITMENT_HI_HIGH_INTENT_V1` in Meta for the Captain A1 Security Services Page.
- Enabled OTP phone verification.
- Disabled flexible form delivery to preserve all qualifying questions.
- Reduced contact fields to full name and verified mobile number; email is excluded.
- Added four multiple-choice questions covering role, the six supplied Ajmer recruitment zones, adult eligibility and experience.
- Kept shift and joining availability for the recruitment call after Meta warned that additional questions may reduce completion.
- Recorded the privacy URL, recruitment-contact consent and thank-you screen.
- Added a Hindi-first interview-visit request page that hands the candidate to a prefilled WhatsApp request and requires recruiter confirmation.
- Linked the Meta completion screen to the interview-visit page.
- The Meta form and website changes remain drafts and have not been published.

### 26 September 2026 — Version 0.1

- Created the initial campaign playbook.
- Set security guards as the primary role and housekeeping as secondary.
- Proposed one broad Ajmer campaign, a Higher Intent Instant Form and a ₹700/day 14-day test.
- Defined the initial advertisement, form, Zoho pipeline, follow-up process and reporting metrics.
- Recorded the employment facts that must be confirmed before launch.

## Next working session

Complete the Meta form draft, review every Facebook and Instagram preview, create the corresponding Zoho fields, map each answer and submit a test lead before campaign launch.
