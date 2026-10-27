---
title: How much spec does an agent need?
summary: What our benchmarks taught us about giving coding agents a useful target and checking what they build.
author: Almir Sarajčić
status: published
publishedAt: 2026-10-27T17:02:13Z
---
While preparing [Kogen's Go rewrite](/announcements/2026-10-27/kogen-is-now-written-in-go/), I was benchmarking how well coding agents could build the software in different languages. I wanted to choose a stack, but I also needed to know what to give an agent so it could build what I meant without me correcting it all day.

That became part of [Kogen Bench](https://bench.kogen.dev). We tested language choices, different kinds of specifications, and how much explanation an agent needed. The specifications mattered enough that we kept experimenting with them after choosing the language.

## From language choice to specifications

The early elimination round had put Elixir well behind the other languages. Later, with fuller specifications and complete implementations, the language scores became much closer. In [Race 4](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race4), Rust, Elixir, TypeScript, Go and Gleam averaged between 62.5 and 65.5 passing tests out of 88, over four runs each. Every run failed the same 20 cases.

That's the plateau we reached: the implementations were getting similar scores and hitting shared failures. The suite had limitations too, so this wasn't proof that the languages were interchangeable. For choosing Kogen's stack, though, a few tests between languages were becoming less useful than understanding what the agents were missing.

## What happened when we added models and scenarios?

We [compared four specification bundles](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race6) in both Elixir and Go. The baseline supplied prose, schemas and design documents. Other versions added Quint models and checks, Gherkin scenarios and supporting code, or a combined bundle.

These are median passing tests out of 106, from two runs per condition:

<table class="spec-results">
  <thead><tr><th scope="col">Spec bundle</th><th scope="col">Elixir</th><th scope="col">Go</th></tr></thead>
  <tbody>
    <tr><th scope="row">Prose baseline</th><td>23</td><td>24</td></tr>
    <tr><th scope="row">With Quint</th><td>32.5</td><td>34.5</td></tr>
    <tr><th scope="row">With Gherkin</th><td>35</td><td>32</td></tr>
    <tr><th scope="row">Combined + extra material</th><td>40</td><td>40</td></tr>
  </tbody>
</table>

Every supplemented version scored above the baseline in both languages. The combined bundle reached 40 in each, compared with 23 and 24 for the baseline. That gave us a reason to keep developing specifications the agent could examine and execute alongside the prose.

This was a small pilot with different harness versions on the two machines, and the bundles differed in supporting information as well as format. The combined version also included earlier coverage and results. We use it as a promising direction to investigate, rather than a measurement of how much Quint or Gherkin alone improves an agent.

We also [compared Lean and Quint](https://github.com/KogenAI/kogen-bench/tree/main/rounds/fv-pilot-2026-10-10) as feedback for agents repairing code. Both repaired all twelve trials; Lean used less time and fewer tokens. That leaves Lean worth investigating further. We currently use Quint for stateful specifications, and want to compare the effort and results across writing, implementing and changing a spec too.

## Then we tried shortening the prose

Our benchmark specifications had hundreds of words of prose alongside detailed scenarios. We wanted to know whether the prose needed to repeat all those rules.

In [intent-short-1](https://github.com/KogenAI/kogen-bench/tree/main/rounds/intent-short-1), we compared a prose body of more than 300 words with one of 19–23 words. Both kept the same detailed Gherkin scenarios, step bindings and required specification structure. We tested four task variants in Go and Elixir, twice for each version.

Both got eight correct results out of eight. The short-prose runs used 19% less total input. The detail was still there: the scenarios had another 32–35 cases per specification to cover the rules. For those tasks, we could keep the explanation short because the examples carried the detail.

Another [prose-and-Gherkin comparison](https://github.com/KogenAI/kogen-bench/tree/main/rounds/prose-vs-gherkin-1) caught an omission that's easy to make. A log entry needed its fields written in a particular order: `id`, `type`, `job`, then `ts`. The prose didn't state that order; a scenario showed the expected output. Two implementations given the prose failed that check. We'd left the agent to guess a requirement we hadn't written down. A concrete example made the missing detail visible.

## How Kogen uses this

During shaping, Kogen turns a request into a specification it calls an Intent. Short prose explains the purpose and decisions. Gherkin scenarios describe observable behavior. Quint models cover stateful rules and interactions where a model is useful.

For a job queue, for example, a scenario can describe cancelling a job and check that it doesn't run afterward. A Quint model can explore sequences of events such as cancellation, retries and worker restarts, checking rules that must hold throughout. That helps us find contradictions and missing cases before building the feature.

The same artifacts also feed verification. Kogen runs the Gherkin scenarios against the implementation using Cucumber, with step definitions that exercise the actual application. It checks the Quint model's rules and runs the project's tests and other checks. Failures go back to the builder for rework, followed by independent review. The model checks the specified rules; the executable scenarios check what the software does.

That's what we're trying to get from shaping: a clear target for the agent, with checks that can tell it where the implementation falls short. The experiments have helped us decide what belongs in prose, what needs an example, and when to model the interactions.

We're constantly improving this setup. We'll keep benchmarking and hill-climbing specifications, shaping, verification and review, and publishing what we learn through Kogen Bench.
