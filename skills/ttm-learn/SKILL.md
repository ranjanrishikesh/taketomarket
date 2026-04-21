---
name: ttm-learn
description: >
  Learn phase: extract lessons, propose reference file edits, log root-cause
  taxonomy entries. Use after measurement to capture compound learnings.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-learn

**Status:** Not yet implemented (Phase 9)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/learn.md`

This command will:
- Extract lessons from measurement data and campaign history
- Propose specific edits to reference files (with human approval gates)
- Log root-cause taxonomy entries to LEARNINGS.md
- Identify patterns across campaigns for strategic insights
- Archive the campaign or mark for follow-up
