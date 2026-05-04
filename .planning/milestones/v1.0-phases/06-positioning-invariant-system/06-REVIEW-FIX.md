---
phase: 06-positioning-invariant-system
fixed_at: 2026-04-28T00:00:00Z
review_path: .planning/phases/06-positioning-invariant-system/06-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 10
skipped: 1
status: partial
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-04-28T00:00:00Z
**Source review:** .planning/phases/06-positioning-invariant-system/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 11
- Fixed: 10
- Skipped: 1

## Fixed Issues

### CR-01: Timestamp string comparison produces incorrect `--shipped-since-last-audit` results

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** ec19e08
**Applied fix:** Replaced string comparison operators with `Date.parse()` for both the `--shipped-since-last-audit` filter (line 306) and the `sinceArg` time-window filter (line 315). Both comparisons now parse timestamps to numeric milliseconds before comparing, with `isNaN` guards to skip unparseable values.

### CR-02: Drift log marker-replace inserts duplicate rows on repeated writes

**Files modified:** `bin/lib/drift-log.cjs`
**Commit:** abbbc8f
**Applied fix:** Added marker occurrence count validation before `String.replace()` in both `cmdDriftLogAppend` and `cmdDriftLogDeprecation`. If a marker appears more than once, the function calls `error()` to halt with a corruption warning. Single-occurrence markers proceed normally; zero-occurrence markers fall through to the existing append-at-end fallback.

### CR-03: `cmdCampaignList` reads untrusted directory names without path containment check

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** 8648d1c
**Applied fix:** Added a `projectRoot + path.sep` prefix check on each resolved `statePath` inside the campaign enumeration loop. Entries whose resolved path escapes the project root (e.g., via symlinks) are silently skipped with `continue`.

### WR-01: `parseFrontmatter` silently discards values containing escaped quotes

**Files modified:** `bin/lib/core.cjs`
**Commit:** 82ca908
**Applied fix:** After stripping outer double quotes in `parseFrontmatter`, added `.replace(/\\"/g, '"')` to unescape backslash-quote sequences written by `serializeFrontmatter`. Single-quoted values are handled separately without unescaping. This ensures round-trip safety for values containing colons or quotes.

### WR-02: `safeSource` and deprecation sanitizers missing `<>` stripping

**Files modified:** `bin/lib/drift-log.cjs`
**Commit:** 639ec7d
**Applied fix:** Added `.replace(/[<>]/g, '')` to `safeSource` in `cmdDriftLogAppend`, and to `safeAsset`, `safeCampaign`, and `safeDeadline` in `cmdDriftLogDeprecation`. This matches the existing `sanitizeDetails` function's behavior and prevents HTML/script injection into Markdown table cells.

### WR-03: `verify.md` Escalate option exits without updating campaign state

**Files modified:** `workflows/lifecycle/verify.md`
**Commit:** 99f940a
**Applied fix:** Added a `campaign update` CLI call to set `verify.overall_result` to `"escalated"` before the Escalate exit path. This provides a machine-readable sentinel that downstream workflows (ship, subsequent verify runs) can detect.

### WR-04: `RUN_NUMBER` used as unquoted CLI argument allows injection

**Files modified:** `workflows/lifecycle/fix.md`, `workflows/lifecycle/verify.md`, `workflows/lifecycle/review.md`
**Commit:** f532176
**Applied fix:** Quoted all `${RUN_NUMBER}` expansions in CLI arguments across all three workflow files: `fix.run_count`, `verify.run_count`, `review.run_count`, and the `--run` flag in the deviation append call. This prevents shell word-splitting on hand-edited STATE.md values.

### WR-05: `positioning-check.md` `--since` flag not properly handled by router

**Files modified:** `bin/ttm-tools.cjs`
**Commit:** 6162e51
**Applied fix:** Replaced the ad-hoc positional argument parsing in the `campaign list` branch with `parseNamedArgs()`. The `--since` value is now extracted as a named argument first, with fallback to positional `\d+d` matching. The filter flag (e.g., `--active`, `--shipped-since-last-audit`) is identified as the first positional argument starting with `--`. This prevents `--since` from being misassigned to the `filter` variable.

### WR-07: `cmdCampaignInit` uses `fs.existsSync` which is a TOCTOU race

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** d38f30a
**Applied fix:** Removed the `fs.existsSync` guard and replaced `safeWriteFile` with a direct `fs.writeFileSync` call using the `{ flag: 'wx' }` exclusive-create flag. On `EEXIST` error, the function calls `error()` with the same "Campaign already exists" message. This matches the TOCTOU-safe pattern already used by `ensureDriftLog` in `drift-log.cjs`.

### WR-08: `node -e` inline script reads from `/dev/stdin` -- not portable on Windows

**Files modified:** `workflows/lifecycle/ship.md`, `workflows/reference-mgmt/positioning-shift.md`
**Commit:** 49f1c80
**Applied fix:** Replaced `require('fs').readFileSync('/dev/stdin','utf8')` with `process.stdin.resume()` + `process.stdin.on('data'/'end')` pattern in both ship.md Step 11 and positioning-shift.md Step 2. This uses Node.js built-in stdin handling which works on all platforms including Windows.

## Skipped Issues

### WR-06: `positioning-shift.md` Step 5b writes POSITIONING.md directly without going through the CLI

**File:** `workflows/reference-mgmt/positioning-shift.md:299`
**Reason:** This finding requests creating a new CLI command (`ttm-tools.cjs positioning update`) for deterministic POSITIONING.md writes. This is a significant new feature (new module, new routing, new sanitization logic) rather than a targeted code fix. The review itself classifies this as a WARNING rather than a BLOCKER, noting that the human approval gate provides a review opportunity and the Write tool design choice is documented. Creating new CLI commands is out of scope for a code review fix pass.
**Original issue:** The workflow instructs the AI to write POSITIONING.md via the Write tool instead of through the CLI, bypassing deterministic sanitization and delimiter preservation checks.

---

_Fixed: 2026-04-28T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
