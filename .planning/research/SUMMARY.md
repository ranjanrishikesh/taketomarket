# Project Research Summary

**Project:** takeToMarket v1.1 — Test Infrastructure & npm Publish
**Domain:** npm CLI installer package for Claude Code / Codex skill distribution
**Researched:** 2026-05-11
**Confidence:** HIGH

## Executive Summary

takeToMarket v1.0 is a fully shipped marketing operating system skill for Claude Code and Codex. The v1.1 milestone is narrowly scoped: add a zero-dependency test suite using Node.js built-in `node:test`, fix package.json metadata gaps, and execute a safe first publish to npm. This is a distribution and quality assurance milestone, not a feature milestone. The recommended approach follows established patterns from GSD (get-shit-done-cc, 31K+ stars) which uses the identical architecture: CJS utilities, `files[]` whitelist, single bin entry point, and zero runtime dependencies.

The primary risk is a botched first npm publish — version numbers are permanent on npm, and a broken 1.0.0 cannot be reclaimed. The mitigation is clear: publish 0.1.0 first as a canary, validate the install flow in a clean environment, then bump to 1.0.0 only after confirming everything works. Secondary risks include the package name being squatted (check immediately with `npm view taketomarket`) and a discovered BUG where the `agents/` directory is missing from the `files[]` whitelist, which would cause incomplete installs via npx.

The stack requires zero new dependencies. `node:test` and `node:assert` are built into Node 18+ (the project minimum). The test architecture mirrors the `bin/lib/*.cjs` source structure, uses temp directories for filesystem isolation, and the entire test suite runs via `npm test` with no configuration files needed.

## Key Findings

### Recommended Stack

Zero new dependencies. The entire test and publish infrastructure uses tools already available in the project's Node.js runtime.

**Core technologies:**
- `node:test` (built-in): Test runner — zero-dep, CJS-native, auto-discovers `*.test.cjs` files
- `node:assert` (built-in): Assertions — `strictEqual`, `deepStrictEqual`, `throws` cover all needs
- `npm publish` + `npm pack --dry-run`: Publishing — standard CLI, no wrapper needed
- `files[]` whitelist in package.json: Tarball control — already in place, needs one addition (`agents/`)

**Critical version requirement:** Node 18+ (already enforced by `engines` field and Claude Code runtime requirement).

### Expected Features

**Must have (table stakes) — blocking for publish:**
- `--version` / `-v` flag on install.js (MISSING — must add)
- `repository`, `homepage`, `bugs`, `author` fields in package.json (ALL MISSING — must add)
- Version banner printed at install start ("takeToMarket v1.0.0")
- LICENSE file verified in tarball
- `files[]` audited for completeness (add `agents/`)
- Version bumped to 1.0.0 (after canary validation at 0.1.0)
- Keywords expanded to ~10 terms

**Should have (differentiators):**
- `prepack` script as publish safety net (runs tests before pack)
- Post-install quick-start instructions (already implemented)
- Runtime auto-detection (already implemented)
- Validation report after install (already implemented)

**Defer (v2+):**
- Update notification (requires registry API calls)
- `--local` flag for project-level install
- Colored output with NO_COLOR respect
- GitHub Actions CI
- Multiple dist-tags (canary, next)
- `--uninstall` flag

### Architecture Approach

The test architecture mirrors the source layout: `test/bin/*.test.cjs` maps to `bin/lib/*.cjs`. Tests use filesystem isolation via `fs.mkdtempSync()` for modules that touch `.marketing/`. The installer (`install.js`) requires a `require.main === module` guard refactor to export testable functions without triggering `main()` or `process.exit()`. This is a standard CJS pattern and a non-breaking change.

**Major components:**
1. `test/bin/*.test.cjs` (8 files) — Unit tests for each `bin/lib/*.cjs` module via direct `require()`
2. `test/install.test.cjs` — Unit tests for exported installer functions (detectRuntime, validateInstall, copyDirSync)
3. `test/integration/install-e2e.test.cjs` — Full install flow via child process with overridden HOME env var
4. `test/helpers/fixtures.cjs` — Shared temp dir creation and mock `.marketing/` scaffolding
5. `package.json` modifications — metadata fields, scripts, `agents/` in files[], version bump

### Critical Pitfalls

1. **Publishing internal files to registry** — Run `npm pack --dry-run` before every publish; verify `files[]` whitelist is complete. Once published, versions are permanent.
2. **Version burned on bad first publish** — Publish 0.1.0 as canary first, validate install in clean env, then bump to 1.0.0. npm versions cannot be reused after unpublish.
3. **Package name squatted** — Run `npm view taketomarket` immediately. If available, consider a placeholder 0.0.1 publish to reserve. Have `@taketomarket/core` as fallback.
4. **Missing `agents/` in files[]** — BUG found during research. `install.js` copies `agents/` but `files[]` excludes it from the tarball. Fix before publish or installs via npx will be incomplete.
5. **CRLF shebang corruption** — Add `.gitattributes` with `install.js text eol=lf`. Test on macOS and Linux.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Installer Refactor and Test Infrastructure Setup

**Rationale:** Tests must exist before any other changes to prevent regressions. The `require.main` guard on install.js is a prerequisite for all installer tests. Test helpers and package.json scripts establish the foundation for all subsequent test work.
**Delivers:** Testable install.js exports (require.main guard + module.exports), test helper fixtures (temp dir utilities, mock .marketing/ scaffolding), test scripts in package.json (test, test:unit, test:integration, prepack)
**Addresses:** install.js testability, test runner setup, test file conventions
**Avoids:** Anti-pattern of testing only via CLI child process (slow, fragile, misses error details)

### Phase 2: Unit Tests for bin/lib Modules

**Rationale:** bin/lib modules are pure-ish functions with clear interfaces — fastest to test, highest coverage ROI. Must complete before publish to catch bugs in code that will become permanent on the registry.
**Delivers:** 8 test files covering core.cjs, slug.cjs, state.cjs, campaign.cjs, commit.cjs, deviation.cjs, drift-log.cjs, health.cjs
**Addresses:** Code confidence for publish, regression prevention
**Avoids:** Untested code shipping to registry (permanent once published)

### Phase 3: Integration Tests and Install E2E

**Rationale:** Depends on Phase 1 (refactored install.js with exports). Validates the actual user experience of `npx taketomarket` in an isolated environment. Catches the class of bugs that unit tests cannot — missing files, broken shebang, incorrect directory structure.
**Delivers:** E2E install test (child process with overridden HOME), tarball content verification test (npm pack output assertion), cross-runtime test (Claude Code vs Codex paths)
**Addresses:** Post-install validation, publish safety
**Avoids:** Pitfall of broken first publish (burned version), pnpm dlx compatibility issues

### Phase 4: Package.json Metadata and Publish Prep

**Rationale:** All tests passing gives confidence to finalize metadata. This phase handles all the "table stakes" features that make the npm page look professional and the install experience trustworthy.
**Delivers:** Complete package.json (repository, author, bugs, homepage, expanded keywords, `agents/` in files[]), `--version` flag on install.js, version banner at start of install output, .gitattributes for CRLF prevention, pre-publish checklist validation
**Addresses:** All table-stakes features from FEATURES.md, npm page discoverability
**Avoids:** Poor npm page (missing metadata), incomplete tarball (agents/ bug)

### Phase 5: Canary Publish and Final Release

**Rationale:** npm versions are permanent. Must validate with 0.x before committing to 1.0.0. This phase is the actual publish workflow — not code work, but operational execution with verification gates.
**Delivers:** Published 0.1.0 on npm, verified install in clean environment (npx, pnpm dlx), then version bump to 1.0.0 and final publish with git tag
**Addresses:** Safe first publish, cross-package-manager compatibility
**Avoids:** Version burned on bad publish, 2FA surprises, git/npm version mismatch

### Phase Ordering Rationale

- Phases 1-3 (testing) come before Phases 4-5 (publish) because tests catch bugs that would become permanent once published to npm
- Phase 1 before Phase 2 because the install.js refactor and fixtures are prerequisites for all other tests
- Phase 2 before Phase 3 because unit tests are faster to write and catch more granular bugs; integration tests build on unit-level confidence
- Phase 4 before Phase 5 because metadata must be correct in the tarball before publishing — cannot fix metadata post-publish without burning a version
- Phase 5 uses a two-step publish (0.x canary then 1.0.0) specifically to avoid the "burned version" pitfall that is the #1 risk identified in PITFALLS.md

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Canary Publish):** npm 2FA setup, granular access token creation, and post-publish validation workflow may need investigation if the developer has not published to npm before. Also: confirm package name availability.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Refactor):** Standard `require.main === module` pattern, well-documented in Node.js CJS ecosystem
- **Phase 2 (Unit Tests):** Pure function testing with node:test, extremely well-documented, verified locally
- **Phase 3 (Integration Tests):** Child process testing with overridden env vars, standard pattern
- **Phase 4 (Metadata):** package.json fields are fully documented by npm; GSD provides direct reference implementation

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies; node:test verified locally on Node 24.13.0; npm pack verified with actual project (122 files, 194KB) |
| Features | HIGH | npm metadata requirements officially documented; GSD provides working reference implementation; install.js already implements most differentiators |
| Architecture | HIGH | Direct filesystem inspection of existing bin/lib/*.cjs modules; standard CJS testing patterns; test layout mirrors source layout cleanly |
| Pitfalls | HIGH | Official npm unpublish policy verified; files[] behavior verified via npm pack --dry-run; identified real bug (agents/ missing from files[]) |

**Overall confidence:** HIGH

### Gaps to Address

- **Package name availability:** Must verify `npm view taketomarket` returns E404 before starting Phase 5. If taken, fallback to `@taketomarket/core` (scoped, guaranteed available with org creation). Check this IMMEDIATELY — it affects project identity.
- **npm account 2FA status:** Unknown whether the publisher's npm account has 2FA configured. Must verify before Phase 5. Required for all new packages since 2024.
- **GitHub repo URL:** Research references both `github.com/taketomarket/taketomarket` and `github.com/rishikeshranjan/taketomarket` — need to confirm the canonical URL for package.json repository/homepage/bugs fields.
- **agents/ directory content audit:** The BUG (agents/ missing from files[]) needs verification that the agents/ directory contains meaningful content worth publishing. If it is empty or scaffolding-only, the fix may be to remove it from install.js DIRS_TO_COPY instead.

## Sources

### Primary (HIGH confidence)
- Node.js `node:test` documentation — verified locally: require('node:test') with describe/it/mock works on Node 24.13.0 with CJS
- npm `files` field documentation — verified via `npm pack --dry-run` on this project (122 files, 194KB)
- npm unpublish policy — official docs confirming version permanence and 24-hour rules
- Local filesystem inspection — install.js, bin/ttm-tools.cjs, bin/lib/*.cjs, package.json
- GSD (get-shit-done-cc) npm package — reference implementation for identical architecture pattern

### Secondary (MEDIUM confidence)
- pnpm dlx documentation — behavioral differences in bin resolution vs npx
- npm 2FA requirements documentation — enforcement rules for new packages
- Community post-mortems on first-time npm publishes — common mistakes and prevention

---
*Research completed: 2026-05-11*
*Ready for roadmap: yes*
