# Pitfalls Research

**Domain:** Claude Code marketing operating system skill (prompt-engineered, file-based, multi-playbook)
**Researched:** 2026-04-21
**Confidence:** HIGH (grounded in GSD architecture analysis, Claude Code skill docs, and prompt engineering research)

## Critical Pitfalls

### Pitfall 1: Context Window Bloat from Reference File Loading

**What goes wrong:**
Every phase of the 9-phase lifecycle loads POSITIONING.md + BRAND.md + ICP.md + playbook + brief + state into context. With 10 playbooks, each containing discipline-specific gates, the combined reference material easily exceeds the effective context budget. Research shows LLM reasoning degrades around 3,000 tokens of system instructions, and accuracy drops 30%+ when critical information sits in the middle of a large context. The skill stops producing quality output not because the prompts are wrong, but because the model cannot attend to all the loaded files simultaneously.

**Why it happens:**
The instinct is "more context = better output." Developers load every reference file into every command because they want positioning-invariant enforcement everywhere. But context is a budget, not a container -- filling it with reference files leaves no room for the actual creative work.

**How to avoid:**
- Design a two-tier reference system: compact summaries (under 200 words each) that load into every command, with full files loaded only when a specific phase needs them.
- POSITIONING.md should have a "positioning brief" section (3-5 bullet points, under 100 words) that loads universally. The full positioning document only loads during Verify and positioning-shift workflows.
- Each playbook loads ONLY its own discipline gates, never all 10 playbooks.
- Place critical instructions at the TOP of loaded context (primacy bias) and verification criteria at the BOTTOM (recency bias). Never bury critical rules in the middle.
- Budget tokens explicitly: brief (500), positioning summary (100), brand summary (100), ICP summary (100), playbook (800), gates (400) = ~2,000 tokens of reference, leaving 95%+ of context for actual work.

**Warning signs:**
- Claude starts producing generic marketing copy instead of positioning-specific output.
- Quality gates pass content that clearly violates positioning (the model is not actually reading the positioning file).
- Verify phase produces inconsistent results across runs.
- Claude refers to positioning principles vaguely ("aligned with your brand") rather than citing specific positioning claims.

**Phase to address:**
Phase 1 (Foundation) -- the reference file schema and loading strategy must be designed before any commands are built.

---

### Pitfall 2: Quality Gates That Judge Their Own Output (Self-Evaluation Bias)

**What goes wrong:**
The same Claude session that produces content in the Produce phase then runs quality gates in the Verify phase. LLM self-evaluation is systematically biased: the model rates its own output higher, overlooks its own positioning drift, and exhibits length bias (longer = better). The quality gate wall becomes a rubber stamp rather than a genuine check. Research confirms LLM-as-judge evaluators have known biases including verbosity preference and inconsistency across runs.

**Why it happens:**
It is architecturally simpler to run produce-then-verify in one session. The developer assumes "different phase = different evaluation" but the model carries its own generation biases into the evaluation context.

**How to avoid:**
- Verify phase MUST run in a fresh context, not the same session as Produce. This is the GSD "wave-parallel" pattern: produce in one context, verify in another.
- Load the brief + positioning + gates into the Verify context WITHOUT loading the production prompt or reasoning. The verifier sees only the output and the criteria.
- Design gates as binary rubrics with specific, checkable criteria ("Does the headline contain the primary differentiator keyword?" YES/NO) rather than subjective assessments ("Is the content aligned with brand voice?" which always passes).
- Include at least one structural/mechanical gate per asset (UTM format, word count, CTA presence) that is objectively verifiable and catches lazy passes.
- Cap the fix loop at 3 attempts (already planned) but also track gate-pass rates over time. If a gate passes 95%+ of content, it is too lenient.

**Warning signs:**
- All 10 gates pass on first attempt regularly (real quality gates catch issues 30-50% of the time initially).
- Fix phase is rarely triggered.
- Users report that shipped content doesn't feel "on-brand" despite passing all gates.
- Positioning drift gate passes content that uses competitor language.

**Phase to address:**
Phase 2 (Core lifecycle) -- the Produce/Verify separation must be enforced architecturally, not just documented.

---

### Pitfall 3: Monolithic Skill File That Exceeds Claude's Attention Budget

**What goes wrong:**
A single skill.md file tries to contain all 20+ slash commands, all 10 playbook definitions, all quality gate criteria, onboarding logic, state management rules, and the campaign lifecycle. Claude Code truncates skill descriptions when there are many skills, stripping the keywords needed for correct command matching. Users invoke the wrong command or Claude fails to match the right skill.

**Why it happens:**
It feels cleaner to have "one file that defines everything." Early development works fine with 3-4 commands. By the time there are 20+ commands, the skill file is 5,000+ lines and Claude cannot effectively attend to it all. The official Claude Code docs confirm that skill descriptions get shortened to fit the character budget when there are many skills.

**How to avoid:**
- Split into a hierarchical skill architecture: one root skill.md with command routing logic (under 300 lines), then separate skill files per command group (lifecycle commands, reference management commands, discipline commands, state commands).
- Each slash command should have its own minimal `.claude/commands/ttm-*.md` file that contains ONLY that command's logic. The command file reads reference files from disk at runtime rather than inlining them.
- Use the GSD pattern: command files contain process steps, not reference material. Background context lives in separate reference files loaded on demand.
- Keep trigger descriptions SHORT and keyword-dense. "/ttm-verify: Run quality gate wall against campaign assets" not "/ttm-verify: This command runs the comprehensive quality gate verification process that checks positioning alignment, brand voice consistency, claim accuracy..."

**Warning signs:**
- Users report that Claude invokes the wrong `/ttm-*` command.
- Adding a new playbook requires editing 5+ locations in the skill file.
- The skill.md file exceeds 2,000 lines.
- Claude "forgets" rules from earlier in the skill file during execution.

**Phase to address:**
Phase 1 (Foundation) -- the file architecture must be modular from day one. Retrofitting modularity into a monolithic skill is a rewrite.

---

### Pitfall 4: Positioning Drift Detection That Cannot Actually Detect Drift

**What goes wrong:**
The positioning-as-invariant system is the core value proposition, but LLM-based drift detection is fundamentally fuzzy. The system flags benign rephrasing as drift (false positives that erode trust) while missing genuine semantic drift (false negatives that defeat the purpose). After a few false alarms, users learn to dismiss all drift warnings, making the entire system useless.

**Why it happens:**
Positioning drift is a semantic judgment, not a syntactic check. "We help teams ship faster" vs. "We accelerate team velocity" -- is this drift or rephrasing? Without a structured comparison framework, the LLM makes inconsistent calls. Research shows the same LLM judge can score the same content differently across runs.

**How to avoid:**
- Define positioning as a structured checklist, not prose. POSITIONING.md should contain: (1) Primary differentiator claim (exact phrase), (2) Category (exact phrase), (3) Target audience (exact phrase), (4) 3-5 "must include" proof points, (5) 3-5 "must not say" competitor-collision terms.
- Drift detection checks against these specific fields, not against the overall document. "Does the asset contain the primary differentiator claim or a close synonym?" is checkable. "Does the asset align with our positioning?" is not.
- Implement a three-tier result: PASS (claim present), WARN (claim absent but no contradiction), FAIL (contradicts positioning or uses competitor-collision terms). Only FAIL blocks shipping.
- Log all WARN results to LEARNINGS.md so users can review patterns and adjust thresholds.

**Warning signs:**
- Users report "positioning drift" warnings on content they consider on-brand.
- Users start using `/ttm-fix` to change content back and forth without converging.
- Deviation reports pile up with "Accept+log" chosen 90%+ of the time.

**Phase to address:**
Phase 2 (Core lifecycle, Verify phase implementation) and Phase 3 (Playbook expansion) -- drift detection must be tested against real marketing content, not just synthetic examples.

---

### Pitfall 5: Onboarding Interview That Produces Low-Quality Reference Files

**What goes wrong:**
`/ttm-init` asks structured questions and generates POSITIONING.md, BRAND.md, ICP.md, and 6+ other reference files. But interview-driven generation produces files that are "plausible but wrong" -- generic positioning that sounds like every B2B SaaS company, ICPs that describe demographics without psychographics, brand voice guidelines that are vague platitudes. Every downstream phase inherits these low-quality foundations, and the system enforces consistency with bad positioning.

**Why it happens:**
Users answer onboarding questions quickly and superficially. The LLM fills gaps with generic marketing language. The generated files look complete (all sections filled) but lack the specificity that makes them useful. Nobody validates the generated files before running their first campaign.

**How to avoid:**
- Build a validation step into `/ttm-init` that scores each generated file for specificity. Reject files that contain generic phrases ("innovative solution", "best-in-class", "seamless experience") and force the user to provide concrete differentiators.
- Include a "positioning stress test" in onboarding: generate 3 sample headlines using the positioning file and ask the user "Do these sound like YOUR company or could they be anyone?" If the user says "anyone," the positioning is too generic.
- Provide example reference files (anonymized) showing what GOOD positioning looks like vs. BAD positioning. Show the difference between "We help teams collaborate better" (bad) and "We reduce code review cycle time from 3 days to 3 hours for engineering teams over 50 people" (good).
- Make reference file editing a first-class workflow, not a one-time setup. Users should expect to refine files over their first 3 campaigns.

**Warning signs:**
- Generated POSITIONING.md could describe any company in the same category.
- ICP.md lists job titles but not pain points, buying triggers, or objections.
- BRAND.md voice guidelines are "professional but approachable" (every brand says this).
- First campaign output is generic despite passing all quality gates.

**Phase to address:**
Phase 1 (Foundation) -- onboarding quality directly determines all downstream output quality.

---

### Pitfall 6: State File Corruption and Stale State Across Sessions

**What goes wrong:**
Campaign state lives in `CAMPAIGNS/<slug>/` directories with multiple state files. Claude reads state at session start but does not re-read during long sessions. State files get partially written (Claude's session ends mid-write), resulting in malformed markdown. Users resume a campaign in a new session and Claude picks up stale state, repeating completed phases or skipping required ones.

**Why it happens:**
File-based state without transactions means writes are not atomic. Claude does not lock files. If a user runs `/ttm-resume` and Claude reads STATE.md before the previous session's final write completed, it operates on stale data. Nested CLAUDE.md files in subdirectories are not re-injected automatically -- they reload only when Claude reads a file in that subdirectory.

**How to avoid:**
- Design state files with a single source of truth: one `STATE.md` per campaign with a clear `current_phase:` frontmatter field and a `last_updated:` timestamp. Every command reads STATE.md FIRST and validates it before proceeding.
- Use append-only state logs: instead of overwriting state, append phase transitions to a log. The current state is always the last entry. Partial writes corrupt only the last entry, not the entire file.
- Implement a `/ttm-health` command (already planned) that validates state file integrity: correct markdown structure, valid phase values, no orphaned campaigns.
- Write state atomically: write to a temp file, then rename (the GSD `gsd-tools.cjs` pattern).

**Warning signs:**
- Users report "I already did that phase" after `/ttm-resume`.
- STATE.md contains malformed markdown (truncated lines, missing closing tags).
- Campaign directories exist but STATE.md is empty or missing.
- `/ttm-state` shows a campaign in "Produce" but the Produce output files already exist.

**Phase to address:**
Phase 1 (Foundation) -- state management is infrastructure that must work before any lifecycle phases are built on top of it.

---

### Pitfall 7: Playbook Explosion -- 10 Disciplines Means 10x the Maintenance

**What goes wrong:**
Each of the 10 discipline playbooks (SEO, AEO, YouTube, LinkedIn, Social, Email, Paid Ads, Affiliate, PR/Media, Events) needs its own quality gates, production templates, verification criteria, and measurement frameworks. Changes to the core lifecycle require updating all 10 playbooks. A bug fix in the Verify phase means testing against 10 different gate sets. The maintenance burden grows multiplicatively, not additively.

**Why it happens:**
The initial design treats playbooks as independent modules. But they share the 9-phase lifecycle, they share the quality gate framework, they share the state management system. Without a proper inheritance/composition model, each playbook duplicates shared logic with slight variations. Over time, playbooks diverge silently.

**How to avoid:**
- Design a playbook inheritance model: a `base-playbook.md` defines the shared lifecycle, shared gates (positioning drift, claim accuracy, voice drift, outcome alignment), and shared state format. Each discipline playbook EXTENDS the base with discipline-specific additions only.
- Discipline-specific gates are ADDITIVE, not replacements. SEO adds "keyword density check" and "title tag length check" to the base gates. It does not redefine positioning drift checking.
- Start with 2-3 playbooks in MVP (SEO, Email, LinkedIn -- highest demand, lowest complexity). Add remaining playbooks one at a time in later phases, validating the inheritance model works before scaling.
- Version playbooks. When the base lifecycle changes, a version bump propagates to all discipline playbooks.

**Warning signs:**
- Fixing a bug in one playbook requires manually fixing it in 9 others.
- Different playbooks produce different state file formats.
- Users report inconsistent behavior across disciplines.
- Adding an 11th playbook requires more than creating one new file.

**Phase to address:**
Phase 3 (Playbook expansion) -- but the inheritance model must be DESIGNED in Phase 1 and VALIDATED with 2-3 playbooks in Phase 2 before scaling to 10.

---

### Pitfall 8: Outcome Metrics That Cannot Be Measured

**What goes wrong:**
The system enforces "outcome over output" -- every asset requires an outcome metric. But the outcome metrics generated by the system are often unmeasurable in the manual-paste MVP: "Increase brand awareness by 15%" (how do you paste that?), "Improve consideration stage conversion" (requires multi-touch attribution). Users paste vanity metrics to satisfy the gate, and the Measure phase becomes theater.

**Why it happens:**
There is a fundamental tension between aspirational marketing outcomes (brand awareness, consideration, preference) and what a solo marketer can actually measure with manual analytics paste. The system does not constrain outcome metrics to measurable outcomes.

**How to avoid:**
- Define a taxonomy of measurable outcome metrics per discipline. SEO: organic traffic to target page, keyword ranking position, click-through rate. Email: open rate, click rate, conversion on landing page. LinkedIn: engagement rate, profile visits, connection requests.
- Constrain outcome metrics to things measurable with Google Analytics, Google Search Console, LinkedIn Analytics, or email platform dashboards -- the tools a solo marketer actually has.
- Distinguish between "leading indicators" (measurable now, paste-able) and "lagging outcomes" (measurable over time, tracked in LEARNINGS.md). The quality gate checks leading indicators. Lagging outcomes are aspirational, not gated.
- Provide example outcome metrics per playbook so users do not invent unmeasurable ones.

**Warning signs:**
- Users skip the Measure phase because they cannot get the data.
- Outcome metrics are copy-pasted from marketing textbooks rather than connected to real dashboards.
- LEARNINGS.md is empty because no campaigns complete the full lifecycle.
- Users set outcome metrics like "increase awareness" with no numeric target or measurement method.

**Phase to address:**
Phase 2 (Core lifecycle, Measure phase) and Phase 3 (Playbook-specific metrics).

---

### Pitfall 9: The "Fix Loop of Doom" -- Verify-Fix Cycles That Never Converge

**What goes wrong:**
Content fails a quality gate. The Fix phase generates a rewrite brief, produces new content, re-verifies. The new content fails a DIFFERENT gate. Fix again. Now the FIRST gate fails again because the fix for gate 2 broke gate 1. The system is capped at 3 attempts, but users experience 3 rounds of frustration before the system gives up, and they still have content that fails gates.

**Why it happens:**
Quality gates can conflict. A "conciseness" gate wants shorter copy; a "proof points" gate wants more evidence. A "brand voice" gate wants casual tone; a "compliance" gate wants precise legal language. Without understanding gate interactions, each fix creates a new failure.

**How to avoid:**
- Classify gates into tiers: Tier 1 (blocking: positioning drift, compliance, claim accuracy) and Tier 2 (advisory: voice drift, format, conciseness). Only Tier 1 gates trigger the fix loop. Tier 2 gates produce warnings but do not block.
- When multiple gates fail, the fix brief must address ALL failures simultaneously, not one at a time. The fix prompt should include all failing gate criteria as constraints.
- After 2 failed fix attempts, escalate to human review rather than attempting a 3rd automated fix. The 3rd attempt rarely fixes what 2 could not.
- Track gate conflict patterns in LEARNINGS.md: "Gate X and Gate Y frequently co-fail, suggesting a prompt tension that needs resolution."

**Warning signs:**
- Fix phase triggers on 50%+ of assets.
- The same asset oscillates between passing/failing the same gate across fix attempts.
- Users bypass Verify after experiencing fix loops ("just ship it").
- Gate failure messages are vague ("does not fully align") making targeted fixes impossible.

**Phase to address:**
Phase 2 (Core lifecycle, Fix phase design) -- gate tiering and conflict detection must be designed before the fix loop is implemented.

---

### Pitfall 10: Slash Command Sprawl and Cognitive Overload

**What goes wrong:**
The project specifies 20+ slash commands across lifecycle, reference management, discipline-specific, and state/recovery categories. Users cannot remember which command to use, try the wrong one, or give up and use only 3-4 commands. The 9-phase lifecycle feels like bureaucracy rather than a system. Adoption drops because the system feels heavyweight compared to "just write the content."

**Why it happens:**
Each command serves a real purpose when designed. But the user does not have the developer's mental model. They see 20+ commands and feel overwhelmed. This is the classic "feature-complete but unusable" problem.

**How to avoid:**
- Design a "happy path" that uses only 4-5 commands: `/ttm-init`, `/ttm-new-campaign`, `/ttm-produce` (which auto-runs brief+produce+verify), `/ttm-ship`, `/ttm-measure`. Advanced commands exist but are not required.
- Implement a `/ttm-next` command that tells the user what to do next based on current state. Users never need to remember the lifecycle -- the system guides them.
- Group commands in documentation: "Start here" (3 commands), "When you need to fix something" (3 commands), "Power user" (remaining commands).
- Make the 9-phase lifecycle invisible for simple campaigns. A blog post does not need the same ceremony as a product launch campaign.

**Warning signs:**
- Users ask "which command do I use?" frequently.
- 80%+ of usage is concentrated on 3-4 commands; others are never used.
- Users run `/ttm-produce` without running `/ttm-brief` first and get confused.
- Users describe the system as "too many steps" in feedback.

**Phase to address:**
Phase 2 (Core lifecycle) for the happy-path design, Phase 4 (Polish) for the `/ttm-next` guidance system.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded gate criteria in command files | Ships faster, no abstraction needed | Changing a gate criterion requires editing every playbook that uses it | Never -- extract to gate definition files from day one |
| Loading all reference files in every command | Guarantees positioning is always available | Context bloat degrades output quality across all commands | Never -- use tiered loading strategy |
| Single STATE.md with overwrite semantics | Simple to implement and read | Partial writes corrupt state, no audit trail of phase transitions | MVP only -- move to append-only log by Phase 2 |
| Inline playbook definitions in skill.md | Easy to see everything in one file | Skill file exceeds Claude's attention budget, command matching breaks | Never -- modular from day one |
| Skipping the Learn phase for MVP | Reduces scope, ships faster | Compound learnings are the system's long-term value; users never build the habit | MVP only -- must be in Phase 2 |
| Generic quality gates across all disciplines | One set of gates to maintain | SEO content needs different checks than email; users lose trust when gates feel irrelevant | Phase 2 only -- discipline-specific gates required by Phase 3 |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude Code skill system | Putting reference material in skill.md | Skill.md contains process steps ONLY; reference material lives in separate files loaded at runtime |
| Codex compatibility | Assuming Claude Code and Codex parse skills identically | Test on both runtimes early; use only the shared subset of skill features; document runtime differences |
| File-based state persistence | Assuming file reads are consistent within a session | Re-read state files at each phase transition, not just at session start |
| npm distribution | Assuming users will configure correctly | Provide a post-install script that validates the installation and runs `/ttm-health` |
| Git clone distribution | Assuming users know where to put the skill folder | Provide explicit path instructions for `~/.claude/skills/` and `.claude/skills/` (project-level) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all 10 playbooks into context simultaneously | Slow responses, generic output, context budget warnings | Load only the active campaign's playbook | With 3+ simultaneous campaigns |
| Storing full asset content in STATE.md | STATE.md exceeds readable size, `/ttm-state` becomes slow | STATE.md stores metadata only; assets live in separate files under `CAMPAIGNS/<slug>/assets/` | When campaigns produce 10+ assets |
| Running all 10+ quality gates sequentially in one prompt | Single prompt becomes too long, later gates get less attention | Batch gates into structural (mechanical) and semantic (LLM-judged) passes | With discipline-specific gates (15+ total per asset) |
| LEARNINGS.md as an ever-growing append-only file | File becomes too large to load usefully | Archive learnings quarterly; keep active LEARNINGS.md under 500 lines | After 20+ campaigns |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing API keys or analytics credentials in `.marketing/` state files | Credentials committed to git, exposed in shared repos | Never store credentials in state files; reference environment variables or external config |
| Including real customer data in ICP.md examples | PII exposure when project is open-sourced or shared | Use anonymized persona descriptions, never real customer names/emails |
| Logging full asset content in campaign state | Proprietary marketing copy visible in git history | State files store asset REFERENCES (file paths), not content |
| Storing competitive intelligence verbatim in COMPETITORS.md | Legal risk if scraped content is copyrighted | Store analysis and summaries, not verbatim competitor copy |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Requiring all 9 phases for every asset | A social media post does not need a Brief+Produce+Verify+Review+Fix cycle | Offer "lightweight" mode for simple assets (quick-produce with auto-verify) and "full" mode for campaigns |
| Silent quality gate failures with no actionable feedback | User sees "FAIL: positioning drift" but does not know what specifically drifted | Gate failure messages must cite the specific positioning claim violated and the specific text that violates it |
| Onboarding interview that asks 30+ questions | Users abandon before completing setup | Cap onboarding at 10 essential questions; mark remaining as "refine later" |
| Requiring manual data paste for every Measure phase | Users skip measurement because it is tedious | Provide copy-paste templates showing exactly what to paste from GA/GSC/LinkedIn; format the expected data structure |
| No progress indication during long Produce phases | Users think the system is broken during wave-parallel production | Provide intermediate status updates ("Wave 1 of 3 complete: generated headline and subhead") |

## "Looks Done But Isn't" Checklist

- [ ] **Positioning enforcement:** Often missing NEGATIVE checks (competitor-collision terms) -- verify the system catches what you MUST NOT say, not just what you must say
- [ ] **Quality gates:** Often missing calibration -- verify gates actually fail on bad content by testing with deliberately bad input
- [ ] **State persistence:** Often missing recovery -- verify `/ttm-resume` correctly picks up from any phase, not just the beginning
- [ ] **Playbook coverage:** Often missing discipline-specific measurement -- verify each playbook defines measurable metrics for its specific channel, not generic "engagement"
- [ ] **Onboarding:** Often missing validation -- verify generated reference files are specific enough by running a sample campaign against them
- [ ] **Fix loop:** Often missing convergence testing -- verify that fix attempts actually improve gate scores, not just change the content randomly
- [ ] **Learn phase:** Often missing structured extraction -- verify learnings are categorized and actionable, not just "this campaign went well"
- [ ] **Repurpose pipeline:** Often missing format-specific adaptation -- verify repurposed content is rewritten for each channel, not just truncated
- [ ] **Calendar management:** Often missing collision detection -- verify CALENDAR.md prevents scheduling two campaigns targeting the same ICP segment simultaneously
- [ ] **Dual distribution:** Often missing parity testing -- verify the npm package and git clone produce identical behavior

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Monolithic skill file | HIGH | Requires full decomposition into modular command files; all users must re-install |
| Corrupted state files | MEDIUM | Run `/ttm-health` to detect; rebuild state from git history of campaign directory |
| Low-quality reference files from onboarding | MEDIUM | Re-run `/ttm-init` with better answers; or manually edit reference files directly |
| Quality gate false positives eroding trust | MEDIUM | Recalibrate gate criteria; add specificity to positioning checklist; review LEARNINGS.md for patterns |
| Fix loop non-convergence | LOW | Escalate to human review; manually approve with deviation log |
| Playbook divergence from base lifecycle | HIGH | Rewrite playbooks using inheritance model; migration script needed for existing campaigns |
| Context bloat degrading output | MEDIUM | Implement tiered loading; requires refactoring command files but not user-facing changes |
| Unmeasurable outcome metrics | LOW | Update metric taxonomy per playbook; retroactively fix active campaign metrics |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Context window bloat | Phase 1 (Foundation) | Measure token counts of loaded context per command; must stay under 2,500 tokens of reference material |
| Self-evaluation bias | Phase 2 (Core lifecycle) | Verify that Produce and Verify run in separate contexts; test with deliberately bad content |
| Monolithic skill file | Phase 1 (Foundation) | No single file exceeds 500 lines; adding a command requires only 1 new file |
| Positioning drift detection failures | Phase 2 (Core lifecycle) | Test with 10 on-brand and 10 off-brand samples; measure precision and recall |
| Low-quality onboarding output | Phase 1 (Foundation) | Score generated positioning for specificity; reject generic outputs |
| State file corruption | Phase 1 (Foundation) | Simulate interrupted writes; verify `/ttm-resume` handles partial state |
| Playbook explosion | Phase 1 (design), Phase 3 (execution) | Adding playbook N+1 requires only 1 file + 0 changes to existing playbooks |
| Unmeasurable outcome metrics | Phase 2 (Core lifecycle) | Every metric in the taxonomy can be obtained from GA, GSC, email platform, or social analytics |
| Fix loop non-convergence | Phase 2 (Core lifecycle) | Test fix loop with content failing 3+ gates simultaneously; verify convergence |
| Slash command sprawl | Phase 2 (Core lifecycle) | New user can complete first campaign using only 4 commands; `/ttm-next` guides them |

## Sources

- [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://research.trychroma.com/context-rot) -- Chroma research on context degradation
- [The Impact of Prompt Bloat on LLM Output Quality](https://mlops.community/the-impact-of-prompt-bloat-on-llm-output-quality/) -- reasoning degrades at ~3,000 tokens
- [Prompt Length vs. Context Window: The Real Limits](https://hackernoon.com/prompt-length-vs-context-window-the-real-limits-of-llm-performance) -- 30% accuracy drop in middle of context
- [Extend Claude with skills](https://code.claude.com/docs/en/skills) -- official Claude Code skill docs
- [How to Use Claude Code Skills Without Making These 3 Common Mistakes](https://www.mindstudio.ai/blog/claude-code-skills-common-mistakes-guide) -- skill architecture pitfalls
- [Claude Skills vs Slash Commands: When to Use Each](https://www.mindstudio.ai/blog/claude-skills-vs-slash-commands) -- skill description truncation
- [Common Marketing Automation Challenges](https://www.tenonhq.com/article/marketing-automation-challenges) -- marketing automation failure modes
- [Automated Self-Testing as a Quality Gate](https://arxiv.org/html/2603.15676v1) -- LLM quality gate research
- [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) -- Anthropic's context engineering guide
- GSD (Get Shit Done) architecture -- `~/.claude/get-shit-done/references/` (context-budget.md, universal-anti-patterns.md, planner-antipatterns.md)

---
*Pitfalls research for: Claude Code marketing operating system skill (takeToMarket)*
*Researched: 2026-04-21*
