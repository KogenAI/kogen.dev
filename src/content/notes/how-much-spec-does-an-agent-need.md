---
title: How much spec does an agent need?
summary: What our benchmarks taught us about giving coding agents a useful target and checking what they build.
author: Almir Sarajčić
status: published
publishedAt: 2026-10-27T17:02:13Z
---
I started out [choosing a language for Kogen](/announcements/2026-10-27/kogen-is-now-written-in-go/). I wanted to see what agents could implement and how much of their work I’d have to correct. It seemed like I’d end up with a table and pick a language. The runs went into [Kogen Bench](https://bench.kogen.dev). I did pick Go eventually, but somewhere along the way I started paying more attention to what we were giving the agents.

Elixir had done badly in the early elimination round. Once we had fuller specs and complete implementations, it was doing about as well as the others. In [Race 4](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race4), we ran Rust, Elixir, TypeScript, Go and Gleam four times each. The average for each was somewhere between 62.5 and 65.5 passing tests out of 88. And there were twenty cases they all got wrong. What had we left them to figure out?

## Adding examples and models

We [compared four specification bundles](https://github.com/KogenAI/kogen-bench/tree/main/rounds/race6) using Elixir and Go, with two runs for each condition. The baseline contained prose, schemas and design documents. For the second bundle, we added Quint models and checks; for the third, Gherkin scenarios and their supporting code. The fourth included both additions, along with earlier coverage and results.

Here's how many tests passed, using the median of the two runs out of a possible 106:

<table class="spec-results">
  <thead><tr><th scope="col">Spec bundle</th><th scope="col">Elixir</th><th scope="col">Go</th></tr></thead>
  <tbody>
    <tr><th scope="row">Prose baseline</th><td>23</td><td>24</td></tr>
    <tr><th scope="row">With Quint</th><td>32.5</td><td>34.5</td></tr>
    <tr><th scope="row">With Gherkin</th><td>35</td><td>32</td></tr>
    <tr><th scope="row">Combined + extra material</th><td>40</td><td>40</td></tr>
  </tbody>
</table>

Both languages reached 40 with the combined bundle, compared with 23 and 24 for the baseline. We also gave those agents the earlier coverage and results, though, and the machines ran different versions of the harness. To measure the contribution of Quint or Gherkin individually, we'd need to keep those other things the same. For my next Kogen build, I wanted to keep the examples and the checks the agents could run.

We also tried [Lean and Quint as feedback for agents repairing code](https://github.com/KogenAI/kogen-bench/tree/main/rounds/fv-pilot-2026-10-10). Both repaired all twelve trials, with Lean taking less time and using fewer tokens. Kogen currently uses Quint for stateful specifications. Before replacing it, I want to try authoring and updating specifications with Lean, since we'd need to do that as well as use it to repair implementations.

## Removing prose

Having detailed scenarios meant we were describing some behavior twice: once in the examples and again in hundreds of words of prose. In [intent-short-1](https://github.com/KogenAI/kogen-bench/tree/main/rounds/intent-short-1), we kept the Gherkin scenarios, step bindings and required specification structure, but reduced a prose body of more than 300 words to 19–23 words. We tested four task variants in Go and Elixir, twice for each version.

Both versions produced eight correct results out of eight. The short version used 19% less total input, although each specification still contained 32–35 scenarios. We could remove most of the prose because those detailed examples were still there for the agent to work from.

We had two failures in a [separate prose and Gherkin comparison](https://github.com/KogenAI/kogen-bench/tree/main/rounds/prose-vs-gherkin-1) where we’d left something out. The check wanted a log entry with `id`, `type`, `job`, then `ts`, in that order. That order was in the scenario. We never said it in the prose. I would have had to pick an order too.

## Using this in Kogen

When I’m shaping a feature, the part I want to read is why I’m doing it and what I’ve already decided. I put that in the Intent. If I care what order the fields are in, I want an example where I can see that order and where the builder can actually run the check. That goes in Gherkin.

Say I cancel a job. Easy enough to write a scenario where I cancel it and check it never runs. What if it’s between a retry and a worker restart when I cancel it? I can try that sequence in Quint while I’m still deciding what should happen.

Once there’s an implementation I want to run the examples against it. Cucumber gets to the app through the step definitions. Kogen also runs the Quint checks and whatever checks the project already has. If a scenario fails, that’s what I want the builder to see next. There’s a separate review before I take the result.

If I’m taking a paragraph out, I want to be able to point to the scenario that still tells the builder what happens when I cancel a job, or which field goes where. We could do that in the shorter spec. That’s why we could take so much prose out.
