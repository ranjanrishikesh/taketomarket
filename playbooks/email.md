---
discipline: email
asset_types: [newsletter, drip-email, promotional-email, transactional-email, nurture-sequence]
version: "1.0"
---

# Email Playbook

## Production Guidance

Email marketing succeeds when content reaches the inbox and compels action. Every email must clear two hurdles: deliverability (does it arrive?) and engagement (does the reader act?). Production guidance covers both.

### Subject Line Craft

Write subject lines between 30-60 characters. Avoid spam trigger words: free, guarantee, act now, urgent, limited time, congratulations, winner, no obligation, risk-free, order now, buy now, cash, credit, discount, double your, earn money, lowest price, save big. Do not use ALL CAPS words. Do not use excessive punctuation (no `!!!`, `???`, or `$$$`). One exclamation mark maximum. Personalization tokens (e.g., `{first_name}`) are acceptable and encouraged.

### Preview Text

Write preview text between 40-130 characters. Preview text must be distinct from the subject line -- it extends the subject's promise, not repeats it. If no preview text is specified, email clients pull the first line of body copy (often "View in browser" or navigation links), which wastes the preview slot.

### Structure

Use single-column layout for mobile compatibility. Keep text dominant -- 60:40 text-to-image ratio minimum. Place the primary CTA above the fold (visible without scrolling on mobile). Use minimum 14px body font and 22px+ headlines for mobile readability. Keep paragraphs short (2-3 sentences maximum).

### Dark Mode Compatibility

Use transparent backgrounds or dark-mode-safe colors (#1a1a1a, #2d2d2d). Never rely on background images for text readability. All text must be readable on both light and dark backgrounds -- test with high contrast. Provide descriptive alt text on every image so the email remains functional with images blocked (common in dark mode clients).

### Deliverability

Email deliverability has two dimensions:

1. **Content-side:** Word choice, image ratio, formatting, and compliance elements. Checked by DISC-EMAIL-01 through DISC-EMAIL-06. These are evaluated by the AI verifier against the email asset content.

2. **DNS-side:** SPF, DKIM, and DMARC records must be properly configured for the sending domain. Checked by DISC-EMAIL-07 via automated DNS lookups per D-11. These are publicly queryable TXT records; the AI verifier runs `dig` or `nslookup` commands at verify time to confirm the sending domain has proper authentication. The sending domain is specified in the campaign brief or email asset metadata.

### Compliance by Default

Every email must include:
- **Unsubscribe link:** Clear, easy to find, functional. One-click unsubscribe preferred (required by Gmail/Yahoo for bulk senders as of Feb 2024).
- **Physical mailing address:** Required by CAN-SPAM Act. Can be a PO Box.
- **Sender identification:** "From" name and email must accurately identify the sender.

---

## Discipline Gates

### DISC-EMAIL-01: Subject/Preview Spam Scan -- Tier 1

**Checks:** Subject line and preview text for spam trigger patterns
**Against:** Known spam trigger word list and formatting rules

#### Evaluation Criteria

1. **Spam triggers**
   - PASS: No spam trigger words found in subject or preview text
   - WARN: 1 borderline trigger word present with mitigating context (e.g., "free trial" in a product context)
   - FAIL: 2+ spam trigger words present, OR ALL CAPS subject, OR excessive punctuation (multiple `!`, `?`, or `$` symbols)

2. **Subject formatting**
   - PASS: No ALL CAPS words, no more than 1 exclamation mark, no `$$` or percentage-off claims in subject
   - WARN: One minor formatting issue (e.g., single ALL CAPS word used for emphasis like "NEW")
   - FAIL: Multiple formatting red flags (ALL CAPS + excessive punctuation + monetary claims)

### DISC-EMAIL-02: Dark Mode Rendering -- Tier 2

**Checks:** Content compatibility with dark mode email clients
**Against:** Dark mode rendering best practices

#### Evaluation Criteria

1. **Background safety**
   - PASS: No hard-coded light backgrounds that would create white blocks in dark mode, or explicit dark-mode-safe alternatives provided
   - WARN: Background colors used but may render poorly in dark mode -- manual dark mode test recommended
   - FAIL: Email relies on background images for text readability or uses white backgrounds without dark mode alternatives

2. **Image handling**
   - PASS: All images have descriptive alt text and email is fully readable without images loaded
   - WARN: Images have alt text but email depends on images for key information (e.g., CTA is image-only)
   - FAIL: Image-only email with no alt text or text fallback

### DISC-EMAIL-03: Unsubscribe Presence -- Tier 1

**Checks:** Legal compliance elements in email content
**Against:** CAN-SPAM Act and GDPR requirements

#### Evaluation Criteria

1. **Unsubscribe mechanism**
   - PASS: Unsubscribe or opt-out link clearly present and easy to find (typically in footer)
   - WARN: Unsubscribe present but buried in very small text or requires multiple steps
   - FAIL: No unsubscribe link present in the email

2. **Physical address**
   - PASS: Physical mailing address present (required by CAN-SPAM)
   - WARN: Address present but incomplete (e.g., city only, no street/PO Box)
   - FAIL: No physical address present in the email

### DISC-EMAIL-04: Content-to-Image Ratio -- Tier 2

**Checks:** Text-to-image balance for deliverability and accessibility
**Against:** Deliverability best practices (60:40 text dominant)

#### Evaluation Criteria

1. **Text dominance**
   - PASS: Text content is clearly dominant -- email is fully readable and meaningful with images blocked
   - WARN: Roughly equal text and image content -- email communicates core message without images but loses significant context
   - FAIL: Image-heavy email -- more image area than text, or image-only email with minimal supporting text

2. **Alt text coverage**
   - PASS: Every image has descriptive alt text that conveys the image's purpose
   - WARN: Some images missing alt text, or alt text is generic (e.g., "image", "photo")
   - FAIL: No alt text on images, or alt text on fewer than half of images

### DISC-EMAIL-05: Subject Line Length -- Tier 2

**Checks:** Subject line and preview text length optimization
**Against:** Email client display limits and engagement data

#### Evaluation Criteria

1. **Subject length**
   - PASS: Subject line is 30-60 characters (optimal display across desktop and mobile clients)
   - WARN: Subject line is 20-29 or 61-80 characters (may truncate on some mobile clients)
   - FAIL: Subject line is under 20 characters (too vague) or over 80 characters (truncated on most clients)

2. **Preview text**
   - PASS: Preview text present, 40-130 characters, and distinct from subject line
   - WARN: Preview text present but too short (under 40 chars), too long (over 130 chars), or repeats the subject line
   - FAIL: No preview text specified (email client will pull first line of body copy)

### DISC-EMAIL-06: Single Clear CTA -- Tier 2

**Checks:** CTA clarity and prominence in email layout
**Against:** Email content structure and visual hierarchy

#### Evaluation Criteria

1. **Primary CTA**
   - PASS: One clear primary CTA above the fold with action-oriented button text (e.g., "Start Free Trial", "Download the Guide", "Register Now")
   - WARN: CTA present but below the fold, or uses weak text like "Click here", "Learn more", or "Read more"
   - FAIL: No CTA present, or multiple competing CTAs of equal visual weight above the fold

2. **CTA hierarchy**
   - PASS: If secondary CTAs exist, they are visually subordinate to the primary CTA (smaller, text-link style, or lower in layout)
   - WARN: Secondary CTAs are nearly as prominent as the primary CTA (similar button size/color)
   - FAIL: N/A -- linked to primary CTA presence above

### DISC-EMAIL-07: DNS Deliverability -- Tier 1

**Checks:** Sending domain has SPF, DKIM, and DMARC records properly configured. These are public DNS TXT records that can be queried programmatically at verify time.
**Against:** DNS TXT records for the sending domain specified in the campaign brief or email asset metadata

#### Evaluation Criteria

1. **SPF record**
   - PASS: `dig TXT {domain}` returns a valid SPF record (`v=spf1`) that includes the email service provider's sending servers (e.g., `include:_spf.google.com` for Google Workspace, `include:servers.mcsv.net` for Mailchimp)
   - WARN: SPF record exists but uses `+all` (overly permissive) or is missing the ESP's include directive
   - FAIL: No SPF TXT record found for the sending domain

2. **DKIM record**
   - PASS: `dig TXT {selector}._domainkey.{domain}` returns a valid DKIM public key record (`v=DKIM1; k=rsa; p=...`)
   - WARN: DKIM record exists but uses a weak key (< 1024 bits) or selector cannot be determined from the campaign brief
   - FAIL: No DKIM record found for the expected selector. Note: selector is typically provided by the ESP -- check brief for ESP name and use their default selector (e.g., "google" for Google Workspace, "k1" for Mailchimp, "s1" for SendGrid, "smtp" for Amazon SES)

3. **DMARC record**
   - PASS: `dig TXT _dmarc.{domain}` returns a DMARC policy record with `p=quarantine` or `p=reject` (active enforcement)
   - WARN: DMARC record exists but uses `p=none` (monitoring only -- not enforcing, which means spoofed emails are still delivered)
   - FAIL: No DMARC record found for the domain

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-07 | Tier 2 (advisory) | Tier 1 (blocking) | Email compliance (CAN-SPAM, GDPR) is legally required; non-compliance risks sender reputation, inbox placement, and legal liability |

---

## Format Rules

Email-specific structural requirements enforced during production:

- **Subject line:** 30-60 characters
- **Preview text:** 40-130 characters, distinct from subject line
- **Body layout:** Single-column for mobile compatibility
- **CTA button:** Minimum 44x44px touch target, contrasting color against background
- **Unsubscribe:** Must be present and functional (one-click preferred)
- **Physical address:** Must be present (CAN-SPAM requirement)
- **Font size:** Minimum 14px body text, 22px+ headlines for mobile readability
- **Image alt text:** Required on every image
- **Text-to-image ratio:** 60:40 minimum (text dominant)
- **Link count:** Avoid excessive links (>10 unique URLs can trigger spam filters)

---

## Examples

### Good: Clean Subject with Dark-Mode-Safe Layout

```
Subject: Your Q2 pipeline report is ready (42 chars)
Preview: 3 insights your team should see this week (46 chars)

[Single-column layout]
[Dark background: #1a1a2e, light text: #e0e0e0]
[Transparent PNG logo with alt text: "Acme Analytics"]

Hi {first_name},

Your Q2 pipeline report just generated. Here are the highlights:

1. Deal velocity increased 18% month-over-month
2. Two enterprise accounts moved to negotiation stage
3. Your top-performing rep closed 4 deals this week

[Primary CTA button: "View Full Report" -- contrasting color, above fold]

---
[Footer: unsubscribe link | company address | privacy policy]
```

**Why it works:** Subject under 60 chars, no spam triggers, preview extends the promise, single CTA above fold, dark-mode safe colors, alt text on images, compliance footer present.

### Good: Nurture Sequence Email with Clear Value

```
Subject: The 3-step framework we use for ABM (43 chars)
Preview: Most teams skip step 2 -- here's why it matters (51 chars)

[Text-dominant email, minimal images]

{first_name}, here's something we learned running ABM for 200+ accounts last quarter...

[Educational content: 3 steps with brief explanations]

[Primary CTA: "Get the Full ABM Playbook" -- button]
[Secondary CTA: "Reply to this email with questions" -- text link, smaller]

---
[Unsubscribe | 123 Market St, San Francisco, CA 94105]
```

**Why it works:** No spam words, educational value before ask, single primary CTA with subordinate secondary, text-dominant, full compliance footer.

### Bad: Spam Trigger Subject Line

```
Subject: FREE GUARANTEED RESULTS!!! Act Now -- Limited Time Offer!!!
Preview: Don't miss this incredible opportunity to save BIG $$$

[Image-only email body with no text]
[No alt text on images]
[No unsubscribe link]
[No physical address]
```

**Why it fails:** DISC-EMAIL-01 FAIL (spam triggers: "FREE", "GUARANTEED", ALL CAPS, "!!!", "Act Now", "Limited Time"), DISC-EMAIL-03 FAIL (no unsubscribe, no address), DISC-EMAIL-04 FAIL (image-only), DISC-EMAIL-05 FAIL (subject over 80 chars).

### Bad: Image-Only Email with White Background

```
Subject: New product launch (18 chars -- too short)
Preview: (none specified)

[White background #FFFFFF]
[Single large image containing all text and CTA]
[No alt text]
[Unsubscribe link in tiny 8px gray text]
```

**Why it fails:** DISC-EMAIL-02 FAIL (white background, no dark mode alternative, image-dependent), DISC-EMAIL-04 FAIL (image-only), DISC-EMAIL-05 FAIL (subject under 20 chars, no preview text), DISC-EMAIL-06 FAIL (CTA is inside image, not a real button).

---

## Anti-Patterns

1. **Spam trigger words in subject line:** Using "free", "guarantee", "act now", "limited time", "congratulations", "winner" -- these words trigger spam filters and reduce inbox placement rates.

2. **ALL CAPS in subject or body:** Writing entire words or phrases in capitals signals spam to both filters and readers. One word for emphasis (e.g., "NEW") is borderline acceptable; full caps subjects are not.

3. **Image-only emails:** Emails composed entirely of images with no text fallback are flagged by spam filters, broken when images are blocked (common in corporate email clients), and inaccessible to screen readers.

4. **Missing unsubscribe link:** Legally required by CAN-SPAM (US), GDPR (EU), CASL (Canada), and most jurisdictions. Missing unsubscribe is a compliance violation, not just a best practice issue.

5. **White backgrounds without dark mode alternatives:** Over 80% of email opens occur on devices with dark mode available. White backgrounds create jarring bright blocks in dark mode email clients.

6. **Multiple competing CTAs:** Three equally prominent buttons confuse the reader about what action to take. One primary CTA per email; secondary actions should be visually subordinate.

7. **Sending from unconfigured domains:** Sending email from a domain with no SPF, DKIM, or DMARC records means anyone can spoof your domain, your emails land in spam, and your sender reputation degrades over time.

---

## Metrics

What to measure post-ship for email campaigns:

- **Open rate:** Subject line and sender name effectiveness. Benchmark: 20-25% for B2B, 15-20% for B2C.
- **Click-through rate (CTR):** CTA effectiveness and content relevance. Benchmark: 2-5%.
- **Unsubscribe rate:** Content relevance and send frequency appropriateness. Healthy: under 0.5% per send.
- **Spam complaint rate:** Deliverability health signal. Must stay under 0.1% (Gmail/Yahoo threshold).
- **Conversion rate:** Outcome metric alignment -- did the email drive the intended action? Track against the campaign brief's outcome metric.
- **DNS authentication pass rate:** SPF/DKIM/DMARC alignment percentage from ESP reports. Target: 100% alignment.
- **Bounce rate:** List hygiene indicator. Hard bounces above 2% signal list quality issues.
