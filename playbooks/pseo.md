---
discipline: pseo
asset_types: [pseo-blog, pseo-use-case, pseo-comparison, pseo-alternative]
version: "1.0"
---

# pSEO Discipline Playbook

This playbook extends the base playbook contract (`base.md`) with programmatic-SEO production guidance, discipline gates, and format rules. It is loaded by ttm-producer during pSEO content generation and parsed by ttm-verify for gate evaluation.

The playbook is opinionated around **Practical Programmatic SEO** as taught by Ian Nuttall (Practical Programmatic, *No-Code Programmatic SEO*). Per-template page anatomy lives in `references/pseo-page-anatomy.md` (shared structure) and the four template-specific files in `references/pseo-templates/` — this playbook governs the **data × template × intent strategy layer** that decides whether a pSEO project should exist at all and when its pages are allowed to hit the index.

For the broader SEO measurement strategy this work plugs into, see `playbooks/seo.md` (Aleyda Solis's 3-Layer model). For passage-level citability of individual templated pages, see `playbooks/aeo.md` (Mike King's Relevance Engineering).

---

## Production Guidance

### pSEO is data × template × intent — all three or none

A working pSEO page is the product of three inputs, multiplied. Miss any one and the project doesn't fail gracefully — it generates spam.

- **Data** — a structured source where every row is a real, distinct entity (cities, tools, languages, recipes, jobs, datasets, integrations). The rows are the unit of unique content. If the data source has 500 rows, that is the ceiling on the project. Don't pad rows with AI to get to 5,000.
- **Template** — a single, repeatable page shape that consistently presents the data for one row. One template. Tested before scale. Same layout, same H2 structure, same schema fields populated from the same column names. The template is code; the rows are inputs.
- **Intent** — a specific, observable thing the searcher wants when they land on this page. Not "they typed something with this row's name in it." A real job-to-be-done that the templated page completes. "Compare Tool A to Tool B for use case Y." "Find the cheapest flight from City X to City Y in November." "Convert Language X to Language Y."

If any one of the three is absent, the project is not pSEO — it is index pollution wearing a template costume.

### Find the data source first, not the template

Most failed pSEO projects start with a template idea — "let's make a page for every X" — and then go looking for data to fill it. That ordering is backwards and it is the single most common reason pSEO sites flame out at scale.

Reverse the order. Start with: **"What data do I already have that is uniquely useful, hard to assemble, and difficult for a competitor to replicate?"** The data source is the moat. The template is the delivery mechanism. A great template wrapped around weak data produces thin pages at scale; a mediocre template wrapped around a proprietary data set produces a defensible long tail.

Acceptable data sources, in rough order of defensibility:

1. **First-party data only you have** — your own usage stats, integrations, customer outcomes, pricing comparisons run against your own tool.
2. **Aggregated public data with non-trivial cleaning** — government datasets, public APIs, scrape + normalize + enrich.
3. **Permissioned third-party data** — licensed feeds, partner data, official APIs (Crunchbase, Stripe, etc.).
4. **AI-summarized public content** — last resort, and only when the summary genuinely outperforms the source in clarity or aggregation. Pure AI generation with no anchor data does not count as a data source.

### Template once; scale forever

Build one template. Ship one row populated by the template. Then ship ten. Read all ten as a human and ask: "If I landed on this page from a Google search, would I be satisfied?" Fix the template until the answer is yes for all ten. *Then* generate the next thousand.

Do not skip the test phase. Do not ship the template and the 10,000 pages on the same day. Every failed pSEO site shares the same origin story — they generated the long tail before the short tail had been pressure-tested.

### Two-axis pSEO patterns — pick one and commit

Almost every successful pSEO site fits one of two axis patterns:

- **[Thing] × [Location]** — "best [thing] in [city]", "[service] near [zipcode]", "things to do in [city] in [month]". The row dimension is geography; data needs to be locally specific.
- **[Thing] × [Thing]** — "[tool A] vs [tool B]", "[language X] to [language Y]", "[recipe] without [ingredient]", "alternatives to [thing]". The row dimension is pairwise comparison; data needs to be entity-specific for both sides.

Mixing axes ("best [thing] in [city] vs [other thing] in [other city]") explodes the row count, dilutes intent per page, and produces a long tail of zero-search-volume URLs. Pick one axis. The four asset types in this playbook map to specific axis patterns:

- `pseo-blog` — often single-axis content (informational templates).
- `pseo-use-case` — [thing] × [use case] axis.
- `pseo-comparison` — [thing] × [thing] axis (head-to-head).
- `pseo-alternative` — [thing] × [thing] axis (one-to-many, alternatives-to).

### Validate user intent before scaling

Generating pages for queries no one searches is the cleanest definition of index pollution. Before scaling, every template must answer:

1. **Does the templated query actually exist?** Pull search volume from any keyword tool (Ahrefs, SEMrush, Google Keyword Planner, GSC) on a sample of 20-50 rows. If the median row has 0 monthly searches, the template should not scale.
2. **What does the SERP look like for these queries?** Look at the existing top 10. If every result is a thin SEO-spam page, the SERP is winnable. If every result is a deep editorial article from a high-authority site, this template can't compete and shouldn't be built.
3. **What is the searcher's job-to-be-done on the page?** Write the job in one sentence. If you can't write it, the searcher doesn't have a job; the query is incidental and the page will not convert.

### The Zapier benchmark — what good looks like

Zapier's app-pair pages are the canonical reference: **63,000+ templated pages → 280,000+ monthly organic visits → material contribution to a $5B valuation**. The structural lessons:

- Every page has a unique data anchor (two real apps, real integration triggers, real action examples).
- One template, ruthlessly consistent across all pages.
- Intent is unambiguous — "connect [App A] and [App B]" — and the page delivers it in the first viewport.
- Internal links form a topical graph — every page links to other relevant app pairs, creating discovery paths for both users and crawlers.
- Pages with no genuine integration data are noindexed; only validated pairs are pushed to the index.

If your pSEO output cannot pass a Zapier-style audit on any random sampled row, the template isn't ready.

### Quality at scale — every page is a manual-review candidate

Quality and scale are not opposed; they are coupled. Every page in a pSEO project must pass a "would a human in this page's target audience be satisfied?" test. The fact that pages are templated does not exempt them from quality review — it just changes the unit of review from per-page to per-template-plus-sampled-rows.

Sample 1% of rows (minimum 20, maximum 200) and review them as a real reader would. If the sample shows thin or empty pages, fix the template or trim the data before pushing to scale. The verifier and any reviewer should be able to land on a random row and conclude that the page deserves to exist.

### No-code pSEO is a delivery mechanism, not a strategy

The "no-code pSEO" pipeline — spreadsheet/database + Airtable/Notion/Sheets + Webflow/Framer/Next.js + a CMS plugin or static-site generator — is a perfectly valid way to ship a programmatic site. It is not a strategy. The strategy is still data × template × intent. The no-code pipeline only matters once those three are locked. Reaching for tools before locking the triad is a tell that the project will fail.

### Index strategically — generate everything, index only what earns it

A pSEO project generates pages from data; it does not need to expose every generated page to search engines. Generate 10,000 rows; mark 8,000 as `noindex` because they lack a data anchor strong enough to satisfy intent; index the 2,000 that pass the per-page quality gate. As more data arrives (more reviews, more integration triggers, more entity coverage), additional pages graduate from `noindex` to indexable.

This is the single most important operational pattern in pSEO. Sites that index everything they generate get core-update flattened. Sites that gate indexing on data quality survive and compound.

### Cross-reference the operational layers

This playbook is the strategy. For execution mechanics, defer to:

- **`references/pseo-page-anatomy.md`** — universal pSEO page structure (breadcrumbs, TL;DR/answer block, FAQ schema, related-pages footer, llms.txt requirement, performance budgets). Every templated page must satisfy this anatomy.
- **`references/pseo-templates/blog-anatomy.md`** + **`blog-content-playbook.md`** — pSEO blog template.
- **`references/pseo-templates/use-case-anatomy.md`** + **`use-case-content-playbook.md`** — pSEO use-case template.
- **`references/pseo-templates/comparison-anatomy.md`** + **`comparison-content-playbook.md`** — pSEO head-to-head comparison template.
- **`references/pseo-templates/alternative-anatomy.md`** + **`alternative-content-playbook.md`** — pSEO alternatives-to template.
- **`playbooks/seo.md`** — measurement and strategy layer (3-Layer Presence/Readiness/Business Impact model).
- **`playbooks/aeo.md`** — passage-level citability for AI answer engines.

When this playbook and a reference disagree on a tactical detail, the reference wins on page mechanics; this playbook wins on the question of whether the project should exist at all and which rows are allowed to index.

---

## Discipline Gates

### DISC-PSEO-01: Data × Template × Intent Triad — Tier 1

**Checks:** The pSEO project brief declares all three inputs explicitly — data source, template definition, and per-page user intent
**Against:** Project brief and a sampled row's rendered page

#### Evaluation Criteria

1. **All three inputs named**
   - PASS: Brief explicitly names (a) the data source with row count and provenance, (b) the template with its required field map, and (c) the per-page user intent in one sentence
   - WARN: Two of three named clearly; one is implicit or hand-waved
   - FAIL: One or more of data, template, or intent is missing, vague, or "we'll figure it out as we go"

2. **Data source meets the defensibility floor**
   - PASS: Data source is first-party, aggregated public + non-trivial cleaning, permissioned third-party, or AI-summarized with anchor data — and the brief states which
   - WARN: Data source named but provenance unclear
   - FAIL: Data is "AI-generated content for each row" with no underlying data anchor

### DISC-PSEO-02: Per-Page Unique Data Anchor — Tier 1

**Checks:** Every published page carries unique data that distinguishes it from every other page on the same template
**Against:** Sampled rows (minimum 20, drawn at random from the indexable set)

#### Evaluation Criteria

1. **Unique data per page**
   - PASS: Every sampled page contains at least 3 distinct data fields populated from the row that are not present on any other indexable page on this template
   - WARN: Most sampled pages unique but 1-2 pages share substantially identical data with another row
   - FAIL: Sampled pages are template-only with no row-specific data, or rely entirely on AI-generated narrative with no anchored facts

2. **No empty placeholder fields**
   - PASS: No sampled page has a visible field rendering as empty, "N/A", "TBD", "—", or a placeholder string
   - WARN: 1-2 sampled pages have one minor field empty (e.g., optional metric) with the rest populated
   - FAIL: Multiple sampled pages have primary content fields empty; template renders skeleton boxes

### DISC-PSEO-03: Intent Declared and Realized — Tier 1

**Checks:** Per-page user intent is declared in the brief and observably realized in the rendered page
**Against:** Project brief intent statement + sampled rendered pages

#### Evaluation Criteria

1. **Intent declared in brief**
   - PASS: Brief states the per-page intent in one sentence as a job-to-be-done ("the searcher wants to X") and the template's primary H1 + TL;DR + above-fold CTA all answer that job
   - WARN: Intent declared but only partially realized in the rendered page (e.g., H1 names the job but the page body answers a different one)
   - FAIL: No intent declared, or the rendered page is structured around a different intent than the brief states

2. **Search-volume validation for sampled rows**
   - PASS: At least 50% of sampled rows show non-zero monthly search volume for their target query (any reputable tool — Ahrefs, SEMrush, GKP, GSC for the few that already rank)
   - WARN: 20-50% of sampled rows show non-zero search volume
   - FAIL: Under 20% of sampled rows show any search demand — the template is generating queries no one types

### DISC-PSEO-04: Template Pre-Scale Test — Tier 1

**Checks:** The template was tested on a small set of pages and read by a human before being scaled
**Against:** Project history / commit log + a sampled review note

#### Evaluation Criteria

1. **Test set existed before scale**
   - PASS: Project record shows the template was first published with 5-25 rows, reviewed end-to-end, iterated, and only then scaled to full row count
   - WARN: Test set existed but no review iteration visible (template was scaled the same day it was created)
   - FAIL: Template was scaled directly from 0 to the full row count with no intermediate test phase

### DISC-PSEO-05: Index Strategy & Quality Gate — Tier 1

**Checks:** Indexing is gated on per-page quality, not granted to every generated page by default
**Against:** Generated row count vs. indexable row count; robots/meta directives on sampled "thin" rows

#### Evaluation Criteria

1. **Generated vs. indexable separation**
   - PASS: The project has more generated pages than indexable pages, with documented criteria for what graduates a page from `noindex` to indexable (e.g., "≥3 populated fields", "≥1 review", "≥non-zero search volume")
   - WARN: All generated pages are indexed but the brief acknowledges the indexing strategy needs revisiting
   - FAIL: Every generated page is indexed by default with no quality threshold; thin pages are visible in the sitemap

2. **Sampled thin pages carry `noindex`**
   - PASS: Sampling pages that fail the per-page data threshold confirms they carry `noindex` or are excluded from the sitemap
   - WARN: Some thin pages carry `noindex`, others slipped through
   - FAIL: Thin pages are sitemapped and indexable

### DISC-PSEO-06: Internal Topical Graph — Tier 2

**Checks:** Templated pages link to other relevant templated pages, forming a discoverable topical graph rather than a flat list of orphans
**Against:** Sampled rendered pages + sitemap structure

#### Evaluation Criteria

1. **Related-page links on each page**
   - PASS: Every sampled page renders at least 3 contextually relevant outbound internal links to other pages in the same template family or a related template (see `references/pseo-page-anatomy.md` — "Related pages" block)
   - WARN: Related-page block exists but links are random or non-contextual
   - FAIL: Pages are orphans — no outbound internal links to sibling templated pages

2. **Hub/index page exists for the template**
   - PASS: A hub page indexes the template's rows (alphabetically, by category, or by data attribute) and is itself crawlable and internally linked from the site nav
   - WARN: Hub exists but is buried — not linked from primary nav or footer
   - FAIL: No hub page; rows are only discoverable via XML sitemap

### DISC-PSEO-07: Structured Data Per Template — Tier 2

**Checks:** Each template ships with the schema markup type appropriate to its content shape, with all required fields populated from row data
**Against:** Sampled pages' JSON-LD blocks (see `references/pseo-page-anatomy.md`)

#### Evaluation Criteria

1. **Schema type matches template shape**
   - PASS: Schema type is appropriate (Article + FAQPage for `pseo-blog`; Article + FAQPage + SoftwareApplication or Product for `pseo-use-case`; Article + FAQPage + appropriate comparison schema for `pseo-comparison`/`pseo-alternative`); BreadcrumbList is on every page
   - WARN: Schema type correct but one or two required properties not populated from row data
   - FAIL: Schema missing, wrong type for the template, or boilerplate (same author, date, publisher on every page when row-specific fields exist)

2. **Row-specific schema fields**
   - PASS: At least 3 schema fields per page are populated from the row (e.g., `name`, `applicationCategory`, `aggregateRating`, `offers.price` for software-app templates)
   - WARN: Schema present but most fields are template-static, not row-specific
   - FAIL: Schema fields are identical across sampled pages

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-10 | Tier 2 (advisory) | Tier 1 (blocking) | Format correctness — schema, headings, canonicals, sitemap inclusion — is the mechanism by which a templated page is crawled, indexed, and rendered in the SERP. A pSEO site cannot tolerate template-level format defects because every defect multiplies by the row count. |

---

## Format Rules

- **Minimum unique content per page:** At least 3 distinct row-derived data fields visible above the fold; at least 150 words of row-anchored body content (not template boilerplate). Pages below this threshold must be `noindex` until they reach it.
- **One template per asset type:** A single canonical template per `asset_type` (one for `pseo-blog`, one for `pseo-use-case`, etc.). Variants are template branches, not separate templates, and require a documented reason in the brief.
- **Template field manifest:** Every template declares the list of fields it reads from the data source. Every field is either marked `required` (page is `noindex` if empty) or `optional` (page renders without the field; no placeholder text).
- **Required schema per template family:** `BreadcrumbList` on every page + `Article` minimum, with `FAQPage` whenever the page renders an FAQ block. Use-case and comparison templates additionally require `SoftwareApplication` or `Product` schema with row-specific properties. Schema fields must be populated from row data, not hard-coded defaults.
- **URL structure:** Predictable, hyphen-separated, derived from row data (e.g., `/integrations/{app-a}-{app-b}/`, `/alternatives/{tool-slug}/`). No query strings on indexable pages.
- **Canonical:** Self-referencing on every indexable templated page. Pairwise comparison pages (`A vs B` and `B vs A`) must canonicalize to one direction, not both.
- **Sitemap inclusion:** Only indexable pages appear in the XML sitemap. Generated-but-`noindex` rows are excluded.
- **Internal linking:** Every templated page renders at minimum 3 contextual links to sibling pages in the same template family, plus 1 link to the template's hub page. See "Related pages" block in `references/pseo-page-anatomy.md`.
- **llms.txt:** Site root must list all indexable pSEO routes by template family with one-line descriptions (per `references/pseo-page-anatomy.md`).
- **Performance per template family:** LCP < 2.5s, CLS < 0.1, INP < 200ms across the template family at p75 (per CrUX). A failing template family blocks scale.

---

## Examples

### Good — Use-case template with anchor data + intent

```
Data source: 1,200 real customer use-case write-ups exported from our
  product analytics, each with: industry, team size, problem solved,
  workflow before, workflow after, hours saved, named tool replaced.
Template (one): pseo-use-case template, fields = [industry, team_size,
  problem, before_workflow, after_workflow, hours_saved, tool_replaced,
  customer_quote, customer_logo].
Per-page intent: "I am [industry] at [team_size] and I want to know if
  [our_product] solves [problem]." One sentence, in the brief.

Pre-scale test: published 12 rows, read all 12 as a buyer in each industry,
  fixed the template's "after workflow" rendering twice before scaling.
Scaled to 1,200; of those, 240 carry `noindex` because the `customer_quote`
  field is empty and we don't ship pages without real customer language.
Index: 960 indexable pages, all in the sitemap, all in /llms.txt.
Internal links: each page links to 3 same-industry sibling pages + the
  /use-cases/ hub page. Hub is in the primary nav.
Schema: Article + FAQPage + SoftwareApplication, with row-specific
  `applicationCategory`, `aggregateRating` from customer data, and
  `offers.price` from the pricing column.
```

### Good — Alternatives template with strategic index gating

```
Data source: our team manually wrote 60 alternative-tool comparisons over
  6 months, each with: competitor name, our positioning differentiator,
  three named feature gaps, pricing comparison, when-to-pick-each guidance.
Template: pseo-alternative template.
Per-page intent: "I am evaluating [competitor] and want to know if
  [our_product] is a fit — what's different, and when does each win?"

The team also AI-generated 400 additional rows for long-tail competitors
  with thinner data. Decision: only the 60 hand-written rows are indexed;
  the 400 generated rows render with `noindex` until a human writes at
  least three concrete differentiators per row.
Result expectation: 60 high-quality indexed pages compounding over time;
  no thin-content liability dragging the domain down.
```

### Bad — Template without a data anchor

```
Brief: "Generate 5,000 'Best [Tool] for [Use Case]' pages by combining
  our 100 tools with our 50 use cases. AI writes the body of each page."
Problems:
- No data source. AI-generated narrative is not a data anchor.
- No intent validation. Most of the 5,000 query combinations have zero
  search volume.
- No pre-scale test. Scaling 100 × 50 = 5,000 in one batch with no
  template iteration.
- Every page is indexed by default — no quality gate, no `noindex` on
  the 4,000 rows with no real differentiator.
Verdict: this is not pSEO. This is template-shaped spam. The first
  core update will flatten it.
```

### Bad — Thin-content empty-field pages

```
Generated 8,000 city-by-service pages. Sampled 20 at random and found:
- 14 pages render "Service: TBD" in the H2 because the city has no
  data in our database.
- 11 pages have a TL;DR that reads "[Service] in [City] is available
  through [Provider]." — pure template, no row content.
- 6 pages have an FAQ block with 4 identical questions across all
  sampled rows.
- 0 pages link to other city pages — the related-pages block renders
  empty.
Verdict: template is structurally fine; data is too thin to populate
  it. Either (a) enrich the data before scaling, or (b) `noindex`
  everything except the 800 rows with full data and ship those.
```

### Bad — Two-axis explosion with no intent gating

```
Brief: "Generate pages for every combination of [200 cities] × [40
  services] × [12 months] = 96,000 pages."
Problems:
- Three-axis explosion produces a long tail where 90%+ of rows have
  zero search demand.
- Intent dilutes per page — the searcher's job is unclear ("is this a
  monthly availability check? a service finder? a city guide?").
- Internal-linking graph becomes unmanageable; pages become orphans
  in a sea of templated noise.
Fix: collapse to one axis ([city × service] = 8,000), gate indexing
  on real search volume per row, drop the time dimension into the
  body content (not the URL).
```

---

## Anti-Patterns

1. **Pure template with no per-page data** — Generating thousands of pages where the only difference between rows is a swapped name. AI-paraphrased boilerplate is not data. Without a row-specific anchor, every page is a near-duplicate and the engine will collapse them.

2. **Scaling before validating the template** — Going from 0 to 10,000 pages on the day the template is built. Without a test phase of 5-25 pages reviewed end-to-end by a human, structural defects multiply by the row count and become unfixable at scale.

3. **No intent variation across templates** — Treating every templated page as if it serves the same intent. A `pseo-comparison` page ("A vs B") has different searcher intent from a `pseo-alternative` page ("alternatives to X") even when the underlying entities overlap. Templates must be intent-distinguished.

4. **Index-stuffing — every generated page indexed by default** — Pushing the entire row count into the sitemap regardless of per-page quality. The correct default is `noindex` for any row missing required fields; pages graduate to indexable only when they meet the quality threshold.

5. **AI-generated content with no anchor data** — Using an LLM to write the body of templated pages without a structured data source under it. Without anchor data, the output is plausible-looking text with no factual content per page — the worst kind of pSEO because it looks reviewable but isn't.

6. **No internal linking — orphan templated pages** — Generating pages reachable only via the XML sitemap. Without a topical graph linking related pages and a hub page indexing the family, the templated pages cannot accumulate internal equity and cannot be navigated by a real user.

7. **No-code tooling before strategy is locked** — Reaching for Airtable, Webflow, or a CMS plugin before the data × template × intent triad is settled. The pipeline is a delivery mechanism; the triad is the strategy. Tooling-first projects mistake motion for progress.

8. **Mixed axes ([thing] × [location] × [time] × [category])** — Multi-axis templates explode the row count into queries no one searches and dilute per-page intent. Successful pSEO sites pick one axis and commit; multi-axis is the signature of a project that hasn't decided what it is.

9. **Schema markup that's identical across every row** — Ships the same `author`, `datePublished`, `aggregateRating`, and `name` field on every templated page. Schema must be populated from row data, not template defaults, or it provides no incremental signal.

10. **Treating a pSEO project as a one-shot launch** — Scaling 10,000 pages, declaring victory, and walking away. pSEO compounds only when the data refreshes, the template iterates, and the index set grows as new rows earn quality. A frozen pSEO site decays.

---

## Metrics

Every metric carries a source and is reported per template family, not aggregated across the site. Aggregated pSEO metrics hide which template is winning and which is bleeding.

### Indexation health

- **Generated rows vs. indexable rows vs. indexed rows** — Source: row database + sitemap + GSC Coverage report. Confidence: high. The three numbers should converge over time but never be identical at launch. Track per template family.
- **`noindex` ratio per template** — Source: site audit + GSC. Confidence: high. A healthy pSEO project has a non-zero `noindex` rate per template — that proves the quality gate is functioning.
- **Sitemap inclusion accuracy** — Source: XML sitemap audit vs. row database. Confidence: high. Indexable rows present in sitemap; `noindex` rows absent. Per template, per release.

### Organic performance per template

- **Organic clicks per template family** — Source: GSC, grouped by URL prefix. Confidence: high. Reported per template, never aggregated to a single "pSEO total" — a winning template hides a losing one.
- **Organic impressions per template** — Source: GSC. Confidence: high. Per template, weekly.
- **Average position for the template's target query pattern** — Source: GSC URL pattern filter. Confidence: medium (averaged). 30/60/90 day windows.
- **Clicks per indexed page (yield)** — Source: GSC clicks ÷ indexed page count for the template. Confidence: high. This is the single most diagnostic pSEO metric — yield trending down means the index is bloated with thin pages and the quality gate needs to tighten.

### Conversion per intent

- **Conversion rate per template family** — Source: GA4 or product analytics with UTM-tagged pSEO CTAs. Confidence: medium. Track signups/trials/leads from each template family separately. A `pseo-comparison` template should out-convert a `pseo-blog` template; if it doesn't, the comparison intent isn't being served.
- **Time-to-conversion from pSEO landing** — Source: product analytics with session attribution. Confidence: medium. pSEO-acquired users should convert in a measurable window; if they bounce, the intent declared in the brief isn't matching the page.
- **Activation rate from pSEO-acquired users** — Source: product analytics. Confidence: high (deterministic event). Compared against other acquisition cohorts to confirm pSEO traffic isn't drive-by.

### Quality and freshness

- **Per-template Core Web Vitals pass rate** — Source: CrUX. Confidence: high. A failing template family blocks further scaling. Per template.
- **AI Overview / answer engine citation rate** — Source: AI citation tracker (Profound, Otterly, manual sampling). Confidence: low-medium. Per template; pSEO pages should be citation-ready (see `playbooks/aeo.md`).
- **Data freshness per row** — Source: row database `updated_at`. Confidence: high. Rows older than the template's freshness threshold flag for refresh; stale rows lose ranking and citation eligibility.

### Reporting discipline

- Never report pSEO health as a single number. Report per template family.
- Always pair an indexation number with a yield number — 10,000 indexed pages at 0.1 clicks each is a worse outcome than 1,000 indexed pages at 5 clicks each.
- When a template's yield is trending down, the response is to tighten the quality gate (more `noindex`), not to generate more rows.

---

## Sources

1. **Ian Nuttall — Practical Programmatic SEO (home)** — https://practicalprogrammatic.com/
2. **Ian Nuttall — No-Code Programmatic SEO course** — https://iannuttall.gumroad.com/l/no-code-programmatic-seo
3. **Practical Programmatic — Zapier case study** — https://practicalprogrammatic.com/examples/zapier
4. **Backlinko — Programmatic SEO overview (corroborating two-axis patterns)** — https://backlinko.com/programmatic-seo
5. **Single Grain — Programmatic SEO playbook (agency-level execution reference)** — https://www.singlegrain.com/blog/pseo-playbook/

Cross-link references inside this repository:

- **`references/pseo-page-anatomy.md`** — universal pSEO page structure shared across all four template types.
- **`references/pseo-templates/`** — per-template anatomy and content playbooks (`blog-`, `use-case-`, `comparison-`, `alternative-`).
- **`playbooks/seo.md`** — Aleyda Solis's 3-Layer measurement model that pSEO metrics plug into.
- **`playbooks/aeo.md`** — Mike King's Relevance Engineering for passage-level citability of templated pages.
