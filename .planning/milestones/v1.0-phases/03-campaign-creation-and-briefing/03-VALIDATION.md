---
phase: 03
slug: campaign-creation-and-briefing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-23
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in assertions (no test framework — zero npm deps) |
| **Config file** | none — direct node -e assertions |
| **Quick run command** | `node bin/ttm-tools.cjs health --raw` |
| **Full suite command** | `node bin/ttm-tools.cjs health && node bin/ttm-tools.cjs campaign health test-campaign 2>/dev/null; echo $?` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 03-01-01 | 01 | 1 | LIFE-01 | integration | `node bin/ttm-tools.cjs campaign init "test" --raw` | ⬜ pending |
| 03-02-01 | 02 | 2 | LIFE-02 | structural | `grep -q "<purpose>" workflows/lifecycle/research.md` | ⬜ pending |
| 03-03-01 | 03 | 2 | LIFE-03 | structural | `grep -q "outcome_metric" workflows/lifecycle/brief.md` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Existing infrastructure covers campaign creation and state management from Phase 1/2

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full campaign creation flow | LIFE-01 | Requires running /ttm-new-campaign with real input | Run /ttm-new-campaign, verify CAMPAIGNS/<slug>/ created with all scaffold files |
| Research with web search tools | LIFE-02 | Requires MCP tool availability | Run /ttm-research with WebSearch available, verify structured output |
| Brief positioning gate warning | LIFE-04 | Requires running /ttm-brief with intentional drift | Create brief with misaligned positioning, verify warning appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
