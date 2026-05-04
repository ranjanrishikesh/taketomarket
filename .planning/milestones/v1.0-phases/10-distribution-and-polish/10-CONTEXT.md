# Phase 10: Distribution and Polish - Context

**Gathered:** 2026-05-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can install takeToMarket via git clone or npm with post-install validation, and access 9 utility commands for reference file management (/ttm-brand-refresh, /ttm-icp-refresh, /ttm-competitor-scan), discipline-specific audits (/ttm-seo-audit, /ttm-aeo-check, /ttm-keyword-map, /ttm-email-preflight, /ttm-affiliate-kit), and content repurposing (/ttm-repurpose). This phase also delivers comprehensive README documentation.

</domain>

<decisions>
## Implementation Decisions

### npm Installer (install.js)
- **D-01:** Single `install.js` entry point following GSD pattern -- runtime detection (Claude Code vs Codex) via environment sniffing (check for `.claude/` vs `.codex/` directories, or CLI args). Copies plugin files to the correct runtime location.
- **D-02:** Runtime detection order: (1) explicit `--runtime claude|codex` flag, (2) check if `.claude/` directory exists in cwd or home, (3) check if `.codex/` directory exists, (4) default to Claude Code with a note.
- **D-03:** Post-install validation -- automatically run the equivalent of `/ttm-health` structural checks (directory existence, file integrity) after install. Report pass/fail per check. Do NOT run the full campaign-level health checks (no campaigns exist yet).
- **D-04:** npm install flow: `npx taketomarket` runs install.js which (1) detects runtime, (2) copies plugin files to `~/.claude/plugins/taketomarket/` or equivalent Codex path, (3) runs structural validation, (4) prints quickstart instructions.
- **D-05:** Git clone flow: user copies skill folder manually. README documents the exact commands. No installer needed -- just `cp -r` or `/plugin install`.

### Utility Command Depth
- **D-06:** Reference management commands (brand-refresh, icp-refresh, competitor-scan) are **lightweight single-pass workflows** -- read current reference file, ask user for new data via AskUserQuestion, validate against POSITIONING.md invariant, write updated file. No multi-step pipeline.
- **D-07:** Discipline audit commands (seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit) are **single-pass analysis workflows** -- accept a URL or content input, run checks from the relevant playbook's gate definitions, output a report. Reuse existing playbook gate logic where possible.
- **D-08:** All 8 non-repurpose utility commands follow the same thin pattern: SKILL.md stub (already exists) -> workflow file in `workflows/reference-mgmt/` or `workflows/discipline/`. Each workflow is self-contained, 100-300 lines.
- **D-09:** Utility commands use MCP tool detection pattern from Phase 3/9 -- detect WebSearch/WebFetch for competitor-scan, seo-audit, aeo-check. Graceful fallback to manual paste if tools unavailable.

### Repurpose Pipeline (/ttm-repurpose)
- **D-10:** Full brief-produce-verify per derivative -- this is NOT a lightweight command. It orchestrates the same lifecycle as a campaign but scoped to derivatives of a single source asset.
- **D-11:** Derivative brief generation: analyze source asset content, cross-reference with CHANNELS.md active channels, generate a mini-brief per target channel that preserves the core message but adapts format/length/tone per channel rules.
- **D-12:** Channel selection: default to all active channels in CHANNELS.md minus the source channel. User can override via AskUserQuestion to pick specific channels.
- **D-13:** Execution: hero derivative first (highest-reach channel from CHANNELS.md baselines), then remaining derivatives in wave-parallel via Task(). Each derivative gets fresh context loaded with source asset + channel playbook + positioning.
- **D-14:** All derivatives tracked as linked assets in the campaign's MANIFEST.json with `source_asset` cross-reference field.

### README and Documentation
- **D-15:** README.md gets a full rewrite -- quickstart (install + first campaign walkthrough), complete command reference table (all 27 /ttm-* commands grouped by category), architecture overview for contributors (directory structure, file conventions, how to add a playbook).
- **D-16:** No separate docs site or docs/ directory for MVP. README.md is the single source of documentation. Each SKILL.md stub already has a description -- README links to the workflow files for deep-dive.
- **D-17:** Include a "How It Works" section explaining the 9-phase lifecycle with a simple flow diagram (text-based, not image).

### Claude's Discretion
- Exact validation checks in post-install health (structural subset of /ttm-health)
- How install.js handles partial/failed installs (cleanup or leave partial)
- Reference management workflow question design (how many questions per refresh command)
- Discipline audit report format (inline text vs separate file)
- Whether keyword-map outputs to a file or stdout
- README structure and section ordering
- How competitor-scan sources data when no web search MCP available

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Distribution Infrastructure
- `.claude-plugin/plugin.json` -- Plugin manifest with name, version, description, keywords
- `package.json` -- npm package config with bin entry pointing to install.js, files array listing all distributable directories
- `settings.json` -- Default plugin settings

### Existing Utility Stubs (all need workflow implementation)
- `skills/ttm-brand-refresh/SKILL.md` -- Routes to `workflows/reference-mgmt/brand-refresh.md`
- `skills/ttm-icp-refresh/SKILL.md` -- Routes to `workflows/reference-mgmt/icp-refresh.md`
- `skills/ttm-competitor-scan/SKILL.md` -- Routes to `workflows/reference-mgmt/competitor-scan.md`
- `skills/ttm-seo-audit/SKILL.md` -- Routes to `workflows/discipline/seo-audit.md`
- `skills/ttm-aeo-check/SKILL.md` -- Routes to `workflows/discipline/aeo-check.md`
- `skills/ttm-keyword-map/SKILL.md` -- Routes to `workflows/discipline/keyword-map.md`
- `skills/ttm-email-preflight/SKILL.md` -- Routes to `workflows/discipline/email-preflight.md`
- `skills/ttm-affiliate-kit/SKILL.md` -- Routes to `workflows/discipline/affiliate-kit.md`
- `skills/ttm-repurpose/SKILL.md` -- Routes to `workflows/discipline/repurpose.md` (uses Task() for wave-parallel)

### Playbook Gate Definitions (reused by audit commands)
- `playbooks/seo.md` -- SEO gates reused by /ttm-seo-audit
- `playbooks/aeo.md` -- AEO gates reused by /ttm-aeo-check
- `playbooks/email.md` -- Email gates reused by /ttm-email-preflight
- `playbooks/affiliate.md` -- Affiliate gates reused by /ttm-affiliate-kit

### Campaign Infrastructure (used by /ttm-repurpose)
- `bin/lib/campaign.cjs` -- Campaign state operations, MANIFEST.json management
- `workflows/lifecycle/produce.md` -- Production workflow pattern (Task() orchestration)
- `workflows/lifecycle/verify.md` -- Verification workflow pattern
- `workflows/lifecycle/brief.md` -- Brief generation pattern for derivative briefs
- `templates/campaign-brief.md` -- Brief template with outcome/output metrics
- `templates/production-manifest.json` -- Asset manifest schema

### Reference File Templates (used by refresh commands)
- `templates/reference-files/` -- All reference file templates (brand, icp, competitors, etc.)
- `references/context-loading.md` -- Two-tier context loading strategy

### Health Infrastructure
- `bin/lib/health.cjs` -- Existing health validation (reuse structural checks for post-install)

### Requirements
- `.planning/REQUIREMENTS.md` -- DIST-01 through DIST-04, UTIL-01 through UTIL-09

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `bin/lib/health.cjs` cmdHealth -- structural validation reusable for post-install checks (directory existence, reference file presence)
- `bin/lib/campaign.cjs` cmdCampaignList -- campaign enumeration for /ttm-repurpose source asset lookup
- `workflows/lifecycle/research.md` -- MCP tool detection pattern (WebSearch/WebFetch) reusable for competitor-scan, seo-audit, aeo-check
- `workflows/lifecycle/produce.md` -- Task() wave-parallel pattern reusable for /ttm-repurpose derivatives
- `playbooks/*.md` -- Gate definitions reusable as audit checklists for discipline utility commands
- AskUserQuestion + text-mode fallback pattern from all prior phases

### Established Patterns
- Thin SKILL.md -> workflow routing (Phase 1 D-02)
- 500-line file limit with @-reference extraction
- MCP tool detection + graceful fallback (Phase 3 D-03)
- Campaign state via campaign.cjs CLI (Phases 3-9)
- Playbook inheritance: base.md contract (Phase 8 D-01)
- Two-tier context loading (compact summary universal, full in produce/verify)

### Integration Points
- `install.js` -- new file, npm bin entry point
- `workflows/reference-mgmt/` -- new directory for brand-refresh, icp-refresh, competitor-scan
- `workflows/discipline/` -- new directory for seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit, repurpose
- `README.md` -- full rewrite from current stub
- `bin/lib/campaign.cjs` -- may need extension for repurpose derivative tracking in MANIFEST.json

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- user delegated all decisions to Claude's discretion. Open to standard approaches following established codebase patterns.

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 10-distribution-and-polish*
*Context gathered: 2026-05-04*
