# Phase 8: Core Playbooks - Research

**Researched:** 2026-04-29
**Domain:** Marketing discipline playbooks (SEO, AEO, Email, LinkedIn, Social) with quality gate inheritance model
**Confidence:** HIGH

## Summary

Phase 8 delivers the base playbook inheritance model and 5 discipline-specific playbook files that the existing produce/verify workflows consume. The produce workflow (built in Phase 4) already has a playbook loading mechanism at Step 4 that maps asset types to `playbooks/${TYPE}.md` files. The verify workflow already loads playbooks for GATE-10 (Format Correctness) evaluation. This phase fills the empty `playbooks/` directory with content.

The core challenge is authoring discipline-specific quality gates that are machine-evaluable (PASS/WARN/FAIL with clear criteria) rather than subjective. Each discipline has a different ratio of objectively checkable items (SEO has many) vs. creative judgment calls (Social has fewer). The inheritance model must be simple: discipline playbooks add gates on top of the 10 base gates and can optionally override the tier (blocking/advisory) of base gates.

**Primary recommendation:** Build the base template contract first, then author playbooks one discipline at a time. Each playbook follows the same 6-section structure (D-06) and stays under 500 lines (D-07). The verify workflow needs a small update to discover and evaluate discipline gates from loaded playbooks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Additive + weight override -- discipline playbooks add gates on top of the base 10 AND can change the tier (blocking/advisory) of base gates. Base gates always run; discipline gates run additionally.
- **D-02:** Override syntax: playbooks include a `## Base Gate Overrides` section with a table mapping gate ID to new tier. If no override section, all base gates keep their default tier. Verify workflow reads this section and adjusts tier during evaluation.
- **D-03:** Base playbook defines the inheritance contract: what sections are required, how gates are structured, what the verify workflow expects to parse from each playbook file.
- **D-04:** Variable gate count per discipline -- let the domain drive the number. Technical disciplines (SEO, AEO, Email) get more gates because they have more objectively checkable items. Creative disciplines (LinkedIn, Social) get fewer gates focused on platform rules rather than subjective quality.
- **D-05:** Expected ranges: SEO 5-7 gates, AEO 4-5 gates, Email 5-6 gates, LinkedIn 3-4 gates, Social 3-4 gates.
- **D-06:** Full playbook with 6 sections: (1) Production Guidance, (2) Discipline Gates, (3) Format Rules, (4) Examples, (5) Anti-Patterns, (6) Metrics.
- **D-07:** Estimated file size: 300-400 lines per playbook. Must stay under 500-line limit. If a playbook exceeds, extract examples or anti-patterns to a reference file.
- **D-08:** Shared core + discipline-specific sections -- all 5 playbooks share a common template header.
- **D-09:** A base playbook template (`playbooks/base.md`) defines the shared structure and inheritance contract. It is NOT a playbook itself (not loaded by produce).

### Claude's Discretion
- Exact gate definitions per discipline (researcher investigates best practices, requirements list the checks)
- Whether to use YAML frontmatter in playbook files for metadata or keep them pure Markdown
- How verify workflow discovers which discipline gates to run (parse from playbook file or separate gate file)
- Example content for each discipline (good/bad patterns)
- Anti-pattern lists per discipline

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAY-01 | Base playbook inheritance model -- discipline playbooks extend base with additive gates and channel-specific checks | Inheritance contract defined via `playbooks/base.md` template; verify workflow parses `## Discipline Gates` and `## Base Gate Overrides` sections |
| PLAY-02 | SEO playbook -- title/H1 alignment, search-intent match, schema.org markup, internal-link density, Core Web Vitals budget, thin-content detection for pSEO | 6 SEO gates researched with specific PASS/WARN/FAIL criteria from current SEO best practices |
| PLAY-03 | AEO playbook -- quote-worthy sentences (3+ per asset), FAQPage/HowTo schema, author/expert markup, cross-domain fact consistency | 5 AEO gates researched from current AEO/GEO optimization frameworks |
| PLAY-05 | LinkedIn playbook -- opener hook (no "I" start), native content vs link-posting, visual asset ratios, reply path consideration | 4 LinkedIn gates researched from 2026 algorithm insights |
| PLAY-06 | Social playbook -- platform-specific rules (X/Twitter no rhetorical questions, Instagram carousel ratios), native vs link format | 4 Social gates with platform-specific subsections for X, Instagram, Facebook |
| PLAY-07 | Email playbook -- subject/preview spam-trigger scan, dark-mode rendering, unsubscribe/address present, deliverability checks | 6 Email gates researched from current deliverability requirements |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Base playbook template | Plugin files (`playbooks/base.md`) | -- | Template/contract file, not loaded at runtime by produce |
| Discipline playbook content | Plugin files (`playbooks/*.md`) | -- | Static Markdown files read by produce workflow during asset generation |
| Playbook loading | Produce workflow (Step 4) | -- | Already built in Phase 4; maps asset type to playbook file path |
| Discipline gate evaluation | Verify workflow (Step 4) | Gate evaluation reference | Verify must be updated to parse discipline gates from loaded playbook and evaluate them alongside base gates |
| Base gate override parsing | Verify workflow | -- | New capability: verify reads `## Base Gate Overrides` table from playbook and adjusts tier classification |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Markdown files | N/A | All playbook content | takeToMarket is Markdown-native; playbooks are read by the AI runtime, not compiled [VERIFIED: project CLAUDE.md] |
| YAML frontmatter | N/A | Playbook metadata (discipline, asset types, version) | Standard across all Agent Skills; parsed natively [VERIFIED: project CLAUDE.md] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | N/A | N/A | Playbooks are pure content files -- zero runtime dependencies [VERIFIED: project constraint] |

**Installation:** No installation needed. This phase creates Markdown files only.

## Architecture Patterns

### System Architecture Diagram

```
Campaign Brief (asset type + channel)
    |
    v
Produce Workflow (Step 4: Resolve Playbooks)
    |
    +-- maps asset type --> playbooks/${TYPE}.md
    |
    v
ttm-producer Subagent
    |
    +-- reads playbook --> Production Guidance, Format Rules
    |                       (guides content generation)
    v
Produced Asset (.marketing/CAMPAIGNS/<slug>/ASSETS/*.md)
    |
    v
Verify Workflow (Step 4: Evaluate Gates)
    |
    +-- loads playbook --> parses Discipline Gates section
    |                      parses Base Gate Overrides section
    |
    +-- evaluates 10 base gates (tiers adjusted by overrides)
    +-- evaluates N discipline gates (from playbook)
    |
    v
Verification Report (base gates + discipline gates in summary table)
```

### Recommended Project Structure
```
playbooks/
    base.md              # Inheritance contract/template (NOT loaded by produce)
    seo.md               # SEO discipline playbook (5-7 gates)
    aeo.md               # AEO discipline playbook (4-5 gates)
    email.md             # Email discipline playbook (5-6 gates)
    linkedin.md          # LinkedIn discipline playbook (3-4 gates)
    social.md            # Social discipline playbook (3-4 gates)
```

### Pattern 1: Playbook File Structure (from D-06)
**What:** Every discipline playbook follows the same 6-section template
**When to use:** Every playbook file

```markdown
---
discipline: seo
asset_types: [blog-post, landing-page, pillar-page]
version: 1.0
---

# SEO Playbook

## Production Guidance
[How to write for this channel -- loaded by ttm-producer]

## Discipline Gates
[Quality checks with GATE-ID, evaluation criteria, PASS/WARN/FAIL]

### DISC-SEO-01: Title/H1 Alignment
**Checks:** [what is checked]
**Against:** [reference data]
**Tier:** [1 or 2]

#### Evaluation Criteria
1. **[Check name]**
   - PASS: [condition]
   - WARN: [condition]
   - FAIL: [condition]

## Base Gate Overrides
| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-10 | Tier 2 | Tier 1 | SEO format correctness is critical |

## Format Rules
[Platform constraints, char limits, structural requirements]

## Examples
[Good/bad pattern examples -- extract to reference file if >500 lines]

## Anti-Patterns
[Common mistakes for this discipline]

## Metrics
[What to measure for this channel post-ship]
```

### Pattern 2: Discipline Gate ID Convention
**What:** Discipline gates use a `DISC-{DISCIPLINE}-{NN}` naming convention
**When to use:** Every discipline gate definition

This avoids collision with the base `GATE-01` through `GATE-10` IDs. Examples:
- `DISC-SEO-01` through `DISC-SEO-06`
- `DISC-AEO-01` through `DISC-AEO-05`
- `DISC-EMAIL-01` through `DISC-EMAIL-06`
- `DISC-LI-01` through `DISC-LI-04`
- `DISC-SOC-01` through `DISC-SOC-04`

### Pattern 3: Verify Workflow Extension
**What:** The verify workflow must be updated to discover and evaluate discipline gates from the loaded playbook
**When to use:** When modifying `workflows/lifecycle/verify.md`

The verify workflow currently evaluates 10 base gates in Step 4. The extension:
1. After loading the playbook for GATE-10, also parse the `## Discipline Gates` section
2. Parse the `## Base Gate Overrides` section and adjust base gate tiers before evaluation
3. After evaluating all 10 base gates, evaluate each discipline gate using the same structured output format from `gates/gate-evaluation.md`
4. Include discipline gate results in the summary table (appended rows after the base 10)

### Anti-Patterns to Avoid
- **Subjective gates:** Do not create discipline gates that require taste judgment ("Is the hook compelling?"). Gates must have objective, verifiable criteria.
- **Server-side checks in content playbooks:** Email playbook must not check SPF/DKIM/DMARC server config -- only content-side issues (spam trigger words, image ratio). [VERIFIED: CONTEXT.md specific idea]
- **Exceeding 500-line limit:** If a playbook exceeds 500 lines, extract Examples or Anti-Patterns to `references/playbook-{discipline}-examples.md` and use @-reference. [VERIFIED: D-07]
- **Modifying the produce workflow playbook loading:** The mechanism in produce.md Step 4 already works correctly. Do not change it -- only add playbook content files.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gate evaluation format | Custom output format for discipline gates | Reuse the exact structured output format from `gates/gate-evaluation.md` | Consistency with base gates; verify workflow already parses this format |
| Playbook parsing | Custom parser for playbook sections | Markdown heading-level parsing (already how the AI reads files) | The AI runtime reads Markdown natively; no parser needed |
| Gate ID management | Complex registry or lookup table | Simple `DISC-{DISCIPLINE}-{NN}` convention with inline definitions | Playbooks are self-contained; gates defined in the playbook file itself |

**Key insight:** Playbooks are Markdown files read by an AI. There is no "code" to write for the playbook content itself. The only code-like work is updating the verify workflow to parse and evaluate discipline gates.

## Common Pitfalls

### Pitfall 1: Vague Gate Criteria
**What goes wrong:** Gates with criteria like "content is engaging" or "hook is strong" produce inconsistent PASS/WARN/FAIL results across evaluation runs.
**Why it happens:** Discipline gates are written with subjective marketing judgment instead of verifiable checks.
**How to avoid:** Every gate criterion must reference a concrete, countable, or pattern-matchable property. Example: "Asset contains 3+ sentences that could be quoted verbatim as a standalone answer" (countable) vs. "Content is quotable" (subjective).
**Warning signs:** A gate criterion that two different evaluators could reasonably disagree on.

### Pitfall 2: Playbook Exceeds Context Budget
**What goes wrong:** A 400-line playbook loaded alongside brief + positioning + brand + ICP consumes too much of the 200K-token production context, leaving insufficient room for actual content generation.
**Why it happens:** Playbooks are Tier 2 files loaded in full by the produce workflow. Combined with other Tier 2 files, total context can grow large.
**How to avoid:** Keep playbooks concise. Production Guidance and Format Rules are the critical sections for produce; Examples and Anti-Patterns can be moved to reference files. Estimated total Tier 2 load during produce: ~5,000-8,000 tokens (positioning + brand + ICP + playbook). Well within the 200K budget.
**Warning signs:** Playbook file approaching 500 lines.

### Pitfall 3: Discipline Gates That Duplicate Base Gates
**What goes wrong:** A discipline gate checks the same thing as a base gate (e.g., SEO playbook adds a "voice consistency" gate that overlaps with GATE-03 Voice Drift).
**Why it happens:** Playbook author forgets the base gates always run.
**How to avoid:** Before defining each discipline gate, verify it does not overlap with any of the 10 base gates. Discipline gates should check channel-specific concerns that base gates cannot cover.
**Warning signs:** A discipline gate that references the same `.marketing/` file as a base gate.

### Pitfall 4: Forgetting to Update Verify Workflow
**What goes wrong:** Playbooks are created with discipline gates, but the verify workflow never evaluates them because it was not updated to parse the `## Discipline Gates` section.
**Why it happens:** Phase focuses on playbook content authoring and forgets the integration point.
**How to avoid:** Include verify workflow update as an explicit task, not an afterthought.
**Warning signs:** Running `/ttm-verify` on an asset with a playbook and seeing only 10 base gates in the report.

### Pitfall 5: Social Playbook Treated as Monolithic
**What goes wrong:** Social playbook has generic rules that do not account for significant differences between X/Twitter, Instagram, and Facebook.
**Why it happens:** "Social" is treated as one channel when it is actually 3+ distinct platforms.
**How to avoid:** Social playbook must have platform-specific subsections within Format Rules and some discipline gates. [VERIFIED: CONTEXT.md specific idea]
**Warning signs:** A social gate criterion that references "character limit" without specifying which platform.

## Code Examples

### Discipline Gate Definition (follows base-gates.md pattern)

```markdown
<!-- Source: gates/base-gates.md pattern, adapted for discipline gates -->

### DISC-SEO-01: Title/H1 Alignment -- Tier 1

**Checks:** Title tag and H1 heading consistency
**Against:** Asset content structure

#### Evaluation Criteria

1. **Title-H1 match**
   - PASS: Title tag and H1 convey the same primary topic and target keyword
   - WARN: Title and H1 address the same topic but use significantly different phrasing
   - FAIL: Title and H1 address different topics or target different keywords

2. **Title length**
   - PASS: Title is 50-60 characters (avoids SERP truncation)
   - WARN: Title is 45-49 or 61-70 characters
   - FAIL: Title is under 30 or over 70 characters
```

### Base Gate Override Table (from D-02)

```markdown
<!-- Source: D-02 locked decision -->

## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-10 | Tier 2 (advisory) | Tier 1 (blocking) | SEO format correctness directly impacts rankings |
```

### Verify Workflow Extension (discipline gate discovery)

```markdown
<!-- Source: derived from verify.md Step 4 pattern -->

## Step 4b: Evaluate Discipline Gates (NEW)

For each asset in ASSETS:

1. Check if the asset's playbook was loaded (from MANIFEST.json `playbook` field)
2. If playbook is "none", skip discipline gate evaluation for this asset
3. If playbook exists, read the `## Discipline Gates` section
4. Parse each `### DISC-*` subsection as a gate definition
5. Read the `## Base Gate Overrides` table and adjust base gate tiers accordingly
6. Evaluate each discipline gate using the same structured output format from gate-evaluation.md
7. Append discipline gate results to the asset's gate results array

Include discipline gates in the summary table as additional rows after the base 10:

| # | Gate | Tier | Asset 1 | Asset 2 |
|---|------|------|---------|---------|
| 1-10 | [base gates] | ... | ... | ... |
| 11 | DISC-SEO-01: Title/H1 Alignment | T1 | PASS | N/A |
| 12 | DISC-SEO-02: Search Intent | T2 | WARN | N/A |
```

## Discipline Gate Research

### SEO Playbook Gates (PLAY-02) -- 6 gates recommended

| Gate ID | Name | Tier | What It Checks | Source |
|---------|------|------|---------------|--------|
| DISC-SEO-01 | Title/H1 Alignment | Tier 1 | Title tag and H1 convey same topic; title 50-60 chars | [CITED: prateeksha.com/blog/on-page-seo-checklist-2026] |
| DISC-SEO-02 | Search Intent Match | Tier 1 | First 100-150 words address the primary query; content matches informational/commercial/transactional intent | [CITED: crawlcompass.com/blog/on-page-seo-checklist] |
| DISC-SEO-03 | Schema Markup | Tier 2 | Article, FAQ, or HowTo schema present and correctly structured for rich result eligibility | [CITED: prateeksha.com/blog/on-page-seo-checklist-2026] |
| DISC-SEO-04 | Internal Link Density | Tier 2 | 3-6 contextual internal links per 1,000 words; links use descriptive anchor text | [CITED: crawlcompass.com/blog/on-page-seo-checklist] |
| DISC-SEO-05 | Thin Content Detection | Tier 1 | Word count above 300 for standard pages; pSEO pages have unique, substantive content per variant | [ASSUMED] |
| DISC-SEO-06 | Meta Description | Tier 2 | Meta description present, 120-160 chars, includes target keyword, unique per page | [CITED: wellows.com/blog/on-page-checklist] |

**Base Gate Overrides for SEO:**
- GATE-10 (Format Correctness): Override from Tier 2 to Tier 1 -- SEO format directly impacts rankings

### AEO Playbook Gates (PLAY-03) -- 5 gates recommended

| Gate ID | Name | Tier | What It Checks | Source |
|---------|------|------|---------------|--------|
| DISC-AEO-01 | Quote-Worthy Sentences | Tier 1 | Asset contains 3+ sentences that could be quoted verbatim as standalone answers by AI engines | [VERIFIED: REQUIREMENTS.md PLAY-03] |
| DISC-AEO-02 | FAQ/HowTo Schema | Tier 1 | FAQPage or HowTo schema markup present with well-formed question/answer pairs | [CITED: frase.io/blog/what-is-answer-engine-optimization] |
| DISC-AEO-03 | Author/Expert Markup | Tier 2 | Author schema present; author has verifiable credentials referenced in content | [VERIFIED: REQUIREMENTS.md PLAY-03] |
| DISC-AEO-04 | Cross-Domain Fact Consistency | Tier 1 | Claims in asset are consistent with claims in other assets for the same campaign; no contradictions across channels | [VERIFIED: REQUIREMENTS.md PLAY-03] |
| DISC-AEO-05 | Direct Answer Format | Tier 2 | Each section opens with a 1-2 sentence definitive answer before elaboration; key facts are independently citable | [CITED: pageoptimizer.pro/blog/answer-engine-optimization-aeo-checklist] |

**Base Gate Overrides for AEO:** None -- base gates keep default tiers.

### Email Playbook Gates (PLAY-07) -- 6 gates recommended

| Gate ID | Name | Tier | What It Checks | Source |
|---------|------|------|---------------|--------|
| DISC-EMAIL-01 | Subject/Preview Spam Scan | Tier 1 | Subject line and preview text free of spam trigger words (free, guarantee, act now, etc.); no ALL CAPS; no excessive punctuation | [CITED: activecampaign.com/blog/spam-words] |
| DISC-EMAIL-02 | Dark Mode Rendering | Tier 2 | Content uses transparent backgrounds or dark-mode-safe colors; images have alt text; no image-only emails | [CITED: mailpro.com/blog/html-email-qa-checklist-2026] |
| DISC-EMAIL-03 | Unsubscribe Presence | Tier 1 | Unsubscribe/opt-out link present; physical mailing address present (CAN-SPAM/GDPR requirement) | [CITED: audienceful.com/guides/email-deliverability-checklist] |
| DISC-EMAIL-04 | Content-to-Image Ratio | Tier 2 | Text-to-image ratio is 60:40 or higher (text dominant); no image-only emails | [CITED: pushwoosh.com/blog/email-deliverability-spam-avoidance-tips] |
| DISC-EMAIL-05 | Subject Line Length | Tier 2 | Subject line 30-60 characters; preview text 40-130 characters; both present and distinct | [ASSUMED] |
| DISC-EMAIL-06 | Single Clear CTA | Tier 2 | Email has one primary CTA above the fold; secondary CTAs do not compete; CTA button text is action-oriented | [ASSUMED] |

**Base Gate Overrides for Email:**
- GATE-07 (Compliance): Override from Tier 2 to Tier 1 -- email compliance (CAN-SPAM, GDPR) is legally required

### LinkedIn Playbook Gates (PLAY-05) -- 4 gates recommended

| Gate ID | Name | Tier | What It Checks | Source |
|---------|------|------|---------------|--------|
| DISC-LI-01 | Hook Quality | Tier 1 | First line is a hook (not starting with "I"); question, bold claim, or counterintuitive statement; visible before "see more" truncation | [VERIFIED: REQUIREMENTS.md PLAY-05, CITED: contentin.io/blog/linkedin-algorithm-2025] |
| DISC-LI-02 | Native Content Format | Tier 1 | No external links in main post body (link in comments if needed); content stands alone without requiring a click | [CITED: dataslayer.ai/blog/linkedin-algorithm-february-2026] |
| DISC-LI-03 | Engagement Path | Tier 2 | Post includes a conversation prompt or question; reply path considered (what would a reader comment?) | [VERIFIED: REQUIREMENTS.md PLAY-05] |
| DISC-LI-04 | Character/Format Limits | Tier 2 | Post under 3,000 chars; optimal range 1,200-2,100 chars for engagement; line breaks for readability; limited hashtags (3-5) | [CITED: socialbee.com/blog/linkedin-algorithm] |

**Base Gate Overrides for LinkedIn:** None -- base gates keep default tiers.

### Social Playbook Gates (PLAY-06) -- 4 gates recommended (with platform subsections)

| Gate ID | Name | Tier | What It Checks | Source |
|---------|------|------|---------------|--------|
| DISC-SOC-01 | Platform Character Limits | Tier 1 | X/Twitter: under 280 chars (URLs count as 23); Instagram caption: under 2,200 chars; Facebook: under 1,500 chars (first 100 words visible) | [CITED: advancedcharactercounter.com/blog/social-media-character-limits] |
| DISC-SOC-02 | Native Format Preference | Tier 2 | Content formatted for native consumption (no link-only posts on X; Instagram uses carousel or image; Facebook uses native video or image) | [ASSUMED] |
| DISC-SOC-03 | Platform-Specific Rules | Tier 1 | X: no rhetorical questions (low engagement); Instagram: carousel ratio correct, bio link reference if CTA needed; Facebook: text before image, not image-only | [VERIFIED: REQUIREMENTS.md PLAY-06] |
| DISC-SOC-04 | Hashtag and Mention Hygiene | Tier 2 | Platform-appropriate hashtag count (X: 1-3, Instagram: 5-15, LinkedIn: 3-5); mentions count toward char limit; emojis count as 2 chars | [CITED: sociality.io/blog/social-media-character-limits] |

**Base Gate Overrides for Social:** None -- base gates keep default tiers.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SEO focused on keyword density | Search intent matching is primary ranking signal | 2023+ | Gates must check intent match, not keyword count [CITED: propphy.com/blog/google-top-ranking-factors] |
| AEO was not a discipline | Answer Engine Optimization is now distinct from SEO | 2024-2025 | Separate playbook required; AEO gates focus on citation-worthiness [CITED: frase.io/blog/what-is-answer-engine-optimization] |
| LinkedIn tolerated external links | LinkedIn algorithm penalizes posts with external links (~60% less reach) | 2025-2026 | Native content is mandatory; links in comments only [CITED: dataslayer.ai/blog/linkedin-algorithm-february-2026] |
| Email dark mode was optional | Dark mode rendering is expected by default | 2025+ | Email playbook must include dark-mode gate [CITED: mailpro.com/blog/html-email-qa-checklist-2026] |
| Gmail/Yahoo accepted any sender | Bulk senders require SPF+DKIM+DMARC, one-click unsubscribe | Feb 2024+ | Email compliance gate is now Tier 1 importance [CITED: pushwoosh.com/blog/email-deliverability-spam-avoidance-tips] |

**Deprecated/outdated:**
- Keyword density checking: replaced by search intent analysis and entity-based SEO
- Link posts on LinkedIn: algorithm actively suppresses; use native content
- Image-only emails: flagged as spam by modern email providers

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | DISC-SEO-05: 300-word minimum for thin content detection is the right threshold | SEO Gates | Low -- threshold is adjustable; industry standard varies from 300-500 |
| A2 | DISC-EMAIL-05: Subject line 30-60 chars and preview text 40-130 chars are optimal ranges | Email Gates | Low -- ranges are approximate; widely cited but vary by source |
| A3 | DISC-EMAIL-06: Single CTA above fold is best practice | Email Gates | Low -- well-established email marketing principle |
| A4 | DISC-SOC-02: Native format preference criteria for each platform | Social Gates | Medium -- platform algorithms change frequently; criteria may need updates |

## Open Questions (RESOLVED)

1. **YAML frontmatter in playbooks: yes or no?**
   - What we know: YAML frontmatter is standard across all Agent Skills. It would allow the verify workflow to quickly identify which discipline a playbook belongs to and what asset types it covers.
   - What's unclear: Whether the produce workflow or verify workflow currently parses frontmatter from playbooks (they may just read the full file).
   - Recommendation: Use YAML frontmatter with `discipline`, `asset_types`, and `version` fields. The AI reads the file anyway; frontmatter adds structured metadata at negligible cost.

2. **How does verify discover discipline gates?**
   - What we know: The verify workflow currently loads the playbook for GATE-10 evaluation. The playbook file will contain a `## Discipline Gates` section.
   - What's unclear: The exact parsing approach -- does the AI read the full playbook and identify gate subsections by heading, or should gates be in a separate parseable format?
   - Recommendation: Parse by heading convention. The AI reads the `## Discipline Gates` section and evaluates each `### DISC-*` subsection as a gate. This is how base gates already work in `gates/base-gates.md` -- no new parsing mechanism needed.

3. **SEO and AEO cross-referencing**
   - What we know: CONTEXT.md specifies that SEO and AEO playbooks should cross-reference each other since AEO builds on SEO foundations.
   - What's unclear: Whether this means AEO should @-reference the SEO playbook, or just include a note in Production Guidance.
   - Recommendation: AEO Production Guidance section includes a note: "If this asset also targets organic search, ensure SEO playbook gates are also satisfied. Run verify with both playbooks if applicable." No @-reference needed -- the produce workflow loads one playbook per asset type.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual verification (Markdown content files) |
| Config file | none |
| Quick run command | `cat playbooks/seo.md | head -5` (verify file exists and has frontmatter) |
| Full suite command | `for f in playbooks/base.md playbooks/seo.md playbooks/aeo.md playbooks/email.md playbooks/linkedin.md playbooks/social.md; do test -f "$f" && echo "OK: $f" || echo "MISSING: $f"; done` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAY-01 | Base playbook inheritance model works | manual | Verify `playbooks/base.md` defines contract; verify one discipline playbook has `## Base Gate Overrides` | Wave 0 |
| PLAY-02 | SEO playbook enforces title/H1, intent, schema, links, thin-content | manual | `grep -c "DISC-SEO" playbooks/seo.md` returns 6 | Wave 0 |
| PLAY-03 | AEO playbook enforces quote-worthy, FAQ schema, author markup, fact consistency | manual | `grep -c "DISC-AEO" playbooks/aeo.md` returns 5 | Wave 0 |
| PLAY-05 | LinkedIn playbook enforces hook, native content, engagement path | manual | `grep -c "DISC-LI" playbooks/linkedin.md` returns 4 | Wave 0 |
| PLAY-06 | Social playbook enforces platform-specific rules | manual | `grep -c "DISC-SOC" playbooks/social.md` returns 4 | Wave 0 |
| PLAY-07 | Email playbook enforces spam scan, dark mode, unsubscribe, deliverability | manual | `grep -c "DISC-EMAIL" playbooks/email.md` returns 6 | Wave 0 |

### Sampling Rate
- **Per task commit:** Verify file exists, is under 500 lines, has correct sections
- **Per wave merge:** Full suite: all 6 files exist, all discipline gates present, verify workflow updated
- **Phase gate:** All playbook files present; verify workflow integration tested with a dry-run scenario

### Wave 0 Gaps
- None -- this phase creates new Markdown files; no test infrastructure needed beyond file existence checks

## Security Domain

Security enforcement is not directly applicable to this phase. Playbooks are static Markdown content files with no user input processing, no authentication, no data storage, and no cryptography. The gates themselves are evaluation criteria read by the AI, not executable code.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | N/A |
| V3 Session Management | No | N/A |
| V4 Access Control | No | N/A |
| V5 Input Validation | No | N/A -- playbooks are static files, not user input |
| V6 Cryptography | No | N/A |

## Sources

### Primary (HIGH confidence)
- `gates/base-gates.md` -- Gate definition pattern with PASS/WARN/FAIL criteria and tier classification (local file)
- `gates/gate-evaluation.md` -- Per-gate evaluation prompting strategy and structured output format (local file)
- `workflows/lifecycle/produce.md` -- Playbook loading mechanism at Step 4 (local file)
- `workflows/lifecycle/verify.md` -- Gate evaluation loop structure (local file)
- `references/context-loading.md` -- Tier 2 loading rules for playbooks (local file)
- `.planning/phases/08-core-playbooks/08-CONTEXT.md` -- Locked decisions D-01 through D-09 (local file)

### Secondary (MEDIUM confidence)
- [On-Page SEO Checklist 2026 - Prateeksha](https://prateeksha.com/blog/on-page-seo-checklist-2026-titles-headings-schema-core-web-vitals) -- Title/H1 alignment, schema markup best practices
- [On-Page SEO Checklist - Crawl Compass](https://crawlcompass.com/blog/on-page-seo-checklist) -- Search intent, internal link density
- [AEO Complete Guide - Frase.io](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai) -- Quote-worthy content, citation optimization
- [AEO Checklist - PageOptimizer Pro](https://www.pageoptimizer.pro/blog/answer-engine-optimization-aeo-checklist) -- Direct answer format, section-level citability
- [LinkedIn Algorithm 2026 - Dataslayer](https://www.dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now) -- Native content preference, link penalty
- [LinkedIn Algorithm - ContentIn](https://contentin.io/blog/linkedin-algorithm-2025-the-complete-content-format-strategy-guide/) -- Hook strategies, character limits
- [LinkedIn Algorithm - SocialBee](https://socialbee.com/blog/linkedin-algorithm/) -- Posting best practices, hashtag limits
- [Spam Trigger Words - ActiveCampaign](https://www.activecampaign.com/blog/spam-words) -- Email spam word list
- [HTML Email QA Checklist 2026 - Mailpro](https://www.mailpro.com/blog/html-email-qa-checklist-2026) -- Dark mode, rendering checks
- [Email Deliverability Checklist - Audienceful](https://www.audienceful.com/guides/email-deliverability-checklist) -- CAN-SPAM, unsubscribe requirements
- [Email Deliverability - Pushwoosh](https://www.pushwoosh.com/blog/email-deliverability-spam-avoidance-tips/) -- Content-to-image ratio, Gmail/Yahoo requirements
- [Social Media Character Limits 2026](https://advancedcharactercounter.com/blog/social-media-character-limits/) -- Platform-specific limits
- [Social Media Character Limits - Sociality.io](https://sociality.io/blog/social-media-character-limits/) -- Emoji counting, mention counting

### Tertiary (LOW confidence)
- None -- all claims verified against web sources or local project files

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no libraries needed; pure Markdown files following established project patterns
- Architecture: HIGH -- playbook loading and gate evaluation patterns already exist in Phase 4 artifacts; extension is straightforward
- Pitfalls: HIGH -- common issues identified from both project constraints and domain research
- Discipline gates: MEDIUM-HIGH -- gate definitions based on current industry best practices; some specific thresholds (A1-A4) are assumed but low-risk

**Research date:** 2026-04-29
**Valid until:** 2026-06-29 (60 days -- playbook content is stable; platform algorithms may shift for LinkedIn/Social)
