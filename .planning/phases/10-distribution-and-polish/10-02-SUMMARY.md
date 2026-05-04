---
phase: 10-distribution-and-polish
plan: 02
subsystem: workflows
tags: [reference-mgmt, brand, icp, competitors, mcp-detection, positioning-invariant]

# Dependency graph
requires:
  - phase: 06-positioning-invariant
    provides: positioning-shift.md structural pattern, POSITIONING.md read-only constraint
  - phase: 03-research-and-brief
    provides: research.md MCP tool detection pattern (WebSearch/WebFetch)
provides:
  - brand-refresh.md workflow for /ttm-brand-refresh skill
  - icp-refresh.md workflow for /ttm-icp-refresh skill
  - competitor-scan.md workflow for /ttm-competitor-scan skill
affects: [10-distribution-and-polish, README documentation]

# Tech tracking
tech-stack:
  added: []
  patterns: [reference-file-refresh-workflow, mcp-tool-detection-for-utility-commands]

key-files:
  created:
    - workflows/reference-mgmt/brand-refresh.md
    - workflows/reference-mgmt/icp-refresh.md
    - workflows/reference-mgmt/competitor-scan.md
  modified: []

key-decisions:
  - "All 3 workflows follow positioning-shift.md XML structure exactly (purpose/required_reading/constraints/process)"
  - "competitor-scan loads Tier 2 for both COMPETITORS.md and POSITIONING.md (needs both for comparison)"
  - "brand-refresh marks deprecated proof points with [DEPRECATED: date, reason] suffix rather than deleting rows"

patterns-established:
  - "Reference refresh workflow pattern: load context -> display current state -> gather updates -> validate against positioning -> write file"
  - "MCP tool detection reuse: competitor-scan follows research.md SEARCH_MODE=web/manual pattern"

requirements-completed: [UTIL-01, UTIL-02, UTIL-03]

# Metrics
duration: 4min
completed: 2026-05-04
---

# Phase 10 Plan 02: Reference Management Utility Workflows Summary

**Three single-pass reference management workflows (brand-refresh, icp-refresh, competitor-scan) with positioning-invariant validation and MCP tool detection for competitor research**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-04T09:42:49Z
- **Completed:** 2026-05-04T09:46:59Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created brand-refresh.md workflow that updates BRAND.md with proof point deprecation, new entries, and voice/tone changes
- Created icp-refresh.md workflow that updates ICP.md from customer data (calls, reviews, feedback, surveys)
- Created competitor-scan.md with WebSearch/WebFetch MCP tool detection and graceful manual paste fallback
- All three enforce POSITIONING.md as READ-ONLY with validation before writing
- All three include Text-Mode Detection and two-tier context loading

## Task Commits

Each task was committed atomically:

1. **Task 1: Create brand-refresh.md and icp-refresh.md** - `64ce1f9` (feat)
2. **Task 2: Create competitor-scan.md with MCP tool detection** - `6746f9c` (feat)

## Files Created/Modified
- `workflows/reference-mgmt/brand-refresh.md` - Single-pass brand refresh with proof point deprecation and voice/tone updates
- `workflows/reference-mgmt/icp-refresh.md` - Single-pass ICP refresh from customer data with JTBD, pains, language library
- `workflows/reference-mgmt/competitor-scan.md` - Competitor analysis with web/manual research modes and confidence tagging

## Decisions Made
- All 3 workflows follow the positioning-shift.md XML structure exactly (purpose, required_reading, constraints, process sections)
- competitor-scan loads Tier 2 for both COMPETITORS.md and POSITIONING.md since comparison requires full content of both
- brand-refresh uses [DEPRECATED: YYYY-MM-DD, reason] suffix on proof points rather than deleting rows to preserve history

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 3 reference management SKILL.md stubs now have corresponding workflow files
- Skills are routable: /ttm-brand-refresh, /ttm-icp-refresh, /ttm-competitor-scan
- Ready for discipline audit workflows (Plan 10-03) which follow similar patterns

---
*Phase: 10-distribution-and-polish*
*Completed: 2026-05-04*
