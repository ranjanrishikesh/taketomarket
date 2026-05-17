<purpose>
Fix workflow for /ttm-fix. Performs root cause analysis on assets marked
"needs-fix" during review, generates targeted fix briefs, re-produces in
isolated Task() context, re-verifies against all 10 gates (D-06), shows
results at each iteration (D-07), and caps at 3 attempts with escalation (D-08, LIFE-12).
Auto-approves to ship-ready on successful fix (D-14).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/base-gates.md
@${CLAUDE_PLUGIN_ROOT}/gates/gate-evaluation.md
@${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

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

If SLUG is empty, error: "Usage: /ttm-fix [campaign-slug]. Provide a campaign slug." Exit.

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

**Load Tier 2 (full content)** for gate evaluation (same as verify per context-loading.md):
- `.taketomarket/POSITIONING.md` (needed for GATE-01 Positioning Drift)
- `.taketomarket/BRAND.md` (needed for GATE-02 Claim Accuracy, GATE-03 Voice Drift)
- `.taketomarket/ICP.md` (needed for GATE-09 ICP Fit)
- `.taketomarket/COMPETITORS.md` (needed for GATE-08 Competitor Collision)
- `.taketomarket/CHANNELS.md` (needed for GATE-06 UTM Hygiene)

**Load campaign-specific files** (always full-load per context-loading.md rule 4):
- `.taketomarket/CAMPAIGNS/${SLUG}/STATE.md`
- `.taketomarket/CAMPAIGNS/${SLUG}/BRIEF.md`

**Load MANIFEST.json:**
Read `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json`. If the file does not exist, error:
"No production manifest found for campaign '${SLUG}'. Run /ttm-produce first." Exit.

**Load VERIFICATION.md:**
Read `.taketomarket/CAMPAIGNS/${SLUG}/VERIFICATION.md`. If the file does not exist, error:
"No verification report found for campaign '${SLUG}'. Run /ttm-verify first." Exit.

**Load LEARNINGS.md Tier 2** (for root-cause taxonomy categories):
- `.taketomarket/LEARNINGS.md` (full content -- needed for root-cause category matching)

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
- If phase is NOT `"reviewed"`: Warn the user:
  "Campaign is in phase '${PHASE}'. Expected 'reviewed' before fix.
  Run /ttm-review first."
  Exit.

**Determine fix run number:**
Read `fix.run_count` from state. If null or 0, set `RUN_NUMBER=1`.
Otherwise set `RUN_NUMBER` to `fix.run_count + 1`.

---

## Step 3: Identify Assets Needing Fix

```
takeToMarket > IDENTIFYING ASSETS
```

Parse MANIFEST.json for assets where `review_status == "needs-fix"`.

Collect from both `hero` and `derivatives` entries. For each matching asset, record:
- `asset_id`, `name`, `file`, `type`, `channel`, `playbook`
- Load its review feedback file: `.taketomarket/CAMPAIGNS/${SLUG}/REVIEW-FEEDBACK-${NAME}.md`
  If the feedback file does not exist, log warning and use VERIFICATION.md failures only.

If no assets need fix:
"No assets need fixing. All assets are either approved or rejected. Run /ttm-ship to proceed."
Exit.

Display summary:
```
takeToMarket > FIX LOOP

Assets needing fix: ${COUNT}
- [ASSET_NAME_1] (severity from review feedback)
- [ASSET_NAME_2] (severity from review feedback)
```

---

## Step 4: Initialize Fix Log

Check if FIX-LOG.md exists in campaign directory:
`.taketomarket/CAMPAIGNS/${SLUG}/FIX-LOG.md`

If not, create it from `${CLAUDE_PLUGIN_ROOT}/templates/fix-log.md` template:
- Replace `[SLUG]` with campaign slug
- Replace `[ISO_TIMESTAMP]` with current timestamp

If FIX-LOG.md already exists, read it to determine prior attempt counts per asset.
Parse existing entries to find the highest attempt number for each asset.

---

## Step 5: Fix Loop Per Asset

For each asset with `review_status == "needs-fix"`:

Initialize `attempt_count` from prior attempts in FIX-LOG.md (0 if no prior attempts).

**WHILE attempt_count < 3 AND asset_status == "needs-fix":**

  Increment `attempt_count`.

  ### 5a. Root Cause Analysis (D-05)

  Load: review feedback file + VERIFICATION.md failures for this asset + BRIEF.md.
  Analyze against LEARNINGS.md root-cause taxonomy. Propose one of these 7 categories:
  - `positioning-drift` -- Asset contradicts or extends beyond POSITIONING.md
  - `weak-hook` -- Opening/hook does not grab ICP attention
  - `wrong-channel` -- Content format mismatched for target channel
  - `bad-timing` -- References or angles are dated or poorly timed
  - `unverifiable-claim` -- Contains claims not in approved proof points
  - `broken-funnel` -- CTA, conversion path, or next-step is missing/broken
  - `creative-fatigue` -- Content is generic, template-like, or lacks originality

  Present to user via AskUserQuestion (or text-mode):
  ```
  Proposed root cause for [ASSET_NAME]: [CATEGORY]
  Explanation: [Why this root cause fits based on review feedback and gate failures]

  1. Confirm -- proceed with this root cause
  2. Correct -- select a different root cause
  ```
  If user selects "Correct", present numbered list of all 7 categories and let them choose.

  ### 5b. Generate Fix Brief

  Read template from `${CLAUDE_PLUGIN_ROOT}/templates/fix-brief.md`.
  Fill all placeholders:
  - `[SLUG]` -> campaign slug
  - `[ASSET_NAME]` -> asset name from manifest
  - `[ATTEMPT_NUMBER]` -> current attempt (1, 2, or 3)
  - `[ROOT_CAUSE_CATEGORY]` -> confirmed root cause category
  - `[ROOT_CAUSE_EXPLANATION]` -> explanation text
  - `[BRIEF_PATH]` -> `.taketomarket/CAMPAIGNS/${SLUG}/BRIEF.md`
  - `[FAILURE_LIST]` -> extract all WARN/FAIL findings for this asset from VERIFICATION.md,
    plus review feedback items from REVIEW-FEEDBACK-${NAME}.md
  - `[PASSING_LIST]` -> extract all PASS findings for this asset from VERIFICATION.md
    (per RESEARCH Pitfall 3: these are preservation constraints -- the producer MUST NOT break these)
  - `[CORRECTIONS_LIST]` -> derive specific corrections from root cause + review feedback
  - `[ISO_TIMESTAMP]` -> current timestamp

  Write fix brief to: `.taketomarket/CAMPAIGNS/${SLUG}/FIX-BRIEF-${ASSET_ID}-attempt-${N}.md`

  ### 5c. Re-Produce Asset (Task() subagent)

  Read agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.
  Fill placeholders -- **CRITICAL: use the FIX BRIEF path as `[BRIEF_PATH]`**, NOT the
  original BRIEF.md:
  - `[BRIEF_PATH]` -> `.taketomarket/CAMPAIGNS/${SLUG}/FIX-BRIEF-${ASSET_ID}-attempt-${N}.md`
  - `[POSITIONING_PATH]` -> `.taketomarket/POSITIONING.md`
  - `[BRAND_PATH]` -> `.taketomarket/BRAND.md`
  - `[ICP_PATH]` -> `.taketomarket/ICP.md`
  - `[PLAYBOOK_PATH]` -> playbook path from MANIFEST.json or `"none"`
  - `[OUTPUT_PATH]` -> `.taketomarket/CAMPAIGNS/${SLUG}/${ASSET_FILE}` (overwrite failing version)
  - `[ASSET_TYPE]` -> from MANIFEST.json
  - `[CHANNEL]` -> from MANIFEST.json
  - `[HERO_PATH]` -> hero asset path if this is a derivative, else `"none"`

  Call Task() with populated prompt. Wait for completion.

  Verify the re-produced file exists and has content:
  ```bash
  test -s ".taketomarket/CAMPAIGNS/${SLUG}/${ASSET_FILE}"
  ```
  If file missing/empty: log as failed attempt in FIX-LOG.md, continue loop.

  ### 5d. Re-Verify Against All 10 Gates (D-06)

  Follow the gate evaluation pattern from verify.md Step 4. For THIS SINGLE ASSET only:

  For each of the 10 gates (in order from base-gates.md):
  1. Load the gate-specific reference data (same as verify.md)
  2. Evaluate per gate-evaluation.md instructions
  3. Record structured output: gate, tier, result, findings[]

  Aggregate results for this asset: PASS/WARN/FAIL per gate.

  **IMPORTANT:** Evaluate each gate SEPARATELY. Do not bundle multiple gates into a
  single evaluation pass. Load gate-specific reference data for each evaluation.

  ### 5e. Present Result to User (D-07)

  Capture the "before" results from the original VERIFICATION.md for this asset.
  Display gate summary table for this attempt:
  ```
  takeToMarket > FIX ATTEMPT ${N}/3: [ASSET_NAME]

  Root cause: [CATEGORY]

  | Gate | Before | After |
  |------|--------|-------|
  | Positioning Drift (GATE-01) | [BEFORE] | [AFTER] |
  | Claim Accuracy (GATE-02) | [BEFORE] | [AFTER] |
  | Voice Drift (GATE-03) | [BEFORE] | [AFTER] |
  | Outcome Alignment (GATE-04) | [BEFORE] | [AFTER] |
  | Funnel Integrity (GATE-05) | [BEFORE] | [AFTER] |
  | UTM Hygiene (GATE-06) | [BEFORE] | [AFTER] |
  | Compliance (GATE-07) | [BEFORE] | [AFTER] |
  | Competitor Collision (GATE-08) | [BEFORE] | [AFTER] |
  | ICP Fit (GATE-09) | [BEFORE] | [AFTER] |
  | Format Correctness (GATE-10) | [BEFORE] | [AFTER] |
  ```

  **Determine fix result:**

  - If ALL gates PASS (or only Tier 2 WARNs with no FAILs):
    Fix successful.
    ```
    Fix successful! Auto-approving [ASSET_NAME] to ship-ready. (D-14)
    ```
    Set `asset_status` = `"ship-ready"`. Break loop.

  - If any Tier 1 gates FAIL:
    Fix attempt failed. If `attempt_count < 3`:
    Present to user via AskUserQuestion (or text-mode):
    ```
    Attempt ${N}/3 still has failures:
    [List of remaining FAIL findings]

    1. Continue fixing -- try again with adjusted approach
    2. Approve anyway -- accept current state and mark ship-ready
    3. Adjust feedback -- provide new specific feedback for next attempt
    ```
    - "Continue fixing": loop continues with next attempt
    - "Approve anyway": set `asset_status` = `"ship-ready"`, break loop
    - "Adjust feedback": collect new freeform feedback via AskUserQuestion,
      append to review feedback file, loop continues with next attempt

  ### 5f. Log Attempt to FIX-LOG.md

  Append to `.taketomarket/CAMPAIGNS/${SLUG}/FIX-LOG.md`:
  ```markdown
  ## Asset: [ASSET_NAME]

  ### Attempt [N]
  - **Date:** [ISO_TIMESTAMP]
  - **Root cause:** [CATEGORY] -- [EXPLANATION]
  - **Fix brief:** FIX-BRIEF-[ASSET_ID]-attempt-[N].md
  - **Gate results after fix:**
    | Gate | Before | After |
    |------|--------|-------|
    | [GATE_NAME] | [BEFORE] | [AFTER] |
    | ... |
  - **Outcome:** [passed | failed -- reason | approved-by-user]
  ```

**END WHILE**

---

## Step 6: Handle 3-Attempt Escalation (D-08, LIFE-12)

If `attempt_count == 3` AND asset still has gate failures (asset_status still "needs-fix"):

```
takeToMarket > ESCALATION: [ASSET_NAME]

3 fix attempts exhausted. Presenting attempt history:
```

Read FIX-LOG.md entries for this asset. Display all 3 attempts:

```
### Attempt 1
Root cause: [CATEGORY]
Gate results: [summary -- N PASS / N WARN / N FAIL]
Fix brief: FIX-BRIEF-[ASSET_ID]-attempt-1.md

### Attempt 2
Root cause: [CATEGORY]
Gate results: [summary]
Fix brief: FIX-BRIEF-[ASSET_ID]-attempt-2.md

### Attempt 3
Root cause: [CATEGORY]
Gate results: [summary]
Fix brief: FIX-BRIEF-[ASSET_ID]-attempt-3.md

### Failure Pattern Analysis
[AI analysis of what consistently failed across all 3 attempts -- identify the
recurring gates, whether the same root cause persists, and any oscillation patterns]

### Suggested Manual Edits
Based on the pattern of failures:
1. [Specific edit suggestion with file location and what to change]
2. [Specific edit suggestion]

Asset status: needs-human-fix
You can manually edit the file and re-run /ttm-verify ${SLUG}
```

Set asset `review_status` to `"needs-human-fix"` in memory.

---

## Step 7: Update MANIFEST.json

Read MANIFEST.json from `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json`.

Update `review_status` for each processed asset:
- `"ship-ready"` if fix succeeded or user approved anyway
- `"needs-human-fix"` if 3-attempt cap reached without resolution

Also add `fix_attempts` count per asset:
```json
{
  "hero": {
    ...existing fields...,
    "review_status": "ship-ready|needs-human-fix",
    "fix_attempts": 2
  },
  "derivatives": [
    {
      ...existing fields...,
      "review_status": "ship-ready|needs-human-fix",
      "fix_attempts": 3
    }
  ]
}
```

Write updated MANIFEST.json back to disk.

---

## Step 8: Update VERIFICATION.md

After the final re-verification of each asset, update VERIFICATION.md with the latest
gate results. Overwrite the file with the new results (same pattern as verify.md Step 8).

Use the templates/verification-report.md format. Include results from the most recent
re-verification run for fixed assets. Assets not processed by fix retain their original
verification results.

---

## Step 9: Update Campaign State

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" fix.run_count "${RUN_NUMBER}"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" fix.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" fix.overall_result "[all-fixed|partial|escalated]"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase fixed
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.fixed "$TIMESTAMP"
```

**fix.overall_result logic:**
- `all-fixed` -- all needs-fix assets now ship-ready (including user "approve anyway")
- `partial` -- some fixed, some still need human fix
- `escalated` -- all needs-fix assets hit the 3-attempt cap

Also update gate fields in STATE.md with latest verification results for fixed assets
(same pattern as verify.md Step 9):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.positioning_drift [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.claim_accuracy [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.voice_drift [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.outcome_alignment [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.funnel_integrity [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.utm_hygiene [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.compliance [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.competitor_collision [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.icp_fit [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.format_correctness [pass|warn|fail]
```

For each gate, use the worst result across all assets (including both fixed and non-fixed).

---

## Step 10: Display Completion

```
takeToMarket > FIX COMPLETE

Run: ${RUN_NUMBER}
Assets processed: ${TOTAL}
  Fixed (ship-ready): ${FIXED_COUNT}
  Needs human fix: ${ESCALATED_COUNT}

Fix log: .taketomarket/CAMPAIGNS/${SLUG}/FIX-LOG.md
```

**If any ship-ready assets:**
```
Next: Run /ttm-ship ${SLUG} to launch approved assets
```

**If any needs-human-fix assets:**
```
Edit the flagged files manually, then run /ttm-verify ${SLUG} to re-check
```

</process>

<success_criteria>
- [ ] All needs-fix assets from MANIFEST.json processed through fix loop
- [ ] Root cause proposed from 7-category taxonomy with user confirmation (D-05)
- [ ] Fix brief generated per attempt with failure list, preservation constraints, and corrections
- [ ] Task() re-production uses fix brief path (NOT original brief) as [BRIEF_PATH]
- [ ] All 10 gates re-run after each fix per gate-evaluation.md (D-06)
- [ ] Results shown to user per iteration with before/after comparison (D-07)
- [ ] Auto-approve to ship-ready on all gates passing (D-14)
- [ ] 3-attempt cap enforced with escalation display (D-08, LIFE-12)
- [ ] FIX-LOG.md records every attempt with root cause, fix brief, and gate results
- [ ] MANIFEST.json updated with review_status and fix_attempts per asset
- [ ] Campaign STATE.md updated with fix.run_count, fix.last_run, fix.overall_result
- [ ] VERIFICATION.md updated with latest gate results after fix
</success_criteria>

<output>
- `.taketomarket/CAMPAIGNS/${SLUG}/FIX-LOG.md` (fix attempt history -- append-only)
- `.taketomarket/CAMPAIGNS/${SLUG}/FIX-BRIEF-*-attempt-*.md` (fix briefs per attempt -- persistent)
- `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json` (updated with fix results per asset)
- `.taketomarket/CAMPAIGNS/${SLUG}/VERIFICATION.md` (updated with latest gate results)
</output>
