---
title: My Codex is not Kogen's Codex
summary: Kogen pins a tested Codex version and runs it with its own settings and login, separate from mine.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-16T17:16:00Z
---
I use ChatGPT and its Codex for my own work. Kogen also uses Codex to shape and build features.
Previously, Kogen picked up whichever Codex was installed and logged in on my
machine. If I updated my installation, Kogen's next Build could run a different
version without Kogen having been tested with it.

Each Kogen release pins a specific Codex version. `mix kogen.codex.install`
installs that version—the one tested with Kogen—in a Kogen-owned location. It
doesn't replace the Codex installation I use in my terminal or change my shell
setup. When a later Kogen release needs a newer version, work already running
keeps the version it started with.

The version isn't the whole setup. Kogen starts Codex with its own settings,
including the model and effort configured for each role. It doesn't pick up my
personal Codex config, plugins, or skills. Those are useful to me, but they
shouldn't silently change how Kogen runs.

The login is separate too. `mix kogen.codex.login` uses Codex's own login flow
but keeps the credentials in Kogen's scope instead of copying my personal
login. Kogen can share that login across its checkouts or use a separate one
for a particular project. `mix kogen.codex.status` shows which version and
login scope a checkout will use.

Before Shape or Build starts, Kogen checks that its pinned version is installed
and the selected login is configured. If either is missing, it tells me what
to set up. It doesn't quietly fall back to my personal Codex.

That lets me update Codex for my own use without changing Kogen's runtime.
Updating Kogen's version is a separate decision, made after testing that
version with Kogen.

[See the Kogen runtime contract](https://github.com/KogenAI/kogen/blob/8a6a08f6/.kogen/intents/complete/isolate-codex-sessions/INTENT.md)
