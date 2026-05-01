---
discipline: pr-media
asset_types: [press-release, media-pitch, media-kit, byline-article]
version: "1.0"
---

# PR/Media Discipline Playbook

This playbook extends the base playbook contract (`base.md`) with PR/media-specific production guidance, discipline gates, and format rules. It is loaded by ttm-producer during content generation and parsed by ttm-verify for gate evaluation.

---

## Production Guidance

### Media List Structure

Every PR campaign starts with a structured media list. Do not pitch without one:

- **Minimum 10 contacts** with: outlet name, journalist name, beat/coverage area, recent relevant article, and a specific pitch angle tailored to that journalist
- **Tiered organization:** Tier 1 (national/major trade), Tier 2 (regional/niche trade), Tier 3 (blogs/newsletters/podcasts). Allocate effort proportionally -- Tier 1 gets the most customization.
- **Beat matching:** Only pitch journalists who cover your space. A fintech pitch sent to a healthcare reporter wastes both parties' time and damages future relationships.
- **Recency check:** Verify each contact is still at the listed outlet and still covering the same beat. Journalist turnover is high -- stale lists produce bounced emails and irrelevant pitches.

### Pitch Angle Customization

Generic pitches fail. Every pitch must connect the story to the journalist's specific interests:

- **Reference recent work:** Mention a specific article the journalist published and explain how your story extends, contrasts with, or adds a new angle to their coverage.
- **Angle-per-journalist:** The same announcement should be pitched differently to a product reviewer (focus on features/UX), an industry analyst (focus on market impact), and a business reporter (focus on funding/growth).
- **Subject line discipline:** 6-10 words, specific and newsworthy. Avoid clickbait, ALL CAPS, or exclamation marks. The subject line is the pitch -- if it does not convey the news, the email will not be opened.

### Embargo Management

Embargoes give select journalists early access to a story in exchange for coordinated publication:

- **Clear terms:** Specify exact date and time (with timezone) for embargo lift. Use written confirmation (email) -- verbal agreements are unreliable.
- **NDA when needed:** For sensitive announcements (M&A, funding, partnerships), require a signed NDA before sharing embargoed information.
- **Break protocol:** Document what happens if an embargo is broken. Typically: immediate release to all other embargoed journalists, note the breaking outlet for future exclusion.
- **Selective use:** Reserve embargoes for genuinely significant news. Routine product updates do not warrant embargo complexity.

### Press Release Structure

Follow the inverted pyramid -- most important information first:

1. **Headline:** Factual, specific, 8-12 words. State the news clearly.
2. **Dateline:** City, State/Country -- Date
3. **Lead paragraph:** Who, what, when, where, why in 2-3 sentences
4. **Supporting details:** Context, background, market data (2-3 paragraphs)
5. **Executive quote:** One quote from a named executive providing perspective
6. **Product/company details:** Specifics about the product or initiative
7. **Boilerplate:** Standard company description paragraph (consistent across all releases)
8. **Media contact:** Name, email, phone number for press inquiries

### Byline Article Positioning

Byline articles (op-eds, thought leadership pieces published under an executive's name) require:

- **Original perspective:** The article must offer a viewpoint not available in the company's standard marketing. Personal experience, contrarian takes, or proprietary data analysis.
- **Publication fit:** Match the article's tone, length, and topic to the target publication's editorial standards. Read 5+ recent bylines in the target outlet before writing.
- **Attribution balance:** The byline builds the author's credibility and the company's thought leadership. Avoid overt product promotion -- publications reject advertorials.

### Earned Media Measurement

Plan measurement before pitching, not after:

- **Baseline:** Document current share of voice, existing coverage volume, and brand mention frequency before the campaign starts.
- **Tracking method:** Specify how coverage will be monitored (Google Alerts, media monitoring tool, manual search, or combination).
- **Success criteria:** Define what "success" looks like in measurable terms (e.g., 5 Tier 1 placements, 20% share-of-voice increase, 500 referral visits from coverage).

---

## Discipline Gates

### DISC-PR-MEDIA-01: Media List Structure -- Tier 1

**Checks:** Media outreach includes a structured journalist/outlet list with angles per PLAY-10
**Against:** Media list document or pitch plan

#### Evaluation Criteria

1. **List completeness**
   - PASS: Media list includes at least 10 contacts with outlet name, journalist name, beat, and a specific pitch angle per journalist
   - WARN: Media list has contacts but uses the same generic pitch angle for all journalists
   - FAIL: No media list, or list has fewer than 5 contacts, or no pitch angles defined

2. **Contact recency**
   - PASS: List notes when contacts were last verified (within 30 days) or references recent articles by each journalist
   - WARN: List exists but verification date is not noted
   - FAIL: List contains obviously stale contacts (wrong outlets, inactive journalists)

### DISC-PR-MEDIA-02: Pitch Angle Specificity -- Tier 1

**Checks:** Each pitch is customized to the journalist's beat and recent coverage per PLAY-10
**Against:** Individual pitch content compared to journalist profile

#### Evaluation Criteria

1. **Journalist-specific customization**
   - PASS: Pitch references the journalist's recent work or beat and connects the story to their audience's interests
   - WARN: Pitch is topically relevant to the beat but does not reference specific recent coverage
   - FAIL: Generic pitch with no journalist-specific customization

2. **Angle differentiation**
   - PASS: Different journalists receive different angles of the same story (e.g., product angle vs. market impact angle)
   - WARN: Slight variations in pitch but substantially the same angle for all contacts
   - FAIL: Identical pitch sent to all journalists regardless of beat or outlet

### DISC-PR-MEDIA-03: Embargo Management -- Tier 2

**Checks:** Embargo terms are documented and communicated if applicable per PLAY-10
**Against:** Pitch documentation and communication plan

#### Evaluation Criteria

1. **Embargo clarity**
   - PASS: Embargo date/time with timezone clearly stated in pitch, NDA or embargo agreement terms defined, break protocol documented
   - WARN: Embargo mentioned but terms are vague (no specific date/time or missing timezone)
   - FAIL: Embargoed information sent without embargo terms, or conflicting embargo dates across pitches

2. **Non-embargo acknowledgment**
   - PASS: If no embargo applies, the pitch explicitly states the information is for immediate use
   - WARN: N/A (linked to embargo decision)
   - FAIL: Ambiguous about whether information is embargoed or not

### DISC-PR-MEDIA-04: Press Release Structure -- Tier 2

**Checks:** Press release follows inverted pyramid with required elements
**Against:** Press release content

#### Evaluation Criteria

1. **Required elements**
   - PASS: Includes headline, dateline, lead paragraph (who/what/when/where/why), supporting details, executive quote, boilerplate, and media contact info
   - WARN: Missing one non-critical element (e.g., dateline or boilerplate)
   - FAIL: Missing headline, lead paragraph, or more than 2 required elements

2. **Inverted pyramid structure**
   - PASS: Most newsworthy information appears in the first paragraph; details expand in subsequent paragraphs
   - WARN: Key news is present but buried below background context
   - FAIL: Release leads with company history or product features before stating the actual news

### DISC-PR-MEDIA-05: Earned Media Measurement -- Tier 2

**Checks:** Coverage tracking and measurement plan exists per PLAY-10
**Against:** Campaign measurement documentation

#### Evaluation Criteria

1. **Measurement plan completeness**
   - PASS: Measurement plan specifies tracking method (media monitoring tool or manual), target outlets, share-of-voice baseline, and success criteria
   - WARN: Success criteria defined but tracking method not specified
   - FAIL: No measurement plan for earned media outcomes

2. **Baseline documentation**
   - PASS: Pre-campaign baseline metrics documented (current coverage volume, share of voice, brand mentions)
   - WARN: Baseline mentioned but specific numbers not recorded
   - FAIL: No baseline established before campaign launch

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-02 (Claim Accuracy) | Tier 2 | Tier 1 | Press claims are amplified by journalists and become public record; inaccuracies are nearly impossible to retract once published |

---

## Format Rules

### Press Release Format

- **Headline:** 8-12 words, factual, no jargon. Title case.
- **Dateline:** CITY, STATE (Month Day, Year) --
- **Lead paragraph:** 2-3 sentences. Answer who, what, when, where, why.
- **Body:** 3-5 paragraphs, 400-600 words total (excluding boilerplate).
- **Quote:** Attributed to a named individual with title. 2-3 sentences maximum.
- **Boilerplate:** 50-75 words. Consistent across all releases.
- **Media contact:** Full name, title, email, phone. At the bottom.

### Media Pitch Email Format

```
Subject: [6-10 words, specific news angle -- no clickbait]

Hi [Journalist first name],

[1 sentence referencing their recent coverage or beat relevance]

[2-3 sentences stating the news/story and why it matters to their audience]

[1 sentence offering: interview, exclusive data, demo, or early access]

[1 sentence with a clear ask: "Would this be worth a conversation?"]

Best,
[Name]
[Title, Company]
[Phone]
```

Total pitch length: 100-150 words. Shorter is better.

### Media Kit Contents

1. **Company fact sheet:** 1 page with founding date, HQ, team size, funding, key metrics
2. **Executive bios:** 100-150 words per executive, with high-resolution headshots
3. **Product screenshots/visuals:** High-resolution, properly licensed, with captions
4. **Press release archive:** Links to 3-5 most recent releases
5. **Brand assets:** Logo files (SVG, PNG), brand color codes, usage guidelines
6. **Media contact:** Dedicated PR contact with direct email and phone

### Byline Article Structure

- **Length:** 800-1200 words for most publications (check target outlet guidelines)
- **Opening:** Personal anecdote or contrarian statement -- NOT a product pitch
- **Body:** 3-5 supporting points with data, examples, or industry references
- **Closing:** Forward-looking perspective or actionable takeaway
- **Bio:** 2-3 sentences about the author, company mention in final sentence only
- **Product mentions:** Zero to one. More than one and the publication will reject it.

---

## Examples

### Good: Customized Pitch

```
Subject: New data on developer tool adoption in enterprise (for your DevOps series)

Hi Sarah,

Your recent piece on CI/CD pipeline sprawl in Fortune 500 companies resonated
with what we are seeing in our customer base. We have new data from 200+
enterprise deployments showing that tool consolidation reduced pipeline
failures by 34%.

Would you be interested in an exclusive look at the data before we publish
the full report next month?

Best,
[Name]
```

**Why it works:** References specific recent coverage, offers exclusive data, makes a clear ask, under 100 words.

### Bad: Generic Spray-and-Pray Pitch

```
Subject: EXCITING NEWS FROM [COMPANY]!!!

Dear Editor,

[Company] is thrilled to announce our latest product update! We are the
leading provider of innovative solutions that empower businesses to
transform their digital journey. Our new features include...

[500 words of product description]

Please let us know if you would like to cover this exciting news.
```

**Problems:** No journalist name, no beat relevance, subject line is clickbait, self-congratulatory tone, too long, no specific ask, no news angle.

---

## Anti-Patterns

1. **Spray-and-pray pitching** -- Sending the same generic pitch to 200+ journalists. Response rates drop below 1%. Customize every pitch or do not send it.

2. **Self-congratulatory press releases** -- Leading with "We are thrilled/excited/proud to announce..." The journalist does not care about your feelings. Lead with the news and why it matters to their readers.

3. **Ignoring journalist beat** -- Pitching a cybersecurity story to a consumer tech reporter. Shows you did not research the journalist and guarantees your email is deleted.

4. **Burying the news** -- Starting the press release with 2 paragraphs of company history before stating what actually happened. The news goes in the first sentence.

5. **Pitching without a media list** -- Ad-hoc outreach to whoever comes to mind. Without a structured list, you miss key outlets, duplicate efforts, and cannot track results.

6. **Breaking your own embargo** -- Publishing on social media or the company blog before the embargo lifts. This kills journalist trust and ensures future embargoes are ignored.

7. **Product pitches disguised as bylines** -- Submitting a byline article that reads like a product brochure. Editors reject these immediately and may blacklist the author.

---

## Metrics

Track these indicators for PR/media content after shipping:

- **Media mentions** -- Total coverage count across Tier 1, 2, and 3 outlets, measured per campaign
- **Share of voice** -- Brand mention frequency compared to competitors in the same coverage period
- **Backlinks from coverage** -- Number of dofollow links from media articles pointing to the brand's domain
- **Referral traffic from coverage** -- Website visits originating from media articles, tracked via UTM or referral source
- **Tier 1/2/3 coverage ratio** -- Distribution of coverage across outlet tiers to assess campaign quality
- **Pitch-to-placement rate** -- Percentage of pitches sent that resulted in published coverage
- **Message pull-through** -- Percentage of coverage that includes key messaging points from the pitch
- **Journalist response rate** -- Percentage of pitched journalists who responded (even if declining), indicating list quality
