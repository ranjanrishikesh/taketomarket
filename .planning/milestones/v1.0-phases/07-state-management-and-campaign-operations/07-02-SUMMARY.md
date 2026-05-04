---
phase: 07-state-management-and-campaign-operations
plan: 02
subsystem: utility-workflows
tags: [state-dashboard, health-audit, next-routing, campaign-operations]
dependency_graph:
  requires: [cmdCampaignArchive, health-full-audit]
  provides: [state-dashboard-workflow, health-audit-workflow, next-routing-workflow]
  affects: [workflows/utility/state.md, workflows/utility/health.md, workflows/utility/next.md, skills/ttm-state/SKILL.md, skills/ttm-health/SKILL.md, skills/ttm-next/SKILL.md]
tech_stack:
  added: []
  patterns: [xml-workflow-structure, cli-json-parsing, priority-algorithm, phase-to-command-mapping]
key_files:
  created:
    - workflows/utility/state.md
    - workflows/utility/health.md
    - workflows/utility/next.md
  modified:
    - skills/ttm-state/SKILL.md
    - skills/ttm-health/SKILL.md
    - skills/ttm-next/SKILL.md
decisions:
  - "State workflow uses unfiltered campaign list plus ARCHIVE directory scan for complete view"
  - "Health workflow delegates all checks to CLI and only formats output -- no self-healing"
  - "Next workflow uses unfiltered list (not --active) to include created/researched phases"
  - "Priority algorithm: approved > fix-loop > earlier-phase > recently-active > oldest-first"
metrics:
  duration: 161s
  completed: 2026-04-29
  tasks: 2
  files: 6
---

# Phase 07 Plan 02: Utility Workflows (State, Health, Next) Summary

Three read-only utility workflows providing campaign control room (/ttm-state), system health validation (/ttm-health), and portfolio-aware next-action routing (/ttm-next) with priority algorithm.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Create /ttm-state dashboard workflow and update SKILL.md | 5c287c3 | State workflow with full dashboard + single campaign detail modes; SKILL.md production-ready |
| 2 | Create /ttm-health and /ttm-next workflows with SKILL.md updates | b4ebd9d | Health audit workflow with pass/warn/fail formatting; Next routing with D-15 priority algorithm |

## Decisions Made

1. **State workflow design:** Full dashboard mode shows active campaigns with detail sections (gate results, fix attempts, decisions/blockers/experiments from global STATE.md) plus archived campaigns in collapsed rows. Single campaign mode shows lifecycle progress indicator and full STATE.md body content.
2. **Health workflow constraint:** Strictly diagnostic -- uses "Does NOT fix them" constraint and delegates all check logic to the CLI's `health --full --raw` command. Workflow only formats output.
3. **Next workflow filtering:** Uses unfiltered `campaign list --raw` (not `--active`) because `--active` excludes `created` and `researched` phases which need guidance too.
4. **Priority algorithm:** 4-level priority (approved-to-ship > fix-loop-in-progress > earlier-lifecycle-phase > most-recently-active) with oldest-first tie-break.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `workflows/utility/state.md` exists (207 lines, under 500 limit)
- `workflows/utility/health.md` exists (166 lines, under 500 limit)
- `workflows/utility/next.md` exists (187 lines, under 500 limit)
- All three SKILL.md files have "Not yet implemented" removed
- All three SKILL.md files route to correct workflow paths
- All three workflows follow XML structure (purpose, required_reading, constraints, process, success_criteria, output)
- `fix.run_count` and `review.overall_result` referenced in next.md for D-05 loop detection
- `health --full --raw` used in health.md for extended audit
- `campaign list --raw` (unfiltered) used in next.md per Pitfall 2

## Self-Check: PASSED

- [x] workflows/utility/state.md created (commit 5c287c3)
- [x] workflows/utility/health.md created (commit b4ebd9d)
- [x] workflows/utility/next.md created (commit b4ebd9d)
- [x] skills/ttm-state/SKILL.md modified (commit 5c287c3)
- [x] skills/ttm-health/SKILL.md modified (commit b4ebd9d)
- [x] skills/ttm-next/SKILL.md modified (commit b4ebd9d)
