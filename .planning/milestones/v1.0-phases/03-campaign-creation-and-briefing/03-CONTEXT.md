# Phase 3: Campaign Creation and Briefing - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create campaigns and generate briefs that enforce outcome metrics and positioning alignment before any content is produced. This phase delivers 3 commands: `/ttm-new-campaign` (campaign directory scaffolding), `/ttm-research` (market/audience research), and `/ttm-brief` (brief generation with enforcement gates).

</domain>

<decisions>
## Implementation Decisions

### Campaign Directory Structure
- **D-01:** Full scaffold at campaign creation — `CAMPAIGNS/<slug>/` gets STATE.md, BRIEF.md, RESEARCH.md, and ASSETS/ directory pre-created so users see the full structure upfront
- **D-02:** Reference file access strategy is Claude's Discretion — researcher should investigate symlinks vs copies vs direct reads and pick the most reliable, error-free approach for accessing .marketing/ reference files from within a campaign

### Research Workflow
- **D-03:** Web search + manual paste hybrid — use WebSearch/WebFetch MCP tools for SERP analysis and competitor scanning when available, fall back to manual paste prompts when tools are unavailable. Detect tool availability at runtime.
- **D-04:** Output format is structured markdown with confidence scores — RESEARCH.md has fixed sections (Market Context, Competitor Content Analysis, Audience Insights, Ambient Narrative, Content Gaps) and each insight gets a confidence tag (HIGH/MEDIUM/LOW) based on data quality. /ttm-brief can weight insights by confidence.

### Brief Generation and Enforcement
- **D-05:** Positioning check gate on failure: generate the brief with a prominent warning section about positioning drift (not a hard block). User can choose to fix or proceed at their own risk. The warning must be visually obvious and include specific drift details.
- **D-06:** Outcome metric enforcement is guided, not strict — strongly prompt for both output AND outcome metrics with target values and measurement windows, but allow brief to complete if user provides at least an outcome metric. Output metric can be added later. Brief should clearly flag when output metric is missing.
- **D-07:** Brief must contain all mandatory fields per success criteria: goal, outcome metric, target value, measurement window, ICP segment, positioning anchor, hook, proof points, channel mix, assets list.

### Campaign State Machine
- **D-08:** Phase ordering is guided — warn when running commands out of lifecycle order (e.g., "Brief not completed — proceed anyway?") but allow user to override. Respects user judgment rather than enforcing strict sequencing.
- **D-09:** Per-campaign STATE.md tracks: current phase, phase completion timestamps, quality gate pass/fail history per asset. Rich audit trail for campaign retrospectives in /ttm-learn.
- **D-10:** Campaign slug generated via `bin/ttm-tools.cjs slug` — deterministic, not AI-generated (per Phase 1 D-12).

### Claude's Discretion
- Reference file access mechanism (D-02) — researcher investigates and picks the most error-free approach
- RESEARCH.md template structure — researcher designs based on what /ttm-brief needs to consume
- Per-campaign STATE.md frontmatter schema — design based on what downstream commands need to read/update

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 1 Infrastructure
- `templates/reference-files/*.md` — 9 reference file templates with _SUMMARY/END_SUMMARY two-tier structure
- `templates/campaign-brief.md` — Campaign brief template (Phase 1 created the structure)
- `templates/claude-md.md` — CLAUDE.md template with positioning-as-invariant rules
- `bin/ttm-tools.cjs` — CLI utility for slug generation, state management, health checks
- `gates/base-gates.md` — Quality gate definitions (positioning drift is GATE-01, Tier 1 blocking)
- `references/context-loading.md` — Two-tier context loading strategy documentation
- `skills/ttm-new-campaign/SKILL.md` — Existing stub to be implemented
- `skills/ttm-research/SKILL.md` — Existing stub to be implemented
- `skills/ttm-brief/SKILL.md` — Existing stub to be implemented

### Phase 2 Patterns
- `workflows/setup/init.md` — Interview workflow pattern (AskUserQuestion + text-mode fallback, validation, file generation)
- `workflows/setup/init-questions.md` — Question bank pattern (reference file for workflow)
- `workflows/setup/init-validation.md` — Validation rules pattern (reference file for workflow)

### Project Context
- `.planning/PROJECT.md` — Core value: every asset ships with verifiable outcome metric through positioning-invariant quality gate wall
- `.planning/REQUIREMENTS.md` — LIFE-01 through LIFE-05 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/ttm-tools.cjs slug` — Deterministic slug generation for campaign directory names
- `bin/ttm-tools.cjs state read/update` — STATE.md parsing and updating
- `bin/ttm-tools.cjs health` — Directory integrity validation (can be extended for campaign health)
- `bin/ttm-tools.cjs timestamp` — ISO timestamp generation for state tracking
- `templates/campaign-brief.md` — Pre-existing brief template with outcome/output metric sections

### Established Patterns
- Thin SKILL.md → workflow routing (Phase 1 D-02)
- AskUserQuestion with text-mode fallback for all interactive prompts (Phase 2 pattern)
- Supporting reference files (@-syntax) to keep workflows under 500 lines
- Template-guided file generation with placeholder filling
- Two-tier context loading (_SUMMARY for universal, full content for phase-specific)

### Integration Points
- `workflows/setup/` — new-campaign.md goes here
- `workflows/lifecycle/` — research.md and brief.md go here
- `.marketing/CAMPAIGNS/<slug>/` — campaign directories created at runtime
- `bin/ttm-tools.cjs` — may need new subcommands for campaign-specific state operations

</code_context>

<specifics>
## Specific Ideas

- Research should detect WebSearch/WebFetch tool availability at runtime and adapt (not fail if unavailable)
- Confidence scores on research insights let the brief weight data quality — HIGH confidence insights should be prioritized in positioning anchor and hook selection
- Positioning drift warning in briefs should show exactly which fields/phrases drifted and from what

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-campaign-creation-and-briefing*
*Context gathered: 2026-04-23*
