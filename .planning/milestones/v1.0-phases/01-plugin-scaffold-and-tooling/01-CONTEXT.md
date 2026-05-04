# Phase 1: Plugin Scaffold and Tooling - Context

**Gathered:** 2026-04-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the complete plugin directory structure, SKILL.md entry points for all `/ttm-*` commands (stubs for later phases), the `bin/ttm-tools.cjs` CLI utility, dual-runtime support files, and the `.marketing/` directory scaffolding. After this phase, the skill installs into Claude Code and Codex, all commands are registered (even if most are stubs), and the foundational architecture is locked.

</domain>

<decisions>
## Implementation Decisions

### Command Organization
- **D-01:** Use the Claude Code plugin format with one SKILL.md per command directory (`skills/ttm-init/SKILL.md`, `skills/ttm-brief/SKILL.md`, etc.). This follows the verified plugin spec where each `skills/<name>/SKILL.md` directory becomes a slash command. NOT a single monolithic SKILL.md.
- **D-02:** Each SKILL.md is a thin entry point (<100 lines) that routes to a workflow file via `@workflows/<category>/<name>.md`. No inline workflow logic in skill files.
- **D-03:** For Phase 1, create SKILL.md stubs for ALL 25+ commands with proper frontmatter (name, description, argument-hint, disable-model-invocation, allowed-tools) but placeholder body ("This command will be implemented in Phase N"). Only `/ttm-init` and `/ttm-health` get full implementations in later phases.

### Directory Structure
- **D-04:** Follow the plugin directory layout from STACK.md research exactly:
  ```
  takeToMarket/
  ├── .claude-plugin/plugin.json
  ├── skills/ttm-*/SKILL.md (one per command)
  ├── workflows/{lifecycle,setup,utility,reference-mgmt,discipline}/*.md
  ├── playbooks/*.md
  ├── gates/{base-gates.md, meta-gates.md, discipline/*.md}
  ├── templates/{reference-files/*.md, campaign-brief.md, ...}
  ├── references/*.md
  ├── bin/ttm-tools.cjs
  ├── package.json
  └── README.md
  ```
- **D-05:** Skills go at plugin root level (`skills/`), NOT inside `.claude-plugin/`. Only `plugin.json` goes inside `.claude-plugin/`. This is a documented common mistake.
- **D-06:** Workflows are organized by category: `lifecycle/` (9 campaign phases), `setup/` (init, new-campaign), `utility/` (state, resume, health, archive), `reference-mgmt/` (positioning-check, brand-refresh, etc.), `discipline/` (seo-audit, aeo-check, etc.).

### GSD Mirroring
- **D-07:** Mirror GSD's architecture patterns closely: thin command → workflow indirection, reference files for domain knowledge, templates as output scaffolds the AI fills in, `bin/*.cjs` for deterministic operations. The organizational pattern is proven at 31K+ stars.
- **D-08:** Key divergence from GSD: no `contexts/` directory (GSD uses this for agent contexts; takeToMarket's equivalent is the campaign lifecycle itself). No `agents/` directory in Phase 1 — subagent definitions come in Phase 4 when Produce/Verify need fresh-context workers.
- **D-09:** State uses GSD's two-level pattern adapted for marketing: global `.marketing/STATE.md` (campaign registry) + per-campaign `CAMPAIGNS/<slug>/STATE.md`.

### Context Loading Strategy
- **D-10:** Two-tier context loading:
  - **Tier 1 (always loaded, <200 words each):** Compact summaries of POSITIONING.md, BRAND.md, ICP.md. These are auto-generated alongside the full documents during `/ttm-init`. Stored as `_SUMMARY` sections at the top of each file (not separate files).
  - **Tier 2 (loaded on demand):** Full reference files, playbooks, gate definitions. Loaded only by workflows that need them (e.g., Produce loads full POSITIONING.md + playbook; State only loads Tier 1 summaries).
- **D-11:** Total Tier 1 budget: ~2,000 tokens across all reference summaries. This leaves 95%+ of context for actual work.

### ttm-tools.cjs
- **D-12:** Single entry point with subcommands (mirroring `gsd-tools.cjs`). Initial subcommands for Phase 1:
  - `init` — validate `.marketing/` exists, return JSON state
  - `slug <text>` — generate URL-safe slug from campaign name
  - `state read` — parse STATE.md, return JSON
  - `state update <field> <value>` — atomic STATE.md update
  - `commit <message> --files <paths>` — git commit helper
  - `health` — validate `.marketing/` directory integrity
- **D-13:** Zero npm dependencies. Uses only Node.js built-ins: `fs`, `path`, `crypto`, `child_process`. CommonJS format (`.cjs`), no TypeScript, no build step.

### Plugin Identity
- **D-14:** Plugin name: `taketomarket` (lowercase, no hyphens — npm convention). Display name: `takeToMarket`.
- **D-15:** Plugin description: "Marketing operating system for Claude Code. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings."
- **D-16:** Commands are namespaced as `/taketomarket:ttm-*` when installed as a plugin. Users type the short form `/ttm-*` which resolves automatically if no conflicts.
- **D-17:** License: MIT (open source).

### Dual-Runtime Support
- **D-18:** CLAUDE.md and AGENTS.md are NOT bundled with the plugin. They are GENERATED by `/ttm-init` into the user's project root. This is because they contain project-specific rules (positioning enforcement, campaign lifecycle) that reference the user's `.marketing/` files.
- **D-19:** Both instruction files contain identical core rules: positioning-as-invariant enforcement, outcome-over-output, campaign lifecycle, `.marketing/` file path conventions.

### .marketing/ Directory Structure
- **D-20:** Created by `/ttm-init` (Phase 2), but the TEMPLATE for it is defined in Phase 1. The template specifies:
  ```
  .marketing/
  ├── POSITIONING.md
  ├── BRAND.md
  ├── ICP.md
  ├── CHANNELS.md
  ├── STATE.md
  ├── CALENDAR.md
  ├── COMPETITORS.md
  ├── METRICS.md
  ├── LEARNINGS.md
  └── CAMPAIGNS/
  ```

### Claude's Discretion
- Exact frontmatter fields per SKILL.md (allowed-tools, disable-model-invocation) — follow the SKILL.md specification from STACK.md research
- Internal organization of `bin/ttm-tools.cjs` subcommand routing — follow GSD's pattern
- README.md structure and content — standard open-source README
- `settings.json` default values — standard plugin settings

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skill Architecture
- `.planning/research/STACK.md` — Complete directory structure, SKILL.md spec, plugin manifest format, npm packaging, frontmatter decisions
- `.planning/research/ARCHITECTURE.md` — 7-layer architecture, data flow, build order, GSD mapping, anti-patterns

### Plugin Format
- Official Claude Code Skills docs at code.claude.com/docs/en/skills — SKILL.md frontmatter spec, directory conventions
- Official Claude Code Plugins docs at code.claude.com/docs/en/plugins — plugin.json manifest, distribution

### GSD Reference Implementation
- `~/.claude/get-shit-done/bin/gsd-tools.cjs` — Reference for ttm-tools.cjs implementation pattern (subcommand routing, state management, commit helper)
- `~/.claude/get-shit-done/workflows/` — Reference for workflow organization pattern

### Project Context
- `.planning/PROJECT.md` — Project vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirements (FOUND-01 through FOUND-07)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code.

### Established Patterns
- GSD's architecture is the pattern template. Direct filesystem access to `~/.claude/get-shit-done/` provides the reference implementation for every structural decision.

### Integration Points
- Plugin installs into `~/.claude/plugins/` or project-level `.claude/plugins/`
- `bin/ttm-tools.cjs` is added to PATH when plugin is active
- SKILL.md files register as `/ttm-*` slash commands

</code_context>

<specifics>
## Specific Ideas

- The user wants this to be heavily inspired by GSD's prompt engineering — study GSD's workflow files for tone, structure, and instruction quality
- Dual distribution (git clone + npm) is a requirement, but npm packaging is Phase 10 — Phase 1 focuses on plugin format only
- All commands use `/ttm-*` prefix (TTM = takeToMarket)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-plugin-scaffold-and-tooling*
*Context gathered: 2026-04-21*
