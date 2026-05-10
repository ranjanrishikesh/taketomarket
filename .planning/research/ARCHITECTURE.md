# Architecture: Test Infrastructure & npm Publish Integration

**Domain:** CJS skill package — adding tests and publishing to npm
**Researched:** 2026-05-11
**Focus:** How tests integrate with bin/lib/*.cjs, package structure for npm publish, files[] field semantics

## Current Architecture (Reference)

```
takeToMarket/
├── install.js              # bin entry point (npx taketomarket)
├── package.json            # files[] whitelist, bin: { taketomarket: ./install.js }
├── bin/
│   ├── ttm-tools.cjs      # CLI router (subcommand dispatch)
│   └── lib/
│       ├── core.cjs        # Shared: output, error, parseNamedArgs, parseFrontmatter, serializeFrontmatter
│       ├── slug.cjs        # slug, timestamp commands
│       ├── state.cjs       # STATE.md read/update
│       ├── campaign.cjs    # Campaign CRUD
│       ├── commit.cjs      # git commit helper
│       ├── deviation.cjs   # Deviation handling
│       ├── drift-log.cjs   # Drift log operations
│       └── health.cjs      # .marketing/ validation
├── skills/                 # 27 ttm-* SKILL.md directories
├── workflows/              # Phase workflow Markdown files
├── templates/              # Output templates
├── references/             # Domain reference docs
├── playbooks/              # 10 discipline playbooks
├── gates/                  # Quality gate definitions
├── agents/                 # Agent definitions
├── .claude-plugin/         # plugin.json manifest
└── settings.json           # Default configuration
```

## Recommended Test Architecture

### Test File Layout

```
takeToMarket/
├── test/
│   ├── install.test.cjs        # Tests for install.js (main installer)
│   ├── bin/
│   │   ├── slug.test.cjs       # Tests for bin/lib/slug.cjs
│   │   ├── core.test.cjs       # Tests for bin/lib/core.cjs
│   │   ├── state.test.cjs      # Tests for bin/lib/state.cjs
│   │   ├── campaign.test.cjs   # Tests for bin/lib/campaign.cjs
│   │   ├── commit.test.cjs     # Tests for bin/lib/commit.cjs
│   │   ├── deviation.test.cjs  # Tests for bin/lib/deviation.cjs
│   │   ├── drift-log.test.cjs  # Tests for bin/lib/drift-log.cjs
│   │   └── health.test.cjs     # Tests for bin/lib/health.cjs
│   ├── integration/
│   │   └── install-e2e.test.cjs  # End-to-end install into temp dir
│   └── helpers/
│       └── fixtures.cjs        # Shared test setup (temp dirs, mock .marketing/)
```

**Why this layout:**
- Mirrors `bin/lib/` structure so test-to-source mapping is obvious
- `.cjs` extension matches source files — no transpilation, no ESM interop issues
- `test/helpers/` for shared fixtures avoids duplication across test files
- `integration/` separates fast unit tests from slower filesystem-heavy E2E tests

### Test Runner: Node.js Built-in Test Runner (node:test)

**Use `node:test` + `node:assert` because:**
1. Zero dependencies — matches the project's zero-dep constraint
2. Available in Node 18+ (the project's minimum version)
3. Runs `.cjs` files natively — no config, no transform
4. Built-in test runner supports `--test` glob flag: `node --test test/**/*.test.cjs`
5. TAP output, `describe`/`it`/`test` API, `beforeEach`/`afterEach` hooks all included

**Do NOT use Jest, Vitest, or Mocha** — all add npm dependencies. Dev dependencies are acceptable but unnecessary when node:test suffices.

```javascript
// Example: test/bin/slug.test.cjs
'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { cmdSlug } = require('../../bin/lib/slug.cjs');
```

### How Tests Integrate with CJS bin/ Architecture

**Direct require() — no mocking framework needed:**

The `bin/lib/*.cjs` modules export named functions. Tests require them directly:

```javascript
const { parseFrontmatter, serializeFrontmatter } = require('../../bin/lib/core.cjs');
const { cmdSlug, cmdTimestamp } = require('../../bin/lib/slug.cjs');
```

**Filesystem isolation pattern for state/campaign tests:**

Modules that read/write `.marketing/` directory use `process.cwd()`. Tests should:
1. Create a temp directory with `fs.mkdtempSync()`
2. `process.chdir(tempDir)` in `beforeEach`
3. Restore original cwd in `afterEach`
4. Clean up temp dir after test

```javascript
const { describe, it, beforeEach, afterEach } = require('node:test');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('state commands', () => {
  let originalCwd;
  let tempDir;

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ttm-test-'));
    process.chdir(tempDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
```

**Testing install.js:**

The installer uses `os.homedir()` and `__dirname`. To test without polluting the real home:
1. Run install.js as a child process with overridden HOME env var
2. Extract core logic (copyDirSync, validateInstall, detectRuntime) into testable exports
3. For E2E: Use `child_process.execSync` with a custom `HOME` env var pointing to a temp dir

```javascript
// test/install.test.cjs — unit tests for exported functions
const { detectRuntime, dirExists, fileExists, copyDirSync, validateInstall } = require('../install.js');

// test/integration/install-e2e.test.cjs — full install flow
const { execSync } = require('child_process');
const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ttm-home-'));

execSync('node install.js --runtime claude', {
  cwd: path.resolve(__dirname, '../..'),
  env: { ...process.env, HOME: tempHome },
});
// Validate: tempHome/.claude/plugins/taketomarket/ has all dirs
```

**Testing process.exit() and stderr:**

For functions that call `process.exit(1)` (like `error()` in core.cjs), test via child process:

```javascript
const { execSync } = require('child_process');
assert.throws(() => {
  execSync('node bin/ttm-tools.cjs nonexistent-command', { encoding: 'utf8' });
}, /Error/);
```

### package.json Scripts Addition

```json
{
  "scripts": {
    "test": "node --test test/**/*.test.cjs",
    "test:unit": "node --test test/bin/*.test.cjs",
    "test:integration": "node --test test/integration/*.test.cjs",
    "prepublishOnly": "npm test"
  }
}
```

## npm Publish: How `files` Field Works

### Current `files` Field

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
  "settings.json",
  "install.js"
]
```

### `files` Field Semantics (HIGH confidence — npm docs)

1. **`files` is a whitelist.** Only listed paths (and always-included files) end up in the tarball.
2. **Always included regardless of `files`:** `package.json`, `LICENSE`, `README.md`, the `bin` entry file (`install.js`).
3. **Always excluded regardless of `files`:** `.git`, `node_modules`, `.npmrc`, `.gitignore`.
4. **Trailing `/` on directory entries:** Includes the entire directory tree recursively.
5. **`files` overrides `.npmignore` at root level.** When `files` is present, `.npmignore` is ignored at the root level. However, `.npmignore` inside subdirectories still applies.
6. **`test/` directory:** NOT in the `files` array, so it is automatically excluded from the published tarball. No `.npmignore` needed.

### Key Implication: No .npmignore Needed

Because `files` is already defined as a whitelist, adding a `.npmignore` is redundant and creates confusion. The `files` field is the canonical mechanism.

**What gets published (tarball contents):**
- `package.json` (always)
- `LICENSE` (always)
- `README.md` (always)
- `install.js` (always — it is the bin entry)
- `.claude-plugin/` (from files[])
- `skills/` (from files[])
- `workflows/` (from files[])
- `templates/` (from files[])
- `references/` (from files[])
- `playbooks/` (from files[])
- `gates/` (from files[])
- `bin/` (from files[])
- `settings.json` (from files[])

**What does NOT get published:**
- `test/` — not in files[]
- `.planning/` — not in files[]
- `docs/` — not in files[]
- `CLAUDE.md` — not in files[]
- `AGENTS.md` — not in files[]
- `idea.md` — not in files[]
- `agents/` — not in files[] (BUG — see below)

### BUG: Missing `agents/` in `files[]`

The `install.js` DIRS_TO_COPY includes `'agents'` but `files[]` in package.json does NOT include `"agents/"`. This means the `agents/` directory will be excluded from the npm tarball, and install.js will log "Skipping agents/ (not found in package)" when run via npx.

**Fix required:** Add `"agents/"` to the `files` array in package.json.

## Verification Command

Before publishing, always dry-run to see exactly what will be in the tarball:

```bash
npm pack --dry-run
```

This lists every file that would be included. Run this as a pre-publish check and as a test assertion.

## Component Boundaries for Testing

| Component | Responsibility | Test Strategy |
|-----------|---------------|---------------|
| `bin/lib/core.cjs` | Output formatting, frontmatter parse/serialize, file I/O helpers | Pure function unit tests (parseFrontmatter, serializeFrontmatter). Child process for output()/error(). |
| `bin/lib/slug.cjs` | Slug generation, timestamp formatting | Pure function unit tests — no I/O |
| `bin/lib/state.cjs` | Read/write STATE.md | Filesystem isolation (temp dir with mock STATE.md) |
| `bin/lib/campaign.cjs` | Campaign init, state, update, list | Filesystem isolation (temp dir with mock .marketing/) |
| `bin/lib/health.cjs` | Validate .marketing/ structure | Filesystem isolation (various valid/invalid structures) |
| `bin/lib/commit.cjs` | Git staging and commit | Git repo in temp dir (git init) |
| `bin/lib/deviation.cjs` | Deviation record handling | Filesystem isolation |
| `bin/lib/drift-log.cjs` | Drift log append/deprecation | Filesystem isolation |
| `install.js` (unit) | detectRuntime, validateInstall, copyDirSync | Direct require + isolated tests |
| `install.js` (E2E) | Full installer | Child process with overridden HOME env var |

## Refactoring install.js for Testability

Current `install.js` runs everything in `main()` which calls `process.exit()`. For testability, add a `require.main` guard and exports:

```javascript
// At bottom of install.js, replace bare main() call with:
if (require.main === module) {
  main();
}

// Export for testing
module.exports = { detectRuntime, dirExists, fileExists, copyDirSync, validateInstall };
```

This pattern (guard main execution behind `require.main === module`) is standard for CJS CLI scripts. It allows tests to `require('../install.js')` and call individual functions without triggering main() or process.exit().

**This is a non-breaking change:** When invoked via `npx taketomarket`, Node runs install.js as the main module, so `require.main === module` is true and `main()` executes normally.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Adding Jest/Vitest as devDependencies
**Why bad:** Adds 50+ transitive deps to the project. node:test is sufficient and already available in Node 18+.
**Instead:** Use `node:test` + `node:assert` — zero install, zero config.

### Anti-Pattern 2: Testing via ttm-tools.cjs CLI only
**Why bad:** Child process tests are slow and miss error details. Cannot inspect intermediate state.
**Instead:** Test exported functions from `bin/lib/*.cjs` directly. Use CLI tests only for integration/E2E.

### Anti-Pattern 3: Mocking require() for CJS modules
**Why bad:** CJS require is cached. Mock teardown is fragile. Leads to flaky tests.
**Instead:** Design modules to accept dependencies as parameters where needed, or test through real filesystem with temp dirs.

### Anti-Pattern 4: Creating .npmignore alongside files[]
**Why bad:** `files[]` already acts as a whitelist. Adding `.npmignore` creates two competing systems that npm resolves in confusing ways.
**Instead:** Use `files[]` exclusively. Run `npm pack --dry-run` to verify.

### Anti-Pattern 5: Testing with the real HOME directory
**Why bad:** install.js writes to `~/.claude/plugins/taketomarket/`. Tests would pollute (or destroy) a real installation.
**Instead:** Always override HOME to a temp dir in E2E tests.

## Data Flow: Test Execution

```
npm test
  └── node --test test/**/*.test.cjs
        ├── test/bin/core.test.cjs
        │     └── require('../../bin/lib/core.cjs') → unit tests
        ├── test/bin/slug.test.cjs
        │     └── require('../../bin/lib/slug.cjs') → unit tests
        ├── test/bin/state.test.cjs
        │     └── tempDir + require('../../bin/lib/state.cjs') → fs tests
        ├── test/bin/campaign.test.cjs
        │     └── tempDir + require('../../bin/lib/campaign.cjs') → fs tests
        ├── test/bin/health.test.cjs
        │     └── tempDir + require('../../bin/lib/health.cjs') → fs tests
        ├── test/bin/commit.test.cjs
        │     └── tempDir + git init + require('../../bin/lib/commit.cjs')
        ├── test/bin/deviation.test.cjs
        │     └── tempDir + require('../../bin/lib/deviation.cjs')
        ├── test/bin/drift-log.test.cjs
        │     └── tempDir + require('../../bin/lib/drift-log.cjs')
        ├── test/install.test.cjs
        │     └── require('../install.js') → unit test exported functions
        └── test/integration/install-e2e.test.cjs
              └── execSync('node install.js', { env: { HOME: tempDir } })
```

## Build Order for Implementation

1. **Refactor install.js** — Add `require.main` guard and module.exports (no behavior change)
2. **Create test/helpers/fixtures.cjs** — Temp dir creation, mock .marketing/ scaffolding utilities
3. **Write unit tests for bin/lib/*.cjs** — Start with core.cjs (most imported), then slug, state, campaign, health, deviation, drift-log, commit
4. **Write install.js unit tests** — detectRuntime, validateInstall, copyDirSync
5. **Write install E2E test** — Full install to temp HOME, validate all dirs present
6. **Fix package.json** — Add `"agents/"` to files[], add scripts (test, test:unit, test:integration, prepublishOnly)
7. **Run `npm pack --dry-run`** — Verify tarball contents match expectations
8. **Add tarball verification as integration test** — assert expected file count/paths
9. **Publish** — `npm publish`

## New vs Modified Files Summary

| Action | File | Reason |
|--------|------|--------|
| **NEW** | `test/helpers/fixtures.cjs` | Shared test utilities |
| **NEW** | `test/bin/core.test.cjs` | Unit tests for core.cjs |
| **NEW** | `test/bin/slug.test.cjs` | Unit tests for slug.cjs |
| **NEW** | `test/bin/state.test.cjs` | Unit tests for state.cjs |
| **NEW** | `test/bin/campaign.test.cjs` | Unit tests for campaign.cjs |
| **NEW** | `test/bin/commit.test.cjs` | Unit tests for commit.cjs |
| **NEW** | `test/bin/deviation.test.cjs` | Unit tests for deviation.cjs |
| **NEW** | `test/bin/drift-log.test.cjs` | Unit tests for drift-log.cjs |
| **NEW** | `test/bin/health.test.cjs` | Unit tests for health.cjs |
| **NEW** | `test/install.test.cjs` | Unit tests for install.js exports |
| **NEW** | `test/integration/install-e2e.test.cjs` | E2E install test |
| **MODIFY** | `install.js` | Add require.main guard + module.exports |
| **MODIFY** | `package.json` | Add `"agents/"` to files[], add scripts |

## Sources

- npm documentation on `files` field: https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files (HIGH confidence)
- Node.js test runner docs: https://nodejs.org/api/test.html (HIGH confidence)
- Local filesystem inspection of install.js, bin/ttm-tools.cjs, bin/lib/*.cjs (HIGH confidence)
- package.json inspection showing files[] whitelist (HIGH confidence)
