---
name: ttm-seo
description: >
  Unified SEO + AEO toolkit. Subcommands: audit (URL/sitemap technical+content audit),
  keyword-map (cluster generation with intent tags), aeo (citation status across AI engines).
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep WebSearch WebFetch
---

# /ttm-seo

Routes to one of three subcommand workflows based on the first argument.

## Usage

```
/ttm-seo audit <url-or-sitemap>     → workflows/discipline/seo/audit.md
/ttm-seo keyword-map [seed-keyword] → workflows/discipline/seo/keyword-map.md
/ttm-seo aeo <query>                → workflows/discipline/seo/aeo.md
```

## Workflow

Parse first positional arg:
- `audit` → read and follow `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/seo/audit.md`
- `keyword-map` → read and follow `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/seo/keyword-map.md`
- `aeo` → read and follow `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/seo/aeo.md`
- anything else: print usage and exit.
- After matching a subcommand, strip it from `$ARGUMENTS` and forward the remainder to the workflow as the new `$ARGUMENTS` value. Example: `/ttm-seo audit https://example.com` → workflow receives `$ARGUMENTS=https://example.com`.

## Next steps

See `${CLAUDE_PLUGIN_ROOT}/templates/next-step-footer.md`.
<!-- next-step-footer -->
