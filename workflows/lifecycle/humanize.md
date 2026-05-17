<purpose>
Humanization workflow for /ttm-humanize. Detects and rewrites the AI-writing patterns
cataloged in references/humanizer-patterns.md against an audience-facing asset, calibrated
to the brand voice declared in .taketomarket/BRAND.md and constrained by the positioning
invariant in .taketomarket/POSITIONING.md. Every audience-facing asset in takeToMarket
passes through this workflow before write -- no asset ships with the AI fingerprint intact.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/humanizer-patterns.md
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

Humanization rewrites style and rhythm. It must not change positioning anchors, proof
points, ICP framing, or any must-not-say term enforcement. If a humanization rewrite would
contradict POSITIONING.md, abort the rewrite for that span and flag it instead.

## BRAND.md voice is authoritative

The asset's voice MUST match `.taketomarket/BRAND.md`. If the source asset already deviates
from BRAND.md, humanization is not the place to fix it -- flag the deviation and recommend
`/ttm-positioning-check` or a manual brand review.

## Meaning is preserved

Humanization rewrites the surface. Claims, numbers, proper nouns, citations, and CTAs are
preserved verbatim unless they are themselves AI-pattern instances (vague attribution,
knowledge-cutoff disclaimer, sycophantic opener).
</constraints>

<process>

## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

If `AskUserQuestion` tool is not available in the current runtime, set `TEXT_MODE=true`.

---

## Step 1: Resolve Target Asset

```
takeToMarket > LOADING ASSET
```

Parse `$ARGUMENTS`. Strip the `--text` flag if present. The remaining token is the target:

- A file path (absolute or repo-relative ending in `.md`): treat as `TARGET_PATH`. Read it.
- A campaign slug followed by an asset id (e.g., `pricing-q2 02`): resolve to
  `.taketomarket/CAMPAIGNS/${SLUG}/ASSETS/${NN}-*.md`.
- A bare campaign slug: read `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json` and humanize
  every asset listed. Process the hero first, then derivatives.
- No argument and stdin/clipboard text present: treat as inline mode -- humanize the pasted
  text and print the result; do not write to disk.

Store the source text as `DRAFT`. Store the resolution mode as `MODE` (`file` | `campaign` |
`inline`).

---

## Step 2: Load Voice Context

```
takeToMarket > CALIBRATING VOICE
```

Read full content (Tier 2 per context-loading.md):

- `.taketomarket/BRAND.md` -- voice, tone, vocabulary, must-not-say terms
- `.taketomarket/POSITIONING.md` -- anchors, proof points, must-not-say terms (positioning)

If the asset belongs to a campaign (MODE is `file` under `CAMPAIGNS/${SLUG}/ASSETS/` or
MODE is `campaign`), also read:

- `.taketomarket/CAMPAIGNS/${SLUG}/BRIEF.md` -- campaign-specific hook, proof points,
  channel constraints

From BRAND.md, extract a **voice profile**:

- Sentence length pattern (short/punchy, long/flowing, mixed)
- Word-choice register (casual, technical, formal, mixed)
- Paragraph openers (jump straight in vs. set context first)
- Punctuation habits (dashes, parentheticals, semicolons, fragments)
- Recurring phrases or verbal tics declared in BRAND.md
- Transition style (explicit connectors vs. abrupt cuts)
- First-person stance (uses "I"/"we" vs. third-person only)

If BRAND.md does not declare these explicitly, infer them from any sample passages it
contains. If no samples exist, set `VOICE_PROFILE=default` (varied rhythm, opinionated,
first-person allowed, no AI tells -- see "Signs of soulless writing" in
`references/humanizer-patterns.md`).

---

## Step 3: Scan for AI Patterns

```
takeToMarket > SCANNING FOR AI PATTERNS
```

Walk `DRAFT` against every section in `${CLAUDE_PLUGIN_ROOT}/references/humanizer-patterns.md`:

1. CONTENT PATTERNS (sections 1-6) -- significance inflation, notability puffery,
   superficial -ing analyses, promotional language, vague attributions, formulaic
   challenges sections.
2. LANGUAGE AND GRAMMAR PATTERNS (sections 7-13) -- AI vocabulary, copula avoidance,
   negative parallelism, rule of three, elegant variation, false ranges, passive voice.
3. STYLE PATTERNS (sections 14-19) -- em-dash overuse, boldface overuse, inline-header
   lists, title-case headings, emojis, curly quotes.
4. COMMUNICATION PATTERNS (sections 20-22) -- chatbot artifacts, knowledge-cutoff
   disclaimers, sycophantic tone.
5. FILLER AND HEDGING (sections 23-29) -- filler phrases, excessive hedging, generic
   positive conclusions, hyphenated word-pair overuse, persuasive authority tropes,
   signposting, fragmented headers.

For each hit, record:

- Section number from the reference (e.g., `7`, `14`)
- The offending span (a short quote)
- The rewrite shape suggested by the section's Before/After pair

Store the list as `HITS`. If `HITS` is empty AND the draft does not fail the "soulless
writing" check from the reference, skip to Step 6 -- the asset is already clean.

---

## Step 4: Rewrite

```
takeToMarket > REWRITING (${N} pattern hits)
```

For each hit in `HITS`, rewrite the offending span using:

- The Before/After template from the matching section of `humanizer-patterns.md`
- The voice profile from Step 2 -- match the asset's brand cadence, not a generic
  "natural" tone

Rules:

- Preserve claims, numbers, proper nouns, citations, and CTAs verbatim.
- Do NOT introduce new claims or facts. If a vague attribution cannot be replaced with
  a real source from POSITIONING.md proof points or the campaign brief, delete the
  attribution rather than inventing one.
- Do NOT remove a span that is load-bearing for positioning (anchor phrase, proof point,
  differentiator) even if it pattern-matches. Flag it and leave it.
- If the brand voice is itself terse and bullet-heavy, don't rewrite inline-header lists
  into prose paragraphs -- match the brand.
- Soulless output is a failure mode. After mechanical fixes, do one personality pass
  using the "How to add voice" guidance in the reference: vary rhythm, allow opinion,
  let some mess in, be specific.

Store the rewritten text as `DRAFT_V2`.

---

## Step 5: Final Anti-AI Audit

```
takeToMarket > FINAL AUDIT
```

Run one more pass against `DRAFT_V2`:

1. Re-scan against `humanizer-patterns.md`. Record any remaining tells as a short bulleted
   list `REMAINING_TELLS` (cap at 5 items -- the goal is signal, not exhaustiveness).
2. Apply one more revision targeting `REMAINING_TELLS` specifically. Most often this means
   tightening rhythm, breaking up tidy parallel structure, or replacing a remaining
   abstract noun with a concrete one.

Store the result as `DRAFT_FINAL`.

---

## Step 6: Output

Behavior depends on `MODE`:

### MODE = `file` or `campaign` (write back)

Write `DRAFT_FINAL` to the original asset path. Overwrite without prompting -- the previous
draft is recoverable via git.

For campaign mode, after writing the asset, append a line to
`.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json` under the asset's entry:
`"humanized_at": "${ISO_TIMESTAMP}"` (use `node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs"
timestamp --raw`).

### MODE = `inline` (print only)

Print `DRAFT_FINAL` to the conversation. Do not write to disk.

---

## Step 7: Display Summary

```
takeToMarket > HUMANIZATION COMPLETE

Asset: ${TARGET_PATH or "inline"}
Pattern hits found: ${HITS.length}
Top patterns rewritten: ${top 3 section numbers from HITS}
Remaining tells after audit: ${REMAINING_TELLS.length}

[If MODE = file or campaign:]
Asset rewritten in place. Diff is visible via `git diff`.

[If MODE = campaign:]
Manifest annotated with humanized_at timestamp.

[If any positioning-load-bearing spans were flagged-but-not-rewritten:]
WARNING: ${N} span(s) pattern-matched but were preserved because they carry positioning
or proof-point load. Review manually if voice still feels off.
```

</process>

<success_criteria>
- [ ] Source asset resolved (file, campaign asset, or inline text)
- [ ] BRAND.md voice profile loaded and applied to rewrites
- [ ] POSITIONING.md anchors and proof points preserved verbatim
- [ ] Every hit from the pattern scan addressed -- rewritten or flagged with reason
- [ ] Final anti-AI audit completed with remaining tells listed (or empty)
- [ ] Soulless-writing check passed (rhythm varied, voice present, not just clean)
- [ ] Output written to disk (file/campaign mode) or printed (inline mode)
- [ ] Manifest updated with humanized_at when in campaign mode
</success_criteria>

<output>
- File/campaign mode: rewritten asset at the original path
- Campaign mode: `humanized_at` timestamp added to MANIFEST.json asset entry
- Inline mode: rewritten text printed to the conversation
</output>
