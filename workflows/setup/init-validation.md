# Specificity Validation Rules

## Usage

Referenced by the main init workflow via `@workflows/setup/init-validation.md`.
Applied after each interview section to reject vague answers and re-prompt with concrete examples.

---

## Banned Phrases (Global)

These phrases trigger automatic rejection in ANY freeform answer:

| Category | Phrases |
|----------|---------|
| Superlatives | "best in class", "industry-leading", "world-class", "premier", "top-tier", "number one" |
| Buzzwords | "innovative", "cutting-edge", "next-generation", "state-of-the-art", "disruptive" |
| Impact words | "revolutionary", "game-changing", "unique", "unparalleled", "unmatched" |
| Vague qualifiers | "comprehensive", "robust", "seamless", "powerful", "flexible", "scalable" (without specific mechanism) |

When a banned phrase is detected, re-prompt immediately using the template in the Re-prompt Templates section below.

---

## Per-Section Validation

### Section 1: Positioning

**Differentiator check:**
- FAIL if differentiator is a single adjective or contains only banned phrases
- FAIL if differentiator does not describe a specific mechanism, capability, or process
- PASS example: "Auto-generates sprint plans from Slack conversations"
- FAIL example: "The most innovative project management tool"

**Target audience check:**
- FAIL if audience description specifies fewer than 2 of: role, company size, industry, geography
- PASS example: "VP Marketing at B2B SaaS companies with 50-500 employees"
- FAIL example: "Modern teams"

**Proof points check:**
- FAIL if fewer than 2 proof points provided
- FAIL if any proof point lacks a verifiable source (number, case study name, benchmark)
- PASS example: "42% reduction in churn after implementing X (Source: Q3 2025 internal analysis)"
- FAIL example: "Customers love our product"

**Must-not-say check:**
- FAIL if fewer than 2 banned terms provided
- FAIL if any banned term lacks reasoning
- PASS example: "'Disruptive' -- overused in our category, signals no real differentiation"
- FAIL example: Just a list of words with no reasoning

### Section 2: Brand

**Voice archetype check:**
- FAIL if description is under 20 words
- FAIL if no concrete brand personality traits mentioned
- PASS example: "Confident but not arrogant. We explain complex concepts simply. We use data to back claims. We never talk down to the reader."
- FAIL example: "Professional and friendly"

**Examples check:**
- FAIL if on-brand example is under 10 words
- FAIL if off-brand example is missing or identical style to on-brand

**Banned words check:**
- FAIL if zero banned words listed
- WARN if banned words lack reasoning

### Section 3: ICP

**Segment check:**
- FAIL if description specifies fewer than 2 of: role, company size, industry, geography
- Same rule as positioning target audience for consistency

**Pain points check:**
- FAIL if fewer than 2 pain points
- FAIL if pain points are generic (e.g., "wants to save time", "needs better tools")
- PASS example: "Spends 4+ hours weekly manually reconciling campaign data across 5 analytics platforms"
- FAIL example: "Struggles with marketing"

**JTBD check:**
- FAIL if job description is under 10 words
- FAIL if job description uses banned phrases

**Customer language check:**
- WARN (not FAIL) if fewer than 3 phrases provided
- Lighter validation -- this data is harder to have on hand

### Section 4: Channels

**Channel list check:**
- FAIL if zero active channels listed
- WARN if no baseline metrics provided for active channels

**Budget check:**
- WARN if no budget split provided (acceptable for early-stage companies)

### Section 5: Competitors

**Competitor list check:**
- FAIL if zero competitors named
- WARN if fewer than 2 competitors (acceptable for new categories)
- FAIL if competitor entries lack positioning description

**Positioning map check:**
- WARN if no axes defined (acceptable -- can be refined later)

### Section 6: Metrics and Calendar

**Primary metric check:**
- FAIL if metric is an output metric only (e.g., "blog posts published", "emails sent") without an outcome metric (e.g., "qualified pipeline", "revenue", "signups")
- PASS example: "Qualified pipeline generated from content marketing -- target $500K/quarter"
- FAIL example: "Number of blog posts published per month"

**Secondary metrics check:**
- WARN if no secondary metrics provided

**Calendar check:**
- WARN (not FAIL) if no quarterly theme provided
- WARN if no cadence defined

---

## Re-prompt Templates

When validation fails, use this template:

```
Your [FIELD_NAME] is too vague. Here's what specific looks like:
  - Vague: '[FAIL_EXAMPLE]'
  - Specific: '[PASS_EXAMPLE]'
Please try again with more specificity.
```

When validation warns:

```
Your [FIELD_NAME] could be more specific, but I'll accept it for now.
You can update this later with [RELEVANT_COMMAND].
```

Relevant commands for warn follow-ups:
- Positioning: `/ttm-positioning-check`
- Brand: `/ttm-brand-refresh`
- ICP: `/ttm-icp-refresh`
- Competitors: `/ttm-competitor-scan`
- Channels, Metrics, Calendar: `/ttm-health` (general review)

---

## Retry Policy

- Maximum 2 re-prompts per field before accepting with a warning flag
- Warning flag format: Add `<!-- SPECIFICITY_WARNING: [field] accepted after 2 retries -->` comment in generated file
- After accepting with warning, continue to next question (do not block the interview)
- Track total warnings per section; if a section has 3+ warnings, note in STATE.md for follow-up
