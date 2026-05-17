# Positioning Check Report Format

## Usage

Referenced by `workflows/reference-mgmt/positioning-check.md` via @-syntax.
Defines the audit report format, drift categorization, trend comparison logic,
and cross-reference handling for accepted deviations.

---

## Drift Categories

Drift is evaluated using GATE-01's 3 checks. Each check maps to a category:

| Check # | Category | PASS Criteria | WARN Criteria | FAIL Criteria |
|---------|----------|---------------|---------------|---------------|
| 1 | Differentiator Alignment | Asset restates or naturally extends primary differentiator | Asset is neutral -- neither reinforces nor contradicts | Asset introduces a different/competing claim |
| 2 | Proof Point Sourcing | All factual claims backed by POSITIONING.md proof points | Some claims present but not all sourced | Claims contradict or fabricate proof points |
| 3 | Must-Not-Say Compliance | No terms from must-not-say list appear | Terms appear in non-customer-facing context | Must-not-say terms in customer-facing copy |

---

## Bleeding Analysis

Bleeding occurs when must-not-say terms from POSITIONING.md appear in **customer-facing** materials. This is distinct from general must-not-say drift -- non-customer-facing usage (internal briefs, planning docs) is a WARN, but customer-facing usage represents positioning "bleeding" into territory the brand explicitly avoids.

### Asset Type Classification

Classify each asset as customer-facing or non-customer-facing based on its file path and content type:

| Asset Type | Classification | Examples |
|------------|---------------|----------|
| Landing pages, blog posts, ad copy, social posts, email campaigns | Customer-facing | Assets intended for external audience consumption |
| Internal briefs, research docs, planning notes, strategy docs | Non-customer-facing | Assets used internally for planning and alignment |

When asset type is ambiguous, classify as customer-facing (conservative default).

### Bleeding Severity

| Check 3 Result | Asset Type | Bleeding Status | Severity |
|----------------|-----------|-----------------|----------|
| FAIL | Customer-facing | BLEEDING | Critical -- must-not-say term reaching external audience |
| WARN | Non-customer-facing | NOT BLEEDING | Advisory -- internal usage, lower risk |
| PASS | Any | CLEAN | No must-not-say terms found |

---

## Per-Asset Drift Calculation

Per-asset drift percentage = (WARN checks + FAIL checks) / total checks evaluated * 100

- 3 checks evaluated per asset (one per GATE-01 sub-check)
- PASS = 0 drift points, WARN = 1 drift point, FAIL = 1 drift point
- 0% = fully on-positioning, 33% = one check drifted, 67% = two checks drifted, 100% = fully off-positioning

---

## Aggregate Drift Calculation

Aggregate drift % = total drift points across all assets / (total assets * 3) * 100

Where:
- total drift points = count of all WARN + FAIL results across all assets and all 3 checks
- total assets * 3 = maximum possible drift points (3 checks per asset)

Example: 5 assets, 3 WARN findings, 1 FAIL finding = 4 / 15 * 100 = 26.7% aggregate drift

---

## Trend Comparison Logic

When a prior audit entry exists in `.taketomarket/DRIFT-LOG.md`:

1. Find the most recent row in the Audit Trail table where Event = `audit`
2. Parse the Details column to extract the prior aggregate drift percentage
   - Expected format: `"Nd audit: X% drift, Y findings across Z assets"`
   - Extract X as the prior drift percentage
3. Calculate delta: current aggregate drift % - prior aggregate drift %
4. Determine trend arrow:
   - Delta > +5%: UP arrow (drift increasing -- worse)
   - Delta < -5%: DOWN arrow (drift decreasing -- better)
   - Delta between -5% and +5%: STABLE (no significant change)

If no prior audit entry exists: display "First audit -- no trend data available."

---

## Cross-Reference Logic

For each campaign in the audit window:

1. Read `.taketomarket/CAMPAIGNS/<slug>/DEVIATIONS.md` if it exists
2. Filter for rows where Gate = `positioning_drift` (GATE-01 deviations)
3. These are assets where drift was previously detected but explicitly accepted by the user
4. Include in the "Accepted Deviations" section of the report
5. Accepted deviations still count toward the aggregate drift calculation (they represent
   real drift, just intentionally accepted drift)

---

## Report Template

Present the audit report in this exact format:

```
========================================
takeToMarket > POSITIONING AUDIT REPORT
========================================

Audit Window: last ${WINDOW}
Assets Audited: ${ASSET_COUNT} across ${CAMPAIGN_COUNT} campaigns
Date: ${ISO_DATE}

----------------------------------------
AGGREGATE DRIFT: ${AGGREGATE_DRIFT}%  ${TREND_ARROW}
----------------------------------------
${TREND_DETAIL}

## Per-Asset Results

| # | Asset | Campaign | Differentiator | Proof Points | Must-Not-Say | Drift % |
|---|-------|----------|----------------|--------------|--------------|---------|
| 1 | ${ASSET_NAME} | ${CAMPAIGN_SLUG} | ${CHECK_1} | ${CHECK_2} | ${CHECK_3} | ${DRIFT_PCT}% |
| ... | ... | ... | ... | ... | ... | ... |

## Drift Type Breakdown

| Category | Count | % of Total Findings |
|----------|-------|---------------------|
| Differentiator Alignment | ${DIFF_COUNT} | ${DIFF_PCT}% |
| Proof Point Sourcing | ${PROOF_COUNT} | ${PROOF_PCT}% |
| Must-Not-Say Violations | ${MNS_COUNT} | ${MNS_PCT}% |

## Bleeding Analysis

Must-not-say terms that have bled into customer-facing materials:

| # | Asset | Campaign | Term Found | Context | Severity |
|---|-------|----------|------------|---------|----------|
| 1 | ${ASSET_NAME} | ${CAMPAIGN_SLUG} | "${TERM}" | "${SURROUNDING_CONTEXT}" | Critical |
| ... | ... | ... | ... | ... | ... |

**Bleeding count:** ${BLEEDING_COUNT} of ${MNS_VIOLATION_COUNT} must-not-say violations are in customer-facing materials
**Bleeding rate:** ${BLEEDING_RATE}% of must-not-say violations have bled into customer-facing territory

${IF_NO_BLEEDING}No must-not-say terms found in customer-facing materials. Positioning boundaries are holding.${END_IF}
${IF_BLEEDING}Customer-facing assets contain must-not-say terms. These should be prioritized for /ttm-fix as they represent active positioning leakage to your audience.${END_IF}

## Findings Detail

For each WARN or FAIL result, show:

### [ASSET_NAME] (${CAMPAIGN_SLUG}) -- ${CATEGORY} [${RESULT}]

**Evidence:** "[exact quote or description from asset]"
**Reference:** "[corresponding text from POSITIONING.md]"
**Recommendation:** [specific action to resolve]

## Accepted Deviations

Previously accepted positioning deviations found in campaign DEVIATIONS.md files:

| Asset | Campaign | Gate | Justification | Run |
|-------|----------|------|---------------|-----|
| ${ASSET} | ${SLUG} | ${GATE} | ${JUSTIFICATION} | ${RUN} |

If no accepted deviations: "No previously accepted positioning deviations found."

## Trend Comparison

${TREND_TABLE_OR_FIRST_AUDIT_MESSAGE}

If prior audit exists:
| Metric | Prior Audit | Current Audit | Delta |
|--------|-------------|---------------|-------|
| Aggregate Drift | ${PRIOR_PCT}% | ${CURRENT_PCT}% | ${DELTA}% ${ARROW} |
| Assets Audited | ${PRIOR_COUNT} | ${CURRENT_COUNT} | -- |
| Window | ${PRIOR_WINDOW} | ${CURRENT_WINDOW} | -- |

## Recommendations

- If aggregate drift > 30%: "Aggregate drift exceeds 30%. Consider running /ttm-positioning-shift to evaluate whether your positioning needs updating."
- If aggregate drift > 0% and <= 30%: "Some drift detected. Run /ttm-fix on specific assets with FAIL results to bring them back on-positioning."
- If aggregate drift = 0%: "All assets are on-positioning. No action needed."
- For any FAIL results: "Assets with FAIL results should be addressed via /ttm-fix [campaign-slug]."
```

---

## Status Thresholds

| Aggregate Drift % | Status | Recommended Action |
|--------------------|--------|-------------------|
| 0% | On-Positioning | No action needed |
| 1-15% | Minor Drift | Fix individual assets via /ttm-fix |
| 16-30% | Moderate Drift | Review positioning strategy, fix flagged assets |
| 31%+ | Significant Drift | Run /ttm-positioning-shift to evaluate positioning changes |
