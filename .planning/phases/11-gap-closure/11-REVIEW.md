---
phase: 11-gap-closure
reviewed: 2026-05-04T12:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - bin/lib/campaign.cjs
  - bin/lib/health.cjs
  - install.js
  - references/learnings-extraction.md
  - workflows/lifecycle/learn.md
  - workflows/lifecycle/produce.md
  - workflows/utility/archive.md
findings:
  critical: 3
  warning: 6
  info: 3
  total: 12
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-05-04T12:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Reviewed the phase 11 gap-closure files: two CJS library modules (campaign, health), the installer script, one reference document, and three workflow Markdown files. The CJS code is generally well-structured with good security patterns (path traversal guards, TOCTOU-safe creation, slug sanitization). However, several logic bugs were found including a slug sanitization that silently drops hyphens at boundaries, an install.js that overwrites existing installations without cleaning stale files, a frontmatter value injection vector through the campaign name field, and race conditions in the archive copy-then-delete sequence. The workflow Markdown files are sound instructional documents with minor gaps.

## Critical Issues

### CR-01: Campaign name injected directly into YAML frontmatter without sanitization

**File:** `bin/lib/campaign.cjs:75`
**Issue:** In `cmdCampaignInit`, the `name` parameter is interpolated directly into the YAML frontmatter string on line 75: `` `name: ${name}` ``. If a user provides a campaign name containing YAML-significant characters (e.g., a colon, a newline via programmatic call, or the string `---`), the resulting STATE.md will have corrupted or unparseable frontmatter. Unlike `slug`, which is sanitized to `[a-z0-9-]`, `name` passes through with only a truthy check. A name like `My Campaign: The Best` would produce `name: My Campaign: The Best`, which upon re-parsing via `parseFrontmatter` would truncate the value at the first colon to `My Campaign` since `parseFrontmatter` splits on `indexOf(':')` and takes only the first segment as the key.

**Fix:** Use `serializeFrontmatter` from core.cjs to build the frontmatter instead of manual string concatenation, or at minimum quote the name value:
```javascript
// Option A: quote the name value in frontmatter
`name: "${name.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,

// Option B (preferred): build frontmatter via serializeFrontmatter
const frontmatter = { campaign: safe, name, created: timestamp, phase: 'created', /* ... */ };
const stateContent = serializeFrontmatter(frontmatter, bodyContent);
```

### CR-02: install.js overwrites existing installation without removing stale files

**File:** `install.js:220-223`
**Issue:** When an existing installation is detected at the target directory (line 220), the installer logs "Existing installation found. Overwriting..." and then proceeds to copy directories on top of the existing tree. Because `copyDirSync` only adds/replaces files, any files that existed in the old installation but were removed in the new version will persist as stale artifacts. This means old skills, workflows, or agent definitions that were deleted between versions will remain active in the user's installation, potentially causing incorrect behavior or namespace collisions.

**Fix:** Remove the existing target directory before copying the new installation:
```javascript
if (dirExists(targetDir)) {
  console.log('Existing installation found. Removing before reinstall...');
  fs.rmSync(targetDir, { recursive: true, force: true });
  console.log('');
}
```

### CR-03: Slug sanitization silently produces empty string from valid-looking input

**File:** `bin/lib/campaign.cjs:33`
**Issue:** The slug sanitizer `slug.toLowerCase().replace(/[^a-z0-9-]/g, '')` runs after the `!slug || !slug.trim()` guard. If a user passes a slug consisting entirely of characters that get stripped (e.g., `"___"` or `"..."` or Unicode like `"cafe"`), the `safe` variable becomes an empty string `""`, but execution continues. This results in `resolveCampaignStatePath` resolving to `.marketing/CAMPAIGNS//STATE.md` (note the double slash), and in `cmdCampaignInit` creating a directory at `.marketing/CAMPAIGNS/` with no subdirectory name, writing STATE.md directly inside CAMPAIGNS/. The same pattern exists at lines 54, 177, 370, and 471.

**Fix:** Add an empty-string check after sanitization:
```javascript
const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
if (!safe) error('campaign slug must contain at least one alphanumeric character after sanitization');
```

## Warnings

### WR-01: cmdCampaignList mutually-exclusive filter check runs AFTER reading all campaigns

**File:** `bin/lib/campaign.cjs:296-298`
**Issue:** The mutual-exclusion validation between `filter` and `sinceArg` (line 296) runs after all campaign STATE.md files have already been read from disk (lines 282-293). If both flags are provided, all that filesystem I/O is wasted before the error is thrown. While not a correctness bug, this is a logic ordering issue that should be caught before any work is done.

**Fix:** Move the mutual-exclusion check to the top of `cmdCampaignList`, before reading any files:
```javascript
function cmdCampaignList(filter, sinceArg, raw) {
  if (filter && sinceArg) {
    error('--active/--shipped-since-last-audit and --since are mutually exclusive');
  }
  // ... then read campaigns
```

### WR-02: parseFrontmatter truncates values containing colons

**File:** `bin/lib/core.cjs:122-125`
**Issue:** The frontmatter parser uses `line.indexOf(':')` to split key from value, which correctly handles values containing colons (the value is everything after the first colon). However, the `cmdCampaignInit` function writes `name: ${name}` without quoting (see CR-01). If the value itself starts with a space after the colon (standard YAML), parsing works. But if `serializeFrontmatter` quotes a value with embedded colons (line 148), then `parseFrontmatter` strips quotes on re-read (lines 127-131). This round-trip is correct for the serializer's output but breaks for the hand-written frontmatter in `cmdCampaignInit` where `name` is never quoted. This is the secondary effect of CR-01 -- the parser is fine, but the manual frontmatter construction bypasses the serializer's quoting logic.

**Fix:** Address via CR-01 fix (use `serializeFrontmatter` for all frontmatter construction).

### WR-03: DRIFT-LOG.md column parsing assumes fixed column positions without validation

**File:** `bin/lib/campaign.cjs:319-327`
**Issue:** The `--shipped-since-last-audit` filter parses DRIFT-LOG.md pipe-delimited table rows by splitting on `|` and expecting column index 2 to be a timestamp (line 322). The comment says "Expected columns: ['', event_type, timestamp, source, details, affected, '']" but there is no validation that the actual table structure matches this expectation. If the DRIFT-LOG.md table format changes or a row has merged/missing columns, `cols[2]` will silently pick up the wrong field. The regex `/^\d{4}-\d{2}-\d{2}T/` provides some defense, but a non-timestamp string matching that pattern (unlikely but possible in a "details" column) would cause incorrect filtering.

**Fix:** Add column count validation:
```javascript
const cols = line.split('|').map(c => c.trim());
if (cols.length < 6) continue; // skip malformed rows
```

### WR-04: install.js targetDir path traversal check is incomplete

**File:** `install.js:196-199`
**Issue:** The check `!targetDir.startsWith(homeDir)` guards against resolving outside the home directory. However, `os.homedir()` returns a path without a trailing separator. A user with home directory `/home/jo` would pass the check for a target path of `/home/john/...` since `"/home/john".startsWith("/home/jo")` is true. This is mitigated by the fact that `targetDir` is computed internally (not from user input) and always goes through `path.resolve(os.homedir(), ...)`, making exploitation impractical in the current code. However, if the runtime detection or argument parsing is ever extended to accept a custom target path, this becomes exploitable.

**Fix:** Append `path.sep` to the home directory check for correctness (consistent with the pattern used in campaign.cjs):
```javascript
if (!targetDir.startsWith(homeDir + path.sep)) {
  console.error('Error: Target directory resolves outside home directory. Aborting.');
  process.exit(1);
}
```

### WR-05: learn.md Step 8 sets phase.learned to "true" instead of ISO timestamp

**File:** `workflows/lifecycle/learn.md:354`
**Issue:** The learn workflow updates `phase.learned` to `true` (line 354: `campaign update ${SLUG} phase.learned true`), but all other phase timestamp fields in STATE.md (lines 79-88 of campaign.cjs) are initialized to `null` and are expected to hold ISO timestamps (as set by produce.md Step 8 which sets `phase.produced "$TIMESTAMP"`). Using `true` instead of an ISO timestamp breaks consistency with all other phase.* fields and makes it impossible to know when the learn phase actually completed.

**Fix:** Change line 354 to use an ISO timestamp:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} phase.learned "$ISO_DATE"
```

### WR-06: cmdRepurposeManifest does not validate derivative asset_id uniqueness

**File:** `bin/lib/campaign.cjs:511-524`
**Issue:** When appending derivatives to a manifest, the function does not check whether a derivative with the same `asset_id` already exists in `manifest.derivatives`. If `cmdRepurposeManifest` is called twice with overlapping derivative IDs, the manifest will contain duplicate asset_id entries. Downstream consumers (e.g., verify) that look up assets by ID may get inconsistent results depending on whether they find the first or last match.

**Fix:** Check for existing asset_id before appending:
```javascript
const existingIds = new Set(manifest.derivatives.map(d => d.asset_id));
for (const d of derivatives) {
  if (existingIds.has(Number(d.asset_id))) {
    error(`Duplicate asset_id ${d.asset_id} -- already exists in MANIFEST.json`);
  }
  // ... append logic
}
```

## Info

### IN-01: Duplicate dirExists/fileExists helper definitions across files

**File:** `bin/lib/health.cjs:45-64` and `install.js:71-90`
**Issue:** `dirExists` and `fileExists` are defined identically in both `health.cjs` and `install.js`. While `install.js` cannot share code with `health.cjs` (different execution context), the duplication within the `bin/lib/` ecosystem (health.cjs vs core.cjs) is unnecessary. `core.cjs` already exports `safeReadFile` and `safeWriteFile` but not directory/file existence checks.

**Fix:** Consider adding `dirExists` and `fileExists` to `core.cjs` and importing them in `health.cjs`. `install.js` must keep its own copy since it runs standalone.

### IN-02: checkReferenceStaleness uses mtime which can be misleading

**File:** `bin/lib/health.cjs:126-128`
**Issue:** The staleness check uses `stat.mtimeMs` (filesystem modification time). Any file operation that touches the file (including `git checkout`, `cp`, or even some editors that create temp files) will reset mtime, making a genuinely stale file appear fresh. Conversely, a file that was thoughtfully reviewed but not edited will appear stale. This is a known limitation of mtime-based staleness detection, not a bug, but worth documenting.

**Fix:** Consider adding a comment noting this limitation, or tracking last-reviewed dates in frontmatter of each reference file.

### IN-03: archive.md and learn.md have overlapping learnings extraction responsibilities

**File:** `workflows/utility/archive.md:111-174` and `workflows/lifecycle/learn.md:165-202`
**Issue:** Both the archive workflow (Step 3) and the learn workflow (Steps 3-4) extract learnings from campaign artifacts using the same learnings-extraction.md reference. If a user runs `/ttm-learn` (setting phase to "learned") and then `/ttm-archive`, the archive workflow will extract learnings again and append potentially duplicate rows to LEARNINGS.md. The archive workflow has a duplicate guard (Step 6, line 258) checking for same slug + same date, which would catch same-day duplicates, but if archive runs on a different day than learn, duplicate lessons with different dates would be appended.

**Fix:** In archive.md Step 3, check if the campaign phase is "learned" (meaning /ttm-learn already ran), and if so, skip learnings extraction with a message: "Learnings already extracted via /ttm-learn. Skipping re-extraction."

---

_Reviewed: 2026-05-04T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
