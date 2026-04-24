---
name: ttm-brief
description: >
  Generate a campaign brief with mandatory outcome metrics, positioning anchor,
  and channel mix. Use when the user says "brief", "plan campaign", or invokes
  /ttm-brief.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-brief

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/brief.md`
