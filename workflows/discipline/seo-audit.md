<purpose>
Technical and content SEO audit of a URL or content. Evaluates against SEO playbook
gate definitions and generates a structured PASS/WARN/FAIL report per check.
Single-pass analysis workflow per D-07.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/playbooks/seo.md
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
takeToMarket > LOADING CONTEXT FOR SEO AUDIT
```

**Tier 1 summaries** (lines 1 to `<!-- END_SUMMARY -->`) from all 9 `.taketomarket/` reference files.
**Tier 2 (full):** `.taketomarket/CHANNELS.md` (channel-specific SEO config).
**Playbook gates:** @${CLAUDE_PLUGIN_ROOT}/playbooks/seo.md

If `.taketomarket/POSITIONING.md` does not exist: Error and exit.

---

## Step 2: Get Audit Target

Ask: "What would you like to audit? Provide a URL, file path, or paste content directly."

Parse input:
- **URL** (starts with `http://` or `https://`): Attempt WebFetch for page content.
  - **WebFetch available (SEARCH_MODE=web):** Fetch and analyze.
  - **WebFetch NOT available (SEARCH_MODE=manual):** Ask user to paste page content.
- **File path:** Read the file directly.
- **Pasted content:** Use directly.

Store as `AUDIT_CONTENT` and `AUDIT_TARGET`.

---

## Step 3: Run SEO Gate Checks

```
takeToMarket > RUNNING SEO GATE CHECKS
```

Evaluate `AUDIT_CONTENT` against 8 SEO discipline gates:

**1. Search Intent Match (DISC-SEO-02)**
- PASS: Content format and opening directly match the search intent
- WARN: Content addresses query but format is mixed or answer is buried
- FAIL: Content format contradicts the search intent

**2. Keyword Placement (DISC-SEO-01)**
Target keyword in: title tag, H1, first 100 words, meta description, H2.
- PASS: Keyword in title, H1, first 100 words; title 50-60 chars
- WARN: Missing from 1-2 placements; title 45-49 or 61-70 chars
- FAIL: Missing from title or H1; title under 30 or over 70 chars

**3. Content Structure**
Heading hierarchy (H1 > H2 > H3), no skipped levels, H2 sections 150-400 words.
- PASS: Single H1, logical hierarchy, no skipped levels
- WARN: Minor hierarchy issues or uneven section lengths
- FAIL: No H1, multiple H1s, or broken hierarchy

**4. Internal Linking Density (DISC-SEO-04)**
- PASS: 3-6 internal links per 1000 words with descriptive anchors
- WARN: 1-2 internal links per 1000 words
- FAIL: 0 internal links

**5. Schema Markup (DISC-SEO-03)**
Article, FAQ, HowTo, or Product schema with required fields.
- PASS: Appropriate schema type with all required fields
- WARN: Schema present but incomplete
- FAIL: No schema for content that qualifies

**6. Entity Coverage**
Key entities search engines associate with the topic.
- PASS: References relevant entities (people, orgs, concepts)
- WARN: Some coverage but missing key entities
- FAIL: No recognizable entity references

**7. Thin Content Detection (DISC-SEO-05)**
- PASS: 800+ words standard (300+ programmatic); original analysis present
- WARN: 500-799 words; mostly summarized
- FAIL: Under 500 words; boilerplate content

**8. Core Web Vitals Budget (DISC-SEO-07)**
- PASS: Optimized images with dimensions, lazy-load, no render blockers
- WARN: Images missing dimensions or unoptimized formats
- FAIL: Heavy unoptimized media or render-blocking embeds

Per check: assign PASS / WARN / FAIL with specific evidence.

---

## Step 4: Generate Report

Display structured report:
```
========================================
takeToMarket > SEO AUDIT REPORT
========================================
Target: [URL or filename]
Date: [current date]
Overall: [X/8 PASS] [Y/8 WARN] [Z/8 FAIL]

| # | Gate                   | Result | Evidence              |
|---|------------------------|--------|-----------------------|
| 1 | Search Intent Match    | [P/W/F] | [brief evidence]     |
| 2 | Keyword Placement      | [P/W/F] | [brief evidence]     |
| 3 | Content Structure      | [P/W/F] | [brief evidence]     |
| 4 | Internal Linking       | [P/W/F] | [brief evidence]     |
| 5 | Schema Markup          | [P/W/F] | [brief evidence]     |
| 6 | Entity Coverage        | [P/W/F] | [brief evidence]     |
| 7 | Thin Content Detection | [P/W/F] | [brief evidence]     |
| 8 | Core Web Vitals Budget | [P/W/F] | [brief evidence]     |

FINDINGS (WARN/FAIL details):
- [Gate]: [Issue and recommendation]

RECOMMENDATIONS (priority-ordered):
1. [Highest-impact fix]
2. [Next priority]
```

---

## Step 5: Completion

```
========================================
takeToMarket > SEO AUDIT COMPLETE
========================================
Target: ${AUDIT_TARGET} | Result: [X/8 PASS] [Y/8 WARN] [Z/8 FAIL]
```

Offer: "Save this report to .taketomarket/AUDITS/seo-audit-[date].md? (yes/no)"
If yes: create `.taketomarket/AUDITS/` directory if needed and write the report.

</process>
