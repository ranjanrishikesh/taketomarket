---
phase: 05-review-fix-and-ship
plan: 03
subsystem: campaign-lifecycle
tags: [fix-workflow, root-cause-analysis, re-production, re-verification, quality-gate, task-subagent]

# Dependency graph
requires:
  - phase: 05-review-fix-and-ship
    plan: 01
    provides: fix-brief.md template, fix-log.md template, campaign.cjs fix state fields, SKILL.md stubs
  - phase: 05-review-fix-and-ship
    plan: 02
    provides: review.md workflow, MANIFEST.json review_status, REVIEW-FEEDBACK-*.md files
  - phase: 04-produce-and-verify
    provides: verify.md gate evaluation pattern, produce.md Task() pattern, gate-evaluation.md, ttm-producer.md
provides:
  - Complete /ttm-fix workflow with root-cause analysis, fix brief generation, Task() re-production, 10-gate re-verification, 3-attempt cap with escalation
  - FIX-LOG.md append-only audit trail for fix attempts
  - FIX-BRIEF-*-attempt-*.md persistent fix briefs per attempt
  - MANIFEST.json update with fix_attempts and final review_status
affects: [05-04 ship workflow, phase-09 learn workflow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Root cause analysis with 7-category taxonomy from LEARNINGS.md"
    - "Fix brief with failure/preservation/correction sections to prevent oscillating regressions"
    - "Task() re-production with fix brief path as [BRIEF_PATH] (not original brief)"
    - "Inline 10-gate re-verification following verify.md pattern (no double-fork)"
    - "3-attempt cap with escalation display and suggested manual edits"

key-files:
  created:
    - workflows/lifecycle/fix.md
  modified: []

key-decisions:
  - "Inline re-verification in fix.md rather than invoking /ttm-verify via Task() (avoids double-fork, maintains loop state)"
  - "Fix briefs stored persistently as FIX-BRIEF-ASSET_ID-attempt-N.md for escalation display and Phase 9 learning extraction"
  - "Preservation constraints (passing gates) included in fix brief as hard requirements to prevent oscillating regressions"
  - "Before/after gate comparison table shown to user at each iteration for transparency"

patterns-established:
  - "Root-cause-then-fix-brief pattern: analyze -> confirm with user -> generate targeted brief -> re-produce"
  - "Loop-with-cap pattern: while attempt < 3 with user intervention options (continue/approve/adjust)"
  - "Escalation pattern: 3-attempt cap -> display all attempt histories -> suggest manual edits -> needs-human-fix status"

requirements-completed: [LIFE-11, LIFE-12]

# Metrics
duration: 3min
completed: 2026-04-28
---

# Phase 5 Plan 3: Fix Workflow Summary

**Complete /ttm-fix workflow with 7-category root-cause analysis, targeted fix briefs with preservation constraints, Task() re-production, 10-gate re-verification per attempt, and 3-attempt cap with escalation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-28T09:08:51Z
- **Completed:** 2026-04-28T09:11:28Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created fix.md workflow (483 lines, under 500-line limit) following verify.md and produce.md structural patterns
- Root cause analysis with 7-category taxonomy (positioning-drift, weak-hook, wrong-channel, bad-timing, unverifiable-claim, broken-funnel, creative-fatigue) with user confirmation
- Fix brief generation with failure list, preservation constraints (Pitfall 3 prevention), and specific corrections
- Task() re-production using fix brief path as [BRIEF_PATH], not original BRIEF.md (Pitfall 1 prevention)
- All 10 gates re-verified after each fix attempt per gate-evaluation.md pattern (D-06)
- Before/after gate comparison table displayed per iteration (D-07)
- Auto-approve to ship-ready on successful fix (D-14)
- 3-attempt cap with full escalation display: all attempt histories, failure pattern analysis, and suggested manual edits (D-08, LIFE-12)
- FIX-LOG.md append-only tracking and MANIFEST.json update with fix_attempts and review_status

## Task Commits

Each task was committed atomically:

1. **Task 1: Create fix.md workflow with root-cause loop, Task() re-production, re-verification, and 3-attempt cap** - `6aba50d` (feat)

## Files Created/Modified
- `workflows/lifecycle/fix.md` - Complete fix loop workflow: root cause analysis, fix brief generation, Task() re-production, 10-gate re-verification, result display per attempt, auto-approve on success, 3-attempt cap with escalation, FIX-LOG.md persistence, MANIFEST.json and campaign state updates

## Decisions Made
- Inline re-verification in fix.md rather than invoking /ttm-verify via Task(), avoiding double-fork complexity and maintaining loop state across attempts (RESEARCH.md Open Question 3 recommendation)
- Fix briefs stored persistently as FIX-BRIEF-ASSET_ID-attempt-N.md, enabling escalation display and Phase 9 learning extraction (RESEARCH.md Open Question 2 recommendation)
- Preservation constraints (passing gates) included in fix brief as hard requirements, preventing the oscillating regression anti-pattern where fixing one gate breaks another (RESEARCH.md Pitfall 3)
- Before/after gate comparison table shown at each iteration for full transparency per D-07

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness
- fix.md workflow complete and follows established verify.md/produce.md patterns
- MANIFEST.json review_status and fix_attempts fields ready for consumption by ship.md
- FIX-LOG.md provides audit trail for Phase 9 learning extraction
- Ready for Plan 04 (ship workflow) which can run in parallel

---
*Phase: 05-review-fix-and-ship*
*Completed: 2026-04-28*
