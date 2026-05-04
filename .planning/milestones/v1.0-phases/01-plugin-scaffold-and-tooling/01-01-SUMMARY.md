---
phase: 01-plugin-scaffold-and-tooling
plan: 01
subsystem: plugin-scaffold
tags: [claude-code, plugin, skill-md, agent-skills, markdown]

# Dependency graph
requires: []
provides:
  - Plugin manifest (.claude-plugin/plugin.json) for Claude Code discovery
  - 27 SKILL.md stub files registering all /ttm-* slash commands
  - Project files (package.json, LICENSE, README.md, settings.json)
affects: [01-02, 01-03, 02-onboarding, 03-campaign-lifecycle, 04-produce-verify]

# Tech tracking
tech-stack:
  added: [SKILL.md Agent Skills standard, Claude Code plugin format]
  patterns: [thin-skill-to-workflow routing, YAML frontmatter command registration, plugin-root directory layout]

key-files:
  created:
    - .claude-plugin/plugin.json
    - skills/ttm-init/SKILL.md
    - skills/ttm-new-campaign/SKILL.md
    - skills/ttm-research/SKILL.md
    - skills/ttm-brief/SKILL.md
    - skills/ttm-produce/SKILL.md
    - skills/ttm-verify/SKILL.md
    - skills/ttm-review/SKILL.md
    - skills/ttm-fix/SKILL.md
    - skills/ttm-ship/SKILL.md
    - skills/ttm-measure/SKILL.md
    - skills/ttm-learn/SKILL.md
    - skills/ttm-state/SKILL.md
    - skills/ttm-resume/SKILL.md
    - skills/ttm-health/SKILL.md
    - skills/ttm-archive/SKILL.md
    - skills/ttm-next/SKILL.md
    - skills/ttm-positioning-check/SKILL.md
    - skills/ttm-positioning-shift/SKILL.md
    - skills/ttm-brand-refresh/SKILL.md
    - skills/ttm-icp-refresh/SKILL.md
    - skills/ttm-competitor-scan/SKILL.md
    - skills/ttm-seo-audit/SKILL.md
    - skills/ttm-aeo-check/SKILL.md
    - skills/ttm-keyword-map/SKILL.md
    - skills/ttm-email-preflight/SKILL.md
    - skills/ttm-affiliate-kit/SKILL.md
    - skills/ttm-repurpose/SKILL.md
    - package.json
    - LICENSE
    - README.md
    - settings.json
  modified: []

key-decisions:
  - "All 27 SKILL.md stubs use ${CLAUDE_PLUGIN_ROOT}/workflows/ path for workflow routing"
  - "Advisory skills (health, positioning-check) use disable-model-invocation: false; all others true"
  - "Orchestration skills (produce, verify, fix, repurpose) include Task in allowed-tools for subagent spawning"

patterns-established:
  - "Thin SKILL.md stub pattern: frontmatter + H1 + status + workflow reference + bullet list (under 30 lines each)"
  - "Plugin root layout: .claude-plugin/plugin.json at root, skills/ at root, not inside .claude-plugin/"
  - "Frontmatter name field matches directory name exactly (e.g., ttm-init dir -> name: ttm-init)"

requirements-completed: [FOUND-01, FOUND-02, FOUND-03]

# Metrics
duration: 4min
completed: 2026-04-21
---

# Phase 1 Plan 1: Plugin Manifest and Skill Stubs Summary

**Plugin manifest with 27 SKILL.md command stubs registering all /ttm-* slash commands using Claude Code plugin format**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-21T18:48:21Z
- **Completed:** 2026-04-21T18:52:05Z
- **Tasks:** 2
- **Files created:** 32

## Accomplishments
- Plugin manifest at .claude-plugin/plugin.json with taketomarket identity, enabling Claude Code auto-discovery
- All 27 /ttm-* commands registered as SKILL.md stubs with proper YAML frontmatter (name, description, disable-model-invocation, allowed-tools)
- Project files (package.json, LICENSE, README.md, settings.json) established for future npm distribution and plugin configuration
- Every SKILL.md routes to its workflow file via ${CLAUDE_PLUGIN_ROOT}/workflows/ pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Create plugin manifest and project files** - `8e1e88a` (feat)
2. **Task 2: Create all 27 SKILL.md stub files** - `1e09976` (feat)

## Files Created
- `.claude-plugin/plugin.json` - Plugin manifest for Claude Code discovery (name: taketomarket, v0.1.0)
- `package.json` - npm package metadata for future distribution (node >=18)
- `LICENSE` - MIT license (2026, takeToMarket Contributors)
- `README.md` - Project documentation with all 27 commands, installation, and quick start
- `settings.json` - Default plugin settings with subagentStatusLine
- `skills/ttm-init/SKILL.md` - Onboarding command stub (Phase 2)
- `skills/ttm-new-campaign/SKILL.md` - Campaign creation stub (Phase 3)
- `skills/ttm-research/SKILL.md` - Discover phase stub (Phase 3)
- `skills/ttm-brief/SKILL.md` - Brief phase stub (Phase 3)
- `skills/ttm-produce/SKILL.md` - Produce phase stub (Phase 4, includes Task tool)
- `skills/ttm-verify/SKILL.md` - Verify phase stub (Phase 4, includes Task tool)
- `skills/ttm-review/SKILL.md` - Review phase stub (Phase 5)
- `skills/ttm-fix/SKILL.md` - Fix phase stub (Phase 5, includes Task tool)
- `skills/ttm-ship/SKILL.md` - Ship phase stub (Phase 5)
- `skills/ttm-measure/SKILL.md` - Measure phase stub (Phase 9)
- `skills/ttm-learn/SKILL.md` - Learn phase stub (Phase 9)
- `skills/ttm-state/SKILL.md` - State display stub (Phase 7)
- `skills/ttm-resume/SKILL.md` - Resume campaign stub (Phase 7)
- `skills/ttm-health/SKILL.md` - Health check stub (Phase 7, advisory: disable-model-invocation: false)
- `skills/ttm-archive/SKILL.md` - Archive campaign stub (Phase 7)
- `skills/ttm-next/SKILL.md` - Next action guide stub (Phase 7)
- `skills/ttm-positioning-check/SKILL.md` - Positioning drift check stub (Phase 6, advisory: disable-model-invocation: false)
- `skills/ttm-positioning-shift/SKILL.md` - Positioning shift stub (Phase 6)
- `skills/ttm-brand-refresh/SKILL.md` - Brand refresh stub (Phase 10)
- `skills/ttm-icp-refresh/SKILL.md` - ICP refresh stub (Phase 10)
- `skills/ttm-competitor-scan/SKILL.md` - Competitor scan stub (Phase 10)
- `skills/ttm-seo-audit/SKILL.md` - SEO audit stub (Phase 10)
- `skills/ttm-aeo-check/SKILL.md` - AEO check stub (Phase 10)
- `skills/ttm-keyword-map/SKILL.md` - Keyword map stub (Phase 10)
- `skills/ttm-email-preflight/SKILL.md` - Email preflight stub (Phase 10)
- `skills/ttm-affiliate-kit/SKILL.md` - Affiliate kit stub (Phase 10)
- `skills/ttm-repurpose/SKILL.md` - Repurpose stub (Phase 10, includes Task tool)

## Decisions Made
- Used `${CLAUDE_PLUGIN_ROOT}/workflows/` path syntax for workflow routing in SKILL.md bodies (per research Open Question 1 recommendation, verified plugin root variable availability)
- Kept all stubs under 30 lines (well within the 100-line limit from D-02) for minimal context consumption
- Advisory skills (ttm-health, ttm-positioning-check) set to `disable-model-invocation: false` per STACK.md frontmatter decisions so Claude can auto-trigger them

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plugin skeleton complete: Claude Code can discover the plugin and register all 27 /ttm-* commands
- Ready for Plan 01-02 (bin/ttm-tools.cjs CLI utility) and Plan 01-03 (workflow/template/reference directory scaffolding)
- All SKILL.md stubs reference workflow paths that will be created in Plan 01-03

---
*Phase: 01-plugin-scaffold-and-tooling*
*Completed: 2026-04-21*
