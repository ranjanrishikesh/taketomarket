<purpose>
Generate a keyword cluster map with intent tags for content planning. Groups keywords
by topic cluster, assigns search intent (informational/transactional/navigational/
commercial), and maps to content types and funnel stages.
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
takeToMarket > LOADING CONTEXT FOR KEYWORD MAP
```

**Tier 1 summaries** (lines 1 to `<!-- END_SUMMARY -->`) from all 9 `.taketomarket/` reference files.
**Tier 2 (full):** `.taketomarket/POSITIONING.md`, `.taketomarket/CHANNELS.md`, `.taketomarket/COMPETITORS.md`

If `.taketomarket/POSITIONING.md` does not exist: Error and exit.

---

## Step 2: Gather Seed Keywords

Ask the user:
1. "What are your primary seed keywords or topics? (comma-separated)"
2. "Any specific competitors to include in keyword gap analysis? (or 'use COMPETITORS.md')"
3. "Target geography/language? (default: English, global)"

If user says "use COMPETITORS.md", extract competitor names from the loaded file.

MCP Detection: Attempt WebSearch for seed keyword variations.
- **SEARCH_MODE=web:** Use WebSearch to expand seed keywords with related terms, "people also ask" patterns, and competitor keyword gaps.
- **SEARCH_MODE=manual:** Work with user-provided seeds + positioning + ICP context to generate clusters from domain knowledge.

---

## Step 3: Generate Keyword Clusters

For each seed keyword, generate clusters:
- **Head terms** (1-2 words, high volume)
- **Body terms** (2-3 words, medium volume)
- **Long-tail terms** (4+ words, specific intent)

Assign to each keyword:
- **Intent tag:** informational / transactional / navigational / commercial-investigation
- **Funnel stage:** awareness / consideration / decision / retention
- **Content type:** blog / landing page / comparison / how-to / case study / tool
- **Priority:** H (high) / M (medium) / L (low) based on intent alignment with ICP

Group into topic clusters with pillar-cluster relationships.

---

## Step 4: Output Keyword Map

Write to `.taketomarket/KEYWORD-MAP.md`:

```markdown
# Keyword Map
Generated: [date]
Seeds: [list]
Geography: [target]

## Cluster: [Topic 1]
Pillar: [pillar keyword]

| Keyword | Intent | Funnel | Content Type | Priority |
|---------|--------|--------|--------------|----------|
| [term]  | [info/trans/nav/comm] | [stage] | [type] | [H/M/L] |

## Cluster: [Topic 2]
...

## Gap Analysis
Keywords competitors rank for that are not covered:
| Keyword | Competitor | Intent | Opportunity |
|---------|-----------|--------|-------------|
```

---

## Step 5: Completion

```
========================================
takeToMarket > KEYWORD MAP COMPLETE
========================================
Clusters: [N] | Keywords: [total] | File: .taketomarket/KEYWORD-MAP.md
```

Display a summary table of clusters with keyword counts per cluster.

</process>
