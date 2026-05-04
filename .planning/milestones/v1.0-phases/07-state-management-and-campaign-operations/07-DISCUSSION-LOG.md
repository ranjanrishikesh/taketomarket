# Phase 7: State Management and Campaign Operations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 07-state-management-and-campaign-operations
**Areas discussed:** State dashboard design, Resume & recovery flow, Archive & learnings, Health checks scope

---

## State Dashboard Design

### Dashboard Scope

| Option | Description | Selected |
|--------|-------------|----------|
| All campaigns | Show all campaigns (active + archived) in a summary table. Active get detail sections. Archived as collapsed rows. | Yes |
| Active only | Show only campaigns in active phases. Archived hidden unless --all flag. | |
| Single campaign focus | /ttm-state <slug> for one detail, no args for summary table. Two modes. | |

**User's choice:** All campaigns
**Notes:** None

---

## Resume & Recovery Flow

### Context Restoration

| Option | Description | Selected |
|--------|-------------|----------|
| Guide only | Show last completed phase and exact command. User runs it. Simple. | |
| Auto-load + guide | Load state, show context summary (last action, pending work, blockers), suggest next command. | Yes |
| Auto-execute | Load state and automatically launch next phase command. Fastest but least control. | |

**User's choice:** Auto-load + guide
**Notes:** None

---

## Archive & Learnings

### Archive Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Move to ARCHIVE/ | Move directory from CAMPAIGNS/ to CAMPAIGNS/ARCHIVE/. Still accessible but out of active path. | Yes |
| Compress + move | Archive + compressed summary. Directory marked read-only. | |
| Mark only | Keep in CAMPAIGNS/, set state to 'archived'. No file movement. | |

**User's choice:** Move to ARCHIVE/
**Notes:** None

### Failed Campaign Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Yes with reason | Allow archiving failed campaigns. Require reason. Log to LEARNINGS.md. | |
| No -- ship first | Only shipped campaigns can be archived. Failed must be cancelled separately. | Yes |

**User's choice:** No -- ship first
**Notes:** None

---

## Health Checks Scope

### Validation Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Structural + state | Extend with per-campaign state consistency, reference cross-refs, DRIFT-LOG.md integrity. | |
| Full audit | Structural + state PLUS content staleness, campaign velocity warnings, gate consistency. | Yes |
| Minimal extension | Just per-campaign state validation on top of existing health.cjs. | |

**User's choice:** Full audit
**Notes:** None

### /ttm-next Routing Intelligence

| Option | Description | Selected |
|--------|-------------|----------|
| State machine | Read state, map to lifecycle, suggest next command. Deterministic. | |
| Context-aware | State machine + blockers, pending reviews, fix loops, time since activity. | |
| Multi-campaign | Look across ALL active campaigns. Portfolio-level guidance. | Yes |

**User's choice:** Multi-campaign
**Notes:** None

---

## Claude's Discretion

- State dashboard formatting and layout
- Staleness/velocity thresholds for health checks
- Learnings extraction template for archive
- /ttm-next edge case handling (no active campaigns)
- DRIFT-LOG.md audit overlap with positioning-check

## Deferred Ideas

None -- discussion stayed within phase scope
