# Playwright MCP Setup — Reference

**Purpose:** Step-by-step install of the official Microsoft Playwright MCP server plus the Chrome/Edge extension bridge for takeToMarket skills (competitor scan fallback, LinkedIn/Twitter author scraping, landing/pSEO verification).

**Verified:** 2026-05-18 against `@playwright/mcp@0.0.75` and "Playwright Extension" v0.2.1 in the Chrome Web Store.

## What is Playwright MCP

Playwright is a browser automation library. The Playwright MCP server (Model Context Protocol) wraps it so AI agents can drive a real browser. Key capabilities:
- Visit any URL and read the rendered DOM as a structured accessibility snapshot (no vision model required).
- Take screenshots at any viewport size.
- Interact: click, type, scroll, hover, drag, switch tabs, press keys.
- **Connect to the user's already-running Chrome/Edge browser** via the Playwright Extension — critical for auth-gated sites like LinkedIn, X/Twitter, and any site behind SSO/2FA. The LLM never sees your credentials; it reuses an existing logged-in tab you pick.

Source of truth: <https://github.com/microsoft/playwright-mcp> and <https://playwright.dev/mcp/configuration/browser-extension>.

## Prerequisites

- **Node.js 18 or newer** (required by `@playwright/mcp`, enforced via `engines.node`).
- **Chrome or Edge** (the extension bridge is Chromium-only — Firefox and WebKit work for headless mode but not for the logged-in browser bridge).
- An MCP-aware runtime: Claude Code, Codex CLI, or Cursor.

## Installation

### 1. Install the MCP server

The server is the npm package `@playwright/mcp`. You normally do **not** install it globally — runtimes invoke it via `npx`, which fetches and caches it on first run. To pre-warm the cache and confirm Node finds it:

```bash
node -v                                  # must print v18.x or higher
npm view @playwright/mcp version         # should print 0.0.75 (or later)
npx -y @playwright/mcp@0.0.75 --help     # pre-warm cache + confirm version pin resolves
```

### 2. Install the Chrome extension bridge

The extension is published in the Chrome Web Store as **"Playwright Extension"** (publisher: Playwright Team / Microsoft, ID `mmlmfjhmonkocbjadbfplnigmagldckm`). Note: third-party listings sometimes call it "Playwright MCP Bridge" — the official name is just **Playwright Extension**.

Install path (recommended):

1. Open <https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm> in Chrome or Edge.
2. Click **Add to Chrome** (or **Add to Edge**).
3. Pin it to the toolbar so the connection prompt is visible.
4. Log into the sites you plan to scrape (e.g., LinkedIn, X/Twitter) in normal tabs — the bridge reuses those sessions.

Sideload path (corporate machines with Chrome Web Store blocked):

1. Clone or download the latest tag from <https://github.com/microsoft/playwright-mcp>.
2. Build the extension per the repo's `extension/` directory README, or grab the prebuilt `.zip` from the GitHub release matching your `@playwright/mcp` version.
3. Open `chrome://extensions`, toggle **Developer mode** on, click **Load unpacked**, and select the unzipped extension directory.

Either way, the extension only does anything when an MCP server is launched with `--extension` (see Step 3).

### 3. Configure runtime MCP settings

The flag that connects the MCP server to the extension is `--extension`. Without it, the server spawns its own headless browser and ignores your logged-in sessions.

**Claude Code (recommended: CLI command):**

```bash
claude mcp add playwright -- npx -y @playwright/mcp@0.0.75 --extension
```

This writes the entry to `~/.claude.json` (or `~/.claude/settings.json` depending on Claude Code version). Equivalent manual JSON if you prefer to edit by hand:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@0.0.75", "--extension"]
    }
  }
}
```

Drop `--extension` from `args` if you want headless mode only (faster for non-auth-gated work like landing/pSEO Lighthouse checks).

**Codex CLI (`~/.codex/config.toml`):**

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@0.0.75", "--extension"]
```

Or via Codex CLI:

```bash
codex mcp add playwright npx -- -y "@playwright/mcp@0.0.75" --extension
```

**Cursor (`~/.cursor/mcp.json` for global, or `.cursor/mcp.json` per-project):**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@0.0.75", "--extension"]
    }
  }
}
```

Cursor also supports a one-click install deeplink from the Playwright MCP README (`cursor://anysphere.cursor-deeplink/mcp/install?...`) — use it if you prefer not to hand-edit JSON.

### 4. Test connection

Restart the runtime so it picks up the new MCP server, then in a takeToMarket-enabled session run:

```
/ttm-playwright-setup
```

The skill performs a sanity test: opens `https://example.com`, takes a screenshot, and reports the page title. First run with `--extension` will pop up a Playwright Extension prompt in your browser asking which tab to connect to — pick one, and the server proceeds.

Manual sanity check without the skill:

```bash
npx -y @playwright/mcp@0.0.75 --extension --port 8931
# Server prints: "Listening on http://localhost:8931/sse"
# Then in the MCP runtime call the `browser_navigate` tool with url=https://example.com
```

## Capabilities unlocked

After setup, the following skills can use Playwright:
- `/ttm-linkedin-post` — scrape author profiles for mimic style (requires `--extension` + logged-in LinkedIn tab).
- `/ttm-competitor-scan` — render JS-heavy competitor sites that block plain `fetch`.
- `/ttm-landing` and `/ttm-pseo` quality gates — Lighthouse audits, mobile screenshots, visual diff (works in headless mode; `--extension` not required).
- (Future v2.4.0) `/ttm-twitter-post`, `/ttm-linkedin-engage` — both will require `--extension`.

## Useful flags

| Flag | Purpose |
|------|---------|
| `--extension` | Connect to a running Chrome/Edge instance via the Playwright Extension. Required for auth-gated scraping. |
| `--headless` | Run with no visible window (faster, no extension support). |
| `--browser <chrome\|firefox\|webkit\|msedge>` | Pick the browser engine. Only `chrome` and `msedge` work with `--extension`. |
| `--isolated` | Use a throwaway profile per session; storage state is discarded on close. |
| `--user-data-dir <path>` | Use a persistent profile directory. Different workspaces auto-namespace via hash. |
| `--port <n>` | Run as a standalone SSE/HTTP server instead of stdio (useful for debugging). |

Full flag list: `npx -y @playwright/mcp@0.0.75 --help`.

## Troubleshooting

- **"No tab selected" or extension popup never appears.** Make sure the Playwright Extension is enabled in `chrome://extensions` and pinned. The MCP server must be started with `--extension`; without that flag, the extension stays idle.
- **`Cannot find module '@playwright/mcp'` or `npx` hangs.** Node version is too old. Run `node -v` — must be `v18.x` or newer. Upgrade via `nvm install 20` and retry.
- **MCP server doesn't show up in Claude Code.** Confirm the entry exists: `claude mcp list`. If you edited JSON directly, fully quit and relaunch Claude Code — settings are read once at startup.
- **Codex doesn't load `~/.codex/config.toml`.** Confirm the file path with `codex mcp list`. Some Codex builds use `~/.config/codex/config.toml` on Linux.
- **Cursor "MCP server failed to start".** Cursor needs an absolute path to `node`/`npx` on macOS if launched from the Dock. Replace `"command": "npx"` with the full output of `which npx` (e.g., `/Users/you/.nvm/versions/node/v20.10.0/bin/npx`).
- **Logged-in scrape returns the login page anyway.** The bridge connects to the **tab you picked**, not all tabs. Pick a tab that's already authenticated on the target domain. Refresh that tab once before reconnecting if cookies feel stale.
- **LinkedIn / X rate-limits or shows a CAPTCHA.** You're driving the user's real session — the same rate limits and bot-detection apply. Slow down requests, throttle to one profile every few seconds, and never run unattended against these sites.
- **Headless mode works but `--extension` doesn't.** Firefox/WebKit don't support the extension bridge. Force Chrome with `--browser chrome` or `--browser msedge`.

## References

- Playwright MCP repo: <https://github.com/microsoft/playwright-mcp>
- Browser extension docs: <https://playwright.dev/mcp/configuration/browser-extension>
- Chrome Web Store listing: <https://chromewebstore.google.com/detail/playwright-extension/mmlmfjhmonkocbjadbfplnigmagldckm>
- npm package: <https://www.npmjs.com/package/@playwright/mcp>
- Logged-in scraping walkthrough (Debbie O'Brien, Microsoft): <https://dev.to/debs_obrien/testing-in-a-logged-in-state-with-the-playwright-mcp-browser-extension-4cmg>
