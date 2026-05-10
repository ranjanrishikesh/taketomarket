# Domain Pitfalls: npm Publish Prep

**Domain:** First-time npm publish of a Claude Code plugin (takeToMarket)
**Researched:** 2026-05-11
**Confidence:** HIGH (official npm docs, community post-mortems, verified against current package.json)

## Critical Pitfalls

Mistakes that cause permanent registry damage or broken installs for every user.

### Pitfall 1: Publishing .planning/, .git/, or Internal Files

**What goes wrong:** The published tarball contains `.planning/`, `.claude/`, test fixtures, or other internal directories. Users downloading via `npx taketomarket` get a bloated package with internal project management files visible to anyone on the registry. Once published, you cannot fully retract -- the version is burned forever.

**Why it happens:** The current `package.json` has a `"files"` whitelist, which is good. However, there is NO `.gitignore` and NO `.npmignore` in the repo. If someone accidentally removes the `"files"` field or adds a glob like `"."`, everything ships. Additionally, `npm pack` is rarely run before first publish to verify contents.

**Consequences:** Leaks internal planning docs, roadmaps, and project state to the public registry. The version number is permanently consumed even after unpublish.

**Prevention:**
- Run `npm pack --dry-run` before every publish and inspect the file list
- Run `npm pack` and extract the tarball to verify: `tar -tzf taketomarket-0.1.0.tgz`
- Add a `.npmignore` as defense-in-depth even though `"files"` whitelist exists
- Add a pre-publish script: `"prepublishOnly": "npm pack --dry-run"`

**Detection:** File list in `npm pack --dry-run` output shows unexpected entries.

**takeToMarket-specific:** Current `"files"` field looks correct (`.claude-plugin/`, `skills/`, `workflows/`, etc.) but verify every listed directory actually exists before publish. Missing directories silently produce empty packages.

---

### Pitfall 2: Version Burned on Bad First Publish

**What goes wrong:** You publish 1.0.0 with a broken install script or missing file. You unpublish. But npm's policy means: (1) that exact version can NEVER be reused, (2) if you unpublish all versions, you cannot re-publish ANY version for 24 hours, (3) versions older than 24 hours cannot be unpublished at all -- you must contact npm support.

**Why it happens:** First-time publishers treat npm like git where you can force-push. npm is append-only for all practical purposes.

**Consequences:** Your 1.0.0 is permanently gone. You must publish as 1.0.1. Users who cached or pinned 1.0.0 get errors. Your version history has a gap that confuses consumers.

**Prevention:**
- Start at `0.1.0` (which is already the case -- good)
- Publish `0.1.0` first as a "canary" version, test install in a fresh directory
- Only bump to `1.0.0` after verifying the 0.x publish works end-to-end
- Use `npm publish --dry-run` to simulate without actually publishing
- Test install from local tarball: `npm install ./taketomarket-0.1.0.tgz`

**Detection:** Post-publish, immediately run `npx taketomarket` in a fresh temp directory.

---

### Pitfall 3: bin Field Permissions and Shebang Issues

**What goes wrong:** The `install.js` binary works locally but fails with `EACCES` or `env: node: No such file or directory` when installed globally via npm/npx/pnpm dlx. Users get permission denied or "command not found" errors.

**Why it happens:** Three independent causes:
1. File not marked executable (`chmod +x install.js`) -- npm usually handles this from `"bin"` field but edge cases exist on Windows
2. Shebang line has Windows CRLF line endings (`\r\n`) instead of Unix LF (`\n`) -- causes `/usr/bin/env: 'node\r': No such file or directory`
3. pnpm dlx resolves bins differently than npx -- if the package name does not match the bin key, pnpm throws an error

**Consequences:** Zero users can install on their first attempt. First impressions are fatal for CLI tools.

**Prevention:**
- Verify shebang is exactly `#!/usr/bin/env node` with LF line ending (current install.js looks correct)
- Ensure the bin key in package.json (`"taketomarket"`) matches the package name (`"taketomarket"`) -- this is already correct
- Test with all three package managers: `npx taketomarket`, `pnpm dlx taketomarket`, `yarn dlx taketomarket`
- Add `.gitattributes` with `install.js text eol=lf` to prevent CRLF corruption

**Detection:** `file install.js` should show "ASCII text" not "ASCII text, with CRLF line terminators".

---

### Pitfall 4: Package Name Already Taken or Squatted

**What goes wrong:** `npm publish` fails with `403 Forbidden` because the name `taketomarket` is already registered by someone else, or npm's spam detection flags it.

**Why it happens:** Unscoped package names are global. Common compound words get squatted. There is no reservation system -- first publisher wins.

**Consequences:** Forces a last-minute name change (scoped `@taketomarket/cli` or alternate name), breaking all documentation, README install commands, and the project identity.

**Prevention:**
- Check RIGHT NOW: `npm view taketomarket` -- if it returns 404, the name is available
- Consider registering the name immediately with a placeholder publish (`npm publish --access public` at 0.0.1)
- Have a fallback: `@taketomarket/core` (scoped, guaranteed available if you create the org)
- Scoped packages are free to publish as public since 2019

**Detection:** `npm view taketomarket` returns package info = taken. Returns E404 = available.

---

## Moderate Pitfalls

### Pitfall 5: 2FA Blocks Automated/First Publish

**What goes wrong:** Running `npm publish` from terminal prompts for OTP (one-time password). If you haven't set up 2FA on your npm account, publish may fail. If you HAVE 2FA, you need to provide OTP interactively.

**Prevention:**
- Set up 2FA on npm account BEFORE publish day
- For interactive first publish: have authenticator app ready, pass OTP via `--otp=123456`
- For future CI automation: create a granular access token with "Bypass 2FA" enabled, scoped to only the `taketomarket` package
- Do NOT disable 2FA -- it's required for all new packages as of 2024

---

### Pitfall 6: Missing package.json Metadata Causes Registry Rejection or Poor Discovery

**What goes wrong:** npm publish succeeds but the package page on npmjs.com shows no description, no repository link, no homepage. Or worse: missing `"repository"` field means npm cannot link to GitHub, reducing trust.

**Prevention:** Add before publish:
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/[owner]/taketomarket.git"
  },
  "homepage": "https://github.com/[owner]/taketomarket#readme",
  "bugs": {
    "url": "https://github.com/[owner]/taketomarket/issues"
  },
  "author": "[name] <[email]>"
}
```

**Detection:** After publish, check https://www.npmjs.com/package/taketomarket -- all metadata should render.

---

### Pitfall 7: pnpm dlx Compatibility Differences

**What goes wrong:** `npx taketomarket` works but `pnpm dlx taketomarket` fails with cryptic errors. pnpm resolves bins differently and has stricter validation.

**Prevention:**
- bin field key MUST match package name for pnpm dlx to auto-select it (already correct: `"taketomarket": "./install.js"`)
- pnpm does NOT auto-install peer dependencies -- irrelevant for this package (zero deps) but worth knowing
- pnpm caches more aggressively -- test with `pnpm dlx --force taketomarket` after updates
- pnpm 11+ changed global bin location -- test in clean environment

**Detection:** Test `pnpm dlx taketomarket` in a directory with no existing node_modules.

---

### Pitfall 8: Git Tag / npm Version Mismatch

**What goes wrong:** You publish 0.1.0 to npm but the git tag `v0.1.0` points to a different commit, or doesn't exist at all. Future debugging becomes impossible -- which code is actually in the published package?

**Prevention:**
- Use `npm version patch/minor/major` which auto-creates git tag + bumps package.json in one atomic operation
- OR manually: bump package.json, commit, `git tag v0.1.0`, then `npm publish`
- Never publish from uncommitted or untagged state
- Add `"prepublishOnly": "git diff --exit-code"` to block publishing with uncommitted changes

**Detection:** `git tag` should show a tag matching every published npm version.

---

## Minor Pitfalls

### Pitfall 9: README Not Rendered on npm

**What goes wrong:** npm uses the README.md from the package root at publish time. If README is missing from the `"files"` whitelist, the npm page shows "no README found."

**Prevention:** README.md, package.json, and LICENSE are ALWAYS included regardless of `"files"` field (npm hardcodes these). No action needed -- but verify with `npm pack --dry-run` that README.md appears.

---

### Pitfall 10: LICENSE File Missing

**What goes wrong:** package.json says `"license": "MIT"` but there's no LICENSE file in the repo. npm shows a warning, and corporate users may skip your package due to unclear licensing.

**Prevention:** Ensure a LICENSE file exists at repo root. npm always includes it regardless of `"files"` field.

**Detection:** `ls LICENSE` or `ls LICENSE.md` should find the file.

---

### Pitfall 11: Publishing from Wrong Branch or Dirty State

**What goes wrong:** You publish from a feature branch with half-finished code, or with local uncommitted changes that won't match what users see on GitHub.

**Prevention:**
- Publish only from `main` branch
- Add check: `"prepublishOnly": "[ $(git rev-parse --abbrev-ref HEAD) = main ] && git diff --exit-code"`
- Consider a publish checklist in the milestone plan

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Package.json metadata prep | Missing repository/homepage/author fields (#6) | Add all metadata fields before first publish |
| .npmignore creation | .npmignore replaces .gitignore logic (#1) | Use `"files"` whitelist as primary, .npmignore as backup only |
| Name availability check | Name squatted (#4) | Run `npm view taketomarket` immediately, reserve if available |
| First publish attempt | 2FA prompt blocks publish (#5) | Set up 2FA + authenticator before publish day |
| Post-publish verification | Broken install discovered too late (#2) | Always publish 0.x first, test install, then 1.0 |
| pnpm compatibility testing | Different bin resolution (#7) | Test npx AND pnpm dlx AND yarn dlx in clean directories |
| Version tagging | Git/npm version mismatch (#8) | Use `npm version` command for atomic bump+tag |
| Cross-platform testing | CRLF shebang corruption (#3) | Add .gitattributes, test on Linux/Mac |

## Immediate Actions (Before Any Other Milestone Work)

1. **Check name availability:** `npm view taketomarket` -- do this TODAY
2. **Verify files field:** Run `npm pack --dry-run` and confirm only intended files appear
3. **Confirm install.js shebang:** Must be `#!/usr/bin/env node` with LF endings
4. **Check LICENSE exists:** Required for MIT claim in package.json
5. **Set up npm 2FA:** If not already configured on the npm account

## Sources

- [npm Blog: Publishing what you mean to publish](https://blog.npmjs.org/post/165769683050/publishing-what-you-mean-to-publish.html) -- Definitive guide on files/ignores interaction
- [npm Files & Ignores Wiki](https://github.com/npm/cli/wiki/Files-&-Ignores) -- Official rules for what gets included
- [npm Unpublish Policy](https://docs.npmjs.com/policies/unpublish/) -- 24-hour rule, version reuse prohibition
- [npm 2FA Requirements](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/) -- Current 2FA enforcement
- [npm Scope Documentation](https://docs.npmjs.com/about-scopes/) -- Scoped vs unscoped tradeoffs
- [pnpm dlx Documentation](https://pnpm.io/cli/pnx) -- How pnpm resolves bins differently
- [Jeff D.: "For the love of god, don't use .npmignore"](https://medium.com/@jdxcode/for-the-love-of-god-dont-use-npmignore-f93c08909d8d) -- Why files whitelist is superior
- [Automatic npm publishing with granular tokens](https://httptoolkit.com/blog/automatic-npm-publish-gha/) -- CI/CD token setup
