<purpose>
Archive workflow for /ttm-archive. Validates campaign is shipped or learned (only
shipped or learned campaigns can be archived per D-08), extracts structured learnings from campaign
artifacts (D-09), moves campaign to ARCHIVE/ directory (D-07), and updates
LEARNINGS.md with extracted lessons.

Archive is irreversible (D-10). Once archived, a campaign cannot be un-archived
via this command. Cancelled campaigns cannot be archived -- they stay in CAMPAIGNS/
as cautionary records (D-08).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/learnings-extraction.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.

## Archive is Irreversible

Once archived, a campaign cannot be un-archived via this command. The user must
be informed and must confirm before the archive operation executes. This is a
destructive operation that moves files to ARCHIVE/ permanently.

## Shipped or Learned Validation

Only campaigns with phase = "shipped" or phase = "learned" can be archived.
Campaigns in any other phase (including "cancelled") must be rejected with a
clear explanation of why and what to do instead.
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

When TEXT_MODE is active, replace each AskUserQuestion with a plain-text numbered list:
```
[HEADER]
[QUESTION]
  1. [OPTION_1_LABEL] -- [OPTION_1_DESCRIPTION]
  2. [OPTION_2_LABEL] -- [OPTION_2_DESCRIPTION]
  ...
Type the number of your choice:
```

---

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

If SLUG is empty, error:
"Usage: /ttm-archive [campaign-slug]. Provide a campaign slug."
Exit.

---

## Step 2: Validate Campaign

```
takeToMarket > VALIDATING CAMPAIGN
```

Run:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

Parse output and validate:

- If `exists: false`: tell user campaign not found. Exit.
- If `phase` equals `'archived'`: tell user campaign is already archived. Exit.
- If `phase` equals `'cancelled'`: tell user cancelled campaigns cannot be archived
  per policy. They stay in CAMPAIGNS/ as cautionary records for future reference.
  Exit.
- If `phase` is NOT one of `'shipped'` or `'learned'`: tell user only shipped or learned campaigns can be
  archived. Display current phase and suggest completing remaining phases:
  "Campaign '${SLUG}' is in phase '${phase}'. Only shipped or learned campaigns can be
  archived. Complete the remaining phases first."
  Exit.

---

## Step 3: Extract Learnings

**Skip check:** If campaign `phase` is `"learned"` (meaning `/ttm-learn` already ran), skip this step entirely:
```
takeToMarket > Learnings already extracted via /ttm-learn. Skipping re-extraction.
```
Proceed directly to Step 4.

```
takeToMarket > EXTRACTING LEARNINGS
```

Following the learnings-extraction.md reference guide, scan campaign artifacts.

**Read these files from the campaign directory:**

1. `.marketing/CAMPAIGNS/${SLUG}/STATE.md` (full file -- frontmatter and body)
2. `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json` (if exists -- per-asset gate results)
3. `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md` (if exists -- original strategy)
4. `VERIFICATION.md` in the campaign directory (gate details)
5. Any `FIX-BRIEF-*.md` files (fix attempts and outcomes)
6. Any `REVIEW-FEEDBACK-*.md` files (human review feedback)

**Extract structured learnings in three categories:**

### 1. What worked
Identify successes from the campaign:
- First-attempt gate passes (verify.run_count = 1 AND verify.overall_result = pass)
- High review scores (review.overall_result = approved without fix loops)
- Assets shipped without fix loops (fix.run_count = 0 or null)
- Any asset with review_status = "approved" on first submission in MANIFEST.json

For each success, identify the specific pattern or approach that drove it.

### 2. What didn't work
Identify failures or friction:
- Gate failures (verify.overall_result = fail on any run)
- Fix loops (fix.run_count > 0) -- check FIX-BRIEF-*.md for root cause
- Review rejections in REVIEW-FEEDBACK-*.md
- Multiple verification runs (verify.run_count > 1)

Categorize each using the root-cause taxonomy from learnings-extraction.md:
- positioning-drift
- weak-hook
- wrong-channel
- bad-timing
- unverifiable-claim
- broken-funnel
- creative-fatigue

### 3. Campaign-level decisions
Extract key strategic decisions:
- Positioning anchor chosen (from BRIEF.md)
- Channel mix rationale
- Hook strategy used
- ICP targeting decisions
- Any deviations accepted during verify

**Format each learning as a LEARNINGS.md table row:**
```
| ${today} | ${SLUG} | ${category} | ${lesson} | ${action_taken} |
```

Where:
- `today` = current ISO date (YYYY-MM-DD)
- `category` = one of: success, positioning-drift, weak-hook, wrong-channel,
  bad-timing, unverifiable-claim, broken-funnel, creative-fatigue
- `lesson` = one-sentence specific summary of what happened and why
- `action_taken` = recommended reference file update, or "none" if no systemic fix

---

## Step 4: Confirm Archive

```
takeToMarket > CONFIRM ARCHIVE
```

Display the extracted learnings to the user in a readable format:

```markdown
## Learnings Extracted from ${SLUG}

### What Worked
${for each success lesson: bullet point with category and lesson text}

### What Didn't Work
${for each failure lesson: bullet point with category and lesson text}

### Campaign-Level Decisions
${for each decision lesson: bullet point with description}

**Total lessons to record:** ${N}
```

Ask for confirmation using AskUserQuestion (or text-mode numbered list):

```
Archive campaign '${SLUG}'? This will:
1. Move campaign to CAMPAIGNS/ARCHIVE/${SLUG}/
2. Add ${N} lessons to LEARNINGS.md
3. Set campaign state to 'archived'

This action is irreversible.

Options:
1. Confirm archive -- proceed with archive and learnings extraction
2. Cancel -- keep campaign in current state
```

If user selects Cancel, exit without making any changes.

---

## Step 5: Execute Archive

```
takeToMarket > ARCHIVING CAMPAIGN
```

Run the archive CLI command:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign archive "${SLUG}" --raw
```

Parse output and verify `archived: true`.

If the command returns an error:
- Display the error message to the user
- Do NOT attempt to manually move files (the CLI handles all filesystem operations)
- Do NOT update LEARNINGS.md -- the archive did not succeed
- Exit with the error context

The CLI command handles:
- Moving the campaign directory to `.marketing/CAMPAIGNS/ARCHIVE/${SLUG}/`
- Updating the campaign state to "archived"
- Validating the campaign is in "shipped" or "learned" phase before allowing archive

---

## Step 6: Update LEARNINGS.md

```
takeToMarket > UPDATING LEARNINGS
```

**Important:** This step runs only after the archive CLI command succeeds in Step 5.
The campaign is now in ARCHIVE/ with phase set to "archived". Writing learnings after
archive confirmation prevents data-loss on retry (duplicate rows) if archive were to fail.

Read `.marketing/LEARNINGS.md`.

**Duplicate guard:** Before inserting rows, scan existing LEARNINGS.md content for
any row containing `| ${SLUG} |` with today's date. If matching rows already exist
for this campaign slug and today's date, skip insertion and log:
"Learnings for ${SLUG} already present in LEARNINGS.md -- skipping duplicate write."
This prevents duplicate lesson rows if the workflow is retried after a partial failure.

Find the marker line: `<!-- LESSONS BELOW THIS LINE -->`

**Marker validation (T-07-10 mitigation):**
- Count occurrences of the marker in the file
- If exactly 1 marker found: insert all extracted lesson rows immediately AFTER
  the marker line (one row per line, each on its own line)
- If 0 markers found: fall back to appending rows after the last table row in the
  Lessons Log table section (look for the last line starting with `|`)
- If >1 markers found: fall back to appending rows after the FIRST marker only.
  Log a warning about duplicate markers.

Write the updated LEARNINGS.md back to disk.

Also update the Summary section at the top of LEARNINGS.md:
- Increment "Total lessons" count by the number of new rows added
- Update "Last lesson date" to today's date

---

## Step 7: Confirm Completion

```
takeToMarket > ARCHIVE COMPLETE
```

Display completion summary:

```markdown
## Archive Complete: ${SLUG}

**Campaign:** ${name}
**Archived at:** ${timestamp}
**Lessons extracted:** ${N}

### Lessons Added to LEARNINGS.md
| Date | Campaign | Category | Lesson | Action Taken |
|------|----------|----------|--------|-------------|
${extracted_rows}

Campaign directory moved to `.marketing/CAMPAIGNS/ARCHIVE/${SLUG}/`

### Next Steps
- Lessons are now available in LEARNINGS.md for future campaigns
- Run /ttm-health to verify system consistency
- Start a new campaign with /ttm-new-campaign when ready
```

</process>

<success_criteria>
- [ ] Campaign validated as shipped or learned before archive (D-08)
- [ ] Cancelled campaigns rejected with explanation (D-08)
- [ ] Learnings extracted from campaign artifacts using extraction guide (D-09)
- [ ] Root-cause taxonomy applied to failure categorization (D-09)
- [ ] User confirmed before destructive archive action (D-10)
- [ ] LEARNINGS.md marker validated (exactly 1 occurrence) before append (T-07-10)
- [ ] LEARNINGS.md updated with new lesson rows via marker-based append
- [ ] Campaign directory moved to ARCHIVE/ via CLI command (D-07)
- [ ] Campaign state set to archived
- [ ] Completion summary displayed with all extracted lessons
</success_criteria>

<output>
- `.marketing/LEARNINGS.md` (updated with extracted lessons)
- `.marketing/CAMPAIGNS/ARCHIVE/${SLUG}/STATE.md` (phase set to archived, via CLI)
</output>
