# Phase 6: Positioning Invariant System - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 16 (5 new, 11 modified)
**Analogs found:** 16 / 16

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `workflows/reference-mgmt/positioning-check.md` | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |
| `workflows/reference-mgmt/positioning-shift.md` | workflow | request-response | `workflows/lifecycle/review.md` | role-match |
| `bin/lib/drift-log.cjs` | service | CRUD (append-only) | `bin/lib/deviation.cjs` | exact |
| `templates/drift-log.md` | template | N/A | `templates/deviation-log.md` | exact |
| `references/positioning-check-report.md` | reference | N/A | `references/review-checklist.md` | role-match |
| `bin/lib/campaign.cjs` (extend) | service | CRUD | `bin/lib/campaign.cjs` (self) | exact |
| `bin/ttm-tools.cjs` (extend) | config/router | request-response | `bin/ttm-tools.cjs` (self) | exact |
| `skills/ttm-positioning-check/SKILL.md` (update) | config | N/A | `skills/ttm-positioning-check/SKILL.md` (self) | exact |
| `skills/ttm-positioning-shift/SKILL.md` (update) | config | N/A | `skills/ttm-positioning-shift/SKILL.md` (self) | exact |
| `references/context-loading.md` (modify) | reference | N/A | `references/context-loading.md` (self) | exact |
| `workflows/lifecycle/brief.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |
| `workflows/lifecycle/produce.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |
| `workflows/lifecycle/verify.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` (self) | exact |
| `workflows/lifecycle/review.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |
| `workflows/lifecycle/fix.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |
| `workflows/lifecycle/ship.md` (modify) | workflow | request-response | `workflows/lifecycle/verify.md` | role-match |

## Pattern Assignments

### `workflows/reference-mgmt/positioning-check.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/verify.md`

This is the primary new workflow. It reuses GATE-01 evaluation logic for cross-campaign drift auditing. verify.md is the closest analog because both: (1) load context via the two-tier strategy, (2) evaluate assets against gates, (3) produce structured findings, and (4) record results via CLI.

**Workflow wrapper pattern** (verify.md lines 1-13):
```markdown
<purpose>
Verification workflow for /ttm-verify. Evaluates every produced asset against
10 base quality gates...
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/base-gates.md
@${CLAUDE_PLUGIN_ROOT}/gates/gate-evaluation.md
</required_reading>
```

For positioning-check, adapt `<required_reading>` to load:
- `references/context-loading.md`
- `gates/gate-evaluation.md` (for GATE-01 reuse)
- `references/positioning-check-report.md` (new -- report format)

**Text-mode detection pattern** (verify.md lines 17-38):
```markdown
## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```
```

**Context loading pattern** (verify.md lines 42-86):
```markdown
## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

**Load Tier 1 summaries** from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
[... all 9 files ...]

**Load Tier 2 (full content)** for gate evaluation:
- `.marketing/POSITIONING.md` (needed for GATE-01 Positioning Drift)
```

For positioning-check, Tier 2 loads only POSITIONING.md (per context-loading.md matrix line 56).

**Campaign state check via CLI** (verify.md lines 94-97):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

For positioning-check, use the new `campaign list` subcommand instead:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --since 30d --raw
```

**GATE-01 evaluation logic to reuse** (gate-evaluation.md lines 55-67):
```markdown
### Evaluating GATE-01: Positioning Drift

**Load:** `.marketing/POSITIONING.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the asset restate or naturally extend the primary differentiator from POSITIONING.md? Or does it introduce a different claim?
2. Are all factual claims in the asset backed by proof points in the POSITIONING.md proof point library?
3. Does the asset contain any terms from the POSITIONING.md must-not-say list?
```

**Deviation CLI append pattern** (verify.md lines 300-313) -- adapt for drift-log CLI:
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
  --justification "[user's justification]" \
  --run ${RUN_NUMBER}
```

For positioning-check, adapt to:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" drift-log append \
  --event-type audit \
  --source "/ttm-positioning-check" \
  --details "[aggregate drift summary]" \
  --affected [asset count]
```

**Completion banner pattern** (verify.md lines 411-424):
```markdown
**Display completion banner:**
```
takeToMarket > VERIFICATION COMPLETE

Run: ${RUN_NUMBER} | Result: [PASS/WARN/FAIL]
Assets verified: ${ASSET_COUNT}
[...]

Report: .marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md
Next: Run /ttm-review ${SLUG} to conduct human review
```
```

**Success criteria and output blocks** (verify.md lines 429-441):
```markdown
<success_criteria>
- [ ] All assets from MANIFEST.json evaluated against all 10 gates
[...]
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md` (verification report)
</output>
```

---

### `workflows/reference-mgmt/positioning-shift.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/review.md`

review.md is the closest analog because both: (1) present information to the user for decision, (2) use AskUserQuestion for multi-option approval, (3) collect structured feedback, and (4) update state after human approval.

**Structured user interview pattern** (review.md lines 186-213):
```markdown
### Question 1: Positioning Reinforcement
Using AskUserQuestion (or text-mode), ask:
"Does this asset reinforce your positioning..."
Record the answer.

### Question 2: Outcome Realism
"Is the outcome metric target realistic..."
Record the answer.
```

For positioning-shift, adapt to the shift interview questions:
1. "What is the reasoning for this positioning change?"
2. "What is the new positioning?" (collect all structured fields)
3. "What is the migration plan for active campaigns?"
4. "What is the deprecation schedule for shipped assets?"

**Approval outcome collection pattern** (review.md lines 216-222):
```markdown
### Collect Hero Outcome (D-03)
Present outcome selection using AskUserQuestion (or text-mode numbered list):
```
Select outcome for [HERO_ASSET_NAME]:
1. Approve -- asset is ready for shipping
2. Revise -- asset needs changes
3. Reject -- asset is fundamentally wrong
```
```

For positioning-shift, adapt to the approval gate:
```
1. Approve -- Apply the new positioning
2. Revise -- Go back and modify the proposed positioning
3. Cancel -- Abandon the shift entirely
```

**State update pattern** (review.md lines 354-360):
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.run_count ${RUN_NUMBER}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.overall_result "[result]"
```

---

### `bin/lib/drift-log.cjs` (service, CRUD append-only)

**Analog:** `bin/lib/deviation.cjs` -- **exact match**

drift-log.cjs follows the identical structure as deviation.cjs. The only differences are: the file path (`.marketing/DRIFT-LOG.md` vs campaign-scoped DEVIATIONS.md), the allowlists (event types instead of gates), and the table column schema.

**Module header and imports** (deviation.cjs lines 1-19):
```javascript
/**
 * Deviation -- Append-only deviation log operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile
 *
 * Exports: cmdDeviationAppend
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {
  output,
  error,
  safeReadFile,
  safeWriteFile,
} = require('./core.cjs');
```

For drift-log.cjs, change exports to `cmdDriftLogAppend`.

**Allowlist validation pattern** (deviation.cjs lines 22-29):
```javascript
const ALLOWED_GATES = new Set([
  'positioning_drift', 'claim_accuracy', 'voice_drift',
  'outcome_alignment', 'funnel_integrity', 'utm_hygiene',
  'compliance', 'competitor_collision', 'icp_fit',
  'format_correctness',
]);

const ALLOWED_RESULTS = new Set(['accepted', 'correct', 'escalated']);
```

For drift-log.cjs, replace with:
```javascript
const ALLOWED_EVENT_TYPES = new Set(['shift', 'audit', 'deviation']);
```

**Input sanitization pattern** (deviation.cjs lines 37-48):
```javascript
function sanitizeJustification(text) {
  if (!text) return '';
  return text
    .replace(/`/g, "'")
    .replace(/\$/g, '')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\|/g, '-')
    .replace(/[<>]/g, '')
    .substring(0, 100)
    .trim();
}
```

Reuse exactly. Increase `.substring(0, 200)` for the `details` field since audit summaries are longer than justification text.

**Path security and TOCTOU defense** (deviation.cjs lines 67-112):
```javascript
// Validate slug via path.resolve to prevent traversal
const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
const projectRoot = path.resolve(process.cwd());
const campaignDir = path.resolve(projectRoot, '.marketing', 'CAMPAIGNS', safe);
if (!campaignDir.startsWith(projectRoot)) {
  error('campaign path escapes project directory');
}

// [...]

// Atomically create DEVIATIONS.md if it does not exist (prevents TOCTOU race)
const templatePath = path.resolve(__dirname, '..', '..', 'templates', 'deviation-log.md');
const template = safeReadFile(templatePath);
const initialContent = template
  ? template.replace(/\[SLUG\]/g, safe).replace(/\[ISO_TIMESTAMP\]/g, timestamp)
  : [/* fallback content */].join('\n');
try {
  fs.writeFileSync(deviationsPath, initialContent, { flag: 'wx', encoding: 'utf-8' });
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
  // File already exists -- proceed to append
}
```

For drift-log.cjs, the path is project-global (`.marketing/DRIFT-LOG.md`), not campaign-scoped. Simplify path resolution but keep TOCTOU defense via `wx` flag.

**Table row append pattern** (deviation.cjs lines 114-144):
```javascript
// Read current content and append new entry
const content = safeReadFile(deviationsPath);
if (content === null) {
  error(`Failed to read DEVIATIONS.md for campaign: ${safe}`);
}

const newRow = `| ${timestamp} | ${gateLower} | ${tier} | ${resultLower} | ${safeAsset} | ${finding} | ${action} | ${safeJustification} | ${run} |`;

// Append after the last line of content
const updated = content.trimEnd() + '\n' + newRow + '\n';
safeWriteFile(deviationsPath, updated);

output(
  { appended: true, gate: gateLower, result: resultLower, asset: safeAsset, timestamp },
  raw,
  `appended ${gateLower}=${resultLower}`
);
```

For drift-log.cjs, change column schema to: `| ${timestamp} | ${eventType} | ${source} | ${sanitizedDetails} | ${affectedCount} |`

---

### `templates/drift-log.md` (template)

**Analog:** `templates/deviation-log.md` -- **exact match**

**Full template** (deviation-log.md lines 1-12):
```markdown
# Deviation Log

**Campaign:** [SLUG]
**Created:** [ISO_TIMESTAMP]

This file is **append-only**. New entries are added at the bottom after the table. Never overwrite or reorder existing entries. Each `/ttm-verify` run that produces Accept+log or Correct actions appends entries here.

## Deviations

| Timestamp | Gate | Tier | Result | Asset | Finding | Action | Justification | Verify Run |
|-----------|------|------|--------|-------|---------|--------|---------------|------------|
<!-- NEW ENTRIES BELOW THIS LINE -->
```

For drift-log.md, adapt: remove `[SLUG]` (project-global), change table columns to match D-14 schema, add Deprecation Backlog section.

---

### `references/positioning-check-report.md` (reference)

**Analog:** `references/review-checklist.md`

This is a supporting reference file loaded via @-syntax to keep the main workflow under 500 lines. Follow the same structure: section-based content that the workflow references by name.

**Reference file header pattern** (review-checklist.md lines 1-7, from earlier inspection of similar files):
```markdown
# [Reference Name]

## Usage

Referenced by `workflows/reference-mgmt/positioning-check.md` via @-syntax.
[Purpose description]
```

Also follows the pattern from `workflows/lifecycle/brief-positioning-check.md` for per-check structured evaluation format (lines 12-64 of that file):
```markdown
## Check 1: Positioning Anchor Alignment

**Field:** Brief's "Positioning Anchor > Key message"
**Checks against:** POSITIONING.md primary differentiator phrase

- PASS: [criteria]
- WARN: [criteria]
- FAIL: [criteria]

**Drift detail format:** "[template string]"
```

---

### `bin/lib/campaign.cjs` (extend with cmdCampaignList)

**Analog:** `bin/lib/campaign.cjs` (self -- existing CRUD pattern)

**Function signature and path resolution** (campaign.cjs lines 30-40):
```javascript
function resolveCampaignStatePath(slug) {
  if (!slug || !slug.trim()) error('campaign slug required');
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const statePath = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', safe, 'STATE.md');
  const projectRoot = path.resolve(process.cwd());
  if (!statePath.startsWith(projectRoot)) {
    error('campaign STATE.md path escapes project directory');
  }
  return statePath;
}
```

**Output pattern** (campaign.cjs line 162):
```javascript
output({ created: true, slug: safe, name, path: statePath }, raw, safe);
```

New `cmdCampaignList` follows the same output convention. Returns `{ campaigns: [...], count: N }` in JSON mode, `"N campaigns"` in raw mode.

**Module exports extension** (campaign.cjs lines 244-248):
```javascript
module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
};
```

Add `cmdCampaignList` to exports.

---

### `bin/ttm-tools.cjs` (extend with new subcommands)

**Analog:** `bin/ttm-tools.cjs` (self)

**Subcommand router case pattern** (ttm-tools.cjs lines 78-96):
```javascript
case 'deviation': {
  const devArgs = args.slice(1).filter(a => a !== '--raw');
  const devCmd = devArgs[0];
  if (devCmd === 'append') {
    const { cmdDeviationAppend } = require('./lib/deviation.cjs');
    const parsed = parseNamedArgs(args.slice(2));
    const extra = {
      gate_id: parsed.named['gate-id'],
      tier: parsed.named.tier,
      finding: parsed.named.finding,
      action: parsed.named.action,
      run: parsed.named.run,
    };
    cmdDeviationAppend(parsed.named.slug, parsed.named.gate, parsed.named.result, parsed.named.justification, parsed.named.asset, raw, extra);
  } else {
    error('deviation subcommand required: append');
  }
  break;
}
```

Add two new cases:
1. `drift-log` case -- mirrors `deviation` case structure, routes `append` subcommand to `drift-log.cjs`
2. Extend `campaign` case -- add `list` subcommand routing to `cmdCampaignList`

**Campaign case extension point** (ttm-tools.cjs lines 64-76):
```javascript
case 'campaign': {
  const { cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate } = require('./lib/campaign.cjs');
  const campaignArgs = args.slice(1).filter(a => a !== '--raw');
  const subCmd = campaignArgs[0];
  // [...]
  if (subCmd === 'init') cmdCampaignInit(slug, campaignArgs.slice(2).join(' '), raw);
  else if (subCmd === 'state') cmdCampaignState(slug, raw);
  else if (subCmd === 'update') cmdCampaignUpdate(slug, campaignArgs[2], campaignArgs[3], raw);
  else error('campaign subcommand required: init, state, update');
  break;
}
```

Add `else if (subCmd === 'list')` branch. Pass filter flags (`--active`, `--since`, `--shipped-since-last-audit`).

---

### `skills/ttm-positioning-check/SKILL.md` (update from stub)

**Analog:** Self (existing stub)

The stub already has correct frontmatter (`disable-model-invocation: false`, `allowed-tools: Read Bash Glob Grep`). Update: replace "Not yet implemented" with final routing instruction. Keep the same thin-skill pattern used by all existing SKILL.md files.

**Current stub** (lines 1-22):
```yaml
---
name: ttm-positioning-check
description: >
  Sample recent assets and report positioning drift percentage, types, and
  bleeding analysis. Auto-triggers when potential positioning drift is detected.
disable-model-invocation: false
allowed-tools: Read Bash Glob Grep
---
```

Remove `**Status:** Not yet implemented (Phase 6)` line. Keep routing instruction.

---

### `skills/ttm-positioning-shift/SKILL.md` (update from stub)

**Analog:** Self (existing stub)

Same pattern as positioning-check. Already has `disable-model-invocation: true` and `allowed-tools: Read Write Bash Glob Grep`. Update status and routing.

---

### Lifecycle workflow modifications (brief, produce, verify, review, fix, ship)

**Analog:** Pattern from RESEARCH.md (D-10 enforcement instruction block)

All 6 lifecycle workflows get the same read-only enforcement instruction added after their `<required_reading>` block. This is a new cross-cutting pattern -- no existing analog exists in the codebase. The RESEARCH.md proposes a specific format:

```markdown
<!-- Add after the <required_reading> block in each lifecycle workflow -->

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>
```

This follows the XML-block convention already used in all workflows (`<purpose>`, `<required_reading>`, `<process>`, `<success_criteria>`, `<output>`).

---

### `references/context-loading.md` (modify loading matrix)

**Analog:** Self

Add `/ttm-positioning-shift` row to the loading matrix (context-loading.md line 56 area):

```markdown
| /ttm-positioning-shift | Yes | POSITIONING.md |
```

---

## Shared Patterns

### Text-Mode Detection + AskUserQuestion
**Source:** `workflows/lifecycle/verify.md` lines 17-38
**Apply to:** `positioning-check.md`, `positioning-shift.md`
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```
With fallback numbered list format:
```
[HEADER]
[QUESTION]
  1. [OPTION_1_LABEL] -- [OPTION_1_DESCRIPTION]
  2. [OPTION_2_LABEL] -- [OPTION_2_DESCRIPTION]
Type the number of your choice:
```

### Context Loading (Two-Tier)
**Source:** `references/context-loading.md` + `workflows/lifecycle/verify.md` lines 42-86
**Apply to:** `positioning-check.md`, `positioning-shift.md`

Both new workflows load all Tier 1 summaries. Tier 2 loads POSITIONING.md only.

### Campaign State CLI
**Source:** `workflows/lifecycle/verify.md` lines 94-97, `bin/ttm-tools.cjs` lines 64-76
**Apply to:** `positioning-check.md`, `positioning-shift.md`

All campaign state reads go through `ttm-tools.cjs campaign` subcommands. New `list` subcommand extends this pattern.

### Append-Only Log via CLI
**Source:** `bin/lib/deviation.cjs` (full file), `workflows/lifecycle/verify.md` lines 300-313
**Apply to:** `drift-log.cjs`, `positioning-check.md`, `positioning-shift.md`

All DRIFT-LOG.md writes go through `ttm-tools.cjs drift-log append`. Key patterns:
- Input sanitization (strip pipes, backticks, newlines, limit length)
- TOCTOU defense via `fs.writeFileSync` with `wx` flag
- Allowlist validation for event types
- Template-based initialization from `templates/drift-log.md`

### Completion Banner
**Source:** `workflows/lifecycle/verify.md` lines 411-424, `workflows/lifecycle/ship.md` lines 438-465
**Apply to:** `positioning-check.md`, `positioning-shift.md`
```
takeToMarket > [WORKFLOW NAME] COMPLETE

[Key metrics]
[Output file paths]
Next: [recommended next action]
```

### Read-Only Enforcement Instruction Block
**Source:** New pattern (RESEARCH.md D-10)
**Apply to:** All 6 lifecycle workflows (brief, produce, verify, review, fix, ship)

Uses existing `<constraints>` XML-block convention.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `templates/migration-plan.md` | template | N/A | No migration plan concept exists in the codebase yet. Use `templates/deviation-log.md` for structural inspiration (header, table, append instructions) but the schema is novel. The RESEARCH.md proposes the format in its Pattern 4 section. |

## Metadata

**Analog search scope:** `workflows/`, `bin/lib/`, `bin/`, `templates/`, `references/`, `skills/`, `gates/`
**Files scanned:** 25+
**Pattern extraction date:** 2026-04-28
