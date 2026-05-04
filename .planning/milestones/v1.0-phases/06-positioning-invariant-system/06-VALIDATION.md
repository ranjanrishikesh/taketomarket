---
phase: 6
slug: positioning-invariant-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-28
---

# Phase 6 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in `node --test` / manual CLI verification |
| **Config file** | none -- CLI modules tested via direct invocation |
| **Quick run command** | `node bin/ttm-tools.cjs campaign list --raw` |
| **Full suite command** | Manual: invoke each new CLI subcommand with test data |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node bin/ttm-tools.cjs campaign list --raw`
- **After every plan wave:** Run drift-log append + campaign list + verify SKILL.md loads
- **Before `/gsd-verify-work`:** Full manual end-to-end test of both workflows
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | POSN-05 | T-06-02 | Sanitize input before DRIFT-LOG.md append | unit | `node bin/ttm-tools.cjs drift-log append --event-type audit --source test --details "test" --affected 0 --raw` | No -- W0 | pending |
| 06-01-02 | 01 | 1 | POSN-02 | T-06-01 | Path traversal check on campaign slug | unit | `node bin/ttm-tools.cjs campaign list --raw` | No -- W0 | pending |
| 06-02-01 | 02 | 1 | POSN-04 | -- | Drift % calculation from GATE-01 reuse | manual-only | Run `/ttm-positioning-check` with test campaign | N/A | pending |
| 06-03-01 | 03 | 2 | POSN-03 | -- | Shift requires reasoning + migration + approval | manual-only | Run `/ttm-positioning-shift` end-to-end | N/A | pending |
| 06-03-02 | 03 | 2 | POSN-01 | -- | Context loading matrix updated | manual-only | Verify `references/context-loading.md` includes positioning-check | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `bin/lib/drift-log.cjs` -- new module for DRIFT-LOG.md operations (append, initialize)
- [ ] `campaign list` subcommand in `bin/lib/campaign.cjs` -- campaign enumeration for read-only enforcement
- [ ] `templates/drift-log.md` -- DRIFT-LOG.md initialization template

*These must be created in Wave 1 Plan 01 before downstream tasks can be tested.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| POSITIONING.md loaded in every phase context | POSN-01 | Verification requires reading context-loading.md loading matrix | Check that positioning-check and positioning-shift are listed as Tier 2 consumers |
| Read-only enforcement blocks writes | POSN-02 | Prompt-level enforcement cannot be unit-tested | Run a lifecycle workflow and attempt to modify POSITIONING.md |
| Shift workflow end-to-end | POSN-03 | Multi-step interactive workflow | Run /ttm-positioning-shift with test positioning change |
| Positioning-check drift report | POSN-04 | Requires campaign assets to sample | Create test campaign with assets, run /ttm-positioning-check |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
