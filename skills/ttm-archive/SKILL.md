---
name: ttm-archive
description: >
  Archive a completed campaign, finalize state, and update LEARNINGS.md.
  Use when a campaign lifecycle is fully complete.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob AskUserQuestion
---

# /ttm-archive

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/archive.md`
