---
phase: 04
slug: content-production-and-verification
status: draft
nyquist_compliant: true
wave_0_complete: true
wave_0_exception: "This is a Markdown skill project with zero npm dependencies. No test framework exists. All validation uses structural grep checks and CLI assertions. Wave 0 test files (test-manifest.cjs, test-gate-fields.cjs) are deferred — structural verification via automated grep/node commands in each task's <verify> block provides equivalent coverage."
created: 2026-04-27
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in assertions + grep structural checks |
| **Config file** | none |
| **Quick run command** | `node bin/ttm-tools.cjs health --raw` |
| **Full suite command** | `node bin/ttm-tools.cjs health && grep -q "<purpose>" workflows/lifecycle/produce.md && grep -q "<purpose>" workflows/lifecycle/verify.md` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Produce generates assets in fresh context | LIFE-06 | Requires running /ttm-produce with real brief | Create test campaign, run /ttm-produce, verify ASSETS/ populated |
| Hero-first then derivatives | LIFE-07 | Requires multi-asset campaign | Create campaign with 3+ assets, verify hero completes before derivatives |
| Verify runs in separate context | LIFE-08 | Requires observing context isolation | Run /ttm-verify after produce, verify no produce reasoning in verify output |
| 10 gates evaluated per asset | GATE-01-10 | Requires full verify run | Run /ttm-verify, verify all 10 gates appear in output |
| Deviation 3-option workflow | LIFE-09 | Requires interactive testing | Trigger gate failure, test Correct/Accept+log/Escalate options |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
