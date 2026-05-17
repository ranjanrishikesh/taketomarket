<purpose>
Measurement workflow for /ttm-measure. Accepts analytics data via 3 pathways
(MCP tools, CSV/Markdown paste, structured batch questions). Applies 3 attribution
models (last-touch, linear, time-decay). Generates an outcome-first measurement
report. Updates campaign state. Use after a campaign has been shipped and analytics
data is available for the measurement window.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/measurement-template.md
@${CLAUDE_PLUGIN_ROOT}/templates/measurement-report.md
</required_reading>

<constraints>

## Positioning Constraint (Read-Only)

`.taketomarket/POSITIONING.md` is loaded for context only. This workflow MUST NOT modify
POSITIONING.md. Positioning changes require `/ttm-positioning` -- never alter positioning
as a side effect of measurement.

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

</constraints>

<process>

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

If SLUG is empty, error: "Usage: /ttm-measure [campaign-slug]. Provide a campaign slug." Exit.

Read Tier 1 summary blocks (content between `<!-- _SUMMARY -->` and `<!-- END_SUMMARY -->`)
from all 9 `.taketomarket/` reference files:

- `.taketomarket/POSITIONING.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/BRAND.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/ICP.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/CHANNELS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/STATE.md` (frontmatter only)
- `.taketomarket/CALENDAR.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/COMPETITORS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/METRICS.md` (lines 1 to `<!-- END_SUMMARY -->`)
- `.taketomarket/LEARNINGS.md` (lines 1 to `<!-- END_SUMMARY -->`)

Read Tier 2 (full content) for:
- `.taketomarket/METRICS.md` (needed for metric definitions and outcome/output classification)
- `.taketomarket/CHANNELS.md` (needed for channel attribution mapping)

Read campaign-specific files (always full-load per context-loading.md rule 4):
- `.taketomarket/CAMPAIGNS/${SLUG}/STATE.md`
- `.taketomarket/CAMPAIGNS/${SLUG}/BRIEF.md`

Extract from brief:
- **Outcome metric:** name, target value, measurement window, data source
- **Output metrics:** asset counts, intermediate indicators
- **Channel mix:** channels used in campaign (for attribution)

---

## Step 2: Validate Campaign State

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state ${SLUG} --raw
```

Verify campaign is in `shipped` or `measured` phase (re-measurement is allowed).

**If NOT shipped or measured:**
```
takeToMarket > ERROR

Campaign must be shipped before measuring.
Current phase: ${PHASE}
Run /ttm-ship first.
```
Exit -- do not continue.

**If shipped or measured:** Continue to Step 3.

If phase is `measured`, inform the user:
```
takeToMarket > RE-MEASUREMENT

Campaign '${SLUG}' has already been measured.
Running measurement again will generate a new MEASUREMENT.md.
Previous measurement data will be overwritten.
```

Wait for user confirmation before continuing.

---

## Step 3: Detect Analytics Source

Attempt detection in priority order per D-01 and D-04.

### Priority 1: MCP Analytics Tools (ANALYTICS_MODE=mcp)

Check for analytics MCP tools by attempting tool availability detection:
- PostHog MCP tools (posthog_*, *posthog*)
- Amplitude MCP tools (amplitude_*, *amplitude*)
- GA4 / Google Analytics MCP tools (ga4_*, google_analytics_*, *ga4*)
- Mixpanel MCP tools (mixpanel_*, *mixpanel*)
- Any tool matching pattern *analytics*, *metric*, *event*

If any analytics MCP tool is detected:
```
takeToMarket > ANALYTICS MODE: MCP

Detected analytics tools: ${TOOL_NAMES}
Collecting data via MCP integration.
```
Set ANALYTICS_MODE=mcp. Proceed to Step 4 with MCP collection.

### Priority 2: CSV/Markdown Paste (ANALYTICS_MODE=paste)

If no MCP tools detected, prompt user:
```
takeToMarket > NO ANALYTICS MCP TOOLS DETECTED

You can paste your analytics data directly. We accept:
- CSV data (comma or tab separated)
- Markdown tables
- Plain text with metric labels and values

Here's what we need (paste all available data):
```

Display the contents of `${CLAUDE_PLUGIN_ROOT}/references/measurement-template.md`.

Set ANALYTICS_MODE=paste.

Wait for the user to paste data. If the user pastes data, proceed to Step 4.

### Priority 3: Structured Batch Questions (ANALYTICS_MODE=batch)

If user indicates they cannot paste bulk data (e.g., "I don't have a spreadsheet",
"can you ask me questions?", or pastes insufficient data), switch to batch mode:

```
takeToMarket > ANALYTICS MODE: GUIDED

I'll ask for your data in 4 batches.
```

Set ANALYTICS_MODE=batch.

**Batch 1 -- Outcome Metrics:**
"What are your results for the campaign's outcome metric(s)?
[List outcome metrics from brief with their targets]:
- ${OUTCOME_METRIC_NAME}: target was ${OUTCOME_TARGET}. What was the actual result?"

**Batch 2 -- Traffic & Engagement:**
"Paste your traffic and engagement metrics (any you have):
- Page views, sessions, unique visitors
- Bounce rate, average time on page, pages per session"

**Batch 3 -- Conversion & Revenue:**
"Paste your conversion and revenue metrics (any you have):
- Conversions (signups, purchases, form fills)
- Conversion rate
- Revenue or pipeline value"

**Batch 4 -- Channel Attribution:**
"For each channel used in this campaign, share what you have:

| Channel | Touches/Impressions | Conversions | Revenue |
|---------|---------------------|-------------|---------|
[Pre-fill channel names from brief's channel mix]"

Proceed to Step 4 after collecting all batch responses.

---

## Step 4: Collect and Parse Data

Based on ANALYTICS_MODE:

### MCP Mode
Use detected MCP tools to query analytics data for the campaign's measurement window
(from brief: measurement window start to current date or window end).

Map tool output to expected metric fields:
- Outcome metrics (from brief definition)
- Traffic metrics (page views, sessions, visitors)
- Engagement metrics (bounce rate, time on page)
- Conversion metrics (conversions, rate, revenue)
- Channel attribution data (per-channel touches, conversions, revenue)

### Paste Mode
Parse pasted CSV, Markdown tables, or plain text. Map columns/rows to expected
metric fields.

If unmapped columns exist (per D-03), ask the user:
```
I found data I couldn't automatically map:
- [COLUMN_1]: What does this represent?
- [COLUMN_2]: What does this represent?

You can skip any that aren't relevant.
```

### Batch Mode
Collect responses from all 4 batches. Structure into the same internal format as
paste and MCP modes.

### Data Validation (all modes)
After parsing, verify minimum data requirements:
- Outcome metric actual value (REQUIRED -- cannot generate report without this)
- At least one traffic or engagement metric (WARN if missing)
- Channel data for attribution (WARN if missing -- will note single-channel)

If outcome metric actual value is missing, ask:
"I need the actual result for your outcome metric (${OUTCOME_METRIC_NAME}) to generate
the measurement report. What was the actual value?"

---

## Step 5: Apply Attribution Models

Calculate all 3 models from channel attribution data:

### Last-Touch Attribution
Assign 100% credit to the last touchpoint before each conversion.
- If conversion path data is available: use actual last touch
- If only aggregate channel data: assign 100% to highest-converting channel

### Linear Attribution
Distribute credit equally across all touchpoints in each conversion path.
- If conversion path data is available: divide equally per path
- If only aggregate channel data: distribute proportional to touch count

### Time-Decay Attribution (DEFAULT DISPLAY per D-05)
Weight credit exponentially toward the most recent touchpoint.
Half-life: 7 days.
- Recent touches receive higher weight using formula: weight = 2^(-days_since_touch / 7)
- Normalize weights to sum to 100%

If channel attribution data is insufficient (single channel only), note:
"Single-channel campaign -- attribution models show identical results."

If no channel attribution data at all, note:
"Channel attribution data not available. Attribution analysis skipped.
To include attribution, re-run /ttm-measure with per-channel data."

---

## Step 6: Generate Measurement Report (Outcome-First per D-05, D-06, LIFE-15)

```
takeToMarket > GENERATING MEASUREMENT REPORT
```

Generate MEASUREMENT.md using the `${CLAUDE_PLUGIN_ROOT}/templates/measurement-report.md`
template structure.

**CRITICAL: Outcome Assessment section MUST be first.**

Fill template fields:
- `${SLUG}`: campaign slug
- `${ISO_DATE}`: current timestamp via `node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw`
- `${ANALYTICS_SOURCE}`: mcp, paste, or batch
- `${OUTCOME_MET}`: YES or NO (did actual meet or exceed target?)
- `${OUTCOME_DELTA}`: percentage difference from target (e.g., "+15%" or "-8%")
- `${CAMPAIGN_NAME}`: from campaign STATE.md

### Outcome Assessment (FIRST section)
Open with: **Did we hit the target? YES/NO**

Fill the metrics table with outcome metric FIRST, then output metrics:
- Compare actual values against targets from brief
- Calculate delta as percentage: ((actual - target) / target) * 100
- Status: HIT (met or exceeded), MISS (below target), PARTIAL (within 10% of target)

### Attribution Analysis
Display time-decay attribution as default (per D-05).
Note that last-touch and linear are available on request.

### Channel Performance
One subsection per channel with key metrics.

### Signals for Learn Phase
Identify:
- **Overperformance:** channels or metrics that exceeded expectations
- **Underperformance:** channels or metrics that fell short
- **Unexpected patterns:** anomalies or surprises in the data
- **Hypothesis validation:** did the campaign's positioning hypothesis hold?

### Raw Data
Preserve the original pasted/collected data for audit trail.

Write completed report to:
```
.taketomarket/CAMPAIGNS/${SLUG}/MEASUREMENT.md
```

---

## Step 7: Update Campaign State

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} phase measured
```

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
```

```bash
# Read current run count (default to 0 if first measurement)
CURRENT_STATE=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state ${SLUG} --raw)
# Increment run count
RUN_COUNT=$((PREVIOUS_RUN_COUNT + 1))

node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} measure.run_count ${RUN_COUNT}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} measure.last_run ${TIMESTAMP}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} measure.outcome_result ${YES_OR_NO}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} measure.outcome_delta ${DELTA_PERCENT}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} measure.analytics_source ${ANALYTICS_MODE}
```

---

## Step 8: Display Summary and Next Steps

Display the Outcome Assessment section inline (the metrics table from Step 6).

```
takeToMarket > MEASUREMENT COMPLETE

Report written to: .taketomarket/CAMPAIGNS/${SLUG}/MEASUREMENT.md
Analytics source: ${ANALYTICS_MODE}
Outcome metric: ${OUTCOME_METRIC_NAME}
Result: ${OUTCOME_MET} (${OUTCOME_DELTA} from target)

Next: Run /ttm-learn ${SLUG} to extract lessons and improve future campaigns.
```

</process>

<checklist>
- [ ] Campaign is in shipped or measured phase
- [ ] Analytics data collected via one of 3 pathways (MCP/paste/batch)
- [ ] Outcome metric compared against target value from brief
- [ ] 3 attribution models calculated (time-decay shown as default)
- [ ] MEASUREMENT.md written with outcome-first ordering
- [ ] Campaign state updated with measure.* fields
</checklist>
