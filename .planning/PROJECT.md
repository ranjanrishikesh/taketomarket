# takeToMarket

## What This Is

An open-source Claude Code / Codex skill that brings GSD-style spec-driven development to marketing. takeToMarket is a marketing operating system — not a content generator — that treats every campaign, asset, and channel as a spec-driven unit with a verifiable outcome, a positioning invariant, and a quality gate wall. Users install it into their Claude Code or Codex environment and run marketing campaigns through a 9-phase lifecycle with persistent state, compound learnings, and automated verification.

## Core Value

Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall — no asset ships without both, ever.

## Current State

**v1.0 MVP shipped 2026-05-04** — 11 phases, 42 plans, 314 commits, 17,470 LOC across 125 files in 14 days.

Delivered: Full 9-phase campaign lifecycle (init→learn), 27 `/ttm-*` commands, 10-gate quality wall, 10 discipline playbooks (SEO, AEO, Email, LinkedIn, Social, YouTube, Paid Ads, Affiliate, PR/Media, Events), positioning-as-invariant enforcement, npm + git clone distribution, interview-driven onboarding, compound learnings system.

## Requirements

### Validated — v1.0

- [x] Plugin scaffold with `.claude-plugin/plugin.json` manifest and 27 `/ttm-*` SKILL.md stubs — v1.0
- [x] `bin/ttm-tools.cjs` CLI utility for deterministic operations — v1.0
- [x] Reference file templates with two-tier context loading — v1.0
- [x] Dual-runtime support via CLAUDE.md and AGENTS.md — v1.0
- [x] Interview-driven onboarding (`/ttm-init`) with 6-section guided interview — v1.0
- [x] Vague/generic output rejection with banned phrase detection — v1.0
- [x] Campaign creation (`/ttm-new-campaign`) with full scaffold — v1.0
- [x] Market research (`/ttm-research`) with web search + manual paste hybrid — v1.0
- [x] Brief generation (`/ttm-brief`) with outcome metric enforcement — v1.0
- [x] Content production (`/ttm-produce`) with hero-first wave-parallel execution — v1.0
- [x] 10-gate quality wall (`/ttm-verify`) with structured deviation handling — v1.0
- [x] 3-option deviation handling (Correct/Accept+log/Escalate) — v1.0
- [x] Context isolation between Produce and Verify via `context: fork` — v1.0
- [x] Human review (`/ttm-review`) with hero-first structured checklist — v1.0
- [x] Root-cause fix loop (`/ttm-fix`) with 3-attempt cap — v1.0
- [x] Launch checklist (`/ttm-ship`) with dynamic per-campaign checklist — v1.0
- [x] POSITIONING.md loaded into every phase context with two-tier strategy — v1.0
- [x] Read-only POSITIONING.md enforcement via state-based gate — v1.0
- [x] `/ttm-positioning-shift` controlled repositioning with human approval — v1.0
- [x] `/ttm-positioning-check` drift audit with time-window sampling — v1.0
- [x] Dual positioning drift log (POSITIONING.md History + DRIFT-LOG.md) — v1.0
- [x] `/ttm-state` campaign dashboard with all-campaigns view — v1.0
- [x] `/ttm-resume` session recovery with auto-load context — v1.0
- [x] `/ttm-archive` campaign finalization with learnings extraction — v1.0
- [x] `/ttm-health` full audit with staleness and consistency checks — v1.0
- [x] `/ttm-next` multi-campaign portfolio routing — v1.0
- [x] Campaign state persistence across sessions — v1.0
- [x] Base playbook inheritance model with additive gates — v1.0
- [x] SEO, AEO, Email, LinkedIn, Social playbooks with discipline gates — v1.0
- [x] YouTube, Paid Ads, Affiliate, PR/Media, Events playbooks — v1.0
- [x] `/ttm-measure` with 3-pathway analytics input and outcome-first attribution — v1.0
- [x] `/ttm-learn` with narrative+apply reference file edits — v1.0
- [x] LEARNINGS.md compound learning with root-cause taxonomy — v1.0
- [x] Meta-gates (portfolio balance, calendar collision, theme consistency, learning plan) — v1.0
- [x] npm installer with runtime detection and post-install validation — v1.0
- [x] Reference management commands (brand-refresh, icp-refresh, competitor-scan) — v1.0
- [x] Discipline audit commands (seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit) — v1.0
- [x] Content repurposing pipeline (`/ttm-repurpose`) — v1.0
- [x] README.md with quickstart, 27-command reference, architecture guide — v1.0

### Active

(None — fresh requirements defined in next milestone via `/gsd-new-milestone`)

### Out of Scope

- Team/concurrent edit support — deferred to V2 milestone
- MCP integrations for analytics (GA, GSC, HubSpot, etc.) — deferred to V2, manual paste for now
- Automated competitor scan (weekly cron) — V2
- AEO citation tracker (crawl queries across AI engines) — V2
- Design tool integration for final creative assets — V2
- Scheduling/publishing integration (Buffer, Notion, Ghost, etc.) — hands off to existing tools
- Analytics dashboard — writes reports, does not replace analytics stack
- Real-time collaboration features — solo-first design

## Context

- **Architecture model:** Claude Code / Codex skill — collection of SKILL.md files, workflows, templates, references, playbooks, gates, and a CJS CLI utility.
- **Codebase:** 17,470 LOC (Markdown workflows + CJS utilities). 125 files. Zero npm runtime dependencies.
- **Inspiration:** GSD (Get Shit Done) — 31K+ stars. Ports GSD's meta-prompting architecture to marketing.
- **Distribution:** npm (`npx taketomarket`) + git clone. Plugin format with `.claude-plugin/plugin.json`.
- **Known tech debt:** Campaign name YAML injection (CR-01 fixed in Phase 11), stale install cleanup (CR-02 fixed).

## Constraints

- **Platform**: Must work as Claude Code skill AND Codex skill
- **Context window**: Production uses fresh 200K-token contexts per wave
- **No external dependencies for MVP**: Analytics data pasted manually
- **State persistence**: All state in `.marketing/` directory files

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Name: takeToMarket | User preference — clear, action-oriented | Validated v1.0 |
| Interview-driven onboarding over templates | Lower barrier to entry | Validated v1.0 |
| Solo-first, team later | Reduces MVP complexity | Validated v1.0 |
| Manual measurement before MCP | Avoids external dependency | Validated v1.0 |
| Dual distribution (git + npm) | Reaches both audiences | Validated v1.0 |
| GSD-inspired prompt engineering | Proven architecture at scale | Validated v1.0 |
| Positioning as invariant | #1 failure mode prevention | Validated v1.0 |
| Command prefix: `/ttm-*` | Short, memorable, consistent | Validated v1.0 |
| serializeFrontmatter for all YAML | Prevents injection (CR-01) | Validated v1.0 |
| rmSync before install overwrite | Prevents stale artifacts (CR-02) | Validated v1.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-04 after v1.0 MVP milestone completion*
