## Step 0: First-run inline education

Read `.taketomarket/CONFIG.md`. Parse `first_run_seen` (object) and `inline_education` (boolean, default true).

If `inline_education` is false: skip this step. Else if `first_run_seen.ttm-improve-skill` is not `true`, print the explainer below verbatim, then mark this skill as seen:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" first-run mark ttm-improve-skill
```

Use this exact check (bash) to decide whether to print: `node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" first-run check ttm-improve-skill --raw` -- the JSON `seen` field is `true` once the explainer has run before.

### Explainer for `/ttm-improve-skill`

`/ttm-improve-skill` opens a feedback loop on a specific takeToMarket
skill. It diffs your last few invocations of a skill, asks what felt
wrong or missing, and either drafts a local skill override or files a
structured issue against the takeToMarket repo so the change can land
upstream.

Why it matters: takeToMarket is opinionated, which means it'll be
wrong about your context sometimes. This skill is the structured
escape hatch -- instead of fighting the skill in-conversation, you
record the friction, get a fix, and avoid that friction permanently.
Treat it like filing a linter rule exemption.

(Canonical source: `references/inline-education-blurbs.md`. Embedded verbatim because workflows do not @-resolve files at runtime.)

---

<purpose>
Skill improvement workflow for /ttm-improve-skill. Gathers details about an
EXISTING skill that needs changes and files a GitHub issue at
ranjanrishikesh/taketomarket. Prefers the `gh` CLI when installed and
authenticated; falls back to opening a pre-filled GitHub issue URL in the
browser.
</purpose>

<constraints>
## Read-Only on the Local Project

This workflow does NOT modify any files in the user's project. It only creates
a remote GitHub issue (via `gh`) or prints a URL for the user to open.

## Repo Identity

Always file issues at `ranjanrishikesh/taketomarket` (lowercase). Do not infer
a different repo from local git remotes.

## No Secrets in Issue Body

Do NOT include API keys, tokens, file paths containing credentials, or any
content from `.taketomarket/` reference files in the issue body. Only echo the
user's freeform answers verbatim.
</constraints>

<process>

## Step 1: Enumerate existing skills

```
takeToMarket > REPORT A SKILL IMPROVEMENT
```

List installed ttm-* skills so the user can pick one:

```bash
ls -1 "${CLAUDE_PLUGIN_ROOT}/skills" | grep '^ttm-' | sort
```

Present the list to the user.

---

## Step 2: Gather details

Use `AskUserQuestion` (priority: critical) to collect:

1. **Which skill?** — "Which skill needs improvement?"
   - `multiSelect` from the enumerated `ttm-*` skill list.
   - Allow a freeform fallback in case the user wants to name a skill not yet
     visible locally.
2. **What's not working?** — "What's not working with this skill?"
   - Freeform, multi-line allowed.
3. **Expected behavior** — "What's the expected behavior?"
   - Freeform, multi-line allowed.
4. **Steps to reproduce** — "Steps to reproduce (if a bug)."
   - Freeform, multi-line allowed. Optional — accept an empty answer.

Store the answers as `WHICH_SKILL`, `NOT_WORKING`, `EXPECTED`, `REPRO_STEPS`.

If the user selected multiple skills, join them with `, ` for the issue title
and body.

---

## Step 3: Detect gh CLI

```bash
GH_STATE="no-gh"
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    GH_STATE="gh-ready"
  fi
fi
echo "$GH_STATE"
```

If `GH_STATE` is `gh-ready`, proceed to Step 4.
Otherwise, proceed to Step 5.

---

## Step 4: If gh-ready, file issue via gh CLI

Build the issue body from the gathered answers, then run:

```bash
gh issue create \
  --repo ranjanrishikesh/taketomarket \
  --title "[Skill improvement] ${WHICH_SKILL}" \
  --body "$(cat <<'EOF'
**Which skill:** ${WHICH_SKILL}
**What's not working:** ${NOT_WORKING}
**Expected behavior:** ${EXPECTED}
**Steps to reproduce:** ${REPRO_STEPS}

---
Filed via /ttm-improve-skill
EOF
)"
```

(Substitute the variables before passing to the heredoc — the heredoc above is
quoted to prevent shell expansion of literal `${...}` placeholders. Build the
body string first and pass the resolved text via `--body`.)

Capture the resulting issue URL printed by `gh issue create`. Display it to
the user:

```
takeToMarket > SKILL IMPROVEMENT FILED

Issue: <issue-url>

Thanks for the report. You can track it at the URL above.
```

Done — exit successfully.

---

## Step 5: If no-gh, generate pre-filled URL

When `gh` is not installed or not authenticated, build a pre-filled GitHub
issue URL pointing at the `skill-improvement.yml` template.

URL-encode the title and body. The body fields map to template field IDs:
`which-skill`, `not-working`, `expected`, `repro-steps`.

Construct (conceptually):

```
https://github.com/ranjanrishikesh/taketomarket/issues/new
  ?template=skill-improvement.yml
  &title=<urlencoded "[Skill improvement] WHICH_SKILL">
  &which-skill=<urlencoded WHICH_SKILL>
  &not-working=<urlencoded NOT_WORKING>
  &expected=<urlencoded EXPECTED>
  &repro-steps=<urlencoded REPRO_STEPS>
```

You can generate the encoded URL with:

```bash
python3 - <<'PY'
import urllib.parse
import os
title = f"[Skill improvement] {os.environ['WHICH_SKILL']}"
params = {
    "template": "skill-improvement.yml",
    "title": title,
    "which-skill": os.environ["WHICH_SKILL"],
    "not-working": os.environ["NOT_WORKING"],
    "expected": os.environ["EXPECTED"],
    "repro-steps": os.environ.get("REPRO_STEPS", ""),
}
qs = urllib.parse.urlencode(params)
print(f"https://github.com/ranjanrishikesh/taketomarket/issues/new?{qs}")
PY
```

(Export `WHICH_SKILL`, `NOT_WORKING`, `EXPECTED`, `REPRO_STEPS` to the
environment before running the snippet.)

Print the URL and instruct the user:

```
takeToMarket > OPEN IN BROWSER

gh CLI not detected (or not authenticated). Open this URL to file the issue:

<url>

Tip: install `gh` (https://cli.github.com) and run `gh auth login` to file
issues directly next time.
```

Done — exit successfully.

</process>

<success_criteria>
- [ ] Installed ttm-* skills listed for user selection
- [ ] Four questions asked via AskUserQuestion (which-skill, not-working, expected, repro)
- [ ] gh CLI detection performed (command + auth status)
- [ ] If gh ready: issue created at ranjanrishikesh/taketomarket with `[Skill improvement]` prefix
- [ ] If no gh: pre-filled URL printed with template=skill-improvement.yml and encoded title/body fields
- [ ] No local files modified
</success_criteria>

<output>
No local files modified. Either a GitHub issue is created remotely (gh path)
or a URL is printed for the user to open (browser path).
</output>

## What if this doesn't fit?

Looks like /ttm-improve-skill can't do that yet. Try one of:

- Want a brand-new skill instead? /ttm-request-skill
- Need an overview of the system first? /ttm-101
- Otherwise file a free-form issue: https://github.com/ranjanrishikesh/taketomarket/issues/new
