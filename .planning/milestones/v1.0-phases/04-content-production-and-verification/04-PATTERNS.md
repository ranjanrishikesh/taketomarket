# Phase 4: Content Production and Verification - Pattern Map

**Mapped:** 2026-04-24
**Files analyzed:** 9 new/modified files
**Analogs found:** 8 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `workflows/lifecycle/produce.md` | workflow/orchestrator | request-response + event-driven | `workflows/lifecycle/brief.md` | role-match |
| `workflows/lifecycle/verify.md` | workflow/orchestrator | request-response + batch | `workflows/lifecycle/brief.md` (gate section) + `workflows/lifecycle/brief-positioning-check.md` | role-match |
| `gates/gate-evaluation.md` | reference/config | batch | `workflows/lifecycle/brief-positioning-check.md` | role-match |
| `gates/base-gates.md` (expand) | reference/config | batch | `gates/base-gates.md` current stub | same-file extension |
| `skills/ttm-produce/SKILL.md` (update) | entry-point/skill | request-response | `skills/ttm-brief/SKILL.md` | exact |
| `skills/ttm-verify/SKILL.md` (update) | entry-point/skill | request-response | `skills/ttm-brief/SKILL.md` | exact |
| `bin/lib/campaign.cjs` (extend) | utility/state | CRUD | `bin/lib/campaign.cjs` current | same-file extension |
| `agents/ttm-producer.md` | agent/subagent | request-response | `workflows/lifecycle/brief.md` step structure | partial-match |
| `templates/production-manifest.json` | template/config | transform | `templates/campaign-state.md` | partial-match |

---

## Pattern Assignments

### `workflows/lifecycle/produce.md` (workflow, request-response + event-driven)

**Analog:** `workflows/lifecycle/brief.md`

**File structure pattern** (lines 1-14 of brief.md):
```markdown
<purpose>
[One-paragraph description of what this workflow delivers and its lifecycle role]
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/[other reference files via @-syntax]
</required_reading>

<process>
## Step 1: Load Context
...
</process>

<success_criteria>
- [ ] [checkboxes per deliverable]
</success_criteria>

<output>
- [file paths created]
</output>
```

**Text-mode detection pattern** (lines 18-43 of brief.md):
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

**Slug extraction pattern** (lines 51-54 of brief.md):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

**Context loading pattern** (lines 47-78 of brief.md):
```markdown
## Step 1: Load Context

Read Tier 1 summaries from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
[... all 9 files ...]

Read Tier 2 (full content) for:
- `.marketing/POSITIONING.md`    ← produce loads: POSITIONING, BRAND, ICP (D-03)
- `.marketing/BRAND.md`
- `.marketing/ICP.md`

Read campaign-specific files (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`
```

**Campaign validation pattern** (lines 82-101 of brief.md):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```
- Check `exists: false` → error with suggestion
- Check `phase` field → warn if not `"briefed"` (for produce: expected predecessor)
- Wait for user confirmation before overwriting

**State update pattern** (lines 290-302 of brief.md):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase produced
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.produced "$TIMESTAMP"
```

**Display banner pattern** (lines 48-49 and 308-325 of brief.md):
```
takeToMarket > LOADING CONTEXT
...
takeToMarket > BRIEF COMPLETE

Brief saved to .marketing/CAMPAIGNS/${SLUG}/BRIEF.md
[summary of what was done]

Next: Run /ttm-verify ${SLUG}
```

**Produce-specific additions (no direct analog — use RESEARCH.md Pattern 2):**
- Hero-first Task() call: blocking wait before derivative Task() calls
- Verify hero file exists before spawning derivatives (Pitfall 2 mitigation)
- Playbook loading: map asset type from BRIEF.md to `${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md` with graceful fallback if file missing
- Write MANIFEST.json after all assets produced (see template section below)

---

### `workflows/lifecycle/verify.md` (workflow, request-response + batch)

**Primary analog:** `workflows/lifecycle/brief.md` (overall structure)
**Secondary analog:** `workflows/lifecycle/brief-positioning-check.md` (gate evaluation pattern)

**File structure:** Same `<purpose>`, `<required_reading>`, `<process>`, `<success_criteria>`, `<output>` sections as `brief.md`.

**Required reading block:**
```markdown
<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/base-gates.md
@${CLAUDE_PLUGIN_ROOT}/gates/gate-evaluation.md
</required_reading>
```

**Context loading:** Same Tier 1 all-files pattern as brief.md Step 1, but Tier 2 loads POSITIONING.md, BRAND.md, ICP.md (per context-loading.md reference matrix for /ttm-verify). Additionally reads MANIFEST.json and all asset files from disk.

**Gate soft-fail pattern** (analog: brief.md lines 248-283 — the positioning check gate):
```markdown
## Positioning Check Gate (per D-05, LIFE-05)

Apply all checks...

**Determine gate result:**
- If ALL checks PASS: gate result = `"pass"`
- If ANY check is WARN or FAIL: gate result = `"warn"`

**If gate result is "warn":** Insert the drift warning...

The brief is written unconditionally. NEVER block brief generation on positioning drift.
```

Verify expands this to 10 gates (D-04: soft fail, no hard blocks) and adds the 3-option deviation flow (D-09) for each failure.

**Gate evaluation prompt structure** (from RESEARCH.md Pattern 3 — no codebase analog exists yet):
```markdown
## Gate: [Gate Name] ([GATE-XX])

**Reference:** Load [FILE.md] (Tier 2 full)
**Asset:** [asset content]

Evaluate this asset against the [reference] defined in [FILE.md]:

1. [Check criterion 1]
2. [Check criterion 2]
...

For each finding:
- Result: PASS | WARN | FAIL
- Evidence: Quote the exact line(s) from the asset
- Reference: Quote the positioning element being compared against
- Recommendation: What to change (if WARN or FAIL)
```

**State update for gate results** (extend brief.md line 299 pattern):
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.positioning_drift [pass|warn|fail]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" gate.claim_accuracy [pass|warn|fail]
# ... all 10 gates
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.run_count [N]
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.overall_result [pass|warn|fail]
```

---

### `gates/gate-evaluation.md` (reference, batch)

**Analog:** `workflows/lifecycle/brief-positioning-check.md`

**File structure pattern** (lines 1-10 of brief-positioning-check.md):
```markdown
# [Title]

## Usage

Referenced by `workflows/lifecycle/[workflow].md` via @-syntax.
Applied [when/how].
[Note: gate behavior description]

---

## Check 1: [Check Name]
```

**Per-gate entry pattern** (lines 15-22 of brief-positioning-check.md):
```markdown
## Check N: [Gate Name]

**Field:** [what is being checked in the asset]
**Checks against:** [reference file and section]

- PASS: [pass condition]
- WARN: [warn condition]
- FAIL: [fail condition]

**Drift detail format:** "[template string for the finding message]"
```

**Gate result logic block pattern** (lines 68-72 of brief-positioning-check.md):
```markdown
## Gate Result Logic

- If ALL checks PASS: gate result = "pass"
- If ANY check is WARN or FAIL: gate result = "warn"
- The brief is ALWAYS generated regardless of gate result (per D-05)
```

For gate-evaluation.md, there are 10 gate entries (GATE-01 through GATE-10) plus a structured output format requirement (RESEARCH.md Pitfall 4 mitigation) and the deviation handling flow (D-09).

---

### `gates/base-gates.md` (extend — reference, config)

**Same file extension.** Current file is a stub (38 lines). Phase 4 expands each gate entry to include detailed evaluation criteria.

**Current pattern** (lines 7-12 of base-gates.md):
```markdown
1. **Positioning Drift** -- GATE-01
   Verifies asset content aligns with POSITIONING.md. Any deviation from approved positioning,
   use of must-not-say terms, or claims not backed by proof points triggers a block.
```

**Expand to include:**
- Tier classification (Tier 1 or Tier 2) per gate
- Reference file(s) used for evaluation
- Evaluation criteria (what specifically is checked)
- Output format requirement (PASS/WARN/FAIL + evidence fields)

Pattern source for expansion: `brief-positioning-check.md` per-check entries (lines 15-64).

---

### `skills/ttm-produce/SKILL.md` (update — skill entry point)

**Analog:** `skills/ttm-brief/SKILL.md` (lines 1-14 — exact match)

**Current stub** (skills/ttm-produce/SKILL.md lines 1-9):
```yaml
---
name: ttm-produce
description: >
  Produce phase: generate content assets in fresh contexts loaded with brief,
  positioning, brand, ICP, and playbook. Use after a brief is approved.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task
---
```

**Target pattern** — add `context: fork` (the only missing field), remove "Status: Not yet implemented" body:
```yaml
---
name: ttm-produce
description: >
  Produce phase: generate content assets in fresh contexts loaded with brief,
  positioning, brand, ICP, and playbook. Use after a brief is approved.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
context: fork
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-produce

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/produce.md`
```

**Reference for `context: fork` + slim body:** RESEARCH.md Pattern 1 code example. The `ttm-brief` SKILL.md (lines 10-14) shows the established single-line workflow pointer body pattern.

---

### `skills/ttm-verify/SKILL.md` (update — skill entry point)

**Analog:** `skills/ttm-brief/SKILL.md` — same pattern as ttm-produce above.

```yaml
---
name: ttm-verify
description: >
  Verify phase: run all applicable quality gates on every asset with pass/fail
  report and line-level feedback. Use after production to validate assets.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
context: fork
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-verify

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/verify.md`
```

---

### `bin/lib/campaign.cjs` (extend ALLOWED_FIELDS — utility, CRUD)

**Same file extension.** No new functions needed — ALLOWED_FIELDS Set on line 176 is extended.

**Current ALLOWED_FIELDS** (lines 176-183 of campaign.cjs):
```javascript
const ALLOWED_FIELDS = new Set([
  'phase', 'name', 'last_updated',
  'phase.created', 'phase.researched', 'phase.briefed', 'phase.produced',
  'phase.verified', 'phase.reviewed', 'phase.fixed', 'phase.shipped',
  'phase.measured', 'phase.learned',
  'gate.positioning_check', 'gate.outcome_metric',
  'current_campaign',
]);
```

**Target extension** (add after `gate.outcome_metric` line):
```javascript
const ALLOWED_FIELDS = new Set([
  'phase', 'name', 'last_updated',
  'phase.created', 'phase.researched', 'phase.briefed', 'phase.produced',
  'phase.verified', 'phase.reviewed', 'phase.fixed', 'phase.shipped',
  'phase.measured', 'phase.learned',
  'gate.positioning_check', 'gate.outcome_metric',
  // Phase 4: Per-gate verification results (GATE-01 through GATE-10)
  'gate.positioning_drift', 'gate.claim_accuracy', 'gate.voice_drift',
  'gate.outcome_alignment', 'gate.funnel_integrity', 'gate.utm_hygiene',
  'gate.compliance', 'gate.competitor_collision', 'gate.icp_fit',
  'gate.format_correctness',
  // Phase 4: Verification run metadata
  'verify.run_count', 'verify.last_run', 'verify.overall_result',
  'current_campaign',
]);
```

**Also update STATE.md template** (`templates/campaign-state.md` and the `stateContent` string inside `cmdCampaignInit` at lines 77-103) to initialize all new gate fields as `null`.

**Pattern for adding new state fields** (lines 87-95 of campaign.cjs — existing null initialization pattern):
```javascript
const stateContent = [
  '---',
  `campaign: ${safe}`,
  ...
  'gate.positioning_check: null',
  'gate.outcome_metric: null',
  // Add new fields following this same pattern:
  'gate.positioning_drift: null',
  'gate.claim_accuracy: null',
  // ...
  'verify.run_count: null',
  'verify.last_run: null',
  'verify.overall_result: null',
  '---',
  ...
].join('\n');
```

---

### `agents/ttm-producer.md` (new — agent/subagent, request-response)

**Analog:** No `agents/` directory exists in the codebase. Partial analog is the Task() prompt structure from RESEARCH.md Pattern 4 (Code Examples section). The workflow step structure from `brief.md` provides structural guidance.

**Design from RESEARCH.md Pattern 4 (code example):**
```markdown
You are a marketing content producer. Read the following files and produce
{ASSET_TYPE} content for {CHANNEL}.

Files to read:
- {CAMPAIGN_DIR}/BRIEF.md (full campaign brief)
- .marketing/POSITIONING.md (positioning -- follow exactly)
- .marketing/BRAND.md (voice, tone, banned words)
- .marketing/ICP.md (target audience, language, pains)
- {PLAYBOOK_PATH} (discipline-specific rules, if exists)

Write the produced content to: {CAMPAIGN_DIR}/ASSETS/{FILENAME}.md

The asset must:
1. Serve the outcome metric defined in the brief
2. Use the positioning anchor as the foundation
3. Match the brand voice archetype
4. Address the ICP's pains in their language
5. Follow all playbook format requirements (if playbook loaded)
```

The agent file is a reusable prompt template that the produce workflow loads and populates with actual slugs, paths, and asset types before calling Task().

---

### `templates/production-manifest.json` (new — template, transform)

**Partial analog:** `templates/campaign-state.md` (structured template with placeholder conventions). The JSON format itself is established in RESEARCH.md Pattern 4 (no codebase JSON template exists yet).

**Target structure** (from RESEARCH.md Pattern 4):
```json
{
  "campaign": "[SLUG]",
  "produced_at": "[ISO_TIMESTAMP]",
  "context_loaded": {
    "brief": ".marketing/CAMPAIGNS/[SLUG]/BRIEF.md",
    "positioning": ".marketing/POSITIONING.md",
    "brand": ".marketing/BRAND.md",
    "icp": ".marketing/ICP.md"
  },
  "hero": {
    "asset_id": 1,
    "type": "[ASSET_TYPE]",
    "channel": "[CHANNEL]",
    "playbook": "playbooks/[TYPE].md",
    "file": "ASSETS/01-[asset-filename].md"
  },
  "derivatives": [],
  "total_assets": 0
}
```

**Creation pattern:** This template is read by the produce workflow which fills placeholders and writes to `.marketing/CAMPAIGNS/<slug>/MANIFEST.json`. The read-template-then-fill pattern mirrors how `campaign.cjs` reads `campaign-brief.md` and `campaign-research.md` templates (lines 108-138 of campaign.cjs).

---

## Shared Patterns

### Text-Mode Detection and AskUserQuestion Fallback
**Source:** `workflows/lifecycle/brief.md` lines 18-43
**Apply to:** `workflows/lifecycle/produce.md`, `workflows/lifecycle/verify.md` (any step with interactive prompts)
```markdown
**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```
```

The verify workflow uses AskUserQuestion for the 3-option deviation choice (D-09). Text-mode fallback must present options as a numbered list.

### Slug Extraction
**Source:** `workflows/lifecycle/brief.md` line 53 and `workflows/lifecycle/research.md` line 42
**Apply to:** `workflows/lifecycle/produce.md`, `workflows/lifecycle/verify.md`
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

### Campaign State Validation
**Source:** `workflows/lifecycle/brief.md` lines 82-105
**Apply to:** `workflows/lifecycle/produce.md` (check phase=briefed), `workflows/lifecycle/verify.md` (check phase=produced)
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```
Pattern: check `exists: false`, then check `phase` field, warn and get confirmation if phase unexpected.

### Atomic State Updates with Timestamp
**Source:** `workflows/lifecycle/brief.md` lines 290-302 and `workflows/lifecycle/research.md` lines 221-230
**Apply to:** `workflows/lifecycle/produce.md` (phase=produced), `workflows/lifecycle/verify.md` (all gate fields + phase=verified)
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" [field] [value]
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" [phase.field] "$TIMESTAMP"
```

### Tier 1 Context Loading (all 9 reference files)
**Source:** `workflows/lifecycle/research.md` lines 21-33 and `workflows/lifecycle/brief.md` lines 56-66
**Apply to:** Both produce.md and verify.md Step 1
```markdown
Read Tier 1 summary blocks (content between `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->`)
from all 9 `.marketing/` reference files:
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md`
- `.marketing/COMPETITORS.md`
- `.marketing/METRICS.md`
- `.marketing/LEARNINGS.md`
```

### Workflow Display Banners
**Source:** `workflows/lifecycle/brief.md` lines 48-49, 211, 248-249, 308
**Apply to:** All workflow steps
```
takeToMarket > LOADING CONTEXT
takeToMarket > GENERATING [ARTIFACT]
takeToMarket > [PHASE NAME] COMPLETE

[Artifact] saved to [path]
[Summary of what was done]

Next: Run /ttm-[next-command] ${SLUG}
```

### Soft Gate Pattern (evaluate → warn → options → record)
**Source:** `workflows/lifecycle/brief.md` lines 247-283 (Step 6 — Positioning Check Gate)
**Apply to:** `workflows/lifecycle/verify.md` gate evaluation loop (all 10 gates)

The brief.md gate is a simplified 2-outcome (pass/warn) version. Verify extends it to 3-outcome (pass/warn/fail) with 3 deviation options per failure (D-09). The structural logic (evaluate all checks, aggregate result, present options without blocking) is identical.

### @-Syntax for Required Reading
**Source:** `workflows/lifecycle/brief.md` lines 10-14, `workflows/lifecycle/research.md` lines 8-11
**Apply to:** produce.md and verify.md `<required_reading>` blocks
```markdown
<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/gates/base-gates.md
</required_reading>
```

### SKILL.md Minimal Body Pattern
**Source:** `skills/ttm-brief/SKILL.md` lines 10-14
**Apply to:** Updated `skills/ttm-produce/SKILL.md` and `skills/ttm-verify/SKILL.md`
```markdown
# /ttm-[command]

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/[workflow].md`
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns and the patterns above):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `agents/ttm-producer.md` | agent/subagent | request-response | No `agents/` directory exists; Task() subagent prompt definitions are new to Phase 4 |

---

## Additional Notes for Planner

### File Size Constraint
Per CLAUDE.md: no single file exceeds 500 lines. `brief.md` is 344 lines. `produce.md` and `verify.md` will be complex — use @-syntax for gate definitions and agent prompts to stay under 500 lines.

### Playbooks Directory
`playbooks/` directory exists in the repo but is empty (Phase 8 creates content). Phase 4 produce workflow must handle `playbooks/<type>.md` not found with a graceful fallback and warning — do not error out.

### DEVIATIONS.md Append Pattern
No existing analog for append-only log. RESEARCH.md Pitfall 6 recommends a `bin/ttm-tools.cjs` subcommand (e.g., `deviation append`) that takes structured input and writes consistent markdown. The `cmdCampaignUpdate` pattern in `campaign.cjs` (lines 185-207) shows how a new CLI subcommand is added to the router in `ttm-tools.cjs` (lines 64-75).

### Production Manifest Write Location
`.marketing/CAMPAIGNS/<slug>/MANIFEST.json` — written by the produce workflow after all assets are confirmed on disk. The `safeWriteFile` helper in `bin/lib/core.cjs` (lines 91-95) handles directory creation automatically.

### Test Files
RESEARCH.md validation architecture requires two new test files that do not have analogs:
- `tests/test-manifest.cjs` — covers manifest creation and structure
- `tests/test-gate-fields.cjs` — covers ALLOWED_FIELDS extension and tier mapping

Pattern: follow existing test runner using Node.js built-in `node --test` (no external test framework).

---

## Metadata

**Analog search scope:** `workflows/lifecycle/`, `skills/`, `gates/`, `bin/lib/`, `templates/`, `references/`, `bin/ttm-tools.cjs`
**Files scanned:** 18
**Pattern extraction date:** 2026-04-24
