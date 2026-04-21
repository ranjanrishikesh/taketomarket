---
name: ttm-review
description: >
  Review phase: present assets with structured review checklist for human
  evaluation. Use after verification passes to get human approval.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-review

**Status:** Not yet implemented (Phase 5)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/review.md`

This command will:
- Present each verified asset with its verification report
- Display a structured review checklist per asset
- Collect human approval, revision requests, or rejection
- Route rejected assets to /ttm-fix with specific feedback
- Advance approved assets to "ship-ready" status
