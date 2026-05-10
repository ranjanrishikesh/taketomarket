---
phase: 13
slug: unit-tests-for-bin-lib-modules
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test (built-in, Node 18+) |
| **Config file** | package.json scripts.test |
| **Quick run command** | `node --test test/*.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test test/*.test.cjs`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | TEST-02 | — | N/A | unit | `node --test test/slug.test.cjs` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | TEST-03 | — | N/A | unit | `node --test test/state.test.cjs` | ❌ W0 | ⬜ pending |
| 13-01-03 | 01 | 1 | TEST-06 | — | N/A | unit | `node --test test/commit.test.cjs` | ❌ W0 | ⬜ pending |
| 13-01-04 | 01 | 1 | TEST-07 | — | N/A | unit | `node --test test/core.test.cjs` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | TEST-04 | — | N/A | unit | `node --test test/campaign.test.cjs` | ❌ W0 | ⬜ pending |
| 13-02-02 | 02 | 1 | TEST-05 | — | N/A | unit | `node --test test/health.test.cjs` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 2 | TEST-01 | — | N/A | integration | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/slug.test.cjs` — stubs for TEST-02
- [ ] `test/state.test.cjs` — stubs for TEST-03
- [ ] `test/campaign.test.cjs` — stubs for TEST-04
- [ ] `test/health.test.cjs` — stubs for TEST-05
- [ ] `test/commit.test.cjs` — stubs for TEST-06
- [ ] `test/core.test.cjs` — stubs for TEST-07

*Existing infrastructure covers test framework (Phase 12).*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
