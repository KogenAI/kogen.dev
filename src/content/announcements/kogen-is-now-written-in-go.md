---
title: Kogen is now written in Go
summary: The benchmarks, changes of direction and specification work behind Kogen's Go rewrite.
author: Almir Sarajčić
status: published
publishedAt: 2026-10-27T17:02:13Z
updatedAt: 2026-10-27T17:20:00Z
---
I'm coming from the Rails world. I adopted the same mentality while working on Elixir, and it's the language I've been working with for years. Concurrent work, supervision, recovery when something crashes - Elixir seemed like the perfect fit for Kogen.

But now I'm not looking at all the code. Agents are writing it. I had an Elixir engine with some CLI parts written in Go, but I realized I wanted to move some of the orchestration stuff outside, in a paid product. So why write the core in Elixir, when agents don't write it that well and I can write everything in Go? That was the question I ended up with after trying a few implementations.

Earlier rewrite designs paired an Elixir daemon with a thin Rust client for hooks in Claude Code and Codex. The idea was to keep Elixir running and let a small native program handle each hook call, without starting the BEAM every time the agent used a tool. Rust was there for fast startup and hook response.

## Elixir and coding agents

When I was looking into what to rewrite Kogen in, [DHH was benchmarking stacks](https://x.com/dhh/status/2106810687326486715) for his Campfire rewrite. I [wrote about it on ElixirDrops](https://elixirdrops.net/d/rNXGVxhW) and [shared it on Twitter](https://x.com/ultrathinktrash/status/2107097268352647469). I got plenty of pushback from other Elixir developers. One thing I’d missed was that the Rust implementation had already been through a few days of tuning, and the Elixir result was from a first commit. I wanted to compare the initial versions, then look at what each got after tuning.

I still had the question I started with. If I have to explain what the agent got wrong in Elixir while it writes better code in another stack, that affects what I want to build in. I like Elixir, but I’m not married to it.

I also wanted to help with the guidance they were missing. Agents didn't know which dependencies to choose or how to use the stack's strengths. That led to [elixir.menu](https://elixir.menu), a place to help them make those choices.

I was going to need a job queue, supervision, streamed model responses, safe Git updates, config parsing, event logs and a CLI. So I started giving agents those jobs in different languages. I gave them the same task, then ran hidden tests for correctness and edge cases. You can see the runs in [Kogen Bench](https://bench.kogen.dev).

In the [early elimination results I posted](https://x.com/ultrathinktrash/status/2108578154491347152), we ran GPT-6 Luna max with minimal guidance. Here is how often each language passed every hidden test:

<table class="spec-results">
  <thead><tr><th scope="col">Language</th><th scope="col">Complete passes</th></tr></thead>
  <tbody>
    <tr><th scope="row">Rust</th><td>15 of 18</td></tr>
    <tr><th scope="row">TypeScript</th><td>15 of 18</td></tr>
    <tr><th scope="row">Go</th><td>12 of 18</td></tr>
    <tr><th scope="row">Elixir</th><td>7 of 18</td></tr>
  </tbody>
</table>

There wasn't a clear winner, but Elixir was a clear loser in that round. These were small samples, using the affordable model I wanted to work with every day.

I kept testing stronger models and giving the agents more guidance to see how much that changed things.

## What the rewrites taught us

Once I had written down what the core had to do, I could have agents write the whole thing in Rust, Go or TypeScript and see whether they got the CLI, local state, providers and recovery right. It was still a new implementation each time, but we had the same conformance suite for all of them.

By [Race 4](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race4) we had fuller specifications and the results had bunched together. The five averages ran from 62.5 to 65.5 passing tests out of 88, Elixir was back near the top and all the runs failed the same twenty cases. We changed the specs between rounds and there were limitations in how we ran the tests. I could keep running comparisons and get a slightly different order, but first I wanted to know what was going on with those twenty.

In the end, it didn't really matter which language we were writing in when we wrote proper specs - at least for the things we were testing there. That was a huge finding for how I work on Kogen now, because I can try another implementation and still check the Git updates, event logs and recovery against the same contract. I have to figure out the dependencies and packaging for each language, but I don't have to explain the whole app again.

When I’m shaping something I want to read the purpose and the decisions in plain prose. For the behavior itself, give me a Gherkin example. The agent can run the Gherkin example with Cucumber against the app. If it gets the behavior wrong, it has that failure to work on. If I want to see what happens across a sequence of state changes, I try that in Quint. [How much spec does an agent need?](/notes/2026-10-27/how-much-spec-does-an-agent-need/)

## Coming back to Go

I opted for writing Kogen in Elixir with some CLI parts written in Go. But I realized I wanted to move some of the orchestration stuff outside, in a paid product. I still need Kogen to take a feature I've shaped and approved through a Build, checks, independent review and a commit. So why write the core in Elixir when agents don't write it that well and I can write everything in Go?

We already had a Go CLI, but that doesn't matter. Everything could be written from scratch. Rust had led some comparisons and the later results were close. For the build-and-check loop I care about fast compilation, the tooling and the standard library. Go has the HTTP, streamed responses, JSON, processes, files and tests I need. I was already spending time correcting agent-written Elixir. There wasn’t enough left in the core to make me keep two languages.

So I ended up with one Go program for the CLI and engine. There’s no Erlang and Elixir runtime to bundle and no protocol between the CLI and the other process. The repo history, fixes and project records are the same. Your projects still use their own languages and tools.

I wanted the code written the way you’d write Go, while passing the same acceptance scenarios. Those specs are what let me do that without having to explain the app all over again.

[The code and setup instructions are on GitHub](https://github.com/KogenAI/kogen).
