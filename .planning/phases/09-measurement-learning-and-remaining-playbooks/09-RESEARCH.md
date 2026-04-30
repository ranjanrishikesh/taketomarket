# Phase 9: Measurement, Learning, and Remaining Playbooks - Research

**Researched:** 2026-04-30
**Domain:** Campaign measurement analytics, compound learning systems, discipline playbook authoring
**Confidence:** HIGH

## Summary

Phase 9 closes the takeToMarket feedback loop by implementing three interconnected capabilities: (1) measurement -- analyzing pasted analytics data against outcome metrics with attribution models, (2) learning -- extracting lessons that compound into reference file improvements, and (3) five remaining discipline playbooks (YouTube, Paid Ads, Affiliate, PR/Media, Events) plus meta-gates for portfolio-level verification.

The measurement and learning workflows follow the established thin-SKILL.md-to-workflow routing pattern. The key technical challenge is the multi-source analytics input (MCP tools, CSV/Markdown paste, structured batch questions) and the learn-to-reference loop where proposed edits require per-edit human approval gates. The five playbooks follow the Phase 8 base.md inheritance contract exactly -- same 7-section structure, same gate definition format, same 500-line limit.

Meta-gates integrate into the existing verify.md workflow as a Step 4c addition (after Step 4b discipline gates). They access cross-campaign data via `campaign list --raw` CLI and evaluate portfolio-level concerns. All four meta-gates are Tier 2 advisory per D-12.

**Primary recommendation:** Implement measure.md and learn.md workflows first (they form a sequential pair), then playbooks (independent of each other), then meta-gate integration into verify.md (touches existing file, do last to minimize merge risk).

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Multi-source analytics input -- three pathways: (1) MCP tool integration for analytics platforms (PostHog, Amplitude, GA4, etc.) when available, (2) CSV/Markdown paste for bulk data, (3) structured batch questions for guided collection. AI detects tool availability at runtime and routes accordingly.
- **D-02:** Batch questioning -- when using structured prompts, ask multiple metrics at once (not one question at a time). Group related metrics: "Paste your traffic metrics (page views, sessions, unique visitors)" rather than asking each individually.
- **D-03:** CSV/Markdown paste parsing -- accept pasted tables or CSV data. AI parses columns, maps to expected metric fields, and asks for clarification on unmapped columns.
- **D-04:** MCP tool detection follows the same runtime pattern as /ttm-research (Phase 3 D-03) -- detect WebSearch/WebFetch/analytics MCP tools, use if available, fall back to paste prompts if not.
- **D-05:** Outcome-first summary -- lead with outcome metric ("Did we hit the target?"), show result vs target, then present time-decay as the default attribution model. Last-touch and linear available on request but not shown by default. Less noise, faster to read.
- **D-06:** LIFE-15 compliance: outcome metric reported first, output metric second. The summary section opens with outcome, not impressions/clicks.
- **D-07:** Narrative + apply approach -- present lessons as natural language narratives ("Based on this campaign, your ICP segment should add 'mid-market SaaS teams' because..."), then ask "Apply this to ICP.md?" per lesson. More natural than diffs.
- **D-08:** Human approval gate per proposed edit -- each reference file edit requires explicit user confirmation before applying. No batch-apply without review.
- **D-09:** Proposed edits can target: BRAND.md, ICP.md, CHANNELS.md, POSITIONING.md (via /ttm-positioning-shift if locked), METRICS.md, COMPETITORS.md. Each edit includes reasoning from campaign data.
- **D-10:** Root-cause narratives -- failures logged to LEARNINGS.md with explicit root-cause from the 7-category taxonomy (positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue). Pattern extraction identifies winning hooks, angles, formats across campaigns.
- **D-11:** Meta-gates fire during /ttm-verify alongside quality gates. Not a separate command -- they are evaluated as part of the verify workflow extension.
- **D-12:** 4 meta-gates: portfolio balance (META-01), calendar collision (META-02), theme consistency (META-03), learning plan (META-04). All are Tier 2 advisory (not blocking).
- **D-13:** Meta-gates access cross-campaign data via `campaign list --raw` CLI to read all active campaign states, briefs, and asset types. They evaluate portfolio-level concerns, not single-asset concerns.
- **D-14:** Same depth as Phase 8 core playbooks -- follow the exact same template: 6-section structure (Production Guidance, Discipline Gates, Base Gate Overrides, Format Rules, Examples, Anti-Patterns, Metrics), 4-7 gates each, 250-350 lines. Same quality bar.
- **D-15:** All 5 playbooks follow `playbooks/base.md` inheritance contract from Phase 8.
- **D-16:** YouTube and Paid Ads are highest demand among the remaining 5. Affiliate, PR/Media, Events are lower frequency but get the same treatment.

### Claude's Discretion
- Exact gate definitions for the 5 remaining playbooks
- How meta-gates are wired into verify.md (inline or via reference file)
- Measurement template format for the paste pathway
- How /ttm-learn detects which reference files need updates (scan lesson content for keywords vs explicit mapping)
- LEARNINGS.md pattern extraction algorithm (frequency-based vs recency-weighted)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIFE-14 | `/ttm-measure` accepts manually pasted analytics data and analyzes against outcome metrics using last-touch, linear, and time-decay attribution models | measure.md workflow with 3-pathway input (D-01), 3 attribution models, outcome-first report |
| LIFE-15 | Measure phase reports outcome metric first, output metric second | D-05, D-06 enforce outcome-first ordering in measurement report template |
| LIFE-16 | `/ttm-learn` extracts lessons, proposes edits to reference files with human approval gate per edit | learn.md workflow with narrative + apply pattern (D-07), per-edit approval (D-08) |
| LIFE-17 | Learn phase logs failures with explicit root-cause narratives to LEARNINGS.md | D-10 root-cause taxonomy, learnings-extraction.md reference |
| PLAY-04 | YouTube playbook | Follows base.md contract, 250-350 lines, discipline-specific gates |
| PLAY-08 | Paid Ads playbook | Follows base.md contract, ad-to-landing-page checks, creative variety |
| PLAY-09 | Affiliate playbook | Follows base.md contract, attribution/cookie logic, LTV/CAC math |
| PLAY-10 | PR/Media playbook | Follows base.md contract, media list structure, pitch angles |
| PLAY-11 | Events playbook | Follows base.md contract, pre/during/post phases, webinar funnels |
| LRNG-01 | LEARNINGS.md maintains root-cause taxonomy | Template already exists; learn.md appends using taxonomy categories |
| LRNG-02 | Every campaign outcome delta leads to lesson extraction | learn.md compares measurement data to targets, extracts per-delta lessons |
| LRNG-03 | Pattern extraction -- winning hooks, angles, formats across campaigns | LEARNINGS.md Pattern Extraction section populated by learn.md after 3+ campaigns |
| LRNG-04 | LEARNINGS.md loaded into Brief phase of future campaigns | Already loaded as Tier 1 summary in brief workflow context loading |
| META-01 | Portfolio balance gate | Checks funnel stage distribution via campaign list --raw |
| META-02 | Calendar collision gate | Checks overlapping launch dates via CALENDAR.md + campaign states |
| META-03 | Theme consistency gate | Checks campaign alignment with quarterly theme from CALENDAR.md |
| META-04 | Learning plan gate | Checks campaign has measurement plan and testable hypothesis |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Measurement data input (MCP/paste/batch) | Frontend Server (AI runtime) | -- | AI runtime detects tools and routes; no backend API involved |
| Attribution model calculations | Frontend Server (AI runtime) | -- | AI performs weighted math on pasted/provided data in-context |
| Measurement report generation | Frontend Server (AI runtime) | Database / Storage (.marketing/) | AI generates report, writes to campaign directory |
| Lesson extraction | Frontend Server (AI runtime) | -- | AI analyzes campaign history, proposes reference edits |
| Reference file edits | Database / Storage (.marketing/) | -- | Edits applied to .marketing/*.md files after human approval |
| LEARNINGS.md append | Database / Storage (.marketing/) | CLI (bin/ttm-tools.cjs) | Append-only log pattern, potentially via CLI for consistency |
| Meta-gate evaluation | Frontend Server (AI runtime) | CLI (bin/ttm-tools.cjs) | AI evaluates; CLI provides campaign list data |
| Playbook authoring | Static (playbooks/*.md) | -- | Markdown files read by produce/verify workflows at runtime |
| Campaign state updates | CLI (bin/ttm-tools.cjs) | Database / Storage (.marketing/) | CLI writes state; files are the persistence layer |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Markdown (.md) | N/A | All workflows, playbooks, templates, reports | takeToMarket is a Markdown-native skill -- no other format is viable [VERIFIED: codebase inspection] |
| Node.js CJS | 18+ | CLI utilities (bin/ttm-tools.cjs) | Required by Claude Code runtime; all bin/ tools use CJS [VERIFIED: codebase inspection] |
| YAML frontmatter | N/A | Playbook metadata, campaign state, measurement report metadata | Standard across all existing playbooks and workflows [VERIFIED: codebase inspection] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (zero runtime dependencies) | N/A | N/A | The skill has NO runtime dependencies. CLI uses Node.js built-ins only. [VERIFIED: CLAUDE.md constraint] |

**Installation:** None required. All new files are Markdown workflows and playbooks read by the AI runtime.

## Architecture Patterns

### System Architecture Diagram

```
User runs /ttm-measure <slug>
         |
         v
  +-----------------+
  | SKILL.md routes  |-----> workflows/lifecycle/measure.md
  | to workflow      |
  +-----------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 1: Load       |     | .marketing/       |
  | campaign context   |<--->| CAMPAIGNS/<slug>/  |
  | + reference files  |     | BRIEF.md, STATE.md |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+
  | Step 2: Detect     |
  | analytics source   |
  | MCP > CSV > Batch  |
  +-------------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 3: Collect    |     | User pastes data  |
  | analytics data     |<--->| or MCP fetches    |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+
  | Step 4: Apply 3    |
  | attribution models |
  | (time-decay shown) |
  +-------------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 5: Generate   |---->| MEASUREMENT.md    |
  | outcome-first      |     | written to campaign|
  | report             |     +-------------------+
  +-------------------+
         |
         v
  +-------------------+
  | Step 6: Update     |---->  STATE.md phase = measured
  | campaign state     |
  +-------------------+

User runs /ttm-learn <slug>
         |
         v
  +-----------------+
  | SKILL.md routes  |-----> workflows/lifecycle/learn.md
  +-----------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 1: Load       |     | MEASUREMENT.md    |
  | measurement report |<--->| + campaign history |
  | + all ref files    |     | + LEARNINGS.md    |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+
  | Step 2: Extract    |
  | outcome deltas     |
  | (target vs actual) |
  +-------------------+
         |
         v
  +-------------------+
  | Step 3: Classify   |
  | lessons per root-  |
  | cause taxonomy     |
  +-------------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 4: Propose    |     | "Apply to ICP.md?"|
  | reference edits    |<--->| Human approval    |
  | as narratives      |     | per edit          |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+     +-------------------+
  | Step 5: Append     |---->| LEARNINGS.md      |
  | lessons + patterns |     | (append-only)     |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+
  | Step 6: Update     |---->  STATE.md phase = learned
  | campaign state     |
  +-------------------+

Meta-gates integrated into verify.md:
  Step 4b (discipline gates) --> Step 4c (meta-gates)
         |
         v
  +-------------------+     +-------------------+
  | campaign list      |<--->| All campaign      |
  | --raw CLI call     |     | STATE.md files    |
  +-------------------+     +-------------------+
         |
         v
  +-------------------+
  | Evaluate 4 meta-  |
  | gates (Tier 2)    |
  | Portfolio/Calendar |
  | /Theme/Learning   |
  +-------------------+
```

### Recommended Project Structure (new files)

```
workflows/lifecycle/
  measure.md           # Measurement workflow (~400 lines)
  learn.md             # Learning workflow (~350 lines)

playbooks/
  youtube.md           # YouTube playbook (250-350 lines)
  paid-ads.md          # Paid Ads playbook (250-350 lines)
  affiliate.md         # Affiliate playbook (250-350 lines)
  pr-media.md          # PR/Media playbook (250-350 lines)
  events.md            # Events playbook (250-350 lines)

references/
  measurement-template.md    # Paste template for analytics input
  meta-gate-evaluation.md    # Meta-gate evaluation instructions

templates/
  measurement-report.md      # MEASUREMENT.md output template

gates/
  meta-gates.md              # Extended with evaluation criteria (exists, needs content)

workflows/lifecycle/
  verify.md                  # Modified: add Step 4c for meta-gates
```

### Pattern 1: Multi-Source Analytics Input (MCP > Paste > Batch)
**What:** Runtime detection of available analytics tools, with graceful fallback chain
**When to use:** measure.md Step 2-3 for data collection
**Example:**
```markdown
## Step 2: Detect Analytics Source

Attempt to detect analytics MCP tools by checking for tool availability:

### Priority 1: MCP Analytics Tools (ANALYTICS_MODE=mcp)
Check for analytics platform MCP tools:
- PostHog MCP tools
- Amplitude MCP tools
- GA4 / Google Analytics MCP tools
- Any tool matching pattern *analytics*, *posthog*, *amplitude*, *ga4*

If any analytics MCP tool is detected:
  Set ANALYTICS_MODE=mcp
  Proceed to Step 3 with MCP data collection

### Priority 2: CSV/Markdown Paste (ANALYTICS_MODE=paste)
If no MCP tools detected, prompt user to paste data:
  Set ANALYTICS_MODE=paste
  Display measurement template from references/measurement-template.md
  Accept pasted tables, CSV data, or formatted metrics

### Priority 3: Structured Batch Questions (ANALYTICS_MODE=batch)
If user cannot paste bulk data:
  Set ANALYTICS_MODE=batch
  Group related metrics per D-02 (traffic batch, engagement batch, conversion batch)
```
Source: Pattern derived from existing research.md MCP detection (lines 98-151) [VERIFIED: codebase inspection]

### Pattern 2: Attribution Model Application
**What:** Three attribution models applied to the same data, with time-decay as default display
**When to use:** measure.md Step 4 for attribution analysis
**Example:**
```markdown
## Attribution Models

### Last-Touch Attribution
Assign 100% credit to the last touchpoint before conversion.
Use case: Shows which channel directly drove the action.

### Linear Attribution
Distribute credit equally across all touchpoints.
Use case: Shows which channels contributed to the journey.

### Time-Decay Attribution (DEFAULT DISPLAY)
Weight credit exponentially toward the most recent touchpoint.
Half-life: 7 days (standard marketing attribution window).
Use case: Balances recency with multi-touch contribution.

Display time-decay results in the summary. Note in the report:
"Other models (last-touch, linear) available on request."
```
Source: Standard marketing attribution models [ASSUMED]

### Pattern 3: Narrative + Apply Reference Edit Loop
**What:** Present lessons as natural language, then offer to apply each edit with human confirmation
**When to use:** learn.md Step 4 for reference file updates
**Example:**
```markdown
For each proposed reference file edit:

1. Present the narrative:
   "Based on campaign [slug] results, your ICP primary segment should add
   'mid-market SaaS teams (50-200 employees)' because [campaign] achieved
   3.2x conversion rate from this segment vs your current ICP definition."

2. Show the specific edit:
   "File: .marketing/ICP.md
   Section: Primary Segment
   Add: 'mid-market SaaS teams (50-200 employees)' to target segments"

3. Ask for approval (AskUserQuestion or text-mode):
   "Apply this to ICP.md?"
   1. Apply -- Update ICP.md with this change
   2. Skip -- Keep ICP.md unchanged, log lesson only
   3. Modify -- Edit the proposed change before applying

4. If POSITIONING.md edit proposed:
   Display warning: "POSITIONING.md is locked during campaigns. This edit
   requires /ttm-positioning-shift. Launch positioning shift process?"
```
Source: D-07, D-08, D-09 from CONTEXT.md [VERIFIED: context decisions]

### Pattern 4: Meta-Gate Cross-Campaign Evaluation
**What:** Query all campaign states, evaluate portfolio-level concerns
**When to use:** verify.md Step 4c for meta-gate evaluation
**Example:**
```markdown
## Step 4c: Evaluate Meta-Gates

1. Fetch all active campaign data:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --active --raw
   ```

2. For each meta-gate, evaluate against the portfolio data:
   - META-01: Count campaigns per funnel stage, check distribution
   - META-02: Compare launch dates for overlap/collision
   - META-03: Compare campaign themes against CALENDAR.md quarterly theme
   - META-04: Check if BRIEF.md has measurement plan and hypothesis

3. All meta-gates are Tier 2 advisory -- display findings but no action required
4. Meta-gate results appear after discipline gates in the verification report
```
Source: D-11, D-12, D-13 from CONTEXT.md [VERIFIED: context decisions]

### Anti-Patterns to Avoid
- **Asking one metric at a time:** D-02 explicitly prohibits this. Group related metrics in batches (traffic metrics, engagement metrics, conversion metrics).
- **Showing output metrics first:** D-05 and D-06 mandate outcome-first. Never lead with impressions/clicks; always lead with "Did we hit the target?"
- **Batch-applying reference edits:** D-08 requires per-edit human approval. No "apply all" shortcut.
- **Making meta-gates blocking:** D-12 says all four are Tier 2 advisory. Never block verification on meta-gate failures.
- **Duplicating base.md content in playbooks:** Playbooks extend base.md, they do not repeat it. Discipline gates must not duplicate base gates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Campaign state updates | Direct file writes | `ttm-tools.cjs campaign update` CLI | Consistent frontmatter serialization, allowed-field validation, automatic timestamps |
| LEARNINGS.md appends | Direct file writes | Append-only pattern using `<!-- LESSONS BELOW THIS LINE -->` marker | Consistent formatting, prevents accidental overwrite of taxonomy/structure |
| Deviation logging | Direct file writes | `ttm-tools.cjs deviation append` CLI | Already established pattern from Phase 4 verify workflow |
| Campaign listing | Manual directory scanning | `ttm-tools.cjs campaign list --raw` CLI | Security validation, frontmatter parsing, filtering already implemented |
| Gate evaluation output | Custom format per gate | `gates/gate-evaluation.md` structured output format | Consistency with existing 10 base gates and Phase 8 discipline gates |
| Playbook structure | Custom section layout | `playbooks/base.md` inheritance contract | 7-section structure, gate naming, tier rules already standardized |

**Key insight:** Phase 9 builds on a mature infrastructure (8 completed phases). The biggest risk is diverging from established patterns, not missing patterns. Every new file should follow an existing equivalent.

## Common Pitfalls

### Pitfall 1: Campaign State Field Allowlist Gap
**What goes wrong:** measure.md and learn.md try to update campaign STATE.md with measurement/learning tracking fields (e.g., `measure.run_count`, `measure.outcome_result`) but these fields are not in ALLOWED_FIELDS in campaign.cjs.
**Why it happens:** Existing ALLOWED_FIELDS only includes `phase.measured` and `phase.learned` but no detailed tracking fields for measurement/learning metadata.
**How to avoid:** Either (a) add new measurement/learning tracking fields to ALLOWED_FIELDS in campaign.cjs, or (b) use only the existing `phase.measured` and `phase.learned` fields and store detailed measurement state in MEASUREMENT.md file metadata rather than STATE.md.
**Warning signs:** `ttm-tools.cjs campaign update` throws "Unknown state field" error at runtime.

### Pitfall 2: Outcome Metric Not Found in Brief
**What goes wrong:** measure.md tries to compare analytics data against outcome metrics but BRIEF.md doesn't have clearly parseable outcome metric fields.
**Why it happens:** BRIEF.md is AI-generated during the brief phase. The outcome metric field structure may vary between campaigns.
**How to avoid:** measure.md should specify exact field names to search for in BRIEF.md (e.g., "Outcome Metric:", "Target Value:", "Measurement Window:"). Fall back to asking the user if fields cannot be parsed.
**Warning signs:** Measurement report shows "outcome metric not found" or compares against the wrong metric.

### Pitfall 3: Playbook Gate Count Mismatch
**What goes wrong:** Playbooks with too few gates (<4) feel shallow; too many (>7) exceed the 500-line limit.
**Why it happens:** Domain unfamiliarity leads to either generic gates or over-specific gates.
**How to avoid:** Reference the existing playbooks for calibration: SEO has 7 gates (284 lines), Email has 7 gates (306 lines), AEO has 5 gates (223 lines), LinkedIn has ~5 gates (263 lines), Social has ~5 gates (305 lines). Target 4-7 gates per D-14.
**Warning signs:** Playbook exceeds 350 lines before reaching Examples section; or all gates feel like base gate duplicates.

### Pitfall 4: Meta-Gate Evaluation Without Campaign Data
**What goes wrong:** Meta-gates fire but `campaign list --active --raw` returns 0 campaigns (e.g., only one campaign exists and it is the one being verified, so it may not appear as "active" yet).
**Why it happens:** The current campaign may still be in "produced" state when verify runs. ACTIVE_PHASES is `['briefed', 'produced', 'verified', 'reviewed', 'shipped']` -- "produced" IS included, so this is partially mitigated.
**How to avoid:** Meta-gates should include the current campaign in the portfolio evaluation. Use `campaign list --raw` (no filter) and include the current campaign explicitly.
**Warning signs:** Meta-gate reports "0 campaigns in portfolio" when at least one campaign exists.

### Pitfall 5: POSITIONING.md Edit Attempt in Learn Phase
**What goes wrong:** /ttm-learn proposes an edit to POSITIONING.md and applies it directly, violating the positioning invariant.
**Why it happens:** D-09 lists POSITIONING.md as a valid edit target but with the caveat "(via /ttm-positioning-shift if locked)."
**How to avoid:** learn.md must detect when a proposed edit targets POSITIONING.md and route it through /ttm-positioning-shift instead of direct edit. This is a hard constraint, not a suggestion.
**Warning signs:** POSITIONING.md gets modified outside of /ttm-positioning-shift workflow.

### Pitfall 6: Pattern Extraction on First Campaign
**What goes wrong:** learn.md tries to extract patterns (winning hooks, angles, formats) from a single campaign and writes premature "patterns."
**Why it happens:** LEARNINGS.md template says "Populated after 3+ campaigns."
**How to avoid:** learn.md should count existing lessons in LEARNINGS.md. If fewer than 3 campaigns have entries, skip pattern extraction and note "Pattern extraction requires 3+ campaigns. Current: N."
**Warning signs:** Pattern Extraction sections populated with observations from a single campaign.

## Code Examples

### Measurement Report Template Structure
```markdown
<!-- Source: Derived from existing verification-report.md pattern -->
---
campaign: ${SLUG}
measured_at: ${ISO_DATE}
analytics_source: ${ANALYTICS_MODE}
outcome_met: ${true|false}
outcome_delta: ${PERCENTAGE}
attribution_default: time-decay
---

# Measurement Report: ${CAMPAIGN_NAME}

**Campaign:** ${SLUG} | **Measured:** ${ISO_DATE}
**Analytics Source:** ${ANALYTICS_MODE}

## Outcome Assessment

**Did we hit the target?** [YES/NO]

| Metric | Type | Target | Actual | Delta |
|--------|------|--------|--------|-------|
| [outcome metric] | Outcome | [target] | [actual] | [+/-X%] |
| [output metric 1] | Output | [target] | [actual] | [+/-X%] |
| [output metric 2] | Output | [target] | [actual] | [+/-X%] |

## Attribution Analysis (Time-Decay -- Default)

| Channel | Time-Decay Weight | Contribution | Conversions |
|---------|-------------------|-------------|-------------|
| [channel] | [weight%] | [contribution%] | [count] |

> Other models (last-touch, linear) available on request.

## Signals for Learn Phase

- [Signal 1: what overperformed/underperformed and why]
- [Signal 2: ...]
```
[VERIFIED: pattern follows existing verification-report.md template structure]

### LEARNINGS.md Append Pattern
```markdown
<!-- Source: templates/reference-files/learnings.md existing marker pattern -->

1. Read LEARNINGS.md
2. Find the marker line: <!-- LESSONS BELOW THIS LINE -->
3. Insert new lesson rows immediately after the marker
4. Update the Summary section counters:
   - Total lessons: [increment]
   - Last lesson date: [today]
   - Top pattern: [update if 3+ campaigns]
5. Write updated LEARNINGS.md

New lesson row format:
| ${DATE} | ${SLUG} | ${CATEGORY} | ${LESSON_TEXT} | ${ACTION_TAKEN} |
```
[VERIFIED: codebase inspection of templates/reference-files/learnings.md]

### Playbook YAML Frontmatter Examples
```yaml
# YouTube
---
discipline: youtube
asset_types: [video-script, thumbnail-brief, description, community-post]
version: "1.0"
---

# Paid Ads
---
discipline: paid-ads
asset_types: [search-ad, display-ad, social-ad, video-ad, landing-page-ad]
version: "1.0"
---

# Affiliate
---
discipline: affiliate
asset_types: [affiliate-creative-kit, affiliate-landing-page, affiliate-email-swipe]
version: "1.0"
---

# PR/Media
---
discipline: pr-media
asset_types: [press-release, media-pitch, media-kit, byline-article]
version: "1.0"
---

# Events
---
discipline: events
asset_types: [event-landing-page, webinar-script, sponsorship-brief, post-event-recap]
version: "1.0"
---
```
[ASSUMED: asset_types inferred from REQUIREMENTS.md descriptions]

### Meta-Gate Evaluation Criteria (Recommended)
```markdown
### META-01: Portfolio Balance -- Tier 2

**Checks:** Active campaign funnel stage distribution
**Against:** All active campaigns via campaign list --raw

#### Evaluation Criteria

1. **Funnel coverage**
   - PASS: Active campaigns cover 3+ funnel stages (awareness, consideration, conversion, retention)
   - WARN: Active campaigns cover only 2 funnel stages
   - FAIL: Active campaigns cover only 1 funnel stage (over-indexed)

2. **Channel diversity**
   - PASS: Active campaigns use 3+ distinct channels
   - WARN: Active campaigns use only 2 channels
   - FAIL: All active campaigns target the same channel

### META-02: Calendar Collision -- Tier 2

**Checks:** Overlapping launch dates and audience conflicts
**Against:** Campaign states + CALENDAR.md

#### Evaluation Criteria

1. **Launch date overlap**
   - PASS: No two campaigns launch within the same 3-day window
   - WARN: 2 campaigns launch within the same week
   - FAIL: 3+ campaigns launch within the same week

2. **Audience collision**
   - PASS: Overlapping campaigns target different ICP segments
   - WARN: Overlapping campaigns target the same segment but different channels
   - FAIL: Overlapping campaigns target the same segment on the same channel

### META-03: Theme Consistency -- Tier 2

**Checks:** Campaign alignment with quarterly theme
**Against:** CALENDAR.md quarterly theme

#### Evaluation Criteria

1. **Theme alignment**
   - PASS: Campaign brief explicitly references the current quarterly theme
   - WARN: Campaign topic is adjacent to the quarterly theme but not explicitly aligned
   - FAIL: Campaign contradicts or ignores the quarterly theme without documented rationale

### META-04: Learning Plan -- Tier 2

**Checks:** Campaign has a measurement plan and testable hypothesis
**Against:** Campaign BRIEF.md

#### Evaluation Criteria

1. **Measurement plan**
   - PASS: Brief includes outcome metric, target value, and measurement window
   - WARN: Brief includes outcome metric but missing target value or window
   - FAIL: Brief has no outcome metric defined

2. **Testable hypothesis**
   - PASS: Brief includes a specific hypothesis about what the campaign will prove or disprove
   - WARN: Brief has a goal but no explicit hypothesis
   - FAIL: Brief states only output targets with no strategic question
```
[ASSUMED: Specific thresholds (3-day window, 3+ stages) are reasonable defaults but could be adjusted]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single attribution model | Multi-model attribution (last-touch + linear + time-decay) | Industry standard 2020+ | More nuanced understanding of channel contribution |
| Output-first reporting (impressions, clicks) | Outcome-first reporting (did we hit the business goal?) | D-05/D-06 locked decision | Forces outcome-oriented thinking over vanity metrics |
| Manual lesson tracking | Structured root-cause taxonomy with pattern extraction | Phase 9 innovation | Enables compound learning across campaigns |
| Asset-level quality gates only | Portfolio-level meta-gates | Phase 9 innovation | Catches systemic issues (over-indexing, collisions) individual gates miss |

**Deprecated/outdated:**
- Single-touch attribution as sole model: Still useful but insufficient alone. Time-decay provides better balance. [ASSUMED]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Time-decay half-life of 7 days is standard marketing attribution | Attribution Model pattern | Low -- configurable in the report, users can adjust |
| A2 | Playbook asset_types lists are correct per discipline | Code Examples (frontmatter) | Low -- can be adjusted per playbook without architecture impact |
| A3 | Meta-gate thresholds (3-day window, 3+ stages) are reasonable defaults | Meta-Gate Evaluation Criteria | Medium -- too strict/loose thresholds affect usefulness; make configurable |
| A4 | 4-7 discipline gates per playbook is the right range | Pitfall 3 | Low -- calibrated against existing Phase 8 playbooks (5-7 gates each) |

## Open Questions

1. **Measurement state tracking granularity**
   - What we know: `phase.measured` and `phase.learned` exist in ALLOWED_FIELDS. No `measure.*` or `learn.*` detailed tracking fields exist.
   - What's unclear: Should we add `measure.run_count`, `measure.outcome_result`, `learn.run_count`, `learn.lessons_extracted` to ALLOWED_FIELDS, or keep tracking in MEASUREMENT.md file metadata?
   - Recommendation: Add to ALLOWED_FIELDS for consistency with verify/review/fix tracking pattern. This is a minor campaign.cjs update (add ~6 fields to the Set).

2. **LEARNINGS.md append: CLI tool or direct write?**
   - What we know: drift-log.cjs has an append-only pattern. deviation.cjs has append-only pattern. LEARNINGS.md uses a `<!-- LESSONS BELOW THIS LINE -->` marker.
   - What's unclear: Whether to add a `learnings append` subcommand to ttm-tools.cjs or let learn.md workflow do direct file writes.
   - Recommendation: Add a `learnings append` CLI subcommand for consistency with the deviation/drift-log pattern. Keeps formatting deterministic.

3. **Meta-gate reference file vs inline in verify.md**
   - What we know: verify.md is currently 500 lines (at the limit). Adding a Step 4c inline would exceed 500 lines.
   - What's unclear: Whether to extract meta-gate evaluation to a reference file loaded via @-syntax, or keep it minimal inline.
   - Recommendation: Extract to `references/meta-gate-evaluation.md` loaded via @-syntax, keeping verify.md additions to ~30 lines (the Step 4c routing logic only).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification via /ttm-health + workflow execution |
| Config file | None -- skills are Markdown read by AI runtime |
| Quick run command | `node bin/ttm-tools.cjs health --raw` |
| Full suite command | Manual: run each `/ttm-*` command and verify output |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIFE-14 | /ttm-measure accepts data, applies 3 attribution models | manual-only | Run `/ttm-measure test-campaign` with pasted data | N/A (AI workflow) |
| LIFE-15 | Outcome reported first | manual-only | Inspect MEASUREMENT.md output ordering | N/A |
| LIFE-16 | /ttm-learn proposes edits with approval gates | manual-only | Run `/ttm-learn test-campaign` | N/A |
| LIFE-17 | Failures logged with root-cause to LEARNINGS.md | manual-only | Inspect LEARNINGS.md after learn run | N/A |
| PLAY-04 | YouTube playbook available | unit | `node -e "require('fs').readFileSync('playbooks/youtube.md')"` | No (Wave 0) |
| PLAY-08 | Paid Ads playbook available | unit | `node -e "require('fs').readFileSync('playbooks/paid-ads.md')"` | No (Wave 0) |
| PLAY-09 | Affiliate playbook available | unit | `node -e "require('fs').readFileSync('playbooks/affiliate.md')"` | No (Wave 0) |
| PLAY-10 | PR/Media playbook available | unit | `node -e "require('fs').readFileSync('playbooks/pr-media.md')"` | No (Wave 0) |
| PLAY-11 | Events playbook available | unit | `node -e "require('fs').readFileSync('playbooks/events.md')"` | No (Wave 0) |
| LRNG-01 | LEARNINGS.md root-cause taxonomy maintained | manual-only | Inspect LEARNINGS.md structure | Exists (template) |
| LRNG-02 | Outcome delta triggers lesson extraction | manual-only | Run /ttm-learn, verify lessons appear | N/A |
| LRNG-03 | Pattern extraction after 3+ campaigns | manual-only | Run /ttm-learn with 3+ campaign history | N/A |
| LRNG-04 | LEARNINGS.md loaded in Brief phase | unit | Grep for LEARNINGS in research.md/brief workflow | Exists |
| META-01 | Portfolio balance gate | manual-only | Run /ttm-verify with multiple campaigns | N/A |
| META-02 | Calendar collision gate | manual-only | Run /ttm-verify with overlapping dates | N/A |
| META-03 | Theme consistency gate | manual-only | Run /ttm-verify, check theme evaluation | N/A |
| META-04 | Learning plan gate | manual-only | Run /ttm-verify, check hypothesis evaluation | N/A |

### Sampling Rate
- **Per task commit:** `node bin/ttm-tools.cjs health --raw` (validates file structure)
- **Per wave merge:** Manual smoke test of one workflow
- **Phase gate:** Full manual walkthrough of measure + learn cycle

### Wave 0 Gaps
- [ ] Playbook file existence validation (5 files)
- [ ] Campaign state field additions for measure/learn tracking (if decided)
- [ ] `references/meta-gate-evaluation.md` creation
- [ ] `references/measurement-template.md` creation
- [ ] `templates/measurement-report.md` creation

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- no auth in skill |
| V3 Session Management | No | N/A -- stateless skill |
| V4 Access Control | No | N/A -- filesystem access only |
| V5 Input Validation | Yes | Campaign slug sanitization via campaign.cjs (already implemented) |
| V6 Cryptography | No | N/A -- no crypto operations |

### Known Threat Patterns for Markdown-native Skills

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via campaign slug | Tampering | `resolveCampaignStatePath` rejects paths escaping project root [VERIFIED: campaign.cjs] |
| Arbitrary file writes via learn.md reference edits | Tampering | D-08 human approval gate per edit; D-09 limits target files to known reference files |
| CLI injection via pasted analytics data | Tampering | Analytics data is parsed by AI, never passed to shell commands |
| LEARNINGS.md injection via crafted lesson text | Tampering | If using CLI append, sanitize pipe characters and backticks (follow drift-log.cjs pattern) |

## Sources

### Primary (HIGH confidence)
- Codebase inspection of all files in playbooks/, workflows/lifecycle/, gates/, references/, templates/, bin/lib/ -- verified existing patterns, line counts, ALLOWED_FIELDS, gate evaluation format
- CONTEXT.md decisions D-01 through D-16 -- locked implementation decisions
- REQUIREMENTS.md -- LIFE-14 through LIFE-17, PLAY-04/08/09/10/11, LRNG-01 through LRNG-04, META-01 through META-04

### Secondary (MEDIUM confidence)
- base.md inheritance contract -- verified 7-section structure and gate naming convention
- seo.md as reference playbook -- verified 284 lines, 7 gates, gate definition format

### Tertiary (LOW confidence)
- Attribution model specifics (time-decay half-life = 7 days) -- standard industry practice but not verified against specific source
- Playbook asset_types -- inferred from requirements descriptions, not validated

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new libraries; pure Markdown/Node.js per project constraints
- Architecture: HIGH - follows established patterns from 8 completed phases
- Pitfalls: HIGH - derived from actual codebase inspection (ALLOWED_FIELDS gaps, 500-line limits, positioning invariant)
- Playbook domain knowledge: MEDIUM - gate definitions require marketing domain expertise; calibrated against existing playbooks

**Research date:** 2026-04-30
**Valid until:** 2026-05-30 (stable -- no external dependencies to become stale)
