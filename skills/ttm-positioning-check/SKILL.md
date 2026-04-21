---
name: ttm-positioning-check
description: >
  Sample recent assets and report positioning drift percentage, types, and
  bleeding analysis. Auto-triggers when potential positioning drift is detected.
disable-model-invocation: false
allowed-tools: Read Bash Glob Grep
---

# /ttm-positioning-check

**Status:** Not yet implemented (Phase 6)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/reference-mgmt/positioning-check.md`

This command will:
- Sample recent campaign assets across all active campaigns
- Compare each asset against POSITIONING.md invariant
- Calculate positioning drift percentage and categorize drift types
- Perform bleeding analysis (where positioning leaks into wrong territory)
- Report findings with 3 options: Correct, Accept+log, Escalate to shift
