---
name: ttm-repurpose
description: >
  Fan out a long-form asset into derivative assets across channels with full
  brief-produce-verify per derivative. Use to maximize content reach.
argument-hint: "[source-asset]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-repurpose

**Status:** Not yet implemented (Phase 10)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/repurpose.md`

This command will:
- Analyze the source asset for repurposable content segments
- Generate derivative briefs per target channel from CHANNELS.md
- Produce each derivative in a fresh context (wave-parallel)
- Verify each derivative through the full quality gate wall
- Track all derivatives as linked assets in the campaign
