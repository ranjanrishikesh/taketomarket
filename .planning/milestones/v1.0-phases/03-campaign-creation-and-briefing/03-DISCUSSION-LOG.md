# Phase 3: Campaign Creation and Briefing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-23
**Phase:** 03-campaign-creation-and-briefing
**Areas discussed:** Campaign directory structure, Research workflow depth, Brief generation and enforcement, Campaign state machine

---

## Campaign Directory Structure

### Reference File Access
| Option | Description | Selected |
|--------|-------------|----------|
| Symlinks to root .marketing/ files | Changes instantly visible in all campaigns. Simplest. | |
| Copy-on-create snapshots | Each campaign preserves reference state at creation. More isolation. | |
| Read from root directly | Workflows always read from .marketing/ root. Cleanest. | |

**User's choice:** "Research the best and error free way to do this" — marked as Claude's Discretion with research
**Notes:** User wants the researcher to investigate tradeoffs and pick the most reliable approach

### Campaign Contents at Creation
| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: STATE.md + BRIEF.md only | Everything else added as phases progress | |
| Full scaffold: STATE.md + BRIEF.md + RESEARCH.md + ASSETS/ | Pre-create all directories and placeholder files | ✓ |
| You decide | Claude picks best structure | |

**User's choice:** Full scaffold
**Notes:** Users see the full campaign structure upfront

---

## Research Workflow Depth

### Data Gathering Method
| Option | Description | Selected |
|--------|-------------|----------|
| Manual paste only | User pastes SERP results, competitor URLs. Simplest. | |
| Web search + manual paste hybrid | Use WebSearch/WebFetch when available, paste fallback | ✓ |
| You decide | Claude picks based on tool availability | |

**User's choice:** Web search + manual paste hybrid
**Notes:** Leverage MCP tools when available, graceful fallback

### Output Format
| Option | Description | Selected |
|--------|-------------|----------|
| Structured markdown sections | Fixed sections, easy to consume in /ttm-brief | |
| Flexible narrative format | Free-form analysis document | |
| Structured with confidence scores | Structured sections + HIGH/MEDIUM/LOW confidence tags | ✓ |

**User's choice:** Structured with confidence scores
**Notes:** Brief can weight insights by data quality

---

## Brief Generation and Enforcement

### Positioning Gate Failure Behavior
| Option | Description | Selected |
|--------|-------------|----------|
| Hard block — refuse to generate | Forces user to fix. Strictest enforcement. | |
| Generate with prominent warning | Brief generated but with visible drift warning | ✓ |
| Block with guided fix | Stop, show drift details, offer rewording suggestions | |

**User's choice:** Generate with prominent warning
**Notes:** Softer than expected given the project's "no asset ships without both" core value. User prefers keeping momentum over hard blocks.

### Outcome Metric Enforcement
| Option | Description | Selected |
|--------|-------------|----------|
| Strict: refuse without both metrics + target values | Won't complete without both output AND outcome | |
| Guided: prompt but accept partial | Strongly encourage both, accept outcome-only | ✓ |
| You decide | Claude picks based on core value | |

**User's choice:** Guided — accept partial
**Notes:** Outcome metric required, output metric encouraged but not mandatory at brief stage

---

## Campaign State Machine

### Phase Ordering
| Option | Description | Selected |
|--------|-------------|----------|
| Strict — must follow sequence | Each command refuses if prerequisites incomplete | |
| Guided — warn but allow skipping | Warns when out of order, allows override | ✓ |
| Flexible — any order | No enforcement, just tracking | |

**User's choice:** Guided — warn but allow skipping
**Notes:** Consistent with the soft enforcement pattern from brief section

### Per-Campaign State Tracking
| Option | Description | Selected |
|--------|-------------|----------|
| Phase + timestamps + gate results | Rich audit trail with quality gate history | ✓ |
| Phase + timestamps only | Simple tracking | |
| You decide | Claude designs format | |

**User's choice:** Phase + timestamps + gate results
**Notes:** Rich state supports /ttm-learn retrospectives

---

## Claude's Discretion

- Reference file access mechanism (research the best error-free approach)
- RESEARCH.md template structure (design based on /ttm-brief consumption needs)
- Per-campaign STATE.md frontmatter schema (design based on downstream command needs)

## Deferred Ideas

None — discussion stayed within phase scope
