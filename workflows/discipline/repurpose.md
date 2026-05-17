<purpose>
Fan out a long-form source asset into derivative assets across channels. Executes full
brief-produce-verify per derivative with hero-first Task() orchestration. Each derivative
gets a channel-adapted brief, fresh production context, and independent verification.
This is NOT a lightweight command -- it runs the full production lifecycle per derivative.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md
@${CLAUDE_PLUGIN_ROOT}/workflows/lifecycle/brief.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.

## Campaign Context Required

This workflow MUST be run within an existing campaign context. The source asset must
exist in a campaign's ASSETS/ directory with a campaign that is in phase: produced,
verified, reviewed, fixed, or shipped.
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

When TEXT_MODE is active, replace each AskUserQuestion with a plain-text numbered list:
```
[HEADER]
[QUESTION]
  1. [OPTION_1_LABEL] -- [OPTION_1_DESCRIPTION]
  2. [OPTION_2_LABEL] -- [OPTION_2_DESCRIPTION]
  ...
Type the number of your choice:
```

---

## Step 1: Load Context

```
takeToMarket > LOADING REPURPOSE CONTEXT
```

Extract SOURCE_ASSET_PATH from $ARGUMENTS (strip `--text` flag if present):
```bash
SOURCE_ASSET_PATH=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

Read Tier 1 summaries from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.taketomarket/POSITIONING.md`
- `.taketomarket/BRAND.md`
- `.taketomarket/ICP.md`
- `.taketomarket/CHANNELS.md`
- `.taketomarket/STATE.md` (frontmatter only)
- `.taketomarket/CALENDAR.md`
- `.taketomarket/COMPETITORS.md`
- `.taketomarket/METRICS.md`
- `.taketomarket/LEARNINGS.md`

Read Tier 2 (full content) for production context:
- `.taketomarket/POSITIONING.md`
- `.taketomarket/CHANNELS.md`
- `.taketomarket/BRAND.md`
- `.taketomarket/ICP.md`

---

## Step 2: Identify Source Asset

Parse SOURCE_ASSET_PATH from $ARGUMENTS.

### Validate Path (T-10-11 mitigation)

Use path.resolve() equivalent to canonicalize the path, then verify:

1. **File exists** at the specified path
2. **Path is within `.taketomarket/CAMPAIGNS/`** directory -- reject any path that does not
   resolve to a location under `.taketomarket/CAMPAIGNS/[slug]/ASSETS/`
3. **Campaign is in appropriate phase** -- read the campaign's STATE.md and confirm phase
   is one of: produced, verified, reviewed, fixed, or shipped

Extract from the validated path and campaign data:
- `CAMPAIGN_SLUG` -- extracted from the path (the directory name under CAMPAIGNS/)
- `SOURCE_ASSET_ID` -- look up the source file in MANIFEST.json by matching the filename
  against hero.file and derivatives[].file entries. Extract the matching asset_id.
- `SOURCE_CHANNEL` -- from the matching MANIFEST.json asset entry's channel field
- `SOURCE_CONTENT` -- read the full file content

If validation fails at any step, display a specific error:
- Path not found: "Source asset not found at [path]. Check the file path and try again."
- Not in CAMPAIGNS: "Source asset must be within a .taketomarket/CAMPAIGNS/[slug]/ASSETS/ directory."
- Wrong phase: "Campaign [slug] is in phase [phase]. Repurpose requires produced, verified, reviewed, fixed, or shipped."
- Not in MANIFEST: "Source asset not found in MANIFEST.json. Was this asset produced by /ttm-produce?"

---

## Step 3: Select Target Channels

Read `.taketomarket/CHANNELS.md` active channels list.

Parse all active channels from CHANNELS.md. Remove SOURCE_CHANNEL from the list
(do not repurpose to the same channel the source was produced for).

Default selection: all remaining active channels.

Ask user for channel selection (per D-12):

```
AskUserQuestion:
  title: "Repurpose Target Channels"
  question: "Repurpose to which channels? Default: all active channels minus source."
  options:
    - label: "All channels"
      description: "[list all remaining channels]"
    - label: "[channel 1]"
      description: "Repurpose to [channel 1] only"
    - label: "[channel 2]"
      description: "Repurpose to [channel 2] only"
    - label: "Custom selection"
      description: "Enter comma-separated channel numbers"
```

If user selects "All channels" or accepts the default: use all remaining active channels.
If user selects a specific channel: use only that channel.
If user selects "Custom selection": collect comma-separated numbers and resolve to channels.

### Identify Hero Channel (per D-13)

From the selected target channels, identify the HERO_CHANNEL -- the channel with the
highest reach baseline from CHANNELS.md metrics/baselines section.

If baselines are not available or tied: use the first channel in the selected list.

Store `HERO_CHANNEL` and `HERO_CHANNEL_SLUG` (URL-safe version of channel name).
Store remaining channels as `REMAINING_CHANNELS`.

---

## Step 4: Generate Derivative Briefs

```
takeToMarket > GENERATING DERIVATIVE BRIEFS ([N] channels)
```

For each target channel, generate a channel-adapted derivative brief (per D-11).

Read the source asset content and extract the core message/thesis.
Cross-reference `.taketomarket/CHANNELS.md` for each target channel's configuration:
- Format requirements (content type, structure)
- Typical length/word count for the channel
- Audience overlap with source channel

Cross-reference `.taketomarket/BRAND.md` for tone-per-context adjustments if defined
for the target channel.

Write each brief with these sections:
- **Header:** Derivative Brief title, source filename, campaign slug, source asset ID
- **Adaptation Requirements:** Channel name, format (from CHANNELS.md), length, tone adjustment (from BRAND.md or "match source")
- **Core Message:** Extract primary thesis, key claims, and CTA from source (must be preserved)
- **Channel-Specific Adaptations:** Hook/opening, structure, length limits, CTA format, playbook rules
- **Positioning Anchor:** Primary differentiator and proof points from POSITIONING.md (direct quote)
- **Outcome Metric:** Inherit from campaign BRIEF.md, or channel-default from CHANNELS.md baselines

Write each brief to: `.taketomarket/CAMPAIGNS/${CAMPAIGN_SLUG}/REPURPOSE-BRIEF-${CHANNEL_SLUG}.md`

---

## Step 5: Produce Hero Derivative

```
takeToMarket > REPURPOSING: HERO DERIVATIVE ([HERO_CHANNEL])
```

Read the agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.

Fill placeholders:
- `[BRIEF_PATH]` --> `.taketomarket/CAMPAIGNS/${CAMPAIGN_SLUG}/REPURPOSE-BRIEF-${HERO_CHANNEL_SLUG}.md`
- `[POSITIONING_PATH]` --> `.taketomarket/POSITIONING.md`
- `[BRAND_PATH]` --> `.taketomarket/BRAND.md`
- `[ICP_PATH]` --> `.taketomarket/ICP.md`
- `[PLAYBOOK_PATH]` --> resolved playbook for HERO_CHANNEL (from `${CLAUDE_PLUGIN_ROOT}/playbooks/${CHANNEL_TYPE}.md`), or `"none"` if not found
- `[OUTPUT_PATH]` --> `.taketomarket/CAMPAIGNS/${CAMPAIGN_SLUG}/ASSETS/R-01-${HERO_CHANNEL_SLUG}.md`
- `[ASSET_TYPE]` --> derivative content type for this channel
- `[CHANNEL]` --> HERO_CHANNEL name
- `[HERO_PATH]` --> SOURCE_ASSET_PATH (the original source serves as the "hero" reference)

Also inject a "Source Asset Reference" section into the prompt with SOURCE_CHANNEL
and SOURCE_ASSET_PATH so the producer can reference the original content.

Call Task() with the populated prompt.
**WAIT** for Task() to complete before proceeding.

After Task() returns, verify the hero derivative file exists and has content:
```bash
test -s ".taketomarket/CAMPAIGNS/${CAMPAIGN_SLUG}/ASSETS/R-01-${HERO_CHANNEL_SLUG}.md"
```

If the file is empty or missing:
  Error: "Hero derivative production failed -- file not written by subagent."
  Exit.

---

## Step 6: Produce Remaining Derivatives (Wave-Parallel)

If only 1 target channel was selected (hero only): skip this step.

```
takeToMarket > REPURPOSING: DERIVATIVES ([N] channels, wave-parallel)
```

For each channel in REMAINING_CHANNELS:

1. Read agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`

2. Assign sequential filename: `R-[NN]-${CHANNEL_SLUG}.md` where NN starts at 02

3. Fill all placeholders (same pattern as Step 5, with channel-specific values and
   `[HERO_PATH]` pointing to the hero derivative `R-01-${HERO_CHANNEL_SLUG}.md`)
4. Inject Source Asset Reference (same as Step 5)
5. Call Task() with the populated prompt

All derivative Task() calls run in parallel (per D-13 wave-parallel pattern).

After ALL Task() calls complete, verify each output file exists and has content (> 50 chars):
```bash
test -s ".taketomarket/CAMPAIGNS/${CAMPAIGN_SLUG}/ASSETS/R-${NN}-${CHANNEL_SLUG}.md"
```

For any derivative that failed (file empty or missing):
- Log warning: `takeToMarket > WARNING: Derivative R-${NN}-${CHANNEL_SLUG}.md failed`
- Continue with remaining assets. Do NOT abort the repurpose run.

Track successful and failed derivatives for the manifest and completion banner.

---

## Step 7: Verify Derivatives

```
takeToMarket > VERIFYING DERIVATIVES
```

For each successfully produced derivative, run simplified inline gate checks:

Run 3 simplified gates per derivative (PASS / WARN / FAIL each):

1. **Positioning Drift** -- maintains primary differentiator, claims trace to proof points, no must-not-say terms
2. **Format Correctness** -- meets channel length constraints, has required structural elements (hook, CTA), follows channel conventions
3. **Voice Drift** -- matches BRAND.md voice archetype, no banned words, tone consistent with source

Record results as `VERIFY_RESULTS` array with per-derivative gate outcomes.

If any FAIL: flag for user attention but do NOT auto-fix. Recommend `/ttm-fix` or `/ttm-verify`.

---

## Step 8: Update MANIFEST.json

```
takeToMarket > UPDATING MANIFEST
```

Read existing MANIFEST.json to determine the next available asset_id.
Find the maximum asset_id across hero.asset_id and all derivatives[].asset_id.
Set NEXT_ID = max_id + 1.

Build `DERIVATIVES_JSON` array -- one entry per successfully produced derivative, each with
`asset_id` (sequential from NEXT_ID), `name`, `type: "derivative"`, `channel`, and `file`.

Run the campaign.cjs CLI to update MANIFEST.json:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign repurpose-manifest "${CAMPAIGN_SLUG}" ${SOURCE_ASSET_ID} '${DERIVATIVES_JSON}'
```

Verify the command succeeded (exit code 0 and output contains "derivatives_added").

---

## Step 9: Completion Banner

Display a banner with:
- Source asset name and channel
- Campaign slug
- Derivative count (successful / attempted)
- Per-derivative table: #, Channel, File, Positioning result, Format result, Voice result
- Warnings for any failed productions or FAIL gate results
- Manifest and brief file paths
- Next steps: `/ttm-verify`, `/ttm-review`, `/ttm-fix`

</process>

<success_criteria>
- [ ] Source asset validated (exists, in campaign, campaign in correct phase)
- [ ] Channel selection defaults to all active minus source, with user override
- [ ] Hero derivative produced first (blocking) in highest-reach channel
- [ ] Remaining derivatives produced in wave-parallel via Task()
- [ ] Each derivative gets a channel-adapted brief cross-referencing CHANNELS.md
- [ ] Simplified verification (positioning drift, format, voice) runs per derivative
- [ ] All derivatives tracked in MANIFEST.json with source_asset_id
- [ ] Completion banner with per-derivative verification results
</success_criteria>

<output>
- `.taketomarket/CAMPAIGNS/${SLUG}/REPURPOSE-BRIEF-*.md` (per-channel derivative briefs)
- `.taketomarket/CAMPAIGNS/${SLUG}/ASSETS/R-*.md` (produced derivative assets)
- `.taketomarket/CAMPAIGNS/${SLUG}/MANIFEST.json` (updated with derivative entries)
</output>
