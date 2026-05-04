---
phase: 11-gap-closure
plan: 02
subsystem: distribution-and-health
tags: [bug-fix, installer, health-check, gap-closure]
dependency_graph:
  requires: []
  provides: [agents-directory-install, complete-gate-allowlist]
  affects: [install.js, bin/lib/health.cjs]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - install.js
    - bin/lib/health.cjs
decisions: []
metrics:
  duration: 48s
  completed: "2026-05-04T12:14:55Z"
  tasks: 2
  files_modified: 2
---

# Phase 11 Plan 02: Install agents/ Directory and Health Gate Allowlist Summary

Fix install.js missing agents/ directory copy (B-02 blocker) and health.cjs incomplete gate value allowlist (W-01 warning) so npm/git-clone installs include all required directories and health checks do not produce false failures after deviation handling.

## One-liner

Added agents/ to installer DIRS_TO_COPY and fix_needed/accepted to health gate allowlist to unblock installs and eliminate false health failures.

## Changes Made

### Task 1: Add agents/ to DIRS_TO_COPY in install.js
- **Commit:** 21d0b81
- **Change:** Added `'agents'` to the `DIRS_TO_COPY` array in install.js
- **Effect:** npm and git-clone installs now copy the agents/ directory (containing ttm-producer.md) to the target. The existing `validateInstall` function automatically checks for agents/ presence since it iterates over DIRS_TO_COPY.

### Task 2: Add fix_needed and accepted to health.cjs validGateValues
- **Commit:** 7c2456e
- **Change:** Extended `validGateValues` Set from 4 values (`null`, `pass`, `warn`, `fail`) to 6 values (added `fix_needed`, `accepted`)
- **Effect:** Gate consistency checks in `/ttm-health` now recognize deviation handling outcomes. `fix_needed` is set when users choose "Correct" in verify deviation handling; `accepted` is set when users choose "Accept+log". Both are now valid gate values that do not trigger false consistency failures.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `grep "'agents'" install.js` | PASS - agents in DIRS_TO_COPY |
| `grep -c "DIRS_TO_COPY" install.js` returns 3 | PASS - no structural change |
| `grep "fix_needed" bin/lib/health.cjs` | PASS - in validGateValues |
| `grep "accepted" bin/lib/health.cjs` | PASS - in validGateValues |

## Self-Check: PASSED

- [x] install.js modified and committed (21d0b81)
- [x] bin/lib/health.cjs modified and committed (7c2456e)
- [x] Both commits exist in git log
- [x] No untracked files remaining
