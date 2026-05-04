---
phase: 01-plugin-scaffold-and-tooling
reviewed: 2026-04-22T12:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - bin/ttm-tools.cjs
  - bin/lib/core.cjs
  - bin/lib/slug.cjs
  - bin/lib/state.cjs
  - bin/lib/health.cjs
  - bin/lib/commit.cjs
  - .claude-plugin/plugin.json
  - package.json
  - settings.json
  - skills/ttm-init/SKILL.md
  - skills/ttm-produce/SKILL.md
  - skills/ttm-verify/SKILL.md
  - skills/ttm-health/SKILL.md
  - skills/ttm-positioning-check/SKILL.md
  - templates/claude-md.md
  - templates/agents-md.md
  - templates/reference-files/positioning.md
  - gates/base-gates.md
  - references/context-loading.md
findings:
  critical: 0
  warning: 4
  info: 3
  total: 7
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-22T12:00:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

Reviewed the Phase 1 plugin scaffold: 6 JavaScript source files (bin/ tooling), 1 plugin manifest, 2 package configs, 5 SKILL.md stubs, 3 templates/reference files, 1 gates definition, and 1 reference document. The JavaScript tooling is well-structured with zero npm dependencies, proper use of `execFileSync` (no shell injection via child_process), and sensible sanitization in the commit helper. No critical security issues found. Four warnings relate to input validation gaps in the CLI argument parsing and frontmatter parser. Three informational items note minor robustness improvements.

## Warnings

### WR-01: Frontmatter parser assumes Unix line endings

**File:** `bin/lib/core.cjs:114`
**Issue:** `parseFrontmatter` uses `content.substring(4, endIndex)` to extract the frontmatter block, assuming the opening `---` is followed by `\n` (exactly 4 characters: `---\n`). If the file has Windows line endings (`\r\n`), the substring starts at offset 4 and includes the trailing `\r`, producing keys/values with embedded carriage returns. The closing delimiter search `content.indexOf('\n---', 3)` also fails to match `\r\n---`.
**Fix:**
```javascript
function parseFrontmatter(content) {
  if (!content || !content.startsWith('---')) {
    return { frontmatter: {}, body: content || '' };
  }
  // Normalize line endings before parsing
  const normalized = content.replace(/\r\n/g, '\n');
  const endIndex = normalized.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content };
  }
  const fmBlock = normalized.substring(4, endIndex).trim();
  const body = normalized.substring(endIndex + 4).trimStart();
  // ... rest unchanged
```

### WR-02: State update CLI args allow --raw to be misinterpreted as field name

**File:** `bin/ttm-tools.cjs:46-50`
**Issue:** The `state` subcommand reads `args[1]`, `args[2]`, `args[3]` positionally without filtering `--raw` first. If the user invokes `ttm-tools.cjs state update --raw field value`, then `args[1]` is `update`, `args[2]` is `--raw`, and `args[3]` is `field` -- so `--raw` becomes the field name written to STATE.md. Other subcommands (slug, timestamp) correctly filter `--raw` before processing, but `state` does not.
**Fix:**
```javascript
case 'state': {
  const stateArgs = args.slice(1).filter(a => a !== '--raw');
  const subCmd = stateArgs[0];
  const { cmdStateRead, cmdStateUpdate } = require('./lib/state.cjs');
  if (subCmd === 'read') cmdStateRead(raw);
  else if (subCmd === 'update') cmdStateUpdate(stateArgs[1], stateArgs[2], raw);
  else error('state subcommand required: read, update');
  break;
}
```

### WR-03: Commit file paths not validated for path traversal

**File:** `bin/lib/commit.cjs:57-59`
**Issue:** File paths passed to `git add` are used as-is with no validation. While `execFileSync` prevents shell injection, a path like `../../../other-repo/secret.txt` would be passed directly to `git add`, allowing staging of files outside the project. The `state.cjs` module has a `resolveStatePath()` that validates paths stay within the project root -- the same pattern should apply here.
**Fix:**
```javascript
const path = require('path');

// Inside cmdCommit, before the staging loop:
const projectRoot = path.resolve(process.cwd());
for (const file of files) {
  const resolved = path.resolve(projectRoot, file);
  if (!resolved.startsWith(projectRoot + path.sep) && resolved !== projectRoot) {
    error(`file path escapes project directory: ${file}`);
  }
}
```

### WR-04: Missing validation on commit message length

**File:** `bin/lib/commit.cjs:43-54`
**Issue:** There is no upper bound on commit message length. A very long message (e.g., from accidental paste of file contents) would be passed through sanitization and then to git. While git itself has no hard limit, this could produce unwieldy commits. More importantly, the sanitization replaces characters but does not truncate, meaning a multi-kilobyte message passes through.
**Fix:**
```javascript
const MAX_MESSAGE_LENGTH = 500;
const sanitized = sanitizeMessage(message);
if (!sanitized) {
  error('commit message empty after sanitization');
}
if (sanitized.length > MAX_MESSAGE_LENGTH) {
  error(`commit message too long (${sanitized.length} chars, max ${MAX_MESSAGE_LENGTH})`);
}
```

## Info

### IN-01: parseNamedArgs silently consumes flag-like positional values

**File:** `bin/lib/core.cjs:59`
**Issue:** If a positional argument happens to start with `--` (e.g., a commit message containing `--fix`), it gets consumed as a named arg key along with the next argument as its value. This is an inherent limitation of the simple parser but worth documenting. Consider using `--` as a terminator to separate flags from positional args.
**Fix:** Add a `--` terminator check in the while loop:
```javascript
if (arg === '--') { 
  positional.push(...args.slice(i + 1)); 
  break; 
}
```

### IN-02: Duplicate package.json files with divergent content

**File:** `.claude-plugin/plugin.json` and `package.json`
**Issue:** Both `.claude-plugin/plugin.json` and `package.json` define the same package metadata (name, version, description, license) but `package.json` has additional fields (`bin`, `files`, `engines`, `keywords`) not present in `plugin.json`, and `plugin.json` has `author` and `keywords` not present in `package.json`. This creates a maintenance burden -- version bumps must update both files. Consider a build step or documentation noting that both must be kept in sync.
**Fix:** Add a comment in both files or a pre-publish script that validates they share the same version and name.

### IN-03: settings.json has empty agent config

**File:** `settings.json:2`
**Issue:** `settings.json` contains `"agent": {}` which is an empty object. This is presumably a placeholder for future configuration. If downstream code accesses properties on `agent` without checking, it would get `undefined` rather than a useful error. This is fine for now as a scaffold but should be populated or documented before Phase 2.
**Fix:** No immediate action needed. Consider adding a comment or populating default values when the agent config schema is defined.

---

_Reviewed: 2026-04-22T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
