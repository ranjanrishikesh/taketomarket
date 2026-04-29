<purpose>
State dashboard workflow for /ttm-state. Displays all campaigns (active and
archived) in a summary table. No-argument mode shows the full campaign dashboard;
slug argument shows single campaign detail view. Reads from campaign.cjs list
and enriches with per-campaign STATE.md data.
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

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT
```

Extract SLUG from $ARGUMENTS (strip `--text` flag if present):
```bash
SLUG=$(echo "$ARGUMENTS" | sed 's/--text//g' | xargs)
```

SLUG is optional for this command. If empty, display full dashboard (Step 3).
If present, display single campaign detail (Step 4).

---

## Step 2: Gather Campaign Data

```
takeToMarket > GATHERING CAMPAIGN DATA
```

**Get all campaigns:**
```bash
CAMPAIGNS_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign list --raw)
```

Parse JSON output to get all campaigns with their frontmatter fields (slug, phase,
name, last_updated, etc.).

**If SLUG is provided**, also get detailed state:
```bash
DETAIL_JSON=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw)
```

If `exists: false` in the detail response:
"Campaign '${SLUG}' not found. Run `/ttm-state` without arguments to see all campaigns."
Exit.

**Check for archived campaigns:**
```bash
ls .marketing/CAMPAIGNS/ARCHIVE/ 2>/dev/null
```

For each archived directory found, read its STATE.md frontmatter to get archive date
and outcome information.

**Read global state for portfolio context:**
Read `.marketing/STATE.md` body content (below frontmatter) for portfolio-level
decisions, blockers, and experiments.

---

## Step 3: Display Dashboard (Full Mode -- No SLUG)

```
takeToMarket > CAMPAIGN DASHBOARD
```

Display a summary table with ALL campaigns organized by status.

### Output Format

```
## Campaign Dashboard

### Active Campaigns

| Campaign | Phase | Last Updated | Status |
|----------|-------|--------------|--------|
| <slug>   | <phase> | <relative time> | <brief status> |

```

For each active campaign, also display a detail section:

```
### <slug> Detail
**Phase:** <phase>
**Created:** <date> | **Last Updated:** <date>
**Gate Results:** <summary of pass/fail counts from review.overall_result>
**Fix Attempts:** <fix.run_count or 0>
**Decisions in flight:** <from global .marketing/STATE.md body if any>
**Blockers:** <from global .marketing/STATE.md body if any>
**Experiments:** <from global .marketing/STATE.md body if any>
```

If no active campaigns exist, display:
"No active campaigns. Run `/ttm-new-campaign <slug>` to start one."

### Archived Campaigns

If archived campaigns exist, display them in a collapsed section:

```
### Archived Campaigns

| Campaign | Archived Date | Outcome |
|----------|--------------|---------|
| <slug>   | <date>       | <shipped/cancelled> |
```

If no archived campaigns exist, omit this section entirely.

### Portfolio Summary

At the end, display a brief portfolio summary:
```
---
**Portfolio:** <N> active, <M> archived
**Next recommended action:** Run `/ttm-next` for prioritized guidance
```

---

## Step 4: Display Single Campaign (SLUG Provided)

```
takeToMarket > CAMPAIGN DETAIL: ${SLUG}
```

Show full detail for the single campaign. Read the full campaign STATE.md file
(not just frontmatter -- per Pitfall 5) to get all body content.

### Output Format

```
## Campaign: ${SLUG}

### Overview
**Name:** <name>
**Phase:** <phase>
**Created:** <created date>
**Last Updated:** <last_updated date>

### Lifecycle Progress
<Visual phase indicator showing completed and current phases>
created -> researched -> briefed -> produced -> verified -> reviewed -> shipped

### State Details
**Review Result:** <review.overall_result or "not yet reviewed">
**Fix Attempts:** <fix.run_count or 0>
**Fix Result:** <fix.overall_result or "N/A">
**Ship Status:** <ship.status or "not shipped">

### Gate Results
<Table of all gate/check results if available>

| Gate | Result | Date |
|------|--------|------|
| verification | <pass/fail> | <date> |
| review | <approved/revise> | <date> |

### Campaign Notes
<Full body content from the campaign's STATE.md file>

### Suggested Next Action
Based on current phase, suggest the next /ttm-* command:
- "Run `/ttm-<next-command> ${SLUG}` to continue."
```

If the campaign has no body content in STATE.md, display:
"No additional notes recorded for this campaign."

</process>

<success_criteria>
- [ ] Campaign data retrieved via CLI (`campaign list --raw`)
- [ ] Dashboard displays active campaigns with detail sections
- [ ] Archived campaigns shown as collapsed rows
- [ ] Single campaign mode shows full detail when slug provided
- [ ] Global .marketing/STATE.md body read for portfolio-level context
- [ ] No files modified (read-only command)
</success_criteria>

<output>
No files modified (read-only command).
</output>
