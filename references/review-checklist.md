# Review Checklist

Reference file for the /ttm-review workflow. Contains the structured review
questions, revision feedback form, and batch review format.

## Mandatory Review Questions (D-01)

Present these 4 questions for every asset. All 4 are required -- the reviewer
must answer each one before selecting an outcome.

### Question 1: Positioning Reinforcement
"Does this asset reinforce your positioning -- your primary differentiator, target
audience, and category? Identify any claims that go beyond or contradict POSITIONING.md."

Expected answer: Yes/No + specific notes on any drift found.

### Question 2: Outcome Realism
"Is the outcome metric target realistic given this content? Could this asset
plausibly drive the defined outcome (e.g., demo requests, signups, pipeline)?"

Expected answer: Yes/No + explanation of why or why not.

### Question 3: Claim Substantiation
"Are all factual claims, statistics, and proof points substantiated by approved
data in BRAND.md? Flag any unverifiable or unsourced claims."

Expected answer: Yes/No + list of any unsubstantiated claims.

### Question 4: Competitor Differentiation
"Does this asset clearly differentiate from competitors? Could a competitor
publish this same content with their name swapped in?"

Expected answer: Yes/No + notes on differentiation strength.

### Freeform Notes (Optional)
"Any additional feedback, concerns, or suggestions?"

## Review Outcomes (D-03)

After answering all 4 questions, select one outcome per asset:

1. **Approve** -- Asset is ready for shipping. Advances to `ship-ready` status.
2. **Revise** -- Asset needs changes. Triggers structured revision feedback (below),
   then routes to /ttm-fix.
3. **Reject** -- Asset is fundamentally wrong. Killed permanently. Reason logged in
   campaign state. No fix loop -- this is final.

## Structured Revision Feedback (D-12)

When outcome is "Revise", collect this structured feedback. This data becomes
the primary input for /ttm-fix root cause analysis.

### Failed Checklist Items
Which review questions did this asset fail? (select all that apply)
1. Positioning reinforcement
2. Outcome realism
3. Claim substantiation
4. Competitor differentiation

### Severity
1. Minor -- small adjustments to specific sections
2. Major -- significant rewrite of key sections
3. Critical -- fundamental approach or angle is wrong

### Specific Feedback
"What specifically needs to change? Be as concrete as possible -- reference
specific sections, sentences, or claims."

## Batch Derivative Review Format (D-02)

For derivative assets (after the hero has been reviewed in full):

Show abbreviated view:
- Gate summary: PASS/WARN/FAIL counts only (not full table)
- Content preview: first ~300 characters + file link
- "Hero asset for reference: ${HERO_FILE}"
- Same 4 questions (answers can be shorter in batch mode)
- Same 3 outcomes (Approve/Revise/Reject)
