# Phase 9: Measurement, Learning, and Remaining Playbooks - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can close the feedback loop by measuring campaign outcomes against defined metrics, extracting lessons that improve future campaigns, and produce content across all 10 marketing disciplines. This phase delivers `/ttm-measure` (analytics analysis with 3 attribution models), `/ttm-learn` (lesson extraction with reference file edit proposals), 5 remaining discipline playbooks (YouTube, Paid Ads, Affiliate, PR/Media, Events), meta-gates for portfolio-level checks, and the LEARNINGS.md compound learning infrastructure.

</domain>

<decisions>
## Implementation Decisions

### Measurement Data Flow (/ttm-measure)
- **D-01:** Multi-source analytics input -- three pathways: (1) MCP tool integration for analytics platforms (PostHog, Amplitude, GA4, etc.) when available, (2) CSV/Markdown paste for bulk data, (3) structured batch questions for guided collection. AI detects tool availability at runtime and routes accordingly.
- **D-02:** Batch questioning -- when using structured prompts, ask multiple metrics at once (not one question at a time). Group related metrics: "Paste your traffic metrics (page views, sessions, unique visitors)" rather than asking each individually.
- **D-03:** CSV/Markdown paste parsing -- accept pasted tables or CSV data. AI parses columns, maps to expected metric fields, and asks for clarification on unmapped columns.
- **D-04:** MCP tool detection follows the same runtime pattern as /ttm-research (Phase 3 D-03) -- detect WebSearch/WebFetch/analytics MCP tools, use if available, fall back to paste prompts if not.

### Attribution Model Presentation
- **D-05:** Outcome-first summary -- lead with outcome metric ("Did we hit the target?"), show result vs target, then present time-decay as the default attribution model. Last-touch and linear available on request but not shown by default. Less noise, faster to read.
- **D-06:** LIFE-15 compliance: outcome metric reported first, output metric second. The summary section opens with outcome, not impressions/clicks.

### Learn-to-Reference Loop (/ttm-learn)
- **D-07:** Narrative + apply approach -- present lessons as natural language narratives ("Based on this campaign, your ICP segment should add 'mid-market SaaS teams' because..."), then ask "Apply this to ICP.md?" per lesson. More natural than diffs.
- **D-08:** Human approval gate per proposed edit -- each reference file edit requires explicit user confirmation before applying. No batch-apply without review.
- **D-09:** Proposed edits can target: BRAND.md, ICP.md, CHANNELS.md, POSITIONING.md (via /ttm-positioning-shift if locked), METRICS.md, COMPETITORS.md. Each edit includes reasoning from campaign data.
- **D-10:** Root-cause narratives -- failures logged to LEARNINGS.md with explicit root-cause from the 7-category taxonomy (positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue). Pattern extraction identifies winning hooks, angles, formats across campaigns.

### Meta-Gates Integration
- **D-11:** Meta-gates fire during /ttm-verify alongside quality gates. Not a separate command -- they are evaluated as part of the verify workflow extension.
- **D-12:** 4 meta-gates: portfolio balance (META-01), calendar collision (META-02), theme consistency (META-03), learning plan (META-04). All are Tier 2 advisory (not blocking).
- **D-13:** Meta-gates access cross-campaign data via `campaign list --raw` CLI to read all active campaign states, briefs, and asset types. They evaluate portfolio-level concerns, not single-asset concerns.

### Remaining Playbooks
- **D-14:** Same depth as Phase 8 core playbooks -- follow the exact same template: 6-section structure (Production Guidance, Discipline Gates, Base Gate Overrides, Format Rules, Examples, Anti-Patterns, Metrics), 4-7 gates each, 250-350 lines. Same quality bar.
- **D-15:** All 5 playbooks follow `playbooks/base.md` inheritance contract from Phase 8.
- **D-16:** YouTube and Paid Ads are highest demand among the remaining 5. Affiliate, PR/Media, Events are lower frequency but get the same treatment.

### Claude's Discretion
- Exact gate definitions for the 5 remaining playbooks
- How meta-gates are wired into verify.md (inline or via reference file)
- Measurement template format for the paste pathway
- How /ttm-learn detects which reference files need updates (scan lesson content for keywords vs explicit mapping)
- LEARNINGS.md pattern extraction algorithm (frequency-based vs recency-weighted)

</decisions>

<specifics>
## Specific Ideas

- /ttm-measure should feel like talking to a data analyst -- "Here's what happened, here's what it means, here's what to do next"
- MCP analytics integration should follow the same try/fallback pattern as /ttm-research (detect tools, use if available, graceful fallback)
- LEARNINGS.md should become increasingly valuable over time -- each campaign adds data, and the brief phase of future campaigns loads these patterns
- Meta-gates should catch the "we're doing too much of the same thing" problem that marketing teams often miss

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Lifecycle Infrastructure
- `workflows/lifecycle/verify.md` -- Verify workflow to extend with meta-gates (Step 4b already handles discipline gates from Phase 8)
- `gates/gate-evaluation.md` -- Gate evaluation prompting strategy to extend for meta-gates
- `gates/meta-gates.md` -- 4 meta-gate definitions created in Phase 1 (portfolio balance, calendar collision, theme consistency, learning plan)
- `references/learnings-extraction.md` -- Learnings extraction guide from Phase 7 (root-cause taxonomy, pattern categories)

### Existing Campaign Infrastructure
- `bin/lib/campaign.cjs` -- Campaign CRUD with list/state/archive operations
- `workflows/lifecycle/research.md` -- MCP tool detection pattern (WebSearch/WebFetch runtime check with fallback)
- `templates/campaign-brief.md` -- Brief template with outcome/output metrics

### Playbook Infrastructure
- `playbooks/base.md` -- Base playbook inheritance contract (Phase 8)
- `playbooks/seo.md` -- Example discipline playbook to follow (Phase 8, 284 lines, 7 gates)

### Reference Files
- `templates/reference-files/learnings.md` -- LEARNINGS.md template with append marker
- `.planning/REQUIREMENTS.md` -- LIFE-14 through LIFE-17, PLAY-04/08/09/10/11, LRNG-01 through LRNG-04, META-01 through META-04

### Existing Stubs
- `skills/ttm-measure/SKILL.md` -- Stub to be implemented
- `skills/ttm-learn/SKILL.md` -- Stub to be implemented

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `workflows/lifecycle/research.md` -- MCP tool detection + fallback pattern (reuse for analytics tool detection)
- `workflows/lifecycle/verify.md` Step 4b -- discipline gate evaluation pattern (extend for meta-gates)
- `references/learnings-extraction.md` -- root-cause taxonomy + pattern extraction categories
- `bin/lib/campaign.cjs` cmdCampaignList -- cross-campaign data access for meta-gates
- `bin/lib/drift-log.cjs` -- append-only log pattern for LEARNINGS.md entries
- AskUserQuestion + text-mode fallback pattern

### Established Patterns
- Thin SKILL.md -> workflow routing
- Supporting reference files via @-syntax for 500-line budget
- Playbook inheritance: base.md contract, YAML frontmatter, 6-section structure, DISC-{DISCIPLINE}-{NN} gates
- Gate evaluation: PASS/WARN/FAIL per check, tier classification, deviation handling

### Integration Points
- `workflows/lifecycle/measure.md` -- new workflow for measurement
- `workflows/lifecycle/learn.md` -- new workflow for lesson extraction
- `playbooks/youtube.md`, `playbooks/paid-ads.md`, `playbooks/affiliate.md`, `playbooks/pr-media.md`, `playbooks/events.md` -- 5 new playbook files
- `gates/meta-gates.md` -- may need extension with evaluation instructions
- `workflows/lifecycle/verify.md` -- needs meta-gate evaluation step

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 09-measurement-learning-and-remaining-playbooks*
*Context gathered: 2026-04-29*
