<purpose>
Verification workflow for /ttm-verify. Evaluates every produced asset against
10 base quality gates (per D-06) with structured PASS/WARN/FAIL output and
line-level feedback (per D-05). Runs in a separate context from produce via
context:fork (per LIFE-09, D-10). Tier 1 failures prompt for deviation action
(per D-04, D-09). Writes verification report and updates campaign state.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/base-gates.md
@${CLAUDE_PLUGIN_ROOT}/gates/gate-evaluation.md
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

If SLUG is empty, error: "Usage: /ttm-verify [campaign-slug]. Provide a campaign slug." Exit.

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

**Load Tier 2 (full content)** for gate evaluation:
- `.marketing/POSITIONING.md` (needed for GATE-01 Positioning Drift)
- `.marketing/BRAND.md` (needed for GATE-02 Claim Accuracy, GATE-03 Voice Drift)
- `.marketing/ICP.md` (needed for GATE-09 ICP Fit)
- `.marketing/COMPETITORS.md` (needed for GATE-08 Competitor Collision)
- `.marketing/CHANNELS.md` (needed for GATE-06 UTM Hygiene)

**Load campaign-specific files** (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md` (needed for GATE-04, GATE-05)

**Load MANIFEST.json:**
```bash
MANIFEST_PATH=".marketing/CAMPAIGNS/${SLUG}/MANIFEST.json"
```

Read `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json`. If the file does not exist, error:
"No production manifest found for campaign '${SLUG}'. Run /ttm-produce first."
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
- If phase is NOT `"produced"`: Warn the user:
  "Campaign is in phase '${PHASE}'. Expected 'produced' before verification.
  Running /ttm-verify now may produce incomplete results. Proceed?"
  Wait for user confirmation. If user declines, exit.

**Determine verify run number:**
Read `verify.run_count` from state. If null or 0, set `RUN_NUMBER=1`.
Otherwise set `RUN_NUMBER` to `verify.run_count + 1`.

---

## Step 3: Load Assets from Disk

```
takeToMarket > LOADING ASSETS
```

Parse MANIFEST.json to get the list of asset files. The manifest contains a `hero` object
and a `derivatives` array. Collect all asset file paths:

```
ASSETS = []
if manifest.hero:
    ASSETS.push({ name: manifest.hero.name, file: manifest.hero.file, type: manifest.hero.type })
for each derivative in manifest.derivatives:
    ASSETS.push({ name: derivative.name, file: derivative.file, type: derivative.type })
```

For each asset, read the file from `.marketing/CAMPAIGNS/${SLUG}/${asset.file}`.

If any asset file is missing from disk:
- Display warning: "Asset file not found: ${asset.file} -- skipping this asset"
- Remove it from the ASSETS list
- Continue with remaining assets

If ALL asset files are missing: Error: "No asset files found on disk. Re-run /ttm-produce."
Exit.

**CRITICAL:** Assets are loaded from DISK only. Never from produce context memory. This is
the self-evaluation bias prevention required by LIFE-09 and D-10. The context:fork in
SKILL.md ensures verify runs in a completely separate context from produce.

---

## Step 4: Evaluate Gates Per Asset

```
takeToMarket > EVALUATING QUALITY GATES
```

For each asset in ASSETS:
  For each of the 10 gates (in order from base-gates.md):

  1. **GATE-01: Positioning Drift** (Tier 1)
     - Load: `.marketing/POSITIONING.md` (already loaded in Tier 2)
     - Evaluate per gate-evaluation.md GATE-01 instructions
     - Record structured output: gate, tier, result, findings[]

  2. **GATE-02: Claim Accuracy** (Tier 1)
     - Load: `.marketing/BRAND.md` (already loaded in Tier 2)
     - Evaluate per gate-evaluation.md GATE-02 instructions
     - Record structured output

  3. **GATE-03: Voice Drift** (Tier 2)
     - Load: `.marketing/BRAND.md` voice archetype and banned words sections
     - Evaluate per gate-evaluation.md GATE-03 instructions
     - Record structured output

  4. **GATE-04: Outcome Alignment** (Tier 1)
     - Load: `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md` outcome metric section
     - Evaluate per gate-evaluation.md GATE-04 instructions
     - Record structured output

  5. **GATE-05: Funnel Integrity** (Tier 2)
     - Load: `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md` funnel/CTA section
     - Evaluate per gate-evaluation.md GATE-05 instructions
     - Record structured output

  6. **GATE-06: UTM Hygiene** (Tier 2)
     - Load: `.marketing/CHANNELS.md` UTM schema section
     - Evaluate per gate-evaluation.md GATE-06 instructions
     - Record structured output

  7. **GATE-07: Compliance** (Tier 2)
     - No specific reference file -- apply industry-standard requirements
     - Evaluate per gate-evaluation.md GATE-07 instructions
     - Record structured output

  8. **GATE-08: Competitor Collision** (Tier 2)
     - Load: `.marketing/COMPETITORS.md` (already loaded in Tier 2)
     - Evaluate per gate-evaluation.md GATE-08 instructions
     - Record structured output

  9. **GATE-09: ICP Fit** (Tier 2)
     - Load: `.marketing/ICP.md` (already loaded in Tier 2)
     - Evaluate per gate-evaluation.md GATE-09 instructions
     - Record structured output

  10. **GATE-10: Format Correctness** (Tier 2)
      - Load: channel-specific playbook if available (`${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`),
        otherwise apply general platform guidelines
      - Use asset type metadata from MANIFEST.json
      - Evaluate per gate-evaluation.md GATE-10 instructions
      - Record structured output

  After all 10 gates evaluated for this asset, aggregate:
  - Count total PASS, WARN, FAIL results
  - Record overall asset result: FAIL if any gate FAIL, WARN if any WARN (no FAIL), PASS if all PASS

**IMPORTANT per RESEARCH.md Pitfall 4:** Evaluate each gate SEPARATELY. Do not bundle
multiple gates into a single evaluation pass. Load gate-specific reference data for each
evaluation. This prevents shallow evaluation and ensures each gate gets full attention.

---

## Step 5: Build Summary Table

```
takeToMarket > BUILDING VERIFICATION REPORT
```

Construct the summary table following the templates/verification-report.md format:

```
## Verification Report: ${SLUG}

**Run:** ${RUN_NUMBER} | **Date:** ${ISO_DATE} | **Assets:** ${ASSET_COUNT}

| # | Gate | Tier | ${ASSET_1_NAME} | ${ASSET_2_NAME} | ... |
|---|------|------|-----------------|-----------------|-----|
| 1 | Positioning Drift (GATE-01) | T1 | [PASS|WARN|FAIL] | ... |
| 2 | Claim Accuracy (GATE-02) | T1 | [PASS|WARN|FAIL] | ... |
| 3 | Voice Drift (GATE-03) | T2 | [PASS|WARN|FAIL] | ... |
| 4 | Outcome Alignment (GATE-04) | T1 | [PASS|WARN|FAIL] | ... |
| 5 | Funnel Integrity (GATE-05) | T2 | [PASS|WARN|FAIL|N/A] | ... |
| 6 | UTM Hygiene (GATE-06) | T2 | [PASS|WARN|FAIL|N/A] | ... |
| 7 | Compliance (GATE-07) | T2 | [PASS|WARN|FAIL|N/A] | ... |
| 8 | Competitor Collision (GATE-08) | T2 | [PASS|WARN|FAIL] | ... |
| 9 | ICP Fit (GATE-09) | T2 | [PASS|WARN|FAIL] | ... |
| 10 | Format Correctness (GATE-10) | T2 | [PASS|WARN|FAIL] | ... |

**Result:** [FAIL_COUNT] FAIL (Tier 1), [WARN_COUNT] WARN -- [action required | all clear]
```

Display the summary table to the user.

Below the summary table, display drill-down detail for every WARN and FAIL finding
using the structured output format from gate-evaluation.md:

```
### [ASSET_NAME] -- [GATE_NAME] ([RESULT])

**Evidence:** "[exact quote from asset]" (section reference)
**Reference:** "[quote from reference file]"
**Recommendation:** [specific change to resolve]
```

---

## Step 6: Handle Tier 1 Deviations

For each Tier 1 gate (GATE-01, GATE-02, GATE-04) that returned WARN or FAIL on any asset:

Display the detailed finding (evidence + reference + recommendation).

Present 3 options using AskUserQuestion (or text-mode numbered list):

```
Gate [name] returned [WARN|FAIL] for [asset]:

[Finding detail with evidence and reference]

Choose an action:
1. Correct -- Record this for /ttm-fix to address
2. Accept+log -- Document exception and proceed
3. Escalate -- Launch /ttm-positioning-shift
```

**Process user's choice:**

### Option 1: Correct

Record the finding as needing fix. Update campaign state:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.[gate_field] "fix_needed"
```

Display: "Recorded for /ttm-fix. Continue verifying remaining gates."
Verification continues -- does not pause for Correct.

### Option 2: Accept+log

Prompt for justification using AskUserQuestion (or text-mode prompt):
```
Why are you accepting this deviation? (This will be logged to DEVIATIONS.md)
```

Record the deviation using the deterministic CLI:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" deviation append \
  --slug "${SLUG}" \
  --gate "[gate name]" \
  --gate-id "[GATE-XX]" \
  --tier [1|2] \
  --result "[WARN|FAIL]" \
  --asset "[asset file path]" \
  --finding "[exact finding text]" \
  --action "Accept+log" \
  --justification "[user's justification]" \
  --run ${RUN_NUMBER}
```

Also update STATE.md gate field:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.[gate_field] "accepted"
```

Display: "Deviation logged to DEVIATIONS.md. Proceeding."

**IMPORTANT:** ALWAYS use `ttm-tools.cjs deviation append` for DEVIATIONS.md writes.
Never write to DEVIATIONS.md directly. This ensures consistent formatting across runs
(per RESEARCH.md Pitfall 6).

### Option 3: Escalate

Record the escalation in campaign state before exiting:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.overall_result "escalated"
```

Display: "Launching /ttm-positioning-shift. Verification paused. After positioning
is resolved, re-run /ttm-verify ${SLUG}."

Stop verification immediately (per D-08). Do not evaluate remaining gates or assets.
Exit the workflow.

---

## Step 7: Display Tier 2 Findings

For each Tier 2 gate (GATE-03, GATE-05 through GATE-10) that returned WARN or FAIL:

Display as advisory:
```
[Advisory] Gate [name] ([GATE-XX]): [finding summary]
Recommendation: [recommendation from finding]
```

No action required for Tier 2 findings. User may optionally request action on any
Tier 2 finding, in which case apply the same Correct/Accept+log/Escalate flow
from Step 6.

---

## Step 8: Write Verification Report

Write VERIFICATION.md to `.marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md`.

Use the templates/verification-report.md format. Include:
- YAML frontmatter: campaign slug, run number, date, total assets, overall result
- Summary table (gate x asset matrix from Step 5)
- Detail findings for every WARN and FAIL (evidence, reference, recommendation)
- Actions taken (Correct, Accept+log, or Escalate per finding)
- Run metadata: verify command, manifest path, gate definitions path, previous run count

If VERIFICATION.md already exists from a prior run, overwrite it. The verification
report reflects the current state, not history. DEVIATIONS.md is the append-only
historical record.

---

## Step 9: Update Campaign State and Summary

**Update all 10 gate result fields:**
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.positioning_drift [pass|warn|fail|fix_needed|accepted]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.claim_accuracy [pass|warn|fail|fix_needed|accepted]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.voice_drift [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.outcome_alignment [pass|warn|fail|fix_needed|accepted]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.funnel_integrity [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.utm_hygiene [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.compliance [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.competitor_collision [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.icp_fit [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.format_correctness [pass|warn|fail]
```

For each gate, use the worst result across all assets. If user chose Correct, use
"fix_needed". If user chose Accept+log, use "accepted".

**Update verification metadata:**
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.run_count ${RUN_NUMBER}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.overall_result [pass|accepted|warn|fail]
```

**Overall result logic:**
- `pass` -- all gates PASS across all assets
- `accepted` -- one or more Tier 1 FAILs exist but ALL were Accept+logged (deviation documented, no outstanding action)
- `warn` -- any gate WARN but no unresolved FAIL
- `fail` -- any Tier 1 FAIL exists that was marked Correct (fix_needed) or is otherwise unresolved

**Update campaign phase** (only if no Escalate was triggered):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase verified
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.verified "$TIMESTAMP"
```

If Escalate was triggered in Step 6, do NOT update the phase. The campaign remains
in "produced" state until positioning is resolved and verify is re-run.

**Display completion banner:**
```
takeToMarket > VERIFICATION COMPLETE

Run: ${RUN_NUMBER} | Result: [PASS/WARN/FAIL]
Assets verified: ${ASSET_COUNT}
Tier 1 failures: [count] ([count] corrected, [count] accepted, [count] escalated)
Tier 2 advisories: [count]

Report: .marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md
Deviations: .marketing/CAMPAIGNS/${SLUG}/DEVIATIONS.md

Next: Run /ttm-review ${SLUG} to conduct human review
```

</process>

<success_criteria>
- [ ] All assets from MANIFEST.json evaluated against all 10 gates
- [ ] Summary table displayed with PASS/WARN/FAIL per gate per asset
- [ ] Tier 1 failures prompted for Correct/Accept+log/Escalate
- [ ] Accept+log deviations recorded in DEVIATIONS.md via ttm-tools.cjs CLI and STATE.md
- [ ] VERIFICATION.md written with full report (summary table + detail findings)
- [ ] Campaign STATE.md updated with all gate results and verification metadata
- [ ] Verify context never accessed produce's internal reasoning (file-based asset loading only)
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md` (verification report -- overwritten per run)
- `.marketing/CAMPAIGNS/${SLUG}/DEVIATIONS.md` (deviation log -- append-only, created on first Accept+log)
</output>
