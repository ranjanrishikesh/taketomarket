# Phase 3: Campaign Creation and Briefing - Research

**Researched:** 2026-04-22
**Domain:** Claude Code skill workflows -- campaign scaffolding, market research, brief generation with enforcement gates
**Confidence:** HIGH

## Summary

Phase 3 delivers three commands (`/ttm-new-campaign`, `/ttm-research`, `/ttm-brief`) that create campaign directories, perform market research, and generate enforcement-gated briefs. This is the first phase that creates runtime user content in `.marketing/CAMPAIGNS/` -- all prior phases built infrastructure and onboarding. The phase follows established patterns from Phase 2 (thin SKILL.md routing to workflow files, AskUserQuestion with text-mode fallback, template-guided generation) and extends `bin/ttm-tools.cjs` with campaign-specific state operations.

The primary technical challenge is designing three interconnected workflows where each produces files consumed by the next: `new-campaign` creates the scaffold, `research` fills `RESEARCH.md`, and `brief` reads research + reference files to produce `BRIEF.md` with two enforcement gates (outcome metric and positioning check). The reference file access strategy (D-02, Claude's Discretion) is resolved by direct reads -- the AI reads `.marketing/*.md` files directly using absolute paths, which is the simplest and most reliable approach given that skills run in the user's project root.

**Primary recommendation:** Build three workflow files (`workflows/setup/new-campaign.md`, `workflows/lifecycle/research.md`, `workflows/lifecycle/brief.md`) following Phase 2's init.md pattern exactly, with per-campaign STATE.md using the existing `parseFrontmatter`/`serializeFrontmatter` from `bin/lib/core.cjs`, and add a `campaign` subcommand to `ttm-tools.cjs` for campaign-specific state operations.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Full scaffold at campaign creation -- `CAMPAIGNS/<slug>/` gets STATE.md, BRIEF.md, RESEARCH.md, and ASSETS/ directory pre-created so users see the full structure upfront
- **D-02:** Reference file access strategy is Claude's Discretion -- researcher investigates and picks the most reliable, error-free approach
- **D-03:** Web search + manual paste hybrid -- use WebSearch/WebFetch MCP tools for SERP analysis and competitor scanning when available, fall back to manual paste prompts when tools are unavailable. Detect tool availability at runtime.
- **D-04:** Output format is structured markdown with confidence scores -- RESEARCH.md has fixed sections (Market Context, Competitor Content Analysis, Audience Insights, Ambient Narrative, Content Gaps) and each insight gets a confidence tag (HIGH/MEDIUM/LOW) based on data quality
- **D-05:** Positioning check gate on failure: generate the brief with a prominent warning section about positioning drift (not a hard block). User can choose to fix or proceed at their own risk.
- **D-06:** Outcome metric enforcement is guided, not strict -- strongly prompt for both output AND outcome metrics with target values and measurement windows, but allow brief to complete if user provides at least an outcome metric. Output metric can be added later.
- **D-07:** Brief must contain all mandatory fields: goal, outcome metric, target value, measurement window, ICP segment, positioning anchor, hook, proof points, channel mix, assets list
- **D-08:** Phase ordering is guided -- warn when running commands out of lifecycle order but allow user to override
- **D-09:** Per-campaign STATE.md tracks: current phase, phase completion timestamps, quality gate pass/fail history per asset
- **D-10:** Campaign slug generated via `bin/ttm-tools.cjs slug` -- deterministic, not AI-generated

### Claude's Discretion
- Reference file access mechanism (D-02) -- researched and resolved below
- RESEARCH.md template structure -- designed below based on what /ttm-brief needs to consume
- Per-campaign STATE.md frontmatter schema -- designed below based on what downstream commands need

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIFE-01 | `/ttm-new-campaign <slug>` creates `CAMPAIGNS/<slug>/` directory with initialized state, links to reference files | Full scaffold pattern (D-01), slug generation via ttm-tools.cjs, per-campaign STATE.md schema designed |
| LIFE-02 | `/ttm-research <slug>` performs market/audience research -- SERP analysis, competitor content, AI-answer citations, ambient narrative | Web search + manual paste hybrid (D-03), structured output with confidence scores (D-04), RESEARCH.md template designed |
| LIFE-03 | `/ttm-brief <slug>` generates campaign brief with mandatory fields | Template exists at `templates/campaign-brief.md`, all mandatory fields specified (D-07), guided interview pattern from Phase 2 |
| LIFE-04 | Brief phase enforces outcome metric -- refuses to proceed without both output and outcome metric defined | Guided enforcement (D-06) -- outcome required, output encouraged. Validation logic documented |
| LIFE-05 | Brief phase runs positioning check gate before proceeding to Produce | Soft gate with prominent warning (D-05). Positioning drift detection pattern documented |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Campaign directory scaffolding | Filesystem (Node.js CJS) | AI workflow | Deterministic operation -- `ttm-tools.cjs` creates dirs, workflow orchestrates |
| Slug generation | Filesystem (Node.js CJS) | -- | Already implemented in `bin/lib/slug.cjs`, pure deterministic |
| Market research | AI workflow | Web tools (MCP) | AI analyzes context and uses WebSearch/WebFetch when available, falls back to user paste |
| Brief generation | AI workflow | Filesystem (templates) | AI fills brief template from reference files + research + user input |
| Outcome metric enforcement | AI workflow | -- | Validation logic in workflow, not in CLI tool -- requires judgment |
| Positioning check gate | AI workflow | -- | Compares brief content against POSITIONING.md structured fields -- AI judgment |
| Campaign state tracking | Filesystem (Node.js CJS) | AI workflow | Frontmatter read/write via ttm-tools.cjs, workflow triggers updates |
| Phase ordering warnings | AI workflow | Filesystem (state read) | Reads campaign state, applies business logic, warns user |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Markdown (SKILL.md + workflows) | N/A | All skill content and instructions | The entire skill ecosystem is Markdown-native [VERIFIED: Phase 1/2 codebase] |
| Node.js built-ins (fs, path, crypto) | 18+ | `bin/ttm-tools.cjs` CLI operations | Required by Claude Code itself, zero external dependencies [VERIFIED: existing codebase] |
| YAML frontmatter | N/A | State tracking in campaign STATE.md | Standard across Agent Skills, parsed by existing `parseFrontmatter()` in core.cjs [VERIFIED: bin/lib/core.cjs] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| WebSearch MCP tool | Runtime-provided | SERP analysis in /ttm-research | When available in Claude Code runtime -- detect at runtime [ASSUMED] |
| WebFetch MCP tool | Runtime-provided | Competitor page content extraction | When available in Claude Code runtime -- detect at runtime [ASSUMED] |
| AskUserQuestion | Runtime-provided | Interactive prompts for brief data collection | When available (Claude Code); text-mode fallback for Codex [VERIFIED: Phase 2 pattern] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct file reads for reference access | Symlinks from campaign dir to .marketing/ | Symlinks break across OS boundaries (Windows), add complexity, no benefit for AI reads |
| Direct file reads for reference access | File copies into campaign dir | Creates drift risk -- copied files diverge from source of truth |
| AskUserQuestion for brief data | All freeform prompts | AskUserQuestion with structured options provides better UX for channel selection, ICP segment picks |

## Architecture Patterns

### System Architecture Diagram

```
User invokes /ttm-new-campaign "Q2 Product Launch"
        |
        v
[SKILL.md] --> routes to --> [workflows/setup/new-campaign.md]
        |
        v
[ttm-tools.cjs slug] --> "q2-product-launch"
        |
        v
[Create scaffold]
  .marketing/CAMPAIGNS/q2-product-launch/
    STATE.md    (initialized, phase=created)
    RESEARCH.md (empty template)
    BRIEF.md    (empty template)
    ASSETS/     (empty directory)
        |
        v
User invokes /ttm-research q2-product-launch
        |
        v
[SKILL.md] --> routes to --> [workflows/lifecycle/research.md]
        |
        v
[Load Tier 1 summaries from all 9 .marketing/ files]
[Load Tier 2: COMPETITORS.md]
        |
        +---> [WebSearch available?]
        |         YES --> SERP analysis, competitor pages
        |         NO  --> Prompt user to paste search results
        |
        v
[Generate structured RESEARCH.md with confidence scores]
[Update campaign STATE.md: phase=researched]
        |
        v
User invokes /ttm-brief q2-product-launch
        |
        v
[SKILL.md] --> routes to --> [workflows/lifecycle/brief.md]
        |
        v
[Load Tier 1 summaries + Tier 2: ICP, CHANNELS, METRICS, CALENDAR]
[Load campaign RESEARCH.md]
        |
        v
[Interactive brief generation]
  - Ask goal, outcome metric, target, measurement window
  - Validate: outcome metric present? (REQUIRED)
  - Validate: output metric present? (ENCOURAGED)
  - Fill template from reference files + user input
        |
        v
[Positioning Check Gate]
  - Compare brief against POSITIONING.md structured fields
  - PASS --> Write BRIEF.md, update state to phase=briefed
  - FAIL --> Write BRIEF.md WITH prominent drift warning
            User can fix or proceed
        |
        v
[Campaign ready for /ttm-produce]
```

### Recommended Project Structure (New Files)

```
workflows/
  setup/
    new-campaign.md          # Campaign creation workflow
  lifecycle/
    research.md              # Market research workflow
    brief.md                 # Brief generation workflow
    brief-positioning-check.md  # Positioning gate reference
templates/
  campaign-state.md          # Per-campaign STATE.md template
  campaign-research.md       # Per-campaign RESEARCH.md template
  campaign-brief.md          # Already exists (templates/campaign-brief.md)
bin/
  lib/
    campaign.cjs             # Campaign-specific CLI operations
  ttm-tools.cjs              # Add 'campaign' subcommand
skills/
  ttm-new-campaign/SKILL.md  # Update stub (already exists)
  ttm-research/SKILL.md      # Update stub (already exists)
  ttm-brief/SKILL.md         # Update stub (already exists)
```

### Pattern 1: Campaign Directory Scaffold

**What:** Full directory creation with pre-populated files on `/ttm-new-campaign`
**When to use:** Every new campaign creation (D-01)

```
.marketing/CAMPAIGNS/<slug>/
  STATE.md       # Campaign-specific state (YAML frontmatter)
  RESEARCH.md    # Populated by /ttm-research
  BRIEF.md       # Populated by /ttm-brief
  ASSETS/        # Populated by /ttm-produce (Phase 4)
```

Per-campaign STATE.md frontmatter schema:
```yaml
---
campaign: <slug>
name: <human-readable campaign name>
created: <ISO timestamp>
phase: created          # created | researched | briefed | producing | verifying | reviewing | fixing | shipped | measuring | learned
last_updated: <ISO timestamp>
phase_history:
  created: <ISO timestamp>
  researched: null
  briefed: null
gates:
  positioning_check: null    # pass | warn | fail
  outcome_metric: null       # pass | fail
---
```

[VERIFIED: follows existing STATE.md pattern from `bin/lib/state.cjs` -- uses `parseFrontmatter`/`serializeFrontmatter`]

**Limitation:** The existing `parseFrontmatter` in `core.cjs` handles only flat key-value pairs, not nested YAML. The campaign STATE.md schema above includes nested objects (`phase_history`, `gates`). This requires either: (a) flattening to dot-notation keys (`phase_history.created`), or (b) extending `parseFrontmatter` to handle one level of nesting. Recommendation: flatten to dot-notation for simplicity, consistent with Phase 1 approach.

### Pattern 2: Reference File Access (D-02 Resolution)

**What:** Direct reads of `.marketing/*.md` files using relative paths from project root
**Why chosen:** [VERIFIED: this is what Phase 2's init.md does -- reads templates with `${CLAUDE_PLUGIN_ROOT}/templates/` paths, writes to `.marketing/`]

The AI workflow reads reference files directly:
```markdown
Read `.marketing/POSITIONING.md` and extract content between
`<!-- _SUMMARY: ... -->` and `<!-- END_SUMMARY -->` for Tier 1.
Read full file for Tier 2 when needed per the loading matrix.
```

**Why NOT symlinks:** Symlinks from `CAMPAIGNS/<slug>/` pointing to `.marketing/` root files would break on Windows (requires admin), add confusion about which file is canonical, and provide no benefit since the AI reads files by path regardless. [ASSUMED -- Windows symlink limitation is well-known]

**Why NOT copies:** Copying reference files into each campaign directory creates drift risk. If the user updates `.marketing/POSITIONING.md` via `/ttm-brand-refresh`, copied versions in campaigns would be stale.

### Pattern 3: Web Search + Manual Paste Hybrid (D-03)

**What:** Runtime detection of MCP tool availability, graceful fallback to manual paste
**When to use:** `/ttm-research` workflow

```markdown
## Tool Detection

Check if WebSearch tool is available by attempting a minimal call.
If the tool call succeeds, set SEARCH_AVAILABLE=true.
If it fails or is not in allowed-tools, set SEARCH_AVAILABLE=false.

When SEARCH_AVAILABLE=true:
  - Use WebSearch for SERP queries (target keywords from campaign goal)
  - Use WebFetch for competitor page content extraction
  - Tag insights with confidence based on source quality

When SEARCH_AVAILABLE=false:
  - Prompt user: "I don't have web search access. Please paste
    search results for: [query suggestions]"
  - Also prompt: "Paste any competitor pages or content you'd
    like me to analyze"
  - Tag all pasted insights as MEDIUM confidence (user-provided,
    not independently verified)
```

**Note on SKILL.md allowed-tools:** The existing `ttm-research/SKILL.md` stub has `allowed-tools: Read Write Bash Glob Grep`. WebSearch and WebFetch are MCP tools that may or may not be available in the runtime. The workflow should detect availability rather than assuming. [VERIFIED: SKILL.md stub inspected]

### Pattern 4: Positioning Check Gate (D-05)

**What:** Soft gate that generates brief with prominent warning rather than blocking
**When to use:** After brief generation, before marking campaign as `briefed`

```markdown
## Positioning Check Logic

1. Read POSITIONING.md _SUMMARY block:
   - Extract: category, target audience, primary differentiator, proof points, must-not-say terms

2. Check brief against each field:
   - Does the brief's positioning anchor align with the primary differentiator?
   - Does the ICP segment match the target audience?
   - Are all proof points sourced from the proof point library?
   - Does the brief contain any must-not-say terms?
   - Does the hook reinforce rather than contradict the positioning?

3. Result:
   - PASS: All checks pass. STATE.md gates.positioning_check = "pass"
   - WARN: Minor drift detected. Brief generated with warning block:

     <!--
     !! POSITIONING DRIFT WARNING !!
     The following items may not align with your positioning:
     - [specific drift item 1]
     - [specific drift item 2]
     Review POSITIONING.md and adjust the brief if needed.
     Run /ttm-positioning-check for a full audit.
     -->

   - STATE.md gates.positioning_check = "warn"

   - Note: D-05 specifies warning, not hard block. The brief is always generated.
```

### Pattern 5: Guided Metric Enforcement (D-06)

**What:** Outcome metric required, output metric encouraged but not blocking
**When to use:** During `/ttm-brief` interactive session

```markdown
## Metric Enforcement Flow

1. Ask: "What is the outcome metric for this campaign?"
   - Validate: Must be a business outcome (not an output)
   - FAIL examples: "publish 4 blog posts" (output, not outcome)
   - PASS examples: "increase trial signups by 20%"
   - If empty or output-only: Re-prompt with explanation
   - After 2 retries: Block brief generation entirely

2. Ask: "What are the output metrics?"
   - If empty: Generate brief but add visible flag:
     <!-- OUTPUT_METRIC_MISSING: Add output metrics before /ttm-produce -->
   - Continue brief generation

3. STATE.md gates.outcome_metric = "pass" or "fail"
```

### Anti-Patterns to Avoid

- **Hardcoding tool availability:** Never assume WebSearch/WebFetch are available. Always detect at runtime. The SKILL.md `allowed-tools` field controls which tools the skill CAN use, but MCP tools like WebSearch depend on user's Claude Code configuration.
- **Modifying reference files from campaigns:** `.marketing/POSITIONING.md` etc. are read-only during campaign execution (POSN-02). Workflows must never write to them. Only `/ttm-*-refresh` commands can modify reference files.
- **Nested YAML in frontmatter:** The existing `parseFrontmatter()` in `core.cjs` only handles flat key: value pairs. Don't design state schemas that require nested YAML parsing. Use dot-notation flattening.
- **Blocking on positioning drift:** D-05 is explicit -- generate the brief with a warning, not a hard block. Users must be able to proceed at their own risk.
- **AI-generated slugs:** D-10 is explicit -- slugs come from `ttm-tools.cjs slug`, not from AI generation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug generation | Custom slug logic in workflow | `node ttm-tools.cjs slug "campaign name" --raw` | Already implemented, handles edge cases, deterministic [VERIFIED: bin/lib/slug.cjs] |
| Timestamp generation | `new Date().toISOString()` inline | `node ttm-tools.cjs timestamp --raw` | Consistent format across all state updates [VERIFIED: bin/lib/slug.cjs] |
| State reads/updates | Manual file parsing in workflows | `node ttm-tools.cjs state read --raw` / `state update` | Existing frontmatter parser handles edge cases [VERIFIED: bin/lib/state.cjs] |
| Health checks | Custom directory validation | `node ttm-tools.cjs health` | Existing validation, extendable for campaigns [VERIFIED: bin/lib/health.cjs] |
| YAML frontmatter parsing | Custom regex parsing | `parseFrontmatter()` from core.cjs | Handles quote stripping, line ending normalization [VERIFIED: bin/lib/core.cjs] |
| File writes with dir creation | `fs.mkdirSync` + `fs.writeFileSync` | `safeWriteFile()` from core.cjs | Creates parent dirs automatically [VERIFIED: bin/lib/core.cjs] |

**Key insight:** Phase 1 built a robust CLI toolkit specifically for these operations. Every deterministic operation should go through `ttm-tools.cjs`, not be reimplemented in workflow files.

## Common Pitfalls

### Pitfall 1: Campaign State vs Global State Confusion
**What goes wrong:** Workflows read/update `.marketing/STATE.md` (global) when they should be reading/updating `.marketing/CAMPAIGNS/<slug>/STATE.md` (per-campaign).
**Why it happens:** The existing `cmdStateRead`/`cmdStateUpdate` in `bin/lib/state.cjs` is hardcoded to `.marketing/STATE.md`. Campaign state is a different file in a different location.
**How to avoid:** Add a `campaign` subcommand to `ttm-tools.cjs` that takes a slug parameter and operates on `CAMPAIGNS/<slug>/STATE.md`. Keep the existing `state` subcommand for global state.
**Warning signs:** State updates that lose campaign-specific data or overwrite global state.

### Pitfall 2: Frontmatter Nesting Limitations
**What goes wrong:** Designing campaign STATE.md with nested YAML (`phase_history:` with sub-keys) but `parseFrontmatter()` only handles flat key-value pairs.
**Why it happens:** The frontmatter parser in `core.cjs` was built for simple STATE.md with flat fields. It splits on first colon per line.
**How to avoid:** Either (a) use dot-notation flattening (`phase_history.created: <timestamp>`) or (b) extend `parseFrontmatter` to handle one level of indented keys. Option (a) is simpler and recommended.
**Warning signs:** Frontmatter values containing colons being parsed incorrectly; nested objects stringified to `[object Object]`.

### Pitfall 3: WebSearch Unavailability Breaking Research
**What goes wrong:** `/ttm-research` workflow assumes WebSearch is available and fails when it's not.
**Why it happens:** WebSearch and WebFetch are MCP tools that depend on the user's Claude Code configuration. Some users won't have them.
**How to avoid:** D-03 mandates a manual paste fallback. The workflow MUST work without any web tools. Design the workflow with manual paste as the primary path, web search as an enhancement.
**Warning signs:** Error messages about unavailable tools; empty research output.

### Pitfall 4: Positioning Check Against Empty/Template Content
**What goes wrong:** Positioning check gate runs against placeholder text from the template rather than actual brief content.
**Why it happens:** If the brief template has `[GENERATED BY /ttm-brief]` placeholders that aren't filled, the positioning check sees those strings.
**How to avoid:** Run the positioning check AFTER the brief content is fully generated, not against the template. Check for unfilled placeholders as a pre-condition.
**Warning signs:** Positioning check always passing (because it can't detect drift in placeholder text).

### Pitfall 5: Race Between Research and Brief
**What goes wrong:** User runs `/ttm-brief` before `/ttm-research`, and the brief workflow can't find research data.
**Why it happens:** D-08 says phase ordering is guided (warn, not block), so users can skip research.
**How to avoid:** Brief workflow checks for `CAMPAIGNS/<slug>/RESEARCH.md` content. If empty/template-only, warn: "No research data available. Brief quality will be limited. Run /ttm-research first for better results. Proceed anyway?" If user proceeds, brief is generated from reference files only (no campaign-specific research).
**Warning signs:** Brief with generic positioning that doesn't reflect market reality.

## Code Examples

### Campaign Scaffold Creation (new-campaign.md workflow pattern)

```markdown
<!-- Source: Derived from Phase 2 init.md pattern [VERIFIED] -->

## Step 1: Validate Prerequisites

Run init check:
\`\`\`bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw
\`\`\`

If NOT initialized: "Run /ttm-init first to set up your marketing operating system."
Exit.

## Step 2: Generate Slug

\`\`\`bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs slug "$ARGUMENTS" --raw
\`\`\`

Store result as CAMPAIGN_SLUG.

## Step 3: Check for Existing Campaign

\`\`\`bash
ls .marketing/CAMPAIGNS/${CAMPAIGN_SLUG}/ 2>/dev/null && echo "exists" || echo "new"
\`\`\`

If "exists": Warn and ask if user wants to overwrite.

## Step 4: Create Scaffold

\`\`\`bash
mkdir -p .marketing/CAMPAIGNS/${CAMPAIGN_SLUG}/ASSETS
\`\`\`

Write STATE.md from template.
Write empty RESEARCH.md from template.
Write empty BRIEF.md from template.
```

### Per-Campaign STATE.md (Flat Frontmatter)

```yaml
---
campaign: q2-product-launch
name: Q2 Product Launch
created: 2026-04-22T10:30:00.000Z
phase: created
last_updated: 2026-04-22T10:30:00.000Z
phase.created: 2026-04-22T10:30:00.000Z
phase.researched: null
phase.briefed: null
phase.produced: null
phase.verified: null
phase.reviewed: null
phase.fixed: null
phase.shipped: null
phase.measured: null
phase.learned: null
gate.positioning_check: null
gate.outcome_metric: null
---

# Campaign: Q2 Product Launch

Phase: created
Next step: Run `/ttm-research q2-product-launch` to gather market intelligence.
```

[VERIFIED: flat key-value pairs compatible with existing `parseFrontmatter()` in core.cjs]

### Campaign RESEARCH.md Template

```markdown
# Research: [CAMPAIGN_NAME]

**Campaign:** [slug]
**Researched:** [timestamp or "pending"]
**Method:** [web-search | manual-paste | hybrid]

## Market Context

[Overall market landscape for this campaign's topic area]

| Insight | Confidence | Source |
|---------|-----------|--------|
| [insight] | HIGH/MEDIUM/LOW | [source or "user-provided"] |

## Competitor Content Analysis

[What competitors are saying/doing in this space]

| Competitor | Content Type | Key Message | Gap/Opportunity |
|-----------|-------------|-------------|-----------------|
| [name] | [type] | [message] | [gap] |

## Audience Insights

[What the target ICP cares about in this topic area]

| Insight | Confidence | Source |
|---------|-----------|--------|
| [insight] | HIGH/MEDIUM/LOW | [source] |

## Ambient Narrative

[What the market already believes about this topic -- the default frame]

## Content Gaps

[Opportunities where no one is producing quality content]

| Gap | Opportunity Size | Difficulty |
|-----|-----------------|------------|
| [gap] | HIGH/MEDIUM/LOW | HIGH/MEDIUM/LOW |

## Research Summary

[2-3 sentence summary for /ttm-brief to consume quickly]
```

### Tool Availability Detection (research.md pattern)

```markdown
## Web Search Detection

Attempt a minimal WebSearch call. If the tool is available in this runtime:

Try: Use WebSearch with query "[campaign topic] site:reddit.com OR site:ycombinator.com"

If WebSearch succeeds:
  Set SEARCH_MODE=web
  Proceed with automated SERP analysis

If WebSearch is not available or fails:
  Set SEARCH_MODE=manual
  Tell user:
  "Web search tools are not available in this session.
   To get the best research, please paste:
   1. Google search results for: [suggested queries]
   2. Any competitor blog posts or landing pages
   3. Reddit/forum discussions about [topic]

   Paste your findings and I'll analyze them."
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hard-blocking enforcement gates | Soft gates with prominent warnings (D-05) | This phase (user decision) | Users retain control; warnings are visible but not obstructive |
| Strict sequential phase ordering | Guided ordering with override (D-08) | This phase (user decision) | Respects user judgment; prevents workflow friction |
| Separate state file per concern | Single per-campaign STATE.md with flat frontmatter | This phase (design decision) | Simpler file management; one file to read for campaign status |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WebSearch/WebFetch MCP tools are available in some but not all Claude Code environments | Architecture Patterns (Pattern 3) | If always available, the manual paste fallback is unnecessary complexity; if never available, the web search path is dead code |
| A2 | Windows symlinks require admin privileges, making them unreliable for cross-platform skills | Architecture Patterns (Pattern 2) | If Windows has fixed symlink permissions, symlinks become a viable option for reference file access |
| A3 | The existing `parseFrontmatter()` cannot handle nested YAML objects | Common Pitfalls (Pitfall 2) | If it can, the dot-notation flattening is unnecessary |

## Open Questions (RESOLVED)

1. **Campaign state subcommand scope**
   - What we know: `ttm-tools.cjs state read/update` operates on global `.marketing/STATE.md`. Campaign state is at `.marketing/CAMPAIGNS/<slug>/STATE.md`.
   - RESOLVED: Add a `campaign` subcommand with sub-subcommands (`campaign init <slug> <name>`, `campaign state <slug>`, `campaign update <slug> <field> <value>`). This keeps the API clean and separates concerns. Implemented in Plan 03-01 Task 1.

2. **Global STATE.md update on campaign creation**
   - What we know: Global `.marketing/STATE.md` has frontmatter fields `current_campaign` and `campaigns` (array). Per-campaign STATE.md tracks individual campaign state.
   - RESOLVED: Yes. The new-campaign workflow (Plan 03-02 Task 1 Step 5) updates global STATE.md `campaigns` list and `current_campaign` after campaign directory creation.

3. **Research depth vs. context budget**
   - What we know: Context loading strategy budgets ~2,000 tokens for Tier 1 summaries. Research workflow loads Tier 2 for COMPETITORS.md.
   - RESOLVED: Keep research workflow focused. Generate RESEARCH.md output to be consumable in under 3,000 tokens so /ttm-brief can load it without context pressure. Applied as a guideline in Plan 03-02 Task 2.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node --test` (or manual validation) |
| Config file | none -- see Wave 0 |
| Quick run command | `node bin/ttm-tools.cjs campaign init test-campaign "Test Campaign" && node bin/ttm-tools.cjs campaign state test-campaign` |
| Full suite command | Manual: run all 3 commands end-to-end and verify output files |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIFE-01 | `/ttm-new-campaign` creates scaffold | smoke | `ls .marketing/CAMPAIGNS/<slug>/STATE.md .marketing/CAMPAIGNS/<slug>/BRIEF.md .marketing/CAMPAIGNS/<slug>/RESEARCH.md .marketing/CAMPAIGNS/<slug>/ASSETS/` | Wave 0 |
| LIFE-02 | `/ttm-research` generates structured RESEARCH.md | smoke | `grep "## Market Context" .marketing/CAMPAIGNS/<slug>/RESEARCH.md` | Wave 0 |
| LIFE-03 | `/ttm-brief` generates brief with all mandatory fields | smoke | `grep "## Outcome Metric" .marketing/CAMPAIGNS/<slug>/BRIEF.md && grep "## Positioning Anchor" .marketing/CAMPAIGNS/<slug>/BRIEF.md` | Wave 0 |
| LIFE-04 | Brief enforces outcome metric | manual-only | Run /ttm-brief, skip outcome metric, verify re-prompt | Manual -- AI judgment-based |
| LIFE-05 | Brief runs positioning check | smoke | `grep "gate.positioning_check" .marketing/CAMPAIGNS/<slug>/STATE.md` | Wave 0 |

### Sampling Rate
- **Per task commit:** Verify new/changed files exist and have expected structure
- **Per wave merge:** Run all 3 commands sequentially on a test campaign
- **Phase gate:** Full end-to-end: new-campaign -> research -> brief with all gates passing

### Wave 0 Gaps
- [ ] `tests/test-campaign-cli.sh` -- bash script testing `campaign init/state/update` subcommands
- [ ] No test framework installed -- manual verification via bash commands

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A -- local filesystem skill |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A -- single-user, local files |
| V5 Input Validation | yes | Slug sanitization via `/[^a-z0-9]+/g` in slug.cjs; path traversal prevention via `path.resolve()` check in state.cjs |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via campaign slug | Tampering | Slug sanitization strips all non-alphanumeric chars [VERIFIED: slug.cjs line 23] |
| Arbitrary file write via campaign name | Tampering | `safeWriteFile` uses `path.resolve()`, slug is sanitized [VERIFIED: core.cjs] |
| Content injection via pasted research | Information Disclosure | Low risk -- content stays in local `.marketing/` files, never executed |

## Sources

### Primary (HIGH confidence)
- Local codebase inspection: `bin/ttm-tools.cjs`, `bin/lib/core.cjs`, `bin/lib/state.cjs`, `bin/lib/slug.cjs`, `bin/lib/health.cjs` -- verified all CLI capabilities and limitations
- Local codebase inspection: `templates/campaign-brief.md` -- verified brief template structure
- Local codebase inspection: `references/context-loading.md` -- verified two-tier loading strategy and workflow-to-reference matrix
- Local codebase inspection: `workflows/setup/init.md` -- verified Phase 2 workflow pattern (AskUserQuestion, text-mode, template-guided generation)
- Local codebase inspection: `skills/ttm-new-campaign/SKILL.md`, `skills/ttm-research/SKILL.md`, `skills/ttm-brief/SKILL.md` -- verified stub content and allowed-tools
- Local codebase inspection: `gates/base-gates.md` -- verified gate definitions (GATE-01 positioning drift is Tier 1 blocking)
- Local codebase inspection: `templates/reference-files/positioning.md` -- verified _SUMMARY structure for positioning check

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions D-01 through D-10 -- user decisions from discuss phase

### Tertiary (LOW confidence)
- WebSearch/WebFetch MCP tool availability across Claude Code environments (A1)
- Windows symlink behavior (A2)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all technologies are already in use from Phase 1/2, no new dependencies
- Architecture: HIGH -- patterns directly extend established Phase 2 patterns, all building blocks verified in codebase
- Pitfalls: HIGH -- identified from direct codebase inspection (frontmatter parser limitations, state file separation)

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (stable -- no external dependencies, all patterns are internal)
