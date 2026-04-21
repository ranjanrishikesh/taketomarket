---
name: ttm-state
description: >
  Display current campaign states, decisions in flight, blockers, and
  experiments. Use to get an overview of all active marketing work.
disable-model-invocation: true
allowed-tools: Read Bash Glob
---

# /ttm-state

**Status:** Not yet implemented (Phase 7)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/state.md`

This command will:
- Parse .marketing/STATE.md and all CAMPAIGNS/*/STATE.md files
- Display active campaigns with their current lifecycle phase
- Show decisions in flight and blockers
- List experiments and their status
- Provide a compact overview for session resumption
