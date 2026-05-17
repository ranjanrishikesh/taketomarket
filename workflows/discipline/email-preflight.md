<purpose>
Pre-send deliverability, dark-mode compatibility, and spam-trigger scan for email content.
Evaluates against email playbook gate definitions and generates a go/no-go recommendation.
Single-pass analysis workflow per D-07.
</purpose>

<required_reading>
@${CLAUDE_PLUGIN_ROOT}/references/context-loading.md
@${CLAUDE_PLUGIN_ROOT}/playbooks/email.md
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
takeToMarket > LOADING CONTEXT FOR EMAIL PREFLIGHT
```

**Tier 1 summaries** (lines 1 to `<!-- END_SUMMARY -->`) from all 9 `.taketomarket/` reference files.
**Tier 2 (full):** `.taketomarket/BRAND.md` (voice/banned words check).
**Playbook gates:** @${CLAUDE_PLUGIN_ROOT}/playbooks/email.md

If `.taketomarket/POSITIONING.md` does not exist: Error and exit.

---

## Step 2: Get Email Content

Ask: "Paste your email content (subject line, preview text, and body). Include HTML if available."

Parse into: subject line, preview text, body content, and HTML structure (if provided).
If user provides a file path, read the file. If subject/preview are not clearly marked,
ask for clarification.

---

## Step 3: Run Email Preflight Checks

```
takeToMarket > RUNNING EMAIL PREFLIGHT CHECKS
```

Evaluate against 7 email discipline gates:

**1. Subject Line Spam Triggers (DISC-EMAIL-01)**
Check for: ALL CAPS words, excessive punctuation (!!!, ???), spam trigger phrases
(FREE, ACT NOW, LIMITED TIME, GUARANTEED, etc.), multiple formatting red flags.
- PASS: No spam triggers; clean formatting
- WARN: 1 borderline trigger with mitigating context
- FAIL: 2+ spam triggers, ALL CAPS subject, or excessive punctuation

**2. Preview Text Optimization (DISC-EMAIL-05)**
Preview text present, distinct from subject, 40-130 chars, compelling.
- PASS: Present, 40-130 chars, distinct from subject
- WARN: Present but too short/long or repeats subject
- FAIL: No preview text specified

**3. Dark Mode Compatibility (DISC-EMAIL-02)**
If HTML: check for dark-mode-safe colors, no hardcoded white backgrounds, image alt-text.
- PASS: No hard-coded light backgrounds; all images have alt text
- WARN: Background colors may render poorly in dark mode
- FAIL: White backgrounds without alternatives; image-dependent content

**4. Unsubscribe/Address (DISC-EMAIL-03)**
CAN-SPAM compliance: unsubscribe link and physical address present.
- PASS: Both unsubscribe link and physical address clearly present
- WARN: Present but buried or incomplete
- FAIL: Missing unsubscribe or physical address

**5. Content-to-Image Ratio (DISC-EMAIL-04)**
Text-to-image ratio at least 60:40, alt text on all images.
- PASS: Text dominant; fully readable without images
- WARN: Roughly equal text/image; core message survives without images
- FAIL: Image-heavy; image-only sections or missing alt text

**6. Deliverability Signals (DISC-EMAIL-07)**
Link count (<10 recommended), no URL shorteners, SPF/DKIM/DMARC reminder.
- PASS: <10 links, no shorteners, proper sending domain
- WARN: 10-15 links or minor deliverability concerns
- FAIL: Excessive links, URL shorteners, or unconfigured domain

**7. Brand Voice**
Check against BRAND.md tone guidelines and banned words list.
- PASS: Tone matches brand voice; no banned words
- WARN: Minor tone deviation but no banned words
- FAIL: Banned words present or tone contradicts brand

Per check: assign PASS / WARN / FAIL with evidence.

---

## Step 4: Generate Report

Determine verdict: **GO** (0 FAIL, <=2 WARN) | **CAUTION** (>2 WARN) | **NO-GO** (any FAIL)

```
========================================
takeToMarket > EMAIL PREFLIGHT REPORT
========================================
Subject: [subject line]
Date: [current date]
Overall: [GO / CAUTION / NO-GO]

| # | Check                  | Result | Detail                |
|---|------------------------|--------|-----------------------|
| 1 | Spam Triggers          | [P/W/F] | [detail]             |
| 2 | Preview Text           | [P/W/F] | [detail]             |
| 3 | Dark Mode              | [P/W/F] | [detail]             |
| 4 | Unsubscribe/Address    | [P/W/F] | [detail]             |
| 5 | Content-to-Image Ratio | [P/W/F] | [detail]             |
| 6 | Deliverability Signals | [P/W/F] | [detail]             |
| 7 | Brand Voice            | [P/W/F] | [detail]             |

ISSUES (WARN/FAIL fixes):
- [Check]: [Specific fix recommendation]

VERDICT: [GO / CAUTION / NO-GO]
- GO: 0 FAIL + <=2 WARN -- safe to send
- CAUTION: >2 WARN -- review recommended before sending
- NO-GO: any FAIL -- must fix before sending
```

</process>
