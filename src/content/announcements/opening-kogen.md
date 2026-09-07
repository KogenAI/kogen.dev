---
title: Opening Kogen
summary: Opening the source, starting with a small core, and building from here.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-07
---
Today I’m opening Kogen’s source. It’s still early, but I want to make the work available as it develops: the implementation, the decisions behind it, and the history that brought it here.

**Shape the feature. Leave the build to Kogen.**

Make the product and UX decisions that define the feature. Specify technical decisions when they matter. Kogen handles the implementation, checking, independent review, rework, and resulting commit.

That idea grew through work on Optimum Codegen. Over time, the system became rigid. Checks drifted from the rules they were meant to enforce, and builds began to fail. A rewrite tried to restore the balance, but carried too much forward before proving the smallest complete loop. Jumpstart brought the work back to a small core.

The core now uses Codex CLI inside Kogen’s own repository. You shape a feature with Kogen, approve its Intent, and start the Build. Kogen implements it, runs checks, obtains an independent review, and reworks it when necessary. A successful Build ends in a commit; a stopped Build keeps its work available for inspection.

The next step is to use that core to build the rest of Kogen, one shaped feature at a time. It isn’t ready for general use, and the larger design will change as I learn from building it.

This marks the day the ongoing work becomes public. You can [explore the source](https://github.com/KogenAI/kogen) or [read the origins](/origins/) for the longer story.
