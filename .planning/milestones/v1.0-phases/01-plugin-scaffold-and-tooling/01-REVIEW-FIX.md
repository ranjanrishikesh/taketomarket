---
phase: 01-plugin-scaffold-and-tooling
fixed_at: 2026-04-22T12:05:00Z
review_path: .planning/phases/01-plugin-scaffold-and-tooling/01-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 1: Code Review Fix Report

**Fixed at:** 2026-04-22T12:05:00Z
**Source review:** .planning/phases/01-plugin-scaffold-and-tooling/01-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: Frontmatter parser assumes Unix line endings

**Files modified:** `bin/lib/core.cjs`
**Commit:** f7bcfd2
**Applied fix:** Added `content.replace(/\r\n/g, '\n')` normalization at the start of `parseFrontmatter()` before searching for delimiters. The normalized string is used for all substring operations, ensuring Windows line endings do not corrupt keys/values or cause missed closing delimiters.

### WR-02: State update CLI args allow --raw to be misinterpreted as field name

**Files modified:** `bin/ttm-tools.cjs`
**Commit:** 875fd16
**Applied fix:** Added `args.slice(1).filter(a => a !== '--raw')` to produce a clean `stateArgs` array before positional access, matching the pattern already used by the `slug` and `timestamp` subcommands. `subCmd`, field, and value are now read from the filtered array.

### WR-03: Commit file paths not validated for path traversal

**Files modified:** `bin/lib/commit.cjs`
**Commit:** 9427846
**Applied fix:** Added `path.resolve()` validation loop before the staging loop in `cmdCommit()`. Each file path is resolved against `process.cwd()` and checked to ensure it starts with the project root directory. Paths that escape the project (e.g., `../../../other-repo/secret.txt`) now trigger an error before any `git add` occurs. Added `path` require at module top.

### WR-04: Missing validation on commit message length

**Files modified:** `bin/lib/commit.cjs`
**Commit:** 057aa02
**Applied fix:** Added `MAX_MESSAGE_LENGTH = 500` constant and a length check after sanitization. Messages exceeding 500 characters after sanitization now produce an error with the actual vs. max length, preventing accidental multi-kilobyte commit messages.

## Skipped Issues

None -- all in-scope findings were fixed.

---

_Fixed: 2026-04-22T12:05:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
