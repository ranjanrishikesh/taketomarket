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

If SLUG is empty, error: "Usage: /ttm-verify [campaign-slug]. Provide a campaign slug." Exit.

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

**Load Tier 2 (full content)** for gate evaluation:
- `.taketomarket/POSITIONING.md` (needed for GATE-01 Positioning Drift)
- `.taketomarket/BRAND.md` (needed for GATE-02 Claim Accuracy, GATE-03 Voice Drift)
- `.taketomarket/ICP.md` (needed for GATE-09 ICP Fit)
- `.taketomarket/COMPETITORS.md` (needed for GATE-08 Competitor Collision)
- `.taketomarket/CHANNELS.md` (needed for GATE-06 UTM Hygiene)

**Load campaign-specific files** (always full-load per context-loading.md rule 4):
- `.taketomarket/CAMPAIGNS/${SLUG}/STATE.md`
- `.taketomarket/CAMPAIGNS/${SLUG}/BRIEF.md` (needed for GATE-04, GATE-05)

**Load MANIFEST.json:**
```bash
MANIFEST_PATH=".taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json"
```

Read `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json`. If the file does not exist, error:
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

For each asset, read the file from `.taketomarket/CAMPAIGNS/${SLUG}/${asset.file}`.

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

## Step 4a: Apply Base Gate Overrides

For each asset in ASSETS:

1. Check if the asset's playbook was loaded (from MANIFEST.json `playbook` field)
2. If playbook is "none", skip -- all base gates keep default tiers
3. If playbook exists, read `## Base Gate Overrides` from `${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`
4. Parse the override table: record each base gate ID and its override tier
5. Adjust tier classification for overridden gates for this asset's evaluation
6. If section reads "None -- all base gates keep default tiers", no adjustments needed

**IMPORTANT:** Overrides MUST be applied BEFORE Step 4 base gate evaluation so that
overridden gates (e.g., GATE-10 to Tier 1 for SEO) use correct deviation handling.

---

## Step 4: Evaluate Gates Per Asset

```
takeToMarket > EVALUATING QUALITY GATES
```

For each asset in ASSETS:
  Using the effective tiers from Step 4a (defaults if no overrides):
  For each of the 10 gates (in order from base-gates.md):

  Evaluate each gate per gate-evaluation.md instructions. Record structured output per gate: gate, tier, result, findings[].

  | # | Gate | Tier | Reference Data |
  |---|------|------|----------------|
  | 1 | GATE-01: Positioning Drift | T1 | POSITIONING.md |
  | 2 | GATE-02: Claim Accuracy | T1 | BRAND.md |
  | 3 | GATE-03: Voice Drift | T2 | BRAND.md (voice archetype + banned words) |
  | 4 | GATE-04: Outcome Alignment | T1 | CAMPAIGNS/${SLUG}/BRIEF.md (outcome metric) |
  | 5 | GATE-05: Funnel Integrity | T2 | CAMPAIGNS/${SLUG}/BRIEF.md (funnel/CTA) |
  | 6 | GATE-06: UTM Hygiene | T2 | CHANNELS.md (UTM schema) |
  | 7 | GATE-07: Compliance | T2 | Industry-standard requirements |
  | 8 | GATE-08: Competitor Collision | T2 | COMPETITORS.md |
  | 9 | GATE-09: ICP Fit | T2 | ICP.md |
  | 10 | GATE-10: Format Correctness | T2 | Playbook or general platform guidelines |

  After all 10 gates evaluated for this asset, aggregate:
  - Count total PASS, WARN, FAIL results
  - Record overall asset result: FAIL if any gate FAIL, WARN if any WARN (no FAIL), PASS if all PASS

**IMPORTANT per RESEARCH.md Pitfall 4:** Evaluate each gate SEPARATELY. Do not bundle
multiple gates into a single evaluation pass. Load gate-specific reference data for each
evaluation. This prevents shallow evaluation and ensures each gate gets full attention.

---

## Step 4b: Evaluate Discipline Gates

For each asset in ASSETS:

1. Check if the asset's playbook was loaded (from MANIFEST.json `playbook` field)
2. If playbook is "none": display "No discipline playbook -- base gates only" and skip
3. If playbook exists, read `## Discipline Gates` section from the loaded playbook
4. Parse each `### DISC-*` subsection as a gate definition
5. For each discipline gate: evaluate using gate-evaluation.md structured output format,
   using the tier from the gate definition. Record gate ID, tier, result, findings[]
6. Append discipline gate results to the asset's gate results array
7. Update the asset's aggregate to include discipline gate outcomes

Same rules as base gates: evaluate each discipline gate SEPARATELY.

---

## Step 4c: Evaluate Meta-Gates

Meta-gates evaluate portfolio-level concerns across all active campaigns. All 4 meta-gates
are **Tier 2 advisory** -- they produce findings in the report but do NOT block verification.

Load detailed evaluation instructions:
@${CLAUDE_PLUGIN_ROOT}/references/meta-gate-evaluation.md

1. Fetch all campaign data:
   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --raw
   ```
2. Include the current campaign (${SLUG}) in the evaluation even if not yet in "active" list
3. Read `.taketomarket/CALENDAR.md` for quarterly theme and launch dates
4. Evaluate each meta-gate per the criteria in meta-gate-evaluation.md:
   - META-01: Portfolio Balance (funnel stage + channel diversity)
   - META-02: Calendar Collision (launch date overlap + audience collision)
   - META-03: Theme Consistency (quarterly theme alignment)
   - META-04: Learning Plan (measurement plan + testable hypothesis)
5. Record each result as: { gate_id: "META-XX", tier: 2, result: PASS|WARN|FAIL, findings: [] }
6. Append meta-gate results to a separate PORTFOLIO_RESULTS array (not mixed with per-asset gates)

Meta-gate results are displayed in a separate section of the verification report, after the
per-asset summary table.

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
| 11 | DISC-{DISC}-01: {Name} | T{n} | [PASS|WARN|FAIL] | [N/A] |
| .. | ... | ... | ... | ... |

Discipline gate rows appear after base gates. Show N/A for assets without a matching playbook.

**Result:** [FAIL_COUNT] FAIL (Tier 1), [WARN_COUNT] WARN -- [action required | all clear]
```

Display the summary table to the user.

If PORTFOLIO_RESULTS is not empty, add a portfolio-level section after the per-asset table:

### Portfolio Assessment (Tier 2 Advisory)

| Meta-Gate | Result | Finding |
|-----------|--------|---------|
| META-01: Portfolio Balance | [PASS|WARN|FAIL] | [one-line finding] |
| META-02: Calendar Collision | [PASS|WARN|FAIL] | [one-line finding] |
| META-03: Theme Consistency | [PASS|WARN|FAIL] | [one-line finding] |
| META-04: Learning Plan | [PASS|WARN|FAIL] | [one-line finding] |

> These are advisory findings. No action is required to proceed with verification.

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

**Note:** Meta-gates are Tier 2 advisory and are NOT included in Tier 1 deviation handling.

For each Tier 1 gate (base or discipline, including overridden) that returned WARN or FAIL on any asset:

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
  --run "${RUN_NUMBER}"
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

For each Tier 2 gate (base or discipline, excluding overridden-to-Tier-1) that returned WARN or FAIL:

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

Write VERIFICATION.md to `.taketomarket/CAMPAIGNS/${SLUG}/VERIFICATION.md`.

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

**Discipline gates:** DISC-* results appear in the report/table but have no individual
state fields. A Tier 1 discipline gate FAIL counts toward the overall result.

**Update verification metadata:**
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.run_count "${RUN_NUMBER}"
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

Report: .taketomarket/CAMPAIGNS/${SLUG}/VERIFICATION.md
Deviations: .taketomarket/CAMPAIGNS/${SLUG}/DEVIATIONS.md

Next: Run /ttm-review ${SLUG} to conduct human review
```

</process>

<success_criteria>
- [ ] All assets from MANIFEST.json evaluated against all 10 base gates plus discipline gates from playbooks
- [ ] Summary table displayed with PASS/WARN/FAIL per gate (base + discipline) per asset
- [ ] Tier 1 failures prompted for Correct/Accept+log/Escalate
- [ ] Accept+log deviations recorded in DEVIATIONS.md via ttm-tools.cjs CLI and STATE.md
- [ ] VERIFICATION.md written with full report (summary table + detail findings)
- [ ] Campaign STATE.md updated with all gate results and verification metadata
- [ ] Verify context never accessed produce's internal reasoning (file-based asset loading only)
- [ ] Meta-gates evaluated against portfolio data (campaign list --raw)
- [ ] Meta-gate results are Tier 2 advisory (not blocking)
- [ ] Portfolio Assessment section included in verification report
</success_criteria>

<output>
- `.taketomarket/CAMPAIGNS/${SLUG}/VERIFICATION.md` (verification report -- overwritten per run)
- `.taketomarket/CAMPAIGNS/${SLUG}/DEVIATIONS.md` (deviation log -- append-only, created on first Accept+log)
</output>
