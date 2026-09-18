---
title: Making the offline check fast enough to keep running
summary: A slow verification step gets deferred or skipped. Here's how Kogen kept its check fast without cutting what it verifies.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-18
---
A slow check is a check people stop running. If it takes minutes to find out
whether a change actually works, you run it less often, batch up more changes
before you look, and find problems later, when they're harder to trace back to
their cause. Making the check fast enough that running it constantly stops
feeling like a cost avoids that tradeoff entirely.

Kogen runs an offline check during every Build — its term for one agent
implementing and verifying a single approved unit of work. The check verifies
formatting, compiles it with warnings treated as errors, runs static analysis,
and exercises the test suite, all without touching the network. I wanted the
whole check to be quick enough that running it repeatedly felt ordinary. For a
while, part of the suite was getting in the way of that.

The difficulty was shared process state. Some tests change the working
directory or environment while exercising Kogen's own Shape and Build flows.
Kogen's suite runs on Elixir's ExUnit, which makes running test modules
concurrently straightforward to reach for. But changing the working directory
reaches further than the module making the change: it's global to the whole
program, so two tests changing it at the same time can race — and environment
variables carry the same broad reach. Those tests needed isolation before
they could safely join that concurrency, and giving it to them was what made
the suite fast without making it less reliable.

The tests still exercise the full Build lifecycle, including a failed check,
a correction and an independent review — the speed gain came from isolating
the unsafe state, not from dropping coverage.

One recorded run of the complete offline check passed 116 tests, with 4
excluded, in 10.546 seconds. That's a single measurement on one machine at one
point in the suite's size, not a benchmark to hold every checkout to. The
suite has grown since, and a larger run naturally takes longer; that's an
expected consequence of more tests existing, not a regression in the technique
described here.

If you're maintaining a test suite that's slow enough that people and agents
quietly skip it, look for the tests that are slow because they're unsafe to
run concurrently, not because the work itself is expensive. Isolating the
unsafe part is often cheaper than it looks, and it's usually worth doing
before you reach for a smaller, faster-but-weaker subset of checks.

[See the accepted Intent and evidence](https://github.com/KogenAI/kogen/tree/cf1fe217/.kogen/intents/complete/fast-reliable-offline-checks)
