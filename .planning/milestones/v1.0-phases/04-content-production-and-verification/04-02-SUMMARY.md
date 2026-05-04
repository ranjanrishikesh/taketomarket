---
phase: 04-content-production-and-verification
plan: 02
subsystem: production-workflow
tags: [produce, workflow, task-subagent, hero-first, context-fork]
dependency_graph:
  requires: [campaign-gate-fields, production-manifest-template, producer-agent]
  provides: [ttm-produce-skill, produce-workflow]
  affects: [skills/ttm-produce/SKILL.md, workflows/lifecycle/produce.md]
tech_stack:
  added: []
  patterns: [context-fork-isolation, hero-first-sequential-then-parallel, task-subagent-delegation, playbook-graceful-fallback]
key_files:
  created:
    - workflows/lifecycle/produce.md
  modified:
    - skills/ttm-produce/SKILL.md
decisions:
  - Text-mode detection included for consistency even though produce does not use AskUserQuestion
  - Derivative failures logged as warnings without aborting the production run
  - Manifest only includes successfully produced assets in total_assets count
metrics:
  duration_seconds: 131
  completed: 2026-04-26T23:01:08Z
  tasks_completed: 2
  tasks_total: 2
  files_created: 1
  files_modified: 1
---

# Phase 04 Plan 02: Production Workflow with Hero-First Task() Orchestration Summary

Updated ttm-produce SKILL.md with context:fork isolation and created 331-line produce.md workflow with 8-step hero-first-then-parallel orchestration loading brief + positioning + brand + ICP + playbook into Task() subagents.

## Task Results

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update ttm-produce SKILL.md with context:fork | c6fe13b | skills/ttm-produce/SKILL.md |
| 2 | Create produce.md workflow with hero-first Task() orchestration | 88acc5c | workflows/lifecycle/produce.md |

## What Was Built

### Task 1: SKILL.md Update
Added `context: fork` to the YAML frontmatter for isolated subagent execution. Replaced the stub body (status line + bullet list) with the minimal single-line workflow routing pattern matching ttm-brief/SKILL.md. Final file is 14 lines. Kept Task in allowed-tools for subagent spawning; did not add AskUserQuestion since produce is non-interactive.

### Task 2: produce.md Workflow
Created the production orchestration workflow at 331 lines (target was under 500) following brief.md's XML structural pattern with all 5 required tags (purpose, required_reading, process, success_criteria, output).

The 8 steps implement:
1. **Load Context** -- Tier 1 all 9 reference files + Tier 2 full for POSITIONING, BRAND, ICP (per D-03) + campaign BRIEF.md and STATE.md
2. **Validate Campaign State** -- checks campaign exists, phase is "briefed", warns on re-production
3. **Parse Assets List from Brief** -- extracts asset type, channel, hero designation from brief's assets table
4. **Resolve Playbooks** -- maps asset types to playbook files with graceful fallback and warning when missing (Phase 8 content)
5. **Produce Hero Asset** -- blocking Task() call with populated ttm-producer.md template, post-production file verification (Pitfall 2 mitigation)
6. **Produce Derivative Assets** -- parallel Task() calls with hero asset path injected for message consistency, per-derivative failure tolerance
7. **Write Production Manifest** -- fills production-manifest.json template with actual values, writes to CAMPAIGNS/<slug>/MANIFEST.json as produce-to-verify bridge (per D-11)
8. **Update Campaign State** -- sets phase=produced with timestamp via ttm-tools.cjs

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- SKILL.md: context:fork present (1 match), "Not yet implemented" removed (0 matches), workflow route present, Task in allowed-tools, 14 lines
- produce.md: all 13 verification checks passed (purpose, required_reading, process, success_criteria, output tags; Task() call; MANIFEST.json reference; ttm-producer.md agent reference; context-loading.md reference; campaign update command; phase produced transition; playbook loading; hero concept)
- Line count: 331 (under 500 limit)

## Self-Check: PASSED

All files verified on disk and commit hashes confirmed in git log.
