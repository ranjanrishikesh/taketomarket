---
phase: 1
slug: plugin-scaffold-and-tooling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in assert + shell scripts |
| **Config file** | none — Phase 1 creates the framework |
| **Quick run command** | `node bin/ttm-tools.cjs health` |
| **Full suite command** | `node bin/ttm-tools.cjs health && ls skills/ttm-*/SKILL.md | wc -l` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node bin/ttm-tools.cjs health`
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | — | N/A | integration | `test -f .claude-plugin/plugin.json` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-02 | — | N/A | integration | `ls skills/ttm-*/SKILL.md \| wc -l` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-03 | — | N/A | integration | `wc -l skills/ttm-*/SKILL.md \| awk '$1 > 500'` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUND-05 | — | N/A | unit | `node bin/ttm-tools.cjs slug "Test Campaign"` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | FOUND-04 | — | N/A | manual | Review context loading docs | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | FOUND-06 | — | N/A | integration | `test -f templates/reference-files/positioning.md` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | FOUND-07 | — | N/A | integration | `test -d templates/reference-files` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] All validation is structural (file existence, line count) — no test framework needed for Phase 1
- [ ] `bin/ttm-tools.cjs health` subcommand validates directory structure

*Phase 1 creates infrastructure — validation is structural, not behavioral.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skill commands visible in Claude Code | FOUND-01 | Requires Claude Code runtime | Install plugin, run `/ttm-` and check autocomplete |
| Two-tier context loading correct | FOUND-04 | Design document, not runtime behavior | Review CONTEXT.md loading strategy section |
| AGENTS.md generation correct | FOUND-06 | Requires Codex runtime | Install in Codex environment, verify commands register |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
