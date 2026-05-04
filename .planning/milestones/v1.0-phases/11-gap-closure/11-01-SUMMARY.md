---
phase: 11-gap-closure
plan: 01
subsystem: lifecycle
tags: [bug-fix, lifecycle, learn, archive, verification-filename]
dependency_graph:
  requires: []
  provides: [learn-phase-transition, archive-learned-acceptance, verification-filename-consistency]
  affects: [workflows/lifecycle/learn.md, workflows/utility/archive.md, bin/lib/campaign.cjs, references/learnings-extraction.md]
tech_stack:
  added: []
  patterns: [explicit-phase-allowlist-check]
key_files:
  created: []
  modified:
    - workflows/lifecycle/learn.md
    - workflows/utility/archive.md
    - bin/lib/campaign.cjs
    - references/learnings-extraction.md
decisions:
  - "Used explicit allowlist (shipped OR learned) instead of wildcard/regex for archive phase check (T-11-01 mitigation)"
metrics:
  duration: "196s"
  completed: "2026-05-04T12:17:11Z"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 4
---

# Phase 11 Plan 01: Learn-to-Archive Lifecycle Fix Summary

Fix learn-to-archive lifecycle break (B-01) and verification filename mismatch (B-03) enabling full init-through-archive campaign flow with correct VERIFICATION.md references.

## One-liner

Added `campaign update phase learned` transition in learn.md and expanded archive phase allowlist to accept learned campaigns, plus replaced all VERIFY-REPORT-*.md references with VERIFICATION.md across 4 files.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix learn.md -- add phase transition and fix VERIFY-REPORT references | c4c91b1 | workflows/lifecycle/learn.md |
| 2 | Fix archive.md and campaign.cjs to accept phase=learned; fix archive.md VERIFY-REPORT reference | 23df291 | workflows/utility/archive.md, bin/lib/campaign.cjs |
| 3 | Fix learnings-extraction.md VERIFY-REPORT references | 1926a37 | references/learnings-extraction.md |

## Changes Made

### Task 1: learn.md phase transition + filename fix
- Added `campaign update ${SLUG} phase learned` as first line in Step 8 bash block, before the `phase.learned true` timestamp line
- Replaced 3 occurrences of VERIFY-REPORT-*.md with VERIFICATION.md (artifact loading list, scan order description, checklist)

### Task 2: archive.md and campaign.cjs learned phase acceptance
- Updated archive.md phase validation to accept both 'shipped' and 'learned'
- Updated constraints section, purpose, success criteria, and CLI comment to reflect new policy
- Updated campaign.cjs `cmdCampaignArchive` phase check from `!== 'shipped'` to `!== 'shipped' && !== 'learned'` (explicit allowlist per T-11-01)
- Updated JSDoc comment for archive function
- Replaced VERIFY-REPORT-*.md reference with VERIFICATION.md in archive.md Step 3

### Task 3: learnings-extraction.md filename fix
- Replaced 3 occurrences of VERIFY-REPORT-*.md with VERIFICATION.md (gate failures guidance, artifact table, scan order)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Updated archive.md constraints section and purpose**
- **Found during:** Task 2
- **Issue:** The constraints section still said "Shipped-Only Validation" and the purpose line only mentioned shipped campaigns, creating inconsistency with the new shipped-or-learned policy
- **Fix:** Updated constraints heading, description, purpose line, success criteria, and CLI comment to reflect shipped-or-learned policy
- **Files modified:** workflows/utility/archive.md
- **Commit:** 23df291

## Verification Results

All plan-level verification checks passed:
1. `grep VERIFY-REPORT` returns 0 matches in all 3 target files (learn.md, archive.md, learnings-extraction.md)
2. `campaign update.*phase learned` found in learn.md (line 353)
3. Explicit allowlist check `frontmatter.phase !== 'shipped' && frontmatter.phase !== 'learned'` present in campaign.cjs (line 411)
4. Archive.md references "shipped or learned" in validation logic

## Known Stubs

None -- all changes are complete implementations, not placeholders.

## Self-Check: PASSED

- [x] workflows/lifecycle/learn.md exists and contains `campaign update.*phase learned`
- [x] workflows/utility/archive.md exists and contains VERIFICATION.md
- [x] bin/lib/campaign.cjs exists and contains learned phase check
- [x] references/learnings-extraction.md exists and contains VERIFICATION.md
- [x] Commit c4c91b1 exists
- [x] Commit 23df291 exists
- [x] Commit 1926a37 exists
