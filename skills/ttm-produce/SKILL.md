---
name: ttm-produce
description: >
  Produce phase: generate content assets in fresh contexts loaded with brief,
  positioning, brand, ICP, and playbook. Use after a brief is approved.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-produce

**Status:** Not yet implemented (Phase 4)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/produce.md`

This command will:
- Load the campaign brief and all reference files into fresh subagent contexts
- Generate content assets using wave-parallel execution pattern
- Apply discipline-specific playbook rules per asset type
- Save produced assets to CAMPAIGNS/<slug>/assets/
- Advance campaign state to "verify" phase
