---
discipline: paid-ads
asset_types: [facebook-ad, google-search-ad, linkedin-ad]
version: "2.0"
---

# Paid Ads Discipline Playbook -- Dennis Yu's Dollar-a-Day

This playbook extends the base playbook contract (`base.md`) with paid advertising-specific production guidance, discipline gates, and format rules. It is loaded by ttm-producer during content generation and parsed by ttm-verify for gate evaluation.

The framework: **Dennis Yu's Dollar-a-Day** -- spend $1/day per ad to discover signal, scale only the winners, and never run a new ad creative that has not already proven itself organically. Combined with the **3×3 Content Grid** (3 audiences × 3 funnel stages = 9 ad sets), this is the testing protocol an engineer can run on a credit card and an evening.

If you came here to spend $5,000 a day on a single cold-audience video your agency just produced: close this file. That is not what we do.

---

## Production Guidance

### Dollar-a-Day: Test Cheap, Scale Winners

Every paid-ads campaign starts at **$1/day per ad**. One dollar. Not one hundred. Not five hundred. One.

The reason is not frugality -- it is signal. At $1/day, you can run 30 ads for $30/day total and let the platform tell you which 3 are working. At $100/day per ad, you can run one ad and learn one thing, expensively, while burning cash on five other ads that were going to lose anyway. Engineers already know this pattern: it is `git bisect` for ad creative. Test a wide surface area at near-zero cost, then concentrate spend on the commits that didn't break the build.

Concrete rules:

- **Test phase: $1/day per ad, for 7 days minimum.** Less than a week is statistical noise. More than two weeks without scaling means you have no winners and should kill the set.
- **Scale ladder: $1 → $30 → $100 → $300 per day.** A winner at $1/day earns $30/day for the next 30 days. Still winning? $100/day. Still winning? $300/day. Each step is a new test -- if the metric breaks at $30, do not go to $100.
- **Never scale a loser.** "Give it time" is the most expensive sentence in paid ads. If it lost at $1/day, it loses at $100/day -- you just lose 100× faster.

This is not about being cheap. It is about being honest with your money.

### The 3×3 Content Grid: 3 Audiences × 3 Stages

Every campaign produces **9 ad sets** before launch. The grid:

|                  | Cold (Awareness)         | Warm (Engagement)        | Hot (Conversion)              |
|------------------|--------------------------|--------------------------|-------------------------------|
| **Audience A** (broadest interest) | Awareness ad for A      | Engagement ad for A       | Conversion ad for A            |
| **Audience B** (look-alike / mid) | Awareness ad for B      | Engagement ad for B       | Conversion ad for B            |
| **Audience C** (retargeting / hot) | Awareness ad for C      | Engagement ad for C       | Conversion ad for C            |

A campaign with only conversion ads to cold audiences is what Dennis calls "well-running-dry funnel design" -- you cannot harvest leads from an audience that doesn't know you. A campaign with only awareness ads is a charity. You need all 9 cells -- the awareness ads feed the engagement ads, the engagement ads feed the conversion ads. This is the **Brand → Demand → Lead → Sale (BDLS) flywheel**.

Every ad in the brief must be tagged with its **(audience, stage)** cell. If you cannot place an ad on the 3×3 grid, the ad does not belong in the campaign.

### Boost Organic Winners; Do Not Make Net-New Ad Creative

Pure-ad creatives almost never win. The ones that do are *boosted organic content* -- posts that already performed on your feed, that already proved a human voice resonated, that the platform already has engagement data on.

The workflow:

1. Inventory your organic content from the last 30-90 days (posts, videos, threads, founder LinkedIn updates).
2. Filter for posts with above-median organic engagement on their channel.
3. Boost those exact posts at $1/day to a defined audience.
4. Do **not** rewrite, do not "make it more ad-like," do not add a hard CTA on top. Let the original post run.

This is the "**Goose-and-Gander**" principle: the same voice that worked organically is the only voice you should pay to amplify. Pristine ad-agency creative shot in a studio loses to a founder's iPhone-recorded explainer video, every time, because the audience can smell the difference between humans and brands.

If a campaign brief proposes new creative that has never been posted organically, the answer is: post it organically first, measure for 3-7 days, then decide if it earns ad budget.

### Goldilocks Audience Sizing: 1M–10M

Audience too small (<1M) → no learning signal, the platform can't optimize, your $1/day buys nothing.
Audience too large (>10M) → your $1/day spreads to noise, no concentration.
Audience just right (1M–10M) → the platform has room to find the right people without diffusing your signal.

For each ad set in the 3×3 grid, declare the targeting and the estimated audience size before launch. Audiences outside the Goldilocks band are flagged.

### Platform-Agnostic, Mechanics-Specific

The Dollar-a-Day strategy works the same on Meta, TikTok, LinkedIn, YouTube, and Google -- the strategy is platform-agnostic. The *mechanics* are platform-specific:

- **Meta / Facebook:** Boost organic posts directly. Audience builder + lookalikes. Cheapest CPM, best for B2C and SMB B2B.
- **LinkedIn:** Sponsor founder posts and document posts. Higher CPM (~$30-80) but tighter B2B targeting. Still test at $1-5/day -- LinkedIn's minimum is higher than Meta's.
- **Google Search:** Intent-driven, not interest-driven. Same scale ladder ($1→$30→$100→$300), but tested by keyword cluster, not by creative. Each keyword cluster is its own ad set.

Whatever the platform, the rules don't change: test cheap, boost organic, scale winners, cover the 3×3 grid.

---

## Discipline Gates

### DISC-PAID-ADS-01: Dollar-a-Day Test Spend Cap -- Tier 1

**Checks:** Test-phase ads are budgeted at $1/day per ad (within Dollar-a-Day tolerance) and have not been scaled prematurely.
**Against:** Ad brief budget table per ad set, campaign phase declaration.

#### Evaluation Criteria

1. **Per-ad daily budget in test phase**
   - PASS: Every ad in the test phase is budgeted at $1-$5/day (LinkedIn allowed up to $10/day given platform minimums), and the brief explicitly labels the phase as "test"
   - WARN: Budget is $5-$15/day per ad without a stated reason, or the test/scale phase is unlabeled
   - FAIL: Any test-phase ad is budgeted above $15/day, or the campaign launches at $100+/day per ad with no prior $1/day testing data

2. **Scale ladder declared**
   - PASS: Brief states the scale ladder explicitly (e.g., "$1/day for 7 days, then $30/day if CTR > X, then $100/day if CPL < Y")
   - WARN: Scale ladder mentioned but thresholds for advancing tiers are not numerical
   - FAIL: No scale ladder; brief jumps from test directly to "$500/day for launch week" with no in-between

### DISC-PAID-ADS-02: 3×3 Grid Coverage -- Tier 1

**Checks:** Each ad in the campaign maps to exactly one (audience, stage) cell of the 3×3 grid, and the grid has awareness coverage.
**Against:** Ad brief campaign matrix.

#### Evaluation Criteria

1. **Per-ad grid cell assignment**
   - PASS: Every ad is tagged `(audience: cold|warm|hot, stage: awareness|engagement|conversion)` and lands in exactly one cell of the 3×3 grid
   - WARN: Most ads are tagged but 1-2 are unlabeled or span multiple cells
   - FAIL: Ads are not tagged by audience or stage, or the brief has no grid declared

2. **Awareness layer presence**
   - PASS: At least one ad in the campaign targets a cold audience at the awareness stage (top of the BDLS flywheel)
   - WARN: Cold-awareness exists but is severely underweighted (<10% of campaign budget) -- the well will run dry
   - FAIL: Campaign is 100% conversion ads to warm/hot audiences with no awareness layer feeding it

### DISC-PAID-ADS-03: Boosted Organic Creative -- Tier 1

**Checks:** Ad creative is repurposed organic content with documented organic performance, not net-new ad-only material.
**Against:** Per-ad creative provenance and organic engagement reference.

#### Evaluation Criteria

1. **Organic provenance**
   - PASS: Each ad creative is an existing organic post (link or post ID supplied) that has run on the channel for at least 3 days with above-median engagement on that account
   - WARN: Creative is repurposed from organic content but engagement data is not cited, or the post is less than 3 days old
   - FAIL: Creative is net-new, produced specifically for the ad, never posted organically -- spending dollars to validate something free posting could have validated first

2. **Original voice preserved**
   - PASS: The boosted post matches the original organic post (same copy, same media); ad version adds nothing the audience did not already see organically
   - WARN: The post has been lightly edited from organic (added one CTA line) -- acceptable but flagged
   - FAIL: The post has been rewritten into "ad voice" with stock imagery, hard CTAs, and corporate polish that the organic post did not have

### DISC-PAID-ADS-04: Hook-and-Voice Authenticity -- Tier 2

**Checks:** Ad hook reads as something a human actually said on this account -- the Goose-and-Gander check. If the founder wouldn't post it organically, they shouldn't pay to amplify it.
**Against:** Ad copy hook (first 125 chars on Meta, first 150 on LinkedIn, headline on Google).

#### Evaluation Criteria

1. **Hook in ≤125 characters**
   - PASS: Hook lands within the first 125 chars (Meta above-fold cutoff) and makes a single concrete promise or asks a single concrete question
   - WARN: Hook lands but slightly exceeds 125 chars on Meta or 150 chars on LinkedIn -- truncation likely
   - FAIL: No hook in the first 125 chars (lede buried), or the "hook" is generic brand throat-clearing ("We are excited to announce…")

2. **Voice consistency with the account**
   - PASS: A reader of the founder's organic feed would recognize the ad as written by the same person -- same vocabulary, same cadence, same level of polish
   - WARN: Voice is similar to the organic feed but noticeably more polished or more corporate
   - FAIL: Voice is unrecognizable from organic content; reads as agency-produced or ChatGPT-default-tone

### DISC-PAID-ADS-05: Goldilocks Audience Sizing -- Tier 2

**Checks:** Each ad set's targeted audience falls in the 1M–10M sweet spot for testing on Meta-style platforms (with platform-appropriate adjustments).
**Against:** Per-ad-set targeting definition and platform-reported audience size estimate.

#### Evaluation Criteria

1. **Audience size band**
   - PASS: Each ad set targets an audience between 1M and 10M (Meta/TikTok), or 50K-2M for LinkedIn given its smaller pool, with the estimated size declared in the brief
   - WARN: Audience is outside the band by ≤30% (e.g., 700K on Meta, 12M on Meta) with a stated reason
   - FAIL: Audience is <100K or >50M, or no estimated audience size is declared in the brief

2. **Targeting basis is declared**
   - PASS: Each ad set declares targeting basis (interest, lookalike %, custom audience source, keyword cluster for Google) and what cell of the 3×3 grid it serves
   - WARN: Targeting basis is declared but rationale for size is missing
   - FAIL: Targeting is "broad" or undeclared -- no learning signal possible

### DISC-PAID-ADS-06: Scale-on-Winners Discipline -- Tier 2

**Checks:** Scale decisions are tied to numerical thresholds, not vibes; losers are killed not "given time."
**Against:** Brief's scaling rules and kill criteria.

#### Evaluation Criteria

1. **Win/kill thresholds defined**
   - PASS: Brief states numerical PASS thresholds (e.g., "CTR ≥ 1.5% AND CPL ≤ $X to advance from $1/day to $30/day") and numerical kill thresholds (e.g., "kill if CTR < 0.5% after 7 days at $1/day")
   - WARN: Thresholds exist but only for scaling, not for killing -- losers will linger
   - FAIL: No numerical thresholds; scaling decisions are described qualitatively ("if it's doing well…")

2. **Review cadence**
   - PASS: Brief specifies a review cadence (e.g., "review every 7 days, hard cutoff at day 14 for any ad with no winner signal")
   - WARN: Review cadence stated but no hard cutoff date for non-performers
   - FAIL: No review cadence -- ads will run forever on autopilot

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-05 (Funnel Integrity) | Tier 2 | Tier 1 | Every paid click costs money. A broken funnel at $1/day is annoying; a broken funnel at $300/day is a fire. The funnel must be verified before launch. |
| GATE-06 (UTM Hygiene) | Tier 2 | Tier 1 | Dollar-a-Day requires per-ad-set ROAS attribution to identify winners. Missing or duplicate UTMs make the scale ladder unmeasurable -- you can't promote a winner you can't see. |

---

## Format Rules

### Meta / Facebook (Boosted Post Format)

```
Post type: Boosted existing organic post (post ID required in brief)
Primary text: {original organic post copy -- DO NOT REWRITE for ad voice}
  Hook in first 125 chars (above "See more" fold)
Media: Original post's image/video -- do not swap for stock
CTA button: Optional. Default "Learn More" or "Sign Up"; omit on awareness ads
Budget: $1/day in test phase
Audience: 1M-10M people
Placement: Auto (let the platform decide)
```

### LinkedIn (Sponsored Founder Post)

```
Post type: Boost existing organic post from founder's personal profile or company page
Intro text: {original post copy -- 150 chars above fold}
Headline: ≤70 chars
Media: Native LinkedIn document, carousel, or video from the original post
CTA button: Optional; omit on awareness ads
Budget: $5-$10/day in test phase (LinkedIn platform minimum)
Audience: 50K-2M (LinkedIn's pool is smaller than Meta's)
```

### Google Search Ads (Intent-Tested, Not Creative-Tested)

```
Ad group structure: 1 ad group per intent cluster (e.g., "comparison queries", "high-intent buyer queries", "problem-aware queries")
Headlines: 3-15 variations per ad (30 chars each), let RSA test combinations
Descriptions: 2-4 variations (90 chars each)
Budget: $1/day per ad group in test phase
Bidding: Manual CPC for test, switch to Target CPA only after $1/day phase identifies winners
Negative keywords: Required before launch -- exclude branded competitors, irrelevant intent terms
```

### Creative Constraint (All Platforms)

| Constraint | Rule |
|------------|------|
| Mobile-first | All creative reviewed on a phone screen first. Desktop preview is secondary. |
| Hook length | ≤125 characters above the fold on Meta; ≤150 on LinkedIn; in Headline 1 on Google. |
| Text overlay (Meta) | ≤20% of image area (legacy rule, still affects reach). |
| Vertical video | 9:16 for all video placements in 2026 -- Reels, Shorts, Stories, TikTok. |

---

## Examples

### Good: Dollar-a-Day Campaign Brief (Meta, B2B SaaS)

```
Campaign: takeToMarket launch -- 3x3 test
Phase: Test ($1/day per ad, 7 days)
Total daily spend: $9/day (9 ad sets × $1)

3x3 Grid:
  Cold-Awareness:    Boost founder's "what I built in 4 weekends" post (organic CTR: 4.2%)
  Cold-Engagement:   Boost demo video that hit 12K organic views
  Cold-Conversion:   Boost "ship in 9 phases" carousel (organic comments: 47)
  Warm-Awareness:    Same posts, retargeted to past site visitors
  Warm-Engagement:   Same posts, retargeted to past site visitors
  Warm-Conversion:   Same posts, retargeted to past site visitors
  Hot-Awareness:     Light-touch update post, retargeted to email subscribers
  Hot-Engagement:    "What's new" thread, retargeted to email subscribers
  Hot-Conversion:    "Get 50% off" offer post, retargeted to email subscribers

Scale ladder:
  $1/day → $30/day if (CTR ≥ 1.5% AND CPL ≤ $40) after 7 days
  $30/day → $100/day if metrics hold for 14 days
  $100/day → $300/day if metrics hold for 30 days

Kill criteria:
  Any ad with CTR < 0.5% after 7 days at $1/day → kill, do not scale.
  Any ad with no conversion at $30/day after 14 days → kill.

Audience sizing:
  Cold: 4.2M people (developer-adjacent interests)
  Warm: 38K site visitors over 90 days
  Hot: 1,200 email subscribers
```

Why it works: 9 ad sets across the full 3×3 grid. Every ad is a boosted organic post with cited engagement. Budget starts at $9/day total. Scale ladder is numerical. Kill criteria are explicit. Audiences are sized.

### Bad: The Agency $10K-Day Cold Campaign

```
Campaign: Big Launch Week
Total daily spend: $10,000/day
Creative: One agency-produced 30-second hero video, never posted organically.
Audience: 50M people, "all marketers"
Bidding: Conversion-optimized, target CPA $50
Phase: Skipping test, going straight to scale.
Kill criteria: None stated.
```

Why it fails: Single new creative with no organic validation -- $10K to learn what $1/day would have learned. Audience is 50M (off the Goldilocks chart -- signal will spread to noise). No 3×3 grid -- one ad, one cell. No scale ladder (already at the top). No kill criteria. By Friday, the campaign has spent $50K and produced a "we need more time" Slack message.

### Good: The Boosted Founder Tweet

```
Original post: Founder's LinkedIn post -- "I shipped 9 paid-ads frameworks this month, here's what stuck."
  Organic stats: 23K impressions, 4.8% CTR, 312 comments over 5 days.
Boost: $1/day for 7 days to a 2M-person developer-tooling audience.
Hook (first 125 chars): "I shipped 9 paid-ads frameworks this month, here's what stuck. (3 worked, 6 didn't. Here's the rule that separated them.)"
Media: Original carousel from the post.
CTA: None -- awareness stage, no hard CTA needed.
```

Why it works: Organic provenance documented. Hook in first 125 chars. Voice = founder's actual voice. $1/day budget. Goose-and-Gander principle honored.

### Bad: The "Ad-Voice" Rewrite of an Organic Winner

```
Original post: Founder tweet -- "Stop guessing at marketing. Use a quality gate."
  Organic stats: 18K impressions, 5.1% CTR.
Boost version (rewritten by agency):
  "Introducing takeToMarket -- the revolutionary AI-powered marketing platform
   that empowers go-to-market teams to ship campaigns with confidence.
   Schedule your demo today!"
Media: Stock photo of a team high-fiving.
```

Why it fails: Original was a 9-word punchy line in the founder's voice. Rewrite is corporate filler with no hook. Stock imagery replaces what the organic audience already responded to. The boost spends money to make the post *less* effective than it was for free.

---

## Anti-Patterns

1. **Skipping the $1/day test, launching at $100+/day per ad** -- The most expensive shortcut in paid advertising. If the creative doesn't work, you lose 100× more. If it does work, you would have found out at $1/day anyway. Test cheap is non-negotiable.

2. **All conversion ads, no awareness layer** -- The funnel runs dry. Conversion ads only convert people who already know you. Without an awareness layer feeding the pipeline, you exhaust your warm audience in weeks and CPL skyrockets.

3. **Net-new ad creative that has not been posted organically** -- You are spending money to test what you could have tested for free. Post it organically first. If it bombs organically with zero spend, paid spend will not save it.

4. **Agency-produced ad voice on a founder account** -- The audience can tell. Corporate-polished creative on a personal-brand account triggers a "this isn't really her" reflex and CTR collapses. Goose-and-Gander: if the founder wouldn't post it organically, don't pay to amplify it.

5. **Audience too broad ("all marketers", "small businesses")** -- 50M-person audiences spread $1/day across noise. The platform can't optimize. Target tightly: 1M-10M for Meta, 50K-2M for LinkedIn.

6. **"Give it time" on a losing ad** -- 7 days at $1/day is enough signal. Two weeks is excessive. If CTR is below 0.5% at $1/day, it will be below 0.5% at $100/day -- you'll just lose 100× faster. Kill losers on schedule.

7. **No 3×3 grid -- ad sets pointing at the same cell** -- Running three "cold-conversion" ads with no awareness or engagement layer is not a campaign, it's a scattergun. Place every ad on the grid before launch.

8. **Scaling a winner straight from $1 → $300/day** -- The ladder exists because each step is its own test. Performance at $1/day does not guarantee performance at $300/day. Step through $30, $100, then $300, validating at each rung.

9. **No UTM hygiene per ad set** -- You cannot identify which ad won if every ad shares the same UTM. ROAS attribution per (audience, stage) cell is the whole point of the 3×3 grid.

---

## Metrics

Track these indicators for paid ad campaigns after launch. The Dollar-a-Day framework measures by 3×3 cell, not by overall campaign aggregate -- aggregates hide which cells are winning and which are losers being subsidized.

- **CPM by 3×3 cell** -- Cost per thousand impressions per (audience, stage) cell. Cold-awareness CPM should be lowest; hot-conversion CPM is allowed to be highest. Diverging from this hierarchy indicates targeting or creative mismatch.
- **CTR by 3×3 cell** -- Click-through rate per cell. PASS threshold per cell varies: cold-awareness >1.5%, warm-engagement >2.5%, hot-conversion >4%. Lower-than-expected CTR at a cell signals a creative-audience mismatch for that cell specifically.
- **Cost per lead (CPL) by 3×3 cell** -- Per-cell lead acquisition cost. The conversion-stage cells should produce the lowest CPL; awareness cells produce few or no leads (that's expected -- their job is feeding the funnel).
- **ROAS by 3×3 cell** -- Revenue per ad dollar, per cell. Only conversion-stage cells will have meaningful ROAS. Aggregate-only ROAS lies because the awareness cells (with $0 revenue) drag the number down even when they're doing their job.
- **Scale-ladder progression rate** -- What % of $1/day ads earn promotion to $30/day? What % survive to $100/day? Healthy campaigns promote ~10-30% of $1/day ads; >50% means thresholds are too loose, <5% means thresholds are too tight (or creative inventory is weak).
- **Frequency** -- Average impressions per user per ad set. Above 3-5/week per cold audience = creative fatigue is incoming, refresh from the organic inventory.
- **Quality score (Google) / Relevance ranking (Meta)** -- Platform-assigned creative-audience-fit scores. Low scores at a cell mean the boosted post does not match the audience -- usually a Goose-and-Gander violation.
- **Organic-to-paid lift ratio** -- For each boosted post, paid CTR / organic CTR. Healthy boosts should be within ±30% of organic CTR. A boost performing far below organic is a signal the audience is wrong; far above suggests the organic post was under-distributed and the paid layer is just unlocking reach.

---

## Sources

- [Dennis Yu -- Dollar-a-Day category archive](https://dennis-yu.com/category/dollar-a-day/) -- The canonical home of the Dollar-a-Day strategy, with case studies and current updates from Dennis Yu directly.
- [Flowster -- Dennis Yu's $1/Day Strategy](https://flowster.app/dollar-a-day/) -- Step-by-step operationalization of the Dollar-a-Day framework with the scale ladder and 3×3 grid mechanics.
- [Bolder Future -- 30 Days with Dennis Yu's Dollar-a-Day](https://www.bolderfuture.com/blog/case-study-30-days-with-dennis-yus-dollar-a-day-ad-strategy) -- Practitioner case study running the strategy for 30 days, with metrics by cell.
- [Fitness Business Podcast -- Dollar-a-Day with Dennis Yu](https://fitnessbusinesspodcast.com/280-the-dollar-a-day-facebook-ad-strategy-with-dennis-yu/) -- Dennis explaining the strategy and the BDLS flywheel in his own words.
- [Hustle and Flowchart -- Dennis Yu on $1 ads](https://hustleandflowchart.com/how-to-build-a-recognizable-brand-using-1-ads-dennis-yu/) -- Goldilocks audience sizing and Goose-and-Gander principles, plus the scale-ladder discipline.
