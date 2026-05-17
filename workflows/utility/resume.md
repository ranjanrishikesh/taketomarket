<purpose>
Session recovery workflow for /ttm-resume. Loads campaign state, shows context
summary (last completed phase, what was done, pending work, blockers), and suggests
the exact next /ttm-* command. Detects interrupted verify/fix loops so the user
continues from where they left off rather than restarting.

State is loaded directly from CAMPAIGNS/<slug>/STATE.md (no separate handoff file).
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- In verify: use the Escalate option to launch /ttm-positioning-shift
- In other workflows: flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.

## Read-Only Command

This workflow does NOT modify any files. It is purely informational -- it reads
campaign state and displays a recovery summary. The user runs the suggested next
command themselves.
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

If SLUG is empty, error:
"Usage: /ttm-resume [campaign-slug]. Provide a campaign slug."
Exit.

---

## Step 2: Load Campaign State

```
takeToMarket > LOADING CAMPAIGN STATE
```

Run:
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign state "${SLUG}" --raw
```

If `exists: false`: tell user campaign not found. Suggest `/ttm-new-campaign` to
create a new campaign. Exit.

Parse the full JSON output. Extract:
- `phase` (current campaign phase)
- `name` (campaign display name)
- `last_updated` (ISO timestamp of last state change)
- All `phase.*` timestamps (phase.created, phase.researched, phase.briefed,
  phase.produced, phase.verified, phase.reviewed, phase.fixed, phase.shipped,
  phase.measured, phase.learned)
- `fix.run_count` (number of fix loop iterations)
- `review.overall_result` (approved, revise, or null)
- `verify.overall_result` (pass, fail, or null)
- `verify.run_count` (number of verification runs)

Also read the FULL STATE.md file (not just CLI output) to get body content:
```bash
Read .taketomarket/CAMPAIGNS/${SLUG}/STATE.md
```

The body contains "Phase:" and "Next step:" lines plus any additional notes,
blockers, or context left by previous workflow runs.

**Fallback:** If the Read tool returns empty or fails, log "No additional notes
recorded in STATE.md body" and continue with CLI-parsed state only. Do NOT fail
the resume workflow due to a missing or empty body section.

---

## Step 3: Build Recovery Context

```
takeToMarket > RECOVERY CONTEXT
```

Determine last completed phase by finding the latest non-null `phase.*` timestamp.
Use this ordering (earlier phases first):

1. created
2. researched
3. briefed
4. produced
5. verified
6. reviewed
7. fixed
8. shipped
9. measured
10. learned

For each completed phase, note the timestamp.

Calculate time since last activity from `last_updated`:
- If less than 1 hour: "X minutes ago"
- If less than 24 hours: "X hours ago"
- If less than 7 days: "X days ago"
- Otherwise: "X weeks ago" or exact date

---

## Step 4: Detect Interrupted Loops

Check if campaign is mid-fix-loop:
- `fix.run_count` exists AND is > 0
- AND `review.overall_result` equals `'revise'`

If yes: flag as interrupted fix loop. The user should run `/ttm-fix ${SLUG}` to
continue the loop (NOT restart from scratch). Note the current attempt number.

Check if campaign is mid-verify:
- `verify.run_count` exists AND is > 0
- AND `verify.overall_result` is NOT `'pass'`

If yes: flag as interrupted verification. Suggest re-running `/ttm-verify ${SLUG}`
to continue verification from where it left off.

---

## Step 5: Determine Next Command

Use the phase-to-command mapping to suggest the exact next command:

| Current Phase | Next Command | Notes |
|---------------|-------------|-------|
| `created` | `/ttm-research ${SLUG}` | Campaign exists but no research done |
| `researched` | `/ttm-brief ${SLUG}` | Research complete, needs brief |
| `briefed` | `/ttm-produce ${SLUG}` | Brief ready, needs production |
| `produced` | `/ttm-verify ${SLUG}` | Assets produced, needs verification |
| `verified` | `/ttm-review ${SLUG}` | Verification passed, needs review |
| `reviewed` | See logic below | Depends on review result |
| `fixed` | `/ttm-review ${SLUG}` | Fix applied, needs re-review |
| `shipped` | `/ttm-measure ${SLUG}` | Shipped, awaiting measurement window |
| `measured` | `/ttm-learn ${SLUG}` | Measured, needs learning extraction |
| `learned` | `/ttm-archive ${SLUG}` | Learnings extracted, ready to archive |
| `archived` | None | "Campaign already archived. No further action needed." |
| `cancelled` | None | "Campaign cancelled. No further action. Create a new campaign with `/ttm-new-campaign`." |

**Reviewed phase logic:**
- If `review.overall_result` equals `'revise'`: suggest `/ttm-fix ${SLUG}`
- If `review.overall_result` equals `'approved'`: suggest `/ttm-ship ${SLUG}`
- If `review.overall_result` is null or unclear: suggest `/ttm-review ${SLUG}`

**Override with interrupted loop detection (Step 4):**
- If mid-fix-loop detected: override suggestion to `/ttm-fix ${SLUG}` regardless
  of phase-to-command mapping
- If mid-verify detected: override suggestion to `/ttm-verify ${SLUG}`

---

## Step 6: Display Recovery Summary

```
takeToMarket > RESUME SUMMARY
```

Display formatted summary:

```markdown
## Campaign Resume: ${SLUG}

**Campaign:** ${name}
**Current Phase:** ${phase}
**Last Activity:** ${relative_time} (${last_updated})

### Completed Phases
| Phase | Completed At |
|-------|-------------|
| Created | ${phase.created} |
| Researched | ${phase.researched} |
| ... | ... |

### Pending Work
${next_step_description -- derived from the phase and any body content in STATE.md}

### Suggested Next Command
> `/ttm-fix spring-launch`
> Reason: Fix loop in progress (attempt 2 of 3). Review flagged positioning drift.
```

If an interrupted loop was detected in Step 4, add a prominent note:

```markdown
### Interrupted Loop Detected

**Type:** Fix loop (attempt ${fix.run_count} of 3)
**Reason:** Review result is 'revise' -- fixes needed before re-review.

Running `/ttm-fix ${SLUG}` will continue from attempt ${fix.run_count}, not restart.
Do NOT run `/ttm-produce` -- existing assets need fixing, not reproduction.
```

If the campaign has blockers noted in STATE.md body, display them:

```markdown
### Known Blockers
${blockers from STATE.md body if any}
```

---

## Additional Context Display

If `time_since_last_activity` is greater than 7 days, add a context refresh suggestion:

```markdown
### Context Refresh Recommended

It has been ${days} days since last activity. Consider:
- Re-reading POSITIONING.md for any updates
- Checking CALENDAR.md for scheduling conflicts
- Running /ttm-health to verify campaign consistency
```

</process>

<success_criteria>
- [ ] Campaign state loaded from STATE.md (not a separate handoff file)
- [ ] Recovery context shows last completed phase and full timeline
- [ ] Interrupted fix loops detected (fix.run_count > 0 AND review.overall_result = revise)
- [ ] Interrupted verify loops detected (verify.run_count > 0 AND verify.overall_result != pass)
- [ ] Exact next /ttm-* command suggested based on phase-to-command mapping
- [ ] Loop detection overrides standard phase mapping when applicable
- [ ] No files modified (read-only command)
</success_criteria>

<output>
No files modified. This is a read-only command that displays recovery context
and suggests the next command for the user to run.
</output>
