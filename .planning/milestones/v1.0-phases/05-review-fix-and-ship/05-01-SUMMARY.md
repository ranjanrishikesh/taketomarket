---
phase: 05-review-fix-and-ship
plan: 01
subsystem: campaign-infrastructure
tags: [campaign-state, skill-config, review-checklist, ship-checklist, fix-template]

# Dependency graph
requires:
  - phase: 04-produce-and-verify
    provides: campaign.cjs ALLOWED_FIELDS pattern, SKILL.md stubs, verify workflow patterns
  - phase: 03-campaign-creation
    provides: campaign.cjs init and state management, bin/ttm-tools.cjs CLI
provides:
  - 9 review/fix/ship state fields registered in ALLOWED_FIELDS
  - 3 SKILL.md stubs finalized with correct allowed-tools for interactive workflows
  - Review checklist reference with 4 mandatory questions and revision feedback form
  - Ship checklist items reference with channel-specific lookup table (8 channel types)
  - Fix log template for append-only attempt tracking
  - Fix brief template for targeted re-production context
affects: [05-02 review workflow, 05-03 fix workflow, 05-04 ship workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AskUserQuestion in allowed-tools for interactive review/ship workflows"
    - "Task + AskUserQuestion combo for fix workflow (orchestration + interaction)"
    - "[AI]/[HUMAN] tagging for ship checklist items"

key-files:
  created:
    - references/review-checklist.md
    - references/ship-checklist-items.md
    - templates/fix-log.md
    - templates/fix-brief.md
  modified:
    - bin/lib/campaign.cjs
    - skills/ttm-review/SKILL.md
    - skills/ttm-fix/SKILL.md
    - skills/ttm-ship/SKILL.md

key-decisions:
  - "Review checklist extracted to reference file to keep review.md workflow under 500 lines"
  - "Ship checklist items tagged [AI]/[HUMAN] for dynamic auto-check vs manual-confirm split"
  - "Fix brief template includes both failure list AND preservation constraints to prevent oscillating gate regressions"
  - "Fix log is campaign-level (not per-asset) for cleaner escalation display"

patterns-established:
  - "Reference file for structured review questions (@-referenced from workflow)"
  - "Channel-specific checklist lookup table with AI/HUMAN tagging"
  - "Fix brief with failure/preservation/correction sections"
  - "Append-only fix log template with FIX ENTRIES delimiter"

requirements-completed: [LIFE-10, LIFE-11, LIFE-12, LIFE-13]

# Metrics
duration: 4min
completed: 2026-04-28
---

# Phase 5 Plan 1: Infrastructure Summary

**Campaign.cjs extended with 9 review/fix/ship state fields, 3 SKILL.md stubs finalized with AskUserQuestion, review checklist and ship checklist references created, fix log and fix brief templates created**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-28T08:57:32Z
- **Completed:** 2026-04-28T09:01:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Extended campaign.cjs ALLOWED_FIELDS and cmdCampaignInit with 9 new state fields for review/fix/ship tracking
- Finalized 3 SKILL.md stubs with correct allowed-tools (AskUserQuestion for all, Task for fix only)
- Created review-checklist.md with 4 mandatory questions, revision feedback form, and batch review format
- Created ship-checklist-items.md with 8 channel-specific sections and [AI]/[HUMAN] item tagging
- Created fix-log.md template with append-only structure and fix-brief.md template with failure/preservation/correction sections

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend campaign.cjs with review/fix/ship state fields and update SKILL.md stubs** - `9850b33` (feat)
2. **Task 2: Create reference files and templates for review/fix/ship workflows** - `a52dec8` (feat)

## Files Created/Modified
- `bin/lib/campaign.cjs` - Added 9 state fields to ALLOWED_FIELDS and cmdCampaignInit
- `skills/ttm-review/SKILL.md` - Added AskUserQuestion, removed stub status text
- `skills/ttm-fix/SKILL.md` - Added AskUserQuestion (Task already present), removed stub status text
- `skills/ttm-ship/SKILL.md` - Added AskUserQuestion, removed stub status text
- `references/review-checklist.md` - 4 mandatory review questions, revision feedback form, batch review format
- `references/ship-checklist-items.md` - Channel-specific ship checklist items (8 types) with [AI]/[HUMAN] tags
- `templates/fix-log.md` - Append-only fix attempt tracking template
- `templates/fix-brief.md` - Targeted fix brief with failure/preservation/correction sections

## Decisions Made
- Review checklist extracted to `references/review-checklist.md` as an @-reference file, keeping the future review.md workflow under the 500-line limit (RESEARCH.md Pitfall 7)
- Ship checklist items tagged [AI] or [HUMAN] to enable dynamic auto-check vs manual-confirm split in the ship workflow (D-10)
- Fix brief template includes explicit "What Passed (PRESERVE)" section to prevent oscillating gate regressions across fix attempts (RESEARCH.md Pitfall 3)
- Fix log is campaign-level (single FIX-LOG.md per campaign, not per-asset files) for cleaner escalation display (RESEARCH.md alternative analysis)

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- All 9 state fields registered -- workflows can call `campaign update` without "Unknown state field" errors
- All 3 SKILL.md stubs have correct allowed-tools -- workflows can use AskUserQuestion for interactive review/ship and Task for fix re-production
- Reference files ready for @-referencing from review.md and ship.md workflows
- Templates ready for fix.md workflow to instantiate fix logs and fix briefs
- Ready for Plan 02 (review workflow), Plan 03 (fix workflow), Plan 04 (ship workflow)

---
*Phase: 05-review-fix-and-ship*
*Completed: 2026-04-28*
