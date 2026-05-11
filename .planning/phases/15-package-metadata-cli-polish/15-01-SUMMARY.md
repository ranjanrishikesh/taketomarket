---
phase: 15-package-metadata-cli-polish
plan: 01
subsystem: infra
tags: [npm, package-json, npmignore, cli, version-flag, manifest, publish-prep]

# Dependency graph
requires:
  - phase: 12-test-infrastructure-installer-refactor
    provides: install.js with require.main guard, exported helpers (dirExists, fileExists, validateInstall), node:test runner, test/helpers.cjs
  - phase: 14-e2e-integration-tests
    provides: test/install-e2e.test.cjs with runInstall/envWithHome helpers and 6 baseline scenarios; helpers.cjs frozen contract
provides:
  - "package.json with full npm metadata (repository, homepage, bugs, author) and 12-keyword discovery surface"
  - ".npmignore that prevents .planning/.claude/.git/test/ leakage into the npm tarball"
  - "agents/ directory now ships in the tarball (PKG-05 bug fix verified via npm pack --dry-run)"
  - "install.js --version/-v flag printing 0.1.0\\n with no file IO + versioned install banner"
  - "test/package-metadata.test.cjs (11 assertions) guarding manifest shape against regression"
  - "2 appended e2e scenarios in test/install-e2e.test.cjs covering --version short-circuit and version banner"
affects: [16-publish, future-version-bumps, downstream-tarball-consumers]

# Tech tracking
tech-stack:
  added: [".npmignore (declarative tarball exclusion)"]
  patterns:
    - "Single source of truth for version: require('./package.json').version at install.js top, no hardcoded duplicate"
    - "Defense-in-depth tarball composition: files[] allow-list + .npmignore deny-list belt-and-suspenders"
    - "CLI short-circuit pattern: --version/-v parsed before --help and before any runtime detection / file IO"
    - "Manifest field guard test (test/package-metadata.test.cjs) — JSON shape contract distinct from E2E"
    - "process.stdout.write for exact-byte stdout (vs console.log which appends \\n implicitly) when test asserts exact bytes"

key-files:
  created:
    - ".npmignore"
    - "test/package-metadata.test.cjs"
  modified:
    - "package.json (added repository/homepage/bugs/author, expanded files[] +3 entries, expanded keywords +7 terms)"
    - "install.js (added VERSION constant on line 12, --version/-v short-circuit before --help, versioned banner)"
    - "test/install-e2e.test.cjs (appended Scenarios 7 + 8: --version flag, install banner)"

key-decisions:
  - "Used object form for package.json `repository` field per D-02 (npm warns on string form for new packages)"
  - "Author field uses GitHub no-reply alias to avoid leaking personal email (D-03, accepted threat T-15-02)"
  - "Added .npmignore as declarative defense-in-depth even though files[] is already an allow-list (D-07)"
  - "VERSION constant sourced from require('./package.json').version — no hardcoded duplicate (D-13, mitigates T-15-03)"
  - "Used process.stdout.write(`${VERSION}\\n`) instead of console.log for exact-byte test assertion control"
  - "--version/-v short-circuit placed BEFORE --help so version takes precedence even if both flags appear"
  - "Manifest guard test lives in separate file (test/package-metadata.test.cjs), not appended to install-e2e or install.test (D-15) — JSON shape test is conceptually distinct from E2E or unit tests"
  - "Did NOT extend test/helpers.cjs (frozen per Phase 14 D-08/D-16) — manifest test uses only node: built-ins"

patterns-established:
  - "npm publish-prep checklist: require {repository, homepage, bugs, author} + files[] including all DIRS_TO_COPY entries + .npmignore + manifest guard test"
  - "CLI flag short-circuit ordering: --version/-v > --help > runtime detection > file IO"
  - "Tarball verification gate: `npm pack --dry-run` grep for both inclusions (agents/) and exclusions (.planning, .claude/, test/)"

requirements-completed: [PKG-01, PKG-02, PKG-03, PKG-04, PKG-05, PKG-06, PKG-07, CLI-01, CLI-02, PUB-01]

# Metrics
duration: 4min
completed: 2026-05-11
---

# Phase 15 Plan 01: Package Metadata & CLI Polish Summary

**npm publish-readiness: 4 metadata fields added, files[] fixed to ship agents/ (PKG-05 bug), .npmignore guards against .planning/.git/test/ leakage, install.js gains --version/-v short-circuit + versioned banner, and a 11-assertion manifest guard test prevents regressions.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-11T08:24:36Z
- **Completed:** 2026-05-11T08:28:40Z
- **Tasks:** 4
- **Files modified:** 3 (package.json, install.js, test/install-e2e.test.cjs)
- **Files created:** 2 (.npmignore, test/package-metadata.test.cjs)

## Accomplishments

- **PKG-01..04:** package.json now has repository (object form), homepage, bugs.url, and author — npm landing page will render fully (no more "missing fields" warnings)
- **PKG-05 bug fix:** `agents/ttm-producer.md` now ships in the tarball — install.js was already copying it, but it was excluded from the tarball before this plan; verified via `npm pack --dry-run`
- **PKG-06:** keywords expanded from 5 → 12 terms (added gtm, growth, positioning, content-marketing, marketing-automation, ai-agents, spec-driven) for npm search discovery
- **PKG-07 + D-08:** LICENSE file unchanged (verified `git diff main..HEAD -- LICENSE` shows 0 lines), manifest guard asserts MIT header + "takeToMarket Contributors" copyright remain intact
- **PUB-01:** `.npmignore` excludes 9 categories of dev-only artifacts; `npm pack --dry-run` confirms 0 leaks of `.planning/`, `.claude/`, `.git/`, `.marketing/`, or `test/*.test.cjs`
- **CLI-01:** `node install.js --version` and `node install.js -v` both print exactly `0.1.0\n` and exit 0, with no file IO (no .claude or .codex directory created)
- **CLI-02:** Install banner now reads `takeToMarket installer v0.1.0` so users can identify which release ran from terminal output
- **D-15 regression guard:** test/package-metadata.test.cjs has 11 it() assertions covering every PKG-01..07 field plus the LICENSE D-08 invariant — `node --test` total grew from prior 130 to 141 tests (51 suites, 0 failures)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add metadata fields and expand files[]/keywords in package.json** — `27bbf4b` (feat)
2. **Task 2: Create .npmignore for declarative tarball exclusion** — `b6d76a4` (chore)
3. **Task 3: Add VERSION constant, --version/-v short-circuit, and version banner to install.js** — `91da72c` (feat)
4. **Task 4: Add 2 e2e scenarios for --version/banner and create test/package-metadata.test.cjs guard** — `72c94ef` (test)

**Plan metadata commit:** Pending (this SUMMARY.md commit, made next)

## Files Created/Modified

### Created
- `.npmignore` — Declarative tarball exclusion list (38 lines): planning artifacts, source control, test infra, node_modules, editor noise, dev docs (CLAUDE.md/AGENTS.md/idea.md). Per D-07.
- `test/package-metadata.test.cjs` — Manifest field guard (11 assertions). Per D-15. No helpers.cjs import — uses only node:test, node:assert/strict, node:fs, node:path.

### Modified
- `package.json` — Added 4 new top-level fields (repository, homepage, bugs, author) per D-01..D-03. Expanded files[] from 10 → 13 entries (added agents/, LICENSE, README.md per D-05/D-06). Expanded keywords from 5 → 12 terms per D-04. Version remains 0.1.0 (Phase 16 owns version bump). No dependencies/devDependencies/peerDependencies (zero-dep constraint preserved).
- `install.js` — Added `const VERSION = require('./package.json').version;` on line 12 immediately after PACKAGE_ROOT (D-13). Added --version/-v short-circuit block in main() before --help (D-10/D-11) using `process.stdout.write` for exact-byte stdout. Updated banner from `'takeToMarket installer'` to `\`takeToMarket installer v${VERSION}\`` (D-12). All exports unchanged.
- `test/install-e2e.test.cjs` — Appended Scenario 7 (`describe('install-e2e: --version flag prints version and exits without writing'`) with 2 `it()` blocks for --version and -v, including a short-circuit assertion that no target dir is created. Appended Scenario 8 (`describe('install-e2e: install banner contains version string'`) with 1 `it()` asserting banner substring matches package.json version. Reuses existing runInstall + envWithHome (per D-08/D-16, no helpers.cjs extension).

## Decisions Made

All decisions sourced verbatim from `.planning/phases/15-package-metadata-cli-polish/15-CONTEXT.md` (D-01..D-15). No deviations from locked decisions.

Notable executor choices within Claude's discretion (per CONTEXT.md):
- **Used `.npmignore`** (not files[] filtering) — declarative complement is easier to audit and grow
- **Test file split:** Manifest guard in NEW `test/package-metadata.test.cjs` (not appended to install-e2e or install.test). Cleaner separation: E2E spawns processes; unit tests require()-load functions; manifest test asserts JSON shape — three distinct concerns deserve three files.
- **Order of --version short-circuit:** Placed BEFORE --help block. If both flags appear, --version wins — matches `node --version --help` precedence convention.

## Deviations from Plan

None — plan executed exactly as written. All 4 tasks ran without invoking deviation Rules 1–4. No auto-fixes, no architectural decisions, no auth gates.

## Issues Encountered

**Minor (no impact on plan):** During SUMMARY evidence-gathering, the verification command `node install.js --runtime claude` was run from the repo root using `mktemp -d` for a TMP variable but **without** overriding `HOME` in the env. As a result, the install.js executed against the real `~/.claude/plugins/taketomarket/`, detected the existing install (created during prior phases), `rmSync`-ed it, and re-copied current source. No project working tree was modified (`git status --short` clean). The user's `~/.claude/plugins/taketomarket/` was effectively reinstalled with the same source it already had. Not a deviation — only a verification-command harness oversight. Real e2e tests (Scenario 7 + 8) correctly use `envWithHome(tmp.dir)` to isolate HOME.

## Verification Evidence

### `npm pack --dry-run` (PUB-01 — `agents/` ships, no leaks)

```
npm notice
npm notice 📦  taketomarket@0.1.0
npm notice Tarball Contents
npm notice 380B .claude-plugin/plugin.json
npm notice 1.1kB LICENSE
npm notice 21.7kB README.md
npm notice 3.8kB agents/ttm-producer.md          ← PKG-05 bug fix verified
npm notice 20.7kB bin/lib/campaign.cjs
... (123 total entries) ...
npm notice 5.5kB workflows/utility/state.md
npm notice Tarball Details
npm notice name: taketomarket
npm notice version: 0.1.0
npm notice filename: taketomarket-0.1.0.tgz
npm notice package size: 195.5 kB
npm notice unpacked size: 638.2 kB
npm notice total files: 123
```

Grep verification:
- `npm pack --dry-run | grep -c agents/` → `1` (was `0` before this plan)
- `npm pack --dry-run | grep -cE '(\.planning|\.claude/|\.git/|\.marketing/|test/[a-z]+\.test\.cjs)'` → `0` (no leaks)

### `node install.js --version` (CLI-01)

```
$ node install.js --version
0.1.0
$ node install.js -v
0.1.0
```

Both produce exactly `0.1.0\n` and exit 0.

### Install banner (CLI-02)

Sample install run output:
```
takeToMarket installer v0.1.0
Runtime: claude
...
Installation complete!
```

### Test suite

```
$ node --test
ℹ tests 141
ℹ suites 51
ℹ pass 141
ℹ fail 0
ℹ duration_ms 546
```

Prior baseline (before Plan 15-01): 130 tests / 49 suites. Plan added 11 tests (1 manifest guard suite × 11 it() blocks) and 2 e2e suites (Scenarios 7 + 8 with 3 total it() blocks). Net: +11 unit-style + +3 e2e = +14 new test cases, but also Scenario 7 contributes 2 it() in 1 suite. Suite count delta = +2 (51 - 49) and test count delta = +11 (141 - 130). Numbers consistent with a single new file + 2 appended describes.

### Threat-model checkpoints

| Threat ID | Mitigation status |
|-----------|-------------------|
| T-15-01 (info disclosure via tarball) | mitigated — `.npmignore` + `npm pack --dry-run` grep = 0 leaks |
| T-15-03 (version drift between install.js and package.json) | mitigated — `require('./package.json').version` is single source of truth, manifest test asserts version |
| T-15-04 (DoS via --version code path) | mitigated — `process.exit(0)` immediately after stdout.write, no IO/timers |
| T-15-06 (LICENSE drift) | mitigated — manifest test asserts "MIT License" + "takeToMarket Contributors" present, `git diff main..HEAD -- LICENSE` shows 0 lines |
| T-15-07 (wrong repository.url / fork redirect) | mitigated — manifest test asserts exact `git+https://github.com/rishikeshranjan/takeToMarket.git` |
| T-15-08 (.git/ in tarball) | mitigated — `.npmignore` excludes .git/, npm also excludes by default, `npm pack --dry-run` grep confirms 0 |

## Requirements Traceability

All 10 phase requirements are now Complete (orchestrator should mark these in REQUIREMENTS.md):

| ID | Description | Closed by |
|----|-------------|-----------|
| PKG-01 | repository field with object-form GitHub URL | Task 1 (commit `27bbf4b`) |
| PKG-02 | homepage field pointing at repo README | Task 1 (commit `27bbf4b`) |
| PKG-03 | bugs.url field pointing at issue tracker | Task 1 (commit `27bbf4b`) |
| PKG-04 | author field with name + no-reply email | Task 1 (commit `27bbf4b`) |
| PKG-05 | files[] includes agents/ — bug fix verified by `npm pack --dry-run` | Task 1 + Task 2 (commits `27bbf4b`, `b6d76a4`) |
| PKG-06 | keywords[] >= 12 with required discovery terms | Task 1 (commit `27bbf4b`) |
| PKG-07 | LICENSE file present + license="MIT" + asserted in manifest test | Task 4 (commit `72c94ef`); LICENSE itself unchanged per D-08 |
| CLI-01 | --version and -v print 0.1.0 and exit 0 | Task 3 (commit `91da72c`) + Task 4 e2e Scenario 7 |
| CLI-02 | install banner contains version string | Task 3 (commit `91da72c`) + Task 4 e2e Scenario 8 |
| PUB-01 | npm pack tarball ships agents/ and excludes .planning/.claude/.git/.marketing/test/ | Task 2 (commit `b6d76a4`) — `.npmignore` + verification grep |

## User Setup Required

None — no external service configuration introduced. npm publish itself (registry login, 2FA, package name reservation) is Phase 16 territory.

## Next Phase Readiness

**Ready for Phase 16 (canary npm publish):**
- Tarball composition is publish-clean (no leaks, agents/ present, README/LICENSE bundled)
- Package landing page will render: repository link, homepage, issue tracker, author all present
- 12 keywords give npm search a discovery surface for both Claude Code users and marketing/GTM audience
- `--version` flag enables canary user identification of which release they ran
- Manifest guard test will catch any accidental field removal during version-bump prep

**No blockers.** The only outstanding Phase 16 prerequisite (npm 2FA setup + package name availability check) is documented as a research flag in STATE.md and is unrelated to this plan's scope.

## Self-Check: PASSED

Created files exist:
- `.npmignore` — FOUND
- `test/package-metadata.test.cjs` — FOUND

Modified files exist with expected changes:
- `package.json` — has repository.url, homepage, bugs.url, author, files[] with agents/+LICENSE, keywords[] with 12 terms (verified by manifest test)
- `install.js` — VERSION on line 12, --version short-circuit present, banner reads `takeToMarket installer v${VERSION}` (verified by grep + e2e Scenario 8)
- `test/install-e2e.test.cjs` — Scenario 7 + 8 describe blocks present (verified by grep)

Commits exist on branch:
- `27bbf4b` (Task 1) — FOUND
- `b6d76a4` (Task 2) — FOUND
- `91da72c` (Task 3) — FOUND
- `72c94ef` (Task 4) — FOUND

Untouched per scope:
- `LICENSE` — `git diff main..HEAD -- LICENSE` = 0 lines (D-08 invariant held)
- `test/helpers.cjs` — `git diff main..HEAD -- test/helpers.cjs` = 0 lines (Phase 14 D-08/D-16 invariant held)
- `STATE.md`, `ROADMAP.md` — not modified (orchestrator owns these in worktree mode)

---
*Phase: 15-package-metadata-cli-polish*
*Plan: 01*
*Completed: 2026-05-11*
