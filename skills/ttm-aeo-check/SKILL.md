---
name: ttm-aeo-check
description: >
  Check citation status across AI engines for a query. Use to assess how
  your content appears in AI-generated answers.
argument-hint: "[query]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-aeo-check

**Status:** Not yet implemented (Phase 10)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/aeo-check.md`

This command will:
- Check how AI engines cite your content for the given query
- Analyze citation quality and positioning accuracy
- Compare against competitor citations
- Report AEO (Answer Engine Optimization) score
- Suggest content improvements for better AI engine visibility
