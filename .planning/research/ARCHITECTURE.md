# Architecture Research: takeToMarket

**Domain:** Claude Code / Codex marketing skill (meta-prompting operating system)
**Researched:** 2026-04-21
**Confidence:** HIGH (GSD architecture is directly inspected; skill format verified against plugin-dev docs)

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SKILL LAYER (installed in .claude/skills/)       │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ SKILL.md │  │ commands │  │ references│  │  scripts/tools   │  │
│  │ (entry)  │  │ /ttm-*   │  │ (domain)  │  │  (bin/)          │  │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘  └───────┬──────────┘  │
│       │              │              │                │             │
├───────┴──────────────┴──────────────┴────────────────┴─────────────┤
│                    TEMPLATE LAYER (bundled assets)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ workflow │  │ playbook │  │  template  │  │  gate            │  │
│  │ prompts  │  │ prompts  │  │  files     │  │  definitions     │  │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│            USER PROJECT STATE (.marketing/ per-project)            │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │reference │  │ campaign │  │  state     │  │  learnings       │  │
│  │ files    │  │ dirs     │  │  files     │  │  & metrics       │  │
│  └──────────┘  └──────────┘  └───────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Principle: Separation of Skill from State

The skill itself (installed in `~/.claude/skills/takeToMarket/` or project-level `.claude/skills/takeToMarket/`) is **read-only at runtime**. It contains instructions, templates, playbooks, and tooling. All mutable state lives in the user's project directory under `.marketing/`. This mirrors GSD's separation: GSD installs in `~/.claude/get-shit-done/` (read-only) while project state lives in `.planning/` (mutable).

---

## Component Architecture

### Layer 1: Skill Entry & Commands

#### SKILL.md (Entry Point)
The root entry point. Claude reads this when the skill is activated. It provides:
- Skill metadata (YAML frontmatter: name, description, version)
- Core philosophy (positioning-as-invariant, outcome-over-output)
- Progressive disclosure index (what to load when)
- Command routing table (which `/ttm-*` command triggers which workflow)

**Design decision:** Keep SKILL.md lean (~500 lines max). It should route to workflows and references, not contain them. This follows the plugin-dev skill-development best practice of progressive disclosure.

#### Slash Commands (.claude/commands/ or bundled)
Each `/ttm-*` command is a Markdown file that instructs Claude what to do. Commands map 1:1 to workflows but are the user-facing entry point.

| Command | Triggers Workflow | Phase |
|---------|-------------------|-------|
| `/ttm-init` | onboarding.md | Setup |
| `/ttm-new-campaign` | new-campaign.md | Setup |
| `/ttm-research` | discover.md | 1. Discover |
| `/ttm-brief` | brief.md | 2. Brief |
| `/ttm-produce` | produce.md | 3. Produce |
| `/ttm-verify` | verify.md | 4. Verify |
| `/ttm-review` | review.md | 5. Review |
| `/ttm-fix` | fix.md | 6. Fix |
| `/ttm-ship` | ship.md | 7. Ship |
| `/ttm-measure` | measure.md | 8. Measure |
| `/ttm-learn` | learn.md | 9. Learn |
| `/ttm-state` | state.md | Utility |
| `/ttm-resume` | resume.md | Utility |
| `/ttm-health` | health.md | Utility |
| `/ttm-positioning-check` | positioning-check.md | Utility |
| `/ttm-positioning-shift` | positioning-shift.md | Utility |
| `/ttm-repurpose` | repurpose.md | Utility |
| `/ttm-seo-audit` | seo-audit.md | Discipline |
| `/ttm-aeo-check` | aeo-check.md | Discipline |
| `/ttm-keyword-map` | keyword-map.md | Discipline |
| `/ttm-email-preflight` | email-preflight.md | Discipline |
| `/ttm-affiliate-kit` | affiliate-kit.md | Discipline |
| `/ttm-brand-refresh` | brand-refresh.md | Utility |
| `/ttm-icp-refresh` | icp-refresh.md | Utility |
| `/ttm-competitor-scan` | competitor-scan.md | Utility |
| `/ttm-archive` | archive.md | Utility |

### Layer 2: Workflows (The Brain)

Workflows are the detailed multi-step prompt instructions that each command triggers. They mirror GSD's `workflows/` directory. Each workflow file is a Markdown document with structured steps, required readings, gate definitions, and completion markers.

**Key workflow categories:**

1. **Lifecycle workflows** (discover, brief, produce, verify, review, fix, ship, measure, learn) -- the 9-phase campaign lifecycle
2. **Setup workflows** (onboarding, new-campaign) -- project and campaign initialization
3. **Utility workflows** (state, resume, health, archive) -- state management
4. **Reference management workflows** (positioning-check, positioning-shift, brand-refresh, icp-refresh, competitor-scan) -- maintaining reference files
5. **Discipline workflows** (seo-audit, aeo-check, keyword-map, email-preflight, affiliate-kit, repurpose) -- discipline-specific actions

### Layer 3: Playbooks (Discipline Intelligence)

Playbooks are reference documents loaded into context during the Produce and Verify phases. Each playbook encapsulates discipline-specific knowledge:

| Playbook | Loaded During | Contains |
|----------|---------------|----------|
| seo.md | Produce, Verify | SEO content patterns, technical checklist, SERP intent mapping |
| aeo.md | Produce, Verify | AI Engine Optimization patterns, citation optimization |
| youtube.md | Produce, Verify | Script structures, thumbnail psychology, retention patterns |
| linkedin.md | Produce, Verify | Post formats, algorithm signals, engagement patterns |
| social.md | Produce, Verify | Platform-specific formats, hook patterns |
| email.md | Produce, Verify | Subject line patterns, deliverability, sequence design |
| paid-ads.md | Produce, Verify | Ad copy frameworks, landing page alignment |
| affiliate.md | Produce, Verify | Partner kit structure, tracking requirements |
| pr-media.md | Produce, Verify | Pitch structure, media list requirements |
| events.md | Produce, Verify | Event content, follow-up sequences |

**Design decision:** Playbooks are NOT workflows. They are loaded as context *within* the Produce workflow, not executed independently. A playbook says "here's what good SEO content looks like"; the Produce workflow says "here's how to make it."

### Layer 4: Quality Gates

Quality gates are the verification rules applied during the Verify phase. They follow GSD's gate taxonomy (Pre-flight, Revision, Escalation, Abort) but apply to marketing assets rather than code.

#### Base Gates (applied to every asset)

| Gate | Type | What It Checks |
|------|------|----------------|
| Positioning Drift | Revision | Asset claims align with POSITIONING.md |
| Claim Accuracy | Revision | No unsubstantiated claims |
| Voice Drift | Revision | Tone/voice matches BRAND.md guidelines |
| Outcome Alignment | Pre-flight | Asset has both output metric and outcome metric |
| Funnel Integrity | Revision | CTA matches funnel stage |
| UTM Hygiene | Pre-flight | UTM parameters present and consistent |
| Compliance | Revision | Legal/regulatory requirements met |
| Competitor Collision | Revision | No unintentional competitor messaging overlap |
| ICP Fit | Revision | Language and framing match target ICP |
| Format Correctness | Pre-flight | Asset meets format requirements (length, structure) |

#### Discipline Gates (loaded from playbook)

Each playbook defines additional gates specific to its discipline. Example: SEO playbook adds keyword density gate, meta description length gate, internal linking gate.

#### Meta Gates (portfolio-level)

| Gate | Scope | What It Checks |
|------|-------|----------------|
| Portfolio Balance | Cross-campaign | Channel/funnel stage distribution |
| Calendar Collision | Cross-campaign | No conflicting campaigns in same window |
| Theme Consistency | Cross-campaign | Messaging themes coherent across active campaigns |
| Learning Plan | Cross-campaign | Campaign has measurement plan before shipping |

### Layer 5: Templates

Templates are the empty structures that workflows populate. They are output scaffolds, not instructions.

| Template | Created By | Used By |
|----------|------------|---------|
| campaign-brief.md | brief.md workflow | produce.md, verify.md |
| asset-spec.md | brief.md workflow | produce.md |
| verification-report.md | verify.md workflow | review.md, fix.md |
| measurement-plan.md | brief.md workflow | measure.md |
| measurement-report.md | measure.md workflow | learn.md |
| learning-extract.md | learn.md workflow | Future campaigns |
| positioning-shift-proposal.md | positioning-shift.md | Human review |
| deviation-report.md | verify.md workflow | review.md |

### Layer 6: References (Domain Knowledge)

References are static knowledge files bundled with the skill that inform workflows. Distinct from user-generated reference files (POSITIONING.md, BRAND.md, etc.) which live in `.marketing/`.

| Reference | Purpose |
|-----------|---------|
| gate-definitions.md | Canonical gate types and evaluation criteria |
| attribution-models.md | Three attribution models used in Measure phase |
| funnel-stages.md | Awareness/Consideration/Decision/Retention definitions |
| root-cause-taxonomy.md | Categories for Learn phase root-cause analysis |
| positioning-frameworks.md | April Dunford, Jobs-to-be-Done, etc. for onboarding |
| questioning-patterns.md | Interview question structures for /ttm-init |
| metric-definitions.md | Standard marketing metrics (CAC, LTV, MQL, etc.) |

### Layer 7: User Project State (.marketing/)

All mutable state lives here. This is the equivalent of GSD's `.planning/` directory.

```
.marketing/
├── POSITIONING.md          # THE invariant -- read-only during campaigns
├── BRAND.md                # Voice, tone, visual identity guidelines
├── ICP.md                  # Ideal Customer Profile(s)
├── CHANNELS.md             # Active channels, priorities, cadences
├── COMPETITORS.md          # Competitive landscape
├── METRICS.md              # KPI definitions and targets
├── LEARNINGS.md            # Accumulated lessons (cross-campaign)
├── CALENDAR.md             # Content/campaign calendar
├── STATE.md                # Current operational state
├── CAMPAIGNS/
│   ├── <campaign-slug>/
│   │   ├── BRIEF.md        # Campaign brief (output of Brief phase)
│   │   ├── STATE.md        # Campaign-specific state
│   │   ├── ASSETS/
│   │   │   ├── <asset-slug>.md        # Produced content
│   │   │   ├── <asset-slug>-SPEC.md   # Asset specification
│   │   │   └── <asset-slug>-VERIFY.md # Verification report
│   │   ├── MEASUREMENT.md  # Measurement plan + results
│   │   ├── LEARNINGS.md    # Campaign-specific lessons
│   │   └── ARCHIVE.md      # Post-archive summary
│   └── <campaign-slug>/
│       └── ...
└── ARCHIVE/
    └── <archived-campaign-slug>/
        └── ...
```

---

## Data Flow: How Information Moves Between Phases

### The 9-Phase Campaign Lifecycle Data Flow

```
                    REFERENCE FILES (invariants)
                    POSITIONING.md ─────────────────────────────┐
                    BRAND.md ────────────────────────────────────┤
                    ICP.md ─────────────────────────────────────┤
                    CHANNELS.md ────────────────────────────────┤
                    COMPETITORS.md ─────────────────────────────┤
                    LEARNINGS.md ───────────────────────────────┤
                                                                │
                                                    Loaded into │
                                                    every phase │
                                                                ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 1.       │    │ 2.       │    │ 3.       │    │ 4.       │
│ DISCOVER │───▶│ BRIEF    │───▶│ PRODUCE  │───▶│ VERIFY   │
│          │    │          │    │          │    │          │
│ Output:  │    │ Output:  │    │ Output:  │    │ Output:  │
│ Research │    │ BRIEF.md │    │ Assets   │    │ VERIFY   │
│ notes    │    │ AssetSpec│    │ (content)│    │ reports  │
└──────────┘    │ MeasPlan │    └──────────┘    └────┬─────┘
                └──────────┘                         │
                                                     │
                              ┌───────────────────────┤
                              │                       │
                              ▼                       ▼
                         ┌──────────┐           ┌──────────┐
                         │ 5.       │           │ 6.       │
                         │ REVIEW   │           │ FIX      │◄──┐
                         │ (human)  │           │          │   │
                         │          │           │ Output:  │   │ Max 3
                         │ Output:  │           │ Revised  │   │ loops
                         │ Approval │           │ assets   │───┘
                         │ or notes │           └────┬─────┘
                         └────┬─────┘                │
                              │                      │
                              ▼                      ▼
                         ┌──────────┐    ┌──────────┐    ┌──────────┐
                         │ 7.       │    │ 8.       │    │ 9.       │
                         │ SHIP     │───▶│ MEASURE  │───▶│ LEARN    │
                         │          │    │          │    │          │
                         │ Output:  │    │ Output:  │    │ Output:  │
                         │ Final    │    │ Measure  │    │ Lessons  │
                         │ assets   │    │ report   │    │ Ref edits│
                         └──────────┘    └──────────┘    └──────────┘
                                                                │
                                                                │
                                          ┌─────────────────────┘
                                          ▼
                                   LEARNINGS.md updated
                                   Reference file edits proposed
                                   (with human approval gate)
```

### Phase-by-Phase Data Dependencies

| Phase | Reads (Input) | Writes (Output) | Key Gate |
|-------|---------------|-----------------|----------|
| **1. Discover** | POSITIONING.md, ICP.md, COMPETITORS.md, CHANNELS.md, LEARNINGS.md | Research notes (in campaign dir) | None (exploratory) |
| **2. Brief** | Discovery output, all reference files | BRIEF.md, asset specs, measurement plan | Pre-flight: outcome metric required |
| **3. Produce** | BRIEF.md, asset specs, POSITIONING.md, BRAND.md, ICP.md, relevant playbook | Asset content files | None (creation phase) |
| **4. Verify** | Produced assets, POSITIONING.md, BRAND.md, ICP.md, gate definitions, playbook gates | Verification reports per asset | Revision: all 10 base gates + discipline gates |
| **5. Review** | Verification reports, assets, BRIEF.md | Human approval or revision notes | Escalation: human decision required |
| **6. Fix** | Verification failures, root cause analysis | Revised assets (re-enters Verify) | Abort: cap at 3 fix cycles |
| **7. Ship** | Approved assets, UTM parameters | Final formatted assets for distribution | Pre-flight: all gates passed |
| **8. Measure** | Measurement plan, user-pasted analytics data | Measurement report (3 attribution models) | None (analysis phase) |
| **9. Learn** | Measurement report, campaign history, LEARNINGS.md | Updated LEARNINGS.md, proposed reference file edits | Escalation: human approval for ref file changes |

### Context Loading Strategy (Mirrors GSD's Wave-Parallel Pattern)

The Produce phase is the most context-intensive. Following GSD's pattern:

1. **Fresh context per asset wave** -- Each asset (or small batch) is produced in a fresh context loaded with: BRIEF.md + asset spec + POSITIONING.md + BRAND.md + ICP.md + relevant playbook
2. **No cross-contamination** -- Asset A's drafts don't pollute Asset B's context
3. **Orchestrator stays lean** -- The Produce workflow orchestrates which assets to produce in what order, but delegates actual production to subagent-style fresh contexts

---

## Suggested Directory Structure (Skill Package)

```
takeToMarket/
├── SKILL.md                          # Entry point, metadata, routing
├── commands/                         # Slash commands (/ttm-*)
│   ├── init.md                       # /ttm-init
│   ├── new-campaign.md               # /ttm-new-campaign
│   ├── research.md                   # /ttm-research (Discover phase)
│   ├── brief.md                      # /ttm-brief
│   ├── produce.md                    # /ttm-produce
│   ├── verify.md                     # /ttm-verify
│   ├── review.md                     # /ttm-review
│   ├── fix.md                        # /ttm-fix
│   ├── ship.md                       # /ttm-ship
│   ├── measure.md                    # /ttm-measure
│   ├── learn.md                      # /ttm-learn
│   ├── state.md                      # /ttm-state
│   ├── resume.md                     # /ttm-resume
│   ├── health.md                     # /ttm-health
│   ├── archive.md                    # /ttm-archive
│   ├── positioning-check.md          # /ttm-positioning-check
│   ├── positioning-shift.md          # /ttm-positioning-shift
│   ├── brand-refresh.md              # /ttm-brand-refresh
│   ├── icp-refresh.md                # /ttm-icp-refresh
│   ├── competitor-scan.md            # /ttm-competitor-scan
│   ├── seo-audit.md                  # /ttm-seo-audit
│   ├── aeo-check.md                  # /ttm-aeo-check
│   ├── keyword-map.md                # /ttm-keyword-map
│   ├── email-preflight.md            # /ttm-email-preflight
│   ├── affiliate-kit.md              # /ttm-affiliate-kit
│   └── repurpose.md                  # /ttm-repurpose
├── workflows/                        # Detailed workflow instructions
│   ├── lifecycle/
│   │   ├── discover.md
│   │   ├── brief.md
│   │   ├── produce.md
│   │   ├── verify.md
│   │   ├── review.md
│   │   ├── fix.md
│   │   ├── ship.md
│   │   ├── measure.md
│   │   └── learn.md
│   ├── setup/
│   │   ├── onboarding.md
│   │   └── new-campaign.md
│   ├── utility/
│   │   ├── state.md
│   │   ├── resume.md
│   │   ├── health.md
│   │   └── archive.md
│   ├── reference-mgmt/
│   │   ├── positioning-check.md
│   │   ├── positioning-shift.md
│   │   ├── brand-refresh.md
│   │   ├── icp-refresh.md
│   │   └── competitor-scan.md
│   └── discipline/
│       ├── seo-audit.md
│       ├── aeo-check.md
│       ├── keyword-map.md
│       ├── email-preflight.md
│       ├── affiliate-kit.md
│       └── repurpose.md
├── playbooks/                        # Discipline-specific knowledge
│   ├── seo.md
│   ├── aeo.md
│   ├── youtube.md
│   ├── linkedin.md
│   ├── social.md
│   ├── email.md
│   ├── paid-ads.md
│   ├── affiliate.md
│   ├── pr-media.md
│   └── events.md
├── gates/                            # Quality gate definitions
│   ├── base-gates.md                 # 10 universal gates
│   ├── meta-gates.md                 # Portfolio-level gates
│   └── discipline/                   # Per-discipline gate extensions
│       ├── seo-gates.md
│       ├── email-gates.md
│       └── ...
├── templates/                        # Output scaffolds
│   ├── campaign-brief.md
│   ├── asset-spec.md
│   ├── verification-report.md
│   ├── measurement-plan.md
│   ├── measurement-report.md
│   ├── learning-extract.md
│   ├── positioning-shift-proposal.md
│   ├── deviation-report.md
│   ├── state.md
│   └── reference-files/              # Templates for onboarding output
│       ├── positioning.md
│       ├── brand.md
│       ├── icp.md
│       ├── channels.md
│       ├── competitors.md
│       ├── metrics.md
│       ├── learnings.md
│       └── calendar.md
├── references/                       # Static domain knowledge
│   ├── gate-definitions.md
│   ├── attribution-models.md
│   ├── funnel-stages.md
│   ├── root-cause-taxonomy.md
│   ├── positioning-frameworks.md
│   ├── questioning-patterns.md
│   └── metric-definitions.md
└── scripts/                          # Deterministic tooling (optional)
    └── ttm-tools.cjs                 # State management, template rendering
```

---

## Patterns to Follow (Adapted from GSD)

### Pattern 1: Command -> Workflow Indirection

**What:** Commands are thin entry points. They set up arguments and route to workflow files. Workflows contain the actual multi-step logic.

**Why:** Keeps commands readable as user-facing docs. Allows workflow reuse (e.g., `verify.md` workflow is invoked by both `/ttm-verify` and internally by `/ttm-fix` after re-production).

**How in takeToMarket:**
```markdown
<!-- commands/verify.md -->
---
description: "Verify campaign assets against quality gates"
---

Run the verification workflow for campaign assets.

Read and follow: @workflows/lifecycle/verify.md

Arguments: $ARGUMENTS (campaign slug, optional --asset filter)
```

### Pattern 2: State as Living Memory

**What:** STATE.md tracks current position, last activity, accumulated context. Every workflow reads STATE.md first, every workflow updates STATE.md last.

**Why:** Enables session persistence. User can close Claude, come back hours later, run `/ttm-resume` and pick up exactly where they left off.

**How in takeToMarket:**
```markdown
# .marketing/STATE.md
## Current Position
Active campaign: <slug>
Phase: Produce (3 of 9)
Last activity: 2026-04-21 -- Produced 2 of 4 assets (blog post, LinkedIn carousel)
Next action: Produce remaining 2 assets (email sequence, Twitter thread)

## Campaign Registry
| Campaign | Phase | Status | Last Activity |
|----------|-------|--------|---------------|
| spring-launch | Produce | In progress | 2026-04-21 |
| seo-refresh | Discover | Paused | 2026-04-18 |
```

### Pattern 3: Positioning as Invariant (Unique to takeToMarket)

**What:** POSITIONING.md is loaded into every phase context but is never modified by any workflow. Changes require the explicit `/ttm-positioning-shift` workflow with human approval.

**Why:** The #1 failure mode in marketing is incremental positioning dilution. This is the architectural equivalent of an immutable value -- it can be replaced (via the shift workflow) but never mutated in place.

**How it works:**
1. Every workflow's `<required_reading>` includes POSITIONING.md
2. Verify phase checks each asset against POSITIONING.md (drift gate)
3. If drift detected: deviation report with 3 options (Correct, Accept+log, Escalate to positioning shift)
4. `/ttm-positioning-shift` requires: explicit reasoning, migration plan for in-flight campaigns, human approval

### Pattern 4: Gate Taxonomy (Adapted from GSD)

**What:** Four gate types (Pre-flight, Revision, Escalation, Abort) applied to marketing verification.

**How adapted:**
- **Pre-flight gates** check structural requirements (UTM present, outcome metric defined, format correct) -- cheap, deterministic
- **Revision gates** check quality (positioning alignment, voice consistency, claim accuracy) -- require LLM judgment, loop back with feedback
- **Escalation gates** surface to human (Review phase approval, positioning shift approval, reference file edits from Learn phase)
- **Abort gates** prevent damage (3 fix cycles exhausted, critical positioning violation)

### Pattern 5: Fresh Context Production (from GSD's Wave-Parallel)

**What:** Each asset in the Produce phase gets a fresh context loaded with only its specific inputs: brief + asset spec + positioning + brand + ICP + relevant playbook.

**Why:** Prevents context pollution between assets. A blog post draft shouldn't influence an email sequence. Also manages the 200K token context window efficiently.

**How:** The Produce workflow orchestrator spawns production in isolated contexts, collects results, and updates campaign state.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Monolithic SKILL.md

**What:** Putting all workflow logic, playbooks, and gate definitions into SKILL.md.
**Why bad:** Exceeds context window. Claude loads SKILL.md automatically -- if it's 5000 lines, every interaction wastes tokens.
**Instead:** SKILL.md routes to workflows. Workflows load playbooks and gates on demand. Progressive disclosure: load only what the current phase needs.

### Anti-Pattern 2: Playbook-as-Workflow

**What:** Making playbooks executable (with steps, conditions, loops).
**Why bad:** Playbooks are knowledge, not process. Mixing them creates maintenance hell -- updating SEO best practices shouldn't risk breaking the production workflow.
**Instead:** Playbooks are pure reference. The Produce workflow reads the playbook for context, then follows its own process steps.

### Anti-Pattern 3: Mutable Positioning

**What:** Allowing any workflow to edit POSITIONING.md directly.
**Why bad:** The entire architecture's integrity depends on positioning stability. One accidental edit undermines every future verification.
**Instead:** Only `/ttm-positioning-shift` touches POSITIONING.md, and only after explicit human approval with migration plan.

### Anti-Pattern 4: Shared State Between Campaigns

**What:** Using a single STATE.md for multiple concurrent campaigns without scoping.
**Why bad:** Campaign states overwrite each other. "Current phase" is meaningless when two campaigns are in different phases.
**Instead:** Top-level STATE.md tracks the campaign registry. Each campaign has its own `CAMPAIGNS/<slug>/STATE.md` for campaign-specific state.

---

## Build Order (Dependencies Between Components)

The components have clear dependency chains that dictate build order:

### Tier 1: Foundation (no dependencies)
1. **SKILL.md** -- entry point, must exist first
2. **Reference files** (references/) -- static knowledge, no runtime dependencies
3. **Templates** (templates/) -- output scaffolds, no runtime dependencies
4. **Gate definitions** (gates/base-gates.md) -- quality rules, referenced but not dependent

### Tier 2: Core Lifecycle (depends on Tier 1)
5. **Onboarding workflow** (workflows/setup/onboarding.md) -- generates .marketing/ reference files from templates
6. **State management** (workflows/utility/state.md, resume.md) -- reads/writes STATE.md
7. **New campaign workflow** (workflows/setup/new-campaign.md) -- creates campaign directory structure

### Tier 3: Campaign Phases (depends on Tiers 1-2)
8. **Discover workflow** -- reads reference files, writes research notes
9. **Brief workflow** -- reads discovery output + references, writes BRIEF.md + asset specs
10. **Produce workflow** -- reads brief + playbooks, writes asset content (most complex workflow)
11. **Verify workflow** -- reads assets + gate definitions + playbooks, writes verification reports

### Tier 4: Human Loop & Completion (depends on Tier 3)
12. **Review workflow** -- reads verification reports, facilitates human approval
13. **Fix workflow** -- reads failures, re-invokes Produce + Verify (max 3 loops)
14. **Ship workflow** -- reads approved assets, formats for distribution

### Tier 5: Measurement & Learning (depends on Tier 4)
15. **Measure workflow** -- reads measurement plan + user-pasted data, writes report
16. **Learn workflow** -- reads measurement report + history, updates LEARNINGS.md

### Tier 6: Advanced Features (depends on all above)
17. **Playbooks** (playbooks/) -- discipline-specific knowledge, loaded by Produce/Verify
18. **Discipline-specific gates** (gates/discipline/) -- extensions to base gates
19. **Meta gates** (gates/meta-gates.md) -- cross-campaign verification
20. **Reference management workflows** (positioning-shift, brand-refresh, etc.)
21. **Discipline utility commands** (seo-audit, aeo-check, etc.)
22. **Scripts/tooling** (scripts/) -- state management helpers

### Build Order Rationale

- **Tier 1 first** because everything references these files. You cannot build a workflow without templates and gate definitions to reference.
- **Onboarding before lifecycle** because no campaign workflow works without .marketing/ reference files existing.
- **Discover -> Brief -> Produce -> Verify** is a strict dependency chain -- each phase's output is the next phase's input.
- **Playbooks are Tier 6** (not Tier 1) because the core lifecycle works without them. Playbooks add depth to Produce and Verify but are not structurally required. Build the pipeline first, then enrich it.
- **Scripts are last** because they are optimization. The skill works as pure Markdown prompts first. Add scripts only when deterministic tooling is proven necessary.

---

## GSD Mapping: How takeToMarket Mirrors and Adapts GSD

| GSD Concept | takeToMarket Equivalent | Adaptation |
|-------------|------------------------|------------|
| `.planning/` | `.marketing/` | Same pattern: project-level mutable state directory |
| `ROADMAP.md` (phases) | 9-phase campaign lifecycle | Fixed lifecycle vs. dynamic phases -- campaigns always follow the same 9 phases |
| `PLAN.md` (per phase) | `BRIEF.md` (per campaign) | Brief is the campaign's plan -- what to produce, for whom, why |
| `SUMMARY.md` (execution output) | Asset files + `VERIFY.md` reports | Production output is content, not code |
| `REQUIREMENTS.md` | `POSITIONING.md` + `ICP.md` | Marketing "requirements" are positioning and audience |
| `STATE.md` | `STATE.md` (global + per-campaign) | Two levels: global registry + campaign-specific |
| Wave-parallel execution | Fresh-context asset production | Same principle: isolated contexts, orchestrator coordinates |
| Quality gates (code verification) | Quality gates (marketing verification) | Same taxonomy (Pre-flight/Revision/Escalation/Abort), different criteria |
| `/gsd-new-project` | `/ttm-init` | Interview-driven instead of document-driven |
| `/gsd-execute-phase` | `/ttm-produce` | Production in fresh contexts per asset |
| `/gsd-verify-phase` | `/ttm-verify` | 10 base gates + discipline gates vs. code verification |
| `/gsd-ship` | `/ttm-ship` | Final formatting vs. PR/merge |
| Agent contracts | Completion markers | Same pattern: structured output markers for workflow handoff |
| `references/` (static knowledge) | `references/` + `playbooks/` | Split: domain knowledge (references) vs. discipline knowledge (playbooks) |
| `templates/` (output scaffolds) | `templates/` | Same pattern |
| `workflows/` (process logic) | `workflows/` | Same pattern, organized by category |
| Config (config.json) | Not needed in MVP | Solo user, no parallelization config needed initially |

### Key Divergences from GSD

1. **Fixed lifecycle vs. dynamic phases** -- GSD projects have variable phase counts. takeToMarket campaigns always follow 9 phases. This simplifies state management but means the lifecycle itself is hardcoded in the skill, not configurable.

2. **Two-level state** -- GSD has one STATE.md per project. takeToMarket needs a global STATE.md (campaign registry) + per-campaign STATE.md because multiple campaigns can be in-flight simultaneously at different lifecycle phases.

3. **Positioning invariant** -- GSD has no equivalent. This is takeToMarket's unique architectural constraint and its most important design decision.

4. **Human-in-the-loop phases** -- GSD's Review is optional. takeToMarket's Review (phase 5) and Learn (phase 9) are mandatory human checkpoints. The Review phase cannot be automated because marketing approval requires human judgment.

5. **Measurement is manual** -- GSD can verify code by running tests. takeToMarket cannot measure marketing outcomes programmatically (in MVP). Users paste analytics data, and the Measure workflow analyzes it. This is a fundamentally different verification model.

---

## Sources

- GSD source code directly inspected: `~/.claude/get-shit-done/` (workflows, references, templates, contexts, bin)
- Claude Code plugin-dev skill documentation: `~/.claude/plugins/marketplaces/claude-code-plugins/plugins/plugin-dev/skills/`
- PROJECT.md for takeToMarket requirements and constraints
