---
discipline: positioning
asset_types: [positioning-statement, homepage-copy, one-liner]
version: "1.0"
---

# Positioning Discipline Playbook

This playbook extends the base playbook contract (`base.md`) with positioning-specific production guidance, discipline gates, and format rules. It is loaded by ttm-producer when generating positioning artifacts (one-liners, homepage copy, positioning statements, manifestos) and parsed by ttm-verify for gate evaluation.

The framework is **Homepage-First Positioning** as taught by Anthony Pierri (FletchPMM). Pierri's thesis: positioning is not a strategy deck and it is not a workshop output -- positioning is what your homepage actually says. If the homepage is generic, the positioning is generic, no matter what the internal narrative claims. For an engineer-solopreneur audience, this framing is decisive: the artifact you can ship this week is the positioning. Everything else is internal documentation.

> Why Pierri over April Dunford: Dunford's "Obviously Awesome" is the more widely cited positioning book and is the right call for enterprise category-creation work. Pierri runs 400+ B2B startup homepage repositioning engagements and his methodology is productized, fast, and built for founders who have to ship a homepage *this week*. takeToMarket's audience is the second group.

---

## Production Guidance

### The Homepage Is the Strategy

If your positioning cannot fit on your homepage, it is not positioning -- it is an internal narrative. Treat every positioning artifact (one-liner, hero block, manifesto) as a candidate string for the homepage. If you would not put it on the homepage, do not ship it as positioning. This is the load-bearing rule that everything below extends.

An engineering analogy: positioning is the API contract, not the implementation notes. The homepage is the public interface -- the only surface a prospect actually calls. Internal slide decks are like inline comments: useful for the team, invisible to the user. Optimize the interface first; if the interface is wrong, no amount of internal documentation rescues the product.

### The 4 Questions Every B2B Startup Must Answer

Pierri's homepage diagnostic. Every positioning artifact must answer all four, in plain language, above the fold:

1. **What is it?** Name the category in words a sixth-grader understands. "AI-powered platform for X" fails this test -- it names a hype tag, not a category. "Helpdesk software", "Postgres GUI", "video transcription API" passes. Lead with the boring word.
2. **Who is it for?** Name the role, not the company size. "Heads of customer support at SaaS companies" beats "support teams" beats "teams" beats "businesses". The more specific the role, the more the right reader self-identifies and the wrong reader bounces -- both are wins.
3. **What problem does it solve?** Name a painful, recurring workflow -- not an aspirational outcome. "Triaging incoming tickets across 5 inboxes" beats "improving customer happiness". Pain is concrete; happiness is vapor.
4. **What's the alternative we beat?** Name the thing the prospect uses today and explain why you win. This includes "spreadsheets", "doing it manually", "a competitor", "an in-house script". A positioning artifact with no named alternative is reading as marketing fluff.

If any of the four are missing, the positioning is incomplete. Do not ship a positioning artifact that punts on any of the four.

### The 7-Box Homepage Canvas

Pierri's structural template. Every homepage decomposes into seven boxes, each with a job. The positioning playbook drives boxes 1, 2, 4, and 6 directly; the landing-pages playbook (Peep Laja) extends boxes 3, 5, and 7. Each box must be filled with specific content -- an empty or generic box means the page fails. The boxes:

1. **Hero headline** -- answers "what is it?" in plain category language. Not a tagline. Not a promise. A description.
2. **Hero subhead** -- answers "who is it for?" + "what problem does it solve?" in one sentence. The subhead does the work the headline cannot.
3. **Social proof bar** -- specific logos with case-study substance. "Trusted by leading teams" is empty proof and fails.
4. **Problem agitation** -- describe the current painful workflow in the prospect's own words. Mine support tickets, sales calls, and Reddit threads for the literal phrases used.
5. **Solution / how it works** -- one screenshot + three steps maximum. If "how it works" takes more than three steps to explain, the positioning is the problem, not the explanation.
6. **Differentiators / "why us"** -- contrast against the named alternative. Each differentiator must be a feature competitors lack -- not a feature competitors also have. "Easy to use" is not a differentiator. "Native Postgres LISTEN/NOTIFY support (alternatives poll)" is.
7. **CTA** -- one primary action. "Start free", "See pricing", "Book demo" -- pick one. Stacked CTAs dilute intent.

Every positioning artifact you produce should route to one of these boxes. When ttm-produce generates a homepage hero, it is generating box 1 + box 2. When it generates a manifesto, it is generating the narrative that backfills boxes 4 and 6.

### Clear Is Better Than Clever

Specificity beats cleverness, every time. A boring-but-specific tagline outperforms a clever-but-vague one. The instinct of most founders -- especially engineers who consume Apple/Stripe marketing -- is to reach for cleverness. Resist.

- Clear and specific: "Open-source error tracking for Python and JavaScript" (Sentry's early positioning).
- Clever and vague: "Software that empowers developers to build better experiences."

If the tagline could be lifted and dropped onto a competitor's homepage without anyone noticing, it is generic. The test: paste your hero headline into your two closest competitors' homepages. If it still makes sense on either of them, rewrite.

### Use-Case Positioning Beats Category Positioning

For most early-stage startups, naming a category is the wrong move. Categories are won by incumbents with marketing budgets to define them. Use cases are won by the team that owns one painful workflow end-to-end. Pierri's rule: if you are under ~$10M ARR, position on a use case, not a category.

Use-case examples (good for early-stage):
- "Send Slack alerts when your Stripe revenue drops" -- one workflow, fully specified.
- "Generate SOC2 evidence for AWS infrastructure" -- one job, fully specified.

Category examples (good only once you can afford the category fight):
- "The data observability platform."
- "The customer experience cloud."

Engineer translation: use cases are functions; categories are modules. Ship the function first. Refactor into a module once usage proves the abstraction.

### Champion-Centric Positioning

Write to the person closest to the pain who will become your internal advocate -- not the economic buyer, not the C-suite. The champion is the practitioner: the SRE, the support lead, the marketing ops manager, the indie dev. They feel the pain hourly. They will read your homepage twice and forward it to their team. The CFO will never read your homepage.

This is counterintuitive to founders who sell enterprise. The advice is the same: positioning copy speaks to the champion. Sales decks and pricing pages can speak to the buyer.

### Say Something Specific (Saying-Specific Principle)

Pierri's most-quoted rule: "Say something specific." This is the operating principle for every line of positioning copy. Concrete > abstract. Named > unnamed. Numbered > qualitative. Examples:

- Abstract: "We help teams move faster." -> Specific: "Cuts incident response time from 30 minutes to 4 minutes."
- Unnamed: "Compatible with leading databases." -> Named: "Works with Postgres 13+, MySQL 8+, and SQLite."
- Qualitative: "Trusted by industry leaders." -> Numbered: "Powers 8 of the top 20 YC W24 companies."

If the copy survives a "compared to what?" or "according to whom?" interrogation, it is specific enough. If it does not, rewrite.

### Pick a Fight

Positioning without a contrast point reads as marketing fluff. Name the alternative being beaten -- even if the alternative is "spreadsheets" or "doing it manually". Founders avoid this because it feels aggressive or because legal flinches. Do it anyway. The alternative can be:

- A direct competitor by name ("Unlike Datadog, ...").
- A category of incumbents ("Unlike legacy BI tools, ...").
- The status quo workflow ("Most teams cobble together Notion docs and Slack threads. We replace both.").
- An in-house build ("Stop maintaining your internal admin panel.").

The fight does not have to be aggressive -- it has to be named. A positioning artifact with no alternative is a positioning artifact with no edge.

### Don't Claim Category Novelty Without Substance

"The first X for Y" is a tell that the team has nothing concrete to compare against. If you cannot articulate the alternative you are beating, you have not done positioning work -- you have written a press release. Reject the urge to claim novelty when the actual edge is "we do this one workflow better than the three tools you cobble together today." The latter is a stronger position.

### Mine Customer Language

Positioning copy lives or dies by language match. Mine the words your prospects actually use in:
- Support tickets ("the dashboard takes forever to load")
- Sales calls ("we currently export to CSV and pivot in Excel")
- Reddit/HackerNews/X threads ("anyone know how to ___ without Zapier?")
- Onboarding chats and churn surveys

Then use those exact phrases verbatim in the hero subhead, problem agitation, and differentiators. Founder-invented phrases ("seamless orchestration", "unified workflow layer") never appear in the customer corpus and never resonate.

---

## Discipline Gates

### DISC-POSITIONING-01: Four Questions Answered -- Tier 1

**Checks:** All four Pierri questions (What is it / Who is it for / What problem / What alternative) are answered above the fold in plain language.
**Against:** Asset hero block or positioning statement body.

#### Evaluation Criteria

1. **Four-question completeness**
   - PASS: All four questions (category, ICP role, problem, named alternative) are answered explicitly and unambiguously in the hero block or positioning statement.
   - WARN: Three of four answered; one is implicit or buried below the fold.
   - FAIL: Two or more of the four questions are unanswered, implicit-only, or buried below the fold.

2. **Plain-language category**
   - PASS: The "what is it" answer uses a category word a non-technical reader recognizes (e.g., "helpdesk software", "Postgres GUI") -- not hype-tag language ("AI-powered platform", "intelligent layer").
   - WARN: Category named but wrapped in hype modifiers ("AI-powered helpdesk for ___").
   - FAIL: No plain category named -- only abstract descriptors ("the platform for ___", "intelligence for ___").

### DISC-POSITIONING-02: Named Alternative -- Tier 1

**Checks:** A specific alternative is named that the asset positions against.
**Against:** Asset content (hero, subhead, differentiators section, or body of positioning statement).

#### Evaluation Criteria

1. **Alternative named**
   - PASS: At least one named alternative appears -- a direct competitor by name, a named category of incumbents, the status quo workflow ("spreadsheets", "internal admin panel"), or "doing it manually".
   - WARN: An alternative is implied but never named ("Most tools today...", "Legacy solutions...").
   - FAIL: No alternative referenced anywhere -- the asset describes the product in a vacuum.

2. **Differentiator vs alternative**
   - PASS: For each named alternative, the asset states a concrete reason this product wins -- a feature, capability, or workflow the alternative does not have.
   - WARN: Alternative named but the differentiation is generic ("easier to use", "more modern").
   - FAIL: Alternative named but no differentiation stated, or differentiation is something the alternative also has.

### DISC-POSITIONING-03: ICP Role Specificity -- Tier 1

**Checks:** The "who is it for" answer names a role, not a vibe.
**Against:** Asset hero subhead, ICP statement, or "who it's for" section.

#### Evaluation Criteria

1. **Role granularity**
   - PASS: A specific role is named ("Heads of customer support at SaaS companies", "Solo Postgres admins", "Marketing ops managers at Series B+ B2B companies").
   - WARN: A function is named without role specificity ("support teams", "marketing teams") or a role is named without company-stage context.
   - FAIL: The audience is described as "teams", "businesses", "users", "customers", "everyone", or any abstract noun.

2. **Champion vs buyer**
   - PASS: The named role is a practitioner (the person closest to the pain) -- not a generic title like "CEO", "founder", or "decision-maker".
   - WARN: Both practitioner and buyer named, but buyer leads -- diluting champion focus.
   - FAIL: Only buyer titles named (e.g., "for CFOs", "for VPs of Engineering") with no practitioner identified.

### DISC-POSITIONING-04: Specificity Over Cleverness -- Tier 1

**Checks:** Concrete, named, numbered language vs abstract or clever language.
**Against:** Asset hero headline, subhead, and differentiators.

#### Evaluation Criteria

1. **Concrete claims**
   - PASS: Hero block contains at least one named tool/competitor/workflow OR at least one specific number (time saved, integrations supported, customers, etc.).
   - WARN: Hero block contains qualitative claims only ("faster", "easier", "better") but is otherwise specific in category and ICP.
   - FAIL: Hero block contains no named entity and no number -- relies entirely on abstract descriptors.

2. **Competitor-swap test**
   - PASS: The hero headline + subhead could NOT be lifted and dropped onto a known competitor's homepage without the swap being obvious.
   - WARN: Headline is generic but subhead is specific enough to fail the swap test.
   - FAIL: The entire hero block could be lifted to two or more competitor sites without anyone noticing the swap.

### DISC-POSITIONING-05: Use-Case or Category Discipline -- Tier 2

**Checks:** Positioning is anchored on either a specific use case or a defensible category claim -- not floating between them.
**Against:** Asset hero block and brief context (company stage, ARR, funding).

#### Evaluation Criteria

1. **Anchor choice**
   - PASS: The asset commits to use-case positioning (one painful workflow named end-to-end) OR commits to category positioning (with explicit definition of the category and named incumbents).
   - WARN: The asset hedges between use-case and category framing without committing to either.
   - FAIL: The asset claims category leadership without defining the category, OR lists multiple disjoint use cases without anchoring on one.

2. **Stage-appropriate anchor**
   - PASS: For early-stage (under ~$10M ARR or pre-Series-B context in the brief), the anchor is use-case. For later-stage, category claims are allowed if substantiated.
   - WARN: Late-stage asset uses use-case positioning where category framing is now defensible (advisory, not blocking).
   - FAIL: Early-stage asset claims to be "the category leader" or "the platform for ___" without substantiated category definition.

### DISC-POSITIONING-06: Customer Language Match -- Tier 2

**Checks:** Hero subhead and problem agitation use language that matches how prospects actually describe the problem.
**Against:** Customer language artifacts in the brief (interview quotes, support tickets, sales-call notes) if available; otherwise heuristic check against founder-jargon patterns.

#### Evaluation Criteria

1. **Verbatim phrase usage**
   - PASS: At least one phrase from the customer-language corpus appears verbatim or near-verbatim in the hero subhead or problem agitation.
   - WARN: Customer-language corpus exists but no verbatim phrase is used -- copy paraphrases instead.
   - FAIL: No customer-language corpus referenced AND copy contains founder-jargon flag phrases ("seamless", "unified", "next-generation", "intelligent", "orchestrate", "synergy", "empower").

2. **Jargon flag count**
   - PASS: Zero or one founder-jargon flag phrase in the hero block.
   - WARN: Two founder-jargon flag phrases in the hero block.
   - FAIL: Three or more founder-jargon flag phrases in the hero block.

---

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-01 | Tier 1 (blocking) | Tier 1 (blocking) | Positioning IS the positioning invariant -- this gate carries existential weight here. Override is identity, not tier change. |
| GATE-10 | Tier 2 (advisory) | Tier 1 (blocking) | Format errors in positioning (missing hero block, malformed headline/subhead pairing, no CTA box) prevent the artifact from functioning as homepage copy at all. |

---

## Format Rules

- **One-liner / tagline:** Maximum 12 words. Must contain category word (what it is). No hype modifiers ("AI-powered", "next-generation", "intelligent") in the one-liner.
- **Hero headline:** Maximum 12 words. Plain-language category required. Answers "what is it?" -- not a promise, not a tagline.
- **Hero subhead:** Maximum 25 words. Answers "who is it for?" + "what problem does it solve?" in one sentence. Must name a role and a workflow.
- **Problem agitation paragraph:** 40-80 words. Must use at least one verbatim phrase from the customer-language corpus when available.
- **Differentiators:** 3-5 bullet points. Each must reference (explicitly or implicitly) the named alternative. Each must be a feature the alternative lacks, not a feature both have.
- **Positioning statement (long-form):** 60-200 words. Must answer all 4 Pierri questions and name at least one alternative. Structured as: category sentence + ICP sentence + problem sentence + alternative-contrast sentence + outcome sentence.
- **Manifesto:** 200-600 words. Must lead with the named alternative being beaten (the "fight") in the first paragraph. Backstory, values, and vision follow.
- **CTA:** Exactly one primary CTA in any positioning artifact that includes a CTA box. Stacked CTAs ("Start free OR Book a demo") fail this rule.
- **Banned phrases (auto-flag):** "seamless", "unified platform", "next-generation", "intelligent", "AI-powered" (as the lead category descriptor), "orchestrate", "synergy", "empower", "leading", "world-class", "best-in-class", "industry-leading", "the platform for ___" (without category specification), "the first X for Y" (without proof).

---

## Examples

### Good: Use-Case-Anchored Hero (early-stage)

```
Headline: Send Slack alerts when your Stripe revenue drops
Subhead: For solo founders running paid products on Stripe -- catch
  churn-driven revenue dips in minutes, not at end-of-month reconciliation.
Alternative named: "Most founders find out from their accountant 30 days later."
Differentiators: Webhook-native (no polling). Sub-60-second latency.
  Free for under $10K MRR.
CTA: Start free
```

Why it passes: Category implicit-but-clear (Stripe monitoring tool). ICP named (solo founders running paid products on Stripe). Problem named (end-of-month surprise). Alternative named (the accountant / status quo). Differentiators contrast against the alternative.

### Good: Category-Anchored Positioning Statement (later-stage)

```
Sentry is open-source application monitoring software for software
engineering teams. Unlike legacy APM tools (Datadog, New Relic) built
for ops teams to monitor infrastructure, Sentry is built for the
engineers who write the code -- exposing the exact line, commit, and
deploy that caused each error. 4 million developers at 100,000+
organizations ship faster because Sentry tells them what broke and who
broke it within seconds of deploy.
```

Why it passes: Category named ("open-source application monitoring software"). ICP named ("software engineering teams" -- then refined to "engineers who write the code"). Alternatives named (Datadog, New Relic). Differentiator stated (built for engineers, not ops). Specificity present (line/commit/deploy; 4M devs, 100K orgs).

### Bad: Generic "Leading Platform" Hero

```
Headline: The AI-powered platform for modern teams.
Subhead: Empower your organization with seamless workflows and
  next-generation intelligence.
CTA: Get started | Book a demo | Learn more
```

Why it fails: No category named (DISC-POSITIONING-01 FAIL). No ICP role (DISC-POSITIONING-03 FAIL -- "modern teams" is a vibe). No alternative (DISC-POSITIONING-02 FAIL). Banned phrases stacked: "AI-powered", "seamless", "next-generation". Three stacked CTAs (format rule violation). The competitor-swap test fails immediately -- this could be on any of 10,000 SaaS homepages.

### Bad: Clever-But-Vague Tagline

```
One-liner: "Where work happens."
```

Why it fails: Clever, memorable, completely uninterpretable. Could belong to Slack, Notion, Asana, Monday, Linear, ClickUp, Coda, Airtable, or your toaster's firmware update screen. Fails DISC-POSITIONING-01 (no category), DISC-POSITIONING-03 (no ICP), DISC-POSITIONING-04 (zero specificity).

---

## Anti-Patterns

1. **Category vagueness via hype modifier.** Hiding the actual category behind "AI-powered ___", "intelligent ___", "next-generation ___". The hype tag is doing the work the category word should do. Drop the modifier and see if the sentence still makes sense -- if it doesn't, the category was never named.

2. **ICP as vibe.** Writing for "teams", "businesses", "modern companies", or "everyone who cares about ___". Pierri's rule: if you cannot name the role and the company stage in five words, the ICP is wrong. The right ICP makes 90% of readers bounce immediately -- and that is the point.

3. **"We help X do Y" with no how.** "We help support teams resolve tickets faster" is a sentence that survives no scrutiny. Replace with the specific mechanism: "We auto-route tickets to the right agent based on past resolution history." Specificity > formula.

4. **First-X-for-Y without proof.** "The first AI-native CRM for ___" is a flag for clichéd novelty-claiming. If the actual edge is "we do this one workflow better than the three tools you cobble together today", say that instead -- it's a stronger position.

5. **Founder writing for the founder.** Copy that uses internal product vocabulary ("our orchestration layer", "the unified data plane") because that's how the team talks. The champion buyer does not use those words. Mine the customer corpus, not the internal Slack.

6. **Strategy decks that don't survive the homepage.** A 47-slide positioning deck that says one thing while the homepage says another. The homepage wins -- always. If the deck disagrees with the homepage, the deck is wrong. Rewrite the deck.

7. **Generic social proof.** "Trusted by leading teams" with no logos, no quotes, no customer names. Replace with specific logos AND a one-sentence outcome quote per logo when possible.

8. **No named alternative.** Positioning the product in a vacuum, as if nothing else exists. Even if the alternative is "spreadsheets" or "doing it manually" or "an internal Python script someone wrote in 2019", name it. The fight defines the edge.

9. **Stacked CTAs.** "Start free OR Book a demo OR Read docs OR Watch the keynote" -- the reader picks none. One primary CTA per page, per artifact. The rest go in the nav.

10. **Differentiator that's actually table stakes.** Listing "easy to use" or "modern UI" or "fast" as a differentiator when every competitor also claims those. A real differentiator is a feature competitors verifiably lack -- check before you ship.

---

## Metrics

Track these post-ship to verify the positioning artifact is doing its job:

- **5-second test pass rate** -- Show the homepage to 5+ target-ICP testers for 5 seconds each. Ask: "What is this? Who is it for? What problem does it solve?" Target: 4 of 5 correctly identify all three. Measure via UserTesting, Wynter, or in-network DM.
- **Homepage clarity score (Wynter or equivalent)** -- 1-5 Likert per Pierri's 4 questions, scored by 20+ target-ICP respondents. Target: average ≥ 4.0 per question.
- **Brand search lift** -- Google Search Console queries that include your brand name, measured 30 / 60 / 90 days after positioning ship. Rising brand search = positioning is sticky and shareable. Target: +20% in 90 days for early-stage products.
- **Inbound demo/signup conversion rate from organic homepage traffic** -- The down-funnel proof that the positioning attracts the right reader and converts them. Compare 30-day cohort pre-ship vs post-ship.
- **Sales-call qualification rate** -- Percentage of inbound demos that match the named ICP role. Rising rate = positioning is filtering correctly. Falling rate = positioning is attracting the wrong audience.
- **"What do you do?" elevator-test response** -- Ask 5 customers to describe what you do in one sentence, unprompted. Compare to your positioning statement. Match = positioning has propagated. Drift = positioning has not landed.
- **Time-to-first-meaningful-paint on homepage clarity** -- Heatmap and scroll-depth data on the hero block. If users scroll past the hero in under 3 seconds without engaging, the headline-subhead pair is failing the 4-question test.

---

## Sources

- [Anthony Pierri / FletchPMM -- agency homepage](https://www.fletchpmm.com/) -- The canonical home of Homepage-First Positioning and the 7-box canvas.
- [Leah Tharin podcast with Anthony Pierri -- "Positioning your product"](https://www.leahtharin.com/p/54-anthony-pierri-positioning-your) -- Long-form interview covering the 4 questions, champion-centric positioning, and the use-case vs category decision.
- [Exit Five -- "B2B positioning: a guide to saying specific"](https://www.exitfive.com/articles/b2b-positioning-guide-to-saying-specific) -- The "saying-specific" principle in Pierri's own words.
- [Userpilot / Medium -- "How to rewrite your homepage with sharper positioning"](https://userpilot.medium.com/how-to-rewrite-your-homepage-with-sharper-positioning-messaging-by-anthony-pierri-78d65eac5ff9) -- The 7-box canvas walkthrough.
- [The B2B Playbook podcast Ep.192 -- "Why most B2B positioning fails"](https://podscan.fm/podcasts/the-b2b-playbook/episodes/192-why-most-b2b-positioning-fails-and-how-to-fix-yours-anthony-pierri) -- The 4 questions in interview form.
