---
phase: 06-positioning-invariant-system
plan: 02
subsystem: positioning-audit
tags: [positioning-check, drift-audit, gate-01, report-format, trend-comparison]

# Dependency graph
requires:
  - phase: 06-positioning-invariant-system
    provides: drift-log.cjs and campaign list CLI primitives from Plan 01
provides:
  - positioning-check.md workflow with 9-step drift audit process
  - positioning-check-report.md reference with drift categories, formulas, report template
  - Updated ttm-positioning-check SKILL.md (stub removed)
affects: [06-03-positioning-shift-workflow]

# Tech tracking
tech-stack:
  added: []
  patterns: [gate-reuse-via-reference, report-extraction-to-reference-file, trend-comparison-from-audit-log]

key-files:
  created: [workflows/reference-mgmt/positioning-check.md, references/positioning-check-report.md]
  modified: [skills/ttm-positioning-check/SKILL.md]

key-decisions:
  - "Report format extracted to references/positioning-check-report.md to keep workflow under 500 lines (298 lines)"
  - "Trend comparison uses 5% threshold for UP/DOWN/STABLE classification"
  - "Accepted deviations still count toward aggregate drift (intentional drift is still drift)"
  - "Workflow outputs to stdout (cross-campaign scope, no single campaign directory)"

patterns-established:
  - "GATE-01 reuse via @gate-evaluation.md reference in audit workflows"
  - "Report format extraction to reference files for workflow line budget control"
  - "Trend arrow logic with configurable threshold for drift delta classification"

requirements-completed: [POSN-04]

# Metrics
duration: 3min
completed: 2026-04-28
---

# Phase 6 Plan 2: Positioning Drift Audit Workflow Summary

**Cross-campaign positioning drift audit workflow with GATE-01 reuse, time-window sampling, per-asset and aggregate drift reporting, trend comparison, and DRIFT-LOG.md logging**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-28T12:49:35Z
- **Completed:** 2026-04-28T12:52:27Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Created positioning-check-report.md reference with drift categories (differentiator alignment, proof point sourcing, must-not-say compliance), per-asset and aggregate drift calculation formulas, report template, trend comparison logic, and cross-reference handling
- Created positioning-check.md workflow with 9-step audit process: context loading, time window parsing, campaign/asset enumeration via CLI, GATE-01 3-check evaluation, aggregate calculation, trend comparison from DRIFT-LOG.md, report generation, audit logging via CLI, completion banner
- Updated ttm-positioning-check SKILL.md from stub to final (removed "Not yet implemented" status line)
- Workflow stays at 298 lines (well under 500-line limit per Pitfall 4)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create positioning-check-report.md reference and positioning-check.md workflow** - `8269d65` (feat)

## Files Created/Modified

- `references/positioning-check-report.md` - Drift categories, per-asset/aggregate drift calculation formulas, report template, trend comparison logic, cross-reference handling, status thresholds
- `workflows/reference-mgmt/positioning-check.md` - 9-step positioning drift audit workflow with GATE-01 reuse, CLI-based campaign enumeration and drift-log append, trend comparison
- `skills/ttm-positioning-check/SKILL.md` - Updated from stub to final (removed "Not yet implemented" status)

## Decisions Made

- Report format extracted to positioning-check-report.md to keep workflow under 500 lines (298 actual)
- Trend comparison uses 5% threshold for UP/DOWN/STABLE classification
- Accepted deviations from campaign DEVIATIONS.md files still count toward aggregate drift percentage
- Workflow outputs report to stdout since it is cross-campaign scope with no single campaign directory

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Positioning-check workflow ready for manual invocation and ship.md auto-suggest trigger
- Report format reference available for any future audit-style workflows
- GATE-01 reuse pattern established for positioning-shift workflow (06-03)

## Self-Check: PASSED

- [x] workflows/reference-mgmt/positioning-check.md exists (298 lines, under 500)
- [x] references/positioning-check-report.md exists
- [x] skills/ttm-positioning-check/SKILL.md updated (no "Not yet implemented")
- [x] Commit 8269d65 found (Task 1)
- [x] 06-02-SUMMARY.md exists

---
*Phase: 06-positioning-invariant-system*
*Completed: 2026-04-28*
