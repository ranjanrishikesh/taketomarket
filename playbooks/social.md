---
discipline: social
asset_types: [tweet, instagram-post, instagram-carousel, instagram-reel-caption, facebook-post, facebook-ad-copy]
version: "1.0"
---

# Social Playbook

## Production Guidance

Social media is not one channel -- it is three distinct platforms with different algorithms, audiences, and content rules. This playbook covers X/Twitter, Instagram, and Facebook. Every post must be written for a specific platform, not adapted from a generic template. Copy-pasting the same content across platforms is an anti-pattern that violates native format rules on every platform.

### General Social Principles

- **Native format preference:** Each platform rewards native content (text, image, video created for that platform) over link posts. Link-only posts get suppressed across all three platforms.
- **Platform voice:** Adapt tone per platform while maintaining brand voice from BRAND.md. X is concise and direct. Instagram is visual-first with descriptive captions. Facebook allows longer narrative and community engagement.
- **One idea per post:** Social posts succeed by delivering one clear point, not summarizing multiple ideas. If the idea is complex, break it into a thread (X) or carousel (Instagram).

### X/Twitter Production Rules

- Maximum value in minimum words. Target under 200 characters for highest engagement even though the limit is 280.
- **No rhetorical questions.** The X algorithm deprioritizes posts with rhetorical questions (questions that do not expect an answer). Use statements, data points, or direct challenges instead. Questions that genuinely invite a response are acceptable.
- Thread-first for longer content: if the idea needs more than 280 characters, write as a thread with each tweet standalone-valuable. Number tweets in threads longer than 3 posts.
- URLs count as 23 characters regardless of actual length (X's t.co link wrapping).
- Hashtags: 1-3 maximum, integrated naturally or at end. More than 3 looks spammy on X.

### Instagram Production Rules

- **Visual-first:** The image or carousel IS the content. The caption supports and extends the visual, not the other way around. Do not write a caption that makes sense without seeing the image.
- **Carousel structure:** 1:1 (feed-optimized) or 4:5 (maximum vertical space) ratio. Maximum 10 slides. Cover slide must have a hook. Content slides should have one point each. Closing slide should have a CTA.
- **Caption structure:** Hook in first line (before "more" truncation at ~125 characters), value in body, CTA and hashtags at end.
- **Hashtags:** 5-15 relevant hashtags, placed at the end of caption or in the first comment. Mix of broad and niche tags.
- **Reel captions:** Under 150 characters for visibility -- reels have less caption real estate.
- If a CTA needs a link, reference "link in bio" -- Instagram does not allow clickable links in post captions.

### Facebook Production Rules

- **Text before media:** Facebook shows text above images/videos. Lead with the hook in the first sentence -- do not let an image speak for itself.
- **Longer narrative acceptable:** 100-500 words perform well on Facebook. The first 100 words are visible before the "See more" truncation.
- **Community engagement:** Ask questions, run polls, invite shares. Facebook's algorithm weights shares and meaningful comments over reactions.
- **Hashtags: minimal.** 0-2 hashtags maximum. Facebook hashtags have minimal discovery benefit and look out of place in the feed.
- **Video preference:** Native video (uploaded directly, not linked from YouTube) gets significantly more reach. Square (1:1) or vertical (4:5) formats preferred in feed.

---

## Discipline Gates

### DISC-SOC-01: Platform Character Limits -- Tier 1

**Checks:** Content length against platform-specific maximums
**Against:** Platform specifications for the target platform

#### Evaluation Criteria

1. **X/Twitter limit**
   - PASS: Post is under 280 characters with URLs counted as 23 characters each
   - WARN: Post is 260-280 characters (functional but no room for retweet commentary or quote-tweet additions)
   - FAIL: Post exceeds 280 characters (will not publish)
   - N/A: Asset is not targeting X/Twitter

2. **Instagram caption limit**
   - PASS: Caption is under 2,200 characters
   - WARN: Caption is 2,000-2,200 characters (approaching limit, may need trimming)
   - FAIL: Caption exceeds 2,200 characters (will be truncated by platform)
   - N/A: Asset is not targeting Instagram

3. **Facebook limit**
   - PASS: Post is under 1,500 characters with key message in first 100 words (visible before truncation)
   - WARN: Post is 1,500-2,000 characters (long but functional; key message should be front-loaded)
   - FAIL: Post exceeds 2,000 characters or key message is buried after the first 200 words
   - N/A: Asset is not targeting Facebook

### DISC-SOC-02: Native Format Preference -- Tier 2

**Checks:** Content formatted for native platform consumption
**Against:** Platform best practices for native content

#### Evaluation Criteria

1. **Format appropriateness**
   - PASS: Content uses native format -- X: text, image, or thread; Instagram: image, carousel, or reel; Facebook: text+image, native video, or poll
   - WARN: Link-based post but with substantial native text that delivers value independently of the link
   - FAIL: Link-only post with no native content -- just a URL or "Check this out: [link]" with no additional context

2. **Media format**
   - PASS: Images or video in platform-preferred ratios (Instagram: 1:1 or 4:5; Facebook: 1.91:1 for link previews, 1:1 or 4:5 for native; X: 16:9 or 1:1)
   - WARN: Media present but uses non-standard ratio (will display with cropping or letterboxing)
   - FAIL: N/A -- media is optional on some platforms. Only FAIL if media is present but severely wrong format (e.g., portrait video in a landscape container, or image so distorted it hurts readability)

### DISC-SOC-03: Platform-Specific Rules -- Tier 1

**Checks:** Platform-specific content rules that affect reach and engagement
**Against:** Current platform algorithm guidelines

#### Evaluation Criteria

1. **X/Twitter rhetorical questions**
   - PASS: No rhetorical questions -- post uses statements, data points, or direct challenges
   - WARN: Question present but phrased as a genuine request for response (e.g., "What tool do you use for email automation?" -- expects real answers)
   - FAIL: Rhetorical question that does not expect an answer (e.g., "Don't you hate when...?", "Who else thinks...?", "Isn't it crazy that...?")
   - N/A: Asset is not targeting X/Twitter

2. **Instagram carousel structure**
   - PASS: Carousel has a cover slide with a hook, content slides with one key point each, and a closing CTA slide
   - WARN: Carousel present but missing clear structure (e.g., no cover hook, or CTA buried mid-carousel)
   - FAIL: Carousel with walls of text per slide, or slides with no narrative flow (random order would not change meaning)
   - N/A: Asset is not an Instagram carousel

3. **Facebook text-before-media**
   - PASS: Text appears above any image or video with a hook in the first sentence
   - WARN: Text present but hook is weak or buried after generic opening
   - FAIL: Image or video posted with no text or minimal text (under 20 characters)
   - N/A: Asset is not targeting Facebook

### DISC-SOC-04: Hashtag and Mention Hygiene -- Tier 2

**Checks:** Platform-appropriate hashtag and mention usage
**Against:** Platform-specific engagement data and best practices

#### Evaluation Criteria

1. **Hashtag count**
   - PASS: X/Twitter 1-3 hashtags; Instagram 5-15 hashtags; Facebook 0-2 hashtags
   - WARN: Slightly above or below optimal range per platform (e.g., X with 4 hashtags, Instagram with 3-4 or 16-20, Facebook with 3)
   - FAIL: X 5+ hashtags; Instagram 25+ hashtags; Facebook 5+ hashtags
   - N/A: Platform does not benefit from hashtags or post intentionally omits them with documented reason

2. **Mention accounting**
   - PASS: Mentions are relevant to the content, and character count including mentions stays within platform limits
   - WARN: Mentions present and character limit is tight -- removing a mention would improve readability
   - FAIL: Mentions push content over the platform character limit, or mentions are irrelevant tag-spam

---

## Base Gate Overrides

None -- all base gates keep default tiers.

---

## Format Rules

Platform-specific formatting enforced during production:

### X/Twitter

- **Character limit:** 280 (URLs count as 23 characters regardless of actual length)
- **Hashtags:** 1-3, integrated naturally in text or placed at end
- **Thread posts:** Each tweet standalone-valuable, numbered if thread exceeds 3 tweets
- **Media:** 16:9 or 1:1 images, 4 images maximum per tweet
- **No rhetorical questions:** Use statements or genuine questions only
- **Quote tweets:** Under 200 characters to leave room for the quoted content

### Instagram

- **Caption limit:** 2,200 characters
- **Carousel:** 1:1 or 4:5 ratio, maximum 10 slides, cover slide with hook, closing slide with CTA
- **Hashtags:** 5-15, placed at end of caption or in first comment
- **Bio link reference:** If CTA needs a link, reference "link in bio" -- no clickable links in captions
- **Reel caption:** Under 150 characters for visibility
- **Image minimum resolution:** 1080x1080 (1:1) or 1080x1350 (4:5)

### Facebook

- **Post limit:** Practical limit 1,500 characters (first 100 words visible before "See more" truncation)
- **Link preview:** 1.91:1 image ratio for link card previews
- **Hashtags:** 0-2 maximum (Facebook hashtags have minimal discovery benefit)
- **Video:** Square (1:1) or vertical (4:5) preferred in feed; native upload only (no YouTube links)
- **Text before media:** Always include text above images or videos
- **Polls:** Use native poll feature for engagement; keep options to 2-4 choices

---

## Examples

### Good: Native X/Twitter Thread

```
Tweet 1 (178 chars):
We analyzed 2,000 B2B tweets from last quarter.

The ones that got 10x more engagement had one thing in common:

They made a claim in the first sentence. Not a question.

Thread:

Tweet 2:
Here's the data:

- Claim-first tweets: 4.2% engagement rate
- Question-first tweets: 0.8% engagement rate
- Link-first tweets: 0.3% engagement rate

The algorithm rewards conviction.

Tweet 3:
The best-performing claim format:

"[Specific number] + [counterintuitive insight]"

Example: "83% of B2B buyers make their decision before talking to sales."

Not: "Did you know most buyers decide early?"

#B2B #ContentStrategy
```

**Why it works:** Opens with data (not a question), each tweet stands alone, no external links, 2 hashtags on final tweet only, rhetorical-question-free.

### Good: Instagram Carousel with Structure

```
[Slide 1 - Cover/Hook]: "The 5-metric dashboard that replaced our 47-metric report"
[Slide 2]: Metric 1 -- Revenue per campaign (not total revenue)
[Slide 3]: Metric 2 -- CAC by channel (not blended CAC)
[Slide 4]: Metric 3 -- Pipeline velocity (not pipeline value)
[Slide 5]: Metric 4 -- Content-to-conversion ratio
[Slide 6]: Metric 5 -- Customer expansion rate
[Slide 7 - CTA]: "Save this for your next dashboard review. Follow @brand for more."

Caption (412 chars):
We deleted 42 metrics from our marketing dashboard last month.

Not because they weren't important.
Because they weren't actionable.

Here are the 5 metrics we kept -- and why each one drives a specific decision.

Swipe through to see the full breakdown.

Which metric would you add to this list? Drop it in the comments.

#MarketingMetrics #B2BMarketing #DataDriven #MarketingDashboard #GrowthMarketing
```

**Why it works:** Cover slide has hook, one point per slide, CTA on final slide, caption has hook before truncation, 5 hashtags, engagement question.

### Bad: Rhetorical Question on X/Twitter

```
Don't you just HATE it when your marketing metrics don't make sense?

We've all been there. Check out our new guide to fix it: https://example.com/guide

#Marketing #Metrics #Guide #Data #Analytics #B2B #Growth #Strategy
```

**Why it fails:** DISC-SOC-03 FAIL (rhetorical question "Don't you just HATE..."), DISC-SOC-02 WARN (link-based post), DISC-SOC-04 FAIL (8 hashtags on X).

### Bad: Link-Only Facebook Post

```
https://example.com/blog/new-post

[Auto-generated link preview with generic image]
```

**Why it fails:** DISC-SOC-02 FAIL (link-only, no native content), DISC-SOC-03 FAIL (no text before media/link).

---

## Anti-Patterns

1. **Rhetorical questions on X/Twitter:** The algorithm deprioritizes posts with questions that do not expect genuine answers. "Who else thinks...?" and "Don't you hate when...?" get lower distribution than direct statements or genuine questions.

2. **Link-only posts across all platforms:** Posting a bare URL with no native content gets suppressed on every major platform. Always provide standalone value in the post text itself.

3. **Same content copy-pasted across platforms:** Each platform has different character limits, audience expectations, hashtag norms, and content formats. A tweet is not a Facebook post is not an Instagram caption. Write platform-native content for each.

4. **Excessive hashtags:** 25+ hashtags on Instagram looks spammy, 5+ on X is excessive, and any hashtags on Facebook have minimal value. Stay within platform-optimal ranges.

5. **Instagram carousel with walls of text:** Each carousel slide should have one key point, not a paragraph. If you need more text, use the caption. Slides are visual -- treat them like presentation slides, not blog pages.

6. **Facebook posts with no text before media:** Posting an image or video with no text (or just an emoji) wastes the text space that Facebook displays prominently above media. Always lead with a text hook.

---

## Metrics

What to measure post-ship per platform:

### X/Twitter
- **Impressions:** How many times the tweet appeared in feeds
- **Engagements:** Likes, retweets, quote tweets, replies combined
- **Repost rate:** Retweets + quote tweets / impressions -- indicates content worth sharing
- **Link clicks:** If link in reply strategy used, track clicks via UTM parameters

### Instagram
- **Reach:** Unique accounts that saw the post (more meaningful than impressions for Instagram)
- **Saves:** The strongest content quality signal on Instagram -- saved posts indicate reference-worthy content
- **Carousel completion rate:** What percentage of viewers reached the last slide? Below 40% suggests weak slide structure
- **Profile visits:** Did the post drive curiosity about the brand? Track within 48 hours of posting

### Facebook
- **Reach:** Organic reach per post (Facebook's most throttled metric -- track trends, not absolutes)
- **Engagement rate:** (Reactions + comments + shares) / reach
- **Shares:** The highest-value engagement on Facebook -- shares drive exponential reach
- **Link clicks:** If post includes a link, track CTR via UTM parameters

### Cross-Platform
- **Sentiment:** Are replies positive, negative, or neutral? Track qualitative patterns across platforms
- **Reply quality:** Meaningful replies (2+ sentences, on-topic) vs. emoji-only reactions
- **Follower growth rate:** Net new followers within 48 hours of posting, per platform
- **Content-to-platform fit score:** Which platforms generate the highest engagement for which content types? Track to optimize channel allocation
