<purpose>
Update ICP.md from new customer data (calls, reviews, feedback, surveys). Validates
all changes against POSITIONING.md target audience field before writing. Single-pass
workflow per D-06.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/templates/reference-files/icp.md
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

**Load Tier 2 (full content)** for the file being refreshed:
- `.taketomarket/ICP.md`

If `.taketomarket/ICP.md` does not exist, error:
"ICP.md not found. Run /ttm-init first to set up your marketing system."
Exit.

Parse the current ICP.md into structured sections:
- `CURRENT_PRIMARY_SEGMENT` -- from `## Primary Segment`
- `CURRENT_JTBD` -- from `## Jobs-to-Be-Done` table rows
- `CURRENT_PAINS` -- from `### Pain Points` table rows
- `CURRENT_TRIGGERS` -- from `### Buying Triggers`
- `CURRENT_ANTI_ICP` -- from `## Anti-ICP Profile` table rows
- `CURRENT_LANGUAGE` -- from `## Customer Language Library` table rows

---

## Step 2: Present Current State and Gather Updates

Display current ICP.md sections to the user:

```
takeToMarket > ICP REFRESH

Primary Segment: ${CURRENT_PRIMARY_SEGMENT summary}
Jobs-to-Be-Done: ${count} entries
Pain Points: ${count} entries
Anti-ICP: ${count} entries
Customer Language: ${count} phrases
```

Ask user via AskUserQuestion (or text-mode freeform) -- collect responses:

**Question 1:**
- header: "New Customer Data"
- question: "What new customer data do you have? Paste call notes, reviews, feedback, survey results, or describe your findings."

**Question 2:**
- header: "New Jobs-to-Be-Done or Pain Points"
- question: "Any new JTBD or pain points discovered from this data? Describe each, or type 'none'."

**Question 3:**
- header: "New Trigger Events"
- question: "Any new buying trigger events identified? Describe each, or type 'none'."

**Question 4:**
- header: "Customer Language"
- question: "New customer language phrases to add to the library? Provide exact quotes with context and source, or type 'none'."

**Question 5:**
- header: "Anti-ICP Updates"
- question: "Any new segments to add to anti-ICP? Describe people who are NOT your target and why, or type 'none'."

If Question 1 is "none" AND all other answers are "none": display "No new data provided. ICP.md is unchanged." Exit.

---

## Step 3: Validate Against Positioning

Load the target audience, primary differentiator, and must-not-say terms from
the POSITIONING.md Tier 1 summary (already loaded in Step 1).

For each proposed change, validate:

**New segments/JTBD:**
- Check new segment descriptions align with POSITIONING.md target audience definition
- Check new JTBD do not describe jobs outside the positioning scope

**New customer language:**
- Check phrases do not include must-not-say terms from POSITIONING.md
- Check language aligns with the positioning category and differentiator

**Anti-ICP additions:**
- Check anti-ICP entries do not exclude groups that overlap with the POSITIONING.md
  target audience (would create a contradiction)

If conflict detected:
```
takeToMarket > POSITIONING CONFLICT DETECTED

Conflict: [specific description]
Affected field: [which ICP.md section]
POSITIONING.md reference: [the conflicting positioning element]

Please resolve this conflict before proceeding.
Recommendation: Adjust the proposed change, or run /ttm-positioning-shift if the
positioning itself needs updating.
```

Ask user to revise the conflicting item or skip it.

---

## Step 4: Write Updated ICP.md

Analyze raw customer data from Question 1 alongside specific additions from Questions 2-5.
Extract structured insights and apply to ICP.md sections:

- **New JTBD:** Add rows to `## Jobs-to-Be-Done` table (job, priority, current solution)
- **New pain points:** Add rows to `### Pain Points` table (pain, severity, frequency)
- **New triggers:** Add to `### Buying Triggers` section
- **New anti-ICP entries:** Add rows to `## Anti-ICP Profile` table (characteristic, reason)
- **New language phrases:** Add rows to `## Customer Language Library` table (context, phrase, source)

**CRITICAL:** Preserve `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->` delimiters exactly.
Update the summary block if primary segment, top pains, or anti-ICP changed.
Preserve all existing structure and ordering. Do NOT remove existing entries.

Write the updated file via the Write tool.

---

## Step 5: Completion Banner

```
========================================
takeToMarket > ICP REFRESH COMPLETE
========================================

Updated sections:
- [list of changed sections, e.g., "Pain Points (2 added)"]
- [e.g., "Customer Language (4 new phrases)"]
- [e.g., "Anti-ICP (1 new exclusion)"]

Data source: [brief description of input data type]

Next: Run /ttm-positioning-check to verify alignment across recent assets
```

</process>

<success_criteria>
- [ ] Tier 1 summaries loaded from all 9 reference files
- [ ] Tier 2 full content loaded for ICP.md
- [ ] Current ICP state displayed to user
- [ ] User provided new customer data or specific updates
- [ ] All proposed changes validated against POSITIONING.md target audience
- [ ] Conflicts flagged and resolved before writing
- [ ] ICP.md updated with new entries and preserved structure
- [ ] Summary markers (<!-- _SUMMARY --> / <!-- END_SUMMARY -->) preserved
- [ ] Completion banner displayed with changed sections
</success_criteria>
