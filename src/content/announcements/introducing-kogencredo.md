---
title: Introducing KogenCredo
summary: Credo checks for recurring generated-code mistakes, test quality and verification integrity.
author: Almir Sarajčić
status: published
publishedAt: 2026-10-28T18:12:15Z
---
I've spent two years working through AI-generated Elixir slop: code that looks finished, compiles and passes tests, but still needs careful review. A test may not check anything useful, a failure can be quietly turned into a default, or a query can load far more rows than it needs. After seeing the same mistakes repeatedly, I wanted more of them to be visible before review.

KogenCredo adds checks to [Credo](https://github.com/rrrene/credo) for patterns worth looking at in generated code and the tests around it. It is useful in any Elixir project; you don't need to use Kogen.

## Where it came from

This started with rules I wrote for agents working on Elixir, including the rules used with Optimum Codegen, Kogen's predecessor. They captured mistakes I'd seen and the guidance I kept repeating in review. But giving an LLM a rule doesn't mean it will follow it every time. The same problem could still make it into the code, and someone had to catch it again.

So I started investing more in cheap, deterministic checks for the patterns we can recognize in code. A check can run on every change and point to a suspicious pattern without relying on an agent remembering an instruction. KogenCredo carries that approach forward, alongside newer research into generated-code failures and verification.

It also brings over checks from OptimumCredo, including checks for skipped tests, empty setup blocks and developer-machine paths in runtime configuration.

I recently wrote about [moving Kogen itself to Go](/announcements/2026-10-27/kogen-is-now-written-in-go/). That decision was about what suited Kogen's smaller core. I haven't given up on Elixir. I still want agents to produce better Elixir, and KogenCredo is one way to help make the problems easier to see.

## What it looks for

KogenCredo 0.1.0 has 35 configurable Credo checks. They cover error handling, test quality, shared state, structure and query patterns. For example:

- `WeakAssertion` can flag a test whose assertions only check broad properties, such as `assert is_map(result)`. Checking the fields that matter can catch a wrong result that is still a map.
- `BroadRescue` can flag a rescue that catches every exception. That can turn a programming error into an ordinary return value and make the cause harder to see.
- `RepoAllThenTrim` can flag a `Repo.all` result trimmed with functions such as `Enum.take`. That is a prompt to consider whether the database should do the limiting instead.

These are leads for review, not verdicts. A broad assertion may be appropriate for a particular test, and a detector cannot know every application's intent. Choose the checks and configuration that fit your code rather than treating every finding as a defect.

## Changes and verification

Ordinary Credo checks inspect source as it stands. KogenCredo also has seven advisory diff rules that compare changed functions with a base revision. They can highlight changes such as a query losing its limit, a new database call inside a loop, or an error branch returning a silent fallback. Run them with:

```sh
mix kogen.diff_check origin/main...HEAD
```

The diff rules are advisory by default. Review their findings and measure them against your own history before deciding whether any should fail a build. Dynamic query construction, macros and behavior outside the analyzed functions can escape the analysis; a clean report does not prove behavior is unchanged.

The library also includes helpers to scan for Credo suppression directives and compare a configuration with a golden policy. Credo can suppress its own checks, so its `NoCredoDisable` check alone is not a tamper-proof gate. If a coding agent can change the golden policy as well as the code, the comparison cannot establish an independent boundary; keep that policy outside the agent's control.

`mix kogen.unused_public` offers another advisory view: public functions with no observed compiled caller. Callbacks, external consumers, dynamic dispatch and macros can make a function look unused when it is needed. It requires compiled debug information, and its output needs review before removing anything.

## Getting started

Add KogenCredo to your dependencies:

```elixir
{:kogen_credo, "~> 0.1.0", only: [:dev, :test], runtime: false}
```

It requires Elixir 1.17 or newer and Credo 1.7.19 or newer in the 1.x series. Update a locked older Credo alongside it. Enable the checks you want in `.credo.exs`, for example:

```elixir
{KogenCredo.Check.Warning.SkippedTest, []},
{KogenCredo.Check.Warning.BroadRescue, []},
{KogenCredo.Check.Warning.RepoAllThenTrim, []}
```

Run `mix credo --strict` to include low-priority advice. Some checks need project-specific configuration to be useful; consult the check catalog and configuration examples before making them CI gates.

KogenCredo and OptimumCredo are independent libraries. OptimumCredo focuses on code-review conventions; KogenCredo focuses on generated-code failure patterns and verification integrity. You can use either or both, choosing deliberately where their checks overlap. If you use checks moving from OptimumCredo, follow the migration guide and verify the new module names are enabled: Credo can warn about an undefined check and still exit successfully.

Tests, review and static analysis each catch different things. KogenCredo gives you more specific questions to ask of the code; it doesn't replace the others.

[Read the KogenCredo documentation](https://kogen-credo.hexdocs.pm/0.1.0/) · [View the source](https://github.com/KogenAI/kogen_credo)
