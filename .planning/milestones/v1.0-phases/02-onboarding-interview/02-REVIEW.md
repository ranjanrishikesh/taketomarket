---
phase: 02-onboarding-interview
reviewed: 2026-04-22T12:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - workflows/setup/init.md
  - workflows/setup/init-questions.md
  - workflows/setup/init-validation.md
  - skills/ttm-init/SKILL.md
findings:
  critical: 1
  warning: 5
  info: 2
  total: 8
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-04-22T12:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the four files comprising the `/ttm-init` onboarding workflow: the SKILL.md entry point, the main init workflow orchestrator, the question bank, and the validation rules. All referenced external files (9 templates, bin/ttm-tools.cjs, context-loading.md, claude-md.md, agents-md.md) exist on disk.

The workflow is well-structured with thorough validation rules, clear step sequencing, and good re-prompt UX. However, there is one critical issue (missing `AskUserQuestion` from allowed-tools makes the entire interactive interview non-functional), several workflow logic gaps where validation rules are defined but not implemented in the orchestrator, and a malformed XML closing tag.

## Critical Issues

### CR-01: AskUserQuestion Missing from SKILL.md allowed-tools

**File:** `skills/ttm-init/SKILL.md:7`
**Issue:** The `allowed-tools` field lists `Read Write Bash Glob Grep` but omits `AskUserQuestion`. The entire init workflow is built around AskUserQuestion for structured interview questions (product category, voice archetype, formality level, primary channel, attribution model) and confirmation gates. Without this tool in allowed-tools, the Claude Code runtime will not grant the skill permission to use it, making the interactive interview non-functional in non-text-mode.
**Fix:**
```yaml
allowed-tools: Read Write Bash Glob Grep AskUserQuestion
```

## Warnings

### WR-01: Duplicate Closing XML Tag Creates Malformed Structure

**File:** `workflows/setup/init.md:426-427`
**Issue:** The file ends with two `</output>` closing tags on consecutive lines. The first closes the `<output>` block listing generated files (line 414). The second is a stray duplicate with no matching open tag, creating malformed XML that could confuse the runtime parser.
**Fix:** Remove line 427. The file should end:
```
- `AGENTS.md`
</output>
```

### WR-02: Text-Mode Fallback Not Specified for AskUserQuestion Calls

**File:** `workflows/setup/init.md:46-57`
**Issue:** The workflow defines text-mode detection (lines 18-29) and states to "replace every AskUserQuestion call with a plain-text numbered list," but never provides the actual text-mode alternative format for any of the 7+ AskUserQuestion calls (pre-flight existing setup, pre-flight file picker, product category, voice archetype, formality level, primary channel, attribution model, confirmation gate, revision section picker). An AI agent following this workflow in text mode has no concrete template for how to present options.
**Fix:** Add a text-mode example block after the detection section:
```markdown
When TEXT_MODE is active, replace each AskUserQuestion with:
```
[HEADER]
[QUESTION]
  1. [OPTION_1_LABEL] -- [OPTION_1_DESCRIPTION]
  2. [OPTION_2_LABEL] -- [OPTION_2_DESCRIPTION]
  ...
Type the number of your choice:
```
```

### WR-03: Section Warning Count Tracking Not Implemented in Orchestrator

**File:** `workflows/setup/init-validation.md:155-156` / `workflows/setup/init.md`
**Issue:** The validation rules specify: "Track total warnings per section; if a section has 3+ warnings, note in STATE.md for follow-up." However, init.md never implements this tracking. No step accumulates warning counts per section, and no step writes warning summaries to STATE.md. This means the follow-up mechanism defined in the validation rules is dead logic.
**Fix:** Add to init.md Step 9 (or Step 11) a substep:
```markdown
**Warning tracking:** If any section accumulated 3+ SPECIFICITY_WARNING flags
during the interview, append to STATE.md under a `## Follow-up Needed` section:
- Section [N]: [count] specificity warnings -- recommend re-running with /ttm-[relevant-command]
```

### WR-04: Template Fields Lists "Competitor content analysis" but No Question Collects It

**File:** `workflows/setup/init-questions.md:172`
**Issue:** Section 5's "Template Fields Collected" line includes "Competitor content analysis" but none of the 3 freeform questions in that section ask about competitor content analysis. This creates a gap: when the workflow tries to fill the competitors.md template, there will be no interview data for the "Competitor content analysis" field, resulting in either a blank section or hallucinated content.
**Fix:** Either add a 4th question to Section 5:
```
4. "What content do your competitors publish? Which formats and channels do they focus on, and what seems to work for them?"
```
Or remove "Competitor content analysis" from the Template Fields Collected line if the template does not require it.

### WR-05: required_reading Includes context-loading.md Which Is Not Used by Init

**File:** `workflows/setup/init.md:11`
**Issue:** The `<required_reading>` block references `@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md`. Context-loading is about loading `.marketing/` reference files into production contexts (for the Produce phase). The init workflow creates these files -- it does not load them. Including this in required_reading wastes context tokens (the file will be loaded every time init runs) with no benefit to the onboarding flow.
**Fix:** Remove line 11, or replace with a comment explaining why it is included if there is a specific reason (e.g., the "Update specific files" path needs to load existing files).

## Info

### IN-01: init.md Section 1 Asks for 3 Proof Points but Validation Requires 2

**File:** `workflows/setup/init-questions.md:36` / `workflows/setup/init-validation.md:42`
**Issue:** The freeform question asks for "3 proof points" but validation only fails if fewer than 2 are provided. This is not a bug -- the question sets a higher aspiration than the minimum gate -- but the inconsistency could confuse users who provide exactly 2 and wonder if they passed. Consider aligning the question to say "at least 2 proof points" or raising the validation minimum to 3.

### IN-02: SKILL.md Could Include context: fork Consideration

**File:** `skills/ttm-init/SKILL.md`
**Issue:** CLAUDE.md recommends `context: fork` for production and verification skills but not necessarily for init. The init workflow is a long-running interactive session that benefits from running in the main context (so it can access conversation history). Not including `context: fork` is correct for this skill, but worth noting as a deliberate design choice. No action needed.

---

_Reviewed: 2026-04-22T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
