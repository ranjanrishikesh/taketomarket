---
campaign: [SLUG]
asset: [ASSET_NAME]
attempt: [ATTEMPT_NUMBER]
root_cause: [ROOT_CAUSE_CATEGORY]
generated: [ISO_TIMESTAMP]
---

# Fix Brief: [ASSET_NAME]

**Campaign:** [SLUG]
**Attempt:** [ATTEMPT_NUMBER] of 3
**Root Cause:** [ROOT_CAUSE_CATEGORY] -- [ROOT_CAUSE_EXPLANATION]

## Original Brief Reference

Read the full campaign brief at: [BRIEF_PATH]

The original brief defines the campaign objective, outcome metric, ICP segment,
positioning anchor, and asset specifications. This fix brief ADDS constraints --
it does not replace the original brief.

## What Failed (DO NOT repeat these issues)

[FAILURE_LIST]

Each entry below is a specific gate failure or review feedback item that must
be resolved in this fix attempt:

- Gate [GATE_NAME]: [FAILURE_DESCRIPTION]
- Review feedback: [STRUCTURED_FEEDBACK]

## What Passed (PRESERVE these elements)

[PASSING_LIST]

Each entry below is a gate that passed. The re-produced asset MUST maintain
these passing elements. Treat these as hard constraints:

- Gate [GATE_NAME]: PASS -- [EVIDENCE_OF_PASSING]

## Specific Corrections Required

[CORRECTIONS_LIST]

Targeted instructions derived from root cause analysis and review feedback:

1. [CORRECTION_1]
2. [CORRECTION_2]

## Constraints

- Fix ONLY the identified issues -- do not rewrite sections that are working
- Preserve all passing gate elements (listed above)
- Follow all rules from the original brief
- Match the same asset type and channel format
- If the root cause is "positioning-drift", pay extra attention to POSITIONING.md alignment
- If the root cause is "weak-hook", rewrite the opening section while preserving the body
- If the root cause is "unverifiable-claim", replace with approved proof points from BRAND.md
