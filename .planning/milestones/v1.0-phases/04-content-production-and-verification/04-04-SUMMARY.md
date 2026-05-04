---
phase: 04-content-production-and-verification
plan: 04
subsystem: verify-workflow
tags: [verification, quality-gates, deviation-handling, context-isolation]
dependency_graph:
  requires: [04-01, 04-03]
  provides: [verify-skill, verify-workflow, deviation-flow, verification-report]
  affects: [skills/ttm-verify/SKILL.md, workflows/lifecycle/verify.md]
tech_stack:
  added: []
  patterns: [context-fork-isolation, 10-gate-evaluation-loop, 3-option-deviation-handling, summary-table-with-drilldown]
key_files:
  created:
    - workflows/lifecycle/verify.md
  modified:
    - skills/ttm-verify/SKILL.md
decisions:
  - verify.md uses @-syntax for gate-evaluation.md, base-gates.md, and context-loading.md to stay under 500 lines
  - Assets loaded from disk only (never from produce context) to prevent self-evaluation bias per LIFE-09
  - DEVIATIONS.md writes always go through ttm-tools.cjs deviation append CLI for consistent formatting
  - VERIFICATION.md is overwritten per run (current state), while DEVIATIONS.md is append-only (history)
metrics:
  duration_seconds: 331
  completed: 2026-04-28T06:34:44Z
  tasks_completed: 3
  tasks_total: 3
  files_created: 1
  files_modified: 1
---

# Phase 04 Plan 04: Verify Workflow with 10-Gate Evaluation Summary

Created /ttm-verify SKILL.md with context:fork isolation and 440-line verify.md workflow orchestrating 10-gate evaluation per asset with structured Correct/Accept+log/Escalate deviation handling.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update ttm-verify SKILL.md with context:fork | 450e16a | skills/ttm-verify/SKILL.md |
| 2 | Create verify.md workflow with 10-gate evaluation and deviation handling | db9fd33 | workflows/lifecycle/verify.md |
| 3 | Human review of Phase 4 end-to-end file structure | auto-approved | (checkpoint, no file changes) |

## What Was Built

### Task 1: SKILL.md Update

Updated skills/ttm-verify/SKILL.md to add `context: fork` for produce/verify isolation (LIFE-09, D-10) and `AskUserQuestion` to allowed-tools for deviation handling prompts (D-09). Removed the stub body ("Status: Not yet implemented" and bullet list) and replaced with the minimal workflow routing pattern pointing to `workflows/lifecycle/verify.md`. Final file is 14 lines, matching the established thin-SKILL.md pattern from ttm-brief.

### Task 2: verify.md Workflow

Created a 440-line verification workflow at workflows/lifecycle/verify.md following the exact XML structural pattern from brief.md. Contains 9 steps:

1. **Load Context** -- Tier 1 summaries from all 9 reference files, Tier 2 full content for POSITIONING.md, BRAND.md, ICP.md, COMPETITORS.md, CHANNELS.md, plus campaign BRIEF.md and MANIFEST.json
2. **Validate Campaign State** -- checks campaign exists, warns if not in "produced" phase, determines verify run number
3. **Load Assets from Disk** -- parses MANIFEST.json for hero + derivatives, reads each asset file, enforces file-only loading (self-evaluation bias prevention)
4. **Evaluate Gates Per Asset** -- 10-gate loop in order (GATE-01 through GATE-10), each evaluated separately with gate-specific reference data per RESEARCH.md Pitfall 4
5. **Build Summary Table** -- gate x asset matrix with PASS/WARN/FAIL/N-A per cell, plus drill-down detail for findings
6. **Handle Tier 1 Deviations** -- Correct (records fix_needed), Accept+log (uses ttm-tools.cjs deviation append CLI), Escalate (pauses verification, exits)
7. **Display Tier 2 Findings** -- advisory display with recommendations, no action required
8. **Write Verification Report** -- VERIFICATION.md with YAML frontmatter, summary table, detail findings, run metadata (overwrite per run)
9. **Update Campaign State** -- all 10 gate result fields, verify metadata (run_count, last_run, overall_result), phase transition to "verified"

### Task 3: Auto-Approved Checkpoint

Ran all 7 verification commands from the checkpoint definition. All 10 Phase 4 files confirmed present: both SKILL.md files have context:fork, all 10 GATE-XX definitions exist in base-gates.md, all files under 500 lines.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- SKILL.md: has `context: fork`, has `AskUserQuestion`, routes to verify.md, no stub text, 14 lines
- verify.md: 440 lines (under 500), all 20 content checks passed (purpose, required_reading, process, success_criteria, output tags; gate-evaluation.md and base-gates.md references; MANIFEST.json, VERIFICATION.md, DEVIATIONS.md references; Accept+log, Correct, Escalate options; AskUserQuestion; campaign update commands; gate.positioning_drift and verify.run_count fields; context-loading.md reference; Tier 1 and Tier 2 handling)
- Checkpoint: all 10 Phase 4 files present, both SKILL.md files have context:fork, all gate definitions present

## Self-Check: PASSED

All files verified on disk. Both commit hashes confirmed in git log.
