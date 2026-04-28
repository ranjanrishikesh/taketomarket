<purpose>
Positioning drift audit workflow for /ttm-positioning-check. Samples recent assets
across all campaigns within a configurable time window (default 30 days per D-01),
evaluates each against GATE-01 positioning drift checks, generates a structured
audit report, and appends the results to .marketing/DRIFT-LOG.md.

This workflow can be invoked manually or auto-suggested by the ship workflow
after every 3rd campaign ships since the last audit (per D-02).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/gate-evaluation.md
@${CLAUDE_PLUGIN_ROOT}/references/positioning-check-report.md
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
takeToMarket > LOADING CONTEXT FOR POSITIONING AUDIT
```

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

**Load Tier 2 (full content)** for drift evaluation:
- `.marketing/POSITIONING.md` (needed for all 3 GATE-01 checks)

If `.marketing/POSITIONING.md` does not exist: Error:
"No POSITIONING.md found. Run /ttm-init first to set up your marketing workspace."
Exit.

---

## Step 2: Parse Time Window

Parse optional `--since` argument from $ARGUMENTS. Default: `30d` (per D-01).

```bash
WINDOW=$(echo "$ARGUMENTS" | grep -oP '(?<=--since\s)\S+' || echo "30d")
```

Extract number and unit:
- Format: `Nd` where N is a number and d = days
- Example: `30d` = last 30 days, `90d` = last 90 days, `7d` = last 7 days
- Calculate cutoff date from current date minus N days

Display:
```
takeToMarket > AUDIT WINDOW: last ${WINDOW}
```

---

## Step 3: Enumerate Campaigns and Assets

```
takeToMarket > ENUMERATING CAMPAIGNS
```

Run campaign enumeration via CLI:
```bash
CAMPAIGNS_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --since ${WINDOW} --raw)
```

Parse the JSON result. Expected format: `{ "campaigns": [...], "count": N }`

If count is 0:
```
takeToMarket > NO CAMPAIGNS FOUND

No campaigns with assets in the last ${WINDOW}. Nothing to audit.
```
Exit.

**Per Pitfall 2:** The CLI already excludes archived campaigns from the results.

For each campaign in the result:
1. Read the campaign's ASSETS/ directory:
   ```
   Glob: .marketing/CAMPAIGNS/${SLUG}/ASSETS/*
   ```
2. Collect all asset files found
3. Also read `.marketing/CAMPAIGNS/${SLUG}/DEVIATIONS.md` if it exists
   - Filter for rows where Gate = `positioning_drift` (GATE-01 deviations per D-13)
   - Store these as accepted deviations for the cross-reference section

Display:
```
takeToMarket > FOUND ${ASSET_COUNT} assets across ${CAMPAIGN_COUNT} campaigns
```

---

## Step 4: Evaluate Each Asset Against GATE-01

```
takeToMarket > EVALUATING POSITIONING DRIFT
```

For each collected asset:

1. Read the full asset content from disk
2. Evaluate against GATE-01's 3 checks (from @gate-evaluation.md):

   **Check 1: Differentiator Alignment**
   Does the asset restate or naturally extend the primary differentiator from
   POSITIONING.md? Or does it introduce a different claim?
   - PASS: Asset reinforces the primary differentiator
   - WARN: Asset is neutral -- neither reinforces nor contradicts
   - FAIL: Asset introduces a different/competing claim

   **Check 2: Proof Point Sourcing**
   Are all factual claims in the asset backed by proof points in the POSITIONING.md
   proof point library?
   - PASS: All claims backed by POSITIONING.md proof points
   - WARN: Some claims present but not all sourced
   - FAIL: Claims contradict or fabricate proof points

   **Check 3: Must-Not-Say Compliance**
   Does the asset contain any terms from the POSITIONING.md must-not-say list?
   - PASS: No must-not-say terms found
   - WARN: Terms appear in non-customer-facing context
   - FAIL: Must-not-say terms in customer-facing copy

3. Record per-check result: PASS / WARN / FAIL with evidence
4. Calculate per-asset drift %: (WARN count + FAIL count) / 3 * 100

**IMPORTANT per RESEARCH.md Pitfall 1:** Drift = (WARN + FAIL checks) / total checks.
Both WARN and FAIL contribute equally to the drift percentage calculation.

Display progress for each asset:
```
  [${INDEX}/${TOTAL}] ${ASSET_NAME} (${CAMPAIGN_SLUG}): ${DRIFT_PCT}% drift
```

---

## Step 5: Calculate Aggregates

After evaluating all assets:

- **Total assets evaluated:** count of all sampled assets
- **Aggregate drift %:** total (WARN + FAIL results) / (total assets * 3) * 100
- **Count by drift category:**
  - Differentiator Alignment: count of WARN + FAIL on Check 1 across all assets
  - Proof Point Sourcing: count of WARN + FAIL on Check 2 across all assets
  - Must-Not-Say Violations: count of WARN + FAIL on Check 3 across all assets
- **Cross-reference accepted deviations** from DEVIATIONS.md files collected in Step 3 (per D-13)

---

## Step 6: Trend Comparison

Read `.marketing/DRIFT-LOG.md`. Find the most recent entry with Event = `audit`.

**If a prior audit entry exists (per D-03):**
1. Parse the Details column to extract the prior aggregate drift percentage
   - Expected format: `"Nd audit: X% drift, Y findings across Z assets"`
   - Extract X as the prior drift percentage
2. Calculate delta: current aggregate drift % - prior aggregate drift %
3. Determine trend:
   - Delta > +5%: UP (drift increasing -- positioning adherence worsening)
   - Delta < -5%: DOWN (drift decreasing -- positioning adherence improving)
   - Delta between -5% and +5%: STABLE (no significant change)
4. Set TREND_ARROW and TREND_DETAIL for the report

**If no prior audit entry exists:**
- Set TREND_ARROW = ""
- Set TREND_DETAIL = "First audit -- no trend data available."

---

## Step 7: Generate Report

Follow the report format from @positioning-check-report.md.

Generate the full audit report including:
- Header with audit window and asset count
- Aggregate drift percentage with trend arrow
- Per-asset results table (asset x check matrix with drift %)
- Drift type breakdown (count per category)
- Findings detail for every WARN and FAIL result
- Accepted deviations cross-reference
- Trend comparison (if prior audit exists)
- Recommendations based on aggregate drift thresholds

**Display the report to stdout** (per A1 -- this is a cross-campaign audit,
not scoped to a single campaign directory).

---

## Step 8: Log to DRIFT-LOG.md

Append the audit results to `.marketing/DRIFT-LOG.md` via CLI:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" drift-log append \
  --event-type audit \
  --source "/ttm-positioning-check" \
  --details "${WINDOW} audit: ${AGGREGATE_DRIFT}% drift, ${DRIFT_COUNT} findings across ${ASSET_COUNT} assets" \
  --affected ${ASSET_COUNT}
```

**IMPORTANT:** Always use the CLI for DRIFT-LOG.md writes. Never write to the file
directly. The CLI handles append-only semantics, marker-based insertion, and
consistent formatting.

Display:
```
takeToMarket > AUDIT LOGGED TO .marketing/DRIFT-LOG.md
```

---

## Step 9: Completion Banner

```
========================================
takeToMarket > POSITIONING AUDIT COMPLETE
========================================

Window: last ${WINDOW} | Assets audited: ${ASSET_COUNT}
Aggregate drift: ${AGGREGATE_DRIFT}% ${TREND_ARROW}
Campaigns covered: ${CAMPAIGN_COUNT}

Drift logged to: .marketing/DRIFT-LOG.md

Next steps:
- Run /ttm-fix [campaign-slug] to address specific FAIL results
- Run /ttm-positioning-shift if aggregate drift > 30% warrants a positioning change
```

</process>

<success_criteria>
- [ ] All assets from campaigns within the time window evaluated against GATE-01's 3 checks
- [ ] Per-asset drift percentage calculated (WARN+FAIL / 3 * 100)
- [ ] Aggregate drift percentage calculated across all sampled assets
- [ ] Drift categorized by type (differentiator, proof point, must-not-say)
- [ ] Accepted deviations cross-referenced from campaign DEVIATIONS.md files
- [ ] Trend comparison shown if a prior audit exists in DRIFT-LOG.md
- [ ] Report displayed to stdout in the standard format
- [ ] Audit results appended to DRIFT-LOG.md via CLI
- [ ] Recommendations provided based on aggregate drift thresholds
</success_criteria>

<output>
- Audit report displayed to stdout (cross-campaign, no file written)
- `.marketing/DRIFT-LOG.md` updated with audit entry via CLI
</output>
