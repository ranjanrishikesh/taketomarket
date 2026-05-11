---
phase: 13-unit-tests-for-bin-lib-modules
plan: 04
subsystem: testing
tags: [node-test, campaign-crud, manifest, archive, cjs, unit-tests]

# Dependency graph
requires:
  - phase: 12-test-infrastructure-and-installer-refactor
    provides: test infrastructure (helpers.cjs, node:test runner, test patterns)
provides:
  - Unit tests for all 6 campaign.cjs exports (cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate, cmdCampaignList, cmdCampaignArchive, cmdRepurposeManifest)
  - createMockCampaign helper for downstream phase 14 tests
affects: [13-unit-tests-for-bin-lib-modules]

# Tech tracking
tech-stack:
  added: []
  patterns: [exit-error-sentinel, per-describe-temp-dir-isolation, cwd-override-for-module-testing, captureJson-helper]

key-files:
  created: [test/campaign.test.cjs]
  modified: [test/helpers.cjs]

key-decisions:
  - "Introduced ExitError sentinel thrown by mocked process.exit so error() halts execution instead of falling through into destructive side-effects (e.g. cmdCampaignArchive copying CAMPAIGNS into ARCHIVE before exit fires)"
  - "Each describe block owns its temp dir + cwd override -- prevents cross-test interference (init/list/archive each see their own .marketing/)"
  - "captureJson scans stdout calls in reverse, parses last JSON-shaped chunk -- robust against concurrent output() and error() writes"

patterns-established:
  - "ExitError sentinel pattern: swap default no-op exit mock with one that throws ExitError(code); assertExits() catches the sentinel and asserts exit code"
  - "createMockCampaign(baseDir, slug, opts): minimal STATE.md frontmatter writer for pre-existing campaign fixtures"

requirements-completed: [TEST-01, TEST-04]

# Metrics
duration: 7min
completed: 2026-05-11
---

# Phase 13 Plan 04: Campaign Module Tests Summary

**36 passing tests across 7 describe blocks for campaign.cjs (553 lines, 6 exports). Covers init/state/update/list/archive/repurpose CRUD flow with disk verification, ALLOWED_FIELDS rejection, --active filter, shipped/learned archive eligibility, MANIFEST.json append + duplicate detection. test/helpers.cjs gains createMockCampaign for phase 14 reuse.**

## Performance

- **Duration:** ~7 min (including interruption + resume)
- **Tasks:** 2 (helpers.cjs extension + campaign.test.cjs)
- **Files created:** 1
- **Files modified:** 1

## Accomplishments

- 36 unit tests across 7 suites, 0 failures
- Module-level export check (all 6 functions present)
- cmdCampaignInit: dir structure, raw mode, frontmatter content, slug sanitization, EEXIST duplicate, empty slug, empty name
- cmdCampaignState: frontmatter JSON, body_preview, not-found path, raw mode
- cmdCampaignUpdate: field write + disk verification, last_updated ISO format, ALLOWED_FIELDS gate, gate.* prefix accepted, missing field/value/campaign error paths
- cmdCampaignList: no-filter list, --active filter (briefed/produced/verified/reviewed/shipped), raw count, missing CAMPAIGNS/ dir, --active+--since mutual exclusion
- cmdCampaignArchive: shipped → ARCHIVE/, archive.archived_at injection, learned eligibility, non-archivable phase rejection, empty/missing slug
- cmdRepurposeManifest: MANIFEST.json create + append, source_asset_id linkage, duplicate asset_id rejection, slug/sourceAssetId/derivatives validation
- test/helpers.cjs extended with createMockCampaign (backward compatible — existing 8 install tests still pass)

## Task Commits

1. **Task 1: Extend test/helpers.cjs with createMockCampaign** — `60a03a5` (feat)
2. **Task 2: Create test/campaign.test.cjs with tests for all 6 exports** — `ff4e8f5` (test)

## Files Created/Modified

- `test/campaign.test.cjs` — 562 lines, 36 tests across 7 describe blocks
- `test/helpers.cjs` — added `createMockCampaign(baseDir, slug, opts)` with `extraFields` option

## Decisions Made

- **ExitError sentinel** over plain `mock.method(process, 'exit', () => {})`: when error() returns instead of exiting, code paths in cmdCampaignArchive continued running fs.cpSync and contaminated the test temp dir. Throwing ExitError from the exit mock halts execution at the first error() call, matching real production behavior.
- **Per-describe temp dir + cwd override** rather than shared fixture: cmdCampaignArchive moves directories, cmdCampaignList counts directories, cmdCampaignInit creates them — sharing state would couple test ordering.
- **captureJson reverse-scan** rather than first-match: error tests still trigger an error message before exit, so the last stdout chunk is the one we want.

## Deviations from Plan

None. Plan executed as written.

## Issues Encountered

- Original parallel agent (addb07a8) was interrupted by user mid-task after a Bash permission denial. Helpers.cjs commit had landed; campaign.test.cjs file was already on disk in the worktree but uncommitted. Resumed inline by verifying tests pass and committing.

## User Setup Required

None.

## Next Phase Readiness

- All 4 bin/lib modules now have unit test coverage (core, slug, state, commit, health, campaign — phase 13's full scope)
- createMockCampaign helper ready for phase 14 (likely produce/verify integration tests that need pre-existing campaigns)
- ExitError sentinel pattern documented and reusable for any future test against modules that call error()

## Self-Check: PASSED

- [x] test/campaign.test.cjs exists and starts with `'use strict';`
- [x] File contains `require('../bin/lib/campaign.cjs')`
- [x] All 6 describe blocks present (Init, State, Update, List, Archive, RepurposeManifest)
- [x] File contains `createMockCampaign` usage from helpers
- [x] `node --test test/campaign.test.cjs` exits with code 0 (36/36 pass)
- [x] `node --test test/install.test.cjs` still passes (8/8, helpers backward compatible)
- [x] Commits ff4e8f5 (test) and 60a03a5 (helpers extension) exist in git log
- [x] 13-04-SUMMARY.md committed

---
*Phase: 13-unit-tests-for-bin-lib-modules*
*Completed: 2026-05-11*
