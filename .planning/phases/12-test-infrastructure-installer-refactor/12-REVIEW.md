---
phase: 12-test-infrastructure-installer-refactor
reviewed: 2026-05-10T20:09:15Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - install.js
  - package.json
  - test/helpers.cjs
  - test/install.test.cjs
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-05-10T20:09:15Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This phase delivers a refactored `install.js` and a new test infrastructure under `test/`. The installer logic is generally sound: path construction is correct, the home-directory safety check works, and file/directory helpers are well-typed. However, there is one confirmed blocker: the `agents/` directory is present in `DIRS_TO_COPY` but absent from the `package.json` `files` array, causing every `npm`-distributed install to fail its own post-install validation and exit with code 1. Four additional warnings cover double `os.homedir()` calls, `copyDirSync` creating orphan directories on error, missing detection of adjacent flags passed to `--runtime`, and the `os.homedir()` testability gap that renders the two helper utilities effectively dead. Three info-level items cover dead test-helper exports, sparse test coverage of critical install-path functions, and silent swallowing of non-file/non-dir entries in `copyDirSync`.

---

## Critical Issues

### CR-01: `agents/` directory excluded from npm `files` manifest — installer always exits 1 after npm install

**File:** `package.json:12-23` and `install.js:13-23`

**Issue:** `DIRS_TO_COPY` in `install.js` lists `'agents'` as a required component (line 21). `validateInstall` iterates over `DIRS_TO_COPY` and marks any absent directory as `'fail'` (lines 129-134). `main()` counts failures and calls `process.exit(1)` when any exist (lines 259-262). However, `package.json`'s `files` array — which controls what npm includes in the published tarball — does not list `agents/`. When a user runs `npx taketomarket` from the registry, `agents/` will not exist in `PACKAGE_ROOT`. The installer skips copying it (line 229 guard passes), then validation reports it as `'fail'`, and the process exits 1 with the message "Installation incomplete. Some components missing." even though everything else was installed correctly.

Verified by enumeration: `DIRS_TO_COPY` contains 9 entries; `package.json` `files` contains entries for only 8 of them — `agents/` is missing.

**Fix:** Add `"agents/"` to the `files` array in `package.json`:

```json
"files": [
  ".claude-plugin/",
  "skills/",
  "workflows/",
  "templates/",
  "references/",
  "playbooks/",
  "gates/",
  "bin/",
  "agents/",
  "settings.json",
  "install.js"
]
```

If `agents/` is intentionally optional (not yet shipped), remove it from `DIRS_TO_COPY` instead so validation does not fail when it is absent:

```js
const DIRS_TO_COPY = [
  '.claude-plugin',
  'skills',
  'workflows',
  'templates',
  'references',
  'playbooks',
  'gates',
  'bin',
  // 'agents',  -- not yet included in npm package; add when ready
];
```

---

## Warnings

### WR-01: `os.homedir()` called twice — safety check can compare against a different value than `targetDir` was built with

**File:** `install.js:193,196`

**Issue:** `targetDir` is computed at line 193 using `os.homedir()`. The `homeDir` variable used in the safety check is bound at line 196 from a second, independent call to `os.homedir()`. On POSIX, `os.homedir()` reads the `HOME` environment variable at call time. If anything between lines 193 and 196 alters `process.env.HOME` (e.g., a poorly-behaved native module or a future refactor), `targetDir` could be built from one home path while the guard checks against another. The check `targetDir.startsWith(homeDir + path.sep)` could then wrongly pass or wrongly fail.

```js
// Line 193
const targetDir = path.resolve(os.homedir(), runtimeDir, 'plugins', 'taketomarket');

// Line 196  (second independent call)
const homeDir = os.homedir();
if (!targetDir.startsWith(homeDir + path.sep)) {
```

**Fix:** Call `os.homedir()` once and reuse it:

```js
const homeDir = os.homedir();
const targetDir = path.resolve(homeDir, runtimeDir, 'plugins', 'taketomarket');

if (!targetDir.startsWith(homeDir + path.sep)) {
  console.error('Error: Target directory resolves outside home directory. Aborting.');
  process.exit(1);
}
```

---

### WR-02: `copyDirSync` creates the destination directory before verifying the source exists — leaves orphan directories on error

**File:** `install.js:97-116`

**Issue:** `copyDirSync` calls `fs.mkdirSync(dest, { recursive: true })` at line 98 before calling `fs.readdirSync(src, ...)` at line 99. If `src` does not exist, `mkdirSync` succeeds (creating an empty `dest`), then `readdirSync` throws `ENOENT`. The caller (`main`) guards against this with `dirExists(srcDir)` at line 229, so the normal install path is safe. However, `copyDirSync` is exported as a public API (line 293) and any direct caller without that guard will leave orphan empty directories in `dest` when the source is missing, with no indication that anything went wrong.

**Fix:** Add a source-existence check inside `copyDirSync`:

```js
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`copyDirSync: source does not exist: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });
  // ... rest unchanged
}
```

---

### WR-03: `--runtime` flag consumes the next argument without checking whether it is itself a flag — produces a confusing warning

**File:** `install.js:39-47`

**Issue:** When a user types `npx taketomarket --runtime --dry-run`, the parser reads `--dry-run` as the runtime value (line 41), emits `Warning: Unknown runtime "--dry-run". Defaulting to claude.`, and then `--dry-run` is NOT consumed from `args`, so `DRY_RUN` is still set correctly at line 188. While the final behavior is accidentally correct, the warning message is misleading: it tells the user their runtime is unknown when they in fact simply forgot to supply a value. A user who sees the warning may be confused about why their runtime override failed.

**Fix:** Before consuming `args[runtimeIdx + 1]` as the runtime value, check whether it starts with `--`:

```js
const runtimeIdx = args.indexOf('--runtime');
if (runtimeIdx !== -1 && runtimeIdx + 1 < args.length) {
  const next = args[runtimeIdx + 1];
  if (next.startsWith('--')) {
    console.warn('Warning: --runtime requires a value (claude|codex). Defaulting to claude.');
    // fall through to auto-detect
  } else {
    const value = next.toLowerCase();
    if (value === 'claude' || value === 'codex') {
      return value;
    }
    console.warn(`Warning: Unknown runtime "${next}". Defaulting to claude.`);
    return 'claude';
  }
}
```

---

### WR-04: `createMockHome` in `test/helpers.cjs` cannot isolate install from the real `$HOME` — helper is architecturally broken for its intended use

**File:** `test/helpers.cjs:49-53`

**Issue:** `createMockHome` creates a fake `.claude/plugins/taketomarket/` directory tree inside a temp `baseDir` and returns `baseDir` as the "mock HOME". The intent is to let E2E tests run `main()` or other install functions without touching the real home directory. However, `install.js` calls `os.homedir()` directly (lines 50, 55, 193, 196). On POSIX, `os.homedir()` reads `process.env.HOME` at call time, so tests would need to `process.env.HOME = baseDir` before exercising install code. `createMockHome` does not set `process.env.HOME`, does not return instructions to do so, and no existing test imports or uses this function. The helper as written cannot fulfill its stated purpose without additional scaffolding that does not exist.

**Fix:** Either update `createMockHome` to accept and document the `HOME`-override requirement (and add teardown):

```js
function createMockHome(baseDir) {
  const claudeDir = path.join(baseDir, '.claude', 'plugins', 'taketomarket');
  fs.mkdirSync(claudeDir, { recursive: true });
  const originalHome = process.env.HOME;
  process.env.HOME = baseDir;
  return {
    dir: baseDir,
    restore() { process.env.HOME = originalHome; },
  };
}
```

Or delete the helper and redesign E2E tests to use `child_process.spawnSync` with `env: { HOME: tmpDir }` to keep test isolation at the process boundary.

---

## Info

### IN-01: `createMockMarketing` is exported but never imported by any test file — dead code

**File:** `test/helpers.cjs:29-41,57`

**Issue:** `createMockMarketing` creates a `.marketing/` directory with `STATE.md` and `POSITIONING.md`. It is exported at line 57. Searching all files under `test/` finds zero imports of `createMockMarketing`. This is dead exported code.

**Fix:** Remove `createMockMarketing` from `helpers.cjs` and its export entry, or add a test that uses it if the intent was to include it.

---

### IN-02: Test suite covers only trivial utility functions — the core install path (`detectRuntime`, `validateInstall`, `copyDirSync`, `main`) has zero test coverage

**File:** `test/install.test.cjs:1-83`

**Issue:** The three `describe` blocks test: (1) that the module can be `require`d, (2) that `dirExists` returns true/false, and (3) that `fileExists` returns true/false. None of the functions that perform actual installation work are exercised: `detectRuntime`, `validateInstall`, `copyDirSync`, or the `main` function end-to-end. A broken `detectRuntime` (e.g., always returning `'codex'`) or a broken `validateInstall` (e.g., wrong threshold) would pass the entire test suite undetected.

**Fix:** Add tests for at minimum:
- `detectRuntime(['--runtime', 'codex'])` returns `'codex'`
- `detectRuntime(['--runtime', 'CLAUDE'])` returns `'claude'` (case-insensitive)
- `detectRuntime(['--runtime', 'invalid'])` returns `'claude'` with a warning
- `detectRuntime([])` returns `'claude'` (default)
- `validateInstall(wellPopulatedTmpDir)` returns all passes
- `validateInstall(emptyTmpDir)` returns all fails
- `copyDirSync` copies files recursively and skips symlinks

---

### IN-03: `copyDirSync` silently ignores file-system entries that are neither regular files, directories, nor symlinks (e.g., sockets, FIFOs, device nodes)

**File:** `install.js:101-115`

**Issue:** The loop in `copyDirSync` handles symlinks (warn + skip), directories (recurse), and regular files (copy). Entries that match none of these — such as UNIX domain sockets, named pipes, or block devices — fall through all branches silently with no copy and no warning. In the context of a marketing skill installer, the source tree is almost certainly free of such entries, so this is not a likely failure mode. It is noted because the symlink case does emit a warning while the "other type" case does not, creating an inconsistency in diagnostic behavior.

**Fix:** Add an else branch to warn on unrecognized entry types:

```js
} else {
  console.warn(`  Warning: Skipping ${entry.name} (unsupported file type)`);
}
```

---

_Reviewed: 2026-05-10T20:09:15Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
