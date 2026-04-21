---
name: ttm-new-campaign
description: >
  Create a new campaign directory with initialized state and reference file links.
  Use when starting a new marketing campaign.
argument-hint: "[campaign-name]"
disable-model-invocation: true
allowed-tools: Read Write Bash
---

# /ttm-new-campaign

**Status:** Not yet implemented (Phase 3)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/setup/new-campaign.md`

This command will:
- Generate a URL-safe slug from the campaign name
- Create CAMPAIGNS/<slug>/ directory with initialized STATE.md
- Link reference files from .marketing/ root
- Set campaign phase to "discover" (ready for /ttm-research)
- Display the new campaign structure
