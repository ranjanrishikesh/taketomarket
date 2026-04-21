---
name: ttm-archive
description: >
  Archive a completed campaign, finalize state, and update LEARNINGS.md.
  Use when a campaign lifecycle is fully complete.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob
---

# /ttm-archive

**Status:** Not yet implemented (Phase 7)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/archive.md`

This command will:
- Verify all campaign phases are complete (or explicitly skipped)
- Finalize campaign STATE.md with completion timestamp
- Update LEARNINGS.md with campaign summary
- Move campaign to archived status
- Display final campaign metrics and outcomes
