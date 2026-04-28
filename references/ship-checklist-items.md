# Ship Checklist Items

Reference file for /ttm-ship workflow. Defines checklist items per channel type.
Ship workflow reads the campaign's channel mix and loads applicable sections.

Items are tagged [AI] (Claude can auto-check) or [HUMAN] (user must confirm).

## Universal (all campaigns)

- [AI] UTM parameters valid on all trackable links (format: ?utm_source=X&utm_medium=Y&utm_campaign=Z)
- [AI] All asset files exist and are non-empty (no draft markers like TODO, PLACEHOLDER, TBD)
- [AI] VERIFICATION.md shows overall_result of pass or accepted (no unresolved failures)
- [AI] All assets in MANIFEST.json have review_status of approved or ship-ready
- [HUMAN] Tracking/analytics configured for the campaign's outcome metric
- [HUMAN] Monitoring and alerts set up for the campaign measurement window
- [HUMAN] Team notified of launch timeline

## Blog / SEO (asset type: blog-post)

- [AI] Meta title present (frontmatter or first H1)
- [AI] Meta description present (frontmatter or first paragraph under 160 chars)
- [AI] H1 contains primary keyword or positioning anchor
- [AI] No orphaned internal links (links point to existing pages)
- [HUMAN] Schema markup deployed (Article, FAQPage, HowTo as applicable)
- [HUMAN] Internal links from existing pages to new content added
- [HUMAN] XML sitemap updated or auto-regeneration confirmed
- [HUMAN] Open Graph and Twitter Card meta tags set

## Email (asset type: email)

- [AI] Subject line under 60 characters
- [AI] Preview text under 90 characters
- [AI] Unsubscribe link present in content
- [AI] Physical mailing address present
- [AI] No spam trigger words in subject (FREE, URGENT, ACT NOW, etc.)
- [HUMAN] SPF/DKIM/DMARC records configured for sending domain
- [HUMAN] Dark mode rendering tested in Outlook, Gmail, Apple Mail
- [HUMAN] Test send completed to internal list
- [HUMAN] Send scheduled at optimal time for ICP timezone

## LinkedIn (asset type: linkedin-post)

- [AI] Post under 3000 characters
- [AI] Opening line does not start with "I" (per LinkedIn playbook best practice)
- [AI] No external URL in first line (triggers algorithm suppression)
- [HUMAN] Author profile has updated headline and about section
- [HUMAN] First comment with link prepared (if linking out)
- [HUMAN] Scheduling configured or publish time selected

## Social / Twitter/X (asset type: social-post, twitter-post)

- [AI] Post under 280 characters (Twitter/X) or platform-appropriate limit
- [AI] No rhetorical questions (poor engagement on Twitter/X)
- [AI] Hashtags limited to 2-3 maximum
- [HUMAN] Platform-specific image or video assets ready
- [HUMAN] Scheduling configured
- [HUMAN] Reply/engagement plan prepared for first 30 minutes

## Landing Page (asset type: landing-page)

- [AI] Primary CTA is clear and present above the fold
- [AI] Form fields match the brief's conversion goal
- [AI] UTM parameters captured in form submission
- [HUMAN] Page load time under 3 seconds
- [HUMAN] Mobile responsive layout verified
- [HUMAN] Thank-you/confirmation page configured
- [HUMAN] Conversion tracking pixel installed

## Video / YouTube (asset type: video, youtube-video)

- [AI] Title under 60 characters
- [AI] Description contains primary keyword in first 2 lines
- [AI] Timestamps present if video exceeds 5 minutes
- [HUMAN] Thumbnail uploaded (high contrast, readable text)
- [HUMAN] End screen CTA configured
- [HUMAN] Cards added at key moments
- [HUMAN] Captions/subtitles uploaded or auto-generated reviewed

## Paid Ads (asset type: paid-ad)

- [AI] Ad copy under platform character limits
- [AI] Headline and description present
- [AI] Display URL formatted correctly
- [HUMAN] Landing page matches ad message
- [HUMAN] Bid strategy configured
- [HUMAN] Audience targeting set per brief
- [HUMAN] Budget allocated and campaign scheduled

## Default (unknown asset type)

- [AI] Content is non-empty and contains no draft markers
- [AI] UTM links present if applicable
- [HUMAN] Distribution channel prepared
- [HUMAN] Tracking configured
