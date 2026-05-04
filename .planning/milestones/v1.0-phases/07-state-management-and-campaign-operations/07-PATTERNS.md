# Phase 7: State Management and Campaign Operations - Pattern Map

**Mapped:** 2026-04-28
**Files analyzed:** 13 (5 new workflows, 1 new reference file, 5 SKILL.md updates, 2 CLI module extensions)
**Analogs found:** 13 / 13

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `workflows/utility/state.md` | workflow | request-response | `workflows/lifecycle/ship.md` | role-match |
| `workflows/utility/resume.md` | workflow | request-response | `workflows/lifecycle/ship.md` | role-match |
| `workflows/utility/archive.md` | workflow | request-response | `workflows/lifecycle/ship.md` | role-match |
| `workflows/utility/health.md` | workflow | request-response | `workflows/lifecycle/ship.md` | role-match |
| `workflows/utility/next.md` | workflow | request-response | `workflows/lifecycle/ship.md` | role-match |
| `references/learnings-extraction.md` | reference | N/A | `references/ship-checklist-items.md` | exact |
| `skills/ttm-state/SKILL.md` | config | routing | `skills/ttm-ship/SKILL.md` | exact |
| `skills/ttm-resume/SKILL.md` | config | routing | `skills/ttm-ship/SKILL.md` | exact |
| `skills/ttm-archive/SKILL.md` | config | routing | `skills/ttm-ship/SKILL.md` | exact |
| `skills/ttm-health/SKILL.md` | config | routing | `skills/ttm-ship/SKILL.md` | exact |
| `skills/ttm-next/SKILL.md` | config | routing | `skills/ttm-ship/SKILL.md` | exact |
| `bin/lib/campaign.cjs` | service | CRUD | `bin/lib/campaign.cjs` (self-extend) | exact |
| `bin/lib/health.cjs` | service | CRUD | `bin/lib/health.cjs` (self-extend) | exact |

## Pattern Assignments

### `skills/ttm-state/SKILL.md` (config, routing)

**Analog:** `skills/ttm-ship/SKILL.md`

**Implemented SKILL.md pattern** (lines 1-14):
```yaml
---
name: ttm-ship
description: >
  Ship phase: generate launch checklist confirming tracking, UTMs, funnel
  testing, and asset finalization. Use when assets are approved and ready.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-ship

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/ship.md`
```

**Key differences for /ttm-state:** No `argument-hint` (optional slug), no Write/AskUserQuestion in allowed-tools (read-only dashboard). Existing stub already has correct `allowed-tools: Read Bash Glob`. Remove the "Status: Not yet implemented" notice and the bullet list description. Keep it to the 3-line body pattern.

**Apply to:** All 5 SKILL.md files. Each stub needs:
1. Remove `**Status:** Not yet implemented (Phase 7)` line
2. Remove the multi-line "This command will:" description block
3. Keep the single `Read and follow the workflow at...` line
4. Adjust `allowed-tools` per command needs (see table below)

| Skill | allowed-tools | argument-hint | Notes |
|-------|--------------|---------------|-------|
| ttm-state | `Read Bash Glob` | `"[campaign-slug]"` | Optional slug for single-campaign view (D-02) |
| ttm-resume | `Read Write Bash Glob` | `"[campaign-slug]"` | Write needed for state updates |
| ttm-archive | `Read Write Bash Glob` | `"[campaign-slug]"` | Write for LEARNINGS.md append, Bash for archive CLI |
| ttm-health | `Read Bash Glob Grep` | none | No arguments; `disable-model-invocation: false` (already set) |
| ttm-next | `Read Bash Glob` | none | Read-only routing |

---

### `workflows/utility/state.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/ship.md`

**Workflow XML structure** (lines 1-25):
```markdown
<purpose>
Ship workflow for /ttm-ship. Generates a dynamic launch checklist per campaign
based on channel mix and asset types (D-09). AI auto-checks verifiable items,
presents results with checkboxes for human confirmation (D-10). Per-asset ship
status allows staggered launches (D-11). Only ship-ready assets can ship.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/ship-checklist-items.md
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
```

**Text-mode detection pattern** (lines 27-48):
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

**Context loading step pattern** (lines 50-96):
```markdown
## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

If SLUG is empty, error: "Usage: /ttm-ship [campaign-slug]. Provide a campaign slug." Exit.

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
```

**Campaign state validation via CLI** (lines 99-110):
```markdown
## Step 2: Validate Campaign State

```
takeToMarket > VALIDATING CAMPAIGN
```

Check campaign exists:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

If result shows `exists: false`: Tell the user the campaign does not exist and suggest
running `/ttm-new-campaign` first. Exit.
```

**Campaign state update via CLI** (lines 419-444):
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" ship.status "[shipped|partial]"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" ship.shipped_at "$TIMESTAMP"
```

**Success criteria block** (lines 506-517):
```markdown
<success_criteria>
- [ ] Campaign state validated (exists, has been reviewed)
- [ ] Ship-ready assets identified from MANIFEST.json review_status
...
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json` (updated with ship_status and shipped_at per asset)
</output>
```

**Apply to:** All 5 utility workflows. Each workflow must follow this structure:
1. `<purpose>` -- single paragraph describing what the workflow does
2. `<required_reading>` -- `@`-prefixed paths to reference files
3. `<constraints>` -- POSITIONING.md read-only constraint (copy verbatim)
4. `<process>` -- numbered steps with status banners (`takeToMarket > STEP NAME`)
5. `<success_criteria>` -- checklist of what must be true when done
6. `<output>` -- files modified by the workflow

---

### `workflows/utility/resume.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/ship.md` (same structure)

**Additional analog for state interpretation:** `bin/lib/campaign.cjs` lines 175-190

**Campaign state reading pattern** for resume context:
```javascript
function cmdCampaignState(slug, raw) {
  const statePath = resolveCampaignStatePath(slug);
  const safe = slug ? slug.toLowerCase().replace(/[^a-z0-9-]/g, '') : '';
  const content = safeReadFile(statePath);
  if (content === null) {
    output(
      { exists: false, error: `Campaign STATE.md not found for slug: ${safe}` },
      raw,
      'not found'
    );
    return;
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const result = { exists: true, ...frontmatter, body_preview: body.substring(0, 200) };
  output(result, raw, JSON.stringify(frontmatter));
}
```

The resume workflow calls `campaign state <slug> --raw` and then interprets the frontmatter fields (`phase`, `fix.run_count`, `review.overall_result`) to determine recovery guidance. The workflow reads both frontmatter AND body from STATE.md (per Pitfall 5 in RESEARCH.md).

---

### `workflows/utility/archive.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/ship.md` (workflow structure)

**Additional analog for learnings append:** `bin/lib/drift-log.cjs` lines 128-156

**Marker-based append pattern** (for LEARNINGS.md):
```javascript
// Find the Audit Trail marker and append after it
const marker = '<!-- NEW ENTRIES BELOW THIS LINE -->';
let updated;
const markerCount = content.split(marker).length - 1;
if (markerCount > 1) {
  error(`DRIFT-LOG.md has ${markerCount} occurrences of the Audit Trail marker. File may be corrupted.`);
}
if (markerCount === 1) {
  updated = content.replace(marker, marker + '\n' + newRow);
} else {
  // Fallback: append at end of content
  updated = content.trimEnd() + '\n' + newRow + '\n';
}

safeWriteFile(driftLogPath, updated);
```

The archive workflow's learnings extraction should follow this exact pattern to append rows to the Lessons Log table in LEARNINGS.md. The LEARNINGS.md template does not currently have a marker comment -- the planner should add one (`<!-- LESSONS BELOW THIS LINE -->`) to the template, or the workflow should find the table header row and append after the last table row.

**LEARNINGS.md table structure** (`templates/reference-files/learnings.md` lines 23-26):
```markdown
| Date | Campaign | Category | Lesson | Action Taken |
|------|----------|----------|--------|-------------|
| [populated during Learn phase] | | | | |
```

---

### `workflows/utility/health.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/ship.md` (workflow structure)

**Additional analog for health checks:** `bin/lib/health.cjs` lines 71-138

**Existing health check pattern** (full cmdHealth function):
```javascript
function cmdHealth(raw) {
  const marketingDir = path.resolve(process.cwd(), '.marketing');
  const campaignsDir = path.resolve(marketingDir, 'CAMPAIGNS');
  const checks = [];

  // Check .marketing/ directory
  const marketingExists = dirExists(marketingDir);
  checks.push({
    name: 'marketing_dir',
    status: marketingExists ? 'pass' : 'fail',
    path: '.marketing/',
  });

  // Check CAMPAIGNS/ directory
  const campaignsExists = dirExists(campaignsDir);
  checks.push({
    name: 'campaigns_dir',
    status: campaignsExists ? 'pass' : 'fail',
    path: '.marketing/CAMPAIGNS/',
  });

  // Check each reference file
  for (const file of REFERENCE_FILES) {
    const filePath = path.resolve(marketingDir, file);
    const name = file.toLowerCase().replace('.md', '_md');
    if (fileExists(filePath)) {
      if (file === 'STATE.md') {
        const content = safeReadFile(filePath);
        const { frontmatter } = parseFrontmatter(content || '');
        const isValid = Object.keys(frontmatter).length > 0;
        checks.push({
          name,
          status: isValid ? 'pass' : 'fail',
          path: `.marketing/${file}`,
          detail: isValid ? undefined : 'frontmatter unparseable',
        });
      } else {
        checks.push({ name, status: 'pass', path: `.marketing/${file}` });
      }
    } else {
      checks.push({ name, status: 'missing', path: `.marketing/${file}` });
    }
  }

  const passed = checks.filter(c => c.status === 'pass').length;
  const total = checks.length;
  const healthy = marketingExists && campaignsExists;

  const result = {
    healthy,
    checks,
    summary: `${passed}/${total} checks passed`,
  };

  if (raw) {
    const label = healthy ? 'HEALTHY' : 'UNHEALTHY';
    const issues = checks.filter(c => c.status === 'fail').length;
    if (healthy) {
      output(result, true, `${label}: ${passed}/${total} checks passed`);
    } else {
      output(result, true, `${label}: ${issues} issue(s) found`);
    }
  } else {
    output(result, false);
  }
}
```

**Extension pattern:** New checks should follow the same `{ name, status, path?, detail? }` object shape and push to the `checks` array. The function should accept an optional `--full` flag to enable the extended checks (staleness, velocity, state consistency, DRIFT-LOG integrity). Without `--full`, the existing basic checks run.

---

### `workflows/utility/next.md` (workflow, request-response)

**Analog:** `workflows/lifecycle/ship.md` (workflow structure)

**Additional analog for campaign listing:** `bin/lib/campaign.cjs` lines 257-336

**Campaign listing and filtering pattern:**
```javascript
function cmdCampaignList(filter, sinceArg, raw) {
  const campaignsDir = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS');

  let entries;
  try {
    entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  } catch {
    output({ campaigns: [], count: 0 }, raw, '0 campaigns');
    return;
  }

  const projectRoot = path.resolve(process.cwd());
  const campaigns = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    if (!statePath.startsWith(projectRoot + path.sep)) continue;
    const content = safeReadFile(statePath);
    if (content === null) continue;
    const { frontmatter } = parseFrontmatter(content);
    campaigns.push({ slug: entry.name, ...frontmatter });
  }

  let filtered = campaigns;

  if (filter === '--active') {
    filtered = campaigns.filter(c => ACTIVE_PHASES.has(c.phase));
  }
  // ... additional filters ...
}
```

**Key note for /ttm-next (Pitfall 2 from RESEARCH.md):** `ACTIVE_PHASES` on line 248 excludes `created` and `researched`. The `/ttm-next` routing needs ALL non-archived, non-cancelled campaigns. Either add a new `--all-active` filter or have the workflow use `campaign list --raw` without the `--active` flag and filter client-side in the AI workflow.

---

### `references/learnings-extraction.md` (reference, N/A)

**Analog:** `references/ship-checklist-items.md`

This is a supporting reference file loaded via `@`-syntax in the archive workflow to keep the workflow under 500 lines. It should contain:
- The learnings extraction template structure
- The root-cause taxonomy categories (from `templates/reference-files/learnings.md` lines 8-21)
- Instructions for structured extraction (what worked, what didn't, campaign-level decisions)

The reference file pattern is simple Markdown with no frontmatter -- just headings and content. See `references/ship-checklist-items.md` for the formatting convention.

---

### `bin/lib/campaign.cjs` (service, CRUD -- extend)

**Self-analog:** `bin/lib/campaign.cjs` lines 1-343

**New function pattern -- cmdCampaignArchive:** Follow the exact pattern of `cmdCampaignInit` (lines 49-166) for:
1. Slug sanitization (line 54): `const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');`
2. Path resolution and security check (lines 56-64)
3. TOCTOU-safe file operations
4. Output format (line 165): `output({ ... }, raw, '...')`

**Module header pattern** (lines 1-9):
```javascript
/**
 * Campaign -- Per-campaign STATE.md init/read/update operations for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: path, fs.
 * Depends on: ./core.cjs for output, error, safeReadFile, safeWriteFile,
 *             parseFrontmatter, serializeFrontmatter
 *
 * Exports: cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate, cmdCampaignList
 */
```

**Imports pattern** (lines 11-22):
```javascript
'use strict';

const fs = require('fs');
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

**ALLOWED_FIELDS extension** (lines 201-221): Add new fields:
```javascript
// Phase 7: Archive tracking
'archive.archived_at', 'archive.learnings_extracted',
// Phase 7: Cancellation tracking
'cancel.cancelled_at', 'cancel.reason',
```

**Module exports pattern** (lines 338-343):
```javascript
module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
  cmdCampaignList,
};
```
Add `cmdCampaignArchive` and optionally `cmdCampaignEnrich` to this exports block.

---

### `bin/lib/health.cjs` (service, CRUD -- extend)

**Self-analog:** `bin/lib/health.cjs` lines 1-176

**Module header pattern** (lines 1-8):
```javascript
/**
 * Health -- Directory integrity validation for ttm-tools.cjs
 *
 * Zero npm dependencies. Uses only Node.js built-ins: fs, path.
 * Depends on: ./core.cjs for output, error, safeReadFile, parseFrontmatter
 *
 * Exports: cmdHealth, cmdInit
 */
```

**Check object shape** (used throughout, e.g. lines 78-82):
```javascript
checks.push({
  name: 'marketing_dir',
  status: marketingExists ? 'pass' : 'fail',
  path: '.marketing/',
});
```

New health checks should use this same `{ name, status, path?, detail? }` shape. The `status` values are `'pass'`, `'fail'`, `'missing'`, or `'warn'` (new for Phase 7).

**Helper function pattern** (lines 36-55):
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

---

### `bin/ttm-tools.cjs` (router -- extend)

**Self-analog:** `bin/ttm-tools.cjs` lines 1-144

**Subcommand dispatch pattern** (e.g., campaign block lines 65-85):
```javascript
case 'campaign': {
  const { cmdCampaignInit, cmdCampaignState, cmdCampaignUpdate, cmdCampaignList } = require('./lib/campaign.cjs');
  const campaignArgs = args.slice(1).filter(a => a !== '--raw');
  const subCmd = campaignArgs[0];
  const slug = campaignArgs[1];
  if (subCmd !== 'list' && slug && /\s/.test(slug)) {
    error('campaign slug must not contain whitespace -- use hyphens');
  }
  if (subCmd === 'init') cmdCampaignInit(slug, campaignArgs.slice(2).join(' '), raw);
  else if (subCmd === 'state') cmdCampaignState(slug, raw);
  else if (subCmd === 'update') cmdCampaignUpdate(slug, campaignArgs[2], campaignArgs[3], raw);
  else if (subCmd === 'list') {
    // ...
  }
  else error('campaign subcommand required: init, state, update, list');
  break;
}
```

Add `archive` as a new subcommand under the `campaign` case. Also extend the `health` case to pass a `--full` flag.

**Health case pattern** (lines 135-138):
```javascript
case 'health': {
  const { cmdHealth } = require('./lib/health.cjs');
  cmdHealth(raw);
  break;
}
```

Extend to: `cmdHealth(raw, args.includes('--full'))`.

---

## Shared Patterns

### POSITIONING.md Read-Only Constraint
**Source:** `workflows/lifecycle/ship.md` lines 14-23
**Apply to:** All 5 utility workflow files
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

### Text-Mode Detection
**Source:** `workflows/lifecycle/ship.md` lines 27-48
**Apply to:** `archive.md` (needs user confirmation before archive move). Other utility workflows (`state.md`, `resume.md`, `health.md`, `next.md`) are read-only and may not need AskUserQuestion, but include text-mode detection if any interactive prompts are added.

### Slug Extraction from Arguments
**Source:** `workflows/lifecycle/ship.md` lines 58-63
**Apply to:** `state.md`, `resume.md`, `archive.md` (all accept optional or required slug argument)
```markdown
Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```
```

### CLI Invocation for Campaign State
**Source:** `workflows/lifecycle/ship.md` lines 107-108
**Apply to:** All 5 utility workflows (all need to read campaign state)
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

### Campaign State Update via CLI
**Source:** `workflows/lifecycle/ship.md` lines 427-429
**Apply to:** `archive.md` (updates phase to archived), `resume.md` (may update last_updated)
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase archived
```

### Security: Path Resolution and Escape Prevention
**Source:** `bin/lib/campaign.cjs` lines 30-39
**Apply to:** All new functions in `campaign.cjs` (especially `cmdCampaignArchive`)
```javascript
const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
const statePath = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS', safe, 'STATE.md');
const projectRoot = path.resolve(process.cwd());
if (!statePath.startsWith(projectRoot)) {
  error('campaign STATE.md path escapes project directory');
}
```

### Output Format
**Source:** `bin/lib/core.cjs` lines 23-30
**Apply to:** All new CLI functions
```javascript
function output(result, raw, rawValue) {
  if (raw && rawValue !== undefined) {
    process.stdout.write(String(rawValue) + '\n');
  } else {
    const json = JSON.stringify(result, null, 2);
    process.stdout.write(json + '\n');
  }
}
```

### Error Handling
**Source:** `bin/lib/core.cjs` lines 36-39
**Apply to:** All new CLI functions
```javascript
function error(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All Phase 7 files have strong analogs in the existing codebase. This phase is a composition phase building on established patterns. |

## Metadata

**Analog search scope:** `skills/`, `workflows/`, `bin/lib/`, `references/`, `templates/`
**Files scanned:** 27 skills, 14 workflows, 8 bin/lib modules, 4 reference files
**Pattern extraction date:** 2026-04-28
