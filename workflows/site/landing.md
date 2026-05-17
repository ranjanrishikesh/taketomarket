# Landing Page Workflow

**Required reading:**
- `.taketomarket/POSITIONING.md`
- `.taketomarket/BRAND.md`
- `.taketomarket/PRODUCT-DNA.md`
- `.taketomarket/ICP.md`
- `${CLAUDE_PLUGIN_ROOT}/references/landing-page-anatomy.md`
- `${CLAUDE_PLUGIN_ROOT}/playbooks/landing-pages.md` (delivered in P6)

---

## Step 1: Choose site location

Run:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs site-location --raw
```

Parse the JSON. Use AskUserQuestion (priority: critical):
- question: "Where should the landing site live?"
- options:
  - "Default: [result.default]"
  - "Custom path"
  - "Cancel"

If "Custom path": freeform input.

Save chosen path to `.taketomarket/CONFIG.md` `landing_path: <path>`.

## Step 2: Copy scaffold

Copy `${CLAUDE_PLUGIN_ROOT}/templates/site-scaffold/` to chosen landing path. Use `cp -R` or fs equivalent.

Skip if landing path already exists with a `package.json` (preserve user work).

## Step 3: Template substitution

Read `.taketomarket/brand/colors.json`. Replace `{{COLOR_*}}` placeholders in `app/tokens.css`.

Read POSITIONING.md, BRAND.md. Replace `{{SITE_TITLE}}`, `{{SITE_DESCRIPTION}}`, `{{SITE_NAME}}` in `app/layout.tsx`, `package.json`, `public/llms.txt`.

## Step 4: Generate copy for each section

For each of 13 sections in `app/page.tsx`, generate content following references/landing-page-anatomy.md guidance. Load positioning differentiator, brand voice, PRODUCT-DNA worldview for context.

Fill in component placeholders (`{{HERO_HEADLINE}}` etc.) with generated copy.

## Step 5: Generate /product, /pricing, /about pages

Use AskUserQuestion (priority: non-critical) for which pages to scaffold:
- "Which top-level pages do you want now?"
- multiSelect: ["Home (always)", "Product", "Pricing", "About / Manifesto"]

For each selected page: scaffold + generate copy following references/landing-page-anatomy.md.

## Step 6: Mandatory humanize

For every generated copy file, invoke `/ttm-humanize` via Skill tool. Replace original with humanized version.

## Step 7: Initial commit in the landing project

Inside the landing path:
```bash
cd <landing_path> && git init && git add . && git commit -m "feat: takeToMarket landing scaffold + initial copy"
```

(Or: if landing path is inside the user's existing repo, just git add + commit at the parent repo level.)

## Step 8: Quality gates

Run quality gates from `${CLAUDE_PLUGIN_ROOT}/workflows/site/quality-gates.md`:
- Positioning integrity (parse rendered HTML, verify differentiator + must-not-say compliance).
- Banned words check.
- (Playwright visual + perf — soft until P5 ships Playwright setup.)

If gates fail: route to /ttm-fix.

## Step 9: Print next steps

```
✓ Landing site scaffolded at [path].
Next:
- Run npm install && npm run dev in [path] to preview.
- Run /ttm-deploy when ready to ship.
- Run /ttm-pseo to add blog/use-case/comparison/alternative routes.
```
