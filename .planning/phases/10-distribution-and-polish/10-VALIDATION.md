---
phase: 10
slug: distribution-and-polish
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-04
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in test runner + manual CLI validation |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `node bin/ttm-tools.cjs health --structural` |
| **Full suite command** | `node --test tests/phase-10/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node bin/ttm-tools.cjs health --structural`
- **After every plan wave:** Run `node --test tests/phase-10/`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DIST-01 | — | N/A | integration | `node install.js --runtime claude --dry-run` | ❌ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | DIST-02 | — | N/A | integration | `node install.js --runtime codex --dry-run` | ❌ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | DIST-03 | — | N/A | unit | `node --test tests/phase-10/post-install-validation.test.cjs` | ❌ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | DIST-04 | — | N/A | integration | `node install.js --help` | ❌ W0 | ⬜ pending |
| 10-02-01 | 02 | 2 | UTIL-01 | — | N/A | integration | `grep -q "AskUserQuestion" workflows/reference-mgmt/brand-refresh.md` | ❌ W0 | ⬜ pending |
| 10-02-02 | 02 | 2 | UTIL-02 | — | N/A | integration | `grep -q "AskUserQuestion" workflows/reference-mgmt/icp-refresh.md` | ❌ W0 | ⬜ pending |
| 10-02-03 | 02 | 2 | UTIL-03 | — | N/A | integration | `grep -q "AskUserQuestion" workflows/reference-mgmt/competitor-scan.md` | ❌ W0 | ⬜ pending |
| 10-03-01 | 03 | 2 | UTIL-04 | — | N/A | integration | `grep -q "gates" workflows/discipline/seo-audit.md` | ❌ W0 | ⬜ pending |
| 10-03-02 | 03 | 2 | UTIL-05 | — | N/A | integration | `grep -q "gates" workflows/discipline/aeo-check.md` | ❌ W0 | ⬜ pending |
| 10-03-03 | 03 | 2 | UTIL-06 | — | N/A | integration | `grep -q "keyword" workflows/discipline/keyword-map.md` | ❌ W0 | ⬜ pending |
| 10-03-04 | 03 | 2 | UTIL-07 | — | N/A | integration | `grep -q "gates" workflows/discipline/email-preflight.md` | ❌ W0 | ⬜ pending |
| 10-03-05 | 03 | 2 | UTIL-08 | — | N/A | integration | `grep -q "gates" workflows/discipline/affiliate-kit.md` | ❌ W0 | ⬜ pending |
| 10-04-01 | 04 | 3 | UTIL-09 | — | N/A | integration | `grep -q "Task()" workflows/discipline/repurpose.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

> **Strategy:** This phase produces Markdown workflow files and a single CJS installer — not application code with unit-testable functions. Verification uses structural grep/test checks inline (file existence, section presence, pattern compliance). A dedicated test runner adds no value over the grep-based approach already embedded in each task's `<verify><automated>` block.

- [x] Wave 0 retired — grep-based structural checks are the verification strategy for this phase type

---

## Notes

- install.js uses only Node.js built-ins (fs, path, os) — no test dependencies needed
- Utility command validation is structural (file exists, correct sections present)
- /ttm-repurpose validation requires campaign fixture data for full integration test
