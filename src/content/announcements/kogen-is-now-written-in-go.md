---
title: Kogen is now written in Go
summary: The benchmarks, changes of direction and specification work behind Kogen's Go rewrite.
author: Almir Sarajčić
status: published
publishedAt: 2026-10-27T17:02:13Z
---
Elixir seemed like the perfect fit for Kogen. Concurrent work, supervision, recovery when something crashes: these were things I wanted, and things Elixir was good at. It's also the language I'd been working with for years.

But I was building Kogen with coding agents. How well they could write it mattered too. That sent me through benchmarks, implementations in several languages, a return to Elixir, and eventually a change in what Kogen itself should do.

## Elixir and coding agents

Around the time I was deciding what to rewrite Kogen in, [DHH was benchmarking stacks](https://x.com/dhh/status/2106810687326486715) for his Campfire rewrite. What stood out to me was how much guidance agents needed to write good Elixir. We could explain what they got wrong, but someone still had to know enough Elixir to correct them.

I [wrote about it on ElixirDrops](https://elixirdrops.net/d/rNXGVxhW) and [shared it on Twitter](https://x.com/ultrathinktrash/status/2107097268352647469), which got plenty of pushback from Elixir developers. I like Elixir, but I'm not married to it. If agents need an Elixir expert correcting them while producing better software in another stack, that matters when choosing what to build with.

I also wanted to help with the guidance they were missing. Agents didn't know which dependencies to choose or how to use the stack's strengths. That led to [elixir.menu](https://elixir.menu), a place to help them make those choices.

For Kogen, I wanted to test the work I actually needed agents to do. I started comparing implementations of job queues, process supervision, streamed model responses, safe Git updates, configuration parsing, event logs and CLI handling. Hidden tests checked correctness and edge cases. Those experiments became part of [Kogen Bench](https://bench.kogen.dev), where I share the work shaping Kogen.

In the [early elimination results I posted](https://x.com/ultrathinktrash/status/2108578154491347152), Rust and TypeScript passed every hidden test in 15 of 18 attempts each. Go passed 12 of 18. Elixir passed 7 of 18. This was GPT-6 Luna max, with minimal guidance and small samples. There wasn't a clear winner, but Elixir was a clear loser in that round.

That was relevant to how I worked. I wanted affordable runs that resembled everyday development, rather than a comparison that assumed an expert would keep correcting the agent. I also ran further experiments with stronger models and more guidance.

## What the rewrites taught us

We wrote a language-neutral specification for Kogen's core and a conformance suite, so each implementation had a defined target. I tried full versions in Rust, Go and TypeScript, carrying over the CLI, local state, provider handling and recovery behavior. At one point I picked Rust and started there, then kept exploring.

As the specifications became more complete, the later language races bunched together. In [Race 4](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race4), all five languages averaged between 62.5 and 65.5 passes out of 88. Elixir was near the top again. The runs were hitting many of the same failures: every run failed the same 20 cases. They had reached a similar plateau, rather than one language pulling far ahead. These were small, descriptive comparisons with suite and execution limitations; they didn't establish that the languages were equivalent or that better specs alone caused the change.

The bigger finding for Kogen was what happened once we had proper specifications. We could describe the behavior once, ask for an implementation in another language and check it against the same contract. The language still affected dependencies, packaging and the work agents needed help with, but we no longer had to rediscover what the program was supposed to do with every rewrite.

Those specifications combine short prose explaining the purpose and decisions, Gherkin scenarios describing concrete behavior, and Quint models for stateful rules that need one. The scenarios are connected to executable checks; the models let us examine transitions and invariants. I've written more about the experiments behind that combination in [How much spec does an agent need?](/notes/2026-10-27/how-much-spec-does-an-agent-need/).

## Coming back to Go

After those comparisons, I still came back to an Elixir engine with a Go CLI. Elixir made sense for the broader system I was planning, with more orchestration living inside Kogen.

Then I decided to move that broader orchestration and product work outside the core, into a separate paid product, which I'll announce soon. Kogen's job became more focused: shape a change, get an Intent approved, then take it through implementation, checks, independent review, rework and a commit.

That changed the language decision. I'd been spending time correcting agent-written Elixir. We already had a Go CLI, and agents could write the rest in Go too. With less orchestration in the core, I didn't have enough reason to keep two languages and the bridge between them.

The CLI and engine are now one Go program. Kogen no longer bundles Erlang and Elixir or needs the protocol between those two processes. The repository history, accumulated fixes and project records stay with it. Projects built with Kogen still use their own languages and tools.

The specification work stayed too. Kogen shapes the behavior and how to check it before implementation starts, then runs the executable scenarios, model checks and project checks against the work and gets an independent review. The same specification gives the agent a target to build toward and the verification process a way to find what's missing.

[The code and setup instructions are on GitHub](https://github.com/KogenAI/kogen).
