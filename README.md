# takeToMarket

A marketing operating system for Claude Code and Codex. Spec-driven campaigns with positioning-as-invariant enforcement, quality gate walls, and compound learnings.

takeToMarket is not a content generator -- it is a marketing operating system that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Install it into your Claude Code or Codex environment and run marketing campaigns through a 9-phase lifecycle with persistent state, compound learnings, and automated verification.

**Core invariant:** Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall -- no asset ships without both, ever.

## Installation

### Via npm (recommended)

```bash
npx taketomarket
```

The installer detects your runtime automatically (Claude Code or Codex) by checking for `~/.claude/` or `~/.codex/` directories.

Override detection with an explicit flag:

```bash
npx taketomarket --runtime codex
```

Validate the package without writing files:

```bash
npx taketomarket --dry-run
```

After installation, the installer runs structural validation and prints a pass/fail report for each component (directories, plugin.json, SKILL.md files). If all checks pass, you are ready to go.

### Via git clone

```bash
git clone https://github.com/ranjanrishikesh/takeToMarket.git
cd taketomarket
```

Then copy each component into the Claude Code plugin directory:

```bash
mkdir -p ~/.claude/plugins/taketomarket
cp -r .claude-plugin ~/.claude/plugins/taketomarket/.claude-plugin
cp -r skills ~/.claude/plugins/taketomarket/skills
cp -r workflows ~/.claude/plugins/taketomarket/workflows
cp -r templates ~/.claude/plugins/taketomarket/templates
cp -r references ~/.claude/plugins/taketomarket/references
cp -r playbooks ~/.claude/plugins/taketomarket/playbooks
cp -r gates ~/.claude/plugins/taketomarket/gates
cp -r bin ~/.claude/plugins/taketomarket/bin
cp settings.json ~/.claude/plugins/taketomarket/
```

For Codex, replace `~/.claude/` with `~/.codex/` in the paths above.

### Verify Installation

Run `/ttm-health` inside Claude Code to confirm the setup. It validates directory integrity, reference file presence, and state consistency.

## Quick Start

Once installed, run these commands inside Claude Code (or Codex) to execute your first campaign:

1. **Initialize your workspace:** `/ttm-init`
   Guided interview about your product, brand, audience, channels, competitors, and metrics. Generates all reference files in `.marketing/`.

2. **Create a campaign:** `/ttm-new-campaign spring-launch`
   Creates `.marketing/CAMPAIGNS/spring-launch/` with initialized state and reference file links.

3. **Research the market:** `/ttm-research spring-launch`
   Market/audience research with SERP analysis, competitor content mapping, and ambient narrative capture. Supports web search MCP tools or manual paste.

4. **Write the brief:** `/ttm-brief spring-launch`
   Generates a campaign brief with mandatory outcome metrics, positioning anchor, hook, proof points, channel mix, and asset list. Refuses to proceed without both output and outcome metrics.

5. **Produce content:** `/ttm-produce spring-launch`
   Generates each asset in a fresh isolated context loaded with brief + positioning + brand + ICP + playbook. Hero asset first, then derivatives in wave-parallel.

6. **Verify quality:** `/ttm-verify spring-launch`
   Runs every asset through the 10-gate quality wall in a separate context from production (preventing self-evaluation bias). Outputs pass/fail per gate with line-level feedback.

7. **Human review:** `/ttm-review spring-launch`
   Presents assets with a structured checklist covering positioning reinforcement, outcome realism, claim substantiation, and competitor differentiation.

8. **Fix failures:** `/ttm-fix spring-launch`
   Root cause analysis, fix brief with preservation constraints, re-production in isolated context, re-verification. Capped at 3 attempts per asset before escalating to human review.

9. **Ship it:** `/ttm-ship spring-launch`
   Launch checklist with tracking confirmed, UTMs verified, funnel tested, assets finalized. Items tagged [AI] auto-check; items tagged [HUMAN] require confirmation.

10. **Measure outcomes:** `/ttm-measure spring-launch`
    Paste analytics data (or use MCP tools). Analysis against outcome metrics using last-touch, linear, and time-decay attribution models. Outcome reported first.

11. **Extract learnings:** `/ttm-learn spring-launch`
    Lessons extracted with proposed reference file edits (each requiring human approval). Root-cause taxonomy entries and winning patterns logged to LEARNINGS.md for future campaigns.

## How It Works

takeToMarket implements a 9-phase campaign lifecycle. Each phase has a dedicated command, persistent state tracking, and explicit entry/exit criteria.

```
  /ttm-init (one-time workspace setup)
       |
       v
  /ttm-new-campaign <slug>
       |
       v
  [1. DISCOVER] -----> /ttm-research <slug>
       |                  Market research, SERP analysis,
       |                  competitor content, ambient narrative
       v
  [2. BRIEF] --------> /ttm-brief <slug>
       |                  Outcome metrics, positioning anchor,
       |                  hook, proof points, channel mix
       v
  [3. PRODUCE] ------> /ttm-produce <slug>
       |                  Fresh context per asset, hero-first,
       |                  wave-parallel execution, playbook-loaded
       v
  [4. VERIFY] -------> /ttm-verify <slug>
       |                  10-gate quality wall, separate context,
       |                  line-level feedback, deviation options
       v
  [5. REVIEW] -------> /ttm-review <slug>
       |                  Structured human checklist, per-asset
       |                  approve/reject/revise decisions
       v
  [6. FIX] ----------> /ttm-fix <slug>   (if needed)
       |                  Root-cause analysis, 3-attempt cap,
       |                  preservation constraints, auto-escalate
       v
  [7. SHIP] ---------> /ttm-ship <slug>
       |                  Launch checklist, tracking confirmed,
       |                  UTMs verified, funnel tested
       v
  [8. MEASURE] ------> /ttm-measure <slug>
       |                  Paste analytics, 3 attribution models,
       |                  outcome-first reporting
       v
  [9. LEARN] --------> /ttm-learn <slug>
                         Lessons extracted, reference files
                         updated, patterns logged to LEARNINGS.md
```

### Five Principles

1. **Positioning is the invariant.** POSITIONING.md loads into every phase context. It is read-only during campaigns. Drift is detected and flagged. Changing positioning requires an explicit shift workflow with migration planning and human approval.

2. **Outcome over output.** Every campaign brief requires both an output metric (what gets published) and an outcome metric (what business result is expected). Measure phase reports outcome first.

3. **Quality gate wall.** No asset ships without passing all applicable gates. Tier 1 gates (positioning drift, claim accuracy, outcome alignment) are blocking. Tier 2 gates are advisory.

4. **Fix is not retry.** When assets fail review, the system performs root cause analysis and generates a specific fix brief with preservation constraints. It does not simply re-run production.

5. **Compound learnings.** Every campaign feeds back into reference files. LEARNINGS.md accumulates root-cause taxonomy entries and winning patterns that load into the Brief phase of future campaigns.

## Command Reference

### Setup

| Command | Description |
|---------|-------------|
| `/ttm-init` | Interview-driven onboarding that generates all `.marketing/` reference files from structured questioning with specificity validation |
| `/ttm-new-campaign <slug>` | Create a campaign directory with initialized state and reference file links |

### Campaign Lifecycle

| Command | Description |
|---------|-------------|
| `/ttm-research <slug>` | Discover phase: market/audience research, SERP analysis, competitor content mapping, ambient narrative capture |
| `/ttm-brief <slug>` | Generate campaign brief with outcome metric enforcement, positioning anchor, channel mix, and asset list |
| `/ttm-produce <slug>` | Produce content assets in fresh isolated contexts loaded with brief, positioning, brand, ICP, and playbook |
| `/ttm-verify <slug>` | Run all applicable quality gates on every asset with pass/fail report and line-level feedback |
| `/ttm-review <slug>` | Present assets with structured review checklist for human evaluation and per-asset decisions |
| `/ttm-fix <slug>` | Root cause analysis, fix brief, re-produce in isolated context, re-verify (3-attempt cap per asset) |
| `/ttm-ship <slug>` | Launch checklist with tracking, UTM, and funnel verification; items tagged [AI]/[HUMAN] |
| `/ttm-measure <slug>` | Analyze pasted analytics against outcome metrics using last-touch, linear, and time-decay attribution |
| `/ttm-learn <slug>` | Extract lessons, propose reference file edits with human approval, log root-cause taxonomy entries |

### State Management

| Command | Description |
|---------|-------------|
| `/ttm-state` | Dashboard showing campaign states, decisions in flight, blockers, and experiments |
| `/ttm-resume <slug>` | Resume a paused campaign at its last completed phase |
| `/ttm-archive <slug>` | Finalize a completed campaign, move to archive, update LEARNINGS.md |
| `/ttm-health` | Validate `.marketing/` directory integrity, reference file completeness, and state consistency |
| `/ttm-next` | Guidance on the right next command based on current campaign state |

### Positioning

| Command | Description |
|---------|-------------|
| `/ttm-positioning-check` | Drift audit across recent assets with drift percentage, type categorization, and bleeding analysis |
| `/ttm-positioning-shift` | Controlled repositioning with migration plan, deprecation schedule, and human approval gate |

### Reference Management

| Command | Description |
|---------|-------------|
| `/ttm-brand-refresh` | Update BRAND.md proof points and voice guidelines; validates against positioning invariant |
| `/ttm-icp-refresh` | Update ICP.md from new customer data with positioning invariant validation |
| `/ttm-competitor-scan` | On-demand competitor analysis with web search or manual paste |

### Discipline Utilities

| Command | Description |
|---------|-------------|
| `/ttm-seo-audit [url]` | Technical and content SEO audit with actionable report and priority ranking |
| `/ttm-aeo-check [query]` | AI engine citation status check across major AI answer platforms |
| `/ttm-keyword-map` | Keyword cluster map with intent tags (informational, commercial, transactional, navigational) |
| `/ttm-email-preflight` | Deliverability, spam-trigger, and dark-mode rendering scan |
| `/ttm-affiliate-kit` | Generate creative kit for affiliate partners with approved messaging and assets |
| `/ttm-repurpose <asset>` | Fan out a long-form asset into derivatives across channels with full brief-produce-verify per derivative |

**Total: 27 commands** across 6 categories.

## Quality Gate Wall

Every asset passes through 10 base quality gates before shipping. Discipline playbooks add channel-specific gates on top.

### Base Gates

| # | Gate | Tier | Behavior |
|---|------|------|----------|
| 1 | **Positioning Drift** | Tier 1 | Blocking -- asset must align with POSITIONING.md invariant |
| 2 | **Claim Accuracy** | Tier 1 | Blocking -- every claim must have a source or proof point |
| 3 | **Voice Drift** | Tier 2 | Advisory -- flags voice/tone inconsistency with BRAND.md |
| 4 | **Outcome Alignment** | Tier 1 | Blocking -- asset must serve the campaign outcome metric |
| 5 | **Funnel Integrity** | Tier 2 | Advisory -- CTA and funnel step match the campaign stage |
| 6 | **UTM Hygiene** | Tier 2 | Advisory -- all links have valid, consistent UTM parameters |
| 7 | **Compliance** | Tier 2 | Advisory -- legal disclaimers, required disclosures present |
| 8 | **Competitor Collision** | Tier 2 | Advisory -- avoids using competitor claims or positioning |
| 9 | **ICP Fit** | Tier 2 | Advisory -- content addresses the right audience segment |
| 10 | **Format Correctness** | Tier 2 | Advisory -- meets channel-specific format requirements |

### Tier Behavior

- **Tier 1 (blocking):** Asset cannot ship until the gate passes. Failing a Tier 1 gate triggers the fix loop.
- **Tier 2 (advisory):** Flagged for review but does not block shipping. Each failure offers three options: Correct, Accept+log, or Escalate to positioning shift.

### Meta-Gates

Multi-campaign portfolio checks run after per-asset gates:

- **Portfolio Balance** -- channel mix across active campaigns
- **Calendar Collision** -- overlapping launch dates or audience saturation
- **Theme Consistency** -- messaging coherence across concurrent campaigns
- **Learning Plan** -- measurement infrastructure coverage

## Playbooks

10 discipline playbooks extend the base quality gate wall with channel-specific knowledge, format rules, and additional gates:

| Playbook | Focus Areas |
|----------|-------------|
| **SEO** | Title/H1 alignment, search-intent match, schema markup, internal-link density, thin-content detection |
| **AEO** | Quote-worthy sentences, FAQ/HowTo schema, cross-domain fact consistency, AI citation optimization |
| **Email** | Subject/preview spam-trigger scan, dark-mode rendering, unsubscribe presence, deliverability checks |
| **LinkedIn** | Professional tone, opener hooks, native vs link format, engagement optimization |
| **Social** | Platform-specific rules, visual ratios, hashtag strategy, engagement hooks |
| **YouTube** | Thumbnail optimization, retention hooks, chapter markers, description SEO |
| **Paid Ads** | Headline character limits, ad relevance scoring, landing page alignment |
| **Affiliate** | Partner-safe messaging, commission disclosure, creative kit completeness |
| **PR/Media** | News angle clarity, quote-readiness, fact-checking rigor, embargo handling |
| **Events** | Session flow, attendee journey mapping, follow-up sequence planning |

All playbooks inherit from `playbooks/base.md` and extend it with additive gates. The base contract ensures consistent evaluation across disciplines.

## Architecture

```
takeToMarket/
  .claude-plugin/
    plugin.json              Plugin manifest (name, version, description, keywords)

  skills/                    27 SKILL.md command stubs (routing only, <30 lines each)
    ttm-init/SKILL.md
    ttm-new-campaign/SKILL.md
    ttm-research/SKILL.md
    ttm-brief/SKILL.md
    ttm-produce/SKILL.md
    ttm-verify/SKILL.md
    ttm-review/SKILL.md
    ttm-fix/SKILL.md
    ttm-ship/SKILL.md
    ttm-measure/SKILL.md
    ttm-learn/SKILL.md
    ttm-state/SKILL.md
    ttm-resume/SKILL.md
    ttm-archive/SKILL.md
    ttm-health/SKILL.md
    ttm-next/SKILL.md
    ttm-positioning-check/SKILL.md
    ttm-positioning-shift/SKILL.md
    ttm-brand-refresh/SKILL.md
    ttm-icp-refresh/SKILL.md
    ttm-competitor-scan/SKILL.md
    ttm-seo-audit/SKILL.md
    ttm-aeo-check/SKILL.md
    ttm-keyword-map/SKILL.md
    ttm-email-preflight/SKILL.md
    ttm-affiliate-kit/SKILL.md
    ttm-repurpose/SKILL.md

  workflows/
    setup/                   /ttm-init interview workflow
    lifecycle/               Campaign phase workflows (research, brief, produce,
                             verify, review, fix, ship, measure, learn)
    reference-mgmt/          Reference file management (positioning-check,
                             positioning-shift, brand-refresh, icp-refresh,
                             competitor-scan)
    discipline/              Discipline utility workflows (seo-audit, aeo-check,
                             keyword-map, email-preflight, affiliate-kit, repurpose)
    utility/                 State management workflows (state, resume, archive,
                             health, next)

  templates/                 Markdown templates for generated files
    reference-files/         Reference file templates (brand, icp, competitors, etc.)
    campaign-brief.md        Brief template with outcome/output metrics
    production-manifest.json Asset manifest schema

  references/                Domain knowledge and context loading rules
    context-loading.md       Two-tier context loading strategy

  playbooks/                 Discipline playbook files
    base.md                  Base inheritance contract
    seo.md                   SEO discipline playbook
    aeo.md                   AEO discipline playbook
    email.md                 Email discipline playbook
    linkedin.md              LinkedIn discipline playbook
    social.md                Social discipline playbook
    youtube.md               YouTube discipline playbook
    paid-ads.md              Paid Ads discipline playbook
    affiliate.md             Affiliate discipline playbook
    pr-media.md              PR/Media discipline playbook
    events.md                Events discipline playbook

  gates/                     Gate evaluation logic and base gate definitions

  agents/                    Subagent prompt templates (producer, verifier)

  bin/
    ttm-tools.cjs            CLI entry point (single file, subcommand pattern)
    lib/
      campaign.cjs           Campaign state operations, MANIFEST.json management
      health.cjs             Health validation checks
      core.cjs               Core utility functions
      slug.cjs               Slug generation and validation
      state.cjs              State file operations
      drift-log.cjs          Positioning drift logging
      deviation.cjs          Deviation tracking
      commit.cjs             Commit message helpers

  settings.json              Default plugin settings
  install.js                 npm installer entry point
  package.json               npm package config (bin: taketomarket -> install.js)
```

### Key Patterns

**Thin SKILL.md routing.** Each skill file is under 30 lines. It contains YAML frontmatter (name, description, allowed-tools, context mode) and a single instruction to read the corresponding workflow file. This keeps skills lightweight and maintainable.

**500-line file limit.** No single file exceeds 500 lines. Large content is extracted to `@`-referenced files. For example, the review workflow references `review-checklist.md` instead of embedding 400 lines of checklist questions inline.

**Two-tier context loading.** Compact summaries of reference files load into every phase context (positioning summary, brand overview, ICP highlights). Full documents load only during produce and verify phases where deep knowledge matters. This preserves context window budget.

**Positioning-as-invariant.** POSITIONING.md is architecturally read-only during campaigns. The system detects and blocks direct edits. Changing positioning requires the explicit `/ttm-positioning-shift` workflow with migration planning, human approval, and a deprecation schedule.

**Fresh context isolation.** Produce and verify run in forked contexts (`context: fork` in SKILL.md frontmatter). This prevents the producer from evaluating its own output and keeps each asset's context window loaded with only the relevant brief, positioning, brand, ICP, and playbook.

**Zero runtime dependencies.** The skill itself has no npm dependencies. All code in `bin/` uses only Node.js built-in modules (`fs`, `path`, `crypto`, `os`). Node.js 18+ is the only requirement, and it is already required by Claude Code.

### How to Add a Playbook

1. Create a new file in `playbooks/` (e.g., `playbooks/webinar.md`)
2. Follow the structure in `playbooks/base.md` -- extend with additive gates
3. Add a SKILL.md stub in `skills/ttm-webinar-audit/` pointing to a new workflow
4. Add the workflow in `workflows/discipline/webinar-audit.md`
5. Register the channel in the channels template at `templates/reference-files/`

### User's Project Structure (created by /ttm-init)

When a user runs `/ttm-init` in their project, it creates:

```
.marketing/
  POSITIONING.md       Positioning invariant (read-only during campaigns)
  BRAND.md             Voice, tone, proof points
  ICP.md               Ideal customer profiles
  CHANNELS.md          Channel strategy and constraints
  COMPETITORS.md       Competitor landscape
  METRICS.md           KPI definitions and baselines
  CALENDAR.md          Marketing calendar
  STATE.md             Global state tracking
  LEARNINGS.md         Accumulated campaign learnings
  DRIFT-LOG.md         Positioning drift event log
  CAMPAIGNS/
    <slug>/            Per-campaign directory
      STATE.md         Campaign state
      RESEARCH.md      Market research findings
      BRIEF.md         Campaign brief
      MANIFEST.json    Asset manifest and tracking
      assets/          Produced content assets
```

## Dual-Runtime Support

takeToMarket works with both Claude Code and Codex:

- **Claude Code:** Skills install as a plugin at `~/.claude/plugins/taketomarket/`. Commands appear as `/ttm-*` in the Claude Code interface. Uses `AskUserQuestion` for interactive prompts with text-mode fallback.
- **Codex:** Skills install at `~/.codex/plugins/taketomarket/`. An AGENTS.md file provides Codex-compatible instructions alongside CLAUDE.md. Interactive prompts fall back to numbered list format when `AskUserQuestion` is unavailable.

The installer auto-detects the runtime. Both runtimes read the same SKILL.md files and execute the same workflows.

## License

MIT
