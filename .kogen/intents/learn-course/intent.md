# Add the Learn page

Slug: learn-course
Model: not applicable — the change is static page content, one navigation link and one build-time sitemap entry; there is no meaningful state or interacting rules.
Acceptance:
- .kogen/intents/learn-course/acceptance.feature
- features/steps/learn-course__site.js

Publish the approved `/learn/` page on the Kogen website. The page introduces Vibe Coding for Adults, Almir Sarajčić’s practical course on building real applications with coding agents, and links to https://vibecodingforadults.com/. The approved local preview is reproduced exactly in three files and nothing else in the site changes:

- `src/pages/learn.astro` is a new page that uses the existing `Base` layout with title `Learn — Kogen` and description `Build and ship real applications with coding agents in Vibe Coding for Adults, a practical course by Almir Sarajčić.` Its `<main id="main" class="wrap">` holds one `<article class="prose">` with, in order: the eyebrow paragraph `Learn`; the h1 `Build and ship with coding agents.`; a lead paragraph; a paragraph starting `If you already use a coding agent`; the h2 `Build the platform behind the course` with two paragraphs; the h2 `Explore Vibe Coding for Adults` with one paragraph; and a `div.actions` holding the single link `a.button` to https://vibecodingforadults.com/ labelled `Explore Vibe Coding for Adults` followed by `<span aria-hidden="true">↗</span>`. The exact markup and text are the built main element given in acceptance.feature.
- `src/layouts/Base.astro` adds one `Learn` link to `/learn/` to the main navigation, directly after `Get started` and before `How it works`. Because every page uses `Base`, the link appears on every page.
- `scripts/build-agent-content.py` adds `/learn/` to the list of paths it appends to `dist/sitemap.xml` when absent, placed before `/about/`, so the appended entries are `/learn/`, `/about/`, `/contact/`, `/privacy/`.

The page adds no pricing, current curriculum detail, lesson counts, schedules or checkout copy. The existing layout, other navigation items, other pages and their metadata, `src/pages/sitemap.xml.ts`, styles and the generated Markdown for other pages are unchanged. The existing build generates `dist/learn.md` and `dist/agent-content/learn.md` from the built HTML with no further change.

## Decisions
- The page copy, markup, title and description are exactly those of the approved candidate `learn.astro`; no wording is added or changed. (decision: D1, round 1) (constraint: no pricing, curriculum detail, lesson counts, schedules or checkout copy) (evidence: src/layouts/Base.astro; src/layouts/Information.astro) (source: request)
- The Learn navigation link is added in `Base.astro` in the second position, so it appears in the main navigation of every page. (decision: D2, round 1) (constraint: other navigation links keep their text, order and targets) (evidence: src/layouts/Base.astro) (source: request)
- The sitemap entry is added only by extending the path list in `scripts/build-agent-content.py`; `src/pages/sitemap.xml.ts` is not edited. (decision: D3, round 1) (constraint: appended order is /learn/, /about/, /contact/, /privacy/ after the existing entries) (evidence: scripts/build-agent-content.py; src/pages/sitemap.xml.ts) (source: request)
- Generated Markdown is verified from the normal build output and gets no change to the Markdown generator beyond the sitemap list. (decision: D4, round 1) (evidence: scripts/build-agent-content.py; agent-site.json; src/components/AgentMetadata.astro) (source: request)
- Acceptance runs the real production build (the Astro build followed by `scripts/build-agent-content.py`, the two commands the `build` script in package.json chains) once, after deleting the git-ignored `dist/`, and inspects the files in `dist/`. (decision: D5, round 1) (evidence: package.json; .gitignore) (source: request)
- The absence of commercial and curriculum detail is checked as an absence of the words price, pricing, $, lesson, schedule, checkout and curriculum in the generated `dist/learn.md`. (decision: D6, round 1) (assumption: these words are an adequate proxy for pricing, curriculum detail, lesson counts, schedules and checkout copy) (source: request)

## Source comparison
- Approved candidate `learn.astro` (new page, copy, link to https://vibecodingforadults.com/): addressed exactly by the main-element, link, metadata and Markdown scenarios.
- Approved candidate `Base.astro`: the only difference from the current file is the `<a href="/learn/">Learn</a>` link after `Get started`; addressed by the navigation scenario.
- Approved candidate `build-agent-content.py`: the only difference from the current file is `'/learn/'` first in the appended sitemap path list; addressed by the sitemap scenario.
- Request exclusions (pricing, current curriculum detail, lesson counts, schedules, checkout copy): addressed by the absence scenario and the exact-copy scenarios.
- Request to preserve existing layout, navigation, metadata, sitemap and generated Markdown: addressed by the navigation order, other-page metadata, sitemap beginning and end, and Markdown existence scenarios.
- Superseded: nothing is removed or replaced.

## Tests
- The `/learn/` route, `learn.md` and `agent-content/learn.md` exist after the production build: the route scenario in acceptance.feature (scenario)
- The page content is exactly the approved copy and links only to https://vibecodingforadults.com/: the exact-main-element and call-to-action scenarios (scenario)
- The page has no pricing, curriculum, lesson-count, schedule or checkout copy: the absence scenario (scenario)
- The page has its own title, description, canonical, social and Markdown-alternate metadata and other pages keep theirs: the metadata scenarios (scenario)
- The main navigation shows `Learn` second on every Base page with the other links unchanged: the navigation scenario (scenario)
- The sitemap lists `/learn/` once, before about, contact and privacy, with existing entries unchanged: the sitemap scenarios (scenario)
- The generated Markdown for `/learn/` is exact and identical in both locations, and other pages' Markdown and llms.txt are still generated: the Markdown scenarios (scenario)

## Feasibility
- none
