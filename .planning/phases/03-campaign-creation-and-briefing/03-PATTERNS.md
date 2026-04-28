# Phase 3: Campaign Creation and Briefing - Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 9 new/modified files
**Analogs found:** 8 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `workflows/setup/new-campaign.md` | workflow | request-response (scaffold) | `workflows/setup/init.md` | exact |
| `workflows/lifecycle/research.md` | workflow | request-response (AI + MCP tools) | `workflows/setup/init.md` | role-match |
| `workflows/lifecycle/brief.md` | workflow | request-response (interview + gate) | `workflows/setup/init.md` | exact |
| `workflows/lifecycle/brief-positioning-check.md` | reference | static (gate rules) | `workflows/setup/init-validation.md` | role-match |
| `templates/campaign-state.md` | template | static | `templates/reference-files/state.md` | exact |
| `templates/campaign-research.md` | template | static | `templates/campaign-brief.md` | role-match |
| `bin/lib/campaign.cjs` | utility | CRUD (state file ops) | `bin/lib/state.cjs` | exact |
| `skills/ttm-new-campaign/SKILL.md` | config (update stub) | request-response | `skills/ttm-init/SKILL.md` | exact |
| `skills/ttm-research/SKILL.md` | config (update stub) | request-response | `skills/ttm-init/SKILL.md` | exact |
| `skills/ttm-brief/SKILL.md` | config (update stub) | request-response | `skills/ttm-init/SKILL.md` | exact |

_Note: `skills/ttm-new-campaign/SKILL.md`, `skills/ttm-research/SKILL.md`, and `skills/ttm-brief/SKILL.md` are grouped under one row in the table above for clarity. Each is a separate stub update following the same pattern._

---

## Pattern Assignments

### `workflows/setup/new-campaign.md` (workflow, request-response scaffold)

**Analog:** `workflows/setup/init.md`

**Structural wrapper pattern** (init.md lines 1-11):
```markdown
<purpose>
Campaign scaffolding workflow that creates CAMPAIGNS/<slug>/ directory with
initialized STATE.md, empty RESEARCH.md, empty BRIEF.md, and ASSETS/ directory.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<process>
```

Every workflow MUST use `<purpose>`, `<required_reading>`, `<process>`, `<success_criteria>`, and `<output>` XML tags as top-level structure.

**Pre-flight check pattern** (init.md lines 44-52):
```markdown
## Step 1: Pre-flight

Run init status check:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw
```

If result is "not initialized": Tell the user to run `/ttm-init` first. Exit.
If result is "initialized": Continue to Step 2.
```

**Slug generation pattern** (derived from bin/lib/slug.cjs lines 21-31 and ttm-tools.cjs lines 29-32):
```markdown
## Step 2: Generate Slug

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs slug "$ARGUMENTS" --raw
```

Store result as CAMPAIGN_SLUG.
```

Never generate slugs via AI. The slug command strips all non-alphanumeric chars via `/[^a-z0-9]+/g` and caps at 60 characters.

**Existence check and directory creation pattern** (init.md lines 67-75):
```markdown
## Step 3: Check for Existing Campaign

```bash
ls .marketing/CAMPAIGNS/${CAMPAIGN_SLUG}/ 2>/dev/null && echo "exists" || echo "new"
```

If "exists": Warn and ask user to confirm overwrite or pick a different name.
If "new": Continue.

## Step 4: Create Scaffold

```bash
mkdir -p .marketing/CAMPAIGNS/${CAMPAIGN_SLUG}/ASSETS
```

Write STATE.md from template (see campaign-state.md).
Write empty RESEARCH.md from template (see campaign-research.md).
Write empty BRIEF.md from template (see campaign-brief.md).
```

**Timestamp pattern** (init.md line 288 and slug.cjs lines 38-54):
```markdown
Get current ISO timestamp:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw
```

Use this value for `created`, `last_updated`, and `phase.created` fields in STATE.md.
```

**Stage banner pattern** (init.md lines 45, 136, 275 — consistent `takeToMarket > LABEL` format):
```markdown
```
takeToMarket > CREATING CAMPAIGN: ${CAMPAIGN_SLUG}
```
```

**State update pattern** (init.md lines 382-386 and state.cjs lines 68-91):
```markdown
## Step 5: Update Global State

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update current_campaign ${CAMPAIGN_SLUG}
```
```

**Success criteria and output pattern** (init.md lines 428-435):
```markdown
<success_criteria>
- [ ] init check passed (system is initialized)
- [ ] slug generated deterministically
- [ ] CAMPAIGNS/<slug>/ directory created
- [ ] STATE.md, RESEARCH.md, BRIEF.md, ASSETS/ all exist
- [ ] global STATE.md current_campaign updated
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/<slug>/STATE.md`
- `.marketing/CAMPAIGNS/<slug>/RESEARCH.md`
- `.marketing/CAMPAIGNS/<slug>/BRIEF.md`
- `.marketing/CAMPAIGNS/<slug>/ASSETS/` (empty directory)
</output>
```

---

### `workflows/lifecycle/research.md` (workflow, request-response + AI research)

**Analog:** `workflows/setup/init.md` (role-match — multi-step AI workflow with file output)

**Structural wrapper** — same `<purpose>/<required_reading>/<process>/<success_criteria>/<output>` tags as init.md.

**Tier 1 + selective Tier 2 context loading pattern** (references/context-loading.md lines 41-60):
```markdown
## Step 1: Load Context

Read Tier 1 summary blocks from all 9 reference files:
- `.marketing/POSITIONING.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/BRAND.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/ICP.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/CHANNELS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/COMPETITORS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/METRICS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/LEARNINGS.md` (lines 1 to `<!-- END_SUMMARY -->`)

Read Tier 2 (full content) for:
- `.marketing/COMPETITORS.md` (per context-loading.md loading matrix — research loads Tier 2 COMPETITORS.md)

Read campaign-specific files (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
```

**Campaign slug validation pattern** (derived from init.md Step 1 pattern):
```markdown
## Step 2: Validate Campaign

```bash
ls .marketing/CAMPAIGNS/$ARGUMENTS/STATE.md 2>/dev/null && echo "exists" || echo "missing"
```

If "missing": Tell user the campaign does not exist. Suggest running `/ttm-new-campaign` first. Exit.
If "exists": Continue.
```

**Phase ordering check pattern** (CONTEXT.md D-08 — warn, not block):
```markdown
## Step 3: Phase Order Check

Read campaign STATE.md:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign state ${SLUG} --raw
```

Check `phase` field. If phase is not "created": Warn user:
"Campaign is already in phase [X]. Running research again will overwrite RESEARCH.md.
 Proceed anyway? (yes/no)"

Wait for confirmation before continuing.
```

**Web search tool detection pattern** (RESEARCH.md Pattern 3):
```markdown
## Step 4: Tool Detection

Attempt a minimal WebSearch call to detect tool availability.

If WebSearch succeeds:
  Set SEARCH_MODE=web
  Proceed with automated SERP analysis using WebSearch and WebFetch.

If WebSearch is not available or fails:
  Set SEARCH_MODE=manual
  Tell user:
  "Web search tools are not available in this session.
   To get the best research, please paste:
   1. Google search results for: [suggested queries based on campaign goal]
   2. Any competitor blog posts or landing pages you want analyzed
   3. Reddit/forum discussions about [campaign topic]

   Paste your findings and I will analyze them."
```

**Research output generation pattern** (derived from init.md Step 9 template-fill pattern, lines 279-295):
```markdown
## Step 5: Generate RESEARCH.md

Read the template:
`${CLAUDE_PLUGIN_ROOT}/templates/campaign-research.md`

Fill all sections with research findings:
- Market Context: insights with HIGH/MEDIUM/LOW confidence tags
- Competitor Content Analysis: what competitors are publishing
- Audience Insights: ICP-aligned insights from Tier 1 ICP.md summary + research
- Ambient Narrative: what the market already believes
- Content Gaps: opportunities where no quality content exists

Tag every insight with confidence:
- HIGH: verified via web search with source URL or cited data
- MEDIUM: user-provided paste or inferred from known competitor data
- LOW: AI inference without direct evidence

Write to `.marketing/CAMPAIGNS/${SLUG}/RESEARCH.md`
```

**Campaign state update pattern** (state.cjs lines 68-91, adapted for campaign path):
```markdown
## Step 6: Update Campaign State

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase researched
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase.researched $(node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw)
```
```

---

### `workflows/lifecycle/brief.md` (workflow, request-response interview + enforcement gates)

**Analog:** `workflows/setup/init.md` (exact match — multi-section interview with validation gates and file generation)

**Structural wrapper** — same `<purpose>/<required_reading>/<process>/<success_criteria>/<output>` tags as init.md.

**Tier 1 + Tier 2 context loading pattern** (context-loading.md lines 43-46 — brief loads Tier 2 ICP, CHANNELS, METRICS, CALENDAR):
```markdown
## Step 1: Load Context

Read Tier 1 summaries from all 9 reference files (same as research.md Step 1).

Read Tier 2 (full content) for:
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/METRICS.md`
- `.marketing/CALENDAR.md`

Read campaign-specific files (always full-load):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/RESEARCH.md`
```

**Phase order warning pattern** (CONTEXT.md D-08):
```markdown
## Step 2: Phase Order Check

If campaign state `phase` is "created" (not "researched"):
  Warn: "Research not yet completed for this campaign.
         Brief quality will be limited without research data.
         Run /ttm-research ${SLUG} first for better results.
         Proceed without research? (yes/no)"

Wait for user confirmation.
```

**Text-mode detection pattern** (init.md lines 17-39):
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

**Outcome metric enforcement pattern** (RESEARCH.md Pattern 5, init-validation.md Section 6 lines 108-114):
```markdown
## Step 3: Outcome Metric Enforcement

Ask (freeform, NOT AskUserQuestion):
"What is the outcome metric for this campaign?
 Example: 'increase trial signups by 20% within 30 days'
 NOT an output: 'publish 4 blog posts'"

Validate: The answer must describe a business outcome, not an output action.
- FAIL if metric is an output only (starts with "publish", "write", "send", "create")
- FAIL if no target value or measurement window present

On FAIL, re-prompt:
```
Your outcome metric is an output, not an outcome. Here is the difference:
  - Output (not valid): "publish 4 blog posts"
  - Outcome (valid): "increase trial signups by 20% within 30 days"
Please provide a business outcome with a target value.
```

After 2 failed retries: Block brief generation entirely. Tell user:
"Cannot generate a brief without an outcome metric. Run /ttm-brief again when ready."
Exit.

On PASS: Store as OUTCOME_METRIC. Set gate.outcome_metric = "pass" in campaign STATE.md.

Ask (freeform):
"What are the output metrics -- assets and volume?"

If empty: Store note OUTPUT_METRIC_MISSING=true. Continue to Step 4.
```

**AskUserQuestion structured choice pattern for channel mix** (init.md lines 83-99 and init-questions.md Section 4 lines 122-143):
```markdown
Use AskUserQuestion for channel selection:
- header: "Channels"
- question: "Which channels will this campaign use?"
- multiSelect: true
- options: [derive from CHANNELS.md active channels list]
```

**Template-fill file generation pattern** (init.md Step 9, lines 279-295):
```markdown
## Step 5: Generate BRIEF.md

Read the template:
`${CLAUDE_PLUGIN_ROOT}/templates/campaign-brief.md`

Fill ALL `[GENERATED BY /ttm-brief]` placeholders with:
- Goal: user-provided goal statement
- Outcome metric: OUTCOME_METRIC collected in Step 3
- Output metric: from Step 3 (or flag if missing)
- ICP segment: from Tier 2 ICP.md primary segment
- Positioning anchor: from Tier 1 POSITIONING.md summary differentiator
- Hook: derived from research ambient narrative + positioning anchor
- Proof points: from POSITIONING.md proof point library
- Channel mix: from user AskUserQuestion selection + CHANNELS.md baselines
- Assets list: derived from output metric + channel mix

If OUTPUT_METRIC_MISSING=true, add to BRIEF.md:
<!-- OUTPUT_METRIC_MISSING: Add output metrics before /ttm-produce -->
```

**Soft positioning gate pattern** (RESEARCH.md Pattern 4, D-05):
```markdown
## Step 6: Positioning Check Gate

Read POSITIONING.md Tier 1 summary fields:
- Primary differentiator
- Must-not-say terms
- Proof point sources

Check generated BRIEF.md content against each:
1. Does positioning anchor align with primary differentiator?
2. Does ICP segment match POSITIONING.md target audience?
3. Are all proof points sourced from the proof point library?
4. Does the brief contain any must-not-say terms?
5. Does the hook reinforce rather than contradict positioning?

If ALL checks pass:
  Update campaign STATE.md: gate.positioning_check = pass
  Write BRIEF.md as-is.

If ANY check fails:
  Update campaign STATE.md: gate.positioning_check = warn
  Insert at top of BRIEF.md after the title:

  <!--
  !! POSITIONING DRIFT WARNING !!
  The following items may not align with your positioning:
  - [specific drift item with field name]
  - [specific drift item with field name]
  Review .marketing/POSITIONING.md and adjust the brief if needed.
  Run /ttm-positioning-check for a full audit.
  -->

  Write BRIEF.md WITH the warning block. Do NOT block brief generation (D-05 is explicit).
```

**Campaign state update pattern** (state.cjs cmdStateUpdate, lines 68-91):
```markdown
## Step 7: Update Campaign State

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase briefed
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase.briefed $(node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw)
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} gate.outcome_metric pass
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} gate.positioning_check [pass|warn]
```
```

---

### `workflows/lifecycle/brief-positioning-check.md` (reference, gate rules)

**Analog:** `workflows/setup/init-validation.md` (role-match — static reference file of validation criteria)

This file is referenced by `brief.md` via `@` syntax. It externalizes the positioning check field-by-field rules so `brief.md` stays under 500 lines.

**Structure pattern** (init-validation.md lines 1-20 — section-per-concern with PASS/FAIL criteria):
```markdown
# Positioning Check Rules

## Usage

Referenced by `workflows/lifecycle/brief.md` via @-syntax.
Applied during Step 6 of brief generation to detect positioning drift.

---

## Check 1: Positioning Anchor Alignment

**Field:** Brief's "Positioning Anchor > Key message"
- PASS: Restates or extends the POSITIONING.md primary differentiator
- FAIL: Uses a different differentiation claim not in POSITIONING.md
- WARN: Partially overlaps but adds unsupported claims

## Check 2: Must-Not-Say Terms
...

## Drift Warning Template

When any check returns FAIL or WARN, insert into BRIEF.md:
<!--
!! POSITIONING DRIFT WARNING !!
...
-->
```

---

### `templates/campaign-state.md` (template, static)

**Analog:** `templates/reference-files/state.md` (exact match — YAML frontmatter + body template)

**Frontmatter schema pattern** (state.md lines 1-7, extended to flat dot-notation per RESEARCH.md Pitfall 2):
```yaml
---
campaign: [SLUG]
name: [CAMPAIGN_NAME]
created: [TIMESTAMP]
phase: created
last_updated: [TIMESTAMP]
phase.created: [TIMESTAMP]
phase.researched: null
phase.briefed: null
phase.produced: null
phase.verified: null
phase.reviewed: null
phase.fixed: null
phase.shipped: null
phase.measured: null
phase.learned: null
gate.positioning_check: null
gate.outcome_metric: null
---
```

All keys are flat (no YAML nesting) because `parseFrontmatter()` in core.cjs splits on first colon per line and cannot handle indented sub-keys. Dot-notation (`phase.researched`) is the approved workaround per RESEARCH.md Pitfall 2.

**Body pattern** (state.md lines 9-27):
```markdown
# Campaign: [CAMPAIGN_NAME]

Phase: created
Next step: Run `/ttm-research [SLUG]` to gather market intelligence.
```

---

### `templates/campaign-research.md` (template, static)

**Analog:** `templates/campaign-brief.md` (role-match — placeholder-based template filled at runtime)

**Placeholder convention** (campaign-brief.md lines 1-75 — `[GENERATED BY /ttm-research]` pattern):
```markdown
# Research: [GENERATED BY /ttm-research]

**Campaign:** [SLUG]
**Researched:** [GENERATED BY /ttm-research -- ISO timestamp]
**Method:** [GENERATED BY /ttm-research -- web-search | manual-paste | hybrid]

## Market Context

<!-- _RESEARCH_NOTE: HIGH confidence = verified source URL; MEDIUM = user paste; LOW = inference -->

| Insight | Confidence | Source |
|---------|-----------|--------|
| [GENERATED BY /ttm-research] | HIGH/MEDIUM/LOW | [source or "user-provided"] |

## Competitor Content Analysis

| Competitor | Content Type | Key Message | Gap/Opportunity |
|-----------|-------------|-------------|-----------------|
| [GENERATED BY /ttm-research] | [type] | [message] | [gap] |

## Audience Insights

| Insight | Confidence | Source |
|---------|-----------|--------|
| [GENERATED BY /ttm-research] | HIGH/MEDIUM/LOW | [source] |

## Ambient Narrative

[GENERATED BY /ttm-research -- What the market already believes about this topic]

## Content Gaps

| Gap | Opportunity Size | Difficulty |
|-----|-----------------|------------|
| [GENERATED BY /ttm-research] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW |

## Research Summary

[GENERATED BY /ttm-research -- 2-3 sentence summary for /ttm-brief to consume]
```

---

### `bin/lib/campaign.cjs` (utility, CRUD — campaign state file operations)

**Analog:** `bin/lib/state.cjs` (exact match — same pattern: resolve path, read frontmatter, update field, write back)

**Module header pattern** (state.cjs lines 1-22):
```javascript
/**
 * Campaign -- Per-campaign STATE.md read/update/init operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate
 */

'use strict';

const path = require('path');
const {
  output,
  error,
  safeReadFile,
  safeWriteFile,
  parseFrontmatter,
  serializeFrontmatter,
} = require('./core.cjs');
```

**Path resolution and security pattern** (state.cjs lines 27-36):
```javascript
function resolveCampaignStatePath(slug) {
  if (!slug || !slug.trim()) error('campaign slug required');
  // Re-sanitize slug in case caller passes unsanitized input
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const statePath = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', safe, 'STATE.md');
  const projectRoot = path.resolve(process.cwd());
  if (!statePath.startsWith(projectRoot)) {
    error('campaign STATE.md path escapes project directory');
  }
  return statePath;
}
```

**Read function pattern** (state.cjs lines 44-58):
```javascript
function cmdCampaignState(slug, raw) {
  const statePath = resolveCampaignStatePath(slug);
  const content = safeReadFile(statePath);
  if (content === null) {
    output({ exists: false, error: `Campaign STATE.md not found for slug: ${slug}` }, raw, 'not found');
    return;
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const result = { exists: true, ...frontmatter, body_preview: body.substring(0, 200) };
  output(result, raw, JSON.stringify(frontmatter));
}
```

**Update function pattern** (state.cjs lines 68-91):
```javascript
function cmdCampaignUpdate(slug, field, value, raw) {
  if (!field) error('field name required for campaign update');
  if (value === undefined || value === null) error('value required for campaign update');

  const statePath = resolveCampaignStatePath(slug);
  const content = safeReadFile(statePath);
  if (content === null) {
    error(`Campaign not found: ${slug} -- run /ttm-new-campaign first`);
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const timestamp = new Date().toISOString();

  frontmatter[field] = value;
  frontmatter['last_updated'] = timestamp;

  const updated = serializeFrontmatter(frontmatter, body);
  safeWriteFile(statePath, updated);

  output({ updated: field, value, last_updated: timestamp }, raw, `${field}=${value}`);
}
```

**Init function pattern** (derived from state.cjs + safeWriteFile from core.cjs lines 91-95):
```javascript
function cmdCampaignInit(slug, name, raw) {
  if (!slug) error('slug required for campaign init');
  if (!name) error('name required for campaign init');

  const campaignDir = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', slug);
  const assetsDir = path.resolve(campaignDir, 'ASSETS');
  const statePath = path.resolve(campaignDir, 'STATE.md');

  // Create dirs (safeWriteFile creates parent dirs, but ASSETS/ needs explicit mkdir)
  const fs = require('fs');
  fs.mkdirSync(assetsDir, { recursive: true });

  const timestamp = new Date().toISOString();
  // Write STATE.md with flat frontmatter (parseFrontmatter-compatible)
  const content = [
    '---',
    `campaign: ${slug}`,
    `name: ${name}`,
    `created: ${timestamp}`,
    'phase: created',
    `last_updated: ${timestamp}`,
    `phase.created: ${timestamp}`,
    'phase.researched: null',
    'phase.briefed: null',
    // ... remaining phase fields
    'gate.positioning_check: null',
    'gate.outcome_metric: null',
    '---',
    '',
    `# Campaign: ${name}`,
    '',
    'Phase: created',
    `Next step: Run \`/ttm-research ${slug}\` to gather market intelligence.`,
  ].join('\n');

  safeWriteFile(statePath, content);
  output({ created: true, slug, name, path: statePath }, raw, slug);
}
```

**Module exports pattern** (state.cjs line 94):
```javascript
module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
};
```

**ttm-tools.cjs router addition** (ttm-tools.cjs lines 28-68 — add `campaign` case):
```javascript
case 'campaign': {
  const { cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate } = require('./lib/campaign.cjs');
  const campaignArgs = args.slice(1).filter(a => a !== '--raw');
  const subCmd = campaignArgs[0];
  const slug = campaignArgs[1];
  if (subCmd === 'init') cmdCampaignInit(slug, campaignArgs.slice(2).join(' '), raw);
  else if (subCmd === 'state') cmdCampaignState(slug, raw);
  else if (subCmd === 'update') cmdCampaignUpdate(slug, campaignArgs[2], campaignArgs[3], raw);
  else error('campaign subcommand required: init, state, update');
  break;
}
```

---

### `skills/ttm-new-campaign/SKILL.md`, `skills/ttm-research/SKILL.md`, `skills/ttm-brief/SKILL.md` (config, stub updates)

**Analog:** `skills/ttm-init/SKILL.md` (exact match — thin SKILL.md that routes to a workflow file)

**Current stub pattern to replace** (ttm-new-campaign/SKILL.md lines 1-16, same structure in all three):
```yaml
---
name: ttm-new-campaign
description: >
  Create a new campaign directory with initialized state and reference file links.
  Use when starting a new marketing campaign.
argument-hint: "[campaign-name]"
disable-model-invocation: true
allowed-tools: Read Write Bash
---

# /ttm-new-campaign

**Status:** Not yet implemented (Phase 3)

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/setup/new-campaign.md`
```

**Target state for each stub** — remove the "Status: Not yet implemented" line, keep everything else:

`skills/ttm-new-campaign/SKILL.md`:
```yaml
---
name: ttm-new-campaign
description: >
  Create a new campaign directory with initialized state and reference file links.
  Use when starting a new marketing campaign.
argument-hint: "[campaign-name]"
disable-model-invocation: true
allowed-tools: Read Write Bash
---

# /ttm-new-campaign

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/setup/new-campaign.md`
```

`skills/ttm-research/SKILL.md` — add `Glob Grep` to allowed-tools (workflow needs file detection):
```yaml
---
name: ttm-research
description: >
  Discover phase: perform market and audience research including SERP analysis,
  competitor content audit, and ambient narrative mapping. Use after creating a campaign.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-research

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/research.md`
```

`skills/ttm-brief/SKILL.md` — add `AskUserQuestion` to allowed-tools (brief uses structured choice for channel selection):
```yaml
---
name: ttm-brief
description: >
  Generate a campaign brief with mandatory outcome metrics, positioning anchor,
  and channel mix. Use when the user says "brief", "plan campaign", or invokes /ttm-brief.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-brief

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/brief.md`
```

---

## Shared Patterns

### Workflow Structural Tags
**Source:** `workflows/setup/init.md` (lines 1-11 and 427-449)
**Apply to:** `new-campaign.md`, `research.md`, `brief.md`

Every workflow file uses these five top-level XML tags and no others:
```markdown
<purpose>
[One paragraph describing what this workflow does and when to use it]
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/[reference-file-1]
@${CLAUDE_PLUGIN_ROOT}/[reference-file-2]
</required_reading>

<process>
[Numbered steps]
</process>

<success_criteria>
- [ ] [Checkable criterion 1]
</success_criteria>

<output>
- `[path/to/generated/file]`
</output>
```

### Deterministic CLI Operations
**Source:** `bin/ttm-tools.cjs` (lines 28-72) and `bin/lib/slug.cjs` (lines 21-54)
**Apply to:** `new-campaign.md`, `research.md`, `brief.md`, `bin/lib/campaign.cjs`

| Operation | Command |
|-----------|---------|
| Generate slug | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs slug "$ARGUMENTS" --raw` |
| Get ISO timestamp | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw` |
| Get date-only | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw` |
| Check init status | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw` |
| Read global state | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state read --raw` |
| Update global state | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update [field] [value]` |
| Read campaign state | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign state [slug] --raw` |
| Update campaign state | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update [slug] [field] [value]` |
| Init campaign | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign init [slug] "[name]"` |

Never generate slugs or timestamps via AI. Always shell out.

### Flat Frontmatter State Schema
**Source:** `bin/lib/core.cjs` `parseFrontmatter()` (lines 106-131) and `templates/reference-files/state.md`
**Apply to:** `templates/campaign-state.md`, `bin/lib/campaign.cjs`

`parseFrontmatter()` splits on first colon per line. It cannot handle YAML nesting (`phase_history:\n  created: ...`). Use dot-notation flattening for all sub-keys:
```yaml
phase.created: 2026-04-22T10:30:00.000Z   # CORRECT
phase_history:                              # WRONG -- parseFrontmatter loses sub-keys
  created: 2026-04-22T10:30:00.000Z
```

`serializeFrontmatter()` (core.cjs lines 140-157) auto-quotes values containing `:`, `#`, or leading/trailing spaces.

### Two-Tier Context Loading
**Source:** `references/context-loading.md` (lines 1-106)
**Apply to:** `research.md`, `brief.md`

Read only `<!-- _SUMMARY -->` to `<!-- END_SUMMARY -->` for universal files. Read full Tier 2 content only for files listed in the workflow's row in the loading matrix. Campaign-specific files (inside `CAMPAIGNS/<slug>/`) are always full-loaded.

### AskUserQuestion with Text-Mode Fallback
**Source:** `workflows/setup/init.md` (lines 17-39)
**Apply to:** `brief.md` (for channel selection and phase order override prompts)

Place text-mode detection ONCE at the top of the `<process>` section. All AskUserQuestion calls in the workflow automatically inherit the fallback:
```markdown
**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. Replace each AskUserQuestion with a plain-text
numbered list.
```

### Soft Gate with Visible Warning
**Source:** `gates/base-gates.md` (lines 1-11), `workflows/setup/init-validation.md` (lines 123-139)
**Apply to:** `brief.md` positioning check gate and outcome metric re-prompt

Brief generation is NEVER blocked by positioning drift (D-05). The pattern is:
1. Generate the file content fully
2. Run the check against completed content (not template placeholders)
3. Insert HTML comment warning block at top of file if drift detected
4. Write the file unconditionally
5. Update `gate.positioning_check` in campaign STATE.md as `pass` or `warn`

Hard block (exit without writing) is only used for missing outcome metric after 2 retries (D-06).

### Path Security
**Source:** `bin/lib/state.cjs` (lines 27-36) and `bin/lib/commit.cjs` (lines 62-68)
**Apply to:** `bin/lib/campaign.cjs`

```javascript
const resolved = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', slug, 'STATE.md');
const projectRoot = path.resolve(process.cwd());
if (!resolved.startsWith(projectRoot)) {
  error('path escapes project directory');
}
```

Also re-sanitize slug input in campaign.cjs even if slug came from ttm-tools.cjs (defense in depth).

### Stage Banners
**Source:** `workflows/setup/init.md` (lines 45, 249, 275, 370, 400)
**Apply to:** `new-campaign.md`, `research.md`, `brief.md`

```
takeToMarket > [VERB] [SUBJECT]
```

Examples used in init.md: `INITIALIZING`, `SECTION 1: PRODUCT AND POSITIONING`, `REVIEW`, `VALIDATING`, `INITIALIZED`. Phase 3 equivalent: `CREATING CAMPAIGN`, `LOADING CONTEXT`, `RESEARCH MODE: WEB`, `RESEARCH MODE: MANUAL`, `GENERATING BRIEF`, `POSITIONING CHECK`, `BRIEF COMPLETE`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| None | -- | -- | All 9 files have analogs within the existing codebase |

---

## Metadata

**Analog search scope:** Full project root (`/Users/rishikeshranjan/code/rishiPersonal/takeToMarket/`)
**Files scanned:** 42 (all `.md` and `.cjs` files outside `.planning/` and `.git/`)
**Key analogs read in depth:** `workflows/setup/init.md`, `bin/lib/state.cjs`, `bin/lib/core.cjs`, `bin/lib/health.cjs`, `bin/lib/slug.cjs`, `bin/ttm-tools.cjs`, `templates/campaign-brief.md`, `templates/reference-files/state.md`, `templates/reference-files/positioning.md`, `skills/ttm-init/SKILL.md`, `workflows/setup/init-questions.md`, `workflows/setup/init-validation.md`, `references/context-loading.md`, `gates/base-gates.md`, `.planning/phases/02-onboarding-interview/02-PATTERNS.md`
**Pattern extraction date:** 2026-04-22
