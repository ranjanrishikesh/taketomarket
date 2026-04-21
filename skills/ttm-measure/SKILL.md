---
name: ttm-measure
description: >
  Measure phase: analyze pasted analytics data against outcome metrics using
  attribution models. Use after a campaign has been live long enough for data.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-measure

**Status:** Not yet implemented (Phase 9)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/measure.md`

This command will:
- Accept pasted analytics data from GA, GSC, HubSpot, or other sources
- Analyze performance against the campaign's outcome metrics (not just output)
- Apply 3 attribution models to assess contribution
- Generate a measurement report with outcome-first framing
- Identify signals for the Learn phase
