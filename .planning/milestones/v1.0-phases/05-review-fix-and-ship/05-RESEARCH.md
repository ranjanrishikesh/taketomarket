# Phase 5: Review, Fix, and Ship - Research

**Researched:** 2026-04-28
**Domain:** Claude Code skill authoring -- human review workflow, automated fix loop with re-production/re-verification, launch checklist generation
**Confidence:** HIGH

## Summary

Phase 5 delivers three commands (`/ttm-review`, `/ttm-fix`, `/ttm-ship`) that form the quality bridge between automated verification (Phase 4) and content launch. These commands complete the "human in the loop" portion of the campaign lifecycle, ensuring no asset ships without both automated gate verification AND human review.

The primary technical challenge is the fix loop: `/ttm-fix` must diagnose root causes from review feedback + gate failures, generate a targeted fix brief, re-produce the asset in an isolated `context: fork` + `Task()` context, and re-verify against all 10 gates -- all within a 3-attempt cap with escalation. This is the most complex orchestration in the system because it chains produce and verify patterns from Phase 4 into a loop with user interaction at each iteration.

The review workflow is interactive but structurally straightforward -- it reads VERIFICATION.md and MANIFEST.json, presents assets with a structured checklist, and collects per-asset outcomes (Approve/Revise/Reject). The ship workflow generates a dynamic launch checklist per campaign based on channel mix, performs automated checks where possible (UTM validation, tracking presence), and collects human confirmations for unverifiable items. All three commands follow the established thin-SKILL.md -> workflow routing pattern.

**Primary recommendation:** Build review.md as the anchor workflow (it sets up state that fix and ship consume), then fix.md (which reuses Phase 4's produce + verify patterns in a loop), then ship.md (standalone post-review workflow). Extend `campaign.cjs` ALLOWED_FIELDS with review/fix/ship state fields upfront to avoid blocking.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Guided + open feedback -- 4 required review questions (positioning reinforcement, outcome realism, claim substantiation, competitor differentiation) plus freeform notes. Questions are mandatory, notes optional.
- D-02: Hero-first, then batch review -- review hero in full detail first (anchors everything), then present derivatives in batch view with hero as reference.
- D-03: Three outcomes per asset: Approve (-> ship-ready), Revise (-> structured feedback routes to /ttm-fix), Reject (-> kill asset, log reason in campaign state, final, no fix loop).
- D-04: Summary + file link display -- show gate summary table + first ~500 chars, link to full file. User reads full file in editor, returns to review flow.
- D-05: AI analysis + user confirm for root cause -- Claude proposes root cause from LEARNINGS.md taxonomy, user confirms or corrects before fix brief generated.
- D-06: All 10 gates re-run every time after fix -- full re-verification catches regressions.
- D-07: Show each fix attempt to user -- after each fix+verify cycle, present result. User can intervene.
- D-08: At 3-attempt cap, escalate with suggested manual edits -- present all 3 attempts with diagnoses, fix briefs, gate results. Suggest specific manual edits. Asset enters 'needs-human-fix' status.
- D-09: Dynamic checklist per campaign -- checklist items based on channel mix, asset types, and brief.
- D-10: AI checks + human confirms -- Claude auto-checks what it can, presents results with checkboxes for manual confirmation.
- D-11: Per-asset ship status -- each asset shipped independently. Campaign tracks per-asset status (ship-ready, shipped, deferred).
- D-12: Structured feedback form on Revise -- reviewer answers: which checklist items failed, freeform notes, severity level. Structured data becomes fix brief input.
- D-13: Mixed outcomes in one review session -- approve hero, revise social post, reject email, all in one run.
- D-14: Auto-approve after successful fix -- if fix + re-verify passes all gates, auto-advance to ship-ready.
- D-15: Auto-trigger fix from review -- when user marks assets as 'Revise', automatically launch /ttm-fix at end of review session.

### Claude's Discretion
- Fix brief template structure -- design based on what the re-produce context needs
- Review checklist rendering (AskUserQuestion vs text output) -- follow existing pattern from Phase 4 verify
- Ship checklist item categories per channel -- derive from CHANNELS.md and playbook knowledge
- Campaign state schema extensions for review/fix/ship tracking fields

### Deferred Ideas
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIFE-10 | /ttm-review presents assets with structured review checklist (positioning reinforcement, outcome realism, claim substantiation, competitor differentiation) | Review workflow with 4-question checklist + gate summary table + file preview |
| LIFE-11 | /ttm-fix performs root cause -> fix brief -> re-produce in isolated context -> re-verify cycle | Fix loop using Task() for isolated re-production, verify.md invocation for re-verification |
| LIFE-12 | Fix phase capped at 3 attempts per asset before escalating to human | Fix loop counter in per-asset state, escalation display with 3 attempt histories |
| LIFE-13 | /ttm-ship generates launch checklist with tracking, UTMs, funnel, assets finalized | Dynamic checklist generation from channel mix, AI auto-checks + human confirms |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Zero npm dependencies -- skill files are Markdown read by the AI runtime; bin/ tools use Node.js built-ins only
- No single file exceeds 500 lines
- Thin SKILL.md -> workflow routing pattern (SKILL.md stays under 300 lines, workflows do the work)
- Two-tier context loading must be followed (Tier 1 summaries always, Tier 2 on demand)
- `context: fork` for fix's re-production (not review or ship -- they are interactive)
- `Task()` subagent API for re-production within the fix loop
- AskUserQuestion with text-mode fallback for interactive prompts
- State persistence via Markdown files in `.marketing/`
- `bin/ttm-tools.cjs` single entry point with subcommands for deterministic operations

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Review presentation | Workflow (review.md) | SKILL.md (entry) | Workflow reads VERIFICATION.md + MANIFEST.json, presents checklist, collects outcomes |
| Review feedback collection | Workflow (review.md) | AskUserQuestion | Workflow manages 4 required questions + freeform notes per asset |
| Root cause analysis | Workflow (fix.md) | LEARNINGS.md taxonomy | Workflow proposes root cause from taxonomy, user confirms |
| Fix brief generation | Workflow (fix.md) | templates/ | Workflow generates targeted brief from root cause + review feedback + gate failures |
| Re-production | Task() subagent | agents/ttm-producer.md | Same producer agent as Phase 4, loaded with fix brief instead of original brief |
| Re-verification | Task() or direct invoke | verify.md pattern | Fix workflow invokes full 10-gate evaluation on the fixed asset |
| Fix loop control | Workflow (fix.md) | bin/ttm-tools.cjs | Workflow manages attempt counter; CLI tracks state |
| Ship checklist generation | Workflow (ship.md) | CHANNELS.md + BRIEF.md | Workflow generates dynamic checklist from campaign's channel mix |
| Ship status tracking | bin/ttm-tools.cjs | Workflow | CLI handles per-asset ship status updates atomically |
| State updates | bin/ttm-tools.cjs | -- | Atomic frontmatter updates via campaign.cjs |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SKILL.md (no context:fork for review/ship) | Current | Entry point for /ttm-review and /ttm-ship | Review and ship are interactive -- they need the user's conversation context. No fork. [VERIFIED: existing ttm-review/SKILL.md stub has no context:fork] |
| SKILL.md (with Task for fix) | Current | Entry point for /ttm-fix | Fix needs Task() to spawn isolated re-production subagents. [VERIFIED: existing ttm-fix/SKILL.md stub has Task in allowed-tools] |
| Markdown workflows | N/A | review.md, fix.md, ship.md in workflows/lifecycle/ | Established pattern from Phases 1-4 [VERIFIED: codebase] |
| bin/ttm-tools.cjs | N/A | State updates for review/fix/ship status, per-asset tracking | Existing CLI utility extended with new fields [VERIFIED: codebase] |
| agents/ttm-producer.md | Existing | Reused by fix loop for re-production | Same production subagent, different brief input [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gates/base-gates.md + gate-evaluation.md | Existing | Re-verification during fix loop | Fix workflow re-runs all 10 gates after each re-production |
| templates/verification-report.md | Existing | Fix loop writes updated VERIFICATION.md after re-verify | Each fix attempt produces a new verification report |
| bin/lib/deviation.cjs | Existing | Deviation logging during fix re-verification | Same Accept+log pattern if re-verify produces Tier 1 failures |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inline re-verification in fix.md | Task() to invoke full /ttm-verify | Task() adds isolation but also adds complexity. Since fix already runs in the same context and just needs to evaluate gates, inline evaluation following verify.md's pattern is simpler and avoids double-forking. |
| Per-asset FIX-LOG.md files | Single FIX-LOG.md per campaign | Per-asset files would scatter across ASSETS/ directory. A single campaign-level FIX-LOG.md with per-asset sections is cleaner and easier to present at escalation. |
| context:fork on review/ship | No fork (current stubs) | Review and ship are interactive workflows that collect user input. Forking would break the conversation flow. Only fix needs Task() for isolated re-production. |

## Architecture Patterns

### System Architecture Diagram

```
User runs /ttm-review <slug>
        |
        v
[SKILL.md: NO fork -- interactive]
        |
        v
[review.md workflow]
        |
        +-- Step 1: Load context (VERIFICATION.md, MANIFEST.json, assets)
        +-- Step 2: Present hero asset with review checklist
        +-- Step 3: Collect hero outcome (Approve/Revise/Reject)
        +-- Step 4: Present derivative assets in batch
        +-- Step 5: Collect outcomes per derivative
        +-- Step 6: Update campaign state per asset
        +-- Step 7: Auto-trigger /ttm-fix for Revise assets (D-15)
        |
        v
[If any assets marked Revise]
        |
        v
User runs /ttm-fix <slug> (auto-triggered or manual)
        |
        v
[SKILL.md: NO fork, but uses Task()]
        |
        v
[fix.md workflow]
        |
        +-- Step 1: Load context (review feedback, VERIFICATION.md, BRIEF.md)
        +-- Step 2: For each "needs-fix" asset:
        |     +-- Root cause analysis (AI proposes, user confirms)
        |     +-- Generate fix brief (targeted at root cause)
        |     +-- Task(): Re-produce asset in isolated context
        |     +-- Re-verify against all 10 gates
        |     +-- Present result to user (D-07)
        |     +-- If passed: auto-approve to ship-ready (D-14)
        |     +-- If failed: increment attempt, loop (up to 3)
        |     +-- If 3 attempts exhausted: escalate (D-08)
        +-- Step 3: Update campaign state
        |
        v
User runs /ttm-ship <slug>
        |
        v
[SKILL.md: NO fork -- interactive]
        |
        v
[ship.md workflow]
        |
        +-- Step 1: Load context (CHANNELS.md, BRIEF.md, campaign state)
        +-- Step 2: Identify ship-ready assets
        +-- Step 3: Generate dynamic launch checklist per channel
        +-- Step 4: Auto-check verifiable items (UTMs, tracking, links)
        +-- Step 5: Present checklist with AI results + manual checkboxes
        +-- Step 6: User confirms/marks each item
        +-- Step 7: Per-asset ship status update (D-11)
        +-- Step 8: Campaign state -> shipped
```

### Recommended Project Structure (new/modified files)

```
workflows/lifecycle/
  review.md                    # NEW: Review workflow with structured checklist
  fix.md                       # NEW: Fix loop workflow with root cause analysis
  ship.md                      # NEW: Ship workflow with dynamic launch checklist

references/
  fix-brief-template.md        # NEW: Fix brief template for re-production context
  ship-checklist-items.md      # NEW: Channel-specific ship checklist item definitions

templates/
  fix-log.md                   # NEW: FIX-LOG.md template for fix attempt history

bin/lib/
  campaign.cjs                 # MODIFY: Extend ALLOWED_FIELDS for review/fix/ship state

skills/ttm-review/SKILL.md     # MODIFY: Update workflow pointer, confirm allowed-tools
skills/ttm-fix/SKILL.md        # MODIFY: Update workflow pointer, confirm allowed-tools
skills/ttm-ship/SKILL.md       # MODIFY: Update workflow pointer, confirm allowed-tools
```

### Pattern 1: Hero-First Then Batch Review (D-02)

**What:** Present the hero asset in full detail first (it anchors the campaign message), then present derivative assets in a batch view with the hero as reference point.

**When to use:** Every /ttm-review run with multi-asset campaigns.

**Example (workflow pseudocode):**
```markdown
## Step: Review Hero Asset

Display hero asset:
- Gate summary table from VERIFICATION.md (hero column)
- First ~500 chars of hero asset content
- Link to full file: ".marketing/CAMPAIGNS/${SLUG}/${HERO_FILE}"

Present 4 required review questions:
1. "Does this asset reinforce your positioning? (Yes/No + notes)"
2. "Is the outcome metric target realistic given this content? (Yes/No + notes)"
3. "Are all claims substantiated with approved proof points? (Yes/No + notes)"
4. "Does this clearly differentiate from competitors? (Yes/No + notes)"

Freeform notes: "Any additional feedback? (optional)"

Collect outcome: Approve / Revise / Reject

## Step: Batch Review Derivatives

For each derivative:
- Show abbreviated gate summary (PASS/WARN/FAIL counts only)
- Show first ~300 chars + file link
- "Hero asset for reference: ${HERO_FILE}"
- Same 4 questions (can be shorter-form in batch)
- Collect outcome per derivative
```

### Pattern 2: Fix Loop with Attempt Tracking (D-07, D-08, LIFE-12)

**What:** For each asset needing fix, run a loop of (root cause -> fix brief -> re-produce -> re-verify) up to 3 attempts, showing results to user at each iteration.

**When to use:** Every /ttm-fix run for assets marked as 'Revise' during review.

**Example (workflow pseudocode):**
```markdown
## Fix Loop for Asset: ${ASSET_NAME}

Read fix attempt count from FIX-LOG.md or campaign state.

WHILE attempt_count < 3 AND asset_status == "needs-fix":
  1. ROOT CAUSE ANALYSIS
     Load: review feedback (structured from D-12) + VERIFICATION.md failures + BRIEF.md
     Propose root cause from LEARNINGS.md taxonomy:
     - positioning-drift | weak-hook | wrong-channel | bad-timing
     - unverifiable-claim | broken-funnel | creative-fatigue
     Present to user: "Proposed root cause: [category] -- [explanation]. Confirm or correct?"

  2. GENERATE FIX BRIEF
     Create a targeted fix brief that includes:
     - Original brief sections (from CAMPAIGNS/<slug>/BRIEF.md)
     - Root cause diagnosis
     - Specific corrections needed (from review feedback + gate failures)
     - What to preserve (passing gate elements)
     - What to change (failing gate elements)

  3. RE-PRODUCE (Task() subagent)
     Use Task() with agents/ttm-producer.md
     Load: fix brief (NOT original brief) + positioning + brand + ICP + playbook
     Write to: same asset path (overwrite the failing version)

  4. RE-VERIFY (all 10 gates per D-06)
     Run gate evaluation loop from verify.md pattern
     Write updated VERIFICATION.md

  5. PRESENT RESULT (D-07)
     Show gate summary table for this attempt
     If all gates pass: "Fix successful! Auto-approving to ship-ready." (D-14)
     If gates still fail: "Attempt ${N}/3 failed. [Show failures]"
       Ask user: "Continue fixing / Approve anyway / Adjust feedback?"

  6. LOG ATTEMPT
     Append to FIX-LOG.md:
     - Attempt number, root cause, fix brief summary, gate results

IF attempt_count == 3 AND still failing (D-08):
  ESCALATE:
  - Display all 3 attempts with diagnoses, fix briefs, gate results
  - Suggest specific manual edits based on failure pattern
  - Set asset status to 'needs-human-fix'
  - "You can manually edit the file and re-run /ttm-verify ${SLUG}"
```

### Pattern 3: Dynamic Ship Checklist (D-09, D-10)

**What:** Generate a launch checklist dynamically based on the campaign's channel mix and asset types. AI checks what it can; human confirms the rest.

**When to use:** Every /ttm-ship run.

**Example (checklist structure):**
```markdown
## Launch Checklist: ${SLUG}

### Universal Checks (all campaigns)
- [AI] UTM parameters valid on all trackable links
- [AI] All asset files finalized (no draft markers)
- [AI] VERIFICATION.md shows pass/accepted for all gates
- [HUMAN] Tracking/analytics configured for outcome metric
- [HUMAN] Monitoring/alerts set up for campaign period

### SEO/Blog Checks (if blog-post in assets)
- [AI] Meta title and description present
- [AI] H1 matches positioning anchor
- [HUMAN] Schema markup deployed
- [HUMAN] Internal links added
- [HUMAN] Sitemap updated

### Email Checks (if email in assets)
- [AI] Subject line under 60 chars
- [AI] Unsubscribe link present
- [HUMAN] SPF/DKIM/DMARC configured
- [HUMAN] Dark mode rendering tested
- [HUMAN] Test send completed

### Social Checks (if social assets)
- [AI] Character limits respected
- [AI] No banned words present
- [HUMAN] Platform-specific image assets ready
- [HUMAN] Scheduling configured

### LinkedIn Checks (if linkedin-post in assets)
- [AI] No external link in first comment trap
- [HUMAN] Author profile optimized
```

### Pattern 4: Per-Asset Status Tracking (D-11, D-13)

**What:** Each asset has independent status that can differ within a campaign. One asset can be shipped while another is still being fixed.

**When to use:** All three workflows track per-asset status.

**State transitions per asset:**
```
produced -> verified -> [review outcome]:
  Approve  -> ship-ready -> shipped
  Revise   -> needs-fix -> [fix loop]:
                fixing -> [fix result]:
                  pass  -> ship-ready (auto-approve D-14)
                  fail  -> needs-fix (retry)
                  cap   -> needs-human-fix
  Reject   -> rejected (final)
```

**Campaign state tracks per-asset status in MANIFEST.json extensions or a REVIEW.md file.**

### Pattern 5: Structured Feedback on Revise (D-12)

**What:** When marking an asset as 'Revise', the reviewer fills a structured form that becomes the fix brief input.

**When to use:** Every Revise outcome in /ttm-review.

**Example:**
```markdown
## Structured Revision Feedback

Asset: ${ASSET_NAME}

### Failed Checklist Items
Select which review questions this asset failed:
  1. Positioning reinforcement
  2. Outcome realism
  3. Claim substantiation
  4. Competitor differentiation

### Severity
  1. Minor -- small adjustments needed
  2. Major -- significant rewrite of specific sections
  3. Critical -- fundamental approach is wrong

### Specific Feedback
"What specifically needs to change?"
[Freeform text -- this becomes part of the fix brief]
```

### Anti-Patterns to Avoid

- **Forking review or ship workflows:** Review and ship are interactive -- they need the user's conversation context for AskUserQuestion. Only the fix loop's re-production step needs Task() isolation.
- **Re-running only failed gates during fix:** A fix for one issue could introduce another (e.g., fixing a weak hook might introduce positioning drift). All 10 gates must re-run per D-06.
- **Losing fix attempt history:** Each attempt's root cause, fix brief, and gate results must persist for the escalation display. Never overwrite attempt history.
- **Blocking on rejected assets:** Reject is final -- no fix loop, no retry. Log the rejection reason and move on.
- **Ship without review:** The ship workflow must check that all assets have been reviewed (Approve or fix-then-auto-approve). Assets still in 'needs-fix' or 'needs-human-fix' cannot ship.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Asset re-production | Custom production logic in fix.md | Task() with existing agents/ttm-producer.md | Producer agent is already designed for isolated context production. Fix just provides a different brief. |
| Gate re-evaluation | Custom gate logic in fix.md | Follow verify.md's gate evaluation pattern (load gate-evaluation.md, iterate 10 gates) | Gate evaluation is complex and already well-defined. Copy the pattern, don't reinvent it. |
| State field updates | Direct file writes in workflows | `bin/ttm-tools.cjs campaign update` | Atomic updates with timestamp, field validation, path security |
| Deviation logging | Manual DEVIATIONS.md writes | `bin/ttm-tools.cjs deviation append` | Consistent formatting, injection prevention, append-only guarantee |
| Timestamp generation | Inline date logic | `bin/ttm-tools.cjs timestamp` | Consistent ISO format |
| Root cause categories | Freeform text classification | LEARNINGS.md taxonomy (7 categories) | Fixed taxonomy enables pattern extraction in Phase 9's Learn phase |

**Key insight:** The fix workflow is primarily an orchestrator that chains existing capabilities (producer agent + gate evaluation) with new logic (root cause analysis, fix brief generation, attempt tracking). Maximize reuse of Phase 4 patterns.

## Common Pitfalls

### Pitfall 1: Fix Brief vs Original Brief Confusion

**What goes wrong:** The re-produce Task() subagent loads the original BRIEF.md instead of the fix brief, producing the same failing content again.
**Why it happens:** The producer agent template (`agents/ttm-producer.md`) has a `[BRIEF_PATH]` placeholder that normally points to `BRIEF.md`. During fix, it needs to point to the fix brief instead.
**How to avoid:** Generate the fix brief as a temporary file (e.g., `CAMPAIGNS/<slug>/FIX-BRIEF-<asset-id>.md`) and pass its path as `[BRIEF_PATH]` to the Task() call. The fix brief wraps the original brief with targeted corrections.
**Warning signs:** Re-produced asset is identical or nearly identical to the original.

### Pitfall 2: ALLOWED_FIELDS Blocking Review/Fix/Ship Updates

**What goes wrong:** Workflow tries to update campaign state with review/fix/ship fields but `campaign.cjs` rejects them.
**Why it happens:** Current ALLOWED_FIELDS only includes fields through Phase 4 (gates + verify). New fields for review outcomes, fix attempt counts, per-asset status, and ship status are not yet registered.
**How to avoid:** Extend ALLOWED_FIELDS with all Phase 5 fields BEFORE implementing any workflows. This is the same pitfall from Phase 4 (RESEARCH.md Pitfall 3) -- solve it first.
**Warning signs:** `Unknown state field` error during review/fix/ship execution.

### Pitfall 3: Fix Loop Infinite Regression

**What goes wrong:** Fix produces a new version that passes the originally-failing gate but fails a different gate. The next fix addresses the new failure but re-introduces the original failure. Loop continues until cap without progress.
**Why it happens:** Each fix brief targets one root cause without preserving what was already working.
**How to avoid:** The fix brief must explicitly list both what to change AND what to preserve. Include the complete list of passing gate results as "do not break these" constraints in the fix brief. The producer agent should treat preservation constraints as hard requirements.
**Warning signs:** Gate results oscillate between attempts (PASS -> FAIL -> PASS on the same gate).

### Pitfall 4: Auto-Trigger Fix Timing (D-15)

**What goes wrong:** Review workflow tries to auto-trigger /ttm-fix at the end of the review session, but the review session's state updates haven't been written yet. Fix starts with stale state.
**How to avoid:** Complete ALL state updates (per-asset outcomes, structured feedback writes) BEFORE triggering fix. The review workflow's last step is "update state", and auto-trigger fix is the step AFTER that. Use sequential execution -- never trigger fix until review state writes are confirmed.
**Warning signs:** Fix workflow cannot find revision feedback or shows wrong asset statuses.

### Pitfall 5: Per-Asset State Tracking Complexity

**What goes wrong:** Campaign STATE.md frontmatter becomes unwieldy with per-asset status fields for N assets.
**Why it happens:** Using flat frontmatter fields like `asset.01-blog-post.status = ship-ready` creates an explosion of fields for multi-asset campaigns.
**How to avoid:** Track per-asset status in MANIFEST.json (which already has per-asset structure) rather than in STATE.md frontmatter. STATE.md tracks campaign-level phase and aggregate status. MANIFEST.json is extended with a `status` field per asset entry. Alternatively, create a lightweight REVIEW.md file per campaign that stores per-asset outcomes.
**Warning signs:** STATE.md frontmatter exceeds 50+ fields, parsing becomes slow.

### Pitfall 6: Ship Checklist Completeness Without Playbooks

**What goes wrong:** Dynamic ship checklist tries to generate channel-specific items but no playbooks are loaded (Phase 8 content).
**Why it happens:** Phase 5 runs before Phase 8 (playbooks). Ship checklist items need channel-specific knowledge.
**How to avoid:** Define a `references/ship-checklist-items.md` reference file with base checklist items per channel type. This is a lookup table, not a playbook. Ship workflow reads channel mix from BRIEF.md, looks up applicable items from the reference file, and generates the checklist. Phase 8 playbooks can later extend these items, but the base set works without playbooks.
**Warning signs:** Ship checklist is generic/empty for channel-specific sections.

### Pitfall 7: Review Workflow Length (500-line limit)

**What goes wrong:** review.md exceeds 500 lines because it handles hero review, batch derivative review, structured feedback collection, outcome processing, state updates, and auto-trigger fix all in one file.
**Why it happens:** Review has the most user interaction of any workflow.
**How to avoid:** Use @-syntax references for structured content. Extract the review checklist questions into a reference file (e.g., `references/review-checklist.md`). Extract the structured revision feedback form into a reference file. Keep the workflow under 500 lines by delegating content to references.
**Warning signs:** Workflow file approaches or exceeds 500 lines during implementation.

## Code Examples

### Campaign State Field Extension (Phase 5)

```javascript
// Source: bin/lib/campaign.cjs -- ALLOWED_FIELDS needs extension for Phase 5
const ALLOWED_FIELDS = new Set([
  // ... existing Phase 1-4 fields ...

  // Phase 5: Review tracking
  'review.run_count', 'review.last_run', 'review.overall_result',

  // Phase 5: Fix tracking
  'fix.run_count', 'fix.last_run', 'fix.overall_result',

  // Phase 5: Ship tracking
  'ship.status', 'ship.shipped_at', 'ship.checklist_result',
]);
```
[VERIFIED: current ALLOWED_FIELDS pattern from codebase inspection of bin/lib/campaign.cjs]

### Campaign State Init Extension (Phase 5)

```javascript
// Source: bin/lib/campaign.cjs -- cmdCampaignInit STATE.md fields
// Add after existing verify.* fields:
'review.run_count: null',
'review.last_run: null',
'review.overall_result: null',
'fix.run_count: null',
'fix.last_run: null',
'fix.overall_result: null',
'ship.status: null',
'ship.shipped_at: null',
'ship.checklist_result: null',
```

### SKILL.md Configuration for Phase 5 Commands

```yaml
# skills/ttm-review/SKILL.md -- interactive, no fork
---
name: ttm-review
description: >
  Review phase: present assets with structured review checklist for human
  evaluation. Use after verification to get human approval.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-review

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/review.md`
```

```yaml
# skills/ttm-fix/SKILL.md -- needs Task() for re-production
---
name: ttm-fix
description: >
  Fix phase: root cause analysis, fix brief, re-produce in isolated context,
  re-verify. Capped at 3 attempts per asset. Use when assets fail review.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep Task AskUserQuestion
---

# /ttm-fix

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/fix.md`
```

```yaml
# skills/ttm-ship/SKILL.md -- interactive, no fork
---
name: ttm-ship
description: >
  Ship phase: generate launch checklist confirming tracking, UTMs, funnel
  testing, and asset finalization. Use when assets are approved and ready.
argument-hint: "[campaign-slug]"
disable-model-invocation: true
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
---

# /ttm-ship

Read and follow the workflow at `${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/ship.md`
```
[VERIFIED: existing stubs have these tool configurations. Adding AskUserQuestion to review and ship for interactive prompts.]

### Fix Brief Template Structure

```markdown
# Fix Brief: ${ASSET_NAME}

**Campaign:** ${SLUG}
**Attempt:** ${ATTEMPT_NUMBER} of 3
**Root Cause:** ${ROOT_CAUSE_CATEGORY} -- ${ROOT_CAUSE_EXPLANATION}

## Original Brief Reference
Read the full campaign brief at: ${BRIEF_PATH}

## What Failed (DO NOT repeat these issues)
[List of specific gate failures and review feedback items]

- Gate ${GATE_NAME}: ${FAILURE_DESCRIPTION}
- Review feedback: ${STRUCTURED_FEEDBACK}

## What Passed (PRESERVE these elements)
[List of passing gates and their evidence -- the producer must NOT break these]

- Gate ${GATE_NAME}: PASS -- ${EVIDENCE_OF_PASSING}

## Specific Corrections Required
[Targeted instructions derived from root cause + review feedback]

1. ${CORRECTION_1}
2. ${CORRECTION_2}

## Constraints
- Fix ONLY the identified issues
- Preserve all passing gate elements
- Follow all rules from the original brief
- Match the same asset type and channel format
```

### Review Workflow State Updates

```bash
# After review completes, update campaign state
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)

# Campaign-level review tracking
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.run_count 1
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.last_run "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" review.overall_result "[mixed|approved|needs-fix]"

# Phase advancement
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase reviewed
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.reviewed "$TIMESTAMP"
```

### FIX-LOG.md Template

```markdown
# Fix Log

**Campaign:** [SLUG]
**Created:** [ISO_TIMESTAMP]

This file records every fix attempt for every asset. Append-only.

## Asset: [ASSET_NAME]

### Attempt 1
- **Date:** [ISO_TIMESTAMP]
- **Root cause:** [category] -- [explanation]
- **Fix brief:** [summary of corrections requested]
- **Gate results after fix:**
  | Gate | Before | After |
  |------|--------|-------|
  | Positioning Drift | FAIL | PASS |
  | ... | ... | ... |
- **Outcome:** [passed | failed -- reason]

### Attempt 2
...

### Escalation (if applicable)
- **Reason:** 3 attempts exhausted
- **Failure pattern:** [analysis of recurring issues across attempts]
- **Suggested manual edits:**
  1. [specific edit suggestion]
  2. [specific edit suggestion]
```

### Per-Asset Status in MANIFEST.json

```json
{
  "campaign": "spring-launch-2026",
  "hero": {
    "asset_id": 1,
    "name": "01-blog-post-organic-search",
    "file": "ASSETS/01-blog-post-organic-search.md",
    "review_status": "approved",
    "ship_status": "shipped",
    "shipped_at": "2026-04-30T12:00:00Z"
  },
  "derivatives": [
    {
      "asset_id": 2,
      "name": "02-linkedin-post-linkedin",
      "file": "ASSETS/02-linkedin-post-linkedin.md",
      "review_status": "needs-fix",
      "fix_attempts": 1,
      "ship_status": null
    }
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Task` tool name | `Agent` tool name (with `Task` as alias) | Claude Code recent versions | Both work; use `Task` for backward compatibility with existing produce.md [VERIFIED: Phase 4 RESEARCH.md] |
| Hard-blocking quality gates | Soft-fail with override | Phase 4 D-04 | All gates advisory in review/fix context; blocking only happens via 3-attempt cap |

**Deprecated/outdated:**
- None identified for Phase 5's domain. The patterns from Phase 4 remain current.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Task() can be called from within a non-forked SKILL.md context (fix uses Task but doesn't fork the outer context) | Pattern 2 | If Task() requires context:fork on the SKILL, fix would need to be refactored. The ttm-fix SKILL.md stub already has Task in allowed-tools without context:fork, matching this assumption. |
| A2 | MANIFEST.json can be extended with review_status and ship_status fields without breaking verify workflow | Pattern 4 | Verify reads hero.file and derivatives[].file -- additional fields are ignored. LOW risk. |
| A3 | The 500-line workflow limit is achievable for fix.md given the fix loop complexity | Pitfall 7 | If fix.md cannot fit, it may need to split into fix.md + a reference file with the re-verification logic. |
| A4 | AskUserQuestion works within a workflow that also uses Task() (fix needs both) | SKILL.md config | If they conflict, fix would need to separate interactive and Task() portions. LOW risk based on Phase 4 produce.md precedent (which uses Task() after user confirmation). |

## Open Questions

1. **MANIFEST.json vs separate REVIEW.md for per-asset status**
   - What we know: MANIFEST.json already has per-asset structure. Adding status fields is natural.
   - What's unclear: Whether workflows should update JSON files directly (no ttm-tools.cjs subcommand for JSON) or whether a Markdown-based REVIEW.md is more consistent with the "state as Markdown" pattern.
   - Recommendation: Use MANIFEST.json for per-asset review/fix/ship status since it already exists and has the right structure. Create a new `ttm-tools.cjs manifest update` subcommand for atomic JSON field updates, or handle JSON updates via direct Read/Write in the workflow (simpler given the structured format).

2. **Fix brief storage location**
   - What we know: Fix brief is generated per attempt per asset.
   - What's unclear: Whether to store fix briefs as persistent files (enables auditing) or generate them ephemerally (simpler).
   - Recommendation: Store as `CAMPAIGNS/<slug>/FIX-BRIEF-<asset-id>-attempt-<N>.md`. Persistent storage enables escalation display and learning extraction in Phase 9. Clean up is manual (or via /ttm-archive in Phase 7).

3. **Re-verification method in fix loop**
   - What we know: Fix must re-run all 10 gates per D-06.
   - What's unclear: Whether to invoke /ttm-verify as a separate command (via Task?) or inline the gate evaluation logic from verify.md.
   - Recommendation: Inline the gate evaluation pattern from verify.md into fix.md (or extract a shared reference file). Invoking /ttm-verify as a separate command would create a context fork that breaks the fix loop's ability to track attempt state. The gate evaluation logic (load reference, evaluate, record result) can be extracted into a reusable reference file that both verify.md and fix.md consume.

## Sources

### Primary (HIGH confidence)
- Codebase inspection -- `workflows/lifecycle/verify.md`, `workflows/lifecycle/produce.md`, `agents/ttm-producer.md`, `bin/lib/campaign.cjs`, `bin/lib/deviation.cjs`, `gates/base-gates.md`, `gates/gate-evaluation.md`, `templates/verification-report.md`, `templates/deviation-log.md`, `skills/ttm-review/SKILL.md`, `skills/ttm-fix/SKILL.md`, `skills/ttm-ship/SKILL.md`
- Phase 4 RESEARCH.md -- context:fork, Task() patterns, gate evaluation strategy
- CONTEXT.md (Phase 5) -- all 15 locked decisions from user discussion

### Secondary (MEDIUM confidence)
- `references/context-loading.md` -- Tier 1/Tier 2 loading rules for review (Tier 1 only), fix (same as verify), ship (Tier 2 CHANNELS.md)
- `templates/reference-files/learnings.md` -- Root cause taxonomy (7 categories) used by fix loop

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all tools are existing Phase 4 patterns reused with minor extensions
- Architecture: HIGH -- patterns derived directly from existing verify.md and produce.md code inspection
- Pitfalls: HIGH -- most pitfalls identified from concrete code patterns (ALLOWED_FIELDS, 500-line limit, context fork behavior)
- Fix loop design: MEDIUM -- the 3-attempt loop with root cause analysis is new territory for this codebase; the pattern is sound but untested

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (30 days -- stable domain, extending existing patterns)
