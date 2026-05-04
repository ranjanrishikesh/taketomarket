---
phase: 07-state-management-and-campaign-operations
fixed_at: 2026-04-29T00:00:00Z
review_path: .planning/phases/07-state-management-and-campaign-operations/07-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 07: Code Review Fix Report

**Fixed at:** 2026-04-29T00:00:00Z
**Source review:** .planning/phases/07-state-management-and-campaign-operations/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11
- Fixed: 11
- Skipped: 0

## Fixed Issues

### CR-01: Path traversal bypass -- missing path separator in startsWith check

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** f6df99b
**Applied fix:** Added `+ path.sep` to all four `startsWith(projectRoot)` checks in `resolveCampaignStatePath`, `cmdCampaignInit`, and `cmdCampaignArchive` (src and dest), matching the already-correct pattern used in `cmdCampaignList`.

### CR-02: Archive destination validation silently ignores all errors, not just ENOENT

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** db66ac6
**Applied fix:** Changed bare `catch {}` to `catch (e)` with explicit `e.code !== 'ENOENT'` check. Non-ENOENT errors (EACCES, ENOTDIR, etc.) are now re-thrown instead of silently swallowed.

### CR-03: parseFrontmatter uses indexOf('\n---', 3) which can match --- inside the body

**Files modified:** `bin/lib/core.cjs`
**Commit:** d8cdc19
**Applied fix:** Replaced `indexOf('\n---', 3)` with a regex `search(/\n---(\n|$)/)` that matches the closing `---` only when it occupies a full line (followed by newline or end-of-string). Verified with tests covering body-embedded `---` patterns.

### CR-04: Archive workflow modifies LEARNINGS.md before verifying archive CLI succeeds

**Files modified:** `workflows/utility/archive.md`
**Commit:** 428eb4c
**Applied fix:** Swapped Steps 5 and 6 so the archive CLI command (now Step 5) executes first and is verified before LEARNINGS.md is updated (now Step 6). Added explicit note that Step 6 only runs after archive confirmation succeeds, and that LEARNINGS.md must not be updated if archive fails.

### WR-01: cmdCampaignUpdate accepts empty string as a valid value

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** 70579eb
**Applied fix:** Added `value === ''` to the guard condition, with an error message directing users to use the `"null"` string to clear a field.

### WR-02: cmdCampaignList parses audit trail timestamp with regex that can match non-audit columns

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** cb8ad88
**Applied fix:** Replaced first-match regex with pipe-delimited column parsing. Timestamp is now extracted by column position (index 2 after splitting on `|`), preventing incorrect matches from timestamps in other columns.

### WR-03: cmdCampaignArchive does not verify file-level integrity of the copy

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** f855a9b
**Applied fix:** Added explicit `fs.statSync(destStatePath).isFile()` check for `STATE.md` in the destination directory after `cpSync` and before `rmSync`. Also deduplicated the `destStatePath` variable declaration that was repeated later in the function.

### WR-04: serializeFrontmatter does not quote values containing newlines

**Files modified:** `bin/lib/core.cjs`
**Commit:** ea45db7
**Applied fix:** Added `\n` and `\r` to the quote-trigger condition in `serializeFrontmatter`. When quoting, backslashes are now escaped first, then double-quotes, then newlines and carriage returns are replaced with their escape sequences.

### WR-05: resume.md instructs AI to read STATE.md with bare Read call without fallback

**Files modified:** `workflows/utility/resume.md`
**Commit:** 11a9a4f
**Applied fix:** Added a "Fallback" paragraph instructing the agent to log "No additional notes recorded in STATE.md body" and continue with CLI-parsed state only if the Read tool returns empty or fails, rather than silently omitting context.

### WR-06: archive.md has no guard against writing duplicate lessons on retry

**Files modified:** `workflows/utility/archive.md`
**Commit:** aa1ab41
**Applied fix:** Added a "Duplicate guard" paragraph before the marker validation section. The workflow now instructs the agent to scan existing LEARNINGS.md for rows matching the campaign slug and today's date before inserting, skipping insertion if duplicates are detected. This complements CR-04's order swap as defense-in-depth.

### WR-07: cmdCampaignList sinceArg filter falls through when filter is non-empty

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** 0d67154
**Applied fix:** Added explicit mutual-exclusion guard at the start of `cmdCampaignList` that calls `error()` if both `filter` and `sinceArg` are provided, preventing silent discard of the `--since` argument.

---

_Fixed: 2026-04-29T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
