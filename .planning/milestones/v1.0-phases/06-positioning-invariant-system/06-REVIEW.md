---
phase: 06-positioning-invariant-system
reviewed: 2026-04-28T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - bin/lib/drift-log.cjs
  - bin/lib/campaign.cjs
  - bin/ttm-tools.cjs
  - references/context-loading.md
  - references/positioning-check-report.md
  - skills/ttm-positioning-check/SKILL.md
  - skills/ttm-positioning-shift/SKILL.md
  - templates/drift-log.md
  - templates/migration-plan.md
  - workflows/lifecycle/brief.md
  - workflows/lifecycle/fix.md
  - workflows/lifecycle/produce.md
  - workflows/lifecycle/review.md
  - workflows/lifecycle/ship.md
  - workflows/lifecycle/verify.md
  - workflows/reference-mgmt/positioning-check.md
  - workflows/reference-mgmt/positioning-shift.md
  - bin/lib/core.cjs
findings:
  critical: 3
  warning: 8
  info: 4
  total: 15
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-04-28T00:00:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

This phase delivered the positioning invariant system: two new skills (`ttm-positioning-check`, `ttm-positioning-shift`), two workflows (`positioning-check.md`, `positioning-shift.md`), DRIFT-LOG infrastructure (`drift-log.cjs`, templates), and integration hooks across all five lifecycle workflows. The JavaScript modules are well-structured and security-conscious. The critical issues are confined to three areas: a string-comparison timestamp bug that silently corrupts audit-window filtering, an off-by-one in the drift log marker replacement that creates duplicate rows on repeated writes, and a path-traversal gap in campaign list enumeration. Several warnings cover logic inconsistencies in the workflow markdown that could mislead the AI agent at runtime.

---

## Critical Issues

### CR-01: Timestamp string comparison produces incorrect `--shipped-since-last-audit` results

**File:** `bin/lib/campaign.cjs:306`

**Issue:** The shipped-since-last-audit filter compares ISO timestamp strings with `>` operator (`c['phase.shipped'] > lastAuditTimestamp`). JavaScript string comparison of ISO timestamps works incidentally when the strings are in strict `YYYY-MM-DDTHH:MM:SS.sssZ` format, but `phase.shipped` values written by the workflow commands are free-form strings read from frontmatter. If any timestamp omits the milliseconds component, is quoted differently, or contains extra whitespace, the comparison silently returns wrong results -- campaigns shipped BEFORE the last audit are included, or campaigns shipped AFTER are excluded. The `cmdCampaignList` function also uses the same string comparison for the `sinceArg` time-window filter on line 315: `ts > cutoff` where `cutoff` is an ISO string from `new Date().toISOString()` but `ts` is an arbitrary frontmatter field that could be any string.

```javascript
// CURRENT (line 306) -- string comparison, fragile
filtered = shippedCampaigns.filter(c => c['phase.shipped'] > lastAuditTimestamp);

// FIX -- parse both sides to numeric timestamps before comparing
filtered = shippedCampaigns.filter(c => {
  const shipped = Date.parse(c['phase.shipped']);
  const audit   = Date.parse(lastAuditTimestamp);
  return !isNaN(shipped) && !isNaN(audit) && shipped > audit;
});
```

Apply the same `Date.parse()` guard to the `sinceArg` filter on line 315.

---

### CR-02: Drift log marker-replace inserts duplicate rows on repeated writes

**File:** `bin/lib/drift-log.cjs:140`

**Issue:** Both `cmdDriftLogAppend` (line 140) and `cmdDriftLogDeprecation` (line 193) use `String.replace()` to insert a new row after the HTML comment marker:

```javascript
updated = content.replace(marker, marker + '\n' + newRow);
```

`String.replace()` replaces the FIRST occurrence of `marker`. Because the marker string is preserved in the replacement, the next call to the same function will find the marker again and insert another row after it -- which is the intended append behaviour. However, if the file is written and the marker appears more than once (e.g., if the initial template is accidentally duplicated, or if a manual edit introduces a second marker), every future `replace()` will only insert after the FIRST marker, silently losing entries that should appear after the second marker. More concretely: the existing logic is correct only when the marker appears exactly once. There is no assertion or guard against a malformed file with duplicate markers. An incorrect insert (appending after the wrong marker) could corrupt the append-only guarantee the file relies on.

Additionally, if `safeWriteFile` fails after `safeReadFile` succeeds (disk full, permission revoked mid-run), the in-memory `updated` variable is lost. The file will be in its pre-read state and the entry is silently dropped. There is no error raised to the caller.

```javascript
// FIX: check marker occurrence count before replacing
const markerCount = (content.split(marker).length - 1);
if (markerCount !== 1) {
  error(`DRIFT-LOG.md has ${markerCount} occurrences of the expected marker. File may be corrupted.`);
}
```

For the write-failure case, `safeWriteFile` in `core.cjs` should propagate the error rather than silently succeed (it currently uses `fs.writeFileSync` which will throw -- verify the call site catches and re-throws).

---

### CR-03: `cmdCampaignList` reads untrusted directory names without path containment check

**File:** `bin/lib/campaign.cjs:270-274`

**Issue:** `cmdCampaignList` iterates over all subdirectories of `.marketing/CAMPAIGNS/` and constructs `statePath` as:

```javascript
const statePath = path.resolve(campaignsDir, entry.name, 'STATE.md');
```

`entry.name` comes from `fs.readdirSync` which returns actual filesystem names. On most OS the name cannot escape the directory because it is a single path component, but if a symlink exists inside `CAMPAIGNS/` pointing to a location outside the project root (e.g., `../../etc/passwd`), `path.resolve` will follow the symlink target. `safeReadFile` will then read arbitrary files outside the project root. The function has no containment check analogous to those in `resolveCampaignStatePath` and `resolveDriftLogPath`.

```javascript
// FIX: add containment check after resolving statePath
const projectRoot = path.resolve(process.cwd());
if (!statePath.startsWith(projectRoot + path.sep)) {
  // Skip this entry -- path escapes project root (symlink attack)
  continue;
}
```

---

## Warnings

### WR-01: `parseFrontmatter` silently discards values containing a colon

**File:** `bin/lib/core.cjs:121-129`

**Issue:** The frontmatter parser uses `line.indexOf(':')` to split key from value. For lines like `gate.positioning_check: fix_needed` this is correct, but for any value that itself contains a colon -- e.g., a URL `https://example.com` written into a `name` field -- the parser truncates the value to everything before the first colon and silently drops the rest. Specifically, `name: "Acme: Enterprise Edition"` would be parsed as `{ name: '"Acme' }`. Because `serializeFrontmatter` quotes values containing `:`, a round-trip through write-then-read would corrupt the quoted value when read back.

```javascript
// FIX: split only on the FIRST colon
const colonIndex = line.indexOf(':');
const key   = line.substring(0, colonIndex).trim();
let   value = line.substring(colonIndex + 1).trim();
```

This is already what the code does -- `indexOf` returns the first colon. However, `serializeFrontmatter` wraps values in double quotes when they contain `:`, and the reader then strips the outer quotes (lines 125-129). The round-trip is actually safe for simple colons in values, but FAILS if the value contains `\"` sequences -- the strip logic on line 128 (`value.slice(1, -1)`) does not unescape the `\"` sequences that `serializeFrontmatter` wrote. After one read-write cycle the value gains a literal backslash-quote.

**Fix:** In `parseFrontmatter`, after stripping the outer quote characters, unescape `\"` -> `"`:
```javascript
value = value.slice(1, -1).replace(/\\"/g, '"');
```

---

### WR-02: `cmdDriftLogAppend` uses `replace()` -- only the first marker occurrence is updated; body content can contain the marker string

**File:** `bin/lib/drift-log.cjs:140`

**Issue:** Separate from CR-02's duplicate-marker concern: the sentinel `<!-- NEW ENTRIES BELOW THIS LINE -->` is a plain HTML comment string. If any user-provided `details` text happened to contain this exact string before sanitization, or if an asset name did, the fallback path at line 143 (`content.trimEnd() + '\n' + newRow`) would be used -- but more dangerously, if the replacement string itself somehow reconstructed the marker, successive calls would insert after the first occurrence, possibly in the middle of existing data rather than at the top of the audit trail.

The sanitizer in `sanitizeDetails` does not strip HTML comment characters (`<`, `>` are stripped but `!--` sequences are not). A `source` field like `<!-- NEW ENTRIES BELOW THIS LINE -->` (after pipe and newline removal) would survive sanitization because `<` and `>` are removed but the comment syntax `!-` would remain, producing `!-- NEW ENTRIES BELOW THIS LINE --` -- not the exact marker, so this specific input would not trigger the bug. However the lack of `<>` in the `safeSource` sanitizer (line 118) means `<` and `>` pass through uncleaned in `safeSource`. The `sanitizeDetails` function strips `<>` from details but `safeSource` only strips `|` and `\n`. A `source` value with `<script>` or similar characters will be written verbatim into the Markdown table.

**Fix:** Apply the same `<>` stripping to `safeSource`:
```javascript
const safeSource = source.replace(/\|/g, '-').replace(/\n/g, '').replace(/[<>]/g, '').substring(0, 80);
```

Apply the same fix to `safeCampaign`, `safeAsset`, and `safeDeadline` in `cmdDriftLogDeprecation`.

---

### WR-03: `verify.md` Step 6 -- Escalate option exits without updating campaign state

**File:** `workflows/lifecycle/verify.md:341-345`

**Issue:** When the user selects "Escalate" on a Tier 1 gate failure, the workflow instructs the AI to "Stop verification immediately... Exit the workflow." However Step 9 says "Update campaign phase only if no Escalate was triggered." The workflow does NOT instruct the AI to log the escalation event or update the `verify.overall_result` field to a known sentinel value before exiting. The campaign is left in phase `"produced"` with no record that an escalation was triggered. If the user later runs `/ttm-verify` again before resolving the positioning shift, Step 2 will warn "phase is not 'produced'" -- this is wrong because the phase IS still "produced". But worse, there is no machine-readable signal that the prior verify attempt found a critical positioning issue, so the ship workflow's guard (`review.overall_result` null check) will also not block.

**Fix:** Before exiting on Escalate, the workflow should write a sentinel to state:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" verify.overall_result "escalated"
```

---

### WR-04: `fix.md` Step 2 -- `RUN_NUMBER` used as a CLI argument without quoting, allows injection

**File:** `workflows/lifecycle/fix.md:419`

**Issue:** The fix workflow passes `${RUN_NUMBER}` as an unquoted CLI argument:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" fix.run_count ${RUN_NUMBER}
```

`RUN_NUMBER` is derived from `fix.run_count + 1` in Step 2, where `fix.run_count` is read from STATE.md frontmatter via `parseFrontmatter`. If STATE.md was hand-edited and `fix.run_count` contains spaces or shell metacharacters (e.g., `1; rm -rf .marketing`), the unquoted expansion would execute the injected command. The same pattern appears in `verify.md:403` (`verify.run_count ${RUN_NUMBER}`), `review.md:367` (`review.run_count ${RUN_NUMBER}`), and `produce.md` is clean because it does not read a numeric counter from state.

**Fix:** Always quote computed numeric arguments passed to CLI:
```bash
node "..." campaign update "${SLUG}" fix.run_count "${RUN_NUMBER}"
```

The risk is partially mitigated because `ALLOWED_FIELDS` in `campaign.cjs` validates the field name and the value is stored as a string, but shell word-splitting before the Node.js process receives the argument can still cause issues.

---

### WR-05: `positioning-check.md` Step 3 passes `--since ${WINDOW}` but `cmdCampaignList` does not handle `--since` as a named flag

**File:** `workflows/reference-mgmt/positioning-check.md:110`

**Issue:** The workflow calls:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --since ${WINDOW} --raw
```

But `bin/ttm-tools.cjs` (lines 76-80) routes the `list` subcommand by extracting:
```javascript
const filter = campaignArgs[1] || '';
const since = campaignArgs.find(a => a.match(/^\d+d$/)) || '';
```

The router relies on the `since` argument matching `/^\d+d$/` as a positional argument, not as a named `--since` flag. If the AI generates the command as written in the workflow (`--since 30d`), the router will set `filter = '--since'` and `since = '30d'` (because `'30d'.match(/^\d+d$/)` is truthy). This accidentally works because `since` is found by `.find()`. However `filter = '--since'` matches neither `'--active'` nor `'--shipped-since-last-audit'`, so the filter branch is skipped and the `sinceArg` branch is entered correctly. The command works by accident, but the `filter` variable receives `'--since'` as a non-empty string, which causes the `filter === '--active'` and `filter === '--shipped-since-last-audit'` branches to be skipped silently even if the user intended one of those filters.

Additionally: the positioned `campaign list --shipped-since-last-audit` call in `ship.md` Step 11 does NOT include `--since`, which is correct. But the `--since` as a named flag is undocumented in the router and behaves differently than its documented form in the workflow. This is an interface inconsistency that will confuse future AI agents.

**Fix:** Update `ttm-tools.cjs` campaign list routing to explicitly handle `--since <value>` as a named flag via `parseNamedArgs`, or update the workflow to pass the time window as a positional argument: `campaign list ${WINDOW} --raw`.

---

### WR-06: `positioning-shift.md` Step 5b writes POSITIONING.md directly without going through the CLI

**File:** `workflows/reference-mgmt/positioning-shift.md:299`

**Issue:** The workflow instructs the AI to "Write the updated POSITIONING.md atomically via the Write tool." This is the only file in the system written by a direct AI file write rather than through `ttm-tools.cjs`. The stated justification is that POSITIONING.md is a structured Markdown file, not a frontmatter state file. However, this means:

1. No input sanitization: the History table row appended in Step 5a specifies sanitization (strip `|`, backticks, newlines, limit to 100 chars) but the enforcement is left entirely to the AI's natural language comprehension. The `sanitizeDetails` function in `drift-log.cjs` already does this deterministically -- there is no equivalent for the History table write.
2. The `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->` delimiter preservation is also left entirely to AI compliance. A subtle AI writing error here would silently break Tier 1 context loading for all subsequent workflows.

**Fix:** Add a CLI command (e.g., `ttm-tools.cjs positioning update`) that handles the POSITIONING.md write with deterministic sanitization and delimiter preservation checks, consistent with the "always use CLI for deterministic operations" architectural principle stated in CLAUDE.md.

This is a WARNING rather than a BLOCKER because the approval gate (human Approve step) provides a review opportunity, and the deliberate design choice to use the Write tool for POSITIONING.md is documented.

---

### WR-07: `campaign.cjs` `cmdCampaignInit` uses `fs.existsSync` which is a TOCTOU race

**File:** `bin/lib/campaign.cjs:67-69`

**Issue:** The guard against overwriting an existing campaign uses:
```javascript
if (fs.existsSync(statePath)) {
  error(`Campaign already exists: ${safe}. ...`);
}
```

Between the `existsSync` check and the `mkdirSync`/`writeFileSync` calls, another process could create the same campaign directory. `safeWriteFile` calls `fs.writeFileSync` without the `wx` exclusive-create flag, so it would silently overwrite an existing STATE.md. This is a real concern in CI environments where multiple `ttm-init` processes may run in parallel.

The `ensureDriftLog` function (drift-log.cjs:91) correctly uses `{ flag: 'wx' }` for TOCTOU-safe creation. The campaign init should do the same for STATE.md.

**Fix:**
```javascript
try {
  fs.writeFileSync(statePath, stateContent, { flag: 'wx', encoding: 'utf-8' });
} catch (e) {
  if (e.code === 'EEXIST') {
    error(`Campaign already exists: ${safe}. Delete the directory first or use a different slug.`);
  }
  throw e;
}
```

---

### WR-08: `ship.md` Step 11 -- `node -e` inline script reads from `/dev/stdin` -- not portable on Windows

**File:** `workflows/lifecycle/ship.md:486-487`

**Issue:**
```bash
SHIPPED_COUNT=$(echo "$SHIPPED_JSON" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).count)")
```

`/dev/stdin` is a POSIX-only path. On Windows (including WSL without Linux kernel), this path does not exist and the command will fail with `ENOENT`. The project targets Claude Code and Codex runtimes, which can run on Windows. The ship workflow's positioning check suggestion (a non-blocking feature) would silently fail or crash on Windows.

**Fix:** Use `process.stdin` directly or pass the count via a CLI subcommand:
```bash
SHIPPED_COUNT=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --shipped-since-last-audit --raw | node -e "process.stdin.resume(); let d=''; process.stdin.on('data', c=>d+=c); process.stdin.on('end', ()=>console.log(JSON.parse(d).count))")
```

Or add a `--count-only` flag to the campaign list CLI.

---

## Info

### IN-01: `drift-log.cjs` WARN-vs-FAIL distinction is not exposed in drift percentage calculation comment

**File:** `bin/lib/drift-log.cjs` (documentation gap)

**Issue:** The `positioning-check-report.md` reference states "PASS = 0 drift points, WARN = 1 drift point, FAIL = 1 drift point" -- WARN and FAIL are treated equally. However the drift log appends a `details` string in `positioning-check.md` as `"Nd audit: X% drift, Y findings"`. The word "findings" conflates WARNs and FAILs without distinction. The trend comparison logic parses this string to extract the prior drift percentage. If the string format ever changes slightly (e.g., rounding, different phrasing), the regex parse in `positioning-check-report.md` Step 6 will silently return no trend data. The parse is done by the AI via natural language, not by deterministic code, making it brittle.

**Suggestion:** Store the audit result as a structured JSON entry in DRIFT-LOG.md (or as a separate `audit-results.json`), rather than relying on AI regex parsing of a human-readable string across audit runs.

---

### IN-02: `campaign.cjs` -- `ACTIVE_PHASES` set is inconsistent with phase lifecycle

**File:** `bin/lib/campaign.cjs:245`

**Issue:** The `ACTIVE_PHASES` set used for `--active` filtering includes `'briefed', 'produced', 'verified', 'reviewed', 'shipped'`. The `'shipped'` status is also an active phase for the purpose of the positioning-shift migration plan (positioning-shift.md Step 2 uses `--active` to find campaigns that need migration plans). But shipped campaigns are also enumerated separately in Step 3d for deprecation. Including `'shipped'` in `ACTIVE_PHASES` means shipped campaigns appear in both the "active campaigns" list and the "shipped assets for deprecation" list -- the migration plan would show shipped assets under both active campaign migration AND deprecation schedule. The intent appears to be that `ACTIVE_PHASES` should exclude `'shipped'` (shipped campaigns are done and don't need re-verify/re-produce).

**Suggestion:** Remove `'shipped'` from `ACTIVE_PHASES` and add `'fixed'` if in-progress campaigns post-fix should be included.

---

### IN-03: `workflows/lifecycle/brief.md` -- `brief-positioning-check.md` referenced but not in file list

**File:** `workflows/lifecycle/brief.md:12`

**Issue:** The `<required_reading>` block references:
```
@${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/brief-positioning-check.md
```

This file is not in the reviewed file list and was not checked for existence during this phase. If it was not created as part of this phase, the brief workflow will fail at runtime with a file-not-found error when the AI tries to load it. The same reference appears at line 265.

**Suggestion:** Confirm `brief-positioning-check.md` exists and is populated, or note it as a dependency to be created in a follow-on phase.

---

### IN-04: `positioning-check.md` Step 2 -- `grep -oP` uses Perl-compatible regex, not portable on macOS default grep

**File:** `workflows/reference-mgmt/positioning-check.md:87`

**Issue:**
```bash
WINDOW=$(echo "$ARGUMENTS" | grep -oP '(?<=--since\s)\S+' || echo "30d")
```

The `-P` flag enables PCRE (Perl-compatible regex), which is not supported by the BSD `grep` shipped with macOS. On macOS, this command will error with `grep: invalid option -- P` and fall through to the `|| echo "30d"` default. The `--since` argument will be silently ignored. Since Claude Code runs on macOS, this is a realistic portability failure for anyone passing `--since` to override the default window.

**Fix:** Use `sed` or a compatible approach:
```bash
WINDOW=$(echo "$ARGUMENTS" | sed -n 's/.*--since[[:space:]]\+\([^[:space:]]*\).*/\1/p' || echo "30d")
WINDOW=${WINDOW:-30d}
```

---

_Reviewed: 2026-04-28T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
