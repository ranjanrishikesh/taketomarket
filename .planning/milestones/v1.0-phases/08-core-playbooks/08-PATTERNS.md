# Phase 8: Core Playbooks - Pattern Map

**Mapped:** 2026-04-29
**Files analyzed:** 8 (6 new, 2 modified)
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `playbooks/base.md` | config | reference | `gates/base-gates.md` | role-match |
| `playbooks/seo.md` | reference | request-response | `gates/base-gates.md` | exact |
| `playbooks/aeo.md` | reference | request-response | `gates/base-gates.md` + `playbooks/seo.md` (once created) | exact |
| `playbooks/email.md` | reference | request-response | `gates/base-gates.md` + `playbooks/seo.md` (once created) | exact |
| `playbooks/linkedin.md` | reference | request-response | `gates/base-gates.md` + `playbooks/seo.md` (once created) | exact |
| `playbooks/social.md` | reference | request-response | `gates/base-gates.md` + `playbooks/seo.md` (once created) | exact |
| `workflows/lifecycle/verify.md` | workflow | request-response | `workflows/lifecycle/verify.md` (self -- extend Step 4) | exact |
| `gates/gate-evaluation.md` | reference | request-response | `gates/gate-evaluation.md` (self -- extend) | exact |

## Pattern Assignments

### `playbooks/base.md` (config, reference)

**Analog:** `gates/base-gates.md` -- defines a contract with structured sections, tier classification, and evaluation criteria. The base playbook serves a similar role: defining the inheritance contract that all discipline playbooks must follow.

**Header pattern** (base-gates.md lines 1-4):
```markdown
# Base Quality Gates

10 quality gates evaluated during `/ttm-verify`. Tier 1 gates are blocking (require user action on failure). Tier 2 gates are advisory (reported but no action required).
```

**Apply as:** base.md should open with a similar declarative header explaining what this file is (an inheritance contract, NOT loaded by produce) and how discipline playbooks extend it.

**Section structure pattern** (base-gates.md lines 7-28 -- one gate definition):
```markdown
## Gate 1: Positioning Drift (GATE-01) -- Tier 1

**Checks:** Asset content alignment with approved positioning
**Against:** `.marketing/POSITIONING.md`

### Evaluation Criteria

1. **Primary differentiator alignment**
   - PASS: Asset restates or naturally extends the primary differentiator from POSITIONING.md
   - WARN: Asset partially overlaps but introduces claims not present in POSITIONING.md
   - FAIL: Asset uses a different differentiation claim entirely or contradicts the differentiator
```

**Apply as:** base.md should document the required section structure for discipline playbooks (6 sections from D-06) and the gate definition format (matching the base gate pattern above but using `DISC-{DISCIPLINE}-{NN}` IDs).

**Tier classification table pattern** (base-gates.md lines 250-266):
```markdown
## Tier Classification (GATE-11)

| Gate | ID | Tier | Effect on Verification |
|------|----|------|----------------------|
| Positioning Drift | GATE-01 | Tier 1 (blocking) | User prompted for deviation action |
| Claim Accuracy | GATE-02 | Tier 1 (blocking) | User prompted for deviation action |
...
| Format Correctness | GATE-10 | Tier 2 (advisory) | Reported but no action required |

**Tier 1:** Gate failure requires explicit user action (Correct, Accept+log, or Escalate per GATE-12).
**Tier 2:** Gate findings are reported as advisory. User may optionally act on them.
```

**Apply as:** base.md should document how `## Base Gate Overrides` table works (mapping base gate IDs to new tiers) and what Tier 1 vs Tier 2 means for discipline gates.

---

### `playbooks/seo.md` (reference, request-response)

**Analog:** `gates/base-gates.md` -- gate definition pattern is the primary structural analog.

**YAML frontmatter pattern** (from RESEARCH.md Pattern 1):
```markdown
---
discipline: seo
asset_types: [blog-post, landing-page, pillar-page]
version: 1.0
---
```

**Gate definition pattern** (base-gates.md lines 7-28 -- adapted for discipline gates per RESEARCH.md):
```markdown
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

**Base gate override table pattern** (from D-02, RESEARCH.md):
```markdown
## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-10 | Tier 2 (advisory) | Tier 1 (blocking) | SEO format correctness directly impacts rankings |
```

**6-section structure** (from D-06, all sections required):
1. `## Production Guidance` -- channel-specific writing instructions
2. `## Discipline Gates` -- gate definitions with PASS/WARN/FAIL
3. `## Base Gate Overrides` -- tier override table (or "None" statement)
4. `## Format Rules` -- platform constraints
5. `## Examples` -- good/bad patterns
6. `## Anti-Patterns` -- common mistakes
7. `## Metrics` -- what to measure post-ship

---

### `playbooks/aeo.md` (reference, request-response)

**Analog:** Same as `playbooks/seo.md` -- identical 6-section structure.

**Additional pattern -- cross-reference note** (from CONTEXT.md specific ideas):
```markdown
## Production Guidance

> **SEO Foundation:** If this asset also targets organic search, ensure SEO playbook gates
> are also satisfied. Run verify with both playbooks if applicable.
```

**Gate IDs:** `DISC-AEO-01` through `DISC-AEO-05` (5 gates per RESEARCH.md).

**Base Gate Overrides:** None -- base gates keep default tiers.

---

### `playbooks/email.md` (reference, request-response)

**Analog:** Same 6-section structure as `playbooks/seo.md`.

**Gate IDs:** `DISC-EMAIL-01` through `DISC-EMAIL-06` (6 gates per RESEARCH.md).

**Base Gate Override pattern:**
```markdown
## Base Gate Overrides

| Base Gate ID | Default Tier | Override Tier | Reason |
|-------------|-------------|---------------|--------|
| GATE-07 | Tier 2 (advisory) | Tier 1 (blocking) | Email compliance (CAN-SPAM, GDPR) is legally required |
```

**Content constraint** (from CONTEXT.md): Deliverability checks must focus on content-side issues (spam triggers, image ratio), NOT server-side (SPF/DKIM setup).

---

### `playbooks/linkedin.md` (reference, request-response)

**Analog:** Same 6-section structure as `playbooks/seo.md`.

**Gate IDs:** `DISC-LI-01` through `DISC-LI-04` (4 gates per RESEARCH.md).

**Base Gate Overrides:** None -- base gates keep default tiers.

---

### `playbooks/social.md` (reference, request-response)

**Analog:** Same 6-section structure as `playbooks/seo.md`.

**Gate IDs:** `DISC-SOC-01` through `DISC-SOC-04` (4 gates per RESEARCH.md).

**Platform subsection pattern** (from CONTEXT.md -- social must have platform-specific subsections):
```markdown
## Format Rules

### X/Twitter
- Character limit: 280 (URLs count as 23)
- No rhetorical questions (low engagement per algorithm)
- Hashtags: 1-3

### Instagram
- Caption limit: 2,200 characters
- Carousel ratio: [specific rules]
- Hashtags: 5-15

### Facebook
- Post limit: 1,500 characters (first 100 words visible)
- Text before image, not image-only
- Hashtags: minimal
```

**Base Gate Overrides:** None -- base gates keep default tiers.

---

### `workflows/lifecycle/verify.md` (workflow, request-response -- MODIFY)

**Analog:** Self -- extend the existing Step 4 gate evaluation loop.

**Current Step 4 pattern** (verify.md lines 159-227):
```markdown
## Step 4: Evaluate Gates Per Asset

For each asset in ASSETS:
  For each of the 10 gates (in order from base-gates.md):

  1. **GATE-01: Positioning Drift** (Tier 1)
     - Load: `.marketing/POSITIONING.md` (already loaded in Tier 2)
     - Evaluate per gate-evaluation.md GATE-01 instructions
     - Record structured output: gate, tier, result, findings[]
  ...
  10. **GATE-10: Format Correctness** (Tier 2)
      - Load: channel-specific playbook if available
      - Evaluate per gate-evaluation.md GATE-10 instructions
      - Record structured output

  After all 10 gates evaluated for this asset, aggregate:
  - Count total PASS, WARN, FAIL results
  - Record overall asset result
```

**Extension point -- insert after Step 4, before Step 5** (from RESEARCH.md Pattern 3):

New Step 4b: Evaluate Discipline Gates. The extension must:
1. Check if asset's playbook was loaded (from MANIFEST.json `playbook` field)
2. Parse `## Base Gate Overrides` table and adjust base gate tiers before evaluation
3. Parse `## Discipline Gates` section from the loaded playbook
4. Evaluate each `### DISC-*` subsection as a gate using gate-evaluation.md structured output format
5. Append discipline gate results to the asset's gate results array

**Summary table extension pattern** (verify.md lines 237-257):
```markdown
| # | Gate | Tier | Asset 1 | Asset 2 | ... |
|---|------|------|---------|---------|-----|
| 1 | Positioning Drift (GATE-01) | T1 | [PASS|WARN|FAIL] | ... |
...
| 10 | Format Correctness (GATE-10) | T2 | [PASS|WARN|FAIL] | ... |
```

**Extend to include discipline gates as additional rows after base 10:**
```markdown
| 11 | DISC-SEO-01: Title/H1 Alignment | T1 | PASS | N/A |
| 12 | DISC-SEO-02: Search Intent | T2 | WARN | N/A |
```

**IMPORTANT:** Base gate override parsing must happen BEFORE base gate evaluation (Step 4), not after. If SEO playbook overrides GATE-10 from Tier 2 to Tier 1, that must be in effect during GATE-10 evaluation so the correct deviation handling (Tier 1 prompts) applies.

---

### `gates/gate-evaluation.md` (reference, request-response -- MODIFY)

**Analog:** Self -- extend with discipline gate evaluation instructions.

**Current per-gate instruction pattern** (gate-evaluation.md lines 55-67):
```markdown
### Evaluating GATE-01: Positioning Drift

**Load:** `.marketing/POSITIONING.md` (Tier 2 full)
**Asset content:** Full asset text

**Evaluate:**
1. Does the asset restate or naturally extend the primary differentiator from POSITIONING.md? Or does it introduce a different claim?
2. Are all factual claims in the asset backed by proof points in the POSITIONING.md proof point library?
3. Does the asset contain any terms from the POSITIONING.md must-not-say list?

**Tier:** 1
**On failure:** Prompt user for Correct / Accept+log / Escalate
```

**Extension -- add a generic discipline gate evaluation section:**
```markdown
### Evaluating Discipline Gates (DISC-*)

**Load:** Playbook file for this asset type (`${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`)
**Asset content:** Full asset text

**Evaluate:**
For each `### DISC-*` subsection in the playbook's `## Discipline Gates` section:
1. Read the gate's **Checks** and **Against** fields
2. Evaluate each numbered criterion under **Evaluation Criteria**
3. Apply the same PASS/WARN/FAIL assessment and structured output format as base gates
4. Use the tier specified in the discipline gate definition

**On failure:** Apply deviation handling based on the gate's tier (Tier 1 = prompt, Tier 2 = advisory)
```

---

## Shared Patterns

### Gate Definition Format
**Source:** `gates/base-gates.md` lines 7-28
**Apply to:** All 5 discipline playbooks (seo.md, aeo.md, email.md, linkedin.md, social.md) and base.md contract

Every gate definition must follow this exact structure:
```markdown
### DISC-{DISCIPLINE}-{NN}: {Name} -- Tier {1|2}

**Checks:** {what is evaluated}
**Against:** {reference data or asset content}

#### Evaluation Criteria

1. **{Check name}**
   - PASS: {concrete, verifiable condition}
   - WARN: {concrete, verifiable condition}
   - FAIL: {concrete, verifiable condition}
```

Key rules:
- Gate criteria must be objective and verifiable (countable, pattern-matchable)
- No subjective criteria ("Is the hook compelling?")
- Each criterion needs all three levels (PASS/WARN/FAIL), or can include N/A where appropriate

### Structured Output Format
**Source:** `gates/gate-evaluation.md` lines 19-49
**Apply to:** All discipline gate evaluations in verify.md and gate-evaluation.md

```markdown
### Gate Result

- **Gate:** [Gate Name] (DISC-XX-NN)
- **Tier:** [1|2]
- **Result:** [PASS|WARN|FAIL]
- **Summary:** [One-sentence summary of the finding]

### Findings

**Check: [check name]**
- **Result:** PASS | WARN | FAIL
- **Evidence:** "[exact quote from the asset that triggered this finding]"
- **Reference:** "[quote from the reference file being compared against]"
- **Recommendation:** [what to change if WARN or FAIL; "None" if PASS]
```

### Aggregation Rule
**Source:** `gates/gate-evaluation.md` lines 44-49
**Apply to:** Discipline gate results in verify workflow

```markdown
- If ALL checks PASS: gate result = PASS
- If ANY check is WARN and none FAIL: gate result = WARN
- If ANY check is FAIL: gate result = FAIL
- N/A checks are excluded from aggregation
```

### Deviation Handling by Tier
**Source:** `gates/gate-evaluation.md` lines 204-282
**Apply to:** Discipline gate failures in verify.md

Discipline gates that are Tier 1 follow the same Correct/Accept+log/Escalate flow as base Tier 1 gates. Discipline gates that are Tier 2 are reported as advisory. The override mechanism means a base gate can become Tier 1 via a playbook override, which changes its deviation handling.

### Playbook Loading Mechanism
**Source:** `workflows/lifecycle/produce.md` lines 138-156
**Apply to:** No changes needed -- produce.md already maps `${TYPE}` to `playbooks/${TYPE}.md` and falls back gracefully.

```markdown
## Step 4: Resolve Playbooks

For each asset in `ASSETS_LIST`:

1. Map the asset type to a playbook file path: `${CLAUDE_PLUGIN_ROOT}/playbooks/${TYPE}.md`
2. Check if the playbook file exists
3. If playbook exists: Record the full path as the asset's `playbook_path`.
4. If playbook does NOT exist: Log a warning and set `playbook_path` to `"none"`.
```

### GATE-10 Playbook Reference
**Source:** `gates/gate-evaluation.md` lines 189-201
**Apply to:** Understanding how verify currently loads playbooks for format checking

```markdown
### Evaluating GATE-10: Format Correctness

**Load:** Channel-specific playbook if available (`${CLAUDE_PLUGIN_ROOT}/playbooks/<type>.md`), otherwise general platform guidelines
**Asset content:** Full asset text + asset type metadata from MANIFEST.json
```

This means verify.md already loads the playbook file for GATE-10. The extension reuses this same loaded playbook to also parse discipline gates and base gate overrides.

### 500-Line File Limit
**Source:** CLAUDE.md project conventions, D-07
**Apply to:** All 5 discipline playbooks

If a playbook exceeds 500 lines, extract Examples or Anti-Patterns to `references/playbook-{discipline}-examples.md` and use @-reference syntax. Target: 300-400 lines per playbook.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have close analogs in the existing gate system |

Every file in this phase follows the established gate definition pattern from `gates/base-gates.md` or extends existing workflows. No novel patterns are required.

## Metadata

**Analog search scope:** `gates/`, `workflows/lifecycle/`, `references/`, `templates/`, `playbooks/`
**Files scanned:** 6 existing files read for pattern extraction
**Pattern extraction date:** 2026-04-29
