---
name: ttm-email-preflight
description: >
  Deliverability, dark-mode, and spam-trigger scan for email assets.
  Use before sending any email campaign.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-email-preflight

**Status:** Not yet implemented (Phase 10)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/email-preflight.md`

This command will:
- Scan email content for spam trigger words and phrases
- Check dark-mode rendering compatibility
- Validate deliverability factors (subject line length, preheader, etc.)
- Verify links, UTM parameters, and unsubscribe compliance
- Generate a preflight report with pass/fail per check
