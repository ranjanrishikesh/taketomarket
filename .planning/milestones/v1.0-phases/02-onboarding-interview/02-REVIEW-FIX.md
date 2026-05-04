---
phase: 02-onboarding-interview
fixed_at: 2026-04-22T12:43:45Z
review_path: .planning/phases/02-onboarding-interview/02-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 5
skipped: 1
status: partial
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-04-22T12:43:45Z
**Source review:** .planning/phases/02-onboarding-interview/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 5
- Skipped: 1

## Fixed Issues

### CR-01: AskUserQuestion Missing from SKILL.md allowed-tools

**Files modified:** `skills/ttm-init/SKILL.md`
**Commit:** 962a858
**Applied fix:** Added `AskUserQuestion` to the `allowed-tools` frontmatter field, changing from `Read Write Bash Glob Grep` to `Read Write Bash Glob Grep AskUserQuestion`. This grants the skill permission to use the interactive question tool required for the entire onboarding interview flow.

### WR-02: Text-Mode Fallback Not Specified for AskUserQuestion Calls

**Files modified:** `workflows/setup/init.md`
**Commit:** 1072210
**Applied fix:** Added a concrete text-mode fallback template after the TEXT_MODE detection section. The template shows the exact numbered-list format to use when replacing AskUserQuestion calls, including header, question, numbered options with descriptions, and a prompt for the user to type their choice. Also added multiSelect instruction format.

### WR-03: Section Warning Count Tracking Not Implemented in Orchestrator

**Files modified:** `workflows/setup/init.md`
**Commit:** 422723e
**Applied fix:** Added warning tracking substep to Step 11 (Post-Init Validation), after the state update to "initialized". The new block instructs the agent to check if any section accumulated 3+ SPECIFICITY_WARNING flags and, if so, append a `## Follow-up Needed` section to STATE.md with per-section warning counts and the relevant /ttm-* command for follow-up.

### WR-04: Template Fields Lists "Competitor content analysis" but No Question Collects It

**Files modified:** `workflows/setup/init-questions.md`, `workflows/setup/init.md`
**Commit:** ca57366
**Applied fix:** Added question 4 to Section 5 freeform questions: "What content do your competitors publish? Which formats and channels do they focus on, and what seems to work for them?" Also updated init.md Section 6 (Step 6) to reference "4 freeform questions" instead of "3" for Section 5.

### WR-05: required_reading Includes context-loading.md Which Is Not Used by Init

**Files modified:** `workflows/setup/init.md`
**Commit:** 0108d8a
**Applied fix:** Removed `@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md` from the `<required_reading>` block. Context-loading is relevant to the Produce phase, not the init workflow which creates files rather than loading them.

## Skipped Issues

### WR-01: Duplicate Closing XML Tag Creates Malformed Structure

**File:** `workflows/setup/init.md:426-427`
**Reason:** Code context differs from review. The file currently ends with a single `</output>` tag on line 426 (verified via byte-level inspection). The duplicate `</output>` on line 427 described in the review does not exist in the current file state. No fix needed.
**Original issue:** The file ends with two `</output>` closing tags on consecutive lines, creating malformed XML.

---

_Fixed: 2026-04-22T12:43:45Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
