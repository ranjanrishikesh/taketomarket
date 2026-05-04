---
phase: 10-distribution-and-polish
plan: 04
subsystem: workflow
tags: [repurpose, task-orchestration, manifest, campaign, derivatives]

# Dependency graph
requires:
  - phase: 04-produce-verify
    provides: Task() hero-first then wave-parallel production pattern, MANIFEST.json schema
  - phase: 08-playbook-engine
    provides: Channel-specific playbooks for derivative production
provides:
  - cmdRepurposeManifest function for derivative source_asset_id tracking in MANIFEST.json
  - Full lifecycle repurpose workflow with hero-first Task() orchestration
  - Derivative brief generation cross-referencing CHANNELS.md
affects: [10-distribution-and-polish, ttm-repurpose-skill]

# Tech tracking
tech-stack:
  added: []
  patterns: [repurpose-manifest CLI subcommand, derivative brief generation, inline simplified verification]

key-files:
  created:
    - workflows/discipline/repurpose.md
  modified:
    - bin/lib/campaign.cjs
    - bin/ttm-tools.cjs

key-decisions:
  - "cmdRepurposeManifest appends to existing manifest derivatives array rather than replacing"
  - "Inline 3-gate simplified verification (positioning drift, format, voice) instead of full 10-gate verify"
  - "Derivative briefs written as separate files per channel for clear Task() context isolation"

patterns-established:
  - "Repurpose-manifest CLI pattern: campaign repurpose-manifest <slug> <source-id> <json>"
  - "Derivative naming convention: R-NN-channel-slug.md for repurposed assets"
  - "Hero derivative first (blocking), remaining wave-parallel via Task()"

requirements-completed: [UTIL-09]

# Metrics
duration: 4min
completed: 2026-05-04
---

# Phase 10 Plan 04: Repurpose Workflow Summary

**cmdRepurposeManifest for source_asset_id tracking plus full lifecycle repurpose.md with hero-first Task() orchestration and per-derivative brief-produce-verify**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-04T09:43:11Z
- **Completed:** 2026-05-04T09:47:48Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extended campaign.cjs with cmdRepurposeManifest that appends derivative entries with source_asset_id to MANIFEST.json
- Created 329-line repurpose.md workflow with 9-step lifecycle: load context, identify source, select channels, generate briefs, hero Task(), wave-parallel Task(), verify, update manifest, completion banner
- Registered repurpose-manifest subcommand in ttm-tools.cjs CLI router

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend campaign.cjs with source_asset_id MANIFEST support** - `c338688` (feat)
2. **Task 2: Create repurpose.md workflow with full lifecycle orchestration** - `c2356f3` (feat)

## Files Created/Modified
- `bin/lib/campaign.cjs` - Added cmdRepurposeManifest function with path traversal protection and MANIFEST.json read-parse-append-write
- `bin/ttm-tools.cjs` - Added repurpose-manifest subcommand routing with JSON argument parsing
- `workflows/discipline/repurpose.md` - Full 9-step repurpose workflow with Task() orchestration

## Decisions Made
- cmdRepurposeManifest creates a minimal manifest if none exists (fallback for edge cases where repurpose runs before produce)
- Each derivative entry gets both source_asset_id and derived_from fields for backward compatibility with existing manifest schema
- Inline verification uses 3 simplified gates (positioning, format, voice) rather than full 10-gate evaluation to keep repurpose workflow self-contained

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Initial repurpose.md was 441 lines (over 350 limit). Condensed verbose sections (brief template, placeholder lists, completion banner) while preserving all required functionality. Final: 329 lines.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- repurpose.md workflow is ready for routing from skills/ttm-repurpose/SKILL.md
- cmdRepurposeManifest integrates with existing MANIFEST.json schema
- Derivative briefs and Task() orchestration follow established produce.md patterns

---
*Phase: 10-distribution-and-polish*
*Completed: 2026-05-04*
