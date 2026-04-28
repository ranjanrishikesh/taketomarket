# idea.md — A GSD-style Marketing Operating System

## 0. What I am and why I exist

This document is the spec for a Claude Code skill modelled on **Get Shit Done (GSD)** by TÂCHES / Lex Christopherson (`github.com/gsd-build/get-shit-done`, 31K+ stars). GSD is a meta-prompting and spec-driven development system for Claude Code that structures AI-driven software work through phases — Discuss → Plan → Execute → Verify — with `.planning/` state files (`PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`), slash commands per phase, wave-based parallel execution in fresh 200K-token contexts, and quality gates that catch specific failure modes (schema drift, scope reduction, security). Atomic tasks, one commit per task, state persistence across sessions.

GSD is built for shipping software. **This skill** — working name **GTM-GSD** (other options below) — ports that architecture to shipping marketing. The thing I am building is not "a marketing content generator." It is a marketing operating system that treats every asset, campaign, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall.

## 1. North star

Three non-negotiables that separate this from every other AI marketing tool:

1. **Outcome over output.** Every task is tagged with (a) an output metric (impressions, clicks, installs, open rate) *and* (b) an outcome metric (pipeline ₹, qualified signups, retained users, revenue). The skill refuses to ship any task that is outcome-less. Post-ship, the Measure phase reports against the outcome, not the output. A blog post that got 10K views but moved zero pipeline is logged as a **failure**, not a success.

2. **Positioning is invariant.** The skill loads `POSITIONING.md` into every single phase. Every asset, hook, angle, keyword, thumbnail, ad headline, affiliate pitch, and SEO cluster is checked against positioning. Drift is detected and either corrected or explicitly flagged as a **positioning pivot** that requires a human decision before shipping. This is the #1 failure mode in real-world marketing teams: incremental dilution via "just this one asset."

3. **Fix as you go.** Every verify phase doesn't just flag issues — it produces a Fix Plan with root cause, specific rewrite/rework, and a re-verification loop. Failed experiments are logged with root causes in `LEARNINGS.md` that feeds back into `BRAND.md`, `ICP.md`, and `CHANNELS.md`.

## 2. Scope — every marketing discipline, not just paid ads

This skill covers the full marketing stack. Each discipline has its own playbook module (subdirectory under `skills/gtm-gsd/playbooks/`) but shares the same phase flow, state files, and quality gates.

### 2.1 Paid acquisition
- Google Ads (Search, Performance Max, YouTube, Demand Gen)
- Meta (Facebook, Instagram, Threads)
- LinkedIn Ads (Sponsored Content, Message, InMail, ABM)
- X / Twitter Ads
- Reddit, Quora, TikTok, Pinterest
- Programmatic display, retargeting
- Each channel has: creative brief → asset variants → targeting spec → bid strategy → UTM schema → landing-page binding → outcome metric

### 2.2 Organic SEO
- Keyword research + search-intent taxonomy
- Content clusters (pillar + supporting)
- Programmatic SEO (pSEO) — the skill explicitly supports large-scale page generation with quality gates (thin-content detection, template variety, internal-link density)
- Technical SEO audit (Core Web Vitals, schema.org, XML sitemaps, canonicalization, crawl budget)
- Backlinks — digital PR, broken-link building, unlinked mentions, HARO/Qwoted
- E-E-A-T signals (author pages, citations, expertise markers)
- Updating/refreshing decayed content
- Internal linking strategy

### 2.3 AEO (Answer Engine Optimization)
- Being cited in ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews, Bing Copilot
- Structured data (schema.org: FAQPage, HowTo, Article, Organization, Product)
- Quote-worthy sentences — short, definitive, attributable
- Author/expert markup that LLMs resolve as authoritative
- "Citation-shaped content" — lists, definitions, comparison tables, numeric claims with sources
- Cross-domain consistency (same facts across your site, LinkedIn, Wikipedia, G2, Crunchbase)
- AEO measurement — tracking when your brand is cited vs. your competitors in AI answers for target queries; weekly crawl of the top 50 target queries across 5 AI engines
- LLMs.txt file, robot.txt for AI crawlers
- Wikipedia / Wikidata presence (if eligible)

### 2.4 Affiliate marketing
- Program design (commission structure, cookie window, recurring vs one-time)
- Partner recruitment pipeline (cold, warm, referred)
- Creative kit for affiliates (swipe copy, banners, videos, comparison articles)
- Attribution and fraud detection
- Top-partner relationship management
- Affiliate network integration (Impact, PartnerStack, Rewardful, Tapfiliate, First Promoter)

### 2.5 YouTube marketing
- Long-form (tutorials, thought leadership, case studies, founder content)
- Shorts
- Thumbnail + hook testing (A/B test harness)
- Chapter optimization, description SEO, end screens
- Channel strategy (playlists, series, upload cadence)
- Community tab, YouTube Live
- Creator collaborations / sponsorships

### 2.6 Social media marketing
- LinkedIn (founder posts, company page, thought leadership, newsletters, LinkedIn Live)
- X / Twitter (threads, replies, quote-tweets, spaces)
- Instagram (Reels, carousels, Stories)
- TikTok (short-form video, creator marketplace)
- Threads, Bluesky, Mastodon (emerging platforms where appropriate)
- Community-specific social (Hacker News, r/<subreddit>, Indie Hackers, Product Hunt, Lobste.rs)
- Content repurposing pipeline (one long-form → 5 short-form → social snippets)

### 2.7 Lifecycle / email / owned audience
- Welcome sequence, activation sequence, re-engagement
- Newsletter (product updates, thought leadership)
- Transactional email copy + conversion optimization
- Segmentation rules + triggered journeys
- Deliverability monitoring (SPF/DKIM/DMARC, spam-trap avoidance, warm-up)

### 2.8 PR and media relations
- Media list building, journalist relationship tracking
- Press releases + pitches with angle-per-journalist
- Embargo management
- Earned media measurement (share of voice, sentiment)

### 2.9 Events / webinars / community
- Event-specific campaign with pre/during/post phases
- Webinar funnels (registration → attendance → follow-up)
- Community building (Discord, Slack, Circle, Geneva)
- Conference sponsorship evaluation + ROI

### 2.10 Brand / positioning / creative system
- Visual identity consistency
- Voice and tone guides
- Message architecture (category, hero, proof points, differentiators)
- Competitive positioning map, always current
- Brand monitoring (social listening, Google Alerts, AI-answer citations)

## 3. Architecture — phases

Every campaign (paid, organic, affiliate, YouTube, social — any discipline) moves through these 9 phases. Not every campaign uses every phase, but the flow is canonical.

### Phase 1 — Discover
Research before commitment. For this campaign:
- Who is the ICP segment? (link to `ICP.md`)
- What is the job-to-be-done?
- What does the SERP / social feed / AI answer look like for target queries today?
- What do competitors say? What is saturated? What is empty?
- What is the ambient narrative? What's changed in the last 30 days?

**Output:** `CAMPAIGNS/<slug>/01-RESEARCH.md` with cited sources, SERP screenshots, AI-answer citations, competitor asset links.

### Phase 2 — Brief
The canonical brief — the source of truth every downstream asset is derived from. Written *once*, referenced by every producer. Every field is mandatory:
- Campaign goal + outcome metric + target value + measurement window
- ICP segment (link to `ICP.md`)
- Positioning anchor (link to `POSITIONING.md`)
- Hook / core message
- Proof points (link to `BRAND.md`)
- Channel mix and rationale
- Assets list (with type, owner, due date)
- Success criteria and failure criteria
- Budget + resource constraints

**Output:** `CAMPAIGNS/<slug>/02-BRIEF.md`. **Gate before next phase: positioning check + outcome metric check.**

### Phase 3 — Produce
Parallel-wave asset production. Each asset is an atomic task in a fresh 200K-token context loaded with BRIEF + POSITIONING + BRAND + ICP + relevant playbook. Waves are structured by dependency (hero asset first, then derivatives; landing page before ad creative pointing to it).

**Output:** `CAMPAIGNS/<slug>/assets/<asset-id>/` — each asset gets a folder with: spec, draft, metadata, UTM binding, review notes, final version.

### Phase 4 — Verify
Automated gate wall. Every asset is checked against the quality-gate list (see §5). This phase is **non-negotiable** — nothing ships without passing verify. Verify emits a pass/fail report per gate with specific line-level feedback.

**Output:** `CAMPAIGNS/<slug>/04-VERIFICATION.md` with per-asset per-gate status.

### Phase 5 — Review
Human review with structured prompts. The skill produces a review checklist that forces the reviewer to answer specific questions — not "does this look good" but:
- Does this asset reinforce or dilute our positioning? (required answer + reasoning)
- Is the outcome metric realistic and measurable?
- Is there a claim here we can't substantiate?
- Would I buy from this?
- Is there a competitor who could say exactly this without changing anything? (if yes, it's generic)

**Output:** `CAMPAIGNS/<slug>/05-REVIEW.md` with reviewer decisions logged with reasoning.

### Phase 6 — Fix
If Verify or Review flagged issues, Fix phase executes targeted rewrites/reshoots/re-designs. Fix is not "ask Claude to try again" — it's root-cause → specific rewrite brief → re-produce → re-verify. Each fix is tracked.

**Output:** `CAMPAIGNS/<slug>/06-FIX.md` with issue → root cause → fix → outcome.

### Phase 7 — Ship
Launch checklist: tracking installed, UTMs confirmed, funnel end-to-end tested, landing page live, analytics firing, team notified, monitoring alerts configured. Nothing launches without all boxes checked.

**Output:** `CAMPAIGNS/<slug>/07-SHIP.md` — the publish log with timestamps.

### Phase 8 — Measure
Against the outcome metric, not the output metric. Attribution windows per channel. Leading indicators tracked daily; outcome tracked at the measurement-window close.

**Output:** `CAMPAIGNS/<slug>/08-MEASURE.md` with outcome delta vs target, leading-indicator trajectory, and pass/fail verdict.

### Phase 9 — Learn
What worked? Why? What didn't? Why? The skill extracts specific lessons and proposes edits to `BRAND.md`, `ICP.md`, `CHANNELS.md`, `POSITIONING.md`, or `PLAYBOOKS/*` — each edit goes through a human-approval gate before being merged. Failures are preserved with explicit "this didn't work because ___" narratives.

**Output:** `CAMPAIGNS/<slug>/09-LEARN.md` + proposed diffs to reference files.

## 4. Reference files — the persistent state

Everything lives in `.marketing/` at the project root (mirroring GSD's `.planning/`). These files are the brain. They are loaded into every phase and are the only source of truth. The skill refuses to operate without them.

### 4.1 `POSITIONING.md` — the invariant
The most important file. Contains:
- Category definition (we are a ___ for ___)
- Core promise (the one thing we do better than anyone)
- Who we are NOT for (inverse ICP — explicit exclusions)
- Proof (the evidence that makes the promise credible)
- Words we use / words we never use
- Positioning statement (as a formal statement)
- Strategic narrative (the 5-minute pitch in prose)
- Drift log — every past time positioning was intentionally adjusted, with date and reasoning

The skill loads this into **every** phase. Any asset that doesn't reinforce positioning is flagged. Deviation requires explicit human override logged with reasoning.

### 4.2 `BRAND.md` — voice, tone, proof
- Voice archetype (e.g., "pragmatic builder, not slick marketer")
- Tone per context (founder posts vs support email vs ad headline)
- Banned words/phrases ("revolutionary," "game-changing," etc. — enforced as a gate)
- Approved proof points (stats, case studies, customer names) with expiry dates
- Visual identity tokens
- Examples of "us" and "not us" copy

### 4.3 `ICP.md` — who we sell to
- Primary segment (JTBD, pains, triggers, buying process)
- Secondary segment(s)
- Anti-ICP (who we reject and why)
- Customer language library (verbatim quotes from interviews, reviews, Gong calls) — the most valuable dataset a marketing team owns
- Segment-by-channel affinity (which channels reach which segment)

### 4.4 `CHANNELS.md` — where we play and where we don't
- Active channels with current performance baselines
- Dormant channels with test history
- Banned channels (with reasoning)
- Channel-specific playbook links
- Budget allocation logic

### 4.5 `CALENDAR.md` — launches and always-on cadence
- Quarterly themes
- Launch calendar (product launches, campaign launches, event-tied pushes)
- Always-on cadence per channel (e.g., "3 LinkedIn posts/week, 1 newsletter/week, 1 YouTube/month")
- Blackout dates (company all-hands, industry quiet periods)

### 4.6 `COMPETITORS.md` — the positioning map
- Direct competitors + their positioning
- Adjacent competitors
- Category narratives (who owns what story)
- Share of voice baseline (social mentions, SERP position, AI-answer citations)
- Weekly competitor asset monitoring log

### 4.7 `METRICS.md` — the scorecard
- Primary outcome metric (the single most important number)
- Secondary outcome metrics
- Leading indicators per channel
- Baselines + targets per quarter
- Attribution model notes

### 4.8 `STATE.md` — cross-session memory
- Decisions in flight
- Blockers
- In-progress experiments with ETA
- Recent lessons (last 30 days)
- "What we're *not* doing right now and why"

### 4.9 `LEARNINGS.md` — the compound wisdom
- Every campaign → outcome delta → lesson
- Failure taxonomy (positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue)
- Pattern extraction — winning hooks, winning angles, winning formats

### 4.10 `PLAYBOOKS/` — discipline-specific runbooks
Each marketing discipline (SEO, AEO, YouTube, affiliate, etc.) has its own playbook with channel-specific checks, templates, and gates. These are loaded into the Produce and Verify phases when relevant.

### 4.11 `CAMPAIGNS/<slug>/` — per-campaign state
Every campaign creates a dated, slugged folder. All nine phase outputs live here. After measure + learn, the folder becomes an archived record that `LEARNINGS.md` references.

## 5. Quality gates — the wall every asset passes through

These run automatically in the Verify phase. Each gate is a discrete check with pass/fail + specific line-level feedback. Gates are additive per discipline — the base gates apply to everything; discipline playbooks add their own.

### 5.1 Base gates (every asset)

| Gate | What it checks | Fail → |
|------|---------------|--------|
| **Positioning drift** | Does this asset reinforce `POSITIONING.md`? Does it use language a competitor could use unchanged? | Rewrite with positioning anchor explicitly called out |
| **Claim accuracy** | Is every factual / numeric claim substantiated by an approved proof point in `BRAND.md`? | Remove or replace claim; update proof library if needed |
| **Voice drift** | Does tone match `BRAND.md` voice archetype? Banned words present? | Regenerate with voice guide prepended |
| **Outcome alignment** | Is this asset tagged with a specific outcome metric, not just an output? | Reject; force outcome specification |
| **Funnel integrity** | Does CTA → next step → conversion path work end-to-end? | Fix broken link / missing page / misrouted UTM |
| **UTM hygiene** | Correct source/medium/campaign/content per schema in `CHANNELS.md` | Auto-correct UTM |
| **Compliance** | Legal/regulatory claims (health, finance, etc.), required disclaimers, PII handling | Add disclaimer or escalate to legal |
| **Competitor collision** | Does this asset read like a competitor's content? Have we accidentally borrowed their frame? | Regenerate with differentiation forced |
| **ICP fit** | Does the hook speak to the ICP segment in `ICP.md`? Or is it generic/aspirational? | Rewrite with verbatim customer language |
| **Format correctness** | Platform-specific format respected (Twitter char limit, LinkedIn carousel ratios, YouTube thumbnail safe zones, email dark-mode) | Auto-fix or regenerate |

### 5.2 Discipline-specific gates (examples)

**SEO:**
- Title tag + H1 keyword alignment, search-intent match
- Schema.org markup present and valid
- Internal-link density and target-page relevance
- Core Web Vitals budget (LCP, CLS, INP)
- Thin-content detection for pSEO pages (unique value per page > threshold)

**AEO:**
- Contains at least 3 quote-worthy sentences (short, definitive, attributable)
- FAQPage / HowTo schema where applicable
- Author/expert markup resolves to a real person with proven authority
- Cross-domain fact consistency check (LinkedIn, Wikipedia, G2, company site)

**Paid ads:**
- Ad-to-landing-page message match (headline, hero, offer consistent)
- Creative variety across variants (not A/A testing)
- Audience-creative fit (B2B creative to B2B audience, not consumer)
- Bid strategy matches outcome metric

**YouTube:**
- Thumbnail contrast/clutter/face-presence heuristics
- Hook in first 5 seconds
- Description SEO + timestamps + end-screen CTA
- Title + thumbnail click-fit (no baiting)

**Social:**
- Opener hook does not start with "I" (LinkedIn), isn't a rhetorical question (X/Twitter)
- Native content vs. link-posting appropriate for channel
- Visual asset aspect ratios correct
- Reply path considered (who would reply, what do we say back?)

**Affiliate:**
- Creative kit completeness (swipe, banners, video, comparison copy)
- Attribution / cookie logic tested
- Commission structure sanity (LTV / CAC math checks)

**Email:**
- Subject-line + preview-text spam-trigger scan
- Dark-mode rendering check
- Unsubscribe + physical address present
- Deliverability (SPF, DKIM, DMARC, content-to-image ratio, link reputation)

### 5.3 Meta-gates (run on the whole campaign, not per asset)

- **Portfolio balance:** does this campaign leave us over-indexed on one channel? Under-represented in AEO / YouTube?
- **Calendar collision:** are we shipping 5 assets this week when our audience can only absorb 2?
- **Theme consistency:** do all assets across channels tell the same story, or are we fragmenting the narrative?
- **Learning plan:** does this campaign have a hypothesis we're testing, or is it pure execution without insight generation?

## 6. Positioning as invariant — in detail

This is the single most important design decision. Positioning drift kills marketing organizations by a thousand small concessions. The skill treats `POSITIONING.md` as read-only during campaign execution — you cannot edit it from within a campaign. Editing positioning requires its own dedicated phase (`/mkt-positioning-shift`) that forces:

1. Explicit reasoning for the shift (what changed — market, product, customer, competitor?)
2. A migration plan for existing assets (which assets break under the new positioning?)
3. A deprecation schedule for old language
4. A review gate that requires the founder / CMO / equivalent to approve

Within any campaign, if an asset deviates from positioning, the skill generates a **Deviation Report** with three options:
- **Correct:** rewrite asset to match positioning (default)
- **Accept + log:** acknowledge this asset is off-positioning, log it as an intentional exception, proceed to ship
- **Escalate to positioning shift:** this deviation suggests positioning needs to change — run `/mkt-positioning-shift`

The skill is opinionated: it suggests which of the three to choose based on a decision tree (how many recent exceptions? how confident is the customer-language data? is the market moving away from current positioning?).

The skill also runs a **monthly positioning audit** that samples 20 recent assets and reports:
- % on-positioning
- Types of drift (what's being substituted for our positioning?)
- Whether drift is bleeding into customer-facing materials
- Whether the market's response to drift is negative, neutral, or positive

## 7. Outcome over output — in detail

Every asset is tagged with two metrics:

- **Output metric:** what the asset produces on its own channel (impressions, clicks, installs, sends, opens, watch time, rankings, citations)
- **Outcome metric:** what the asset contributes to the business goal (pipeline ₹, qualified signups, activated users, retained customers, revenue, category awareness)

The skill **refuses to ship** any asset without both metrics specified. If the outcome metric isn't measurable (e.g., "brand awareness" with no concrete tracking), the skill forces a proxy (e.g., "branded search volume lift of 15% in 60 days measured via GSC").

**The Measure phase is output-blind by default.** It reports outcome first. Output is shown only as a leading indicator. A campaign that hits its output metric but misses its outcome metric is logged as a failure in `LEARNINGS.md` and triggers a root-cause investigation. A campaign that misses output but hits outcome is logged as a learning about attribution models.

**Attribution pragmatism:** the skill uses last-touch, linear, and time-decay attribution in parallel and reports all three. It explicitly flags attribution ambiguity ("this outcome could be from this campaign or from the newsletter sent the same week") instead of papering over it.

## 8. Fix as you go — in detail

Fix is not retry. Retry is "ask Claude to regenerate the asset." Fix is:

1. **Root cause:** why did this asset fail verify/review? Was it a positioning drift, a weak hook, a channel-mismatch, a stale proof point, a broken funnel? The skill produces a one-line diagnosis per failed gate.
2. **Fix brief:** a new, narrow instruction that addresses the root cause specifically. Not "make it better" but "rewrite paragraph 2 to lead with the customer quote from `ICP.md` line 47 instead of the product feature."
3. **Re-produce in isolated context:** a fresh 200K context loaded with the original brief + the fix brief + the failed asset + the relevant playbook section.
4. **Re-verify:** run the same gates again. If still failing, escalate to human review rather than looping.

Failed-fix loops are capped at 3 attempts before the skill stops and says "this needs a human." This prevents context exhaustion and silent degradation.

**Root-cause library:** `LEARNINGS.md` maintains a root-cause taxonomy. Every fix feeds the library. Over time, the skill learns patterns — e.g., "when we write LinkedIn posts for the enterprise ICP, we systematically drift into founder-brand voice; always pre-load the enterprise voice guide."

## 9. Slash commands — the UX surface

Modelled on GSD's `/gsd-*` pattern. Names are provisional.

### 9.1 Campaign lifecycle
- `/mkt-new-campaign <slug>` — initialize `CAMPAIGNS/<slug>/`, prompt for goal + ICP + channel mix
- `/mkt-research <slug>` — Phase 1
- `/mkt-brief <slug>` — Phase 2
- `/mkt-produce <slug> [--wave N]` — Phase 3, wave-parallel
- `/mkt-verify <slug>` — Phase 4
- `/mkt-review <slug>` — Phase 5
- `/mkt-fix <slug> [--asset <id>]` — Phase 6
- `/mkt-ship <slug>` — Phase 7 with launch checklist
- `/mkt-measure <slug>` — Phase 8
- `/mkt-learn <slug>` — Phase 9

### 9.2 Reference-file management
- `/mkt-init` — scaffold `.marketing/` with templates for all 11 reference files
- `/mkt-positioning-check` — sample N recent assets, run positioning audit
- `/mkt-positioning-shift` — dedicated phase for updating `POSITIONING.md`
- `/mkt-brand-refresh` — update `BRAND.md` with new proof points / deprecate expired ones
- `/mkt-icp-refresh` — update `ICP.md` from new customer calls / reviews
- `/mkt-competitor-scan` — weekly competitor asset + SoV snapshot

### 9.3 Discipline quick-actions
- `/mkt-seo-audit` — technical + content SEO audit of a URL or sitemap
- `/mkt-aeo-check <query>` — run a query across ChatGPT / Claude / Perplexity / Gemini / Google AI Overviews and log citation status
- `/mkt-keyword-map` — generate keyword cluster map with intent tags
- `/mkt-thumbnail-test` — generate N thumbnail variants for A/B test
- `/mkt-email-preflight` — deliverability + dark-mode + spam-trigger scan
- `/mkt-affiliate-kit` — generate creative kit for affiliate partners
- `/mkt-repurpose <source-asset>` — fan out long-form → derivative assets across channels

### 9.4 State and recovery
- `/mkt-state` — show `STATE.md` decisions, blockers, in-flight experiments
- `/mkt-resume <slug>` — resume a paused campaign at its last phase
- `/mkt-archive <slug>` — finalize + move to archive, update `LEARNINGS.md`
- `/mkt-health` — portfolio-level check: are we over-indexed anywhere, under anywhere?

## 10. Naming options

Ranked by fit:

1. **GTM-GSD** — most descriptive; piggybacks GSD brand recognition; tells users immediately what it is
2. **Broadside** — naval term for a coordinated full-firepower push; evokes ship + loud + synchronized; unique, memorable
3. **Megaphone** — obvious marketing metaphor; shorter, friendly; slight risk of sounding too shouty for B2B
4. **Ship Loud** — mirrors "get shit done" verb-first energy; "ship" = ship assets + ship launches; "loud" = marketing visibility
5. **Hustle** — matches GSD vibe; vague meaning; risk of sounding spammy
6. **Launchcraft** — sounds like a product name; "craft" hints at quality
7. **Press** — short, print-heritage reference, "go to press"; too generic
8. **AmplifyOps** — clear but corporate-flavored

My pick: **Broadside**. Memorable, unique, evokes exactly the right "coordinated full-firepower marketing push" feel. **GTM-GSD** as a fallback if you want ecosystem-legibility over distinctiveness.

## 11. Build plan — MVP to GA

### 11.1 MVP (weekend project)
- `skills/broadside/SKILL.md` (or chosen name) with `/mkt-init`, `/mkt-new-campaign`, `/mkt-brief`, `/mkt-produce`, `/mkt-verify`, `/mkt-ship` only
- `.marketing/` templates for 5 reference files (POSITIONING, BRAND, ICP, CHANNELS, STATE)
- 3 base quality gates (positioning drift, claim accuracy, voice drift)
- 1 playbook (pick one: LinkedIn posts OR SEO content) as the depth test
- Outcome metric enforced at brief time
- Run on one real campaign (for ngram or a side project) to validate

### 11.2 V1 (2-4 weeks)
- All 9 phases
- All 10 base gates
- Playbooks for SEO, AEO, LinkedIn, YouTube, Email
- `POSITIONING.md` audit command
- Measurement phase with 3-attribution-model report
- `LEARNINGS.md` root-cause library seeded

### 11.3 V2 (quarter+)
- Affiliate, paid ads, PR playbooks
- Cross-campaign portfolio health view
- Automated competitor scan (weekly cron via a separate skill)
- AEO citation tracker (crawl the top 50 target queries weekly across 5 engines)
- Integration hooks for Google Analytics, Search Console, HubSpot, Customer.io, Rewardful

### 11.4 Dogfood loop
Run Broadside on Broadside itself — build a marketing campaign using the tool, ship it, measure what worked. Every iteration improves the playbooks and gates with real data.

## 12. What this is NOT

- Not a content generator. Content is the output; the point is the outcome.
- Not a replacement for a marketer. It is the operating system a marketer uses to ship more, drift less, and compound learnings.
- Not a one-shot prompt. State is the value. Reference files are the compound interest.
- Not a reporting dashboard. It writes reports; it does not replace your analytics stack.
- Not a scheduler. It briefs + produces + verifies; it hands off to your existing publishing tools (Buffer, Notion, Ghost, WordPress, ActiveCampaign, etc.).

## 13. Open questions to resolve before building

1. **Context for what?** Is this for ngram specifically, a side project, or a general-purpose skill reusable across products? This shapes whether `POSITIONING.md` is fixed-per-install or swappable-per-campaign.
2. **Solo or team?** If team, how do we handle concurrent edits to state files? (Git is the default answer; do we need locks?)
3. **Measurement integrations.** Do we integrate analytics directly via MCP servers / APIs, or do we stay read-only and require manual paste? MVP: manual paste. V2: MCP integrations.
4. **The AEO citation tracker.** This is a separate cron-style skill (like deep-tech-ideas runs daily). Is that in-scope for Broadside or a sibling skill?
5. **Creative asset generation.** Does Broadside generate final-quality copy and design, or only briefs + drafts that humans finalize? MVP: drafts + specs. V2: finished assets with design-tool integration.
6. **Positioning ownership.** Who can edit `POSITIONING.md`? Founder-only? Anyone with a PR-and-review? The enforcement mechanism shapes the whole system.

## 14. Feedback
<!-- Rishi: add thoughts, rejections, additions here. -->