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

## Gate 3: Performance budget (manual + Playwright in P5)

Document target budgets in the verify report:
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms

Until Playwright MCP lands (P5): only a documentation gate. User runs Lighthouse locally + records results.

## Gate 4: Mobile responsiveness (manual + Playwright in P5)

Document tested viewports:
- 375px (mobile)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop)

Until Playwright MCP lands: user takes screenshots manually + records.

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
