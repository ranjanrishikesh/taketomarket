---
name: ttm-health
description: >
  Validate .marketing/ directory integrity, reference file completeness,
  and state consistency. Auto-triggers when potential issues detected.
disable-model-invocation: false
allowed-tools: Read Bash Glob Grep
---

# /ttm-health

**Status:** Not yet implemented (Phase 7)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/health.md`

This command will:
- Validate .marketing/ directory structure against expected schema
- Check all reference files exist and have required sections
- Verify STATE.md consistency with campaign directories
- Report missing files, broken references, or stale state
- Suggest corrective actions for any issues found
