# takeToMarket

[![npm](https://img.shields.io/npm/v/taketomarket)](https://www.npmjs.com/package/taketomarket)

A marketing operating system for Claude Code and Codex. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings.

**Core invariant:** Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall — no asset ships without both, ever.

## What it is / What it isn't

**IS:** A marketing OS that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Persistent state. Compound learnings. Nine-phase lifecycle enforcement.

**IS NOT:** A content generator, one-click blog writer, or social media scheduler. Not a replacement for marketers — it is the operating system a marketer uses to ship more, drift less, and compound learnings. Not a reporting dashboard. Not a scheduler. takeToMarket enforces discipline; it does not generate random content.

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

### Option 2 — Claude Code plugin marketplace

```
/plugin install taketomarket@claude-plugins-official
```

> Status: pending marketplace approval. Check https://github.com/ranjanrishikesh/takeToMarket for current status.

### Option 3 — Direct from GitHub

> Status: pending verification. Use Option 1 or Option 4 in the meantime.

### Option 4 — Manual (advanced)

```bash
git clone https://github.com/ranjanrishikesh/takeToMarket
cd takeToMarket
node install.js
```

## Quick Start

```
/taketomarket:ttm-init             # set up workspace (one time)
/taketomarket:ttm-new-campaign     # create first campaign
/taketomarket:ttm-produce          # run production wave
```

## Campaign Lifecycle

1. **Init** — set up workspace and reference files
2. **New Campaign** — create campaign directory with initialized state
3. **Research** — discover market, audience, and ambient narrative
4. **Brief** — generate brief with mandatory outcome metrics
5. **Produce** — generate assets in isolated contexts with full reference loading
6. **Review** — human quality evaluation with structured checklist
7. **Fix** — root cause analysis, re-produce, re-verify (capped 3×)
8. **Verify** — quality gate wall check across all assets
9. **Ship** — launch checklist confirming tracking, UTMs, funnel testing
10. **Measure** — analytics vs outcome metrics with attribution models
11. **Learn** — extract lessons, propose reference file edits, log to LEARNINGS.md

## Command Reference

| Command | Description |
|---------|-------------|
| `/taketomarket:ttm-aeo-check` | Check citation status across AI engines for a query |
| `/taketomarket:ttm-affiliate-kit` | Generate creative kit for affiliate partners |
| `/taketomarket:ttm-archive` | Archive a completed campaign, finalize state, and update LEARNINGS.md |
| `/taketomarket:ttm-brand-refresh` | Update BRAND.md with new proof points and deprecate expired ones |
| `/taketomarket:ttm-brief` | Generate a campaign brief with mandatory outcome metrics, positioning anchor, and channel mix |
| `/taketomarket:ttm-competitor-scan` | On-demand competitor analysis that updates COMPETITORS.md |
| `/taketomarket:ttm-email-preflight` | Deliverability, dark-mode, and spam-trigger scan for email assets |
| `/taketomarket:ttm-fix` | Fix phase: root cause analysis, fix brief, re-produce, re-verify (capped 3×) |
| `/taketomarket:ttm-health` | Validate .marketing/ directory integrity, reference file completeness, and state consistency |
| `/taketomarket:ttm-icp-refresh` | Update ICP.md from new customer data including calls, reviews, and feedback |
| `/taketomarket:ttm-init` | Interview-driven onboarding that generates all .marketing/ reference files |
| `/taketomarket:ttm-keyword-map` | Generate keyword cluster map with intent tags |
| `/taketomarket:ttm-learn` | Extract lessons from campaign data, propose reference file edits, log to LEARNINGS.md |
| `/taketomarket:ttm-measure` | Analyze campaign analytics against outcome metrics using attribution models |
| `/taketomarket:ttm-new-campaign` | Create a new campaign directory with initialized state and reference file links |
| `/taketomarket:ttm-next` | Guide user to the right next command based on current campaign state |
| `/taketomarket:ttm-positioning-check` | Sample recent assets and report positioning drift percentage and analysis |
| `/taketomarket:ttm-positioning-shift` | Controlled positioning change with reasoning, migration plan, and approval gate |
| `/taketomarket:ttm-produce` | Generate content assets in fresh contexts loaded with brief, positioning, brand, ICP, and playbook |
| `/taketomarket:ttm-repurpose` | Fan out a long-form asset into derivatives across channels with full brief-produce-verify per derivative |
| `/taketomarket:ttm-research` | Market and audience research including SERP, competitor content, and narrative mapping |
| `/taketomarket:ttm-resume` | Resume a paused campaign at its last completed phase |
| `/taketomarket:ttm-review` | Present assets with structured review checklist for human evaluation |
| `/taketomarket:ttm-seo-audit` | Technical and content SEO audit of a URL or sitemap |
| `/taketomarket:ttm-ship` | Generate launch checklist confirming tracking, UTMs, funnel testing, and asset finalization |
| `/taketomarket:ttm-state` | Display current campaign states, decisions in flight, blockers, and experiments |
| `/taketomarket:ttm-verify` | Run all applicable quality gates on every asset with pass/fail report and line-level feedback |

## Verify Installation

Inside Claude Code, run:
```
/taketomarket:ttm-health
```

This validates directory integrity, reference file presence, and state consistency.

## License

MIT — see [LICENSE](LICENSE).
