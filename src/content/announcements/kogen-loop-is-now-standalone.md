---
title: "Kogen Loop is now standalone"
summary: "Kogen's model/tool engine is available as a standalone Go library and CLI. Why we separated it, what it does, and how to use it."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-10-31"
---
We extracted Kogen's model/tool engine into [Kogen Loop](https://github.com/KogenAI/kogen-loop), a standalone Go library and command-line tool you can use in your own harness.

We wanted to use Claude Code with our Claude subscription while keeping our own agent for Claude via an API key, ChatGPT through a subscription or API key, SuperGrok and OpenCode Go. Separating the engine from the software-delivery workflow lets us choose how a stage runs, and leaves our own loop available independently.

If you're [building a harness around your own task](/notes/2026-10-31/build-your-own-harness/), you can use Loop without adopting Kogen's shaping, approval, review or commit process.

## What you get

Kogen Loop sends a request to the model, executes tool calls, returns their results, and repeats. It ends when the model answers without another call or invokes a terminal tool.

You can call it as a Go library or run it as a separate process using its JSON task and JSONL event protocol. It includes provider communication, tools, usage reporting, cancellation and transcript resume. It uses Go's standard library, with no third-party module dependencies, and is available under Apache 2.0.

Your application decides whether the result is complete. A terminal call is the model's claim that it's finished. You still need [checks for your task](/notes/2026-09-17/the-agent-said-it-ran-the-checks/). In Kogen, the surrounding delivery system owns the Intent, approval, verification, independent review and commit.

## Why keep our own loop?

I don't want the way we build software to depend on one provider's harness. I also want to be able to change and measure the context, tools and feedback around a model for our particular workload.

The [current comparisons with Codex CLI](https://github.com/KogenAI/kogen-bench/tree/main/reproduce/h2h30-sub-route-tokens) give us a reason to keep working on it. On 24 Go tasks, with the same Terra model at matched medium and high effort, both passed every task. Loop used about 40% of Codex's token-equivalents per passed task.

A [separate same-key API comparison](https://github.com/KogenAI/kogen-bench/tree/main/reproduce/replayconf-14task-high) found lower cost at high effort on 14 fresh Go tasks, with both passing every task. The companion Note explains those results and why we're optimizing for a narrower workflow.

## Try it

The source is public. Build it using the Go version specified in the repository:

```sh
git clone https://github.com/KogenAI/kogen-loop.git
cd kogen-loop
go build -o bin/kogen-loop ./cmd/kogen-loop
bin/kogen-loop capabilities --json
```

The capabilities command works without credentials. The [caller contract](https://github.com/KogenAI/kogen-loop/blob/main/docs/contract/loop-v1.md) describes the library interface, process protocol, tasks, events and cancellation.

We'll be doing much more hill-climbing on both Kogen Loop and Kogen, so you can expect better results in the future.
