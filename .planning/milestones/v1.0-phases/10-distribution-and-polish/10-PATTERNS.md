# Phase 10: Distribution and Polish - Pattern Map

**Mapped:** 2026-05-04
**Files analyzed:** 12 (new/modified files)
**Analogs found:** 12 / 12

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `install.js` | utility (CLI) | file-I/O | `bin/ttm-tools.cjs` + `bin/lib/health.cjs` | role-match |
| `workflows/reference-mgmt/brand-refresh.md` | workflow | request-response | `workflows/reference-mgmt/positioning-shift.md` | exact |
| `workflows/reference-mgmt/icp-refresh.md` | workflow | request-response | `workflows/reference-mgmt/positioning-shift.md` | exact |
| `workflows/reference-mgmt/competitor-scan.md` | workflow | request-response | `workflows/lifecycle/research.md` | exact |
| `workflows/discipline/seo-audit.md` | workflow | request-response | `workflows/reference-mgmt/positioning-check.md` | exact |
| `workflows/discipline/aeo-check.md` | workflow | request-response | `workflows/reference-mgmt/positioning-check.md` | role-match |
| `workflows/discipline/keyword-map.md` | workflow | request-response | `workflows/lifecycle/research.md` | role-match |
| `workflows/discipline/email-preflight.md` | workflow | request-response | `workflows/reference-mgmt/positioning-check.md` | role-match |
| `workflows/discipline/affiliate-kit.md` | workflow | request-response | `workflows/reference-mgmt/positioning-check.md` | role-match |
| `workflows/discipline/repurpose.md` | workflow | event-driven (Task orchestration) | `workflows/lifecycle/produce.md` | exact |
| `README.md` | documentation | N/A | N/A (full rewrite, no analog needed) | N/A |
| `bin/lib/campaign.cjs` (extension) | utility (CLI) | CRUD | `bin/lib/campaign.cjs` (self) | exact |

## Pattern Assignments

### `install.js` (CLI utility, file-I/O)

**Analog:** `bin/ttm-tools.cjs` (entry point pattern) + `bin/lib/health.cjs` (validation pattern)

**Header/imports pattern** (`bin/ttm-tools.cjs` lines 1-24):
```javascript
#!/usr/bin/env node

/**
 * ttm-tools.cjs -- CLI utility for takeToMarket deterministic operations
 *
 * Single entry point with subcommand router. All command implementations
 * live in bin/lib/*.cjs modules. Zero npm dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
```

**Argument parsing pattern** (`bin/lib/core.cjs` lines 49-69):
```javascript
function parseNamedArgs(args) {
  const positional = [];
  const named = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--raw') {
      i++;
      continue;
    }
    if (arg.startsWith('--') && i + 1 < args.length) {
      const key = arg.slice(2);
      named[key] = args[i + 1];
      i += 2;
    } else {
      positional.push(arg);
      i++;
    }
  }
  return { positional, named };
}
```

**Validation/health check pattern** (`bin/lib/health.cjs` lines 44-64):
```javascript
function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}
```

**Output/error pattern** (`bin/lib/core.cjs` lines 23-39):
```javascript
function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue) + '\n');
  } else {
    const json = JSON.stringify(result, null, 2);
    process.stdout.write(json + '\n');
  }
}

function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}
```

---

### `workflows/reference-mgmt/brand-refresh.md` (workflow, request-response)

**Analog:** `workflows/reference-mgmt/positioning-shift.md`

**Structure pattern** (positioning-shift.md lines 1-47):
```markdown
<purpose>
[Brief description of what this workflow does]
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
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
```

**Context loading pattern** (positioning-shift.md lines 50-71):
```markdown
## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

**Load Tier 1 summaries** from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md`
- `.marketing/COMPETITORS.md`
- `.marketing/METRICS.md`
- `.marketing/LEARNINGS.md`

**Load Tier 2 (full content)** for the file being refreshed:
- `.marketing/BRAND.md`
```

**User interaction pattern** (positioning-shift.md uses AskUserQuestion for field collection -- brand-refresh follows same pattern for proof point updates)

---

### `workflows/reference-mgmt/competitor-scan.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/research.md` (MCP tool detection)

**MCP tool detection pattern** (research.md lines 98-151):
```markdown
## Step 5: Tool Detection and Research

Attempt a WebSearch call to detect tool availability. Use a minimal test query related
to the campaign topic.

### When WebSearch is available (SEARCH_MODE=web)

```
takeToMarket > RESEARCH MODE: WEB
```

- Use WebSearch for SERP queries based on `RESEARCH_TOPIC` and campaign keywords
- Search for: market trends, competitor content, audience discussions, content gaps
- Use WebFetch for competitor page content extraction when specific URLs are found
- Cross-reference findings against `.marketing/COMPETITORS.md` (already loaded in Tier 2)
- Tag insights with confidence levels:
  - **HIGH**: verified source URL or cited data from web search results
  - **MEDIUM**: indirect evidence or partial match from search results
  - **LOW**: inference drawn from patterns without direct evidence

### When WebSearch is NOT available (SEARCH_MODE=manual)

```
takeToMarket > RESEARCH MODE: MANUAL
```

Tell the user:
```
Web search tools are not available in this session.
To get the best research, please paste any of the following:

1. Google search results for:
   - "[RESEARCH_TOPIC] [year]"
   - "[RESEARCH_TOPIC] best practices"
   - "[RESEARCH_TOPIC] vs [competitor terms]"
2. Any competitor blog posts or landing pages you want analyzed
3. Reddit/forum discussions about [RESEARCH_TOPIC]
4. Any other market data you have (reports, articles, social posts)

Paste your findings below and I will analyze them.
```
```

---

### `workflows/discipline/seo-audit.md` (workflow, request-response)

**Analog:** `workflows/reference-mgmt/positioning-check.md`

**Gate evaluation pattern** (positioning-check.md lines 141-196):
```markdown
## Step 4: Evaluate Each Asset Against GATE-01

For each collected asset:

1. Read the full asset content from disk
2. Evaluate against GATE-01's 3 checks (from @gate-evaluation.md):

   **Check 1: Differentiator Alignment**
   Does the asset restate or naturally extend the primary differentiator from
   POSITIONING.md? Or does it introduce a different claim?
   - PASS: Asset reinforces the primary differentiator
   - WARN: Asset is neutral -- neither reinforces nor contradicts
   - FAIL: Asset introduces a different/competing claim

   [... additional checks ...]

3. Record per-check result: PASS / WARN / FAIL with evidence
```

**Report generation pattern** (positioning-check.md lines 260-277):
```markdown
## Step 7: Generate Report

Follow the report format from @positioning-check-report.md.

Generate the full audit report including:
- Header with audit window and asset count
- Aggregate drift percentage with trend arrow
- Per-asset results table (asset x check matrix with drift %)
- Findings detail for every WARN and FAIL result
- Recommendations based on aggregate drift thresholds

**Display the report to stdout** (per A1 -- this is a cross-campaign audit,
not scoped to a single campaign directory).
```

**Completion banner pattern** (positioning-check.md lines 305-319):
```markdown
## Step 9: Completion Banner

```
========================================
takeToMarket > POSITIONING AUDIT COMPLETE
========================================

Window: last ${WINDOW} | Assets audited: ${ASSET_COUNT}
Aggregate drift: ${AGGREGATE_DRIFT}% ${TREND_ARROW}

Next steps:
- Run /ttm-fix [campaign-slug] to address specific FAIL results
```
```

---

### `workflows/discipline/repurpose.md` (workflow, Task orchestration)

**Analog:** `workflows/lifecycle/produce.md`

**Task() hero-first pattern** (produce.md lines 160-194):
```markdown
## Step 5: Produce Hero Asset

```
takeToMarket > PRODUCING HERO ASSET
```

Identify the hero asset (first entry in `ASSETS_LIST`).

Read the agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.

Fill all placeholders with actual paths:
- `[BRIEF_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`
- `[POSITIONING_PATH]` --> `.marketing/POSITIONING.md`
- `[BRAND_PATH]` --> `.marketing/BRAND.md`
- `[ICP_PATH]` --> `.marketing/ICP.md`
- `[PLAYBOOK_PATH]` --> resolved playbook path from Step 4, or `"none"`
- `[OUTPUT_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/ASSETS/01-${HERO_TYPE}-${HERO_CHANNEL}.md`

Call Task() with the populated prompt.

**WAIT** for Task() to complete. The hero MUST finish before any derivatives are spawned.
```

**Wave-parallel derivative pattern** (produce.md lines 199-239):
```markdown
## Step 6: Produce Derivative Assets

If `TOTAL_ASSETS` is 1 (hero only), skip this step.

```
takeToMarket > PRODUCING DERIVATIVES (${N} assets)
```

For each derivative asset in `ASSETS_LIST` (all entries after the hero):

1. Read the agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.

2. Assign a sequential filename:
   - Asset 2: `02-${TYPE}-${CHANNEL}.md`

3. Fill all placeholders:
   - `[BRIEF_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`
   - `[HERO_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/ASSETS/${HERO_FILE}`

4. Call Task() with the populated prompt.

All derivative Task() calls can run in parallel (per D-01 wave-parallel pattern).

After ALL derivative Task() calls complete, verify each derivative file exists and has content.
```

**MANIFEST.json write pattern** (produce.md lines 244-299):
```markdown
## Step 7: Write Production Manifest

Read the manifest template from `${CLAUDE_PLUGIN_ROOT}/templates/production-manifest.json`.

Fill with actual values:

```json
{
  "campaign": "${SLUG}",
  "produced_at": "${ISO_TIMESTAMP}",
  "hero": {
    "asset_id": 1,
    "name": "01-${HERO_TYPE}-${HERO_CHANNEL}",
    "type": "${HERO_TYPE}",
    "channel": "${HERO_CHANNEL}",
    "file": "ASSETS/01-${HERO_TYPE}-${HERO_CHANNEL}.md"
  },
  "derivatives": [
    {
      "asset_id": 2,
      "derived_from": 1
    }
  ]
}
```
```

**Campaign state update pattern** (produce.md lines 301-312):
```markdown
## Step 8: Update Campaign State and Summary

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase produced
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.produced "$TIMESTAMP"
```
```

---

## Shared Patterns

### Text-Mode Detection
**Source:** `workflows/reference-mgmt/positioning-shift.md` lines 24-47
**Apply to:** All 9 new workflow files

```markdown
## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

If `AskUserQuestion` tool is not available in the current runtime, set `TEXT_MODE=true`.
```

### POSITIONING.md Read-Only Constraint
**Source:** `workflows/reference-mgmt/positioning-check.md` lines 17-27
**Apply to:** All 9 new workflow files (brand-refresh, icp-refresh, competitor-scan, seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit, repurpose)

```markdown
<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>
```

### Context Loading (Tier 1 Summaries)
**Source:** `workflows/lifecycle/research.md` lines 15-36
**Apply to:** All 9 new workflow files

```markdown
## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Read Tier 1 summary blocks (content between `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->`)
from all 9 `.marketing/` reference files:

- `.marketing/POSITIONING.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/BRAND.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/ICP.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/CHANNELS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/COMPETITORS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/METRICS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.marketing/LEARNINGS.md` (lines 1 to `<!-- END_SUMMARY -->`)
```

### MCP Tool Detection + Graceful Fallback
**Source:** `workflows/lifecycle/research.md` lines 98-151
**Apply to:** `competitor-scan.md`, `seo-audit.md`, `aeo-check.md`

Pattern: Attempt WebSearch call with minimal test query. If available, use SEARCH_MODE=web. If unavailable, use SEARCH_MODE=manual and prompt user to paste data.

### CLI Error Handling
**Source:** `bin/lib/core.cjs` lines 36-39
**Apply to:** `install.js`

```javascript
function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `README.md` | documentation | N/A | Full rewrite -- content is novel documentation, not code. Structure defined by D-15 through D-17. |

## Metadata

**Analog search scope:** `workflows/`, `bin/`, `bin/lib/`
**Files scanned:** 29 (21 workflows + 8 bin/lib modules)
**Pattern extraction date:** 2026-05-04
