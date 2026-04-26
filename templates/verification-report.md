---
campaign: [SLUG]
run_number: [RUN_NUMBER]
date: [ISO_DATE]
total_assets: [TOTAL_ASSETS]
overall_result: [pass|warn|fail]
---

# Verification Report: [SLUG]

**Run:** [RUN_NUMBER] | **Date:** [ISO_DATE] | **Assets:** [TOTAL_ASSETS]

## Summary

| # | Gate | Tier | [ASSET_COLUMNS] |
|---|------|------|-----------------|
| 1 | Positioning Drift (GATE-01) | T1 | [RESULTS] |
| 2 | Claim Accuracy (GATE-02) | T1 | [RESULTS] |
| 3 | Voice Drift (GATE-03) | T2 | [RESULTS] |
| 4 | Outcome Alignment (GATE-04) | T1 | [RESULTS] |
| 5 | Funnel Integrity (GATE-05) | T2 | [RESULTS] |
| 6 | UTM Hygiene (GATE-06) | T2 | [RESULTS] |
| 7 | Compliance (GATE-07) | T2 | [RESULTS] |
| 8 | Competitor Collision (GATE-08) | T2 | [RESULTS] |
| 9 | ICP Fit (GATE-09) | T2 | [RESULTS] |
| 10 | Format Correctness (GATE-10) | T2 | [RESULTS] |

**Result:** [FAIL_COUNT] FAIL (Tier 1), [WARN_COUNT] WARN -- [ACTION_SUMMARY]

---

## Detail Findings

### [ASSET_NAME] -- [GATE_NAME] ([RESULT])

**Line [LINE_NUMBER]:** "[EXACT_TEXT_FROM_ASSET]"

**Issue:** [DESCRIPTION_OF_WHAT_TRIGGERED_THE_FINDING]

**Reference:** [QUOTE_FROM_REFERENCE_FILE_BEING_CHECKED_AGAINST]

**Recommendation:** [SPECIFIC_CHANGE_TO_RESOLVE_THE_FINDING]

**Action required:**
1. **Correct** -- rewrite the flagged section to resolve the finding
2. **Accept+log** -- document exception in DEVIATIONS.md and proceed
3. **Escalate** -- trigger /ttm-positioning-shift to update positioning

---

<!-- Repeat the detail finding block above for each WARN or FAIL finding.
     PASS results do not need detail entries. -->

## Run Metadata

- **Verify command:** `/ttm-verify [SLUG]`
- **Manifest:** `.marketing/CAMPAIGNS/[SLUG]/MANIFEST.json`
- **Gate definitions:** `gates/base-gates.md`
- **Previous runs:** [PREVIOUS_RUN_COUNT]
