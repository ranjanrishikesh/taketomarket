# Meta-Gate Evaluation Reference

> This file is loaded by verify.md Step 4c via @-syntax. All meta-gates are Tier 2 advisory -- they produce findings in the report but do NOT block verification.

## Usage

Meta-gates operate at the **portfolio level**, not on individual assets. They evaluate the campaign mix, scheduling, thematic alignment, and learning plans across all active campaigns.

**Data collection:** Run the following command to get all campaign states:

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign list --raw
```

Additional data sources: `.marketing/CALENDAR.md`, `.marketing/CAMPAIGNS/<slug>/BRIEF.md`

## Structured Output Format

Each meta-gate evaluation MUST produce output in this format:

- **Gate:** [Gate Name] (META-XX)
- **Tier:** 2 (Advisory)
- **Result:** [PASS|WARN|FAIL]
- **Summary:** [One-sentence summary]
- **Evidence:** [Data supporting the finding]
- **Recommendation:** [Suggested action if WARN or FAIL; "None" if PASS]

---

## META-01: Portfolio Balance

**What it checks:** Whether the active campaign mix covers all funnel stages (awareness, consideration, conversion, retention) and does not over-index on any single stage.

**Tier:** 2 (Advisory)

**Data source:** `campaign list --raw` output + each campaign's BRIEF.md (funnel stage field)

### Evaluation Criteria

**Check 1: Funnel Coverage**

Count the distinct funnel stages represented across all active campaigns.

- **PASS:** 3 or more funnel stages covered (e.g., awareness + consideration + conversion)
- **WARN:** 2 funnel stages covered
- **FAIL:** 1 funnel stage covered (all campaigns targeting the same stage)

**Check 2: Channel Diversity**

Count the distinct channels used across all active campaigns.

- **PASS:** 3 or more distinct channels
- **WARN:** 2 distinct channels
- **FAIL:** 1 channel only (single-channel dependency)

### Aggregation

- If ALL checks PASS: META-01 = PASS
- If ANY check is WARN and none FAIL: META-01 = WARN
- If ANY check is FAIL: META-01 = FAIL

---

## META-02: Calendar Collision

**What it checks:** Scheduling conflicts between campaigns -- overlapping launch dates, competing for the same audience segment simultaneously, or conflicting messages in market at the same time.

**Tier:** 2 (Advisory)

**Data source:** `campaign list --raw` output + `.marketing/CALENDAR.md` + each campaign's BRIEF.md (launch date, audience segment)

### Evaluation Criteria

**Check 1: Launch Overlap**

Compare launch dates across all active and scheduled campaigns.

- **PASS:** No 2 campaigns launch within a 3-day window
- **WARN:** 2 campaigns launch in the same week (but not within 3 days)
- **FAIL:** 3 or more campaigns launch in the same week

**Check 2: Audience Collision**

Compare target audience segments across campaigns launching in the same 2-week window.

- **PASS:** Different audience segments (no overlap)
- **WARN:** Same audience segment but different channels
- **FAIL:** Same audience segment AND same channel in the same 2-week window

### Aggregation

- If ALL checks PASS: META-02 = PASS
- If ANY check is WARN and none FAIL: META-02 = WARN
- If ANY check is FAIL: META-02 = FAIL

---

## META-03: Theme Consistency

**What it checks:** Whether active campaigns align with the quarterly theme defined in CALENDAR.md. Flags campaigns that drift from the strategic narrative.

**Tier:** 2 (Advisory)

**Data source:** `.marketing/CALENDAR.md` (quarterly theme section) + each campaign's BRIEF.md

### Evaluation Criteria

**Check 1: Theme Alignment**

Compare each active campaign's messaging theme against the current quarter's theme in CALENDAR.md.

- **PASS:** Campaign BRIEF.md contains explicit reference to the quarterly theme or directly supports it
- **WARN:** Campaign theme is adjacent to the quarterly theme but does not explicitly reference it
- **FAIL:** Campaign contradicts or ignores the quarterly theme without documented rationale

### Aggregation

- If ALL campaigns PASS: META-03 = PASS
- If ANY campaign is WARN and none FAIL: META-03 = WARN
- If ANY campaign is FAIL: META-03 = FAIL

---

## META-04: Learning Plan

**What it checks:** Whether every campaign has a measurement plan and a learning hypothesis. Flags campaigns that ship without defining what success looks like or what the team will learn.

**Tier:** 2 (Advisory)

**Data source:** Each campaign's BRIEF.md (outcome metric, measurement plan, hypothesis sections)

### Evaluation Criteria

**Check 1: Measurement Plan**

Verify each active campaign's BRIEF.md defines a complete measurement plan.

- **PASS:** Campaign has outcome metric + numeric target + measurement time window
- **WARN:** Campaign has outcome metric but is missing target value or measurement window
- **FAIL:** Campaign has no outcome metric defined

**Check 2: Testable Hypothesis**

Verify each active campaign's BRIEF.md includes a testable hypothesis.

- **PASS:** Campaign defines a specific, falsifiable hypothesis (e.g., "We believe [action] will produce [result] because [reason]")
- **WARN:** Campaign states a goal but does not frame it as a testable hypothesis
- **FAIL:** Campaign only has output targets (impressions, clicks) with no hypothesis about outcomes

### Aggregation

- If ALL checks PASS: META-04 = PASS
- If ANY check is WARN and none FAIL: META-04 = WARN
- If ANY check is FAIL: META-04 = FAIL

---

## Summary Table Format

After evaluating all 4 meta-gates, present results in a summary table:

| # | Meta-Gate | Result | Key Finding |
|---|-----------|--------|-------------|
| 1 | Portfolio Balance (META-01) | [PASS/WARN/FAIL] | [one-line summary] |
| 2 | Calendar Collision (META-02) | [PASS/WARN/FAIL] | [one-line summary] |
| 3 | Theme Consistency (META-03) | [PASS/WARN/FAIL] | [one-line summary] |
| 4 | Learning Plan (META-04) | [PASS/WARN/FAIL] | [one-line summary] |

**All meta-gates are advisory.** They appear in the verification report's meta-gate section but do not affect the overall PASS/FAIL result of asset verification.
