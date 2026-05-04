---
phase: 11-gap-closure
plan: 03
subsystem: produce-workflow, requirements
tags: [playbook-mapping, gap-closure, W-04, LIFE-04, GATE-12]
dependency_graph:
  requires: []
  provides: [playbook-type-mapping, LIFE-04-text-alignment]
  affects: [workflows/lifecycle/produce.md, .planning/REQUIREMENTS.md]
tech_stack:
  added: []
  patterns: [lookup-table-mapping]
key_files:
  created: []
  modified:
    - workflows/lifecycle/produce.md
    - .planning/REQUIREMENTS.md
decisions:
  - "PLAYBOOK_MAP uses explicit lookup table with fallback to ${TYPE}.md for unknown types"
  - "GATE-12 confirmed already fixed -- no code change needed, formally closed"
metrics:
  duration: "1m18s"
  completed: "2026-05-04T12:16:08Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 11 Plan 03: Playbook Mapping Fix + LIFE-04 + GATE-12 Closure Summary

Explicit PLAYBOOK_MAP lookup table in produce.md maps 28 asset types to 11 discipline playbooks, fixing W-04 silent gate skip; LIFE-04 requirement text aligned with D-06 output-metric-optional decision; GATE-12 formally verified and closed.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add playbook type-to-file mapping table in produce.md | 4613f43 | workflows/lifecycle/produce.md |
| 2 | Update REQUIREMENTS.md LIFE-04 text and verify GATE-12 | 5b9ae78 | .planning/REQUIREMENTS.md |

## What Changed

### Task 1: PLAYBOOK_MAP in produce.md
Replaced the direct `${TYPE}.md` filename mapping in Step 4 ("Resolve Playbooks") with an explicit PLAYBOOK_MAP lookup table. Previously, `blog-post` would try to load `blog-post.md` which does not exist -- the actual playbook file is `seo.md`. The new table maps all 28 known asset types to their correct discipline playbook files (seo.md, aeo.md, email.md, linkedin.md, social.md, youtube.md, paid-ads.md, affiliate.md, pr-media.md, events.md). Unknown asset types fall back to `${TYPE}.md` for extensibility. Warning messages now include the tried filename for debugging.

### Task 2: LIFE-04 + GATE-12
Updated LIFE-04 requirement text from "refuses to proceed without both output metric and outcome metric defined" to "refuses to proceed without outcome metric defined; output metric is requested but optional per D-06 (flagged in BRIEF.md when missing)". This aligns the requirement with the D-06 design decision that intentionally made output metric optional because many campaign types (brand awareness, PR, events) have meaningful outcome metrics but no discrete output metric count.

GATE-12 confirmed already fixed: both `workflows/lifecycle/verify.md` (line 358) and `gates/gate-evaluation.md` (line 280) use `--slug "${SLUG}"` named argument format. No positional slug format exists. Formally closed.

## Deviations from Plan

None -- plan executed exactly as written.

## Decisions Made

1. **PLAYBOOK_MAP fallback strategy**: Unknown asset types fall back to `${TYPE}.md` rather than failing hard, preserving extensibility for custom playbooks.
2. **GATE-12 closure**: Verified already fixed, no code change needed -- documented as formal closure only.

## Self-Check: PASSED

- FOUND: workflows/lifecycle/produce.md (modified, contains PLAYBOOK_MAP)
- FOUND: .planning/REQUIREMENTS.md (modified, contains "optional per D-06")
- FOUND: commit 4613f43 (Task 1)
- FOUND: commit 5b9ae78 (Task 2)
