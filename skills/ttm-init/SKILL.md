---
name: ttm-init
description: >
  Interview-driven onboarding that generates all .marketing/ reference files
  from structured questioning. Use when setting up takeToMarket for a new project.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-init

**Status:** Not yet implemented (Phase 2)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/setup/init.md`

This command will:
- Run a structured interview to gather positioning, brand, ICP, and channel data
- Generate all .marketing/ reference files (POSITIONING.md, BRAND.md, ICP.md, etc.)
- Create CLAUDE.md and AGENTS.md with positioning-as-invariant enforcement rules
- Validate the generated .marketing/ directory structure
- Display a summary of the initialized marketing operating system
