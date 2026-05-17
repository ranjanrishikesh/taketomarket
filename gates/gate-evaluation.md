# Gate Evaluation Reference

## Usage

Referenced by `workflows/lifecycle/verify.md` via @-syntax.
Applied to each asset during verification. Each gate is evaluated independently
with its specific reference data loaded.

**Key rules:**
- Evaluate gates one at a time, not all bundled in a single prompt (prevents shallow evaluation)
- Load the gate's reference file(s) for each evaluation
- Use the structured output format below for every finding
- Soft fail on all gates -- report results, never block (per D-04)

---

## Structured Output Format

Every gate evaluation MUST produce output in this exact format:

### Gate Result

- **Gate:** [Gate Name] (GATE-XX)
- **Tier:** [1|2]
- **Result:** [PASS|WARN|FAIL]
- **Summary:** [One-sentence summary of the finding]

### Findings

For each check within the gate:

**Check: [check name]**
- **Result:** PASS | WARN | FAIL
- **Evidence:** "[exact quote from the asset that triggered this finding]" (line/section reference)
- **Reference:** "[quote from the reference file being compared against]"
- **Recommendation:** [what to change if WARN or FAIL; "None" if PASS]

If a check is N/A (e.g., UTM hygiene for an asset without links), record:
- **Result:** N/A
- **Evidence:** "Not applicable -- [reason]"
- **Reference:** N/A
- **Recommendation:** None

### Aggregation Rule

- If ALL checks PASS: gate result = PASS
- If ANY check is WARN and none FAIL: gate result = WARN
- If ANY check is FAIL: gate result = FAIL
- N/A checks are excluded from aggregation

---

## Per-Gate Evaluation Instructions

### Evaluating GATE-01: Positioning Drift

**Load:** `.taketomarket/POSITIONING.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the asset restate or naturally extend the primary differentiator from POSITIONING.md? Or does it introduce a different claim?
2. Are all factual claims in the asset backed by proof points in the POSITIONING.md proof point library?
3. Does the asset contain any terms from the POSITIONING.md must-not-say list?

**Tier:** 1
**On failure:** Prompt user for Correct / Accept+log / Escalate

---

### Evaluating GATE-02: Claim Accuracy

**Load:** `.taketomarket/BRAND.md` (Tier 2 full -- proof points section)
**Asset content:** Full asset text

**Evaluate:**
1. For every factual or numeric claim in the asset, find the matching proof point in BRAND.md. If none exists, record FAIL.
2. Where proof points are used, is the source cited or at least implied? Record WARN if implied only, FAIL if no attribution.
3. Check each proof point used against BRAND.md for deprecation or expiration markers.

**Tier:** 1
**On failure:** Prompt user for Correct / Accept+log / Escalate

---

### Evaluating GATE-03: Voice Drift

**Load:** `.taketomarket/BRAND.md` (Tier 2 full -- voice archetype and banned words sections)
**Asset content:** Full asset text

**Evaluate:**
1. Read the voice archetype description in BRAND.md. Does the asset's overall tone match? Flag sections that diverge.
2. Scan the asset for every word in the BRAND.md banned words list. Any match is a FAIL.
3. Read the asset start to end. Does the language register stay consistent, or does it shift between formal and casual?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-04: Outcome Alignment

**Load:** `.taketomarket/CAMPAIGNS/<slug>/BRIEF.md` (outcome metric section)
**Asset content:** Full asset text

**Evaluate:**
1. What is the outcome metric in the brief? Does this asset drive that metric, or does it only produce output (impressions, clicks) without a path to the outcome?
2. Does the CTA or desired reader action serve the outcome metric directly, or does it target a tangential goal?

**Tier:** 1
**On failure:** Prompt user for Correct / Accept+log / Escalate

---

### Evaluating GATE-05: Funnel Integrity

**Load:** `.taketomarket/CAMPAIGNS/<slug>/BRIEF.md` (funnel/CTA section)
**Asset content:** Full asset text

**Evaluate:**
1. Is a CTA present? Is it specific (e.g., "Start your free trial") rather than generic ("Learn more")? If the asset type does not require a CTA, mark N/A.
2. Is the CTA destination defined (URL, landing page, next step)? Is it a dead end?
3. Trace the path from CTA to outcome. Is it logical and unbroken, or are there gaps or unnecessary friction?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-06: UTM Hygiene

**Load:** `.taketomarket/CHANNELS.md` (UTM schema section)
**Asset content:** Full asset text

**Evaluate:**
1. Find all trackable links in the asset. Do they have UTM parameters (source, medium, campaign)? If no links exist, mark all checks N/A.
2. Do UTM source and medium values match the naming conventions in CHANNELS.md?
3. Does the UTM campaign tag match the campaign slug?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-07: Compliance

**Load:** No specific reference file -- apply industry-standard requirements
**Asset content:** Full asset text + channel context

**Evaluate:**
1. Based on the asset content, are disclaimers required (financial advice, health claims, affiliate disclosure, sponsorship)? If required, are they present? If not required, mark N/A.
2. Scan the asset for PII patterns (email addresses, phone numbers, personal names of non-public figures).
3. For email, SMS, or push notification assets: is an unsubscribe/opt-out mechanism referenced? For other channels, mark N/A.

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-08: Competitor Collision

**Load:** `.taketomarket/COMPETITORS.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the asset mention any competitor brand names from COMPETITORS.md? If so, are the mentions accompanied by substantiated comparative claims?
2. Compare the asset's framing and key phrases against competitor positioning and taglines listed in COMPETITORS.md. Flag overlaps.
3. Does the asset differentiate from competitors, or does it inadvertently validate a competitor's approach or market framing?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-09: ICP Fit

**Load:** `.taketomarket/ICP.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the hook or core message address a specific pain point from ICP.md pains list?
2. Does the asset use vocabulary from ICP.md's language library, or does it use internal jargon the ICP would not recognize?
3. Is the content targeted at the ICP segment, or could it primarily attract the anti-ICP defined in ICP.md?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating GATE-10: Format Correctness

**Load:** Channel-specific playbook if available (`${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`), otherwise general platform guidelines
**Asset content:** Full asset text + asset type metadata from MANIFEST.json

**Evaluate:**
1. Check asset length against platform limits (tweet < 280 chars, LinkedIn < 3000, email subject < 60). If no specific limit applies, check general word count reasonableness.
2. Check for required structural elements: subject line (email), H1/title (blog), hook (social), preview text (email). Flag missing elements.
3. Does the asset structure follow channel conventions (e.g., email has preview text and CTA above fold, blog has meta description, social post uses hashtags where expected)?

**Tier:** 2
**On failure:** Report as advisory

---

### Evaluating Discipline Gates (DISC-*)

**Load:** Playbook file for this asset type (`${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`)
**Asset content:** Full asset text

**Evaluate:**
For each `### DISC-*` subsection in the playbook's `## Discipline Gates` section:

1. Read the gate's **Checks** and **Against** fields to identify what is being evaluated and the reference data
2. Evaluate each numbered criterion under **Evaluation Criteria** against the asset content
3. Apply the same PASS/WARN/FAIL assessment and structured output format as base gates (see Structured Output Format above)
4. Use the tier specified in the discipline gate definition (from the `-- Tier {1|2}` in the heading)

**On failure:** Apply deviation handling based on the gate's tier:
- Tier 1 discipline gates: Prompt user for Correct / Accept+log / Escalate (same as base Tier 1)
- Tier 2 discipline gates: Report as advisory (same as base Tier 2)

**Aggregation:** Same rule as base gates:
- If ALL checks PASS: gate result = PASS
- If ANY check is WARN and none FAIL: gate result = WARN
- If ANY check is FAIL: gate result = FAIL
- N/A checks are excluded from aggregation

**Key rules:**
- Evaluate each discipline gate separately (same as base gates -- no bundling)
- Discipline gates must not duplicate base gate checks
- If the asset has no playbook, skip discipline gate evaluation entirely

---

## Deviation Handling (GATE-12)

When a gate results in WARN or FAIL:

### Tier 1 Failures (GATE-01, GATE-02, GATE-04, base gates overridden to Tier 1, and Tier 1 DISC-* gates)

Present the finding and prompt for action:

```
Gate [name] returned [WARN|FAIL]:
[finding summary with evidence]

Choose an action:
1. Correct -- Record this for /ttm-fix to address
2. Accept+log -- Document exception and proceed
3. Escalate -- Launch /ttm-positioning-shift to update positioning

Type 1, 2, or 3:
```

**Text-mode fallback:** When `TEXT_MODE=true`, present the same numbered list as plain text
and read the user's response from the next message.

### Tier 2 Findings (GATE-03, GATE-05 through GATE-10 unless overridden, and Tier 2 DISC-* gates)

Report findings without requiring action:

```
[Advisory] Gate [name]: [finding summary]
Recommendation: [recommendation from finding]
```

User may optionally request action on any Tier 2 finding.

### Accept+log Record Format (D-07)

When user selects Accept+log, collect justification via AskUserQuestion:

```
Why are you accepting this deviation? (This will be logged to DEVIATIONS.md)
```

Record the deviation using the CLI:

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
  --justification "[user's response]" \
  --run [current run number]
```

This writes a consistent entry to DEVIATIONS.md (append-only) and updates STATE.md gate field.

### Escalate Behavior (D-08)

When user selects Escalate:
- Pause verification
- Display: "Launching /ttm-positioning-shift. Verification paused."
- After positioning resolution: "Positioning updated. Re-run /ttm-verify to validate with new positioning."

### Correct Behavior (D-09)

When user selects Correct:
- Record the finding as needing fix
- Update campaign STATE.md via CLI:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.[gate_field] "fix_needed"
```

- Display: "Recorded for /ttm-fix. Continue verifying remaining gates."
- Verification continues -- does not pause for Correct. Fix happens after verify completes.

---

## Summary Table Format (D-05)

After all gates are evaluated for all assets, display a summary table:

```
## Verification Report: [campaign slug]

**Run:** [N] | **Date:** [ISO date] | **Assets:** [count]

| # | Gate | Tier | Asset 1 | Asset 2 | ... |
|---|------|------|---------|---------|-----|
| 1 | Positioning Drift | T1 | PASS | WARN | ... |
| 2 | Claim Accuracy | T1 | PASS | PASS | ... |
...
| 10 | Format Correctness | T2 | PASS | PASS | ... |
| 11 | DISC-{DISC}-01: {Name} | T{n} | PASS | N/A | ... |
| .. | ... | ... | ... | ... | ... |

Discipline gate rows appear after the 10 base gates. For assets without a matching
playbook, show N/A in that asset's column.

**Result:** [count] FAIL, [count] WARN -- [action required | all clear]
```

Below the summary table, include drill-down detail for every WARN and FAIL finding
using the structured output format defined above.
