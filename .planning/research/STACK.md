# Stack Research

**Domain:** Claude Code / Codex marketing operating system skill
**Researched:** 2026-04-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| SKILL.md (Agent Skills standard) | Current | Skill entry point and slash command definition | Universal standard adopted by Claude Code, Codex, Gemini CLI, Cursor, and 8+ runtimes. Each SKILL.md directory becomes a `/ttm-*` slash command. Verified via official Claude Code docs. |
| CLAUDE.md | Current | Project-level instruction file for Claude Code | Loaded automatically in every session. takeToMarket uses this to inject positioning-as-invariant enforcement and campaign lifecycle rules. |
| AGENTS.md | Current | Codex-compatible instruction file | Codex reads AGENTS.md automatically. Coexists with CLAUDE.md -- both can live in the same repo. Required for dual-runtime support. |
| Markdown (.md) | N/A | All skill content, templates, workflows, references | The entire Claude Code skill ecosystem is Markdown-native. YAML frontmatter for config, Markdown body for instructions. No other format is viable. |
| Node.js (CJS) | 18+ | CLI utilities (bin/ tools) | GSD uses `.cjs` files for deterministic operations (state management, config parsing, slug generation, commit orchestration). Node 18+ is required by Claude Code itself. |
| YAML frontmatter | N/A | Skill metadata, plan metadata, state tracking | Standard across all Agent Skills. Parsed natively by Claude Code, Codex, and the GSD ecosystem. |

### Directory Structure (The Skill Itself)

takeToMarket follows the Claude Code plugin format for distribution and the GSD internal architecture for organizational patterns.

```
takeToMarket/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (name, version, description)
├── skills/
│   ├── ttm-init/
│   │   └── SKILL.md             # Interview-driven onboarding
│   ├── ttm-new-campaign/
│   │   └── SKILL.md             # Create new campaign
│   ├── ttm-research/
│   │   └── SKILL.md             # Discovery phase
│   ├── ttm-brief/
│   │   └── SKILL.md             # Brief phase
│   ├── ttm-produce/
│   │   └── SKILL.md             # Production phase (wave-parallel)
│   ├── ttm-verify/
│   │   └── SKILL.md             # Quality gate wall
│   ├── ttm-review/
│   │   └── SKILL.md             # Human review gate
│   ├── ttm-fix/
│   │   └── SKILL.md             # Fix-as-you-go (root cause -> rewrite)
│   ├── ttm-ship/
│   │   └── SKILL.md             # Ship phase
│   ├── ttm-measure/
│   │   └── SKILL.md             # Manual measurement + analysis
│   ├── ttm-learn/
│   │   └── SKILL.md             # Extract learnings, propose edits
│   ├── ttm-state/
│   │   └── SKILL.md             # Show campaign state
│   ├── ttm-resume/
│   │   └── SKILL.md             # Resume interrupted campaign
│   ├── ttm-health/
│   │   └── SKILL.md             # Health check across campaigns
│   ├── ttm-positioning-check/
│   │   └── SKILL.md             # Verify positioning drift
│   ├── ttm-positioning-shift/
│   │   └── SKILL.md             # Explicit positioning change workflow
│   ├── ttm-seo-audit/
│   │   └── SKILL.md             # SEO discipline quick-action
│   ├── ttm-aeo-check/
│   │   └── SKILL.md             # AEO discipline quick-action
│   ├── ttm-repurpose/
│   │   └── SKILL.md             # Content repurposing pipeline
│   └── [other slash commands]/
│       └── SKILL.md
├── agents/
│   ├── ttm-producer.md          # Content production subagent
│   ├── ttm-verifier.md          # Quality gate verification subagent
│   ├── ttm-researcher.md        # Market/competitor research subagent
│   └── ttm-analyst.md           # Measurement analysis subagent
├── workflows/
│   ├── campaign-lifecycle.md    # 9-phase campaign lifecycle orchestration
│   ├── onboarding.md            # Interview-driven reference file generation
│   ├── positioning-drift.md     # Positioning drift detection logic
│   ├── quality-gates.md         # Base quality gate definitions
│   └── fix-loop.md              # Fix-as-you-go with 3-attempt cap
├── references/
│   ├── quality-gates-base.md    # 10 base quality gates (positioning drift, claim accuracy, etc.)
│   ├── attribution-models.md    # 3 attribution models for measurement
│   ├── root-cause-taxonomy.md   # Learnings root-cause categories
│   └── meta-gates.md            # Portfolio balance, calendar collision, etc.
├── templates/
│   ├── positioning.md           # POSITIONING.md template
│   ├── brand.md                 # BRAND.md template
│   ├── icp.md                   # ICP.md template
│   ├── channels.md              # CHANNELS.md template
│   ├── state.md                 # STATE.md template (campaign state)
│   ├── calendar.md              # CALENDAR.md template
│   ├── competitors.md           # COMPETITORS.md template
│   ├── metrics.md               # METRICS.md template
│   ├── learnings.md             # LEARNINGS.md template
│   ├── campaign-brief.md        # Campaign brief template
│   ├── asset-spec.md            # Individual asset specification
│   ├── verification-report.md   # Quality gate results template
│   ├── measurement-report.md    # Measurement analysis template
│   └── playbooks/
│       ├── seo.md               # SEO discipline playbook
│       ├── aeo.md               # AEO discipline playbook
│       ├── youtube.md           # YouTube playbook
│       ├── linkedin.md          # LinkedIn playbook
│       ├── social.md            # Social media playbook
│       ├── email.md             # Email marketing playbook
│       ├── paid-ads.md          # Paid advertising playbook
│       ├── affiliate.md         # Affiliate marketing playbook
│       ├── pr-media.md          # PR/Media playbook
│       └── events.md            # Events playbook
├── bin/
│   └── ttm-tools.cjs            # CLI utility for state management, slug generation, etc.
├── settings.json                # Default settings (optional, for plugin distribution)
├── CLAUDE.md                    # Project instruction file (generated on /ttm-init)
├── AGENTS.md                    # Codex instruction file (generated on /ttm-init)
├── package.json                 # npm packaging
├── install.js                   # Installer script (for npm distribution)
└── README.md                    # User documentation
```

### User's Project Directory (Created by /ttm-init)

```
user-project/
├── .marketing/                  # All takeToMarket state (mirroring GSD's .planning/)
│   ├── POSITIONING.md           # Read-only during campaigns (the invariant)
│   ├── BRAND.md                 # Voice, tone, visual identity guidelines
│   ├── ICP.md                   # Ideal customer profiles
│   ├── CHANNELS.md              # Active channels and playbook assignments
│   ├── STATE.md                 # Global state (active campaigns, last activity)
│   ├── CALENDAR.md              # Content calendar
│   ├── COMPETITORS.md           # Competitor intelligence
│   ├── METRICS.md               # Outcome metrics definitions
│   ├── LEARNINGS.md             # Cross-campaign learnings + root-cause taxonomy
│   └── CAMPAIGNS/
│       └── <campaign-slug>/
│           ├── BRIEF.md         # Campaign brief (goals, audience, channels, assets)
│           ├── STATE.md         # Campaign-level state (current phase, progress)
│           ├── ASSETS/
│           │   ├── <asset-slug>.md     # Asset content
│           │   └── <asset-slug>.spec   # Asset specification (outcome metric, gates)
│           ├── VERIFICATION.md  # Quality gate results
│           ├── MEASUREMENT.md   # Measurement results + analysis
│           └── LEARNINGS.md     # Campaign-specific learnings
```

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (zero runtime dependencies) | N/A | N/A | The skill itself has NO runtime dependencies. This is critical -- skills are Markdown files read by the AI runtime. The only "code" is optional CLI utilities in bin/ using Node.js built-ins only. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node.js 18+ | Run bin/ttm-tools.cjs for deterministic operations | Already required by Claude Code. Use built-in `fs`, `path`, `crypto` only -- no npm dependencies in the tool itself. |
| git | Version control for skill development | Standard. Needed for git clone distribution path. |
| npm | Package publishing | For `npx taketomarket` installation path. Only the installer uses npm -- the skill itself is dependency-free. |

## SKILL.md Frontmatter Specification

Every `/ttm-*` command needs a SKILL.md with this structure:

```yaml
---
name: ttm-produce
description: >
  Produce marketing assets for a campaign. Use when the user says "produce",
  "create content", "write assets", or invokes /ttm-produce.
argument-hint: "[campaign-slug]"
disable-model-invocation: true    # Most TTM commands are user-invoked, not auto-triggered
allowed-tools:
  - Read
  - Write
  - Bash
  - Grep
  - Glob
  - Task                          # For spawning producer subagents in wave-parallel
---

<execution_context>
@workflows/campaign-lifecycle.md
@references/quality-gates-base.md
@templates/campaign-brief.md
</execution_context>

[Skill instructions here...]
```

### Key Frontmatter Decisions

| Field | Recommendation | Why |
|-------|---------------|-----|
| `disable-model-invocation: true` | Use for all campaign lifecycle commands | Marketing campaigns are deliberate actions. Users should invoke `/ttm-produce`, not have Claude auto-trigger it because it detected "content" in conversation. |
| `disable-model-invocation: false` | Use for `/ttm-positioning-check` and `/ttm-health` | These are advisory/monitoring skills that Claude should trigger when it detects potential positioning drift in conversation. |
| `context: fork` | Use for `/ttm-produce` and `/ttm-verify` | Production and verification benefit from isolated subagent contexts with fresh context windows, following GSD's wave-parallel pattern. |
| `allowed-tools` | Include `Task` for orchestration skills | Skills that spawn subagents (produce, verify) need the Task tool. Simpler skills (state, resume) only need Read/Write/Bash. |

## Codex Compatibility (AGENTS.md)

Codex reads `AGENTS.md` from the project root. takeToMarket generates this during `/ttm-init` alongside `CLAUDE.md`. Both files contain:

1. Campaign lifecycle rules (9 phases, enforcement)
2. Positioning-as-invariant enforcement
3. Outcome-over-output enforcement
4. File path conventions (`.marketing/` directory)
5. Skill discovery hints (where to find playbooks, templates)

The key difference: Codex uses TOML for agent config files, not YAML frontmatter. The installer handles this transformation. Skill content (the Markdown body) is identical across runtimes.

## Plugin Distribution (PRIMARY -- Recommended)

The Claude Code plugin format is the recommended distribution method because it:
- Namespaces skills automatically (`/taketomarket:ttm-produce`) to avoid conflicts
- Supports marketplace discovery and one-command installation
- Handles updates via `/plugin update`
- Packages skills, agents, hooks, and bin/ together

### Plugin Manifest

```json
{
  "name": "taketomarket",
  "description": "Marketing operating system for Claude Code. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings.",
  "version": "1.0.0",
  "author": {
    "name": "takeToMarket"
  },
  "homepage": "https://github.com/[org]/takeToMarket",
  "repository": {
    "type": "git",
    "url": "https://github.com/[org]/takeToMarket"
  },
  "license": "MIT"
}
```

### Plugin Directory Layout

```
takeToMarket/
├── .claude-plugin/
│   └── plugin.json
├── skills/                  # Skills are at plugin root, NOT inside .claude-plugin/
│   └── ttm-*/SKILL.md
├── agents/                  # Agents at plugin root
│   └── ttm-*.md
├── bin/                     # Executables added to PATH when plugin is active
│   └── ttm-tools.cjs
├── settings.json            # Default settings
└── ...
```

## npm Distribution (SECONDARY -- Convenience)

For users who prefer `npx taketomarket` over `git clone`:

### package.json

```json
{
  "name": "taketomarket",
  "version": "1.0.0",
  "description": "Marketing operating system skill for Claude Code and Codex",
  "bin": {
    "taketomarket": "install.js"
  },
  "files": [
    "skills/",
    "agents/",
    "workflows/",
    "references/",
    "templates/",
    "bin/",
    "install.js",
    ".claude-plugin/"
  ],
  "keywords": [
    "claude-code",
    "codex",
    "marketing",
    "skill",
    "agent-skills"
  ],
  "license": "MIT"
}
```

### Installer Script (install.js)

Follow GSD's pattern: a single `bin/install.js` entry point that:

1. Detects target runtime (Claude Code, Codex, Gemini, etc.)
2. Copies skill files to the runtime's config directory
3. Generates SKILL.md files with runtime-appropriate frontmatter
4. Creates symlinks from `~/.claude/skills/ttm-*` to installed location
5. Writes a file manifest (`ttm-file-manifest.json`) for update tracking
6. Sets executable permissions on bin/ scripts

GSD supports 14 runtimes. For MVP, support Claude Code and Codex only. Add others in V2.

## git clone Distribution (TERTIARY -- Hackers)

```bash
git clone https://github.com/[org]/takeToMarket.git
claude --plugin-dir ./takeToMarket
```

Or for permanent installation:
```bash
git clone https://github.com/[org]/takeToMarket.git ~/.claude/plugins/taketomarket
# Then install via /plugin install from the directory
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Plugin format (.claude-plugin/) | Standalone skills (.claude/skills/) | Only if you never plan to distribute the skill. Plugin format is strictly better for distribution. |
| Markdown for all content | YAML/JSON config files | Never for skill instructions. Only use JSON for plugin.json manifest and ttm-tools.cjs config state. |
| Node.js CJS for bin/ tools | Python scripts | Only if the skill needs heavy computation (PDF generation, data analysis). Python requires additional runtime. Node.js is guaranteed available because Claude Code requires it. |
| Single bin/ttm-tools.cjs entry | Multiple bin scripts | Never split into multiple entry points. GSD uses a single gsd-tools.cjs with subcommands. This keeps PATH clean and avoids permission issues. |
| YAML frontmatter for metadata | Custom config format | Never. YAML frontmatter is the universal standard parsed by all Agent Skills-compatible runtimes. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| npm dependencies in the skill | Skills must be zero-dependency. The AI runtime reads Markdown -- it does not run npm install. Adding dependencies breaks installation for all distribution paths. | Node.js built-in modules only in bin/ tools. |
| TypeScript for bin/ tools | Requires build step, adds complexity to installation. GSD uses plain .cjs files. | Plain CommonJS (.cjs) with no transpilation. |
| JSON for skill instructions | Not human-readable for the AI or the user. Markdown is the lingua franca of prompt engineering. | Markdown with YAML frontmatter. |
| Jinja/Handlebars/EJS templates | Template engines add runtime dependencies and complexity. Claude fills in templates natively from Markdown. | Plain Markdown templates with placeholder sections the AI fills in. |
| Database for state | Skills run in the user's filesystem. No database server to depend on. | Markdown files in `.marketing/` directory. |
| External API calls in skill code | MVP has no external dependencies. Analytics data is pasted manually. | Manual paste workflow. MCP integrations deferred to V2. |
| `.claude/commands/*.md` (flat files) | Legacy format. Skills (directory + SKILL.md) supersede flat command files and support additional features (supporting files, hooks, subagent execution). | `.claude/skills/ttm-*/SKILL.md` directory format. |
| Putting skills inside .claude-plugin/ | Common mistake documented in official docs. Only plugin.json goes inside .claude-plugin/. Skills, agents, hooks go at plugin root. | Plugin root level: `skills/`, `agents/`, `bin/` at same level as `.claude-plugin/`. |

## Stack Patterns by Variant

**If building for Claude Code only:**
- Use `context: fork` for production and verification skills
- Use `Task()` subagent API for wave-parallel execution
- Use `AskUserQuestion` for interactive onboarding
- Single CLAUDE.md instruction file

**If building for Codex compatibility (recommended):**
- Add AGENTS.md alongside CLAUDE.md
- Add text_mode fallback for AskUserQuestion (numbered list prompts)
- Test that all skills work without `AskUserQuestion` tool
- Use `--text` flag detection pattern from GSD

**If distributing as plugin (recommended):**
- All skills namespaced as `/taketomarket:ttm-*`
- Plugin manifest at `.claude-plugin/plugin.json`
- `bin/` directory for CLI tools (added to PATH automatically)
- `settings.json` for default configuration

**If distributing via npm:**
- Single `install.js` bin entry point
- File manifest tracking for updates
- Runtime detection and transformation
- Symlink creation to `~/.claude/skills/`

## Key Architecture Patterns from GSD

### 1. Workflow-Skill Separation
Skills (SKILL.md) are thin entry points that load workflow files. The actual orchestration logic lives in `workflows/*.md`. This keeps skills focused on frontmatter + delegation, and workflows reusable across skills.

### 2. Reference Files for Domain Knowledge
Long-lived knowledge (quality gate definitions, attribution models, root-cause taxonomies) lives in `references/*.md`. Skills load these with `@references/file.md` syntax. This avoids duplicating knowledge across skills.

### 3. Templates for User-Facing Output
Templates define the structure of files the skill creates in the user's project (POSITIONING.md, BRIEF.md, etc.). The AI fills in the template, not a template engine.

### 4. bin/ for Deterministic Operations
Operations that must be deterministic (slug generation, state parsing, file manifest tracking, timestamp generation) go in bin/ as Node.js CJS scripts. The AI calls these via Bash tool. Never let the AI do deterministic work like hashing or date formatting.

### 5. State as Markdown Files
All state lives in Markdown files with YAML frontmatter in the user's project directory. This makes state human-readable, git-trackable, and context-loadable by the AI.

## Sources

- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- Official SKILL.md specification, frontmatter fields, directory structure, context: fork, allowed-tools, dynamic context injection (HIGH confidence)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) -- Plugin manifest format, distribution, marketplace, directory layout (HIGH confidence)
- [GSD (Get Shit Done) GitHub](https://github.com/gsd-build/get-shit-done) -- Installation architecture, 14-runtime support, npm packaging pattern (HIGH confidence, verified via local filesystem inspection)
- [GSD local installation at ~/.claude/get-shit-done/](file://~/.claude/get-shit-done/) -- Direct inspection of v1.36.0: workflows/, references/, templates/, bin/, contexts/, agents/ structure (HIGH confidence)
- [Agent Skills open standard](https://agentskills.io) -- Cross-runtime compatibility specification (MEDIUM confidence, referenced in official Claude Code docs)
- [get-shit-done-cc npm package](https://www.npmjs.com/package/get-shit-done-cc) -- npm distribution pattern with single bin entry point and runtime-specific installer (HIGH confidence)
- [DeepWiki GSD Installation](https://deepwiki.com/gsd-build/get-shit-done/2.1-installation) -- Detailed installer architecture, file manifest, runtime transformations (MEDIUM confidence)

---
*Stack research for: Claude Code / Codex marketing operating system skill*
*Researched: 2026-04-21*
