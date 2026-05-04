# Phase 7: State Management and Campaign Operations - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can manage campaign state across sessions, recover from interruptions, and get guided navigation through the lifecycle. This phase delivers 5 commands: `/ttm-state` (campaign dashboard), `/ttm-resume` (session recovery), `/ttm-archive` (campaign finalization), `/ttm-health` (full audit), and `/ttm-next` (multi-campaign routing).

</domain>

<decisions>
## Implementation Decisions

### State Dashboard (/ttm-state)
- **D-01:** Show all campaigns (active + archived) in a summary table. Active campaigns get detail sections with current phase, blockers, decisions in flight, in-progress experiments. Archived campaigns shown as collapsed rows (slug, archive date, outcome).
- **D-02:** No arguments = full dashboard. `<slug>` argument = single campaign detail view. Two modes from one command.
- **D-03:** Dashboard reads from campaign.cjs `list` (already exists from Phase 6) and enriches with per-campaign STATE.md fields (decisions, blockers, experiments).

### Resume & Recovery (/ttm-resume)
- **D-04:** Auto-load + guide -- load the campaign's state, show context summary (last completed phase, what was done, pending work, any blockers), then suggest the exact next `/ttm-*` command. User runs the command themselves.
- **D-05:** For interrupted verify/fix loops: detect if campaign is mid-loop (fix_attempts > 0, review_status = 'revise') and suggest continuing the loop rather than restarting it.
- **D-06:** Session recovery reads from `CAMPAIGNS/<slug>/STATE.md` frontmatter -- no separate handoff file needed. The state file IS the recovery mechanism.

### Archive & Learnings (/ttm-archive)
- **D-07:** Move campaign directory from `CAMPAIGNS/<slug>/` to `CAMPAIGNS/ARCHIVE/<slug>/`. Still accessible but out of the active path. Campaign state set to 'archived'.
- **D-08:** Only shipped campaigns can be archived. Failed/abandoned campaigns must reach 'shipped' status first, or user explicitly cancels them (sets state to 'cancelled' via /ttm-state update). Cancelled campaigns cannot be archived -- they stay in CAMPAIGNS/ as cautionary records.
- **D-09:** On archive, extract learnings from the campaign and append to `.marketing/LEARNINGS.md`. Learnings include: what worked (gate passes, high-performing assets), what didn't (gate failures, fix loop data), and campaign-level decisions. This is a structured extract, not a dump.
- **D-10:** Archive is irreversible via `/ttm-archive`. User can manually move back if needed, but no `/ttm-unarchive` command. Keep it simple.

### Health Checks (/ttm-health)
- **D-11:** Full audit extending existing health.cjs -- structural validation (directory, reference files), per-campaign state consistency (valid phase values, no orphaned campaigns), reference file cross-references, DRIFT-LOG.md integrity, content staleness detection (reference files not updated in 90+ days), campaign velocity warnings (campaigns stuck in same phase for 14+ days), gate result consistency across campaigns.
- **D-12:** Health report is text output (not a file). Quick to run, shows pass/warn/fail per check category. No persistent health report file -- run it when you need it.
- **D-13:** No self-healing. Health reports problems; user fixes them. Keep the tool diagnostic, not prescriptive.

### Next Command Routing (/ttm-next)
- **D-14:** Multi-campaign portfolio routing -- look across ALL active campaigns, prioritize which campaign needs attention most, and suggest the specific `/ttm-*` command to run.
- **D-15:** Priority factors: campaigns with pending reviews (human action needed) > campaigns with fix loops in progress > campaigns at earlier lifecycle phases (brief before produce) > most recently active. Tie-break by campaign creation date (oldest first).
- **D-16:** Output is a prioritized list with the top recommendation highlighted. Shows 1 primary suggestion + up to 3 alternatives if multiple campaigns are active.

### Claude's Discretion
- State dashboard layout/formatting (table columns, section ordering)
- Staleness and velocity thresholds for health checks (90 days, 14 days suggested but researcher can refine)
- Learnings extraction template structure for archive
- How /ttm-next handles the edge case of no active campaigns
- Whether /ttm-health should integrate DRIFT-LOG.md audit (may overlap with positioning-check)

</decisions>

<specifics>
## Specific Ideas

- /ttm-state should feel like a campaign control room -- at a glance, you know what's happening across all campaigns
- /ttm-resume should be the first thing you run when coming back to a project after a break -- it tells you exactly where you left off
- /ttm-next should reduce decision fatigue by telling you what to do next, not just what you CAN do
- Learnings extracted during archive should use the same root-cause taxonomy from LEARNINGS.md (positioning drift, weak hook, wrong channel, bad timing, unverifiable claim, broken funnel, creative fatigue) so data compounds over time

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Campaign Infrastructure
- `bin/lib/campaign.cjs` -- Campaign CRUD operations: init, read, update, list (with --active, --since, --shipped-since-last-audit filters from Phase 6)
- `bin/lib/health.cjs` -- Existing health validation: directory structure, reference files, campaign directory checks
- `bin/lib/state.cjs` -- STATE.md read/write operations
- `bin/lib/core.cjs` -- Shared utilities: output, error, safeReadFile, parseFrontmatter
- `bin/ttm-tools.cjs` -- CLI router with campaign, drift-log, deviation, health, state subcommands

### Campaign State Model
- `templates/campaign-state.md` -- Campaign STATE.md template with phase tracking fields
- `.marketing/CAMPAIGNS/<slug>/STATE.md` -- Per-campaign state with YAML frontmatter

### Lifecycle Workflows (Consumed by /ttm-next routing)
- `workflows/lifecycle/brief.md` -- Brief workflow pattern
- `workflows/lifecycle/produce.md` -- Produce workflow
- `workflows/lifecycle/verify.md` -- Verify workflow
- `workflows/lifecycle/review.md` -- Review workflow
- `workflows/lifecycle/fix.md` -- Fix workflow
- `workflows/lifecycle/ship.md` -- Ship workflow

### Learnings Infrastructure
- `templates/reference-files/learnings.md` -- LEARNINGS.md template with root-cause taxonomy
- `.planning/REQUIREMENTS.md` -- STAT-01 through STAT-05, UTIL-10 requirement definitions

### Existing Stubs
- `skills/ttm-state/SKILL.md` -- Stub to be implemented
- `skills/ttm-resume/SKILL.md` -- Stub to be implemented
- `skills/ttm-archive/SKILL.md` -- Stub to be implemented
- `skills/ttm-health/SKILL.md` -- Stub to be implemented
- `skills/ttm-next/SKILL.md` -- Stub to be implemented

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/lib/campaign.cjs` cmdCampaignList -- campaign enumeration with filters (Phase 6). Extend for dashboard and next-command routing.
- `bin/lib/health.cjs` cmdHealth -- existing health validation. Extend with new check categories.
- `bin/lib/state.cjs` -- STATE.md operations for session tracking
- `bin/lib/drift-log.cjs` -- append-only log pattern reusable for learnings extraction
- AskUserQuestion + text-mode fallback pattern from prior phases

### Established Patterns
- Thin SKILL.md -> workflow routing (Phase 1 D-02)
- Campaign state field tracking via `campaign update` CLI (Phases 3-6)
- Supporting reference files via @-syntax to keep workflows under 500 lines
- `campaign list --active` for filtering active campaigns (Phase 6)

### Integration Points
- `workflows/operations/` -- state.md, resume.md, archive.md, health.md, next.md go here
- `.marketing/CAMPAIGNS/<slug>/` -- campaign directories read by state/resume/archive
- `.marketing/CAMPAIGNS/ARCHIVE/` -- new directory for archived campaigns
- `.marketing/LEARNINGS.md` -- updated by archive workflow
- `bin/lib/campaign.cjs` -- needs extension for archive move operation
- `bin/lib/health.cjs` -- needs extension for new audit checks

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 07-state-management-and-campaign-operations*
*Context gathered: 2026-04-28*
