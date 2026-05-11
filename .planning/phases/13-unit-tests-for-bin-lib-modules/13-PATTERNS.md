# Phase 13: Unit Tests for bin/lib Modules - Pattern Map

**Mapped:** 2026-05-11
**Files analyzed:** 7 (6 new test files + 1 modified helper)
**Analogs found:** 1 / 7 (single analog: `test/install.test.cjs` is the template for all 6 test files)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `test/core.test.cjs` | test | request-response (stdout/stderr) | `test/install.test.cjs` | exact |
| `test/slug.test.cjs` | test | request-response (stdout/stderr) | `test/install.test.cjs` | exact |
| `test/state.test.cjs` | test | CRUD (filesystem + stdout) | `test/install.test.cjs` | exact |
| `test/campaign.test.cjs` | test | CRUD (filesystem + stdout) | `test/install.test.cjs` | exact |
| `test/health.test.cjs` | test | CRUD (filesystem + stdout) | `test/install.test.cjs` | exact |
| `test/commit.test.cjs` | test | CRUD (git subprocess + stdout) | `test/install.test.cjs` | exact |
| `test/helpers.cjs` (modify) | utility | transform | `test/helpers.cjs` (self) | exact |

## Pattern Assignments

### `test/core.test.cjs` (test, request-response)

**Analog:** `test/install.test.cjs`

**Imports pattern** (install.test.cjs lines 1-7):
```javascript
'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir } = require('./helpers.cjs');
```

**Adaptation for core.test.cjs:** Add `mock, beforeEach, afterEach` to destructure from `node:test`. core.cjs tests do NOT need `createTempDir` for the pure-function exports (`parseNamedArgs`, `parseFrontmatter`, `serializeFrontmatter`) but DO need it for `safeReadFile` and `safeWriteFile`. Mock `process.stdout.write`, `process.stderr.write`, and `process.exit` for `output()` and `error()` tests.

**Module under test** (core.cjs lines 164-172, exports):
```javascript
module.exports = {
  output,
  error,
  parseNamedArgs,
  safeReadFile,
  safeWriteFile,
  parseFrontmatter,
  serializeFrontmatter,
};
```

**Core test pattern -- pure functions** (no analog in codebase; use direct assertion):
```javascript
// parseNamedArgs is pure: input array -> output object
describe('parseNamedArgs', () => {
  it('parses --key value pairs', () => {
    const result = parseNamedArgs(['--name', 'test', '--count', '5']);
    assert.deepStrictEqual(result.named, { name: 'test', count: '5' });
    assert.deepStrictEqual(result.positional, []);
  });
});
```

**Core test pattern -- process side-effect interception** (no analog in codebase; derived from RESEARCH.md verified pattern):
```javascript
describe('output()', () => {
  let stdoutMock;

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
  });

  afterEach(() => {
    stdoutMock.mock.restore();
  });

  it('writes JSON to stdout', () => {
    output({ foo: 'bar' }, false);
    const written = stdoutMock.mock.calls[0].arguments[0];
    const parsed = JSON.parse(written);
    assert.strictEqual(parsed.foo, 'bar');
  });
});
```

**Core test pattern -- error() interception** (critical: error() writes to stderr AND calls process.exit):
```javascript
describe('error()', () => {
  let stderrMock, exitMock;

  beforeEach(() => {
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('writes error message to stderr and exits with code 1', () => {
    error('something broke');
    assert.strictEqual(exitMock.mock.calls.length, 1);
    assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    const written = stderrMock.mock.calls[0].arguments[0];
    assert.ok(written.includes('something broke'));
  });
});
```

**Core test pattern -- filesystem with temp dir** (install.test.cjs lines 41-58):
```javascript
describe('install.js dirExists', () => {
  let tmp;

  before(() => {
    tmp = createTempDir();
  });

  after(() => {
    tmp.cleanup();
  });

  it('returns true for an existing directory', () => {
    assert.strictEqual(install.dirExists(tmp.dir), true);
  });

  it('returns false for a non-existent path', () => {
    assert.strictEqual(install.dirExists(path.join(tmp.dir, 'nope')), false);
  });
});
```

**Adaptation for safeReadFile/safeWriteFile:** Same pattern -- `createTempDir()` in `before()`, `cleanup()` in `after()`, write/read real files.

---

### `test/slug.test.cjs` (test, request-response)

**Analog:** `test/install.test.cjs`

**Module under test** (slug.cjs lines 56-59, exports):
```javascript
module.exports = {
  cmdSlug,
  cmdTimestamp,
};
```

**Key pattern -- slug.cjs depends on core.cjs output/error at call time, not import time.** The mock.method approach works because it patches the live `process` object. Require slug.cjs at the top level; set up mocks in `beforeEach`.

**Imports pattern for slug.test.cjs:**
```javascript
'use strict';

const { describe, it, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const { cmdSlug, cmdTimestamp } = require('../bin/lib/slug.cjs');
```

**Core test pattern -- cmdSlug** (slug.cjs lines 21-31):
```javascript
// cmdSlug calls output() which writes to stdout, or error() which writes to stderr + exits
// Test: mock stdout.write and stderr.write, verify JSON output
describe('cmdSlug', () => {
  let stdoutMock, stderrMock, exitMock;

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  it('generates slug from text', () => {
    cmdSlug('Hello World', false);
    const output = JSON.parse(stdoutMock.mock.calls[0].arguments[0]);
    assert.strictEqual(output.slug, 'hello-world');
  });
});
```

**Edge case -- cmdTimestamp** (slug.cjs lines 39-54): Time-dependent function. Test format patterns (regex match), not exact values.
```javascript
it('outputs ISO date format', () => {
  cmdTimestamp('date', false);
  const output = JSON.parse(stdoutMock.mock.calls[0].arguments[0]);
  assert.ok(output.timestamp.match(/^\d{4}-\d{2}-\d{2}$/));
});
```

---

### `test/state.test.cjs` (test, CRUD)

**Analog:** `test/install.test.cjs`

**Module under test** (state.cjs lines 93-96, exports):
```javascript
module.exports = {
  cmdStateRead,
  cmdStateUpdate,
};
```

**Key pattern -- cwd override for filesystem modules.** state.cjs calls `process.cwd()` to resolve `.marketing/STATE.md`. Tests must override `process.cwd` to point to a temp directory.

**Imports pattern for state.test.cjs:**
```javascript
'use strict';

const { describe, it, before, after, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir, createMockMarketing } = require('./helpers.cjs');

const { cmdStateRead, cmdStateUpdate } = require('../bin/lib/state.cjs');
```

**Core pattern -- cwd override + mock .marketing/ + stdout/stderr mocks** (state.cjs lines 28-36, resolveStatePath uses process.cwd()):
```javascript
describe('state.cjs', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    createMockMarketing(tmp.dir);
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  beforeEach(() => {
    stdoutMock = mock.method(process.stdout, 'write', () => true);
    stderrMock = mock.method(process.stderr, 'write', () => true);
    exitMock = mock.method(process, 'exit', () => {});
  });

  afterEach(() => {
    stdoutMock.mock.restore();
    stderrMock.mock.restore();
    exitMock.mock.restore();
  });

  // tests here
});
```

**Mock marketing STATE.md content** (helpers.cjs lines 32-35):
```javascript
fs.writeFileSync(
  path.join(marketingDir, 'STATE.md'),
  '---\nstatus: active\n---\n# Marketing State\n'
);
```

---

### `test/campaign.test.cjs` (test, CRUD)

**Analog:** `test/install.test.cjs`

**Module under test** (campaign.cjs lines 546-553, exports):
```javascript
module.exports = {
  cmdCampaignInit,
  cmdCampaignState,
  cmdCampaignUpdate,
  cmdCampaignList,
  cmdCampaignArchive,
  cmdRepurposeManifest,
};
```

**Key pattern -- campaign.cjs is the largest module (553 lines, 6 exports).** Needs the most test cases per D-04. Uses the same cwd override pattern as state.test.cjs plus needs a `.marketing/CAMPAIGNS/` directory structure.

**Campaign init test pattern** (campaign.cjs lines 50-162, cmdCampaignInit creates dirs + STATE.md + RESEARCH.md + BRIEF.md):
```javascript
describe('cmdCampaignInit', () => {
  // cwd override + stdout/stderr/exit mocks from shared pattern

  it('creates campaign directory structure', () => {
    cmdCampaignInit('test-campaign', 'Test Campaign', false);
    const output = JSON.parse(stdoutMock.mock.calls[0].arguments[0]);
    assert.strictEqual(output.created, true);
    assert.strictEqual(output.slug, 'test-campaign');

    // Verify directory structure
    const campaignDir = path.join(tmp.dir, '.marketing', 'CAMPAIGNS', 'test-campaign');
    assert.ok(fs.existsSync(campaignDir));
    assert.ok(fs.existsSync(path.join(campaignDir, 'STATE.md')));
    assert.ok(fs.existsSync(path.join(campaignDir, 'ASSETS')));
  });
});
```

**Campaign archive test pattern** (campaign.cjs lines 363-448, cmdCampaignArchive requires phase='shipped' or 'learned'):
```javascript
// Archive needs a pre-existing campaign with phase='shipped'
// Use the helpers createMockCampaign (new helper, or inline setup)
it('archives a shipped campaign', () => {
  // Pre-create campaign with phase='shipped'
  const campaignDir = path.join(tmp.dir, '.marketing', 'CAMPAIGNS', 'archive-test');
  fs.mkdirSync(path.join(campaignDir, 'ASSETS'), { recursive: true });
  const stateContent = '---\ncampaign: archive-test\nphase: shipped\nlast_updated: 2026-01-01T00:00:00.000Z\n---\n# Campaign\n';
  fs.writeFileSync(path.join(campaignDir, 'STATE.md'), stateContent);

  cmdCampaignArchive('archive-test', false);
  // Verify moved to ARCHIVE/
  assert.ok(fs.existsSync(path.join(tmp.dir, '.marketing', 'CAMPAIGNS', 'ARCHIVE', 'archive-test', 'STATE.md')));
  assert.ok(!fs.existsSync(campaignDir));
});
```

**Template resolution note** (campaign.cjs lines 129-130): `cmdCampaignInit` reads templates from `path.resolve(__dirname, '..', '..', 'templates')` which resolves relative to the module file location, NOT cwd. Templates exist at the project root `/Users/rishikeshranjan/code/rishiPersonal/takeToMarket/templates/`. This works regardless of cwd override.

---

### `test/health.test.cjs` (test, CRUD)

**Analog:** `test/install.test.cjs`

**Module under test** (health.cjs lines 435-438, exports):
```javascript
module.exports = {
  cmdHealth,
  cmdInit,
};
```

**Key pattern -- health.cjs uses process.cwd() like state.cjs.** Same cwd override pattern. Additionally, health.cjs checks for CAMPAIGNS/ directory, individual reference files, campaign STATE.md consistency, staleness, velocity, drift-log integrity, and gate consistency when `full=true`.

**Health check constants** (health.cjs lines 19-29, REFERENCE_FILES):
```javascript
const REFERENCE_FILES = [
  'POSITIONING.md',
  'BRAND.md',
  'ICP.md',
  'CHANNELS.md',
  'STATE.md',
  'CALENDAR.md',
  'COMPETITORS.md',
  'METRICS.md',
  'LEARNINGS.md',
];
```

**Test must scaffold .marketing/ with varying levels of completeness** to test different health states (healthy, unhealthy, missing dirs, missing files).

**cmdInit test pattern** (health.cjs lines 409-433):
```javascript
describe('cmdInit', () => {
  // Uses cwd override + stdout mock pattern

  it('reports not initialized when .marketing/ missing', () => {
    // tmp.dir has no .marketing/
    cmdInit(false);
    const output = JSON.parse(stdoutMock.mock.calls[0].arguments[0]);
    assert.strictEqual(output.initialized, false);
  });

  it('reports initialized when all reference files present', () => {
    // Create all 9 reference files
    cmdInit(false);
    const output = JSON.parse(stdoutMock.mock.calls[0].arguments[0]);
    assert.strictEqual(output.initialized, true);
  });
});
```

---

### `test/commit.test.cjs` (test, CRUD with subprocess)

**Analog:** `test/install.test.cjs`

**Module under test** (commit.cjs lines 103-105, exports):
```javascript
module.exports = {
  cmdCommit,
};
```

**Key pattern -- commit.cjs calls `execFileSync('git', ...)`.** Per D-06, use real temp dirs (no fs mocking). Recommendation from RESEARCH.md: init a real git repo in the temp dir.

**Internal function sanitizeMessage** (commit.cjs lines 24-35, NOT exported):
```javascript
function sanitizeMessage(message) {
  return message
    .replace(/`/g, ' ')
    .replace(/\$\(/g, ' ')
    .replace(/\$\{/g, ' ')
    .replace(/;/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
```

**sanitizeMessage is NOT exported.** Test it indirectly through `cmdCommit` output -- the committed message in the output JSON will be the sanitized version.

**Git repo setup pattern for commit.test.cjs:**
```javascript
const { execSync } = require('child_process');

describe('commit.cjs', () => {
  let tmp, originalCwd, stdoutMock, stderrMock, exitMock;

  before(() => {
    tmp = createTempDir();
    originalCwd = process.cwd;
    process.cwd = () => tmp.dir;
    // Init a real git repo in temp dir
    execSync('git init', { cwd: tmp.dir, stdio: 'pipe' });
    execSync('git config user.email "test@test.com"', { cwd: tmp.dir, stdio: 'pipe' });
    execSync('git config user.name "Test"', { cwd: tmp.dir, stdio: 'pipe' });
  });

  after(() => {
    process.cwd = originalCwd;
    tmp.cleanup();
  });

  // Each test creates a file, calls cmdCommit, verifies output
});
```

**Validation patterns in cmdCommit** (commit.cjs lines 44-68): Tests should cover empty message, empty files array, message too long (>500 chars), path traversal in file list.

---

### `test/helpers.cjs` (modify -- utility)

**Analog:** `test/helpers.cjs` (self, lines 1-59)

**Current exports** (helpers.cjs lines 55-59):
```javascript
module.exports = {
  createTempDir,
  createMockMarketing,
  createMockHome,
};
```

**Potential addition -- createMockCampaign** (from RESEARCH.md). Claude decides at implementation time whether to add this based on campaign.test.cjs needs. Pattern to follow:

```javascript
/**
 * Create a mock campaign directory with STATE.md inside .marketing/CAMPAIGNS/.
 * @param {string} baseDir - Project root (with .marketing/ already created)
 * @param {string} slug - Campaign slug
 * @param {string} [phase='created'] - Campaign phase
 * @returns {string} Path to the created campaign directory
 */
function createMockCampaign(baseDir, slug, phase = 'created') {
  const campaignDir = path.join(baseDir, '.marketing', 'CAMPAIGNS', slug);
  const assetsDir = path.join(campaignDir, 'ASSETS');
  fs.mkdirSync(assetsDir, { recursive: true });
  const stateContent = [
    '---',
    `campaign: ${slug}`,
    `name: Test Campaign ${slug}`,
    `phase: ${phase}`,
    `last_updated: ${new Date().toISOString()}`,
    `phase.created: ${new Date().toISOString()}`,
    '---',
    '',
    `# Campaign: Test Campaign ${slug}`,
  ].join('\n');
  fs.writeFileSync(path.join(campaignDir, 'STATE.md'), stateContent);
  return campaignDir;
}
```

This follows the existing helpers.cjs pattern: function with JSDoc, returns a path, uses `fs.mkdirSync` with `{ recursive: true }`.

---

## Shared Patterns

### Process Side-Effect Interception (stdout + stderr + exit)
**Source:** No existing analog -- new pattern for Phase 13 (verified on Node 24.13.0 per RESEARCH.md)
**Apply to:** ALL 6 test files (every module calls core.cjs `output()` or `error()`)

```javascript
let stdoutMock, stderrMock, exitMock;

beforeEach(() => {
  stdoutMock = mock.method(process.stdout, 'write', () => true);
  stderrMock = mock.method(process.stderr, 'write', () => true);
  exitMock = mock.method(process, 'exit', () => {});
});

afterEach(() => {
  stdoutMock.mock.restore();
  stderrMock.mock.restore();
  exitMock.mock.restore();
});
```

**Critical caveat:** `error()` calls `process.exit(1)` but mock replaces it with a no-op. Code AFTER `error()` continues executing when mocked. In the source modules, `error()` is called as a standalone statement (not `return error()`) -- so code after it WILL execute. Tests asserting an error path should check `exitMock.mock.calls.length === 1` and NOT assert on subsequent behavior.

### cwd Override for Filesystem Modules
**Source:** state.cjs line 29 (`path.resolve(process.cwd(), '.marketing', 'STATE.md')`)
**Apply to:** `test/state.test.cjs`, `test/campaign.test.cjs`, `test/health.test.cjs`, `test/commit.test.cjs`

```javascript
let originalCwd;

before(() => {
  originalCwd = process.cwd;
  process.cwd = () => tmp.dir;
});

after(() => {
  process.cwd = originalCwd;
});
```

### Temp Directory Lifecycle
**Source:** `test/install.test.cjs` lines 42-49
**Apply to:** ALL test files that touch the filesystem (state, campaign, health, commit; also core for safeReadFile/safeWriteFile)

```javascript
let tmp;

before(() => {
  tmp = createTempDir();
});

after(() => {
  tmp.cleanup();
});
```

### Test File Structure (CJS, node:test, assert/strict)
**Source:** `test/install.test.cjs` lines 1-9
**Apply to:** ALL 6 new test files

```javascript
'use strict';

const { describe, it, before, after, mock, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { createTempDir, createMockMarketing } = require('./helpers.cjs');
```

### Module Export Verification
**Source:** `test/install.test.cjs` lines 11-18
**Apply to:** ALL 6 test files (verify each module exports the expected functions)

```javascript
describe('module.cjs module exports', () => {
  it('exports all expected functions', () => {
    const expectedFns = ['fn1', 'fn2'];
    for (const fn of expectedFns) {
      assert.strictEqual(typeof moduleUnderTest[fn], 'function', `exports.${fn} is a function`);
    }
  });
});
```

### JSON Output Assertion
**Source:** No existing analog -- new pattern for Phase 13
**Apply to:** All tests that verify `output()` calls (slug, state, campaign, health, core)

```javascript
// After calling a function that writes JSON to stdout:
const written = stdoutMock.mock.calls[0].arguments[0];
const parsed = JSON.parse(written);
assert.strictEqual(parsed.someField, 'expectedValue');
```

### Raw Output Assertion
**Source:** No existing analog -- derived from core.cjs `output()` behavior (line 25)
**Apply to:** Tests that verify raw mode (`--raw` flag)

```javascript
// raw=true outputs plain text + newline
it('outputs raw value', () => {
  cmdSlug('hello', true);
  assert.strictEqual(stdoutMock.mock.calls[0].arguments[0], 'hello\n');
});
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| All 6 test files (mock pattern) | test | request-response | `test/install.test.cjs` does NOT use `node:test` mock API -- it tests pure functions and filesystem ops without process interception. The mock pattern (mock.method for process.exit/stdout/stderr) is new to Phase 13. RESEARCH.md provides verified examples. |
| `test/commit.test.cjs` (git repo setup) | test | CRUD (subprocess) | No existing test initializes a git repo. Pattern derived from RESEARCH.md recommendation + standard `execSync('git init')` approach. |

**Note:** While no existing test file uses the mock API, the mock pattern itself is well-documented in RESEARCH.md and was verified working on Node 24.13.0. The planner should reference RESEARCH.md "Pattern 1: Process Side-Effect Interception" and "Pattern 3: Git Command Mocking" for these gaps.

---

## Metadata

**Analog search scope:** `test/` directory (only location with test files)
**Analog file:** `test/install.test.cjs` (83 lines) -- the ONLY existing test file and the canonical pattern for all Phase 13 tests
**Helper file:** `test/helpers.cjs` (59 lines) -- shared utilities, may be extended
**Modules scanned:** 6 (`bin/lib/core.cjs`, `bin/lib/slug.cjs`, `bin/lib/state.cjs`, `bin/lib/campaign.cjs`, `bin/lib/health.cjs`, `bin/lib/commit.cjs`)
**Pattern extraction date:** 2026-05-11
