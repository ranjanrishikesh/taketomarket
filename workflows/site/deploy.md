# Deploy Workflow

## Step 1: Read landing path

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs config read --raw
```

Extract `landing_path`. If missing: print "Run /ttm-landing first" and exit.

## Step 2: Detect deploy path

```bash
cd <landing_path> && node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs deploy detect --raw
```

Parse JSON. Branch on `preferred`:

### preferred = "git-push"

Inside landing path:
1. `git add . && git commit -m "deploy: takeToMarket landing update"` (if changes).
2. `git push origin <current-branch>`.
3. Print Vercel dashboard URL and "Deploy in progress — check dashboard."

### preferred = "cli"

Inside landing path:
1. `vercel deploy [--prod]` (depending on flag).
2. CLI outputs deploy URL. Print it.

### preferred = "api-token"

Print: "API-token deploy not yet implemented for v2.3.0. Either install vercel CLI or connect this repo to Vercel and use git-push."

### preferred = null (nothing available)

Walk user through setup:
1. AskUserQuestion: "No Vercel deploy path detected. Which would you like to set up?"
   - "Connect repo to Vercel dashboard (recommended)" — print instructions.
   - "Install Vercel CLI" — `npm i -g vercel && vercel login`.
   - "Skip — I'll deploy manually."

## Step 3: Verify deploy URL responds

If a deploy URL was produced, fetch the homepage:
```bash
curl -sI <url> | head -1
```
Expected: `HTTP/2 200`.

If non-200: print warning + URL.

## Step 4: Update CONFIG.md

Append:
```
last_deploy_url: <url>
last_deploy_at: <timestamp>
```

## Step 5: Print next steps
