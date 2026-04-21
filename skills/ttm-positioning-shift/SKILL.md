---
name: ttm-positioning-shift
description: >
  Controlled positioning change with reasoning, migration plan, deprecation
  schedule, and approval gate. Use when positioning needs intentional evolution.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-positioning-shift

**Status:** Not yet implemented (Phase 6)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/reference-mgmt/positioning-shift.md`

This command will:
- Require explicit reasoning for the positioning change
- Generate a migration plan for in-flight campaigns
- Create a deprecation schedule for old positioning assets
- Present the full change for human approval (mandatory gate)
- Update POSITIONING.md only after approval
