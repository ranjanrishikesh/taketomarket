<purpose>
Update BRAND.md with new proof points, deprecate expired ones, and refresh voice
guidelines. Validates all changes against POSITIONING.md invariant before writing.
Single-pass workflow per D-06.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/templates/reference-files/brand.md
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
- `.taketomarket/BRAND.md`

If `.taketomarket/BRAND.md` does not exist, error:
"BRAND.md not found. Run /ttm-init first to set up your marketing system."
Exit.

Parse the current BRAND.md into structured sections:
- `CURRENT_VOICE_ARCHETYPE` -- from `## Voice Archetype`
- `CURRENT_TONE_TABLE` -- from `## Tone per Context`
- `CURRENT_BANNED_WORDS` -- from `## Banned Words` table rows
- `CURRENT_PROOF_POINTS` -- from `## Proof Points` table rows
- `CURRENT_BRAND_EXAMPLES` -- from `## Brand Examples`

---

## Step 2: Present Current State and Gather Updates

Display current BRAND.md sections to the user:

```
takeToMarket > BRAND REFRESH

Current Voice Archetype: ${CURRENT_VOICE_ARCHETYPE}
Current Proof Points: ${count} entries
Current Banned Words: ${count} entries
```

Ask user via AskUserQuestion (or text-mode numbered list) -- collect as freeform responses:

**Question 1:**
- header: "Expired Proof Points"
- question: "Which proof points are now expired or outdated? List numbers from the table above, or type 'none'."

**Question 2:**
- header: "New Proof Points"
- question: "What new proof points should be added? For each, provide: claim, source, and verification date. Or type 'none'."

**Question 3:**
- header: "Voice and Tone Updates"
- question: "Any voice archetype or tone updates needed? Describe changes, or type 'none'."

**Question 4:**
- header: "Banned Words"
- question: "Any new banned words to add? List each with reasoning, or type 'none'."

If ALL four answers are "none": display "No changes requested. BRAND.md is unchanged." Exit.

---

## Step 3: Validate Against Positioning

Load the primary differentiator, target audience, category, and must-not-say terms from
the POSITIONING.md Tier 1 summary (already loaded in Step 1).

For each proposed change, validate:

**New proof points:**
- Check each new proof point does not contradict the primary differentiator
- Check claims do not use must-not-say terms from POSITIONING.md

**Voice/tone updates:**
- Check new voice attributes do not conflict with the positioning category or audience
- Check tone changes do not soften or contradict the brand's positioning stance

**New banned words:**
- Check no proposed banned word conflicts with required positioning language
  (e.g., banning a word that appears in the differentiator statement)

If conflict detected:
```
takeToMarket > POSITIONING CONFLICT DETECTED

Conflict: [specific description]
Affected field: [which BRAND.md section]
POSITIONING.md reference: [the conflicting positioning element]

Please resolve this conflict before proceeding.
Recommendation: Adjust the proposed change, or run /ttm-positioning-shift if the
positioning itself needs updating.
```

Ask user to revise the conflicting item or skip it.

---

## Step 4: Write Updated BRAND.md

Apply validated changes to `.taketomarket/BRAND.md`:

- **Deprecated proof points:** Mark with `[DEPRECATED: YYYY-MM-DD, reason]` suffix in
  the Claim column. Do NOT delete rows -- preserve history.
- **New proof points:** Add new rows to the `## Proof Points` table with claim, source,
  and current date as verification date.
- **Voice/tone updates:** Update the `## Voice Archetype` section and/or
  `## Tone per Context` table with new values.
- **New banned words:** Add rows to the `## Banned Words` table with word and reasoning.

**CRITICAL:** Preserve the `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->` delimiters
exactly as they are. Update the summary block between these markers to reflect new
voice archetype and banned words if changed.

Preserve all existing file structure, frontmatter, and section ordering.

Write the updated file via the Write tool.

---

## Step 5: Completion Banner

```
========================================
takeToMarket > BRAND REFRESH COMPLETE
========================================

Updated sections:
- [list of changed sections, e.g., "Proof Points (2 added, 1 deprecated)"]
- [e.g., "Banned Words (3 added)"]

Next: Run /ttm-positioning-check to verify alignment across recent assets
```

</process>

<success_criteria>
- [ ] Tier 1 summaries loaded from all 9 reference files
- [ ] Tier 2 full content loaded for BRAND.md
- [ ] Current brand state displayed to user
- [ ] User provided updates for at least one section (or exited with "no changes")
- [ ] All proposed changes validated against POSITIONING.md
- [ ] Conflicts flagged and resolved before writing
- [ ] BRAND.md updated with deprecated markers, new entries, and preserved structure
- [ ] Summary markers (<!-- _SUMMARY --> / <!-- END_SUMMARY -->) preserved
- [ ] Completion banner displayed with changed sections
</success_criteria>
