<purpose>
Review workflow for /ttm-review. Presents verified assets with structured
review checklist for human evaluation (LIFE-10). Collects per-asset outcomes
(Approve/Revise/Reject per D-03) with hero-first ordering (D-02). Structured
revision feedback on Revise (D-12). Auto-triggers /ttm-fix for revised assets (D-15).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/review-checklist.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

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

If SLUG is empty, error: "Usage: /ttm-review [campaign-slug]. Provide a campaign slug." Exit.

**Load Tier 1 summaries** from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md`
- `.marketing/COMPETITORS.md`
- `.marketing/METRICS.md`
- `.marketing/LEARNINGS.md`

**Tier 2:** None for review (per context-loading.md matrix -- review is human-driven).

**Load campaign-specific files** (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`

**Load MANIFEST.json:**
```bash
MANIFEST_PATH=".marketing/CAMPAIGNS/${SLUG}/MANIFEST.json"
```

Read `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json`. If the file does not exist, error:
"No production manifest found for campaign '${SLUG}'. Run /ttm-produce first."
Exit.

**Load VERIFICATION.md:**
Read `.marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md`. If the file does not exist, error:
"No verification report found for campaign '${SLUG}'. Run /ttm-verify first."
Exit.

---

## Step 2: Validate Campaign State

```
takeToMarket > VALIDATING CAMPAIGN
```

Check campaign exists:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

If result shows `exists: false`: Tell the user the campaign does not exist and suggest
running `/ttm-new-campaign` first. Exit.

Read campaign state. Check the `phase` field:
- If phase is NOT `"verified"`: Warn the user:
  "Campaign is in phase '${PHASE}'. Expected 'verified' before review.
  Running /ttm-review now may produce incomplete results. Proceed?"
  Wait for user confirmation via AskUserQuestion (or text-mode prompt).
  If user declines, exit.

**Determine review run number:**
Read `review.run_count` from state. If null or 0, set `RUN_NUMBER=1`.
Otherwise set `RUN_NUMBER` to `review.run_count + 1`.

---

## Step 3: Load Assets and Verification Results

```
takeToMarket > LOADING ASSETS AND GATE RESULTS
```

**Parse MANIFEST.json** for the asset list. The manifest contains a `hero` object
and a `derivatives` array:

```
HERO = { name: manifest.hero.name, file: manifest.hero.file, type: manifest.hero.type }
DERIVATIVES = []
for each derivative in manifest.derivatives:
    DERIVATIVES.push({ name: derivative.name, file: derivative.file, type: derivative.type })
ALL_ASSETS = [HERO] + DERIVATIVES
```

**Parse VERIFICATION.md** for gate results. Extract the summary table to get per-asset
PASS/WARN/FAIL counts and overall result for each gate. Build a lookup:
```
GATE_RESULTS[asset_name] = {
  gates: [ { gate_name, gate_id, result: PASS|WARN|FAIL }, ... ],
  pass_count, warn_count, fail_count,
  overall: PASS|WARN|FAIL
}
```

**Load content previews** from disk. For each asset:
- Read the file from `.marketing/CAMPAIGNS/${SLUG}/${asset.file}`
- Extract the first ~500 characters for the hero, first ~300 characters for derivatives (D-04)
- If an asset file is missing from disk, display warning and skip it

If ALL asset files are missing: Error: "No asset files found on disk. Re-run /ttm-produce."
Exit.

---

## Step 4: Review Hero Asset (D-02)

```
takeToMarket > REVIEW: Hero Asset
```

Display the hero asset in full detail:

```
## [HERO_ASSET_NAME]
File: .marketing/CAMPAIGNS/${SLUG}/${HERO_FILE}

### Gate Summary
| Gate | Result |
|------|--------|
| Positioning Drift (GATE-01) | [PASS|WARN|FAIL] |
| Claim Accuracy (GATE-02) | [PASS|WARN|FAIL] |
| Voice Drift (GATE-03) | [PASS|WARN|FAIL] |
| Outcome Alignment (GATE-04) | [PASS|WARN|FAIL] |
| Funnel Integrity (GATE-05) | [PASS|WARN|FAIL|N/A] |
| UTM Hygiene (GATE-06) | [PASS|WARN|FAIL|N/A] |
| Compliance (GATE-07) | [PASS|WARN|FAIL|N/A] |
| Competitor Collision (GATE-08) | [PASS|WARN|FAIL] |
| ICP Fit (GATE-09) | [PASS|WARN|FAIL] |
| Format Correctness (GATE-10) | [PASS|WARN|FAIL] |

### Content Preview
[First ~500 characters of the asset]
[Full file: .marketing/CAMPAIGNS/${SLUG}/${HERO_FILE}]
```

**Present the 4 mandatory review questions** from review-checklist.md. Use
AskUserQuestion (or text-mode prompt) for each question. All 4 are REQUIRED --
the reviewer must answer each one before selecting an outcome.

### Question 1: Positioning Reinforcement
Using AskUserQuestion (or text-mode), ask:
"Does this asset reinforce your positioning -- your primary differentiator, target
audience, and category? Identify any claims that go beyond or contradict POSITIONING.md."

Record the answer.

### Question 2: Outcome Realism
"Is the outcome metric target realistic given this content? Could this asset
plausibly drive the defined outcome (e.g., demo requests, signups, pipeline)?"

Record the answer.

### Question 3: Claim Substantiation
"Are all factual claims, statistics, and proof points substantiated by approved
data in BRAND.md? Flag any unverifiable or unsourced claims."

Record the answer.

### Question 4: Competitor Differentiation
"Does this asset clearly differentiate from competitors? Could a competitor
publish this same content with their name swapped in?"

Record the answer.

### Freeform Notes (Optional)
"Any additional feedback, concerns, or suggestions? (Press enter to skip)"

Record notes if provided.

### Collect Hero Outcome (D-03)
Present outcome selection using AskUserQuestion (or text-mode numbered list):
```
Select outcome for [HERO_ASSET_NAME]:
1. Approve -- asset is ready for shipping
2. Revise -- asset needs changes (you will provide structured feedback next)
3. Reject -- asset is fundamentally wrong (final, no fix loop)
```

**If outcome is Approve:**
Set hero `review_status` = `"approved"` in memory.

**If outcome is Revise:**
Collect structured revision feedback per D-12 (see review-checklist.md):

1. Ask: "Which review questions did this asset fail? (select numbers, e.g., 1,3)"
   Options: 1=Positioning reinforcement, 2=Outcome realism, 3=Claim substantiation,
   4=Competitor differentiation

2. Ask: "Severity? 1=Minor (small adjustments), 2=Major (significant rewrite),
   3=Critical (fundamental approach is wrong)"

3. Ask: "What specifically needs to change? Be as concrete as possible -- reference
   specific sections, sentences, or claims."

Set hero `review_status` = `"needs-fix"` in memory.

Write the structured feedback to `.marketing/CAMPAIGNS/${SLUG}/REVIEW-FEEDBACK-${HERO_NAME}.md`:
```markdown
# Review Feedback: [HERO_ASSET_NAME]

**Campaign:** [SLUG]
**Date:** [ISO_TIMESTAMP]
**Reviewer outcome:** Revise
**Severity:** [Minor|Major|Critical]

## Failed Checklist Items
- [x] Positioning reinforcement (if selected)
- [x] Outcome realism (if selected)
- [x] Claim substantiation (if selected)
- [x] Competitor differentiation (if selected)

## Specific Feedback
[User's freeform feedback text]

## Gate Failures (from VERIFICATION.md)
[Extract relevant WARN/FAIL findings for this asset from VERIFICATION.md]
```

**If outcome is Reject:**
Ask: "Why are you rejecting this asset? (This will be logged permanently.)"
Set hero `review_status` = `"rejected"` in memory.
Record the rejection reason.

---

## Step 5: Batch Review Derivatives (D-02, D-13)

If there are no derivative assets, skip this step.

```
takeToMarket > REVIEW: Derivative Assets

Reviewing ${N} derivatives. Hero asset for reference: ${HERO_FILE}
```

For each derivative asset:

### Display Abbreviated View
Show abbreviated gate summary (PASS count / WARN count / FAIL count -- not full table):
```
## [DERIVATIVE_NAME]
File: .marketing/CAMPAIGNS/${SLUG}/${DERIVATIVE_FILE}
Gates: ${PASS_COUNT} PASS / ${WARN_COUNT} WARN / ${FAIL_COUNT} FAIL

### Content Preview
[First ~300 characters of the asset]
[Full file: .marketing/CAMPAIGNS/${SLUG}/${DERIVATIVE_FILE}]
```

### Review Questions (Batch Mode)
Present the same 4 mandatory questions from review-checklist.md. In batch mode,
answers can be shorter but all 4 are still required.

### Freeform Notes (Optional)
"Any additional feedback? (Press enter to skip)"

### Collect Derivative Outcome
Same 3 outcome options (Approve/Revise/Reject) per D-03.

If **Approve**: Set derivative `review_status` = `"approved"` in memory.

If **Revise**: Collect same structured revision feedback (failed items, severity,
specific feedback). Write to `.marketing/CAMPAIGNS/${SLUG}/REVIEW-FEEDBACK-${DERIVATIVE_NAME}.md`.
Set derivative `review_status` = `"needs-fix"` in memory.

If **Reject**: Collect rejection reason. Set derivative `review_status` = `"rejected"` in memory.

---

## Step 6: Update MANIFEST.json with Review Status (D-11, D-13)

Read MANIFEST.json from `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json`.

Add `review_status` field to hero and each derivative:
- `"approved"` for Approve outcomes
- `"needs-fix"` for Revise outcomes
- `"rejected"` for Reject outcomes

For Revise outcomes, also add `review_feedback_file` pointing to the feedback file:
```json
{
  "hero": {
    ...existing fields...,
    "review_status": "approved|needs-fix|rejected",
    "review_feedback_file": "REVIEW-FEEDBACK-[NAME].md"
  },
  "derivatives": [
    {
      ...existing fields...,
      "review_status": "approved|needs-fix|rejected",
      "review_feedback_file": "REVIEW-FEEDBACK-[NAME].md"
    }
  ]
}
```

Write the updated MANIFEST.json back to disk.

---

## Step 7: Update Campaign State

**Determine overall result:**
- `approved` -- all assets approved (no Revise, no Reject)
- `needs-fix` -- all non-rejected assets need fix
- `mixed` -- some approved, some need fix, some rejected

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.run_count ${RUN_NUMBER}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.overall_result "[approved|mixed|needs-fix]"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase reviewed
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.reviewed "$TIMESTAMP"
```

---

## Step 8: Display Completion and Next Steps (D-15)

```
takeToMarket > REVIEW COMPLETE

Run: ${RUN_NUMBER} | Date: ${ISO_DATE}
Assets reviewed: ${TOTAL}
  Approved: ${APPROVE_COUNT}
  Needs fix: ${REVISE_COUNT}
  Rejected: ${REJECT_COUNT}
```

**If any assets were rejected:**
```
Rejected assets logged. These will not enter the fix loop.
```

**If all assets approved:**
```
All assets approved! Run `/ttm-ship ${SLUG}` to launch.
```

**If any assets need fix (D-15):**
```
Run `/ttm-fix ${SLUG}` to fix ${REVISE_COUNT} asset(s) with review feedback.
```

Per D-15, the auto-trigger is an instruction to the user to run /ttm-fix next.
The review workflow completes here -- /ttm-fix is a separate command invoked
by the user (review.md is NOT forked and cannot directly invoke /ttm-fix).

**If mixed results (some approved, some need fix):**
```
${APPROVE_COUNT} asset(s) approved and ready for shipping.
${REVISE_COUNT} asset(s) need fixes. Run `/ttm-fix ${SLUG}` to address review feedback.
After fixes, approved + fixed assets can ship together via `/ttm-ship ${SLUG}`.
```

</process>

<success_criteria>
- [ ] All assets from MANIFEST.json presented with gate summary and content preview
- [ ] 4 mandatory review questions asked per asset (positioning, outcome, claims, differentiation)
- [ ] Hero reviewed first in full detail, then derivatives in batch (D-02)
- [ ] Per-asset outcome collected: Approve, Revise, or Reject (D-03, D-13)
- [ ] Structured revision feedback captured for Revise outcomes (D-12)
- [ ] REVIEW-FEEDBACK-[NAME].md written for each revised asset
- [ ] MANIFEST.json updated with review_status per asset (D-11)
- [ ] Campaign state updated: review.run_count, review.last_run, review.overall_result
- [ ] Campaign phase advanced to "reviewed"
- [ ] User directed to /ttm-fix for any revised assets (D-15)
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json` (updated with review_status per asset)
- `.marketing/CAMPAIGNS/${SLUG}/REVIEW-FEEDBACK-*.md` (one per revised asset)
</output>
