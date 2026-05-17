<purpose>
Generate a creative kit for affiliate partners including approved messaging, banner specs,
email swipes, and tracking requirements. Uses affiliate playbook constraints for quality.
Single-pass analysis workflow per D-07.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/playbooks/affiliate.md
</required_reading>

<constraints>
## POSITIONING.md is READ-ONLY

**Do NOT modify `.taketomarket/POSITIONING.md` during this workflow.**

POSITIONING.md is an architectural invariant. If you detect positioning drift:
- Flag the issue and recommend running /ttm-positioning-check

Only /ttm-positioning-shift and /ttm-init may modify POSITIONING.md.
</constraints>

<process>

## Text-Mode Detection

**Text mode (`--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS`
or if the runtime is not Claude Code. When TEXT_MODE is active, replace every
`AskUserQuestion` call with a plain-text numbered list.

Detection:
```bash
if echo "$ARGUMENTS" | grep -q -- '--text'; then TEXT_MODE=true; fi
```

If `AskUserQuestion` tool is not available in the current runtime, set `TEXT_MODE=true`.

---

## Step 1: Load Context

```
takeToMarket > LOADING CONTEXT FOR AFFILIATE KIT
```

**Tier 1 summaries** (lines 1 to `<!-- END_SUMMARY -->`) from all 9 `.taketomarket/` reference files.
**Tier 2 (full):** `.taketomarket/POSITIONING.md`, `.taketomarket/BRAND.md`, `.taketomarket/ICP.md`, `.taketomarket/METRICS.md`
**Playbook gates:** @${CLAUDE_PLUGIN_ROOT}/playbooks/affiliate.md

If `.taketomarket/POSITIONING.md` does not exist: Error and exit.

---

## Step 2: Gather Kit Parameters

Ask the user:
1. "What product/offer is this affiliate kit for?"
2. "Commission structure? (percentage, flat fee, tiered)"
3. "Cookie/attribution window? (e.g., 30 days, 90 days)"
4. "Landing page URL for affiliates to link to?"
5. "Target affiliate types? (content creators, email marketers, comparison sites, coupon sites)"

Store responses as `PRODUCT_NAME`, `COMMISSION`, `COOKIE_WINDOW`, `LANDING_URL`, `AFFILIATE_TYPES`.

---

## Step 3: Generate Creative Kit

```
takeToMarket > GENERATING AFFILIATE CREATIVE KIT
```

Produce a complete kit with these sections:

### Approved Messaging
- 3 headline variations aligned with POSITIONING.md differentiator
- 3 description variations using BRAND.md voice
- Approved claims list from BRAND.md proof points only
- Banned claims/language from BRAND.md banned words + POSITIONING.md must-not-say

### Email Swipes
- 3 email templates (short/medium/long) targeting ICP pain points
- Subject line options per template (30-60 chars, no spam triggers per email playbook)
- FTC affiliate disclosure included in each template

### Banner Specs
- Recommended sizes: 300x250, 728x90, 160x600 (per affiliate playbook format rules)
- Brand color codes and logo usage from BRAND.md
- Max 20% text area, visible CTA, product name

### Tracking Requirements
- UTM format: `utm_source=affiliate&utm_medium=[affiliate-name]&utm_campaign=[campaign-slug]`
- Cookie window: ${COOKIE_WINDOW}
- Attribution model from METRICS.md (first-touch or last-touch)
- Commission structure: ${COMMISSION}
- Payout terms (schedule, minimum threshold, payment method)

### Compliance Rules
- FTC disclosure template: "This post contains affiliate links. I may earn a commission if you make a purchase."
- Prohibited promotion methods (spam, misleading claims, trademark bidding)
- Brand usage guidelines from BRAND.md
- No income or results guarantees

---

## Step 4: Write Kit File

Generate a URL-safe slug from `PRODUCT_NAME`.
Write to `.taketomarket/AFFILIATE-KIT-[product-slug].md`.

Kit file structure:
```markdown
# Affiliate Creative Kit: [Product Name]
Generated: [date]
Commission: [structure]
Cookie Window: [duration]

## Approved Messaging
[headlines, descriptions, claims, banned language]

## Email Swipes
[3 templates with subject lines]

## Banner Specs
[sizes, brand guidelines, requirements]

## Tracking Requirements
[UTM format, attribution, commission, payouts]

## Compliance Rules
[FTC disclosure, prohibited methods, brand guidelines]
```

---

## Step 5: Completion

```
========================================
takeToMarket > AFFILIATE KIT COMPLETE
========================================
Product: ${PRODUCT_NAME} | Sections: 5 | File: .taketomarket/AFFILIATE-KIT-[slug].md
```

Display summary of kit contents and confirm file location.

---

## Step 6: Final humanization (MANDATORY)

Every external kit asset (partner email templates, kit copy, promotional snippets, etc.) MUST pass through `/ttm-humanize` before write.

For each draft asset produced in this phase:
1. Invoke `/ttm-humanize <draft-path>` via the Skill tool.
2. Wait for the rewritten version.
3. Write the humanized output to the final asset destination.
4. Do not write the un-humanized draft.

Internal state files (campaign briefs, manifests, STATE.md) are exempt.

</process>

<success_criteria>
- [ ] All 5 sections generated (Approved Messaging, Email Swipes, Banner Specs, Tracking Requirements, Compliance Rules)
- [ ] Approved claims and banned-language lists sourced from BRAND.md + POSITIONING.md
- [ ] FTC disclosure included in every email swipe template
- [ ] UTM format and attribution model present in tracking section
- [ ] Kit file written to .taketomarket/AFFILIATE-KIT-[product-slug].md
- [ ] Each external kit asset (partner emails, kit copy, snippets) passed through /ttm-humanize before write.
</success_criteria>
