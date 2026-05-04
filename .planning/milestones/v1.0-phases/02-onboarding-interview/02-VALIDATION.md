---
phase: 02
slug: onboarding-interview
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node.js built-in assertions (no test framework — Phase 1 has zero npm deps) |
| **Config file** | none — direct node -e assertions |
| **Quick run command** | `node bin/ttm-tools.cjs health --raw` |
| **Full suite command** | `node bin/ttm-tools.cjs health && node bin/ttm-tools.cjs init` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node bin/ttm-tools.cjs health --raw`
- **After every plan wave:** Run `node bin/ttm-tools.cjs health && node bin/ttm-tools.cjs init`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ONBD-01 | — | N/A | integration | `grep -q "AskUserQuestion\|text_mode" workflows/setup/init.md` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | ONBD-02 | — | N/A | integration | `ls .marketing/*.md 2>/dev/null \| wc -l` (after manual run) | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | ONBD-11 | — | N/A | unit | `grep -q "banned_phrases\|specificity" workflows/setup/init.md` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Workflow file `workflows/setup/init.md` — main interview workflow (does not exist yet)
- [ ] Supporting files for question bank and validation rules (if split from main workflow)

*Existing infrastructure covers CLI tools and templates from Phase 1.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Interview produces coherent reference files | ONBD-01 | Requires running full interview with real answers | Run /ttm-init, answer all questions, verify .marketing/ files are populated |
| Vague answer rejection works | ONBD-11 | Requires interactive testing with intentionally vague inputs | Run /ttm-init, give vague answers like "innovative solution", verify re-prompt |
| Text-mode fallback works | ONBD-03 | Requires Codex or --text environment | Run /ttm-init --text, verify numbered list prompts |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
