# Expose the deployed commit in a kogen-build meta

Slug: kogen-dev-build-meta-one-build
Model: not applicable — one build-time template value with no state or interacting rules.
Acceptance:
- .kogen/intents/kogen-dev-build-meta-one-build/acceptance.feature
- features/steps/kogen-dev-build-meta-one-build__site.js

Every page rendered through `src/layouts/Base.astro` carries one meta tag named `kogen-build` whose content is the environment variable `CF_PAGES_COMMIT_SHA` read at build time (the full 40-character commit Cloudflare Pages builds), so the deploy watcher can tell which commit is live. When the variable is unset or empty the content is the word `local`; it never prints `undefined` and a missing variable never throws.

Scope: only `src/layouts/Base.astro`. The tag sits inside head on the line directly after the line holding the viewport meta, which requires splitting the single long head line of Base.astro at that point (the Get started, Learn, Notes, Announcements and Origins pages all use it). No other page, Pages Function, Cloudflare setting, doc or README change; no other markup, text or style change, no emoji; the build keeps succeeding. The acceptance feature and its step file are the one test file the request allows.

## Decisions
- The tag is `<meta name="kogen-build" content={...}/>` on its own line directly after the viewport meta line; the viewport meta stays at the end of its line and the `<title>` follows on the next line, so no other tag changes. (decision: D1, round 1) (evidence: src/layouts/Base.astro) (source: request)
- The value is read with `process.env.CF_PAGES_COMMIT_SHA` in the Base.astro frontmatter with a fallback that also applies to an empty string (for example `||`, not `??`), giving `local`. (decision: D2, round 1) (evidence: src/layouts/Base.astro; package.json) (source: request)
- Acceptance builds once by reading `scripts.build` from package.json and running that command with `sh -c` (not npm run), with node_modules/.bin on PATH and CF_PAGES_COMMIT_SHA set to forty letters a. (decision: D3, round 1) (evidence: package.json) (source: request)
- The site header is the whole header element that Base.astro writes (the header element with its main navigation), read from Base.astro by the check. The set of checked html files is every html file under dist that contains that site header; no other marker narrows it and no page list replaces it. src/pages/404.astro writes its own header without the navigation and is not rendered through Base.astro, so it does not contain the site header and is not in the set. The set includes dist/index.html and dist/get-started/index.html, and also dist/learn/index.html, dist/notes/index.html, dist/announcements/index.html and dist/origins/index.html. (decision: D4, round 1) (evidence: src/layouts/Base.astro; src/pages/404.astro; astro.config.mjs) (source: request)
- Every html file under dist/ that contains the site header contains exactly one meta tag named kogen-build whose content is those forty letters. (decision: D5, round 1) (source: request)
- The static check evaluates the tag's content expression (resolving a single frontmatter const it names) for unset, empty and set values rather than matching one spelling. (decision: D6, round 1) (assumption: the content expression is a single-line JavaScript expression or a single-line const that uses process.env) (source: request)
- controls.json is deferred because of the shaping time budget. (decision: D7, round 1) (assumption: The request says nothing about controls.json or a shaping time budget, and no assumption marker is recorded.) (source: request)

## Source comparison
- kogen-build tag with CF_PAGES_COMMIT_SHA, local fallback, exactly once on every Base.astro page, placed after the viewport meta: addressed by both scenarios.
- Checked set includes dist/index.html and dist/get-started/index.html plus the Learn, Notes, Announcements and Origins index pages: addressed by the build scenario.
- No other markup, text or style change and a successful build: protected by the existing build and tests; not acceptance scenarios, per the request.
- Superseded: nothing is removed.

## Tests
- The built site has the tag once, with the commit, on every page with the site header: the build scenario (scenario)
- Base.astro has the tag directly after the viewport meta with a fallback to local for unset and empty values: the static scenario (scenario)

## Feasibility
- none
