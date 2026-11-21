# Add a Providers page and name QwenCloud

Slug: providers-site-page
Model: not applicable — static page content, a data file and build-time checks; there is no meaningful state or interacting rules.
Acceptance:
- .kogen/intents/providers-site-page/acceptance.feature
- features/steps/providers-site-page__site.js

Get started gains a QwenCloud subsection under its OpenAI-compatible endpoints text, a new `/providers/` page compares every provider name the CLI accepts, and both Get started and llms.txt link to https://kogen.dev/providers/. The page offers its Markdown twin: the existing build-agent-content script already writes it to `dist/providers.md` and `dist/agent-content/providers.md`; the request also names `dist/providers/index.md` as the twin location, so that script additionally writes the same Markdown to `dist/providers/index.md` for the Providers page only. No Pages Functions change. Existing Get started text stays; no emoji; `npm run build` keeps passing.

Files: `src/pages/get-started.astro` (new h3 with id `qwencloud` after the paragraph ending `check local login status with kogen provider list.`, before the h2 `3. Set up your repository`); new `src/pages/providers.astro`; new `src/data/providers.json`; new `src/data/cli-provider-names.txt` (one name per line: chatgpt, supergrok, opencode-go, anthropic, claude-code, openai-compatible; messages-compatible is omitted); new `scripts/check-providers.mjs`; `package.json` build script runs `node scripts/check-providers.mjs` first (so a failing check fails the build); `scripts/build-agent-content.py` adds a `- [Providers](https://kogen.dev/providers/)` line to the llms.txt Public site resources list (llms.txt is produced by that script; no public/llms.txt exists) and writes `dist/providers/index.md`; `src/pages/sitemap.xml.ts` adds `/providers/`.

QwenCloud subsection content: the label `experimental: Build verified with Claude Review; Shape and Review not qualified`; `kogen provider login openai-compatible` with base URL on line 1 and key on line 2; the build role line `build: {provider: openai-compatible, base_url: https://token-plan.maas.qwencloudapi.com/compatible-mode/v1, model: qwen4-max, effort: high}` for `.kogen/models.yaml` (escape the braces in Astro); the Singapore pay-as-you-go base URL https://ap-southeast-1.maas.qwencloudapi.com/compatible-mode/v1; the note that QwenCloud's Token Plan terms restrict automation and non-interactive batch use, so pay-as-you-go suits unattended loops; and a link with href exactly `https://kogen.dev/providers/`.

`src/data/providers.json` shape: `{"providers":[{"name","account","kind" ("built in" or "custom endpoint"),"instructions":{"label","href"},"roles":{"shape":{"verified":bool,"record":string},"build":{...},"review":{...}}}]}`, in CLI-name order. Provider facts are copied from docs/providers.md of KogenAI/kogen: chatgpt has all three roles verified with record `spec/reference/model-family-qualification.md`; anthropic has only review verified with that record; supergrok, opencode-go, claude-code and openai-compatible have no verified role (empty records). openai-compatible has kind `custom endpoint` and instructions href `/get-started/#qwencloud`; the other providers link `/get-started/`.

`/providers/` page: one table in `<main>` with header cells `Provider`, `Account or key needed`, `Roles verified`, `Built in or custom`, `Instructions`, and one body row per provider in data order. The roles cell reads `Shape: <state>; Build: <state>; Review: <state>` where state is `verified` only when the role's record is non-empty after trimming and `not qualified` otherwise. The instructions cell holds an anchor with the data href.

`scripts/check-providers.mjs [providers.json] [cli-provider-names.txt]` (defaults: the two files under src/data) exits 1 and prints a line per problem when a CLI name has no provider, a provider is not a CLI name, a role is missing, or a role has verified true with an empty record; otherwise exits 0.

## Decisions
- Get started links to Providers with the absolute href https://kogen.dev/providers/, so one link satisfies both the Get started and llms.txt requirements. (decision: D1, round 1) (evidence: src/pages/get-started.astro; scripts/build-agent-content.py) (source: request)
- llms.txt is produced by scripts/build-agent-content.py, so the Providers link is added there and no public/llms.txt is added. (decision: D2, round 1) (evidence: scripts/build-agent-content.py; agent-site.json) (source: request)
- The roles verified cell shows a role as verified only when its record is non-empty; the verified flag alone never shows it. (decision: D3, round 1) (source: request)
- Provider facts and the CLI name list come from docs/providers.md, which is not in this checkout; the values above are as read from a local copy of that file and messages-compatible is omitted because that copy does not list it. (decision: D4, round 1) (assumption: the user confirms the provider rows, account texts and qualification records match the current docs/providers.md) (source: request)
- The check script is chained before astro build in the npm build script so a missing name fails the build. (decision: D5, round 1) (evidence: package.json) (source: request)
- Acceptance runs npm run build once after deleting dist/ and inspects dist/. (decision: D6, round 1) (evidence: package.json; .gitignore; features/steps/learn-course__site.js) (source: request)
- The Markdown twin exists at dist/providers/index.md as the request states, in addition to the generator's dist/providers.md. (decision: D7, round 1) (evidence: scripts/build-agent-content.py) (source: request)

## Source comparison
- QwenCloud subsection, label, base URLs, Token Plan note, link: addressed by the Get started scenarios.
- Providers table, one row per CLI name, verified only with a record: addressed by the row, name-list and check scenarios.
- Links from Get started and llms.txt, Markdown twin dist/providers/index.md, sitemap: addressed by the link and sitemap scenarios.
- Superseded: nothing is removed.

## Tests
- Get started names QwenCloud with setup, label, URLs, note and link: the QwenCloud scenarios (scenario)
- The Providers page has a row per provider in the data: the table scenario (scenario)
- The data names equal the CLI names and a missing name is rejected: the name scenarios (scenario)
- A verified role with an empty record is rejected and the real data passes: the verified-role scenarios (scenario)
- llms.txt and Get started link to Providers, the Markdown twin exists, the sitemap lists it: the link scenarios (scenario)

## Feasibility
- none
