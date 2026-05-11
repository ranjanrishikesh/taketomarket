# Roadmap: takeToMarket

## Milestones

- ✅ **v1.0 MVP** — Phases 1-11 (shipped 2026-05-04)
- 🚧 **v1.1 Publish Prep & Gap Closure** — Phases 12-16 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-11) — SHIPPED 2026-05-04</summary>

- [x] Phase 1: Plugin Scaffold and Tooling (3/3 plans)
- [x] Phase 2: Onboarding Interview (3/3 plans)
- [x] Phase 3: Campaign Creation and Briefing (3/3 plans)
- [x] Phase 4: Content Production and Verification (4/4 plans)
- [x] Phase 5: Review, Fix, and Ship (4/4 plans)
- [x] Phase 6: Positioning Invariant System (5/5 plans)
- [x] Phase 7: State Management and Campaign Operations (3/3 plans)
- [x] Phase 8: Core Playbooks (3/3 plans)
- [x] Phase 9: Measurement, Learning, and Remaining Playbooks (6/6 plans)
- [x] Phase 10: Distribution and Polish (5/5 plans)
- [x] Phase 11: Gap Closure (3/3 plans)

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### 🚧 v1.1 Publish Prep & Gap Closure

**Milestone Goal:** Close remaining gaps from v1.0 and publish the package to npm so users can install via `npx taketomarket` / `pnpm dlx taketomarket`.

- [x] **Phase 12: Test Infrastructure & Installer Refactor** - Make install.js testable and establish test foundation (completed 2026-05-10)
- [x] **Phase 13: Unit Tests for bin/lib Modules** - Comprehensive unit test coverage for all CJS modules (completed 2026-05-11)
- [x] **Phase 14: E2E & Integration Tests** - Full install flow validation in isolated environments (completed 2026-05-11)
- [x] **Phase 15: Package Metadata & CLI Polish** - Complete npm page metadata and CLI UX improvements (completed 2026-05-11)
- [x] **Phase 16: Canary Publish & Final Release** - Safe two-step publish to npm registry (completed 2026-05-11)

## Phase Details

### Phase 12: Test Infrastructure & Installer Refactor
**Goal**: Developers can run tests and install.js is testable via require() without triggering side effects
**Depends on**: Phase 11 (v1.0 complete)
**Requirements**: TEST-08, TEST-11
**Success Criteria** (what must be TRUE):
  1. Running `npm test` executes the node:test runner and reports results
  2. `require('./install.js')` returns exported functions without triggering install or process.exit
  3. Test helper utilities exist for creating isolated temp directories and mock .marketing/ scaffolds
  4. package.json scripts.test is set to `node --test`
**Plans:** 2/2 plans complete

Plans:
**Wave 1**
- [x] 12-01-PLAN.md — Refactor install.js with require.main guard + module.exports; add scripts.test to package.json

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 12-02-PLAN.md — Create test/helpers.cjs shared utilities and test/install.test.cjs smoke test

### Phase 13: Unit Tests for bin/lib Modules
**Goal**: Every bin/lib module has unit tests that catch regressions before code ships to the registry
**Depends on**: Phase 12
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07
**Success Criteria** (what must be TRUE):
  1. `node --test` passes with all bin/lib module tests green
  2. slug.cjs tests verify slug generation and timestamp formatting
  3. state.cjs tests verify state read and state update operations
  4. campaign.cjs tests verify campaign init, state, update, and list operations
  5. health.cjs, commit.cjs, and core.cjs each have passing test files
**Plans:** 4/4 plans complete

Plans:
**Wave 1** *(all 4 plans run in parallel -- no file overlap)*
- [x] 13-01-PLAN.md — Unit tests for core.cjs (7 exports) and slug.cjs (2 exports)
- [x] 13-02-PLAN.md — Unit tests for state.cjs (2 exports) and commit.cjs (1 export)
- [x] 13-03-PLAN.md — Unit tests for health.cjs (2 exports: cmdHealth basic+full, cmdInit)
- [x] 13-04-PLAN.md — Extend helpers.cjs with createMockCampaign; unit tests for campaign.cjs (6 exports)

### Phase 14: E2E & Integration Tests
**Goal**: The full install flow is validated end-to-end in isolated environments proving the user experience works
**Depends on**: Phase 12, Phase 13
**Requirements**: TEST-09, TEST-10
**Success Criteria** (what must be TRUE):
  1. E2E test installs taketomarket into an isolated temp directory and verifies all expected files exist
  2. E2E test validates --dry-run produces correct validation output without writing files
  3. Tests use child process execution with overridden HOME to prevent pollution of real environment
**Plans:** 1/1 plans complete

Plans:
**Wave 1**
- [x] 14-01-PLAN.md — Create test/install-e2e.test.cjs covering all 6 E2E scenarios (claude/codex happy paths, auto-detect, --dry-run clean + installed, unknown --runtime warning) via child_process.execFileSync against isolated HOME

### Phase 15: Package Metadata & CLI Polish
**Goal**: The npm package page is complete and professional, and CLI provides version information
**Depends on**: Phase 12
**Requirements**: PKG-01, PKG-02, PKG-03, PKG-04, PKG-05, PKG-06, PKG-07, CLI-01, CLI-02, PUB-01
**Success Criteria** (what must be TRUE):
  1. `npm pack --dry-run` shows all expected files including agents/ without .planning/ or .git/ leakage
  2. package.json contains repository, homepage, bugs, author, and expanded keywords fields
  3. LICENSE file exists at repo root matching MIT declaration
  4. `npx taketomarket --version` prints current version and exits
  5. Install output shows version banner at start
**Plans:** 1/1 plans complete

Plans:
- [x] 15-01-PLAN.md — Add package.json metadata + .npmignore + install.js --version/-v + version banner + manifest guard test

### Phase 16: Canary Publish & Final Release
**Goal**: Package is live on npm and users can install from a clean environment via npx or pnpm dlx
**Depends on**: Phase 13, Phase 14, Phase 15
**Requirements**: PUB-02, PUB-03, PUB-04, PUB-05, PUB-06
**Success Criteria** (what must be TRUE):
  1. `taketomarket@0.1.0` is published to npm and installable
  2. `npx taketomarket --dry-run` works from a clean environment after canary publish
  3. `pnpm dlx taketomarket --dry-run` works from a clean environment after canary publish
  4. Version is bumped to 1.0.0 and republished after canary validation
  5. npm 2FA is enabled on publisher account
**Plans:** 1/1 plans complete

Plans:
- [x] 16-01-PLAN.md — Canary publish 0.1.0, smoke via npx + pnpm dlx, bump to 1.0.0, final publish, git tag v1.0.0

## Progress

**Execution Order:**
Phases execute in numeric order: 12 -> 13 -> 14 -> 15 -> 16
(Note: Phase 15 can start after Phase 12, independent of 13/14)

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Plugin Scaffold and Tooling | v1.0 | 3/3 | Complete | 2026-04-24 |
| 2. Onboarding Interview | v1.0 | 3/3 | Complete | 2026-04-24 |
| 3. Campaign Creation and Briefing | v1.0 | 3/3 | Complete | 2026-04-25 |
| 4. Content Production and Verification | v1.0 | 4/4 | Complete | 2026-04-27 |
| 5. Review, Fix, and Ship | v1.0 | 4/4 | Complete | 2026-04-28 |
| 6. Positioning Invariant System | v1.0 | 5/5 | Complete | 2026-04-28 |
| 7. State Management and Campaign Operations | v1.0 | 3/3 | Complete | 2026-04-29 |
| 8. Core Playbooks | v1.0 | 3/3 | Complete | 2026-04-29 |
| 9. Measurement, Learning, and Remaining Playbooks | v1.0 | 6/6 | Complete | 2026-05-02 |
| 10. Distribution and Polish | v1.0 | 5/5 | Complete | 2026-05-04 |
| 11. Gap Closure | v1.0 | 3/3 | Complete | 2026-05-04 |
| 12. Test Infrastructure & Installer Refactor | v1.1 | 2/2 | Complete    | 2026-05-10 |
| 13. Unit Tests for bin/lib Modules | v1.1 | 4/4 | Complete    | 2026-05-11 |
| 14. E2E & Integration Tests | v1.1 | 1/1 | Complete    | 2026-05-11 |
| 15. Package Metadata & CLI Polish | v1.1 | 1/1 | Complete    | 2026-05-11 |
| 16. Canary Publish & Final Release | v1.1 | 1/1 | Complete    | 2026-05-11 |
