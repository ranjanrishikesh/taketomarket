# Phase 6: Positioning Invariant System - Research

**Researched:** 2026-04-28
**Domain:** Positioning enforcement, drift audit, controlled shift workflows (Claude Code skill architecture)
**Confidence:** HIGH

## Summary

Phase 6 builds the positioning invariant system -- the architectural guarantee that positioning is never silently violated across campaigns. It delivers two commands (`/ttm-positioning-check` and `/ttm-positioning-shift`), read-only enforcement for POSITIONING.md, and an append-only DRIFT-LOG.md audit trail.

The codebase is well-prepared for this phase. POSITIONING.md already has the `_SUMMARY/END_SUMMARY` two-tier structure, GATE-01 in `gate-evaluation.md` defines the exact 3-check positioning drift evaluation, and `deviation.cjs` provides an append-only logging pattern that DRIFT-LOG.md can follow. The skill stubs already exist with correct frontmatter. The primary implementation work is: (1) creating two workflow files in `workflows/reference-mgmt/`, (2) adding a `drift-log.cjs` module for DRIFT-LOG.md operations, (3) extending `campaign.cjs` with a campaign enumeration function for active-campaign checks, and (4) adding read-only enforcement instructions to existing lifecycle workflows.

**Primary recommendation:** Reuse GATE-01 evaluation logic from `gate-evaluation.md` for `/ttm-positioning-check` drift audits, and mirror the `deviation.cjs` append-only pattern for DRIFT-LOG.md operations in a new `drift-log.cjs` module. Campaign enumeration needs a new CLI subcommand (`campaign list`) since none exists today.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Time-window based sampling -- sample all assets produced in the last 30 days (or configurable window). Naturally scales with activity level. Covers all campaigns within the window.
- **D-02:** Auto-suggest after milestones -- after every 3rd campaign ships, Claude suggests running a positioning check. Not forced, just a nudge. The SKILL.md already has `disable-model-invocation: false` to enable this.
- **D-03:** Audit output includes: per-asset drift percentage, types of drift detected (using existing GATE-01 categories from gate-evaluation.md), aggregate drift % across the sample, and trend comparison to last audit if available.
- **D-04:** Audit + recommend for in-flight campaigns -- scan all active campaigns, flag which assets conflict with new positioning, recommend per-asset action (re-verify, re-produce, or accept-as-is). User decides per campaign. No automatic quarantine.
- **D-05:** Deprecation schedule for shipped assets -- user sets a deprecation timeline for old-positioning assets (e.g., "update blog posts within 90 days"). Tracked in a deprecation backlog within DRIFT-LOG.md.
- **D-06:** Shift workflow requires: (1) explicit reasoning for the change, (2) what the new positioning is (full structured fields), (3) migration plan for active campaigns, (4) deprecation schedule for shipped assets, (5) mandatory human approval gate before any file is modified.
- **D-07:** After approval, POSITIONING.md is updated atomically -- old positioning is archived in the History table, new positioning becomes active. All subsequent campaign phases use new positioning.
- **D-08:** State-based gate -- campaign.cjs checks if any campaigns are in active phases (briefed through shipped). If yes, any attempt to write POSITIONING.md triggers a warning + redirect to /ttm-positioning-shift.
- **D-09:** "Any active campaign" scope -- if ANY campaign exists in briefed/produced/verified/reviewed/shipped state, positioning is locked. Most conservative approach. Only /ttm-positioning-shift can modify it.
- **D-10:** Enforcement implemented at the prompt/workflow level -- campaign workflows include explicit read-only instructions. Additionally, /ttm-positioning-shift checks campaign state via campaign.cjs before allowing changes (warns if active campaigns exist and requires migration plan).
- **D-11:** When no active campaigns exist, POSITIONING.md can still only be modified via /ttm-positioning-shift or /ttm-init. Direct edits are discouraged by workflow instructions but not filesystem-blocked (this is a skill, not a daemon).
- **D-12:** Dual log approach -- POSITIONING.md History table for intentional shifts only (the "official record"). Separate `.marketing/DRIFT-LOG.md` for ALL drift events including accepted deviations from verify. Different audiences: History table for quick reference, DRIFT-LOG.md for full audit trail.
- **D-13:** Everything logged -- shifts, audit findings (/ttm-positioning-check results with drift % over time), AND cross-references to per-campaign accepted deviations (from DEVIATIONS.md). Complete positioning audit trail.
- **D-14:** DRIFT-LOG.md is append-only. Each entry includes: date, event type (shift/audit/deviation), source (which command or campaign), details, and affected assets count.

### Claude's Discretion
- Positioning-check report format -- design the audit report layout and drift categorization
- Migration plan template structure -- how to present per-campaign recommendations during a shift
- Deprecation backlog format within DRIFT-LOG.md
- How to detect the "3rd campaign shipped" milestone for auto-suggest (campaign state enumeration)
- Whether /ttm-positioning-check should reuse gate-evaluation.md GATE-01 directly or have its own evaluation prompts (likely reuse for consistency)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| POSN-01 | POSITIONING.md loaded into every phase context (compact summary in non-produce phases, full in produce/verify) | Already implemented via `references/context-loading.md` two-tier strategy. Verify that positioning-check also loads Tier 2 (confirmed in loading matrix). No new work needed for loading -- only add positioning-check to the loading matrix entry. |
| POSN-02 | POSITIONING.md is read-only during campaign execution -- cannot be edited from within a campaign | Requires: (1) new `campaign list` CLI subcommand to enumerate active campaigns, (2) read-only instruction additions to all existing lifecycle workflows, (3) positioning-shift workflow checks active campaigns before allowing changes. |
| POSN-03 | /ttm-positioning-shift requires explicit reasoning, migration plan, deprecation schedule, human approval | New workflow at `workflows/reference-mgmt/positioning-shift.md`. Uses AskUserQuestion + text-mode pattern. Atomically updates POSITIONING.md History table. Logs to DRIFT-LOG.md. |
| POSN-04 | /ttm-positioning-check samples N recent assets and reports: % on-positioning, types of drift, bleeding analysis | New workflow at `workflows/reference-mgmt/positioning-check.md`. Reuses GATE-01 evaluation logic. Time-window sampling (D-01). Trend comparison to last audit. |
| POSN-05 | Positioning drift log maintained with date and reasoning for every intentional adjustment | New `.marketing/DRIFT-LOG.md` file. New `drift-log.cjs` module for append operations. Dual-log with POSITIONING.md History table (D-12). |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Drift audit (positioning-check) | AI Workflow (Markdown) | CLI (bin/) | AI reads assets and evaluates against POSITIONING.md using GATE-01 logic; CLI enumerates campaigns and reads state |
| Positioning shift (positioning-shift) | AI Workflow (Markdown) | CLI (bin/) | AI conducts interview, generates migration plan, presents diff; CLI updates state, appends DRIFT-LOG.md, archives history |
| Read-only enforcement | AI Workflow (prompt-level) | CLI (bin/) | Workflow instructions prevent POSITIONING.md writes; CLI provides active-campaign check for validation |
| Drift log persistence | CLI (bin/) | -- | Deterministic append-only writes via `drift-log.cjs` -- never AI-written directly |
| Campaign enumeration | CLI (bin/) | -- | `campaign list` subcommand reads filesystem, returns JSON list of campaigns with phases |
| Auto-suggest after milestones | AI Skill (SKILL.md) | CLI (bin/) | `disable-model-invocation: false` enables Claude to auto-suggest; CLI counts shipped campaigns since last audit |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins (fs, path) | 18+ | All CLI operations | Zero-dependency constraint per CLAUDE.md. Already used throughout bin/lib/. [VERIFIED: codebase inspection] |
| Markdown (SKILL.md + workflow .md) | N/A | Skill entry points and workflow definitions | Universal Agent Skills standard. All existing skills follow this pattern. [VERIFIED: codebase inspection] |
| YAML frontmatter | N/A | Metadata for DRIFT-LOG.md, campaign state | Standard parsed by `core.cjs` parseFrontmatter. [VERIFIED: codebase inspection] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| core.cjs (internal) | Current | output, error, safeReadFile, safeWriteFile, parseFrontmatter, serializeFrontmatter | Every CLI module depends on this. [VERIFIED: codebase inspection] |
| campaign.cjs (internal) | Current | Campaign init/state/update operations | Needs extension with `cmdCampaignList` for active-campaign enumeration. [VERIFIED: codebase inspection] |
| deviation.cjs (internal) | Current | Append-only deviation log pattern | Model for drift-log.cjs implementation. [VERIFIED: codebase inspection] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New drift-log.cjs module | Extending deviation.cjs | Separate module is cleaner -- DRIFT-LOG.md has different schema (event types: shift/audit/deviation) vs DEVIATIONS.md (gate results only). Different files, different validation. |
| CLI-based campaign enumeration | Workflow-level fs.readdirSync | CLI keeps deterministic operations out of AI prompts. Consistent with existing architecture. |
| Prompt-level read-only enforcement | File system permissions | Skills cannot manage OS permissions. Prompt-level is the only viable enforcement mechanism in this architecture. [VERIFIED: CLAUDE.md constraint "this is a skill, not a daemon"] |

## Architecture Patterns

### System Architecture Diagram

```
User invokes /ttm-positioning-check
    |
    v
SKILL.md (disable-model-invocation: false)
    |
    v
workflows/reference-mgmt/positioning-check.md
    |
    +--> [1] Load Tier 1 summaries (all 9 reference files)
    +--> [2] Load POSITIONING.md Tier 2 (full)
    +--> [3] Enumerate campaigns via `ttm-tools.cjs campaign list --since 30d`
    |         |
    |         v
    |    For each campaign with assets in window:
    |         |
    |         +--> Read ASSETS/ directory, load each asset
    |         +--> Evaluate against GATE-01 (3 checks)
    |         +--> Record per-asset drift result
    |         |
    +--> [4] Aggregate: drift %, types, trend vs last audit
    +--> [5] Write audit report to stdout
    +--> [6] Append audit entry to DRIFT-LOG.md via `ttm-tools.cjs drift-log append`
    +--> [7] Display completion banner


User invokes /ttm-positioning-shift
    |
    v
SKILL.md (disable-model-invocation: true)
    |
    v
workflows/reference-mgmt/positioning-shift.md
    |
    +--> [1] Load current POSITIONING.md (Tier 2 full)
    +--> [2] Check for active campaigns via `ttm-tools.cjs campaign list --active`
    |         |
    |         +--> If active: warn, require migration plan
    |         +--> If none: simpler flow (still requires reasoning)
    |
    +--> [3] Interview: reasoning, new positioning fields, migration plan, deprecation schedule
    +--> [4] Present before/after diff for human approval (mandatory gate)
    +--> [5] On approval:
    |         +--> Archive old positioning in History table
    |         +--> Write new positioning to POSITIONING.md
    |         +--> Append shift entry to DRIFT-LOG.md
    |         +--> If active campaigns: write migration recommendations per campaign
    |
    +--> [6] Display completion banner
```

### Recommended File Structure

```
# New files created in Phase 6
workflows/reference-mgmt/
  positioning-check.md          # Drift audit workflow
  positioning-shift.md          # Controlled shift workflow

references/
  positioning-check-report.md   # Report format template (extracted to stay under 500 lines)

templates/
  drift-log.md                  # DRIFT-LOG.md initialization template
  migration-plan.md             # Per-campaign migration recommendation template

bin/lib/
  drift-log.cjs                 # Append-only DRIFT-LOG.md operations
  campaign.cjs                  # Extended with cmdCampaignList

# Modified files in Phase 6
workflows/lifecycle/brief.md          # Add read-only POSITIONING.md instruction
workflows/lifecycle/produce.md        # Add read-only POSITIONING.md instruction
workflows/lifecycle/verify.md         # Add read-only POSITIONING.md instruction
workflows/lifecycle/review.md         # Add read-only POSITIONING.md instruction
workflows/lifecycle/fix.md            # Add read-only POSITIONING.md instruction
workflows/lifecycle/ship.md           # Add read-only POSITIONING.md instruction
references/context-loading.md         # Add positioning-shift to loading matrix
skills/ttm-positioning-check/SKILL.md # Update from stub to final
skills/ttm-positioning-shift/SKILL.md # Update from stub to final
bin/ttm-tools.cjs                     # Add drift-log and campaign list subcommands
```

### Pattern 1: Append-Only Log via CLI (from deviation.cjs)

**What:** All DRIFT-LOG.md writes go through `drift-log.cjs`, never direct AI file writes.
**When to use:** Every drift log entry -- audits, shifts, and deviation cross-references.
**Example:**

```javascript
// Source: deviation.cjs pattern (verified via codebase inspection)
// drift-log.cjs follows identical structure

const ALLOWED_EVENT_TYPES = new Set(['shift', 'audit', 'deviation']);

function cmdDriftLogAppend(eventType, source, details, affectedCount, raw) {
  // Validate event type against allowlist
  if (!ALLOWED_EVENT_TYPES.has(eventType)) {
    error(`Unknown event type: ${eventType}. Allowed: ${[...ALLOWED_EVENT_TYPES].join(', ')}`);
  }

  const driftLogPath = path.resolve(process.cwd(), '.marketing', 'DRIFT-LOG.md');

  // Atomically create DRIFT-LOG.md if it does not exist (prevents TOCTOU race)
  // ... same pattern as deviation.cjs line 107-112 ...

  const timestamp = new Date().toISOString();
  const newRow = `| ${timestamp} | ${eventType} | ${source} | ${sanitize(details)} | ${affectedCount} |`;

  // Append after the last line of content
  const updated = content.trimEnd() + '\n' + newRow + '\n';
  safeWriteFile(driftLogPath, updated);
}
```

### Pattern 2: Campaign Enumeration via CLI

**What:** New `campaign list` subcommand reads all `CAMPAIGNS/*/STATE.md` files and returns JSON array.
**When to use:** Checking for active campaigns (read-only enforcement), sampling assets within time window, counting shipped campaigns for auto-suggest.
**Example:**

```javascript
// Source: campaign.cjs extension pattern (new code, follows existing patterns)

function cmdCampaignList(filter, raw) {
  const campaignsDir = path.resolve(process.cwd(), '.marketing', 'CAMPAIGNS');
  if (!fs.existsSync(campaignsDir)) {
    output({ campaigns: [], count: 0 }, raw, '0 campaigns');
    return;
  }

  const entries = fs.readdirSync(campaignsDir, { withFileTypes: true });
  const campaigns = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
    const content = safeReadFile(statePath);
    if (!content) continue;
    const { frontmatter } = parseFrontmatter(content);
    campaigns.push({ slug: entry.name, ...frontmatter });
  }

  // Filter by active phases if requested
  const ACTIVE_PHASES = new Set(['briefed', 'produced', 'verified', 'reviewed', 'shipped']);
  if (filter === '--active') {
    const active = campaigns.filter(c => ACTIVE_PHASES.has(c.phase));
    output({ campaigns: active, count: active.length }, raw, `${active.length} active`);
  } else {
    output({ campaigns, count: campaigns.length }, raw, `${campaigns.length} campaigns`);
  }
}
```

### Pattern 3: Read-Only Enforcement via Prompt Instructions

**What:** Add explicit instructions to every lifecycle workflow prohibiting POSITIONING.md writes.
**When to use:** Every existing lifecycle workflow (brief, produce, verify, review, fix, ship).
**Example:**

```markdown
<!-- Add to each lifecycle workflow after the <required_reading> block -->

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>
```

### Pattern 4: Human Approval Gate (from review.md)

**What:** Mandatory human approval before POSITIONING.md is modified in shift workflow.
**When to use:** Step 4 of positioning-shift workflow -- present diff, require explicit "approve" before any writes.
**Example:**

```markdown
## Step 4: Human Approval Gate

Present the positioning change for approval:

```
takeToMarket > POSITIONING SHIFT APPROVAL

## Current Positioning
**Category:** [current]
**Differentiator:** [current]
**Target:** [current]

## Proposed Positioning
**Category:** [proposed]
**Differentiator:** [proposed]
**Target:** [proposed]

## What Changed
[field-by-field diff]

## Reasoning
[user's stated reasoning]

## Impact
- Active campaigns affected: [count]
- Migration actions needed: [count]
- Deprecation items: [count]
```

Use AskUserQuestion:
- header: "Approve Positioning Shift"
- question: "Review the changes above. This will update POSITIONING.md and affect all future campaigns."
- options:
  - label: "Approve" -- Apply the new positioning
  - label: "Revise" -- Go back and modify the proposed positioning
  - label: "Cancel" -- Abandon the shift entirely

**Text-mode fallback:** Present as numbered list per standard pattern.

**Only on "Approve"** proceed to write POSITIONING.md.
```

### Anti-Patterns to Avoid
- **Direct POSITIONING.md writes in workflows:** Never use Write tool on POSITIONING.md from any lifecycle workflow. Only positioning-shift.md and init.md may write it.
- **AI-written DRIFT-LOG.md entries:** Always use `ttm-tools.cjs drift-log append` CLI. AI-written log entries have inconsistent formatting across runs.
- **Monolithic positioning-check workflow:** The report format and drift categorization should be extracted to a reference file to keep the workflow under 500 lines.
- **Blocking enforcement without escape hatch:** Read-only enforcement must always tell the user how to proceed (via /ttm-positioning-shift), never just block.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Drift evaluation logic | Custom positioning check prompts | Reuse GATE-01 from `gate-evaluation.md` | GATE-01 already defines the exact 3-check evaluation (differentiator alignment, proof point sourcing, must-not-say). Consistency between verify-time and audit-time checks is critical. [VERIFIED: gate-evaluation.md lines 55-67] |
| Append-only log writes | Direct file writes in workflow | CLI module (drift-log.cjs following deviation.cjs pattern) | deviation.cjs solves: TOCTOU races via `wx` flag, input sanitization, consistent table row format, template-based initialization. [VERIFIED: deviation.cjs lines 92-112] |
| Campaign state enumeration | Workflow-level fs operations | `campaign list` CLI subcommand | Deterministic filesystem operations belong in CLI, not AI prompts. Needs filtering by phase, time window, and shipped-since-last-audit. [VERIFIED: campaign.cjs existing CRUD pattern] |
| Frontmatter parsing | Regex-based parsing in workflows | `core.cjs` parseFrontmatter | Already battle-tested across all existing state files. [VERIFIED: core.cjs] |
| Timestamp generation | `new Date()` in workflow instructions | `ttm-tools.cjs timestamp --raw` | Consistent ISO format across all state updates. [VERIFIED: slug.cjs cmdTimestamp] |

**Key insight:** This phase is primarily a composition of existing patterns (GATE-01 evaluation, deviation.cjs logging, campaign.cjs state management, AskUserQuestion approval gates). The novelty is in the workflow orchestration, not the primitives.

## Common Pitfalls

### Pitfall 1: Drift Percentage Calculation Ambiguity
**What goes wrong:** "X% on-positioning" is undefined without specifying what a "check" is. GATE-01 has 3 checks (differentiator, proof points, must-not-say). Is drift per-check, per-asset, or per-campaign?
**Why it happens:** D-03 says "per-asset drift percentage" but GATE-01 returns PASS/WARN/FAIL per check, not a percentage.
**How to avoid:** Define: per-asset drift = number of WARN+FAIL checks / total checks evaluated. Aggregate drift = total WARN+FAIL checks across all assets / total checks across all assets. Report both per-asset and aggregate.
**Warning signs:** Report says "75% on-positioning" without explaining what was counted.

### Pitfall 2: Time Window vs Campaign Lifecycle Mismatch
**What goes wrong:** Assets produced 25 days ago might be from a campaign that is already shipped and archived. Sampling them is wasteful.
**Why it happens:** D-01 uses time-window sampling (last 30 days) which is campaign-lifecycle-agnostic.
**How to avoid:** Sample all assets produced within the window from campaigns that are still active OR recently shipped (within the window). Exclude archived campaigns. The campaign list CLI should support `--since` filtering.
**Warning signs:** Audit report includes assets from campaigns the user archived months ago.

### Pitfall 3: POSITIONING.md History Table Format Fragility
**What goes wrong:** The History table at the bottom of POSITIONING.md gets malformed when archiving old positioning during a shift, breaking parseFrontmatter or Tier 1 summary extraction.
**Why it happens:** POSITIONING.md uses `_SUMMARY/END_SUMMARY` delimiters. If the History table row contains markdown that looks like a delimiter, parsing breaks.
**How to avoid:** The shift workflow must write the History table row as a simple pipe-delimited row with no special markdown characters. Sanitize the "Change" and "Reasoning" columns the same way deviation.cjs sanitizes justification text.
**Warning signs:** After a positioning shift, workflows fail to load Tier 1 summary.

### Pitfall 4: Workflow Line Count Overflow
**What goes wrong:** positioning-check.md or positioning-shift.md exceeds the 500-line limit (FOUND-03).
**Why it happens:** Both workflows have significant content: context loading, campaign enumeration, asset evaluation, report generation, user interaction, state updates.
**How to avoid:** Extract the report format template to `references/positioning-check-report.md` and the migration plan template to `templates/migration-plan.md`. Use @-syntax references in workflows, following the pattern from review.md (420 lines) and ship.md (485 lines).
**Warning signs:** Workflow file approaching 400+ lines during implementation.

### Pitfall 5: Circular Dependency Between Verify Escalate and Positioning-Shift
**What goes wrong:** User escalates during verify (launches /ttm-positioning-shift), which checks for active campaigns (the one being verified), which warns about migration needed, creating confusion.
**Why it happens:** The escalation path from verify is well-defined (D-08 in gate-evaluation.md: "Pause verification, display message, exit") but the positioning-shift workflow does not know it was invoked from an escalation.
**How to avoid:** The positioning-shift workflow should not re-warn about the campaign that triggered the escalation. The workflow should accept an optional `--from-escalate <slug>` argument to contextualize the shift with the escalation source. However, since verify already exits and tells the user to re-run verify after, this is informational only.
**Warning signs:** User sees "Warning: campaign X has active assets" when they just escalated from campaign X's verification.

### Pitfall 6: Auto-Suggest Milestone Detection Race Condition
**What goes wrong:** The "3rd campaign shipped" milestone is detected after a ship, but if two campaigns ship in the same session, it might trigger twice or not at all.
**Why it happens:** `disable-model-invocation: false` means Claude decides when to suggest, based on context. If it does not check the count programmatically, it might miss.
**How to avoid:** The auto-suggest logic should be in the ship workflow as a post-completion suggestion, not in the positioning-check SKILL.md itself. After ship completes, run `ttm-tools.cjs campaign list --shipped-since-last-audit` and if count >= 3, display a suggestion.
**Warning signs:** Auto-suggest never fires, or fires after every ship.

## Code Examples

### Verified Pattern: GATE-01 Positioning Drift Evaluation (from gate-evaluation.md)

```markdown
<!-- Source: gates/gate-evaluation.md lines 55-67 (VERIFIED: codebase inspection) -->

### Evaluating GATE-01: Positioning Drift

**Load:** `.marketing/POSITIONING.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the asset restate or naturally extend the primary differentiator from POSITIONING.md?
   Or does it introduce a different claim?
2. Are all factual claims in the asset backed by proof points in the POSITIONING.md
   proof point library?
3. Does the asset contain any terms from the POSITIONING.md must-not-say list?
```

### Verified Pattern: Deviation Append CLI Usage (from verify.md)

```bash
# Source: workflows/lifecycle/verify.md lines 300-313 (VERIFIED: codebase inspection)

node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" deviation append \
  --slug "${SLUG}" \
  --gate "[gate name]" \
  --gate-id "[GATE-XX]" \
  --tier [1|2] \
  --result "[WARN|FAIL]" \
  --asset "[asset file path]" \
  --finding "[exact finding text]" \
  --action "Accept+log" \
  --justification "[user's justification]" \
  --run ${RUN_NUMBER}
```

### Verified Pattern: POSITIONING.md History Table (from template)

```markdown
<!-- Source: templates/reference-files/positioning.md lines 36-38 (VERIFIED: codebase inspection) -->

### Positioning History
| Date | Change | Reasoning |
|------|--------|-----------|
| [init date] | Initial positioning | Created via /ttm-init |
```

### Verified Pattern: Text-Mode Detection (from verify.md)

```bash
# Source: workflows/lifecycle/verify.md lines 24-26 (VERIFIED: codebase inspection)

if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

### Proposed: DRIFT-LOG.md Entry Format

```markdown
<!-- New file: .marketing/DRIFT-LOG.md (D-12, D-13, D-14) -->

# Positioning Drift Log

**Created:** [ISO timestamp]
**Last updated:** [ISO timestamp]

## Audit Trail

| Date | Event | Source | Details | Assets Affected |
|------|-------|--------|---------|-----------------|
| [ISO] | shift | /ttm-positioning-shift | Changed primary differentiator from X to Y | 0 |
| [ISO] | audit | /ttm-positioning-check | 30-day audit: 85% on-positioning, 3 drift findings | 12 |
| [ISO] | deviation | campaign:launch-q2 | Accept+log: GATE-01 proof point sourcing WARN | 1 |

## Deprecation Backlog

| Asset | Campaign | Old Positioning Element | Required Update | Deadline | Status |
|-------|----------|------------------------|-----------------|----------|--------|
| blog-post-1.md | launch-q1 | Primary differentiator | Update to new differentiator | 2026-07-01 | pending |
```

### Proposed: Campaign List CLI Output

```json
{
  "campaigns": [
    {
      "slug": "launch-q2",
      "name": "Q2 Product Launch",
      "phase": "produced",
      "created": "2026-04-15T00:00:00.000Z",
      "last_updated": "2026-04-25T00:00:00.000Z",
      "phase.shipped": null
    }
  ],
  "count": 1
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No positioning enforcement | Soft gate at brief-time (brief-positioning-check.md) | Phase 3 | Catches drift during briefing but not during production or across campaigns |
| Manual POSITIONING.md edits | /ttm-positioning-shift with approval gate | Phase 6 (this phase) | Prevents accidental positioning changes, maintains audit trail |
| No drift tracking | DRIFT-LOG.md append-only audit trail | Phase 6 (this phase) | Complete history of positioning decisions and violations |

**What exists today:**
- GATE-01 evaluates positioning drift per-asset during verification [VERIFIED: gate-evaluation.md]
- brief-positioning-check.md runs 5 positioning checks during brief generation [VERIFIED: brief-positioning-check.md]
- POSITIONING.md has History table structure but no enforcement around it [VERIFIED: positioning.md template]
- DEVIATIONS.md captures accept+log decisions per-campaign [VERIFIED: deviation.cjs]

**What this phase adds:**
- Cross-campaign positioning drift audit (/ttm-positioning-check)
- Controlled shift workflow with migration planning (/ttm-positioning-shift)
- Read-only enforcement across all lifecycle workflows
- Centralized positioning audit trail (DRIFT-LOG.md)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | positioning-check report should be displayed inline (stdout) rather than written to a file, since it operates across campaigns and has no single campaign directory | Architecture Patterns | Low -- could easily add file output if needed |
| A2 | The `--from-escalate` argument for positioning-shift is informational only and does not change the workflow gates | Pitfall 5 | Low -- the verify workflow already exits cleanly on escalate |
| A3 | Auto-suggest logic should live in the ship workflow as a post-completion check rather than relying on SKILL.md auto-invocation | Pitfall 6 | Medium -- if placed in ship.md, it only triggers after ship; if in SKILL.md, Claude could suggest at other times too. D-02 says "after every 3rd campaign ships" which points to ship.md. |

## Open Questions (RESOLVED)

1. **DRIFT-LOG.md Deprecation Backlog Updates**
   - What we know: D-05 says deprecation schedule is tracked in DRIFT-LOG.md. D-14 says DRIFT-LOG.md is append-only.
   - What's unclear: How does a user mark a deprecation item as "updated" (completed) if the log is append-only? Do we append a new "deprecation-complete" event type?
   - Recommendation: Add a `deprecation-update` event type to DRIFT-LOG.md. When a deprecated asset is updated, append a new row referencing the original deprecation entry. The backlog section at the bottom would need to be a rendered view (rebuilt by the CLI on each append) rather than manually maintained. Alternatively, keep the backlog table mutable while the audit trail table is append-only -- separating the two sections.
   - RESOLVED: Dual-section design in drift-log.md template -- append-only Audit Trail section + mutable Deprecation Backlog section. Plan 06-01 implements this in the template and drift-log.cjs module.

2. **Cross-Reference Format Between DRIFT-LOG.md and DEVIATIONS.md**
   - What we know: D-13 says drift log should cross-reference per-campaign accepted deviations.
   - What's unclear: Does the cross-reference happen at deviation-time (when accept+log is chosen in verify) or at audit-time (when /ttm-positioning-check runs)?
   - Recommendation: At audit-time. When /ttm-positioning-check runs, it reads each campaign's DEVIATIONS.md for positioning_drift entries and includes them in the audit report. A summary is appended to DRIFT-LOG.md as a `deviation` event type. This avoids modifying the verify workflow (which already writes to DEVIATIONS.md correctly).
   - RESOLVED: Audit-time cross-reference. Plan 06-02 Step 5 reads DEVIATIONS.md from each campaign and includes positioning_drift deviations in the audit report, then appends a summary to DRIFT-LOG.md.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified). This phase is purely Markdown workflow files and Node.js CJS modules using built-in fs/path only.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Node.js built-in `node --test` (or manual verification via CLI) |
| Config file | none -- CLI modules tested via direct invocation |
| Quick run command | `node bin/ttm-tools.cjs campaign list --raw` |
| Full suite command | Manual: invoke each new CLI subcommand with test data |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| POSN-01 | POSITIONING.md loaded in every phase context | manual-only | Verify `context-loading.md` loading matrix includes positioning-check | N/A -- config file check |
| POSN-02 | Read-only enforcement blocks POSITIONING.md writes | manual-only | Run a lifecycle workflow and attempt to modify POSITIONING.md | N/A -- prompt-level enforcement |
| POSN-03 | Shift workflow requires reasoning + migration + approval | manual-only | Run `/ttm-positioning-shift` end-to-end | N/A -- workflow test |
| POSN-04 | Positioning-check samples and reports drift | smoke | `node bin/ttm-tools.cjs campaign list --raw` + manual workflow run | No -- Wave 0 |
| POSN-05 | DRIFT-LOG.md maintained with append-only entries | unit | `node bin/ttm-tools.cjs drift-log append --event-type audit --source test --details "test" --affected 0 --raw` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `node bin/ttm-tools.cjs campaign list --raw` (verify campaign enumeration works)
- **Per wave merge:** Run drift-log append, campaign list, and verify positioning-check SKILL.md loads correctly
- **Phase gate:** Manual end-to-end test of both /ttm-positioning-check and /ttm-positioning-shift workflows

### Wave 0 Gaps
- [ ] `bin/lib/drift-log.cjs` -- new module, needs creation before DRIFT-LOG.md operations can be tested
- [ ] `campaign list` subcommand in `bin/lib/campaign.cjs` -- needs creation before campaign enumeration can be tested
- [ ] `templates/drift-log.md` -- DRIFT-LOG.md initialization template

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A -- no auth in skill architecture |
| V3 Session Management | No | N/A -- stateless skill invocations |
| V4 Access Control | Partial | Prompt-level read-only enforcement for POSITIONING.md; no OS-level access control possible |
| V5 Input Validation | Yes | CLI argument validation via allowlists (following deviation.cjs pattern), slug sanitization, justification text sanitization |
| V6 Cryptography | No | N/A -- no secrets or encryption |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via campaign slug | Tampering | `path.resolve()` + startsWith projectRoot check (existing pattern in campaign.cjs) [VERIFIED: campaign.cjs lines 30-38] |
| Log injection via DRIFT-LOG.md entries | Tampering | Sanitize all user input before appending (strip pipes, backticks, newlines, limit length -- following deviation.cjs sanitizeJustification) [VERIFIED: deviation.cjs lines 37-48] |
| Prompt injection via positioning shift fields | Tampering | AI reads user-provided positioning text, but this is inherent to the skill architecture. No additional mitigation beyond standard Claude guardrails. |
| TOCTOU race on DRIFT-LOG.md creation | Tampering | `fs.writeFileSync` with `wx` flag (exclusive create) -- same pattern as deviation.cjs [VERIFIED: deviation.cjs line 108] |

## Sources

### Primary (HIGH confidence)
- Codebase inspection: `gates/gate-evaluation.md` -- GATE-01 positioning drift evaluation, 3-check structure, deviation handling
- Codebase inspection: `gates/base-gates.md` -- Gate tier classification, evaluation criteria
- Codebase inspection: `references/context-loading.md` -- Two-tier loading strategy, per-workflow loading matrix
- Codebase inspection: `templates/reference-files/positioning.md` -- POSITIONING.md template with History table
- Codebase inspection: `bin/lib/campaign.cjs` -- Campaign CRUD operations, allowed fields, path security
- Codebase inspection: `bin/lib/deviation.cjs` -- Append-only log pattern, input sanitization, TOCTOU prevention
- Codebase inspection: `bin/lib/health.cjs` -- Directory validation, campaign directory structure
- Codebase inspection: `bin/ttm-tools.cjs` -- Subcommand router pattern
- Codebase inspection: `workflows/lifecycle/verify.md` -- Escalate behavior, deviation recording, state update pattern
- Codebase inspection: `workflows/lifecycle/brief-positioning-check.md` -- 5-check positioning gate at brief time
- Codebase inspection: `skills/ttm-positioning-check/SKILL.md` -- Stub with disable-model-invocation: false
- Codebase inspection: `skills/ttm-positioning-shift/SKILL.md` -- Stub with disable-model-invocation: true

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions D-01 through D-14 -- User-locked implementation decisions from /gsd-discuss-phase

### Tertiary (LOW confidence)
- None -- all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero-dependency Node.js CJS, verified against existing codebase
- Architecture: HIGH -- all patterns derive from existing codebase patterns (deviation.cjs, campaign.cjs, verify.md)
- Pitfalls: HIGH -- identified from structural analysis of existing code and decision interactions

**Research date:** 2026-04-28
**Valid until:** 2026-05-28 (stable -- Markdown skill architecture, no external dependencies)
