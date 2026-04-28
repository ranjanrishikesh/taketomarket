---
phase: 06-positioning-invariant-system
plan: 04
subsystem: positioning-shift
tags: [positioning-shift, migration-plan, approval-gate, deprecation-schedule, drift-log]

# Dependency graph
requires:
  - phase: 06-01
    provides: drift-log.cjs CLI (append, deprecation), campaign list CLI (--active)
  - phase: 06-03
    provides: read-only enforcement pattern for POSITIONING.md constraints block
provides:
  - Controlled positioning shift workflow (workflows/reference-mgmt/positioning-shift.md)
  - Migration plan template (templates/migration-plan.md)
  - Updated ttm-positioning-shift SKILL.md (stub removed)
affects: [all-lifecycle-workflows-via-new-positioning, drift-log-append-data]

# Tech tracking
tech-stack:
  added: []
  patterns: [6-step-shift-process, mandatory-approval-gate, history-table-archival, sanitize-pipe-backtick-newline-100-char]

key-files:
  created: [workflows/reference-mgmt/positioning-shift.md, templates/migration-plan.md]
  modified: [skills/ttm-positioning-shift/SKILL.md]

key-decisions:
  - "Workflow uses 6-step process: load context, check active campaigns, collect shift info (reasoning + fields + migration + deprecation), approval gate, apply changes, completion banner"
  - "History table sanitization strips pipes, backticks, newlines and limits reasoning to 100 chars (per T-06-09, Pitfall 3)"
  - "Approval gate uses AskUserQuestion with Approve/Revise/Cancel -- Revise loops back to Step 3b for field re-collection"
  - "Migration plan only generated when active campaigns exist (ACTIVE_COUNT > 0)"
  - "Deprecation schedule is optional -- user can type 'skip' if no shipped assets need updating"

metrics:
  duration: 173s
  completed: 2026-04-28T12:51:48Z
  tasks_completed: 1
  tasks_total: 1
  files_created: 2
  files_modified: 1
---

# Phase 06 Plan 04: Positioning Shift Workflow Summary

Controlled positioning shift workflow with 6-step process: context loading, active campaign detection via CLI, structured field collection with reasoning, migration plan generation for active campaigns, mandatory human approval gate (Approve/Revise/Cancel), and atomic POSITIONING.md update with History table archival and DRIFT-LOG.md logging.

## What Was Built

### templates/migration-plan.md
Migration plan template with three sections: Active Campaign Impact table (campaign/phase/assets/action/decision), Per-Asset Recommendations table (asset/conflict-type/recommendation/notes), and Deprecation Schedule table (asset/campaign/old-element/update/deadline).

### workflows/reference-mgmt/positioning-shift.md (368 lines)
Complete controlled repositioning workflow with 6 steps:
1. **Load Context** -- Tier 1 summaries from all 9 reference files + full POSITIONING.md for before/after diff
2. **Check Active Campaigns** -- Uses `campaign list --active --raw` CLI to detect in-flight campaigns and warn user
3. **Collect Shift Information** -- Reasoning (free text), 5 structured fields (differentiator, category, audience, proof points, must-not-say), migration plan for active campaigns with GATE-01 quick-eval, deprecation schedule with user-set deadline
4. **Approval Gate** -- Before/after diff of all fields, impact summary, AskUserQuestion with Approve/Revise/Cancel (Revise loops back to field collection)
5. **Apply Changes** -- Archive old positioning in History table (sanitized per T-06-09), update POSITIONING.md fields preserving _SUMMARY/END_SUMMARY delimiters, log shift to DRIFT-LOG.md via `drift-log append --event-type shift`, log deprecation entries via `drift-log deprecation`
6. **Completion Banner** -- Summary of changes with next steps (re-verify campaigns, update shipped assets, run positioning-check)

### skills/ttm-positioning-shift/SKILL.md
Removed "Not yet implemented (Phase 6)" stub status line. All other content (frontmatter, routing instruction, description) preserved.

## Key CLI Integrations
- `campaign list --active --raw` -- Detect active campaigns before allowing shift
- `drift-log append --event-type shift` -- Log shift event to DRIFT-LOG.md audit trail
- `drift-log deprecation` -- Log per-asset deprecation entries to DRIFT-LOG.md backlog

## Threat Mitigations Applied
- **T-06-09 (Tampering: History table injection):** Sanitization strips pipes, backticks, newlines; limits reasoning to 100 chars
- **T-06-10 (Repudiation: change without audit trail):** Dual logging -- History table in POSITIONING.md for quick reference + DRIFT-LOG.md for full audit trail

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | aeb4d77 | Create positioning-shift workflow, migration-plan template, update SKILL.md |

## Self-Check: PASSED

- [x] workflows/reference-mgmt/positioning-shift.md exists (368 lines, under 500 limit)
- [x] templates/migration-plan.md exists with Active Campaign Impact, Per-Asset Recommendations, Deprecation Schedule
- [x] skills/ttm-positioning-shift/SKILL.md does NOT contain "Not yet implemented"
- [x] Workflow contains: POSITIONING SHIFT APPROVAL banner, AskUserQuestion approval gate, drift-log append, drift-log deprecation, campaign list --active, Positioning History table append, _SUMMARY/END_SUMMARY preservation
- [x] Commit aeb4d77 exists in git log
