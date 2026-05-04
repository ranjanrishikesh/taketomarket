# Phase 2: Onboarding Interview - Research

**Researched:** 2026-04-22
**Domain:** Claude Code skill workflow design, interactive questioning patterns, Markdown file generation
**Confidence:** HIGH

## Summary

Phase 2 implements the `/ttm-init` onboarding interview -- a multi-step guided conversation that collects product, brand, audience, channel, competitor, and metrics data from the user, then generates all 9 `.marketing/` reference files plus CLAUDE.md and AGENTS.md instruction files. The entire implementation is a Markdown workflow file (`workflows/setup/init.md`) that the existing `skills/ttm-init/SKILL.md` stub already routes to.

The core challenge is designing an interview that extracts high-specificity answers from users who tend to give vague marketing-speak. The workflow must validate each answer for specificity before accepting it, re-prompting when answers are too generic. This is a pure prompt-engineering problem -- there is no library or framework involved. The "technology" is the AskUserQuestion tool for structured prompts (with text-mode fallback for Codex), the Write tool for file generation, and the existing `bin/ttm-tools.cjs` for deterministic operations (timestamps, state updates, health checks).

Phase 1 already created all 9 reference file templates (`templates/reference-files/*.md`) with `_SUMMARY`/`END_SUMMARY` two-tier structure, the `skills/ttm-init/SKILL.md` stub routing to `workflows/setup/init.md`, the `bin/ttm-tools.cjs` CLI with init/state/health subcommands, and the `templates/claude-md.md` and `templates/agents-md.md` instruction templates. Phase 2 fills in the workflow logic that connects all of these.

**Primary recommendation:** Structure the workflow as a sequential interview with 6 topic sections (Product/Positioning, Brand/Voice, ICP/Audience, Channels, Competitors, Metrics/Calendar), each using AskUserQuestion for structured choices and inline freeform questions for open-ended data. Include specificity validation after each section that checks for banned vague phrases and re-prompts with concrete examples when needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ONBD-01 | `/ttm-init` interview generates POSITIONING.md with specificity validation | Workflow Section 1 (Product/Positioning) with vague-answer rejection pattern |
| ONBD-02 | Generates BRAND.md (voice archetype, tone, banned words, proof points, examples) | Workflow Section 2 (Brand/Voice) collecting voice attributes and examples |
| ONBD-03 | Generates ICP.md (primary segment, JTBD, pains, triggers, anti-ICP, language library) | Workflow Section 3 (ICP/Audience) with anti-ICP and customer language |
| ONBD-04 | Generates CHANNELS.md (active, baselines, dormant, banned, budget) | Workflow Section 4 (Channels) with channel status categorization |
| ONBD-05 | Generates STATE.md (initialized state) | Deterministic generation -- minimal interview, mostly template fill |
| ONBD-06 | Generates METRICS.md (outcome metric, secondary, leading, baselines, attribution) | Workflow Section 6 (Metrics) with outcome-first ordering |
| ONBD-07 | Generates COMPETITORS.md (direct competitors, positioning map, SOV baseline) | Workflow Section 5 (Competitors) with positioning map axes |
| ONBD-08 | Generates CALENDAR.md (quarterly themes, launches, cadence, blackout dates) | Workflow Section 6 (Calendar) with scheduling context |
| ONBD-09 | Generates LEARNINGS.md (initialized empty with taxonomy) | Deterministic generation -- no interview needed, template copy |
| ONBD-10 | POSITIONING.md structured checklist format | Template already defines format; workflow ensures data quality |
| ONBD-11 | Validates specificity of generated reference files | Specificity validation pattern with banned-phrase list |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Interview orchestration | Skill workflow (Markdown) | -- | The workflow file contains all interview logic; Claude executes it |
| User interaction | AskUserQuestion tool | Inline freeform prompts | Structured choices via AskUserQuestion, open-ended via inline questions |
| Specificity validation | Skill workflow (prompt logic) | -- | Validation is prompt-level: Claude checks answers against criteria within the workflow |
| File generation | Write tool | bin/ttm-tools.cjs | Write generates reference files; ttm-tools handles timestamps, state updates |
| Directory scaffolding | bin/ttm-tools.cjs | Bash(mkdir) | .marketing/ and CAMPAIGNS/ created via ttm-tools or direct mkdir |
| State tracking | bin/lib/state.cjs | -- | STATE.md updates via cmdStateUpdate |
| Health verification | bin/lib/health.cjs | -- | Post-init validation via cmdHealth |

## Standard Stack

### Core
| Technology | Version | Purpose | Why Standard |
|------------|---------|---------|--------------|
| SKILL.md workflow | Current | Interview orchestration and file generation | Only mechanism for Claude Code skill behavior [VERIFIED: Claude Code skills docs] |
| AskUserQuestion | Built-in tool | Structured multi-choice user prompts | Native Claude Code tool for interactive skills [VERIFIED: GSD workflows] |
| Write tool | Built-in tool | Generate reference files in .marketing/ | File creation is the primary output of this phase |
| Read tool | Built-in tool | Read templates from templates/reference-files/ | Templates provide structure for generated files |
| Bash tool | Built-in tool | Run ttm-tools.cjs commands | Timestamps, state updates, health checks |

### Supporting
| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| bin/ttm-tools.cjs | 0.1.0 | Deterministic operations | Timestamps, init status check, state updates, health validation |
| templates/reference-files/*.md | Phase 1 | File structure templates | Read as structural guide for generating each reference file |
| templates/claude-md.md | Phase 1 | CLAUDE.md template | Copy to user's project root during init |
| templates/agents-md.md | Phase 1 | AGENTS.md template | Copy to user's project root during init |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AskUserQuestion | Pure inline freeform questions | Loses structured choices, but works on all runtimes without text-mode fallback |
| Sequential interview | All-at-once data dump | Faster but loses guided specificity validation; users skip sections |
| Per-section validation | End-of-interview validation | Per-section catches vague answers before they compound |

## Architecture Patterns

### System Architecture Diagram

```
User invokes /ttm-init
        |
        v
skills/ttm-init/SKILL.md (entry point, ~20 lines)
        |
        | reads workflow via @reference
        v
workflows/setup/init.md (full interview workflow, ~400 lines)
        |
        +---> [1] Pre-flight check
        |       |
        |       +---> ttm-tools.cjs init (check if already initialized)
        |       +---> ttm-tools.cjs health (check directory state)
        |
        +---> [2] Interview Loop (6 sections)
        |       |
        |       +---> AskUserQuestion (structured) / inline (freeform)
        |       +---> Specificity validation per section
        |       +---> Re-prompt if vague (up to 2 retries)
        |       |
        |       +--- Section 1: Product & Positioning
        |       +--- Section 2: Brand & Voice
        |       +--- Section 3: ICP & Audience
        |       +--- Section 4: Channels
        |       +--- Section 5: Competitors
        |       +--- Section 6: Metrics & Calendar
        |
        +---> [3] File Generation
        |       |
        |       +---> Read templates/reference-files/*.md (structure reference)
        |       +---> Write .marketing/POSITIONING.md (from Section 1 data)
        |       +---> Write .marketing/BRAND.md (from Section 2 data)
        |       +---> Write .marketing/ICP.md (from Section 3 data)
        |       +---> Write .marketing/CHANNELS.md (from Section 4 data)
        |       +---> Write .marketing/STATE.md (initialized template)
        |       +---> Write .marketing/METRICS.md (from Section 6 data)
        |       +---> Write .marketing/COMPETITORS.md (from Section 5 data)
        |       +---> Write .marketing/CALENDAR.md (from Section 6 data)
        |       +---> Write .marketing/LEARNINGS.md (empty taxonomy template)
        |       +---> Write CLAUDE.md (from templates/claude-md.md)
        |       +---> Write AGENTS.md (from templates/agents-md.md)
        |
        +---> [4] Post-init validation
                |
                +---> ttm-tools.cjs health (verify all files exist)
                +---> ttm-tools.cjs state update status initialized
                +---> Display summary of what was created
```

### Recommended Project Structure

```
workflows/
  setup/
    init.md              # Full interview workflow (~400 lines)
    init-questions.md     # Question bank with specificity criteria (supporting file)
    init-validation.md    # Specificity validation rules (supporting file)
```

### Pattern 1: AskUserQuestion with Text-Mode Fallback

**What:** Use AskUserQuestion for structured prompts, with automatic fallback to numbered lists when running in non-Claude runtimes (Codex, Gemini CLI).
**When to use:** Every structured choice point in the interview.
**Example:**

```markdown
**Text mode detection:** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
AskUserQuestion call with a plain-text numbered list and ask the user to type
their choice number.

Use AskUserQuestion:
- header: "Product Category"
- question: "What category does your product compete in?"
- options:
  - "SaaS / Software" -- Software product or service
  - "E-commerce / DTC" -- Direct-to-consumer physical product
  - "Professional Services" -- Agency, consulting, or services business
  - "Developer Tools" -- Tools for software developers
  - "Other" -- Something else (you'll describe it)
```

Source: GSD's new-project.md and profile-user.md workflows [VERIFIED: local filesystem inspection]

### Pattern 2: Specificity Validation with Re-prompt

**What:** After each interview section, validate that answers meet specificity criteria. Reject vague answers with concrete examples of what "specific enough" looks like.
**When to use:** POSITIONING.md differentiator, ICP pain points, brand voice attributes, proof points.
**Example:**

```markdown
## Specificity Validation Rules

After collecting positioning data, validate:

1. **Primary differentiator** must NOT contain these vague phrases:
   - "best in class", "industry-leading", "innovative", "cutting-edge",
   - "next-generation", "world-class", "state-of-the-art", "premier"

2. **Target audience** must specify at least 2 of: role, company size, industry, geography

3. **Proof points** must each have a verifiable source (number, case study, benchmark)

4. **Must-not-say terms** must have reasoning for each banned term

If validation fails, re-prompt with:
"Your [field] is too vague. Here's what specific looks like:
  - Vague: 'Best project management tool for teams'
  - Specific: 'The only PM tool that auto-generates sprint plans from Slack conversations for remote engineering teams of 10-50'
Please try again with more specificity."

Allow up to 2 re-prompts before accepting with a warning flag in the generated file.
```

Source: ONBD-11 requirement and marketing best practices [ASSUMED]

### Pattern 3: Template-Guided Generation

**What:** Read templates as structural reference, then fill with interview data rather than building files from scratch.
**When to use:** Every reference file generation step.
**Example:**

```markdown
## File Generation

For each reference file:
1. Read the corresponding template: `@templates/reference-files/{filename}.md`
2. Use the template structure (headings, tables, sections) as the skeleton
3. Fill `[GENERATED BY /ttm-init]` placeholders with interview data
4. Preserve the `_SUMMARY`/`END_SUMMARY` markers for two-tier context loading
5. Write to `.marketing/{FILENAME}.md`
```

Source: Phase 1 templates [VERIFIED: local filesystem inspection]

### Pattern 4: Interview Section Ordering

**What:** Order interview sections so earlier answers inform later questions. Positioning comes first because it constrains everything downstream.
**When to use:** Defining the interview flow.

```
Section 1: Product & Positioning (defines the frame)
  -> Informs Section 2 (brand voice matches positioning)
Section 2: Brand & Voice
  -> Informs Section 3 (ICP language should match voice)
Section 3: ICP & Audience
  -> Informs Section 4 (channels based on where ICP lives)
Section 4: Channels
  -> Informs Section 5 (competitors in same channels)
Section 5: Competitors
  -> Informs Section 6 (metrics based on competitive landscape)
Section 6: Metrics & Calendar
```

Source: Marketing strategy sequencing [ASSUMED]

### Anti-Patterns to Avoid

- **Monolithic interview:** Do NOT put all questions in one block. Users fatigue and give low-quality answers after ~10 minutes. Break into sections with visible progress.
- **Accepting first answer:** Do NOT accept vague positioning like "we help businesses grow." Always validate.
- **Generating files independently:** Do NOT generate each file in isolation. Positioning data from Section 1 should influence how ICP is framed in Section 3.
- **Hardcoded file content:** Do NOT write file content as string literals in the workflow. Use templates as structural references.
- **Skipping pre-flight:** Do NOT start the interview without checking if `.marketing/` already exists. Offer to overwrite or skip sections.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timestamps in generated files | String concatenation for dates | `ttm-tools.cjs timestamp` | Deterministic, consistent format across all files |
| State updates after init | Manual STATE.md editing | `ttm-tools.cjs state update` | Atomic writes with frontmatter preservation |
| Post-init health check | Custom file existence checks | `ttm-tools.cjs health` | Already validates all 9 reference files + directories |
| Init status detection | Read .marketing/ manually | `ttm-tools.cjs init` | Returns structured JSON with file count and status |
| Frontmatter parsing | Regex-based YAML parsing | `core.cjs parseFrontmatter/serializeFrontmatter` | Handles edge cases (quotes, colons, Windows line endings) |

**Key insight:** All deterministic operations already exist in `bin/ttm-tools.cjs` from Phase 1. The workflow should shell out to these tools rather than duplicating logic.

## Common Pitfalls

### Pitfall 1: Vague Positioning Accepted as Valid
**What goes wrong:** User says "We're the best solution for modern teams" and the workflow accepts it, producing a POSITIONING.md that fails every downstream quality gate.
**Why it happens:** No validation criteria defined; the workflow treats any non-empty answer as valid.
**How to avoid:** Define a banned-phrase list and structural requirements (differentiator must contain a specific mechanism or capability, not just an adjective). Require proof points with sources.
**Warning signs:** POSITIONING.md primary differentiator contains words like "innovative," "best," "leading," "revolutionary."

### Pitfall 2: Interview Fatigue Leading to Low-Quality Later Sections
**What goes wrong:** User gives detailed positioning answers but rushes through competitors and metrics with minimal data.
**Why it happens:** 6 sections with deep questions is mentally taxing. Users lose patience.
**How to avoid:** Make later sections lighter. Competitors and Calendar can accept minimal data with a "you can update this later with `/ttm-competitor-scan`" note. Metrics section should default to common models.
**Warning signs:** Last 2-3 reference files have mostly placeholder data.

### Pitfall 3: Generated Files Don't Match Template Structure
**What goes wrong:** Claude generates files that deviate from the template's table structures, section headers, or `_SUMMARY`/`END_SUMMARY` markers, breaking downstream two-tier loading.
**Why it happens:** The workflow doesn't explicitly reference templates during generation, relying on Claude's general knowledge.
**How to avoid:** Workflow must explicitly instruct: "Read the template file first, then fill in the placeholders while preserving all structural elements including `_SUMMARY`/`END_SUMMARY` comment markers."
**Warning signs:** Reference files missing `_SUMMARY` markers, different heading hierarchy than templates.

### Pitfall 4: Overwriting Existing .marketing/ Without Warning
**What goes wrong:** User runs `/ttm-init` on a project that already has reference files, and they're silently overwritten.
**Why it happens:** No pre-flight check for existing initialization.
**How to avoid:** First step: run `ttm-tools.cjs init` to check status. If initialized, ask user whether to overwrite, merge, or cancel.
**Warning signs:** Running init twice loses customizations made to reference files.

### Pitfall 5: AskUserQuestion Not Available in Codex
**What goes wrong:** Interview crashes because Codex doesn't support the AskUserQuestion tool.
**Why it happens:** AskUserQuestion is Claude Code-specific.
**How to avoid:** Implement text-mode fallback for every AskUserQuestion call. Detect runtime or `--text` flag, present numbered lists instead.
**Warning signs:** Skill fails silently on non-Claude runtimes.

### Pitfall 6: Workflow File Exceeds 500-Line Limit
**What goes wrong:** The interview workflow becomes a massive monolithic file that violates FOUND-03 (no file exceeds 500 lines).
**Why it happens:** 6 interview sections + validation + generation + pre/post flight is a lot of content.
**How to avoid:** Split into main workflow + supporting files. Main `init.md` handles flow control (~300 lines). Supporting files `init-questions.md` and `init-validation.md` hold question banks and validation rules. Reference them via `@` syntax.
**Warning signs:** Single file approaching 400+ lines.

## Code Examples

### Example 1: Pre-flight Check Pattern

```markdown
## Step 1: Pre-flight

Run init status check:
!`node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw`

**If result is "initialized":**

Use AskUserQuestion:
- header: "Already Initialized"
- question: ".marketing/ already contains reference files. What would you like to do?"
- options:
  - "Start fresh" -- Delete existing files and re-run the full interview
  - "Update specific files" -- Choose which reference files to regenerate
  - "Cancel" -- Exit without changes

**If "Start fresh":** Continue to Step 2.
**If "Update specific files":** Present file picker, then run only those interview sections.
**If "Cancel":** Exit.

**If result is "not initialized":**

Create the .marketing/ directory structure:
```bash
mkdir -p .marketing/CAMPAIGNS
mkdir -p .marketing/PLAYBOOKS
```

Continue to Step 2.
```

Source: Pattern derived from ttm-tools.cjs init command [VERIFIED: local inspection of health.cjs]

### Example 2: Positioning Interview Section

```markdown
## Section 1: Product & Positioning

Ask inline (freeform):
"Tell me about your product or service. What does it do, and who is it for?"

Wait for response. Use their answer to ask targeted follow-ups.

Use AskUserQuestion:
- header: "Category"
- question: "Based on what you described, which category best fits?"
- options:
  - "[inferred category 1]"
  - "[inferred category 2]"
  - "None of these -- I'll describe it"

Ask inline (freeform):
"What's the ONE thing your product does that competitors don't?
Not a general advantage -- a specific capability or mechanism."

**Specificity check on differentiator:**
If the answer contains any of: "best", "leading", "innovative", "cutting-edge",
"next-generation", "world-class", "state-of-the-art", "premier", "unique",
"revolutionary", "game-changing", "disruptive":

Re-prompt:
"That sounds like marketing copy, not a differentiator. Let me give you an example:
- Vague: 'The most innovative project management tool'
- Specific: 'Auto-generates sprint plans from Slack conversations'
What specific mechanism or capability sets you apart?"

Ask inline (freeform):
"Give me 3 proof points -- specific numbers, case studies, or benchmarks
that back up your differentiator. Each needs a source."

Ask inline (freeform):
"What terms or phrases should we NEVER use in our marketing? Why?"
```

Source: ONBD-01, ONBD-10 requirements [VERIFIED: REQUIREMENTS.md]

### Example 3: File Generation Pattern

```markdown
## Step 8: Generate Reference Files

### POSITIONING.md

Read the template for structure reference:
Read file: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/positioning.md`

Generate `.marketing/POSITIONING.md` using the template structure.
Fill all `[GENERATED BY /ttm-init]` placeholders with data from Section 1.

**Critical structural requirements:**
1. Preserve `<!-- _SUMMARY: ... -->` and `<!-- END_SUMMARY -->` comment markers exactly
2. Summary section must be under 200 words
3. Include all table structures from template
4. Set Positioning History date to current date via:
   !`node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw`

Write the file to `.marketing/POSITIONING.md`.

[Repeat pattern for each of the 9 reference files]
```

Source: Phase 1 templates [VERIFIED: local filesystem inspection]

### Example 4: Post-Init Validation

```markdown
## Step 9: Post-Init Validation

Run health check:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs health
```

Parse the JSON result. All checks should be "pass".

If any check is "fail" or "missing":
- Report which files failed
- Attempt to regenerate failed files
- Re-run health check

Update state:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update status initialized
```

Display summary:
```
takeToMarket initialized successfully!

Reference files created:
  .marketing/POSITIONING.md
  .marketing/BRAND.md
  .marketing/ICP.md
  .marketing/CHANNELS.md
  .marketing/STATE.md
  .marketing/METRICS.md
  .marketing/COMPETITORS.md
  .marketing/CALENDAR.md
  .marketing/LEARNINGS.md

Instruction files created:
  CLAUDE.md
  AGENTS.md

Next step: Run /ttm-new-campaign to create your first campaign.
```
```

Source: health.cjs cmdHealth implementation [VERIFIED: local inspection]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `.claude/commands/*.md` flat files | `.claude/skills/<name>/SKILL.md` directories | 2025 (Claude Code skills launch) | Skills support frontmatter, supporting files, subagent execution |
| Manual template filling | Interview-driven generation | Design decision for takeToMarket | Lower barrier to entry; specificity validation impossible with manual fill |
| Single instruction file | Dual-runtime CLAUDE.md + AGENTS.md | Current | Codex reads AGENTS.md, Claude Code reads CLAUDE.md |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Interview should be ordered: Positioning -> Brand -> ICP -> Channels -> Competitors -> Metrics/Calendar | Architecture Patterns (Pattern 4) | Low -- sections can be reordered without structural impact |
| A2 | 2 re-prompts before accepting with warning is the right retry limit | Architecture Patterns (Pattern 2) | Medium -- too few means vague data gets through; too many frustrates users |
| A3 | Banned-phrase list for specificity validation covers the most common vague marketing terms | Architecture Patterns (Pattern 2) | Low -- list can be extended; false positives are unlikely for these terms |
| A4 | Interview can be completed in under 15 minutes for most users | Common Pitfalls (Pitfall 2) | Medium -- if too long, users abandon; need to test real-world timing |
| A5 | Supporting files (init-questions.md, init-validation.md) will keep main workflow under 500 lines | Common Pitfalls (Pitfall 6) | Medium -- if workflow still too large, may need further decomposition |

## Open Questions

1. **Should `/ttm-init` support a `--quick` mode?**
   - What we know: Full interview is 6 sections and could take 10-15 minutes. Some users may want a minimal setup.
   - What's unclear: What's the minimum viable set of reference files? POSITIONING.md + BRAND.md + ICP.md seem essential; others could be filled later.
   - Recommendation: Implement full interview first, add `--quick` mode if user feedback demands it. Not required for ONBD-* requirements.

2. **How should the workflow handle partial completion (user exits mid-interview)?**
   - What we know: Claude Code sessions can be interrupted. The workflow has no built-in save/resume mechanism.
   - What's unclear: Should partially completed sections be saved? Or should the user restart?
   - Recommendation: Generate files only after all sections complete. If interrupted, user re-runs `/ttm-init`. State remains "not initialized" until all files are written.

3. **Should generated CLAUDE.md/AGENTS.md be customized with positioning summary?**
   - What we know: Templates are static files with generic rules. Could inject positioning summary for stronger enforcement.
   - What's unclear: Whether injecting dynamic content into CLAUDE.md provides measurable benefit vs. just loading POSITIONING.md at runtime.
   - Recommendation: Start with static templates. POSITIONING.md is already loaded into every phase context via two-tier loading. Dynamic CLAUDE.md is a future optimization.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in test runner (node:test) or manual verification |
| Config file | none -- see Wave 0 |
| Quick run command | `node bin/ttm-tools.cjs health --raw` |
| Full suite command | `node bin/ttm-tools.cjs health` (JSON output with all checks) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ONBD-01 | POSITIONING.md generated with specificity validation | manual-only | Manual: run /ttm-init and verify output | N/A |
| ONBD-02 | BRAND.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` (checks file exists) | Partial (health check) |
| ONBD-03 | ICP.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-04 | CHANNELS.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-05 | STATE.md generated with valid frontmatter | unit | `node bin/ttm-tools.cjs state read --raw` | Existing (state.cjs) |
| ONBD-06 | METRICS.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-07 | COMPETITORS.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-08 | CALENDAR.md generated with required fields | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-09 | LEARNINGS.md generated with taxonomy structure | smoke | `node bin/ttm-tools.cjs health --raw` | Partial |
| ONBD-10 | POSITIONING.md structured checklist format | manual-only | Manual: inspect generated file structure | N/A |
| ONBD-11 | Specificity validation rejects vague outputs | manual-only | Manual: test with vague input during interview | N/A |

### Sampling Rate
- **Per task commit:** `node bin/ttm-tools.cjs health --raw` (confirms file structure)
- **Per wave merge:** Full manual `/ttm-init` run with test data
- **Phase gate:** Complete `/ttm-init` run producing all 9 files + CLAUDE.md + AGENTS.md

### Wave 0 Gaps
- [ ] `tests/test-init-validation.cjs` -- unit tests for specificity validation helper (if extracted to bin/lib/)
- [ ] Manual test script documenting exact test inputs and expected outputs for each interview section

**Note:** This phase is primarily a prompt-engineering / workflow design phase. Most requirements (ONBD-01, ONBD-10, ONBD-11) can only be validated by running the actual skill in a Claude Code session. The existing `ttm-tools.cjs health` command serves as the automated smoke test for file existence and structure.

## Security Domain

Security is minimal for this phase -- it generates local Markdown files with no authentication, no network calls, no secrets, and no user data leaving the machine.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A |
| V3 Session Management | no | N/A |
| V4 Access Control | no | N/A |
| V5 Input Validation | yes (light) | Specificity validation on user answers; path traversal prevention in file writes (already in core.cjs) |
| V6 Cryptography | no | N/A |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal in file writes | Tampering | `path.resolve()` with project root check (already in state.cjs) |
| Overwriting critical project files | Tampering | Pre-flight check for existing .marketing/, user confirmation before overwrite |

## Sources

### Primary (HIGH confidence)
- Claude Code Skills Documentation (code.claude.com/docs/en/skills) -- Fetched 2026-04-22. Full SKILL.md spec, frontmatter fields, AskUserQuestion patterns, context: fork, dynamic context injection, allowed-tools behavior.
- Local filesystem inspection of Phase 1 outputs -- All 9 templates, SKILL.md stub, bin/ttm-tools.cjs and lib/*.cjs modules verified.
- GSD workflow inspection (~/.claude/get-shit-done/workflows/) -- new-project.md and profile-user.md verified for AskUserQuestion patterns, text-mode fallback, and multi-step interview flow.

### Secondary (MEDIUM confidence)
- GSD architectural patterns for interview-style workflows -- Verified through direct inspection of multiple GSD workflows using AskUserQuestion.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All tools are built-in Claude Code capabilities or Phase 1 deliverables, directly verified
- Architecture: HIGH -- Patterns derived from GSD's proven interview workflows with identical tool constraints
- Pitfalls: HIGH -- Each pitfall maps to a specific technical constraint or UX failure mode observed in similar workflows

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (stable -- skill architecture is mature)
