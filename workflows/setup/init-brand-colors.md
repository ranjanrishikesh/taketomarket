# Init Sub-Workflow: Brand Colors

**Purpose:** Generate the brand color palette and append it to BRAND.md.

**Called by:** `workflows/setup/init.md` after Section 2 (Brand and Voice) base questions.

**Required reading:** `${CLAUDE_PLUGIN_ROOT}/references/brand-color-theory.md`

---

## Step 1: Derive constraints

Read `.taketomarket/POSITIONING.md`, `BRAND.md`, `ICP.md`. Note:
- Voice archetype (Authoritative Expert -> cooler/blues, Bold Challenger -> high-contrast/saturated, etc.).
- Category (DevTools default to dev-friendly palettes, B2B SaaS to trust-blues, DTC to category norms).
- ICP (engineering audience leans dark-mode-friendly).
- Banned colors from BRAND.md if any (e.g., "no pink - it's our biggest competitor's color").

## Step 2: Propose 3 candidate palettes

Generate 3 palettes following references/brand-color-theory.md guidance.
For each: primary, primary variants, secondary, accent, full neutral scale, semantic colors.

For each palette, run WCAG contrast checks:
- Primary on white (light bg).
- Primary on near-black (dark bg).
- Each variant against text on both bgs.

Reject any palette where the primary fails AA contrast on at least one background.

## Step 3: Present + pick

AskUserQuestion (priority: critical):
- header: "Palette"
- question: "Three candidate palettes proposed. Each shows primary, secondary, accent, neutral scale."
- options:
  - "Palette A: [name + 3 swatches in description]"
  - "Palette B: [name + 3 swatches]"
  - "Palette C: [name + 3 swatches]"
  - "Show me more options"
  - "I'll provide my own hex codes"

If "Show me more": generate 3 new candidates, re-present.
If "I'll provide my own": freeform input - primary, secondary, accent. Auto-derive variants + neutral scale.

## Step 4: Write to BRAND.md

Append the selected palette to BRAND.md `## Colors` section (template at `templates/reference-files/brand.md`).

Include:
- All hex values.
- WCAG contrast check results.
- One-paragraph rationale: why this palette fits the positioning + manifesto.

## Step 5: Save to .taketomarket/brand/colors.json

Also save as JSON for landing/pSEO consumption:

```json
{
  "primary": { "DEFAULT": "#0EA5E9", "hover": "#0284C7", "active": "#075985" },
  "secondary": { "DEFAULT": "#7C3AED" },
  "accent": { "DEFAULT": "#F59E0B" },
  "neutral": { "50": "#FAFAFA", "100": "#F4F4F5", "900": "#18181B" },
  "semantic": { "success": "#22C55E", "warning": "#F59E0B", "error": "#EF4444", "info": "#3B82F6" }
}
```

## Step 6: Confirm

AskUserQuestion (priority: critical):
- "Colors saved to BRAND.md and .taketomarket/brand/colors.json. Confirm or revise?"
- "Confirm" / "Revise"

If revise: go back to Step 3.
