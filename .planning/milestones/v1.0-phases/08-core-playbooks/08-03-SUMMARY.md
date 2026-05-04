---
phase: 08-core-playbooks
plan: 03
subsystem: playbooks
tags: [playbook, email, linkedin, social, discipline-gates, deliverability, dns]

# Dependency graph
requires:
  - phase: 08-core-playbooks
    plan: 01
    provides: Base playbook inheritance contract (playbooks/base.md) with 7-section structure
provides:
  - Email discipline playbook with 7 gates including DNS deliverability (DISC-EMAIL-01 through DISC-EMAIL-07)
  - LinkedIn discipline playbook with 4 gates (DISC-LI-01 through DISC-LI-04)
  - Social discipline playbook with 4 gates and platform subsections (DISC-SOC-01 through DISC-SOC-04)
affects: [workflows/lifecycle/verify.md, workflows/lifecycle/produce.md]

# Tech tracking
tech-stack:
  added: []
  patterns: [DNS deliverability gate via dig commands, platform-specific subsections in social playbook, GATE-07 tier override for email compliance]

key-files:
  created: [playbooks/email.md, playbooks/linkedin.md, playbooks/social.md]
  modified: []

key-decisions:
  - "Email playbook includes 7 gates (not 6 from research) per D-11 DNS deliverability requirement with SPF/DKIM/DMARC checks via dig commands"
  - "Email GATE-07 override from Tier 2 to Tier 1 for legal compliance enforcement"
  - "Social playbook uses platform-specific subsections throughout (not just Format Rules) for X/Twitter, Instagram, and Facebook"

patterns-established:
  - "DNS verification pattern: DISC-EMAIL-07 uses dig TXT commands for SPF, DKIM selector, and DMARC record checks"
  - "Platform subsection pattern: social playbook has ### X/Twitter, ### Instagram, ### Facebook subsections in Production Guidance, Format Rules, and Metrics"
  - "No-rhetorical-questions enforcement: DISC-SOC-03 criterion 1 checks X/Twitter posts for rhetorical questions"

requirements-completed: [PLAY-05, PLAY-06, PLAY-07]

# Metrics
duration: 6min
completed: 2026-04-29
---

# Phase 8 Plan 03: Email, LinkedIn, and Social Discipline Playbooks Summary

**Email playbook with 7 gates including DNS-based SPF/DKIM/DMARC deliverability checks, LinkedIn playbook with hook quality and native content enforcement, Social playbook with platform-specific gates for X/Twitter, Instagram, and Facebook**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-29T07:17:42Z
- **Completed:** 2026-04-29T07:24:03Z
- **Tasks:** 3
- **Files created:** 3

## Accomplishments

- Created playbooks/email.md with 7 discipline gates (DISC-EMAIL-01 through DISC-EMAIL-07) covering spam scan, dark mode rendering, unsubscribe presence, content-to-image ratio, subject line length, single CTA, and DNS deliverability with SPF/DKIM/DMARC dig commands per D-11
- Created playbooks/linkedin.md with 4 discipline gates (DISC-LI-01 through DISC-LI-04) enforcing no-"I" opener hook quality, native content format (no external links in body), engagement path design, and character/format limits
- Created playbooks/social.md with 4 discipline gates (DISC-SOC-01 through DISC-SOC-04) with platform-specific subsections for X/Twitter, Instagram, and Facebook, including X no-rhetorical-questions enforcement
- Email playbook overrides GATE-07 (Compliance) from Tier 2 to Tier 1 for CAN-SPAM/GDPR legal compliance
- All 3 playbooks follow the 7-section structure from base.md and stay under 500 lines

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Email discipline playbook** - `4b3be86` (feat)
2. **Task 2: Create LinkedIn discipline playbook** - `d6d4afd` (feat)
3. **Task 3: Create Social discipline playbook** - `f539230` (feat)

## Files Created/Modified

- `playbooks/email.md` - Email discipline playbook with 7 gates, GATE-07 override to Tier 1, DNS deliverability gate with SPF/DKIM/DMARC dig commands (306 lines)
- `playbooks/linkedin.md` - LinkedIn discipline playbook with 4 gates, no-"I" opener enforcement, native content requirement, link-in-comments strategy (263 lines)
- `playbooks/social.md` - Social discipline playbook with 4 gates, platform-specific subsections for X/Twitter/Instagram/Facebook, rhetorical question enforcement (305 lines)

## Decisions Made

- Email playbook has 7 gates (DISC-EMAIL-01 through DISC-EMAIL-07) including DNS deliverability per D-11, expanding beyond the 6 gates in initial research to include automated SPF/DKIM/DMARC verification via dig commands
- GATE-07 (Compliance) overridden to Tier 1 in email playbook because CAN-SPAM and GDPR compliance is a legal requirement, not an advisory recommendation
- Social playbook uses platform-specific subsections throughout the entire playbook (Production Guidance, Format Rules, Metrics) rather than only in the Discipline Gates section

## Deviations from Plan

None -- plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- All 3 discipline playbooks ready to be loaded by the produce workflow (Step 4: Resolve Playbooks)
- All discipline gates parseable by the verify workflow (Step 4b: Evaluate Discipline Gates)
- Email DNS deliverability gate (DISC-EMAIL-07) requires the campaign brief to specify the sending domain and ESP for dig command execution at verify time
- Combined with SEO and AEO playbooks from plan 08-02, 5 of 5 core discipline playbooks will be complete

## Self-Check: PASSED

- FOUND: playbooks/email.md (306 lines, 7 gates)
- FOUND: playbooks/linkedin.md (263 lines, 4 gates)
- FOUND: playbooks/social.md (305 lines, 4 gates)
- FOUND: commit 4b3be86 (email playbook)
- FOUND: commit d6d4afd (linkedin playbook)
- FOUND: commit f539230 (social playbook)
- All 3 files have 7 required sections each
- All 3 files under 500 lines

---
*Phase: 08-core-playbooks*
*Completed: 2026-04-29*
