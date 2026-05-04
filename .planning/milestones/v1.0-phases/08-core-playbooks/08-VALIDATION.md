---
phase: 8
slug: core-playbooks
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-29
---

# Phase 8 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification via file inspection + grep |
| **Config file** | none |
| **Quick run command** | `ls playbooks/*.md \| wc -l` |
| **Full suite command** | Manual: verify each playbook has required sections |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** `ls playbooks/*.md \| wc -l` (count playbooks created)
- **After every plan wave:** Verify playbook structure matches base template
- **Before `/gsd-verify-work`:** Full section-by-section inspection
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | PLAY-01 | smoke | `test -f playbooks/base.md && grep -c "Discipline Gates" playbooks/base.md` | No -- W0 | pending |
| 08-01-02 | 01 | 1 | PLAY-01 | smoke | `grep -c "DISC-" gates/gate-evaluation.md` | Existing | pending |
| 08-02-01 | 02 | 2 | PLAY-02 | smoke | `test -f playbooks/seo.md && grep -c "DISC-SEO" playbooks/seo.md` | No -- W0 | pending |
| 08-02-02 | 02 | 2 | PLAY-03 | smoke | `test -f playbooks/aeo.md && grep -c "DISC-AEO" playbooks/aeo.md` | No -- W0 | pending |
| 08-03-01 | 03 | 2 | PLAY-07 | smoke | `test -f playbooks/email.md && grep -c "DISC-EMAIL" playbooks/email.md` | No -- W0 | pending |
| 08-03-02 | 03 | 2 | PLAY-05, PLAY-06 | smoke | `test -f playbooks/linkedin.md && test -f playbooks/social.md` | No -- W0 | pending |

---

## Wave 0 Requirements

- [ ] `playbooks/base.md` -- base playbook template with inheritance contract
- [ ] Verify workflow extension for discipline gate evaluation

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Playbook loaded by produce workflow | PLAY-01 | Requires running /ttm-produce with playbook | Create campaign, run produce, verify playbook context loaded |
| Discipline gates evaluated in verify | PLAY-01 | Requires running /ttm-verify with playbook | Run verify on SEO asset, check discipline gates in report |
| Base gate tier override applied | PLAY-01 | Requires verify with override | Run verify on SEO asset, check GATE-10 is Tier 1 |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity maintained
- [ ] Wave 0 covers all MISSING references
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
