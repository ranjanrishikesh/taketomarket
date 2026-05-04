# Phase 6: Positioning Invariant System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 06-positioning-invariant-system
**Areas discussed:** Drift audit scope, Shift workflow gates, Read-only enforcement, Drift log design

---

## Drift Audit Scope

### Asset Sampling Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Recent N assets | Sample the most recent N assets across all campaigns (e.g., last 10-20 assets). Simple, fast, catches recent drift. | |
| Per-campaign sampling | Sample 2-3 assets from each active campaign. Ensures coverage across all campaigns but may miss volume patterns. | |
| Time-window based | Sample all assets produced in the last 30 days (or configurable window). Naturally scales with activity level. | Yes |

**User's choice:** Time-window based
**Notes:** None

### Trigger Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Manual only | User runs /ttm-positioning-check when they want. Simple, no magic. | |
| Auto-suggest after milestones | After every 3rd campaign ships, Claude suggests running a positioning check. Not forced, just a nudge. | Yes |
| Monthly cadence reminder | Monthly positioning audit. Claude reminds when it's been 30+ days since last check. | |

**User's choice:** Auto-suggest after milestones
**Notes:** None

---

## Shift Workflow Gates

### Migration Plan for In-Flight Campaigns

| Option | Description | Selected |
|--------|-------------|----------|
| Audit + recommend | Scan all active campaigns, flag which assets conflict with new positioning, recommend per-asset action (re-verify, re-produce, or accept-as-is). User decides per campaign. | Yes |
| Auto-quarantine | All in-flight campaigns automatically pause at their current phase. User must explicitly resume each one. | |
| Grandfather existing | In-flight campaigns continue with old positioning (tagged as 'pre-shift'). Only new campaigns use new positioning. | |

**User's choice:** Audit + recommend
**Notes:** None

### Shipped Asset Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Log only | Record that positioning shifted. Shipped assets stay as-is. | |
| Flag for review | Generate a report of shipped assets that may conflict. User can optionally re-review. | |
| Deprecation schedule | User sets a deprecation timeline for old-positioning assets. Tracked in a deprecation backlog. | Yes |

**User's choice:** Deprecation schedule
**Notes:** None

---

## Read-Only Enforcement

### Enforcement Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Prompt-level guard | Campaign workflows include explicit instructions. Enforcement via AI instruction, not filesystem. | |
| State-based gate | campaign.cjs checks if any campaigns are in active phases. If yes, writing POSITIONING.md triggers warning + redirect. | Yes |
| Always read-only | POSITIONING.md can ONLY be modified via /ttm-positioning-shift or /ttm-init. No direct edits ever. | |

**User's choice:** State-based gate
**Notes:** None

### Read-Only Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Any active campaign | If ANY campaign exists in briefed/produced/verified/reviewed/shipped state, positioning is locked. Most conservative. | Yes |
| Pre-ship only | Positioning locked only while campaigns are in briefed through reviewed state (pre-ship). After shipping, positioning can evolve. | |
| Always locked | Positioning is always locked behind /ttm-positioning-shift. Regardless of campaign state. | |

**User's choice:** Any active campaign
**Notes:** None

---

## Drift Log Design

### Log Location

| Option | Description | Selected |
|--------|-------------|----------|
| POSITIONING.md History table | Extend the existing History table. All changes in one file. | |
| Separate DRIFT-LOG.md | New .marketing/DRIFT-LOG.md file. Append-only log. Keeps POSITIONING.md clean. | |
| Both | POSITIONING.md History table for intentional shifts only. DRIFT-LOG.md for ALL drift events including accepted deviations. | Yes |

**User's choice:** Both
**Notes:** Different audiences: History table for quick reference, DRIFT-LOG.md for full audit trail.

### Events Logged

| Option | Description | Selected |
|--------|-------------|----------|
| Shifts only | Only log intentional /ttm-positioning-shift events. | |
| Shifts + audit findings | Log shifts AND /ttm-positioning-check audit results (drift % over time). | |
| Everything | Shifts, audit findings, AND cross-references to per-campaign accepted deviations. Complete audit trail. | Yes |

**User's choice:** Everything
**Notes:** None

---

## Claude's Discretion

- Positioning-check report format and drift categorization
- Migration plan template structure for shift workflow
- Deprecation backlog format within DRIFT-LOG.md
- Campaign milestone detection for auto-suggest
- Whether positioning-check reuses GATE-01 directly or has own evaluation prompts

## Deferred Ideas

None -- discussion stayed within phase scope
