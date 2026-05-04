# Phase 2: Onboarding Interview - Pattern Map

**Mapped:** 2026-04-22
**Files analyzed:** 5 new files
**Analogs found:** 4 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `workflows/setup/init.md` | workflow | request-response (interview) | GSD `workflows/new-project.md` | exact |
| `workflows/setup/init-questions.md` | reference | static (question bank) | GSD `references/user-profiling.md` | role-match |
| `workflows/setup/init-validation.md` | reference | static (validation rules) | `gates/base-gates.md` | partial |
| `skills/ttm-init/SKILL.md` | config (update stub) | request-response | `skills/ttm-init/SKILL.md` (self -- update in place) | exact |
| `templates/reference-files/*.md` (consumed, not modified) | template | static | N/A (already exist from Phase 1) | N/A |

## Pattern Assignments

### `workflows/setup/init.md` (workflow, request-response interview)

**Analog:** GSD `~/.claude/get-shit-done/workflows/new-project.md`

**Structural wrapper pattern** (lines 1-14):
```markdown
<purpose>
Interview-driven onboarding that generates all .marketing/ reference files
from structured questioning. Use when setting up takeToMarket for a new project.
</purpose>

<required_reading>
Read all files referenced by the invoking prompt's execution_context before starting.
</required_reading>

<process>
```

The workflow MUST use `<purpose>`, `<required_reading>`, `<process>`, `<success_criteria>`, and `<output>` XML tags as its top-level structure. This is the universal pattern across all GSD workflows.

**Text-mode detection pattern** (new-project.md line 107):
```markdown
**Text mode (`workflow.text_mode: true` in config or `--text` flag):** Set `TEXT_MODE=true`
if `--text` is present in `$ARGUMENTS` OR `text_mode` from init JSON is `true`. When
TEXT_MODE is active, replace every `AskUserQuestion` call with a plain-text numbered list
and ask the user to type their choice number. This is required for non-Claude runtimes
(OpenAI Codex, Gemini CLI, etc.) where `AskUserQuestion` is not available.
```

Place this text-mode block ONCE at the top of the `<process>` section, before the first AskUserQuestion usage. All subsequent AskUserQuestion calls inherit this rule.

**Pre-flight check pattern** (new-project.md lines 57-68):
```markdown
## 1. Setup

**MANDATORY FIRST STEP -- Execute these checks before ANY user interaction:**

```bash
INIT=$(node "$HOME/.claude/get-shit-done/bin/gsd-tools.cjs" init new-project)
```

Parse JSON for: `project_exists`, ...
```

Adapt for takeToMarket as:
```markdown
## Step 1: Pre-flight

Run init status check:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw
```

**If result is "initialized":**
Use AskUserQuestion with options: "Start fresh", "Update specific files", "Cancel"

**If result is "not initialized":**
```bash
mkdir -p .marketing/CAMPAIGNS
mkdir -p .marketing/PLAYBOOKS
```
Continue to Step 2.
```

**AskUserQuestion structured choice pattern** (new-project.md lines 136-165):
```markdown
AskUserQuestion([
  {
    header: "Granularity",
    question: "How finely should scope be sliced into phases?",
    multiSelect: false,
    options: [
      { label: "Coarse (Recommended)", description: "Fewer, broader phases" },
      { label: "Standard", description: "Balanced phase size" },
      { label: "Fine", description: "Many focused phases" }
    ]
  }
])
```

Use this exact JSON-like format for every structured choice in the interview. Each AskUserQuestion block gets a `header` (max 12 chars), `question`, and `options` array with `label` + `description`.

**Inline freeform question pattern** (new-project.md lines 250-254):
```markdown
Ask inline (freeform, NOT AskUserQuestion):

"What do you want to build?"

Wait for their response.
```

Use for open-ended questions where structured choices are not appropriate (differentiator, proof points, banned terms).

**Decision gate pattern** (new-project.md lines 288-298):
```markdown
Use AskUserQuestion:
- header: "Ready?"
- question: "I think I understand what you're after. Ready to create PROJECT.md?"
- options:
  - "Create PROJECT.md" -- Let's move forward
  - "Keep exploring" -- I want to share more / ask me more

If "Keep exploring" -- ask what they want to add.
Loop until selected.
```

Use between interview sections as progress checkpoints, and before file generation.

**Stage banner pattern** (new-project.md lines 243-246):
```markdown
```
takeToMarket > INITIALIZING
```
```

Display a banner at each major phase transition in the workflow.

**Bash tool invocation pattern for ttm-tools.cjs** (derived from profile-user.md lines 133-134 and health.cjs):
```markdown
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs health
```

Parse the JSON result. All checks should be "pass".
```

Always use `${CLAUDE_PLUGIN_ROOT}` prefix for bin/ tool paths. Use `--raw` flag when only the summary string is needed; omit it for full JSON parsing.

**File generation pattern** (derived from templates and context-loading.md):
```markdown
Read the template for structure reference:
Read file: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/positioning.md`

Generate `.marketing/POSITIONING.md` using the template structure.
Fill all `[GENERATED BY /ttm-init]` placeholders with data from Section 1.

**Critical structural requirements:**
1. Preserve `<!-- _SUMMARY: ... -->` and `<!-- END_SUMMARY -->` comment markers exactly
2. Summary section must be under 200 words
3. Include all table structures from template
4. Set dates via: `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw`

Write the file to `.marketing/POSITIONING.md`.
```

**Post-validation and state update pattern** (derived from health.cjs and state.cjs):
```markdown
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs health
```

Parse result. If all checks pass:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update status initialized
```
```

**Success criteria pattern** (new-project.md lines 1253-1275):
```markdown
<success_criteria>
- [ ] Pre-flight check completed (existing init detected or directories created)
- [ ] All 6 interview sections completed with specificity validation
- [ ] 9 reference files generated in .marketing/
- [ ] CLAUDE.md and AGENTS.md copied to project root
- [ ] Health check passes (all files exist)
- [ ] STATE.md status set to "initialized"
</success_criteria>
```

**Output listing pattern** (new-project.md lines 1236-1249):
```markdown
<output>
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md`
- `.marketing/METRICS.md`
- `.marketing/COMPETITORS.md`
- `.marketing/CALENDAR.md`
- `.marketing/LEARNINGS.md`
- `CLAUDE.md`
- `AGENTS.md`
</output>
```

---

### `workflows/setup/init-questions.md` (reference, question bank)

**Analog:** GSD `~/.claude/get-shit-done/references/user-profiling.md` (reference doc consumed by workflow)

This file is referenced by the main workflow via `@workflows/setup/init-questions.md` syntax. It is NOT a workflow itself -- it is a supporting reference file.

**Structure pattern:**
```markdown
# Interview Question Bank

## Section 1: Product & Positioning

### Structured Questions (AskUserQuestion)

**Product Category**
- header: "Category"
- question: "What category does your product compete in?"
- options:
  - "SaaS / Software" -- Software product or service
  - "E-commerce / DTC" -- Direct-to-consumer physical product
  [...]

### Freeform Questions

1. "Tell me about your product or service. What does it do, and who is it for?"
2. "What's the ONE thing your product does that competitors don't?"
3. "Give me 3 proof points -- specific numbers, case studies, or benchmarks."
4. "What terms or phrases should we NEVER use? Why?"

## Section 2: Brand & Voice
[... same structure per section ...]
```

Each section contains both AskUserQuestion definitions (structured) and freeform question text. The main workflow references these rather than inlining all questions.

---

### `workflows/setup/init-validation.md` (reference, validation rules)

**Analog:** `gates/base-gates.md` (quality gate definitions with pass/fail criteria)

**No direct code analog exists** for specificity validation -- this is a new pattern for the project. However, the structure should mirror the gates pattern of listing criteria with clear pass/fail conditions.

**Recommended structure pattern** (derived from RESEARCH.md Pattern 2):
```markdown
# Specificity Validation Rules

## Banned Phrases (apply to all freeform answers)

| Category | Banned Phrases |
|----------|---------------|
| Superlatives | "best in class", "industry-leading", "world-class", "premier" |
| Buzzwords | "innovative", "cutting-edge", "next-generation", "state-of-the-art" |
| Impact words | "revolutionary", "game-changing", "disruptive", "unique" |

## Per-Section Validation

### Section 1: Positioning
- **Differentiator:** Must describe a specific mechanism or capability, not an adjective
- **Target audience:** Must specify at least 2 of: role, company size, industry, geography
- **Proof points:** Each must have a verifiable source (number, case study, benchmark)
- **Must-not-say:** Each banned term must have reasoning

### Section 2: Brand
[... per-section criteria ...]

## Re-prompt Template

When validation fails:
"Your [field] is too vague. Here's what specific looks like:
  - Vague: '[example of vague answer]'
  - Specific: '[example of specific answer]'
Please try again with more specificity."

Max retries: 2. After 2 retries, accept with warning flag.
```

---

### `skills/ttm-init/SKILL.md` (config update -- modify existing stub)

**Analog:** Self (existing file at `skills/ttm-init/SKILL.md`, lines 1-22)

Current stub content to preserve:
```yaml
---
name: ttm-init
description: >
  Interview-driven onboarding that generates all .marketing/ reference files
  from structured questioning. Use when setting up takeToMarket for a new project.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---
```

**Modification needed:** Remove the "**Status:** Not yet implemented (Phase 2)" line and ensure the `@reference` to `workflows/setup/init.md` is functional. The body should be minimal -- just the routing instruction, matching GSD's skill-to-workflow delegation pattern.

**Target state:**
```markdown
---
name: ttm-init
description: >
  Interview-driven onboarding that generates all .marketing/ reference files
  from structured questioning. Use when setting up takeToMarket for a new project.
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep
---

# /ttm-init

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/setup/init.md`
```

---

## Shared Patterns

### Two-Tier Template Structure
**Source:** `templates/reference-files/positioning.md` (lines 1-11) and `references/context-loading.md` (lines 76-84)
**Apply to:** All 9 generated `.marketing/` reference files

```markdown
<!-- _SUMMARY: Tier 1 context (loaded universally, <200 words) -->
## Summary
**Category:** [filled from interview]
**Target audience:** [filled from interview]
**Primary differentiator:** [filled from interview]
<!-- END_SUMMARY -->

[Full Tier 2 content below]
```

Every generated file MUST preserve these delimiters exactly. The `_SUMMARY` block must be under 200 words. The workflow must instruct Claude to read the template first and fill placeholders while preserving all structural elements.

### Deterministic Operations via ttm-tools.cjs
**Source:** `bin/ttm-tools.cjs` (lines 1-72)
**Apply to:** `workflows/setup/init.md` for timestamps, init checks, state updates, health checks

| Operation | Command |
|-----------|---------|
| Check init status | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw` |
| Get timestamp | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw` |
| Update state | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update status initialized` |
| Validate health | `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs health` |

Never generate timestamps or slugs via AI. Always shell out to ttm-tools.cjs.

### State Management via Frontmatter
**Source:** `bin/lib/state.cjs` (lines 44-58, 68-91) and `templates/reference-files/state.md`
**Apply to:** STATE.md generation and post-init update

STATE.md uses YAML frontmatter (not `_SUMMARY` markers). Template:
```yaml
---
status: initialized
current_phase: none
current_campaign: none
last_updated: [timestamp from ttm-tools.cjs]
campaigns: []
---
```

State reads/writes go through `ttm-tools.cjs state read` and `ttm-tools.cjs state update`. The workflow should NOT manually edit STATE.md frontmatter.

### Path Security Pattern
**Source:** `bin/lib/state.cjs` (lines 28-36)
**Apply to:** Any file write operation in the workflow

```javascript
const statePath = path.resolve(process.cwd(), '.marketing', 'STATE.md');
const projectRoot = path.resolve(process.cwd());
if (!statePath.startsWith(projectRoot)) {
  error('STATE.md path escapes project directory');
}
```

All file writes are constrained to `.marketing/` within the project root. The workflow does not need to implement this -- it is already enforced by ttm-tools.cjs.

### AskUserQuestion with Text-Mode Fallback
**Source:** GSD `workflows/new-project.md` (line 107) and `workflows/profile-user.md` (line 34)
**Apply to:** Every AskUserQuestion call in `workflows/setup/init.md`

The text-mode detection block is placed once at the top. All AskUserQuestion calls automatically fall back to numbered lists when TEXT_MODE is active.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `workflows/setup/init-validation.md` | reference | static (validation rules) | No specificity-validation reference files exist in the codebase yet. Use the re-prompt pattern from RESEARCH.md (Pattern 2) and structure inspired by `gates/base-gates.md`. |

## Metadata

**Analog search scope:** Project root (`/Users/rishikeshranjan/code/rishiPersonal/takeToMarket/`), GSD installation (`~/.claude/get-shit-done/workflows/`)
**Files scanned:** 35+ (all project .md and .cjs files, plus 2 GSD workflow analogs)
**Pattern extraction date:** 2026-04-22
