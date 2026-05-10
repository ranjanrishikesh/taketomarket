# Feature Landscape: npm Publish Prep

**Domain:** npm CLI installer package for Claude Code / Codex skill distribution
**Researched:** 2026-05-11
**Confidence:** HIGH

## Table Stakes

Features users expect from any `npx <package>` installer. Missing = package feels broken or amateurish.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `#!/usr/bin/env node` shebang on install.js | Required for npx/pnpm dlx to execute the bin entry | Low | Already present |
| `--help` / `-h` flag | Every CLI tool prints usage info | Low | Already implemented |
| `--version` / `-v` flag | Standard CLI convention; users confirm what version installed | Low | **MISSING** -- must add |
| Clear success/failure output | Users need visual confirmation install worked | Low | Already implemented with [PASS]/[FAIL] validation |
| Non-zero exit code on failure | CI/scripts depend on exit codes | Low | Already implemented (process.exit(1)) |
| README.md renders on npmjs.com | Primary discovery surface; npm shows README as package page | Low | README exists and is comprehensive |
| `repository` field in package.json | Creates "Repository" link on npmjs.com sidebar | Low | **MISSING** -- must add |
| `homepage` field in package.json | Creates "Homepage" link on npmjs.com sidebar | Low | **MISSING** -- must add |
| `bugs` field in package.json | Creates "Issues" link on npmjs.com sidebar | Low | **MISSING** -- must add |
| `author` field in package.json | Shows author on npmjs.com sidebar | Low | **MISSING** -- must add |
| LICENSE file included in package | npm includes it by default; expected for MIT packages | Low | Needs verification that LICENSE file exists |
| Sensible `keywords` for discovery | npm search uses keywords array | Low | Present but should be expanded |
| `engines.node` field | Tells users minimum Node version; npx warns on mismatch | Low | Already present (>=18) |
| Idempotent installs | Running `npx taketomarket` twice should work cleanly | Low | Already handled (rmSync before reinstall) |
| `--dry-run` flag | Users preview what will happen without writing files | Low | Already implemented |
| `files` whitelist excludes dev artifacts | Users should not download .planning/, tests, .git | Low | Present but needs audit for completeness |

## Differentiators

Features that set the install experience apart from generic CLI tools. Not expected, but increase trust and adoption.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Version banner on run | Print package name + version at start (like create-next-app does) | Low | Builds trust; user sees exactly what version is running |
| Post-install quick start instructions | Tell users what to do next after success | Low | Already implemented (shows /ttm-init steps) |
| Runtime auto-detection | No config needed for Claude Code vs Codex | Low | Already implemented |
| Validation report after install | Structural check proves the install is healthy | Low | Already implemented with component-level pass/fail |
| `@latest` tag awareness | Ensure `npx taketomarket@latest` always fetches fresh | Low | Works by default with npm; document in README |
| `funding` field in package.json | Shows "Fund this package" on npmjs.com | Low | Optional but increases legitimacy for open source |
| Colored/styled terminal output | Visual hierarchy in install output | Med | Nice-to-have; must work without colors in CI (respect NO_COLOR) |
| `--local` flag for project-level install | Install to `./.claude/plugins/` instead of global `~/` | Med | GSD supports this; useful for team repos |
| Update notification | Check if newer version exists and suggest upgrade | Med | Defer to post-publish; requires registry API call |

## Anti-Features

Features to explicitly NOT build for the npm publish milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Interactive prompts during install | npx/pnpm dlx often runs non-interactively (CI, piped); prompts block automation | Auto-detect runtime; use flags for overrides |
| postinstall lifecycle script | Output suppressed by npm, security warnings in CI, breaks restricted environments | Use bin entry point directly (already correct) |
| Global npm install (`npm install -g`) | Outdated pattern; npx is the standard for one-shot installers | Document `npx taketomarket` as primary path |
| Auto-update on every run | Surprising behavior; users should opt into updates | Provide `npx taketomarket@latest` in docs |
| Telemetry or analytics | Violates user trust for a dev tool; adds external dependency | None needed |
| npm `prepare` or `prepublish` scripts | Adds build steps that can fail in CI; package should be publish-ready as-is | Ship only source files, no build step |
| Multiple bin entry points | Clutters PATH; confusing which command to run | Single `taketomarket` bin entry (already correct) |
| TypeScript source requiring transpilation | Adds build complexity; install.js must run directly | Keep plain CJS (already correct) |
| Progress spinner/animation | The copy operation takes <1s for 125 files; animation is visual noise | Simple line-per-directory logging (already implemented) |

## Feature Dependencies

```
package.json metadata (repository, author, bugs, homepage) --> npm publish
                                                                    |
LICENSE file exists -----------------------------------------> npm publish
                                                                    |
--version flag added to install.js --------------------------> npm publish (users verify version)
                                                                    |
.npmignore or files[] whitelist audited ---------------------> npm publish (controls tarball contents)
                                                                    |
version bumped to 1.0.0 ------------------------------------> npm publish (semver signal: this is stable)
                                                                    |
npm publish -------------------------------------------------> post-publish validation
                                                                    |
post-publish validation (npx taketomarket in clean env) ----> confidence to announce
```

## npm Metadata Optimization Checklist

Fields that appear on the npmjs.com package page and how to optimize them:

| Field | Where It Shows | Current State | Action Needed |
|-------|---------------|---------------|---------------|
| `name` | Page title, install command | "taketomarket" | Good -- lowercase, no scope, memorable |
| `version` | Sidebar, install command | "0.1.0" | Bump to 1.0.0 (matches shipped v1.0 status) |
| `description` | Search results, below title | Present, descriptive | Good as-is |
| `keywords` | Search indexing (not visible on page) | 5 keywords | Expand to ~10: add "marketing-automation", "ai-marketing", "positioning", "content-ops", "campaign-management" |
| `license` | Sidebar badge | "MIT" | Good |
| `repository` | Sidebar "Repository" link | **MISSING** | Add: `{"type": "git", "url": "git+https://github.com/taketomarket/taketomarket.git"}` |
| `homepage` | Sidebar "Homepage" link | **MISSING** | Add: `"https://github.com/taketomarket/taketomarket"` |
| `bugs` | Sidebar "Issues" link | **MISSING** | Add: `{"url": "https://github.com/taketomarket/taketomarket/issues"}` |
| `author` | Sidebar under collaborators | **MISSING** | Add author name/email |
| `README.md` | Main content area of package page | Comprehensive, well-structured | Good |
| `files` | Controls tarball size (shown in sidebar as "Unpacked Size") | Present with whitelist | Audit: ensure .planning/, .git/, tests/, node_modules/ excluded |
| `engines` | Not prominently displayed but used by npx for warnings | Present (>=18) | Good |
| `funding` | "Fund this package" banner at top | Not set | Optional; add if GitHub Sponsors active |

## pnpm dlx Compatibility

| Concern | Status | Action |
|---------|--------|--------|
| `pnpm dlx taketomarket` executes bin entry | Works if bin field is correct | Already correct |
| postinstall scripts run by default in dlx | Not using postinstall | No issue |
| pnpm v10 stricter binary resolution | Only affects nested deps, not top-level bin | No issue for zero-dep package |
| `pnpx taketomarket` alias | Works automatically via pnpm | Document as alternative |
| `--` separator for flags | `pnpm dlx taketomarket -- --runtime codex` | Document in README |

## Reference: How GSD (get-shit-done-cc) Does It

GSD is the closest comparable package (31K+ stars, same architecture pattern). Key patterns:

| Aspect | GSD Pattern | takeToMarket Status |
|--------|-------------|---------------------|
| bin field | `{"get-shit-done-cc": "bin/install.js"}` matching package name | Have `{"taketomarket": "./install.js"}` -- correct |
| description | Short, mentions key runtimes | Already good |
| keywords | 10 keywords covering runtimes + concepts | Expand from 5 to ~10 |
| homepage | Points to GitHub repo | **Need to add** |
| repository | Standard `git+https://` format | **Need to add** |
| bugs | GitHub issues URL | **Need to add** |
| author | Organization name | **Need to add** |
| Multiple dist-tags | latest, canary, next, experimental | Overkill for first publish; just use `latest` |
| Version | 1.41.1 (rapid iteration) | Start at 1.0.0 |
| Bin aliases | 3 bin entries (main + aliases) | Keep single entry for simplicity |

## Expected User Experience Flow

### Happy Path: `npx taketomarket`

```
$ npx taketomarket

takeToMarket v1.0.0                          <-- Version banner (TO ADD)
Runtime: claude (auto-detected)
Target: /Users/foo/.claude/plugins/taketomarket

  Copying .claude-plugin/
  Copying skills/
  Copying workflows/
  Copying templates/
  Copying references/
  Copying playbooks/
  Copying gates/
  Copying bin/
  Copying settings.json

Validation:
  [PASS] .claude-plugin
  [PASS] skills (27 SKILL.md files)
  [PASS] workflows
  [PASS] templates
  [PASS] references
  [PASS] playbooks
  [PASS] gates
  [PASS] bin
  [PASS] plugin.json

Installation complete!

Quick start:
  1. Open a project directory
  2. Run /ttm-init to set up your marketing workspace
  3. Run /ttm-new-campaign <name> to start your first campaign

Documentation: https://github.com/taketomarket/taketomarket
```

### Error Path: Missing runtime directory

```
$ npx taketomarket
Note: Defaulting to Claude Code. Use --runtime codex if using Codex.

takeToMarket v1.0.0
Runtime: claude
Target: /Users/foo/.claude/plugins/taketomarket

  Copying .claude-plugin/
  ...

Installation complete!
```

### Dry Run: `npx taketomarket --dry-run`

```
$ npx taketomarket --dry-run

takeToMarket v1.0.0
[DRY RUN] Validating source package...

Validation:
  [PASS] .claude-plugin
  [PASS] skills (27 SKILL.md files)
  ...

[DRY RUN] No files written.
```

## MVP Recommendation

**Must-have for npm publish (blocking):**

1. Add `repository`, `homepage`, `bugs`, `author` fields to package.json
2. Add `--version` / `-v` flag to install.js (read version from package.json)
3. Print version banner at start of install output ("takeToMarket v1.0.0")
4. Verify LICENSE file exists and is included in tarball
5. Audit `files` whitelist -- ensure .planning/, tests/, *.test.* excluded
6. Bump version to 1.0.0 (semver signal: stable, matches shipped status)
7. Expand keywords to ~10 terms for npm search discoverability

**Nice-to-have (non-blocking for publish):**

- `--local` flag for project-level install (team repos)
- `funding` field in package.json
- Colored output with NO_COLOR env var respect

**Defer to post-publish iterations:**

- Update notification (requires npm registry API check)
- Multiple dist-tags (canary, next) -- justify with iteration cadence
- Interactive runtime selection -- auto-detect + flags is the right approach
- `--uninstall` flag -- manual rm suffices for now

## Sources

- [npm package.json documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) -- Official field specifications (HIGH confidence)
- [npx documentation](https://docs.npmjs.com/cli/v11/commands/npx/) -- How npx resolves and runs bin entries (HIGH confidence)
- [pnpm dlx documentation](https://pnpm.io/cli/pnx) -- pnpm equivalent behavior (HIGH confidence)
- [get-shit-done-cc on npm](https://www.npmjs.com/package/get-shit-done-cc) -- Reference implementation for AI skill installer package (HIGH confidence, verified via `npm view`)
- [GSD GitHub](https://github.com/gsd-build/get-shit-done) -- Distribution patterns (HIGH confidence)
- [Installing and running Node.js bin scripts](https://2ality.com/2022/08/installing-nodejs-bin-scripts.html) -- Shebang and bin field mechanics (MEDIUM confidence)
- [Best Practices for npm Packages](https://blog.inedo.com/npm/best-practices-for-your-organizations-npm-packages) -- Metadata organization (MEDIUM confidence)
- [pnpm dlx vs npx discussion](https://github.com/orgs/pnpm/discussions/5820) -- Behavioral differences (MEDIUM confidence)

---
*Feature research for: npm publish prep and testing (v1.1 milestone)*
*Researched: 2026-05-11*
