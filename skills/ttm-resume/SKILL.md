---
name: ttm-resume
description: >
  Resume a paused campaign at its last completed phase. Use when returning
  to a campaign after a session break.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob
---

# /ttm-resume

**Status:** Not yet implemented (Phase 7)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/resume.md`

This command will:
- Read the campaign's STATE.md to determine last completed phase
- Load relevant context for the next phase
- Display what was completed and what comes next
- Offer to continue with the next lifecycle command
- Restore session context for seamless continuation
