# Landing Quality Gates

Called by `/ttm-landing`, `/ttm-pseo`, `/ttm-review`, `/ttm-verify` for landing/pSEO assets.

## Gate 1: Positioning integrity

For each generated HTML/TSX file:
1. Extract visible text (strip tags).
2. Confirm POSITIONING.md primary differentiator is present (or its key phrasing).
3. Confirm no banned words from BRAND.md `## Banned words`.
4. Confirm no must-not-say from POSITIONING.md.

Fail any file that violates.

## Gate 2: Schema.org markup

For each page file:
1. Confirm a `<script type="application/ld+json">` block exists.
2. Parse the JSON-LD.
3. Validate against expected schema type (Article, Product, FAQPage, etc.).

## Gate 3: Performance budget (Playwright)

Requires Playwright MCP. Check before running:

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs playwright-check --raw
```

If not detected: skip with WARN (don't fail). Otherwise:

For each deployed landing/pSEO URL (from CONFIG.md `last_deploy_url`):
1. Use Playwright MCP to run a Lighthouse audit at the URL.
2. Extract LCP, CLS, INP from the report.
3. Compare against budget:
   - LCP < 2.5s → PASS, else FAIL.
   - CLS < 0.1 → PASS, else FAIL.
   - INP < 200ms → PASS, else FAIL.

Output:
```
[PASS|FAIL] Gate 3: Performance
  LCP: 1.8s [PASS]
  CLS: 0.05 [PASS]
  INP: 150ms [PASS]
```

## Gate 4: Mobile responsiveness (Playwright)

Requires Playwright MCP. If not detected: skip with WARN.

For each deployed URL:
1. Take screenshots at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop).
2. AI vision review each screenshot:
   - No horizontal scroll on mobile.
   - All CTAs visible without scroll on desktop above-fold.
   - Text legible at smallest viewport.
   - No clipped images or overflowing buttons.
3. Score each viewport PASS/FAIL.

Output:
```
[PASS|FAIL] Gate 4: Mobile responsiveness
  375px: PASS
  768px: PASS
  1024px: PASS
  1440px: PASS
```

## Gate 5: Internal linking

For each pSEO page:
- Confirm at least 3 internal links to other pSEO or top-level pages.
- Confirm at least 1-2 external links to authoritative sources.

## Gate 6: llms.txt

Confirm `public/llms.txt` has been updated to reflect the new route(s).

## Gate result format

For each gate, output:
```
[PASS|FAIL] Gate N: <name>
  Details: <message>
```

If any FAIL: route caller to /ttm-fix with the gate output as context.
