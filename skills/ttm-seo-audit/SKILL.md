---
name: ttm-seo-audit
description: >
  Technical and content SEO audit of a URL or sitemap. Use for on-demand
  SEO analysis of published content.
argument-hint: "[url-or-sitemap]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-seo-audit

**Status:** Not yet implemented (Phase 10)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/discipline/seo-audit.md`

This command will:
- Perform technical SEO analysis (meta tags, structure, schema markup)
- Audit content SEO (keyword usage, headings, internal linking)
- Check against SEO playbook best practices
- Generate an actionable audit report with priorities
- Suggest fixes aligned with positioning and campaign goals
