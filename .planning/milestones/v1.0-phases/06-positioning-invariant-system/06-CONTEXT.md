# Phase 6: Positioning Invariant System - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Positioning is enforced as an architectural invariant across every campaign phase, with controlled shift workflows when repositioning is needed. This phase delivers 2 commands: `/ttm-positioning-check` (drift audit sampling recent assets with trend tracking) and `/ttm-positioning-shift` (controlled repositioning with migration plan, deprecation schedule, and mandatory human approval). It also adds read-only enforcement for POSITIONING.md and a persistent positioning drift log.

</domain>

<decisions>
## Implementation Decisions

### Drift Audit Scope (/ttm-positioning-check)
- **D-01:** Time-window based sampling -- sample all assets produced in the last 30 days (or configurable window). Naturally scales with activity level. Covers all campaigns within the window.
- **D-02:** Auto-suggest after milestones -- after every 3rd campaign ships, Claude suggests running a positioning check. Not forced, just a nudge. The SKILL.md already has `disable-model-invocation: false` to enable this.
- **D-03:** Audit output includes: per-asset drift percentage, types of drift detected (using existing GATE-01 categories from gate-evaluation.md), aggregate drift % across the sample, and trend comparison to last audit if available.

### Shift Workflow Gates (/ttm-positioning-shift)
- **D-04:** Audit + recommend for in-flight campaigns -- scan all active campaigns, flag which assets conflict with new positioning, recommend per-asset action (re-verify, re-produce, or accept-as-is). User decides per campaign. No automatic quarantine.
- **D-05:** Deprecation schedule for shipped assets -- user sets a deprecation timeline for old-positioning assets (e.g., "update blog posts within 90 days"). Tracked in a deprecation backlog within DRIFT-LOG.md.
- **D-06:** Shift workflow requires: (1) explicit reasoning for the change, (2) what the new positioning is (full structured fields), (3) migration plan for active campaigns, (4) deprecation schedule for shipped assets, (5) mandatory human approval gate before any file is modified.
- **D-07:** After approval, POSITIONING.md is updated atomically -- old positioning is archived in the History table, new positioning becomes active. All subsequent campaign phases use new positioning.

### Read-Only Enforcement
- **D-08:** State-based gate -- campaign.cjs checks if any campaigns are in active phases (briefed through shipped). If yes, any attempt to write POSITIONING.md triggers a warning + redirect to /ttm-positioning-shift.
- **D-09:** "Any active campaign" scope -- if ANY campaign exists in briefed/produced/verified/reviewed/shipped state, positioning is locked. Most conservative approach. Only /ttm-positioning-shift can modify it.
- **D-10:** Enforcement implemented at the prompt/workflow level -- campaign workflows include explicit read-only instructions. Additionally, /ttm-positioning-shift checks campaign state via campaign.cjs before allowing changes (warns if active campaigns exist and requires migration plan).
- **D-11:** When no active campaigns exist, POSITIONING.md can still only be modified via /ttm-positioning-shift or /ttm-init. Direct edits are discouraged by workflow instructions but not filesystem-blocked (this is a skill, not a daemon).

### Drift Log Design
- **D-12:** Dual log approach -- POSITIONING.md History table for intentional shifts only (the "official record"). Separate `.marketing/DRIFT-LOG.md` for ALL drift events including accepted deviations from verify. Different audiences: History table for quick reference, DRIFT-LOG.md for full audit trail.
- **D-13:** Everything logged -- shifts, audit findings (/ttm-positioning-check results with drift % over time), AND cross-references to per-campaign accepted deviations (from DEVIATIONS.md). Complete positioning audit trail.
- **D-14:** DRIFT-LOG.md is append-only. Each entry includes: date, event type (shift/audit/deviation), source (which command or campaign), details, and affected assets count.

### Claude's Discretion
- Positioning-check report format -- design the audit report layout and drift categorization
- Migration plan template structure -- how to present per-campaign recommendations during a shift
- Deprecation backlog format within DRIFT-LOG.md
- How to detect the "3rd campaign shipped" milestone for auto-suggest (campaign state enumeration)
- Whether /ttm-positioning-check should reuse gate-evaluation.md GATE-01 directly or have its own evaluation prompts (likely reuse for consistency)

</decisions>

<specifics>
## Specific Ideas

- The drift audit should reuse the same GATE-01 evaluation logic from gate-evaluation.md to ensure consistency between verify-time checks and audit-time checks
- Auto-suggest after 3 campaigns should use campaign state enumeration from campaign.cjs -- count campaigns with `phase.shipped` set since last audit
- Deprecation schedule should feel like a project management backlog: asset name, old positioning element, required update, deadline, status (pending/updated/expired)
- The shift workflow should show a before/after diff of POSITIONING.md fields so the user can see exactly what changed

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Positioning Infrastructure
- `templates/reference-files/positioning.md` -- POSITIONING.md template with _SUMMARY/END_SUMMARY structure, History table, proof point library, must-not-say terms
- `references/context-loading.md` -- Two-tier context loading strategy; POSITIONING.md loaded as Tier 1 in every workflow, Tier 2 in produce/verify/positioning-check
- `workflows/lifecycle/brief-positioning-check.md` -- 5-check positioning gate used during brief generation (soft gate pattern)
- `gates/gate-evaluation.md` -- GATE-01 Positioning Drift evaluation instructions (full POSITIONING.md loaded, 3-point check)
- `gates/base-gates.md` -- Gate 1 definition: positioning drift checks, Tier 1 blocking

### Campaign State Infrastructure
- `bin/lib/campaign.cjs` -- Campaign CRUD operations, state fields including `gate.positioning_check`, `gate.positioning_drift`
- `bin/ttm-tools.cjs` -- CLI utility for state management, timestamps, campaign enumeration
- `bin/lib/deviation.cjs` -- Deviation logging (DEVIATIONS.md) -- accepted deviations that should cross-reference into DRIFT-LOG.md

### Existing Stubs (to be implemented)
- `skills/ttm-positioning-check/SKILL.md` -- Stub with `disable-model-invocation: false`, routes to `workflows/reference-mgmt/positioning-check.md`
- `skills/ttm-positioning-shift/SKILL.md` -- Stub with `disable-model-invocation: true`, routes to `workflows/reference-mgmt/positioning-shift.md`

### Phase 4/5 Patterns (Deviation Handling)
- `workflows/lifecycle/verify.md` -- Escalate option launches /ttm-positioning-shift, pauses verification
- `workflows/lifecycle/fix.md` -- Fix loop with re-verification pattern
- `.planning/REQUIREMENTS.md` -- POSN-01 through POSN-05 requirement definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `gates/gate-evaluation.md` GATE-01 section -- reuse for /ttm-positioning-check drift evaluation
- `workflows/lifecycle/brief-positioning-check.md` -- 5-check pattern adaptable for audit
- `bin/lib/campaign.cjs` -- campaign state enumeration (list all campaigns, filter by phase status)
- `bin/lib/deviation.cjs` -- DEVIATIONS.md append pattern for DRIFT-LOG.md
- AskUserQuestion + text-mode fallback pattern from Phase 2/4/5

### Established Patterns
- Thin SKILL.md -> workflow routing (Phase 1 D-02)
- Soft gate with override option (Phase 3 D-05, Phase 4 D-04)
- Supporting reference files via @-syntax to keep workflows under 500 lines
- DEVIATIONS.md append-only pattern (Phase 4) -- reuse for DRIFT-LOG.md
- Campaign state field tracking via `campaign update` CLI (Phase 3/4/5)

### Integration Points
- `workflows/reference-mgmt/` -- positioning-check.md and positioning-shift.md go here
- `.marketing/POSITIONING.md` -- read by every workflow, modified only by shift
- `.marketing/DRIFT-LOG.md` -- new file, append-only audit trail
- `bin/lib/campaign.cjs` -- needs extension for read-only enforcement check (any active campaigns?)
- All existing campaign workflows -- need read-only instruction additions for POSITIONING.md

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 06-positioning-invariant-system*
*Context gathered: 2026-04-28*
