# takeToMarket

Marketing operating system for Claude Code and Codex. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings.

Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall -- no asset ships without both, ever.

## Installation

```bash
git clone https://github.com/takeToMarket/takeToMarket.git
cd takeToMarket
```

Then install as a Claude Code plugin:

```
/plugin install /path/to/takeToMarket
```

Or copy the skill directories into your project:

```bash
cp -r takeToMarket/skills/ .claude/skills/
```

## Quick Start

Run `/ttm-init` to begin. This interview-driven onboarding generates all reference files in your `.marketing/` directory:

- `POSITIONING.md` -- Your positioning invariant (read-only during campaigns)
- `BRAND.md` -- Voice, tone, proof points
- `ICP.md` -- Ideal customer profiles
- `CHANNELS.md` -- Channel strategy and constraints
- And more: `STATE.md`, `CALENDAR.md`, `COMPETITORS.md`, `METRICS.md`, `LEARNINGS.md`

## Commands

### Setup

| Command | Description |
|---------|-------------|
| `/ttm-init` | Interview-driven onboarding that generates all .marketing/ reference files |
| `/ttm-new-campaign` | Create a new campaign directory with initialized state |

### Campaign Lifecycle

| Command | Description |
|---------|-------------|
| `/ttm-research` | Discover phase: market/audience research, SERP analysis, competitor content |
| `/ttm-brief` | Generate campaign brief with outcome metrics, positioning anchor, channel mix |
| `/ttm-produce` | Produce content assets in fresh contexts with full reference loading |
| `/ttm-verify` | Run quality gates on every asset with pass/fail report |
| `/ttm-review` | Present assets with structured review checklist for human evaluation |
| `/ttm-fix` | Root cause analysis, fix brief, re-produce, re-verify (3-attempt cap) |
| `/ttm-ship` | Generate launch checklist with tracking, UTMs, funnel testing |
| `/ttm-measure` | Analyze pasted analytics against outcome metrics |
| `/ttm-learn` | Extract lessons, propose reference file edits, log root-cause entries |

### Utility

| Command | Description |
|---------|-------------|
| `/ttm-state` | Display campaign states, decisions in flight, blockers |
| `/ttm-resume` | Resume a paused campaign at its last completed phase |
| `/ttm-health` | Validate .marketing/ directory integrity and state consistency |
| `/ttm-archive` | Archive a completed campaign and finalize state |
| `/ttm-next` | Guide to the right next command based on current state |

### Reference Management

| Command | Description |
|---------|-------------|
| `/ttm-positioning-check` | Sample recent assets and report positioning drift |
| `/ttm-positioning-shift` | Controlled positioning change with migration plan and approval gate |
| `/ttm-brand-refresh` | Update BRAND.md with new proof points |
| `/ttm-icp-refresh` | Update ICP.md from new customer data |
| `/ttm-competitor-scan` | On-demand competitor analysis |

### Discipline Tools

| Command | Description |
|---------|-------------|
| `/ttm-seo-audit` | Technical and content SEO audit |
| `/ttm-aeo-check` | Check citation status across AI engines |
| `/ttm-keyword-map` | Generate keyword cluster map with intent tags |
| `/ttm-email-preflight` | Deliverability, dark-mode, and spam-trigger scan |
| `/ttm-affiliate-kit` | Generate creative kit for affiliate partners |
| `/ttm-repurpose` | Fan out long-form asset into derivatives across channels |

## How It Works

takeToMarket treats marketing like software engineering:

1. **Positioning is the invariant** -- loaded into every phase, drift detected and flagged
2. **Outcome over output** -- every asset requires both output and outcome metrics
3. **Quality gate wall** -- no asset ships without passing all applicable gates
4. **Fix is not retry** -- root cause analysis leads to specific rewrite briefs
5. **Compound learnings** -- every campaign feeds back into reference files

## License

MIT
