# Phase 16: Canary Publish & Final Release - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Publish `taketomarket` to the public npm registry as a canary (`--tag canary`) at version 0.1.0, smoke-test it via `npx` and `pnpm dlx` from isolated environments, then bump to 1.0.0 and republish as `latest`. Includes user-facing prereq guidance (account creation, 2FA, login). This phase does NOT include README polish, CHANGELOG generation, or post-launch announcement (separate items).

</domain>

<spec_lock>
## Pre-flight State (verified 2026-05-11 prior to discuss)

- `npm --version` → 11.6.2 ✓
- `pnpm` installed ✓ (PUB-04 testable locally)
- `npm whoami` → ENEEDAUTH (not logged in — user must `npm adduser` after account creation)
- `npm view taketomarket` → E404 (name AVAILABLE, no squatter)
- LOCKED: name will be claimed by user as PRIMARY OWNER on first publish

</spec_lock>

<decisions>
## Implementation Decisions

### Account & Identity
- **D-01:** User creates npm account at https://www.npmjs.com/signup (manual, web UI). Plan documents the exact step but waits at a `human-action` checkpoint until user confirms account exists.
- **D-02:** PUB-06 (2FA): user enables 2FA at https://www.npmjs.com/settings/~/profile under "Two-factor authentication". MUST select "auth-only" or "auth-and-writes" mode. Plan pauses at human-action checkpoint and verifies via `npm profile get` (shows `tfa: auth-and-writes` or similar) before continuing to publish.
- **D-03:** User runs `npm adduser` locally (writes auth token to `~/.npmrc`). Claude verifies via `npm whoami` returning the username. Plan does NOT shell out to `npm adduser` itself — interactive prompts can't be safely scripted.
- **D-04:** PRIMARY OWNER is the npm account that publishes first. No org scoping (`@scope/taketomarket`) — package goes to the unscoped public namespace. Reason: shorter `npx taketomarket` UX trumps scoping in v1.1.

### Canary Publish (PUB-02)
- **D-05:** Canary version = 0.1.0 (current package.json). Use `--tag canary` so the dist-tag `latest` stays unset until 1.0.0 ships. Means `npx taketomarket` returns 404 until 1.0.0 — explicit `npx taketomarket@canary` or `npx taketomarket@0.1.0` needed for canary smoke tests.
- **D-06:** Publish command: `npm publish --tag canary --access public`. The `--access public` is mandatory for first-publish of an unscoped package created under a free account (npm defaults to public for unscoped, but explicit is safer). 2FA OTP will prompt — Claude pauses at this point and forwards the prompt to user.
- **D-07:** Pre-publish guard: re-run `npm pack --dry-run` to confirm tarball composition matches Phase 15's verified set (agents/ in, .planning/ out). Block on any drift.

### Smoke Tests (PUB-03, PUB-04)
- **D-08:** Run smoke tests in isolated temp dirs with isolated HOME, same pattern as Phase 14's install-e2e tests. Use `child_process.spawnSync` from a script file (NOT a node:test file — these are deploy-side checks, not regression tests).
- **D-09:** Test commands (per-canary, run after publish):
  - `npx taketomarket@canary --dry-run` (PUB-03)
  - `pnpm dlx taketomarket@canary --dry-run` (PUB-04)
- **D-10:** Use `--ignore-existing` / `--prefer-offline=false` if needed to force fresh registry pull and bypass any local cache that might mask publish issues. For npx: `npx --yes --package=taketomarket@canary -- taketomarket --dry-run`. For pnpm dlx: `pnpm dlx taketomarket@canary --dry-run`.
- **D-11:** Smoke test target: `--dry-run` (NOT a real install) — exercises tarball download + extract + entrypoint resolution + arg parse, but writes no files. Validates the publish without polluting user environment.
- **D-12:** Capture stdout/stderr from each smoke test and grep for the expected `[DRY RUN] No files written.` line plus the version banner `takeToMarket installer v0.1.0`. Both must appear or smoke test fails.

### Final Release (PUB-05)
- **D-13:** Bump path: `npm version major --no-git-tag-version` (writes 1.0.0 to package.json without auto-creating git tag — Claude handles tag creation in a separate commit for clean history).
- **D-14:** Final publish: `npm publish --access public` (NO `--tag` flag → defaults to `latest`). 2FA OTP again — Claude pauses + forwards.
- **D-15:** Final smoke: `npx taketomarket --dry-run` (no version pin) must resolve to 1.0.0. Same banner + dry-run line assertions as canary smoke.
- **D-16:** Git tag the release: `git tag v1.0.0 && git push --tags` (user confirms before push).

### Failure Recovery
- **D-17:** If canary smoke test fails: investigate root cause first; do NOT auto-unpublish. If unpublishable required, use `npm unpublish taketomarket@0.1.0 --force` within the 72-hour window. Document any forced unpublish in SUMMARY.md so the planner of any future re-publish knows the version was burned.
- **D-18:** If 1.0.0 smoke fails AFTER canary passed: bump to 1.0.1 + republish (do NOT unpublish 1.0.0 — it's the public face going forward). Treat 1.0.0 as a learnable mistake, ship 1.0.1 as fix.

### Documentation
- **D-19:** README.md install instructions: verify they show `npx taketomarket` (Phase 15 left README untouched). If README is missing or stale, the planner adds a small task to write a minimal Install section. NOT a full README overhaul (deferred).
- **D-20:** Skip CHANGELOG generation in this phase — not in requirements, can be added retroactively from git log later.

### Claude's Discretion
- Whether smoke-test script lives in `scripts/smoke-publish.sh` or inline in plan task (recommend: inline; one-shot phase, no need to keep the script around)
- Exact prompt formatting when pausing for user 2FA OTP
- Whether to run pnpm dlx smoke before or after npx smoke (recommend: npx first, more critical UX)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source of Truth
- `package.json` — current version 0.1.0; will bump to 1.0.0 mid-phase. All metadata fields validated by Phase 15.
- `install.js` — entry point for `taketomarket` bin. Already supports `--version`, `--dry-run`, `--runtime`, `--help` per Phases 12+15.
- `LICENSE` — MIT; npm registry pulls this for the package page.

### Test Infrastructure (post-Phase 15)
- `test/install-e2e.test.cjs` — pattern reference for spawnSync + isolated HOME (smoke tests reuse the same shape but run AGAINST the npm registry, not local install.js)
- `test/package-metadata.test.cjs` — manifest guard, runs at every test cycle to catch metadata regression during version bump

### Requirements
- `.planning/REQUIREMENTS.md` — PUB-02 through PUB-06 assigned to this phase

### External References
- npm signup: https://www.npmjs.com/signup
- npm 2FA settings: https://www.npmjs.com/settings/~/profile (Two-factor authentication section)
- npm publish docs: https://docs.npmjs.com/cli/v10/commands/npm-publish
- npm unpublish 72h window: https://docs.npmjs.com/policies/unpublish
- npx --package flag: https://docs.npmjs.com/cli/v10/commands/npx
- pnpm dlx: https://pnpm.io/cli/dlx

### Prior Phase Context
- `.planning/phases/15-package-metadata-cli-polish/15-CONTEXT.md` — D-04 keyword list used for npm discoverability after publish
- `.planning/phases/14-e2e-integration-tests/14-CONTEXT.md` — spawnSync + HOME override pattern reused for smoke tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `child_process.spawnSync` + `env: { ...process.env, HOME: tempDir }` pattern from test/install-e2e.test.cjs — directly applies to smoke tests (just swap `node install.js` for `npx taketomarket@canary`)
- `createTempDir` from test/helpers.cjs (FROZEN — read-only) — usable inside smoke test inline script
- `npm pack --dry-run` already validated in Phase 15 — re-run is a 5-second sanity check before publish

### Established Patterns
- 30-second timeout on child processes
- Capture both stdout and stderr separately; assert on substring match
- Version banner shape: `takeToMarket installer v${VERSION}` — smoke test asserts this exact format

### Integration Points
- npm registry latency: first-publish propagation can take 30–60 seconds before `npm view` returns the new version. Smoke tests should retry up to 3x with 30s backoff before failing.
- npx caches packages aggressively. Smoke tests must run with `--yes --package=taketomarket@canary` form to bypass any stale cache.
- pnpm dlx has its own cache at `~/.local/share/pnpm/store` — `pnpm dlx --force` not necessary if version pin is unique (canary 0.1.0 is fresh)
- 2FA OTP injection: Claude cannot read OTP from authenticator app; user must paste into the prompt. Plan handles this via `human-action` checkpoint.

### Pre-flight Already Verified
- npm CLI present (11.6.2)
- pnpm present
- Package name `taketomarket` available on npm registry (E404)
- Not currently logged in (expected — user logs in after account creation)

</code_context>

<specifics>
## Specific Ideas

User answered 4 gray-area questions:
1. npm account: needs setup (Claude guides through creation + 2FA + login)
2. Publish actor: Claude runs via Bash (after user logged in)
3. Tag strategy: `--tag canary` for 0.1.0
4. Bump path: same phase, after canary smoke verifies

All other decisions delegated to Claude.

</specifics>

<deferred>
## Deferred Ideas

- README.md overhaul (only minimal install-section update if absent)
- CHANGELOG.md generation
- npm provenance attestation (`--provenance`) — needs GitHub Actions trusted publisher setup; not in v1.1 scope
- Org scoping (`@rishikeshranjan/taketomarket`) — unscoped chosen for shorter UX
- Post-launch announcement (Twitter/HN/Reddit) — outside GSD scope
- Telemetry / install analytics — privacy-sensitive, deferred
- Auto-update check on install — Phase 17+ feature
- Homebrew / scoop / winget distribution — separate channels, not v1.1

</deferred>

---

*Phase: 16-Canary Publish & Final Release*
*Context gathered: 2026-05-11*
