# Playwright Setup Workflow

**Required reading:** `${CLAUDE_PLUGIN_ROOT}/references/playwright-mcp-setup.md`

## Step 1: Detect current state

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs playwright-check --raw
```

If `detected = true`: print "Playwright MCP already configured for Claude Code." Then AskUserQuestion (priority: critical):
- "Run smoke test, install for another runtime (Codex/Cursor), or exit?"
- options: "Run smoke test" / "Install for another runtime" / "Exit"

If "Run smoke test": skip to Step 5. If "Install for another runtime": continue to Step 2 (filter Claude Code out of the candidate list). If "Exit": exit.

## Step 2: Pick target runtime

Even if the current session is Claude Code, the user might be installing for Codex or Cursor. Always ask.

Suggest candidates by checking which dirs exist:
- `~/.claude/` → Claude Code
- `~/.codex/` → Codex
- `~/.cursor/` → Cursor

Then AskUserQuestion (priority: critical):
- "Which runtime do you want to configure Playwright MCP for?"
- options: list detected candidates first (marked "(detected)"), then the other runtimes, then "All of them"
- if user picks "All of them": loop through each in Step 3.

## Step 3: Print install steps for detected runtime

Print the relevant sections from `${CLAUDE_PLUGIN_ROOT}/references/playwright-mcp-setup.md`:

- Section **"1. Install the MCP server"** — the `npx -y @playwright/mcp@0.0.75 --help` pre-warm command and the `node -v` / `npm view @playwright/mcp version` verification.
- Section **"2. Install the Chrome extension bridge"** — the Chrome Web Store link for "Playwright Extension" (`mmlmfjhmonkocbjadbfplnigmagldckm`), plus the sideload fallback for corporate machines.
- Section **"3. Configure runtime MCP settings"** — show only the sub-block matching the detected runtime:
  - **Claude Code:** the `claude mcp add playwright ...` CLI command (preferred) and the equivalent `~/.claude.json` / `~/.claude/settings.json` JSON snippet.
  - **Codex CLI:** the `~/.codex/config.toml` TOML snippet (`[mcp_servers.playwright]`) and the `codex mcp add` CLI equivalent.
  - **Cursor:** the `~/.cursor/mcp.json` (or per-project `.cursor/mcp.json`) JSON snippet.

## Step 4: Pause for user

AskUserQuestion (priority: critical):

- question: "Have you completed the install steps above?"
- options:
  - "Yes, ready to test"
  - "I'll do it later"

If "I'll do it later": exit with a reminder that `/ttm-playwright-setup` can be re-run anytime to resume.

## Step 5: Smoke test

If the user said "Yes, ready to test":

- Re-run `node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs playwright-check --raw`.
- Track retry count across re-checks. Cap at 2 failed re-checks.
- If still not detected: print "MCP server not detected. Common fixes:" followed by the relevant items from the reference's **Troubleshooting** section (Node version too old, runtime needs a full restart to pick up new MCP entries, absolute path required for `npx` on Cursor macOS). Loop back to Step 4.
- After the 2nd failed re-check, exit the smoke-test loop with: "Couldn't detect Playwright MCP after 2 attempts. See references/playwright-mcp-setup.md Troubleshooting section, fix the issue, then re-run /ttm-playwright-setup."
- If detected: try a real Playwright call:
  - Use the MCP `browser_navigate` tool to navigate to `https://example.com` and take a screenshot.
  - On success: print "✓ Playwright MCP working. takeToMarket capabilities now unlocked."
  - On failure: print the error and link to the **Troubleshooting** section of `references/playwright-mcp-setup.md`.

## Step 6: Mark CONFIG.md

```bash
TS=$(node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs timestamp --raw | tr -d '"')
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs config set playwright_mcp_setup_at "$TS"
```

If the user installed with the Chrome extension bridge (`--extension`), also record that capability so downstream skills can precondition:

```bash
node ${CLAUDE_PLUGIN_ROOT}/bin/ttm-tools.cjs config set playwright_mcp_extension true
```

Otherwise set it to `false`.

## Step 7: Print next steps

```
✓ Playwright MCP is configured.

Capabilities now unlocked:
- /ttm-competitor-scan can render JS-heavy sites.
- /ttm-linkedin-post can scrape author profiles (requires a logged-in tab in Chrome).
- /ttm-landing and /ttm-pseo quality gates can run Lighthouse + visual diff.

Run /ttm-next for the recommended next command.
```
