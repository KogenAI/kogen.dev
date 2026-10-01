---
title: Jev this, Jev that
summary: "The boring Jev uses I've found in Kogen: reading an agent's notes and checking requirements before coding."
author: Almir Sarajčić
status: published
publishedAt: 2026-10-01
---

Jev [came out a little over two weeks ago](https://typesafe.ai/blog/introducing-system-one-models-and-jev), and you've probably seen plenty of demos and interesting use cases by now. Now that the dust has settled a little, let's talk about some boring, concrete ones.

I've been struggling with token consumption in OpenAI's models, so I had another reason to look into it. There are plenty of small decisions in a coding workflow that involve reading text, but don't need a model to write a whole response. Those are the places I've been trying Jev.

In Kogen, my project for building software with coding agents, one of those jobs is reading the notes an agent leaves after working on a change. The agent describes what it finished, what remains, and any requirements it couldn't meet. Jev reads those notes against the agreed requirements and identifies what the agent is saying about each one. If the agent says a requirement cannot be met, that can pause the work so we can reconsider it before sending the agent through another round.

For this, I give Jev the text and a set of possible answers. It returns probabilities for those answers, which the surrounding code uses to decide what happens next. The useful question here is whether the agent says it has finished something. Checking whether it actually finished still belongs to the tests and the reviewer who inspects the code.

The other use comes before coding, while we're working out the requirements and how to check them. Jev helps look for requirements with no observable result, or proposed tests that wouldn't catch the mistake they're meant to catch. It also helps sort questions that need my product decision from technical questions, and checks whether a revision addresses a problem raised in an earlier review. These are specific questions about the text, and the answers help with the review of the specification.

I'd also like to use it to go through previous planning and coding sessions: why did the work stop, what went wrong, and which problems keep coming back? Sorting failures by likely cause and connecting a review finding to the requirement it concerns are two concrete uses I've considered. They're still plans, separate from the two integrations above.

One thing I tried that didn't work well was asking Jev whether a code change completed a task. It too often called work incomplete when that judgment was wrong. I wouldn't use it as a cheaper replacement for a reviewer. Reading the agent's notes and asking specific questions about a specification have been more useful, though those results still come from small trials.

Outside coding, I'm also experimenting with sorting mail and tasks from iCloud Mail, HEY, Todoist and Basecamp by project and next action.

It's nice how TypeSafe has found a place in my workflows alongside OpenAI and Anthropic. I can keep using those models for reasoning and building, and use Jev for some of the smaller decisions along the way.
