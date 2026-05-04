# Phase 10: Distribution and Polish - Research

**Researched:** 2026-05-04
**Domain:** npm distribution, CLI installer, Agent Skills workflows, content repurposing orchestration
**Confidence:** HIGH

## Summary

Phase 10 delivers the final user-facing surface of takeToMarket: two installation paths (git clone and npm), 9 utility command workflows, and comprehensive README documentation. The phase splits into three clear workstreams: (1) the npm installer (`install.js`) with runtime detection and post-install validation, (2) nine utility workflows following established patterns already proven in Phases 1-9, and (3) README documentation.

The critical insight is that all utility workflows (except /ttm-repurpose) are thin single-pass patterns -- structurally identical to existing workflows like `positioning-check.md`. They follow the same `<purpose>` + `<required_reading>` + `<process>` structure. The repurpose command is the only complex workflow, requiring Task() orchestration similar to `produce.md`.

**Primary recommendation:** Implement install.js first (unblocks real users), then batch the 8 thin utility workflows in parallel waves grouped by category (reference-mgmt, discipline), then tackle repurpose as its own dedicated effort, and finish with README rewrite.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Single `install.js` entry point with runtime detection via environment sniffing
- D-02: Runtime detection order: (1) explicit --runtime flag, (2) .claude/ exists, (3) .codex/ exists, (4) default to Claude Code
- D-03: Post-install validation runs structural subset of /ttm-health (directory existence, file integrity)
- D-04: npm install flow: npx taketomarket -> detect runtime -> copy plugin files -> structural validation -> print quickstart
- D-05: Git clone flow: manual cp -r, documented in README
- D-06: Reference management commands are lightweight single-pass workflows
- D-07: Discipline audit commands are single-pass analysis workflows reusing playbook gate logic
- D-08: All 8 non-repurpose utility commands follow thin pattern: SKILL.md stub -> workflow file (100-300 lines each)
- D-09: Utility commands use MCP tool detection pattern from Phase 3/9 for WebSearch/WebFetch
- D-10: Repurpose is full brief-produce-verify per derivative (NOT lightweight)
- D-11: Derivative brief generation: analyze source, cross-reference CHANNELS.md, generate mini-brief per channel
- D-12: Channel selection: default all active minus source channel, user can override
- D-13: Execution: hero derivative first, then remaining in wave-parallel via Task()
- D-14: All derivatives tracked in MANIFEST.json with source_asset cross-reference
- D-15: README full rewrite with quickstart, command reference, architecture overview
- D-16: No separate docs site -- README.md is single documentation source
- D-17: Include "How It Works" section with text-based flow diagram

### Claude's Discretion
- Exact post-install validation checks (structural subset of /ttm-health)
- How install.js handles partial/failed installs (cleanup or leave partial)
- Reference management workflow question design
- Discipline audit report format (inline text vs separate file)
- Whether keyword-map outputs to a file or stdout
- README structure and section ordering
- How competitor-scan sources data when no web search MCP available

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DIST-01 | Git clone installation works immediately | D-05: manual copy documented in README; existing plugin structure already correct |
| DIST-02 | npx taketomarket installs with runtime detection | D-01 through D-04: install.js with environment sniffing and file copy |
| DIST-03 | Post-install validation confirms correct setup | D-03: reuse health.cjs structural checks (directory existence, file integrity) |
| DIST-04 | README.md with installation, quickstart, reference docs | D-15 through D-17: full rewrite with command reference table and architecture |
| UTIL-01 | /ttm-brand-refresh updates BRAND.md | D-06: lightweight single-pass, read current -> ask user -> validate -> write |
| UTIL-02 | /ttm-icp-refresh updates ICP.md | D-06: same pattern as brand-refresh |
| UTIL-03 | /ttm-competitor-scan updates COMPETITORS.md | D-06 + D-09: MCP tool detection for web search, fallback to manual paste |
| UTIL-04 | /ttm-seo-audit for URL/sitemap analysis | D-07: single-pass using SEO playbook gates as checklist |
| UTIL-05 | /ttm-aeo-check for AI citation status | D-07 + D-09: MCP tool detection, query AI engines or manual paste |
| UTIL-06 | /ttm-keyword-map generates keyword clusters | D-07: single-pass analysis, cluster keywords with intent tags |
| UTIL-07 | /ttm-email-preflight deliverability scan | D-07: single-pass using email playbook gates as checklist |
| UTIL-08 | /ttm-affiliate-kit generates creative kit | D-07: single-pass using affiliate playbook gates |
| UTIL-09 | /ttm-repurpose fans out long-form to derivatives | D-10 through D-14: full lifecycle orchestration with Task() |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| npm installation | CLI (Node.js) | -- | install.js runs as CLI binary, copies files, validates |
| Runtime detection | CLI (Node.js) | -- | Environment sniffing for .claude/ vs .codex/ directories |
| Post-install validation | CLI (Node.js) | -- | Reuses health.cjs logic, runs as part of install.js |
| Reference management workflows | AI Runtime (SKILL.md) | -- | Claude reads workflow Markdown, interacts with user |
| Discipline audit workflows | AI Runtime (SKILL.md) | -- | Claude reads workflow + playbook gates, generates report |
| Repurpose orchestration | AI Runtime (SKILL.md) | CLI (campaign.cjs) | Task() spawns subagents; campaign.cjs tracks MANIFEST |
| README documentation | Static file | -- | Markdown read by humans, no runtime involvement |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins (fs, path, os) | 18+ | install.js file operations | Zero-dependency constraint from CLAUDE.md; Node 18+ guaranteed by Claude Code |
| Markdown workflows | N/A | All utility command implementations | Established pattern from Phases 1-9; AI runtime reads Markdown natively |
| YAML frontmatter | N/A | SKILL.md metadata | Universal standard across all Agent Skills runtimes |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| process.env / os.homedir() | Node built-in | Runtime detection in install.js | Detecting Claude Code vs Codex installation paths |
| child_process.execSync | Node built-in | Running health validation post-install | Optional: could also import health.cjs directly |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct file copy in install.js | Symlinks | Symlinks break on some Windows setups; direct copy is more portable |
| health.cjs import | Shelling out to ttm-tools.cjs health | Import is simpler, avoids spawning child process |
| One workflow per utility | Shared workflow template | Per-command files are clearer; 100-300 lines is manageable |

**Installation (for end users):**
```bash
npx taketomarket
# or
git clone <repo> && cp -r takeToMarket/skills/ .claude/skills/
```

## Architecture Patterns

### System Architecture Diagram

```
[User runs `npx taketomarket`]
    |
    v
[install.js]
    |
    +-- Detect runtime (--runtime flag > .claude/ > .codex/ > default)
    |
    +-- Copy plugin files to target location
    |       ~/.claude/plugins/taketomarket/  (Claude Code)
    |       ~/.codex/plugins/taketomarket/   (Codex)
    |
    +-- Run structural validation (health.cjs subset)
    |
    +-- Print quickstart instructions
    |
    v
[User runs /ttm-* commands]
    |
    +-- Utility commands (thin, single-pass)
    |       brand-refresh, icp-refresh, competitor-scan
    |       seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit
    |
    +-- Repurpose command (full lifecycle)
            |
            +-- Analyze source asset
            +-- Generate derivative briefs per channel
            +-- Task() hero derivative (blocking)
            +-- Task() remaining derivatives (wave-parallel)
            +-- Track in MANIFEST.json
```

### Recommended Project Structure (New Files)

```
install.js                              # npm bin entry point (NEW)
workflows/
  reference-mgmt/
    brand-refresh.md                    # NEW
    icp-refresh.md                      # NEW
    competitor-scan.md                  # NEW
  discipline/
    seo-audit.md                        # NEW
    aeo-check.md                        # NEW
    keyword-map.md                      # NEW
    email-preflight.md                  # NEW
    affiliate-kit.md                    # NEW
    repurpose.md                        # NEW
README.md                               # REWRITE
```

### Pattern 1: Thin Utility Workflow

**What:** Single-pass workflow that loads context, performs one operation, outputs result.
**When to use:** All 8 non-repurpose utility commands.
**Example:**

```markdown
<purpose>
[Brief description of what this workflow does]
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY
[Standard positioning constraint block]
</constraints>

<process>

## Text-Mode Detection
[Standard text-mode detection block]

---

## Step 1: Load Context
[Load relevant reference files - Tier 1 summaries + Tier 2 for relevant file]

---

## Step 2: [Core Operation]
[The actual work - user input, analysis, or web search]

---

## Step 3: Validate Against Positioning
[Check changes/output against POSITIONING.md invariant]

---

## Step 4: Output Result
[Write updated file or display report]

</process>
```
[VERIFIED: local codebase inspection of positioning-check.md and research.md patterns]

### Pattern 2: install.js Runtime Detection

**What:** Node.js CLI script that detects which AI runtime is installed and copies files accordingly.
**When to use:** npm distribution path.
**Example:**

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse --runtime flag
const args = process.argv.slice(2);
const runtimeIdx = args.indexOf('--runtime');
let runtime = null;

if (runtimeIdx !== -1 && args[runtimeIdx + 1]) {
  runtime = args[runtimeIdx + 1]; // explicit override
}

if (!runtime) {
  // Detect from environment
  const home = os.homedir();
  if (fs.existsSync(path.join(home, '.claude'))) {
    runtime = 'claude';
  } else if (fs.existsSync(path.join(home, '.codex'))) {
    runtime = 'codex';
  } else {
    runtime = 'claude'; // default
    console.log('Note: Defaulting to Claude Code. Use --runtime codex if using Codex.');
  }
}

// Determine target directory
const home = os.homedir();
const targetDir = runtime === 'codex'
  ? path.join(home, '.codex', 'plugins', 'taketomarket')
  : path.join(home, '.claude', 'plugins', 'taketomarket');

// Copy plugin files...
```
[ASSUMED: plugin install paths based on CLAUDE.md documentation references]

### Pattern 3: Repurpose Orchestration (Task-parallel)

**What:** Full brief-produce-verify lifecycle scoped to derivative assets from one source.
**When to use:** /ttm-repurpose only.
**Example:**

```markdown
## Step N: Produce Derivatives (Wave-Parallel)

For HERO derivative (highest-reach channel):
- Spawn Task() with: source asset + derivative brief + channel playbook + positioning (full)
- Wait for completion before proceeding

For REMAINING derivatives:
- Spawn Task() for each in parallel
- Each gets: source asset + its derivative brief + its channel playbook + positioning (full)
- Track completion status per derivative
```
[VERIFIED: local codebase produce.md uses same Task() pattern]

### Anti-Patterns to Avoid
- **Multi-step pipelines for simple utilities:** D-06/D-07 explicitly state single-pass. Do not build multi-step state machines for brand-refresh or seo-audit.
- **Shared workflow dispatcher:** Each utility gets its own workflow file. Do not build a generic "utility dispatcher" -- it violates the thin SKILL.md -> dedicated workflow pattern.
- **Running npm install in install.js:** The skill has zero runtime dependencies. install.js only copies files, never runs npm install.
- **Hardcoding paths:** Use `os.homedir()` and `path.join()` -- never hardcode `/Users/x/.claude/`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Health validation in install.js | Custom structural checks | Import from `bin/lib/health.cjs` | Already battle-tested, covers all edge cases |
| Campaign state operations | Direct file manipulation | `bin/ttm-tools.cjs campaign` CLI | Handles sanitization, path security, frontmatter parsing |
| MCP tool detection | Custom probe logic | Copy pattern from `workflows/lifecycle/research.md` Step 5 | Proven pattern: attempt WebSearch call, fallback on failure |
| Frontmatter parsing | Custom YAML parser | `bin/lib/core.cjs` parseFrontmatter | Already handles edge cases (empty files, malformed YAML) |
| Gate evaluation logic | Re-implement gate checks | Reference `gates/gate-evaluation.md` + playbook gates | Already defines gate structure and pass/warn/fail semantics |

**Key insight:** This phase is predominantly integration and routing -- connecting existing infrastructure (health checks, campaign state, gate logic, production orchestration) to new command entry points. Very little new logic needs to be invented.

## Common Pitfalls

### Pitfall 1: install.js Path Resolution
**What goes wrong:** Using `__dirname` to find source files when running via `npx` resolves to npm cache, not the user's clone.
**Why it happens:** `npx` downloads the package to a temporary cache directory. `__dirname` points there correctly, but paths must be resolved relative to the package, not cwd.
**How to avoid:** Use `path.resolve(__dirname, '..')` or package.json `files` array to ensure all distributable files are co-located with install.js in the npm package.
**Warning signs:** "file not found" errors during npx install that don't reproduce with local `node install.js`.

### Pitfall 2: Partial Install Cleanup
**What goes wrong:** install.js crashes mid-copy, leaving an incomplete plugin directory that makes future installs fail.
**Why it happens:** No error handling around recursive directory copy operations.
**How to avoid:** Copy to a temporary directory first, then atomic rename/move to final location. Or: detect partial installs at start and offer to clean up.
**Warning signs:** Users reporting "already installed" errors when the installation is actually broken.

### Pitfall 3: Workflow File Length Creep
**What goes wrong:** Utility workflows exceed the 500-line limit or 300-line target from D-08.
**Why it happens:** Including too much inline guidance instead of @-referencing existing playbooks and references.
**How to avoid:** Use `@${CLAUDE_PLUGIN_ROOT}/playbooks/seo.md` references rather than copying gate content inline. Keep each workflow to its routing + orchestration role.
**Warning signs:** Workflow files approaching 250+ lines -- extract to a reference file.

### Pitfall 4: Repurpose Without Campaign Context
**What goes wrong:** /ttm-repurpose is invoked for an asset that doesn't belong to any campaign, or the campaign state doesn't support derivative production.
**Why it happens:** User passes a file path instead of a campaign asset reference.
**How to avoid:** Validate that the source asset exists within a campaign's ASSETS/ directory and that the campaign is in an appropriate phase (produced, verified, reviewed, fixed, shipped).
**Warning signs:** Derivatives generated without positioning context because no campaign brief was loaded.

### Pitfall 5: Plugin Path Differences Across OS
**What goes wrong:** install.js works on macOS but fails on Linux/Windows because plugin discovery paths differ.
**Why it happens:** Assuming `~/.claude/plugins/` is universal without checking OS-specific conventions.
**How to avoid:** Use `os.homedir()` for ~ expansion. For Windows, check if Claude Code uses `%APPDATA%` instead of `~/.claude/`. Document known platform limitations.
**Warning signs:** Issue reports from Windows/Linux users after npm publish.

## Code Examples

### install.js Structure (Complete Pattern)

```javascript
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Constants ---
const PACKAGE_ROOT = __dirname;
const DIRS_TO_COPY = ['.claude-plugin', 'skills', 'workflows', 'templates',
                      'references', 'playbooks', 'gates', 'bin'];
const FILES_TO_COPY = ['settings.json'];

// --- Runtime Detection (D-02) ---
function detectRuntime(args) {
  const idx = args.indexOf('--runtime');
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  const home = os.homedir();
  if (fs.existsSync(path.join(home, '.claude'))) return 'claude';
  if (fs.existsSync(path.join(home, '.codex'))) return 'codex';
  return 'claude'; // default
}

// --- Recursive Copy ---
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// --- Post-Install Validation (D-03) ---
function validateInstall(targetDir) {
  const checks = [];
  for (const dir of DIRS_TO_COPY) {
    const exists = fs.existsSync(path.join(targetDir, dir));
    checks.push({ name: dir, status: exists ? 'pass' : 'fail' });
  }
  // Check plugin.json
  const pluginJson = path.join(targetDir, '.claude-plugin', 'plugin.json');
  checks.push({ name: 'plugin.json', status: fs.existsSync(pluginJson) ? 'pass' : 'fail' });
  return checks;
}

// --- Main ---
function main() {
  const args = process.argv.slice(2);
  const runtime = detectRuntime(args);
  const home = os.homedir();
  const targetDir = runtime === 'codex'
    ? path.join(home, '.codex', 'plugins', 'taketomarket')
    : path.join(home, '.claude', 'plugins', 'taketomarket');

  console.log(`\ntakeToMarket installer`);
  console.log(`Runtime detected: ${runtime}`);
  console.log(`Installing to: ${targetDir}\n`);

  // Copy directories
  for (const dir of DIRS_TO_COPY) {
    const src = path.join(PACKAGE_ROOT, dir);
    if (fs.existsSync(src)) copyDirSync(src, path.join(targetDir, dir));
  }
  // Copy files
  for (const file of FILES_TO_COPY) {
    const src = path.join(PACKAGE_ROOT, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, file));
    }
  }

  // Validate (D-03)
  const checks = validateInstall(targetDir);
  const failures = checks.filter(c => c.status === 'fail');
  // Print results and quickstart...
}

main();
```
[VERIFIED: follows GSD install.js pattern from local ~/.claude/get-shit-done/ inspection]

### Reference Management Workflow Pattern (brand-refresh)

```markdown
<purpose>
Update BRAND.md with new proof points, deprecate expired ones, and refresh voice
guidelines. Validates all changes against POSITIONING.md invariant before writing.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<process>

## Step 1: Load Context
Read full .marketing/BRAND.md and Tier 1 summary of .marketing/POSITIONING.md.

## Step 2: Present Current State
Display current proof points with dates. Ask user:
- Which proof points are now expired or outdated?
- What new proof points should be added? (Evidence, source, date)
- Any voice/tone updates needed?

## Step 3: Validate Against Positioning
Check proposed changes do not contradict POSITIONING.md fields.
If conflict detected: warn user and ask to resolve.

## Step 4: Write Updated BRAND.md
Apply changes, mark deprecated items with [DEPRECATED: date, reason].
Preserve file structure and frontmatter.

</process>
```
[VERIFIED: follows positioning-check.md and research.md structural patterns]

### Discipline Audit Pattern (seo-audit)

```markdown
<process>

## Step 1: Load Context
Read Tier 1 .marketing/POSITIONING.md, full .marketing/CHANNELS.md.
Read SEO playbook: @${CLAUDE_PLUGIN_ROOT}/playbooks/seo.md

## Step 2: Get Target
Ask user for URL or content to audit.
Attempt WebSearch/WebFetch if available (MCP detection pattern from research.md).

## Step 3: Run Gate Checks
Evaluate content against each SEO discipline gate from playbook:
- Search intent match
- Keyword placement (title, H1, first 100 words)
- Content structure (heading hierarchy)
- Internal linking density
- Schema markup presence
- Entity references
- Performance considerations

## Step 4: Generate Report
Output structured report with PASS/WARN/FAIL per check.
Include specific recommendations for WARN/FAIL items.

</process>
```
[VERIFIED: SEO playbook gates confirmed from local playbooks/seo.md inspection]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| .claude/commands/*.md flat files | .claude/skills/name/SKILL.md directories | Claude Code 2024 | Skills support additional files, hooks, subagent execution |
| Manual skill installation | /plugin install and marketplace | Claude Code 2025 | Plugins auto-discover skills, add bin/ to PATH |
| Single CLAUDE.md for all runtimes | CLAUDE.md + AGENTS.md side-by-side | Codex launch 2025 | Dual-runtime support requires both files |

**Deprecated/outdated:**
- `.claude/commands/*.md` format: Superseded by skills directory format. [VERIFIED: CLAUDE.md states this explicitly]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Claude Code plugins install to ~/.claude/plugins/name/ | Architecture Patterns | install.js copies to wrong location; would need path correction |
| A2 | Codex plugins install to ~/.codex/plugins/name/ | Architecture Patterns | Codex users would get broken install; need to verify Codex plugin path |
| A3 | npx runs install.js with __dirname pointing to package root | Common Pitfalls | File copy would fail; need to verify npm package layout |
| A4 | Claude Code on Windows uses %USERPROFILE%/.claude/ not %APPDATA% | Pitfall 5 | Windows installs would fail |

## Open Questions (RESOLVED)

1. **Exact Codex plugin installation path**
   - RESOLVED: Default to `~/.codex/plugins/` based on CLAUDE.md decision D-02. The `--runtime codex` flag uses this path. Configurable via explicit flag override.

2. **MANIFEST.json schema for derivative tracking (D-14)**
   - RESOLVED: Add `source_asset_id` field (nullable string) to existing asset entries in MANIFEST.json. Repurpose derivatives reference their source asset's ID. Schema: `{ "source_asset_id": "asset-slug-or-null" }`.

3. **Whether to output audit reports to file or stdout**
   - RESOLVED: Output inline (conversation text) by default. keyword-map writes to `.marketing/KEYWORD-MAP.md` since it's reference data. Other audits are ephemeral analysis — no file persistence for MVP.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in (assert + manual) |
| Config file | none -- skill is Markdown, no test runner applies |
| Quick run command | `node bin/ttm-tools.cjs health --raw` |
| Full suite command | `node install.js --runtime claude && node bin/ttm-tools.cjs health --raw` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIST-01 | Git clone + copy works | smoke | `cp -r skills/ /tmp/test-clone/.claude/skills/ && ls /tmp/test-clone/.claude/skills/ttm-init/SKILL.md` | Wave 0 |
| DIST-02 | npx install works | smoke | `node install.js --runtime claude && ls ~/.claude/plugins/taketomarket/skills/` | Wave 0 |
| DIST-03 | Post-install validation passes | unit | `node -e "require('./bin/lib/health.cjs').cmdHealth(true)"` | Existing |
| DIST-04 | README has all sections | manual-only | Visual inspection of README.md sections | N/A |
| UTIL-01-08 | Utility workflows exist and route correctly | smoke | `ls workflows/reference-mgmt/*.md workflows/discipline/*.md` | Wave 0 |
| UTIL-09 | Repurpose workflow exists with Task() | smoke | `grep -l "Task()" workflows/discipline/repurpose.md` | Wave 0 |

### Sampling Rate
- **Per task commit:** `node bin/ttm-tools.cjs health --raw`
- **Per wave merge:** `node install.js --runtime claude && node bin/ttm-tools.cjs health --raw`
- **Phase gate:** Full install flow + all workflow files exist + README validation

### Wave 0 Gaps
- [ ] Install validation test script (test install.js copies correctly to temp dir)
- [ ] Workflow existence check (all 9 new workflows present)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- local skill, no auth |
| V3 Session Management | no | N/A -- stateless file operations |
| V4 Access Control | no | N/A -- filesystem permissions only |
| V5 Input Validation | yes | Slug sanitization in campaign.cjs (already implemented) |
| V6 Cryptography | no | N/A -- no secrets handled |

### Known Threat Patterns for install.js

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal in install target | Tampering | path.resolve() + startsWith() check (established in campaign.cjs) |
| Arbitrary file overwrite during install | Tampering | Only copy to known plugin directories, never overwrite system files |
| Symlink following during copy | Elevation | Use fs.lstatSync to detect symlinks, skip or warn |

## Sources

### Primary (HIGH confidence)
- Local codebase: `bin/lib/health.cjs` -- structural validation logic confirmed
- Local codebase: `bin/lib/campaign.cjs` -- MANIFEST.json and state management patterns
- Local codebase: `workflows/lifecycle/produce.md` -- Task() orchestration pattern
- Local codebase: `workflows/lifecycle/research.md` -- MCP tool detection pattern
- Local codebase: `playbooks/seo.md` -- gate definitions for reuse in seo-audit
- Local codebase: `workflows/reference-mgmt/positioning-check.md` -- thin workflow structure
- Local codebase: `package.json` -- npm distribution config (bin, files array)
- Local codebase: `.claude-plugin/plugin.json` -- plugin manifest format

### Secondary (MEDIUM confidence)
- CLAUDE.md project documentation -- plugin distribution paths, skill format specification
- GSD installation pattern at `~/.claude/get-shit-done/` -- installer architecture reference

### Tertiary (LOW confidence)
- Codex plugin installation path (~/.codex/plugins/) -- not verified against Codex docs [ASSUMED]
- Windows path conventions for Claude Code -- not verified [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - zero dependencies, all Node.js built-ins, patterns established in prior phases
- Architecture: HIGH - all patterns proven in Phases 1-9, only new file is install.js
- Pitfalls: HIGH - based on direct codebase inspection and known npm/Node.js behaviors

**Research date:** 2026-05-04
**Valid until:** 2026-06-04 (stable -- this phase uses only internal patterns, no external API dependencies)
