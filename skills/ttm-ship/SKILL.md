---
name: ttm-ship
description: >
  Ship phase: generate launch checklist confirming tracking, UTMs, funnel
  testing, and asset finalization. Use when assets are approved and ready to go.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-ship

**Status:** Not yet implemented (Phase 5)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/ship.md`

This command will:
- Generate a launch checklist per asset and channel
- Verify UTM parameters and tracking codes are present
- Confirm funnel integrity and landing page readiness
- Finalize assets for distribution
- Advance campaign state to "shipped" (ready for /ttm-measure)
