# Phase 4: Content Production and Verification - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 04-content-production-and-verification
**Areas discussed:** Production context loading, Quality gate implementation, Deviation handling, Context isolation strategy

---

## Production Context Loading

### Multi-Asset Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Hero-first, then derivatives in parallel | Produce hero asset first, spawn parallel contexts for derivatives | ✓ |
| All assets in parallel | Spawn all simultaneously, no cross-asset consistency | |
| Sequential, one at a time | Slowest but maximum consistency | |

**User's choice:** Hero-first, then derivatives in parallel

### Playbook Loading
| Option | Description | Selected |
|--------|-------------|----------|
| Yes, load matching playbook | Match asset type to discipline playbook | ✓ |
| No playbooks in MVP | Produce without discipline guidance | |
| You decide | | |

**User's choice:** Yes, load matching playbook

---

## Quality Gate Implementation

### Tier 1 Gate Strictness
| Option | Description | Selected |
|--------|-------------|----------|
| Hard fail — asset cannot proceed | Must fix via /ttm-fix, no override | |
| Soft fail with override option | Flagged but user can Accept+log | ✓ |
| You decide | | |

**User's choice:** Soft fail with override — consistent with Phase 3 D-05

### Feedback Format
| Option | Description | Selected |
|--------|-------------|----------|
| Line-level annotations | Specific line references per finding | |
| Section-level summary | Gate-level pass/fail with summary | |
| Both — summary + drill-down | Summary table at top, line-level details below | ✓ |

**User's choice:** Both — summary + drill-down

---

## Deviation Handling

### Accept+log Recording
| Option | Description | Selected |
|--------|-------------|----------|
| Full deviation record | Gate, failure, justification, timestamp, asset — in STATE.md + DEVIATIONS.md | ✓ |
| Minimal state update | Just mark gate as 'accepted' in STATE.md | |
| You decide | | |

**User's choice:** Full deviation record

### Escalate Behavior
| Option | Description | Selected |
|--------|-------------|----------|
| Immediate — launch positioning shift | Start /ttm-positioning-shift inline, pause verification | ✓ |
| Deferred — flag for later | Record escalation, user runs shift separately | |
| User choice at escalation time | Ask each time | |

**User's choice:** Immediate — launch positioning shift workflow

---

## Context Isolation Strategy

### Isolation Mechanism
| Option | Description | Selected |
|--------|-------------|----------|
| context: fork in SKILL.md | Built-in Claude Code feature | |
| Task() spawning from workflow | More control over context per agent | |
| You decide | Claude picks best approach | ✓ |

**User's choice:** You decide (Claude's Discretion)

### State Passing
| Option | Description | Selected |
|--------|-------------|----------|
| File paths only | Just asset locations on disk | |
| File paths + production metadata | Paths + manifest (playbook, context loaded, timestamps) | ✓ |
| You decide | | |

**User's choice:** File paths + production metadata

---

## Claude's Discretion

- Context isolation mechanism (context:fork vs Task())
- Production manifest format
- Gate evaluation prompting strategy
- Playbook loading mechanism (asset type → playbook mapping)

## Deferred Ideas

None — discussion stayed within phase scope
