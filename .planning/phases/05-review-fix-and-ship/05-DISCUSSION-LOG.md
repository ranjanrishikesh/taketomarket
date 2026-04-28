# Phase 5: Review, Fix, and Ship - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 05-review-fix-and-ship
**Areas discussed:** Review checklist design, Fix loop mechanics, Ship launch checklist, Review-to-Fix handoff

---

## Review Checklist Design

### Q1: How should the human review be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Structured checklist | Force 4 specific review questions as yes/no checkpoints. User must answer each before approving. | |
| Guided + open feedback | Show 4 required questions PLUS a freeform text area for additional notes. Questions required, notes optional. | ✓ |
| You decide | Claude picks the approach during planning. | |

**User's choice:** Guided + open feedback
**Notes:** None

### Q2: How should multi-asset campaigns be reviewed?

| Option | Description | Selected |
|--------|-------------|----------|
| One at a time | Present each asset individually. User approves/rejects each independently. | |
| All at once, decide per asset | Show summary table of all assets, let user approve/reject each in batch. | |
| Hero first, then batch | Review hero asset in detail first, then present derivatives in batch view with hero as reference. | ✓ |

**User's choice:** Hero first, then batch
**Notes:** None

### Q3: What are the possible review outcomes per asset?

| Option | Description | Selected |
|--------|-------------|----------|
| Approve / Revise / Reject | 3 outcomes. Reject is final — no fix loop. | ✓ |
| Approve / Revise only | 2 outcomes. No reject — everything either ships or gets fixed. | |
| You decide | Claude picks based on integration. | |

**User's choice:** Approve / Revise / Reject
**Notes:** None

### Q4: Display the full asset content inline or summary + link?

| Option | Description | Selected |
|--------|-------------|----------|
| Full content inline | Display complete asset text within the review flow. | |
| Summary + file link | Show gate summary table + first ~500 chars, link to full file. | ✓ |
| Adaptive by length | Short assets inline, long assets as summary + link. | |

**User's choice:** Summary + file link
**Notes:** None

---

## Fix Loop Mechanics

### Q1: How should root-cause analysis work?

| Option | Description | Selected |
|--------|-------------|----------|
| AI-driven analysis | Claude analyzes and identifies root cause. Presents diagnosis for confirmation. | |
| Categorized by user | User picks from root-cause taxonomy and provides notes. | |
| AI analysis + user confirm | Claude proposes diagnosis, user confirms or corrects. | ✓ |

**User's choice:** AI analysis + user confirm
**Notes:** None

### Q2: Re-run all gates or only failed ones after fix?

| Option | Description | Selected |
|--------|-------------|----------|
| All gates every time | Re-verify all 10 gates. Catches regressions from fixes. | ✓ |
| Only failed gates | Re-verify only failed gates. Faster but risks missing new issues. | |
| Failed gates + related | Re-verify failed gates plus potentially affected ones. | |

**User's choice:** All gates every time
**Notes:** None

### Q3: What happens when the 3-attempt cap is hit?

| Option | Description | Selected |
|--------|-------------|----------|
| Escalate to human with full history | Present all 3 attempts with diagnoses and results. | |
| Escalate + suggest manual edit | Same as above, plus suggest specific manual edits based on failure patterns. | ✓ |
| You decide | Claude picks the escalation flow. | |

**User's choice:** Escalate + suggest manual edit
**Notes:** None

### Q4: Should user see each fix attempt or just the final result?

| Option | Description | Selected |
|--------|-------------|----------|
| Show each attempt | After each cycle, show result. User can intervene. | ✓ |
| Run silently, show final | Run up to 3 attempts automatically, present final result only. | |
| Silent with progress | Run automatically but show brief progress update per attempt. | |

**User's choice:** Show each attempt
**Notes:** None

---

## Ship Launch Checklist

### Q1: Static template or dynamically generated checklist?

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic per campaign | Generate checklist based on channel mix, asset types, and brief. | ✓ |
| Static template + extras | Base checklist for every campaign, plus channel-specific additions. | |
| You decide | Claude picks the approach. | |

**User's choice:** Dynamic per campaign
**Notes:** None

### Q2: How should the checklist be interacted with?

| Option | Description | Selected |
|--------|-------------|----------|
| AI checks + human confirms | Claude auto-checks what it can, presents with checkboxes user confirms. | ✓ |
| All human checkboxes | Full checklist as manual items. | |
| AI checks only | Claude verifies everything, just a pass/fail report. | |

**User's choice:** AI checks + human confirms
**Notes:** None

### Q3: What does 'shipped' mean for campaign state?

| Option | Description | Selected |
|--------|-------------|----------|
| All assets must ship together | Campaign 'shipped' only when all assets complete. | |
| Per-asset ship status | Each asset ships independently. Tracks per-asset status. | ✓ |
| Per-asset + campaign gate | Assets ship independently, campaign-level shipped requires all or explicit deferral. | |

**User's choice:** Per-asset ship status
**Notes:** None

---

## Review-to-Fix Handoff

### Q1: How should review feedback flow into fix brief?

| Option | Description | Selected |
|--------|-------------|----------|
| Structured feedback form | Reviewer answers structured questions on Revise: which items failed, notes, severity. | ✓ |
| Freeform notes only | Reviewer writes freeform feedback. AI parses alongside gate failures. | |
| Gate results + notes | Freeform notes plus gate failures provide structure. | |

**User's choice:** Structured feedback form
**Notes:** None

### Q2: Can user approve some assets and revise/reject others in one session?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, mixed outcomes | In one /ttm-review session, each asset gets its own outcome independently. | ✓ |
| Per-asset sessions | Each /ttm-review run handles one asset at a time. | |
| You decide | Claude picks based on integration. | |

**User's choice:** Yes, mixed outcomes
**Notes:** None

### Q3: After fix succeeds, does asset go back through review?

| Option | Description | Selected |
|--------|-------------|----------|
| Back to review | Fixed assets always go through another human review. | |
| Auto-approve if gates pass | If fix + re-verify passes all gates, auto-advance to ship-ready. | ✓ |
| User chooses per fix | After each successful fix, ask whether to review again or approve. | |

**User's choice:** Auto-approve if gates pass
**Notes:** None

### Q4: How does /ttm-fix get triggered?

| Option | Description | Selected |
|--------|-------------|----------|
| Suggest after review | Display suggestion to run /ttm-fix manually. | |
| Auto-trigger from review | When user marks Revise, automatically launch /ttm-fix. | ✓ |
| User chooses at review end | Ask: fix now or later? | |

**User's choice:** Auto-trigger from review
**Notes:** None

---

## Claude's Discretion

- Fix brief template structure
- Review checklist rendering pattern (AskUserQuestion vs text output)
- Ship checklist item categories per channel
- Campaign state schema extensions for review/fix/ship tracking fields

## Deferred Ideas

None — discussion stayed within phase scope
