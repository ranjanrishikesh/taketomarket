# Roadmap: takeToMarket

## Overview

takeToMarket delivers a marketing operating system as a Claude Code / Codex skill, built in 10 phases that progress from plugin scaffolding through the complete 9-phase campaign lifecycle, quality gate wall, discipline playbooks, measurement and learning loops, advanced workflows, and distribution packaging. Every phase delivers a coherent, verifiable capability that the next phase builds on. The core invariant -- every asset ships with a verifiable outcome metric through a positioning-invariant quality gate wall -- is enforced architecturally from Phase 3 onward.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Plugin Scaffold and Tooling** - Plugin directory structure, SKILL.md entry point, CLI utility, dual-runtime support
- [ ] **Phase 2: Onboarding Interview** - /ttm-init generates all reference files from structured questioning with specificity validation
- [ ] **Phase 3: Campaign Creation and Briefing** - Campaign directory creation, brief generation with outcome metric enforcement, positioning check gate
- [ ] **Phase 4: Content Production and Verification** - Produce phase with wave-parallel fresh-context execution, Verify phase with base quality gates and deviation reports
- [ ] **Phase 5: Review, Fix, and Ship** - Human review phase, root-cause fix loop with 3-attempt cap, ship phase with launch checklist
- [x] **Phase 6: Positioning Invariant System** - Positioning-as-invariant enforcement, positioning shift workflow, drift detection and logging
- [x] **Phase 7: State Management and Campaign Operations** - Campaign state persistence, resume, archive, health checks, /ttm-next guidance
- [x] **Phase 8: Core Playbooks** - Base playbook inheritance model plus SEO, AEO, Email, LinkedIn, and Social discipline playbooks with discipline-specific gates
- [ ] **Phase 9: Measurement, Learning, and Remaining Playbooks** - Measure phase with attribution models, Learn phase with root-cause taxonomy, YouTube/Paid Ads/Affiliate/PR-Media/Events playbooks, meta-gates
- [ ] **Phase 10: Distribution and Polish** - Git clone installation, npm package, post-install validation, utility commands, documentation

## Phase Details

### Phase 1: Plugin Scaffold and Tooling
**Goal**: The skill installs correctly into Claude Code and Codex environments with a modular, maintainable file architecture
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. User can install the skill into a Claude Code environment and see /ttm-* commands available
  2. Plugin directory structure exists with plugin.json, skills/, workflows/, templates/, bin/ and no file exceeds 500 lines
  3. bin/ttm-tools.cjs runs slug generation and state timestamp operations using only Node.js built-ins
  4. .marketing/ directory structure is created with CAMPAIGNS/ and PLAYBOOKS/ subdirectories
  5. Two-tier context loading strategy is defined -- compact summaries load universally, full documents load only when needed
**Plans:** 3 plans
Plans:
- [x] 01-01-PLAN.md -- Plugin manifest, 27 SKILL.md command stubs, and project files
- [x] 01-02-PLAN.md -- bin/ttm-tools.cjs CLI utility with modular lib/ architecture
- [x] 01-03-PLAN.md -- Reference file templates, dual-runtime templates, workflow directory scaffolding

### Phase 2: Onboarding Interview
**Goal**: A new user can run /ttm-init and have all reference files generated from a guided interview, ready for campaign work
**Depends on**: Phase 1
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06, ONBD-07, ONBD-08, ONBD-09, ONBD-10, ONBD-11
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-init and is guided through structured questions about their product, brand, audience, channels, competitors, and metrics
  2. All 9 reference files (POSITIONING.md, BRAND.md, ICP.md, CHANNELS.md, STATE.md, METRICS.md, COMPETITORS.md, CALENDAR.md, LEARNINGS.md) are generated in .marketing/
  3. POSITIONING.md uses structured checklist format with primary differentiator phrase, category, target audience, proof points, and must-not-say terms
  4. Vague or generic outputs are rejected and the user is re-asked with more specific prompts
**Plans:** 3 plans
Plans:
- [x] 02-01-PLAN.md -- Interview question bank and specificity validation rules
- [x] 02-02-PLAN.md -- Main /ttm-init interview workflow with file generation
- [x] 02-03-PLAN.md -- SKILL.md finalization and end-to-end verification checkpoint

### Phase 3: Campaign Creation and Briefing
**Goal**: Users can create campaigns and generate briefs that enforce outcome metrics and positioning alignment before any content is produced
**Depends on**: Phase 2
**Requirements**: LIFE-01, LIFE-02, LIFE-03, LIFE-04, LIFE-05
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-new-campaign and a CAMPAIGNS/<slug>/ directory is created with initialized state and reference file links
  2. User runs /ttm-research and receives market/audience research including SERP analysis, competitor content, and ambient narrative
  3. User runs /ttm-brief and receives a campaign brief with all mandatory fields (goal, outcome metric, target value, measurement window, ICP segment, positioning anchor, hook, proof points, channel mix, assets list)
  4. Brief refuses to proceed without both an output metric and an outcome metric defined
  5. Brief runs a positioning check gate before allowing progression to Produce
**Plans:** 3 plans
Plans:
- [x] 03-01-PLAN.md -- Campaign CLI utility (bin/lib/campaign.cjs) and templates (campaign-state.md, campaign-research.md)
- [x] 03-02-PLAN.md -- /ttm-new-campaign workflow and /ttm-research workflow with web search + manual paste hybrid
- [x] 03-03-PLAN.md -- /ttm-brief workflow with outcome metric enforcement and positioning check gate

### Phase 4: Content Production and Verification
**Goal**: Users can produce content assets in quality-isolated contexts and verify them against a 10-gate quality wall with structured deviation handling
**Depends on**: Phase 3
**Requirements**: LIFE-06, LIFE-07, LIFE-08, LIFE-09, GATE-01, GATE-02, GATE-03, GATE-04, GATE-05, GATE-06, GATE-07, GATE-08, GATE-09, GATE-10, GATE-11, GATE-12
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-produce and content assets are generated in fresh contexts loaded with brief + positioning + brand + ICP + relevant playbook
  2. Multi-asset campaigns produce the hero asset first, then derivatives in wave-parallel execution
  3. User runs /ttm-verify and every asset receives a pass/fail report across all 10 base quality gates with line-level feedback
  4. Verify runs in a separate context from Produce to prevent self-evaluation bias
  5. Deviation reports offer 3 options per failure: Correct (rewrite), Accept+log (ship with exception), Escalate (trigger positioning shift)
**Plans:** 4 plans
Plans:
- [x] 04-01-PLAN.md -- Infrastructure: extend campaign.cjs state fields, create templates and producer agent
- [x] 04-02-PLAN.md -- /ttm-produce workflow with hero-first Task() orchestration
- [x] 04-03-PLAN.md -- Quality gate system: expand base-gates.md and create gate-evaluation.md
- [x] 04-04-PLAN.md -- /ttm-verify workflow with 10-gate evaluation and deviation handling

### Phase 5: Review, Fix, and Ship
**Goal**: Users can review assets with structured checklists, fix failures through root-cause analysis, and ship with verified launch readiness
**Depends on**: Phase 4
**Requirements**: LIFE-10, LIFE-11, LIFE-12, LIFE-13
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-review and sees assets presented with a structured review checklist covering positioning reinforcement, outcome realism, claim substantiation, and competitor differentiation
  2. User runs /ttm-fix and the system performs root cause analysis, generates a fix brief, re-produces in isolated context, and re-verifies
  3. Fix loop is capped at 3 attempts per asset -- after 3 failures, the system escalates to human review
  4. User runs /ttm-ship and receives a launch checklist confirming tracking installed, UTMs confirmed, funnel tested, assets finalized
**Plans:** 4 plans
Plans:
- [x] 05-01-PLAN.md -- Infrastructure: campaign.cjs state fields, SKILL.md updates, reference files and templates
- [x] 05-02-PLAN.md -- /ttm-review workflow with structured checklist and per-asset outcomes
- [x] 05-03-PLAN.md -- /ttm-fix workflow with root-cause loop, Task() re-production, and 3-attempt cap
- [x] 05-04-PLAN.md -- /ttm-ship workflow with dynamic launch checklist and per-asset shipping

### Phase 6: Positioning Invariant System
**Goal**: Positioning is enforced as an architectural invariant across every campaign phase, with controlled shift workflows when repositioning is needed
**Depends on**: Phase 4
**Requirements**: POSN-01, POSN-02, POSN-03, POSN-04, POSN-05
**Success Criteria** (what must be TRUE):
  1. POSITIONING.md loads into every phase context (compact summary in non-produce phases, full document in produce/verify)
  2. POSITIONING.md cannot be edited from within a campaign -- attempts are blocked with an explanation
  3. User runs /ttm-positioning-shift and must provide explicit reasoning, migration plan for existing assets, deprecation schedule, and human approval before any change takes effect
  4. User runs /ttm-positioning-check and receives a report showing percentage on-positioning across recent assets, types of drift detected, and bleeding-into-customer-facing-materials analysis
**Plans:** 5 plans
Plans:
- [x] 06-01-PLAN.md -- CLI infrastructure: drift-log.cjs module, campaign list subcommand, DRIFT-LOG.md template
- [x] 06-02-PLAN.md -- /ttm-positioning-check drift audit workflow with GATE-01 reuse and report generation
- [x] 06-03-PLAN.md -- Read-only POSITIONING.md enforcement in lifecycle workflows, context-loading update, auto-suggest in ship
- [x] 06-04-PLAN.md -- /ttm-positioning-shift controlled change workflow with approval gate and migration planning
- [x] 06-05-PLAN.md -- Gap closure: dedicated Bleeding Analysis section in positioning-check workflow and report

### Phase 7: State Management and Campaign Operations
**Goal**: Users can manage campaign state across sessions, recover from interruptions, and get guided navigation through the lifecycle
**Depends on**: Phase 5
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, UTIL-10
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-state and sees current campaign states, decisions in flight, blockers, and in-progress experiments
  2. User can close a session and later run /ttm-resume to pick up a campaign at its last completed phase
  3. User runs /ttm-archive and the campaign is finalized, moved to archive, and LEARNINGS.md is updated
  4. User runs /ttm-health and receives a validation report on .marketing/ directory integrity, reference file completeness, and state consistency
  5. User runs /ttm-next and receives guidance on the right next command based on current campaign state
**Plans:** 3 plans
Plans:
- [x] 07-01-PLAN.md -- CLI infrastructure: campaign archive, extended health checks, learnings extraction reference
- [x] 07-02-PLAN.md -- /ttm-state dashboard, /ttm-health audit, and /ttm-next routing workflows
- [x] 07-03-PLAN.md -- /ttm-resume recovery and /ttm-archive finalization workflows

### Phase 8: Core Playbooks
**Goal**: Users can produce and verify content with discipline-specific knowledge and quality gates for the 5 highest-demand marketing channels
**Depends on**: Phase 4
**Requirements**: PLAY-01, PLAY-02, PLAY-03, PLAY-05, PLAY-06, PLAY-07
**Success Criteria** (what must be TRUE):
  1. Base playbook inheritance model works -- discipline playbooks extend the base with additive gates and channel-specific checks
  2. SEO playbook enforces title/H1 alignment, search-intent match, schema markup, internal-link density, and thin-content detection
  3. AEO playbook enforces quote-worthy sentences, FAQ/HowTo schema, and cross-domain fact consistency
  4. Email playbook enforces subject/preview spam-trigger scan, dark-mode rendering, unsubscribe presence, and deliverability checks
  5. LinkedIn and Social playbooks enforce platform-specific content rules (opener hooks, native vs link format, visual ratios)
**Plans:** 3 plans
Plans:
- [x] 08-01-PLAN.md -- Base playbook inheritance contract, verify workflow extension, gate-evaluation discipline gate support
- [x] 08-02-PLAN.md -- SEO and AEO discipline playbooks with full gate definitions
- [x] 08-03-PLAN.md -- Email, LinkedIn, and Social discipline playbooks with full gate definitions

### Phase 9: Measurement, Learning, and Remaining Playbooks
**Goal**: Users can close the feedback loop by measuring campaign outcomes, extracting lessons that improve future campaigns, and produce content across all 10 marketing disciplines
**Depends on**: Phase 7, Phase 8
**Requirements**: LIFE-14, LIFE-15, LIFE-16, LIFE-17, PLAY-04, PLAY-08, PLAY-09, PLAY-10, PLAY-11, LRNG-01, LRNG-02, LRNG-03, LRNG-04, META-01, META-02, META-03, META-04
**Success Criteria** (what must be TRUE):
  1. User runs /ttm-measure, pastes analytics data, and receives analysis against outcome metrics using last-touch, linear, and time-decay attribution models with outcome reported first
  2. User runs /ttm-learn and receives extracted lessons with proposed edits to reference files, each requiring human approval before applying
  3. LEARNINGS.md accumulates root-cause taxonomy entries and pattern extraction (winning hooks, angles, formats) that load into Brief phase of future campaigns
  4. YouTube, Paid Ads, Affiliate, PR/Media, and Events playbooks are available with discipline-specific gates and outcome metric taxonomies
  5. Meta-gates check portfolio balance, calendar collision, theme consistency, and learning plan across campaigns
**Plans:** 6 plans
Plans:
- [x] 09-01-PLAN.md -- Infrastructure: campaign.cjs state fields, measurement templates, meta-gate evaluation reference
- [x] 09-02-PLAN.md -- YouTube and Paid Ads discipline playbooks
- [x] 09-03-PLAN.md -- Affiliate, PR/Media, and Events discipline playbooks
- [x] 09-04-PLAN.md -- /ttm-measure workflow with 3-pathway analytics input and attribution models
- [x] 09-05-PLAN.md -- /ttm-learn workflow with narrative+apply reference edits and root-cause logging
- [x] 09-06-PLAN.md -- Meta-gate integration into verify.md as Step 4c

### Phase 10: Distribution and Polish
**Goal**: Users can install takeToMarket via git clone or npm with post-install validation, and access all utility commands for reference file management and discipline-specific audits
**Depends on**: Phase 9
**Requirements**: DIST-01, DIST-02, DIST-03, DIST-04, UTIL-01, UTIL-02, UTIL-03, UTIL-04, UTIL-05, UTIL-06, UTIL-07, UTIL-08, UTIL-09
**Success Criteria** (what must be TRUE):
  1. User can git clone the repo, copy the skill folder into .claude/skills/ or .codex/, and have all /ttm-* commands work immediately
  2. User can run npx taketomarket and have the skill installed with runtime detection (Claude Code vs Codex) and post-install validation
  3. User can run /ttm-brand-refresh, /ttm-icp-refresh, and /ttm-competitor-scan to update reference files with new data
  4. User can run discipline-specific utility commands (/ttm-seo-audit, /ttm-aeo-check, /ttm-keyword-map, /ttm-email-preflight, /ttm-affiliate-kit)
  5. User can run /ttm-repurpose to fan out a long-form asset into derivative assets across channels with full brief-produce-verify per derivative
**Plans:** 5 plans
Plans:
**Wave 1**
- [ ] 10-01-PLAN.md -- npm installer (install.js) with runtime detection and post-install validation
- [ ] 10-02-PLAN.md -- Reference management workflows (brand-refresh, icp-refresh, competitor-scan)
- [ ] 10-03-PLAN.md -- Discipline audit workflows (seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit)
- [ ] 10-04-PLAN.md -- Repurpose workflow with Task() orchestration and MANIFEST extension

**Wave 2** *(blocked on Wave 1 completion)*
- [ ] 10-05-PLAN.md -- README.md comprehensive documentation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Plugin Scaffold and Tooling | 0/3 | Planning complete | - |
| 2. Onboarding Interview | 0/3 | Planning complete | - |
| 3. Campaign Creation and Briefing | 0/3 | Planning complete | - |
| 4. Content Production and Verification | 0/4 | Planning complete | - |
| 5. Review, Fix, and Ship | 4/4 | Complete | 2026-04-28 |
| 6. Positioning Invariant System | 5/5 | Complete | 2026-04-28 |
| 7. State Management and Campaign Operations | 3/3 | Complete | 2026-04-29 |
| 8. Core Playbooks | 3/3 | Complete | 2026-04-29 |
| 9. Measurement, Learning, and Remaining Playbooks | 6/6 | Complete | 2026-05-02 |
| 10. Distribution and Polish | 0/5 | Planning complete | - |
