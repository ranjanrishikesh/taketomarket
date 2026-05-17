<purpose>
Interview-driven onboarding that generates all .taketomarket/ reference files
from structured questioning. Use when setting up takeToMarket for a new project.
Orchestrates a 6-section interview with specificity validation, then generates
9 reference files plus CLAUDE.md and AGENTS.md instruction files.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/workflows/setup/init-questions.md
@${CLAUDE_PLUGIN_ROOT}/workflows/setup/init-validation.md
</required_reading>

<process>

## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list and ask the user to type
their choice number.

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

For multiSelect questions, instruct the user: "Type the numbers of your choices separated by commas (e.g., 1,3,5):"

---

## Step 1: Pre-flight

```
takeToMarket > INITIALIZING
```

Run init status check:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs init --raw
```

**If result is "initialized":**

Use AskUserQuestion:
- header: "Existing Setup"
- question: ".taketomarket/ already contains reference files. What would you like to do?"
- options:
  - label: "Start fresh"
    description: "Delete existing files and re-run the full interview"
  - label: "Update specific files"
    description: "Choose which reference files to regenerate"
  - label: "Cancel"
    description: "Exit without changes"

**If "Start fresh":** Delete .taketomarket/ contents (except CAMPAIGNS/ and PLAYBOOKS/) and continue to Step 2.
**If "Update specific files":** Present file picker using AskUserQuestion with multiSelect: true listing all 9 reference files. Run only the interview sections that map to selected files (see Question-to-Template Mapping in init-questions.md). Skip unselected sections and jump to Step 9 for generation.
**If "Cancel":** Exit with message "No changes made."

**If result is "not initialized":**
```bash
mkdir -p .taketomarket/CAMPAIGNS
mkdir -p .taketomarket/PLAYBOOKS
```
Continue to Step 2.

---

## Step 2: Interview -- Section 1: Product and Positioning

```
takeToMarket > SECTION 1: PRODUCT AND POSITIONING
```

This section collects data for **POSITIONING.md**.

Ask the **Product Category** structured question from init-questions.md Section 1 via AskUserQuestion.
Then ask all 5 freeform questions from init-questions.md Section 1 in sequence.

**Specificity validation for Section 1:**

After collecting all answers, validate:

- **Differentiator check:** FAIL if differentiator is a single adjective or contains only banned phrases. FAIL if it does not describe a specific mechanism, capability, or process.
  - PASS: "Auto-generates sprint plans from Slack conversations"
  - FAIL: "The most innovative project management tool"

- **Target audience check:** FAIL if audience specifies fewer than 2 of: role, company size, industry, geography.
  - PASS: "VP Marketing at B2B SaaS companies with 50-500 employees"
  - FAIL: "Modern teams"

- **Proof points check:** FAIL if fewer than 2 proof points. FAIL if any lacks a verifiable source.
  - PASS: "42% reduction in churn after implementing X (Source: Q3 2025 internal analysis)"
  - FAIL: "Customers love our product"

- **Must-not-say check:** FAIL if fewer than 2 banned terms. FAIL if any lacks reasoning.
  - PASS: "'Disruptive' -- overused in our category, signals no real differentiation"
  - FAIL: Just a list of words with no reasoning

**Global banned phrases** -- check all freeform answers against the Banned Phrases table in init-validation.md. Reject any answer containing superlatives, buzzwords, impact words, or vague qualifiers without a specific mechanism.

**On validation failure**, re-prompt:
```
Your [FIELD_NAME] is too vague. Here's what specific looks like:
  - Vague: '[FAIL_EXAMPLE]'
  - Specific: '[PASS_EXAMPLE]'
Please try again with more specificity.
```

Maximum 2 re-prompts per field. After 2 retries, accept with flag:
`<!-- SPECIFICITY_WARNING: [field] accepted after 2 retries -->`

Store all collected answers for file generation in Step 9.

---

## Step 3: Interview -- Section 2: Brand and Voice

```
takeToMarket > SECTION 2: BRAND AND VOICE
```

This section collects data for **BRAND.md**.

Ask the **Voice Archetype** and **Formality Level** structured questions from init-questions.md Section 2 via AskUserQuestion.
Then ask all 4 freeform questions from init-questions.md Section 2 in sequence.

**Specificity validation for Section 2:**

- **Voice archetype check:** FAIL if description is under 20 words. FAIL if no concrete personality traits.
  - PASS: "Confident but not arrogant. We explain complex concepts simply. We use data to back claims. We never talk down to the reader."
  - FAIL: "Professional and friendly"

- **Examples check:** FAIL if on-brand example is under 10 words. FAIL if off-brand example is missing or identical style.

- **Banned words check:** FAIL if zero banned words listed. WARN if banned words lack reasoning.

On WARN: "Your banned words could be more specific, but I'll accept it for now. You can update this later with `/ttm-brand-refresh`."

---

## Step 4: Interview -- Section 3: ICP and Audience

```
takeToMarket > SECTION 3: ICP AND AUDIENCE
```

This section collects data for **ICP.md**.

No structured questions for this section. Ask all 6 freeform questions from init-questions.md Section 3 in sequence.

**Specificity validation for Section 3:**

- **Segment check:** FAIL if description specifies fewer than 2 of: role, company size, industry, geography.

- **Pain points check:** FAIL if fewer than 2 pain points. FAIL if pain points are generic.
  - PASS: "Spends 4+ hours weekly manually reconciling campaign data across 5 analytics platforms"
  - FAIL: "Struggles with marketing"

- **JTBD check:** FAIL if job description is under 10 words. FAIL if it uses banned phrases.

- **Customer language check:** WARN (not FAIL) if fewer than 3 phrases provided -- this data is harder to have on hand.

On WARN: "Your customer language could be more detailed, but I'll accept it for now. You can update this later with `/ttm-icp-refresh`."

---

## Step 5: Interview -- Section 4: Channels

```
takeToMarket > SECTION 4: CHANNELS
```

This section collects data for **CHANNELS.md**.

Ask the **Primary Channel** structured question from init-questions.md Section 4 via AskUserQuestion.
Then ask all 4 freeform questions from init-questions.md Section 4 in sequence.

**Specificity validation for Section 4:**

- **Channel list check:** FAIL if zero active channels listed. WARN if no baseline metrics provided for active channels.

- **Budget check:** WARN if no budget split provided (acceptable for early-stage companies).

On WARN: "Your channel baselines could be more detailed, but I'll accept it for now. You can update this later with `/ttm-health`."

---

## Step 6: Interview -- Section 5: Competitors

```
takeToMarket > SECTION 5: COMPETITORS
```

This section collects data for **COMPETITORS.md**.

No structured questions for this section. Ask all 4 freeform questions from init-questions.md Section 5 in sequence.

**Specificity validation for Section 5:**

- **Competitor list check:** FAIL if zero competitors named. WARN if fewer than 2 competitors (acceptable for new categories). FAIL if entries lack positioning description.

- **Positioning map check:** WARN if no axes defined (can be refined later).

On WARN: "Your competitor analysis could be more detailed, but I'll accept it for now. You can update this later with `/ttm-competitor-scan`."

---

## Step 7: Interview -- Section 6: Metrics and Calendar

```
takeToMarket > SECTION 6: METRICS AND CALENDAR
```

This section collects data for **METRICS.md** and **CALENDAR.md**.

Ask the **Attribution Model** structured question from init-questions.md Section 6 via AskUserQuestion.
Then ask all 7 freeform questions from init-questions.md Section 6 in sequence.

**Specificity validation for Section 6:**

- **Primary metric check:** FAIL if metric is an output metric only (e.g., "blog posts published") without an outcome metric.
  - PASS: "Qualified pipeline generated from content marketing -- target $500K/quarter"
  - FAIL: "Number of blog posts published per month"

- **Secondary metrics check:** WARN if no secondary metrics provided.

- **Calendar check:** WARN if no quarterly theme provided. WARN if no cadence defined.

On WARN: "Your metrics/calendar data could be more detailed, but I'll accept it for now. You can update this later with `/ttm-health`."

---

## Step 8: Confirmation Gate

```
takeToMarket > REVIEW
```

Display a summary of what was collected:
- Product category and positioning summary (differentiator in one sentence)
- Voice archetype and formality level
- Primary ICP segment (role, company size, industry)
- Active channels and primary channel
- Top competitors named
- Primary outcome metric and target

Use AskUserQuestion:
- header: "Ready?"
- question: "Here's what I'll use to generate your reference files. Ready to proceed?"
- options:
  - label: "Generate files"
    description: "Create all .taketomarket/ reference files"
  - label: "Revise a section"
    description: "Go back and update specific answers"

**If "Revise a section":** Use AskUserQuestion with options listing sections 1-6. Re-run the selected section's interview questions and validation. Return to this confirmation gate.

**If "Generate files":** Continue to Step 9.

---

## Step 9: Generate Reference Files

```
takeToMarket > GENERATING REFERENCE FILES
```

For each reference file, follow this pattern:

1. Read the template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/{filename}.md`
2. Generate the file content by filling ALL `[GENERATED BY /ttm-init]` placeholders with interview data
3. **Critical structural requirements:**
   - Preserve `<!-- _SUMMARY: ... -->` and `<!-- END_SUMMARY -->` comment markers exactly as they appear in the template
   - Summary section must be under 200 words
   - Preserve all table structures from the template
   - For dates, use: `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw`
4. Write to `.taketomarket/{FILENAME}.md`

**Generate files in this order:**

### 1. POSITIONING.md (from Section 1 data)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/positioning.md`
Fill: Category, Target audience, Primary differentiator, Proof points, Must-not-say, Competitive frame, Positioning History date.
Write to: `.taketomarket/POSITIONING.md`

### 2. BRAND.md (from Section 2 data)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/brand.md`
Fill: Voice archetype, Voice attributes, Tone per context, Banned words with reasoning, Proof points, Good and bad examples.
Write to: `.taketomarket/BRAND.md`

### 3. ICP.md (from Section 3 data)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/icp.md`
Fill: Primary segment, Demographics, Psychographics, JTBD, Pain points with severity and frequency, Buying triggers, Anti-ICP, Customer language library.
Write to: `.taketomarket/ICP.md`

### 4. CHANNELS.md (from Section 4 data)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/channels.md`
Fill: Active channels with baselines, Primary channel, Dormant channels with reasons, Banned channels with reasons, Budget allocation, Channel-specific rules.
Write to: `.taketomarket/CHANNELS.md`

### 5. COMPETITORS.md (from Section 5 data)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/competitors.md`
Fill: Direct competitors (positioning, strength, weakness), Positioning map axes and positions, Share of voice baseline.
Write to: `.taketomarket/COMPETITORS.md`

### 6. METRICS.md (from Section 6 data -- metrics portion)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/metrics.md`
Fill: Primary outcome metric (metric/target/window/source), Secondary metrics, Leading indicators, Baselines, Attribution model.
Write to: `.taketomarket/METRICS.md`

### 7. CALENDAR.md (from Section 6 data -- calendar portion)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/calendar.md`
Fill: Quarterly themes, Launch calendar, Always-on cadence, Blackout dates.
Write to: `.taketomarket/CALENDAR.md`

### 8. STATE.md (template copy with timestamp)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/state.md`
**Special handling:** Copy template and update ONLY the `last_updated` frontmatter field:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp date --raw
```
Do NOT fill interview data into STATE.md -- it is initialized with default values.
Write to: `.taketomarket/STATE.md`

### 9. LEARNINGS.md (template copy with zeroed counters)
Read template: `${CLAUDE_PLUGIN_ROOT}/templates/reference-files/learnings.md`
**Special handling:** Copy template verbatim. Set Summary fields to:
- Total lessons: 0
- Last lesson date: none
- Top pattern: none
Do NOT fill interview data -- learnings are populated during campaign Learn phases.
Write to: `.taketomarket/LEARNINGS.md`

---

## Step 10: Generate Instruction Files

```
takeToMarket > GENERATING INSTRUCTION FILES
```

Read `${CLAUDE_PLUGIN_ROOT}/templates/claude-md.md` and write to `CLAUDE.md` in the project root.
Read `${CLAUDE_PLUGIN_ROOT}/templates/agents-md.md` and write to `AGENTS.md` in the project root.

These are static copies -- do NOT customize with interview data. The positioning-as-invariant
enforcement rules are already baked into the templates. Runtime context loading handles
dynamic positioning data via POSITIONING.md.

---

## Step 11: Post-Init Validation

```
takeToMarket > VALIDATING
```

Run health check:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs health
```

Parse the JSON result. Verify all checks have status "pass".

If any check has status "fail" or "missing":
- Report which files failed
- Attempt to regenerate only the failed files by re-reading the template and re-writing
- Re-run health check

Once all checks pass, update state:
```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs state update status initialized
```

**Warning tracking:** If any interview section accumulated 3 or more SPECIFICITY_WARNING flags
during the interview, append to `.taketomarket/STATE.md` under a `## Follow-up Needed` heading:
- Section [N] ([name]): [count] specificity warnings -- recommend re-running with [relevant /ttm-* command]

Use these commands per section:
- Section 1 (Positioning): `/ttm-positioning-check`
- Section 2 (Brand): `/ttm-brand-refresh`
- Section 3 (ICP): `/ttm-icp-refresh`
- Section 4 (Channels): `/ttm-health`
- Section 5 (Competitors): `/ttm-competitor-scan`
- Section 6 (Metrics/Calendar): `/ttm-health`

---

## Step 12: Summary

```
takeToMarket > INITIALIZED

Reference files created:
  .taketomarket/POSITIONING.md
  .taketomarket/BRAND.md
  .taketomarket/ICP.md
  .taketomarket/CHANNELS.md
  .taketomarket/STATE.md
  .taketomarket/METRICS.md
  .taketomarket/COMPETITORS.md
  .taketomarket/CALENDAR.md
  .taketomarket/LEARNINGS.md

Instruction files created:
  CLAUDE.md
  AGENTS.md

All health checks passed. Your marketing operating system is ready.

Next step: Run /ttm-new-campaign to create your first campaign.
```

</process>

<success_criteria>
- [ ] Pre-flight check completed (existing init detected or directories created)
- [ ] All 6 interview sections completed with specificity validation
- [ ] Confirmation gate passed
- [ ] 9 reference files generated in .taketomarket/ with _SUMMARY/END_SUMMARY preserved
- [ ] CLAUDE.md and AGENTS.md copied to project root
- [ ] Health check passes (all 11 checks: taketomarket_dir + campaigns_dir + 9 files)
- [ ] STATE.md status set to "initialized"
</success_criteria>

<output>
- `.taketomarket/POSITIONING.md`
- `.taketomarket/BRAND.md`
- `.taketomarket/ICP.md`
- `.taketomarket/CHANNELS.md`
- `.taketomarket/STATE.md`
- `.taketomarket/METRICS.md`
- `.taketomarket/COMPETITORS.md`
- `.taketomarket/CALENDAR.md`
- `.taketomarket/LEARNINGS.md`
- `CLAUDE.md`
- `AGENTS.md`
</output>
