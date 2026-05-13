# Privacy Policy

**Effective date:** 2026-05-14
**Last updated:** 2026-05-14

## Summary

takeToMarket is an open-source skill that runs entirely on your local filesystem inside Claude Code, Codex, Cursor, Windsurf, or Gemini CLI. It does not collect, transmit, store, or share any personal data, campaign data, or telemetry of any kind. There are no servers, no analytics, no tracking, and no accounts.

## What takeToMarket does

When you install and use takeToMarket:

1. **Installation** — the `npx taketomarket` installer copies Markdown files from the npm package to local directories on your machine (e.g., `~/.claude/skills/`, `~/.taketomarket/`). No data leaves your machine.
2. **Skill execution** — each slash command (e.g., `/ttm-init`, `/ttm-produce`) is a Markdown workflow file read by your AI runtime. The runtime (Claude Code, Codex, etc.) executes the workflow locally. takeToMarket itself does not communicate with any server.
3. **State storage** — all campaign data, briefs, assets, reference files, learnings, and state are stored in plain Markdown files inside your project's `.marketing/` directory. These files never leave your machine unless you choose to share or commit them.
4. **Update check** — the optional `/ttm-update` command runs `npm show taketomarket version` to compare the installed version against the latest published version on npm. This is a single read-only query to the public npm registry. No data about you, your projects, or your campaigns is sent.

## What takeToMarket does NOT do

- No telemetry, analytics, or usage tracking
- No user accounts, sign-up, or authentication
- No data transmission to any takeToMarket-controlled server (there is no such server)
- No access to your campaign data, briefs, assets, or any project files outside the workflow you are actively running
- No third-party integrations that share your data
- No advertising or marketing identifiers

## Third-party processors

takeToMarket integrates with the AI runtime you choose (Claude Code, Codex, etc.). Those runtimes have their own privacy policies governing how prompts and responses are handled by their respective AI providers. takeToMarket is not party to that data flow and does not see or store it.

Relevant policies:
- **Claude Code** — see [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy)
- **Codex** — see [OpenAI's privacy policy](https://openai.com/policies/privacy-policy/)
- **Gemini CLI** — see [Google's privacy policy](https://policies.google.com/privacy)
- **Cursor** — see [Cursor's privacy policy](https://cursor.com/privacy)
- **Windsurf** — see [Codeium's privacy policy](https://codeium.com/privacy)

## Cookies and similar technologies

takeToMarket does not use cookies, local storage, or any browser-side technologies. It is a command-line skill, not a web service.

## Data retention

Because takeToMarket does not collect any data, there is no data retention. Your campaign data lives in files on your machine for as long as you keep those files. Deleting your `.marketing/` directory removes all takeToMarket-related project data.

## Children's privacy

takeToMarket is a developer tool intended for adult professional use. It does not knowingly collect any data from anyone, including children under 13.

## Open source

takeToMarket is MIT-licensed open source. The full source code is available at https://github.com/ranjanrishikesh/takeToMarket. You can inspect every file to verify the claims in this policy.

## Changes to this policy

Any changes to this privacy policy will be committed to the public GitHub repository and reflected in the `Last updated` date above. There is no separate notification mechanism because there are no users on file to notify.

## Contact

Questions about this policy: open an issue at https://github.com/ranjanrishikesh/takeToMarket/issues or email rishi.priyaranjan97@gmail.com.
