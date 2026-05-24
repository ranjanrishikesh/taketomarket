# taketomarket

[![npm](https://img.shields.io/npm/v/taketomarket)](https://www.npmjs.com/package/taketomarket)
[![GitHub stars](https://img.shields.io/github/stars/ranjanrishikesh/taketomarket?style=social)](https://github.com/ranjanrishikesh/taketomarket)

**Marketing OS for developerneurs and solopreneurs.** Built for engineers shipping products with zero marketing experience required.

taketomarket is a Claude Code / Codex skill set that brings spec-driven development to marketing. Every campaign, asset, and channel is a spec-driven unit with a verifiable outcome metric and a positioning-invariant quality gate wall.

**Core invariant:** Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall — no asset ships without both, ever.

## Who this is for

- **Developerneurs** — engineers building and shipping their own products.
- **Solopreneurs with engineering backgrounds** — founders who code their MVP themselves.
- **Indie hackers** — anyone shipping a product who has zero or near-zero marketing/growth experience.

If you can write code but have never built a landing page, written a positioning statement, or thought about ICPs — taketomarket gives you the operating system. The AI does the marketing work; you stay in control of the decisions.

## Who this is NOT for

- Full-time marketers who already have a stack — taketomarket overlaps with what you already do.
- Agencies serving multiple clients — built for one product per workspace.
- Anyone wanting a one-click blog generator — taketomarket is opinionated, slower, and quality-gated by design.

## What it is / What it isn't

**IS:** A marketing OS that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Persistent state. Compound learnings. Nine-phase lifecycle enforcement.

**IS NOT:** A content generator, one-click blog writer, or social media scheduler. Not a replacement for marketers — it is the operating system a marketer uses to ship more, drift less, and compound learnings. Not a reporting dashboard. Not a scheduler. taketomarket enforces discipline; it does not generate random content.

## Requirements

- Node.js 18+
- Claude Code v1.x+ (or Codex)
- git

## Installation

### Option 1 — npx (recommended)

```bash
npx taketomarket
```

Interactive: asks which tool(s) you use, installs to all selected runtimes in one pass.

Flags:
- `--yes` or `-y` — skip confirmation (for CI/scripts)
- `--check` — show install status without installing
- `--runtime <claude|codex>` — skip interactive prompt, install to one runtime

### Option 2 — Claude Code plugin marketplace (community)

```
/plugin marketplace add anthropics/claude-plugins-community
/plugin install taketomarket@claude-community
```

Published to the community marketplace on 2026-05-14. The community catalog syncs nightly, so newly approved updates may take up to 24h to appear. If install fails, confirm `taketomarket` is listed in the [community catalog](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json).

### Option 3 — Direct from GitHub (Claude Code)

```
/plugin marketplace add ranjanrishikesh/taketomarket
/plugin install taketomarket@taketomarket
```

Installs the latest commit on `main` directly from this repo. Useful for trying unreleased fixes before they reach the community catalog. The `@taketomarket` suffix matches the marketplace name declared in `.claude-plugin/marketplace.json`.

### Option 4 — Manual (advanced)

```bash
git clone https://github.com/ranjanrishikesh/taketomarket
cd taketomarket
node install.js
```

## Quick Start

```
/ttm-init             # set up workspace (one time)
/ttm-new-campaign     # create first campaign
/ttm-produce          # run production wave
```

> **Plugin install users (Options 2 + 3):** commands are namespaced — use `/taketomarket:ttm-init`, `/taketomarket:ttm-new-campaign`, etc. The bare `/ttm-*` form only works when installed via `npx taketomarket` (Option 1) or manually (Option 4) into the standalone skills directory.

## Runtime Notes

Commands vary by tool and install path:

| Runtime | Install path | Invocation (standalone via npx) | Invocation (plugin install) |
|---------|--------------|---------------------------------|----------------------------|
| Claude Code | `~/.claude/skills/` | `/ttm-init` | `/taketomarket:ttm-init` |
| Codex | `~/.codex/skills/` or `~/.agents/skills/` | `$ttm-init` or mention by name | n/a (plugin install is Claude Code only) |
| Cursor | `~/.cursor/skills/` | `/ttm-init` | n/a |
| Windsurf | `~/.codeium/windsurf/skills/` | `@ttm-init` | n/a |
| Gemini CLI | `~/.gemini/skills/` | automatic or `/skills enable` | n/a |

All non-Claude runtimes also support `~/.agents/skills/` as a universal path. Select **option 6** during install to use it.

## Campaign Lifecycle

### Setup (one-time per workspace + per campaign)

- **Init** (`/ttm-init`) — set up workspace and reference files
- **New Campaign** (`/ttm-new-campaign`) — create campaign directory with initialized state

### 9-Phase Lifecycle

1. **Discover** — research market, audience, and ambient narrative
2. **Brief** — generate brief with mandatory outcome metrics
3. **Produce** — generate assets in isolated contexts with full reference loading
4. **Review** — human quality evaluation with structured checklist
5. **Fix** — root cause analysis, re-produce, re-verify (capped 3×)
6. **Verify** — quality gate wall check across all assets
7. **Ship** — launch checklist confirming tracking, UTMs, funnel testing
8. **Measure** — analytics vs outcome metrics with attribution models
9. **Learn** — extract lessons, propose reference file edits, log to LEARNINGS.md

## Command Reference

| Command | Description |
|---------|-------------|
| `/ttm-affiliate-kit` | Generate creative kit for affiliate partners |
| `/ttm-archive` | Archive a completed campaign, finalize state, and update LEARNINGS.md |
| `/ttm-brand-refresh` | Update BRAND.md with new proof points and deprecate expired ones |
| `/ttm-brief` | Generate a campaign brief with mandatory outcome metrics, positioning anchor, and channel mix |
| `/ttm-competitor-scan` | On-demand competitor analysis that updates COMPETITORS.md |
| `/ttm-deploy` | Vercel deploy with auto-detected best path (git-push, Vercel CLI, API token) |
| `/ttm-discover` | Discover phase: SERP analysis, competitor content audit, ambient narrative mapping (renamed from `/ttm-research`) |
| `/ttm-email-check` | Deliverability, dark-mode, and spam-trigger check for email assets (renamed from `/ttm-email-preflight`) |
| `/ttm-fix` | Fix phase: root cause analysis, fix brief, re-produce, re-verify (capped 3×) |
| `/ttm-health` | Validate .taketomarket/ directory integrity, reference file completeness, and state consistency |
| `/ttm-humanize` [MANDATORY] | Mandatory final-step humanizer for every audience-facing asset. Runnable ad-hoc. |
| `/ttm-icp-refresh` | Update ICP.md from new customer data including calls, reviews, and feedback |
| `/ttm-init` | Interview-driven onboarding that generates all .taketomarket/ reference files |
| `/ttm-landing` | Next.js 15 + Tailwind v4 + React 19 marketing site scaffold with brand-token integration |
| `/ttm-learn` | Extract lessons from campaign data, propose reference file edits, log to LEARNINGS.md |
| `/ttm-linkedin-post` | Manual LinkedIn post generator. Author-mimic style + post-history tracking + last-7-day news WebSearch. Final draft passes through `/ttm-humanize` |
| `/ttm-measure` | Analyze campaign analytics against outcome metrics using attribution models |
| `/ttm-new-campaign` | Create a new campaign directory with initialized state and reference file links |
| `/ttm-next` | Guide user to the right next command based on current campaign state |
| `/ttm-playwright-setup` | Install walkthrough for Playwright MCP server + Chrome extension bridge. Run once per machine to unlock author scraping, competitor render, and Lighthouse/visual gates |
| `/ttm-positioning-check` | Sample recent assets and report positioning drift percentage and analysis |
| `/ttm-positioning-shift` | Controlled positioning change with reasoning, migration plan, and approval gate |
| `/ttm-produce` | Generate content assets in fresh contexts loaded with brief, positioning, brand, ICP, and playbook |
| `/ttm-pseo` | Programmatic SEO route generator for blog, use-case, comparison, alternative templates. JSON CMS input. AEO + SEO optimized |
| `/ttm-repurpose` | Fan out a long-form asset into derivatives across channels with full brief-produce-verify per derivative |
| `/ttm-resume` | Resume a paused campaign at its last completed phase |
| `/ttm-review` | Present assets with structured review checklist for human evaluation |
| `/ttm-seo audit\|keyword-map\|aeo` | Unified SEO + AEO toolkit with three subcommands (merged from `/ttm-aeo-check`, `/ttm-keyword-map`, `/ttm-seo-audit`) |
| `/ttm-ship` | Generate launch checklist confirming tracking, UTMs, funnel testing, and asset finalization |
| `/ttm-state` | Display current campaign states, decisions in flight, blockers, and experiments |
| `/ttm-verify` | Run all applicable quality gates on every asset with pass/fail report and line-level feedback |

**[MANDATORY]** `/ttm-humanize` runs automatically as the final step of every producing skill (`/ttm-produce`, `/ttm-repurpose`, `/ttm-affiliate-kit`). It can also be invoked ad-hoc to humanize existing copy.

## Verify Installation

Inside Claude Code, run:
```
/ttm-health
```

This validates directory integrity, reference file presence, and state consistency.

## License

MIT — see [LICENSE](LICENSE).

## Privacy & Security

taketomarket runs entirely on your local filesystem. No data collection, no telemetry, no servers. See [SECURITY.md](SECURITY.md) for the combined privacy and security policy.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
