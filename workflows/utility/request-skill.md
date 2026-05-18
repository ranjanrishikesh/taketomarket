## Step 0: First-run inline education

Read `.taketomarket/CONFIG.md`. Parse `first_run_seen` (object) and `inline_education` (boolean, default true).

If `inline_education` is false: skip this step. Else if `first_run_seen.ttm-request-skill` is not `true`, print the explainer below verbatim, then mark this skill as seen:

```bash
node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" first-run mark ttm-request-skill
```

Use this exact check (bash) to decide whether to print: `node "${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs" first-run check ttm-request-skill --raw` -- the JSON `seen` field is `true` once the explainer has run before.

### Explainer for `/ttm-request-skill`

`/ttm-request-skill` is the proposal pipeline for new skills. You
describe a marketing job you keep doing manually, the skill asks
structured questions (inputs, outputs, gates, frequency), and
produces either a local SKILL.md draft you can iterate on or a
formatted feature request against the upstream repo.

Why it matters: solopreneurs hit recurring marketing tasks that
nobody else's playbook covers because nobody else has your product.
Rather than re-prompting from scratch each time, this skill turns
your repeated workflow into a versioned, gated skill -- the same
way you'd extract a utility function after writing the same code
three times.

(Canonical source: `references/inline-education-blurbs.md`. Embedded verbatim because workflows do not @-resolve files at runtime.)

---

<purpose>
Skill request workflow for /ttm-request-skill. Gathers details about a NEW
skill the user wants and files a GitHub issue at ranjanrishikesh/taketomarket.
Prefers the `gh` CLI when installed and authenticated; falls back to opening a
pre-filled GitHub issue URL in the browser.
</purpose>

<constraints>
## Read-Only on the Local Project

This workflow does NOT modify any files in the user's project. It only creates
a remote GitHub issue (via `gh`) or prints a URL for the user to open.

## Repo Identity

Always file issues at `ranjanrishikesh/taketomarket` (lowercase). Do not infer
a different repo from local git remotes — this skill files into the upstream
takeToMarket project.

## No Secrets in Issue Body

Do NOT include API keys, tokens, file paths containing credentials, or any
content from `.taketomarket/` reference files in the issue body. Only echo the
user's freeform answers verbatim.
</constraints>

<process>

## Step 1: Gather details

```
takeToMarket > REQUEST A NEW SKILL
```

Use `AskUserQuestion` (priority: critical) to collect:

1. **Skill name** — "What's the skill name you want? (e.g., `ttm-twitter-post`)"
   - Freeform single-line answer.
   - If the user omits the `ttm-` prefix, prepend it for them.
2. **What it does** — "What does it do?"
   - Freeform, multi-line allowed.
3. **Use case** — "What's the use case? When would you run it?"
   - Freeform, multi-line allowed.
4. **Similar / extends** — "Any existing skill it's similar to or extends?"
   - Freeform. Optional — accept an empty answer.

Store the answers as `SKILL_NAME`, `DESCRIPTION`, `USE_CASE`, `SIMILAR`.

---

## Step 2: Detect gh CLI

```bash
GH_STATE="no-gh"
if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    GH_STATE="gh-ready"
  fi
fi
echo "$GH_STATE"
```

If `GH_STATE` is `gh-ready`, proceed to Step 3.
Otherwise, proceed to Step 4.

---

## Step 3: If gh-ready, file issue via gh CLI

Build the issue body from the gathered answers, then run:

```bash
gh issue create \
  --repo ranjanrishikesh/taketomarket \
  --title "[Skill request] ${SKILL_NAME}" \
  --body "$(cat <<'EOF'
**Skill name:** ${SKILL_NAME}
**What it does:** ${DESCRIPTION}
**Use case:** ${USE_CASE}
**Similar / extends:** ${SIMILAR}

---
Filed via /ttm-request-skill
EOF
)"
```

(Substitute the variables before passing to the heredoc — the heredoc above is
quoted to prevent shell expansion of literal `${...}` placeholders that
should be filled in by you. Build the body string first and pass the resolved
text via `--body`.)

Capture the resulting issue URL printed by `gh issue create`. Display it to
the user:

```
takeToMarket > SKILL REQUEST FILED

Issue: <issue-url>

Thanks for the request. You can track it at the URL above.
```

Done — exit successfully.

---

## Step 4: If no-gh, generate pre-filled URL

When `gh` is not installed or not authenticated, build a pre-filled GitHub
issue URL pointing at the `skill-request.yml` template.

URL-encode the title and body. The body fields map to template field IDs:
`skill-name`, `description`, `use-case`, `similar`.

Construct (conceptually):

```
https://github.com/ranjanrishikesh/taketomarket/issues/new
  ?template=skill-request.yml
  &title=<urlencoded "[Skill request] SKILL_NAME">
  &skill-name=<urlencoded SKILL_NAME>
  &description=<urlencoded DESCRIPTION>
  &use-case=<urlencoded USE_CASE>
  &similar=<urlencoded SIMILAR>
```

You can generate the encoded URL with:

```bash
python3 - <<'PY'
import urllib.parse
import os
title = f"[Skill request] {os.environ['SKILL_NAME']}"
params = {
    "template": "skill-request.yml",
    "title": title,
    "skill-name": os.environ["SKILL_NAME"],
    "description": os.environ["DESCRIPTION"],
    "use-case": os.environ["USE_CASE"],
    "similar": os.environ.get("SIMILAR", ""),
}
qs = urllib.parse.urlencode(params)
print(f"https://github.com/ranjanrishikesh/taketomarket/issues/new?{qs}")
PY
```

(Export `SKILL_NAME`, `DESCRIPTION`, `USE_CASE`, `SIMILAR` to the environment
before running the snippet.)

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
- [ ] Four questions asked via AskUserQuestion (name, description, use case, similar)
- [ ] gh CLI detection performed (command + auth status)
- [ ] If gh ready: issue created at ranjanrishikesh/taketomarket with `[Skill request]` prefix and labels via template not required (gh path bypasses template)
- [ ] If no gh: pre-filled URL printed with template=skill-request.yml and encoded title/body fields
- [ ] No local files modified
</success_criteria>

<output>
No local files modified. Either a GitHub issue is created remotely (gh path)
or a URL is printed for the user to open (browser path).
</output>

## What if this doesn't fit?

Looks like /ttm-request-skill can't do that yet. Try one of:

- Existing skill behaving wrong? /ttm-improve-skill
- Need an overview of the system first? /ttm-101
- Otherwise file a free-form issue: https://github.com/ranjanrishikesh/taketomarket/issues/new
