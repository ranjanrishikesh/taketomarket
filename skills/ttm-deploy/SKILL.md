---
name: ttm-deploy
description: >
  Deploy your /ttm-landing site to Vercel. Auto-detects best path: git-push to
  Vercel-connected repo (preferred), vercel CLI, or VERCEL_TOKEN env. Walks
  you through setup if no path is configured.
disable-model-invocation: true
allowed-tools: Read Write Bash AskUserQuestion
---

# /ttm-deploy

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/site/deploy.md`.

## Flags

- `--prod` — deploy to production. Default is preview.

## Next steps

See `${CLAUDE_PLUGIN_ROOT}/templates/next-step-footer.md`.
<!-- next-step-footer -->
