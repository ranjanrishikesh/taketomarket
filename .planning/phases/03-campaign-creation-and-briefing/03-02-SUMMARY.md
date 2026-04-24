---
phase: 03-campaign-creation-and-briefing
plan: 02
subsystem: campaign-workflows
tags: [campaign, workflow, research, web-search, manual-paste]
dependency_graph:
  requires: [bin/lib/campaign.cjs, templates/campaign-state.md, templates/campaign-research.md, references/context-loading.md]
  provides: [workflows/setup/new-campaign.md, workflows/lifecycle/research.md]
  affects: [skills/ttm-new-campaign/SKILL.md, skills/ttm-research/SKILL.md]
tech_stack:
  added: []
  patterns: [xml-workflow-tags, web-search-tool-detection, confidence-tagging, tier-context-loading]
key_files:
  created:
    - workflows/setup/new-campaign.md
    - workflows/lifecycle/research.md
  modified:
    - skills/ttm-new-campaign/SKILL.md
    - skills/ttm-research/SKILL.md
decisions:
  - Followed init.md XML structural pattern exactly (purpose/required_reading/process/success_criteria/output)
  - Research workflow uses freeform prompts (not AskUserQuestion) for topic input per plan spec
  - Manual paste insights default to MEDIUM confidence, elevated to HIGH when cross-referenced with COMPETITORS.md
metrics:
  duration: 174s
  completed: 2026-04-24T05:27:31Z
  tasks: 2/2
  files_created: 2
  files_modified: 2
---

# Phase 03 Plan 02: Campaign Workflows (new-campaign + research) Summary

Two campaign lifecycle workflows: /ttm-new-campaign scaffolds campaign directories via CLI tools with existence checking and global state update; /ttm-research detects WebSearch tool availability at runtime, falls back to manual paste, and generates structured RESEARCH.md with 5 sections and HIGH/MEDIUM/LOW confidence scoring on all insights.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create new-campaign.md workflow and activate SKILL.md | 65b5655 | workflows/setup/new-campaign.md, skills/ttm-new-campaign/SKILL.md |
| 2 | Create research.md workflow and activate SKILL.md | 53f7364 | workflows/lifecycle/research.md, skills/ttm-research/SKILL.md |

## What Was Built

### workflows/setup/new-campaign.md (104 lines)
- 6-step workflow following init.md XML structural pattern
- Step 1: Pre-flight check via `ttm-tools.cjs init --raw`
- Step 2: Deterministic slug generation via `ttm-tools.cjs slug` (never AI-generated, per D-10)
- Step 3: Existing campaign detection with overwrite confirmation
- Step 4: Scaffold creation via `ttm-tools.cjs campaign init` (STATE.md + RESEARCH.md + BRIEF.md + ASSETS/)
- Step 5: Global state update via `ttm-tools.cjs state update current_campaign`
- Step 6: Summary display with next-step guidance to /ttm-research

### workflows/lifecycle/research.md (260 lines)
- 7-step workflow implementing D-03 (web search + manual paste hybrid) and D-04 (confidence scoring)
- Step 1: Two-tier context loading -- Tier 1 all 9 reference files, Tier 2 COMPETITORS.md
- Step 2: Campaign validation with slug extraction from $ARGUMENTS
- Step 3: Phase order check per D-08 (warn if not "created", allow override)
- Step 4: Freeform topic collection from user
- Step 5: Runtime WebSearch tool detection with three modes (web/manual/hybrid)
- Step 6: Template-based RESEARCH.md generation with all 5 required sections filled
- Step 7: Campaign state update to phase=researched with timestamp tracking per D-09
- Confidence tagging: HIGH (verified URL), MEDIUM (user paste), LOW (AI inference)
- Manual paste fallback provides 3 suggested search queries based on campaign topic

### skills/ttm-new-campaign/SKILL.md
- Removed "Status: Not yet implemented (Phase 3)" line
- Removed "This command will:" bullet list
- Active routing to workflow file

### skills/ttm-research/SKILL.md
- Removed "Status: Not yet implemented (Phase 3)" line
- Removed "This command will:" bullet list
- Active routing to workflow file

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **XML structural pattern**: Both workflows use the exact 5-tag XML pattern from init.md (purpose, required_reading, process, success_criteria, output) for consistency across the workflow library.

2. **Freeform prompts for research**: Research workflow uses plain text prompts (not AskUserQuestion) for topic input, matching the plan specification and keeping the research flow conversational rather than structured-choice.

3. **Confidence elevation**: Manual paste insights start at MEDIUM but can be elevated to HIGH when they cross-reference and confirm data already in COMPETITORS.md (loaded as Tier 2).

## Verification Results

All automated verifications passed:
- new-campaign.md: XML tags present, CLI tool calls for slug/init/state update verified
- research.md: XML tags present, SEARCH_MODE variable, WebSearch detection, manual fallback, confidence tagging, campaign state update with phase.researched timestamp
- Both SKILL.md files: "Not yet implemented" removed, workflow routing active
- Both workflows under 500 lines (104 and 260 respectively)

## Self-Check: PASSED
