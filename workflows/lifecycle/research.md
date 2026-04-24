<purpose>
Market and audience research workflow that generates a structured RESEARCH.md for a
campaign. Detects WebSearch tool availability at runtime and falls back to manual paste
when web search tools are unavailable. Every insight is tagged with a confidence level
(HIGH/MEDIUM/LOW). Use after /ttm-new-campaign has created the campaign directory.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/templates/campaign-research.md
</required_reading>

<process>

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Read Tier 1 summary blocks (content between `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->`)
from all 9 `.marketing/` reference files:

- `.marketing/POSITIONING.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/BRAND.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/ICP.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/CHANNELS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/COMPETITORS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/METRICS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/LEARNINGS.md` (lines 1 to `<!-- END_SUMMARY -->`)

Read Tier 2 (full content) for:
- `.marketing/COMPETITORS.md` (per context-loading.md loading matrix -- research loads Tier 2 COMPETITORS.md)

---

## Step 2: Validate Campaign

Extract the campaign slug from `$ARGUMENTS`. Strip any `--text` flag if present:
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

If `$SLUG` is empty: ask the user "Which campaign should I research? Provide the campaign slug or name."

Check the campaign exists:
```bash
ls .marketing/CAMPAIGNS/${SLUG}/STATE.md 2>/dev/null && echo "exists" || echo "missing"
```

**If "missing":**
Tell the user: "Campaign `${SLUG}` does not exist. Run `/ttm-new-campaign ${SLUG}` first to create it."
Exit -- do not continue.

**If "exists":**
Read campaign state:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign state ${SLUG} --raw
```

Read the full campaign STATE.md (campaign files are always full-loaded per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`

Store the campaign name from the state for use in RESEARCH.md generation.

---

## Step 3: Phase Order Check

Check the `phase` field from campaign state (Step 2).

**If phase is NOT "created":**
Warn the user: "Campaign `${SLUG}` is already in phase `${PHASE}`. Running research again will overwrite RESEARCH.md. Proceed anyway?"

Wait for user confirmation before continuing.

- If user confirms: continue to Step 4.
- If user declines: exit with message "Research cancelled."

**If phase is "created":**
Continue to Step 4.

---

## Step 4: Understand Campaign

Read the campaign name and any goal information from the campaign STATE.md.

Ask the user (freeform, not AskUserQuestion):
"What is the topic or focus of this campaign? What keywords or themes should I research?"

Store the response as `RESEARCH_TOPIC`.

---

## Step 5: Tool Detection and Research

Attempt a WebSearch call to detect tool availability. Use a minimal test query related
to the campaign topic.

### When WebSearch is available (SEARCH_MODE=web)

```
takeToMarket > RESEARCH MODE: WEB
```

- Use WebSearch for SERP queries based on `RESEARCH_TOPIC` and campaign keywords
- Search for: market trends, competitor content, audience discussions, content gaps
- Use WebFetch for competitor page content extraction when specific URLs are found
- Cross-reference findings against `.marketing/COMPETITORS.md` (already loaded in Tier 2)
- Tag insights with confidence levels:
  - **HIGH**: verified source URL or cited data from web search results
  - **MEDIUM**: indirect evidence or partial match from search results
  - **LOW**: inference drawn from patterns without direct evidence

### When WebSearch is NOT available (SEARCH_MODE=manual)

```
takeToMarket > RESEARCH MODE: MANUAL
```

Tell the user:
```
Web search tools are not available in this session.
To get the best research, please paste any of the following:

1. Google search results for:
   - "[RESEARCH_TOPIC] [year]"
   - "[RESEARCH_TOPIC] best practices"
   - "[RESEARCH_TOPIC] vs [competitor terms]"
2. Any competitor blog posts or landing pages you want analyzed
3. Reddit/forum discussions about [RESEARCH_TOPIC]
4. Any other market data you have (reports, articles, social posts)

Paste your findings below and I will analyze them.
```

Wait for the user to paste content.

Analyze pasted content against the loaded reference files (POSITIONING.md, ICP.md,
COMPETITORS.md summaries). Extract structured insights from the pasted material.

Tag all pasted insights as **MEDIUM** confidence (user-provided, not independently verified).
Insights cross-referenced against known COMPETITORS.md data may be elevated to HIGH.

### Hybrid mode

If some insights come from web search and others from user paste, set method to "hybrid"
and tag each insight according to its actual source.

---

## Step 6: Generate RESEARCH.md

```
takeToMarket > GENERATING RESEARCH
```

Read the template:
```
${CLAUDE_PLUGIN_ROOT}/templates/campaign-research.md
```

Fill all sections with research findings:

- Replace `[CAMPAIGN_NAME]` with the campaign name from STATE.md
- Replace `[SLUG]` with the campaign slug
- Set **Researched:** to current timestamp:
  ```bash
  node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw
  ```
- Set **Method:** to `web-search`, `manual-paste`, or `hybrid` based on Step 5

### Section: Market Context
Fill the insight table with market-level findings. Each row must have:
- Insight text (specific, not generic)
- Confidence tag: HIGH, MEDIUM, or LOW
- Source (URL for web results, "user-provided" for paste, "inference" for AI analysis)

### Section: Competitor Content Analysis
Fill the competitor table from research findings cross-referenced with COMPETITORS.md:
- Competitor name (from COMPETITORS.md or newly discovered)
- Content type (blog, landing page, social, video, etc.)
- Key message (their positioning or angle)
- Gap/Opportunity (where our positioning can differentiate)

### Section: Audience Insights
Fill the insight table combining ICP.md Tier 1 summary with research findings:
- What the target audience cares about
- Pain points validated by research
- Language patterns observed

### Section: Ambient Narrative
Write 2-3 paragraphs describing what the market already believes about this topic.
What is the conventional wisdom? What assumptions do most buyers hold? Where does
the market consensus create an opening for our positioning?

### Section: Content Gaps
Fill the gaps table with opportunities where quality content is missing or weak:
- Gap description (specific topic or angle)
- Opportunity size: HIGH (no quality content exists), MEDIUM (content exists but is weak), LOW (content exists but can be improved)
- Difficulty: HIGH (requires deep expertise), MEDIUM (moderate effort), LOW (straightforward)

### Section: Research Summary
Write a 2-3 sentence summary that `/ttm-brief` will consume. Focus on: the biggest
opportunity, the key audience insight, and the competitive angle.

Write the completed research to:
```
.marketing/CAMPAIGNS/${SLUG}/RESEARCH.md
```

---

## Step 7: Update Campaign State

Update the campaign phase and timestamp:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase researched
```

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase.researched $(node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw)
```

Count the total insights generated across all sections.

Display summary:
```
takeToMarket > RESEARCH COMPLETE

Research saved to .marketing/CAMPAIGNS/${SLUG}/RESEARCH.md
Method: [web-search|manual-paste|hybrid]
Insights: [count] with confidence breakdown
  HIGH: [count]
  MEDIUM: [count]
  LOW: [count]

Next: Run /ttm-brief ${SLUG}
```

</process>

<success_criteria>
- [ ] Context loaded (Tier 1 all 9 files, Tier 2 COMPETITORS.md)
- [ ] Campaign validated and slug extracted from $ARGUMENTS
- [ ] Phase order checked (warn if not "created")
- [ ] User provided research topic
- [ ] Tool detection attempted before research (WebSearch probe)
- [ ] Research generated with all 5 sections filled
- [ ] Every insight tagged with confidence level (HIGH/MEDIUM/LOW)
- [ ] RESEARCH.md written to campaign directory using template
- [ ] Campaign state updated to phase=researched with timestamp
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/<slug>/RESEARCH.md` (populated with research)
</output>
