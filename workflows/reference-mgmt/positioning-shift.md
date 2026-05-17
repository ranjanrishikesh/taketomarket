<purpose>
Controlled positioning shift workflow for /ttm-positioning-shift. Requires explicit
reasoning for the change, collects new positioning fields, generates a migration plan
for active campaigns, sets deprecation schedule for shipped assets, presents a
before/after diff for mandatory human approval, and atomically updates POSITIONING.md
with History table archival. Logs all changes to .taketomarket/DRIFT-LOG.md.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/templates/reference-files/positioning.md
@${CLAUDE_PLUGIN_ROOT}/templates/migration-plan.md
</required_reading>

<constraints>
## This Workflow WRITES to POSITIONING.md

This is one of only two workflows authorized to modify `.taketomarket/POSITIONING.md`
(the other is `/ttm-init`). All writes are gated behind mandatory human approval
in Step 4. Never write to POSITIONING.md without explicit "Approve" from the user.
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

**Load Tier 2 (full content)** for before/after diff:
- `.taketomarket/POSITIONING.md` (full -- needed for field comparison and History table)

If `.taketomarket/POSITIONING.md` does not exist, error:
"POSITIONING.md not found. Run /ttm-init first to set up your marketing system."
Exit.

Parse the current POSITIONING.md into structured fields:
- `CURRENT_CATEGORY` -- from `**Category:**` line
- `CURRENT_DIFFERENTIATOR` -- from `**Primary differentiator:**` line
- `CURRENT_AUDIENCE` -- from `**Target audience:**` line
- `CURRENT_PROOF_POINTS` -- from `## Proof Point Library` table rows
- `CURRENT_MUST_NOT_SAY` -- from `## Must-Not-Say Terms` table rows
- `CURRENT_HISTORY` -- from `### Positioning History` table rows

---

## Step 2: Check for Active Campaigns (per D-08, D-09, D-10)

```bash
ACTIVE_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --active --raw)
ACTIVE_COUNT=$(echo "$ACTIVE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).count))")
```

If ACTIVE_COUNT > 0:
Display warning:
```
takeToMarket > ACTIVE CAMPAIGNS DETECTED

${ACTIVE_COUNT} campaign(s) have active assets that may conflict with
a positioning change. A migration plan will be generated.

Campaigns: [list campaign slugs and phases from ACTIVE_JSON]
```

If ACTIVE_COUNT == 0:
Display:
```
takeToMarket > NO ACTIVE CAMPAIGNS

No active campaigns detected. Shift will apply to all future campaigns.
A migration plan is not required, but a deprecation schedule for
previously shipped assets may still be needed.
```

---

## Step 3: Collect Shift Information (per D-06)

### 3a: Reasoning

Using AskUserQuestion (text-mode fallback):
- header: "Positioning Shift Reasoning"
- question: "Why is this positioning change needed? Provide specific reasoning (market shift, customer feedback, competitive pressure, etc.)"
- type: free text

Record the reasoning as `SHIFT_REASONING`.

### 3b: New Positioning Fields

Collect ALL structured positioning fields (matching POSITIONING.md template).
For each field, show the CURRENT value and ask for the NEW value.

**Field 1: Primary Differentiator**

Using AskUserQuestion (text-mode fallback):
- header: "Primary Differentiator"
- question: "Current: ${CURRENT_DIFFERENTIATOR}\n\nEnter the NEW primary differentiator phrase (or type 'keep' to keep current):"
- type: free text

Record as `NEW_DIFFERENTIATOR`. If "keep", use `CURRENT_DIFFERENTIATOR`.

**Field 2: Category**

Using AskUserQuestion (text-mode fallback):
- header: "Market Category"
- question: "Current: ${CURRENT_CATEGORY}\n\nEnter the NEW market category (or type 'keep' to keep current):"
- type: free text

Record as `NEW_CATEGORY`. If "keep", use `CURRENT_CATEGORY`.

**Field 3: Target Audience**

Using AskUserQuestion (text-mode fallback):
- header: "Target Audience"
- question: "Current: ${CURRENT_AUDIENCE}\n\nEnter the NEW target audience (or type 'keep' to keep current):"
- type: free text

Record as `NEW_AUDIENCE`. If "keep", use `CURRENT_AUDIENCE`.

**Field 4: Proof Points**

Display current proof points table. Ask:
- header: "Proof Points"
- question: "Current proof points shown above.\n\nProvide the NEW proof points as a numbered list. Each item: claim | source\n(or type 'keep' to keep current):"
- type: free text

Record as `NEW_PROOF_POINTS`. If "keep", use `CURRENT_PROOF_POINTS`.

**Field 5: Must-Not-Say Terms**

Display current must-not-say terms table. Ask:
- header: "Must-Not-Say Terms"
- question: "Current terms shown above.\n\nProvide the NEW must-not-say terms. Each item: term | reason\n(or type 'keep' to keep current):"
- type: free text

Record as `NEW_MUST_NOT_SAY`. If "keep", use `CURRENT_MUST_NOT_SAY`.

**Validate at least one field changed.** If ALL fields are "keep", display:
"No fields changed. Nothing to shift. Exiting."
Exit.

### 3c: Migration Plan for Active Campaigns (per D-04, only if ACTIVE_COUNT > 0)

For each active campaign from `ACTIVE_JSON`:

1. List all assets in `.taketomarket/CAMPAIGNS/<slug>/ASSETS/` or from MANIFEST.json
2. Quick-evaluate each asset against the NEW positioning using GATE-01 3-check logic:
   - Does the asset align with the NEW differentiator?
   - Are claims backed by NEW proof points?
   - Does the asset avoid NEW must-not-say terms?
3. For each asset, recommend one of:
   - **re-verify**: Asset may still pass under new positioning (minor drift)
   - **re-produce**: Asset fundamentally conflicts with new positioning
   - **accept-as-is**: Asset is channel/format where positioning is less critical

Present the migration plan per campaign using the `templates/migration-plan.md` format.

Ask user to confirm or override each recommendation:
Using AskUserQuestion (text-mode fallback):
- header: "Migration Plan Review"
- question: "Review the migration plan above. Do you accept these recommendations?"
- options:
  - label: "Accept all" -- Keep all recommendations as-is
  - label: "Override" -- Change specific recommendations (will prompt per asset)
  - label: "Cancel" -- Abandon the shift entirely

**On "Override":** For each asset, ask user to select action (re-verify / re-produce / accept-as-is).
**On "Cancel":** Display "Positioning shift cancelled. No changes made." Exit.
**On "Accept all":** Continue.

### 3d: Deprecation Schedule (per D-05)

Ask user to set deprecation timeline for shipped assets:
Using AskUserQuestion (text-mode fallback):
- header: "Deprecation Schedule"
- question: "Set a deadline for updating old-positioning assets (e.g., 90 days from now, or a specific date like 2025-06-01). Type 'skip' if no shipped assets need updating:"
- type: free text

If not "skip":
Record `DEPRECATION_DEADLINE`.

For each campaign with shipped assets (from campaign list):
- List shipped assets
- Record deprecation entry: asset, campaign, old positioning element, required update, deadline

---

## Step 4: Present Before/After Diff and Approval Gate (per D-06, D-07)

Build a summary of all changed fields. Only show fields that actually changed.

Display the complete change for review:

```
takeToMarket > POSITIONING SHIFT APPROVAL

## Current Positioning
**Category:** [CURRENT_CATEGORY]
**Primary Differentiator:** [CURRENT_DIFFERENTIATOR]
**Target Audience:** [CURRENT_AUDIENCE]
**Proof Points:** [current count] points
**Must-Not-Say:** [current count] terms

## Proposed Positioning
**Category:** [NEW_CATEGORY]
**Primary Differentiator:** [NEW_DIFFERENTIATOR]
**Target Audience:** [NEW_AUDIENCE]
**Proof Points:** [new count] points
**Must-Not-Say:** [new count] terms

## What Changed
[field-by-field diff showing only changed fields]
[For each changed field: "- [FIELD]: [old value] -> [new value]"]

## Reasoning
[SHIFT_REASONING]

## Impact
- Active campaigns affected: [ACTIVE_COUNT]
- Migration actions needed: [count of re-verify + re-produce actions]
- Deprecation items: [count]
- Deprecation deadline: [DEPRECATION_DEADLINE or "N/A"]
```

Using AskUserQuestion (text-mode fallback):
- header: "Approve Positioning Shift"
- question: "Review the changes above. This will update POSITIONING.md and affect all future campaigns."
- options:
  - label: "Approve" -- Apply the new positioning
  - label: "Revise" -- Go back and modify the proposed positioning
  - label: "Cancel" -- Abandon the shift entirely

**On "Revise":** Loop back to Step 3b to re-collect fields.
**On "Cancel":** Display "Positioning shift cancelled. No changes made." Exit.
**On "Approve":** Proceed to Step 5.

---

## Step 5: Apply Changes (per D-07)

### 5a: Archive Old Positioning in History Table

Read current POSITIONING.md. Find the `### Positioning History` table.
Append a new row:
```
| [ISO date] | [summary of what changed] | [user's reasoning, sanitized to 100 chars] |
```

**Sanitization (per T-06-09, Pitfall 3):** Strip pipes (`|`), backticks, newlines from the
reasoning text. Replace with spaces. Limit to 100 characters. This prevents Markdown table
delimiter breakage.

### 5b: Update POSITIONING.md Fields

Update the `<!-- _SUMMARY -->` block with new Category, Primary Differentiator, Target Audience.
Update the `## Proof Point Library` table with new proof points.
Update the `## Must-Not-Say Terms` table with new terms.

**CRITICAL:** Preserve the `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->` delimiters exactly
as they are. All other workflows depend on these markers for Tier 1 context loading.

Write the updated POSITIONING.md atomically via the Write tool.

### 5c: Log Shift to DRIFT-LOG.md (per T-06-10)

```bash
CHANGED_FIELDS="[list of field names that changed, e.g., differentiator, category]"
SANITIZED_REASONING=$(echo "${SHIFT_REASONING}" | head -c 100 | tr '|`\n' '   ')

node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" drift-log append \
  --event-type shift \
  --source "/ttm-positioning-shift" \
  --details "Changed: ${CHANGED_FIELDS}. Reasoning: ${SANITIZED_REASONING}" \
  --affected ${ACTIVE_COUNT}
```

### 5d: Log Deprecation Entries

For each deprecation item collected in Step 3d:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" drift-log deprecation \
  --asset "[asset name]" \
  --campaign "[campaign slug]" \
  --old-element "[changed positioning element]" \
  --required-update "[what needs updating]" \
  --deadline "[ISO date]"
```

If no deprecation items were collected (user typed "skip" in 3d), skip this step.

---

## Step 6: Completion Banner

```
takeToMarket > POSITIONING SHIFT COMPLETE

Old positioning archived in POSITIONING.md History table.
New positioning is now active for all future campaigns.

Changes logged: .taketomarket/DRIFT-LOG.md
Deprecation items: [count] (deadline: [DEPRECATION_DEADLINE or "N/A"])
Active campaigns: [ACTIVE_COUNT] -- review migration plan above

Next steps:
[If active campaigns]: Re-run /ttm-verify <slug> for campaigns marked "re-verify"
[If deprecation items]: Update shipped assets before [DEPRECATION_DEADLINE]
[Always]: Run /ttm-positioning-check periodically to monitor drift
```

</process>

<success_criteria>
- [ ] User provided explicit reasoning for the positioning change
- [ ] All 5 structured positioning fields collected (differentiator, category, audience, proof points, must-not-say)
- [ ] Active campaigns detected and migration plan generated (if any exist)
- [ ] Deprecation schedule set for shipped assets (if any exist)
- [ ] Before/after diff presented showing all changed fields
- [ ] Human approval gate passed (Approve/Revise/Cancel with Approve required)
- [ ] Old positioning archived in POSITIONING.md History table before update
- [ ] History table entry sanitized (no pipes, backticks, newlines; max 100 chars)
- [ ] POSITIONING.md _SUMMARY and END_SUMMARY delimiters preserved
- [ ] Shift event appended to DRIFT-LOG.md via CLI
- [ ] Deprecation entries appended to DRIFT-LOG.md via CLI
- [ ] Completion banner displayed with next steps
</success_criteria>

<output>
- `.taketomarket/POSITIONING.md` (updated with new positioning and History table entry)
- `.taketomarket/DRIFT-LOG.md` (shift event appended + deprecation entries)
</output>
