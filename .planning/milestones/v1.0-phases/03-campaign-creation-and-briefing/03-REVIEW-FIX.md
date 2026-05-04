---
phase: 03-campaign-creation-and-briefing
fixed_at: 2026-04-24T00:00:00Z
review_path: .planning/phases/03-campaign-creation-and-briefing/03-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-24
**Source review:** .planning/phases/03-campaign-creation-and-briefing/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: Shell Injection via Unquoted `CAMPAIGN_NAME` in Workflow

**Files modified:** `workflows/setup/new-campaign.md`, `workflows/lifecycle/research.md`, `workflows/lifecycle/brief.md`
**Commit:** fc2da33
**Applied fix:** Quoted all variable interpolations (`${CLAUDE_PLUGIN_ROOT}`, `${CAMPAIGN_SLUG}`, `${SLUG}`) in bash code blocks across all three workflow files. Also added error-checked timestamp substitution (WR-04) in research.md and brief.md -- the timestamp command is now captured in a variable with an emptiness check before passing to the update command.

### CR-02: Slug Sanitization Strips All Hyphens When Input Is Already a Slug

**Files modified:** `bin/ttm-tools.cjs`
**Commit:** acb1067
**Applied fix:** Added whitespace validation on the slug argument in the campaign CLI routing block. If the slug contains whitespace (indicating shell word splitting occurred), the command exits with a clear error message before dispatching to any subcommand.

### WR-01: `cmdCampaignUpdate` Allows Arbitrary Field Names -- No Allowlist

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** 05303f2
**Applied fix:** Added `ALLOWED_FIELDS` Set containing all known STATE.md frontmatter keys (phase, name, last_updated, phase.*, gate.*). The function now rejects any field not in the allowlist with an error listing valid fields.

### WR-02: `cmdCampaignState` Error Path Leaks the Unsanitized User-Provided `slug`

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** 3c25c31
**Applied fix:** Added explicit slug sanitization (`safe = slug.toLowerCase().replace(...)`) in `cmdCampaignState` and used the sanitized value in the error output, so the user sees the same identifier that was used for the filesystem lookup.

### WR-03: Race Condition Window Between Existence Check and Directory Creation

**Files modified:** `bin/lib/campaign.cjs`
**Commit:** a595959
**Applied fix:** Added `fs.existsSync(statePath)` guard in `cmdCampaignInit` before writing STATE.md. If a campaign already exists at that slug, the command exits with an error instructing the user to delete the directory or use a different slug.

### WR-04: `research.md` State Update Uses Unvalidated Shell Subshell for Timestamp

**Files modified:** `workflows/lifecycle/research.md`, `workflows/lifecycle/brief.md`
**Commit:** fc2da33 (combined with CR-01)
**Applied fix:** Replaced inline `$(...)` timestamp substitution with a two-step pattern: capture timestamp into a `$TIMESTAMP` variable, check for empty value with explicit error exit, then pass the variable to the update command. Applied to both research.md (line 225) and brief.md (line 289).

### WR-05: `brief.md` Phase Check Misses the "researched" Phase Correctly but Silently Advances

**Files modified:** `workflows/lifecycle/brief.md`
**Commit:** b3d2289
**Applied fix:** Added a second phase guard condition: when phase is NOT "created" AND NOT "researched", warn the user that the campaign is in an unexpected phase and that running /ttm-brief will overwrite the existing BRIEF.md. Requires user confirmation before proceeding.

### WR-06: `campaign-state.md` Template Has Static Body Text That Won't Match Generated STATE.md

**Files modified:** `templates/campaign-state.md`
**Commit:** 6d390a8
**Applied fix:** Added an HTML comment at the top of the template clarifying it is a documentation artifact only and that the authoritative STATE.md generator is `cmdCampaignInit` in `bin/lib/campaign.cjs`. This prevents developers from editing the template expecting it to change generated output.

---

_Fixed: 2026-04-24_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
