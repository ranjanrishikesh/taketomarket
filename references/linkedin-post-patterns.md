# LinkedIn Post Patterns — Reference

**Purpose:** Research-based catalog of LinkedIn writing patterns that engage and convert. Sourced from public creator playbooks (Justin Welsh, Sahil Bloom, Cole Schafer) and recent (2025-2026) engagement studies. Consumed by `/ttm-linkedin-post`.

**Stantly note:** The original P5 plan referenced "Stantly" as a LinkedIn ghostwriting / content-automation source. As of 2026-05-18, Stantly is unfindable: `stantly.com` does not resolve, `linkedin.com/company/stantly` returns 404, and no search results match a LinkedIn-focused product or agency by that name. The closest match is **Stan / Stanley** (an AI "Head of Content" for LinkedIn launched by the creator platform Stan in late 2025) — different product. This reference therefore substitutes the Stantly section with documented patterns from creators whose frameworks are public and verifiable. If Stantly resurfaces under a new name and shifts the consensus, regenerate this file via `/ttm-linkedin-post --rebuild-base`.

## Why first-line hooks decide everything

LinkedIn's mobile feed shows only the first **210-235 characters** before the "see more" truncation. Roughly **60-70% of potential readers churn at that decision point**, so the opening line carries more weight than the rest of the post combined (Justin Welsh: *"The first line is more important than 95% of the rest of the post."*). Every hook pattern below is engineered to clear the "see more" click.

## Hook patterns (first line)

1. **Confession** — "I made $0 from LinkedIn for 2 years. Here's what changed."
   - Why it works: vulnerability + specific number primes curiosity.

2. **Counter-conventional** — "Stop posting daily. Here's what actually works."
   - Why it works: relatable-enemy framing (Welsh): attack the default belief the reader is half-suspecting is wrong.

3. **Specific number** — "$47K in 60 days from one LinkedIn post. The breakdown:"
   - Why it works: numbers survive the skim. Vague claims do not.

4. **Open loop** — "Most founders get this wrong about pricing."
   - Why it works: triggers the Zeigarnik effect (unresolved tension). Must be paid off in the body — open loops left dangling burn trust.

5. **Question** — "Why do 90% of B2B startups fail at LinkedIn?"
   - Why it works: rhetorical pull. Pair with a specific stat or example; bare questions ("Thoughts on AI?") fail.

6. **Story start** — "Last year I almost shut down my startup. Then a stranger sent me this:"
   - Why it works: scene + cliffhanger. Story openings outperform meta-commentary roughly 2:1 in Sahil Bloom's tested formats.

7. **Welsh's "Relatable Enemy → Flip"** — "The 9-to-5 is getting pummeled. The great resignation is growing faster than ever."
   - Two short lines, opposing emotional charges, set up the body. Template: `The {RelatableEnemy} is {Negativity}. The {Hero} is {StrongPositiveStatement}.`

### Hook anti-patterns (do not use)

- "Excited to share..." — generic announcement opener; signals nothing.
- "🚀 Big news!" — emoji-first openings underperform plain text on LinkedIn's 2025 ranking signals.
- Hooks longer than 12 words — get truncated in feed.
- Hooks with no concrete noun (number, name, dollar amount, date) — read as filler.

## Post structure templates

### Template A: Story + Lesson
1. Hook (specific scene).
2. Conflict (what went wrong).
3. Pivot (what changed).
4. Lesson (transferable insight).
5. CTA (question or low-friction action).

### Template B: List + Context
1. Hook with the number.
2. Brief context (1-2 lines).
3. Numbered list (5-10 items, each 1-3 lines).
4. Insight or wrap.
5. CTA.

### Template C: Counter-take
1. State the conventional wisdom.
2. State your counter-position.
3. 2-3 reasons.
4. Caveat (when conventional wisdom IS right) — earns credibility.
5. CTA.

### Template D: Behind-the-scenes
1. Specific moment (date, place, action).
2. What you saw / learned.
3. Why it matters generally.
4. CTA.

### Template E: Welsh's 5-step PAIPS (Problem → Agitate → Intrigue → Positive Future → Solution)
1. **Problem** — name the reader's pain in their language.
2. **Agitate** — make the pain present-tense and concrete.
3. **Intrigue** — hint that a path exists.
4. **Positive Future** — describe what life looks like on the other side.
5. **Solution** — your framework / tool / link.

Use PAIPS sparingly. It is the "sales letter on LinkedIn" pattern — strong for lead-gen posts, fatiguing if used weekly.

## Length norms

Two regimes coexist in 2025-2026 LinkedIn data:

- **Punch regime (400-900 chars):** crisp hot takes, single-image posts, list teasers. Lower ceiling, higher consistency.
- **Long regime (1,300-1,900 chars):** stories, breakdowns, frameworks. Higher ceiling, but the post must earn its length — AuthoredUp and Closely's 2025-2026 studies put the engagement peak at **1,300-1,900 characters**, with longer posts (1,301-2,500) generating ~27% higher engagement than sub-400-character posts.

Practical defaults:
- Below 400 chars: only for very crisp opinion drops with one specific claim.
- 800-1,200 chars: default sweet spot for narrative posts.
- 1,300-1,900 chars: the "long regime" — only when you have a real list, story, or framework. Don't pad.
- Above 2,000 chars: rarely. Move it to a newsletter or a carousel.

## Formatting

- **Line breaks every 1-2 sentences.** Dense paragraphs die on mobile.
- **No emoji at start of line** unless it's a list bullet. Emoji-led posts underperform plain text in the 2025 algorithm.
- **Hashtags:** 3-5 max, end of post, niche over broad. `#FounderLife` beats `#Business`.
- **Mentions (@):** only when relevant. Spammy tagging gets reach-throttled.
- **No bolding** — LinkedIn doesn't support markdown bold natively (Unicode-bold tricks look like AI tooling and get flagged by readers).
- **Single image > text-only** by roughly 30% in raw impressions (charts, screenshots, photos). Carousels of 5-7 slides outperform single-image when each slide is readable in 3 seconds.

## Engagement levers

- **Questions** — invite comments. End-of-post questions get roughly 3x replies vs. declarative endings.
- **Polls** — high engagement numbers but lower follower-quality reach. Use to surface audience signal, not as a content pillar.
- **Dwell time matters most.** LinkedIn's 2025-2026 ranking signal weights dwell time (time spent reading the post) over likes. Longer posts that earn the scroll generate more downstream reach than shorter ones with the same like count.
- **First-hour comments compound.** Reply to early commenters within 30 minutes — replies are weighted heavily by the algorithm.
- **Engagement pods are dead.** LinkedIn's 2025 algorithm explicitly demotes inauthentic engagement clusters (per multiple platform analyses).

## Banned moves (LinkedIn-specific + humanizer overlap)

Pair every banned move with the failure mode in parentheses so the model knows *why* to avoid it.

- `"What an amazing day at [event]!"` — (no signal; no specific takeaway).
- `"Just wanted to share…"` — (apologetic; reads as low-conviction).
- `"Thoughts?"` — (too vague; readers need a specific question to answer).
- `"🚀 Excited to announce…"` — (generic; pattern-matches to a thousand identical posts).
- `"What an honor / Humbled to…"` — (humble-brag; reads as performance).
- Excessive em dashes — (humanizer overlap: `references/humanizer-patterns.md` §14; LLM signature).
- `"Game-changer"`, `"in this fast-paced world"`, `"incredibly excited"` — (humanizer banned: AI vocabulary tells).
- `"Let's dive in"`, `"without further ado"` — (humanizer §28: signposting that announces instead of doing).
- `"At its core"`, `"the real question is"`, `"fundamentally"` — (humanizer §27: persuasive-authority tropes; padded importance).
- Inline-header lists with bold colons (`**Performance:**`, `**Security:**`) — (humanizer §16: looks like ChatGPT bullet output, not LinkedIn voice).
- Rule-of-three padding (`innovation, inspiration, and industry insights`) — (humanizer §10: trios as decoration).
- "Knowledge-cutoff" or hedge phrases (`as of my last update`, `it could be argued`) — (humanizer §21, §24).
- Curly quotes (`"…"` instead of `"…"`) — (humanizer §19: ChatGPT signature).

When in doubt, run the post through `/ttm-humanize` before publishing.

## Patterns from public creator playbooks

Stantly is unfindable (see top of file), so this section substitutes the documented playbooks below. Each is sourced from the creator's own public material:

- **Justin Welsh's "scroll-stopper → flip → gasoline + teaser":** three short lines, opposing emotional charges, ending in a one-word teaser question. Built specifically to clear the 210-character truncation. (Source: justinwelsh.me newsletter, "The Anatomy of a Viral LinkedIn Post".)
- **Sahil Bloom's universality bias:** write content that applies to the broadest possible sphere of your niche while still signaling identity. Test ideas in comment threads on viral posts first; the comments that get traction become future posts. (Source: growthinreverse.com case study + Bloom's own LinkedIn posts on his writing process.)
- **Cole Schafer's 20% headline rule:** spend ~20% of total writing time on the first line. Honey Copy's house style treats the headline as the product — the rest of the body exists to deliver on the promise the headline made. (Source: honeycopy.co, coleschafer.com courses.)
- **PAIPS sequencing (Welsh's 5-step copywriting formula):** Problem → Agitate → Intrigue → Positive Future → Solution. Used in lead-gen posts; do not use as a default narrative template.
- **The "rehook" on line 2:** the strongest LinkedIn writers do not just hook the first line — they place a second hook on line 2 to defeat readers who reflexively bail at the truncation point. This is in active use by ContentIn, AuthoredUp, and most 2025-2026 LinkedIn writing guides.

## Time + cadence

- **Best post times (2025-2026 data):** Tuesday and Wednesday, 8-10am in your audience's timezone, with secondary windows at 12-1pm and 3-5pm.
- **Daily cadence beats weekly** for follower growth; weekly beats sporadic.
- **3-4 posts per week is the floor** for compounding reach.
- **Avoid Friday afternoons and weekends** — reach typically drops 30-50% on LinkedIn's professional-feed weighting.
- **Reply window:** the first 30 minutes after posting are the highest-leverage time for replying to comments. Block the calendar.

## How to use this reference

The `/ttm-linkedin-post` skill consumes this file when drafting. Workflow:

1. Pick a template (A-E) based on the post's intent (story, list, counter-take, BTS, lead-gen).
2. Draft a hook from the 7 hook patterns.
3. Draft the body inside the chosen template, respecting length norms.
4. Self-check against the **Banned moves** list.
5. Run `/ttm-humanize` to catch LLM tells.
6. Format check: line breaks every 1-2 sentences, 3-5 niche hashtags at the end, no inline-header bolding.

## Sources

- Justin Welsh, ["The Anatomy of a Viral LinkedIn Post"](https://www.justinwelsh.me/newsletter/the-anatomy-of-a-viral-linkedin-post) — scroll-stopper / flip / gasoline framework, 210-char rule.
- Justin Welsh, ["The LinkedIn Operating System"](https://learn.justinwelsh.me/linkedin) — PAIPS copywriting formula, daily cadence, profile-as-foundation.
- Sahil Bloom, ["Growth In Reverse case study"](https://growthinreverse.com/sahil-bloom/) — universality bias, comment-thread testing, draft-fast-edit-slow.
- Cole Schafer, [Honey Copy](https://www.honeycopy.co/) and [coleschafer.com/courses/copywriting](https://www.coleschafer.com/courses/copywriting) — 20% headline rule, empathy-storytelling-authenticity stance.
- Cole Schafer interview on [Marie Forleo](https://www.marieforleo.com/blog/cole-schafer-honey-copy) — "writing for action" vs. "writing for ideas" distinction.
- AuthoredUp, ["LinkedIn Character Limits 2026: All Limits + Best Post Length Data"](https://authoredup.com/blog/linkedin-character-limit) — 1,300-1,900 char engagement peak; 372,126-post dataset (Sep 2025 - Feb 2026).
- ConnectSafely.ai, ["Best LinkedIn Post Length for Engagement 2026"](https://connectsafely.ai/articles/ideal-linkedin-post-length-engagement-guide-2026) — 47% engagement lift for 1,300-1,900 char posts.
- Closely, ["LinkedIn Algorithm 2025: Post at These Exact Times"](https://blog.closelyhq.com/linkedin-algorithm-2025-post-at-these-exact-times-10x-reach/) — best-times-to-post 2025 data, mobile-feed truncation.
- Meet-Lea, ["LinkedIn Algorithm Explained 2026: Dwell Time, Comments"](https://meet-lea.com/en/blog/linkedin-algorithm-explained) — dwell-time weighting, first-hour comment leverage.
- DEV Community / Synergist Digital, ["LinkedIn's Algorithm in 2025: Why Engagement Pods Are Dead"](https://dev.to/synergistdigitalmedia/linkedins-algorithm-in-2025-why-engagement-pods-are-dead-and-what-works-now-1f6h) — algorithmic demotion of inauthentic engagement clusters.
- Aditya Mallah, ["I Analyzed 1000+ Viral LinkedIn Posts"](https://adityamallahofficial.medium.com/i-analyzed-1000-viral-linkedin-posts-heres-the-prompt-pattern-they-all-share-37267e38d495) — hook-visibility (first 3 lines), readability lift from line breaks.
- BriefGlance, ["Stan Launches AI 'Stanley' to Automate Your LinkedIn Success"](https://briefglance.com/articles/stan-launches-ai-stanley-to-automate-your-linkedin-success) — context for Stan/Stanley, the product likely confused with "Stantly" in source plan.
- `references/humanizer-patterns.md` — overlapping banned-phrase catalog (AI vocabulary, em-dash overuse, signposting, persuasive-authority tropes, rule-of-three padding, curly quotes).

**Stantly URL audit (2026-05-18):** `stantly.com` returned ECONNREFUSED. `linkedin.com/company/stantly` returned HTTP 404. No web-search results match a LinkedIn-focused product or agency named "Stantly." If you find a current source, file an issue and regenerate this file with `/ttm-linkedin-post --rebuild-base`.
