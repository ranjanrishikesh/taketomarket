<purpose>
Learn workflow for /ttm-learn. Extracts lessons from campaign measurement data
and campaign history. Proposes reference file edits as narratives with per-edit
human approval gates (per D-07, D-08). Logs root-cause taxonomy entries to
LEARNINGS.md (per D-10, LIFE-17). Runs pattern extraction across campaigns when
3+ campaigns have lessons (LRNG-03). Updates campaign state with learn.* fields.

This workflow closes the learning loop: lessons from each campaign compound into
reference file improvements and pattern libraries that make future campaigns
better. LEARNINGS.md is already loaded as Tier 1 context in the brief workflow
(LRNG-04), so future campaigns automatically benefit from past learnings.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/learnings-extraction.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you identify a lesson that implies
a POSITIONING.md edit:
- Do NOT offer to apply the edit directly
- Instead, offer to launch /ttm-positioning-shift with the proposal
- Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md

**POSITIONING.md edits MUST be routed through /ttm-positioning-shift.** Do NOT apply
POSITIONING.md edits directly even if the user approves. Instead, display:
"This edit targets POSITIONING.md. Launch /ttm-positioning-shift to apply it?" (per D-09).

## Reference File Edit Targets

Only the following files may be edited via this workflow (per D-09):
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/POSITIONING.md` (via /ttm-positioning-shift only -- never directly)
- `.marketing/METRICS.md`
- `.marketing/COMPETITORS.md`

## Append-Only LEARNINGS.md

Lessons are appended after the `<!-- LESSONS BELOW THIS LINE -->` marker.
Existing lesson rows must never be deleted or modified. Summary counters are
updated atomically with the append.
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
takeToMarket > LOADING CAMPAIGN CONTEXT FOR LEARNING
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

If SLUG is empty, error: "Usage: /ttm-learn [campaign-slug]. Provide a campaign slug." Exit.

**Load Tier 1 summaries** from all 9 reference files (lines 1 to `<!-- END_SUMMARY -->`):
- `.marketing/POSITIONING.md`
- `.marketing/BRAND.md`
- `.marketing/ICP.md`
- `.marketing/CHANNELS.md`
- `.marketing/STATE.md` (frontmatter only)
- `.marketing/CALENDAR.md`
- `.marketing/COMPETITORS.md`
- `.marketing/METRICS.md`
- `.marketing/LEARNINGS.md`

**Load Tier 2 (full content)** for learning analysis:
- `.marketing/LEARNINGS.md` (existing lessons and patterns)
- `.marketing/METRICS.md` (metric definitions for delta interpretation)
- `.marketing/BRAND.md` (brand guidelines for edit proposals)
- `.marketing/ICP.md` (ICP data for edit proposals)
- `.marketing/CHANNELS.md` (channel data for edit proposals)
- `.marketing/COMPETITORS.md` (competitor data for edit proposals)
- `.marketing/POSITIONING.md` (read-only -- for positioning drift detection)

**Load campaign artifacts** per the scan order from learnings-extraction.md:
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md` (frontmatter for gate results, run counts)
- `.marketing/CAMPAIGNS/${SLUG}/MEASUREMENT.md` (measurement report with outcome data)
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md` (original strategy and targets)
- `.marketing/CAMPAIGNS/${SLUG}/VERIFY-REPORT-*.md` (gate details if they exist)
- `.marketing/CAMPAIGNS/${SLUG}/FIX-BRIEF-*.md` (fix details if they exist)
- `.marketing/CAMPAIGNS/${SLUG}/REVIEW-FEEDBACK-*.md` (reviewer comments if they exist)

If `.marketing/CAMPAIGNS/${SLUG}/` does not exist, error: "Campaign '${SLUG}' not found. Check the slug and try again." Exit.

If `.marketing/CAMPAIGNS/${SLUG}/MEASUREMENT.md` does not exist, error: "No measurement data found for '${SLUG}'. Run /ttm-measure first." Exit.

---

## Step 2: Validate Campaign State

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state ${SLUG} --raw
```

- Verify campaign is in `measured` or `learned` phase (re-learning is allowed)
- If not measured: display error:
  ```
  takeToMarket > ERROR
  Campaign must be measured before learning. Current phase: ${PHASE}.
  Run /ttm-measure first.
  ```
  Exit.

---

## Step 3: Extract Outcome Deltas (per LRNG-02)

Compare measurement results from MEASUREMENT.md against brief targets from BRIEF.md:

- For each metric in MEASUREMENT.md, find the corresponding target from BRIEF.md
- Calculate delta: `((actual - target) / target) * 100`
- Classify each delta:
  - **overperformed**: more than 10% above target
  - **met**: within +/-10% of target
  - **underperformed**: more than 10% below target

Display:
```
takeToMarket > OUTCOME DELTAS

| Metric | Target | Actual | Delta | Classification |
|--------|--------|--------|-------|----------------|
| [outcome metric] | [target] | [actual] | [+/-X%] | [over/met/under] |
| [output metric 1] | ... | ... | ... | ... |
```

---

## Step 4: Classify Lessons per Root-Cause Taxonomy (per LRNG-01, LIFE-17)

For each underperforming or failing element, classify using the 7-category root-cause
taxonomy from learnings-extraction.md:

| Category | Description |
|----------|-------------|
| positioning-drift | Asset deviated from POSITIONING.md -- used competitor language, wrong value prop, or off-brand messaging |
| weak-hook | Opening failed to capture attention -- generic intro, no specific pain addressed, buried lede |
| wrong-channel | Content published on ineffective channel for target ICP or content type |
| bad-timing | Published at wrong time, wrong cadence, or conflicted with external events |
| unverifiable-claim | Claim lacked proof point, source, or measurable evidence |
| broken-funnel | CTA or conversion path was broken, misaligned, or missing |
| creative-fatigue | Repeated format or angle with diminishing returns -- audience saturation |

For each overperforming element, classify as `success` with a description of what
pattern drove the win.

**Artifact scan order** (per learnings-extraction.md):
1. STATE.md gate fields for pass/fail patterns
2. VERIFY-REPORT files for specific gate failure details
3. FIX-BRIEF files for root-cause analysis already performed
4. REVIEW-FEEDBACK files for human reviewer signals
5. BRIEF.md for strategic context

Generate 1 lesson per notable delta (both successes and failures). Each lesson is
one specific, actionable sentence -- not a generic observation.

Display each lesson:
```
takeToMarket > LESSONS EXTRACTED

${N} lessons identified:

1. [${CATEGORY}] ${LESSON_TEXT}
2. [${CATEGORY}] ${LESSON_TEXT}
...
```

---

## Step 5: Propose Reference File Edits (per D-07, D-08, D-09, LIFE-16)

For each lesson that implies a systemic change to a reference file, propose an edit
using the narrative + apply approach (per D-07).

If no lessons imply systemic changes, display:
```
takeToMarket > REFERENCE FILE EDITS
No systemic reference file edits identified. All lessons logged as observations.
```

For each proposed edit:

### 5a. Present the narrative

Display the reasoning in plain language:
```
takeToMarket > PROPOSED EDIT ${N} of ${TOTAL}

Based on campaign "${SLUG}" results, [specific observation from measurement data].
[Reasoning derived from the data and campaign artifacts].
Therefore, [specific edit proposal describing the change].

File: .marketing/${TARGET_FILE}.md
Section: [section name where the edit applies]
Change: [specific addition, modification, or removal]
```

### 5b. Ask for approval (per D-08)

Each edit gets its own approval gate. No batch-apply.

**If AskUserQuestion is available (TEXT_MODE=false):**
Use AskUserQuestion with options:
- Apply -- Update ${TARGET_FILE}.md with this change
- Skip -- Keep ${TARGET_FILE}.md unchanged, log lesson only
- Modify -- Edit the proposed change before applying

**If TEXT_MODE=true:**
```
Apply this edit to .marketing/${TARGET_FILE}.md?
  1. Apply -- Update ${TARGET_FILE}.md with this change
  2. Skip -- Keep ${TARGET_FILE}.md unchanged, log lesson only
  3. Modify -- Edit the proposed change before applying
Type the number of your choice:
```

### 5c. POSITIONING.md special handling (per D-09)

If the proposed edit targets POSITIONING.md, do NOT offer direct apply. Instead:

**If AskUserQuestion is available (TEXT_MODE=false):**
Use AskUserQuestion with header "POSITIONING.md Edit Detected":
- Launch positioning shift -- Start /ttm-positioning-shift with this proposal
- Skip -- Log the lesson but do not change POSITIONING.md

**If TEXT_MODE=true:**
```
This edit targets POSITIONING.md, which is locked during campaigns.
This change requires /ttm-positioning-shift.
  1. Launch positioning shift -- Start /ttm-positioning-shift with this proposal
  2. Skip -- Log the lesson but do not change POSITIONING.md
Type the number of your choice:
```

### 5d. Apply the user's choice

- **If user selects "Apply":** Read the target file, find the specified section, apply
  the edit, write the updated file. Track as edits_applied.
- **If user selects "Modify":** Ask user for the modified version (via AskUserQuestion
  or text prompt), then apply the modified edit. Track as edits_applied.
- **If user selects "Skip":** Set Action Taken for this lesson to "none -- skipped by user."
- **If user selects "Launch positioning shift":** Note in the lesson log Action Taken:
  "Deferred to /ttm-positioning-shift." Do NOT apply the edit.

Track counts: `edits_proposed` (total proposed), `edits_applied` (Apply + Modify selections).

---

## Step 6: Append Lessons to LEARNINGS.md (per LRNG-01, LIFE-17)

1. Read `.marketing/LEARNINGS.md`
2. Find the marker line: `<!-- LESSONS BELOW THIS LINE -->`
3. Insert new lesson rows immediately after the marker, one row per lesson from Step 4:
   ```
   | ${DATE} | ${SLUG} | ${CATEGORY} | ${LESSON_TEXT} | ${ACTION_TAKEN} |
   ```
   Where:
   - `${DATE}` is today's ISO date (e.g., 2024-03-15)
   - `${SLUG}` is the campaign slug
   - `${CATEGORY}` is the root-cause taxonomy category (or `success`)
   - `${LESSON_TEXT}` is the one-sentence lesson
   - `${ACTION_TAKEN}` is what was done (e.g., "Updated BRAND.md hook guidelines",
     "none -- skipped by user", "Deferred to /ttm-positioning-shift")

4. Update the Summary section counters at the top of the file:
   - **Total lessons:** increment by number of new lessons
   - **Last lesson date:** set to today's date
   - **Top pattern:** recalculate the most frequent category across all lesson rows

5. Write updated LEARNINGS.md

**Important:** Do not delete or modify any existing lesson rows. Append only.

---

## Step 7: Pattern Extraction (per LRNG-03)

Count the number of distinct campaign slugs in the LEARNINGS.md Lessons Log table
(the Campaign column).

**If fewer than 3 campaigns have entries:**
```
takeToMarket > PATTERN EXTRACTION

Pattern extraction requires 3+ campaigns with lessons. Current: ${N}.
Skipping pattern extraction -- will run automatically after ${3 - N} more campaigns.
```

**If 3 or more campaigns have entries:**

Scan all lesson rows in the Lessons Log for frequency patterns across campaigns:

1. **Winning Hooks:** Identify hooks or openings that appeared in `success` lessons
   across 2+ campaigns. Extract the common pattern or approach.

2. **Winning Angles:** Identify positioning angles or themes that showed consistent
   overperformance across campaigns.

3. **Winning Formats:** Identify content formats that produced the best outcome
   metric results across campaigns.

4. **Anti-Patterns:** Identify approaches that appeared in failure lessons (any
   root-cause category except `success`) across 2+ campaigns.

Update the Pattern Extraction sections in LEARNINGS.md:
- Replace the `[Populated after 3+ campaigns...]` placeholder text with actual patterns
- Each pattern entry should include: the pattern description, which campaigns exhibited
  it, and the measured impact

Write updated LEARNINGS.md.

---

## Step 8: Update Campaign State

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} phase.learned true
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} learn.run_count ${RUN_COUNT}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} learn.last_run ${ISO_DATE}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} learn.lessons_extracted ${LESSON_COUNT}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} learn.edits_proposed ${PROPOSED_COUNT}
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update ${SLUG} learn.edits_applied ${APPLIED_COUNT}
```

Where:
- `${RUN_COUNT}` is the previous learn.run_count + 1 (or 1 if first run)
- `${ISO_DATE}` is today's ISO date
- `${LESSON_COUNT}` is the number of lessons extracted in Step 4
- `${PROPOSED_COUNT}` is the number of reference file edits proposed in Step 5
- `${APPLIED_COUNT}` is the number of edits the user approved (Apply + Modify)

---

## Step 9: Display Summary and Next Steps

```
takeToMarket > LEARN PHASE COMPLETE

Campaign: ${SLUG}
Lessons extracted: ${LESSON_COUNT} (${SUCCESS_COUNT} successes, ${FAILURE_COUNT} failures)
Reference edits proposed: ${PROPOSED_COUNT}
Reference edits applied: ${APPLIED_COUNT}
Pattern extraction: ${PATTERN_STATUS}

Lessons appended to: .marketing/LEARNINGS.md

Next: Run /ttm-archive ${SLUG} to finalize the campaign, or start a new campaign.
Future campaigns will load these lessons via /ttm-brief to prevent repeating mistakes.
```

Where `${PATTERN_STATUS}` is one of:
- "Completed -- ${PATTERN_COUNT} patterns identified" (if 3+ campaigns)
- "Skipped -- ${N} of 3 campaigns needed" (if fewer than 3)

</process>

<checklist>
- [ ] Campaign is in measured or learned phase
- [ ] Campaign artifacts scanned in correct order (STATE > VERIFY-REPORT > FIX-BRIEF > REVIEW-FEEDBACK > BRIEF)
- [ ] Outcome deltas calculated for all metrics
- [ ] Each lesson classified with root-cause taxonomy category
- [ ] Reference file edits proposed as narratives with per-edit human approval
- [ ] POSITIONING.md edits routed through /ttm-positioning-shift (not direct edit)
- [ ] Lessons appended to LEARNINGS.md after marker line
- [ ] Summary counters updated in LEARNINGS.md
- [ ] Pattern extraction runs only if 3+ campaign slugs in lessons log
- [ ] Campaign state updated with learn.* fields
</checklist>
