<purpose>
Ship workflow for /ttm-ship. Generates a dynamic launch checklist per campaign
based on channel mix and asset types (D-09). AI auto-checks verifiable items,
presents results with checkboxes for human confirmation (D-10). Per-asset ship
status allows staggered launches (D-11). Only ship-ready assets can ship.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/references/ship-checklist-items.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

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

If SLUG is empty, error: "Usage: /ttm-ship [campaign-slug]. Provide a campaign slug." Exit.

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

**Load Tier 2 (full content)** for ship checklist generation:
- `.marketing/CHANNELS.md` (needed for UTM schema and channel-specific details)

**Load campaign-specific files** (always full-load per context-loading.md rule 4):
- `.marketing/CAMPAIGNS/${SLUG}/STATE.md`
- `.marketing/CAMPAIGNS/${SLUG}/BRIEF.md`

**Load MANIFEST.json:**
```bash
MANIFEST_PATH=".marketing/CAMPAIGNS/${SLUG}/MANIFEST.json"
```

Read `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json`. If the file does not exist, error:
"No production manifest found for campaign '${SLUG}'. Run /ttm-produce first."
Exit.

**Load VERIFICATION.md:**
Read `.marketing/CAMPAIGNS/${SLUG}/VERIFICATION.md`. If the file does not exist, error:
"No verification report found for campaign '${SLUG}'. Run /ttm-verify first."
Exit.

---

## Step 2: Validate Campaign State

```
takeToMarket > VALIDATING CAMPAIGN
```

Check campaign exists:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

If result shows `exists: false`: Tell the user the campaign does not exist and suggest
running `/ttm-new-campaign` first. Exit.

**Check review completion:**
Read `review.overall_result` from campaign state.

- If `review.overall_result` is null: "Campaign has not been reviewed. Run /ttm-review first." Exit.
- If `review.overall_result` is `needs-fix` or `mixed`:
  Read `fix.overall_result` from campaign state.
  If `fix.overall_result` is null:
  Warn: "Some assets need fixing. Run /ttm-fix first, or proceed to ship only approved assets?"
  Using AskUserQuestion (or text-mode numbered list):
  ```
  Some assets have not been fixed yet.
  1. Proceed -- ship only approved/ship-ready assets
  2. Fix first -- exit and run /ttm-fix
  ```
  If "Fix first": exit workflow.

---

## Step 3: Identify Ship-Ready Assets

```
takeToMarket > CHECKING SHIP READINESS
```

Parse MANIFEST.json. Collect hero and all derivative assets. For each asset,
read its `review_status` and `ship_status` fields. Categorize:

- **Ship-ready:** `review_status` is `"approved"` or `"ship-ready"` AND `ship_status` is NOT `"shipped"`
- **Not ready:** `review_status` is `"needs-fix"` or `"needs-human-fix"` -- display warning
- **Already shipped:** `ship_status` is `"shipped"` -- skip
- **Rejected:** `review_status` is `"rejected"` -- excluded, already final

If no assets are eligible for shipping:
"No ship-ready assets found. All assets are either awaiting fix, rejected, or already shipped."
Exit.

Display ship readiness summary:
```
takeToMarket > SHIP READINESS

Ship-ready assets: ${COUNT}
${FOR EACH SHIP-READY ASSET:}
- ${ASSET_NAME} (${ASSET_TYPE}, ${CHANNEL})
${END FOR}

${IF ANY NOT READY:}
Not ready (excluded from this ship run):
${FOR EACH NOT-READY ASSET:}
- ${ASSET_NAME}: ${STATUS} -- ${REASON}
${END FOR}

${IF ANY ALREADY SHIPPED:}
Already shipped:
${FOR EACH SHIPPED ASSET:}
- ${ASSET_NAME} (shipped at ${SHIPPED_AT})
${END FOR}
```

---

## Step 4: Generate Dynamic Checklist (D-09)

Read `${CLAUDE_PLUGIN_ROOT}/references/ship-checklist-items.md` for the checklist
item definitions.

From BRIEF.md, identify the campaign's channel mix. From the ship-ready asset list,
identify the unique asset types present (e.g., `blog-post`, `email`, `linkedin-post`,
`social-post`, `twitter-post`, `landing-page`, `video`, `youtube-video`, `paid-ad`).

Build the checklist by combining:

1. **Universal section** -- always included for all campaigns. Load items from the
   "Universal (all campaigns)" section of ship-checklist-items.md.

2. **Channel-specific sections** -- for each unique asset type in the ship-ready list:
   - `blog-post` -> load "Blog / SEO" section
   - `email` -> load "Email" section
   - `linkedin-post` -> load "LinkedIn" section
   - `social-post` or `twitter-post` -> load "Social / Twitter/X" section
   - `landing-page` -> load "Landing Page" section
   - `video` or `youtube-video` -> load "Video / YouTube" section
   - `paid-ad` -> load "Paid Ads" section
   - Any unmatched type -> load "Default" section

Only include sections that match asset types in the ship-ready list. Do NOT include
sections for asset types that are not present -- the checklist must be relevant, not
exhaustive (D-09).

Store the assembled checklist as a structured list:
```
CHECKLIST = [
  { section: "Universal", items: [
    { name: "UTM parameters valid...", tag: "AI", result: null },
    { name: "Tracking/analytics configured...", tag: "HUMAN", result: null },
    ...
  ]},
  { section: "Blog / SEO", items: [...] },
  ...
]
```

---

## Step 5: Run AI Auto-Checks (D-10)

For each `[AI]`-tagged checklist item, attempt automated verification by reading
the ship-ready asset files and campaign data.

### Universal AI Checks

**UTM parameter validity:**
Scan each ship-ready asset file for URLs containing `utm_` parameters.
- Check format: `utm_source`, `utm_medium`, `utm_campaign` must all be present in each
  tracked URL.
- Cross-reference against `.marketing/CHANNELS.md` UTM schema if available.
- Result: PASS (valid UTMs found on all trackable links), WARN (no trackable links found
  in assets -- may be expected for some asset types), FAIL (malformed UTMs -- missing
  required parameters or inconsistent naming).

**Draft marker detection:**
Scan each ship-ready asset file for strings: `TODO`, `PLACEHOLDER`, `TBD`, `DRAFT`,
`[INSERT`, `XXX`.
- Result: PASS (none found across all assets), FAIL (markers found -- list file and
  location for each).

**Verification status:**
Read VERIFICATION.md frontmatter `overall_result`.
- Result: PASS if `pass` or `accepted`, FAIL if `fail` or `warn` without acceptance.

**Review status:**
Check MANIFEST.json -- verify all ship-ready assets have `review_status` of `approved`
or `ship-ready`.
- Result: PASS (all ship-ready assets confirmed), FAIL (any asset has unexpected status).

### Channel-Specific AI Checks

For each channel-specific section in the assembled checklist, run the applicable AI
checks against the corresponding asset files:

**Blog / SEO:**
- Meta title: Check for first H1 or frontmatter `title` field. PASS if found.
- Meta description: Check for frontmatter `description` field or first paragraph under
  160 chars. PASS if present, WARN if over 160 chars.
- H1 with keyword: Check that first H1 contains primary keyword from BRIEF.md or
  positioning anchor from POSITIONING.md summary. PASS/WARN.
- Orphaned links: Scan for markdown links `[text](url)` -- flag any with empty or
  clearly broken targets. PASS/WARN.

**Email:**
- Subject line length: Read frontmatter `subject` field, check length < 60 chars.
  PASS/FAIL.
- Preview text length: Read frontmatter `preview` or `preview_text` field, check < 90
  chars. PASS/WARN.
- Unsubscribe: Scan for string "unsubscribe" (case-insensitive). PASS/FAIL.
- Physical address: Scan for a postal/mailing address pattern. PASS/WARN.
- Spam trigger words: Check subject for common spam triggers (FREE, URGENT, ACT NOW,
  LIMITED TIME, GUARANTEED). PASS/WARN.

**LinkedIn:**
- Post length: Count characters. PASS if under 3000, FAIL if over.
- Opening line: Check if first non-empty line starts with "I". WARN if yes.
- External URL in first line: Check if first line contains http(s) URL. WARN if yes.

**Social / Twitter/X:**
- Character count: Count total post characters. PASS if under 280 (Twitter/X) or
  platform-appropriate limit, FAIL if over.
- Rhetorical questions: Scan for question marks in sentences that start with "Why",
  "How", "What if", "Have you". WARN if found.
- Hashtag count: Count `#` tags. PASS if 0-3, WARN if more.

**Landing Page:**
- CTA presence: Scan for `[CTA]`, button-like markup (`<button`, `[Button]`), or
  strong action verbs (Get, Start, Join, Try, Download, Request, Schedule). PASS/FAIL.
- Form fields: Check for form-like content matching brief's conversion goal. PASS/WARN.
- UTM capture: Check for form fields or hidden inputs referencing UTM parameters.
  PASS/WARN.

**Video / YouTube:**
- Title length: Check frontmatter `title` field < 60 chars. PASS/FAIL.
- Description keyword: Check that description's first 2 lines contain primary keyword.
  PASS/WARN.
- Timestamps: If content references a video longer than 5 minutes, check for
  timestamp markers. PASS/WARN/N/A.

**Paid Ads:**
- Character limits: Check headline and description against platform limits. PASS/FAIL.
- Headline and description: Verify both are present. PASS/FAIL.
- Display URL: Check for a formatted display URL. PASS/WARN.

For each AI check, record:
```
{ item_name, result: "PASS"|"WARN"|"FAIL", detail: "what was found or why it failed" }
```

---

## Step 6: Present Checklist with Results (D-10)

Display the complete checklist organized by section. For each item:
- `[AI]` items: Show result (PASS/WARN/FAIL) with detail
- `[HUMAN]` items: Show as unchecked checkbox for user to confirm

```
takeToMarket > LAUNCH CHECKLIST: ${SLUG}

## Universal Checks
- [PASS] UTM parameters valid on all trackable links
- [PASS] All asset files finalized (no draft markers)
- [PASS] VERIFICATION.md shows pass/accepted
- [PASS] All ship-ready assets have approved review status
- [ ] Tracking/analytics configured for outcome metric -- CONFIRM? (yes/no)
- [ ] Monitoring and alerts set up -- CONFIRM? (yes/no)
- [ ] Team notified of launch timeline -- CONFIRM? (yes/no)

${IF BLOG/SEO SECTION:}
## Blog / SEO Checks
- [PASS] Meta title present
- [WARN] Meta description: 180 chars (recommend under 160)
- [ ] Schema markup deployed -- CONFIRM? (yes/no)
- [ ] Internal links added -- CONFIRM? (yes/no)
...
${END IF}

${OTHER CHANNEL SECTIONS AS APPLICABLE}
```

### Collect Human Confirmations

For each `[HUMAN]` item, use AskUserQuestion (or text-mode) to collect confirmation:

```
Confirm: [CHECKLIST_ITEM]
1. Yes -- confirmed
2. No -- not ready yet
3. N/A -- not applicable to this campaign
```

Track which items are confirmed (yes), not ready (no), or not applicable (N/A).

**IMPORTANT:** Group human confirmations by section to reduce interaction fatigue.
Present all [HUMAN] items in a section together:

```
Universal human checks:
1. Tracking/analytics configured for outcome metric?
2. Monitoring and alerts set up?
3. Team notified of launch timeline?

For each item above, type: yes / no / n/a
(Example: yes, yes, n/a)
```

---

## Step 7: Determine Ship Decision

After all items processed:

**All clear:** If all [AI] checks PASS (or WARN) and all [HUMAN] items confirmed
(yes or N/A):
```
takeToMarket > ALL CLEAR TO SHIP

All checklist items passed or confirmed. Ready to proceed with shipping.
```

**Blockers found:** If any [AI] checks FAIL or any [HUMAN] items answered "no":
```
Blockers preventing ship:
${FOR EACH BLOCKER:}
- ${ITEM_NAME}: ${REASON}
${END FOR}

Resolve these items and re-run /ttm-ship ${SLUG}
```

Ask user using AskUserQuestion (or text-mode numbered list):
```
Ship decision:
1. Ship anyway -- proceed with documented exceptions
2. Resolve first -- exit and fix blockers
```

If "Ship anyway": proceed to Step 8. Record all blockers as exceptions.
If "Resolve first": exit workflow.

---

## Step 8: Update Per-Asset Ship Status (D-11)

For each ship-ready asset being shipped:

Read MANIFEST.json. Update each shipped asset entry:
- Set `ship_status: "shipped"`
- Set `shipped_at: "[ISO_TIMESTAMP]"` (current timestamp)

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
```

Assets NOT being shipped (not ready, user deferred) retain their current status.

Write updated MANIFEST.json back to disk.

---

## Step 9: Update Campaign State

Determine ship status:
- `shipped` -- all ship-ready assets shipped (none deferred or blocked)
- `partial` -- some assets shipped, others still pending

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" ship.status "[shipped|partial]"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" ship.shipped_at "$TIMESTAMP"
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" ship.checklist_result "[all-clear|exceptions]"
```

**ship.status logic:**
- `shipped` -- all ship-ready assets shipped
- `partial` -- some assets shipped, others deferred or blocked

**ship.checklist_result logic:**
- `all-clear` -- all AI checks passed and all human items confirmed
- `exceptions` -- shipped with documented blockers/warnings

Only update campaign phase to "shipped" if at least one asset was shipped:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase shipped
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.shipped "$TIMESTAMP"
```

---

## Step 10: Display Completion

```
takeToMarket > SHIP COMPLETE

Date: ${ISO_DATE}
Assets shipped: ${SHIPPED_COUNT}/${TOTAL_SHIP_READY}

Shipped:
${FOR EACH SHIPPED ASSET:}
- ${ASSET_NAME} (shipped at ${TIMESTAMP})
${END FOR}

${IF PARTIAL:}
Deferred (not shipped yet):
${FOR EACH DEFERRED ASSET:}
- ${ASSET_NAME}: ${REASON}
${END FOR}

${IF EXCEPTIONS:}
Shipped with exceptions:
${FOR EACH EXCEPTION:}
- ${EXCEPTION_ITEM}: ${JUSTIFICATION}
${END FOR}

Checklist result: ${CHECKLIST_RESULT}

Next: Run /ttm-measure ${SLUG} when measurement window begins
      (or /ttm-ship ${SLUG} again to ship deferred assets)
```

---

## Step 11: Positioning Check Auto-Suggest (D-02)

Check if a positioning audit is recommended:
```bash
SHIPPED_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --shipped-since-last-audit --raw)
SHIPPED_COUNT=$(echo "$SHIPPED_JSON" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');console.log(JSON.parse(d).count)")
```

If SHIPPED_COUNT >= 3, display:

```
takeToMarket > POSITIONING CHECK SUGGESTED

${SHIPPED_COUNT} campaigns have shipped since your last positioning audit.
Consider running /ttm-positioning-check to verify positioning consistency
across recent assets.

This is a suggestion, not a requirement. Run it when convenient.
```

If SHIPPED_COUNT < 3, do not display anything.

</process>

<success_criteria>
- [ ] Campaign state validated (exists, has been reviewed)
- [ ] Ship-ready assets identified from MANIFEST.json review_status
- [ ] Dynamic checklist generated from campaign channel mix (D-09)
- [ ] AI auto-checks run for all [AI]-tagged items (UTM, draft markers, verification, review status)
- [ ] Channel-specific AI checks run for applicable asset types
- [ ] Human confirmation collected for all [HUMAN]-tagged items (D-10)
- [ ] Ship decision made (all clear or ship with exceptions)
- [ ] Per-asset ship_status and shipped_at updated in MANIFEST.json (D-11)
- [ ] Campaign state updated: ship.status, ship.shipped_at, ship.checklist_result
- [ ] Campaign phase advanced to "shipped" (if at least one asset shipped)
- [ ] User directed to /ttm-measure as next step
</success_criteria>

<output>
- `.marketing/CAMPAIGNS/${SLUG}/MANIFEST.json` (updated with ship_status and shipped_at per asset)
</output>
