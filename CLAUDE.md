<!-- GSD:project-start source:PROJECT.md -->
## Project

**takeToMarket**

An open-source Claude Code / Codex skill that brings GSD-style spec-driven development to marketing. takeToMarket is a marketing operating system — not a content generator — that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Users install it into their Claude Code or Codex environment and run marketing campaigns through a 9-phase lifecycle with persistent state, compound learnings, and automated verification.

**Core Value:** Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall — no asset ships without both, ever.

### Target Audience

**Built for developerneurs and solopreneurs** — engineers building and shipping their own products who have zero or near-zero marketing/growth experience.

When assisting the user:
- Assume strong engineering literacy. They read code fluently.
- Assume zero marketing literacy. Explain positioning, ICP, AEO, funnels in engineering analogies.
- Default to opinionated guidance — they came here because they don't know what's "right" in marketing.
- When suggesting marketing terms, link to `/ttm-101` or run inline explanations on first use.

### Constraints

- **Platform**: Must work as a Claude Code skill AND Codex skill — skill format must be compatible with both runtimes
- **Context window**: Production in Produce phase uses fresh 200K-token contexts per wave, loaded with brief + positioning + brand + ICP + playbook
- **No external dependencies for MVP**: The skill itself should not require external services — analytics data is pasted in manually
- **State persistence**: All state lives in `.taketomarket/` directory files — no database, no external storage
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
### User's Project Directory (Created by /ttm-init)
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
### Key Frontmatter Decisions
| Field | Recommendation | Why |
|-------|---------------|-----|
| `disable-model-invocation: true` | Use for all campaign lifecycle commands | Marketing campaigns are deliberate actions. Users should invoke `/ttm-produce`, not have Claude auto-trigger it because it detected "content" in conversation. |
| `disable-model-invocation: false` | Use for `/ttm-positioning-check` and `/ttm-health` | These are advisory/monitoring skills that Claude should trigger when it detects potential positioning drift in conversation. |
| `context: fork` | Use for `/ttm-produce` and `/ttm-verify` | Production and verification benefit from isolated subagent contexts with fresh context windows, following GSD's wave-parallel pattern. |
| `allowed-tools` | Include `Task` for orchestration skills | Skills that spawn subagents (produce, verify) need the Task tool. Simpler skills (state, resume) only need Read/Write/Bash. |
## Codex Compatibility (AGENTS.md)
## Plugin Distribution (PRIMARY -- Recommended)
- Installs skills as flat commands to `~/.claude/skills/ttm-*/` (e.g., `/ttm-produce`)
- Supports marketplace discovery and one-command installation
- Handles updates via `/plugin update`
- Packages skills, agents, hooks, and bin/ together
### Plugin Manifest
### Plugin Directory Layout
## npm Distribution (SECONDARY -- Convenience)
### package.json
### Installer Script (install.js)
## git clone Distribution (TERTIARY -- Hackers)
# Then install via /plugin install from the directory
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
| Database for state | Skills run in the user's filesystem. No database server to depend on. | Markdown files in `.taketomarket/` directory. |
| External API calls in skill code | MVP has no external dependencies. Analytics data is pasted manually. | Manual paste workflow. MCP integrations deferred to V2. |
| `.claude/commands/*.md` (flat files) | Legacy format. Skills (directory + SKILL.md) supersede flat command files and support additional features (supporting files, hooks, subagent execution). | `.claude/skills/ttm-*/SKILL.md` directory format. |
| Putting skills inside .claude-plugin/ | Common mistake documented in official docs. Only plugin.json goes inside .claude-plugin/. Skills, agents, hooks go at plugin root. | Plugin root level: `skills/`, `agents/`, `bin/` at same level as `.claude-plugin/`. |
## Stack Patterns by Variant
- Use `context: fork` for production and verification skills
- Use `Task()` subagent API for wave-parallel execution
- Use `AskUserQuestion` for interactive onboarding
- Single CLAUDE.md instruction file
- Add AGENTS.md alongside CLAUDE.md
- Add text_mode fallback for AskUserQuestion (numbered list prompts)
- Test that all skills work without `AskUserQuestion` tool
- Use `--text` flag detection pattern from GSD
- All skills installed as `/ttm-*` flat commands via `~/.claude/skills/ttm-*/`
- Plugin manifest at `.claude-plugin/plugin.json`
- `bin/` directory for CLI tools (added to PATH automatically)
- `settings.json` for default configuration
- Single `install.js` bin entry point
- File manifest tracking for updates
- Runtime detection and transformation
- Symlink creation to `~/.claude/skills/`
## Key Architecture Patterns from GSD
### 1. Workflow-Skill Separation
### 2. Reference Files for Domain Knowledge
### 3. Templates for User-Facing Output
### 4. bin/ for Deterministic Operations
### 5. State as Markdown Files
## Sources
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- Official SKILL.md specification, frontmatter fields, directory structure, context: fork, allowed-tools, dynamic context injection (HIGH confidence)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) -- Plugin manifest format, distribution, marketplace, directory layout (HIGH confidence)
- [GSD (Get Shit Done) GitHub](https://github.com/gsd-build/get-shit-done) -- Installation architecture, 14-runtime support, npm packaging pattern (HIGH confidence, verified via local filesystem inspection)
- [GSD local installation at ~/.claude/get-shit-done/](file://~/.claude/get-shit-done/) -- Direct inspection of v1.36.0: workflows/, references/, templates/, bin/, contexts/, agents/ structure (HIGH confidence)
- [Agent Skills open standard](https://agentskills.io) -- Cross-runtime compatibility specification (MEDIUM confidence, referenced in official Claude Code docs)
- [get-shit-done-cc npm package](https://www.npmjs.com/package/get-shit-done-cc) -- npm distribution pattern with single bin entry point and runtime-specific installer (HIGH confidence)
- [DeepWiki GSD Installation](https://deepwiki.com/gsd-build/get-shit-done/2.1-installation) -- Detailed installer architecture, file manifest, runtime transformations (MEDIUM confidence)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
