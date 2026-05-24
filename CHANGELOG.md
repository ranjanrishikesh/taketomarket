# Changelog

## 2.3.2 - 2026-05-24

Patch release. Marketplace schema fix + plugin manifest polish. No skill, workflow, or bin/ changes.

### Fixed
- `.claude-plugin/marketplace.json` — restructured to match Claude Code marketplace schema (`owner` object + `plugins[]` array). Previous form was missing required fields and failed `/plugin marketplace add` with `InvalidSchema`. Plugin metadata (description, version, license, keywords) is now nested inside `plugins[0]` where the schema expects it.

### Changed
- `.claude-plugin/plugin.json` — added `displayName`, `homepage`, `repository`. Author field now resolves to "Rishikesh Ranjan" + GitHub URL (was previously the brand string, which conflicts with the marketplace `owner` convention).

### Added
- `AGENTS.md` — Codex-compatible instruction file alongside `CLAUDE.md` for dual-runtime support.

## 2.3.1 - 2026-05-20

Patch release. Docs + manifest hygiene only — no skill, agent, workflow, or bin/ changes. Plugin install + npm install paths both compatible.

### Added
- `references/landing-page-headline-examples.md` — 20 category-tagged clear-vs-clever H1 pairs (SaaS buzzword / FinTech sophistication / DevTools jargon / UX engineering-speak), each annotated with the DISC gates demonstrated (LANDING-PAGES-01..04 + POSITIONING-04). Loaded by `ttm-producer` at production time and by `ttm-verify` at gate-evaluation time via @-link from `playbooks/landing-pages.md` and `references/landing-page-anatomy.md`.

### Fixed
- `.claude-plugin/marketplace.json` — bumped to current version and dropped deprecated fields per obra convention.

## 2.3.0 - 2026-05-18 (GA)

The "developerneur-ready" release. Reframes takeToMarket as the marketing OS for engineers + solopreneurs with zero marketing experience.

### Breaking
- State folder renamed `.marketing/` → `.taketomarket/`. Auto-migrated by `/ttm-update` and `/ttm-health`.
- GitHub repo renamed lowercase: `ranjanrishikesh/taketomarket`. Old URL redirects.
- Skill renames (deprecation stubs remain until v2.4.0):
  - `/ttm-research` → `/ttm-discover`
  - `/ttm-email-preflight` → `/ttm-email-check`
  - `/ttm-aeo-check` + `/ttm-keyword-map` + `/ttm-seo-audit` merged into `/ttm-seo` with subcommands.

### Added (9 new skills)
- `/ttm-humanize` — mandatory final-step humanizer on every audience-facing asset.
- `/ttm-landing` — Next.js 15 marketing site scaffold + design + copy.
- `/ttm-pseo` — programmatic SEO route generator (blog/use-case/comparison/alternative).
- `/ttm-deploy` — Vercel deploy with 3-path detection.
- `/ttm-linkedin-post` — manual LinkedIn post generator with author-mimic + history + news.
- `/ttm-playwright-setup` — Playwright MCP install walkthrough.
- `/ttm-101` — marketing fundamentals for engineers.
- `/ttm-request-skill` + `/ttm-improve-skill` — file GitHub issues for new + improved skills.

### Added (PRODUCT-DNA + brand + logo onboarding)
- `/ttm-init` extended: generates `.taketomarket/PRODUCT-DNA.md` (code-scan WHAT + manifesto WHY).
- Brand color flow with WCAG accessibility checks → `.taketomarket/BRAND.md` `## Colors` + `colors.json`.
- Logo flow with SVG-first generation + vision self-review loop (up to 3 rounds) → full asset set under `.taketomarket/brand/`.
- YOLO mode — non-critical questions skipped with defaults; critical questions always asked.

### Added (audience + identity)
- Audience-explicit identity ("Marketing OS for developerneurs and solopreneurs — engineers with zero marketing experience") across README hero, package.json, plugin manifests, CLAUDE.md, GEMINI.md, templates.
- "Who this is for" + "Who this is NOT for" sections in README.

### Added (playbooks)
- Every playbook rewritten under THE industry leader's framework for that topic. 11 existing + 3 new (`landing-pages`, `pseo`, `manifesto`). See `references/playbook-leaders.md` for the leader mapping. Hybrid template: base.md 7-section contract preserved, leader-voiced content fills the sections.

### Added (references)
- 15+ new research-backed reference files: obra/superpowers conventions, brand-color-theory, logo-design-principles, codex-image-gen-research, landing-page-anatomy, pSEO page anatomy + 4 per-template anatomies + 4 per-template content playbooks, linkedin-post-patterns, playwright-mcp-setup, playbook-leaders, inline-education-blurbs, humanizer-patterns.

### Added (bin/lib)
- `legacy-folder.cjs` (P1) — migration helper.
- `codebase-scan.cjs` (P3) — tech-stack + feature-area detection.
- `config.cjs` (P3) — `.taketomarket/CONFIG.md` reader/writer + first-run-seen tracker.
- `svg-render.cjs` (P3) — SVG→PNG conversion via best available tool.
- `site-location.cjs` (P4) — landing path auto-detection.
- `deploy.cjs` (P4) — Vercel deploy path detection.
- `playwright-check.cjs` (P5) — Playwright MCP detection.
- `install-detect.cjs` (P6) — install-method detection (clone vs npm).

### Changed
- All ttm-* skills get standardized next-step footer routing to `/ttm-next`.
- All non-meta ttm-* skills get first-run inline education (one-time per skill, controllable via `inline_education: false` in CONFIG.md).
- `/ttm-produce`, `/ttm-repurpose`, `/ttm-affiliate-kit`, `/ttm-landing`, `/ttm-pseo`, `/ttm-linkedin-post` now mandate `/ttm-humanize` as final step.
- `/ttm-review` + `/ttm-verify` gain landing-specific quality gates (positioning integrity, schema, performance budget via Playwright, mobile responsiveness via Playwright, internal linking, llms.txt).
- `/ttm-ship` calls `/ttm-deploy` for landing/pSEO assets.
- `/ttm-update` detects install method, syncs stale skill files, runs folder migration check.
- `/ttm-health` runs legacy-folder check.

### Repo + identity
- `docs/reviewer-outreach-list.md` — tracking for launch outreach to Maja Voje, Akash Gupta, and the playbook leaders.

### Migration guide
Run `/ttm-update`. It will:
1. Detect legacy `.marketing/` folder + prompt to migrate.
2. Sync stale skill files.
3. Print summary of changes.

If you call `/ttm-research`, `/ttm-email-preflight`, `/ttm-aeo-check`, `/ttm-keyword-map`, or `/ttm-seo-audit`: deprecation stubs auto-route to the new skills. Stubs removed in v2.4.0.

## 2.3.0-rc.5 - 2026-05-18

### Added
- `/ttm-playwright-setup` — install walkthrough for Playwright MCP server + Chrome extension bridge. Detects target runtime (Claude Code / Codex / Cursor), prints runtime-specific install steps, smoke-tests the connection (bounded to 2 retries), marks `.taketomarket/CONFIG.md` on success.
- `/ttm-linkedin-post` — manual LinkedIn post generator. First-run interviews 2-5 author URLs and scrapes them via Playwright MCP to build `.taketomarket/PLAYBOOKS/linkedin-base.md`. Subsequent runs load base + post-history + 7-day news WebSearch, generate 2-3 candidates with varied hooks, then route through `/ttm-humanize` before saving. Tracks history in `.taketomarket/CAMPAIGNS/linkedin/post-history.md`. Flags: `--rebuild-base`, `--no-news`, `--topic <text>`.
- `references/playwright-mcp-setup.md` — install reference (Microsoft `@playwright/mcp@0.0.75` + "Playwright Extension" Chrome bridge + Claude Code / Codex TOML / Cursor configs + 8-mode troubleshooting).
- `references/linkedin-post-patterns.md` — pattern catalog (7 hook patterns, 5 templates incl. PAIPS, 2025-2026 length norms with citations, banned moves with humanizer cross-refs).
- `templates/linkedin-base-template.md` — per-user LinkedIn style-guide skeleton filled on first run.
- `bin/lib/playwright-check.cjs` + tests — detects `mcpServers.playwright` in Claude Code settings JSON.
- `node bin/ttm-tools.cjs playwright-check` subcommand.
- `.taketomarket/CAMPAIGNS/linkedin/` workspace scaffold (drafts/, scrapes/, README).

### Changed
- `workflows/site/quality-gates.md` Gates 3 (performance) + 4 (mobile responsiveness) upgraded from soft documentation to Playwright-driven enforcement. Both skip with WARN when Playwright MCP isn't installed.

### Notes
- Stantly (named in plan as a LinkedIn pattern source) is unfindable as of 2026-05-18 — `references/linkedin-post-patterns.md` documents the audit and substitutes verifiable public creator playbooks (Welsh, Bloom, Schafer, AuthoredUp data).

## 2.3.0-rc.4 - 2026-05-18

### Added
- `/ttm-landing` — Next.js 15 + Tailwind v4 + React 19 marketing site scaffold with brand-token integration, 13-section home page anatomy, optional `/product`, `/pricing`, `/about` generation.
- `/ttm-pseo` — programmatic SEO route generator for blog, use-case, comparison, alternative templates. JSON CMS input. AEO + SEO optimized.
- `/ttm-deploy` — Vercel deploy with auto-detected best path (git-push, Vercel CLI, API token).
- `references/landing-page-anatomy.md` + `references/pseo-page-anatomy.md` + 8 per-template anatomy/playbook files under `references/pseo-templates/`.
- `templates/pseo/*.json` — JSON Schema CMS for each pSEO template.
- `templates/site-scaffold/` — full Next.js 15 starter project template (app/, components/, lib/, public/, content/).
- `bin/lib/site-location.cjs` + `bin/lib/deploy.cjs` (with tests for both).
- `node bin/ttm-tools.cjs site-location|deploy detect` subcommands.
- Landing-specific quality gates (positioning integrity, schema, performance budget, mobile, internal linking, llms.txt) at `workflows/site/quality-gates.md`.

### Changed
- `workflows/lifecycle/review.md` and `workflows/lifecycle/verify.md` gain conditional landing/pSEO gate steps.
- `workflows/lifecycle/ship.md` calls `/ttm-deploy` when landing/pSEO assets are in the campaign.

### Notes
- `shadcn/ui` is referenced in the P4 plan goals but intentionally NOT bundled in the scaffold. Adding `shadcn/ui` requires a separate init step (`npx shadcn@latest init`) that overlays files into the user's project. Users who want it can run that after `/ttm-landing` scaffolds the site. Re-evaluate bundling in P5.

## 2.3.0-rc.3 - 2026-05-18

### Added
- `/ttm-init` now generates `.taketomarket/PRODUCT-DNA.md` (code-scan + manifesto interview).
- Brand color flow with WCAG accessibility checks. Output: `.taketomarket/BRAND.md` `## Colors` section + `.taketomarket/brand/colors.json`.
- Logo flow with SVG-first generation + vision self-review loop (up to 3 rounds). Output: full asset set in `.taketomarket/brand/`.
- YOLO mode (`.taketomarket/CONFIG.md` `yolo: true`) - non-critical onboarding questions skipped with defaults; critical questions always asked.
- `references/brand-color-theory.md`, `references/logo-design-principles.md`, `references/codex-image-gen-research.md`.
- `bin/lib/codebase-scan.cjs`, `bin/lib/config.cjs`, `bin/lib/svg-render.cjs` + tests.
- `node bin/ttm-tools.cjs scan-codebase|config|svg-render` subcommands.

### Changed
- `templates/reference-files/brand.md` extended with `## Colors` + `## Logo` sections.
- `workflows/setup/init-questions.md` - every question tagged `priority: critical | non-critical` for YOLO.
- `workflows/setup/init.md` - inserts PRODUCT-DNA + brand-colors + logo sub-workflows after Section 3 (ICP).
- `workflows/setup/init-validation.md` - adds PRODUCT-DNA, brand-colors, and logo validation rules.

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
