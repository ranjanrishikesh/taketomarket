# Phase 4: Content Production and Verification - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can produce content assets in quality-isolated contexts and verify them against a 10-gate quality wall with structured deviation handling. This phase delivers 2 commands: `/ttm-produce` (content generation in fresh contexts with wave-parallel execution) and `/ttm-verify` (quality gate evaluation with line-level feedback and 3-option deviation handling).

</domain>

<decisions>
## Implementation Decisions

### Production Context Loading
- **D-01:** Hero-first, then derivatives in wave-parallel — produce the hero/anchor asset first (e.g., long-form blog post), then spawn parallel contexts for derivatives (social posts, email, etc.). Each derivative context loads the hero asset as reference for consistency.
- **D-02:** Playbooks are loaded into production contexts per asset type — if producing a blog post, load the SEO playbook; if email, load the Email playbook. Playbook guides format, structure, and discipline-specific rules. (Note: playbook content is Phase 8 scope, but the loading mechanism must be built now.)
- **D-03:** Context loading for production: brief + positioning (Tier 2 full) + brand (Tier 2 full) + ICP (Tier 2 full) + relevant playbook + hero asset (for derivatives). This is the maximum context load in the system.

### Quality Gate Implementation
- **D-04:** Tier 1 (blocking) gates use soft fail with override option — gate failure is flagged prominently but user can override with Accept+log. Consistent with Phase 3's soft positioning gate pattern (D-05). No hard blocks in the verify workflow.
- **D-05:** Gate feedback format: summary table at top (gate name, pass/fail, one-liner) + expandable line-level drill-down below (specific lines/sections that triggered each finding with exact text). Both overview and detail.
- **D-06:** All 10 base quality gates from `gates/base-gates.md` are evaluated: positioning drift (GATE-01), claim accuracy (GATE-02), voice drift (GATE-03), outcome alignment (GATE-04), funnel integrity (GATE-05), UTM hygiene (GATE-06), compliance (GATE-07), competitor collision (GATE-08), ICP fit (GATE-09), format correctness (GATE-10).

### Deviation Handling
- **D-07:** Accept+log records a full deviation record: gate name, exact failure text, user's justification (prompted via AskUserQuestion), timestamp, asset path. Stored in both per-campaign STATE.md gate history AND a campaign-level DEVIATIONS.md log file.
- **D-08:** Escalate immediately launches /ttm-positioning-shift within the same session. Current verification pauses until positioning is resolved. After resolution, verification can be re-run.
- **D-09:** Three deviation options per gate failure: Correct (triggers /ttm-fix for that specific finding), Accept+log (record and proceed), Escalate (launch positioning shift).

### Context Isolation
- **D-10:** Context isolation mechanism is Claude's Discretion — researcher should investigate `context: fork` in SKILL.md vs explicit `Task()` spawning and pick the best approach for the wave-parallel pattern. Key constraint: Verify must NOT see Produce's internal reasoning or generation process.
- **D-11:** State passing from Produce to Verify: file paths to generated assets (in CAMPAIGNS/<slug>/ASSETS/) + a production manifest containing which playbook was used, what context was loaded, and timestamps. Verify reads assets from disk and manifest for evaluation context.

### Claude's Discretion
- Context isolation mechanism (D-10) — researcher picks between context:fork and Task()
- Production manifest format — design based on what Verify needs to consume
- Gate evaluation prompting strategy — how each gate is implemented as an AI check (may use reference files from `gates/`)
- Playbook loading mechanism — how to detect asset type and map to correct playbook file

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Quality Gates
- `gates/base-gates.md` — 10 base quality gate definitions with tier classification (Phase 1)
- `gates/meta-gates.md` — 4 meta-gate definitions (Phase 1, for future phases)

### Phase 1 Infrastructure
- `references/context-loading.md` — Two-tier context loading strategy (Tier 1 budget, Tier 2 triggers)
- `bin/ttm-tools.cjs` — CLI utility for state management, timestamps, campaign operations
- `bin/lib/campaign.cjs` — Campaign CRUD operations (init, state, update)
- `templates/reference-files/*.md` — 9 reference file templates with _SUMMARY/END_SUMMARY
- `skills/ttm-produce/SKILL.md` — Existing stub to be implemented (already has Task in allowed-tools)
- `skills/ttm-verify/SKILL.md` — Existing stub to be implemented (already has Task in allowed-tools)

### Phase 3 Patterns
- `workflows/lifecycle/brief.md` — Brief workflow pattern (context loading, gate checking, state updates)
- `workflows/lifecycle/brief-positioning-check.md` — Gate reference file pattern (check definitions with PASS/WARN/FAIL)
- `workflows/lifecycle/research.md` — Workflow with tool detection and fallback pattern

### Project Context
- `.planning/PROJECT.md` — Core value: every asset ships with verifiable outcome metric through positioning-invariant quality gate wall
- `.planning/REQUIREMENTS.md` — LIFE-06 through LIFE-09, GATE-01 through GATE-12 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/lib/campaign.cjs` — Campaign state read/update (Phase 3) — use for gate result tracking
- `bin/ttm-tools.cjs campaign update` — Atomic state field updates with dot-notation
- `workflows/lifecycle/brief-positioning-check.md` — Pattern for gate reference files (5-check structure)
- `templates/campaign-brief.md` — Brief template that Produce will consume
- `templates/campaign-research.md` — Research template that Produce will consume

### Established Patterns
- Thin SKILL.md → workflow routing (Phase 1 D-02)
- AskUserQuestion with text-mode fallback for interactive prompts (Phase 2)
- Soft gate pattern: evaluate → warn → present options → record choice (Phase 3 brief)
- Supporting reference files via @-syntax to keep workflows under 500 lines
- Wave-parallel execution via Task() with fresh contexts (from GSD patterns)

### Integration Points
- `workflows/lifecycle/` — produce.md and verify.md go here
- `.marketing/CAMPAIGNS/<slug>/ASSETS/` — produced content lands here
- `.marketing/CAMPAIGNS/<slug>/STATE.md` — gate results tracked here
- `.marketing/CAMPAIGNS/<slug>/DEVIATIONS.md` — deviation log created here
- `playbooks/` — playbook files loaded per asset type (content is Phase 8, mechanism is Phase 4)

</code_context>

<specifics>
## Specific Ideas

- Hero asset should be identifiable in the production manifest so derivatives can reference it
- Gate evaluation should load the positioning _SUMMARY for quick checks and full POSITIONING.md for drift analysis
- DEVIATIONS.md should be append-only (each verify run adds entries, never overwrites)
- Production manifest should be machine-readable (YAML frontmatter or JSON) so Verify can parse it programmatically

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-content-production-and-verification*
*Context gathered: 2026-04-23*
