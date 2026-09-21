---
title: Replacing Codex without replacing Kogen
summary: I want to try other coding agents without handing them Kogen's checks, review, history, and definition of finished.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-21
---

Kogen currently uses Codex to write code during a Build. I want to try Pi and
OpenCode too, but swapping the coding agent should not mean rebuilding Kogen
around whichever one I choose.

That gets difficult if the coding agent also keeps the only record of the work,
decides which checks count, reviews its own changes and tells Kogen when the job
is finished. A different agent will expose different commands, events and ways
of continuing a task. Kogen would have to learn a new software-building process
for every integration.

I want Kogen to give the agent one approved change to implement, then keep the
rest of the process under its own control. Kogen records the work, runs the
final checks, sends a failure back to the same attempt, asks a separate agent to
review the result and keeps the evidence afterward. The coding agent can still
use all of its own tools while it works. It just doesn't get to define when the
Build is done.

I am going to test Pi and OpenCode on the same small repository and the same
task. The first version will fail a check on purpose. Kogen should be able to
reject that version, return the failure to the agent and continue the work
without losing what happened before it.

That test will not tell me which coding agent is best. It will show whether I
can replace Codex without also replacing Kogen's checks, review and history.
Neither agent has been selected, and I am not building an adapter yet.
