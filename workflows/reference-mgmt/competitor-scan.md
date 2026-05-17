<purpose>
On-demand competitor analysis that updates COMPETITORS.md with new intelligence.
Detects WebSearch/WebFetch MCP tools for automated research; falls back to manual
paste when tools unavailable. Validates findings against POSITIONING.md to identify
differentiation gaps and opportunities. Single-pass workflow per D-06 and D-09.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/templates/reference-files/competitors.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- Flag the issue and recommend running /ttm-positioning-check
- Recommend /ttm-positioning-shift if a deliberate change is needed

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>

<process>

## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

If `AskUserQuestion` tool is not available in the current runtime, set `TEXT_MODE=true`.
When TEXT_MODE is active, replace each AskUserQuestion with a plain-text numbered list.

---

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

**Load Tier 1 summaries** from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.taketomarket/POSITIONING.md`
- `.taketomarket/BRAND.md`
- `.taketomarket/ICP.md`
- `.taketomarket/CHANNELS.md`
- `.taketomarket/STATE.md` (frontmatter only)
- `.taketomarket/CALENDAR.md`
- `.taketomarket/COMPETITORS.md`
- `.taketomarket/METRICS.md`
- `.taketomarket/LEARNINGS.md`

**Load Tier 2 (full content)** for analysis:
- `.taketomarket/COMPETITORS.md`
- `.taketomarket/POSITIONING.md`

If `.taketomarket/COMPETITORS.md` does not exist, error:
"COMPETITORS.md not found. Run /ttm-init first to set up your marketing system."
Exit.

Parse POSITIONING.md for: category, primary differentiator, target audience, must-not-say terms.
Parse COMPETITORS.md for: existing competitor list, positioning map, SOV baselines.

---

## Step 2: Tool Detection

Attempt a WebSearch call with a minimal test query related to the user's category
(from POSITIONING.md category field): `"${CATEGORY} competitors ${CURRENT_YEAR}"`.

### When WebSearch is available (SEARCH_MODE=web)

```
takeToMarket > COMPETITOR SCAN MODE: WEB
```

Proceed to Step 3 with automated research capabilities.

### When WebSearch is NOT available (SEARCH_MODE=manual)

```
takeToMarket > COMPETITOR SCAN MODE: MANUAL
```

Tell the user:
```
Web search tools are not available in this session.
To run a competitor scan, please paste any of the following:

1. Competitor websites or landing page content
2. Competitor social media posts or ad creative
3. Industry reports or market analysis
4. Search results for your category keywords
5. Any other competitive intelligence you have gathered

Paste your findings below and I will analyze them.
```

Wait for the user to paste content.

---

## Step 3: Research Competitors

### If SEARCH_MODE=web:

For each competitor already listed in COMPETITORS.md:
- WebSearch: `"${COMPETITOR_NAME} ${CATEGORY}"` for latest positioning
- WebFetch on competitor homepage URL if known (from COMPETITORS.md)

Search for new entrants:
- WebSearch: `"${CATEGORY} alternatives ${CURRENT_YEAR}"`
- WebSearch: `"${CATEGORY} new tools ${CURRENT_YEAR}"`

Tag all findings with confidence levels:
- **HIGH**: verified from competitor URL or cited data from web search
- **MEDIUM**: indirect evidence or partial match from search results
- **LOW**: inference drawn from patterns without direct evidence

### If SEARCH_MODE=manual:

Analyze pasted content for:
- Positioning claims and messaging themes
- Channel presence and content strategy signals
- Pricing signals or packaging changes
- New competitors not in current COMPETITORS.md

Tag all pasted insights as **MEDIUM** confidence (user-provided, not independently verified).
Insights cross-referenced against existing COMPETITORS.md data may be elevated to **HIGH**.

---

## Step 4: Analyze and Compare

For each competitor (existing and newly discovered):

1. **Current positioning claim:** What they say they are/do
2. **Differentiator comparison:** Compare against our POSITIONING.md primary differentiator
3. **Overlap areas:** Where competitor messaging is similar to ours (risk zones)
4. **Gap opportunities:** Areas competitors are not covering that we could own
5. **SOV signals:** Any share-of-voice indicators (content volume, social presence, ad spend)

Summarize findings:
```
takeToMarket > ANALYSIS COMPLETE

Competitors analyzed: ${TOTAL_COUNT}
New competitors found: ${NEW_COUNT}
Positioning overlaps: ${OVERLAP_COUNT}
Gap opportunities: ${GAP_COUNT}
```

---

## Step 5: Validate and Update

Ask user to confirm via AskUserQuestion (or text-mode freeform):

**Question 1:**
- header: "Confirm New Competitors"
- question: "New competitors found: [list names]. Add all to COMPETITORS.md? Or specify which to include/exclude."

**Question 2:**
- header: "Update Existing Competitors"
- question: "Updated intelligence for: [list names with change summary]. Accept all updates? Or specify which to accept/reject."

**Question 3:**
- header: "Inactive Competitors"
- question: "Any competitors to mark as inactive/irrelevant? List names or type 'none'."

Validate all proposed updates:
- No update suggests user adopt a competitor's positioning
- No update contradicts POSITIONING.md differentiator or must-not-say terms
- Gap opportunities align with our positioning scope

Write updated `.taketomarket/COMPETITORS.md`:
- Update existing competitor entries with new findings (positioning, strengths, weaknesses)
- Add new competitors with full profiles (name, positioning, strength, weakness)
- Mark inactive competitors with `[INACTIVE: YYYY-MM-DD]` suffix in name column
- Update `## Positioning Map` section with new/changed positions
- Update `## Share of Voice Baseline` with new SOV signals
- Update `## Competitor Content Analysis` for analyzed competitors

**CRITICAL:** Preserve `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->` delimiters exactly.
Update summary block if top competitors or positioning-vs-them changed.
Preserve all existing file structure and section ordering.

---

## Step 6: Completion Banner

```
========================================
takeToMarket > COMPETITOR SCAN COMPLETE
========================================

Competitors analyzed: ${COUNT}
New competitors found: ${NEW_COUNT}
Positioning overlaps detected: ${OVERLAP_COUNT}
Research method: ${SEARCH_MODE}

Next steps:
- Review updated .taketomarket/COMPETITORS.md
- Run /ttm-positioning-check if overlaps concern you
```

</process>

<success_criteria>
- [ ] Tier 1 summaries loaded from all 9 reference files
- [ ] Tier 2 full content loaded for COMPETITORS.md and POSITIONING.md
- [ ] WebSearch tool detection attempted before research
- [ ] SEARCH_MODE=web path uses WebSearch and WebFetch for automated research
- [ ] SEARCH_MODE=manual path prompts user to paste competitive intelligence
- [ ] All findings tagged with confidence levels (HIGH/MEDIUM/LOW)
- [ ] Analysis compares each competitor against POSITIONING.md differentiator
- [ ] User confirms new additions and updates before writing
- [ ] No update contradicts POSITIONING.md
- [ ] COMPETITORS.md updated with preserved structure and summary markers
- [ ] Completion banner displayed with scan results
</success_criteria>
