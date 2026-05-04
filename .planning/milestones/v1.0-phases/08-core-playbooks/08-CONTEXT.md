# Phase 8: Core Playbooks - Context

**Gathered:** 2026-04-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can produce and verify content with discipline-specific knowledge and quality gates for the 5 highest-demand marketing channels: SEO, AEO, Email, LinkedIn, and Social. This phase delivers the base playbook inheritance model and 5 discipline playbook files that the existing produce/verify workflows consume via the playbook loading mechanism built in Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Inheritance Model
- **D-01:** Additive + weight override -- discipline playbooks add gates on top of the base 10 AND can change the tier (blocking/advisory) of base gates. E.g., SEO playbook could promote format-correctness (GATE-10) to Tier 1 blocking. Base gates always run; discipline gates run additionally.
- **D-02:** Override syntax: playbooks include a `## Base Gate Overrides` section with a table mapping gate ID to new tier. If no override section, all base gates keep their default tier. Verify workflow reads this section and adjusts tier during evaluation.
- **D-03:** Base playbook defines the inheritance contract: what sections are required, how gates are structured, what the verify workflow expects to parse from each playbook file.

### Gate Depth Per Discipline
- **D-04:** Variable gate count per discipline -- let the domain drive the number. Technical disciplines (SEO, AEO, Email) get more gates because they have more objectively checkable items. Creative disciplines (LinkedIn, Social) get fewer gates focused on platform rules rather than subjective quality.
- **D-05:** Expected ranges: SEO 5-7 gates, AEO 4-5 gates, Email 5-6 gates, LinkedIn 3-4 gates, Social 3-4 gates. Researcher should validate these against requirements.

### Playbook File Structure
- **D-06:** Full playbook with 6 sections: (1) Production Guidance (how to write), (2) Discipline Gates (quality checks with PASS/WARN/FAIL criteria), (3) Format Rules (platform constraints), (4) Examples (good/bad patterns), (5) Anti-Patterns (common mistakes), (6) Metrics (what to measure for this channel). Comprehensive but each section is concise.
- **D-07:** Estimated file size: 300-400 lines per playbook. Must stay under 500-line limit. If a playbook exceeds, extract examples or anti-patterns to a reference file.

### Cross-Playbook Consistency
- **D-08:** Shared core + discipline-specific sections -- all 5 playbooks share a common template header (channel name, asset types, base gate overrides, production guidance, discipline gates, format rules). Each can add discipline-specific sections (SEO adds Schema Markup guidance, Email adds Deliverability, AEO adds Citation Optimization).
- **D-09:** A base playbook template (`playbooks/base.md`) defines the shared structure and inheritance contract. It is NOT a playbook file itself (not loaded by produce) -- it is a template/reference that discipline playbooks follow.

### Gate Scope Decisions (locked during plan verification)
- **D-10:** SEO playbook gets 7 discipline gates (not 6) -- add DISC-SEO-07 for Core Web Vitals budget (LCP < 2.5s, CLS < 0.1, INP targets). Per PLAY-02, CWV is a required check.
- **D-11:** Email playbook includes DNS-based deliverability checks for SPF/DKIM/DMARC. These records are publicly queryable via DNS lookups, so the AI can check them at verify time (e.g., dig TXT for SPF, DKIM selector lookup). Not just an advisory checklist -- an actual automated gate that queries DNS.

### Claude's Discretion
- Exact gate definitions per discipline (researcher investigates best practices, requirements list the checks)
- Whether to use YAML frontmatter in playbook files for metadata or keep them pure Markdown
- How verify workflow discovers which discipline gates to run (parse from playbook file or separate gate file)
- Example content for each discipline (good/bad patterns)
- Anti-pattern lists per discipline

</decisions>

<specifics>
## Specific Ideas

- Each playbook should read like a field guide for that channel -- a marketer opening it should immediately know the rules
- SEO and AEO playbooks should cross-reference each other since AEO builds on SEO foundations
- Email playbook's deliverability checks should focus on content-side issues (spam triggers, image ratio) not server-side (SPF/DKIM setup) since we can't verify server config
- LinkedIn playbook should explicitly address the algorithm's preference for native content over links
- Social playbook should have platform-specific subsections (X/Twitter, Instagram, Facebook) since rules differ significantly

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Gate System
- `gates/base-gates.md` -- 10 base quality gates with tier classification (Tier 1 blocking, Tier 2 advisory)
- `gates/gate-evaluation.md` -- Per-gate evaluation prompting strategy with structured output
- `gates/meta-gates.md` -- 4 meta-gate definitions (for future phases)

### Production System
- `workflows/lifecycle/produce.md` -- Playbook loading mechanism at lines 140-156: maps asset type to `playbooks/${TYPE}.md`, falls back gracefully if missing
- `workflows/lifecycle/verify.md` -- Gate evaluation loop that needs to incorporate discipline gates
- `references/context-loading.md` -- Playbooks are Tier 2 only, loaded by produce workflow per channel

### Existing Infrastructure
- `playbooks/` -- Empty directory with .gitkeep, ready for playbook files
- `templates/campaign-brief.md` -- Brief template with channel mix and asset type fields consumed by produce

### Requirements
- `.planning/REQUIREMENTS.md` -- PLAY-01 through PLAY-07 (PLAY-04 deferred to Phase 9)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `gates/base-gates.md` gate definition pattern -- PASS/WARN/FAIL criteria per check, tier classification
- `gates/gate-evaluation.md` per-gate evaluation prompting -- extend for discipline gates
- `workflows/lifecycle/produce.md` playbook loading mechanism -- already maps type to file
- `workflows/lifecycle/verify.md` gate evaluation loop -- needs extension for discipline gates

### Established Patterns
- Gate definitions: name, tier, checks-against reference, evaluation criteria with PASS/WARN/FAIL
- Supporting reference files via @-syntax for large content
- Two-tier context loading (playbooks are Tier 2 only)
- 500-line file limit with reference file extraction

### Integration Points
- `playbooks/base.md` -- new base template/contract (not loaded by produce)
- `playbooks/seo.md` -- loaded when asset type maps to SEO
- `playbooks/aeo.md` -- loaded when asset type maps to AEO
- `playbooks/email.md` -- loaded when asset type maps to email
- `playbooks/linkedin.md` -- loaded when asset type maps to LinkedIn
- `playbooks/social.md` -- loaded when asset type maps to social
- `gates/gate-evaluation.md` -- needs update to support discipline gate evaluation
- `workflows/lifecycle/verify.md` -- needs update to evaluate discipline gates from loaded playbook

</code_context>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 08-core-playbooks*
*Context gathered: 2026-04-29*
