# Requirements — v1.1 Publish Prep & Gap Closure

## Testing Infrastructure

- [x] **TEST-01**: User can run `node --test` and all bin/lib modules pass unit tests
- [x] **TEST-02**: Unit tests cover slug.cjs (slug generation, timestamp formatting)
- [x] **TEST-03**: Unit tests cover state.cjs (state read, state update)
- [x] **TEST-04**: Unit tests cover campaign.cjs (campaign init, state, update, list)
- [x] **TEST-05**: Unit tests cover health.cjs (init check, directory validation)
- [x] **TEST-06**: Unit tests cover commit.cjs (commit message formatting)
- [x] **TEST-07**: Unit tests cover core.cjs (error handling, arg parsing)
- [x] **TEST-08**: install.js has require.main guard for testability
- [x] **TEST-09**: E2E test validates full install flow in isolated temp directory
- [x] **TEST-10**: E2E test validates --dry-run produces correct validation output
- [x] **TEST-11**: package.json has `scripts.test` set to `node --test`

## Package Metadata & Fixes

- [x] **PKG-01**: package.json includes `repository` field pointing to github.com/rishikeshranjan/takeToMarket
- [x] **PKG-02**: package.json includes `homepage` field
- [x] **PKG-03**: package.json includes `bugs` field with GitHub issues URL
- [x] **PKG-04**: package.json includes `author` field with name
- [x] **PKG-05**: package.json `files[]` includes `agents/` directory (BUG FIX — install.js copies it but tarball excludes it)
- [x] **PKG-06**: package.json keywords expanded for npm discoverability
- [x] **PKG-07**: LICENSE file exists at repo root and matches MIT declaration

## CLI Polish

- [x] **CLI-01**: `npx taketomarket --version` prints current version and exits
- [x] **CLI-02**: Install output shows version banner at start

## Publish & Validation

- [x] **PUB-01**: `npm pack --dry-run` shows all expected files without .planning/ or .git/ leakage
- [x] **PUB-02**: Package published to npm as `taketomarket@0.1.0` (canary)
- [x] **PUB-03**: `npx taketomarket --dry-run` works from clean environment after publish
- [x] **PUB-04**: `pnpm dlx taketomarket --dry-run` works from clean environment after publish
- [x] **PUB-05**: Version bumped to 1.0.0 and republished after canary validation
- [x] **PUB-06**: npm 2FA enabled on publisher account

## Future Requirements (Deferred)

- Automated CI/CD pipeline for npm publish on git tag
- Changelog generation from git commits
- Scoped package (@taketomarket/cli) if org is created later

## Out of Scope

- Runtime dependencies — zero-dep constraint preserved
- TypeScript rewrite — CJS works, no transpilation needed
- Monorepo tooling — single package, not needed
- GitHub Actions workflow — manual publish for now

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| TEST-01 | Phase 13 | Complete |
| TEST-02 | Phase 13 | Complete |
| TEST-03 | Phase 13 | Complete |
| TEST-04 | Phase 13 | Complete |
| TEST-05 | Phase 13 | Complete |
| TEST-06 | Phase 13 | Complete |
| TEST-07 | Phase 13 | Complete |
| TEST-08 | Phase 12 | Complete |
| TEST-09 | Phase 14 | Complete |
| TEST-10 | Phase 14 | Complete |
| TEST-11 | Phase 12 | Complete |
| PKG-01 | Phase 15 | Complete |
| PKG-02 | Phase 15 | Complete |
| PKG-03 | Phase 15 | Complete |
| PKG-04 | Phase 15 | Complete |
| PKG-05 | Phase 15 | Complete |
| PKG-06 | Phase 15 | Complete |
| PKG-07 | Phase 15 | Complete |
| CLI-01 | Phase 15 | Complete |
| CLI-02 | Phase 15 | Complete |
| PUB-01 | Phase 15 | Complete |
| PUB-02 | Phase 16 | Complete |
| PUB-03 | Phase 16 | Complete |
| PUB-04 | Phase 16 | Complete |
| PUB-05 | Phase 16 | Complete |
| PUB-06 | Phase 16 | Complete |
