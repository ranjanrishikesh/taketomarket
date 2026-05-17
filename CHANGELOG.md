# Changelog

## 2.3.0-rc.2 — 2026-05-17

### Added
- `/ttm-humanize` skill (adapted from blader/humanizer MIT-licensed source). Mandatory final step on every audience-facing asset.
- `/ttm-discover` skill (renamed from `/ttm-research`).
- `/ttm-email-check` skill (renamed from `/ttm-email-preflight`).
- `/ttm-seo` skill with subcommands `audit`, `keyword-map`, `aeo` (merged from `/ttm-aeo-check`, `/ttm-keyword-map`, `/ttm-seo-audit`).
- `templates/next-step-footer.md` referenced by every `/ttm-*` skill.
- `references/humanizer-patterns.md` — pattern catalog for AI-tell rewriting.

### Deprecated (removal in v2.4.0)
- `/ttm-research` → use `/ttm-discover`.
- `/ttm-email-preflight` → use `/ttm-email-check`.
- `/ttm-aeo-check` → use `/ttm-seo aeo`.
- `/ttm-keyword-map` → use `/ttm-seo keyword-map`.
- `/ttm-seo-audit` → use `/ttm-seo audit`.

### Changed
- `/ttm-produce`, `/ttm-repurpose`, `/ttm-affiliate-kit` now mandate a final `/ttm-humanize` pass on every outgoing asset.

## 2.3.0-rc.1 — 2026-05-17

<!--
RELEASE PROTOCOL (internal — invisible to users on GitHub/npm rendering):

1. Publish under the `next` dist-tag so stable users keep getting 2.2.0:
     npm publish --tag next

2. Verify dist-tags:
     npm dist-tag ls taketomarket
     # expect: latest: 2.2.0, next: 2.3.0-rc.1

3. Add temporary RC install callout near top of README Installation section:
     > **Trying the v2.3.0 release candidate?**
     > Run `npx taketomarket@next`. See CHANGELOG for breaking changes + migration.

4. When 2.3.0 final ships, promote it to `latest`:
     npm dist-tag add taketomarket@2.3.0 latest

5. Remove the temporary RC callout from README.

Source: code review on PR #1, Minor #10. Tracked here (not as an issue) to
keep the Issues tab focused on bugs and feature requests.
-->

### Breaking
- **State folder renamed `.marketing/` → `.taketomarket/`.** After upgrading, run `/ttm-update` (or `/ttm-health`) — the auto-migration prompt will rename the directory and verify the move. State-reading commands (`/ttm-state`, `/ttm-campaign`, `/ttm-produce`, etc.) now refuse to run while a legacy `.marketing/` exists and print the exact migration command. Commit or back up the directory before accepting the prompt; the rename is fast but the workflow does not snapshot.
- **GitHub repo renamed `ranjanrishikesh/takeToMarket` → `ranjanrishikesh/taketomarket`** (lowercase). Old URLs redirect on GitHub. No action required for clones. If you scripted anything against the previous URL form, update to lowercase to avoid the redirect hop. If your local remote uses SSH form, update with `git remote set-url origin git@github.com:ranjanrishikesh/taketomarket.git`.
- **`ttm-tools health --raw` JSON field renamed `marketing_dir` → `taketomarket_dir`.** If any external script parses the `--raw` output, rename the field key.

### Added
- Audience-explicit identity across README, `package.json`, plugin manifests, `CLAUDE.md`, `GEMINI.md`, templates. Built for developerneurs + solopreneurs with zero marketing experience.
- `references/obra-superpowers-conventions.md` — research output for obra/superpowers + gsd-build alignment.
- `bin/lib/legacy-folder.cjs` — migration helper module with tests.
- `node bin/ttm-tools.cjs legacy-folder check|migrate` subcommands.

### Changed
- Repo-wide path references updated `.marketing/` → `.taketomarket/`.

## [2.2.0] — 2026-05-14

### Fixed
- Slash command format: `/ttm-*` (flat install, no namespace) — was incorrectly shown as `/taketomarket:ttm-*` in README and post-install summary
- `parseRuntimeChoices('1,7')` no longer returns `undefined` entries — comma-separated inputs that include `7` now correctly return all named runtimes

### Added
- `~/.agents/skills/` universal cross-runtime install target (option 6 in interactive prompt) — single copy serves Codex, Cursor, Windsurf, and Gemini CLI
- `GEMINI.md` — setup and invocation guide for Gemini CLI users
- `.claude-plugin/marketplace.json` — enables GitHub direct install via `/plugin marketplace add ranjanrishikesh/taketomarket`
- `SECURITY.md` — combined security policy and privacy policy (no data collection, no telemetry)
- `CODE_OF_CONDUCT.md` — Contributor Covenant v2.1
- README Runtime Notes table — invocation syntax per runtime (`/ttm-*` for Claude Code & Cursor, `$ttm-*` for Codex, `@ttm-*` for Windsurf, model-driven for Gemini)

### Documentation
- Filled in research doc R-02 through R-07 with verified findings on Codex, Cursor, Windsurf, Gemini CLI skill paths, marketplace submission, and GitHub direct install
- CLAUDE.md updated to reflect flat install architecture
- README Option 3 now shows working two-step GitHub install syntax

## [2.1.0] — 2026-05-14

### Fixed
- Install skills to correct runtime-specific directories (flat skills, not plugin dir)
- Claude Code: `~/.claude/skills/` — gives working `/ttm-*` commands immediately
- Codex: `~/.codex/skills/`
- Cursor: `~/.cursor/skills/`
- Windsurf: `~/.codeium/windsurf/skills/`
- Gemini CLI: `~/.gemini/skills/`
- Replace `${CLAUDE_PLUGIN_ROOT}` in SKILL.md files with absolute `~/.taketomarket/` path

### Added
- `ttm-update` skill: check npm for updates and auto-install latest version
- `~/.taketomarket/` as shared package base for all runtimes

## [2.0.0] — 2026-05-13

### Fixed
- IMP-02: Register in installed_plugins.json — skills now appear as slash commands in Claude Code
- IMP-15: Fix wrong GitHub URL (taketomarket/taketomarket → ranjanrishikesh/taketomarket)
- IMP-16: Gitignore settings.local.json — stops leaking local filesystem paths

### Added
- IMP-01: Interactive multi-runtime selection prompt (7 options: Claude Code, Codex, Cursor, Windsurf, Gemini CLI, All, Custom path)
- IMP-03: Confirmation prompt before install; `--yes`/`-y` flag to skip for CI
- IMP-04: `--check` flag to inspect install state without installing
- IMP-05: Post-install summary listing available slash commands with descriptions
- IMP-09: Cursor adapter — pending Wave 0 research (placeholder paths in place)
- IMP-10: Windsurf adapter — pending Wave 0 research (placeholder paths in place)
- IMP-11: Gemini CLI — pending Wave 0 research validation
- IMP-12: Codex registration — pending Wave 0 research (Branch A/B/C from R-02)
- IMP-20: CONTRIBUTING.md

### Documentation
- IMP-13/14: Full README rewrite — all install methods, quick start, command reference
- IMP-17: .planning/ gitignored
- IMP-18: idea.md removed, positioning extracted to README

### Distribution
- IMP-06: Marketplace submission prep (pending public repo + Anthropic approval)
- IMP-07: GitHub direct install syntax — pending Wave 0 R-07 research

## [1.0.1] — 2026-05-10

- Fix GitHub username in repository.url, homepage, bugs fields
- Update manifest guard to match corrected GitHub URLs
