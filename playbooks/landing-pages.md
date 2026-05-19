---
discipline: landing-pages
asset_types: [homepage, feature-page, use-case-page, comparison-page]
version: "1.0"
---

# Landing Pages Playbook

This playbook extends the base playbook contract (`base.md`) with landing-page-specific production guidance, discipline gates, and format rules. It treats messaging as a hierarchy — Clarity, then Relevance, then Value, then Differentiation — and refuses to optimize a layer until the layer above it works. Operational page structure (section order, schema, CTAs) lives in `references/landing-page-anatomy.md`; this playbook is about what every page must *say*, in what order, before any of that matters.

> Buttons and colors do not move conversion. Messaging and the order of messaging do. If the headline fails, every downstream tweak is rounding error.

---

## Production Guidance

### The Four-Layer Messaging Hierarchy

Every landing page is a state machine running through four questions a visitor asks in order. Skip a layer and the next layer cannot land.

1. **Clarity — "Do I know what this is?"** Lead with the category in plain language a 12-year-old understands. Not "AI-native workflow orchestration"; "scheduling software for dental offices." The category name is the floor — until the visitor can label what they are looking at, no amount of value copy registers. If a 5-second test (show the page for 5 seconds, then hide it; ask the viewer to describe what the product does) fails, the page fails. Nothing else matters yet.
2. **Relevance — "Is this for me?"** Once they know what it is, they ask if it applies to them. Name the ICP role, the use case, and the pain in the visitor's own vocabulary. "For Series A SaaS founders running outbound email" beats "for businesses of all sizes." Relevance is mined from audience research — Wynter-style message tests, customer-interview transcripts, sales-call recordings — not invented at the whiteboard.
3. **Value — "Do I want it?"** Now, and only now, tease the promised land. State outcomes, not features. "Close your books in 2 days instead of 10" beats "automated reconciliation engine." Paint the after-state in the visitor's life. Features are evidence for the outcome, not substitutes for it.
4. **Differentiation — "Why this versus alternatives?"** Last layer. Until clarity, relevance, and value land, comparison copy is wasted. The alternative being beaten must be named — a competitor, "spreadsheets," "doing it manually," "the way your team does it today." A differentiator without a named alternative is a brag, not a contrast.

The hierarchy is strict. A page that nails differentiation but fails clarity is a worse-performing page than one that nails clarity and ignores differentiation. Fix from the top down, always.

### Audience Research Comes First

You cannot write the four layers from inside your own head. The vocabulary in every layer must come from the audience itself. Before drafting hero copy, do at least one of:

- **5-second test** — show the current page (or a draft) for 5 seconds to 5+ ICP-matching viewers; ask "what does this product do, and who is it for?" If fewer than 4 out of 5 answer correctly, the Clarity layer has failed.
- **Likert-scale message test** — score each of the four layers on a 1–5 scale with target audience members (Wynter, customer panels, or your own waitlist). Fix the lowest-scoring layer first; do not move on until that layer scores 4+.
- **Customer-language mining** — pull verbatim phrases from sales-call transcripts, support tickets, onboarding chats, and review sites. The hero subhead and the relevance line should reuse those phrases nearly verbatim. If the copy sounds like marketing, it is your vocabulary, not theirs.

Message-market fit precedes product-market fit in marketing. If the message does not resonate, no amount of traffic helps.

### Specificity Over Cleverness

Clever-but-vague always loses to boring-but-specific. "Welcome to the future of work" tests worse than "Payroll software for restaurants with 5–50 employees." A page sounds smart when the writer is performing for peers; a page converts when the writer is answering the visitor's questions in the order the visitor asks them.

Concrete tells of clever-over-clear:
- Headlines that could belong to any product in the category (swap your logo for a competitor's and the page still reads — that is a failure).
- Metaphors and wordplay in the H1 ("Unleash your inner ___").
- Category language invented by the company ("the [adjective] [adjective] platform").
- "AI-powered" or "next-generation" used as a substitute for what the thing actually does.

### Above-the-Fold Must Carry All Four Layers

The hero is not "the headline." The hero is the answer to all four questions before the visitor scrolls. A complete hero contains:

- **H1** — Clarity + Value. Names the category and states the outcome.
- **Subhead** — Relevance. Names the ICP role, use case, or pain.
- **Primary CTA** — action verb that fits the value layer.
- **Differentiator line or visual proof** — names the alternative and the contrast, often in the subhead's second clause or as a strapline above the H1.
- **Social proof** — logo strip, customer count, or named-customer quote — corroborates that the four layers above are not a claim but a delivered reality.

If any layer is missing above the fold, the page fails the hierarchy regardless of what comes below.

### Page-Type Specifics

- **Homepage** — must complete all four layers above the fold; downstream sections add evidence and depth but cannot rescue a broken hero.
- **Feature page** — clarity layer is anchored on the *feature's job*, not the company's category. Relevance narrows to the workflow the feature solves. Differentiation contrasts the feature against the closest in-category alternative, not the whole product.
- **Use-case page** — relevance and value layers carry disproportionate weight. The headline names the use case explicitly ("Onboarding email automation for SaaS trials"). Differentiation is against the way teams currently solve the use case, often a workaround, not a competitor.
- **Comparison page** — differentiation is the entire page, but it only earns the right to exist after clarity and value are established elsewhere. A comparison page in isolation, without a hero that establishes what you are, is a brag-list.

### Test the Messaging, Not the Buttons

A/B tests on button color, CTA copy permutations, hero image swaps, and font choices produce rounding-error lifts. Real lift comes from testing the hierarchy itself — different H1 framings, different ICP callouts, different value statements, different named alternatives. Test the layer that is currently scoring lowest in audience research; ignore the rest.

### The Pricing Page Is a Landing Page Too

In B2B SaaS, the pricing page is the highest-leverage CRO target — more visitors arrive ready-to-buy than on any other page — and most companies sabotage it by hiding numbers behind "contact sales." Show pricing wherever it is structurally possible. The Four-Layer Hierarchy applies: visitors arriving on a pricing page have already passed Clarity and Relevance; they are evaluating Value and Differentiation. Optimize that page for those two layers, not for a category-explainer rehash.

---

## Discipline Gates

### DISC-LANDING-PAGES-01: 5-Second Clarity Test -- Tier 1

**Checks:** Visitor can name the product category and core function from above-the-fold content alone
**Against:** Hero H1 + subhead + any above-the-fold visual

#### Evaluation Criteria

1. **Category nameability**
   - PASS: Reading only the H1 and subhead, a fresh reader could name the product category in plain language within 5 seconds (e.g., "scheduling software for dentists", "B2B payroll tool", "developer-focused logging service")
   - WARN: The category is implied but requires reading a downstream section or interpreting a metaphor to identify
   - FAIL: The hero uses category-novelty language ("AI-native ___ platform", "the future of ___", "next-generation ___") without a plain-language category anchor; a fresh reader cannot say what the product is

2. **Plain-language floor**
   - PASS: H1 contains zero invented category terms; vocabulary is drawn from how the ICP already describes the problem
   - WARN: H1 mixes a plain-language clue with one piece of invented or aspirational language
   - FAIL: H1 is built around invented category terms, abstract metaphors, or undefined adjective stacks

### DISC-LANDING-PAGES-02: Relevance Signal in Hero -- Tier 1

**Checks:** The ICP role, use case, or pain is named above the fold so a visitor can self-identify
**Against:** Hero H1, subhead, and any eyebrow/strapline element

#### Evaluation Criteria

1. **ICP / use-case naming**
   - PASS: Above-the-fold copy explicitly names the ICP role ("for revenue ops leaders"), the use case ("for outbound email"), or the pain ("when your reports break every Monday") in the visitor's own vocabulary
   - WARN: A relevance signal is present but generic ("for modern teams", "for growing businesses"); a visitor cannot tell whether they are the target
   - FAIL: No relevance signal above the fold — the page reads as if written for "everyone" or "businesses"

2. **Audience-vocabulary check**
   - PASS: At least one phrase in the hero is verifiably pulled from customer interviews, sales calls, support tickets, or audience message tests
   - WARN: The relevance phrasing is plausible but the writer cannot point to a source for it
   - FAIL: The relevance phrasing is marketing-internal vocabulary the audience would not use about themselves

### DISC-LANDING-PAGES-03: Value Stated as Outcome -- Tier 1

**Checks:** The benefit is expressed as an after-state outcome, not a feature list
**Against:** Hero H1 + subhead

#### Evaluation Criteria

1. **Outcome vs feature framing**
   - PASS: The value claim is an outcome a visitor can picture happening to them ("close books in 2 days", "ship landing pages in an afternoon", "stop losing leads to slow follow-up")
   - WARN: The value claim is a capability that strongly implies an outcome but does not state it ("automated reconciliation", "AI-generated pages")
   - FAIL: The hero lists features, technology categories, or product attributes with no outcome stated

2. **Specificity of outcome**
   - PASS: The outcome contains a number, a named time horizon, a named workflow, or a contrast against a current state
   - WARN: The outcome is real but vague ("faster", "easier", "better"); no quantification or contrast
   - FAIL: The outcome is empty ("transform your workflow", "unlock your potential", "do more with less")

### DISC-LANDING-PAGES-04: Differentiation With a Named Alternative -- Tier 1

**Checks:** Differentiation copy names what is being beaten — a competitor, a workaround, or the status quo
**Against:** Hero subhead, eyebrow, or differentiator strapline; comparison section if present

#### Evaluation Criteria

1. **Named alternative present**
   - PASS: The page names the alternative explicitly — a competitor by name, a category of workaround ("spreadsheets", "manual reconciliation", "stitching together 5 tools"), or the visitor's current process
   - WARN: Differentiation is implied via contrast language ("unlike legacy tools", "the only ___ that ___") without naming what "legacy" or "the rest" actually are
   - FAIL: The page asserts uniqueness ("first", "only", "leading") with no named alternative and no contrast point

2. **Differentiation respects the hierarchy**
   - PASS: Differentiation copy appears only after clarity, relevance, and value land; visitors do not encounter "why us" claims before they know what the thing is
   - WARN: Differentiation is mixed into the H1 in a way that crowds out clarity (e.g., the H1 is "The only ___ that ___" with no plain category name)
   - FAIL: The hero leads with differentiation while clarity is still unresolved (category unnamed or ICP unnamed)

### DISC-LANDING-PAGES-05: Above-the-Fold Carries All Four Layers -- Tier 1

**Checks:** Hero answers Clarity, Relevance, Value, and Differentiation before scroll
**Against:** Above-the-fold content (H1 + subhead + CTA + strapline + visible social proof)

#### Evaluation Criteria

1. **Layer coverage**
   - PASS: All four layers are addressed in above-the-fold copy — each layer answerable by pointing to a specific phrase or element
   - WARN: Three of four layers are present; one layer is implied but not stated
   - FAIL: Two or more layers are missing above the fold

2. **Layer order on the page**
   - PASS: Layers are arranged so a top-to-bottom read flows Clarity → Relevance → Value → Differentiation (or interleaves them within a single line in a way that preserves that resolution order)
   - WARN: All layers present but the visual hierarchy buries Clarity beneath Differentiation or Value
   - FAIL: The first thing the eye lands on is Differentiation or aspirational copy, with Clarity buried below the fold

### DISC-LANDING-PAGES-06: Audience Research Provenance -- Tier 2

**Checks:** Hero copy is traceable to audience research, not authored from the writer's head
**Against:** Asset metadata / campaign notes for research sources

#### Evaluation Criteria

1. **Research source named**
   - PASS: The asset metadata references at least one audience research artifact (customer-interview transcript, sales-call recording, support-ticket sample, 5-second test result, Likert-scale message test, or review-site mining doc) used to inform the hero
   - WARN: General "we talked to customers" attribution without a specific artifact
   - FAIL: No audience research is referenced; copy is internal-vocabulary throughout

2. **Layer-level scoring (if available)**
   - PASS: Each of the four layers has a stated score or qualitative read from audience testing, and the lowest-scoring layer has been revised in this draft
   - WARN: Layer scores exist but the lowest layer has not been addressed
   - FAIL: No layer-level read on the page; the hierarchy has not been audience-tested at all

---

## Base Gate Overrides

None -- all base gates keep default tiers.

---

## Format Rules

- **H1 length:** 9 words or fewer. Longer H1s blur Clarity. If the H1 needs more than 9 words to land, split into an eyebrow/strapline + a shorter H1.
- **Subhead length:** 25 words or fewer. The subhead carries Relevance and (often) Value; longer than 25 words means the hierarchy is being explained instead of stated.
- **Primary CTA copy:** 4 words or fewer. Action verb first ("Start free trial", "Get a demo", "See pricing"). No "Click here" or "Submit." No marketing-speak ("Begin your journey").
- **Above-the-fold word count:** 150 words or fewer total across H1, subhead, CTA, eyebrow, strapline, and any visible body copy. More than 150 words means the page is explaining itself instead of orienting the visitor.
- **One H1 per page:** Multiple H1s confuse semantic hierarchy and dilute the Clarity layer.
- **Category named in plain language:** The product's category must appear, in plain language, somewhere in the H1 or subhead. No invented category names without a plain-language anchor.
- **Named alternative for differentiation:** Any "unlike", "instead of", "vs.", or "the only" phrasing must be paired with a specific named alternative in the same sentence or adjacent line.
- **Social proof visible above the fold:** Logo strip, customer count, named-customer quote, funded-by line, or specific number (e.g., "Used by 4,300 sales teams").

Operational page structure (section order beyond the hero, CTAs, schema markup, page-speed targets) is delegated to `references/landing-page-anatomy.md`.

---

## Examples

### Good: Hero That Lands All Four Layers

```
Eyebrow:  For B2B sales teams running outbound on LinkedIn
H1:       Stop losing 40% of replies to slow follow-up
Subhead:  Auto-drafts personalized replies in your voice within 30 seconds of a
          prospect responding — instead of waiting for your SDR to get to it next morning.
CTA:      Start free trial
Proof:    Used by 1,200 outbound teams · Trusted by Ramp, Notion, Linear
```

Why it lands:
- **Clarity** — "auto-drafts personalized replies" names the category in plain language.
- **Relevance** — "B2B sales teams running outbound on LinkedIn" names the ICP and use case.
- **Value** — "Stop losing 40% of replies" is an outcome with a number and a current-state contrast.
- **Differentiation** — "within 30 seconds … instead of waiting for your SDR to get to it next morning" names the alternative (the human workflow) and the contrast.

### Good: Use-Case Page Hero

```
H1:       Onboarding emails that adapt to what trial users actually do
Subhead:  Behavior-triggered drip sequences for B2B SaaS trials — replacing the
          generic Day 1 / Day 3 / Day 7 calendar drip that ignores user intent.
CTA:      See it work
```

Why it lands: category (behavior-triggered drip), ICP (B2B SaaS trials), outcome (emails that adapt to what users do), named alternative (calendar drip).

### Bad: "Welcome to Our Platform"

```
H1:       Welcome to FlowCraft
Subhead:  The AI-powered platform built for modern teams who want to do more with less.
CTA:      Get Started
```

Why it fails the hierarchy:
- **Clarity** — "FlowCraft" is a brand name, not a category. "AI-powered platform" is invented language. A 5-second viewer cannot say what the product does. **Fails DISC-LANDING-PAGES-01.**
- **Relevance** — "modern teams" identifies no one. Every visitor opts out by default. **Fails DISC-LANDING-PAGES-02.**
- **Value** — "do more with less" is the canonical empty outcome. **Fails DISC-LANDING-PAGES-03.**
- **Differentiation** — none. No alternative named. **Fails DISC-LANDING-PAGES-04.**

### Bad: Differentiation-First Hero

```
H1:       The only platform you'll ever need.
Subhead:  Built different. Powered by AI. Trusted by leaders.
```

Why it fails: differentiation claims with no named alternative ("only", "different"), invented category language, no ICP, no outcome. Differentiation arrives before clarity exists, which inverts the hierarchy. **Fails DISC-LANDING-PAGES-04 and DISC-LANDING-PAGES-05.**

### Category-tagged H1 examples (clear vs clever)

For 20 trap-categorized headline pairs (SaaS buzzword / FinTech sophistication / DevTools jargon / UX engineering-speak) with gate-ID annotations and "why bad / why good" commentary, see the companion reference: `references/landing-page-headline-examples.md`. Used by `ttm-producer` for hero calibration and by `ttm-verify` for FAIL annotations on DISC-LANDING-PAGES-01 and DISC-POSITIONING-04.

---

## Anti-Patterns

1. **Clever-over-clear headlines.** Wordplay, metaphors, and aspirational language in the H1 ("Unleash your potential", "Welcome to the future of ___"). Clever costs Clarity, and Clarity is the floor.

2. **Invented category language without a plain-language anchor.** "The AI-native workflow orchestration platform" with no follow-up sentence saying what it actually does. If your category is not yet a category your ICP would Google, you have not earned the right to lead with it.

3. **No named alternative.** "Unlike legacy tools" with no named legacy tool. "The only ___" with no contrast point. Differentiation without a named opponent reads as a brag and tests as filler.

4. **Hero is just a feature list.** Bullet points of capabilities under the H1 instead of an outcome. Features belong as evidence below the fold, after Value has been stated.

5. **Differentiation before Clarity.** Pages that lead with "the only" or "vs." comparisons before the visitor knows what the product is. The hierarchy is strict — Differentiation is the fourth layer, not the first.

6. **"For everyone."** Hero copy that does not name an ICP role, use case, or pain. The visitor's first job is to opt in or opt out; a hero that takes no stand makes every visitor opt out by default.

7. **A/B testing buttons while the headline fails.** Color, copy permutations, and CTA microtweaks produce rounding-error lifts. If the hero fails on Clarity or Relevance, no button test matters.

8. **Hidden pricing on a B2C / SMB / PLG product.** "Contact sales" gating on a product where the buyer expects to self-serve is a hierarchy violation at the page level — visitors cannot evaluate Value or Differentiation without numbers, and bounce.

9. **Writing copy from inside the company.** Authoring the hero from the founder's vocabulary instead of the customer's. Always traceable: the page sounds smart and tests flat.

10. **Stuffing all four layers into a single sentence.** The hierarchy is meant to be stated, not crammed. Six-clause H1s that try to do Clarity + Relevance + Value + Differentiation in one breath read as a wall and test worse than a clean H1 + subhead split.

---

## Metrics

Track these indicators for every landing page after shipping. Layer-level scores are the leading indicator; the engagement metrics below are the lagging confirmation.

- **5-second test pass rate** — Show the page for 5 seconds to 5+ ICP-matching viewers, hide it, ask "what does this do and who is it for?" Target: 4 of 5 correct. This is the Clarity layer's direct measurement.
- **Layer-level Likert scores (Wynter-style)** — Score each of the four layers on a 1–5 scale with target audience members. Target: 4+ on all four. Re-test after every hero revision; fix the lowest-scoring layer first.
- **Bounce rate (hero-driven)** — Visitors who land and leave without scrolling. High bounce on cold traffic to a landing page is almost always a Clarity or Relevance failure, not a "the page is too long" problem.
- **Scroll depth** — Median scroll percent and the fall-off curve. A cliff between hero and second section indicates the hero failed to set up the rest of the page. A cliff at the comparison section indicates Differentiation copy is not earning trust.
- **Hero-to-CTA click-through rate** — Visitors who click the primary CTA without scrolling past the hero. The cleanest measure of whether the hero alone is doing its job.
- **CTA conversion rate per traffic source** — Segment conversion by source (paid, organic, email, social). Wide variance signals message-source mismatch — the hero may land for one audience and miss another, which is a Relevance failure.
- **Page-level message-market fit (40% rule analog)** — Of visitors who reach the CTA, what percent say they "would be very disappointed" if the product disappeared. Borrowed from PMF; applied per landing-page audience segment.

---

## Sources

- [Wynter — The Messaging Hierarchy](https://wynter.com/post/messaging-hierarchy) — The four-layer model (Clarity → Relevance → Value → Differentiation) in its canonical form, with Likert-scale measurement methodology.
- [Sequel.io — Peep Laja CMO Series](https://sequel.io/cmo-series/peep-laja/) — Interview covering message-market fit, why testing messaging beats testing design, and the pricing page as the highest-leverage CRO target.
- [Peep Laja — "Messaging is like onions" (LinkedIn)](https://me.linkedin.com/posts/peeplaja_messaging-is-like-onions-it-has-layers-activity-6995731316755320832-d_Lz) — The hierarchy framed as layered onions; clarity is the outermost and unskippable.
- [Wynter](https://wynter.com/) — B2B message-testing platform Laja founded; methodology and audience-panel testing patterns referenced in DISC-LANDING-PAGES-06.
- [CXL Institute](https://cxl.com/) — Conversion training program Laja founded; broader CRO research grounding for "test the messaging, not the design."

For operational page structure (section order beyond the hero, schema markup, CTAs, page-speed targets, AEO/SEO signals), see `references/landing-page-anatomy.md`. That reference is the *what goes where* companion to this playbook's *what must be said in what order*.
