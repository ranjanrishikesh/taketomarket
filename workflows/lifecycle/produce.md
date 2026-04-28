<purpose>
Production orchestration workflow for /ttm-produce. Generates content assets in
fresh Task() subagent contexts loaded with brief + positioning (full) + brand (full) +
ICP (full) + playbook (per D-03). Hero asset produced first (blocking), then
derivatives spawned in parallel (per D-01). Writes MANIFEST.json for verify
consumption (per D-11).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md
</required_reading>

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
takeToMarket > LOADING CONTEXT
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

Read Tier 1 summaries from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md`
- `.marketing/COMPETITORS.md`
- `.marketing/METRICS.md`
- `.marketing/LEARNINGS.md`

Read Tier 2 (full content) for production context (per D-03):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`

Read campaign-specific files (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`

---

## Step 2: Validate Campaign State

Check campaign exists:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

If result shows `exists: false`: Tell the user the campaign does not exist and suggest running `/ttm-new-campaign` first. Exit.

Read campaign state. Check the `phase` field:

- If phase is `"briefed"`: This is the expected state. Proceed normally.

- If phase is `"created"` or `"researched"`:
  Warn the user:
  "Campaign has not been briefed yet. Run `/ttm-brief ${SLUG}` first to generate a brief before producing content."
  Exit.

- If phase is `"produced"` or later (verified, reviewed, fixed, shipped, measured, learned):
  Warn the user:
  "Campaign is already in phase '${PHASE}'. Re-producing will overwrite existing assets in CAMPAIGNS/${SLUG}/ASSETS/. Proceed?"
  Wait for user confirmation. If user declines, exit.

---

## Step 3: Parse Assets List from Brief

```
takeToMarket > PARSING BRIEF
```

Read `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`.

Extract the assets list from the brief. The brief contains an "Assets List" section (created by /ttm-brief) structured as a Markdown table with columns: asset type, channel, and role.

Parse each row into an asset entry:
- `type`: The asset type (e.g., blog-post, linkedin-post, email, landing-page)
- `channel`: The target channel (e.g., organic-search, linkedin, email)
- `is_hero`: `true` for the FIRST asset in the list, `false` for all others (per D-01)

The FIRST asset in the list is the hero asset. All others are derivatives.

If no assets list is found in the brief, or if the table is empty:
  Error: "Brief has no assets list -- run `/ttm-brief ${SLUG}` first to generate a complete brief."
  Exit.

Store the parsed list as `ASSETS_LIST` with the total count as `TOTAL_ASSETS`.

---

## Step 4: Resolve Playbooks

For each asset in `ASSETS_LIST`:

1. Map the asset type to a playbook file path: `${CLAUDE_PLUGIN_ROOT}/playbooks/${TYPE}.md`
   (where TYPE is the asset type slug, e.g., `blog-post`, `email`, `linkedin-post`)

2. Check if the playbook file exists:
   ```bash
   test -f "${CLAUDE_PLUGIN_ROOT}/playbooks/${TYPE}.md"
   ```

3. If playbook exists: Record the full path as the asset's `playbook_path`.

4. If playbook does NOT exist: Log a warning:
   ```
   takeToMarket > WARNING: No playbook found for "${TYPE}" -- producing with base context only
   ```
   Set the asset's `playbook_path` to `"none"`.

This is the loading MECHANISM only -- playbook content files are created in Phase 8.

---

## Step 5: Produce Hero Asset

```
takeToMarket > PRODUCING HERO ASSET
```

Identify the hero asset (first entry in `ASSETS_LIST`).

Read the agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.

Fill all placeholders with actual paths:
- `[BRIEF_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`
- `[POSITIONING_PATH]` --> `.marketing/POSITIONING.md`
- `[BRAND_PATH]` --> `.marketing/BRAND.md`
- `[ICP_PATH]` --> `.marketing/ICP.md`
- `[PLAYBOOK_PATH]` --> resolved playbook path from Step 4, or `"none"`
- `[OUTPUT_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/ASSETS/01-${HERO_TYPE}-${HERO_CHANNEL}.md`
- `[ASSET_TYPE]` --> hero asset type from brief (e.g., "blog-post")
- `[CHANNEL]` --> hero asset channel from brief (e.g., "organic-search")
- `[HERO_PATH]` --> `none` (this IS the hero asset)

Call Task() with the populated prompt.

**WAIT** for Task() to complete. The hero MUST finish before any derivatives are spawned.

After Task() returns, verify the hero file exists and has content:
```bash
test -s ".marketing/CAMPAIGNS/${SLUG}/ASSETS/01-${HERO_TYPE}-${HERO_CHANNEL}.md"
```

If the file is empty or missing:
  Error: "Hero asset production failed -- file not written by subagent. Check the brief for completeness and try again."
  Exit.

Store the hero filename as `HERO_FILE` for derivative reference.

---

## Step 6: Produce Derivative Assets

If `TOTAL_ASSETS` is 1 (hero only), skip this step.

```
takeToMarket > PRODUCING DERIVATIVES (${N} assets)
```
Where N = TOTAL_ASSETS - 1.

For each derivative asset in `ASSETS_LIST` (all entries after the hero):

1. Read the agent prompt template from `${CLAUDE_PLUGIN_ROOT}/agents/ttm-producer.md`.

2. Assign a sequential filename:
   - Asset 2: `02-${TYPE}-${CHANNEL}.md`
   - Asset 3: `03-${TYPE}-${CHANNEL}.md`
   - etc.

3. Fill all placeholders:
   - `[BRIEF_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`
   - `[POSITIONING_PATH]` --> `.marketing/POSITIONING.md`
   - `[BRAND_PATH]` --> `.marketing/BRAND.md`
   - `[ICP_PATH]` --> `.marketing/ICP.md`
   - `[PLAYBOOK_PATH]` --> resolved playbook path from Step 4, or `"none"`
   - `[OUTPUT_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/ASSETS/${NN}-${TYPE}-${CHANNEL}.md`
   - `[ASSET_TYPE]` --> derivative asset type
   - `[CHANNEL]` --> derivative asset channel
   - `[HERO_PATH]` --> `.marketing/CAMPAIGNS/${SLUG}/ASSETS/${HERO_FILE}`

4. Call Task() with the populated prompt.

All derivative Task() calls can run in parallel (per D-01 wave-parallel pattern).

After ALL derivative Task() calls complete, verify each derivative file exists and has content:
```bash
test -s ".marketing/CAMPAIGNS/${SLUG}/ASSETS/${NN}-${TYPE}-${CHANNEL}.md"
```

For any derivative that failed (file empty or missing):
- Log a warning: `takeToMarket > WARNING: Derivative ${NN}-${TYPE}-${CHANNEL}.md failed -- file not written`
- Continue with the remaining assets. Do NOT abort the entire production run.

Track successful and failed derivatives for the manifest.

---

## Step 7: Write Production Manifest

```
takeToMarket > WRITING MANIFEST
```

Read the manifest template from `${CLAUDE_PLUGIN_ROOT}/templates/production-manifest.json`.

Fill with actual values:

```json
{
  "campaign": "${SLUG}",
  "produced_at": "${ISO_TIMESTAMP}",
  "context_loaded": {
    "brief": ".marketing/CAMPAIGNS/${SLUG}/BRIEF.md",
    "positioning": ".marketing/POSITIONING.md",
    "brand": ".marketing/BRAND.md",
    "icp": ".marketing/ICP.md"
  },
  "hero": {
    "asset_id": 1,
    "name": "01-${HERO_TYPE}-${HERO_CHANNEL}",
    "type": "${HERO_TYPE}",
    "channel": "${HERO_CHANNEL}",
    "playbook": "${HERO_PLAYBOOK_PATH_OR_NONE}",
    "file": "ASSETS/01-${HERO_TYPE}-${HERO_CHANNEL}.md"
  },
  "derivatives": [
    {
      "asset_id": 2,
      "name": "02-${TYPE}-${CHANNEL}",
      "type": "${TYPE}",
      "channel": "${CHANNEL}",
      "playbook": "${PLAYBOOK_PATH_OR_NONE}",
      "file": "ASSETS/02-${TYPE}-${CHANNEL}.md",
      "derived_from": 1
    }
  ],
  "total_assets": ${TOTAL_SUCCESSFUL_ASSETS}
}
```

Generate the timestamp:
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
```

Only include successfully produced assets (those that passed the `test -s` check) in the manifest.
If any derivatives failed, `total_assets` reflects only the successful count.

Write the completed manifest to `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json`.

The manifest is the ONLY bridge between produce and verify contexts (per D-11). Verify reads
this file to discover which assets exist and what context was loaded during production.

---

## Step 8: Update Campaign State and Summary

Update campaign phase:
```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase produced
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.produced "$TIMESTAMP"
```

Display completion banner:
```
takeToMarket > PRODUCTION COMPLETE

Assets produced: ${TOTAL_SUCCESSFUL_ASSETS}
Hero: 01-${HERO_TYPE}-${HERO_CHANNEL}.md
Derivatives: [list of derivative filenames]
Manifest: .marketing/CAMPAIGNS/${SLUG}/MANIFEST.json

[If any derivatives failed:]
WARNING: ${FAILED_COUNT} derivative(s) failed production. Check the manifest for details.

Next: Run /ttm-verify ${SLUG} to validate assets against quality gates
```

</process>

<success_criteria>
- [ ] All assets from brief's assets list written to CAMPAIGNS/<slug>/ASSETS/
- [ ] Hero asset produced before derivatives (sequential then parallel)
- [ ] Each subagent loaded with brief + positioning (full) + brand (full) + ICP (full) + playbook
- [ ] MANIFEST.json written with all successful asset entries
- [ ] Campaign STATE.md updated to phase=produced with timestamp
- [ ] No playbook errors (graceful fallback for missing playbooks with warning)
- [ ] Failed derivatives logged but do not abort the run
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/ASSETS/*.md` (produced content files)
- `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json` (production manifest for /ttm-verify)
</output>
