---
phase: 07-state-management-and-campaign-operations
reviewed: 2026-04-29T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - bin/lib/campaign.cjs
  - bin/lib/health.cjs
  - bin/ttm-tools.cjs
  - references/learnings-extraction.md
  - templates/reference-files/learnings.md
  - workflows/utility/state.md
  - workflows/utility/health.md
  - workflows/utility/next.md
  - workflows/utility/resume.md
  - workflows/utility/archive.md
  - skills/ttm-state/SKILL.md
  - skills/ttm-health/SKILL.md
  - skills/ttm-next/SKILL.md
  - skills/ttm-resume/SKILL.md
  - skills/ttm-archive/SKILL.md
findings:
  critical: 4
  warning: 7
  info: 4
  total: 15
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-04-29T00:00:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

This phase implements state management and campaign operations: a CLI tool (`ttm-tools.cjs`) with modular lib files for campaign CRUD, health auditing, and archival; five workflow markdown files; five SKILL.md entry points; and reference/template files for learnings. The overall structure is sound and the security intent (path sanitization, TOCTOU-safe init, ALLOWED_FIELDS allowlist) is present. However, several correctness bugs and one security gap require attention before this ships.

The most critical issues are: (1) a silent data-loss race between LEARNINGS.md update and archive CLI execution in `workflows/utility/archive.md`; (2) a path traversal bypass in `resolveCampaignStatePath` and `cmdCampaignArchive` caused by an incomplete path-prefix check that is missing the path separator; (3) the `cmdCampaignArchive` destination-validation `catch` block silently swallows the `statSync` error even when the destination already exists, allowing silent overwrites of archived campaigns under certain error conditions; (4) `parseFrontmatter` misidentifies the closing `---` delimiter, breaking round-trip fidelity for any STATE.md that has a line starting with `---` in its body.

---

## Critical Issues

### CR-01: Path traversal bypass — missing path separator in `startsWith` check

**File:** `bin/lib/campaign.cjs:36`, `bin/lib/campaign.cjs:62`, `bin/lib/campaign.cjs:359-364`

**Issue:** The path-escape security check uses `statePath.startsWith(projectRoot)` (and equivalent checks in `cmdCampaignInit` and `cmdCampaignArchive`). Because `projectRoot` has no trailing separator, a sibling directory could satisfy this check. For example, if `projectRoot` is `/home/user/myproject`, then the path `/home/user/myproject-evil/CAMPAIGNS/x/STATE.md` would pass `startsWith('/home/user/myproject')`. The slug sanitizer on line 33 already limits slug characters to `[a-z0-9-]`, which mitigates the worst cases, but `resolveCampaignStatePath` is called after the caller resolves the slug, and the `cmdCampaignList` function (line 280) performs the same check for each directory entry using `statePath.startsWith(projectRoot + path.sep)` — note that the list check correctly appends `path.sep`, but `resolveCampaignStatePath`, `cmdCampaignInit`, and `cmdCampaignArchive` do not. Any future caller that bypasses slug sanitization (or on a platform where path.sep differs) could escape the project root.

**Fix:**
```javascript
// resolveCampaignStatePath (line 36) and all similar checks:
if (!statePath.startsWith(projectRoot + path.sep)) {
  error('campaign STATE.md path escapes project directory');
}

// cmdCampaignInit (line 62):
if (!campaignDir.startsWith(projectRoot + path.sep)) {
  error('campaign directory path escapes project directory');
}

// cmdCampaignArchive (lines 359, 362):
if (!srcDir.startsWith(projectRoot + path.sep)) { ... }
if (!destDir.startsWith(projectRoot + path.sep)) { ... }
```

---

### CR-02: Archive destination validation silently ignores all errors, not just ENOENT

**File:** `bin/lib/campaign.cjs:376-381`

**Issue:** The code that validates the archive destination does not exist uses a bare `catch {}` block:

```javascript
try {
  fs.statSync(destDir);
  error(`Archive destination already exists: ${safe}. Cannot overwrite archived campaign.`);
} catch {
  // Expected: destination should not exist
}
```

`fs.statSync` throws for ENOENT (expected — destination does not exist) but also for EACCES (permission denied), ENOTDIR, and other filesystem errors. All of these are silently swallowed, causing the archive to proceed even when the destination may already exist but is unreadable. This directly violates the stated invariant "D-10: archive is irreversible — cannot overwrite." Under a permission error on the destination path, an existing archive would be silently overwritten by the subsequent `cpSync`.

**Fix:**
```javascript
try {
  fs.statSync(destDir);
  // If statSync succeeds, destination exists
  error(`Archive destination already exists: ${safe}. Cannot overwrite archived campaign.`);
} catch (e) {
  if (e.code !== 'ENOENT') {
    // Re-throw unexpected errors (permissions, etc.) rather than silently proceeding
    throw e;
  }
  // ENOENT is expected -- destination does not exist, safe to proceed
}
```

---

### CR-03: `parseFrontmatter` uses `indexOf('\n---', 3)` which can match `---` inside the body

**File:** `bin/lib/core.cjs:112` (cross-file impact on all callers in campaign.cjs and health.cjs)

**Issue:** The closing frontmatter delimiter is located with `normalized.indexOf('\n---', 3)`. This pattern matches any line that *begins* with `---` anywhere in the document body — for example, a Markdown horizontal rule in the STATE.md body, or a nested YAML block starting with `---`. The first such occurrence truncates the frontmatter incorrectly. The correct YAML front-matter closing delimiter is `\n---\n` (or `\n---` at end-of-file), not merely `\n---` followed by anything. A body containing `---more text` or a horizontal rule `---` would cause `parseFrontmatter` to return an incorrect frontmatter object, silently corrupting subsequent `serializeFrontmatter` round-trips and potentially losing body content that was interpreted as frontmatter keys.

Because STATE.md bodies contain lines like `Phase: created` and `Next step: Run ...`, and `serializeFrontmatter` writes a closing `---\n`, any STATE.md that grows a body with an additional `---` line will have its state silently corrupted on the next update cycle.

**Fix:**
```javascript
// Match the closing --- only when it occupies a full line (followed by \n or end-of-string)
const endIndex = normalized.search(/\n---(\n|$)/);
if (endIndex === -1) {
  return { frontmatter: {}, body: content };
}
const fmBlock = normalized.substring(4, endIndex).trim();
const body = normalized.substring(endIndex + 4).trimStart();
```

---

### CR-04: Archive workflow modifies LEARNINGS.md before verifying archive CLI succeeds — data loss on failure

**File:** `workflows/utility/archive.md` — Steps 5 and 6 ordering

**Issue:** The archive workflow (Steps 5 and 6) writes new lesson rows to `.marketing/LEARNINGS.md` in Step 5, then executes the CLI archive command in Step 6. If the CLI command fails (e.g., destination already exists, filesystem error, permission issue), LEARNINGS.md has already been permanently modified but the campaign has NOT been moved to ARCHIVE/. The campaign's STATE.md still shows `phase: shipped`. On a subsequent retry, Step 3 will re-extract learnings from the same campaign (still present in CAMPAIGNS/) and Step 5 will append duplicate lesson rows to LEARNINGS.md again. There is no rollback mechanism described.

**Fix:** Swap the order of operations — execute the archive CLI command first (Step 5 in the new ordering), verify `archived: true`, and only then write to LEARNINGS.md. The campaign STATE.md phase changes to `archived` atomically via the CLI, so a post-archive LEARNINGS.md write can safely check that the campaign is already in the archive directory before writing.

```
Corrected step order:
  Step 5 (old 6): Execute CLI archive command, verify archived: true
  Step 6 (old 5): Update LEARNINGS.md only after archive is confirmed
```

---

## Warnings

### WR-01: `cmdCampaignUpdate` accepts empty string as a valid value, stripping `null` sentinel semantics

**File:** `bin/lib/campaign.cjs:229`

**Issue:** The guard `if (value === undefined || value === null)` allows callers to pass an empty string `''` as a value. STATE.md frontmatter uses `null` (the literal string) as the sentinel for "not yet set." Passing an empty string silently sets a field to blank, which is distinct from `null` and will cause `checkCampaignVelocity` (health.cjs:177) to treat `last_updated = ''` as non-null, then fail `Date.parse('')` producing `NaN`, which is then skipped — correct behavior accidentally. But `checkCampaignStateConsistency` tests `!frontmatter.phase` which is truthy for empty string, so an empty phase would be flagged as invalid. More directly, `cmdCampaignList` filter on line 294 checks `c['phase.shipped'] !== 'null'`, and an empty `phase.shipped` would slip through. The fix should add an explicit empty-string check.

**Fix:**
```javascript
if (value === undefined || value === null || value === '') {
  error('value required for campaign update -- use "null" string to clear a field');
}
```

---

### WR-02: `cmdCampaignList` parses the audit trail timestamp with a regex that can match non-audit columns

**File:** `bin/lib/campaign.cjs:303-308`

**Issue:** The regex `line.match(/\|\s*(\d{4}-\d{2}-\d{2}T[^\s|]+)\s*\|/)` extracts the first ISO timestamp found anywhere in any table column of lines containing `'| audit |'`. If the DRIFT-LOG.md table has an ISO timestamp in a column *before* the date column (e.g., an "affected" column containing a campaign created-at timestamp), the wrong timestamp will be extracted and `lastAuditTimestamp` will be incorrect. The audit trail table format is not validated before extracting — if the column order differs from expectation, this silently returns an incorrect cutoff date and the `--shipped-since-last-audit` filter returns wrong campaigns.

**Fix:** Anchor the column extraction by position rather than first-match. Parse the pipe-delimited columns explicitly:
```javascript
const cols = line.split('|').map(c => c.trim());
// Expected columns: ['', event_type, timestamp, source, details, affected, '']
// Position 2 is the timestamp column (0-indexed after split on '|')
if (cols.length >= 3 && cols[1] === 'audit') {
  const ts = cols[2];
  if (ts.match(/^\d{4}-\d{2}-\d{2}T/)) {
    if (!lastAuditTimestamp || ts > lastAuditTimestamp) lastAuditTimestamp = ts;
  }
}
```

---

### WR-03: `cmdCampaignArchive` does not verify file-level integrity of the copy — only checks that `destDir` is a directory

**File:** `bin/lib/campaign.cjs:401-407`

**Issue:** After `fs.cpSync(srcDir, destDir, { recursive: true })`, the code only checks `fs.statSync(destDir).isDirectory()`. This confirms the destination directory exists but does not verify that key files (particularly `STATE.md`) were actually copied. A partially failed `cpSync` (e.g., due to a mid-copy disk-full error) that creates the destination directory but fails to copy `STATE.md` would pass the verification check, after which `fs.rmSync(srcDir, ...)` destroys the source. The campaign data is then lost.

**Fix:** After `cpSync`, explicitly verify that `STATE.md` was copied successfully:
```javascript
const destStatePath = path.resolve(destDir, 'STATE.md');
try {
  if (!fs.statSync(destStatePath).isFile()) {
    error('Archive copy verification failed: STATE.md not found in destination');
  }
} catch {
  error('Archive copy verification failed: STATE.md not found in destination');
}
// Only then remove source
fs.rmSync(srcDir, { recursive: true, force: true });
```

---

### WR-04: `serializeFrontmatter` does not quote values containing newlines — produces broken YAML

**File:** `bin/lib/core.cjs:146-148`

**Issue:** The quote-trigger check in `serializeFrontmatter` tests for `:`, `#`, `"`, leading/trailing spaces, but not for newline characters (`\n`). If a value ever contains a literal newline (e.g., a user-supplied campaign name like `"Line1\nLine2"`), the serialized frontmatter will be invalid: the newline will be written verbatim into the YAML block, breaking all subsequent `parseFrontmatter` calls on that file. Since `name` is user-supplied (passed directly as `campaignArgs.slice(2).join(' ')` from CLI arguments), this is reachable even if unlikely.

**Fix:**
```javascript
if (strVal.includes(':') || strVal.includes('#') || strVal.includes('"') ||
    strVal.includes('\n') || strVal.includes('\r') ||
    strVal.startsWith(' ') || strVal.endsWith(' ')) {
  lines.push(`${key}: "${strVal.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
} else {
  lines.push(`${key}: ${strVal}`);
}
```

---

### WR-05: `workflows/utility/resume.md` instructs the AI to read STATE.md with a bare `Read` call, not via the CLI — inconsistent with stated architecture

**File:** `workflows/utility/resume.md:79-83`

**Issue:** Step 2 directs the agent to "Read `.marketing/CAMPAIGNS/${SLUG}/STATE.md`" directly as a file tool call to get body content. The SKILL.md for `ttm-resume` only grants `Read Write Bash Glob` tools — no direct file-read constraints are imposed. However, the full campaign state (frontmatter) is separately loaded via the CLI in the same step. This creates two different parsing paths for the same file: CLI-parsed frontmatter (reliable, tested) and agent-read body (unreliable, subject to the agent's own line splitting). If the agent's read is inconsistent or the tool fails, the recovery summary will display stale or empty body content without any error detection. Additionally, the CLI `campaign state` output already includes `body_preview: body.substring(0, 200)` — so the agent is doing redundant work, but only reads the full body via the direct Read, meaning long STATE.md bodies are only partially captured via CLI and the agent must do both.

**Fix:** Either (a) extend the CLI to return the full body in the JSON output and remove the direct Read instruction, or (b) make the workflow explicitly fall back gracefully when the Read tool returns empty/null, logging "No additional notes recorded" rather than silently omitting context.

---

### WR-06: `workflows/utility/archive.md` Step 5 (LEARNINGS.md update) has no guard against writing duplicate lessons on retry

**File:** `workflows/utility/archive.md:228-243`

**Issue:** The marker-based append logic in Step 5 inserts lesson rows after `<!-- LESSONS BELOW THIS LINE -->`. If the archive workflow is interrupted after writing LEARNINGS.md but before the CLI archive completes (see CR-04), and the user retries `/ttm-archive <slug>`, the campaign will still be in `shipped` phase (validation at Step 2 passes), learnings will be re-extracted identically, and Step 5 will insert the same rows a second time. The marker is still present after the first write (it is not consumed), so the duplicate rows are added cleanly with no error. LEARNINGS.md ends up with duplicate lesson rows, corrupting the historical record.

**Fix:** Before inserting new rows, check that no row already exists for this campaign slug and today's date. If duplicates are detected, skip insertion and log a warning. Alternatively, address CR-04 first (execute archive before writing LEARNINGS.md) which eliminates the retry path entirely.

---

### WR-07: `cmdCampaignList` `sinceArg` filter falls through when `filter` is non-empty — mutually exclusive filters not enforced

**File:** `bin/lib/campaign.cjs:287-337`

**Issue:** The filter logic is structured as `if (filter === '--active') ... else if (filter === '--shipped-since-last-audit') ... else if (sinceArg && ...)`. If a caller passes both `--active` AND a `sinceArg` (e.g., `campaign list --active --since 30d`), the `--active` branch executes and `sinceArg` is silently ignored. The inverse — `--shipped-since-last-audit` with a `sinceArg` — also silently discards the `sinceArg`. The CLI argument parser in `ttm-tools.cjs` (lines 77-82) extracts both independently, so this is a reachable combination. The behavior (silent ignore of the second filter) is not documented and is likely not intended.

**Fix:** Add explicit mutual-exclusion guards at the start of `cmdCampaignList`:
```javascript
if (filter && sinceArg) {
  error('--active/--shipped-since-last-audit and --since are mutually exclusive');
}
```

---

## Info

### IN-01: `cmdCampaignInit` name field is written to STATE.md frontmatter without quoting, even for names with YAML-special characters

**File:** `bin/lib/campaign.cjs:74`

**Issue:** The STATE.md initial content is built with template literals: `` `name: ${name}` ``. If `name` contains YAML-special characters (e.g., `:`, `#`, `"`, or a leading `[`), the resulting frontmatter line is syntactically invalid for strict YAML parsers. The project's own `parseFrontmatter` is lenient enough to handle many cases, but external tools (editors, CI linters) may reject the file. For example, `name: Launch: Summer 2024` produces a frontmatter value that appears to have a nested mapping.

**Fix:** Use `serializeFrontmatter` to generate the initial STATE.md content rather than a hand-rolled template literal, so quoting is applied consistently.

---

### IN-02: `templates/reference-files/learnings.md` summary section uses placeholder text that is never machine-updated

**File:** `templates/reference-files/learnings.md:3-5`

**Issue:** The summary block contains `[GENERATED BY /ttm-init -- starts at 0]` placeholders. The `workflows/utility/archive.md` Step 5 instructs the AI to "increment Total lessons count" and "update Last lesson date" by editing the Summary section, but there is no CLI-backed deterministic mechanism to do this — it relies entirely on the AI counting rows correctly. If the AI misreads the existing count or produces an off-by-one, the summary becomes incorrect with no validation path. This also means that `[GENERATED BY /ttm-init]` is misleading — it implies `/ttm-init` populates these values, but the actual population happens in `/ttm-archive`.

**Fix:** Add a CLI subcommand (e.g., `node ttm-tools.cjs learnings update-summary`) that counts rows programmatically and rewrites the summary block, removing reliance on the AI for arithmetic.

---

### IN-03: `workflows/utility/next.md` priority algorithm sorts "earlier phase = higher priority" but ships phases (7-9) are effectively deprioritized indefinitely

**File:** `workflows/utility/next.md:118-123`

**Issue:** Priority 3 uses the phase index where lower index = higher priority. Campaigns in `shipped` (index 7), `measured` (index 8), and `learned` (index 9) phases have lower priority than campaigns in `created` (index 0). This means a campaign waiting for `/ttm-measure` will always be out-prioritized by any new campaign in `created` phase. For a team running multiple campaigns, post-ship measurement and learning extraction may never appear as the top recommendation, defeating the compound-learning objective of the system.

**Fix:** Consider separating "forward pipeline" priority (created through verified) from "post-ship" priority (shipped, measured, learned) and giving post-ship campaigns a separate priority tier between P1 (approved-to-ship) and P2 (fix-loops), since measurement windows are time-bounded.

---

### IN-04: `skills/ttm-resume/SKILL.md` lists `Write` in `allowed-tools` but the workflow is declared read-only

**File:** `skills/ttm-resume/SKILL.md:8`

**Issue:** The SKILL.md grants `allowed-tools: Read Write Bash Glob`. The workflow at `workflows/utility/resume.md` explicitly states "This workflow does NOT modify any files. It is purely informational." The `Write` tool capability is unnecessary and violates the principle of least privilege. If the agent misinterprets the workflow instructions, having `Write` available means it could inadvertently modify files it should only read.

**Fix:** Remove `Write` from `allowed-tools` in `skills/ttm-resume/SKILL.md`:
```yaml
allowed-tools: Read Bash Glob
```

---

_Reviewed: 2026-04-29T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
