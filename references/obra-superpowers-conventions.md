# Obra/Superpowers + GSD-Build Conventions Reference

**Purpose:** Catalog of patterns from `obra/superpowers` and `gsd-build/get-shit-done` that takeToMarket adopts in v2.3.0. Findings are grounded in the upstream `README.md`, `.claude-plugin/plugin.json`, `package.json`, `bin/install.js`, and select `skills/*/SKILL.md` files inspected on 2026-05-17 (obra superpowers `5.1.0`, get-shit-done `1.50.0-canary.0`).

**Status legend for "Adopted for v2.3.0" bullets:**
- `[P1]` — landed in v2.3.0-rc.1 (this PR).
- `[P1-partial]` — partial landing in P1; remainder tracked for later phase.
- `[P2+]` — design intent for a subsequent v2.3.x phase (P2-P6); not in this PR.
- `[deferred]` — explicitly deferred past v2.3.x (e.g. v2.4, v2.5).

## Axis 1: Distribution + Install

### Obra pattern

- **Primary surface is plugin marketplaces, not npm.** `README.md` lists 7 install paths (Claude Code, Codex CLI, Codex App, Factory Droid, Gemini CLI, OpenCode, Cursor, Copilot CLI) and every single one is a one-line plugin-marketplace command. There is no `npm install`, no `npx`, no `git clone`.
- **Dual-marketplace distribution.** Official path: `/plugin install superpowers@claude-plugins-official` (Anthropic-curated). Community path: `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`.
- **Minimal `.claude-plugin/plugin.json`.** Fields actually present: `name`, `description`, `version` (`5.1.0`), `author` (object with `name`+`email`), `homepage`, `repository`, `license`, `keywords`. No `skills` array, no `displayName`, no `category`, no `source`/`sourceUrl`. The plugin runtime auto-discovers skills from the `skills/` directory.
- **Repo holds runtime-specific subtrees side by side.** Root contains `.claude-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.opencode/`, plus `gemini-extension.json` and `AGENTS.md`/`CLAUDE.md`/`GEMINI.md`. Each runtime gets a native install path; the upstream sync script lives at `scripts/sync-to-codex-plugin.sh`.
- **Version bumping is a tracked workflow.** Root `.version-bump.json` + `scripts/bump-version.sh` keep the version pinned across all runtime manifests. Badges in README are absent (intentional — README is install-instructions-first).

### GSD pattern

- **Primary surface is `npx`.** README headline is literally `npx get-shit-done-cc@latest`. Plugin-marketplace install is not mentioned in the headline; npx is the entry point even though the package ships skills.
- **Single installer, many runtimes.** `bin/install.js` (10,840 lines) is the universal installer. It prompts the user for runtime choice (Claude Code, OpenCode, Gemini CLI, Kilo, Codex, Copilot, Cursor, Windsurf, "and more"), supports `--global` / local install, and `--profile=core|standard` for surface budgeting.
- **`package.json` is the source of truth.** `name: get-shit-done-cc`, `version: 1.50.0-canary.0`, three bin entries (`get-shit-done-cc`, `gsd-sdk`, `gsd-tools`), `files` array enumerates 11 directories, `engines.node: ">=22.0.0"`, real runtime deps (`@anthropic-ai/claude-agent-sdk`, `ws`), optional `fallow`.
- **README leans heavily on badges + social proof.** Eight badges at the top: npm version, npm downloads, GitHub Actions test status, Discord, X, $GSD token, GitHub stars, license. Plus "Trusted by engineers at Amazon, Google, Shopify, and Webflow" and three pull-quotes. Multi-language READMEs (`README.pt-BR.md`, `README.zh-CN.md`, `README.ja-JP.md`, `README.ko-KR.md`).
- **Idempotent installer is a feature.** Troubleshooting section explicitly tells users `Re-run the installer — it's idempotent: npx get-shit-done-cc@latest`. `CLAUDE_CONFIG_DIR` env var documented for container use.

### takeToMarket current state

- `package.json` ships as `taketomarket` `2.2.0`, single bin entry `taketomarket → install.js`, `files` array lists 9 directories, no runtime deps, `engines.node: ">=18"`. Closer to GSD shape than obra's no-npm shape.
- `.claude-plugin/plugin.json` is **GSD-flavored, not obra-flavored**: contains `displayName`, `category: "productivity"`, `source: "git"`, `sourceUrl`, and an explicit `skills: [...]` array hand-listing all 28 `ttm-*` skills. Three of those fields (`displayName`, `category`, `source`/`sourceUrl`) do not exist in obra's manifest.
- `.claude-plugin/marketplace.json` exists alongside `plugin.json` (obra puts the marketplace in a separate repo, `obra/superpowers-marketplace`).
- `install.js` is at repo root (759 lines), not under `bin/`. GSD puts its installer under `bin/install.js` and exposes additional bins for SDK/tools.
- README leads with a single npm badge, then explains 4 install options (npx, Claude marketplace pending, direct-from-GitHub, manual clone). No social proof, no Discord, no multi-language, no badge wall. Install instructions are wordier than obra's one-liners.
- Runtime fan-out matches obra structurally: install.js copies skills into `~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/skills/`, `~/.codeium/windsurf/skills/`, `~/.gemini/skills/`, and `~/.agents/skills/` based on the interactive prompt.

### Adopted for v2.3.0

- `[P1]` Keep npx as the primary install surface (matches GSD; obra's marketplace-only model assumes Anthropic-curated approval, which we don't yet have). (No-op — already true.)
- `[P1]` Plugin manifest (`.claude-plugin/plugin.json`) is already obra-shaped: `name`, `version`, `description`, `author`, `license`, `keywords` only. No `skills: [...]` hand-list in this file — runtime auto-discovers.
- `[P2+]` Trim `.claude-plugin/marketplace.json` to drop `displayName`, `category`, `source`, `sourceUrl`, and the hand-maintained `skills: [...]` array. These fields are not part of the obra/Anthropic plugin schema; they were aspirational marketplace fields. (P1 only updated description + repository URLs; field drop deferred.)
- `[P2+]` Move `install.js` to `bin/install.js` to match GSD's layout. Update `package.json` `bin` and `files` accordingly.
- `[P2+]` Add idempotent re-run language to README troubleshooting ("Re-run the installer — it's idempotent: `npx taketomarket`").
- `[P2+]` Add `CHANGELOG.md`-driven release-notes link in README.
- `[P1-partial]` Badge wall: P1 added a GitHub-stars badge (2 badges total). Full 4-badge target (npm version, npm downloads, GitHub stars, license) tracked for P2+.
- `[deferred]` Multi-language READMEs — revisit once star count + downloads warrant it.

## Axis 2: Skill Structure + Naming

### Obra pattern

- **14 flat top-level skills.** Names are verb-phrases: `brainstorming`, `writing-plans`, `writing-skills`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `using-git-worktrees`, `using-superpowers`, `requesting-code-review`, `receiving-code-review`, `subagent-driven-development`, `finishing-a-development-branch`, `dispatching-parallel-agents`, `verification-before-completion`. No prefix, no namespace.
- **`skills/<name>/SKILL.md`** is the canonical layout. Supporting material lives in `skills/<name>/references/` (e.g. `skills/using-superpowers/references/`).
- **Minimal YAML frontmatter.** Every SKILL.md observed has exactly two fields: `name` and `description`. `description` is the activation contract — written as a directive ("You MUST use this before any creative work…", "Use when implementing any feature or bugfix, before writing implementation code"). No `disable-model-invocation`, no `context: fork`, no `allowed-tools`, no `argument-hint` in the obra core 14.
- **Cross-skill references via `superpowers:<skill-name>`.** Example from `writing-skills/SKILL.md`: `REQUIRED BACKGROUND: You MUST understand superpowers:test-driven-development before using this skill.`

### GSD pattern

- **Namespace-prefixed skills (`gsd-*`).** 50+ skills, all under a `gsd-` prefix: `gsd-new-project`, `gsd-plan-phase`, `gsd-execute-phase`, etc. Plus sub-namespaces (`gsd-ns-*`) for grouped surfaces (`gsd-ns-workflow`, `gsd-ns-review`, `gsd-ns-context`).
- **Profiles control which skills install.** `--profile=core` ships only the six core-loop skills; `--profile=standard` adds phase management. Profiles compose (`--profile=core,audit`). The "surface budget" concept means a user can constrain runtime surface without uninstalling.
- **Skills can be enabled/disabled at runtime** without reinstall via `/gsd:surface`.
- **Skills live in `get-shit-done/` subtree** in source repo (not `skills/`); installer mirrors them to the runtime's standard skill path (`~/.claude/skills/gsd-*/`).

### takeToMarket current state

- 28 skills, all under `ttm-` prefix — matches GSD's namespace-prefix convention.
- Skills live under `skills/<name>/SKILL.md` (obra layout, not GSD's `get-shit-done/` subtree).
- Frontmatter is **maximal**: `ttm-produce/SKILL.md` declares `name`, `description`, `argument-hint`, `disable-model-invocation: true`, `context: fork`, `allowed-tools: Read Write Bash Glob Grep Task`. SKILL.md body is one line: `Read and follow the workflow at ${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/produce.md`. The actual instructions live in `workflows/`.
- No profile system — all 28 skills install every time.
- Workflows are grouped under `workflows/{discipline,lifecycle,reference-mgmt,setup,utility}/` and referenced from thin SKILL.md shims. This is a real architectural choice (mirrors GSD's `commands/` + `agents/` split) and worth preserving.

### Adopted for v2.3.0

- `[P1]` Keep `ttm-*` prefix — matches the namespace convention users expect from GSD-influenced plugins and prevents collision with obra/other plugins. (No-op — already true.)
- `[P2+]` Keep the workflow-shim pattern (thin SKILL.md, body in `workflows/`). Document it as a convention in CLAUDE.md so future skills follow the pattern. (P1 did not add the convention note to CLAUDE.md.)
- `[P1]` Keep `disable-model-invocation: true` as the **default** for lifecycle skills (`/ttm-produce`, `/ttm-ship`, `/ttm-measure`, `/ttm-learn`). Use `disable-model-invocation: false` for advisory skills (`/ttm-positioning-check`, `/ttm-health`). (No-op — already true.)
- `[P1]` Keep `context: fork` for fan-out skills (`/ttm-produce`, `/ttm-verify`, `/ttm-repurpose`) — matches GSD's wave-parallel execution pattern. (No-op — already true.)
- `[deferred]` Profile system to v2.4. v2.3 ships all skills; we'll add `--profile=core|standard|full` once we have telemetry on which skills users actually invoke.
- `[P2+]` Adopt obra-style `description:` directives ("Use when X, before Y") in place of bare descriptions. Activation contract should read as an instruction to Claude, not a feature blurb. (See Axis 4.)

## Axis 3: README + npm Page Content

### Obra pattern

- **No badges.** Zero. README opens with the project name + one-paragraph pitch.
- **"How it works" narrative comes before install.** Two paragraphs explain the brainstorm → spec → plan → subagent loop in human language. The reader understands the value before they hit any commands.
- **Install section is a flat table of contents.** Quickstart line: `Give your agent Superpowers: Claude Code, Codex CLI, Codex App, Factory Droid, Gemini CLI, OpenCode, Cursor, GitHub Copilot CLI.` Each is a deep-link to a per-runtime install subsection — every subsection is a single fenced command.
- **"The Basic Workflow" reads as numbered prose.** Each step names the relevant skill and one sentence about when it activates. No tables.
- **Sponsorship + community come last.** Sponsorship link, MIT license, Discord, issues, release-announcement signup. No metrics, no "trusted by", no pull-quotes.
- **Philosophy section is four bullets.** "Test-Driven Development", "Systematic over ad-hoc", "Complexity reduction", "Evidence over claims". Short, ideological, memorable.

### GSD pattern

- **Badge wall on top.** 8 badges (npm version, downloads, tests, Discord, X, $GSD token, stars, license) — high visual density, signals "this project is real and active".
- **"Trusted by" social proof** immediately under badges. Plus three pull-quotes from real users. This frontloads credibility for first-time visitors.
- **Inline pricing pitch.** `npx get-shit-done-cc@latest` appears twice in the first 1 000 chars (once standalone, once with `latest`).
- **"Why I Built This" personal narrative** (signed `— TÂCHES`) before the technical content. Establishes author voice and target audience (solo developers).
- **"How It Works" is the six-command loop** with code blocks and explanation per command. Concrete, executable.
- **Commands table** — full command surface in a single scannable table.
- **Why It Works** section — three numbered problems GSD solves (context bloat, no shared memory, no verification) with the GSD answer for each.
- **Configuration callouts** — points to `.planning/config.json` and the docs site for advanced knobs.
- **Star history chart** at the bottom (`star-history.com` SVG).

### takeToMarket current state

- One badge (npm version). No social proof, no pull-quotes, no Discord, no star chart.
- Opens with two-paragraph "What it is / What it isn't" framing — strong and unique, worth keeping.
- "Requirements" → "Installation" (4 options) → "Quick Start" → "Runtime Notes" → "Campaign Lifecycle" → "Command Reference" → "Verify Installation" → "License" → "Privacy & Security" → "Contributing". Structure is clean but reads as a manual, not a pitch.
- Command Reference is a full 28-row table — closer to GSD style than obra's narrative.
- No "Why I Built This", no "Why It Works", no philosophy section.

### Adopted for v2.3.0

- `[P1]` Keep "What it is / What it isn't" framing — it's the strongest piece of positioning in the current README and aligns with takeToMarket's positioning-as-invariant ethos.
- `[P1-partial]` Functional badges: P1 added GitHub-stars badge (2 total). Full 4-badge target (npm version, npm downloads, GitHub stars, license) tracked for P2+. Skip Discord/X until those channels exist; skip $TOKEN equivalents permanently.
- `[P2+]` Add a "How It Works" narrative section between "What it is" and "Requirements" — 2-3 paragraphs explaining the 9-phase lifecycle as a story, not a table. Borrow obra's prose-first cadence.
- `[P2+]` Add a "Why It Works" section after Command Reference — three numbered points (positioning drift, no shared marketing memory, no verifiable outcomes) mirroring GSD's three-problem framing.
- `[P2+]` Add a "Philosophy" section: four bullets matching the project's core invariants (positioning as architectural invariant, every asset has a verifiable outcome, compound learnings, no asset ships without quality gate wall).
- `[P1]` Keep the runtime install table — it's clearer than obra's per-runtime subsections for a smaller skill set. (No-op — already true.)
- `[deferred]` Multi-language READMEs, pull-quotes, "trusted by", star history chart — needs real adoption first.
- `[P2+]` Add npm-page-aware language: the README ships verbatim to npmjs.com/package/taketomarket via `package.json`; the first 200 chars matter for SEO. Tighten the lede.

## Axis 4: Internal Skill Invocation Pattern

### Obra pattern

- **The `Skill` tool is the activation primitive.** `skills/using-superpowers/SKILL.md` literally bootstraps the entire system: it tells Claude to invoke the `Skill` tool whenever there's a 1% chance a skill applies, before any response (including clarifying questions).
- **Hard-gate XML tags wrap non-negotiable rules.** Examples observed:
  - `<HARD-GATE> ... </HARD-GATE>` in `brainstorming/SKILL.md`: "Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it."
  - `<EXTREMELY-IMPORTANT> ... </EXTREMELY-IMPORTANT>` in `using-superpowers/SKILL.md`: "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill."
  - `<SUBAGENT-STOP> ... </SUBAGENT-STOP>` for subagent-aware skip logic.
- **Checklist + TodoWrite preamble.** Skills with multi-step processes include an explicit `## Checklist` with items like "Explore project context", "Ask clarifying questions", "Propose 2-3 approaches", "Present design". The `using-superpowers` skill instructs Claude to convert each checklist item into a TodoWrite todo before executing.
- **Graphviz `dot` process diagrams** embedded in SKILL.md. Skills like `brainstorming` and `using-superpowers` include `digraph { ... }` blocks showing flow + decision points. Provides Claude with a state machine to follow.
- **Cross-skill chaining via prose.** `brainstorming/SKILL.md` ends with: "**The terminal state is invoking writing-plans.** Do NOT invoke frontend-design, mcp-builder, or any other implementation skill. The ONLY skill you invoke after brainstorming is writing-plans." Skills explicitly name their successor.
- **"Red Flags" tables** that name common rationalizations Claude uses to skip the skill, and refute them inline. Example from `using-superpowers`: "This is just a simple question" → "Questions are tasks. Check for skills."
- **`description:` field doubles as the activation contract.** Written as a directive, not a description: `Use when implementing any feature or bugfix, before writing implementation code` (TDD), `You MUST use this before any creative work...` (brainstorming). This is what Claude pattern-matches on when auto-selecting skills.
- **Instruction priority is documented.** `using-superpowers/SKILL.md` declares: user CLAUDE.md/AGENTS.md/GEMINI.md instructions > superpowers skills > default system prompt. Skills explicitly defer to user instructions when they conflict.

### GSD pattern

- **Slash-command invocation is primary.** Users type `/gsd-plan-phase 1`; skills are entered explicitly, not through `Skill` tool auto-selection.
- **State files are the persistence preamble.** Every skill's first action is to read `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `CONTEXT.md`. The skill instructions assume these files exist and use them as the cross-session memory.
- **Subagent dispatch via `Task` tool** for fan-out work (planning, execution, verification). Each subagent gets a fresh 200K context loaded with exactly what it needs.
- **Hooks at session boundaries.** Hooks are registered via plugin config; individual hook scripts live under `hooks/` (e.g. `gsd-session-state.sh`, `gsd-prompt-guard.js`). A `SessionStart` hook re-orients Claude to GSD conventions and injects project state on every fresh session.
- **No `Skill` tool reliance.** Skills are designed for explicit user invocation; auto-triggering is rare. `disable-model-invocation` is typically `true`.
- **Lint scripts enforce skill quality.** `scripts/lint-descriptions.cjs`, `lint-skill-deps.cjs`, `lint-command-contract.cjs` — the install pipeline rejects skills with vague descriptions or undeclared dependencies.

### takeToMarket current state

- **GSD-style invocation, obra-style state-as-preamble.** Users type `/ttm-produce`; the skill reads its workflow and the workflow's first action is to load 9 reference files plus campaign-specific state.
- **No hard-gate XML wrappers.** Workflows use `<purpose>`, `<required_reading>`, `<constraints>`, `<process>` tags as section delimiters, but the language inside is descriptive ("Do NOT modify `.taketomarket/POSITIONING.md` during this workflow") not gate-enforced.
- **No checklist preamble.** Workflows are sequential `## Step 1`, `## Step 2` headers without an upfront todo-list template.
- **No process digraphs.** Workflows are prose + numbered steps; no Graphviz state machines.
- **No cross-skill chaining declarations.** Skills don't explicitly name their successor (e.g. `/ttm-brief` doesn't say "the only skill you invoke next is `/ttm-produce`").
- **No Red Flags table.** No documented refutation of rationalizations Claude might use to skip a step.
- **`description:` is feature-blurb style**, not directive: `"Produce phase: generate content assets in fresh contexts loaded with brief, positioning, brand, ICP, and playbook. Use after a brief is approved."` Has the "Use after X" hook but doesn't lead with the activation imperative.
- **No `Skill` tool integration.** Skills are explicit-invocation only; advisory skills like `/ttm-positioning-check` and `/ttm-health` already set `disable-model-invocation: false` but workflows don't yet invoke other skills via the `Skill` tool.

### Adopted for v2.3.0

- `[P2+]` Add `<HARD-GATE>` / `<EXTREMELY-IMPORTANT>` XML wrappers around the **positioning invariant** in every workflow that touches assets (`produce`, `repurpose`, `review`, `fix`, `verify`, `ship`). The invariant is takeToMarket's signature constraint; gate-language enforces it more reliably than prose.
- `[P2+]` Rewrite `description:` fields in obra-directive style. Pattern: `Use when <trigger>, before <next step>. <Optional warning>.` Example for `/ttm-produce`: `Use when a brief is approved and assets need to be generated. Do not invoke without a passed brief — produce will fail.`
- `[P2+]` Add a `## Checklist` section to every multi-step workflow with explicit TodoWrite-mappable items. Mirror obra's "create a task for each of these items and complete them in order" preamble.
- `[P2+]` Add cross-skill chaining declarations to each lifecycle skill: name the predecessor skill that should have run, and the successor skill that should run next. Example: `/ttm-brief` ends with "**The terminal state is invoking /ttm-produce.** Do not invoke /ttm-ship or /ttm-measure until produce → verify → review have completed."
- `[P2+]` Add a "Red Flags" table to `/ttm-produce` and `/ttm-verify` listing the rationalizations Claude commonly uses to skip reference loading or gate checks ("These assets look fine without verify", "Positioning is obvious here", "I already loaded BRAND.md last turn").
- `[P2+]` Adopt obra's instruction-priority hierarchy in `CLAUDE.md`: user CLAUDE.md/AGENTS.md > takeToMarket skills > default system prompt. Add to the project's CLAUDE.md preamble.
- `[P2+]` Add a `SessionStart` hook (matchers: `startup|clear|compact`) that re-orients Claude to takeToMarket conventions and reads `.taketomarket/STATE.md` frontmatter. Mirrors GSD's hook pattern.
- `[deferred]` Graphviz digraphs and lint scripts — high-value but require maintenance investment we can stage after the core conventions land.
- `[P2+]` Use the `Skill` tool inside workflows for cross-skill invocation (e.g. `/ttm-fix` should invoke `/ttm-produce` and `/ttm-verify` via the `Skill` tool, not by telling the user to run them manually). This matches obra's composition pattern and reduces user friction.
