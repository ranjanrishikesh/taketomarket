# Phase 9: Measurement, Learning, and Remaining Playbooks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Date:** 2026-04-29
**Phase:** 09-measurement-learning-and-remaining-playbooks
**Areas discussed:** Measurement data flow, Learn-to-reference loop, Meta-gates integration, Remaining playbooks approach

---

## Measurement Data Flow

### Analytics Input Method

| Option | Description | Selected |
|--------|-------------|----------|
| Structured paste prompts | AI prompts for specific metrics one by one | |
| Free-form paste + parse | User pastes CSV/table, AI parses | |
| Template fill | Generate template, user fills in editor | |
| Multi-source (user request) | MCP tool integration + CSV/MD paste + batch structured questions | Yes |

**User's choice:** Multi-source with MCP tool detection, CSV/MD paste, and batch questions (ask many at once, not one at a time)

### Attribution Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 side-by-side | Comparison table of all models | |
| Outcome-first summary | Outcome metric first, time-decay default, others on request | Yes |
| Progressive disclosure | Outcome first, expandable sections for other models | |

**User's choice:** Outcome-first summary

---

## Learn-to-Reference Loop

### Edit Proposal Format

| Option | Description | Selected |
|--------|-------------|----------|
| Diff-style proposals | Before/after diffs per reference file | |
| Narrative + apply | Natural language lessons with "Apply to X.md?" per lesson | Yes |
| Batch review | Checklist of all proposed edits, apply selected | |

**User's choice:** Narrative + apply

---

## Meta-Gates Integration

### Where Meta-Gates Run

| Option | Description | Selected |
|--------|-------------|----------|
| During brief | Fire before production. Catches issues early. | |
| During verify | Fire alongside quality gates. After production, before ship. | Yes |
| Standalone command | Independent /ttm-meta-check. Not tied to lifecycle. | |

**User's choice:** During verify

---

## Remaining Playbooks

### Depth Compared to Phase 8

| Option | Description | Selected |
|--------|-------------|----------|
| Same depth | Same template, 4-7 gates, 250-350 lines. Same quality bar. | Yes |
| Lighter weight | Same template, fewer gates (2-3), shorter. | |
| Graduated depth | YouTube/Paid Ads full, others lighter. | |

**User's choice:** Same depth

---

## Claude's Discretion

- Exact gate definitions for 5 remaining playbooks
- Meta-gate wiring into verify.md
- Measurement template format
- Learn workflow reference file update detection
- LEARNINGS.md pattern extraction algorithm

## Deferred Ideas

None
