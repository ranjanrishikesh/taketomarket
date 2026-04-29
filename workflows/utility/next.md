<purpose>
Next-command routing workflow for /ttm-next. Looks across ALL active campaigns,
prioritizes which needs attention most, and suggests the specific /ttm-* command
to run. Outputs a prioritized list with a top recommendation and up to 3
alternatives. Uses unfiltered campaign list (not --active) to include campaigns
in created and researched phases.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.marketing/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.

## Read-Only Command

This workflow does NOT modify any files. It only reads and displays information.
</constraints>

<process>

## Step 1: Load All Campaigns

```
takeToMarket > SCANNING CAMPAIGNS
```

Get the unfiltered campaign list:
```bash
CAMPAIGNS_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --raw)
```

**IMPORTANT:** Do NOT use `--active` flag. The `--active` flag excludes campaigns in
`created` and `researched` phases (per Pitfall 2). Use the unfiltered list and apply
filtering in this workflow instead.

Parse JSON output. Filter out campaigns with phase `archived` or `cancelled`.
Keep all other campaigns regardless of phase.

If no campaigns remain after filtering:
```
takeToMarket > NO ACTIVE CAMPAIGNS

No active campaigns found. Run `/ttm-new-campaign <slug>` to start one.
```
Exit.

---

## Step 2: Determine Next Command Per Campaign

```
takeToMarket > ANALYZING PRIORITIES
```

For each non-archived, non-cancelled campaign, determine the next command using
the phase-to-command mapping:

| Current Phase | Next Command | Notes |
|---------------|--------------|-------|
| `created` | `/ttm-research <slug>` | New campaign needs research |
| `researched` | `/ttm-brief <slug>` | Research done, needs brief |
| `briefed` | `/ttm-produce <slug>` | Brief ready, produce content |
| `produced` | `/ttm-verify <slug>` | Content ready, verify quality |
| `verified` | `/ttm-review <slug>` | Verified, needs human review |
| `reviewed` | See review result logic below | |
| `fixed` | `/ttm-review <slug>` | Re-review after fix |
| `shipped` | `/ttm-measure <slug>` | Awaiting measurement (Phase 9) |
| `measured` | `/ttm-learn <slug>` | Extract learnings (Phase 9) |
| `learned` | `/ttm-archive <slug>` | Ready to archive |

**Review result logic** (for campaigns in `reviewed` phase):
- Read `review.overall_result` from the campaign state
- If `review.overall_result` is `'revise'` or `'needs-fix'`: `/ttm-fix <slug>`
- If `review.overall_result` is `'approved'` or `'ship-ready'`: `/ttm-ship <slug>`
- If `review.overall_result` is null/unknown: `/ttm-review <slug>` (re-review)

**Fix loop detection** (per D-05):
- If `fix.run_count` > 0 AND `review.overall_result` is `'revise'`:
  Suggest `/ttm-fix <slug>` with note about continuing the fix loop
  Include fix attempt count in the reason (e.g., "attempt 2 of 3")

For each campaign, also get detailed state if needed for review/fix decisions:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

---

## Step 3: Apply Priority Algorithm

Sort campaigns by priority using this algorithm:

**Priority 1 (Highest):** Campaigns with `review.overall_result = 'approved'`
- These are pending human action to ship -- closest to delivering value.

**Priority 2:** Campaigns with fix loops in progress
- `fix.run_count > 0` AND `review.overall_result = 'revise'`
- Active work in progress that should be completed before starting new work.

**Priority 3:** Campaigns at earlier lifecycle phases
- Use phase order index for sorting:
  - created = 0
  - researched = 1
  - briefed = 2
  - produced = 3
  - verified = 4
  - reviewed = 5
  - fixed = 6
  - shipped = 7
  - measured = 8
  - learned = 9
- Lower index = earlier phase = higher priority (move campaigns forward)

**Priority 4:** Most recently active
- Sort by `last_updated` timestamp (most recent first)

**Tie-break:** Campaign creation date (oldest campaign first -- finish what you
started before starting new work).

---

## Step 4: Display Recommendations

```
takeToMarket > NEXT ACTIONS
```

Display the top recommendation prominently, then show up to 3 alternatives
in a table.

### Output Format

```
## Recommended Next Action

**Run:** `/ttm-<command> <slug>`
**Why:** <Concise reason based on priority algorithm>

---

### Other Active Campaigns

| Priority | Campaign | Phase | Suggested Command | Reason |
|----------|----------|-------|-------------------|--------|
| 2 | <slug> | <phase> | /ttm-<cmd> <slug> | <brief reason> |
| 3 | <slug> | <phase> | /ttm-<cmd> <slug> | <brief reason> |
| 4 | <slug> | <phase> | /ttm-<cmd> <slug> | <brief reason> |
```

**Reason examples by priority:**
- Priority 1: "Approved and ready to ship"
- Priority 2: "Fix loop in progress (attempt 2 of 3). Review found positioning drift."
- Priority 3: "Ready for content production" / "New campaign, needs research"
- Priority 4: "Recently active, awaiting measurement"

If only one campaign exists, show only the primary recommendation without the
alternatives table.

**Commands not yet implemented:**
If the suggested next command is `/ttm-measure` or `/ttm-learn` (Phase 9),
append a note: "(Note: this command is not yet available -- coming in Phase 9)"

</process>

<success_criteria>
- [ ] All campaigns loaded via CLI (`campaign list --raw` without --active flag)
- [ ] Phase-to-command mapping applied correctly for each campaign
- [ ] Fix loop detection working (fix.run_count + review.overall_result check)
- [ ] Priority algorithm applied (approved > fix-loop > earlier-phase > recent)
- [ ] Primary recommendation displayed with reasoning
- [ ] Up to 3 alternatives shown in table format
- [ ] No files modified (read-only command)
</success_criteria>

<output>
No files modified (read-only command).
</output>
