---
title: Make no mistakes
summary: Preventable mistakes enter an agent-led Build through ambiguity. Make the decisions explicit enough to inspect and check.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-19T20:25:23Z
---
You cannot tell a coding agent to make no mistakes and expect the sentence to
do any work. The useful question is more demanding: what would count as a
mistake in this change, and how will the Build find it before the change is
accepted?

Ambiguity is where preventable mistakes enter. “Keep the existing behavior”
does not say which behavior. “Don’t touch anything else” does not say where the
boundary is. “Run the tests” does not say which evidence can establish the
claim. An agent can make a reasonable interpretation, produce a plausible
result, and still break something the person who asked for the work meant to
preserve.

Kogen turns those implied decisions into a written Intent. It says what changes,
what must stay the same, where the work belongs, and how the finished result
will be checked. That gives Kogen a real job to carry out instead of a vague
request to interpret.

Decide how you will know the feature works before the agent starts changing
code. Otherwise the agent is left to choose its own definition of done after
the fact. A shaped Intent gives it the standard up front: build this feature,
preserve these things, and show that the result works.

“Make no mistakes” is the outcome that shaping is trying to earn. The human
makes the product and UX decisions; Kogen takes the agreed Intent through
implementation, checks, review, and the resulting Commit. The more clearly the
work is shaped, the less room there is for an agent to make a plausible change
that is simply the wrong one.

[Read the verification-plan Intent](https://github.com/KogenAI/kogen/tree/7c7c3426c61c80753043d51766f53ba877c22674/.kogen/intents/complete/rehearsed-verification-plan)
