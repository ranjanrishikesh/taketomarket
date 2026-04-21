# Feature Research

**Domain:** AI-powered marketing operating system (Claude Code / Codex skill)
**Researched:** 2026-04-21
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist in any marketing skill / campaign management system. Missing these = the skill feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Guided onboarding (`/ttm-init`)** | Users need a zero-friction way to bootstrap their marketing context; interview-driven is standard in AI tools (Jasper, Copy.ai all do guided setup) | MEDIUM | Must generate POSITIONING.md, BRAND.md, ICP.md, CHANNELS.md, COMPETITORS.md, METRICS.md. GSD pattern: structured questions, file generation. |
| **Campaign lifecycle with clear phases** | Every campaign tool has a workflow (brief > create > review > publish > measure). Without phases, users are just chatting with an LLM. | HIGH | 9 phases (Discover > Brief > Produce > Verify > Review > Fix > Ship > Measure > Learn). The phased approach is what makes this a "system" not a "prompt." |
| **Slash commands per phase** | Claude Code skills are invoked via slash commands. Users expect one command per action, not multi-step instructions they type manually. | MEDIUM | `/ttm-new-campaign`, `/ttm-brief`, `/ttm-produce`, `/ttm-verify`, `/ttm-review`, `/ttm-fix`, `/ttm-ship`, `/ttm-measure`, `/ttm-learn` |
| **Persistent campaign state** | Sessions end; work must survive. GSD proved `.planning/` state persistence is the pattern users expect in Claude Code skills. | MEDIUM | `CAMPAIGNS/<slug>/` directory with state files (brief.md, assets/, verify-report.md, etc.). STATE.md tracks phase, blockers, history. |
| **Brand voice / style context loading** | Every AI content tool (Jasper, Writer, Typeface) loads brand context. Without it, output is generic. | LOW | BRAND.md loaded into every production context. Includes tone, vocabulary, do/don't lists. |
| **Multi-channel content production** | Users expect to produce content for multiple channels from a single campaign brief. One-channel-only feels limiting. | MEDIUM | Blog, email, social (LinkedIn, Twitter/X), ad copy. Playbooks per channel define format rules. |
| **Content review and feedback loop** | Human-in-the-loop review is expected. Pure auto-generation without review gates feels reckless for marketing teams. | LOW | Review phase presents assets, collects feedback, routes to Fix or Ship. |
| **Basic measurement integration** | Users need to close the loop (did this work?). Even manual data entry suffices for MVP — but the analysis must exist. | MEDIUM | Manual paste of analytics data. Skill analyzes against outcome metrics defined in the brief. |
| **Reference file management** | Users need to update their positioning, ICP, competitors over time. Stale reference files = stale output. | LOW | `/ttm-brand-refresh`, `/ttm-icp-refresh`, `/ttm-competitor-scan`, `/ttm-positioning-check` |
| **Campaign archival and history** | Users need to see past campaigns, resume interrupted ones, and archive completed ones. | LOW | `/ttm-archive`, `/ttm-resume`, `/ttm-state` |
| **Template/format correctness per channel** | Each channel has format constraints (character limits, image specs, email structure). Users expect the skill to know these. | LOW | Encoded in discipline playbooks. Verified in quality gates (format correctness gate). |

### Differentiators (Competitive Advantage)

Features that set takeToMarket apart from Jasper, generic AI content tools, and other marketing skills. These are the "why use this instead of just prompting Claude directly" features.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Positioning-as-invariant enforcement** | The #1 failure mode in marketing is incremental positioning dilution. No other tool treats positioning as a read-only invariant during campaigns. Jasper has "brand voice" but it's a suggestion, not an enforcement gate. takeToMarket makes positioning a hard constraint: every asset is verified against POSITIONING.md, deviations are flagged with 3 options (Correct, Accept+log, Escalate to positioning shift). This is the core differentiator. | HIGH | POSITIONING.md is loaded into every phase context. Verify phase runs positioning drift detection. `/ttm-positioning-shift` requires explicit reasoning, migration plan, and human approval. Monthly audit samples recent assets. |
| **Outcome-over-output enforcement** | Most AI content tools measure "did we produce the thing?" takeToMarket requires every asset to have both an output metric (was it published?) AND an outcome metric (did it drive signups/traffic/conversion?). This forces strategic thinking at brief time, not after the fact. | MEDIUM | Brief phase requires outcome metric definition. Measure phase reports outcome first, output second. Assets cannot pass Ship without defined outcome metrics. |
| **Quality gate wall (10+ gates per asset)** | Jasper has "brand voice check." takeToMarket has a full gate wall: positioning drift, claim accuracy, voice drift, outcome alignment, funnel integrity, UTM hygiene, compliance, competitor collision, ICP fit, format correctness. Plus discipline-specific gates per playbook. This is systematic verification, not a vibe check. | HIGH | Each gate returns pass/fail with explanation. All gates must pass or have explicit human override. Results persist in verify-report.md. |
| **Fix-as-you-go with root cause analysis** | Most tools: "try again." takeToMarket: root cause diagnosis > specific fix brief > isolated re-production > re-verification. Capped at 3 attempts to prevent infinite loops. This treats content failures like engineering bugs, not bad luck. | MEDIUM | Fix phase generates a fix brief explaining what failed and why. Re-production happens in fresh context with fix brief loaded. 3-attempt cap prevents wasted tokens. |
| **Compound learning system** | LEARNINGS.md with root-cause taxonomy and pattern extraction. Each campaign's Learn phase proposes edits to reference files (positioning, ICP, brand) based on measured outcomes. The system gets smarter over time. No AI content tool does this — they treat each generation as independent. | HIGH | Learn phase extracts lessons from Measure results. Proposes reference file edits with human approval. Root-cause taxonomy prevents repeating the same mistakes. LEARNINGS.md is loaded into Brief phase of future campaigns. |
| **Discipline-specific playbooks with custom gates** | Not just "write a blog post" — full SEO playbook (keyword research, SERP analysis, internal linking, schema markup), AEO playbook (AI engine optimization), YouTube playbook (script structure, thumbnail brief, metadata), etc. Each playbook adds discipline-specific quality gates. | HIGH | 10 playbooks: SEO, AEO, YouTube, LinkedIn, Social, Email, Paid Ads, Affiliate, PR/Media, Events. Each adds 3-5 custom quality gates beyond the base 10. |
| **Content repurposing pipeline** | `/ttm-repurpose` takes a long-form asset and generates derivatives across channels with positioning and voice consistency maintained. Not just "summarize for Twitter" — full brief > produce > verify cycle per derivative. | MEDIUM | Generates derivative briefs from source asset. Each derivative goes through the same quality gate wall. Maintains attribution chain back to source. |
| **Meta-gates (portfolio-level verification)** | Beyond individual asset quality: portfolio balance (not all top-of-funnel), calendar collision detection (don't publish competing pieces same week), theme consistency, learning plan alignment. These are strategic checks no content tool does. | MEDIUM | Run at campaign creation and before Ship. Require access to CALENDAR.md and other active campaigns. |
| **Deviation reports with structured resolution** | When positioning drift is detected, the user gets 3 clear options: Correct (fix the asset), Accept+log (ship with documented deviation), Escalate (trigger `/ttm-positioning-shift`). This turns subjective "is this on brand?" into a structured decision with audit trail. | LOW | Integrated into Verify phase. Deviations logged in campaign state for Learn phase analysis. |
| **Wave-parallel production in fresh contexts** | GSD-inspired architecture: complex campaigns split into waves, each wave produced in a fresh 200K-token context loaded only with brief + positioning + brand + ICP + playbook. Prevents context rot that degrades quality in long sessions. | MEDIUM | Borrowed directly from GSD. Each wave is an atomic unit. Results merged back into campaign state. |

### Anti-Features (Deliberately NOT Building)

Features that seem appealing but would undermine the skill's value proposition, add unwarranted complexity, or violate the "skill, not SaaS" constraint.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time analytics dashboard** | "I want to see campaign performance in one place" | This is a SaaS feature, not a skill feature. Claude Code skills write files and run commands — they don't serve web UIs. Building a dashboard means building an app, which is out of scope. Analytics tools (GA, Mixpanel, PostHog) already exist. | Measure phase: user pastes analytics data, skill generates analysis reports as markdown files. Reports are the "dashboard." |
| **Direct publishing / scheduling integration** | "Let the skill publish directly to WordPress / Buffer / social platforms" | External API integrations add fragile dependencies, auth management, and failure modes. The skill should produce verified assets and hand them off. Publishing tools are a separate concern. | Ship phase generates publish-ready files with metadata (title, description, tags, UTMs, scheduled date). User publishes via their existing tools. |
| **MCP-dependent core functionality** | "Connect to GA/GSC/HubSpot via MCP for automated measurement" | MCP availability varies across environments. Making core features depend on MCP means the skill breaks for users without those MCPs configured. | Manual measurement for MVP. MCP integrations as optional enhancers in V2 — the skill works without them, works better with them. |
| **Team collaboration / concurrent editing** | "Multiple marketers should be able to work on the same campaign" | File-based state has no locking mechanism. Concurrent edits cause conflicts. Team features require a coordination layer (server, database) that's antithetical to the skill model. | Solo-first design. Team features deferred to V2 with explicit scope. |
| **Automated competitor monitoring** | "Scan competitors weekly and alert me" | Cron jobs, web scraping, and persistent monitoring are server features, not skill features. Skills run when invoked, not in the background. | `/ttm-competitor-scan` command that user runs on-demand. Competitor data is manual input, skill analyzes and updates COMPETITORS.md. |
| **Visual design / creative asset generation** | "Generate images, videos, design mockups" | Claude Code is a text-based environment. Image generation requires external APIs (DALL-E, Midjourney) with unpredictable quality. Design is a separate discipline. | Produce phase generates creative briefs for designers (image specs, copy placement, color guidance). Design handoff, not design generation. |
| **A/B test management** | "Set up and track A/B tests for my campaigns" | A/B testing requires traffic splitting, statistical significance calculation, and real-time data collection — all infrastructure concerns. | Brief phase can include variant specifications. Measure phase can analyze results from manually pasted A/B test data. The testing infrastructure itself is out of scope. |
| **CRM integration / lead scoring** | "Connect to my CRM and score leads from campaigns" | CRM integration is a SaaS feature requiring auth, API management, and data sync. Beyond skill scope. | Campaign briefs can specify CRM tagging conventions. Measure phase can analyze CRM export data pasted by user. |
| **Auto-generated campaign ideas** | "Generate campaign ideas for me without a brief" | Undermines the spec-driven approach. Auto-generated ideas lack strategic intent, outcome metrics, and positioning alignment. This produces output without outcomes — the exact anti-pattern takeToMarket fights. | Discover phase (`/ttm-research`) does market/audience research to inform the user's campaign ideation. The human defines strategic intent; the skill executes it. |
| **"One-click campaign" generation** | "Generate a full campaign from a single sentence" | Looks impressive in demos, produces generic content in practice. Skips the brief, skips quality gates, skips outcome definition. This is the content-mill approach takeToMarket exists to replace. | The 9-phase lifecycle IS the product. Each phase adds quality. Shortcuts undermine the value proposition. Speed comes from the skill handling the execution, not from skipping the thinking. |

## Feature Dependencies

```
[Onboarding (/ttm-init)]
    |
    |-- generates --> [POSITIONING.md, BRAND.md, ICP.md, CHANNELS.md, COMPETITORS.md, METRICS.md]
    |                      |
    |                      |-- required by --> [Campaign Lifecycle (all phases)]
    |                                              |
    |                                              |-- Discover --> Brief --> Produce --> Verify --> Review --> Fix --> Ship --> Measure --> Learn
    |                                                                 |                    |                    |                          |
    |                                                                 |                    |                    |                          |
    |                                                                 v                    v                    v                          v
    |                                                          [Playbooks]          [Quality Gates]      [Fix Brief +             [LEARNINGS.md
    |                                                          (discipline-          (base + discipline    Re-verify]              + Reference
    |                                                           specific)             specific)                                    File Updates]
    |
    [State Management (/ttm-state, /ttm-resume)]
        |-- requires --> [CAMPAIGNS/<slug>/ directory structure]
        |-- requires --> [STATE.md tracking]

[Content Repurposing (/ttm-repurpose)]
    |-- requires --> [Completed source asset (has passed Verify)]
    |-- triggers --> [Brief > Produce > Verify per derivative]

[Positioning Shift (/ttm-positioning-shift)]
    |-- requires --> [POSITIONING.md exists]
    |-- triggers --> [Migration plan for active campaigns]

[Meta-Gates]
    |-- requires --> [CALENDAR.md]
    |-- requires --> [Multiple campaigns in system]
```

### Dependency Notes

- **Onboarding requires nothing:** It is the entry point. All other features depend on the reference files it generates.
- **Campaign lifecycle requires onboarding:** Cannot brief, produce, or verify without POSITIONING.md, BRAND.md, ICP.md.
- **Quality gates require playbooks:** Discipline-specific gates are defined in playbooks. Base gates work without playbooks.
- **Fix phase requires Verify phase:** Fix is triggered by failed quality gates. No failures = no fix needed.
- **Learn phase requires Measure phase:** Cannot extract lessons without outcome data.
- **Repurposing requires a verified source asset:** Cannot repurpose unverified content (would propagate quality issues).
- **Meta-gates require multiple campaigns:** Portfolio balance and calendar collision need campaign history. Low value for first campaign.
- **Compound learning requires campaign history:** LEARNINGS.md value compounds over time. First campaign generates first lessons; fifth campaign benefits from all prior lessons.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the core thesis that spec-driven marketing with positioning invariance produces better outcomes than ad-hoc AI content generation.

- [ ] **Onboarding (`/ttm-init`)** — Interview-driven generation of all reference files. Without this, users cannot start.
- [ ] **Campaign creation (`/ttm-new-campaign`)** — Creates campaign directory, initializes state, links to reference files.
- [ ] **Brief phase (`/ttm-brief`)** — Generates campaign brief with output AND outcome metrics. This is where outcome-over-output is enforced.
- [ ] **Produce phase (`/ttm-produce`)** — Generates content assets in fresh contexts with brief + positioning + brand + ICP loaded. Wave-parallel for multi-asset campaigns.
- [ ] **Verify phase (`/ttm-verify`)** — Quality gate wall with base 10 gates. Pass/fail per gate. Deviation reports with 3 options.
- [ ] **Review phase (`/ttm-review`)** — Human review with structured feedback collection.
- [ ] **Fix phase (`/ttm-fix`)** — Root cause > fix brief > re-produce > re-verify. 3-attempt cap.
- [ ] **Ship phase (`/ttm-ship`)** — Marks assets as shipped, generates publish-ready output with metadata.
- [ ] **State management (`/ttm-state`, `/ttm-resume`)** — Persist and resume campaign state across sessions.
- [ ] **POSITIONING.md as invariant** — Loaded into every phase, drift detection in Verify, deviation reports.
- [ ] **2-3 discipline playbooks** — Start with SEO, Email, and LinkedIn (highest demand, most structured formats). Add others post-validation.

### Add After Validation (v1.x)

Features to add once the core lifecycle is working and users confirm the approach.

- [ ] **Measure phase (`/ttm-measure`)** — Manual data paste + analysis against outcome metrics. Trigger: users completing Ship and wanting to close the loop.
- [ ] **Learn phase (`/ttm-learn`)** — Extract lessons, propose reference file edits. Trigger: users completing Measure and wanting compound improvement.
- [ ] **Remaining playbooks** — AEO, YouTube, Social, Paid Ads, Affiliate, PR/Media, Events. Trigger: user demand for specific channels.
- [ ] **Content repurposing (`/ttm-repurpose`)** — Long-form to derivatives pipeline. Trigger: users producing long-form content and wanting channel coverage.
- [ ] **Meta-gates** — Portfolio balance, calendar collision, theme consistency. Trigger: users running 3+ campaigns.
- [ ] **Positioning shift workflow (`/ttm-positioning-shift`)** — Structured repositioning with migration plan. Trigger: users hitting positioning drift they want to embrace.
- [ ] **Reference refresh commands** — `/ttm-brand-refresh`, `/ttm-icp-refresh`, `/ttm-competitor-scan`. Trigger: reference files becoming stale.
- [ ] **Discover phase (`/ttm-research`)** — Market/audience research before briefing. Trigger: users wanting research-informed briefs.

### Future Consideration (v2+)

Features to defer until the skill has proven its value and user base.

- [ ] **MCP integrations** — GA, GSC, HubSpot, Search Console for automated measurement. Why defer: adds external dependencies, MVP must work without them.
- [ ] **Team/concurrent editing** — Locks, conflict resolution, shared state. Why defer: requires coordination infrastructure beyond file-based state.
- [ ] **Automated competitor monitoring** — Periodic scanning and alerting. Why defer: requires background execution, not a skill capability.
- [ ] **AEO citation tracker** — Crawl AI engines for brand mentions. Why defer: complex external dependency, niche use case.
- [ ] **Monthly positioning audit automation** — Scheduled sampling of recent assets. Why defer: cron-like behavior is a V2 concern; manual `/ttm-positioning-check` suffices.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Onboarding (`/ttm-init`) | HIGH | MEDIUM | P1 |
| Campaign lifecycle (9 phases) | HIGH | HIGH | P1 |
| Positioning-as-invariant | HIGH | MEDIUM | P1 |
| Quality gate wall (base 10) | HIGH | HIGH | P1 |
| State persistence | HIGH | MEDIUM | P1 |
| Outcome-over-output enforcement | HIGH | LOW | P1 |
| Fix-as-you-go with root cause | MEDIUM | MEDIUM | P1 |
| SEO playbook | HIGH | MEDIUM | P1 |
| Email playbook | HIGH | MEDIUM | P1 |
| LinkedIn playbook | MEDIUM | MEDIUM | P1 |
| Wave-parallel production | MEDIUM | MEDIUM | P2 |
| Content repurposing | MEDIUM | MEDIUM | P2 |
| Measure phase | HIGH | MEDIUM | P2 |
| Learn phase + LEARNINGS.md | HIGH | HIGH | P2 |
| Meta-gates | MEDIUM | MEDIUM | P2 |
| Deviation reports (3 options) | MEDIUM | LOW | P1 |
| Positioning shift workflow | LOW | MEDIUM | P2 |
| Remaining 7 playbooks | MEDIUM | HIGH | P2 |
| Reference refresh commands | LOW | LOW | P2 |
| Discover phase | MEDIUM | MEDIUM | P2 |
| MCP integrations | MEDIUM | HIGH | P3 |
| Team features | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — validates the core thesis
- P2: Should have, add after core lifecycle works
- P3: Nice to have, future consideration after product-market fit

## Competitor Feature Analysis

| Feature | Jasper AI | Writer.com | Generic "AI Marketing" prompts | takeToMarket |
|---------|-----------|------------|-------------------------------|--------------|
| Brand voice loading | Yes (Style Guide) | Yes (brand graph) | User pastes context manually | BRAND.md + POSITIONING.md loaded automatically into every phase |
| Quality gates | Basic (brand voice check) | Basic (tone/style) | None | 10+ base gates + discipline-specific gates per playbook |
| Campaign lifecycle | Brief > Generate > Publish | Template > Generate > Review | None (single-shot generation) | 9-phase lifecycle with state persistence |
| Positioning enforcement | Suggestions only | Terminology enforcement | None | Hard invariant with deviation reports and 3 structured options |
| Outcome metrics | Analytics dashboard (separate) | None | None | Required at brief time, verified at measure time |
| Fix workflow | "Regenerate" button | "Revise" with notes | Re-prompt | Root cause > fix brief > isolated re-production > re-verify (3-attempt cap) |
| Learning system | None | None | None | LEARNINGS.md with root-cause taxonomy, reference file update proposals |
| Multi-channel | Template library per channel | Channel-specific generation | Manual per channel | Discipline playbooks with channel-specific quality gates |
| Content repurposing | Content Pipelines (auto-variation) | Cross-channel adaptation | Manual | Full brief > produce > verify cycle per derivative |
| Pricing | $49-$125/mo SaaS | Enterprise SaaS | Free (just prompts) | Free and open source (skill install) |
| Runs where | Browser (their cloud) | Browser (their cloud) | Any chat interface | User's Claude Code / Codex environment (local) |

## Sources

- [Jasper AI](https://www.jasper.ai/) — Content pipelines, brand voice, campaign management features
- [Typeface AI](https://www.typeface.ai/blog/content-quality-control-in-ai-marketing-enterprise-governance-and-best-practices) — Content quality control and governance patterns
- [GSD (Get Shit Done)](https://github.com/gsd-build/get-shit-done) — Meta-prompting architecture, state management, quality gates, wave-parallel execution
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) — Skill architecture, slash commands, state management
- [DOJO AI Marketing OS Guide](https://www.dojoai.com/blog/what-is-a-marketing-operating-system-the-complete-2026-guide) — Marketing OS feature landscape
- [Spinta Digital AI Marketing OS](https://spintadigital.com/blog/ai-marketing-os/) — AI marketing OS architecture patterns
- [Averi AI](https://www.averi.ai/learn/how-to-maintain-brand-consistency-in-ai-generated-marketing-content) — Brand consistency enforcement in AI content
- [Growth Rocket](https://www.growth-rocket.com/blog/how-to-maintain-brand-voice-with-ai-workflows/) — Quality control in AI-powered marketing workflows

---
*Feature research for: AI-powered marketing operating system (Claude Code skill)*
*Researched: 2026-04-21*
