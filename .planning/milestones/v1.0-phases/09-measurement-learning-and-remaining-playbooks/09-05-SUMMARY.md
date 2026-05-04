---
phase: 09-measurement-learning-and-remaining-playbooks
plan: 05
subsystem: learning-workflow
tags: [learning, root-cause-taxonomy, narrative-edits, pattern-extraction, compound-learnings]

requires:
  - phase: 09-measurement-learning-and-remaining-playbooks
    plan: 01
    provides: campaign.cjs learn.* tracking fields and learnings-extraction.md reference

provides:
  - learn.md workflow with 9-step learning process and root-cause taxonomy
  - per-edit human approval gates for reference file edits (D-07, D-08)
  - POSITIONING.md edit routing to /ttm-positioning-shift (D-09)
  - pattern extraction after 3+ campaigns (LRNG-03)
  - production SKILL.md routing /ttm-learn to learn.md workflow

affects:
  - .marketing/LEARNINGS.md (append-only lesson logging after marker)
  - .marketing/BRAND.md, ICP.md, CHANNELS.md, METRICS.md, COMPETITORS.md (proposed edits with approval)
  - .marketing/CAMPAIGNS/${SLUG}/STATE.md (learn.* field updates)

tech-stack:
  added: []
  patterns:
    - narrative+apply approach for reference file edits (D-07)
    - per-edit human approval gates via AskUserQuestion with text-mode fallback (D-08)
    - POSITIONING.md routing constraint (D-09)
    - append-only logging after marker line
    - pattern extraction with campaign count threshold

key-files:
  created:
    - workflows/lifecycle/learn.md
  modified:
    - skills/ttm-learn/SKILL.md

decisions:
  - "Root-cause taxonomy uses 7 failure categories plus 'success' for wins, matching learnings-extraction.md"
  - "Pattern extraction runs only after 3+ distinct campaign slugs in LEARNINGS.md lessons log"
  - "POSITIONING.md edits never applied directly -- always routed to /ttm-positioning-shift"

metrics:
  duration: ~3 minutes
  completed: 2026-05-01
---

# Phase 09 Plan 05: Learn Workflow Summary

Learn workflow with root-cause taxonomy lesson extraction, narrative+apply reference file edits with per-edit human approval, and cross-campaign pattern extraction after 3+ campaigns.

## What Was Done

### Task 1: Create /ttm-learn workflow
- **Commit:** 8459546
- **File:** `workflows/lifecycle/learn.md` (404 lines)
- Created 9-step learn workflow following established workflow structure (purpose, required_reading, constraints, process)
- Step 1: Context loading with Tier 1 summaries and Tier 2 full content for all reference files plus campaign artifacts
- Step 2: Campaign state validation (must be in measured or learned phase)
- Step 3: Outcome delta extraction comparing MEASUREMENT.md actuals vs BRIEF.md targets (LRNG-02)
- Step 4: Lesson classification using 7-category root-cause taxonomy from learnings-extraction.md (LRNG-01, LIFE-17)
- Step 5: Narrative+apply reference file edits with per-edit human approval gates (D-07, D-08), POSITIONING.md routing to /ttm-positioning-shift (D-09)
- Step 6: Append-only lesson logging to LEARNINGS.md after marker line with summary counter updates
- Step 7: Pattern extraction across campaigns when 3+ have lessons (LRNG-03)
- Step 8: Campaign state updates via campaign CLI (learn.run_count, learn.last_run, learn.lessons_extracted, learn.edits_proposed, learn.edits_applied)
- Step 9: Summary display with next steps
- Includes text-mode detection block and positioning read-only constraint
- Includes verification checklist at the end

### Task 2: Update ttm-learn SKILL.md from stub to production
- **Commit:** 061ae9d
- **File:** `skills/ttm-learn/SKILL.md` (14 lines)
- Removed "Not yet implemented" stub status and bullet list of future features
- Added AskUserQuestion to allowed-tools for per-edit human approval gates
- Updated description to reflect full learn workflow capabilities
- Thin router pattern pointing to workflows/lifecycle/learn.md

## Requirements Coverage

| Requirement | Status | How |
|-------------|--------|-----|
| LIFE-16 | Covered | Reference file edits proposed with narrative + approval flow |
| LIFE-17 | Covered | Root-cause taxonomy entries logged to LEARNINGS.md |
| LRNG-01 | Covered | Structured lessons with root-cause classification |
| LRNG-02 | Covered | Outcome deltas extracted comparing actuals vs targets |
| LRNG-03 | Covered | Pattern extraction with 3-campaign threshold |
| LRNG-04 | Verified | LEARNINGS.md already loaded as Tier 1 context in brief.md (line 77) |

## Deviations from Plan

None -- plan executed exactly as written.

## Self-Check: PASSED

- [x] `workflows/lifecycle/learn.md` exists (404 lines, under 500 limit)
- [x] `skills/ttm-learn/SKILL.md` exists (14 lines, under 20 limit)
- [x] Commit 8459546 exists
- [x] Commit 061ae9d exists
- [x] No "Not yet implemented" in SKILL.md
- [x] learn.md contains all 7 root-cause taxonomy categories
- [x] learn.md contains LESSONS BELOW THIS LINE marker
- [x] learn.md contains positioning-shift routing
- [x] learn.md contains 3+ campaigns threshold
- [x] learn.md contains narrative approach
- [x] learn.md contains campaign update CLI calls
- [x] learn.md contains phase.learned state transition
- [x] learn.md contains learn.lessons_extracted and learn.edits_applied tracking fields
