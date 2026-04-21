---
name: ttm-next
description: >
  Guide user to the right next command based on current campaign state.
  Use when unsure what to do next in the marketing workflow.
disable-model-invocation: true
allowed-tools: Read Bash Glob
---

# /ttm-next

**Status:** Not yet implemented (Phase 7)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/next.md`

This command will:
- Read current campaign states across all active campaigns
- Determine the highest-priority next action
- Suggest the specific /ttm-* command to run next
- Explain why this is the recommended next step
- Show the full campaign pipeline status
