# Phase 16: Canary Publish & Final Release - Discussion Log

**Date:** 2026-05-11
**Mode:** discuss (interactive — high-stakes phase, auto-mode override)

## Pre-flight Scout

- npm CLI: 11.6.2 ✓
- pnpm: installed at `/Users/rishikeshranjan/Library/pnpm/pnpm` ✓ (PUB-04 testable)
- npm whoami: ENEEDAUTH (user not logged in)
- npm view taketomarket: E404 (NAME AVAILABLE)

## Areas Presented

1. npm account state
2. Publish actor (user manual vs Claude-via-Bash)
3. Canary tag strategy
4. Version bump path (same phase vs split)

## User Answers

1. **Account:** "guide me to create account setup and other required steps" → Claude documents step-by-step + uses `human-action` checkpoints
2. **Publish actor:** "Claude runs via Bash" → after user logs in, Claude executes `npm publish` (2FA OTP user pastes interactively)
3. **Canary tag:** `--tag canary` (recommended) → 0.1.0 hides under canary tag, latest stays unset until 1.0.0
4. **Bump path:** same phase, after canary verify → publish 0.1.0, smoke, bump to 1.0.0, republish

## Locked Decisions

See `16-CONTEXT.md` `<decisions>` block D-01 through D-20.

Summary:
- Account creation + 2FA + `npm adduser` = user manual steps with checkpoints
- `npm publish --tag canary --access public` for 0.1.0
- Smoke tests via `npx --yes --package=taketomarket@canary -- taketomarket --dry-run` and `pnpm dlx taketomarket@canary --dry-run` with isolated HOME (Phase 14 spawnSync pattern)
- Assertions: dry-run banner + `[DRY RUN] No files written.` line both present
- Bump via `npm version major --no-git-tag-version`, then `npm publish --access public` (default tag `latest`)
- Final smoke: `npx taketomarket --dry-run` resolves to 1.0.0
- Git tag `v1.0.0` (user confirms before push)
- 30s timeout + 3x retry on smoke tests (npm registry propagation latency)
- Failure recovery: documented `npm unpublish --force` within 72h for canary; for 1.0.0 issues, ship 1.0.1 instead of unpublish

## Deferred Ideas

README overhaul, CHANGELOG, npm provenance, org scoping, post-launch announcement, telemetry, alt distribution channels

## Items Requiring User Action (Plan Will Pause At)

- `human-action`: Create npm account at npmjs.com/signup
- `human-action`: Enable 2FA at npmjs.com/settings/~/profile (auth-and-writes mode)
- `human-action`: Run `npm adduser` locally
- `human-action`: Provide 2FA OTP when `npm publish` prompts (twice — canary + final)
- `human-action`: Confirm before `git push --tags v1.0.0`

---
*Phase: 16-canary-publish-final-release*
