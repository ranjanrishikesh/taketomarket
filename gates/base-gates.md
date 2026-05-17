# Base Quality Gates

10 quality gates evaluated during `/ttm-verify`. Tier 1 gates are blocking (require user action on failure). Tier 2 gates are advisory (reported but no action required).

---

## Gate 1: Positioning Drift (GATE-01) -- Tier 1

**Checks:** Asset content alignment with approved positioning
**Against:** `.taketomarket/POSITIONING.md`

### Evaluation Criteria

1. **Primary differentiator alignment**
   - PASS: Asset restates or naturally extends the primary differentiator from POSITIONING.md
   - WARN: Asset partially overlaps but introduces claims not present in POSITIONING.md
   - FAIL: Asset uses a different differentiation claim entirely or contradicts the differentiator

2. **Proof point sourcing**
   - PASS: All claims in the asset are backed by proof points in POSITIONING.md proof point library
   - WARN: Asset includes claims that could be inferred from proof points but are not explicitly listed
   - FAIL: Asset makes claims with no matching proof point in POSITIONING.md

3. **Must-not-say compliance**
   - PASS: No must-not-say terms from POSITIONING.md found in asset
   - WARN: N/A (must-not-say is binary)
   - FAIL: One or more must-not-say terms detected in asset content

---

## Gate 2: Claim Accuracy (GATE-02) -- Tier 1

**Checks:** Factual and numeric claims against approved proof points
**Against:** `.taketomarket/BRAND.md` proof points section

### Evaluation Criteria

1. **Proof point coverage**
   - PASS: Every factual or numeric claim in the asset has a matching proof point in BRAND.md
   - WARN: Claim exists that is directionally supported but uses different numbers or phrasing
   - FAIL: Asset contains a factual or numeric claim with no corresponding proof point

2. **Source citation**
   - PASS: Proof points referenced in the asset cite their source (study, benchmark, customer data)
   - WARN: Proof points are used but source is implied rather than stated
   - FAIL: Claims are asserted without any source attribution where BRAND.md requires it

3. **Proof point currency**
   - PASS: All proof points used are current (not marked deprecated or expired in BRAND.md)
   - WARN: A proof point is approaching its review date
   - FAIL: Asset uses a proof point marked as deprecated or expired in BRAND.md

---

## Gate 3: Voice Drift (GATE-03) -- Tier 2

**Checks:** Tone, vocabulary, and register against brand voice definition
**Against:** `.taketomarket/BRAND.md` voice archetype and banned words list

### Evaluation Criteria

1. **Voice archetype match**
   - PASS: Asset tone matches the voice archetype defined in BRAND.md (e.g., "authoritative but approachable")
   - WARN: Tone is inconsistent -- some sections match the archetype while others diverge
   - FAIL: Asset tone fundamentally contradicts the voice archetype

2. **Banned words check**
   - PASS: No banned words from BRAND.md banned words list found in asset
   - WARN: N/A (banned words are binary)
   - FAIL: One or more banned words from BRAND.md detected in asset content

3. **Register consistency**
   - PASS: Language register is consistent throughout the asset (no sudden shifts from formal to casual)
   - WARN: Minor register shift detected (e.g., one informal phrase in otherwise formal content)
   - FAIL: Major register inconsistency -- asset reads as if written by two different voices

---

## Gate 4: Outcome Alignment (GATE-04) -- Tier 1

**Checks:** Whether the asset is designed to drive the campaign's stated outcome metric
**Against:** `.taketomarket/CAMPAIGNS/<slug>/BRIEF.md` outcome metric

### Evaluation Criteria

1. **Outcome connection**
   - PASS: Asset is clearly designed to drive the outcome metric defined in the brief
   - WARN: Asset may indirectly contribute to the outcome metric but the connection is not explicit
   - FAIL: Asset has no discernible connection to the outcome metric

2. **CTA-outcome alignment**
   - PASS: The asset's CTA or desired reader action directly serves the outcome metric
   - WARN: CTA is present but serves a tangential goal rather than the primary outcome
   - FAIL: CTA contradicts or is disconnected from the outcome metric entirely

---

## Gate 5: Funnel Integrity (GATE-05) -- Tier 2

**Checks:** CTA presence, destination, and conversion path logic
**Against:** `.taketomarket/CAMPAIGNS/<slug>/BRIEF.md` funnel/CTA section

### Evaluation Criteria

1. **CTA presence and specificity**
   - PASS: Asset has a clear, specific CTA (not vague "learn more" or "click here")
   - WARN: CTA is present but generic or weak
   - FAIL: No CTA found in an asset that requires one per the brief
   - N/A: Asset type does not require a CTA (purely informational content)

2. **CTA destination**
   - PASS: CTA destination URL or next step is defined and logical
   - WARN: CTA destination is defined but may not be live or accessible
   - FAIL: CTA has no defined destination -- dead end
   - N/A: Asset type does not require a CTA

3. **Conversion path logic**
   - PASS: Path from CTA to outcome is logical and unbroken (CTA -> landing page -> conversion)
   - WARN: Path exists but includes unnecessary friction or extra steps
   - FAIL: Conversion path has a dead end or logical gap
   - N/A: Asset type does not require a CTA

---

## Gate 6: UTM Hygiene (GATE-06) -- Tier 2

**Checks:** UTM parameter presence and naming convention compliance
**Against:** `.taketomarket/CHANNELS.md` UTM schema

### Evaluation Criteria

1. **UTM parameter presence**
   - PASS: All trackable links in the asset have UTM parameters (source, medium, campaign at minimum)
   - WARN: Some links have UTM parameters but others are missing them
   - FAIL: No UTM parameters on any trackable link
   - N/A: Asset contains no trackable links

2. **Naming convention compliance**
   - PASS: UTM source and medium values match the naming conventions defined in CHANNELS.md
   - WARN: UTM values are present but use non-standard naming (e.g., "LinkedIn" vs "linkedin")
   - FAIL: UTM values contradict CHANNELS.md conventions entirely
   - N/A: Asset contains no trackable links

3. **Campaign tag consistency**
   - PASS: UTM campaign tag matches the campaign slug
   - WARN: Campaign tag is present but uses a variant of the slug
   - FAIL: Campaign tag is missing or uses an unrelated identifier
   - N/A: Asset contains no trackable links

---

## Gate 7: Compliance (GATE-07) -- Tier 2

**Checks:** Regulatory requirements, disclaimers, and PII exposure
**Against:** Industry-standard requirements and channel regulations

### Evaluation Criteria

1. **Required disclaimers**
   - PASS: All required disclaimers are present (financial, health, affiliate, sponsorship)
   - WARN: Disclaimers are present but incomplete or improperly formatted
   - FAIL: Required disclaimers are missing entirely
   - N/A: Asset content does not trigger disclaimer requirements

2. **PII exposure**
   - PASS: No PII exposed in asset body copy (email addresses, phone numbers, personal names)
   - WARN: PII-like patterns detected but may be intentional (e.g., example email in tutorial)
   - FAIL: Actual PII exposed in asset content

3. **Opt-out mechanism**
   - PASS: Unsubscribe or opt-out mechanism referenced where applicable (email, SMS)
   - WARN: Opt-out reference is present but unclear or hard to find
   - FAIL: No opt-out mechanism in a channel that legally requires one
   - N/A: Channel does not require opt-out (blog post, social media)

---

## Gate 8: Competitor Collision (GATE-08) -- Tier 2

**Checks:** Unintended competitor promotion or positioning echo
**Against:** `.taketomarket/COMPETITORS.md`

### Evaluation Criteria

1. **Competitor brand name usage**
   - PASS: No competitor brand names used, or used only with substantiated comparative claims
   - WARN: Competitor mentioned without a direct comparison or substantiation
   - FAIL: Competitor brand name used in a way that promotes or elevates the competitor

2. **Positioning echo**
   - PASS: Asset framing and language are distinct from competitor positioning in COMPETITORS.md
   - WARN: Some phrasing overlaps with a competitor's known messaging
   - FAIL: Asset accidentally echoes a competitor's tagline, slogan, or core positioning claim

3. **Differentiation clarity**
   - PASS: Asset clearly differentiates from competitors rather than validating their approach
   - WARN: Asset is neutral -- does not differentiate but does not validate competitors either
   - FAIL: Asset inadvertently validates a competitor's approach or frames the market in their terms

---

## Gate 9: ICP Fit (GATE-09) -- Tier 2

**Checks:** Whether content speaks to the target ICP in their language
**Against:** `.taketomarket/ICP.md`

### Evaluation Criteria

1. **Pain point relevance**
   - PASS: Hook and core message address a pain point from ICP.md pains list
   - WARN: Content addresses a related pain but not one explicitly listed in ICP.md
   - FAIL: Content does not address any ICP pain point -- generic or unrelated audience

2. **Customer vocabulary**
   - PASS: Asset uses customer vocabulary from ICP.md language library, not internal jargon
   - WARN: Mix of customer vocabulary and internal jargon
   - FAIL: Asset is written in internal jargon that the ICP would not recognize or relate to

3. **Anti-ICP avoidance**
   - PASS: Content clearly addresses the target ICP segment, not the anti-ICP defined in ICP.md
   - WARN: Content is broad enough that it could attract the anti-ICP alongside the target
   - FAIL: Content is more likely to attract the anti-ICP than the target segment

---

## Gate 10: Format Correctness (GATE-10) -- Tier 2

**Checks:** Platform-specific format requirements and structural conventions
**Against:** Channel-specific rules (from playbook if loaded, otherwise general platform guidelines)

### Evaluation Criteria

1. **Character and word count**
   - PASS: Asset meets platform character/word limits (tweet < 280 chars, LinkedIn < 3000, email subject < 60)
   - WARN: Asset is within 10% of the limit
   - FAIL: Asset exceeds platform limits

2. **Required elements**
   - PASS: All required structural elements present (subject line for email, H1 for blog, hook for social)
   - WARN: Most required elements present but one is missing or weak
   - FAIL: Multiple required structural elements are missing

3. **Channel conventions**
   - PASS: Structure follows channel conventions (email has preview text, blog has meta description)
   - WARN: Structure mostly follows conventions with minor gaps
   - FAIL: Structure ignores channel conventions entirely

---

## Tier Classification (GATE-11)

| Gate | ID | Tier | Effect on Verification |
|------|----|------|----------------------|
| Positioning Drift | GATE-01 | Tier 1 (blocking) | User prompted for deviation action |
| Claim Accuracy | GATE-02 | Tier 1 (blocking) | User prompted for deviation action |
| Outcome Alignment | GATE-04 | Tier 1 (blocking) | User prompted for deviation action |
| Voice Drift | GATE-03 | Tier 2 (advisory) | Reported but no action required |
| Funnel Integrity | GATE-05 | Tier 2 (advisory) | Reported but no action required |
| UTM Hygiene | GATE-06 | Tier 2 (advisory) | Reported but no action required |
| Compliance | GATE-07 | Tier 2 (advisory) | Reported but no action required |
| Competitor Collision | GATE-08 | Tier 2 (advisory) | Reported but no action required |
| ICP Fit | GATE-09 | Tier 2 (advisory) | Reported but no action required |
| Format Correctness | GATE-10 | Tier 2 (advisory) | Reported but no action required |

**Tier 1:** Gate failure requires explicit user action (Correct, Accept+log, or Escalate per GATE-12).
**Tier 2:** Gate findings are reported as advisory. User may optionally act on them.
