---
title: "Kogen Loop is now standalone"
summary: "Kogen's model/tool engine is available as a standalone Go library and CLI. Why we separated it, what it does, and how to use it."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-10-31"
---
Recently, we extracted [Kogen Loop](https://github.com/KogenAI/kogen-loop) into its own repo. We did it to be able to use the rest of our harness around Claude Code (due to Anthropic's terms) besides our custom loop. We thought this would also make that part of the system faster to build and easier to improve.

The loop is now a Go library and a CLI you can use on its own. Our agent works with Claude through an API key, ChatGPT through a subscription or API key, SuperGrok and OpenCode Go. When we want Claude Code through a Claude subscription, we can run that instead and keep the rest of Kogen around it.

If you're [building a harness around your own task](/notes/2026-10-31/build-your-own-harness/), you can use Loop without adopting Kogen's shaping, approval, review or commit process.

## What you get

What we pulled out is the code that talks to the model and runs its tools. The model comes back with a call, we run it, it gets the result, and we ask again. And so on, until it gives an answer without another call, or calls a terminal tool. You give it the task and tools for whatever you're building.

It's written in Go, so you can just call the library if that's what you're using. We also have a process interface: JSON in for the task, JSONL events out. The provider communication and usage reporting come with it. You can cancel a run or resume its transcript. All of this uses the standard library. The source is Apache 2.0.

That last call still needs checking. In Kogen, I want to see whether the result passed the [checks for the task](/notes/2026-09-17/the-agent-said-it-ran-the-checks/) before accepting it. The Intent, approval, verification, independent review and commit all stay in Kogen. Loop can just do the bit between giving the model its task and getting a result back.

## Try it

The source is public. Build it using the Go version specified in the repository:

```sh
git clone https://github.com/KogenAI/kogen-loop.git
cd kogen-loop
go build -o bin/kogen-loop ./cmd/kogen-loop
bin/kogen-loop capabilities --json
```

The capabilities command works without credentials. The [caller contract](https://github.com/KogenAI/kogen-loop/blob/main/docs/contract/loop-v1.md) describes the library interface, process protocol, tasks, events and cancellation.

I've written about [what we've tried changing in the harness](/notes/2026-10-31/build-your-own-harness/), including the batching tool we left out because the comparison didn’t show a reliable cost reduction.


## Why keep our own loop?

A lot of my work now revolves around preparing properties and measurements for different components so I can then let agents hill-climb and improve. With the loop on its own, we can give it a set of tasks and checks and compare it with Codex CLI. It either passes a task or it doesn't, and we can see how much it cost to get there.

The [current comparisons with Codex CLI](https://github.com/KogenAI/kogen-bench/tree/main/reproduce/h2h30-sub-route-tokens) give us a reason to keep working on it. On 24 Go tasks, with the same Terra model at matched medium and high effort, both passed every task. Loop used about 40% of Codex's token-equivalents per passed task.

A [separate same-key API comparison](https://github.com/KogenAI/kogen-bench/tree/main/reproduce/replayconf-14task-high) found lower cost at high effort on 14 fresh Go tasks, with both passing every task. The companion Note explains those results and why we're optimizing for a narrower workflow.
