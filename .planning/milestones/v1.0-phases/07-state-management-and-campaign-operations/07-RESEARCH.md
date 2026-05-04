# Phase 7: State Management and Campaign Operations - Research

**Researched:** 2026-04-28
**Domain:** Campaign state management, session recovery, archive/learnings, health auditing, multi-campaign routing
**Confidence:** HIGH

## Summary

Phase 7 delivers five operations commands (`/ttm-state`, `/ttm-resume`, `/ttm-archive`, `/ttm-health`, `/ttm-next`) that give users a campaign control room, session recovery, campaign finalization with learning extraction, full system health auditing, and portfolio-aware next-action routing. All five commands follow the established thin-SKILL.md-to-workflow pattern and rely on existing CLI infrastructure in `bin/lib/`.

The codebase already has strong foundations: `campaign.cjs` provides campaign CRUD with list/filter operations, `health.cjs` has basic directory validation, `state.cjs` handles `.marketing/STATE.md` read/write, and `core.cjs` provides frontmatter parsing/serialization. The primary implementation work is: (1) five new workflow files in `workflows/utility/`, (2) extending `campaign.cjs` with archive-move and campaign-enrichment operations, (3) extending `health.cjs` with per-campaign state validation, staleness detection, and velocity warnings, (4) updating the five existing SKILL.md stubs to point to the correct workflow paths, and (5) adding new subcommands to `ttm-tools.cjs`.

**Primary recommendation:** Build incrementally -- CLI extensions first (archive move, health checks, campaign enrichment), then workflows that consume them. Each workflow stays under 500 lines by extracting reference content to supporting files where needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Show all campaigns (active + archived) in summary table. Active get detail sections (phase, blockers, decisions in flight, experiments). Archived shown as collapsed rows (slug, archive date, outcome).
- **D-02:** No arguments = full dashboard. `<slug>` argument = single campaign detail view. Two modes from one command.
- **D-03:** Dashboard reads from campaign.cjs `list` and enriches with per-campaign STATE.md fields (decisions, blockers, experiments).
- **D-04:** Auto-load + guide -- load campaign state, show context summary (last completed phase, what was done, pending work, blockers), suggest exact next `/ttm-*` command.
- **D-05:** For interrupted verify/fix loops: detect if campaign is mid-loop (fix_attempts > 0, review_status = 'revise') and suggest continuing the loop rather than restarting.
- **D-06:** Session recovery reads from `CAMPAIGNS/<slug>/STATE.md` frontmatter -- no separate handoff file. The state file IS the recovery mechanism.
- **D-07:** Move campaign directory from `CAMPAIGNS/<slug>/` to `CAMPAIGNS/ARCHIVE/<slug>/`. Campaign state set to 'archived'.
- **D-08:** Only shipped campaigns can be archived. Failed/abandoned must reach 'shipped' first, or user explicitly cancels them (sets state to 'cancelled' via /ttm-state update). Cancelled campaigns cannot be archived -- they stay in CAMPAIGNS/ as cautionary records.
- **D-09:** On archive, extract learnings from campaign and append to `.marketing/LEARNINGS.md`. Learnings include: what worked (gate passes, high-performing assets), what didn't (gate failures, fix loop data), and campaign-level decisions. Structured extract, not a dump.
- **D-10:** Archive is irreversible via `/ttm-archive`. No `/ttm-unarchive` command.
- **D-11:** Full audit extending health.cjs -- structural validation, per-campaign state consistency, reference file cross-references, DRIFT-LOG.md integrity, content staleness (90+ days), campaign velocity warnings (14+ days stuck), gate result consistency.
- **D-12:** Health report is text output (not a file). Quick to run, shows pass/warn/fail per check category. No persistent health report file.
- **D-13:** No self-healing. Health reports problems; user fixes them.
- **D-14:** Multi-campaign portfolio routing -- look across ALL active campaigns, prioritize which needs attention most, suggest specific command.
- **D-15:** Priority factors: pending reviews (human action) > fix loops in progress > earlier lifecycle phases > most recently active. Tie-break by creation date (oldest first).
- **D-16:** Prioritized list with top recommendation highlighted. 1 primary + up to 3 alternatives if multiple campaigns active.

### Claude's Discretion
- State dashboard layout/formatting (table columns, section ordering)
- Staleness and velocity thresholds for health checks (90 days, 14 days suggested but researcher can refine)
- Learnings extraction template structure for archive
- How /ttm-next handles the edge case of no active campaigns
- Whether /ttm-health should integrate DRIFT-LOG.md audit (may overlap with positioning-check)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STAT-01 | `/ttm-state` displays current campaign states, decisions in flight, blockers, experiments | Dashboard workflow reads all campaign STATE.md files via `campaign list` + per-campaign enrichment. Uses existing `cmdCampaignList` and `cmdCampaignState`. |
| STAT-02 | `/ttm-resume <slug>` resumes paused campaign at last completed phase | Resume workflow reads STATE.md frontmatter, determines last completed phase from phase timestamp fields, suggests next command. Uses existing `cmdCampaignState`. |
| STAT-03 | `/ttm-archive <slug>` finalizes campaign, moves to archive, updates LEARNINGS.md | New `cmdCampaignArchive` CLI function moves directory, extracts learnings. Workflow orchestrates validation + extraction + move. |
| STAT-04 | `/ttm-health` validates `.marketing/` directory integrity, reference file completeness, state consistency | Extended `cmdHealth` with new check categories (staleness, velocity, state consistency, DRIFT-LOG integrity). |
| STAT-05 | Campaign state persists across sessions via `CAMPAIGNS/<slug>/` directory files | Already implemented by campaign.cjs. Phase 7 workflows consume this existing mechanism. |
| UTIL-10 | `/ttm-next` guides user to right next command based on current campaign state | Next workflow reads all active campaigns, applies priority algorithm (D-15), outputs ranked suggestions. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Campaign state dashboard | AI Workflow (Markdown) | CLI (bin/lib) | Workflow formats display; CLI provides structured campaign data |
| Session recovery | AI Workflow (Markdown) | CLI (bin/lib) | Workflow interprets state and generates guidance; CLI reads STATE.md |
| Campaign archival | CLI (bin/lib) | AI Workflow (Markdown) | Directory move and learnings extraction are deterministic ops best in CLI; workflow orchestrates user confirmation |
| Health auditing | CLI (bin/lib) | AI Workflow (Markdown) | Validation checks are deterministic; CLI runs checks, workflow formats output |
| Next-command routing | AI Workflow (Markdown) | CLI (bin/lib) | Priority logic requires campaign context interpretation; CLI provides campaign list data |
| Learnings extraction | AI Workflow (Markdown) | -- | AI reads campaign artifacts and extracts structured learnings -- not deterministic enough for CLI |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins (fs, path) | 18+ | All CLI operations | Zero-dependency constraint per CLAUDE.md. Already used in all bin/lib modules. [VERIFIED: codebase inspection] |
| Markdown + YAML frontmatter | N/A | State storage, workflow instructions | Universal standard across all takeToMarket files. [VERIFIED: codebase inspection] |
| SKILL.md (Agent Skills standard) | Current | Slash command entry points | Five existing stubs in skills/ directory. [VERIFIED: codebase inspection] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | N/A | N/A | Zero runtime dependencies -- skills are Markdown files consumed by AI runtime |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fs.renameSync for archive move | fs.cpSync + fs.rmSync | renameSync fails across filesystems; cpSync is safer but Node 16.7+ only. Node 18+ guaranteed, so cpSync is safe. |
| Flat frontmatter for campaign state | Nested YAML objects | Existing parseFrontmatter only handles flat key:value. Dot-notation keys (e.g., `phase.shipped`) already solve nesting. No change needed. |

## Architecture Patterns

### System Architecture Diagram

```
User invokes /ttm-state, /ttm-resume, /ttm-archive, /ttm-health, or /ttm-next
    |
    v
SKILL.md (thin routing layer)
    |
    v
workflows/utility/{command}.md (orchestration logic)
    |
    +---> bin/ttm-tools.cjs campaign list [--active]   --> campaign.cjs
    +---> bin/ttm-tools.cjs campaign state <slug>       --> campaign.cjs
    +---> bin/ttm-tools.cjs campaign archive <slug>     --> campaign.cjs (NEW)
    +---> bin/ttm-tools.cjs health [--full]              --> health.cjs (EXTENDED)
    +---> bin/ttm-tools.cjs campaign update <slug> ...  --> campaign.cjs
    |
    v
.marketing/
├── STATE.md (global state)
├── LEARNINGS.md (updated by archive)
├── DRIFT-LOG.md (audited by health)
├── CAMPAIGNS/
│   ├── <slug>/STATE.md (per-campaign state)
│   └── ...
└── CAMPAIGNS/ARCHIVE/
    └── <slug>/ (archived campaigns)
```

### Recommended Project Structure (New Files)

```
workflows/
└── utility/
    ├── state.md            # /ttm-state dashboard workflow (~200-300 lines)
    ├── resume.md           # /ttm-resume session recovery (~200-250 lines)
    ├── archive.md          # /ttm-archive finalization workflow (~250-350 lines)
    ├── health.md           # /ttm-health audit workflow (~200-250 lines)
    └── next.md             # /ttm-next routing workflow (~200-300 lines)

references/
└── learnings-extraction.md # Template/guide for structured learnings extract

bin/lib/
├── campaign.cjs            # Extended: cmdCampaignArchive, cmdCampaignEnrich
└── health.cjs              # Extended: full audit checks (staleness, velocity, etc.)

skills/
├── ttm-state/SKILL.md      # Updated: remove stub notice, point to utility/state.md
├── ttm-resume/SKILL.md     # Updated: remove stub notice, point to utility/resume.md
├── ttm-archive/SKILL.md    # Updated: remove stub notice, point to utility/archive.md
├── ttm-health/SKILL.md     # Updated: remove stub notice, point to utility/health.md
└── ttm-next/SKILL.md       # Updated: remove stub notice, point to utility/next.md
```

### Pattern 1: Thin SKILL.md to Workflow Routing
**What:** Each SKILL.md is a minimal entry point (under 30 lines) that loads and follows a workflow Markdown file. All logic lives in the workflow.
**When to use:** Every slash command.
**Example:** (from existing pattern in skills/ttm-review/SKILL.md)
```yaml
---
name: ttm-state
description: >
  Display current campaign states, decisions in flight, blockers, and
  experiments.
disable-model-invocation: true
allowed-tools: Read Bash Glob
---
# /ttm-state
Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/utility/state.md`
```
[VERIFIED: codebase inspection of all existing SKILL.md files]

### Pattern 2: CLI for Deterministic Operations, Workflow for AI-Driven Logic
**What:** Operations that must produce identical results every time (directory moves, state reads, timestamp updates) go in `bin/lib/*.cjs`. Operations that require interpretation (learnings extraction, context summarization, priority reasoning) go in workflow Markdown.
**When to use:** Always -- this is the fundamental architecture of takeToMarket.
**Example:**
```bash
# Deterministic: CLI handles archive move
node bin/ttm-tools.cjs campaign archive my-campaign --raw

# AI-driven: Workflow handles learnings extraction
# (reads campaign artifacts, reasons about what worked/didn't, writes structured output)
```
[VERIFIED: codebase inspection -- established in all prior phases]

### Pattern 3: State Enrichment via Frontmatter
**What:** Per-campaign STATE.md frontmatter is the single source of truth for campaign status. Workflows enrich dashboard views by reading these fields and presenting them in human-readable format.
**When to use:** Any command that needs campaign status (state, resume, next, archive).
**Example:**
```javascript
// Read campaign state and determine next action
const { frontmatter } = parseFrontmatter(content);
const phase = frontmatter.phase;              // e.g., 'verified'
const fixCount = frontmatter['fix.run_count']; // e.g., '2'
const reviewResult = frontmatter['review.overall_result']; // e.g., 'revise'
```
[VERIFIED: codebase inspection of campaign.cjs cmdCampaignState]

### Pattern 4: Workflow XML Structure
**What:** Workflows use `<purpose>`, `<required_reading>`, `<constraints>`, `<process>` XML sections. Required reading uses `@${CLAUDE_PLUGIN_ROOT}/path` syntax for reference file loading.
**When to use:** All workflow files.
**Example:** (from existing workflows)
```markdown
<purpose>
State dashboard workflow for /ttm-state. Displays campaign overview...
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY
...
</constraints>

<process>
## Step 1: Load Context
...
</process>
```
[VERIFIED: codebase inspection of all lifecycle workflows]

### Anti-Patterns to Avoid
- **Writing campaign state to multiple locations:** STATE.md frontmatter is the single source of truth. Do not create parallel state files for archive status, resume tracking, or health results. [VERIFIED: D-06 decision]
- **Health checks that modify files:** D-13 explicitly prohibits self-healing. Health reports; user fixes. [VERIFIED: D-13 decision]
- **Archived campaign directory deletion:** Archive moves to ARCHIVE/ subdirectory but never deletes. Campaign data is preserved for learning extraction and historical reference. [VERIFIED: D-07, D-10 decisions]
- **Hard-coding phase transitions:** The lifecycle phase order must be derived from STATE.md frontmatter timestamp fields, not from a hard-coded array. Campaigns can skip phases (e.g., no research step) or loop (verify/fix cycles). [VERIFIED: codebase inspection -- campaign state uses null timestamps for incomplete phases]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Campaign listing/filtering | Custom directory scanner | `cmdCampaignList` from campaign.cjs | Already handles active filtering, shipped-since-audit, time windows, security checks. Extend it, don't replace it. |
| STATE.md parsing | Custom YAML parser | `parseFrontmatter` from core.cjs | Already handles flat dot-notation keys, quote escaping, round-trip serialization. |
| Directory existence checks | Custom stat logic | `dirExists`/`fileExists` from health.cjs | Already handle error cases gracefully. |
| Campaign state updates | Direct file writes | `cmdCampaignUpdate` from campaign.cjs | Handles ALLOWED_FIELDS validation, timestamp updates, path security checks. |
| DRIFT-LOG.md operations | Custom log parser | `drift-log.cjs` functions | Already handles TOCTOU-safe creation, marker-based appending, sanitization. |
| Slug sanitization | Custom regex | Pattern from campaign.cjs (`slug.toLowerCase().replace(/[^a-z0-9-]/g, '')`) | Consistent sanitization across all commands. |

**Key insight:** Phase 7 is primarily a composition phase. Nearly all the primitives already exist -- the work is orchestrating them into user-facing commands. The CLI needs a few new functions (archive move, enriched list, extended health checks), but the heavy lifting is in the workflow Markdown files that guide the AI through each operation.

## Common Pitfalls

### Pitfall 1: Archive Move Across Filesystems
**What goes wrong:** `fs.renameSync` fails silently or throws `EXDEV` when source and destination are on different filesystems (possible if `.marketing/` is on a different mount).
**Why it happens:** `rename` is a single filesystem operation at the OS level.
**How to avoid:** Use `fs.cpSync(src, dest, { recursive: true })` followed by `fs.rmSync(src, { recursive: true, force: true })`. Node 18+ guarantees both APIs. Wrap in try/catch and verify destination exists before removing source.
**Warning signs:** `EXDEV` error code in Node.js.
[ASSUMED -- standard Node.js filesystem behavior; unlikely in practice for `.marketing/` subdirectories but defensive coding is cheap]

### Pitfall 2: ACTIVE_PHASES Set Missing 'created' and 'researched'
**What goes wrong:** `cmdCampaignList` with `--active` filter uses `ACTIVE_PHASES = new Set(['briefed', 'produced', 'verified', 'reviewed', 'shipped'])`. Campaigns in 'created' or 'researched' phase are excluded from active list, causing `/ttm-next` to miss them.
**Why it happens:** Phase 6 defined "active" as campaigns past the brief stage. For `/ttm-next` routing, campaigns in any non-archived, non-cancelled state need to be considered.
**How to avoid:** Either extend ACTIVE_PHASES or create a separate filter for `/ttm-next` that includes all non-archived/non-cancelled campaigns. The `--active` filter semantics may need revisiting, or `/ttm-next` should use its own listing logic.
**Warning signs:** `/ttm-next` reports "no active campaigns" when campaigns exist in 'created' or 'researched' phases.
[VERIFIED: codebase inspection -- ACTIVE_PHASES on line 248 of campaign.cjs]

### Pitfall 3: ALLOWED_FIELDS Allowlist Blocking New State Fields
**What goes wrong:** `cmdCampaignUpdate` has a hardcoded `ALLOWED_FIELDS` Set. Any new state field for Phase 7 (e.g., 'archive.archived_at', 'archive.learnings_extracted') will be rejected unless added to the allowlist.
**Why it happens:** Security measure -- prevents arbitrary field injection.
**How to avoid:** Explicitly add new Phase 7 fields to the ALLOWED_FIELDS Set in campaign.cjs when extending it. Plan the field names before implementation.
**Warning signs:** "Unknown state field" errors when workflows try to update campaign state.
[VERIFIED: codebase inspection -- ALLOWED_FIELDS on lines 201-221 of campaign.cjs]

### Pitfall 4: Learnings Extraction Overwrites Existing LEARNINGS.md Content
**What goes wrong:** Writing extracted learnings to LEARNINGS.md replaces existing lessons from prior campaigns.
**Why it happens:** Using `safeWriteFile` instead of an append pattern.
**How to avoid:** Use a marker-based append pattern (like drift-log.cjs) to insert new entries into the Lessons Log table. Read existing content, find the table marker, insert new rows. The LEARNINGS.md template already has a table structure with column headers.
**Warning signs:** LEARNINGS.md shrinks after archive or loses entries from prior campaigns.
[VERIFIED: codebase inspection of LEARNINGS.md template and drift-log.cjs append pattern]

### Pitfall 5: Campaign Body Content Not Captured by parseFrontmatter
**What goes wrong:** `parseFrontmatter` returns both `frontmatter` and `body`, but campaigns may store important information (decisions, blockers, experiments) in the body section, not frontmatter. If workflows only read frontmatter, they miss body content.
**Why it happens:** The STATE.md template only has frontmatter fields for phases and gates -- no frontmatter fields for decisions, blockers, or experiments.
**How to avoid:** For `/ttm-state` (D-01), the workflow must read both frontmatter AND body of each campaign's STATE.md. Decisions, blockers, and experiments are in the body Markdown, not frontmatter. The AI workflow reads the full file and extracts these sections.
**Warning signs:** State dashboard shows phase info but empty sections for decisions/blockers/experiments.
[VERIFIED: codebase inspection of campaign-state.md template -- body only has "Phase:" and "Next step:" but no structured sections for decisions/blockers/experiments]

### Pitfall 6: Workflow Exceeds 500-Line Limit
**What goes wrong:** A workflow file goes over the 500-line limit set by FOUND-03.
**Why it happens:** State and health commands have many check categories, and archive has both validation + extraction + move logic.
**How to avoid:** Extract reference content (like learnings extraction template, health check categories, priority algorithm details) into supporting reference files loaded via `@`-syntax. Keep each workflow under 500 lines. Existing pattern: ship.md (521 lines) extracted checklist items to `ship-checklist-items.md`.
**Warning signs:** Any workflow file approaching 400 lines during implementation.
[VERIFIED: codebase inspection -- ship.md is 521 lines, slightly over limit, uses @-reference pattern]

## Code Examples

### Campaign State Reading (Existing Pattern)
```javascript
// Source: bin/lib/campaign.cjs lines 175-190
function cmdCampaignState(slug, raw) {
  const statePath = resolveCampaignStatePath(slug);
  const content = safeReadFile(statePath);
  if (content === null) {
    output({ exists: false, error: `Campaign STATE.md not found` }, raw, 'not found');
    return;
  }
  const { frontmatter, body } = parseFrontmatter(content);
  const result = { exists: true, ...frontmatter, body_preview: body.substring(0, 200) };
  output(result, raw, JSON.stringify(frontmatter));
}
```
[VERIFIED: codebase inspection]

### Archive Move Pattern (Recommended)
```javascript
// New function for campaign.cjs
function cmdCampaignArchive(slug, raw) {
  const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const projectRoot = path.resolve(process.cwd());
  const srcDir = path.resolve(projectRoot, '.marketing', 'CAMPAIGNS', safe);
  const destDir = path.resolve(projectRoot, '.marketing', 'CAMPAIGNS', 'ARCHIVE', safe);

  // Security checks
  if (!srcDir.startsWith(projectRoot)) error('path escapes project');
  if (!destDir.startsWith(projectRoot)) error('path escapes project');

  // Verify source exists
  if (!fs.existsSync(srcDir)) error(`Campaign not found: ${safe}`);
  if (fs.existsSync(destDir)) error(`Archive already exists: ${safe}`);

  // Ensure ARCHIVE/ directory exists
  fs.mkdirSync(path.dirname(destDir), { recursive: true });

  // Copy then remove (cross-filesystem safe)
  fs.cpSync(srcDir, destDir, { recursive: true });
  fs.rmSync(srcDir, { recursive: true, force: true });

  // Update state in archived location
  const statePath = path.resolve(destDir, 'STATE.md');
  const content = safeReadFile(statePath);
  const { frontmatter, body } = parseFrontmatter(content);
  frontmatter.phase = 'archived';
  frontmatter['archive.archived_at'] = new Date().toISOString();
  frontmatter.last_updated = new Date().toISOString();
  safeWriteFile(statePath, serializeFrontmatter(frontmatter, body));

  output({ archived: true, slug: safe, dest: destDir }, raw, `archived ${safe}`);
}
```
[ASSUMED -- pattern derived from existing campaign.cjs conventions and Node.js 18+ APIs]

### Health Check Extension Pattern (Recommended)
```javascript
// Extended health check categories for health.cjs
function checkCampaignStateConsistency(campaignsDir) {
  const checks = [];
  const entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'ARCHIVE') continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    const content = safeReadFile(statePath);
    if (!content) {
      checks.push({ name: `campaign_${entry.name}`, status: 'fail', detail: 'missing STATE.md' });
      continue;
    }
    const { frontmatter } = parseFrontmatter(content);
    // Validate phase value
    const validPhases = new Set([
      'created', 'researched', 'briefed', 'produced',
      'verified', 'reviewed', 'fixed', 'shipped',
      'measured', 'learned', 'archived', 'cancelled'
    ]);
    if (!validPhases.has(frontmatter.phase)) {
      checks.push({
        name: `campaign_${entry.name}`,
        status: 'fail',
        detail: `invalid phase: ${frontmatter.phase}`
      });
    }
  }
  return checks;
}
```
[ASSUMED -- pattern derived from existing health.cjs conventions]

### Phase-to-Next-Command Mapping (Recommended)
```javascript
// Mapping for /ttm-next routing logic
const PHASE_NEXT_COMMAND = {
  'created': (slug) => `/ttm-research ${slug}`,
  'researched': (slug) => `/ttm-brief ${slug}`,
  'briefed': (slug) => `/ttm-produce ${slug}`,
  'produced': (slug) => `/ttm-verify ${slug}`,
  'verified': (slug) => `/ttm-review ${slug}`,
  'reviewed': (slug) => `/ttm-fix ${slug}`,    // only if review_status = 'revise'
  'fixed': (slug) => `/ttm-review ${slug}`,     // re-review after fix
  'shipped': (slug) => `/ttm-measure ${slug}`,
  'measured': (slug) => `/ttm-learn ${slug}`,
  'learned': (slug) => `/ttm-archive ${slug}`,
};
```
[ASSUMED -- lifecycle order derived from campaign-state.md template phase fields and workflow sequence]

### Learnings Extraction Append Pattern (Recommended)
```markdown
<!-- In LEARNINGS.md, append after the table header row -->
| 2026-04-28 | spring-launch | weak-hook | Blog opener was generic; switching to pain-point-first format increased engagement | Updated BRAND.md with new hook pattern |
```
[VERIFIED: pattern from LEARNINGS.md template structure]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate handoff files for resume | STATE.md frontmatter as recovery mechanism | Phase 7 D-06 | Simpler -- no second file to keep in sync |
| Manual campaign archival | CLI-driven archive with auto-learning extraction | Phase 7 D-07/D-09 | Learnings compound automatically |
| Single-campaign next suggestion | Multi-campaign portfolio routing | Phase 7 D-14 | Reduces decision fatigue across campaigns |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `fs.cpSync` is available in Node 18+ | Architecture Patterns / Code Examples | Archive move would need fallback implementation. LOW risk -- Node 18.7+ docs confirm. |
| A2 | Phase-to-next-command mapping follows linear lifecycle | Code Examples | If campaigns can be in non-linear states, routing logic needs extra conditions. MEDIUM risk -- verify/fix loops already handled by D-05. |
| A3 | Staleness threshold of 90 days and velocity threshold of 14 days are reasonable defaults | Common Pitfalls | User may want different thresholds. LOW risk -- discretion area, can adjust. |
| A4 | `fs.renameSync` could fail across filesystems | Pitfall 1 | Extremely unlikely for subdirectories within same `.marketing/` tree. VERY LOW risk. |

## Open Questions (RESOLVED)

1. **Campaign body content for decisions/blockers/experiments**
   - What we know: Current STATE.md template body only has "Phase:" and "Next step:" lines. No structured sections for decisions, blockers, or experiments.
   - What's unclear: Should /ttm-state read these from the global `.marketing/STATE.md` body (which has decisions/blockers/experiments sections from onboarding), or should campaigns grow their own decision/blocker sections in their STATE.md body during lifecycle execution?
   - Recommendation: Read from the global `.marketing/STATE.md` for portfolio-level decisions/blockers/experiments. Per-campaign status comes from campaign STATE.md frontmatter. The dashboard merges both. This aligns with D-03 which says "enriches with per-campaign STATE.md fields."
   - RESOLVED: Read from global `.marketing/STATE.md` for portfolio-level data; per-campaign frontmatter for campaign-specific status. Dashboard merges both per D-03. Implemented in Plan 07-02 Task 1.

2. **New ALLOWED_FIELDS for Phase 7**
   - What we know: campaign.cjs update function validates against ALLOWED_FIELDS allowlist.
   - What's unclear: Exact list of new fields needed (e.g., `archive.archived_at`, `archive.learnings_extracted`, `cancel.cancelled_at`, `cancel.reason`).
   - Recommendation: Add fields during implementation: `archive.archived_at`, `archive.learnings_extracted`, `cancel.cancelled_at`, `cancel.reason`. Also add `cancelled` and `archived` to the valid phase values.
   - RESOLVED: Four fields added (`archive.archived_at`, `archive.learnings_extracted`, `cancel.cancelled_at`, `cancel.reason`) plus `cancelled`/`archived` phase values. Implemented in Plan 07-01 Task 1.

3. **DRIFT-LOG.md audit scope in /ttm-health**
   - What we know: D-11 mentions DRIFT-LOG.md integrity check. Discretion area notes it may overlap with /ttm-positioning-check.
   - What's unclear: How deep should the DRIFT-LOG.md audit go?
   - Recommendation: Keep it structural -- validate the file exists, has correct table structure, no duplicate markers, entries are chronologically ordered. Do NOT re-evaluate positioning drift (that is /ttm-positioning-check's job). This avoids overlap.
   - RESOLVED: Structural validation only (file exists, table structure, no duplicate markers, chronological order). No drift re-evaluation. Implemented in Plan 07-01 Task 2 `checkDriftLogIntegrity`.

## Project Constraints (from CLAUDE.md)

- **Platform**: Must work as Claude Code skill AND Codex skill
- **No external dependencies**: Zero npm dependencies in bin/ tools (Node.js built-ins only)
- **State persistence**: All state in `.marketing/` directory files
- **File limit**: No single file exceeds 500 lines (FOUND-03)
- **SKILL.md routing**: Thin entry points with `disable-model-invocation: true` for deliberate actions
- **Single bin entry point**: `bin/ttm-tools.cjs` with subcommands, not multiple bin scripts
- **Context loading**: Two-tier strategy -- Tier 1 summaries universal, Tier 2 only when needed
- **Text-mode fallback**: All commands must work without AskUserQuestion (numbered list prompts)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node --test` (or manual CLI invocation) |
| Config file | none -- CLI tools tested via direct invocation |
| Quick run command | `node bin/ttm-tools.cjs health --raw` |
| Full suite command | Manual CLI exercise of all 5 commands |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STAT-01 | /ttm-state shows campaign overview | smoke | `node bin/ttm-tools.cjs campaign list --raw` | Existing |
| STAT-02 | /ttm-resume loads and suggests next | smoke | `node bin/ttm-tools.cjs campaign state <slug> --raw` | Existing |
| STAT-03 | /ttm-archive moves and extracts learnings | smoke | `node bin/ttm-tools.cjs campaign archive <slug> --raw` | Wave 0 |
| STAT-04 | /ttm-health validates full directory | smoke | `node bin/ttm-tools.cjs health --full --raw` | Wave 0 (extended) |
| STAT-05 | State persists via directory files | integration | verify STATE.md exists after campaign operations | Existing |
| UTIL-10 | /ttm-next routes to correct command | smoke | Manual -- requires active campaigns | Wave 0 |

### Sampling Rate
- **Per task commit:** `node bin/ttm-tools.cjs health --raw` (quick structural check)
- **Per wave merge:** Exercise all 5 new commands with a test campaign
- **Phase gate:** All 5 commands produce expected output for a test campaign lifecycle

### Wave 0 Gaps
- [ ] `campaign archive` subcommand in ttm-tools.cjs -- covers STAT-03
- [ ] Extended health checks in health.cjs -- covers STAT-04
- [ ] Test campaign fixture for smoke testing (create, advance through phases, archive)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A (local filesystem skill) |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes | Slug sanitization via `slug.toLowerCase().replace(/[^a-z0-9-]/g, '')`, ALLOWED_FIELDS allowlist, path traversal prevention via `path.resolve` + `startsWith` check |
| V6 Cryptography | no | N/A |

### Known Threat Patterns for Node.js CLI

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via malicious slug | Tampering | `resolveCampaignStatePath` security check (already implemented) |
| Arbitrary field injection via campaign update | Tampering | ALLOWED_FIELDS allowlist (already implemented, extend for Phase 7) |
| TOCTOU race on file creation | Tampering | `{ flag: 'wx' }` atomic create (already used in campaign.cjs, drift-log.cjs) |
| Archive path escape | Tampering | Destination path must `startsWith(projectRoot)` -- apply same pattern as existing code |

## Sources

### Primary (HIGH confidence)
- **bin/lib/campaign.cjs** -- Campaign CRUD operations, ALLOWED_FIELDS, ACTIVE_PHASES, list filtering [direct codebase inspection]
- **bin/lib/health.cjs** -- Existing health validation checks, dirExists/fileExists helpers [direct codebase inspection]
- **bin/lib/state.cjs** -- STATE.md read/write operations [direct codebase inspection]
- **bin/lib/core.cjs** -- parseFrontmatter, serializeFrontmatter, output helpers [direct codebase inspection]
- **bin/lib/drift-log.cjs** -- Append-only pattern with marker-based insertion [direct codebase inspection]
- **bin/ttm-tools.cjs** -- CLI router with subcommand dispatch [direct codebase inspection]
- **templates/campaign-state.md** -- Campaign STATE.md shape documentation [direct codebase inspection]
- **templates/reference-files/learnings.md** -- LEARNINGS.md template with root-cause taxonomy [direct codebase inspection]
- **references/context-loading.md** -- Two-tier loading strategy and per-workflow loading matrix [direct codebase inspection]
- **All 5 SKILL.md stubs** -- Existing frontmatter, allowed-tools, workflow path references [direct codebase inspection]
- **All 8 lifecycle workflows** -- Established patterns for workflow structure, text-mode, constraints [direct codebase inspection]

### Secondary (MEDIUM confidence)
- None needed -- this phase builds entirely on existing codebase patterns.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero external dependencies, all built on existing codebase primitives
- Architecture: HIGH -- follows established thin-SKILL.md + workflow + CLI pattern from 6 prior phases
- Pitfalls: HIGH -- identified from direct code inspection of existing modules (ALLOWED_FIELDS, ACTIVE_PHASES, parseFrontmatter behavior)

**Research date:** 2026-04-28
**Valid until:** 2026-06-28 (stable -- no external dependencies to go stale)
