# Security & Privacy Policy

**Effective date:** 2026-05-14
**Last updated:** 2026-05-14

This document covers both the security policy (how to report vulnerabilities) and the privacy policy (what data takeToMarket does and does not handle) for the takeToMarket project.

---

## Privacy Policy

### Summary

takeToMarket is an open-source skill that runs entirely on your local filesystem inside Claude Code, Codex, Cursor, Windsurf, or Gemini CLI. It does not collect, transmit, store, or share any personal data, campaign data, or telemetry of any kind. There are no servers, no analytics, no tracking, and no accounts.

### What takeToMarket does

1. **Installation** — the `npx taketomarket` installer copies Markdown files from the npm package to local directories on your machine (e.g., `~/.claude/skills/`, `~/.taketomarket/`). No data leaves your machine.
2. **Skill execution** — each slash command (e.g., `/ttm-init`, `/ttm-produce`) is a Markdown workflow file read by your AI runtime. The runtime (Claude Code, Codex, etc.) executes the workflow locally. takeToMarket itself does not communicate with any server.
3. **State storage** — all campaign data, briefs, assets, reference files, learnings, and state are stored in plain Markdown files inside your project's `.marketing/` directory. These files never leave your machine unless you choose to share or commit them.
4. **Update check** — the optional `/ttm-update` command runs `npm show taketomarket version` to compare the installed version against the latest published version on npm. This is a single read-only query to the public npm registry. No data about you, your projects, or your campaigns is sent.

### What takeToMarket does NOT do

- No telemetry, analytics, or usage tracking
- No user accounts, sign-up, or authentication
- No data transmission to any takeToMarket-controlled server (there is no such server)
- No access to your campaign data, briefs, assets, or any project files outside the workflow you are actively running
- No third-party integrations that share your data
- No advertising or marketing identifiers
- No cookies, local storage, or browser-side technologies (it's a CLI skill, not a web service)

### Third-party processors

takeToMarket integrates with the AI runtime you choose (Claude Code, Codex, etc.). Those runtimes have their own privacy policies governing how prompts and responses are handled by their respective AI providers. takeToMarket is not party to that data flow and does not see or store it.

Relevant policies:
- **Claude Code** — [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy)
- **Codex** — [OpenAI's privacy policy](https://openai.com/policies/privacy-policy/)
- **Gemini CLI** — [Google's privacy policy](https://policies.google.com/privacy)
- **Cursor** — [Cursor's privacy policy](https://cursor.com/privacy)
- **Windsurf** — [Codeium's privacy policy](https://codeium.com/privacy)

### Data retention

Because takeToMarket does not collect any data, there is no data retention. Your campaign data lives in files on your machine for as long as you keep those files. Deleting your `.marketing/` directory removes all takeToMarket-related project data.

### Children's privacy

takeToMarket is a developer tool intended for adult professional use. It does not knowingly collect any data from anyone, including children under 13.

### Open source verifiability

takeToMarket is MIT-licensed open source. The full source code is at https://github.com/ranjanrishikesh/takeToMarket. You can inspect every file to verify the claims in this policy.

---

## Security Policy

### Supported versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Yes     |
| 1.x     | ❌ No (please upgrade) |

### Reporting a vulnerability

If you discover a security vulnerability in takeToMarket, please report it privately. Do **not** open a public GitHub issue for security vulnerabilities.

**Preferred channel:** email me@rishikeshranjan.com with subject line `[security] takeToMarket: <short summary>`.

Include in your report:
- A description of the vulnerability and its impact
- Steps to reproduce
- Affected version(s)
- Any suggested fix or mitigation
- Whether you would like credit in the fix release notes

### Response timeline

- **Acknowledgement:** within 72 hours
- **Triage and severity assessment:** within 7 days
- **Fix release:** depends on severity — critical issues prioritized
- **Public disclosure:** coordinated with reporter after fix is released

### Scope

In scope:
- The npm package `taketomarket` (installer code in `install.js`, helper scripts in `bin/`)
- Skill content that could lead to command injection, path traversal, or arbitrary file writes outside intended directories
- The plugin manifest at `.claude-plugin/`

Out of scope:
- Vulnerabilities in third-party AI runtimes (report to those vendors directly)
- Vulnerabilities in Node.js, npm, or other dependencies (report upstream)
- Issues that require root/admin access on the user's machine
- Theoretical issues without a concrete attack path

### Security considerations for users

- takeToMarket is a developer tool. Treat it like any other npm package — review the code, pin versions for production use, and avoid running untrusted variants.
- Skills and workflows execute in your AI runtime with whatever filesystem permissions you have granted that runtime. takeToMarket itself has no special privileges.
- The `/ttm-update` command makes a single read-only query to the public npm registry (`npm show taketomarket version`). No other network calls.

---

## Changes to this policy

Changes will be committed to the public GitHub repository and reflected in the `Last updated` date above. There is no separate notification mechanism because there are no users on file to notify.

## Contact

- **Privacy questions:** open an issue at https://github.com/ranjanrishikesh/takeToMarket/issues (non-sensitive) or email me@rishikeshranjan.com
- **Security vulnerabilities:** email me@rishikeshranjan.com with subject `[security] ...` — do NOT open a public issue
