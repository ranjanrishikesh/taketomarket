---
phase: 7
slug: state-management-and-campaign-operations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 7 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node --test` / manual CLI invocation |
| **Config file** | none -- CLI tools tested via direct invocation |
| **Quick run command** | `node bin/ttm-tools.cjs health --raw` |
| **Full suite command** | Manual CLI exercise of all 5 commands |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node bin/ttm-tools.cjs health --raw`
- **After every plan wave:** Exercise new CLI subcommands with test data
- **Before `/gsd-verify-work`:** Full manual end-to-end test of all 5 workflows
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | STAT-03 | T-07-01 | Archive path containment check | smoke | `node bin/ttm-tools.cjs campaign archive test-slug --raw` | No -- W0 | pending |
| 07-01-02 | 01 | 1 | STAT-04 | -- | Extended health validation | smoke | `node bin/ttm-tools.cjs health --full --raw` | No -- W0 | pending |
| 07-02-01 | 02 | 1 | STAT-01 | -- | State dashboard output | manual-only | Run `/ttm-state` with test campaigns | N/A | pending |
| 07-02-02 | 02 | 1 | STAT-02 | -- | Resume context loading | manual-only | Run `/ttm-resume <slug>` after pausing | N/A | pending |
| 07-03-01 | 03 | 2 | STAT-03 | -- | Archive + learnings extract | manual-only | Run `/ttm-archive <slug>` on shipped campaign | N/A | pending |
| 07-04-01 | 04 | 2 | UTIL-10 | -- | Multi-campaign next routing | manual-only | Run `/ttm-next` with multiple active campaigns | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `campaign archive` subcommand in campaign.cjs -- archive move operation with path containment
- [ ] Extended health checks in health.cjs -- staleness, velocity, gate consistency
- [ ] ALLOWED_FIELDS extension for archive/cancel state fields

*These must be created in Wave 1 Plan 01 before downstream workflows can be tested.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| State dashboard shows all campaigns | STAT-01 | Requires active campaigns to display | Create 2+ test campaigns, run /ttm-state |
| Resume loads context and suggests next | STAT-02 | Requires interrupted session state | Advance campaign to produce, run /ttm-resume |
| Archive moves directory and extracts learnings | STAT-03 | Requires shipped campaign | Ship a test campaign, run /ttm-archive |
| Health validates full directory | STAT-04 | Requires .marketing/ with campaigns | Run /ttm-health on populated .marketing/ |
| Next routes across campaigns | UTIL-10 | Requires multiple active campaigns | Create 3 campaigns at different phases, run /ttm-next |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
