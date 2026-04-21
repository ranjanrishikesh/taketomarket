---
name: ttm-verify
description: >
  Verify phase: run all applicable quality gates on every asset with pass/fail
  report and line-level feedback. Use after production to validate assets.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-verify

**Status:** Not yet implemented (Phase 4)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/verify.md`

This command will:
- Run base quality gates (positioning drift, claim accuracy, voice drift, etc.)
- Run discipline-specific gates per asset type
- Generate pass/fail report with line-level feedback for failures
- Block progression to Review if any mandatory gate fails
- Save verification report to CAMPAIGNS/<slug>/reports/
