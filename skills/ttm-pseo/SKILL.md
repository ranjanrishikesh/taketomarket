---
name: ttm-pseo
description: >
  Generate programmatic SEO routes (blog, use-case, comparison, alternative)
  inside your existing /ttm-landing site. Each template has dedicated anatomy
  and content playbook. JSON CMS input drives generation. AEO + SEO optimized.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-pseo

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/site/pseo.md`.

## Subcommands

- `/ttm-pseo new <template> <slug>` — create a single new page.
- `/ttm-pseo from-json <template> <path-to-json>` — create N pages from JSON array.
- `/ttm-pseo list` — list all pSEO routes in site.

Where `<template>` is one of: blog, use-case, comparison, alternative.

## Next steps

See `${CLAUDE_PLUGIN_ROOT}/templates/next-step-footer.md`.
<!-- next-step-footer -->
