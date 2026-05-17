# takeToMarket - Codex Instructions

## Core Invariant

Every marketing asset ships with a verifiable outcome metric and passes through a positioning-invariant quality gate wall. No asset ships without both, ever.

### Target Audience

**Built for developerneurs and solopreneurs** — engineers building and shipping their own products who have zero or near-zero marketing/growth experience.

When assisting the user:
- Assume strong engineering literacy. They read code fluently.
- Assume zero marketing literacy. Explain positioning, ICP, AEO, funnels in engineering analogies.
- Default to opinionated guidance — they came here because they don't know what's "right" in marketing.
- When suggesting marketing terms, link to `/ttm-101` or run inline explanations on first use.

## Positioning as Invariant (positioning-as-invariant)

POSITIONING.md is the source of truth for all marketing content. It is:
- **Read-only during campaign execution** -- cannot be edited from within a campaign
- **Loaded into every phase context** -- compact summary in non-produce phases, full document in produce/verify
- **Enforced via quality gates** -- positioning drift gate is Tier 1 (blocking)

To change positioning, use `/ttm-positioning-shift` which requires:
1. Explicit reasoning for the shift
2. Migration plan for existing assets
3. Deprecation schedule
4. Human approval

## Outcome Over Output

Every campaign brief must define:
- **Outcome metric**: What business result we expect (e.g., "20% increase in trial starts")
- **Output metric**: What we produce (e.g., "4 blog posts, 2 emails")

Outcome is reported first. Output without outcome is not a campaign.

## Campaign Lifecycle

Campaigns follow a 9-phase lifecycle: Discover -> Brief -> Produce -> Verify -> Review -> Fix -> Ship -> Measure -> Learn

Each phase has a dedicated `/ttm-*` command. Phases cannot be skipped.

## File Paths

- Marketing state: `.taketomarket/`
- Reference files: `.taketomarket/POSITIONING.md`, `.taketomarket/BRAND.md`, etc.
- Campaigns: `.taketomarket/CAMPAIGNS/<slug>/`
- Campaign state: `.taketomarket/CAMPAIGNS/<slug>/STATE.md`

## Deterministic Operations

Always use `ttm-tools.cjs` for:
- Slug generation: `node ttm-tools.cjs slug "campaign name"`
- Timestamps: `node ttm-tools.cjs timestamp`
- State updates: `node ttm-tools.cjs state update <field> <value>`
- Health checks: `node ttm-tools.cjs health`

Never generate slugs or timestamps via AI -- they must be deterministic.

## Quality Gate Wall

Assets pass through 10 base quality gates:
1. Positioning drift (Tier 1 - blocking)
2. Claim accuracy (Tier 1 - blocking)
3. Voice drift
4. Outcome alignment (Tier 1 - blocking)
5. Funnel integrity
6. UTM hygiene
7. Compliance
8. Competitor collision
9. ICP fit
10. Format correctness

Tier 1 gates are blocking. Tier 2 gates are advisory.
