# Learnings Extraction Guide

Reference file for /ttm-archive workflow. Provides structured instructions for extracting
compound learnings from a completed campaign before archival. Loaded via @-syntax to keep
the archive workflow under 500 lines.

## Extraction Structure

### What Worked

Scan the campaign artifacts for indicators of success:

- **Gate passes on first attempt:** Check STATE.md gate fields -- any gate with `pass` result AND verify.run_count = 1 indicates a strong pattern worth extracting.
- **High review scores:** Check REVIEW-FEEDBACK-*.md for "approved" or "ship-ready" without revision requests.
- **No fix loops:** If fix.run_count is null or 0, the campaign passed verification without needing fixes -- extract the approach that drove this.
- **Asset-level wins:** Check MANIFEST.json for assets with review_status = "approved" on first submission.

For each success, identify the specific pattern or approach that drove it (positioning angle, hook strategy, format choice, channel timing).

### What Didn't Work

Scan for indicators of failure or friction:

- **Gate failures:** Any gate field with `fail` result -- check VERIFICATION.md for the specific failure details and root cause.
- **Fix loops:** If fix.run_count > 0, the campaign needed corrections. Check FIX-BRIEF-*.md for what was wrong and what was changed.
- **Review rejections:** Check REVIEW-FEEDBACK-*.md for revision requests -- extract what the reviewer flagged and why.
- **Multiple verification runs:** If verify.run_count > 1, initial assets failed quality gates -- determine what was missed.

For each failure, categorize using the Root-Cause Taxonomy below and extract the lesson.

### Campaign-Level Decisions

Extract key strategic decisions made during the campaign for future reference:

- **Positioning anchor chosen:** Which specific positioning element from POSITIONING.md was the primary anchor? Did it resonate or need adjustment?
- **Channel mix rationale:** Why were the chosen channels selected? Was the rationale validated by results?
- **Hook strategy:** What hook approach was used (pain-point, curiosity, authority, social proof)? How did it perform?
- **ICP targeting:** Which ICP segment was targeted? Were there signals of fit or misfit?
- **Format decisions:** Why was the chosen format selected? Would a different format have worked better?

## Root-Cause Taxonomy

Every lesson extracted from a failed or underperforming element must be categorized into one of these root causes:

| Category | Description |
|----------|-------------|
| positioning-drift | Asset deviated from POSITIONING.md -- used competitor language, wrong value prop, or off-brand messaging |
| weak-hook | Opening failed to capture attention -- generic intro, no specific pain addressed, buried lede |
| wrong-channel | Content published on ineffective channel for target ICP or content type |
| bad-timing | Published at wrong time, wrong cadence, or conflicted with external events |
| unverifiable-claim | Claim lacked proof point, source, or measurable evidence |
| broken-funnel | CTA or conversion path was broken, misaligned, or missing |
| creative-fatigue | Repeated format or angle with diminishing returns -- audience saturation |

For successful elements, use category `success` with a description of what pattern drove the win.

## Output Format

Each extracted lesson must produce a table row for LEARNINGS.md:

```
| Date | Campaign | Category | Lesson | Action Taken |
```

Field definitions:

- **Date:** Archive date (today's ISO date, e.g., 2024-03-15)
- **Campaign:** Campaign slug (e.g., `spring-launch-2024`)
- **Category:** One of the root-cause taxonomy values above, or `success` for wins
- **Lesson:** One-sentence summary of what happened and why (be specific, not generic)
- **Action Taken:** Recommended or completed reference file update, or `none` if no systemic fix needed

Example rows:
```
| 2024-03-15 | spring-launch | success | Pain-point hook with specific dollar amount drove 3x click-through vs generic hooks | Updated BRAND.md hook guidelines |
| 2024-03-15 | spring-launch | weak-hook | Email subject line was generic "Check out our new feature" with 8% open rate | none -- one-off issue |
| 2024-03-15 | spring-launch | positioning-drift | Blog post used "best-in-class" (competitor language) instead of our differentiation | Added to POSITIONING.md anti-patterns |
```

## Artifact Scanning Guide

Read these files from the campaign directory to extract learnings:

| File | What to Extract |
|------|----------------|
| `STATE.md` (frontmatter) | Gate results (gate.* fields), fix counts (fix.run_count), phase timestamps, verify run count |
| `MANIFEST.json` | Per-asset results, review status, asset types produced |
| `BRIEF.md` | Original strategy, positioning anchor, target ICP, channel mix rationale |
| `VERIFICATION.md` | Gate check details, pass/fail specifics, deviation justifications |
| `FIX-BRIEF-*.md` | What failed, root cause analysis, fix applied |
| `REVIEW-FEEDBACK-*.md` | Human reviewer comments, approval/rejection reasons, revision requests |
| `ASSETS/` | Final asset content for qualitative assessment of what shipped |

Scan order: STATE.md first (quantitative summary), then VERIFICATION.md and FIX-BRIEF (failure details), then REVIEW-FEEDBACK (human signal), then BRIEF.md (strategy context).
