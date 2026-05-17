# takeToMarket for Gemini CLI

takeToMarket is a marketing operating system for AI coding tools. This file provides Gemini CLI-specific setup instructions.

### Target Audience

**Built for developerneurs and solopreneurs** — engineers building and shipping their own products who have zero or near-zero marketing/growth experience.

When assisting the user:
- Assume strong engineering literacy. They read code fluently.
- Assume zero marketing literacy. Explain positioning, ICP, AEO, funnels in engineering analogies.
- Default to opinionated guidance — they came here because they don't know what's "right" in marketing.
- When suggesting marketing terms, link to `/ttm-101` or run inline explanations on first use.

## Installation

```bash
npx taketomarket
```

Select **Gemini CLI** (option 5) when prompted.

Skills are installed to `~/.gemini/skills/`. Alternatively, select **All runtimes via ~/.agents/skills/** (option 6) to install to the universal cross-runtime path.

## Invocation

Gemini CLI activates skills automatically based on task context. You can also manage skills explicitly:

```
/skills list
/skills enable ttm-init
/skills disable ttm-produce
```

Skills are NOT slash commands in Gemini CLI. Type your request naturally and Gemini will activate the appropriate skill.

## Quick Start

After install, start a new Gemini CLI session and ask:

```
Set up takeToMarket for this project
```

Gemini will activate `/ttm-init` and guide you through onboarding.

## Available Skills

| Skill | Description |
|-------|-------------|
| ttm-init | Interview-driven onboarding that generates all .marketing/ reference files |
| ttm-new-campaign | Create a new campaign directory with initialized state |
| ttm-brief | Generate a campaign brief with mandatory outcome metrics |
| ttm-produce | Generate content assets in fresh contexts |
| ttm-review | Present assets with structured review checklist |
| ttm-verify | Run all applicable quality gates |
| ttm-ship | Generate launch checklist |
| ttm-measure | Analyze campaign analytics against outcome metrics |
| ttm-learn | Extract lessons and update reference files |
| ttm-health | Validate .marketing/ directory integrity |
| ttm-state | Display current campaign states |
| ttm-next | Guide to the right next command |
| ttm-resume | Resume a paused campaign |

## Verify Installation

```bash
ls ~/.gemini/skills/
```

You should see directories like `ttm-init/`, `ttm-produce/`, etc.

## Notes

- Skills require both `name:` and `description:` in frontmatter — all takeToMarket skills include both
- If your runtime supports it, `~/.agents/skills/` serves as a universal cross-runtime path — select option 6 during install to use it
- For issues: https://github.com/ranjanrishikesh/takeToMarket/issues
