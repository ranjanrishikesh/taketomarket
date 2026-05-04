---
phase: 05-review-fix-and-ship
verified: 2026-04-28T10:30:00Z
status: passed
score: 7/7 must-haves verified
---

# Phase 5: Review, Fix, and Ship Verification Report

**Phase Goal:** Users can review assets with structured checklists, fix failures through root-cause analysis, and ship with verified launch readiness
**Verified:** 2026-04-28T10:30:00Z
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User runs /ttm-review and sees assets presented with gate summary + content preview + 4 mandatory review questions | VERIFIED | review.md (420 lines) contains Step 4 hero display with full gate summary table (10 gates), content preview (~500 chars hero, ~300 chars derivatives), and all 4 mandatory questions (Positioning Reinforcement, Outcome Realism, Claim Substantiation, Competitor Differentiation). AskUserQuestion used for interactive prompts with text-mode fallback. |
| 2 | User can select Approve, Revise, or Reject for each asset independently in one session | VERIFIED | review.md Step 4 (hero) and Step 5 (batch derivatives) both present 3-outcome selection per asset. Mixed outcomes supported per D-13. MANIFEST.json updated with per-asset review_status. |
| 3 | Revise outcome collects structured feedback and campaign state is updated | VERIFIED | review.md collects failed checklist items, severity, and freeform feedback. Writes REVIEW-FEEDBACK-[NAME].md per revised asset. Campaign state updated with review.run_count, review.last_run, review.overall_result via ttm-tools.cjs campaign update. |
| 4 | User runs /ttm-fix and the system diagnoses root causes, generates fix briefs, re-produces in Task() context, re-verifies against all 10 gates | VERIFIED | fix.md (483 lines) contains: 7-category root cause taxonomy with user confirmation (Step 5a), fix brief generation from template with failure/preservation/correction sections (Step 5b), Task() re-production with fix brief path as [BRIEF_PATH] NOT original brief (Step 5c), and inline 10-gate re-verification per gate-evaluation.md pattern (Step 5d). |
| 5 | Fix loop capped at 3 attempts with escalation to human after cap | VERIFIED | fix.md Step 5 contains WHILE attempt_count < 3 loop. Step 6 handles 3-attempt escalation: displays all attempt histories, failure pattern analysis, suggested manual edits, sets review_status to "needs-human-fix". FIX-LOG.md tracks all attempts. |
| 6 | User runs /ttm-ship and sees dynamic launch checklist based on campaign channel mix | VERIFIED | ship.md (485 lines) Step 4 generates dynamic checklist from ship-checklist-items.md based on asset types in ship-ready list. Only relevant channel sections included (not hardcoded full list). 9 channel sections available: Universal, Blog/SEO, Email, LinkedIn, Social/Twitter, Landing Page, Video/YouTube, Paid Ads, Default. |
| 7 | AI auto-checks verifiable items and user manually confirms unverifiable items | VERIFIED | ship.md Step 5 runs AI auto-checks for [AI]-tagged items (UTM validity, draft markers, verification status, review status, plus channel-specific checks). Step 6 presents results and collects human confirmations for [HUMAN]-tagged items via AskUserQuestion with grouped prompts per section. |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `bin/lib/campaign.cjs` | 9 new state fields in ALLOWED_FIELDS + cmdCampaignInit | VERIFIED | 249 lines. 9 fields in ALLOWED_FIELDS (lines 212-216), 9 fields in cmdCampaignInit stateContent (lines 109-117). `node -e "require('./bin/lib/campaign.cjs')"` exits 0. |
| `skills/ttm-review/SKILL.md` | AskUserQuestion in allowed-tools, workflow pointer, no stub text | VERIFIED | 13 lines. Contains `AskUserQuestion` in allowed-tools. Points to `workflows/lifecycle/review.md`. No "Not yet implemented" text. |
| `skills/ttm-fix/SKILL.md` | Task + AskUserQuestion in allowed-tools, workflow pointer, no stub text | VERIFIED | 13 lines. Contains both `Task` and `AskUserQuestion` in allowed-tools. Points to `workflows/lifecycle/fix.md`. No "Not yet implemented" text. |
| `skills/ttm-ship/SKILL.md` | AskUserQuestion in allowed-tools, workflow pointer, no stub text | VERIFIED | 13 lines. Contains `AskUserQuestion` in allowed-tools. Points to `workflows/lifecycle/ship.md`. No "Not yet implemented" text. |
| `references/review-checklist.md` | 4 mandatory questions, revision feedback, batch format | VERIFIED | 78 lines. Contains all 4 question headers (Positioning Reinforcement, Outcome Realism, Claim Substantiation, Competitor Differentiation). Contains "Structured Revision Feedback (D-12)" section. Contains "Batch Derivative Review Format (D-02)" section. |
| `references/ship-checklist-items.md` | Channel-specific checklist with [AI]/[HUMAN] tags | VERIFIED | 94 lines. 9 sections: Universal, Blog/SEO, Email, LinkedIn, Social/Twitter, Landing Page, Video/YouTube, Paid Ads, Default. All items tagged [AI] or [HUMAN]. |
| `templates/fix-log.md` | [SLUG] placeholder, FIX ENTRIES delimiter | VERIFIED | 22 lines. Contains `[SLUG]` placeholder (3 occurrences). Contains `<!-- FIX ENTRIES BELOW THIS LINE -->` delimiter. |
| `templates/fix-brief.md` | [ROOT_CAUSE_CATEGORY], failure/passing/correction sections | VERIFIED | 59 lines. Contains `[ROOT_CAUSE_CATEGORY]` (2 occurrences). Contains "What Failed", "What Passed (PRESERVE these elements)", and "Specific Corrections Required" sections. |
| `workflows/lifecycle/review.md` | Complete review workflow under 500 lines | VERIFIED | 420 lines (under 500). Contains purpose, required_reading, process, success_criteria, output sections. @-references review-checklist.md. Contains text-mode detection. |
| `workflows/lifecycle/fix.md` | Complete fix workflow under 500 lines | VERIFIED | 483 lines (under 500). Contains purpose, required_reading, process, success_criteria, output sections. @-references gate-evaluation.md and ttm-producer.md. Contains text-mode detection. |
| `workflows/lifecycle/ship.md` | Complete ship workflow under 500 lines | VERIFIED | 485 lines (under 500). Contains purpose, required_reading, process, success_criteria, output sections. @-references ship-checklist-items.md. Contains text-mode detection. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `campaign.cjs` | review workflow | ALLOWED_FIELDS permits review.run_count, review.last_run, review.overall_result | VERIFIED | All 3 review fields in ALLOWED_FIELDS (line 212) and cmdCampaignInit (lines 109-111) |
| `campaign.cjs` | fix workflow | ALLOWED_FIELDS permits fix.run_count, fix.last_run, fix.overall_result | VERIFIED | All 3 fix fields in ALLOWED_FIELDS (line 214) and cmdCampaignInit (lines 112-114) |
| `campaign.cjs` | ship workflow | ALLOWED_FIELDS permits ship.status, ship.shipped_at, ship.checklist_result | VERIFIED | All 3 ship fields in ALLOWED_FIELDS (line 216) and cmdCampaignInit (lines 115-117) |
| `review.md` | VERIFICATION.md | Reads gate results to display summary table | VERIFIED | 5 occurrences of VERIFICATION.md reference in review.md |
| `review.md` | MANIFEST.json | Reads asset list, writes review_status per asset | VERIFIED | 10 occurrences of MANIFEST.json reference in review.md |
| `review.md` | review-checklist.md | @-syntax reference for review questions | VERIFIED | @${CLAUDE_PLUGIN_ROOT}/references/review-checklist.md in required_reading |
| `review.md` | campaign update | Updates review.run_count, review.last_run, review.overall_result | VERIFIED | 5 campaign update calls in Step 7 |
| `review.md` | /ttm-fix | Auto-trigger instruction for revised assets (D-15) | VERIFIED | 7 occurrences of ttm-fix reference, clear "Run /ttm-fix" instruction in Step 8 |
| `fix.md` | ttm-producer.md | Task() subagent call with fix brief path | VERIFIED | 2 references to ttm-producer.md, 4 Task() invocations documented |
| `fix.md` | gate-evaluation.md | Re-verification following verify.md pattern | VERIFIED | 3 references to gate-evaluation.md in required_reading and Step 5d |
| `fix.md` | FIX-LOG.md | Append fix attempt history | VERIFIED | 11 references to FIX-LOG.md throughout workflow |
| `fix.md` | fix-brief.md | Generate fix brief from template | VERIFIED | 7 references to FIX-BRIEF throughout workflow |
| `fix.md` | MANIFEST.json | Update review_status and fix_attempts | VERIFIED | MANIFEST.json referenced in Steps 3, 7 with explicit JSON schema |
| `fix.md` | REVIEW-FEEDBACK | Reads structured review feedback for root cause analysis | VERIFIED | 2 references to REVIEW-FEEDBACK files |
| `ship.md` | ship-checklist-items.md | @-syntax reference for checklist definitions | VERIFIED | @${CLAUDE_PLUGIN_ROOT}/references/ship-checklist-items.md in required_reading, 3 total references |
| `ship.md` | MANIFEST.json | Read review_status, write ship_status per asset | VERIFIED | 10 references to MANIFEST.json in ship.md |
| `ship.md` | BRIEF.md | Read channel mix for dynamic checklist | VERIFIED | 3 references to BRIEF.md |
| `ship.md` | CHANNELS.md | UTM schema for validation | VERIFIED | 3 references to CHANNELS.md |
| `ship.md` | campaign update | Updates ship.status, ship.shipped_at, ship.checklist_result | VERIFIED | 5 campaign update calls in Step 9 |
| SKILL.md (review) | review.md | Workflow routing | VERIFIED | `Read and follow the workflow at ${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/review.md` |
| SKILL.md (fix) | fix.md | Workflow routing | VERIFIED | `Read and follow the workflow at ${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/fix.md` |
| SKILL.md (ship) | ship.md | Workflow routing | VERIFIED | `Read and follow the workflow at ${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/ship.md` |
| Dependent files | gates, agents, context-loading | Referenced files exist on disk | VERIFIED | references/context-loading.md, gates/base-gates.md, gates/gate-evaluation.md, agents/ttm-producer.md all exist |

### Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| LIFE-10: /ttm-review presents assets with structured review checklist (positioning reinforcement, outcome realism, claim substantiation, competitor differentiation) | SATISFIED | review.md presents all 4 questions per asset with gate summary + content preview. review-checklist.md contains full question definitions. Hero-first then batch derivative ordering (D-02). Per-asset outcomes: Approve/Revise/Reject (D-03). |
| LIFE-11: /ttm-fix performs root cause -> fix brief -> re-produce in isolated context -> re-verify cycle | SATISFIED | fix.md contains: 7-category root cause analysis with user confirmation (D-05), fix brief generation with failure/preservation/correction sections, Task() re-production with fix brief path (not original brief), all 10 gates re-verified per attempt (D-06), results shown per iteration (D-07). |
| LIFE-12: Fix phase capped at 3 attempts per asset before escalating to human | SATISFIED | fix.md enforces WHILE attempt_count < 3 loop (Step 5). Step 6 handles 3-attempt escalation with full attempt history display, failure pattern analysis, suggested manual edits, and "needs-human-fix" status. FIX-LOG.md persists all attempt data. |
| LIFE-13: /ttm-ship generates launch checklist with tracking installed, UTMs confirmed, funnel tested, assets finalized | SATISFIED | ship.md generates dynamic checklist from campaign channel mix (D-09). AI auto-checks UTM validity, draft markers, verification status, review status. Channel-specific checks for 7 asset types. Human confirms unverifiable items (D-10). Per-asset ship status (D-11). |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No anti-patterns detected across any Phase 5 files |

No TODO, FIXME, placeholder, or stub patterns found in any of the 11 Phase 5 files. The only occurrences of "TODO", "PLACEHOLDER", etc. in ship.md are within instructions that tell the AI to *scan for* these patterns in user assets -- not actual stubs.

### Human Verification Required

### 1. Review Workflow Interactive Flow
**Test:** Run `/ttm-review <slug>` on a campaign with verified assets
**Expected:** 4 mandatory questions presented per asset via AskUserQuestion, hero shown first with full gate table, derivatives in batch with abbreviated gates, outcomes collected per asset, REVIEW-FEEDBACK files written for Revise outcomes
**Why human:** Interactive AskUserQuestion flow cannot be verified programmatically -- needs real conversation context

### 2. Fix Loop End-to-End
**Test:** Run `/ttm-fix <slug>` on a campaign with Revise-marked assets
**Expected:** Root cause proposed and confirmed, fix brief generated, Task() re-production creates new asset version, 10 gates re-run, before/after comparison shown, loop caps at 3 attempts with escalation
**Why human:** Task() subagent execution, gate evaluation quality, and loop behavior require runtime validation

### 3. Ship Checklist Accuracy
**Test:** Run `/ttm-ship <slug>` on a campaign with ship-ready assets
**Expected:** Dynamic checklist includes only relevant channel sections, AI checks produce accurate results for UTM/draft marker/verification checks, human confirmation flow works smoothly
**Why human:** AI check accuracy and checklist relevance depend on actual asset content quality

### 4. Text-Mode Fallback
**Test:** Run all three commands with `--text` flag
**Expected:** Numbered list prompts replace AskUserQuestion for all interactive steps
**Why human:** Text-mode rendering and usability require visual inspection

### Gaps Summary

No gaps found. All 7 observable truths verified. All 11 required artifacts pass existence, substantive, and wiring checks. All 22 key links verified. All 4 requirements (LIFE-10, LIFE-11, LIFE-12, LIFE-13) satisfied. No anti-patterns detected.

Key strengths of the implementation:
- **Preservation constraints in fix briefs** (Pitfall 3 prevention): fix.md explicitly includes "What Passed" as hard constraints to prevent oscillating gate regressions
- **Fix brief path isolation** (Pitfall 1 prevention): fix.md explicitly notes "CRITICAL: use the FIX BRIEF path as [BRIEF_PATH], NOT the original BRIEF.md"
- **ALLOWED_FIELDS pre-registration** (Pitfall 2 prevention): All 9 state fields registered in campaign.cjs before any workflow references them
- **500-line discipline**: All 3 workflows stay under limit (420, 483, 485 lines) through effective @-reference delegation to review-checklist.md, gate-evaluation.md, ttm-producer.md, and ship-checklist-items.md
- **User decisions honored**: All 15 decisions from CONTEXT.md (D-01 through D-15) are traceable in the workflow implementations

---

_Verified: 2026-04-28T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
