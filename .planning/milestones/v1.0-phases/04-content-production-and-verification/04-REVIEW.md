---
phase: 04-content-production-and-verification
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - bin/lib/campaign.cjs
  - bin/lib/deviation.cjs
  - bin/ttm-tools.cjs
  - workflows/lifecycle/produce.md
  - workflows/lifecycle/verify.md
  - gates/base-gates.md
  - gates/gate-evaluation.md
  - agents/ttm-producer.md
  - skills/ttm-produce/SKILL.md
  - skills/ttm-verify/SKILL.md
  - templates/production-manifest.json
  - templates/verification-report.md
  - templates/deviation-log.md
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-04-24T00:00:00Z
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

This phase introduces the production and verification workflows, quality gate system, CLI deviation logging, and two SKILL.md skill definitions. The core binaries (`campaign.cjs`, `deviation.cjs`, `ttm-tools.cjs`) are well-structured with solid path-traversal defenses and allowlist validation. However, one critical injection risk exists in `deviation.cjs` where `sanitizeJustification` does not strip the `$` character itself — only `$(`. Several workflow-level logic gaps exist: the `deviation append` CLI signature does not match what the verify workflow constructs, the `production-manifest.json` template omits the `name` field that the verify workflow reads, and there is a TOCTOU window in `deviation.cjs` when initializing `DEVIATIONS.md`. The gate system and SKILL.md frontmatter are structurally sound.

---

## Critical Issues

### CR-01: Incomplete Shell Injection Sanitization in `sanitizeJustification`

**File:** `bin/lib/deviation.cjs:37-47`

**Issue:** `sanitizeJustification` strips the two-character sequence `$(` to prevent command substitution, but does NOT strip the bare `$` character. A crafted input such as `$'...'` (ANSI-C quoting, valid in bash) or `${VAR}` variable expansion is not blocked. When the sanitized justification is interpolated into the bash command string shown in `verify.md` (line 308) and `gate-evaluation.md` (line 248), a `$` in the middle of the string can trigger parameter expansion or ANSI-C quoting at the shell level. Since this value is written by the AI agent into a shell command that it then executes with `Bash`, a crafted user input can still inject shell metacharacters.

**Fix:**
```js
function sanitizeJustification(text) {
  if (!text) return '';
  return text
    .replace(/`/g, "'")
    .replace(/\$/g, '')          // strip ALL $ signs, not just $(
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\|/g, '-')
    .replace(/[<>]/g, '')        // also strip redirects
    .substring(0, 100)
    .trim();
}
```

Alternatively, pass `--justification` as a separate positional argument after `--` so the shell never interpolates it, or use `JSON.stringify` when the AI agent builds the bash string.

---

## Warnings

### WR-01: CLI Argument Signature Mismatch — `deviation append` vs Workflow

**File:** `bin/lib/deviation.cjs:59` / `workflows/lifecycle/verify.md:302-318` / `gates/gate-evaluation.md:247-259`

**Issue:** The `cmdDeviationAppend` function accepts positional parameters `(slug, gate, result, justification, asset, raw)`, but the router in `ttm-tools.cjs` (line 84) uses `parseNamedArgs` and passes `parsed.named.slug`, `parsed.named.gate`, `parsed.named.result`, `parsed.named.justification`, `parsed.named.asset`. The shell invocations in both `verify.md` and `gate-evaluation.md` pass additional named flags `--gate-id`, `--tier`, `--finding`, `--action`, and `--run` that `parseNamedArgs` will parse into `named` but `cmdDeviationAppend` ignores entirely. These fields — gate-id, tier, finding, action, run — are promised in the DEVIATIONS.md table columns but are silently dropped. The resulting table rows always show `--` for Finding, Action, and Verify Run, even when the workflow believes it has supplied them.

**Fix:** Add `gate_id`, `tier`, `finding`, `action`, and `run` parameters to `cmdDeviationAppend` and build the Markdown row using those values. Alternatively, remove the flags from the workflow invocations and update the DEVIATIONS.md table schema to reflect what is actually captured. The function signature and the CLI contract must agree.

---

### WR-02: `production-manifest.json` Template Missing `name` Field Read by Verify

**File:** `templates/production-manifest.json:1-19` / `workflows/lifecycle/verify.md:124-129`

**Issue:** The verify workflow (lines 124-128) builds its `ASSETS` array by reading `manifest.hero.name` and `manifest.derivatives[n].name` from the parsed manifest. The `production-manifest.json` template and the inline fill example in `produce.md` (lines 241-270) never populate a `name` field on the `hero` or derivative objects — only `asset_id`, `type`, `channel`, `playbook`, and `file` are present. At runtime, `manifest.hero.name` will be `undefined`, causing asset names to be `undefined` in the summary table headers.

**Fix:** Add `"name"` to the manifest template and ensure `produce.md` Step 7 fills it in. For example:

```json
"hero": {
  "asset_id": 1,
  "name": "01-[HERO_TYPE]-[HERO_CHANNEL]",
  "type": "[ASSET_TYPE]",
  "channel": "[CHANNEL]",
  "playbook": "[PLAYBOOK_PATH_OR_NONE]",
  "file": "ASSETS/01-[HERO_TYPE]-[HERO_CHANNEL].md"
}
```

Mirror the same addition for derivative entries.

---

### WR-03: TOCTOU Race Condition in `cmdDeviationAppend` — File Initialization

**File:** `bin/lib/deviation.cjs:91-113`

**Issue:** The code checks `fs.existsSync(deviationsPath)` (line 91) and, if false, writes the initial template. It then immediately calls `safeReadFile(deviationsPath)` (line 116) to append the new row. If two concurrent verify runs (possible under parallel Task() execution for different assets) both see `existsSync` return false, both will write the initial template, and the second write will overwrite the first write's initial content before either reads it for the append. The file will then contain a duplicate header block. While concurrent verify runs on the same campaign are unlikely by design, the code makes no attempt at an atomic check-and-write.

**Fix:** Use an atomic open-or-create pattern. The simplest approach without external libraries is to open the file with `fs.openSync(path, 'ax')` (exclusive create, throws if exists) inside a try/catch, then fall back to reading the existing file:

```js
let existingContent;
try {
  const initialContent = buildInitialContent(safe, timestamp);
  fs.writeFileSync(deviationsPath, initialContent, { flag: 'wx', encoding: 'utf-8' });
  existingContent = initialContent;
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
  existingContent = safeReadFile(deviationsPath);
}
```

---

### WR-04: `verify.md` Step 6 Deviation Append Invocation Missing Required `--slug` Flag Position

**File:** `workflows/lifecycle/verify.md:302-318`

**Issue:** The bash snippet in Step 6 (Accept+log) passes `"${SLUG}"` as a second positional argument after `deviation append`, but `ttm-tools.cjs` (lines 79-88) parses deviation subcommands with `parseNamedArgs(args.slice(2))` and expects `--slug`, `--gate`, etc. as named flags. There is no positional slot for SLUG in the deviation router — the router never reads `devArgs[1]` as a slug; it only reads `parsed.named.slug`. The inline call format in `verify.md`:

```bash
node ... deviation append "${SLUG}" \
  --gate "[gate name]" \
```

will route to `devArgs[0] === 'append'` correctly but `"${SLUG}"` ends up as a positional argument ignored by `parseNamedArgs`. `parsed.named.slug` will be `undefined`, causing `cmdDeviationAppend` to receive an empty slug and error with "slug required for deviation append".

**Fix:** Update the workflow invocation to use `--slug`:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" deviation append \
  --slug "${SLUG}" \
  --gate "[gate name]" \
  --result "[WARN|FAIL]" \
  --asset "[asset file path]" \
  --justification "[user's justification]"
```

Apply the same correction in `gate-evaluation.md` line 249.

---

### WR-05: `produce.md` Step 8 — `campaign update` Positional Argument Order Inconsistency

**File:** `workflows/lifecycle/produce.md:291-297`

**Issue:** The bash snippet at Step 8 invokes:

```bash
node "..." campaign update "${SLUG}" phase produced
```

The `ttm-tools.cjs` router (line 74) maps: `cmdCampaignUpdate(slug, campaignArgs[2], campaignArgs[3], raw)`, where `campaignArgs = args.slice(1).filter(a => a !== '--raw')`. After filtering, the array is `['update', SLUG, 'phase', 'produced']`, so `subCmd = 'update'`, `slug = SLUG`, `field = 'phase'`, `value = 'produced'`. This is correct. However, the very next line:

```bash
node "..." campaign update "${SLUG}" phase.produced "$TIMESTAMP"
```

`field = 'phase.produced'` which IS in `ALLOWED_FIELDS`, so it works. But the workflow text above this block (lines 291-297) also contains:

```bash
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
```

The timestamp check only applies to `phase.produced`, not to `phase` itself. If `ttm-tools.cjs timestamp --raw` returns empty but the campaign `phase` update has already committed successfully, the campaign will be in phase `produced` without a timestamp — a silently partial state. The guard should be placed before any state update, not between two state updates.

**Fix:** Move the timestamp fetch and guard before both `campaign update` calls:

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase produced
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.produced "$TIMESTAMP"
```

---

### WR-06: `verify.md` `overall_result` Logic Inconsistency with "accepted" Gate Values

**File:** `workflows/lifecycle/verify.md:395-399`

**Issue:** The overall result logic states:

> `fail` — any Tier 1 FAIL exists (even if Accept+logged — the record shows it failed)

But the gate update commands immediately above (lines 370-381) write `"accepted"` to gate fields when the user chose Accept+log. This means the state will show `gate.positioning_drift = accepted` while `verify.overall_result = fail`. Downstream commands reading STATE.md to decide if a campaign passed verification will see contradictory signals: a gate saying "accepted" (implying it was resolved) while the overall result says "fail" (implying blocking action needed). The distinction between a "raw fail that was accepted" and a "raw fail that still needs fixing" is important for `/ttm-review` and `/ttm-fix` consumers.

**Fix:** Document the intent explicitly in STATE.md and in the verify success criteria. Consider using `overall_result = warn` (not `fail`) when all Tier 1 failures have been Accept+logged, and reserving `fail` strictly for outstanding unresolved failures. If `fail` is intentional even for accepted deviations, add a note in the banner and VERIFICATION.md frontmatter so downstream skills understand the semantic.

---

## Info

### IN-01: `sanitizeJustification` 100-Character Limit May Truncate Meaningful Audit Context

**File:** `bin/lib/deviation.cjs:45`

**Issue:** The 100-character cap on justification text is very short for an audit trail. A user justification like "Accepted because legal reviewed and approved this specific phrasing on 2026-04-15 per Slack thread with Counsel" is 108 characters and gets silently truncated. DEVIATIONS.md is the append-only historical record — truncated justifications reduce its auditability. There is no indication to the user that their text was truncated.

**Fix:** Raise the limit to 300-500 characters, and either warn the user when truncation occurs or display the post-truncation text back to them before writing.

---

### IN-02: `ttm-produce` SKILL.md — `AskUserQuestion` Not in `allowed-tools`

**File:** `skills/ttm-produce/SKILL.md:9`

**Issue:** `produce.md` Step 2 prompts the user for confirmation when the campaign is already in a post-production phase ("Re-producing will overwrite..."). The produce skill's `allowed-tools` list is `Read Write Bash Glob Grep Task`, which does not include `AskUserQuestion`. If the runtime enforces `allowed-tools`, the confirmation prompt will either be skipped or throw a tool-not-available error, meaning the workflow either silently overwrites existing assets or crashes at that step.

**Fix:** Either add `AskUserQuestion` to `ttm-produce`'s `allowed-tools`, or replace the confirmation prompt in `produce.md` Step 2 with a plain text prompt (text-mode pattern already documented in the same workflow) that does not require the `AskUserQuestion` tool.

---

### IN-03: `templates/deviation-log.md` Table Column Count Mismatch with `cmdDeviationAppend` Output

**File:** `templates/deviation-log.md:10-11` / `bin/lib/deviation.cjs:132`

**Issue:** The template table header has 9 columns: Timestamp, Gate, Tier, Result, Asset, Finding, Action, Justification, Verify Run. The row built by `cmdDeviationAppend` at line 132 also has 9 cells but uses `--` for Finding and Verify Run, making those columns always empty. The `Finding` column is meaningful audit data — the exact text of the gate finding — but is never populated because the function has no `finding` parameter (see WR-01). This is a companion to WR-01 at the template level.

**Fix:** Resolve by implementing WR-01 (add `finding` and `run` parameters to `cmdDeviationAppend`).

---

### IN-04: `verify.md` — SLUG Extraction via `sed` Does Not Handle Multi-Word Slugs with Flags

**File:** `workflows/lifecycle/verify.md:49-51`

**Issue:** The slug extraction pattern:

```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

uses `xargs` to trim whitespace. If `$ARGUMENTS` is something like `my-campaign --text`, `xargs` collapses it to `my-campaign`. But if `$ARGUMENTS` is `--text my-campaign`, the `sed` removes `--text` leaving ` my-campaign`, and `xargs` trims it to `my-campaign`. This works for the `--text` flag but will silently include any other flags (e.g., a future `--force` flag) as part of the slug. This identical issue exists in `produce.md` (line 49). There is no strict slug character validation after extraction, so unexpected flag values could produce a non-empty but nonsensical slug that passes the empty check at line 53 of verify.md.

**Fix:** Extract the first non-flag token explicitly:

```bash
SLUG=""
for arg in $ARGUMENTS; do
  case "$arg" in --*) ;; *) SLUG="$arg"; break ;; esac
done
```

This is more robust as the argument list grows.

---

_Reviewed: 2026-04-24T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
