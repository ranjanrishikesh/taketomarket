---
phase: 06-positioning-invariant-system
plan: 03
subsystem: positioning-invariant
tags: [positioning, lifecycle-workflows, read-only-enforcement, auto-suggest]
dependency_graph:
  requires: []
  provides: [positioning-read-only-enforcement, positioning-check-auto-suggest, context-loading-positioning-shift]
  affects: [workflows/lifecycle/brief.md, workflows/lifecycle/produce.md, workflows/lifecycle/verify.md, workflows/lifecycle/review.md, workflows/lifecycle/fix.md, workflows/lifecycle/ship.md, references/context-loading.md]
tech_stack:
  added: []
  patterns: [constraints-block-in-workflows, auto-suggest-after-milestone]
key_files:
  created: []
  modified:
    - workflows/lifecycle/brief.md
    - workflows/lifecycle/produce.md
    - workflows/lifecycle/verify.md
    - workflows/lifecycle/review.md
    - workflows/lifecycle/fix.md
    - workflows/lifecycle/ship.md
    - references/context-loading.md
decisions:
  - "Constraints block placed between </required_reading> and <process> as a new XML block type"
  - "Auto-suggest uses shipped-since-last-audit CLI subcommand with threshold >= 3"
  - "ship.md at 521 lines slightly exceeds 500-line guidance due to mandatory additions from plan"
metrics:
  duration: 99s
  completed: 2026-04-28T12:37:19Z
  tasks: 2/2
  files_modified: 7
---

# Phase 06 Plan 03: Lifecycle Read-Only Enforcement Summary

Read-only POSITIONING.md constraints added to all 6 lifecycle workflows with auto-suggest positioning check in ship.md after every 3rd shipped campaign.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add read-only constraints to all 6 lifecycle workflows | 9668be5 | brief.md, produce.md, verify.md, review.md, fix.md, ship.md |
| 2 | Update context-loading.md loading matrix with positioning-shift | 4f4a8c0 | references/context-loading.md |

## Implementation Details

### Task 1: Read-Only Constraints + Auto-Suggest

Inserted a `<constraints>` XML block between `</required_reading>` and `<process>` in all 6 lifecycle workflows (brief, produce, verify, review, fix, ship). The block:

- Declares POSITIONING.md as READ-ONLY during the workflow
- Directs verify workflow to use Escalate option for positioning drift
- Directs other workflows to flag issues and recommend /ttm-positioning-check
- States only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md

Additionally, ship.md received a new Step 11 (after the completion banner in Step 10) that:

- Calls `ttm-tools.cjs campaign list --shipped-since-last-audit --raw` to get campaign count
- Displays a "POSITIONING CHECK SUGGESTED" banner when count >= 3
- Does nothing when count < 3 (informational nudge only, per D-02)

### Task 2: Context Loading Matrix Update

Added `/ttm-positioning-shift` row to the Workflow-to-Reference Loading Matrix in context-loading.md, placed directly after the existing `/ttm-positioning-check` row. Both positioning commands now documented with Tier 2 POSITIONING.md loading.

## Deviations from Plan

None -- plan executed exactly as written.

## Self-Check: PASSED
