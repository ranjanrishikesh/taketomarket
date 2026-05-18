---
discipline: seo
asset_types: [blog-post, landing-page, pillar-page, programmatic-seo]
version: "2.0"
---

# SEO Discipline Playbook

This playbook extends the base playbook contract (`base.md`) with SEO-specific production guidance, discipline gates, and format rules. It is loaded by ttm-producer during content generation and parsed by ttm-verify for gate evaluation.

The playbook is opinionated around **Strategic SEO Frameworks** as taught by Aleyda Solis (Orainti, LearningSEO.io, SEOFOMO, Crawling Mondays). Operational page-anatomy details for programmatic pages live in `references/pseo-page-anatomy.md` and on-page conversion mechanics in `references/landing-page-anatomy.md` — this playbook governs the **strategy + measurement layer** that sits above them.

---

## Production Guidance

### Strategy before tactics — always

"Tactics without strategy is noise." Before drafting any SEO asset, the brief must answer three questions in this order:

1. **What business outcome are we serving?** Not "rank #1 for X" — what signups, revenue, or activation does this asset enable? If the answer is "more traffic", the brief is not done.
2. **What is the search intent and the user journey it sits in?** Awareness, consideration, decision, retention — and which step does this page take the visitor toward?
3. **Is the technical floor in place?** Crawlability, indexability, rendering parity. If the site cannot be crawled, fix the floor before drafting another word.

Tactical knobs (title tags, internal links, schema) only compound when wrapped in a strategy. Skip the strategy and you are polishing pages that no business cares about.

### The 3-Layer Measurement Model (Aleyda's framework)

Every SEO asset is measured on three layers, never collapsed into one score:

- **Layer 1 — Presence:** Are we showing up? Rankings, AI Overview citations, knowledge panel mentions, brand SERP coverage.
- **Layer 2 — Readiness:** Is our content/site *eligible* to be cited and ranked? Crawlable, renderable, schema-marked, entity-linked, hreflang-correct, fast.
- **Layer 3 — Business Impact:** Does the presence drive revenue? Organic-attributed signups, qualified leads, expansion revenue.

A page can be high on Presence and zero on Business Impact (vanity traffic). It can be high on Readiness and low on Presence (technically perfect, strategically invisible). Producers must declare which layer the asset is moving and why the other two layers are already in place — or queued.

### SEO maturity model — start at the floor

Engineer-founders routinely try to do off-page link building before fixing on-page structure, or attempt entity SEO before their robots.txt allows crawling. Walk the maturity ladder in order:

1. **Crawlability & indexability** — robots.txt, sitemap, internal linking, noindex hygiene.
2. **Rendering parity** — SSR/SSG for content-bearing pages. Client-rendered SPAs are second-class for SEO.
3. **On-page structure** — title, H1, meta description, heading hierarchy, schema, canonical.
4. **Topical coverage** — clusters of intent-aligned pages around a pillar topic.
5. **Authority signals** — internal linking depth, entity references, mentions, links.
6. **AI search readiness** — passage-level optimization, citability, llms.txt, structured data depth.

Do not skip levels. A pillar page on an unrenderable subdomain is worth nothing.

### Audit-driven prioritization

Every campaign starts with a 30-minute audit, not a "what should I write?" brainstorm. The audit answers:

- **Crawl errors:** any 5xx, 4xx surges, blocked critical paths?
- **Index coverage:** what pages should be indexed and are they?
- **Cannibalization:** are multiple pages targeting the same intent?
- **Render parity:** does the rendered HTML contain the same content as the source?
- **Hreflang correctness:** if international, are we leaking traffic to the wrong locale?
- **Core Web Vitals at the template level:** which template family is failing?

Output: a ranked list of fixes. **Fix beats write.** A repaired template lifts every page on it; a new blog post lifts only itself.

### Intent-modeled content

Identify whether the target query is informational, commercial, navigational, or transactional — but more importantly, identify the **shape of the SERP**: what formats currently rank, what AI Overviews quote, what entities are co-cited. Reverse-engineer the format the search engine has already decided is correct, then exceed it with substance. Mismatching format kills the asset before the first word is read.

### International-first reflex

Even for solo founders, build with locale-portability from day one: language-agnostic URLs, hreflang stubs ready, content authored in a structure that translates. Most growing startups underinvest here and bleed traffic in non-English markets where competition is thinner.

### Discoverable AND citable

In the AI-search era, the page has two jobs:

1. **Discoverable** — rank in the SERP for the query.
2. **Citable** — be quoted, summarized, or linked by AI Overviews, Perplexity, ChatGPT, and downstream LLM answer engines.

These require distinct optimization. Discoverability is keyword + intent + on-page. Citability is passage-level self-containedness + named entities + verifiable claims + structured data. See the AEO playbook (`playbooks/aeo.md`) for the citability layer; this playbook ensures the discoverability layer.

### Cross-reference the operational layers

This playbook is the strategy. For execution mechanics, defer to:

- **`references/pseo-page-anatomy.md`** — programmatic-SEO page structure, template anatomy, quality-gate-before-indexing.
- **`references/landing-page-anatomy.md`** — on-page conversion structure for landing pages.
- **`playbooks/aeo.md`** — relevance engineering and passage-level citability.
- **`playbooks/pseo.md`** — data × template × intent for programmatic pages.

When this playbook and a reference disagree on a tactical detail, the reference wins on mechanics; this playbook wins on prioritization and measurement.

---

## Discipline Gates

### DISC-SEO-01: Business-Outcome Linkage — Tier 1

**Checks:** Asset brief declares a business outcome on the 3-Layer model, not a vanity metric
**Against:** Asset brief and campaign measurement plan

#### Evaluation Criteria

1. **Outcome declared**
   - PASS: Brief names a specific Layer 3 (Business Impact) outcome — signup, trial, qualified lead, revenue path — with the journey step explicit
   - WARN: Brief names a Layer 1 (Presence) goal (rank, impressions) with a documented hand-off to a Layer 3 page
   - FAIL: Brief targets traffic, rankings, or impressions with no journey step or downstream conversion path defined

2. **Layer assignment**
   - PASS: Brief states which of the 3 Layers the asset is moving (Presence / Readiness / Business Impact) and confirms the other two are already in acceptable state
   - WARN: Layer named but no evidence the other layers are in place
   - FAIL: No layer assignment — asset treats SEO as a single undifferentiated score

### DISC-SEO-02: Technical Floor Precondition — Tier 1

**Checks:** Crawlability, rendering parity, and indexability are verified before content production
**Against:** Asset URL or template, site configuration

#### Evaluation Criteria

1. **Crawlable and indexable**
   - PASS: Target URL/template is allowed in robots.txt, has no `noindex` directive, is reachable from at least one indexed internal link, and is included in the sitemap
   - WARN: Crawlable but missing from sitemap, or reachable only via JavaScript navigation
   - FAIL: Blocked by robots.txt, marked noindex, orphan page, or behind authentication

2. **Render parity (SSR/SSG)**
   - PASS: Rendered HTML (server response) contains the same primary content, H1, and internal links as the in-browser DOM
   - WARN: Most content present in rendered HTML but secondary sections inject client-side
   - FAIL: Primary content (H1, body copy, internal links) only appears after client-side hydration

### DISC-SEO-03: Search Intent & SERP-Format Match — Tier 1

**Checks:** Content shape matches the SERP shape already preferred by the engine for the target query
**Against:** Brief's target query, declared intent, and observed top-ranking format

#### Evaluation Criteria

1. **Intent alignment**
   - PASS: First 100-150 words directly address the target query and the declared intent is consistent with the dominant intent in current top-ranking results
   - WARN: Content matches intent but buries the direct answer below introductory throat-clearing
   - FAIL: Declared intent contradicts SERP evidence (e.g., informational long-form for a query where every top result is a transactional page)

2. **Format match**
   - PASS: Content format matches the SERP-dominant format (listicle for "best X", how-to for "how to X", comparison for "X vs Y", direct landing for transactional)
   - WARN: Format partially matches but mixes intent signals (e.g., a how-to that pivots to a product pitch)
   - FAIL: Format directly contradicts the SERP-dominant format

### DISC-SEO-04: Cannibalization Check — Tier 1

**Checks:** Asset is not competing with an existing page on the same site for the same query intent
**Against:** Site's existing indexed URL inventory

#### Evaluation Criteria

1. **Unique intent slot**
   - PASS: No existing indexed page on the same site targets the same primary intent and query cluster; or if one exists, the brief documents an explicit consolidation/redirect plan
   - WARN: A weak existing page exists on overlapping intent but is sufficiently differentiated by sub-intent
   - FAIL: An existing page already targets the same intent and is ranking — producing this asset will split equity

### DISC-SEO-05: Citability & Entity Coverage — Tier 2

**Checks:** Asset is structured to be both ranked AND cited by AI answer engines
**Against:** Asset content and structured data

#### Evaluation Criteria

1. **Passage-level self-containedness**
   - PASS: Each H2/H3 section answers a distinct sub-question in a self-contained way; a single passage lifted out of context still answers the implied query
   - WARN: Most sections self-contained but 1-2 sections rely on earlier context to make sense
   - FAIL: Content flows as continuous prose where passages cannot be quoted standalone

2. **Entity & citation density**
   - PASS: At least 3 named entities (people, products, organizations, standards) referenced precisely; verifiable claims cite a source by name or URL
   - WARN: Entities present but unnamed or vague ("a leading tool", "industry experts")
   - FAIL: No named entities, no source citations on quantitative claims

3. **Structured data depth**
   - PASS: Required schema present AND entity properties (`author`, `publisher`, `mainEntity`, `sameAs` where applicable) filled with real values
   - WARN: Required schema present but entity properties missing
   - FAIL: No schema or wrong schema type for the content

### DISC-SEO-06: Confidence-Labelled Metrics — Tier 2

**Checks:** Measurement plan declares the confidence level and source of every metric tracked
**Against:** Campaign measurement plan

#### Evaluation Criteria

1. **Source named per metric**
   - PASS: Every tracked metric names its source (GSC, GA4, server logs, CrUX, AI-citation tracker) and the granularity (per-URL, per-template, per-cluster)
   - WARN: Sources named for most metrics but 1-2 metrics are unsourced
   - FAIL: Metrics listed without source attribution — "we'll track rankings and traffic" with no tool named

2. **Confidence label per metric**
   - PASS: Each metric carries a confidence label — high (server-side, deterministic), medium (sampled, scraped), low (estimated, proxy) — so single-metric dashboards never present false precision
   - WARN: Some metrics labelled, others presented without confidence framing
   - FAIL: All metrics presented as equally reliable with no uncertainty acknowledged

### DISC-SEO-07: On-Page Format Integrity — Tier 1

**Checks:** Title, H1, meta description, headings, canonical, and image metadata follow SEO format rules
**Against:** Asset metadata and content structure (see Format Rules below)

#### Evaluation Criteria

1. **Title & H1 alignment**
   - PASS: Title tag is 50-60 characters, contains the primary keyword near the front, and addresses the same topic as the single H1
   - WARN: Title 45-49 or 61-70 chars, or H1 phrasing diverges from title while keeping topic
   - FAIL: Title under 30 or over 70 chars, multiple H1s, or title and H1 target different topics

2. **Meta description**
   - PASS: 120-160 characters, action-oriented, contains the target keyword or close variant naturally
   - WARN: Present but outside 120-160 range, or uses only a distant synonym
   - FAIL: No meta description, or meta does not relate to the page topic

3. **Heading hierarchy & canonical**
   - PASS: Heading levels descend logically (H1 → H2 → H3, no skips), canonical URL specified, image alt text descriptive
   - WARN: Minor heading-level skips, canonical present but self-referencing where it should consolidate
   - FAIL: Skipped levels, missing or wrong canonical, images missing alt text

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-10 | Tier 2 (advisory) | Tier 1 (blocking) | SEO format correctness directly impacts crawling, indexing, and SERP display. A missing H1, broken title tag, or wrong canonical prevents the page from being ranked at all — making format a strategic, not advisory, concern. |

---

## Format Rules

- **Title tag:** 50-60 characters, primary keyword near the front, written for the searcher not the engine.
- **Meta description:** 120-160 characters, action-oriented, includes target keyword or close variant.
- **H1:** Exactly one per page, must address the same topic as the title tag.
- **URL structure:** Short, lowercase, hyphen-separated, includes primary keyword; no query strings for indexable content.
- **Canonical:** Specified on every indexable page; self-referencing is the default, cross-referencing only when consolidating duplicates.
- **Hreflang:** Required for any site serving more than one locale; bidirectional and self-referencing.
- **Heading hierarchy:** H1 → H2 → H3 in order, no skipped levels. Each H2 answers a sub-question of the query.
- **Image metadata:** Explicit width/height attributes required; descriptive alt text; WebP/AVIF preferred over PNG/JPEG; lazy-load below the fold.
- **Schema markup:** Article minimum for blog/pillar; FAQPage when Q&A is present; HowTo when ordered steps are present; LocalBusiness for location pages. Entity properties (`author`, `publisher`, `sameAs`) must be populated, not just declared.
- **Internal links:** 3-6 contextual links per 1000 words, descriptive anchors that name the destination topic.

---

## Examples

### Good — Strategic blog post with 3-Layer linkage

```
Brief declares:
- Business outcome: free-trial signup from "how to optimize Core Web Vitals" reader
- Journey step: awareness → consideration; CTA routes to the CWV-audit tool page
- Layer assignment: moving Layer 1 (Presence). Layer 2 (Readiness) confirmed:
  page is SSR, schema present, hreflang correct. Layer 3 (Business Impact)
  tracked via UTM-tagged CTA + GA4 conversion event.

Title (52 chars): "Optimize Core Web Vitals: A 2026 Engineer's Guide"
H1: "Optimize Core Web Vitals: A 2026 Engineer's Guide"
First 120 words: Names the three CWV metrics, who this guide is for,
  and what the reader will be able to do at the end.
Schema: HowTo with 6 steps + Article with named author and publisher.
Entities cited: Google, Chrome UX Report, web.dev, three named tools.
Internal links: 5 contextual links to related performance posts and the
  CWV-audit tool, descriptive anchors throughout.
Measurement: GSC for impressions/clicks (high confidence), GA4 for
  CTA-click-through (high), AI Overview citation tracker (medium).
```

### Good — Programmatic page with audit-driven prioritization

See `references/pseo-page-anatomy.md` for the page structure. The strategic layer:

```
Audit found: 8,400 templated pages indexed; only 1,200 have unique data;
  6,200 are thin variants ranking nowhere and cannibalizing the strong 1,200.
Decision (audit-first): noindex the 6,200 thin pages, redirect 1,000 to
  the strongest variant, keep 1,200 indexed.
Result expectation: traffic stays flat or grows on the kept pages because
  internal equity consolidates. Layer 2 (Readiness) improves; Layer 1
  (Presence) on the survivors improves as cannibalization ends.
```

### Bad — Tactic without strategy

```
Brief: "Write a blog post on 'best CRM for startups' to rank for that
  keyword."
Problems:
- No business outcome declared. Ranking is not a goal; it is a means.
- No SERP audit done. The current top results are all listicles by
  comparison sites with deep domain authority — outranking them in
  one post is implausible.
- No layer assignment. Cannot tell which of Presence/Readiness/Business
  Impact this asset moves.
- No technical-floor check. The /blog/ subdomain is client-rendered;
  Googlebot sees an empty shell.
Verdict: produce the technical-floor fix first; this post would be wasted
  on an unrenderable template.
```

### Bad — Single-score dashboard

```
Dashboard shows: "SEO Health Score: 72/100"
Problem: collapses Presence, Readiness, and Business Impact into one
  number. A site can have 90 Readiness, 60 Presence, and 0 Business
  Impact (vanity traffic) and score 72 — masking the fact that no
  revenue is being generated. Layered metrics with confidence labels
  beat composite scores.
```

---

## Anti-Patterns

1. **Tactics without strategy** — Writing posts, adding schema, building links without a business outcome and 3-Layer assignment. Tactical work compounds only inside a strategy; outside one, it produces motion without progress.

2. **Rank-tracking as the goal** — Treating rankings or impressions as the success metric. Rankings are a Layer 1 (Presence) signal; the goal is always Layer 3 (Business Impact). Optimizing for rank divorced from revenue produces vanity sites.

3. **Single-score dashboards** — Collapsing Presence, Readiness, and Business Impact into one composite score. Hides which layer is broken and creates false confidence. Always report layered metrics with confidence labels.

4. **AI search treated as a separate channel** — Building "AEO content" as if it lives in a different department from SEO. AI Overviews are a continuum of SERP, not a separate surface. Discoverability and citability optimization happen together.

5. **Skipping the technical floor** — Producing content on sites that are not crawlable, not renderable, or not indexable. No content strategy survives a broken technical foundation; fix the floor first.

6. **Keyword-density mythology** — Repeating the target keyword to hit a "density target". Keyword stuffing was deprecated by Google over 15 years ago. Entity coverage and topical depth replaced it.

7. **Link buying / black-hat shortcuts** — Purchasing links, PBN tactics, sneaky redirects. Explicit anti-recommendation: shortcuts compound risk, not equity. Earn links through cited research, named-entity authority, and genuinely linkable assets.

8. **International afterthought** — Building English-only without hreflang scaffolding. Adding international SEO later costs 10x more than building locale-aware from day one.

9. **Cannibalization through volume** — Publishing multiple pages on overlapping intent because "more pages = more SEO". Internal competition splits equity. Audit and consolidate before producing.

10. **Render-blind production** — Drafting beautifully for a JavaScript-rendered SPA that Googlebot sees as an empty `<div>`. Verify SSR/SSG parity before drafting a single page.

---

## Metrics

Track per the 3-Layer Measurement Model. Every metric carries a source and a confidence label.

### Layer 1 — Presence

- **Organic impressions and clicks** — Source: Google Search Console. Confidence: high. Weekly for first 90 days.
- **Average position for target keyword cluster** — Source: GSC. Confidence: medium (averaged, sampled). 30/60/90 day windows.
- **AI Overview / AI answer engine citations** — Source: AI-citation tracker (Profound, Otterly, manual sampling). Confidence: low-medium. Sample weekly.
- **Brand SERP coverage** — Source: manual brand SERP audit. Confidence: medium. Monthly.

### Layer 2 — Readiness

- **Indexed status** — Source: GSC Coverage report. Confidence: high. Confirm within 7 days of publication.
- **Render parity check** — Source: View-source vs. rendered DOM diff, or URL Inspection in GSC. Confidence: high. Per template, per release.
- **Core Web Vitals pass rate** — Source: PageSpeed Insights, CrUX. Confidence: high (CrUX) or medium (PSI single-run). Must maintain "Good" threshold per template family.
- **Schema validity** — Source: Schema.org validator, GSC Rich Results report. Confidence: high. Per template.
- **Crawl error volume** — Source: GSC, server logs. Confidence: high. Weekly trend.

### Layer 3 — Business Impact

- **Organic-attributed signups / trials / leads** — Source: GA4 with UTM tagging, or product analytics with referrer capture. Confidence: medium (last-click attribution carries known bias). Track per asset and per cluster.
- **Organic-attributed revenue or pipeline** — Source: CRM joined to web analytics. Confidence: medium. Monthly.
- **Activation rate from organic-acquired users** — Source: product analytics. Confidence: high (deterministic event). Compare against paid-acquired cohort.

### Reporting discipline

- Never present a Layer 1 metric without the corresponding Layer 3 read.
- Never present a composite "SEO score". Report each layer separately with its confidence label.
- When a metric source is unknown or sampled, say so. False precision beats no metric only when both layers know it is false.

---

## Sources

1. **Aleyda Solis — 3-Layer Framework for AI Search Measurement** — https://www.aleydasolis.com/en/ai-search/a-3-layer-framework-to-measure-ai-presence-readiness-and-business-impact-redefining-metrics-for-the-ai-search-era/
2. **LearningSEO.io — open-source SEO roadmap** — https://learningseo.io/
3. **Aleyda Solis — main site and newsletter (SEOFOMO, Crawling Mondays)** — https://www.aleydaseotips.com/
4. **Aleyda Solis — Orainti consultancy** — https://www.aleydasolis.com/en/
5. **Yoast podcast — Aleyda Solis on strategic SEO** — https://yoast.com/podcast/aleyda-solis/
6. **Search Engine Journal — International SEO with Aleyda Solis** — https://www.searchenginejournal.com/international-seo-considerations-with-aleyda-solis-podcast/282461/
