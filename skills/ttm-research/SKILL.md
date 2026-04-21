---
name: ttm-research
description: >
  Discover phase: perform market and audience research including SERP analysis,
  competitor content audit, and ambient narrative mapping. Use after creating a campaign.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-research

**Status:** Not yet implemented (Phase 3)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/research.md`

This command will:
- Analyze the campaign context against POSITIONING.md and COMPETITORS.md
- Perform SERP analysis for target keywords
- Audit competitor content in the campaign's topic area
- Map the ambient narrative (what the market already believes)
- Generate a research report that feeds into the brief phase
