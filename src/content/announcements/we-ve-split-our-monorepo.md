---
title: "We’ve split our monorepo"
summary: "After splitting out Kogen Loop, we moved the rest of Kogen’s delivery code into separate repos so we could test a change to one component before running the whole Build."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-11-03"
---
Recently, we extracted [Kogen Loop](https://github.com/KogenAI/kogen-loop) into its own repo. We wanted to use the rest of our harness around Claude Code (because of Anthropic's subscription terms) as well as our own loop. We also thought Loop would be quicker to build and easier to improve on its own. We already had work to do on the loop itself. For instance, if I changed what we sent back to a model after it used a tool, I wanted to be able to try that in Loop without having to ship a Kogen CLI first.

That made working on Loop quicker, which got me thinking about the rest of Kogen. Why should I have to build the whole thing and run it end to end just to find out if I made the reviewer a little better?

## I've usually preferred one app

In Rails, I was used to working on monoliths. I took that preference with me to Elixir, where I've never worked on an umbrella app willingly. I've worked on a few for clients, and I'd try to nudge them towards defining proper boundaries between domains (see [Boundary](https://boundary.hexdocs.pm/Boundary.html)). Some of my Elixir versions of Kogen used Boundary too.

But I'm barely looking at the code now, and I don't have to coordinate changes across repos myself. What I had my agents do was define the inputs and outputs each repo promises its callers (functional programming, anyone?). For the reviewer, for instance, we give it the Intent and the code that passed verification. I should be able to swap the reviewer and send it the same code. Kogen needs a verdict it understands and the findings that go with it. How the reviewer gets there is the thing I want to play with.

## What moved

We froze a revision of Kogen and took the code and tests for [Coordinator](https://github.com/KogenAI/kogen-coordinator), [Shaping](https://github.com/KogenAI/kogen-shaping), [Build](https://github.com/KogenAI/kogen-build), [Verification](https://github.com/KogenAI/kogen-verification) and [Executor](https://github.com/KogenAI/kogen-executor) with us. We pinned those versions in Kogen and ran the checks against the assembled program. I wanted to find out whether we could move the code before we started trying to make it better. [Review](https://github.com/KogenAI/kogen-review) and [Setup](https://github.com/KogenAI/kogen-setup) moved later.

For a release, [Kogen](https://github.com/KogenAI/kogen) pins the versions we test together and ship in the CLI.

<div style="display:grid;gap:6px;padding:12px;border:1px solid #d7dce0;border-radius:14px;background:#f7f8f9;margin:.85em 0 1.9em">
<a href="https://github.com/KogenAI/kogen" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen</span><span style="flex:1 1 14rem;font-size:.9em">CLI, component pins and release</span></a>
<a href="https://github.com/KogenAI/kogen-setup" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-setup</span><span style="flex:1 1 14rem;font-size:.9em">Configures an existing project</span></a>
<a href="https://github.com/KogenAI/kogen-shaping" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-shaping</span><span style="flex:1 1 14rem;font-size:.9em">Helps the Shaper write the Intent</span></a>
<a href="https://github.com/KogenAI/kogen-coordinator" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-coordinator</span><span style="flex:1 1 14rem;font-size:.9em">Manages project and Intent state, routes the Build and commits the result</span></a>
<a href="https://github.com/KogenAI/kogen-build" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-build</span><span style="flex:1 1 14rem;font-size:.9em">Implements the approved Intent</span></a>
<a href="https://github.com/KogenAI/kogen-verification" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-verification</span><span style="flex:1 1 14rem;font-size:.9em">Runs checks and scenarios</span></a>
<a href="https://github.com/KogenAI/kogen-review" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-review</span><span style="flex:1 1 14rem;font-size:.9em">Reviews and repairs independently</span></a>
<a href="https://github.com/KogenAI/kogen-executor" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-executor</span><span style="flex:1 1 14rem;font-size:.9em">Connects phases to execution backends</span></a>
<a href="https://github.com/KogenAI/kogen-loop" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 16px;padding:8px 12px;border:1px solid #d7dce0;border-radius:7px;background:#fff;text-decoration:none;color:inherit"><span style="flex:0 1 11.5rem;font:600 .9em ui-monospace,monospace;color:inherit;text-decoration:none">kogen-loop</span><span style="flex:1 1 14rem;font-size:.9em">Runs the model and tool loop</span></a>
</div>

## What got harder

There was a nice thing about having all of this in one repo. If you removed a tool, you could change the code that called it in the same commit. We (well, the agents) got a reminder of that when we removed `shape_batch` from Shaping. The checks didn't seem to mind. The Go compiler, on the other hand, found a Kogen test still asking for `shape.ShapeBatchTool` when we tried to put the two together. In one repo we would have changed that test in the same commit. Now I want Kogen to have its own check for the bits it uses from Shaping. If that check breaks with the new Shaping, the agents have a caller to fix before we put the two versions in a release.

## What I want to measure

When I'm shaping a feature, I have to decide how it should work and what would convince me it works. I put that in the Intent with Kogen. Once I've approved it, the builder gets the same scenarios we'll use to check its work.

<figure style="margin:1.75em auto;text-align:center"><img src="/announcements/we-ve-split-our-monorepo/repository-flow.svg" alt="The path of one change through Kogen. The human Shaper shapes the feature with Kogen and approves the resulting Intent. The coordinator then routes implementation, verification, independent review and commit." width="560" height="465" style="display:block;max-width:100%;height:auto;margin:0 auto"><figcaption style="max-width:560px;margin:.6em auto 0;font-size:.875em;line-height:1.45">From shaping the Intent to committing the change.</figcaption></figure>

A lot of my work now revolves around preparing properties and measurements for different components so I can then let agents hill-climb and improve. If I'm trying to improve Build itself, I keep the Intent and the checks the same. A Build either passes or it doesn't. I can compare times for the ones that pass, and go through the logs when I need to figure out why one failed. For example, I could change what we send back after a failed check and see if the builder gets to a passing result sooner. I'd use the same starting code and the same model for both runs.

For Shaping, I can give two versions the same project, request and answers, then read the Intents. Did either one catch the failure case I cared about? If I want to see what that does to the code, I can run both Intents through the same builder. I can keep what worked and use that as the starting point for whatever I try next.

Anyway, I'll write about our experiments on another occasion. Builds are faster, and I can try a small component change without waiting for the full end-to-end tests and review.

I'm still figuring out where to put which tests exactly. I shouldn't realize a change in the Shaping prompt ruined the Build only when everything gets assembled, but also I shouldn't have to run the whole test suite with requests to AI providers (on both Claude Code and Kogen Loop). I want to know which checks I can run while I'm still changing the prompt and which ones need the full run. If I have to wait for a release to find out I've made Shaping worse, this was a lot of repos to end up in the same place.
