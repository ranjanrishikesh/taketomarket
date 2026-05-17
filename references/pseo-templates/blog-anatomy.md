# Blog Anatomy

Extends `references/pseo-page-anatomy.md`. Specific structure for blog posts under `/blog/[slug]`.

## Section structure
1. Hero with H1 (keyword-rich descriptive title).
2. TL;DR (2-3 sentences).
3. Author + date + tags.
4. Intro paragraph (hook + promise + scope).
5. Section H2s — typically 4-7 sections.
6. Code examples or visuals where applicable.
7. Conclusion with key takeaways (3-5 bullets).
8. FAQ section (4-6 questions).
9. Related posts (3-5 cards).

## URL pattern
`/blog/[slug]` — slug derived from H1 lowercased + hyphenated.

## Schema.org
- `Article` schema on page.
- `BreadcrumbList`.
- `FAQPage` on FAQ section.
- `Person` for author (links to author profile page).

## Length
- Default: 1200-2000 words.
- Short-form OK if topic warrants (e.g., changelog notes): 400-800.
- Long-form OK for definitive guides: 3000-5000.
