---
phase: 07-state-management-and-campaign-operations
plan: 01
subsystem: cli-infrastructure
tags: [campaign-archive, health-audit, learnings-extraction, cli]
dependency_graph:
  requires: []
  provides: [cmdCampaignArchive, health-full-audit, learnings-extraction-reference]
  affects: [bin/lib/campaign.cjs, bin/lib/health.cjs, bin/ttm-tools.cjs]
tech_stack:
  added: []
  patterns: [cross-filesystem-copy, append-marker, extended-health-audit]
key_files:
  created:
    - references/learnings-extraction.md
  modified:
    - bin/lib/campaign.cjs
    - bin/lib/health.cjs
    - bin/ttm-tools.cjs
    - templates/reference-files/learnings.md
decisions:
  - "Used cpSync + rmSync for cross-filesystem safety instead of rename"
  - "Warnings do not make health check unhealthy -- only failures do"
  - "Append marker replaces placeholder row in LEARNINGS.md template"
metrics:
  duration: 235s
  completed: 2026-04-29
  tasks: 3
  files: 5
---

# Phase 07 Plan 01: CLI Infrastructure for Campaign Operations Summary

Extended CLI with campaign archive, full health audit, and learnings extraction reference -- enabling all Phase 7 workflows to call deterministic operations via bin/ttm-tools.cjs.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Extend campaign.cjs with cmdCampaignArchive | 15a8da0 | Added Phase 7 ALLOWED_FIELDS, cmdCampaignArchive with shipped-only validation and cross-fs copy |
| 2 | Extend health.cjs with full audit mode | d897d4c | 5 new check categories (state consistency, staleness, velocity, drift-log, gate), --full router |
| 3 | Create learnings-extraction.md reference | 7e82f49 | Structured extraction guide with root-cause taxonomy, LEARNINGS.md append marker |

## Decisions Made

1. **Cross-filesystem copy strategy:** Used `fs.cpSync` followed by `fs.rmSync` (not `fs.renameSync`) to handle cases where source and destination may be on different filesystems.
2. **Health check severity model:** Warnings (staleness, velocity) do not set `healthy=false` -- only explicit failures affect the health flag. This prevents nuisance alerts on fresh installations.
3. **Append marker pattern:** Replaced the placeholder row in LEARNINGS.md template with `<!-- LESSONS BELOW THIS LINE -->` marker, following the same pattern used by drift-log.cjs for safe append-based insertion.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- `node bin/ttm-tools.cjs campaign archive nonexistent --raw` exits with error mentioning "not found"
- `node bin/ttm-tools.cjs health --raw` runs basic checks successfully
- `node bin/ttm-tools.cjs health --full --raw` runs extended checks successfully
- `references/learnings-extraction.md` exists with all required sections
- `templates/reference-files/learnings.md` contains append marker

## Self-Check: PASSED

- [x] bin/lib/campaign.cjs modified (commit 15a8da0)
- [x] bin/lib/health.cjs modified (commit d897d4c)
- [x] bin/ttm-tools.cjs modified (commit d897d4c)
- [x] references/learnings-extraction.md created (commit 7e82f49)
- [x] templates/reference-files/learnings.md modified (commit 7e82f49)
