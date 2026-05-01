---
discipline: events
asset_types: [event-landing-page, webinar-script, sponsorship-brief, post-event-recap]
version: "1.0"
---

# Events Discipline Playbook

This playbook extends the base playbook contract (`base.md`) with events-specific production guidance, discipline gates, and format rules. It is loaded by ttm-producer during content generation and parsed by ttm-verify for gate evaluation.

---

## Production Guidance

### Pre/During/Post Campaign Phases

Every event campaign must plan content and actions across all 3 phases. Single-phase planning (just the event itself) is the most common failure mode:

**Pre-event phase:**
- Registration/landing page with clear event value proposition, speaker bios, agenda, and registration CTA
- Promotional email sequence: announcement (4-6 weeks before), detail reveal (2-3 weeks), early-bird deadline (1-2 weeks), final reminder (48h and 24h before)
- Social promotion cadence: teaser content, speaker spotlights, countdown posts
- Partner/sponsor cross-promotion coordination

**During-event phase:**
- Live engagement plan: polls, Q&A, chat moderation, social sharing prompts
- Real-time social coverage: live-tweeting key moments, backstage content, attendee reactions
- Technical contingency: backup plan for audio/video failures, moderator scripts for dead air
- Attendee experience touchpoints: welcome message, mid-event check-in, closing thank-you

**Post-event phase:**
- Recording delivery to registrants (within 24 hours) and no-shows (within 48 hours)
- Follow-up email sequence: thank-you + recording (day 1), key takeaways + resources (day 3), CTA or next-event invite (day 7)
- Post-event survey for attendee feedback
- Content repurposing plan (see Section 2, DISC-EVENTS-05)

### Webinar Funnel Structure

Webinars are funnel assets, not standalone events. Build the complete funnel before producing any individual piece:

1. **Registration page:** Headline (benefit-focused, not topic-focused), 3-5 bullet points of what attendees will learn, speaker bio with credibility markers, date/time with timezone, registration form (name, email minimum)
2. **Confirmation email:** Thank-you, calendar invite (.ics attachment), "add to calendar" links, pre-event resource or teaser
3. **Reminder sequence:** 24 hours before (agenda preview), 1 hour before (join link), 5 minutes before (final nudge with join link)
4. **Live event script:** Opening hook (first 60 seconds determine drop-off), content sections with timing, engagement prompts every 8-10 minutes, Q&A segment, closing CTA
5. **Recording delivery:** Hosted recording link, key timestamps, supplementary resources, next-step CTA
6. **Post-event CTA:** Product demo offer, free trial, consultation booking, or next webinar registration

### Community Building at Events

Events are community touchpoints, not isolated transactions. Plan at least 2 community actions:

- **During event:** Launch or promote a community channel (Slack workspace, Discord server, LinkedIn group) where attendees can continue conversations
- **Post-event:** Create a discussion thread in the community channel about event topics, share exclusive post-event content, invite speakers for follow-up Q&A
- **Ongoing:** Use event attendee lists to seed community membership, track community engagement as a leading indicator of customer retention

### Sponsorship ROI Calculation

Before committing sponsorship budget, project the return:

- **Cost inputs:** Sponsorship fee, booth/setup costs, travel, swag, staff time
- **Expected outputs:** Estimated reach (attendee count x booth traffic %), leads collected, meetings booked
- **Cost-per-lead projection:** Total cost / expected leads. Compare to other channel CPLs.
- **Brand visibility metrics:** Logo impressions, speaking slot value, content distribution reach
- **Success/failure thresholds:** Define in advance what makes the sponsorship a success (e.g., 50+ qualified leads at <$100 CPL) or failure (e.g., <10 leads or >$500 CPL)

### Content Repurposing from Events

Event recordings and materials are high-value source content. Plan repurposing before the event:

- **Blog recap:** 800-1200 word summary of key insights, published within 1 week
- **Social clips:** 3-5 short video clips (30-90 seconds) of the best moments
- **Email highlight:** Key takeaway summary sent to broader email list (not just attendees)
- **Podcast episode:** Audio extracted and edited into a podcast episode or interview segment
- **Slide deck:** Published on SlideShare or as a downloadable PDF with added context
- **Quote graphics:** Speaker quotes formatted as shareable social images

---

## Discipline Gates

### DISC-EVENTS-01: Campaign Phase Coverage -- Tier 1

**Checks:** Event campaign covers all 3 phases (pre, during, post) per PLAY-11
**Against:** Event brief and campaign plan

#### Evaluation Criteria

1. **Phase completeness**
   - PASS: Brief defines distinct content and actions for pre-event (promotion, registration), during-event (engagement, live content), and post-event (follow-up, recording, recap)
   - WARN: Two of three phases covered with specific actions defined
   - FAIL: Only one phase covered (typically just the event itself with no pre-promotion or post-follow-up plan)

2. **Phase depth**
   - PASS: Each phase has at least 3 specific action items with owners and timelines
   - WARN: Phases defined but with only 1-2 vague actions per phase
   - FAIL: Phase mentioned in passing without specific actions

### DISC-EVENTS-02: Webinar Funnel Integrity -- Tier 1

**Checks:** Webinar has a complete registration-to-follow-up funnel per PLAY-11
**Against:** Webinar campaign assets and plan

#### Evaluation Criteria

1. **Funnel stage coverage**
   - PASS: Funnel includes registration page, confirmation email, reminder sequence (24h and 1h before), live event script, recording delivery, and post-event CTA
   - WARN: Has registration and event but missing reminder sequence or post-event follow-up
   - FAIL: No registration funnel defined, or event with no follow-up plan

2. **Funnel continuity**
   - PASS: Each stage connects to the next with a clear handoff (registration triggers confirmation, confirmation includes calendar link, reminder includes join link)
   - WARN: Stages exist but transitions are not explicitly defined
   - FAIL: Stages are disconnected with no clear flow from registration to post-event

### DISC-EVENTS-03: Sponsorship ROI -- Tier 2

**Checks:** Sponsorship brief includes ROI projection and success criteria per PLAY-11
**Against:** Sponsorship brief and budget documentation

#### Evaluation Criteria

1. **ROI projection**
   - PASS: Brief includes sponsorship cost, expected reach/leads, cost-per-lead projection, brand visibility metrics, and success/failure thresholds
   - WARN: Cost and expected reach stated but no per-lead math or success thresholds
   - FAIL: Sponsorship brief with no ROI projection or success criteria

2. **Comparison baseline**
   - PASS: CPL projection is compared against at least one other channel's CPL to justify the investment
   - WARN: CPL calculated but not compared to other channels
   - FAIL: No CPL calculation present

### DISC-EVENTS-04: Community Building -- Tier 2

**Checks:** Event plan includes community engagement beyond the event itself per PLAY-11
**Against:** Event campaign plan and post-event strategy

#### Evaluation Criteria

1. **Community actions**
   - PASS: Plan includes at least 2 community actions (e.g., Slack/Discord invite, LinkedIn group creation, follow-up discussion thread, user group formation, exclusive post-event content channel)
   - WARN: Single community touchpoint defined
   - FAIL: No community building element in the event plan

2. **Community continuity**
   - PASS: Community actions are connected to ongoing engagement (not one-off), with a plan for sustaining activity after the event
   - WARN: Community channel created but no plan for ongoing engagement
   - FAIL: N/A (linked to community actions result)

### DISC-EVENTS-05: Content Repurposing Plan -- Tier 2

**Checks:** Event recording and materials have a repurposing plan for other channels
**Against:** Post-event content strategy

#### Evaluation Criteria

1. **Derivative asset count**
   - PASS: Plan specifies at least 3 derivative assets from event content (e.g., blog recap, social clips, email highlight, podcast episode, slide deck, quote graphics)
   - WARN: 1-2 derivative assets planned
   - FAIL: No repurposing plan for event content

2. **Channel mapping**
   - PASS: Each derivative asset is mapped to a specific distribution channel with a timeline
   - WARN: Assets listed but distribution channels or timelines not specified
   - FAIL: N/A (linked to derivative asset count result)

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-05 (Funnel Integrity) | Tier 2 | Tier 1 | Event funnels (registration to attendance to follow-up) are critical to ROI; broken funnels waste the entire event investment |

---

## Format Rules

### Event Landing Page Structure

1. **Headline:** Benefit-focused, 8-12 words (what attendees will gain, not just the topic)
2. **Subhead:** Event type, date, time with timezone, duration
3. **Value bullets:** 3-5 specific takeaways attendees will leave with
4. **Speaker section:** Photo, name, title, 2-3 sentence bio with credibility markers
5. **Agenda/outline:** Timed agenda or topic outline showing the event flow
6. **Social proof:** Past event metrics, testimonials, notable past attendees (if applicable)
7. **Registration CTA:** Above the fold AND at page bottom. Minimal form fields (name, email, company).
8. **Calendar integration:** Auto-generated .ics file or "add to calendar" links upon registration

### Webinar Script Format

```
[0:00-1:00] OPENING HOOK
- Attention-grabbing question, statistic, or story
- Brief overview of what attendees will learn
- Housekeeping (recording available, Q&A at end, mute/unmute)

[1:00-5:00] SPEAKER INTRO + CONTEXT
- Speaker credibility (why should they listen to you)
- Problem framing (why this topic matters now)

[5:00-35:00] CORE CONTENT (3-4 sections)
- Section 1: [Topic] (8-10 min)
  - Key point + supporting evidence
  - ENGAGEMENT PROMPT: [Poll/question at 10-min mark]
- Section 2: [Topic] (8-10 min)
  - Key point + supporting evidence
  - ENGAGEMENT PROMPT: [Poll/question at 20-min mark]
- Section 3: [Topic] (8-10 min)
  - Key point + supporting evidence
  - ENGAGEMENT PROMPT: [Poll/question at 30-min mark]

[35:00-45:00] Q&A
- Prepared seed questions (in case of slow start)
- Moderator selects and reads questions

[45:00-48:00] CLOSING
- 3 key takeaways (repeat the value)
- CTA: [Specific next step with link]
- Thank you + where to continue the conversation
```

### Sponsorship Brief Template

1. **Event overview:** Name, date, location, expected attendance, audience profile
2. **Sponsorship tier:** What is included (logo placement, speaking slot, booth, leads)
3. **Cost breakdown:** Fee + estimated additional costs (travel, booth setup, swag)
4. **ROI projection:** Expected leads, CPL, comparison to other channels
5. **Success criteria:** Specific thresholds that define success vs. failure
6. **Measurement plan:** How leads and brand visibility will be tracked
7. **Go/no-go deadline:** Date by which decision must be made

### Post-Event Recap Format

1. **Headline:** Key insight or outcome from the event
2. **Event context:** 1-2 sentences on what the event was and who attended
3. **Key takeaways:** 3-5 numbered insights with supporting detail
4. **Quotes:** 2-3 notable quotes from speakers or attendees
5. **Data points:** Attendance numbers, engagement metrics, survey highlights
6. **Resources:** Links to recording, slides, related content
7. **Next steps:** Upcoming events, community link, CTA

---

## Examples

### Good: Complete 3-Phase Event Plan

```
PRE-EVENT (4 weeks before):
- Landing page with benefit headline, speaker bios, timed agenda
- Email sequence: announcement (week 1), speaker spotlight (week 2),
  early-bird deadline (week 3), final reminder (24h + 1h before)
- Social: 8 posts across LinkedIn and X (2/week) with speaker quotes
- Partner cross-promotion with 2 co-marketing partners

DURING-EVENT:
- Live polls every 10 minutes via webinar platform
- Dedicated chat moderator for Q&A curation
- Live-tweeting 5 key moments with event hashtag
- Technical backup: co-host can take over if primary speaker drops

POST-EVENT:
- Recording sent within 24h to attendees, 48h to no-shows
- Follow-up sequence: thank-you (day 1), takeaways (day 3), CTA (day 7)
- Blog recap published day 5 with key insights
- 4 social clips (60s each) from recording, published over 2 weeks
- Attendees invited to Slack community channel
- Post-event survey sent with recording email
```

### Bad: Single-Phase Event Plan

```
EVENT:
- Host a webinar about our product on Tuesday
- Send recording to people who signed up

Problems:
- No pre-event promotion or registration funnel
- No reminder sequence (expect 50%+ drop-off)
- No engagement plan during the event
- Recording sent but no follow-up sequence or CTA
- No content repurposing
- No community building
- No measurement plan
```

---

## Anti-Patterns

1. **Events with no follow-up** -- Hosting a webinar or conference session and never contacting attendees again. The event is the beginning of a relationship, not the end. Post-event follow-up within 48 hours is when intent is highest.

2. **Sponsorships with no ROI tracking** -- Paying $10K for a conference booth without defining what success looks like or how leads will be tracked. Every sponsorship needs a CPL projection and measurement plan before committing budget.

3. **Webinars without registration funnels** -- Sending a single "join our webinar" email with a direct meeting link. Without a registration page, you lose the ability to send reminders, measure attendance rate, and follow up with no-shows.

4. **Single-phase planning** -- Planning only the event itself without pre-promotion or post-follow-up. This is the number one event marketing failure mode. All 3 phases must have defined actions.

5. **No content repurposing** -- Investing 20+ hours in an event and generating zero derivative content. Every event should produce at least 3 derivative assets (recap, clips, email highlight).

6. **Engagement-free webinars** -- A 45-minute monologue with no polls, questions, or interactive elements. Attendees start dropping off after 8-10 minutes without engagement prompts.

7. **Community as afterthought** -- Launching a Slack channel at the end of an event with no plan to sustain it. Community channels without ongoing content and moderation become ghost towns within 2 weeks.

---

## Metrics

Track these indicators for event content after shipping:

- **Registrations** -- Total registrations and registration conversion rate (landing page visits to registrations)
- **Attendance rate** -- Percentage of registrants who actually attended. Benchmark: 35-45% for webinars, 60-80% for in-person.
- **Engagement during event** -- Poll participation rate, Q&A questions submitted, chat messages, average watch time (for webinars)
- **Post-event conversions** -- Actions taken from post-event follow-up (demo requests, trial signups, content downloads)
- **Content repurposing output** -- Number of derivative assets created from event content and their individual performance metrics
- **Sponsorship ROI** -- Actual leads and CPL compared to pre-event projections. Actual vs. projected comparison.
- **Community growth** -- New community members attributed to the event, 30-day retention of event-sourced members
- **NPS/satisfaction score** -- Post-event survey results, likelihood to attend future events
- **No-show recovery rate** -- Percentage of no-shows who engaged with the recording delivery email
