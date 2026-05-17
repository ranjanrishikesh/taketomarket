# Positioning Check Rules

## Usage

Referenced by `workflows/lifecycle/brief.md` via @-syntax.
Applied after brief content is fully generated to detect positioning drift.
This is a soft gate per D-05 -- the brief is ALWAYS generated regardless of gate result.
Drift produces a warning, not a block.

---

## Check 1: Positioning Anchor Alignment

**Field:** Brief's "Positioning Anchor > Key message"
**Checks against:** POSITIONING.md primary differentiator phrase

- PASS: Brief's positioning anchor restates or naturally extends the primary differentiator
- WARN: Brief's anchor partially overlaps but introduces claims not present in POSITIONING.md
- FAIL: Brief's anchor uses a different differentiation claim entirely

**Drift detail format:** "Positioning anchor '[brief anchor]' does not align with primary differentiator '[positioning differentiator]'"

## Check 2: ICP Segment Match

**Field:** Brief's "ICP Segment > Primary segment"
**Checks against:** POSITIONING.md target audience

- PASS: Brief's ICP segment matches or is a sub-segment of the POSITIONING.md target audience
- WARN: Brief targets an adjacent audience not explicitly in POSITIONING.md
- FAIL: Brief targets a completely different audience

**Drift detail format:** "ICP segment '[brief segment]' does not match target audience '[positioning audience]'"

## Check 3: Proof Point Sourcing

**Field:** Brief's "Proof Points" table
**Checks against:** POSITIONING.md must-include proof points

- PASS: All proof points in the brief are sourced from POSITIONING.md proof point library
- WARN: Brief includes proof points not in the library (may be valid new evidence)
- FAIL: Brief makes claims with no proof point sourcing at all

**Drift detail format:** "Proof point '[claim]' not found in POSITIONING.md proof point library"

## Check 4: Must-Not-Say Terms

**Field:** Entire brief content
**Checks against:** POSITIONING.md must-not-say terms list

- PASS: No must-not-say terms found in brief
- FAIL: One or more must-not-say terms detected

**Drift detail format:** "Must-not-say term '[term]' found in brief [section]"

## Check 5: Hook-Positioning Coherence

**Field:** Brief's "Hook" section
**Checks against:** POSITIONING.md primary differentiator and category

- PASS: Hook reinforces the positioning -- uses aligned language and framing
- WARN: Hook is neutral -- does not reinforce but does not contradict
- FAIL: Hook contradicts the positioning or uses competitor framing

**Drift detail format:** "Hook framing '[hook summary]' contradicts positioning category '[category]'"

---

## Gate Result Logic

- If ALL checks PASS: gate result = "pass"
- If ANY check is WARN or FAIL: gate result = "warn"
- The brief is ALWAYS generated regardless of gate result (per D-05)

## Drift Warning Template

When gate result is "warn", insert at the TOP of BRIEF.md after the title line:

```
<!--
!! POSITIONING DRIFT WARNING !!
The following items may not align with your positioning:
- [drift detail from each failing check]
Review .taketomarket/POSITIONING.md and adjust the brief if needed.
Run /ttm-positioning-check for a full audit.
-->
```

This is an HTML comment so it is visible in source but not rendered.
The warning uses specific drift detail format strings from each failing check
so the user can pinpoint exactly what drifted and from what reference value.
