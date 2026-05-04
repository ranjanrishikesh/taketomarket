---
status: partial
phase: 06-positioning-invariant-system
source: [06-VERIFICATION.md]
started: 2026-04-28T12:00:00Z
updated: 2026-04-28T12:00:00Z
---

## Current Test

Bleeding analysis section needed in positioning-check workflow

## Tests

### 1. Bleeding-into-customer-facing-materials analysis
expected: /ttm-positioning-check has a dedicated "Bleeding Analysis" section in the report showing where positioning leaks into wrong territory
result: failed — Check 3 WARN/FAIL distinction is implicit only, no dedicated section

## Summary

total: 1
passed: 0
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

### Gap 1: Missing dedicated Bleeding Analysis section
status: failed
description: positioning-check.md and positioning-check-report.md lack a dedicated Bleeding Analysis section. Check 3 (Must-Not-Say Compliance) provides WARN/FAIL but does not frame results as "bleeding analysis" explicitly.
fix: Add a dedicated Bleeding Analysis step to positioning-check.md that cross-references must-not-say violations with asset type (customer-facing vs internal) and presents a "Bleeding Report" subsection in the output.
