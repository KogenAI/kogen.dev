---
title: How to turn off Codex terminal animations
summary: The setting for a calmer Codex terminal—and what a small startup comparison showed.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-11
---
Codex's terminal interface enables animations by default. To disable the welcome
animation, shimmer effects, and animated spinners, add this to
`~/.codex/config.toml`:

```toml
[tui]
animations = false
```

Then start a new Codex terminal session normally:

```sh
codex
```

You can also try the setting without changing your configuration:

```sh
codex -c 'tui.animations=false'
```

That command overrides the same setting in your global configuration for that
run. Codex has a separate `tui.whimsy` setting for decorative effects such as
the Astra composer stars. If you have disabled both settings globally and want
to compare the complete default visual treatment, override both:

```sh
codex -c 'tui.animations=true' -c 'tui.whimsy=true'
```

## The difference

With terminal animations enabled:

![Codex terminal opening with animations](/notes/codex-terminal-animations-enabled.gif)

With terminal animations disabled:

![Codex terminal after opening without animations](/notes/codex-terminal-animations-disabled.png)

## Does it start faster?

I initially thought disabling the animations also made Codex start faster. In a
small warmed-up comparison, the median startup times were effectively identical:
561.3 milliseconds with animations and 561.2 milliseconds without them.

The setting makes Codex feel calmer and more immediate. In this small test, it
did not make startup meaningfully faster.

[OpenAI's Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
and [advanced configuration guide](https://learn.chatgpt.com/docs/config-file/config-advanced)
