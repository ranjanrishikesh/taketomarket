# Phase 4: Content Production and Verification - Research

**Researched:** 2026-04-24
**Domain:** Claude Code skill authoring -- workflow orchestration, subagent execution, quality gate evaluation
**Confidence:** HIGH

## Summary

Phase 4 delivers the two most architecturally complex commands in takeToMarket: `/ttm-produce` (content generation in isolated subagent contexts with wave-parallel execution) and `/ttm-verify` (10-gate quality wall with line-level feedback and structured deviation handling). These commands bridge the planning phases (brief, research) with the review/ship phases, and they establish the core "produce in isolation, verify independently" pattern that prevents self-evaluation bias.

The primary technical challenge is context isolation and orchestration. Both SKILL.md stubs already exist with `Task` in `allowed-tools` and `context: fork` is the documented Claude Code mechanism for subagent isolation. The produce workflow must orchestrate a hero-first-then-derivatives pattern where the hero asset is written to disk before derivative contexts are spawned. The verify workflow must load assets from disk (never from the produce context) and evaluate each against 10 gates, presenting results as a summary table with drill-down and 3 deviation options per failure.

Secondary challenges include: extending `campaign.cjs` ALLOWED_FIELDS for gate tracking, designing a production manifest format that bridges produce-to-verify, building the playbook loading mechanism (structure only -- playbook content is Phase 8), and implementing the DEVIATIONS.md append-only log.

**Primary recommendation:** Use `context: fork` on both SKILL.md files for top-level isolation, then use `Task()` calls within the produce workflow to spawn per-asset production subagents for wave-parallel execution. Verify runs as a single forked context (no internal parallelism needed).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Hero-first, then derivatives in wave-parallel -- produce the hero/anchor asset first, then spawn parallel contexts for derivatives. Each derivative context loads the hero asset as reference.
- D-02: Playbooks loaded per asset type -- blog post gets SEO playbook, email gets Email playbook. Mechanism built now, content Phase 8.
- D-03: Context loading for production: brief + positioning (Tier 2 full) + brand (Tier 2 full) + ICP (Tier 2 full) + relevant playbook + hero asset (for derivatives).
- D-04: Tier 1 gates soft fail with override -- gate failure flagged prominently but user can Accept+log. No hard blocks.
- D-05: Gate feedback: summary table + line-level drill-down.
- D-06: All 10 base quality gates evaluated.
- D-07: Accept+log records full deviation: gate name, failure text, justification, timestamp, asset path. Stored in STATE.md + DEVIATIONS.md.
- D-08: Escalate immediately launches /ttm-positioning-shift. Verification pauses until resolved.
- D-09: Three deviation options: Correct, Accept+log, Escalate.
- D-11: State passing: file paths + production manifest.

### Claude's Discretion
- D-10: Context isolation mechanism -- researcher picks between context:fork and Task()
- Production manifest format
- Gate evaluation prompting strategy
- Playbook loading mechanism

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIFE-06 | /ttm-produce generates content in fresh 200K-token contexts loaded with brief + positioning + brand + ICP + playbook | Context loading matrix, Task() subagent pattern, SKILL.md context:fork |
| LIFE-07 | Produce supports wave-parallel execution -- hero first, then derivatives | Hero-first orchestration pattern, Task() parallel spawning |
| LIFE-08 | /ttm-verify runs all quality gates with pass/fail and line-level feedback | Gate evaluation prompting strategy, summary table + drill-down pattern |
| LIFE-09 | Verify runs in separate context from Produce | context:fork on SKILL.md, file-based state passing via production manifest |
| GATE-01 | Positioning drift gate | Gate reference file pattern, POSITIONING.md loading |
| GATE-02 | Claim accuracy gate | BRAND.md proof points cross-reference |
| GATE-03 | Voice drift gate | BRAND.md voice archetype + banned words |
| GATE-04 | Outcome alignment gate | BRIEF.md outcome metric cross-reference |
| GATE-05 | Funnel integrity gate | CTA/link validation pattern |
| GATE-06 | UTM hygiene gate | CHANNELS.md schema validation |
| GATE-07 | Compliance gate | Regulatory checklist pattern |
| GATE-08 | Competitor collision gate | COMPETITORS.md cross-reference |
| GATE-09 | ICP fit gate | ICP.md language library cross-reference |
| GATE-10 | Format correctness gate | Channel-specific format rules |
| GATE-11 | Gate tiering -- Tier 1 blocking vs Tier 2 advisory | Tier classification from base-gates.md |
| GATE-12 | Deviation reports with 3 options | Correct/Accept+log/Escalate flow with DEVIATIONS.md |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Zero npm dependencies -- skill files are Markdown read by the AI runtime; bin/ tools use Node.js built-ins only
- No single file exceeds 500 lines
- Thin SKILL.md -> workflow routing pattern (SKILL.md stays under 300 lines, workflows do the work)
- Two-tier context loading must be followed (Tier 1 summaries always, Tier 2 on demand)
- `context: fork` for production and verification skills
- `Task()` subagent API for wave-parallel execution
- AskUserQuestion with text-mode fallback for interactive prompts
- State persistence via Markdown files in `.marketing/`
- `bin/ttm-tools.cjs` single entry point with subcommands for deterministic operations

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Production orchestration | Workflow (produce.md) | SKILL.md (entry) | Workflow decides hero-first ordering, spawns Task() subagents |
| Content generation | Task() subagent | -- | Each asset produced in isolated context with fresh 200K window |
| Context assembly | Workflow (produce.md) | bin/ttm-tools.cjs | Workflow reads files, constructs prompt; CLI handles state ops |
| Quality gate evaluation | Workflow (verify.md) | Gate reference files | Workflow orchestrates; gate definitions in gates/ directory |
| Deviation handling | Workflow (verify.md) | bin/ttm-tools.cjs | Workflow prompts user; CLI writes state atomically |
| Production manifest | bin/ttm-tools.cjs | Workflow | CLI creates/reads JSON manifest; workflow consumes it |
| State updates | bin/ttm-tools.cjs | -- | Atomic frontmatter updates via campaign.cjs |
| Playbook routing | Workflow (produce.md) | -- | Workflow maps asset type to playbook file path |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SKILL.md (context: fork) | Current | Isolation for produce and verify commands | Official Claude Code mechanism for subagent isolation [VERIFIED: Context7 docs] |
| Task() tool | Current | Wave-parallel asset production within produce workflow | Official Claude Code subagent API for delegating focused tasks [VERIFIED: Context7 docs] |
| Markdown workflows | N/A | Orchestration logic for produce.md and verify.md | Established pattern from Phases 1-3 [VERIFIED: codebase] |
| bin/ttm-tools.cjs | N/A | Production manifest creation, state updates, gate result tracking | Existing CLI utility extended with new subcommands [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Gate reference files (gates/*.md) | N/A | Per-gate evaluation criteria and prompting instructions | Loaded by verify workflow for each gate evaluation |
| Agent definition files (agents/*.md) | N/A | Subagent prompt definitions for producer and verifier | Loaded by Task() when spawning production subagents |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| context:fork + Task() (both) | context:fork only | Fork gives top-level isolation but cannot do wave-parallel derivatives internally -- Task() needed for per-asset parallelism |
| Task() only (no context:fork) | -- | Would work but misses SKILL.md-level isolation guarantee; fork is the documented best practice for produce/verify |
| JSON production manifest | YAML frontmatter in .md file | JSON is better for machine parsing by verify workflow; YAML frontmatter is the pattern for state files but manifest is purely machine-consumed |

## Architecture Patterns

### System Architecture Diagram

```
User runs /ttm-produce <slug>
        |
        v
[SKILL.md: context:fork] -- isolates from conversation history
        |
        v
[produce.md workflow]
        |
        +-- Step 1: Load context (brief, positioning, brand, ICP)
        +-- Step 2: Parse assets list from BRIEF.md
        +-- Step 3: Identify hero asset
        |
        v
[Task(): produce hero asset]
   - Loads: brief + positioning(full) + brand(full) + ICP(full) + playbook
   - Writes: CAMPAIGNS/<slug>/ASSETS/<hero-filename>.md
        |
        v
[Task(): produce derivative 1] [Task(): produce derivative 2] ...
   - Each loads: same context + hero asset as reference
   - Each writes: CAMPAIGNS/<slug>/ASSETS/<derivative-filename>.md
        |
        v
[Write production manifest to CAMPAIGNS/<slug>/MANIFEST.json]
[Update STATE.md: phase=produced]
        |
        v
User runs /ttm-verify <slug>
        |
        v
[SKILL.md: context:fork] -- separate context from produce
        |
        v
[verify.md workflow]
        |
        +-- Step 1: Load MANIFEST.json + asset files from disk
        +-- Step 2: Load gate definitions from gates/base-gates.md
        +-- Step 3: For each asset, evaluate all 10 gates
        |
        v
[Gate evaluation loop]
   - For each gate: load gate reference file, evaluate asset, record PASS/WARN/FAIL
   - Tier 1 failures: prompt user for deviation choice
   - Tier 2 failures: record as advisory
        |
        v
[Summary table + line-level drill-down display]
[Write verification report to CAMPAIGNS/<slug>/VERIFICATION.md]
[Update STATE.md + DEVIATIONS.md]
```

### Recommended Project Structure (new/modified files)

```
agents/
  ttm-producer.md              # NEW: Production subagent prompt definition
  ttm-verifier.md              # NEW: Verification subagent prompt (optional, may not need separate agent)

workflows/lifecycle/
  produce.md                   # NEW: Production orchestration workflow
  verify.md                    # NEW: Verification orchestration workflow

gates/
  base-gates.md                # EXISTS: Update with detailed evaluation criteria per gate
  gate-evaluation.md           # NEW: Gate evaluation reference (prompting strategy per gate)

templates/
  production-manifest.json     # NEW: Manifest template
  verification-report.md       # NEW: Verification report template
  deviation-log.md             # NEW: DEVIATIONS.md template

bin/lib/
  campaign.cjs                 # MODIFY: Extend ALLOWED_FIELDS for gate results + production state

skills/ttm-produce/SKILL.md    # MODIFY: Add context:fork, update workflow pointer
skills/ttm-verify/SKILL.md     # MODIFY: Add context:fork, update workflow pointer
```

### Pattern 1: Context Fork + Internal Task() Delegation

**What:** SKILL.md uses `context: fork` for top-level isolation from conversation. Inside the forked context, the workflow uses `Task()` to spawn per-asset production subagents with even fresher contexts.

**When to use:** When a skill needs both isolation from the parent conversation AND internal parallelism.

**Example:**
```yaml
# skills/ttm-produce/SKILL.md
---
name: ttm-produce
description: >
  Produce phase: generate content assets in fresh contexts loaded with brief,
  positioning, brand, ICP, and playbook. Use after a brief is approved.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
context: fork
allowed-tools: Read Write Bash Glob Grep Task
---

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/produce.md`
```
[VERIFIED: Context7 Claude Code docs confirm context:fork runs skill in isolated subagent]

### Pattern 2: Hero-First Sequential Then Parallel Derivatives

**What:** Produce the anchor/hero asset first (blocking), write it to disk, then spawn parallel Task() calls for each derivative that load the hero from disk.

**When to use:** When derivatives need to reference the hero for consistency (tone, claims, key messages).

**Example (workflow pseudocode):**
```markdown
## Step: Produce Hero Asset

Use Task() to spawn a production subagent:
- prompt: [full context + "Produce the hero asset: {asset_type} for {channel}"]
- subagent_type: "ttm-producer"
- Wait for completion
- Verify hero file exists at CAMPAIGNS/<slug>/ASSETS/<hero-filename>.md

## Step: Produce Derivatives (wave-parallel)

For each derivative asset in the brief's asset list:
  Use Task() with:
  - prompt: [full context + hero asset content + "Produce derivative: {asset_type} for {channel}"]
  - subagent_type: "ttm-producer"

All derivative Task() calls can run in parallel.
```
[ASSUMED: Task() supports parallel invocation within a single workflow -- based on GSD's wave-parallel execution pattern]

### Pattern 3: Gate Evaluation as Structured Prompting

**What:** Each gate is evaluated by loading its definition from a reference file and asking the AI to check the asset content against specific criteria, returning a structured PASS/WARN/FAIL result with line-level citations.

**When to use:** For all 10 base gates in the verify workflow.

**Example (gate evaluation prompt structure):**
```markdown
## Gate: Positioning Drift (GATE-01)

**Reference:** Load POSITIONING.md (Tier 2 full)
**Asset:** [asset content]

Evaluate this asset against the positioning defined in POSITIONING.md:

1. Does the asset restate or naturally extend the primary differentiator?
2. Are all claims backed by approved proof points?
3. Are any must-not-say terms present?

For each finding:
- Result: PASS | WARN | FAIL
- Evidence: Quote the exact line(s) from the asset
- Reference: Quote the positioning element being compared against
- Recommendation: What to change (if WARN or FAIL)
```

### Pattern 4: Production Manifest as JSON

**What:** After all assets are produced, the produce workflow writes a MANIFEST.json file that the verify workflow reads. This is the ONLY bridge between produce and verify contexts.

**When to use:** Every produce run creates a manifest; every verify run reads it.

**Example:**
```json
{
  "campaign": "spring-launch-2026",
  "produced_at": "2026-04-24T12:00:00Z",
  "context_loaded": {
    "brief": ".marketing/CAMPAIGNS/spring-launch-2026/BRIEF.md",
    "positioning": ".marketing/POSITIONING.md",
    "brand": ".marketing/BRAND.md",
    "icp": ".marketing/ICP.md"
  },
  "hero": {
    "asset_id": 1,
    "type": "blog-post",
    "channel": "organic-search",
    "playbook": "playbooks/seo.md",
    "file": "ASSETS/01-blog-post-organic-search.md"
  },
  "derivatives": [
    {
      "asset_id": 2,
      "type": "linkedin-post",
      "channel": "linkedin",
      "playbook": "playbooks/linkedin.md",
      "file": "ASSETS/02-linkedin-post.md",
      "derived_from": 1
    }
  ],
  "total_assets": 2
}
```

### Pattern 5: Deviation Handling Flow

**What:** When a gate fails, the user gets 3 options. Accept+log writes to both STATE.md and DEVIATIONS.md. Escalate launches /ttm-positioning-shift.

**When to use:** Every Tier 1 gate failure, and optionally for Tier 2 findings the user wants to act on.

**Example (DEVIATIONS.md entry):**
```markdown
## Deviation: GATE-01 Positioning Drift

**Asset:** ASSETS/01-blog-post-organic-search.md
**Gate:** Positioning Drift (GATE-01, Tier 1)
**Result:** FAIL
**Finding:** Line 14: "We're the fastest solution on the market" -- no proof point for speed claim
**Action:** Accept+log
**Justification:** Speed comparison is backed by internal benchmark data not yet in POSITIONING.md. Will add in next positioning refresh.
**Recorded:** 2026-04-24T12:30:00Z
**Verify run:** 1
```

### Anti-Patterns to Avoid

- **Passing produce context to verify:** Verify MUST load assets from disk, never from the produce agent's memory. This is the core self-evaluation bias prevention. [VERIFIED: D-09 locked decision, D-11 file-based state passing]
- **Hard-blocking on gate failures:** All gates soft-fail with override per D-04. Never prevent the user from proceeding.
- **Evaluating all gates in a single prompt:** Each gate should be evaluated separately with its specific reference data loaded. Bundling all 10 gates into one prompt risks shallow evaluation and context overflow.
- **Storing gate results only in the verification report:** Gate results must also update STATE.md frontmatter for campaign state tracking.
- **Overwriting DEVIATIONS.md:** It is append-only per user specification. Each verify run adds entries, never overwrites.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subagent isolation | Custom message passing | `context: fork` in SKILL.md | Built into Claude Code runtime; handles context isolation automatically |
| Parallel execution | Custom async orchestration | `Task()` tool with multiple calls | Claude Code handles parallel Task() execution natively |
| State updates | Direct file manipulation in workflow | `bin/ttm-tools.cjs campaign update` | Atomic updates with timestamp, field validation, path security |
| Slug/path resolution | String concatenation in workflow | `bin/ttm-tools.cjs` campaign subcommand | Path traversal protection, consistent sanitization |
| Timestamp generation | Inline date logic | `bin/ttm-tools.cjs timestamp` | Consistent ISO format across all files |

**Key insight:** The produce/verify workflows are orchestration logic -- they decide WHAT to do and in what order. All deterministic operations (state writes, path resolution, timestamps) delegate to `bin/ttm-tools.cjs`.

## Common Pitfalls

### Pitfall 1: Context Window Overflow in Production Subagents

**What goes wrong:** Loading brief + positioning(full) + brand(full) + ICP(full) + playbook + hero asset exhausts too much of the 200K context window, leaving insufficient room for actual content generation.
**Why it happens:** Full Tier 2 files can be large; playbooks (Phase 8) could add significant content.
**How to avoid:** Budget context loading. Estimate: brief ~2K tokens, positioning ~3K, brand ~3K, ICP ~3K, playbook ~5K, hero ~3K = ~19K tokens. This leaves ~180K for generation. Include a context budget check in the produce workflow that warns if loaded context exceeds 25K tokens.
**Warning signs:** Subagent produces truncated or shallow content.

### Pitfall 2: Race Condition on Hero Asset Write

**What goes wrong:** Derivative Task() calls start before the hero asset file is fully written to disk.
**Why it happens:** Task() for hero returns before filesystem flush completes.
**How to avoid:** After the hero Task() completes, explicitly read the hero file back to verify it exists and has content before spawning derivative tasks. Use a verification step, not a sleep.
**Warning signs:** Derivatives reference a hero asset that is empty or missing.

### Pitfall 3: ALLOWED_FIELDS Blocking Gate Updates

**What goes wrong:** The verify workflow tries to update STATE.md with gate results but `campaign.cjs` rejects the field because it is not in ALLOWED_FIELDS.
**Why it happens:** Current ALLOWED_FIELDS only includes `gate.positioning_check` and `gate.outcome_metric`. The 10 base gates need 10 new fields.
**How to avoid:** Extend ALLOWED_FIELDS in `campaign.cjs` to include all gate result fields before implementing verify workflow.
**Warning signs:** `Unknown state field` error during verify execution.

### Pitfall 4: Gate Evaluation Inconsistency

**What goes wrong:** Different gates produce results in different formats, making the summary table inconsistent.
**Why it happens:** Each gate evaluation is a separate AI prompt; without strict output format requirements, results vary.
**How to avoid:** Define a structured output format in the gate evaluation reference file. Each gate evaluation must return: `result` (PASS/WARN/FAIL), `findings[]` (each with `line`, `text`, `reference`, `recommendation`). The verify workflow parses this structured output.
**Warning signs:** Summary table has missing columns or inconsistent result labels.

### Pitfall 5: Playbook File Not Found (Phase 4 vs Phase 8 timing)

**What goes wrong:** Produce workflow tries to load a playbook for an asset type but the playbook file doesn't exist yet (content is Phase 8).
**Why it happens:** Phase 4 builds the loading mechanism; Phase 8 creates the content.
**How to avoid:** Build the playbook loading mechanism with a graceful fallback: if no playbook exists for the asset type, produce with base context only and log a warning. Include a stub/skeleton playbook file that the mechanism can find.
**Warning signs:** Produce fails or errors when no playbook file matches the asset type.

### Pitfall 6: Deviation Log Formatting Corruption

**What goes wrong:** Multiple verify runs append to DEVIATIONS.md in inconsistent formats, making it hard to parse.
**Why it happens:** Each append is done by the AI in a slightly different markdown structure.
**How to avoid:** Use a deterministic append operation in `bin/ttm-tools.cjs` that takes structured input and writes a consistent markdown entry. Never let the workflow write DEVIATIONS.md directly.
**Warning signs:** DEVIATIONS.md entries have varying heading levels, field names, or missing fields.

## Code Examples

### Campaign State Field Extension

```javascript
// Source: bin/lib/campaign.cjs -- ALLOWED_FIELDS needs extension
const ALLOWED_FIELDS = new Set([
  'phase', 'name', 'last_updated',
  'phase.created', 'phase.researched', 'phase.briefed', 'phase.produced',
  'phase.verified', 'phase.reviewed', 'phase.fixed', 'phase.shipped',
  'phase.measured', 'phase.learned',
  'gate.positioning_check', 'gate.outcome_metric',
  // NEW: Per-gate verification results
  'gate.positioning_drift', 'gate.claim_accuracy', 'gate.voice_drift',
  'gate.outcome_alignment', 'gate.funnel_integrity', 'gate.utm_hygiene',
  'gate.compliance', 'gate.competitor_collision', 'gate.icp_fit',
  'gate.format_correctness',
  // NEW: Verification metadata
  'verify.run_count', 'verify.last_run', 'verify.overall_result',
  'current_campaign',
]);
```
[VERIFIED: current ALLOWED_FIELDS from codebase inspection of bin/lib/campaign.cjs]

### SKILL.md with context:fork

```yaml
# Source: Claude Code docs (Context7) + existing stub
---
name: ttm-produce
description: >
  Produce phase: generate content assets in fresh contexts loaded with brief,
  positioning, brand, ICP, and playbook. Use after a brief is approved.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
context: fork
allowed-tools: Read Write Bash Glob Grep Task
---

# /ttm-produce

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/produce.md`
```

### Task() Subagent Call for Hero Production

```markdown
<!-- Source: GSD execute-phase.md pattern + Claude Code Task API docs -->
Use Task() to produce the hero asset:

Task(
  prompt: "You are a marketing content producer. Read the following files and produce {ASSET_TYPE} content for {CHANNEL}.

Files to read:
- {CAMPAIGN_DIR}/BRIEF.md (full campaign brief)
- .marketing/POSITIONING.md (positioning -- follow exactly)
- .marketing/BRAND.md (voice, tone, banned words)
- .marketing/ICP.md (target audience, language, pains)
- {PLAYBOOK_PATH} (discipline-specific rules, if exists)

Write the produced content to: {CAMPAIGN_DIR}/ASSETS/{FILENAME}.md

The asset must:
1. Serve the outcome metric defined in the brief
2. Use the positioning anchor as the foundation
3. Match the brand voice archetype
4. Address the ICP's pains in their language
5. Follow all playbook format requirements (if playbook loaded)",
  subagent_type: "ttm-producer"
)
```

### Verification Summary Table Format

```markdown
<!-- Source: D-05 locked decision -->
## Verification Report: spring-launch-2026

**Run:** 1 | **Date:** 2026-04-24 | **Assets:** 3

### Summary

| # | Gate | Tier | Asset 1 | Asset 2 | Asset 3 |
|---|------|------|---------|---------|---------|
| 1 | Positioning Drift | T1 | PASS | WARN | PASS |
| 2 | Claim Accuracy | T1 | PASS | PASS | FAIL |
| 3 | Voice Drift | T2 | PASS | PASS | PASS |
| 4 | Outcome Alignment | T1 | PASS | PASS | PASS |
| 5 | Funnel Integrity | T2 | PASS | N/A | PASS |
| 6 | UTM Hygiene | T2 | PASS | N/A | PASS |
| 7 | Compliance | T2 | PASS | PASS | PASS |
| 8 | Competitor Collision | T2 | PASS | PASS | PASS |
| 9 | ICP Fit | T2 | PASS | WARN | PASS |
| 10 | Format Correctness | T2 | PASS | PASS | PASS |

**Result:** 1 FAIL (Tier 1), 2 WARN -- action required

### Detail: Asset 2 -- GATE-02 Claim Accuracy (FAIL)

**Line 14:** "Our platform processes 10x more requests than competitors"
**Issue:** No proof point in POSITIONING.md supports the "10x" claim
**Reference:** Proof Point Library contains "3x faster response time" (not 10x throughput)

**Action required:**
1. **Correct** -- rewrite to use approved proof point
2. **Accept+log** -- document exception and proceed
3. **Escalate** -- trigger /ttm-positioning-shift to add new proof point
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Task` tool name | `Agent` tool name (with `Task` as alias) | Claude Code recent versions | Both names work; use `Task` for backward compatibility [VERIFIED: Context7 docs] |
| Flat command files (.claude/commands/*.md) | Skills directory format (.claude/skills/*/SKILL.md) | 2025 | Skills support context:fork, hooks, subagent execution |

**Deprecated/outdated:**
- The `Task` tool name is being replaced by `Agent` in newer SDK versions, but `Task` remains as an alias [VERIFIED: Context7 docs show both names]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Task() supports parallel invocation within a single workflow context (multiple Task() calls running simultaneously) | Pattern 2 | If Task() is strictly sequential, derivatives must be produced one at a time -- slower but still functional |
| A2 | context:fork creates a truly isolated context that does not share memory with the parent | Architecture | If fork shares partial context, verify could see produce's reasoning (violates LIFE-09) |
| A3 | DEVIATIONS.md append can be done deterministically via ttm-tools.cjs | Pitfall 6 | If not built as a CLI subcommand, workflow-driven appends may have formatting inconsistency |
| A4 | Each gate evaluation prompt fits within reasonable token limits (~5-10K per gate including asset content) | Pitfall 1 | If assets are very long, may need to chunk gate evaluation |

## Open Questions (RESOLVED)

1. **Playbook stub content for Phase 4**
   - RESOLVED: Create minimal stub files AND handle missing files gracefully (belt and suspenders). Implemented in Plan 04-02 produce.md playbook loading with graceful fallback.

2. **Agent definition files**
   - RESOLVED: Create `agents/ttm-producer.md` as a reusable prompt template. Keeps workflow lean. Implemented in Plan 04-01 Task 2.

3. **Correct (D-09 option 1) implementation**
   - RESOLVED: Phase 4 records "Correct" choice and sets state to `fix_needed`. Phase 5's /ttm-fix acts on it. Correct option displays: "Recorded — addressable via /ttm-fix in Phase 5." Implemented in Plan 04-04 verify.md Step 6.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified -- Phase 4 is purely code/config changes to Markdown skill files and Node.js CJS utilities using built-ins only).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node --test) |
| Config file | none -- see Wave 0 |
| Quick run command | `node --test tests/test-campaign.cjs` |
| Full suite command | `node --test tests/` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIFE-06 | Produce generates assets in CAMPAIGNS/<slug>/ASSETS/ | smoke | Verify files exist after mock produce | Wave 0 |
| LIFE-07 | Hero asset produced before derivatives | unit | Check manifest hero timestamp < derivative timestamps | Wave 0 |
| LIFE-08 | Verify produces pass/fail for all 10 gates | unit | Check verification report has all 10 gate entries | Wave 0 |
| LIFE-09 | Verify context is separate from produce | manual-only | Verify SKILL.md has context:fork; no shared state beyond files | N/A |
| GATE-01-10 | Each gate evaluates correctly | manual-only | AI evaluation quality requires human judgment | N/A |
| GATE-11 | Tier 1 vs Tier 2 classification correct | unit | Check gate tier mapping matches base-gates.md | Wave 0 |
| GATE-12 | Deviation report offers 3 options | manual-only | Interactive prompt requires human | N/A |

### Sampling Rate
- **Per task commit:** `node --test tests/test-campaign.cjs`
- **Per wave merge:** `node --test tests/`
- **Phase gate:** Full suite green before /gsd-verify-work

### Wave 0 Gaps
- [ ] `tests/test-manifest.cjs` -- covers LIFE-06, LIFE-07 (manifest creation and structure)
- [ ] `tests/test-gate-fields.cjs` -- covers GATE-11 (ALLOWED_FIELDS extension, tier mapping)
- [ ] Extended ALLOWED_FIELDS in campaign.cjs before any verify workflow can run

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- no auth in skill |
| V3 Session Management | no | N/A -- stateless skill |
| V4 Access Control | no | N/A -- single user |
| V5 Input Validation | yes | Slug sanitization via campaign.cjs, ALLOWED_FIELDS whitelist, path traversal prevention |
| V6 Cryptography | no | N/A -- no crypto needed |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via slug | Tampering | `resolveCampaignStatePath()` already validates path stays within project root [VERIFIED: codebase] |
| State field injection | Tampering | ALLOWED_FIELDS whitelist blocks arbitrary field writes [VERIFIED: codebase] |
| Unbounded file writes | Denial of Service | Assets written to scoped CAMPAIGNS/<slug>/ASSETS/ directory only |

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/code_claude` -- context:fork, Task() API, SKILL.md frontmatter, Agent/Task tool specification
- Context7 `/anthropics/claude-code` -- subagent invocation patterns, agent definition
- Codebase inspection -- `bin/lib/campaign.cjs`, `gates/base-gates.md`, `skills/ttm-produce/SKILL.md`, `skills/ttm-verify/SKILL.md`, `references/context-loading.md`, `workflows/lifecycle/brief.md`, `workflows/lifecycle/brief-positioning-check.md`

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` -- planned agents/ directory structure, plugin architecture
- `.planning/research/ARCHITECTURE.md` -- orchestrator pattern, subagent delegation
- GSD `workflows/execute-phase.md` -- wave-parallel Task() execution pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools are built into Claude Code runtime, verified via Context7 docs
- Architecture: HIGH -- patterns established in Phases 1-3, context:fork and Task() confirmed in official docs
- Pitfalls: MEDIUM -- some pitfalls (A1 parallel Task, A4 token limits) based on training knowledge, not runtime-tested

**Research date:** 2026-04-24
**Valid until:** 2026-05-24 (30 days -- stable domain, Claude Code skills API unlikely to change rapidly)
