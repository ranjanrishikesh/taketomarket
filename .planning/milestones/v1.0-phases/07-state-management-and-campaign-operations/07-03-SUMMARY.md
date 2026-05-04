---
phase: 07-state-management-and-campaign-operations
plan: 03
subsystem: session-recovery-and-archive
tags: [resume, archive, learnings-extraction, session-recovery]
dependency_graph:
  requires: [cmdCampaignArchive, health-full-audit, learnings-extraction-reference]
  provides: [ttm-resume-workflow, ttm-archive-workflow]
  affects: [workflows/utility/resume.md, workflows/utility/archive.md, skills/ttm-resume/SKILL.md, skills/ttm-archive/SKILL.md]
tech_stack:
  added: []
  patterns: [phase-to-command-mapping, interrupted-loop-detection, marker-based-append, learnings-extraction]
key_files:
  created:
    - workflows/utility/resume.md
    - workflows/utility/archive.md
  modified:
    - skills/ttm-resume/SKILL.md
    - skills/ttm-archive/SKILL.md
decisions:
  - "Resume is read-only -- no files modified, user runs suggested command themselves"
  - "Loop detection overrides standard phase-to-command mapping for interrupted fix/verify"
  - "Archive requires AskUserQuestion for confirmation since operation is irreversible"
  - "Marker validation counts occurrences before append (T-07-10 mitigation)"
metrics:
  duration: 176s
  completed: 2026-04-29
  tasks: 2
  files: 4
---

# Phase 07 Plan 03: Resume and Archive Workflows Summary

Session recovery workflow with interrupted-loop detection and campaign finalization workflow with structured learnings extraction via root-cause taxonomy.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Create /ttm-resume session recovery workflow and update SKILL.md | c65f86a | Resume workflow (245 lines) with state loading, loop detection, phase-to-command mapping |
| 2 | Create /ttm-archive finalization workflow and update SKILL.md | 0a789c3 | Archive workflow (317 lines) with shipped validation, learnings extraction, marker append |

## Decisions Made

1. **Resume is read-only:** The /ttm-resume command does not modify any files. It reads STATE.md, builds recovery context, and displays the suggested next command for the user to run themselves (per D-04).
2. **Loop detection overrides phase mapping:** When an interrupted fix loop (fix.run_count > 0 AND review.overall_result = revise) or verify loop is detected, the suggestion overrides the standard phase-to-command table to prevent the user from accidentally restarting instead of continuing.
3. **Archive confirmation via AskUserQuestion:** Since archive is irreversible (D-10), the workflow requires explicit user confirmation before executing. Text-mode fallback provided for non-Claude-Code runtimes.
4. **Marker validation (T-07-10):** Before appending to LEARNINGS.md, the workflow counts marker occurrences. If != 1, it falls back to end-of-table append rather than risking corruption.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `workflows/utility/resume.md` exists (245 lines, under 500)
- `workflows/utility/archive.md` exists (317 lines, under 500)
- Both SKILL.md files have "Not yet implemented" removed
- Both SKILL.md files route to correct workflow paths
- Resume workflow references `campaign state` CLI call (D-06)
- Resume workflow checks `fix.run_count` and `review.overall_result` (D-05)
- Resume workflow includes "Suggested Next Command" output (D-04)
- Archive workflow references `campaign archive` CLI call (D-07)
- Archive workflow validates shipped-only with cancelled rejection (D-08)
- Archive workflow extracts learnings with "What worked" category (D-09)
- Archive workflow uses `LESSONS BELOW THIS LINE` marker (T-07-10)
- Archive workflow marks operation as irreversible (D-10)
- Archive workflow includes AskUserQuestion for confirmation

## Self-Check: PASSED

- [x] workflows/utility/resume.md created (commit c65f86a)
- [x] workflows/utility/archive.md created (commit 0a789c3)
- [x] skills/ttm-resume/SKILL.md updated (commit c65f86a)
- [x] skills/ttm-archive/SKILL.md updated (commit 0a789c3)
