# Stack Research

**Domain:** Claude Code / Codex marketing operating system skill
**Researched:** 2026-05-11 (v1.1 update -- test & publish additions)
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Unchanged from v1.0)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| SKILL.md (Agent Skills standard) | Current | Skill entry point and slash command definition | Universal standard adopted by Claude Code, Codex, Gemini CLI, Cursor, and 8+ runtimes. Each SKILL.md directory becomes a `/ttm-*` slash command. Verified via official Claude Code docs. |
| CLAUDE.md | Current | Project-level instruction file for Claude Code | Loaded automatically in every session. takeToMarket uses this to inject positioning-as-invariant enforcement and campaign lifecycle rules. |
| AGENTS.md | Current | Codex-compatible instruction file | Codex reads AGENTS.md automatically. Coexists with CLAUDE.md -- both can live in the same repo. Required for dual-runtime support. |
| Markdown (.md) | N/A | All skill content, templates, workflows, references | The entire Claude Code skill ecosystem is Markdown-native. YAML frontmatter for config, Markdown body for instructions. No other format is viable. |
| Node.js (CJS) | 18+ | CLI utilities (bin/ tools) | GSD uses `.cjs` files for deterministic operations (state management, config parsing, slug generation, commit orchestration). Node 18+ is required by Claude Code itself. |
| YAML frontmatter | N/A | Skill metadata, plan metadata, state tracking | Standard across all Agent Skills. Parsed natively by Claude Code, Codex, and the GSD ecosystem. |

---

## v1.1 Stack Additions: Testing & npm Publish

### Test Runner

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `node:test` (built-in) | Node 18+ (stable since 18.13) | Unit and integration tests for bin/ttm-tools.cjs and install.js | Zero dependencies. Ships with Node.js. Full CJS `require()` support verified locally on Node 24.13.0. Built-in mocking (`mock.fn()`, `mock.module()`), `describe`/`it`/`beforeEach`, TAP output. Aligns perfectly with the zero-dependency constraint -- no devDependencies needed. |
| `node:assert` (built-in) | Node 18+ | Assertions | Paired with `node:test`. `assert.strictEqual`, `assert.deepStrictEqual`, `assert.throws` cover all utility testing needs. No external assertion library required. |

**Runner command:** `node --test` auto-discovers `**/*.test.cjs` files. No configuration file needed.

**Verified locally:** CJS require syntax, describe/it blocks, mock.fn(), mock.module() all work correctly on the project's Node 24.13.0 runtime.

### npm Publish Tooling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `npm publish` | npm 9+ (bundled with Node 18+) | Package registry publishing | Standard. No wrapper needed. Use `--dry-run` for pre-publish validation. |
| `npm pack --dry-run` | npm 9+ | Pre-publish file list audit | Verified on this project: produces 122 files, 194KB packed size. Shows exactly what ships. |

---

## package.json: Current vs Target State

### Fields to Add/Change

| Field | Current | Target | Why Change |
|-------|---------|--------|------------|
| `version` | `0.1.0` | `1.0.0` | v1.0 is shipped and validated. First public npm release should be 1.0.0. Semantic versioning. |
| `author` | Missing | `"Rishikesh Ranjan"` | Required for npm package page attribution. |
| `repository` | Missing | `{"type": "git", "url": "git+https://github.com/rishikeshranjan/taketomarket.git"}` | npm page shows this. Links to source. Required for credibility. |
| `homepage` | Missing | GitHub repo URL or docs URL | npm page shows prominently. |
| `scripts.test` | Missing | `"node --test"` | Enables `npm test`. Conventional CI entry point. |
| `scripts.prepack` | Missing | `"node --test"` | Safety net: runs tests before `npm pack` and `npm publish`. Catches broken publishes. |
| `keywords` | 5 items | Add `"ai-marketing"`, `"positioning"`, `"prompt-engineering"` | Improves npm search discoverability. |

### Fields to Keep As-Is

| Field | Value | Why Keep |
|-------|-------|----------|
| `name` | `taketomarket` | Lowercase, unscoped. Clear and memorable. |
| `license` | `MIT` | LICENSE file exists and matches. |
| `bin` | `{"taketomarket": "./install.js"}` | Enables `npx taketomarket`. Working correctly. |
| `files` | Array of 8 entries | Already correctly scoping published content (see analysis below). |
| `engines` | `{"node": ">=18"}` | Matches Claude Code's Node requirement. |

### Target package.json

```json
{
  "name": "taketomarket",
  "version": "1.0.0",
  "description": "Marketing operating system for Claude Code. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings.",
  "license": "MIT",
  "author": "Rishikesh Ranjan",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rishikeshranjan/taketomarket.git"
  },
  "bin": {
    "taketomarket": "./install.js"
  },
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
  ],
  "scripts": {
    "test": "node --test",
    "prepack": "node --test"
  },
  "keywords": [
    "claude-code",
    "codex",
    "marketing",
    "campaigns",
    "agent-skills",
    "ai-marketing",
    "positioning",
    "prompt-engineering"
  ],
  "engines": {
    "node": ">=18"
  }
}
```

---

## .npmignore vs `files` Field Decision

**Decision: Keep `files` field. Do NOT add `.npmignore`.**

| Approach | Behavior | Recommendation |
|----------|----------|----------------|
| `files` field (allowlist) | Only listed paths are included. Everything else excluded automatically. | USE THIS (already in place) |
| `.npmignore` (denylist) | Everything included unless explicitly excluded. Must maintain as project grows. | DO NOT ADD |

**Rationale:**

1. **Already working.** Verified via `npm pack --dry-run`: 122 files, 194KB. Correct set.
2. **Safer by default.** New files (test/, .planning/, .github/, docs/) are automatically excluded without any maintenance. Allowlist beats denylist for publishing safety.
3. **No confusion.** If both `files` and `.npmignore` coexist, npm applies complex precedence rules within listed directories. Keeping only `files` eliminates ambiguity.
4. **npm always includes these regardless of `files`:** `package.json`, `README.md`, `LICENSE`, `CHANGELOG.md`. All are desirable in the published package.

**What `files` currently excludes (correctly):**
- `.planning/` -- internal dev planning
- `test/` -- test files (to be created)
- `CLAUDE.md` -- project instructions for contributors, not end users
- `AGENTS.md` -- same
- `.git/` -- always excluded
- `node_modules/` -- always excluded
- Any future dev tooling files

---

## Test File Conventions

| Convention | Value | Rationale |
|------------|-------|-----------|
| Test directory | `test/` at project root | Standard separation. Excluded from npm by `files` field. |
| File naming | `*.test.cjs` | CJS extension matches source. `.test.` infix is `node --test` default glob pattern. |
| Structure | `test/ttm-tools.test.cjs`, `test/install.test.cjs` | One test file per source file under test. |
| Integration tests | `test/integration/install-e2e.test.cjs` | End-to-end install flow in subdirectory. |
| Mocking pattern | `mock.fn()` for functions, temp dirs for filesystem tests | Use `fs.mkdtempSync` for isolated filesystem tests. No mocking library needed. |

### Example Test Pattern (CJS)

```javascript
'use strict';
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

describe('ttm-tools slug generation', () => {
  it('generates valid slug from campaign name', () => {
    // require the module under test
    const tools = require('../bin/ttm-tools.cjs');
    const result = tools.generateSlug('My SEO Campaign 2026');
    assert.strictEqual(result, 'my-seo-campaign-2026');
  });
});

describe('install.js', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ttm-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates .marketing directory structure', () => {
    // test install behavior in isolated tmp dir
  });
});
```

---

## What NOT to Add

| Avoid | Why | Impact if Added |
|-------|-----|-----------------|
| Jest | External dep. ESM/CJS config complexity. `node:test` has identical capability for this use case. | Adds devDependencies, jest.config.js, potential CJS transform issues. |
| Vitest | Designed for ESM-first/Vite projects. Requires config. External dep. | Wrong ecosystem. Unnecessary complexity. |
| Mocha + Chai + Sinon | Three external deps. `node:test` replicates all three built-in. | More to install, configure, maintain. Zero benefit over built-in. |
| `c8` / `nyc` (coverage) | Node 22+ has `--experimental-test-coverage` built-in. | Extra devDependency for something built-in. |
| TypeScript / `@types/*` | Project is plain CJS by design. Types require build step. | Violates zero-build-step constraint. |
| ESLint / Prettier | Out of scope for v1.1. Not needed for test + publish goal. | Scope creep. |
| Husky / lint-staged | Pre-commit hooks are nice but out of scope. `prepack` script catches issues at publish time. | Scope creep. |
| Any `devDependencies` | `node:test` + `node:assert` are built-in. Zero deps means zero install time. | Adding any devDep breaks the zero-dependency purity and complicates contributor onboarding. |
| GitHub Actions CI | Good for V2 but out of v1.1 scope. Local `npm test` + `prepack` is sufficient for first publish. | Scope creep. |

---

## npm Publish Checklist

```bash
# 1. Run tests
npm test

# 2. Verify package contents (should show ~122 files, ~194KB)
npm pack --dry-run

# 3. Verify version is correct
node -e "console.log(require('./package.json').version)"

# 4. Smoke-test the bin entry point
node install.js --help

# 5. Check npm name availability (should 404 if not yet published)
npm view taketomarket 2>&1

# 6. Publish (first time, public access)
npm publish --access public

# 7. Verify post-publish install works
npx taketomarket
```

---

## Coverage (Optional, Zero-Dep)

If coverage reporting is desired later (not needed for v1.1):

```bash
# Built-in to Node 22+ -- no dependency required
node --test --experimental-test-coverage
```

Produces lcov-compatible output. Can pipe to `lcov-summary` or any CI coverage tool without adding `c8` or `nyc` as a dependency.

---

## Directory Structure (v1.0 -- unchanged)

```
takeToMarket/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── ttm-*/SKILL.md          # 27 slash commands
├── workflows/                   # Lifecycle orchestration
├── templates/                   # Output templates
├── references/                  # Domain knowledge
├── playbooks/                   # Discipline playbooks
├── gates/                       # Quality gate definitions
├── bin/
│   ├── ttm-tools.cjs           # CLI utility (under test)
│   └── lib/                    # Supporting modules
├── test/                        # NEW in v1.1
│   ├── ttm-tools.test.cjs
│   ├── install.test.cjs
│   └── integration/
│       └── install-e2e.test.cjs
├── settings.json
├── install.js                   # Installer (under test)
├── package.json
├── LICENSE
└── README.md
```

---

## Supporting Libraries (Unchanged)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None (zero runtime dependencies) | N/A | N/A | The skill has NO runtime dependencies. Zero devDependencies too -- `node:test` and `node:assert` are built-in. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Test runner | `node:test` (built-in) | Jest | External dep. ESM/CJS config dance. Overkill for CJS utility testing. |
| Test runner | `node:test` (built-in) | Vitest | ESM-first design. Wrong ecosystem for CJS. External dep. |
| Test runner | `node:test` (built-in) | Mocha | External dep. `node:test` has identical API now. |
| Assertions | `node:assert` (built-in) | Chai | External dep. `assert.strictEqual` + `assert.deepStrictEqual` + `assert.throws` is sufficient. |
| Mocking | `node:test` mock API | Sinon | External dep. Built-in `mock.fn()` covers function mocking. `fs.mkdtempSync` covers filesystem isolation. |
| Package scope | Unscoped `taketomarket` | `@taketomarket/cli` | Unnecessary complexity. Unscoped is shorter and more memorable for `npx`. |
| Publish safety | `scripts.prepack` | GitHub Actions | CI is V2. `prepack` is local-first safety net. |
| File inclusion | `files` allowlist | `.npmignore` denylist | Allowlist is safer, already in place, requires zero maintenance as files are added. |

---

## Sources

- Node.js `node:test` -- verified locally: `require('node:test')` with describe/it/mock works on Node 24.13.0 with CJS (HIGH confidence)
- npm `files` field behavior -- verified via `npm pack --dry-run` on this project: correctly includes 122 files, excludes .planning/, test/, CLAUDE.md (HIGH confidence)
- npm publish workflow -- standard npm CLI (HIGH confidence)
- Node.js `--test` auto-discovery -- verified: discovers `**/*.test.*` by default, no config needed (HIGH confidence)
- Node.js `--experimental-test-coverage` -- available since Node 22, produces lcov output (HIGH confidence)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills) -- SKILL.md spec (HIGH confidence)
- [Claude Code Plugins Documentation](https://code.claude.com/docs/en/plugins) -- Plugin manifest format (HIGH confidence)
- [GSD local installation](file://~/.claude/get-shit-done/) -- Architecture reference (HIGH confidence)

---
*Stack research for: takeToMarket v1.1 test infrastructure and npm publish readiness*
*Updated: 2026-05-11*
