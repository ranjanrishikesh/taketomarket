---
name: ttm-brief
description: >
  Generate a campaign brief with mandatory outcome metrics, positioning anchor,
  and channel mix. Use when the user says "brief", "plan campaign", or invokes
  /ttm-brief.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-brief

**Status:** Not yet implemented (Phase 3)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/brief.md`

This command will:
- Generate a structured campaign brief from campaign context and reference files
- Enforce mandatory outcome metric (refuses to proceed without both output and outcome metrics)
- Anchor positioning from POSITIONING.md
- Define channel mix from CHANNELS.md
- Run positioning check gate before allowing progression to Produce
