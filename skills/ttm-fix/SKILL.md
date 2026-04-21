---
name: ttm-fix
description: >
  Fix phase: root cause analysis, fix brief, re-produce in isolated context,
  re-verify. Capped at 3 attempts per asset. Use when assets fail review.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-fix

**Status:** Not yet implemented (Phase 5)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/fix.md`

This command will:
- Perform root cause analysis on failed assets using review feedback
- Generate a specific rewrite brief targeting the root cause
- Re-produce the asset in an isolated fresh context
- Re-verify against all quality gates
- Enforce 3-attempt cap (escalate to human if still failing)
