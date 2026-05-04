---
phase: 03-campaign-creation-and-briefing
reviewed: 2026-04-24T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - bin/lib/campaign.cjs
  - bin/ttm-tools.cjs
  - workflows/setup/new-campaign.md
  - workflows/lifecycle/research.md
  - workflows/lifecycle/brief.md
  - workflows/lifecycle/brief-positioning-check.md
  - skills/ttm-new-campaign/SKILL.md
  - skills/ttm-research/SKILL.md
  - skills/ttm-brief/SKILL.md
  - templates/campaign-state.md
  - templates/campaign-research.md
findings:
  critical: 2
  warning: 6
  info: 4
  total: 12
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-24
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

This phase introduces the core campaign lifecycle: scaffolding (`/ttm-new-campaign`), market research (`/ttm-research`), and brief generation (`/ttm-brief`). The binary code in `bin/lib/campaign.cjs` is generally well-structured with appropriate path-traversal defenses. The workflow Markdown files are detailed and well-sequenced.

Two critical issues were found: a slug-stripping bug in `campaign.cjs` that silently corrupts slugs containing hyphens in a specific edge case, and an unquoted variable in the `new-campaign.md` workflow that enables shell injection. Six warnings cover missing field validation, an unchecked command substitution, a race condition window, a state inconsistency between the template and the live init, and two workflow gaps. Four informational items round out the review.

---

## Critical Issues

### CR-01: Shell Injection via Unquoted `CAMPAIGN_NAME` in Workflow

**File:** `workflows/setup/new-campaign.md:73`

**Issue:** The `campaign init` command is constructed with `${CAMPAIGN_NAME}` unquoted in the shell snippet:

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign init ${CAMPAIGN_SLUG} "${CAMPAIGN_NAME}"
```

`CAMPAIGN_SLUG` is not quoted. If a user provides a slug that contains spaces (before the slug command strips them) or if the slug command itself outputs unexpected characters, the argument list to Node is split incorrectly. More critically, `${CLAUDE_PLUGIN_ROOT}` is also unquoted. If the plugin root path contains spaces (e.g., `My Documents/...`) the node invocation silently breaks or, in a shell that performs glob expansion, can be manipulated. All variable interpolations inside `bash` code blocks in workflow files should be wrapped in double quotes.

**Fix:**
```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign init "${CAMPAIGN_SLUG}" "${CAMPAIGN_NAME}"
```

Apply the same quoting discipline to every `node ${CLAUDE_PLUGIN_ROOT}/...` invocation in all three workflow files (research.md lines 51, 60, 224–225; brief.md lines 85, 289–292).

---

### CR-02: Slug Sanitization Strips All Hyphens When Input Is Already a Slug

**File:** `bin/lib/campaign.cjs:33` and `bin/ttm-tools.cjs:69`

**Issue:** The re-sanitization in `resolveCampaignStatePath` and `cmdCampaignInit` is:

```js
const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
```

Hyphens ARE preserved by this regex (the character class includes `-`), so the regex itself is correct. However, `ttm-tools.cjs` line 69 joins the name argument with spaces:

```js
if (subCmd === 'init') cmdCampaignInit(slug, campaignArgs.slice(2).join(' '), raw);
```

The `name` parameter receives the multi-word value correctly. But `slug` receives `campaignArgs[1]` which is the raw second positional argument — whatever the shell passes. If the workflow passes `campaign-name-with-hyphens` as the slug and the shell splits it due to missing quotes (see CR-01), the slug seen by `cmdCampaignInit` is only the first token. The sanitization then operates on a truncated slug, creating a STATE.md in the wrong directory with no error. This is a silent data corruption: the user thinks their campaign is `my-q2-campaign` but the directory created is `my`.

**Fix:** Harden the CLI entry point to validate that the slug argument contains no whitespace before processing:

```js
case 'campaign': {
  // ...
  const slug = campaignArgs[1];
  if (slug && /\s/.test(slug)) {
    error('campaign slug must not contain whitespace -- use hyphens');
  }
  // ...
}
```

Also apply double-quoting in the workflow (see CR-01) to prevent the shell from splitting the slug in the first place.

---

## Warnings

### WR-01: `cmdCampaignUpdate` Allows Arbitrary Field Names — No Allowlist

**File:** `bin/lib/campaign.cjs:170–188`

**Issue:** `cmdCampaignUpdate` accepts any `field` string and writes it directly into the frontmatter:

```js
frontmatter[field] = value;
```

There is no validation that `field` is one of the known STATE.md keys (`phase`, `phase.researched`, `gate.outcome_metric`, etc.). A caller can inject any key — including keys with YAML-special characters — into the state file. While `serializeFrontmatter` does quote values containing `:`, it does not quote keys. A field name containing `:` or `\n` would produce invalid YAML-like output that `parseFrontmatter` cannot round-trip correctly.

**Fix:** Add an allowlist check:

```js
const ALLOWED_FIELDS = new Set([
  'phase', 'name', 'last_updated',
  'phase.created', 'phase.researched', 'phase.briefed', 'phase.produced',
  'phase.verified', 'phase.reviewed', 'phase.fixed', 'phase.shipped',
  'phase.measured', 'phase.learned',
  'gate.positioning_check', 'gate.outcome_metric',
  'current_campaign', // used by state.cjs
]);

if (!ALLOWED_FIELDS.has(field)) {
  error(`Unknown state field: ${field}. Allowed: ${[...ALLOWED_FIELDS].join(', ')}`);
}
```

---

### WR-02: `cmdCampaignState` Error Path Leaks the Unsanitized User-Provided `slug`

**File:** `bin/lib/campaign.cjs:150–153`

**Issue:** When the campaign is not found, the error message includes the raw `slug` parameter passed to the function, not the sanitized `safe` version used for path resolution:

```js
output(
  { exists: false, error: `Campaign STATE.md not found for slug: ${slug}` },
  raw,
  'not found'
);
```

The `slug` argument is the caller's original string (possibly with uppercase letters, special characters, etc.) while the actual filesystem lookup was done against `safe`. This produces a confusing and misleading error: the user sees their original input but the disk lookup used a different string. If the user relies on the error message to diagnose why a campaign isn't found, they're debugging the wrong slug value.

**Fix:**

```js
const safe = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
// ... resolve and look up using safe ...
output(
  { exists: false, error: `Campaign STATE.md not found for slug: ${safe}` },
  raw,
  'not found'
);
```

Note: `resolveCampaignStatePath` computes `safe` internally but does not return it. Either return both values or recompute `safe` before constructing the error message in `cmdCampaignState`.

---

### WR-03: Race Condition Window Between Existence Check and Directory Creation

**File:** `workflows/setup/new-campaign.md:54–67`

**Issue:** Step 3 checks whether the campaign directory exists with `ls`, then Step 4 runs `campaign init`. Between these two steps another process (or a second invocation of the same command) could create the directory. `cmdCampaignInit` does not check for an existing STATE.md before writing it — it always overwrites. The workflow's `if "exists" → warn the user` guard is not enforced at the binary level.

**Fix:** Add an existence guard in `cmdCampaignInit`:

```js
if (fs.existsSync(statePath)) {
  // Return structured result instead of silently overwriting
  error(`Campaign already exists: ${safe}. Use --force to overwrite.`);
}
```

Or add a `--force` flag that bypasses the guard. This converts a TOCTOU window into an explicit, detectable operation.

---

### WR-04: `research.md` State Update Uses Unvalidated Shell Subshell for Timestamp

**File:** `workflows/lifecycle/research.md:225`

**Issue:** The state update command uses command substitution inline:

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs campaign update ${SLUG} phase.researched $(node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw)
```

If the `timestamp` subcommand fails (exits non-zero or returns an empty string), the outer command receives an empty fourth argument, causing `cmdCampaignUpdate` to call `error('value required for campaign update')` and exit with code 1. The workflow has no error handling around this step. If a shell `set -e` equivalent is active the entire session could abort; if not, the phase timestamp is silently not written while the `phase` field update on the preceding line succeeded — leaving state inconsistent (phase = "researched" but phase.researched = null).

**Fix:** Either use the `ttm-tools.cjs timestamp` call as a separate step with explicit error checking, or use `--raw` output combined with a shell variable and check:

```bash
TIMESTAMP=$(node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" timestamp --raw)
if [ -z "$TIMESTAMP" ]; then
  echo "Error: could not get timestamp"; exit 1
fi
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" campaign update "${SLUG}" phase.researched "$TIMESTAMP"
```

The same pattern is used in `brief.md` line 289 and should receive the same fix.

---

### WR-05: `brief.md` Phase Check Misses the "researched" Phase Correctly but Silently Advances

**File:** `workflows/lifecycle/brief.md:92–100`

**Issue:** Step 2 warns only when `phase === "created"`, treating any other phase (including `"briefed"`, `"produced"`, etc.) as acceptable to proceed without warning. If a campaign is already in phase `"produced"` and the user accidentally re-runs `/ttm-brief`, the workflow warns only for `"created"` but not for `"produced"` — it silently overwrites a BRIEF.md that may already have production assets linked to it.

The research.md workflow (Step 3) handles this more correctly: it warns if phase is NOT `"created"`.

**Fix:** Align the brief workflow's phase check with the research workflow's pattern. Warn whenever the phase is not `"researched"` (the expected pre-condition), not just when it is `"created"`:

```
If phase is NOT "researched":
  Warn: "Campaign is in phase `${PHASE}`. Expected 'researched' before briefing.
         Running /ttm-brief now will overwrite the existing BRIEF.md. Proceed?"
  Wait for user confirmation.
```

---

### WR-06: `campaign-state.md` Template Has Static Body Text That Won't Match Generated STATE.md

**File:** `templates/campaign-state.md:22–24` vs `bin/lib/campaign.cjs:93–97`

**Issue:** The `campaign-state.md` template ends with:

```
Phase: created
Next step: Run `/ttm-research [SLUG]` to gather market intelligence.
```

But `cmdCampaignInit` generates the STATE.md body inline (not from the template) and the body it writes uses `${safe}` for the slug:

```js
`Next step: Run \`/ttm-research ${safe}\` to gather market intelligence.`,
```

The template is not used to generate STATE.md at all — it is documentation of the expected shape, but `cmdCampaignInit` generates state content from a hardcoded array. Any future change to the template will not affect what `cmdCampaignInit` produces. This is a maintainability trap: a developer editing `templates/campaign-state.md` will believe they're changing what gets created, but they're not.

**Fix:** Either (a) make `cmdCampaignInit` read and interpolate `campaign-state.md` just as it does `campaign-research.md` and `campaign-brief.md`, or (b) add a clear comment to `campaign-state.md` noting it is a documentation artifact only and that the authoritative source is `bin/lib/campaign.cjs`.

---

## Info

### IN-01: `ttm-tools.cjs` Has No `--help` or Usage Output for Unknown Subcommands of `campaign`

**File:** `bin/ttm-tools.cjs:64–74`

**Issue:** When an unknown `campaign` subcommand is passed (e.g., `campaign delete`), the error message is:

```
Error: campaign subcommand required: init, state, update
```

This is adequate but the error message for the top-level command (`Unknown command: ...`) lists all top-level commands, while the campaign error lists only subcommands. No usage hint is printed at the start of the help text to tell the caller what arguments each subcommand expects.

**Fix:** Minor improvement — add argument hints to the campaign error message:

```js
error('campaign subcommand required: init <slug> <name>, state <slug>, update <slug> <field> <value>');
```

---

### IN-02: `research.md` Loads `campaign-research.md` Template in `<required_reading>` But Also Re-reads It in Step 6

**File:** `workflows/lifecycle/research.md:10` and `workflows/lifecycle/research.md:162–165`

**Issue:** The template is listed in `<required_reading>` (loaded at workflow start) and then explicitly re-read in Step 6:

```
Read the template:
${CLAUDE_PLUGIN_ROOT}/templates/campaign-research.md
```

This is redundant and wastes context budget. The template loaded by `<required_reading>` should already be in context at Step 6.

**Fix:** Remove the explicit re-read in Step 6. Replace with: "Use the campaign-research.md template already loaded in `<required_reading>`."

---

### IN-03: `brief-positioning-check.md` Has No FAIL-Only Gate Path — Check 4 Can FAIL But Gate Result Is Still "warn"

**File:** `workflows/lifecycle/brief-positioning-check.md:70–72`

**Issue:** Check 4 (Must-Not-Say Terms) has only PASS and FAIL outcomes — no WARN. Yet the gate result logic collapses WARN and FAIL both into `gate result = "warn"`. A FAIL on must-not-say terms is semantically more serious than a WARN on positioning anchor alignment, but both produce the same gate result and the same non-blocking behavior. This means a brief that uses a explicitly-prohibited term produces the exact same outcome as one with a slightly misaligned hook.

This is a design decision, not necessarily a bug, but the risk is that must-not-say violations are not visually distinguished from softer alignment warnings in the drift comment block.

**Fix (optional):** Consider adding a `FAIL` result state to the gate logic that produces a visually distinct warning:

```
!! POSITIONING VIOLATION !! (must-not-say term detected)
```

vs.

```
!! POSITIONING DRIFT WARNING !! (alignment concern)
```

Or document explicitly in `brief-positioning-check.md` that FAIL and WARN are intentionally treated identically per D-05.

---

### IN-04: `skills/ttm-new-campaign/SKILL.md` Missing `WebSearch` Tool — Research Workflow Probes for It

**File:** `skills/ttm-research/SKILL.md:8` and `workflows/lifecycle/research.md:101–104`

**Issue:** `skills/ttm-research/SKILL.md` declares `allowed-tools: Read Write Bash Glob Grep` but the research workflow (Step 5) explicitly tries to use `WebSearch` and `WebFetch`:

```
Attempt a WebSearch call to detect tool availability.
```

If `WebSearch` is not in `allowed-tools`, the runtime will either silently block the tool or surface an error depending on runtime behavior. The workflow is designed to fall back gracefully ("SEARCH_MODE=manual"), but the tool detection probe itself may fail or throw before the fallback logic runs.

**Fix:** Add `WebSearch WebFetch` to `allowed-tools` in `skills/ttm-research/SKILL.md` so the runtime makes them available for the probe:

```yaml
allowed-tools: Read Write Bash Glob Grep WebSearch WebFetch
```

The workflow's fallback to manual mode remains the safety net when those tools are not available in the specific session.

---

_Reviewed: 2026-04-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
