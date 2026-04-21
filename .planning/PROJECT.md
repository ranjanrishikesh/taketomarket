# takeToMarket

## What This Is

An open-source Claude Code / Codex skill that brings GSD-style spec-driven development to marketing. takeToMarket is a marketing operating system — not a content generator — that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Users install it into their Claude Code or Codex environment and run marketing campaigns through a 9-phase lifecycle with persistent state, compound learnings, and automated verification.

## Core Value

Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall — no asset ships without both, ever.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Interview-driven onboarding (`/ttm-init`) that generates all reference files (POSITIONING.md, BRAND.md, ICP.md, CHANNELS.md, STATE.md, CALENDAR.md, COMPETITORS.md, METRICS.md, LEARNINGS.md) from structured questioning
- [ ] 9-phase campaign lifecycle: Discover → Brief → Produce → Verify → Review → Fix → Ship → Measure → Learn
- [ ] Slash commands for each phase (`/ttm-new-campaign`, `/ttm-research`, `/ttm-brief`, `/ttm-produce`, `/ttm-verify`, `/ttm-review`, `/ttm-fix`, `/ttm-ship`, `/ttm-measure`, `/ttm-learn`)
- [ ] Positioning-as-invariant enforcement — `POSITIONING.md` loaded into every phase, drift detected and flagged
- [ ] Positioning shift workflow (`/ttm-positioning-shift`) requiring explicit reasoning, migration plan, and human approval
- [ ] Outcome-over-output enforcement — every asset requires both output metric and outcome metric before shipping
- [ ] Quality gate wall in Verify phase with pass/fail per gate per asset
- [ ] Base quality gates: positioning drift, claim accuracy, voice drift, outcome alignment, funnel integrity, UTM hygiene, compliance, competitor collision, ICP fit, format correctness
- [ ] Fix-as-you-go: root cause → fix brief → re-produce → re-verify (capped at 3 attempts)
- [ ] Discipline-specific playbooks (SEO, AEO, YouTube, LinkedIn, Social, Email, Paid Ads, Affiliate, PR/Media, Events)
- [ ] Discipline-specific quality gates per playbook
- [ ] Campaign state persistence in `CAMPAIGNS/<slug>/` directories across sessions
- [ ] Reference file management commands (`/ttm-positioning-check`, `/ttm-brand-refresh`, `/ttm-icp-refresh`, `/ttm-competitor-scan`)
- [ ] Discipline quick-action commands (`/ttm-seo-audit`, `/ttm-aeo-check`, `/ttm-keyword-map`, `/ttm-email-preflight`, `/ttm-affiliate-kit`, `/ttm-repurpose`)
- [ ] State and recovery commands (`/ttm-state`, `/ttm-resume`, `/ttm-archive`, `/ttm-health`)
- [ ] Manual measurement phase — user pastes analytics data, takeToMarket analyzes against outcome metrics with 3 attribution models
- [ ] Learn phase that extracts lessons and proposes edits to reference files with human approval gates
- [ ] `LEARNINGS.md` root-cause taxonomy and pattern extraction
- [ ] Meta-gates: portfolio balance, calendar collision, theme consistency, learning plan
- [ ] Monthly positioning audit sampling recent assets
- [ ] GSD-inspired prompt engineering — wave-parallel production in fresh contexts, atomic tasks, state persistence
- [ ] Dual distribution: git clone (copy skill folder) + npm package
- [ ] Solo-user workflow (no concurrency handling)
- [ ] Content repurposing pipeline (`/ttm-repurpose`) — long-form → derivatives across channels
- [ ] `.marketing/` directory structure mirroring GSD's `.planning/`
- [ ] Deviation reports with 3 options: Correct, Accept+log, Escalate to positioning shift

### Out of Scope

- Team/concurrent edit support — deferred to V2 milestone
- MCP integrations for analytics (GA, GSC, HubSpot, etc.) — deferred to V2, manual paste for now
- Automated competitor scan (weekly cron) — V2
- AEO citation tracker (crawl queries across AI engines) — V2
- Design tool integration for final creative assets — V2
- Scheduling/publishing integration (Buffer, Notion, Ghost, etc.) — takeToMarket briefs + produces + verifies, hands off to existing tools
- Analytics dashboard — writes reports, does not replace analytics stack
- Real-time collaboration features — solo-first design

## Context

- **Architecture model:** This is a Claude Code / Codex skill, not a standalone app. It's a collection of skill files, templates, workflows, and prompt-engineered instructions that install into the user's AI coding assistant environment.
- **Inspiration:** GSD (Get Shit Done) by TÂCHES / Lex Christopherson — 31K+ stars. takeToMarket ports GSD's meta-prompting architecture (phases, state files, slash commands, wave-parallel execution, quality gates) from software development to marketing.
- **Key design decisions from idea.md:** Positioning is the invariant (read-only during campaigns). Outcome > output (measure phase reports outcome first). Fix ≠ retry (root cause → specific rewrite brief → isolated context). Failed-fix loops capped at 3.
- **Distribution:** Both git clone (users copy skill folder into `.claude/skills/` or `.codex/`) and npm package for convenience.
- **Onboarding:** Interview-driven `/ttm-init` that asks structured questions and generates reference files, rather than requiring users to fill templates manually.

## Constraints

- **Platform**: Must work as a Claude Code skill AND Codex skill — skill format must be compatible with both runtimes
- **Context window**: Production in Produce phase uses fresh 200K-token contexts per wave, loaded with brief + positioning + brand + ICP + playbook
- **No external dependencies for MVP**: The skill itself should not require external services — analytics data is pasted in manually
- **State persistence**: All state lives in `.marketing/` directory files — no database, no external storage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: takeToMarket | User preference — clear, action-oriented, descriptive | — Pending |
| Interview-driven onboarding over templates | Lower barrier to entry for first-time users; templates available for power users | — Pending |
| Solo-first, team later | Reduces complexity for MVP; team features (locks, concurrent edits) deferred to V2 | — Pending |
| Manual measurement before MCP | Avoids external dependency in MVP; users paste data from their existing analytics | — Pending |
| Dual distribution (git + npm) | Git clone for hackers, npm for convenience — reaches both audiences | — Pending |
| GSD-inspired prompt engineering | Proven architecture at 31K+ stars; wave-parallel execution, atomic tasks, state persistence | — Pending |
| Positioning as invariant | #1 failure mode in real marketing teams is incremental dilution; this is the core design principle | — Pending |
| Command prefix: `/ttm-*` | TTM = takeToMarket; short, memorable, consistent with GSD's `/gsd-*` pattern | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-21 after initialization*
