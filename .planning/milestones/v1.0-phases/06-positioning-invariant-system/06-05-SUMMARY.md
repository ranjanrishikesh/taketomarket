---
phase: 06-positioning-invariant-system
plan: 05
subsystem: positioning-check
tags: [bleeding-analysis, must-not-say, customer-facing, gap-closure]
dependency_graph:
  requires: [06-02]
  provides: [bleeding-analysis-report, bleeding-analysis-workflow-step]
  affects: [references/positioning-check-report.md, workflows/reference-mgmt/positioning-check.md]
tech_stack:
  added: []
  patterns: [asset-type-classification, bleeding-severity-matrix, conditional-report-sections]
key_files:
  created: []
  modified:
    - references/positioning-check-report.md
    - workflows/reference-mgmt/positioning-check.md
decisions:
  - "Used Step 5b numbering to avoid renumbering existing steps in positioning-check.md"
  - "Conservative default: ambiguous assets classified as customer-facing"
metrics:
  duration: 157s
  completed: 2026-04-28T15:37:15Z
  tasks: 2
  files_modified: 2
---

# Phase 06 Plan 05: Bleeding Analysis Gap Closure Summary

Dedicated Bleeding Analysis section added to both positioning-check report template and workflow, classifying must-not-say violations as BLEEDING (customer-facing, critical) or NOT BLEEDING (non-customer-facing, advisory) with per-violation detail table, bleeding count/rate metrics, and conditional messaging.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Bleeding Analysis section to positioning-check-report.md | 3d61369 | references/positioning-check-report.md |
| 2 | Add Bleeding Analysis step to positioning-check.md workflow | ed4aca8 | workflows/reference-mgmt/positioning-check.md |

## Changes Made

### Task 1: Bleeding Analysis in Report Template

Added two sections to `references/positioning-check-report.md`:

1. **Definition section** (after Drift Categories, before Per-Asset Drift Calculation):
   - Asset Type Classification table (customer-facing vs non-customer-facing)
   - Bleeding Severity matrix mapping Check 3 results to BLEEDING/NOT BLEEDING/CLEAN status
   - Conservative default rule for ambiguous assets

2. **Report template subsection** (after Drift Type Breakdown, before Findings Detail):
   - Per-violation table with asset, campaign, term, context, severity columns
   - Bleeding count and bleeding rate metrics
   - Conditional messaging for clean results vs active bleeding

File grew from 157 to 197 lines (well under 500-line limit).

### Task 2: Bleeding Analysis in Workflow

Added three modifications to `workflows/reference-mgmt/positioning-check.md`:

1. **Step 5b: Bleeding Analysis** (between Step 5 aggregates and Step 6 trend comparison):
   - Asset type classification instructions with conservative default
   - Bleeding status determination (FAIL + customer-facing = BLEEDING)
   - Context extraction (10 words before/after term)
   - Three bleeding metrics: BLEEDING_COUNT, MNS_VIOLATION_COUNT, BLEEDING_RATE

2. **Step 7 update**: Added bleeding analysis bullet to report generation list

3. **Success criteria update**: Added bleeding analysis checklist item

File grew from 298 to 339 lines (well under 500-line limit).

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **Step 5b numbering**: Used "5b" rather than renumbering Steps 6-9, as specified by the plan, to avoid disrupting existing step references from other documentation.
2. **Conservative default**: When asset type is ambiguous, classify as customer-facing -- this ensures bleeding is never underreported.

## Verification Results

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| `## Bleeding Analysis` in report | 2 | 2 | PASS |
| `Step 5b` in workflow | 1 | 1 | PASS |
| `Bleeding Analysis` in workflow | >= 1 | 4 | PASS |
| Report file lines | < 500 | 197 | PASS |
| Workflow file lines | < 500 | 339 | PASS |
| `customer-facing` in report | >= 5 | 10 | PASS |
| `customer-facing` in workflow | >= 3 | 10 | PASS |
| Bleeding analysis in success_criteria | 1 | 1 | PASS |
| Bleeding analysis in Step 7 list | 1 | 1 | PASS |

## Gap Closure

This plan closes the SC4 verification gap identified in `06-VERIFICATION.md`:
- **Before**: Check 3 WARN/FAIL distinction implicitly tracked customer-facing vs non-customer-facing, but no dedicated "bleeding analysis" section existed
- **After**: Explicit Bleeding Analysis step in workflow + dedicated report section with per-violation detail, bleeding count, bleeding rate, and conditional messaging
- **POSN-04 SC4** requirement for "bleeding-into-customer-facing-materials analysis" is now explicitly satisfied

## Self-Check: PASSED

All files found, all commits verified.
