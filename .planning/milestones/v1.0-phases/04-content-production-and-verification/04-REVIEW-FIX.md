---
phase: 04-content-production-and-verification
fixed_at: 2026-04-24T00:00:00Z
review_path: .planning/phases/04-content-production-and-verification/04-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 4: Code Review Fix Report

**Fixed at:** 2026-04-24T00:00:00Z
**Source review:** .planning/phases/04-content-production-and-verification/04-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Incomplete Shell Injection Sanitization in `sanitizeJustification`

**Files modified:** `bin/lib/deviation.cjs`
**Commit:** 84706ba
**Applied fix:** Replaced `.replace(/\$\(/g, '(')` with `.replace(/\$/g, '')` to strip all `$` characters (not just `$(`), preventing `${VAR}` expansion and ANSI-C `$'...'` quoting attacks. Also added `.replace(/[<>]/g, '')` to strip shell redirects.

### WR-01: CLI Argument Signature Mismatch -- `deviation append` vs Workflow

**Files modified:** `bin/lib/deviation.cjs`, `bin/ttm-tools.cjs`
**Commit:** 818a5de
**Applied fix:** Added `extra` parameter object to `cmdDeviationAppend` carrying `gate_id`, `tier`, `finding`, `action`, and `run` fields. Updated the router in `ttm-tools.cjs` to extract these named args from `parseNamedArgs` and pass them through. The table row now populates Finding, Action, and Verify Run columns from CLI input instead of hardcoded `--`.

### WR-02: `production-manifest.json` Template Missing `name` Field Read by Verify

**Files modified:** `templates/production-manifest.json`, `workflows/lifecycle/produce.md`
**Commit:** 1f39606
**Applied fix:** Added `"name"` field to the hero object in the manifest template and added `"name"` fields to both hero and derivative objects in the `produce.md` Step 7 inline fill example. Name follows the `NN-TYPE-CHANNEL` convention matching the file naming pattern.

### WR-03: TOCTOU Race Condition in `cmdDeviationAppend` -- File Initialization

**Files modified:** `bin/lib/deviation.cjs`
**Commit:** 55d6ca3
**Applied fix:** Replaced `existsSync` + `writeFileSync` two-step pattern with atomic `writeFileSync` using `{ flag: 'wx' }` (exclusive create). If the file already exists, the `EEXIST` error is caught and the code proceeds to the append path. This eliminates the TOCTOU window where concurrent verify runs could both create the file.

### WR-04: `verify.md` Step 6 Deviation Append Invocation Missing Required `--slug` Flag

**Files modified:** `workflows/lifecycle/verify.md`, `gates/gate-evaluation.md`
**Commit:** b1c932b
**Applied fix:** Changed `deviation append "${SLUG}"` (positional) to `deviation append --slug "${SLUG}"` (named flag) in both verify.md and gate-evaluation.md. This matches the `parseNamedArgs` contract in `ttm-tools.cjs` which expects `parsed.named.slug`.

### WR-05: `produce.md` Step 8 -- Phase State Update Before Timestamp Guard

**Files modified:** `workflows/lifecycle/produce.md`
**Commit:** 396b211
**Applied fix:** Moved `TIMESTAMP=$(...)` fetch and the `[ -z "$TIMESTAMP" ]` guard to before the `campaign update ... phase produced` call. This prevents the campaign from entering `produced` phase without a timestamp if the timestamp command fails.

### WR-06: `verify.md` `overall_result` Logic Inconsistency with "accepted" Gate Values

**Files modified:** `workflows/lifecycle/verify.md`
**Commit:** b878ccd
**Applied fix:** Added `accepted` as a fourth overall_result value for when all Tier 1 FAILs have been Accept+logged. Reserved `fail` strictly for unresolved failures (marked Correct/fix_needed or not yet actioned). Updated the CLI placeholder to include `accepted` in the value list. This resolves the contradiction where gate fields show "accepted" but overall_result showed "fail". **Status: fixed: requires human verification** (logic change -- confirm the `accepted` semantic matches downstream consumer expectations in `/ttm-review` and `/ttm-fix`).

## Skipped Issues

None -- all in-scope findings were fixed.

---

_Fixed: 2026-04-24T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
