# Requirements — v1.1 Publish Prep & Gap Closure

## Testing Infrastructure

- [ ] **TEST-01**: User can run `node --test` and all bin/lib modules pass unit tests
- [ ] **TEST-02**: Unit tests cover slug.cjs (slug generation, timestamp formatting)
- [ ] **TEST-03**: Unit tests cover state.cjs (state read, state update)
- [ ] **TEST-04**: Unit tests cover campaign.cjs (campaign init, state, update, list)
- [ ] **TEST-05**: Unit tests cover health.cjs (init check, directory validation)
- [ ] **TEST-06**: Unit tests cover commit.cjs (commit message formatting)
- [ ] **TEST-07**: Unit tests cover core.cjs (error handling, arg parsing)
- [ ] **TEST-08**: install.js has require.main guard for testability
- [ ] **TEST-09**: E2E test validates full install flow in isolated temp directory
- [ ] **TEST-10**: E2E test validates --dry-run produces correct validation output
- [ ] **TEST-11**: package.json has `scripts.test` set to `node --test`

## Package Metadata & Fixes

- [ ] **PKG-01**: package.json includes `repository` field pointing to github.com/rishikeshranjan/takeToMarket
- [ ] **PKG-02**: package.json includes `homepage` field
- [ ] **PKG-03**: package.json includes `bugs` field with GitHub issues URL
- [ ] **PKG-04**: package.json includes `author` field with name
- [ ] **PKG-05**: package.json `files[]` includes `agents/` directory (BUG FIX — install.js copies it but tarball excludes it)
- [ ] **PKG-06**: package.json keywords expanded for npm discoverability
- [ ] **PKG-07**: LICENSE file exists at repo root and matches MIT declaration

## CLI Polish

- [ ] **CLI-01**: `npx taketomarket --version` prints current version and exits
- [ ] **CLI-02**: Install output shows version banner at start

## Publish & Validation

- [ ] **PUB-01**: `npm pack --dry-run` shows all expected files without .planning/ or .git/ leakage
- [ ] **PUB-02**: Package published to npm as `taketomarket@0.1.0` (canary)
- [ ] **PUB-03**: `npx taketomarket --dry-run` works from clean environment after publish
- [ ] **PUB-04**: `pnpm dlx taketomarket --dry-run` works from clean environment after publish
- [ ] **PUB-05**: Version bumped to 1.0.0 and republished after canary validation
- [ ] **PUB-06**: npm 2FA enabled on publisher account

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
| (Filled by roadmapper) | | |
