---
phase: 05-review-fix-and-ship
plan: 02
subsystem: campaign-lifecycle
tags: [review-workflow, human-review, quality-gate, asset-review, structured-feedback]

# Dependency graph
requires:
  - phase: 05-review-fix-and-ship
    plan: 01
    provides: review-checklist.md reference, campaign.cjs review state fields, SKILL.md stubs
  - phase: 04-produce-and-verify
    provides: verify.md workflow pattern, MANIFEST.json format, VERIFICATION.md format
provides:
  - Complete /ttm-review workflow with hero-first structured review
  - Per-asset Approve/Revise/Reject outcome collection
  - Structured revision feedback files (REVIEW-FEEDBACK-*.md)
  - MANIFEST.json review_status integration
  - Campaign state review tracking
affects: [05-03 fix workflow, 05-04 ship workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hero-first then batch derivative review ordering"
    - "Per-asset structured revision feedback files (REVIEW-FEEDBACK-*.md)"
    - "MANIFEST.json extended with review_status and review_feedback_file"
    - "Review-to-fix handoff via user instruction (D-15)"

key-files:
  created:
    - workflows/lifecycle/review.md
  modified: []

key-decisions:
  - "Review workflow uses @-reference to review-checklist.md for question content (keeps workflow at 420 lines)"
  - "Revision feedback stored as per-asset REVIEW-FEEDBACK-[NAME].md files in campaign directory"
  - "MANIFEST.json extended with review_status and review_feedback_file fields per asset"
  - "Auto-trigger /ttm-fix is an instruction to user, not a direct invocation (review is not forked)"

patterns-established:
  - "Hero-first full-detail review then batch derivative abbreviated review"
  - "Per-asset feedback files as fix loop input (REVIEW-FEEDBACK-*.md)"
  - "MANIFEST.json as per-asset status tracker (review_status, review_feedback_file)"

requirements-completed: [LIFE-10]

# Metrics
duration: 2min
completed: 2026-04-28
---

# Phase 5 Plan 2: Review Workflow Summary

**Complete /ttm-review workflow with hero-first structured review, 4-question checklist, per-asset Approve/Revise/Reject outcomes, and auto-trigger fix instruction**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-28T09:03:24Z
- **Completed:** 2026-04-28T09:05:41Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created review.md workflow (420 lines, under 500-line limit) following verify.md structural pattern
- Hero-first review with full gate summary table and 500-char content preview, then batch derivatives with abbreviated view
- 4 mandatory review questions per asset with AskUserQuestion and text-mode fallback
- Per-asset outcome collection (Approve/Revise/Reject) with structured revision feedback on Revise
- MANIFEST.json updated with review_status and review_feedback_file per asset
- Campaign state updated with review.run_count, review.last_run, review.overall_result
- Auto-trigger /ttm-fix instruction for revised assets per D-15

## Task Commits

Each task was committed atomically:

1. **Task 1: Create review.md workflow with hero-first review, structured checklist, and per-asset outcomes** - `e5ff2d5` (feat)

## Files Created/Modified
- `workflows/lifecycle/review.md` - Complete review workflow: hero-first structured review with 4-question checklist, per-asset outcomes, revision feedback collection, MANIFEST.json updates, campaign state tracking, and auto-trigger fix instruction

## Decisions Made
- Review workflow references review-checklist.md via @-syntax for question content, keeping the workflow at 420 lines (well under 500-line limit)
- Revision feedback stored as per-asset files (REVIEW-FEEDBACK-[NAME].md) in the campaign directory, providing clean input for the fix loop
- MANIFEST.json extended with review_status and review_feedback_file fields rather than tracking per-asset status in STATE.md frontmatter (avoids field explosion per RESEARCH.md Pitfall 5)
- Auto-trigger /ttm-fix is a user-facing instruction, not a direct invocation, since review.md runs in the user's conversation context (not forked) and cannot directly invoke a separate command

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- review.md workflow complete and follows established verify.md/produce.md patterns
- MANIFEST.json review_status fields ready for consumption by fix.md and ship.md
- REVIEW-FEEDBACK-*.md files provide structured input for the fix loop's root cause analysis
- Ready for Plan 03 (fix workflow) and Plan 04 (ship workflow)

---
*Phase: 05-review-fix-and-ship*
*Completed: 2026-04-28*
