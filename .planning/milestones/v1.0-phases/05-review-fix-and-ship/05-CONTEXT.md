# Phase 5: Review, Fix, and Ship - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can review assets with structured human checklists, fix failures through root-cause analysis with a 3-attempt cap, and ship with verified launch readiness. This phase delivers 3 commands: `/ttm-review` (human review with structured checklist), `/ttm-fix` (root-cause fix loop with re-produce and re-verify), and `/ttm-ship` (launch checklist with automated and manual checks).

</domain>

<decisions>
## Implementation Decisions

### Review Checklist Design
- **D-01:** Guided + open feedback format — display the 4 required review questions (positioning reinforcement, outcome realism, claim substantiation, competitor differentiation) as mandatory checkpoints PLUS a freeform text area for additional notes. Questions are required, notes are optional.
- **D-02:** Hero-first, then batch review — review the hero asset in full detail first (it anchors everything), then present derivative assets in a batch view with the hero as reference. Matches the produce order from Phase 4.
- **D-03:** Three review outcomes per asset: Approve (moves to ship-ready), Revise (structured feedback routes to /ttm-fix), Reject (kill the asset, log reason in campaign state — final, no fix loop).
- **D-04:** Summary + file link display — show the gate summary table + first ~500 chars of the asset, link to the full file for reading. User reads the full file in their editor, comes back to the review flow for decisions.

### Fix Loop Mechanics
- **D-05:** AI analysis + user confirm for root cause — Claude analyzes review feedback + gate failures + original brief to propose a root-cause diagnosis (from LEARNINGS.md taxonomy: positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue). User confirms or corrects before fix brief is generated.
- **D-06:** All 10 gates re-run every time after a fix — a fix for one issue could introduce another (e.g., fixing a weak hook might introduce positioning drift). Full re-verification catches regressions.
- **D-07:** Show each fix attempt to user — after each fix+verify cycle, present the result. User can intervene (approve if passing, adjust feedback, or let it try again). More control, more transparency.
- **D-08:** At 3-attempt cap, escalate with suggested manual edits — present all 3 attempts with their diagnoses, fix briefs, and gate results. Suggest specific edits the user could make manually based on the pattern of failures across attempts. Asset enters 'needs-human-fix' status. User can manually edit the file and re-run /ttm-verify.

### Ship Launch Checklist
- **D-09:** Dynamic checklist generated per campaign — checklist items are based on the campaign's channel mix, asset types, and brief. SEO campaign gets schema/sitemap checks; email campaign gets deliverability/dark-mode checks; social gets platform-specific items. More relevant, less noise.
- **D-10:** AI checks + human confirms — Claude auto-checks what it can (UTM format validity, tracking code presence in assets, link integrity). Presents results with checkboxes the user manually confirms. Unverifiable items (funnel tested, monitoring configured) are manual checkboxes.
- **D-11:** Per-asset ship status — each asset can be shipped independently. Campaign state tracks per-asset status (ship-ready, shipped, deferred). Allows staggered launches (blog first, social next week). /ttm-measure becomes available per-asset or when user decides.

### Review-to-Fix Handoff
- **D-12:** Structured feedback form on Revise — when marking an asset as 'Revise', the reviewer answers structured questions: which checklist items failed, freeform notes, severity level. This structured data becomes the fix brief input alongside gate results from VERIFICATION.md.
- **D-13:** Mixed outcomes in one review session — in one /ttm-review run, user can approve the hero, revise a social post, and reject an email. Each asset gets its own outcome independently. Approved assets advance immediately, revised ones queue for fix.
- **D-14:** Auto-approve after successful fix — if fix + re-verify passes all gates, auto-advance to ship-ready. Human already gave feedback in the first review; no need to re-review if gates confirm the fix worked.
- **D-15:** Auto-trigger fix from review — when user marks assets as 'Revise' during review, automatically launch /ttm-fix for those assets at the end of the review session. Seamless workflow, fewer commands to remember.

### Claude's Discretion
- Fix brief template structure — design based on what the re-produce context needs
- Review checklist rendering (AskUserQuestion vs text output) — follow existing pattern from Phase 4 verify
- Ship checklist item categories per channel — derive from CHANNELS.md and playbook knowledge
- Campaign state schema extensions for review/fix/ship tracking fields

</decisions>

<specifics>
## Specific Ideas

- Root-cause taxonomy in fix loop should use the same categories as LEARNINGS.md (positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue) so fix data feeds directly into the learning system in Phase 9
- Fix attempt history should persist in a per-asset FIX-LOG.md or similar — needed for escalation display and for LEARNINGS.md pattern extraction later
- Ship checklist should feel like a pre-flight checklist: clear items, binary pass/fail, no ambiguity about what's been checked
- Per-asset ship status enables staggered launches which is common in real marketing (blog post goes live, social posts scheduled for next week)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 Outputs (Direct Dependencies)
- `workflows/lifecycle/verify.md` — Verify workflow pattern (context loading, gate evaluation, deviation handling). Review presents verify results; Fix re-runs verify.
- `gates/base-gates.md` — 10 base quality gate definitions with PASS/WARN/FAIL criteria and tier classification
- `gates/gate-evaluation.md` — Per-gate evaluation prompting strategy and structured output format
- `skills/ttm-verify/SKILL.md` — Verify skill with context:fork — Fix must invoke this for re-verification

### Phase 3 Patterns (Campaign State)
- `workflows/lifecycle/brief.md` — Workflow pattern for context loading, state updates, gate checking
- `bin/lib/campaign.cjs` — Campaign CRUD operations — needs extension for review/fix/ship state fields
- `bin/ttm-tools.cjs` — CLI utility for state management, timestamps, deviation logging

### Existing Stubs
- `skills/ttm-review/SKILL.md` — Stub to be implemented (allowed-tools: Read Write Bash Glob Grep)
- `skills/ttm-fix/SKILL.md` — Stub to be implemented (allowed-tools: Read Write Bash Glob Grep Task)
- `skills/ttm-ship/SKILL.md` — Stub to be implemented (allowed-tools: Read Write Bash Glob Grep)

### Reference Files
- `references/context-loading.md` — Two-tier context loading strategy
- `templates/campaign-brief.md` — Brief template consumed by fix re-produce
- `.planning/REQUIREMENTS.md` — LIFE-10 through LIFE-13 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `workflows/lifecycle/verify.md` — Gate evaluation loop pattern, can be invoked from fix loop
- `gates/gate-evaluation.md` — Per-gate prompting strategy reused in fix re-verification
- `bin/lib/campaign.cjs` — Campaign state read/update for tracking review/fix/ship status
- `bin/ttm-tools.cjs deviation append` — DEVIATIONS.md logging for fix attempt tracking
- AskUserQuestion + text-mode fallback pattern from Phase 2/4

### Established Patterns
- Thin SKILL.md -> workflow routing (Phase 1 D-02)
- Soft gate with override option (Phase 3 D-05, Phase 4 D-04)
- Context isolation via `context: fork` for re-produce in fix (Phase 4 D-10)
- Supporting reference files via @-syntax to keep workflows under 500 lines
- DEVIATIONS.md append-only pattern (Phase 4)
- VERIFICATION.md overwrite-per-run pattern (Phase 4)

### Integration Points
- `workflows/lifecycle/` — review.md, fix.md, ship.md go here
- `.marketing/CAMPAIGNS/<slug>/ASSETS/` — assets being reviewed
- `.marketing/CAMPAIGNS/<slug>/STATE.md` — review/fix/ship status tracking
- `.marketing/CAMPAIGNS/<slug>/VERIFICATION.md` — gate results consumed by review
- `.marketing/CAMPAIGNS/<slug>/DEVIATIONS.md` — deviation log consumed by review and fix

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-review-fix-and-ship*
*Context gathered: 2026-04-28*
