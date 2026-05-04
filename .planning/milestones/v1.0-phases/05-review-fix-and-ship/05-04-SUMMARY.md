---
phase: 05-review-fix-and-ship
plan: 04
subsystem: campaign-lifecycle
tags: [ship-workflow, launch-checklist, dynamic-checklist, UTM-validation, per-asset-shipping]

# Dependency graph
requires:
  - phase: 05-review-fix-and-ship
    plan: 01
    provides: ship-checklist-items.md reference, campaign.cjs ship state fields, SKILL.md stubs
  - phase: 05-review-fix-and-ship
    plan: 02
    provides: review.md workflow, MANIFEST.json review_status integration
  - phase: 04-produce-and-verify
    provides: verify.md workflow pattern, MANIFEST.json format, VERIFICATION.md format
provides:
  - Complete /ttm-ship workflow with dynamic launch checklist per channel mix
  - AI auto-checks for UTM validation, draft markers, verification status, review status
  - Channel-specific AI checks for 7 asset types (blog, email, LinkedIn, social, landing page, video, paid ads)
  - Human confirmation prompts for unverifiable items
  - Per-asset ship status tracking (ship_status, shipped_at) in MANIFEST.json
  - Campaign state updates (ship.status, ship.shipped_at, ship.checklist_result)
affects: [phase-09 measure workflow, phase-09 learn workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dynamic checklist generation from channel mix + ship-checklist-items.md lookup"
    - "[AI]/[HUMAN] split: automated verification for verifiable items, user confirmation for unverifiable"
    - "Per-asset ship status in MANIFEST.json (ship_status, shipped_at) for staggered launches"
    - "Ship decision with documented exceptions support"

key-files:
  created:
    - workflows/lifecycle/ship.md
  modified: []

key-decisions:
  - "Ship workflow references ship-checklist-items.md via @-syntax for checklist definitions (keeps workflow at 485 lines)"
  - "Checklist sections dynamically included only for asset types present in ship-ready list (D-09)"
  - "Human confirmations grouped by section to reduce interaction fatigue"
  - "Ship with documented exceptions allowed after user confirmation"

patterns-established:
  - "Dynamic checklist assembly from reference file based on campaign channel mix"
  - "AI auto-check + human confirm split for launch readiness verification"
  - "Per-asset staggered shipping with partial ship status support"

requirements-completed: [LIFE-13]

# Metrics
duration: 3min
completed: 2026-04-28
---

# Phase 5 Plan 4: Ship Workflow Summary

**Complete /ttm-ship workflow with dynamic channel-specific launch checklist, AI auto-checks for UTMs/draft markers/gate status, human confirmations for unverifiable items, and per-asset staggered shipping**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-28T09:12:50Z
- **Completed:** 2026-04-28T09:16:01Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created ship.md workflow (485 lines, under 500-line limit) following verify.md and review.md structural patterns
- Dynamic launch checklist generated from campaign channel mix by matching asset types to ship-checklist-items.md sections (D-09)
- AI auto-checks for universal items: UTM parameter validity, draft marker detection, verification status, review status (D-10)
- Channel-specific AI checks for 7 asset types: blog/SEO, email, LinkedIn, social/Twitter, landing page, video/YouTube, paid ads
- Human confirmation prompts via AskUserQuestion with text-mode fallback, grouped by section to reduce fatigue
- Per-asset ship_status and shipped_at tracking in MANIFEST.json for staggered launches (D-11)
- Ship decision flow: all-clear proceeds directly, blockers allow ship-with-exceptions or resolve-first
- Campaign state updates: ship.status, ship.shipped_at, ship.checklist_result, phase advancement to "shipped"

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ship.md workflow with dynamic checklist, AI auto-checks, human confirms, and per-asset shipping** - `6ebb41f` (feat)

## Files Created/Modified
- `workflows/lifecycle/ship.md` - Complete ship workflow: dynamic launch checklist from channel mix, AI auto-checks for UTMs/draft markers/verification/review status, channel-specific checks for 7 asset types, human confirmation for unverifiable items, per-asset ship status, campaign state updates, staggered launch support

## Decisions Made
- Ship workflow references ship-checklist-items.md via @-syntax in required_reading, keeping the workflow under the 500-line limit (485 lines)
- Checklist sections are dynamically included only for asset types present in the ship-ready asset list, not a hardcoded full list (D-09)
- Human confirmations grouped by section to reduce interaction fatigue (e.g., all universal human checks presented together)
- Ship with documented exceptions is supported after explicit user confirmation, allowing pragmatic launches

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- ship.md workflow complete and follows established verify.md/review.md patterns
- All three Phase 5 workflows (review.md, fix.md, ship.md) now complete
- MANIFEST.json ship_status and shipped_at fields ready for Phase 9 measure workflow
- Phase 5 review-fix-and-ship is fully implemented: LIFE-10, LIFE-11, LIFE-12, LIFE-13 all addressed
- Ready for phase transition to Phase 6 (Positioning Invariant) or Phase 7 (State and Recovery)

---
*Phase: 05-review-fix-and-ship*
*Completed: 2026-04-28*
