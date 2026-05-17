# pSEO Workflow

**Required reading:**
- `${CLAUDE_PLUGIN_ROOT}/references/pseo-page-anatomy.md`
- `${CLAUDE_PLUGIN_ROOT}/references/pseo-templates/[template]-anatomy.md`
- `${CLAUDE_PLUGIN_ROOT}/references/pseo-templates/[template]-content-playbook.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/pseo/[template]-cms-schema.json`
- `${CLAUDE_PLUGIN_ROOT}/playbooks/pseo.md` (delivered in P6)
- `.taketomarket/POSITIONING.md`, `BRAND.md`, `PRODUCT-DNA.md`, `ICP.md`

---

## Step 1: Verify /ttm-landing is run

Read `.taketomarket/CONFIG.md` for `landing_path`. If not set: print "Run /ttm-landing first" and exit.

## Step 2: Parse args

`<template>` must be one of: blog, use-case, comparison, alternative.
`<sub>` is either `new`, `from-json`, or `list`.

## Step 3 (new): Generate one page

Read appropriate anatomy + content playbook + CMS schema.

AskUserQuestion to gather CMS-schema-required fields, or:
- For blog: title, tldr, key sections (h2 list), takeaways, FAQ.
- For use-case: useCase name, problem, feature pillars, walkthrough steps.
- For comparison: competitor, comparison table rows, when-we-win, when-they-win.
- For alternative: competitor, why-people-leave, why-we-are-alternative, migration steps.

Validate against CMS schema. If invalid: prompt to fix.

Generate page using content playbook guidance.

Render as Next.js page at `[landing_path]/app/[route]/[slug]/page.tsx`:
- `/blog/[slug]` for blog
- `/use-cases/[slug]` for use-case
- `/vs/[slug]` for comparison
- `/alternatives/[slug]` for alternative

Include Schema.org markup (Article + FAQPage + BreadcrumbList).

Mandatory humanize step on the generated copy.

Update `sitemap.ts` and `public/llms.txt` to include new route.

## Step 4 (from-json): Batch generate

Parse JSON file. Validate each entry against schema. For each: same as Step 3 but skip user-question phase.

## Step 5 (list): Just enumerate

List all existing pSEO routes by scanning `[landing_path]/app/{blog,use-cases,vs,alternatives}/`.

## Step 6: Quality gates

Run gates from quality-gates.md on each new page.

## Step 7: Print next steps
