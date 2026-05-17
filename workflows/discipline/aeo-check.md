<purpose>
Check AI citation status and citability score for content against a target query.
Evaluates whether content is structured for AI engine extraction and citation using
AEO playbook gate definitions. Optionally checks live citation status via web search.
Single-pass analysis workflow per D-07.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/playbooks/aeo.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- Flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>

<process>

## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

If `AskUserQuestion` tool is not available in the current runtime, set `TEXT_MODE=true`.

---

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT FOR AEO CHECK
```

**Tier 1 summaries** (lines 1 to `<!-- END_SUMMARY -->`) from all 9 `.taketomarket/` reference files.
**Tier 2 (full):** `.taketomarket/POSITIONING.md` (differentiator alignment check).
**Playbook gates:** @${CLAUDE_PLUGIN_ROOT}/playbooks/aeo.md

If `.taketomarket/POSITIONING.md` does not exist: Error and exit.

---

## Step 2: Get Target Query and Content

Ask the user:
1. "What query do you want to check AI citation status for?"
2. "Paste the content you want evaluated (URL, file path, or raw content)."

Store query as `TARGET_QUERY`. Parse content input:
- **URL:** Attempt WebFetch. If unavailable (SEARCH_MODE=manual), ask user to paste.
- **File path:** Read directly.
- **Pasted content:** Use directly.

Store as `CHECK_CONTENT`.

---

## Step 3: Evaluate Citability (AEO Gates)

```
takeToMarket > EVALUATING CITABILITY
```

Evaluate `CHECK_CONTENT` against 6 AEO discipline gates:

**1. Quote-Worthy Sentences (DISC-AEO-01)**
- PASS: 3+ sentences quotable verbatim as standalone answers
- WARN: 1-2 quotable sentences
- FAIL: 0 quotable sentences -- all require surrounding context

**2. FAQ/HowTo Schema (DISC-AEO-02)**
- PASS: FAQPage or HowTo schema with complete Q&A pairs or steps
- WARN: Schema present but incomplete (missing answers, <3 pairs)
- FAIL: No FAQ/HowTo schema on content with Q&A or instructions

**3. Author/Expert Markup (DISC-AEO-03)**
- PASS: Author name, credentials, expertise; references specific experience
- WARN: Author name present but no credentials
- FAIL: No author attribution

**4. Cross-Domain Fact Consistency (DISC-AEO-04)**
- PASS: All numeric and positioning claims consistent and verifiable
- WARN: Minor phrasing differences that could be misinterpreted
- FAIL: Direct contradictions in claims

**5. Direct Answer Formatting (DISC-AEO-05)**
- PASS: Each H2 opens with 1-2 sentence definitive answer before elaboration
- WARN: Most sections open directly but 1-2 start with context first
- FAIL: Sections consistently open with preamble instead of answers

**6. Entity Authority**
- PASS: References authoritative entities, domain terminology, linked concepts
- WARN: Some entity coverage but surface-level
- FAIL: Generic content with no entity depth

Per check: assign PASS / WARN / FAIL with specific evidence.

---

## Step 4: Citation Status (if WebSearch available)

Attempt WebSearch to detect tool availability.

### SEARCH_MODE=web
```
takeToMarket > CHECKING LIVE CITATION STATUS
```
Search `TARGET_QUERY` conversationally. Analyze: Is content being cited? Which competitors cited? What format do AI engines prefer?

### SEARCH_MODE=manual
```
takeToMarket > SEARCH MODE: MANUAL -- SKIPPING LIVE CITATION CHECK
```
Skip live check. Tell user to manually search in ChatGPT, Perplexity, Gemini, Copilot.

---

## Step 5: Generate Report

Citability score: (PASS count / 6) * 100, rounded.

```
========================================
takeToMarket > AEO CITABILITY REPORT
========================================
Query: "${TARGET_QUERY}"
Content: [URL, filename, or "pasted content"]
Date: [current date]
Citability Score: [score]% ([X/6 PASS] [Y/6 WARN] [Z/6 FAIL])

| # | Gate                    | Result | Evidence              |
|---|-------------------------|--------|-----------------------|
| 1 | Quote-Worthy Sentences  | [P/W/F] | [brief evidence]     |
| 2 | FAQ/HowTo Schema        | [P/W/F] | [brief evidence]     |
| 3 | Author/Expert Markup    | [P/W/F] | [brief evidence]     |
| 4 | Fact Consistency        | [P/W/F] | [brief evidence]     |
| 5 | Direct Answer Format    | [P/W/F] | [brief evidence]     |
| 6 | Entity Authority        | [P/W/F] | [brief evidence]     |

[If SEARCH_MODE=web:]
CITATION STATUS:
- Currently cited: [yes/no/partial]
- Competing citations: [competitors being cited]
- Preferred format: [format AI engines favor]

FINDINGS (WARN/FAIL details):
- [Gate]: [Issue and recommendation]

RECOMMENDATIONS (priority-ordered):
1. [Highest-impact citability improvement]
2. [Next priority]
```

---

## Step 6: Completion

```
========================================
takeToMarket > AEO CHECK COMPLETE
========================================
Query: ${TARGET_QUERY} | Citability Score: [score]%
```

Offer: "Save this report to .taketomarket/AUDITS/aeo-check-[date].md? (yes/no)"
If yes: create `.taketomarket/AUDITS/` directory if needed and write the report.

</process>
