# Context Loading Strategy

## Overview

takeToMarket uses a two-tier context loading strategy to maximize the usable context window for actual work. Every reference file in `.taketomarket/` has a compact Tier 1 summary and a full Tier 2 body. Workflows load only what they need.

## Tier 1: Universal Summaries

**Budget:** ~2,000 tokens total across all 9 reference files.

Tier 1 content is the `<!-- _SUMMARY -->` block at the top of each reference file, delimited by `<!-- END_SUMMARY -->`. It contains the minimum context needed to enforce positioning invariants, check brand voice, and understand campaign scope.

**When loaded:** Every workflow loads all Tier 1 summaries. This is non-negotiable -- positioning enforcement requires ambient awareness of the positioning summary in every context.

**Implementation:** The AI reads from the start of the file to the `<!-- END_SUMMARY -->` delimiter. Everything below the delimiter is Tier 2.

## Tier 2: Full Reference Content

Tier 2 is the complete file content below `<!-- END_SUMMARY -->`. It includes detailed tables, examples, history, and configuration.

**When loaded:** Only by workflows that need the full content for their specific task. Loading Tier 2 for all files would consume ~15,000-20,000 tokens -- acceptable for production workflows but wasteful for state checks.

## Per-File Token Budgets

| File | Tier 1 Budget | Tier 2 Loaded By |
|------|---------------|------------------|
| POSITIONING.md | ~150 words | produce, verify, positioning-check |
| BRAND.md | ~100 words | produce, verify, brand-refresh |
| ICP.md | ~100 words | produce, verify, icp-refresh, brief |
| CHANNELS.md | ~80 words | brief, measure |
| STATE.md | frontmatter only | state, resume, next, health |
| CALENDAR.md | ~80 words | brief, new-campaign |
| COMPETITORS.md | ~80 words | research, competitor-scan |
| METRICS.md | ~80 words | measure, brief |
| LEARNINGS.md | ~80 words | brief, learn |

**Total Tier 1:** ~830 words / ~1,100 tokens (well within the ~2,000 token budget)

## Workflow-to-Reference Loading Matrix

| Workflow | Tier 1 (all summaries) | Tier 2 Files Loaded |
|----------|----------------------|---------------------|
| /ttm-init | N/A (creates files) | N/A |
| /ttm-new-campaign | Yes | CALENDAR.md |
| /ttm-brief | Yes | ICP.md, CHANNELS.md, METRICS.md, CALENDAR.md |
| /ttm-produce | Yes | POSITIONING.md, BRAND.md, ICP.md + playbook |
| /ttm-verify | Yes | POSITIONING.md, BRAND.md, ICP.md + gates |
| /ttm-review | Yes | None (human review) |
| /ttm-fix | Yes | Same as verify |
| /ttm-ship | Yes | CHANNELS.md |
| /ttm-measure | Yes | METRICS.md, CHANNELS.md |
| /ttm-learn | Yes | LEARNINGS.md, METRICS.md |
| /ttm-state | Yes | None |
| /ttm-resume | Yes | None |
| /ttm-health | Yes | None |
| /ttm-positioning-check | Yes | POSITIONING.md |
| /ttm-positioning-shift | Yes | POSITIONING.md |
| /ttm-brand-refresh | Yes | BRAND.md |
| /ttm-icp-refresh | Yes | ICP.md |
| /ttm-competitor-scan | Yes | COMPETITORS.md |
| /ttm-research | Yes | COMPETITORS.md |

## Rules for Workflow Authors

1. **Always load Tier 1 summaries.** Every workflow starts by reading the `_SUMMARY` block from all 9 reference files. This ensures positioning enforcement is always active.

2. **Only load Tier 2 when your workflow needs the full content.** Check the loading matrix above. If your workflow is not listed as a Tier 2 consumer for a file, do not load the full file.

3. **STATE.md is special.** It uses YAML frontmatter instead of `_SUMMARY` blocks. Tier 1 is the frontmatter (parsed by `ttm-tools.cjs state read`). Tier 2 is the Markdown body.

4. **Campaign-specific files are always full-loaded.** Files inside `CAMPAIGNS/<slug>/` do not use the two-tier pattern. They are loaded in full by the workflow that owns that campaign phase.

5. **Playbooks are Tier 2 only.** Playbooks live in the plugin's `playbooks/` directory (not in `.taketomarket/`). They are loaded only by the produce workflow, one at a time, based on the campaign brief's channel selection.

## Implementation Details

### Delimiter Format

```markdown
<!-- _SUMMARY: Tier 1 context (loaded universally, <200 words) -->
[compact summary content]
<!-- END_SUMMARY -->

[full Tier 2 content]
```

### Reading Tier 1 Only

The AI reads from line 1 to the line containing `<!-- END_SUMMARY -->`. Everything after is ignored unless the workflow explicitly requests Tier 2.

### .taketomarket/ Directory Structure

```
.taketomarket/
├── POSITIONING.md
├── BRAND.md
├── ICP.md
├── CHANNELS.md
├── STATE.md
├── CALENDAR.md
├── COMPETITORS.md
├── METRICS.md
├── LEARNINGS.md
└── CAMPAIGNS/
```

Note: The `.taketomarket/` directory does NOT contain a `PLAYBOOKS/` subdirectory. Playbooks live in the plugin's `playbooks/` directory and are loaded by reference during the Produce phase.
